import statistics
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone

from app.intelligence.workload import WorkloadEngine
from app.models.entities import Developer, Team, WorkloadHistory

class ImbalanceDetector:
    def __init__(self, db: Session):
        self.db = db
        self.engine = WorkloadEngine(db)

    def analyze_team_imbalance(self, team_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Runs comprehensive imbalance analytics across a team or entire organization.
        """
        dev_workloads = self.engine.calculate_team_workloads(team_id)
        
        if not dev_workloads:
            return {
                "team_id": team_id,
                "developer_count": 0,
                "team_variance": 0.0,
                "team_stdev": 0.0,
                "average_utilization": 0.0,
                "imbalance_detected": False,
                "overloaded_developers": [],
                "underutilized_developers": [],
                "balanced_developers": [],
                "explanations": ["No active developers found in selected scope."],
                "concentration_analysis": {}
            }

        utilizations = [d["utilization_percentage"] for d in dev_workloads]
        avg_utilization = sum(utilizations) / len(utilizations)
        
        variance = statistics.variance(utilizations) if len(utilizations) > 1 else 0.0
        stdev = statistics.stdev(utilizations) if len(utilizations) > 1 else 0.0

        overloaded = [d for d in dev_workloads if d["workload_status"] in ("high", "overloaded")]
        underutilized = [d for d in dev_workloads if d["workload_status"] == "underutilized"]
        balanced = [d for d in dev_workloads if d["workload_status"] == "balanced"]

        # Imbalance is detected if there is at least one overloaded AND one underutilized developer,
        # or if the team standard deviation exceeds 20%
        imbalance_detected = (len(overloaded) > 0 and len(underutilized) > 0) or (stdev > 20.0)

        explanations = []
        for dev in overloaded:
            reason = (
                f"{dev['name']} has {dev['utilization_percentage']:.1f}% capacity utilization because "
                f"they have {dev['weighted_remaining_effort']:.1f} weighted remaining hours against {dev['available_hours']:.1f} available hours."
            )
            # Check historical pattern for persistent overload
            persistent = self._check_persistent_overload(dev["developer_id"])
            if persistent:
                reason += f" [ALERT: Persistent overload detected across recent calculation cycles]."
            explanations.append(reason)

        for dev in underutilized:
            explanations.append(
                f"{dev['name']} is underutilized at {dev['utilization_percentage']:.1f}% capacity "
                f"({dev['weighted_remaining_effort']:.1f} weighted hours vs {dev['available_hours']:.1f} available hours), "
                f"indicating available capacity to absorb tasks."
            )

        # Workload Concentration Analysis
        total_team_effort = sum(d["weighted_remaining_effort"] for d in dev_workloads)
        sorted_by_effort = sorted(dev_workloads, key=lambda x: x["weighted_remaining_effort"], reverse=True)
        top_dev = sorted_by_effort[0] if sorted_by_effort else None
        
        top_contributor_share = (
            round((top_dev["weighted_remaining_effort"] / total_team_effort * 100.0), 1)
            if total_team_effort > 0 and top_dev else 0.0
        )

        concentration_info = {
            "total_team_effort_hours": round(total_team_effort, 2),
            "top_contributor_name": top_dev["name"] if top_dev else None,
            "top_contributor_share_pct": top_contributor_share,
            "is_concentrated": top_contributor_share > 50.0 and len(dev_workloads) > 1
        }

        if concentration_info["is_concentrated"]:
            explanations.append(
                f"Workload concentration alert: {top_dev['name']} holds {top_contributor_share}% "
                f"of the entire team's active remaining effort."
            )

        return {
            "team_id": team_id,
            "developer_count": len(dev_workloads),
            "average_utilization": round(avg_utilization, 2),
            "team_variance": round(variance, 2),
            "team_stdev": round(stdev, 2),
            "imbalance_detected": imbalance_detected,
            "overloaded_count": len(overloaded),
            "underutilized_count": len(underutilized),
            "balanced_count": len(balanced),
            "overloaded_developers": overloaded,
            "underutilized_developers": underutilized,
            "balanced_developers": balanced,
            "explanations": explanations,
            "concentration": concentration_info,
            "developer_workloads": dev_workloads
        }

    def _check_persistent_overload(self, developer_id: int) -> bool:
        """
        Inspects historical snapshots: returns True if developer was high/overloaded
        in at least 3 consecutive recent calculations.
        """
        recent_records = (
            self.db.query(WorkloadHistory)
            .filter(WorkloadHistory.developer_id == developer_id)
            .order_by(WorkloadHistory.calculated_at.desc())
            .limit(3)
            .all()
        )
        if len(recent_records) >= 3:
            return all(r.workload_status in ("high", "overloaded") for r in recent_records)
        return False
