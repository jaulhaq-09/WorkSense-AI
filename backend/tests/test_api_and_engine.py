import pytest
from decimal import Decimal
from datetime import date
from fastapi import HTTPException

from app.models.entities import Developer, Task, TaskAssignment, User, Team, Skill, Recommendation
from app.schemas.schemas import (
    LoginRequest,
    ProjectCreate,
    TaskCreate,
    TimeLogCreate,
    DeveloperCreate,
    DeveloperSkillCreate
)
from app.routes.auth import login, get_me
from app.routes.projects import create_project, get_projects
from app.routes.tasks import create_task, get_tasks
from app.routes.developers import get_developers
from app.routes.time_logs import create_time_log
from app.routes.teams import delete_team
from app.intelligence.workload import WorkloadEngine
from app.intelligence.imbalance import ImbalanceDetector
from app.intelligence.recommendations import RecommendationEngine
from app.intelligence.prediction import ml_engine
from app.core.config import settings

# 1. Authentication Tests
def test_login_success(db_session):
    login_req = LoginRequest(
        email=settings.DEMO_ADMIN_EMAIL,
        password=settings.DEMO_ADMIN_PASSWORD
    )
    res = login(login_req, db=db_session)
    assert "access_token" in res
    assert res["user"]["role"] == "admin"
    assert res["user"]["email"] == settings.DEMO_ADMIN_EMAIL

def test_login_invalid_password(db_session):
    login_req = LoginRequest(
        email=settings.DEMO_ADMIN_EMAIL,
        password="WrongPassword123!"
    )
    with pytest.raises(HTTPException) as excinfo:
        login(login_req, db=db_session)
    assert excinfo.value.status_code == 401

def test_get_current_user_me(db_session):
    admin = db_session.query(User).filter(User.email == settings.DEMO_ADMIN_EMAIL).first()
    res = get_me(current_user=admin, db=db_session)
    assert res["email"] == settings.DEMO_ADMIN_EMAIL
    assert res["role"] == "admin"

# 2. Role Permissions Tests
def test_pm_cannot_delete_team(db_session):
    pm = db_session.query(User).filter(User.role == "project_manager").first()
    team = db_session.query(Team).first()
    # require_role for delete_team requires admin
    from app.routes.deps import require_role
    checker = require_role(["admin"])
    with pytest.raises(HTTPException) as excinfo:
        checker(current_user=pm)
    assert excinfo.value.status_code == 403

def test_pm_can_create_project(db_session):
    pm = db_session.query(User).filter(User.role == "project_manager").first()
    proj_in = ProjectCreate(
        project_name="Automated Platform Hardening",
        description="Core security and performance upgrades",
        status="active"
    )
    res = create_project(proj_in, db=db_session, current_user=pm)
    assert res["project_name"] == "Automated Platform Hardening"
    assert res["status"] == "active"

# 3. Developer & Skill Management
def test_get_developers(db_session):
    admin = db_session.query(User).filter(User.role == "admin").first()
    devs = get_developers(db=db_session, current_user=admin)
    assert len(devs) >= 4
    alex = next((d for d in devs if d["name"] == "Alex Rivera"), None)
    assert alex is not None
    assert alex["experience_level"] == "senior"
    assert len(alex["skills"]) >= 2

# 4. Task Management & Assignment
def test_task_creation_and_assignment(db_session):
    pm = db_session.query(User).filter(User.role == "project_manager").first()
    dana_dev = db_session.query(Developer).join(User, Developer.user_id == User.id).filter(User.name == "Dana Vance").first()
    project = db_session.query(Task).first().project

    task_in = TaskCreate(
        project_id=project.id,
        task_name="Distributed Tracing Middleware",
        description="Add OpenTelemetry span propagation across services",
        complexity="hard",
        priority="high",
        estimated_hours=14.0,
        assigned_developer_ids=[dana_dev.id]
    )
    created = create_task(task_in, db=db_session, current_user=pm)
    assert created["task_name"] == "Distributed Tracing Middleware"
    assert len(created["assigned_developers"]) == 1

# 5. Time Logging & Remaining Effort
def test_time_logging(db_session):
    dana_user = db_session.query(User).filter(User.name == "Dana Vance").first()
    dana_dev = db_session.query(Developer).filter(Developer.user_id == dana_user.id).first()
    task = db_session.query(Task).filter(Task.task_name == "Distributed Tracing Middleware").first()
    if not task:
        task = db_session.query(Task).first()

    log_in = TimeLogCreate(
        task_id=task.id,
        developer_id=dana_dev.id,
        hours_spent=3.0,
        description="Investigated connection pooling overhead"
    )
    res = create_time_log(log_in, db=db_session, current_user=dana_user)
    assert res["hours_spent"] == 3.0
    assert res["developer_id"] == dana_dev.id

# 6. Workload Calculation Engine Tests
def test_workload_calculation_alex_scenario(db_session):
    """
    Validates Section 10 scenario:
    Developer A (Alex) should have ~37 weighted remaining effort and ~92.5% utilization
    """
    alex_user = db_session.query(User).filter(User.name == "Alex Rivera").first()
    alex_dev = db_session.query(Developer).filter(Developer.user_id == alex_user.id).first()

    engine = WorkloadEngine(db_session)
    metrics = engine.calculate_developer_workload(alex_dev.id)

    assert metrics["available_hours"] == 40.0
    assert metrics["weighted_remaining_effort"] >= 30.0
    assert metrics["workload_status"] in ("high", "overloaded")
    assert metrics["utilization_percentage"] >= 80.0

def test_workload_calculation_casey_underutilized(db_session):
    """
    Developer C (Casey) should be underutilized (~27.5% utilization)
    """
    casey_user = db_session.query(User).filter(User.name == "Casey Morgan").first()
    casey_dev = db_session.query(Developer).filter(Developer.user_id == casey_user.id).first()

    engine = WorkloadEngine(db_session)
    metrics = engine.calculate_developer_workload(casey_dev.id)

    assert metrics["workload_status"] == "underutilized"
    assert metrics["utilization_percentage"] < 40.0

# 7. Edge Cases: Zero Capacity & Completed Tasks
def test_zero_capacity_edge_case(db_session):
    engine = WorkloadEngine(db_session)
    dev = Developer(
        user_id=1,
        team_id=1,
        experience_level="junior",
        available_hours_per_week=Decimal("0.00"),
        active_status=True
    )
    db_session.add(dev)
    db_session.flush()
    metrics = engine.calculate_developer_workload(dev.id)
    assert metrics["available_hours"] == 0.0
    assert metrics["utilization_percentage"] in (0.0, 100.0)

# 8. Imbalance Detection
def test_imbalance_detection(db_session):
    detector = ImbalanceDetector(db_session)
    analysis = detector.analyze_team_imbalance()

    assert analysis["imbalance_detected"] is True
    assert analysis["overloaded_count"] >= 1
    assert analysis["underutilized_count"] >= 1
    assert len(analysis["explanations"]) > 0

# 9. Recommendation Engine: Generation, Approval & Rejection
def test_recommendation_flow(db_session):
    engine = RecommendationEngine(db_session)
    recs = engine.generate_redistribution_recommendations()
    
    pending_rec = db_session.query(Recommendation).filter(Recommendation.status == "pending").first()
    assert pending_rec is not None
    rec_id = pending_rec.id

    # Test approve recommendation
    res = engine.approve_recommendation(rec_id)
    assert res["status"] == "approved"
    assert res["from_developer"]["utilization_percentage"] < 90.0

# 10. Machine Learning Effort Prediction & Anomaly Detection
def test_ml_effort_prediction():
    pred = ml_engine.predict_effort(
        complexity="critical",
        priority="high",
        estimated_hours=20.0,
        dev_experience="junior",
        required_skills_count=3,
        avg_skill_proficiency=2.5
    )
    assert "predicted_actual_hours" in pred
    assert pred["predicted_actual_hours"] > 0
    assert pred["risk_level"] in ("low", "moderate", "high")
    assert len(pred["confidence_interval_hours"]) == 2

def test_ml_anomaly_detection():
    # Test normal workload
    normal_res = ml_engine.detect_workload_anomaly(
        utilization_percentage=55.0,
        weighted_remaining_effort=22.0,
        active_tasks_count=3
    )
    assert "is_anomaly" in normal_res

    # Test severe overload anomaly
    overload_res = ml_engine.detect_workload_anomaly(
        utilization_percentage=160.0,
        weighted_remaining_effort=75.0,
        active_tasks_count=12
    )
    assert overload_res["is_anomaly"] is True or overload_res["anomaly_label"] == "Potential Overload Anomaly"
