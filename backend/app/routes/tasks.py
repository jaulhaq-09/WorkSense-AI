from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.entities import (
    Task,
    Project,
    Developer,
    User,
    TaskAssignment,
    TaskRequiredSkill,
    TaskDependency,
    Skill,
    TimeLog,
)
from app.schemas.schemas import TaskCreate, TaskUpdate, TaskPatch, TaskResponse, TaskAssignRequest
from app.routes.deps import get_current_user, require_role

router = APIRouter(prefix="/tasks", tags=["Tasks"])

def _serialize_task(task: Task, db: Session) -> dict:
    # Assigned developers
    assigns = (
        db.query(TaskAssignment, Developer, User)
        .join(Developer, TaskAssignment.developer_id == Developer.id)
        .join(User, Developer.user_id == User.id)
        .filter(TaskAssignment.task_id == task.id)
        .all()
    )
    assigned_devs = [
        {
            "developer_id": dev.id,
            "name": u.name,
            "email": u.email,
            "allocation_percentage": float(ta.allocation_percentage)
        }
        for ta, dev, u in assigns
    ]

    # Required skills
    skills_req = (
        db.query(TaskRequiredSkill, Skill)
        .join(Skill, TaskRequiredSkill.skill_id == Skill.id)
        .filter(TaskRequiredSkill.task_id == task.id)
        .all()
    )
    required_skills = [
        {
            "skill_id": s.id,
            "skill_name": s.skill_name,
            "minimum_proficiency": trs.minimum_proficiency
        }
        for trs, s in skills_req
    ]

    # Dependencies
    deps = (
        db.query(TaskDependency, Task)
        .join(Task, TaskDependency.depends_on_task_id == Task.id)
        .filter(TaskDependency.task_id == task.id)
        .all()
    )
    dependencies = [
        {
            "depends_on_task_id": dep_task.id,
            "task_name": dep_task.task_name,
            "status": dep_task.status
        }
        for td, dep_task in deps
    ]

    # Actual hours logged
    actual_logged_res = (
        db.query(func.coalesce(func.sum(TimeLog.hours_spent), 0.0))
        .filter(TimeLog.task_id == task.id)
        .scalar()
    )
    actual_hours = float(actual_logged_res or 0.0)
    
    # Remaining hours calculation
    estimated = float(task.estimated_hours or 0.0)
    remaining_hours = 0.0 if task.status == "completed" else max(0.0, estimated - actual_hours)

    return {
        "id": task.id,
        "project_id": task.project_id,
        "project_name": task.project.project_name if task.project else None,
        "task_name": task.task_name,
        "description": task.description,
        "complexity": task.complexity,
        "priority": task.priority,
        "estimated_hours": estimated,
        "status": task.status,
        "deadline": task.deadline,
        "created_at": task.created_at,
        "updated_at": task.updated_at,
        "assigned_developers": assigned_devs,
        "required_skills": required_skills,
        "dependencies": dependencies,
        "actual_hours_logged": round(actual_hours, 2),
        "remaining_hours": round(remaining_hours, 2)
    }

@router.get("", response_model=List[TaskResponse])
def get_tasks(
    project_id: Optional[int] = None,
    developer_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    priority: Optional[str] = None,
    complexity: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Task)
    if project_id:
        query = query.filter(Task.project_id == project_id)
    if status_filter:
        query = query.filter(Task.status == status_filter)
    if priority:
        query = query.filter(Task.priority == priority)
    if complexity:
        query = query.filter(Task.complexity == complexity)
    if developer_id:
        query = query.join(TaskAssignment, Task.id == TaskAssignment.task_id).filter(TaskAssignment.developer_id == developer_id)

    tasks = query.order_by(Task.created_at.desc()).all()
    return [_serialize_task(t, db) for t in tasks]

@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "project_manager"]))
):
    project = db.query(Project).filter(Project.id == task_in.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    task = Task(
        project_id=task_in.project_id,
        task_name=task_in.task_name.strip(),
        description=task_in.description,
        complexity=task_in.complexity.lower(),
        priority=task_in.priority.lower(),
        estimated_hours=Decimal(str(task_in.estimated_hours)),
        status=task_in.status.lower(),
        deadline=task_in.deadline
    )
    db.add(task)
    db.flush()

    # Handle assignments
    if task_in.assignments:
        for a in task_in.assignments:
            ta = TaskAssignment(
                task_id=task.id,
                developer_id=a.developer_id,
                allocation_percentage=Decimal(str(a.allocation_percentage))
            )
            db.add(ta)
    elif task_in.assigned_developer_ids:
        # Default 100% split equally or each 100%
        for dev_id in task_in.assigned_developer_ids:
            ta = TaskAssignment(
                task_id=task.id,
                developer_id=dev_id,
                allocation_percentage=Decimal("100.00")
            )
            db.add(ta)

    # Handle required skills
    if task_in.required_skills:
        for r in task_in.required_skills:
            trs = TaskRequiredSkill(
                task_id=task.id,
                skill_id=r.skill_id,
                minimum_proficiency=r.minimum_proficiency
            )
            db.add(trs)

    # Handle dependencies
    if task_in.depends_on_task_ids:
        for dep_id in task_in.depends_on_task_ids:
            if dep_id != task.id:
                td = TaskDependency(task_id=task.id, depends_on_task_id=dep_id)
                db.add(td)

    db.commit()
    db.refresh(task)
    return _serialize_task(task, db)

@router.get("/{id}", response_model=TaskResponse)
def get_task(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return _serialize_task(task, db)

@router.put("/{id}", response_model=TaskResponse)
def update_task(
    id: int,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Developer can only update status
    is_manager = current_user.role in ("admin", "project_manager")

    if not is_manager:
        if task_in.status is not None:
            task.status = task_in.status.lower()
        db.commit()
        db.refresh(task)
        return _serialize_task(task, db)

    # Manager / Admin full update
    if task_in.task_name is not None:
        task.task_name = task_in.task_name.strip()
    if task_in.description is not None:
        task.description = task_in.description
    if task_in.complexity is not None:
        task.complexity = task_in.complexity.lower()
    if task_in.priority is not None:
        task.priority = task_in.priority.lower()
    if task_in.estimated_hours is not None:
        task.estimated_hours = Decimal(str(task_in.estimated_hours))
    if task_in.status is not None:
        task.status = task_in.status.lower()
    if task_in.deadline is not None:
        task.deadline = task_in.deadline

    if task_in.assignments is not None:
        db.query(TaskAssignment).filter(TaskAssignment.task_id == task.id).delete()
        for a in task_in.assignments:
            ta = TaskAssignment(
                task_id=task.id,
                developer_id=a.developer_id,
                allocation_percentage=Decimal(str(a.allocation_percentage))
            )
            db.add(ta)

    if task_in.required_skills is not None:
        db.query(TaskRequiredSkill).filter(TaskRequiredSkill.task_id == task.id).delete()
        for r in task_in.required_skills:
            trs = TaskRequiredSkill(
                task_id=task.id,
                skill_id=r.skill_id,
                minimum_proficiency=r.minimum_proficiency
            )
            db.add(trs)

    if task_in.depends_on_task_ids is not None:
        db.query(TaskDependency).filter(TaskDependency.task_id == task.id).delete()
        for dep_id in task_in.depends_on_task_ids:
            if dep_id != task.id:
                td = TaskDependency(task_id=task.id, depends_on_task_id=dep_id)
                db.add(td)

    db.commit()
    db.refresh(task)
    return _serialize_task(task, db)

@router.patch("/{id}", response_model=TaskResponse)
def patch_task(
    id: int,
    task_patch: TaskPatch,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    is_manager = current_user.role in ("admin", "project_manager")

    # Developer role can only patch their task status
    if not is_manager:
        if task_patch.status is not None:
            task.status = task_patch.status.lower()
        db.commit()
        db.refresh(task)
        return _serialize_task(task, db)

    # Manager / Admin partial updates
    if task_patch.task_name is not None:
        task.task_name = task_patch.task_name.strip()
    if task_patch.description is not None:
        task.description = task_patch.description
    if task_patch.complexity is not None:
        task.complexity = task_patch.complexity.lower()
    if task_patch.priority is not None:
        task.priority = task_patch.priority.lower()
    if task_patch.estimated_hours is not None:
        task.estimated_hours = Decimal(str(task_patch.estimated_hours))
    if task_patch.status is not None:
        task.status = task_patch.status.lower()
    if task_patch.deadline is not None:
        task.deadline = task_patch.deadline

    # Reassign developer if specified
    if task_patch.assigned_developer_id is not None:
        db.query(TaskAssignment).filter(TaskAssignment.task_id == task.id).delete()
        if task_patch.assigned_developer_id > 0:
            dev = db.query(Developer).filter(Developer.id == task_patch.assigned_developer_id).first()
            if dev:
                ta = TaskAssignment(
                    task_id=task.id,
                    developer_id=dev.id,
                    allocation_percentage=Decimal("100.00")
                )
                db.add(ta)

    db.commit()
    db.refresh(task)
    return _serialize_task(task, db)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "project_manager"]))
):
    task = db.query(Task).filter(Task.id == id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return None

@router.post("/{id}/assign")
def assign_developer(
    id: int,
    assign_in: TaskAssignRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "project_manager"]))
):
    task = db.query(Task).filter(Task.id == id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    dev = db.query(Developer).filter(Developer.id == assign_in.developer_id).first()
    if not dev:
        raise HTTPException(status_code=404, detail="Developer not found")

    existing = (
        db.query(TaskAssignment)
        .filter(TaskAssignment.task_id == id, TaskAssignment.developer_id == assign_in.developer_id)
        .first()
    )
    if existing:
        existing.allocation_percentage = Decimal(str(assign_in.allocation_percentage))
    else:
        new_assign = TaskAssignment(
            task_id=id,
            developer_id=assign_in.developer_id,
            allocation_percentage=Decimal(str(assign_in.allocation_percentage))
        )
        db.add(new_assign)

    db.commit()
    return {"message": "Developer assigned successfully"}
