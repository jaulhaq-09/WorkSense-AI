from decimal import Decimal
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.intelligence.workload import WorkloadEngine
from app.models.entities import (
    Developer,
    DeveloperSkill,
    Task,
    TaskAssignment,
    TaskRequiredSkill,
    TaskDependency,
    Recommendation,
)

class RecommendationEngine:
    def __init__(self, db: Session):
        self.db = db
        self.workload_engine = WorkloadEngine(db)

    def generate_redistribution_recommendations(self, team_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Scans all overloaded developers and active tasks, matches against available, skilled candidates,
        and generates actionable task redistribution recommendations with projected utilization.
        """
        all_dev_workloads = self.workload_engine.calculate_team_workloads(team_id)
        workload_map = {d["developer_id"]: d for d in all_dev_workloads}

        # Filter overloaded or high workload developers (>80% utilization)
        overloaded_devs = [d for d in all_dev_workloads if d["workload_status"] in ("high", "overloaded")]
        
        # Eligible recipient candidates: developers that are balanced or underutilized and active
        candidates = [d for d in all_dev_workloads if d["workload_status"] in ("underutilized", "balanced")]

        recommendations_generated = []

        for overloaded in overloaded_devs:
            orig_dev_id = overloaded["developer_id"]
            orig_capacity = max(overloaded["available_hours"], 1.0)
            orig_current_effort = overloaded["weighted_remaining_effort"]

            # Inspect active tasks assigned to this developer
            for task_info in overloaded["tasks"]:
                task_id = task_info["task_id"]
                task = self.db.query(Task).filter(Task.id == task_id).first()
                if not task:
                    continue

                # Filter out completed or non-redistributable tasks
                if task.status.lower() in ("completed", "blocked"):
                    continue

                # Check if task already has a pending recommendation
                existing_rec = (
                    self.db.query(Recommendation)
                    .filter(
                        Recommendation.task_id == task_id,
                        Recommendation.status == "pending"
                    )
                    .first()
                )
                if existing_rec:
                    continue

                # Check task dependencies: are prerequisites completed?
                unresolved_deps = (
                    self.db.query(TaskDependency, Task)
                    .join(Task, TaskDependency.depends_on_task_id == Task.id)
                    .filter(TaskDependency.task_id == task_id, Task.status != "completed")
                    .all()
                )
                if unresolved_deps:
                    # Feasibility check: dependencies not yet cleared
                    continue

                task_weighted_effort = task_info["weighted_effort"]

                # Find required skills for this task
                required_skills = (
                    self.db.query(TaskRequiredSkill)
                    .filter(TaskRequiredSkill.task_id == task_id)
                    .all()
                )

                best_candidate = None
                best_score = -1.0
                best_match_meta = {}

                for cand in candidates:
                    cand_id = cand["developer_id"]
                    if cand_id == orig_dev_id:
                        continue

                    # Verify candidate has sufficient capacity to absorb task without becoming overloaded
                    cand_capacity = max(cand["available_hours"], 1.0)
                    cand_current_effort = cand["weighted_remaining_effort"]
                    cand_projected_effort = cand_current_effort + task_weighted_effort
                    cand_projected_util = (cand_projected_effort / cand_capacity) * 100.0

                    # Candidate should not exceed balanced threshold (e.g. 80%) after accepting task
                    if cand_projected_util > self.workload_engine.thresholds["balanced_max"]:
                        continue

                    # Calculate skill match
                    cand_skills = {
                        ds.skill_id: ds.proficiency_level
                        for ds in self.db.query(DeveloperSkill).filter(DeveloperSkill.developer_id == cand_id).all()
                    }

                    if required_skills:
                        matched_count = 0
                        proficiency_scores = []
                        missing_skills = False

                        for req in required_skills:
                            cand_prof = cand_skills.get(req.skill_id, 0)
                            if cand_prof < req.minimum_proficiency:
                                missing_skills = True
                                break
                            matched_count += 1
                            proficiency_scores.append(cand_prof / 5.0)

                        if missing_skills:
                            continue

                        skill_match_pct = round((matched_count / len(required_skills)) * 100.0, 1)
                        avg_proficiency = sum(proficiency_scores) / len(proficiency_scores)
                    else:
                        skill_match_pct = 100.0
                        avg_proficiency = 0.8

                    # Score combination: High skill proficiency + Lower candidate projected utilization
                    # (we favor candidates who have high skills and plenty of room)
                    capacity_slack = (100.0 - cand_projected_util) / 100.0
                    composite_score = (avg_proficiency * 0.6) + (capacity_slack * 0.4)

                    if composite_score > best_score:
                        best_score = composite_score
                        best_candidate = cand
                        orig_projected_effort = max(0.0, orig_current_effort - task_weighted_effort)
                        orig_projected_util = (orig_projected_effort / orig_capacity) * 100.0

                        best_match_meta = {
                            "candidate_id": cand_id,
                            "candidate_name": cand["name"],
                            "skill_match_percentage": skill_match_pct,
                            "orig_current_utilization": overloaded["utilization_percentage"],
                            "orig_projected_utilization": round(orig_projected_util, 1),
                            "cand_current_utilization": cand["utilization_percentage"],
                            "cand_projected_utilization": round(cand_projected_util, 1),
                            "task_weighted_hours": task_weighted_effort,
                        }

                if best_candidate and best_match_meta:
                    reason = (
                        f"Reassign '{task.task_name}' ({task_weighted_effort:.1f} weighted hrs) "
                        f"from {overloaded['name']} ({best_match_meta['orig_current_utilization']:.1f}% -> {best_match_meta['orig_projected_utilization']:.1f}%) "
                        f"to {best_candidate['name']} ({best_match_meta['cand_current_utilization']:.1f}% -> {best_match_meta['cand_projected_utilization']:.1f}%). "
                        f"Skill match: {best_match_meta['skill_match_percentage']}%. Both developers achieve balanced workloads."
                    )

                    new_rec = Recommendation(
                        task_id=task.id,
                        from_developer_id=orig_dev_id,
                        suggested_developer_id=best_candidate["developer_id"],
                        recommendation_reason=reason,
                        status="pending"
                    )
                    self.db.add(new_rec)
                    self.db.flush()

                    recommendations_generated.append({
                        "id": new_rec.id,
                        "task_id": task.id,
                        "task_name": task.task_name,
                        "from_developer_id": orig_dev_id,
                        "from_developer_name": overloaded["name"],
                        "suggested_developer_id": best_candidate["developer_id"],
                        "suggested_developer_name": best_candidate["name"],
                        "recommendation_reason": reason,
                        "status": "pending",
                        "created_at": new_rec.created_at,
                        "metrics": best_match_meta
                    })

        self.db.commit()
        return recommendations_generated

    def approve_recommendation(self, recommendation_id: int) -> Dict[str, Any]:
        """
        Executes approved redistribution: updates TaskAssignment and marks recommendation as approved.
        """
        rec = self.db.query(Recommendation).filter(Recommendation.id == recommendation_id).first()
        if not rec:
            raise ValueError(f"Recommendation {recommendation_id} not found")
        if rec.status != "pending":
            raise ValueError(f"Recommendation is already {rec.status}")

        # Update or create TaskAssignment
        assignment = (
            self.db.query(TaskAssignment)
            .filter(
                TaskAssignment.task_id == rec.task_id,
                TaskAssignment.developer_id == rec.from_developer_id
            )
            .first()
        )

        if assignment:
            # Reassign to suggested developer
            assignment.developer_id = rec.suggested_developer_id
            assignment.assigned_date = datetime.now(timezone.utc)
        else:
            new_assign = TaskAssignment(
                task_id=rec.task_id,
                developer_id=rec.suggested_developer_id,
                allocation_percentage=Decimal("100.00"),
                assigned_date=datetime.now(timezone.utc)
            )
            self.db.add(new_assign)

        rec.status = "approved"
        self.db.commit()

        # Recalculate and return new metrics for both developers
        from_metrics = self.workload_engine.calculate_developer_workload(rec.from_developer_id)
        to_metrics = self.workload_engine.calculate_developer_workload(rec.suggested_developer_id)

        return {
            "recommendation_id": rec.id,
            "status": "approved",
            "message": "Task successfully redistributed to suggested developer.",
            "from_developer": from_metrics,
            "suggested_developer": to_metrics
        }

    def reject_recommendation(self, recommendation_id: int) -> Dict[str, Any]:
        rec = self.db.query(Recommendation).filter(Recommendation.id == recommendation_id).first()
        if not rec:
            raise ValueError(f"Recommendation {recommendation_id} not found")
        if rec.status != "pending":
            raise ValueError(f"Recommendation is already {rec.status}")

        rec.status = "rejected"
        self.db.commit()
        return {
            "recommendation_id": rec.id,
            "status": "rejected",
            "message": "Recommendation successfully rejected. Task assignment remains unchanged."
        }
