from datetime import datetime, date
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr, Field

# ----------------- AUTH & USER -----------------
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: str = "developer"  # admin, project_manager, developer

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- TEAMS -----------------
class TeamCreate(BaseModel):
    team_name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None

class TeamUpdate(BaseModel):
    team_name: Optional[str] = None
    description: Optional[str] = None

class TeamResponse(BaseModel):
    id: int
    team_name: str
    description: Optional[str]
    created_at: datetime
    member_count: Optional[int] = 0

    class Config:
        from_attributes = True

# ----------------- SKILLS -----------------
class SkillCreate(BaseModel):
    skill_name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None

class SkillResponse(BaseModel):
    id: int
    skill_name: str
    description: Optional[str]

    class Config:
        from_attributes = True

class DeveloperSkillCreate(BaseModel):
    skill_id: int
    proficiency_level: int = Field(..., ge=1, le=5)

class DeveloperSkillResponse(BaseModel):
    id: int
    skill_id: int
    skill_name: str
    proficiency_level: int

# ----------------- DEVELOPERS -----------------
class DeveloperCreate(BaseModel):
    user_id: int
    team_id: Optional[int] = None
    experience_level: str = "mid"  # junior, mid, senior, lead
    available_hours_per_week: float = Field(default=40.0, ge=0.0, le=168.0)
    skills: Optional[List[DeveloperSkillCreate]] = []

class DeveloperUpdate(BaseModel):
    team_id: Optional[int] = None
    experience_level: Optional[str] = None
    available_hours_per_week: Optional[float] = None
    active_status: Optional[bool] = None
    skills: Optional[List[DeveloperSkillCreate]] = None

class DeveloperResponse(BaseModel):
    id: int
    user_id: int
    name: str
    email: str
    role: str
    team_id: Optional[int]
    team_name: Optional[str]
    experience_level: str
    available_hours_per_week: float
    active_status: bool
    skills: List[DeveloperSkillResponse] = []

    class Config:
        from_attributes = True

# ----------------- PROJECTS -----------------
class ProjectCreate(BaseModel):
    project_name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    team_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: str = "active"

class ProjectUpdate(BaseModel):
    project_name: Optional[str] = None
    description: Optional[str] = None
    team_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = None

class ProjectResponse(BaseModel):
    id: int
    project_name: str
    description: Optional[str]
    team_id: Optional[int]
    team_name: Optional[str] = None
    start_date: Optional[date]
    end_date: Optional[date]
    status: str
    created_at: datetime
    tasks_count: Optional[int] = 0

    class Config:
        from_attributes = True

# ----------------- TASKS -----------------
class TaskRequiredSkillInput(BaseModel):
    skill_id: int
    minimum_proficiency: int = Field(default=1, ge=1, le=5)

class TaskAssignmentInput(BaseModel):
    developer_id: int
    allocation_percentage: float = Field(default=100.0, ge=0.0, le=100.0)

class TaskCreate(BaseModel):
    project_id: int
    task_name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    complexity: str = "medium"  # easy, medium, hard, critical
    priority: str = "medium"  # low, medium, high, critical
    estimated_hours: float = Field(..., ge=0.0)
    status: str = "pending"  # pending, in_progress, blocked, completed
    deadline: Optional[date] = None
    assigned_developer_ids: Optional[List[int]] = []
    assignments: Optional[List[TaskAssignmentInput]] = []
    required_skills: Optional[List[TaskRequiredSkillInput]] = []
    depends_on_task_ids: Optional[List[int]] = []

class TaskUpdate(BaseModel):
    task_name: Optional[str] = None
    description: Optional[str] = None
    complexity: Optional[str] = None
    priority: Optional[str] = None
    estimated_hours: Optional[float] = None
    status: Optional[str] = None
    deadline: Optional[date] = None
    assignments: Optional[List[TaskAssignmentInput]] = None
    required_skills: Optional[List[TaskRequiredSkillInput]] = None
    depends_on_task_ids: Optional[List[int]] = None

class TaskAssignRequest(BaseModel):
    developer_id: int
    allocation_percentage: float = Field(default=100.0, ge=0.0, le=100.0)

class TaskResponse(BaseModel):
    id: int
    project_id: int
    project_name: Optional[str] = None
    task_name: str
    description: Optional[str]
    complexity: str
    priority: str
    estimated_hours: float
    status: str
    deadline: Optional[date]
    created_at: datetime
    updated_at: datetime
    assigned_developers: List[Dict[str, Any]] = []
    required_skills: List[Dict[str, Any]] = []
    dependencies: List[Dict[str, Any]] = []
    actual_hours_logged: float = 0.0
    remaining_hours: float = 0.0

    class Config:
        from_attributes = True

# ----------------- TIME LOGS -----------------
class TimeLogCreate(BaseModel):
    task_id: int
    developer_id: Optional[int] = None  # Inferred from token if developer
    hours_spent: float = Field(..., gt=0.0, le=24.0)
    log_date: Optional[date] = None
    description: Optional[str] = None

class TimeLogResponse(BaseModel):
    id: int
    task_id: int
    task_name: str
    developer_id: int
    developer_name: str
    hours_spent: float
    log_date: date
    description: Optional[str]

    class Config:
        from_attributes = True

# ----------------- RECOMMENDATIONS -----------------
class RecommendationResponse(BaseModel):
    id: int
    task_id: int
    task_name: str
    project_name: Optional[str] = None
    from_developer_id: int
    from_developer_name: str
    suggested_developer_id: int
    suggested_developer_name: str
    recommendation_reason: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- ML PREDICTIONS -----------------
class EffortPredictionRequest(BaseModel):
    complexity: str = "medium"  # easy, medium, hard, critical
    priority: str = "medium"  # low, medium, high, critical
    estimated_hours: float = Field(..., gt=0.0)
    dev_experience: str = "mid"  # junior, mid, senior, lead
    required_skills_count: int = 2
    avg_skill_proficiency: float = 3.5

class EffortPredictionResponse(BaseModel):
    estimated_hours: float
    predicted_actual_hours: float
    variance_hours: float
    confidence_interval_hours: List[float]
    risk_level: str
    factors: Dict[str, Any]
    disclaimer: str

class AnomalyDetectionRequest(BaseModel):
    utilization_percentage: float
    weighted_remaining_effort: float
    active_tasks_count: int
