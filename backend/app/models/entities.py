from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Numeric, Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="developer")  # admin, project_manager, developer
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    developer_profile = relationship("Developer", back_populates="user", uselist=False, cascade="all, delete-orphan")


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    team_name = Column(String(255), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    developers = relationship("Developer", back_populates="team")
    projects = relationship("Project", back_populates="team")


class Developer(Base):
    __tablename__ = "developers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)
    experience_level = Column(String(50), default="mid", nullable=False)  # junior, mid, senior, lead
    available_hours_per_week = Column(Numeric(5, 2), default=40.00, nullable=False)
    active_status = Column(Boolean, default=True, nullable=False)

    # Relationships
    user = relationship("User", back_populates="developer_profile")
    team = relationship("Team", back_populates="developers")
    skills = relationship("DeveloperSkill", back_populates="developer", cascade="all, delete-orphan")
    task_assignments = relationship("TaskAssignment", back_populates="developer", cascade="all, delete-orphan")
    time_logs = relationship("TimeLog", back_populates="developer", cascade="all, delete-orphan")
    workload_histories = relationship("WorkloadHistory", back_populates="developer", cascade="all, delete-orphan")
    outgoing_recommendations = relationship("Recommendation", foreign_keys="Recommendation.from_developer_id", back_populates="from_developer")
    incoming_recommendations = relationship("Recommendation", foreign_keys="Recommendation.suggested_developer_id", back_populates="suggested_developer")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    skill_name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)

    # Relationships
    developer_skills = relationship("DeveloperSkill", back_populates="skill", cascade="all, delete-orphan")
    task_requirements = relationship("TaskRequiredSkill", back_populates="skill", cascade="all, delete-orphan")


class DeveloperSkill(Base):
    __tablename__ = "developer_skills"

    id = Column(Integer, primary_key=True, index=True)
    developer_id = Column(Integer, ForeignKey("developers.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    proficiency_level = Column(Integer, default=3, nullable=False)  # 1 (Beginner) to 5 (Expert)

    __table_args__ = (
        UniqueConstraint("developer_id", "skill_id", name="uq_dev_skill"),
    )

    # Relationships
    developer = relationship("Developer", back_populates="skills")
    skill = relationship("Skill", back_populates="developer_skills")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    project_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    status = Column(String(50), default="active", nullable=False)  # active, completed, on_hold, planning
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    team = relationship("Team", back_populates="projects")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    task_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    complexity = Column(String(50), default="medium", nullable=False)  # easy, medium, hard, critical
    priority = Column(String(50), default="medium", nullable=False)  # low, medium, high, critical
    estimated_hours = Column(Numeric(6, 2), default=0.00, nullable=False)
    status = Column(String(50), default="pending", nullable=False)  # pending, in_progress, blocked, completed
    deadline = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    project = relationship("Project", back_populates="tasks")
    assignments = relationship("TaskAssignment", back_populates="task", cascade="all, delete-orphan")
    required_skills = relationship("TaskRequiredSkill", back_populates="task", cascade="all, delete-orphan")
    time_logs = relationship("TimeLog", back_populates="task", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="task", cascade="all, delete-orphan")
    dependencies = relationship(
        "TaskDependency",
        foreign_keys="TaskDependency.task_id",
        back_populates="task",
        cascade="all, delete-orphan"
    )
    dependents = relationship(
        "TaskDependency",
        foreign_keys="TaskDependency.depends_on_task_id",
        back_populates="depends_on_task",
        cascade="all, delete-orphan"
    )


class TaskAssignment(Base):
    __tablename__ = "task_assignments"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    developer_id = Column(Integer, ForeignKey("developers.id", ondelete="CASCADE"), nullable=False)
    assigned_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    allocation_percentage = Column(Numeric(5, 2), default=100.00, nullable=False)

    __table_args__ = (
        UniqueConstraint("task_id", "developer_id", name="uq_task_developer"),
    )

    # Relationships
    task = relationship("Task", back_populates="assignments")
    developer = relationship("Developer", back_populates="task_assignments")


class TaskRequiredSkill(Base):
    __tablename__ = "task_required_skills"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    minimum_proficiency = Column(Integer, default=1, nullable=False)  # 1-5 scale

    __table_args__ = (
        UniqueConstraint("task_id", "skill_id", name="uq_task_skill"),
    )

    # Relationships
    task = relationship("Task", back_populates="required_skills")
    skill = relationship("Skill", back_populates="task_requirements")


class TimeLog(Base):
    __tablename__ = "time_logs"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    developer_id = Column(Integer, ForeignKey("developers.id", ondelete="CASCADE"), nullable=False)
    hours_spent = Column(Numeric(6, 2), nullable=False)
    log_date = Column(Date, server_default=func.current_date(), nullable=False)
    description = Column(Text, nullable=True)

    # Relationships
    task = relationship("Task", back_populates="time_logs")
    developer = relationship("Developer", back_populates="time_logs")


class TaskDependency(Base):
    __tablename__ = "task_dependencies"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    depends_on_task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)

    __table_args__ = (
        UniqueConstraint("task_id", "depends_on_task_id", name="uq_task_dependency"),
    )

    # Relationships
    task = relationship("Task", foreign_keys=[task_id], back_populates="dependencies")
    depends_on_task = relationship("Task", foreign_keys=[depends_on_task_id], back_populates="dependents")


class WorkloadHistory(Base):
    __tablename__ = "workload_history"

    id = Column(Integer, primary_key=True, index=True)
    developer_id = Column(Integer, ForeignKey("developers.id", ondelete="CASCADE"), nullable=False)
    workload_score = Column(Numeric(5, 2), nullable=False)  # Normalized 0-100 score
    utilization_percentage = Column(Numeric(6, 2), nullable=False)  # Capacity utilization %
    workload_status = Column(String(50), nullable=False)  # underutilized, balanced, high, overloaded
    calculated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    developer = relationship("Developer", back_populates="workload_histories")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    from_developer_id = Column(Integer, ForeignKey("developers.id", ondelete="CASCADE"), nullable=False)
    suggested_developer_id = Column(Integer, ForeignKey("developers.id", ondelete="CASCADE"), nullable=False)
    recommendation_reason = Column(Text, nullable=False)
    status = Column(String(50), default="pending", nullable=False)  # pending, approved, rejected
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    task = relationship("Task", back_populates="recommendations")
    from_developer = relationship("Developer", foreign_keys=[from_developer_id], back_populates="outgoing_recommendations")
    suggested_developer = relationship("Developer", foreign_keys=[suggested_developer_id], back_populates="incoming_recommendations")
