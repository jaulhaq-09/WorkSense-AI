from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.entities import WorkloadHistory, Developer, User, Task, Project
from app.routes.deps import get_current_user
from app.intelligence.workload import WorkloadEngine
from app.intelligence.imbalance import ImbalanceDetector

router = APIRouter(prefix="/workload", tags=["Workload"])

@router.get("/overview")
def get_workload_overview(
    team_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    detector = ImbalanceDetector(db)
    analysis = detector.analyze_team_imbalance(team_id)

    # Global project and task counts
    total_projects = db.query(func.count(Project.id)).filter(Project.status == "active").scalar() or 0
    total_tasks = db.query(func.count(Task.id)).scalar() or 0
    completed_tasks = db.query(func.count(Task.id)).filter(Task.status == "completed").scalar() or 0
    in_progress_tasks = db.query(func.count(Task.id)).filter(Task.status == "in_progress").scalar() or 0
    pending_tasks = db.query(func.count(Task.id)).filter(Task.status == "pending").scalar() or 0
    blocked_tasks = db.query(func.count(Task.id)).filter(Task.status == "blocked").scalar() or 0

    return {
        "analysis": analysis,
        "summary": {
            "total_developers": analysis["developer_count"],
            "overloaded_count": analysis["overloaded_count"],
            "balanced_count": analysis["balanced_count"],
            "underutilized_count": analysis["underutilized_count"],
            "average_utilization": analysis["average_utilization"],
            "team_variance": analysis["team_variance"],
            "team_stdev": analysis["team_stdev"],
            "imbalance_detected": analysis["imbalance_detected"],
            "active_projects": total_projects,
            "total_tasks": total_tasks,
            "in_progress_tasks": in_progress_tasks,
            "pending_tasks": pending_tasks,
            "blocked_tasks": blocked_tasks,
            "completed_tasks": completed_tasks
        }
    }

@router.get("/developers")
def get_developers_workload(
    team_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    engine = WorkloadEngine(db)
    return engine.calculate_team_workloads(team_id)

@router.get("/developers/{id}")
def get_developer_workload(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    engine = WorkloadEngine(db)
    try:
        return engine.calculate_developer_workload(id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/history")
def get_workload_history(
    developer_id: Optional[int] = None,
    limit: int = Query(default=30, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = (
        db.query(WorkloadHistory, Developer, User)
        .join(Developer, WorkloadHistory.developer_id == Developer.id)
        .join(User, Developer.user_id == User.id)
    )
    if developer_id:
        query = query.filter(WorkloadHistory.developer_id == developer_id)

    records = query.order_by(WorkloadHistory.calculated_at.asc()).limit(limit).all()
    return [
        {
            "id": h.id,
            "developer_id": h.developer_id,
            "developer_name": u.name,
            "workload_score": float(h.workload_score),
            "utilization_percentage": float(h.utilization_percentage),
            "workload_status": h.workload_status,
            "calculated_at": h.calculated_at.isoformat()
        }
        for h, d, u in records
    ]

@router.post("/recalculate")
def recalculate_workloads(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    engine = WorkloadEngine(db)
    snapshot_count = engine.save_workload_history_snapshot()
    detector = ImbalanceDetector(db)
    analysis = detector.analyze_team_imbalance()
    return {
        "message": f"Successfully recalculated workloads and saved {snapshot_count} snapshot records.",
        "summary": analysis
    }
