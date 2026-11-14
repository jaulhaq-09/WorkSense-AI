from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.intelligence.prediction import ml_engine
from app.schemas.schemas import EffortPredictionRequest, EffortPredictionResponse, AnomalyDetectionRequest
from app.models.entities import User
from app.routes.deps import get_current_user, require_role

router = APIRouter(prefix="/ml", tags=["Machine Learning"])

@router.get("/model-status")
def get_model_status(current_user: User = Depends(get_current_user)):
    return ml_engine.get_status()

@router.post("/train-on-database")
def train_on_database(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "project_manager"]))
):
    return ml_engine.train_on_database_records(db)

@router.post("/predict-effort", response_model=EffortPredictionResponse)
def predict_effort(
    req: EffortPredictionRequest,
    current_user: User = Depends(get_current_user)
):
    prediction = ml_engine.predict_effort(
        complexity=req.complexity,
        priority=req.priority,
        estimated_hours=req.estimated_hours,
        dev_experience=req.dev_experience,
        required_skills_count=req.required_skills_count,
        avg_skill_proficiency=req.avg_skill_proficiency
    )
    return prediction

@router.post("/detect-anomaly")
def detect_workload_anomaly(
    req: AnomalyDetectionRequest,
    current_user: User = Depends(get_current_user)
):
    return ml_engine.detect_workload_anomaly(
        utilization_percentage=req.utilization_percentage,
        weighted_remaining_effort=req.weighted_remaining_effort,
        active_tasks_count=req.active_tasks_count
    )
