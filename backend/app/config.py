from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True)

    app_name: str = "Agentic Platform API"
    app_version: str = "0.1.0"
    debug: bool = False

    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/agentic_platform"
    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:80", "http://localhost"]

    # AI + GitHub integrations
    anthropic_api_key: str | None = None
    github_pat: str | None = None
    github_target_repo: str | None = None  # default owner/repo for agent runs
    github_webhook_secret: str | None = None

    # Seed admin user (created on startup if not exists)
    admin_email: str = "admin@agentic.local"
    admin_password: str = "changeme"
    admin_name: str = "Admin"


settings = Settings()
