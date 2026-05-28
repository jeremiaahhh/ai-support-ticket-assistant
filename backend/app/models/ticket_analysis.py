"""Ticket AI analysis ORM model."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, Float, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.ticket import Ticket, TicketCategory, TicketPriority


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class TicketAnalysis(Base):
    __tablename__ = "ticket_analyses"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    ticket_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("tickets.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )

    category: Mapped[TicketCategory] = mapped_column(
        Enum(TicketCategory, native_enum=False, length=32), nullable=False
    )
    priority: Mapped[TicketPriority] = mapped_column(
        Enum(TicketPriority, native_enum=False, length=16), nullable=False
    )
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    suggested_response: Mapped[str] = mapped_column(Text, nullable=False)
    reasoning_short: Mapped[str] = mapped_column(Text, nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False)
    model_name: Mapped[str] = mapped_column(String(64), nullable=False, default="mock")
    used_mock: Mapped[bool] = mapped_column(default=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, server_default=func.now()
    )

    ticket: Mapped[Ticket] = relationship("Ticket", back_populates="analysis")
