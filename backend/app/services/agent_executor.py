"""
Agent Executor — core of the agentic platform.

Flow:
  1. Load task from DB
  2. Clone target GitHub repo into a temp directory
  3. Send task to Claude API with repo context (file tree + key files)
  4. Apply LLM-generated code changes (file writes from tool_use)
  5. Run tests (pytest / npm test)
  6. Open GitHub PR
  7. Create Approval record and update task to in_review
"""

import logging
import os
import subprocess
import tempfile
from datetime import UTC, datetime
from pathlib import Path
from uuid import UUID

import anthropic

from app.config import settings
from app.db.models import Approval, ApprovalStatus, Run, RunStatus, Task, TaskStatus
from app.db.session import AsyncSessionLocal

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _run_cmd(cmd: list[str], cwd: str, timeout: int = 120) -> tuple[int, str]:
    """Run a subprocess command and return (returncode, combined_output)."""
    try:
        result = subprocess.run(
            cmd,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        output = result.stdout + result.stderr
        return result.returncode, output
    except subprocess.TimeoutExpired:
        return 1, f"Command timed out after {timeout}s: {' '.join(cmd)}"
    except Exception as e:
        return 1, f"Command failed: {e}"


def _get_repo_context(repo_dir: str, max_files: int = 30) -> str:
    """Build a compact repo context string for the LLM prompt."""
    lines = ["## Repository Structure\n```"]
    root = Path(repo_dir)

    ignore_dirs = {".git", "node_modules", "__pycache__", ".venv", "dist", "build", ".next"}
    ignore_exts = {".pyc", ".lock", ".png", ".jpg", ".ico", ".woff", ".ttf"}

    file_count = 0
    for path in sorted(root.rglob("*")):
        if path.is_dir():
            continue
        rel = path.relative_to(root)
        parts = rel.parts
        if any(p in ignore_dirs for p in parts):
            continue
        if path.suffix in ignore_exts:
            continue
        lines.append(str(rel))
        file_count += 1
        if file_count >= max_files:
            lines.append("... (truncated)")
            break

    lines.append("```\n")

    # Include content of small key files
    key_patterns = ["README*", "pyproject.toml", "package.json", "*.md", "main.py", "app.py"]
    included = set()
    for pattern in key_patterns:
        for path in sorted(root.glob(pattern)):
            if path.is_file() and str(path) not in included:
                try:
                    content = path.read_text(encoding="utf-8", errors="ignore")[:2000]
                    lines.append(f"## {path.relative_to(root)}\n```\n{content}\n```\n")
                    included.add(str(path))
                except Exception:
                    pass

    return "\n".join(lines)


def _apply_tool_result(tool_use: dict, repo_dir: str) -> str:
    """Apply a tool_use block from Claude to the repo. Returns log line."""
    name = tool_use.get("name", "")
    inp = tool_use.get("input", {})

    if name == "write_file":
        file_path = os.path.join(repo_dir, inp["path"].lstrip("/"))
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        Path(file_path).write_text(inp["content"], encoding="utf-8")
        return f"  [write_file] {inp['path']}"

    if name == "bash":
        rc, out = _run_cmd(["bash", "-c", inp["command"]], cwd=repo_dir, timeout=60)
        return f"  [bash] $ {inp['command']}\n{out[:500]}"

    if name == "read_file":
        file_path = os.path.join(repo_dir, inp["path"].lstrip("/"))
        try:
            return Path(file_path).read_text(encoding="utf-8", errors="ignore")[:2000]
        except Exception as e:
            return f"  [read_file] Error: {e}"

    return f"  [unknown_tool] {name}"


# ---------------------------------------------------------------------------
# Main executor
# ---------------------------------------------------------------------------

async def execute_run(run_id: str, task_id: str) -> None:
    """Async entry point — runs as a FastAPI BackgroundTask."""
    async with AsyncSessionLocal() as db:
        from sqlalchemy import select

        run_result = await db.execute(select(Run).where(Run.id == UUID(run_id)))
        run = run_result.scalar_one_or_none()
        task_result = await db.execute(select(Task).where(Task.id == UUID(task_id)))
        task = task_result.scalar_one_or_none()

        if not run or not task:
            logger.error("execute_run: missing run or task (run=%s task=%s)", run_id, task_id)
            return

        run.status = RunStatus.running
        run.started_at = datetime.now(UTC)
        task.status = TaskStatus.in_progress
        await db.commit()

        log_lines: list[str] = []

        def log(msg: str) -> None:
            logger.info(msg)
            log_lines.append(msg)

        try:
            await _do_execute(run, task, log, db)
        except Exception as e:
            log(f"\n[ERROR] {e}")
            run.status = RunStatus.failed
            run.error_message = str(e)
            run.completed_at = datetime.now(UTC)
            task.status = TaskStatus.failed
            await db.commit()
        finally:
            run.output_log = "\n".join(log_lines)
            await db.commit()


async def _do_execute(
    run: Run,
    task: Task,
    log,
    db,
) -> None:
    log(f"[START] Task: {task.title}")
    log(f"[RUN ID] {run.id}")

    # Determine target repo
    github_repo = task.github_repo or settings.github_target_repo
    if not github_repo:
        log("[SKIP] No GitHub repo configured — generating code diff only")
        github_repo = None

    with tempfile.TemporaryDirectory(prefix="agentic_run_") as tmpdir:
        repo_dir = tmpdir

        # Clone repo if available
        if github_repo and settings.github_pat:
            log(f"\n[CLONE] {github_repo}")
            clone_url = f"https://{settings.github_pat}@github.com/{github_repo}.git"
            rc, out = _run_cmd(["git", "clone", clone_url, tmpdir], cwd="/tmp", timeout=120)
            if rc != 0:
                raise RuntimeError(f"Git clone failed:\n{out}")
            log(out[:500])

            # Create feature branch
            branch_name = f"agent/run-{str(run.id)[:8]}"
            log(f"\n[BRANCH] Creating {branch_name}")
            _run_cmd(["git", "checkout", "-b", branch_name], cwd=tmpdir)
        else:
            log("[INFO] No repo configured or no GitHub PAT — working in temp directory")

        # Build repo context for LLM
        log("\n[CONTEXT] Analyzing repository...")
        repo_context = _get_repo_context(repo_dir)

        # Prepare Claude API call
        if not settings.anthropic_api_key:
            log("[DEMO] No ANTHROPIC_API_KEY — generating placeholder diff")
            _write_demo_output(run, task, repo_dir, log)
            return

        log("\n[CLAUDE] Sending task to Claude claude-sonnet-4-6...")
        client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

        tools = [
            {
                "name": "write_file",
                "description": "Write content to a file in the repository",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "path": {"type": "string", "description": "Relative file path"},
                        "content": {"type": "string", "description": "File content"},
                    },
                    "required": ["path", "content"],
                },
            },
            {
                "name": "read_file",
                "description": "Read a file from the repository",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "path": {"type": "string", "description": "Relative file path"},
                    },
                    "required": ["path"],
                },
            },
            {
                "name": "bash",
                "description": "Run a bash command in the repository root",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "command": {"type": "string", "description": "Shell command to run"},
                    },
                    "required": ["command"],
                },
            },
        ]

        system_prompt = (
            "You are an expert software engineer. Your job is to implement the requested task "
            "in the given repository. Use the available tools to read existing code, write new "
            "files, and run commands. Be thorough but focused — only change what is needed for "
            "the task. Always run tests after making changes."
        )

        user_message = (
            f"## Task\n\n**{task.title}**\n\n"
            f"{task.description or ''}\n\n"
            f"{repo_context}\n\n"
            "Please implement this task. Use write_file to make code changes, "
            "bash to run tests, and ensure all tests pass before finishing."
        )

        messages = [{"role": "user", "content": user_message}]
        all_messages = []
        total_tokens = 0
        max_turns = 10

        for turn in range(max_turns):
            log(f"\n[CLAUDE] Turn {turn + 1}...")
            response = client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=4096,
                system=system_prompt,
                tools=tools,
                messages=messages,
            )
            total_tokens += response.usage.input_tokens + response.usage.output_tokens
            all_messages.append({"role": "assistant", "content": response.content})

            # Process response content blocks
            tool_results = []
            for block in response.content:
                if block.type == "text":
                    log(f"\n[CLAUDE] {block.text[:500]}")
                elif block.type == "tool_use":
                    log(f"\n[TOOL] {block.name}({list(block.input.keys())})")
                    result = _apply_tool_result({"name": block.name, "input": block.input}, repo_dir)
                    log(result[:300])
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result,
                    })

            if response.stop_reason == "end_turn":
                log("\n[CLAUDE] Finished implementation.")
                break

            if tool_results:
                messages.append({"role": "assistant", "content": response.content})
                messages.append({"role": "user", "content": tool_results})
            else:
                break

        run.llm_messages = [
            {"role": m["role"], "content": str(m["content"])[:500]} for m in all_messages
        ]
        run.tokens_used = total_tokens
        log(f"\n[TOKENS] Total tokens used: {total_tokens}")

        # Open GitHub PR
        pr_url = None
        if github_repo and settings.github_pat:
            pr_url = await _open_github_pr(
                github_repo=github_repo,
                branch_name=branch_name,  # type: ignore[possibly-undefined]
                task=task,
                repo_dir=repo_dir,
                log=log,
            )

        # Update run and create approval
        run.status = RunStatus.completed
        run.github_pr_url = pr_url
        run.completed_at = datetime.now(UTC)
        task.status = TaskStatus.in_review

        approval = Approval(
            run_id=run.id,
            task_id=task.id,
            status=ApprovalStatus.pending,
        )
        db.add(approval)
        await db.commit()
        log(f"\n[DONE] Run completed. PR: {pr_url or 'N/A'}")


def _write_demo_output(run: Run, task: Task, repo_dir: str, log) -> None:
    """Write a placeholder when no API key is configured."""
    log("\n[DEMO] Generating placeholder implementation...")
    demo_file = Path(repo_dir) / "demo_output.txt"
    demo_file.write_text(
        f"Task: {task.title}\nDescription: {task.description or 'N/A'}\n"
        "Status: Demo mode (no ANTHROPIC_API_KEY configured)\n"
    )
    log("[DEMO] Wrote demo_output.txt")
    run.status = RunStatus.completed
    run.completed_at = datetime.now(UTC)


async def _open_github_pr(
    github_repo: str,
    branch_name: str,
    task: Task,
    repo_dir: str,
    log,
) -> str | None:
    try:
        from github import Github

        # Stage and commit changes
        rc, out = _run_cmd(["git", "add", "-A"], cwd=repo_dir)
        log(f"[GIT] add: {out[:200]}")

        # Check if there's anything to commit
        rc, status_out = _run_cmd(["git", "status", "--porcelain"], cwd=repo_dir)
        if not status_out.strip():
            log("[GIT] No changes to commit")
            return None

        commit_msg = f"feat: {task.title}\n\nCo-Authored-By: Paperclip <noreply@paperclip.ing>"
        rc, out = _run_cmd(
            ["git", "commit", "-m", commit_msg,
             "--author", "Agentic Platform <agent@agentic.platform>"],
            cwd=repo_dir,
        )
        log(f"[GIT] commit: {out[:300]}")
        if rc != 0:
            log("[GIT] Commit failed — skipping PR creation")
            return None

        rc, out = _run_cmd(["git", "push", "-u", "origin", branch_name], cwd=repo_dir)
        log(f"[GIT] push: {out[:300]}")
        if rc != 0:
            log("[GIT] Push failed — skipping PR creation")
            return None

        g = Github(settings.github_pat)
        repo = g.get_repo(github_repo)
        pr = repo.create_pull(
            title=task.title,
            body=(
                f"## Summary\n\n{task.description or task.title}\n\n"
                f"---\n*Opened automatically by the Agentic Platform.*"
            ),
            head=branch_name,
            base=repo.default_branch,
        )
        log(f"[PR] Created: {pr.html_url}")
        return pr.html_url

    except Exception as e:
        log(f"[PR] Failed to create PR: {e}")
        return None
