import asyncio
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.db.models import Run, RunStatus, Task, TaskPriority, TaskStatus, User
from app.db.session import get_db

router = APIRouter()


class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    priority: TaskPriority = TaskPriority.medium
    github_repo: str | None = None


class TaskUpdate(BaseModel):
    status: TaskStatus | None = None
    priority: TaskPriority | None = None


class RunOut(BaseModel):
    id: str
    status: str
    github_pr_url: str | None
    output_log: str | None
    tokens_used: int | None
    created_at: str

    model_config = {"from_attributes": True}


class TaskOut(BaseModel):
    id: str
    title: str
    description: str | None
    status: str
    priority: str
    github_repo: str | None
    created_at: str
    updated_at: str
    latest_run: RunOut | None = None

    model_config = {"from_attributes": True}


def _task_to_out(task: Task) -> TaskOut:
    latest_run = None
    if task.runs:
        r = task.runs[0]
        latest_run = RunOut(
            id=str(r.id),
            status=r.status.value,
            github_pr_url=r.github_pr_url,
            output_log=r.output_log,
            tokens_used=r.tokens_used,
            created_at=r.created_at.isoformat(),
        )
    return TaskOut(
        id=str(task.id),
        title=task.title,
        description=task.description,
        status=task.status.value,
        priority=task.priority.value,
        github_repo=task.github_repo,
        created_at=task.created_at.isoformat(),
        updated_at=task.updated_at.isoformat(),
        latest_run=latest_run,
    )


@router.get("", response_model=list[TaskOut])
async def list_tasks(
    status: TaskStatus | None = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[TaskOut]:
    q = select(Task).options(selectinload(Task.runs))
    if status:
        q = q.where(Task.status == status)
    q = q.order_by(Task.created_at.desc())
    result = await db.execute(q)
    tasks = result.scalars().all()
    return [_task_to_out(t) for t in tasks]


@router.post("", response_model=TaskOut, status_code=201)
async def create_task(
    payload: TaskCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskOut:
    task = Task(
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        github_repo=payload.github_repo,
        created_by=current_user.id,
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)

    # Dispatch agent run
    run = Run(task_id=task.id)
    db.add(run)
    await db.commit()
    await db.refresh(run)

    # Kick off agent executor in background
    from app.services.agent_executor import execute_run

    background_tasks.add_task(execute_run, str(run.id), str(task.id))

    task.runs = [run]
    return _task_to_out(task)


@router.get("/{task_id}", response_model=TaskOut)
async def get_task(
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> TaskOut:
    result = await db.execute(
        select(Task).options(selectinload(Task.runs)).where(Task.id == task_id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return _task_to_out(task)


@router.patch("/{task_id}", response_model=TaskOut)
async def update_task(
    task_id: UUID,
    payload: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> TaskOut:
    result = await db.execute(
        select(Task).options(selectinload(Task.runs)).where(Task.id == task_id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if payload.status is not None:
        task.status = payload.status
    if payload.priority is not None:
        task.priority = payload.priority
    await db.commit()
    await db.refresh(task)
    return _task_to_out(task)
