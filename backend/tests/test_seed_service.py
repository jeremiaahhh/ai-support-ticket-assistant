"""Seed service tests."""

from __future__ import annotations

from app.repositories.ticket_repository import TicketRepository
from app.services.seed_service import seed_demo_data


def test_seed_creates_demo_tickets_once(db) -> None:
    added = seed_demo_data(db)
    assert added > 0

    again = seed_demo_data(db)
    assert again == 0

    repo = TicketRepository(db)
    items, total = repo.list(limit=100)
    assert total == added
    # every seeded ticket should be analyzed
    assert all(t.analysis is not None for t in items)
