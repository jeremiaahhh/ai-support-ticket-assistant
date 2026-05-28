"""Demo seed data — realistic-looking SaaS support tickets."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.ticket import Ticket, TicketCategory, TicketPriority, TicketStatus
from app.repositories.ticket_repository import TicketRepository
from app.services.ticket_analysis_service import TicketAnalysisService


_SEED: list[dict] = [
    {
        "subject": "Production down — 500s on all checkout requests",
        "body": (
            "Our entire checkout flow is returning 500 errors as of about 10 minutes ago. "
            "This is a critical outage affecting all paying customers in EU. We're seeing "
            "stack traces pointing to your /v2/charges endpoint. Please treat this as urgent — "
            "we need an update ASAP."
        ),
        "customer_email": "ops@northwind.example",
        "customer_name": "Priya Anand",
        "status": TicketStatus.IN_PROGRESS,
    },
    {
        "subject": "Refund request for duplicate invoice",
        "body": (
            "Hi team — we were charged twice on this month's invoice (INV-2046 and INV-2047). "
            "Could you refund the duplicate charge of $429? Happy to provide bank statements "
            "if helpful."
        ),
        "customer_email": "finance@brightlabs.example",
        "customer_name": "Marco Klein",
        "status": TicketStatus.OPEN,
    },
    {
        "subject": "Cannot log in after enabling 2FA",
        "body": (
            "I enabled 2FA yesterday using an authenticator app. Today the codes are being "
            "rejected. I've tried multiple devices and clearing my browser. Please help — I "
            "have a customer demo in two hours and I'm locked out."
        ),
        "customer_email": "alex@acme.example",
        "customer_name": "Alex Morgan",
        "status": TicketStatus.OPEN,
    },
    {
        "subject": "Bug: CSV export contains empty rows for archived projects",
        "body": (
            "When I export the project list as CSV, archived projects show up as rows with "
            "all columns empty except the ID. Repro: 1) archive any project, 2) Settings → "
            "Export → CSV. Browser: Chrome 121, macOS 14.3. Not blocking but a bit annoying."
        ),
        "customer_email": "qa@spruce.example",
        "customer_name": "Hannah Becker",
        "status": TicketStatus.OPEN,
    },
    {
        "subject": "Feature request: bulk-assign issues by label",
        "body": (
            "Would be great if we could bulk-assign issues filtered by a label to a specific "
            "user. Right now we have to do it one by one which doesn't scale for our team of "
            "40 engineers. Nice to have, no rush."
        ),
        "customer_email": "platform@finchhq.example",
        "customer_name": "Diego Silva",
        "status": TicketStatus.OPEN,
    },
    {
        "subject": "How do I rotate my API token without downtime?",
        "body": (
            "Quick question — what's the recommended way to rotate the workspace API token "
            "without causing a brief window where requests fail? Documentation seems to "
            "suggest generating a new token but I'm not sure how the old one is invalidated."
        ),
        "customer_email": "sre@helios.example",
        "customer_name": "Yumi Tanaka",
        "status": TicketStatus.RESOLVED,
    },
    {
        "subject": "Webhook deliveries are slow / sometimes time out",
        "body": (
            "We're seeing webhook deliveries take 8-12 seconds on average for the past two "
            "days, with occasional timeouts. Our endpoint normally responds in <200ms. Could "
            "you check whether something changed on your side? This is affecting our customer "
            "notifications."
        ),
        "customer_email": "eng@brightline.example",
        "customer_name": "Sam O'Connor",
        "status": TicketStatus.IN_PROGRESS,
    },
    {
        "subject": "Minor: typo on the pricing page",
        "body": (
            "Tiny thing — the pricing page says 'Enteprise' instead of 'Enterprise' in the "
            "comparison table. Just thought you'd want to know."
        ),
        "customer_email": "rosa@example.com",
        "customer_name": "Rosa Hadid",
        "status": TicketStatus.RESOLVED,
    },
]


def seed_demo_data(db: Session, *, analyze: bool = True) -> int:
    """Seed the database with demo tickets if empty. Returns count added."""

    repo = TicketRepository(db)
    existing, _ = repo.list(limit=1)
    if existing:
        return 0

    added: list[Ticket] = []
    for entry in _SEED:
        ticket = Ticket(
            subject=entry["subject"],
            body=entry["body"],
            customer_email=entry["customer_email"],
            customer_name=entry["customer_name"],
            status=entry.get("status", TicketStatus.OPEN),
            priority=entry.get("priority", TicketPriority.MEDIUM),
            category=entry.get("category"),
        )
        added.append(repo.add(ticket))

    if analyze:
        service = TicketAnalysisService(db)
        for ticket in added:
            service.analyze(ticket.id)

    return len(added)
