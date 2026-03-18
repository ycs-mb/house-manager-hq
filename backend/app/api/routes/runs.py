import asyncio
import json
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.models import Run, User
from app.db.session import get_db

router = APIRouter()


class RunOut:
    pass


@router.get("/{run_id}")
async def get_run(
    run_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> dict:
    result = await db.execute(select(Run).where(Run.id == run_id))
    run = result.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return {
        "id": str(run.id),
        "task_id": str(run.task_id),
        "status": run.status.value,
        "llm_messages": run.llm_messages,
        "output_log": run.output_log,
        "github_pr_url": run.github_pr_url,
        "tokens_used": run.tokens_used,
        "error_message": run.error_message,
        "started_at": run.started_at.isoformat() if run.started_at else None,
        "completed_at": run.completed_at.isoformat() if run.completed_at else None,
        "created_at": run.created_at.isoformat(),
    }


@router.get("/{run_id}/stream")
async def stream_run(
    run_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> StreamingResponse:
    result = await db.execute(select(Run).where(Run.id == run_id))
    run = result.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    async def event_generator():
        # Stream existing output first
        if run.output_log:
            for line in run.output_log.splitlines():
                yield f"data: {json.dumps({'type': 'output', 'line': line})}\n\n"
                await asyncio.sleep(0)

        # If still running, poll for updates
        last_len = len(run.output_log or "")
        for _ in range(60):  # max 60 polls
            await asyncio.sleep(2)
            async with db.begin():
                await db.refresh(run)
            current_log = run.output_log or ""
            if len(current_log) > last_len:
                new_content = current_log[last_len:]
                for line in new_content.splitlines():
                    yield f"data: {json.dumps({'type': 'output', 'line': line})}\n\n"
                last_len = len(current_log)
            if run.status.value in ("completed", "failed"):
                break

        yield f"data: {json.dumps({'type': 'done', 'status': run.status.value, 'pr_url': run.github_pr_url})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
