"""Aggregate dashboards for the KPI bar."""

from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.ticket import Ticket, TicketCategory, TicketPriority, TicketStatus
from app.models.ticket_analysis import TicketAnalysis
from app.schemas.analytics import (
    AnalyticsSummary,
    CategoryBreakdown,
    PriorityBreakdown,
    StatusBreakdown,
)


class AnalyticsService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def summary(self) -> AnalyticsSummary:
        total = self.db.execute(select(func.count(Ticket.id))).scalar_one() or 0
        critical = (
            self.db.execute(
                select(func.count(Ticket.id)).where(Ticket.priority == TicketPriority.CRITICAL)
            ).scalar_one()
            or 0
        )
        resolved = (
            self.db.execute(
                select(func.count(Ticket.id)).where(Ticket.status == TicketStatus.RESOLVED)
            ).scalar_one()
            or 0
        )
        open_ = (
            self.db.execute(
                select(func.count(Ticket.id)).where(Ticket.status == TicketStatus.OPEN)
            ).scalar_one()
            or 0
        )
        in_progress = (
            self.db.execute(
                select(func.count(Ticket.id)).where(Ticket.status == TicketStatus.IN_PROGRESS)
            ).scalar_one()
            or 0
        )
        analyzed = (
            self.db.execute(select(func.count(TicketAnalysis.id))).scalar_one() or 0
        )
        avg_conf = (
            self.db.execute(select(func.avg(TicketAnalysis.confidence_score))).scalar() or 0.0
        )

        category_rows = self.db.execute(
            select(Ticket.category, func.count(Ticket.id)).group_by(Ticket.category)
        ).all()
        priority_rows = self.db.execute(
            select(Ticket.priority, func.count(Ticket.id)).group_by(Ticket.priority)
        ).all()
        status_rows = self.db.execute(
            select(Ticket.status, func.count(Ticket.id)).group_by(Ticket.status)
        ).all()

        categories = [
            CategoryBreakdown(category=cat, count=count)
            for cat, count in category_rows
            if cat is not None
        ]
        for cat in TicketCategory:
            if not any(c.category == cat for c in categories):
                categories.append(CategoryBreakdown(category=cat, count=0))
        categories.sort(key=lambda c: c.count, reverse=True)

        priorities = [PriorityBreakdown(priority=p, count=c) for p, c in priority_rows]
        for prio in TicketPriority:
            if not any(p.priority == prio for p in priorities):
                priorities.append(PriorityBreakdown(priority=prio, count=0))
        priority_order = {p: i for i, p in enumerate(
            [TicketPriority.CRITICAL, TicketPriority.HIGH, TicketPriority.MEDIUM, TicketPriority.LOW]
        )}
        priorities.sort(key=lambda p: priority_order[p.priority])

        statuses = [StatusBreakdown(status=s, count=c) for s, c in status_rows]
        for st in TicketStatus:
            if not any(s.status == st for s in statuses):
                statuses.append(StatusBreakdown(status=st, count=0))

        return AnalyticsSummary(
            total_tickets=total,
            critical_tickets=critical,
            resolved_tickets=resolved,
            open_tickets=open_,
            in_progress_tickets=in_progress,
            analyzed_tickets=analyzed,
            average_confidence=round(float(avg_conf or 0.0), 3),
            categories=categories,
            priorities=priorities,
            statuses=statuses,
        )
