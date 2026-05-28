"""Pydantic schemas for AI ticket analysis."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.ticket import TicketCategory, TicketPriority


class AnalyzeRequest(BaseModel):
    force: bool = Field(
        default=False,
        description="Re-run analysis even if a previous one exists.",
    )


class AnalysisRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    ticket_id: str
    category: TicketCategory
    priority: TicketPriority
    summary: str
    suggested_response: str
    reasoning_short: str
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    model_name: str
    used_mock: bool
    created_at: datetime
