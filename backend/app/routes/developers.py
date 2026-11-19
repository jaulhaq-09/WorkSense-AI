from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.entities import Developer, User, Team, Skill, DeveloperSkill
from app.schemas.schemas import DeveloperCreate, DeveloperUpdate, DeveloperResponse, DeveloperCapacityUpdate
from app.routes.deps import get_current_user, require_role
from app.intelligence.workload import WorkloadEngine

router = APIRouter(prefix="/developers", tags=["Developers"])

def _serialize_developer(dev: Developer, db: Session) -> dict:
    skills = (
        db.query(DeveloperSkill, Skill)
        .join(Skill, DeveloperSkill.skill_id == Skill.id)
        .filter(DeveloperSkill.developer_id == dev.id)
        .all()
    )
    skill_list = [
        {
            "id": ds.id,
            "skill_id": ds.skill_id,
            "skill_name": sk.skill_name,
            "proficiency_level": ds.proficiency_level
        }
        for ds, sk in skills
    ]
    return {
        "id": dev.id,
        "user_id": dev.user_id,
        "name": dev.user.name if dev.user else f"Dev #{dev.id}",
        "email": dev.user.email if dev.user else "",
        "role": dev.user.role if dev.user else "developer",
        "team_id": dev.team_id,
        "team_name": dev.team.team_name if dev.team else None,
        "experience_level": dev.experience_level,
        "available_hours_per_week": float(dev.available_hours_per_week or 40.0),
        "active_status": dev.active_status,
        "skills": skill_list
    }

@router.get("", response_model=List[DeveloperResponse])
def get_developers(
    team_id: Optional[int] = None,
    search: Optional[str] = None,
    active_only: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Developer).join(User, Developer.user_id == User.id)
    if active_only:
        query = query.filter(Developer.active_status == True)
    if team_id:
        query = query.filter(Developer.team_id == team_id)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter((User.name.ilike(s)) | (User.email.ilike(s)))

    developers = query.all()
    return [_serialize_developer(d, db) for d in developers]

@router.post("", response_model=DeveloperResponse, status_code=status.HTTP_201_CREATED)
def create_developer(
    dev_in: DeveloperCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "project_manager"]))
):
    user = db.query(User).filter(User.id == dev_in.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    existing = db.query(Developer).filter(Developer.user_id == dev_in.user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Developer profile already exists for this user")

    dev = Developer(
        user_id=dev_in.user_id,
        team_id=dev_in.team_id,
        experience_level=dev_in.experience_level,
        available_hours_per_week=Decimal(str(dev_in.available_hours_per_week)),
        active_status=True
    )
    db.add(dev)
    db.flush()

    if dev_in.skills:
        for sk in dev_in.skills:
            ds = DeveloperSkill(
                developer_id=dev.id,
                skill_id=sk.skill_id,
                proficiency_level=sk.proficiency_level
            )
            db.add(ds)

    db.commit()
    db.refresh(dev)
    return _serialize_developer(dev, db)

@router.get("/{id}", response_model=DeveloperResponse)
def get_developer(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    dev = db.query(Developer).filter(Developer.id == id).first()
    if not dev:
        raise HTTPException(status_code=404, detail="Developer not found")
    return _serialize_developer(dev, db)

@router.put("/{id}", response_model=DeveloperResponse)
def update_developer(
    id: int,
    dev_in: DeveloperUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "project_manager"]))
):
    dev = db.query(Developer).filter(Developer.id == id).first()
    if not dev:
        raise HTTPException(status_code=404, detail="Developer not found")

    if dev_in.team_id is not None:
        dev.team_id = dev_in.team_id
    if dev_in.experience_level is not None:
        dev.experience_level = dev_in.experience_level
    if dev_in.available_hours_per_week is not None:
        dev.available_hours_per_week = Decimal(str(dev_in.available_hours_per_week))
    if dev_in.active_status is not None:
        dev.active_status = dev_in.active_status

    if dev_in.skills is not None:
        # Replace skills
        db.query(DeveloperSkill).filter(DeveloperSkill.developer_id == dev.id).delete()
        for sk in dev_in.skills:
            ds = DeveloperSkill(
                developer_id=dev.id,
                skill_id=sk.skill_id,
                proficiency_level=sk.proficiency_level
            )
            db.add(ds)

    db.commit()
    db.refresh(dev)
    return _serialize_developer(dev, db)

@router.patch("/{id}/capacity", response_model=DeveloperResponse)
def patch_developer_capacity(
    id: int,
    cap_in: DeveloperCapacityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "project_manager"]))
):
    dev = db.query(Developer).filter(Developer.id == id).first()
    if not dev:
        raise HTTPException(status_code=404, detail="Developer not found")
    dev.available_hours_per_week = Decimal(str(cap_in.available_hours_per_week))
    db.commit()
    db.refresh(dev)
    return _serialize_developer(dev, db)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_developer(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    dev = db.query(Developer).filter(Developer.id == id).first()
    if not dev:
        raise HTTPException(status_code=404, detail="Developer not found")
    # Soft delete
    dev.active_status = False
    db.commit()
    return None

@router.get("/{id}/workload")
def get_developer_workload(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    engine = WorkloadEngine(db)
    try:
        metrics = engine.calculate_developer_workload(id)
        return metrics
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
