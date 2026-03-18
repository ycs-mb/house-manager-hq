import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import approvals, auth, health, runs, tasks, webhooks
from app.config import settings

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/health", tags=["health"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(runs.router, prefix="/api/runs", tags=["runs"])
app.include_router(approvals.router, prefix="/api/approvals", tags=["approvals"])
app.include_router(webhooks.router, prefix="/api/webhooks/github", tags=["webhooks"])


@app.on_event("startup")
async def on_startup() -> None:
    """Run DB migrations and seed admin user on startup."""
    try:
        from alembic import command
        from alembic.config import Config as AlembicConfig

        alembic_cfg = AlembicConfig("alembic.ini")
        alembic_cfg.set_main_option("sqlalchemy.url", settings.database_url)
        command.upgrade(alembic_cfg, "head")
        logger.info("Database migrations applied.")
    except Exception as e:
        logger.warning("Alembic migration failed (may be expected in tests): %s", e)

    await _seed_admin()


async def _seed_admin() -> None:
    """Create default admin user if it doesn't exist."""
    try:
        from sqlalchemy import select

        from app.db.models import User, UserRole
        from app.db.session import AsyncSessionLocal
        from app.services.auth import hash_password

        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(User).where(User.email == settings.admin_email)
            )
            if not result.scalar_one_or_none():
                admin = User(
                    email=settings.admin_email,
                    name=settings.admin_name,
                    password_hash=hash_password(settings.admin_password),
                    role=UserRole.admin,
                )
                db.add(admin)
                await db.commit()
                logger.info("Seeded admin user: %s", settings.admin_email)
    except Exception as e:
        logger.warning("Admin seed failed (may be expected in tests): %s", e)
