"""All ticket DB access lives here."""

from __future__ import annotations

from typing import Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.ticket import Ticket, TicketCategory, TicketPriority, TicketStatus


class TicketRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def add(self, ticket: Ticket) -> Ticket:
        self.db.add(ticket)
        self.db.commit()
        self.db.refresh(ticket)
        return ticket

    def get(self, ticket_id: str) -> Ticket | None:
        return (
            self.db.execute(
                select(Ticket)
                .options(joinedload(Ticket.analysis))
                .where(Ticket.id == ticket_id)
            )
            .unique()
            .scalar_one_or_none()
        )

    def list(
        self,
        *,
        status: TicketStatus | None = None,
        priority: TicketPriority | None = None,
        category: TicketCategory | None = None,
        search: str | None = None,
        limit: int = 100,
        offset: int = 0,
    ) -> tuple[Sequence[Ticket], int]:
        stmt = select(Ticket).options(joinedload(Ticket.analysis))
        if status is not None:
            stmt = stmt.where(Ticket.status == status)
        if priority is not None:
            stmt = stmt.where(Ticket.priority == priority)
        if category is not None:
            stmt = stmt.where(Ticket.category == category)
        if search:
            like = f"%{search.lower()}%"
            stmt = stmt.where(
                (Ticket.subject.ilike(like)) | (Ticket.body.ilike(like))
            )

        count_stmt = select(Ticket.id)
        if status is not None:
            count_stmt = count_stmt.where(Ticket.status == status)
        if priority is not None:
            count_stmt = count_stmt.where(Ticket.priority == priority)
        if category is not None:
            count_stmt = count_stmt.where(Ticket.category == category)
        if search:
            like = f"%{search.lower()}%"
            count_stmt = count_stmt.where(
                (Ticket.subject.ilike(like)) | (Ticket.body.ilike(like))
            )
        total = len(self.db.execute(count_stmt).scalars().all())

        stmt = stmt.order_by(Ticket.created_at.desc()).limit(limit).offset(offset)
        items = self.db.execute(stmt).unique().scalars().all()
        return items, total

    def update(self, ticket: Ticket) -> Ticket:
        self.db.add(ticket)
        self.db.commit()
        self.db.refresh(ticket)
        return ticket

    def delete(self, ticket: Ticket) -> None:
        self.db.delete(ticket)
        self.db.commit()
