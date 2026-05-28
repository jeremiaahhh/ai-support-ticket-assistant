"""Health probe."""

from __future__ import annotations

from fastapi import APIRouter

from app.core.config import get_settings

router = APIRouter(tags=["health"])


@router.get("/health", summary="Liveness probe")
def health() -> dict:
    settings = get_settings()
    return {
        "status": "ok",
        "ai_provider": settings.ai_provider,
        "mock_mode": settings.effective_mock_mode,
    }
