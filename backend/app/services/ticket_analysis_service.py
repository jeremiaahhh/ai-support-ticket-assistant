"""Run an Analysis on a ticket and persist the result."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.errors import NotFoundError
from app.core.logging import logger
from app.models.ticket import Ticket
from app.models.ticket_analysis import TicketAnalysis
from app.repositories.analysis_repository import AnalysisRepository
from app.repositories.ticket_repository import TicketRepository
from app.services.llm_service import LLMService


class TicketAnalysisService:
    def __init__(self, db: Session, llm: LLMService | None = None) -> None:
        self.db = db
        self.tickets = TicketRepository(db)
        self.analyses = AnalysisRepository(db)
        self.llm = llm or LLMService()

    def analyze(self, ticket_id: str, *, force: bool = False) -> TicketAnalysis:
        ticket = self.tickets.get(ticket_id)
        if ticket is None:
            raise NotFoundError(f"Ticket {ticket_id} not found")

        if not force and ticket.analysis is not None:
            return ticket.analysis

        result = self.llm.analyze_ticket(
            subject=ticket.subject,
            body=ticket.body,
            customer_name=ticket.customer_name,
        )

        logger.info(
            "ticket_analyzed",
            ticket_id=ticket_id,
            category=result.category.value,
            priority=result.priority.value,
            used_mock=result.used_mock,
        )

        analysis = TicketAnalysis(
            ticket_id=ticket.id,
            category=result.category,
            priority=result.priority,
            summary=result.summary,
            suggested_response=result.suggested_response,
            reasoning_short=result.reasoning_short,
            confidence_score=result.confidence_score,
            model_name=result.model_name,
            used_mock=result.used_mock,
        )

        # Backfill ticket fields from the AI when the agent left them blank.
        self._sync_ticket(ticket, result.category, result.priority)

        return self.analyses.upsert(analysis)

    def _sync_ticket(self, ticket: Ticket, category, priority) -> None:
        changed = False
        if ticket.category is None:
            ticket.category = category
            changed = True
        # Always raise priority if AI thinks it's higher; never lower silently.
        order = {"low": 0, "medium": 1, "high": 2, "critical": 3}
        if order[priority.value] > order[ticket.priority.value]:
            ticket.priority = priority
            changed = True
        if changed:
            self.tickets.update(ticket)
