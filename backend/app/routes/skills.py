from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.entities import Skill, User
from app.schemas.schemas import SkillCreate, SkillResponse
from app.routes.deps import get_current_user, require_role

router = APIRouter(prefix="/skills", tags=["Skills"])

@router.get("", response_model=List[SkillResponse])
def get_skills(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Skill).order_by(Skill.skill_name.asc()).all()

@router.post("", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
def create_skill(
    skill_in: SkillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "project_manager"]))
):
    existing = db.query(Skill).filter(Skill.skill_name.ilike(skill_in.skill_name.strip())).first()
    if existing:
        raise HTTPException(status_code=400, detail="Skill already exists")
    skill = Skill(skill_name=skill_in.skill_name.strip(), description=skill_in.description)
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_skill(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    skill = db.query(Skill).filter(Skill.id == id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    db.delete(skill)
    db.commit()
    return None
