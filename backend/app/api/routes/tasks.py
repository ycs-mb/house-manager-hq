from uuid import UUID, uuid4
from datetime import datetime, UTC
from enum import Enum

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class TaskStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    in_review = "in_review"
    done = "done"


class TaskCreate(BaseModel):
    title: str
    description: str | None = None


class Task(BaseModel):
    id: UUID
    title: str
    description: str | None
    status: TaskStatus
    created_at: datetime
    updated_at: datetime


# In-memory store for MVP (replace with DB in v0.2)
_tasks: dict[UUID, Task] = {}


@router.get("", response_model=list[Task])
async def list_tasks() -> list[Task]:
    return list(_tasks.values())


@router.post("", response_model=Task, status_code=201)
async def create_task(payload: TaskCreate) -> Task:
    now = datetime.now(UTC)
    task = Task(
        id=uuid4(),
        title=payload.title,
        description=payload.description,
        status=TaskStatus.pending,
        created_at=now,
        updated_at=now,
    )
    _tasks[task.id] = task
    return task


@router.get("/{task_id}", response_model=Task)
async def get_task(task_id: UUID) -> Task:
    task = _tasks.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/{task_id}", response_model=Task)
async def update_task_status(task_id: UUID, status: TaskStatus) -> Task:
    task = _tasks.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    _tasks[task_id] = task.model_copy(
        update={"status": status, "updated_at": datetime.now(UTC)}
    )
    return _tasks[task_id]
