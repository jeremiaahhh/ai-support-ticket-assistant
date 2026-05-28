"""FastAPI app factory."""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import analytics, health, tickets
from app.core.config import get_settings
from app.core.errors import register_error_handlers
from app.core.logging import configure_logging, logger
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models import Ticket, TicketAnalysis  # noqa: F401  ensure metadata is registered
from app.services.seed_service import seed_demo_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging()
    Base.metadata.create_all(bind=engine)
    settings = get_settings()
    logger.info(
        "app_startup",
        mock_mode=settings.effective_mock_mode,
        ai_provider=settings.ai_provider,
    )
    if settings.seed_on_startup:
        db = SessionLocal()
        try:
            added = seed_demo_data(db)
            if added:
                logger.info("demo_seed_loaded", count=added)
        finally:
            db.close()
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="Support Ticket Triage",
        description=(
            "An AI system that classifies support tickets, detects urgency, summarizes the "
            "issue, and suggests a professional customer response."
        ),
        version="1.0.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list or ["*"],
        allow_methods=["*"],
        allow_headers=["*"],
        allow_credentials=True,
    )

    register_error_handlers(app)

    app.include_router(health.router)
    app.include_router(tickets.router)
    app.include_router(analytics.router)
    return app


app = create_app()
