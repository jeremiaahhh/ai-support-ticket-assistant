"""Pytest fixtures — fresh SQLite + TestClient per test."""

from __future__ import annotations

import os
from collections.abc import Iterator
from pathlib import Path

import pytest

os.environ.setdefault("USE_MOCK_AI", "true")
os.environ.setdefault("SEED_ON_STARTUP", "false")
os.environ.setdefault("DATABASE_URL", "sqlite:///./_pytest_default.db")

from fastapi.testclient import TestClient  # noqa: E402  (after env setup)
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402

from app.core.config import get_settings  # noqa: E402
from app.db import session as session_module  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.db.session import get_db  # noqa: E402
from app.main import create_app  # noqa: E402
from app.models import Ticket, TicketAnalysis  # noqa: F401, E402


@pytest.fixture
def db_url(tmp_path: Path) -> str:
    return f"sqlite:///{tmp_path / 'test.db'}"


@pytest.fixture
def engine_and_session(db_url: str):
    engine = create_engine(db_url, connect_args={"check_same_thread": False}, future=True)
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)
    yield engine, Session
    engine.dispose()


@pytest.fixture
def db(engine_and_session) -> Iterator:
    _, Session = engine_and_session
    session = Session()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(engine_and_session, monkeypatch) -> Iterator[TestClient]:
    engine, Session = engine_and_session

    # Swap the engine + SessionLocal that the app uses.
    monkeypatch.setattr(session_module, "engine", engine)
    monkeypatch.setattr(session_module, "SessionLocal", Session)

    # Force the cached settings to use SQLite for this test.
    get_settings.cache_clear()
    monkeypatch.setenv("DATABASE_URL", str(engine.url))
    monkeypatch.setenv("USE_MOCK_AI", "true")
    monkeypatch.setenv("SEED_ON_STARTUP", "false")

    app = create_app()

    def _override_db():
        s = Session()
        try:
            yield s
        finally:
            s.close()

    app.dependency_overrides[get_db] = _override_db

    with TestClient(app) as c:
        yield c
