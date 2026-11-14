from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.entities import Team, Developer, User
from app.schemas.schemas import TeamCreate, TeamUpdate, TeamResponse
from app.routes.deps import get_current_user, require_role

router = APIRouter(prefix="/teams", tags=["Teams"])

@router.get("", response_model=List[TeamResponse])
def get_teams(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    teams = db.query(Team).all()
    results = []
    for t in teams:
        member_count = db.query(func.count(Developer.id)).filter(Developer.team_id == t.id).scalar() or 0
        results.append({
            "id": t.id,
            "team_name": t.team_name,
            "description": t.description,
            "created_at": t.created_at,
            "member_count": member_count
        })
    return results

@router.post("", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
def create_team(
    team_in: TeamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "project_manager"]))
):
    existing = db.query(Team).filter(Team.team_name == team_in.team_name.strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Team name already exists")
    team = Team(team_name=team_in.team_name.strip(), description=team_in.description)
    db.add(team)
    db.commit()
    db.refresh(team)
    return {
        "id": team.id,
        "team_name": team.team_name,
        "description": team.description,
        "created_at": team.created_at,
        "member_count": 0
    }

@router.get("/{id}", response_model=TeamResponse)
def get_team(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    team = db.query(Team).filter(Team.id == id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    member_count = db.query(func.count(Developer.id)).filter(Developer.team_id == team.id).scalar() or 0
    return {
        "id": team.id,
        "team_name": team.team_name,
        "description": team.description,
        "created_at": team.created_at,
        "member_count": member_count
    }

@router.put("/{id}", response_model=TeamResponse)
def update_team(
    id: int,
    team_in: TeamUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "project_manager"]))
):
    team = db.query(Team).filter(Team.id == id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    if team_in.team_name is not None:
        team.team_name = team_in.team_name.strip()
    if team_in.description is not None:
        team.description = team_in.description
    db.commit()
    db.refresh(team)
    member_count = db.query(func.count(Developer.id)).filter(Developer.team_id == team.id).scalar() or 0
    return {
        "id": team.id,
        "team_name": team.team_name,
        "description": team.description,
        "created_at": team.created_at,
        "member_count": member_count
    }

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    team = db.query(Team).filter(Team.id == id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    db.delete(team)
    db.commit()
    return None
