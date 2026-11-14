from typing import List, Optional
from decimal import Decimal
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.entities import TimeLog, Task, Developer, User
from app.schemas.schemas import TimeLogCreate, TimeLogResponse
from app.routes.deps import get_current_user

router = APIRouter(prefix="/time-logs", tags=["Time Logs"])

@router.get("", response_model=List[TimeLogResponse])
def get_time_logs(
    task_id: Optional[int] = None,
    developer_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = (
        db.query(TimeLog, Task, Developer, User)
        .join(Task, TimeLog.task_id == Task.id)
        .join(Developer, TimeLog.developer_id == Developer.id)
        .join(User, Developer.user_id == User.id)
    )

    if task_id:
        query = query.filter(TimeLog.task_id == task_id)
    if developer_id:
        query = query.filter(TimeLog.developer_id == developer_id)
    elif current_user.role == "developer":
        # Developers only see their own logs by default
        dev = db.query(Developer).filter(Developer.user_id == current_user.id).first()
        if dev:
            query = query.filter(TimeLog.developer_id == dev.id)

    logs = query.order_by(TimeLog.log_date.desc(), TimeLog.id.desc()).all()
    return [
        {
            "id": tl.id,
            "task_id": tl.task_id,
            "task_name": t.task_name,
            "developer_id": tl.developer_id,
            "developer_name": u.name,
            "hours_spent": float(tl.hours_spent),
            "log_date": tl.log_date,
            "description": tl.description
        }
        for tl, t, d, u in logs
    ]

@router.post("", response_model=TimeLogResponse, status_code=status.HTTP_201_CREATED)
def create_time_log(
    log_in: TimeLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == log_in.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    dev_id = log_in.developer_id
    if not dev_id:
        dev = db.query(Developer).filter(Developer.user_id == current_user.id).first()
        if not dev:
            raise HTTPException(status_code=400, detail="Current user is not associated with a developer profile")
        dev_id = dev.id
    else:
        dev = db.query(Developer).filter(Developer.id == dev_id).first()
        if not dev:
            raise HTTPException(status_code=404, detail="Developer not found")

    time_log = TimeLog(
        task_id=task.id,
        developer_id=dev_id,
        hours_spent=Decimal(str(log_in.hours_spent)),
        log_date=log_in.log_date or date.today(),
        description=log_in.description
    )
    db.add(time_log)
    db.commit()
    db.refresh(time_log)

    return {
        "id": time_log.id,
        "task_id": time_log.task_id,
        "task_name": task.task_name,
        "developer_id": dev.id,
        "developer_name": dev.user.name,
        "hours_spent": float(time_log.hours_spent),
        "log_date": time_log.log_date,
        "description": time_log.description
    }
