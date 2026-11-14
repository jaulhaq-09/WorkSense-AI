from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.entities import Recommendation, Task, Developer, User, Project
from app.schemas.schemas import RecommendationResponse
from app.routes.deps import get_current_user, require_role
from app.intelligence.recommendations import RecommendationEngine

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

def _serialize_rec(rec: Recommendation, db: Session) -> dict:
    from_dev_user = db.query(User).join(Developer, Developer.user_id == User.id).filter(Developer.id == rec.from_developer_id).first()
    to_dev_user = db.query(User).join(Developer, Developer.user_id == User.id).filter(Developer.id == rec.suggested_developer_id).first()
    
    return {
        "id": rec.id,
        "task_id": rec.task_id,
        "task_name": rec.task.task_name if rec.task else f"Task #{rec.task_id}",
        "project_name": rec.task.project.project_name if rec.task and rec.task.project else None,
        "from_developer_id": rec.from_developer_id,
        "from_developer_name": from_dev_user.name if from_dev_user else f"Dev #{rec.from_developer_id}",
        "suggested_developer_id": rec.suggested_developer_id,
        "suggested_developer_name": to_dev_user.name if to_dev_user else f"Dev #{rec.suggested_developer_id}",
        "recommendation_reason": rec.recommendation_reason,
        "status": rec.status,
        "created_at": rec.created_at
    }

@router.get("", response_model=List[RecommendationResponse])
def get_recommendations(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Recommendation)
    if status_filter:
        query = query.filter(Recommendation.status == status_filter.lower())
    recs = query.order_by(Recommendation.created_at.desc()).all()
    return [_serialize_rec(r, db) for r in recs]

@router.post("/generate")
def generate_recommendations(
    team_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "project_manager"]))
):
    engine = RecommendationEngine(db)
    generated = engine.generate_redistribution_recommendations(team_id)
    return {
        "message": f"Generated {len(generated)} redistribution recommendations.",
        "recommendations": generated
    }

@router.post("/{id}/approve")
def approve_recommendation(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "project_manager"]))
):
    engine = RecommendationEngine(db)
    try:
        result = engine.approve_recommendation(id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{id}/reject")
def reject_recommendation(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "project_manager"]))
):
    engine = RecommendationEngine(db)
    try:
        result = engine.reject_recommendation(id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
