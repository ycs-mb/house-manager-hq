import hashlib
import hmac
import logging

from fastapi import APIRouter, Header, HTTPException, Request

from app.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)


def _verify_github_signature(payload: bytes, signature: str) -> bool:
    if not settings.github_webhook_secret:
        return True  # Skip verification if no secret configured
    mac = hmac.new(
        settings.github_webhook_secret.encode(), payload, hashlib.sha256
    )
    expected = "sha256=" + mac.hexdigest()
    return hmac.compare_digest(expected, signature)


@router.post("")
async def github_webhook(
    request: Request,
    x_github_event: str = Header(default=""),
    x_hub_signature_256: str = Header(default=""),
) -> dict:
    body = await request.body()

    if x_hub_signature_256 and not _verify_github_signature(body, x_hub_signature_256):
        raise HTTPException(status_code=403, detail="Invalid webhook signature")

    payload = await request.json()
    logger.info("GitHub webhook received: event=%s", x_github_event)

    if x_github_event == "check_suite":
        conclusion = payload.get("check_suite", {}).get("conclusion")
        pr_numbers = [
            pr.get("number") for pr in payload.get("check_suite", {}).get("pull_requests", [])
        ]
        logger.info("CI check_suite conclusion=%s for PRs %s", conclusion, pr_numbers)

    elif x_github_event == "pull_request":
        action = payload.get("action")
        pr = payload.get("pull_request", {})
        logger.info("PR %s: action=%s state=%s", pr.get("number"), action, pr.get("state"))

    return {"ok": True, "event": x_github_event}
