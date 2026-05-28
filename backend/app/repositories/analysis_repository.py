"""Analysis row DB access."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.ticket_analysis import TicketAnalysis


class AnalysisRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_for_ticket(self, ticket_id: str) -> TicketAnalysis | None:
        return self.db.execute(
            select(TicketAnalysis).where(TicketAnalysis.ticket_id == ticket_id)
        ).scalar_one_or_none()

    def upsert(self, analysis: TicketAnalysis) -> TicketAnalysis:
        existing = self.get_for_ticket(analysis.ticket_id)
        if existing is not None:
            existing.category = analysis.category
            existing.priority = analysis.priority
            existing.summary = analysis.summary
            existing.suggested_response = analysis.suggested_response
            existing.reasoning_short = analysis.reasoning_short
            existing.confidence_score = analysis.confidence_score
            existing.model_name = analysis.model_name
            existing.used_mock = analysis.used_mock
            self.db.add(existing)
            self.db.commit()
            self.db.refresh(existing)
            return existing

        self.db.add(analysis)
        self.db.commit()
        self.db.refresh(analysis)
        return analysis
