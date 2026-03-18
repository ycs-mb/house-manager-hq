import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app


@pytest.mark.asyncio
async def test_create_and_list_tasks() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Create a task
        create_resp = await ac.post(
            "/api/tasks",
            json={"title": "Test task", "description": "A test task"},
        )
        assert create_resp.status_code == 201
        task = create_resp.json()
        assert task["title"] == "Test task"
        assert task["status"] == "pending"

        # List tasks
        list_resp = await ac.get("/api/tasks")
        assert list_resp.status_code == 200
        tasks = list_resp.json()
        assert any(t["id"] == task["id"] for t in tasks)


@pytest.mark.asyncio
async def test_get_task_not_found() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/tasks/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_task_status() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        create_resp = await ac.post(
            "/api/tasks",
            json={"title": "Status update task"},
        )
        task_id = create_resp.json()["id"]

        update_resp = await ac.patch(
            f"/api/tasks/{task_id}",
            params={"status": "in_progress"},
        )
        assert update_resp.status_code == 200
        assert update_resp.json()["status"] == "in_progress"
