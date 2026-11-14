from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.config import settings
from app.models.entities import (
    Developer,
    Task,
    TaskAssignment,
    TimeLog,
    TaskDependency,
    WorkloadHistory,
    Team,
)

class WorkloadEngine:
    def __init__(self, db: Session):
        self.db = db
        self.weights = settings.complexity_weights
        self.thresholds = {
            "underutilized": settings.UTILIZATION_THRESHOLD_UNDERUTILIZED,
            "balanced_max": settings.UTILIZATION_THRESHOLD_BALANCED_MAX,
            "high_max": settings.UTILIZATION_THRESHOLD_HIGH_MAX,
        }

    def get_complexity_weight(self, complexity: str) -> float:
        norm = (complexity or "medium").strip().lower()
        return self.weights.get(norm, self.weights.get("medium", 1.2))

    def classify_utilization(self, utilization_pct: float) -> str:
        if utilization_pct < self.thresholds["underutilized"]:
            return "underutilized"
        elif utilization_pct <= self.thresholds["balanced_max"]:
            return "balanced"
        elif utilization_pct <= self.thresholds["high_max"]:
            return "high"
        else:
            return "overloaded"

    def calculate_developer_workload(self, developer_id: int) -> Dict[str, Any]:
        """
        Calculates granular workload metrics for a specific developer:
        - Remaining hours
        - Weighted remaining effort
        - Available weekly capacity
        - Utilization percentage
        - Normalized workload score (0 - 100)
        - Pending, in_progress, blocked task counts
        """
        developer = self.db.query(Developer).filter(Developer.id == developer_id).first()
        if not developer:
            raise ValueError(f"Developer with ID {developer_id} not found")

        # Get all task assignments for active developer
        assignments = (
            self.db.query(TaskAssignment, Task)
            .join(Task, TaskAssignment.task_id == Task.id)
            .filter(TaskAssignment.developer_id == developer_id)
            .all()
        )

        total_active_tasks = 0
        pending_tasks = 0
        in_progress_tasks = 0
        blocked_tasks = 0
        completed_tasks = 0

        raw_remaining_hours = 0.0
        weighted_remaining_effort = 0.0
        blocked_weighted_effort = 0.0

        today = date.today()
        overdue_tasks = 0
        upcoming_deadlines_tasks = []

        task_breakdowns = []

        for assignment, task in assignments:
            # Query actual hours logged for this specific task
            actual_logged_res = (
                self.db.query(func.coalesce(func.sum(TimeLog.hours_spent), 0.0))
                .filter(TimeLog.task_id == task.id, TimeLog.developer_id == developer_id)
                .scalar()
            )
            actual_hours_logged = float(actual_logged_res or 0.0)

            # Allocation factor (supports multiple assigned developers)
            alloc_pct = float(assignment.allocation_percentage or 100.0) / 100.0

            # Allocated estimated hours
            allocated_estimated = float(task.estimated_hours or 0.0) * alloc_pct
            
            # Remaining hours formula: max(0, Estimated Hours - Actual Hours Logged)
            # Completed tasks do not contribute to remaining effort
            if task.status.lower() == "completed":
                task_remaining = 0.0
                completed_tasks += 1
            else:
                task_remaining = max(0.0, allocated_estimated - actual_hours_logged)
                total_active_tasks += 1

                if task.status.lower() == "in_progress":
                    in_progress_tasks += 1
                elif task.status.lower() == "blocked":
                    blocked_tasks += 1
                else:
                    pending_tasks += 1

                # Deadline tracking
                if task.deadline:
                    if task.deadline < today:
                        overdue_tasks += 1
                    elif task.deadline <= today + timedelta(days=7):
                        upcoming_deadlines_tasks.append({
                            "task_id": task.id,
                            "task_name": task.task_name,
                            "deadline": str(task.deadline),
                            "priority": task.priority
                        })

            weight = self.get_complexity_weight(task.complexity)
            task_weighted_effort = task_remaining * weight

            if task.status.lower() == "blocked":
                blocked_weighted_effort += task_weighted_effort
            else:
                raw_remaining_hours += task_remaining
                weighted_remaining_effort += task_weighted_effort

            task_breakdowns.append({
                "task_id": task.id,
                "task_name": task.task_name,
                "project_id": task.project_id,
                "complexity": task.complexity,
                "complexity_weight": weight,
                "priority": task.priority,
                "status": task.status,
                "deadline": str(task.deadline) if task.deadline else None,
                "estimated_hours": float(task.estimated_hours or 0.0),
                "actual_hours_logged": actual_hours_logged,
                "allocation_percentage": float(assignment.allocation_percentage),
                "remaining_hours": round(task_remaining, 2),
                "weighted_effort": round(task_weighted_effort, 2)
            })

        # Available capacity calculation
        # Initial weekly capacity from developer profile (e.g. 40.0)
        available_capacity = float(developer.available_hours_per_week) if developer.available_hours_per_week is not None else 40.0

        # Handle zero or negative capacity safely
        if available_capacity <= 0.0:
            utilization_pct = 100.0 if weighted_remaining_effort > 0 else 0.0
        else:
            utilization_pct = (weighted_remaining_effort / available_capacity) * 100.0

        # Normalized workload score (0 to 100 scale)
        # Normalized score provides a relative benchmark capped at 100, where 100% capacity = 100 score
        normalized_workload_score = min(100.0, max(0.0, (weighted_remaining_effort / max(available_capacity, 1.0)) * 100.0))

        workload_status = self.classify_utilization(utilization_pct)

        user_name = developer.user.name if developer.user else f"Dev #{developer.id}"
        user_email = developer.user.email if developer.user else ""

        team_name = developer.team.team_name if developer.team else "Unassigned Team"

        return {
            "developer_id": developer.id,
            "user_id": developer.user_id,
            "name": user_name,
            "email": user_email,
            "team_id": developer.team_id,
            "team_name": team_name,
            "experience_level": developer.experience_level,
            "available_hours": round(available_capacity, 2),
            "raw_remaining_hours": round(raw_remaining_hours, 2),
            "weighted_remaining_effort": round(weighted_remaining_effort, 2),
            "blocked_weighted_effort": round(blocked_weighted_effort, 2),
            "utilization_percentage": round(utilization_pct, 2),
            "workload_score": round(normalized_workload_score, 2),
            "workload_status": workload_status,
            "total_active_tasks": total_active_tasks,
            "pending_tasks": pending_tasks,
            "in_progress_tasks": in_progress_tasks,
            "blocked_tasks": blocked_tasks,
            "completed_tasks": completed_tasks,
            "overdue_tasks": overdue_tasks,
            "upcoming_deadlines": upcoming_deadlines_tasks,
            "tasks": task_breakdowns,
        }

    def calculate_team_workloads(self, team_id: Optional[int] = None) -> List[Dict[str, Any]]:
        query = self.db.query(Developer).filter(Developer.active_status == True)
        if team_id:
            query = query.filter(Developer.team_id == team_id)
        
        developers = query.all()
        results = [self.calculate_developer_workload(dev.id) for dev in developers]
        return results

    def save_workload_history_snapshot(self) -> int:
        """
        Records a historical snapshot of current workloads for trend charts.
        """
        developers = self.db.query(Developer).filter(Developer.active_status == True).all()
        created_count = 0
        now_utc = datetime.now(timezone.utc)

        for dev in developers:
            metrics = self.calculate_developer_workload(dev.id)
            history = WorkloadHistory(
                developer_id=dev.id,
                workload_score=Decimal(str(metrics["workload_score"])),
                utilization_percentage=Decimal(str(metrics["utilization_percentage"])),
                workload_status=metrics["workload_status"],
                calculated_at=now_utc
            )
            self.db.add(history)
            created_count += 1

        self.db.commit()
        return created_count
