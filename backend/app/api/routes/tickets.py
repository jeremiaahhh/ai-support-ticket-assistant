"""Ticket endpoints — thin adapters over services."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.ticket import TicketCategory, TicketPriority, TicketStatus
from app.schemas.analysis import AnalysisRead, AnalyzeRequest
from app.schemas.ticket import (
    TicketCreate,
    TicketListResponse,
    TicketRead,
    TicketUpdate,
)
from app.services.ticket_analysis_service import TicketAnalysisService
from app.services.ticket_service import TicketService

router = APIRouter(prefix="/tickets", tags=["tickets"])


@router.post(
    "",
    response_model=TicketRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new ticket",
)
def create_ticket(payload: TicketCreate, db: Session = Depends(get_db)) -> TicketRead:
    ticket = TicketService(db).create(payload)
    return TicketRead.model_validate(ticket)


@router.get("", response_model=TicketListResponse, summary="List tickets")
def list_tickets(
    db: Session = Depends(get_db),
    status_filter: TicketStatus | None = Query(default=None, alias="status"),
    priority: TicketPriority | None = Query(default=None),
    category: TicketCategory | None = Query(default=None),
    search: str | None = Query(default=None, min_length=1, max_length=120),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> TicketListResponse:
    items, total = TicketService(db).list(
        status=status_filter,
        priority=priority,
        category=category,
        search=search,
        limit=limit,
        offset=offset,
    )
    return TicketListResponse(
        items=[TicketRead.model_validate(t) for t in items],
        total=total,
    )


@router.get("/{ticket_id}", response_model=TicketRead, summary="Get a ticket")
def get_ticket(ticket_id: str, db: Session = Depends(get_db)) -> TicketRead:
    return TicketRead.model_validate(TicketService(db).get(ticket_id))


@router.patch("/{ticket_id}", response_model=TicketRead, summary="Update a ticket")
def update_ticket(
    ticket_id: str, payload: TicketUpdate, db: Session = Depends(get_db)
) -> TicketRead:
    ticket = TicketService(db).update(ticket_id, payload)
    return TicketRead.model_validate(ticket)


@router.delete(
    "/{ticket_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
    summary="Delete a ticket",
)
def delete_ticket(ticket_id: str, db: Session = Depends(get_db)) -> Response:
    TicketService(db).delete(ticket_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/{ticket_id}/analyze",
    response_model=AnalysisRead,
    summary="Run the AI analyzer on a ticket",
)
def analyze_ticket(
    ticket_id: str,
    payload: AnalyzeRequest | None = None,
    db: Session = Depends(get_db),
) -> AnalysisRead:
    force = payload.force if payload else False
    analysis = TicketAnalysisService(db).analyze(ticket_id, force=force)
    return AnalysisRead.model_validate(analysis)
