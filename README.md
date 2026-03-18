# Agentic Platform

> AI-native software execution platform — give your 5-person team the output of 20.

## Stack

| Layer | Technology |
|---|---|
| Backend API | Python 3.11 + FastAPI |
| Frontend | TypeScript + React 18 + Vite |
| Database | PostgreSQL 16 |
| Container | Docker + docker-compose |
| CI/CD | GitHub Actions |
| Testing | pytest (backend), vitest (frontend) |
| Linting | ruff + mypy (backend), ESLint + tsc (frontend) |

## Getting Started

### Prerequisites

- [uv](https://docs.astral.sh/uv/) (Python package manager)
- Node 22+
- Docker + Docker Compose

### Local Development

```bash
# Backend
cd backend
uv sync
uv run uvicorn app.main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

API: http://localhost:8000/docs
Web: http://localhost:5173

### With Docker

```bash
cp .env.example .env  # configure secrets
docker compose up --build
```

Web: http://localhost
API: http://localhost:8000

### Tests

```bash
# Backend
cd backend && uv run pytest

# Frontend
cd frontend && npm test
```

### Lint

```bash
# Backend
cd backend && uv run ruff check . && uv run mypy app/

# Frontend
cd frontend && npm run lint && npm run typecheck
```

## Project Structure

```
├── backend/          # FastAPI application
│   ├── app/
│   │   ├── api/routes/  # Route handlers
│   │   ├── config.py    # Settings (env-driven)
│   │   └── main.py      # App entrypoint
│   └── tests/
├── frontend/         # React + Vite SPA
│   ├── src/
│   │   ├── api/         # API client functions
│   │   ├── components/  # Reusable UI components
│   │   └── pages/       # Page-level components
│   └── index.html
├── .github/workflows/   # CI/CD pipelines
└── docker-compose.yml
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | (local postgres) | PostgreSQL connection URL |
| `SECRET_KEY` | `change-me` | JWT signing key (change in prod!) |
| `CORS_ORIGINS` | `["http://localhost:5173"]` | Allowed CORS origins |
| `DEBUG` | `false` | Enable debug mode |
