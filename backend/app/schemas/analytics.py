"""Pydantic schemas for analytics endpoints."""

from __future__ import annotations

from pydantic import BaseModel

from app.models.ticket import TicketCategory, TicketPriority, TicketStatus


class CategoryBreakdown(BaseModel):
    category: TicketCategory
    count: int


class PriorityBreakdown(BaseModel):
    priority: TicketPriority
    count: int


class StatusBreakdown(BaseModel):
    status: TicketStatus
    count: int


class AnalyticsSummary(BaseModel):
    total_tickets: int
    critical_tickets: int
    resolved_tickets: int
    open_tickets: int
    in_progress_tickets: int
    analyzed_tickets: int
    average_confidence: float
    categories: list[CategoryBreakdown]
    priorities: list[PriorityBreakdown]
    statuses: list[StatusBreakdown]
