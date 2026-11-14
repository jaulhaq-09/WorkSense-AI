from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.entities import Project, Task, Team, User
from app.schemas.schemas import ProjectCreate, ProjectUpdate, ProjectResponse
from app.routes.deps import get_current_user, require_role

router = APIRouter(prefix="/projects", tags=["Projects"])

def _serialize_project(proj: Project, db: Session) -> dict:
    tasks_count = db.query(func.count(Task.id)).filter(Task.project_id == proj.id).scalar() or 0
    return {
        "id": proj.id,
        "project_name": proj.project_name,
        "description": proj.description,
        "team_id": proj.team_id,
        "team_name": proj.team.team_name if proj.team else None,
        "start_date": proj.start_date,
        "end_date": proj.end_date,
        "status": proj.status,
        "created_at": proj.created_at,
        "tasks_count": tasks_count
    }

@router.get("", response_model=List[ProjectResponse])
def get_projects(
    team_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Project)
    if team_id:
        query = query.filter(Project.team_id == team_id)
    if status_filter:
        query = query.filter(Project.status == status_filter)
    projects = query.order_by(Project.created_at.desc()).all()
    return [_serialize_project(p, db) for p in projects]

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    proj_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "project_manager"]))
):
    project = Project(
        project_name=proj_in.project_name.strip(),
        description=proj_in.description,
        team_id=proj_in.team_id,
        start_date=proj_in.start_date,
        end_date=proj_in.end_date,
        status=proj_in.status or "active"
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return _serialize_project(project, db)

@router.get("/{id}", response_model=ProjectResponse)
def get_project(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return _serialize_project(project, db)

@router.put("/{id}", response_model=ProjectResponse)
def update_project(
    id: int,
    proj_in: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "project_manager"]))
):
    project = db.query(Project).filter(Project.id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if proj_in.project_name is not None:
        project.project_name = proj_in.project_name.strip()
    if proj_in.description is not None:
        project.description = proj_in.description
    if proj_in.team_id is not None:
        project.team_id = proj_in.team_id
    if proj_in.start_date is not None:
        project.start_date = proj_in.start_date
    if proj_in.end_date is not None:
        project.end_date = proj_in.end_date
    if proj_in.status is not None:
        project.status = proj_in.status

    db.commit()
    db.refresh(project)
    return _serialize_project(project, db)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "project_manager"]))
):
    project = db.query(Project).filter(Project.id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return None
