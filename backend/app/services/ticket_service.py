"""Ticket business logic — create, list, update, delete."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.errors import NotFoundError
from app.models.ticket import Ticket, TicketCategory, TicketPriority, TicketStatus
from app.repositories.ticket_repository import TicketRepository
from app.schemas.ticket import TicketCreate, TicketUpdate


class TicketService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = TicketRepository(db)

    def create(self, payload: TicketCreate) -> Ticket:
        ticket = Ticket(
            subject=payload.subject.strip(),
            body=payload.body.strip(),
            customer_email=payload.customer_email,
            customer_name=payload.customer_name,
            priority=payload.priority or TicketPriority.MEDIUM,
            category=payload.category,
            status=TicketStatus.OPEN,
        )
        return self.repo.add(ticket)

    def get(self, ticket_id: str) -> Ticket:
        ticket = self.repo.get(ticket_id)
        if ticket is None:
            raise NotFoundError(f"Ticket {ticket_id} not found")
        return ticket

    def list(
        self,
        *,
        status: TicketStatus | None = None,
        priority: TicketPriority | None = None,
        category: TicketCategory | None = None,
        search: str | None = None,
        limit: int = 100,
        offset: int = 0,
    ):
        return self.repo.list(
            status=status,
            priority=priority,
            category=category,
            search=search,
            limit=limit,
            offset=offset,
        )

    def update(self, ticket_id: str, payload: TicketUpdate) -> Ticket:
        ticket = self.get(ticket_id)
        if payload.status is not None:
            ticket.status = payload.status
        if payload.priority is not None:
            ticket.priority = payload.priority
        if payload.category is not None:
            ticket.category = payload.category
        return self.repo.update(ticket)

    def delete(self, ticket_id: str) -> None:
        ticket = self.get(ticket_id)
        self.repo.delete(ticket)
