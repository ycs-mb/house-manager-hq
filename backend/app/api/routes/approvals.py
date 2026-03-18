from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.models import Approval, ApprovalStatus, Task, TaskStatus, User
from app.db.session import get_db

router = APIRouter()


class ApprovalDecision(BaseModel):
    decision: str  # "approved" or "rejected"
    comment: str | None = None


class ApprovalOut(BaseModel):
    id: str
    run_id: str
    task_id: str
    status: str
    comment: str | None
    decided_at: str | None
    created_at: str
    task_title: str | None = None


@router.get("", response_model=list[ApprovalOut])
async def list_approvals(
    status: str | None = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[ApprovalOut]:
    q = select(Approval)
    if status:
        try:
            q = q.where(Approval.status == ApprovalStatus(status))
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid status: {status}")
    q = q.order_by(Approval.created_at.desc())
    result = await db.execute(q)
    approvals = result.scalars().all()

    out = []
    for a in approvals:
        task_result = await db.execute(select(Task).where(Task.id == a.task_id))
        task = task_result.scalar_one_or_none()
        out.append(
            ApprovalOut(
                id=str(a.id),
                run_id=str(a.run_id),
                task_id=str(a.task_id),
                status=a.status.value,
                comment=a.comment,
                decided_at=a.decided_at.isoformat() if a.decided_at else None,
                created_at=a.created_at.isoformat(),
                task_title=task.title if task else None,
            )
        )
    return out


@router.post("/{approval_id}/decide", response_model=ApprovalOut)
async def decide_approval(
    approval_id: UUID,
    payload: ApprovalDecision,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ApprovalOut:
    result = await db.execute(select(Approval).where(Approval.id == approval_id))
    approval = result.scalar_one_or_none()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    if approval.status != ApprovalStatus.pending:
        raise HTTPException(status_code=400, detail="Approval already decided")
    if payload.decision not in ("approved", "rejected"):
        raise HTTPException(status_code=400, detail="Decision must be 'approved' or 'rejected'")

    approval.status = ApprovalStatus(payload.decision)
    approval.reviewer_id = current_user.id
    approval.comment = payload.comment
    approval.decided_at = datetime.now(UTC)

    # Update task status accordingly
    task_result = await db.execute(select(Task).where(Task.id == approval.task_id))
    task = task_result.scalar_one_or_none()
    if task:
        task.status = TaskStatus.done if payload.decision == "approved" else TaskStatus.failed

    await db.commit()
    await db.refresh(approval)

    return ApprovalOut(
        id=str(approval.id),
        run_id=str(approval.run_id),
        task_id=str(approval.task_id),
        status=approval.status.value,
        comment=approval.comment,
        decided_at=approval.decided_at.isoformat() if approval.decided_at else None,
        created_at=approval.created_at.isoformat(),
        task_title=task.title if task else None,
    )
