"""Pydantic schemas for ticket endpoints."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.ticket import TicketCategory, TicketPriority, TicketStatus
from app.schemas.analysis import AnalysisRead


class TicketCreate(BaseModel):
    subject: str = Field(..., min_length=3, max_length=255)
    body: str = Field(..., min_length=5)
    customer_email: Optional[EmailStr] = None
    customer_name: Optional[str] = Field(default=None, max_length=255)
    priority: Optional[TicketPriority] = None
    category: Optional[TicketCategory] = None


class TicketUpdate(BaseModel):
    status: Optional[TicketStatus] = None
    priority: Optional[TicketPriority] = None
    category: Optional[TicketCategory] = None


class TicketRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    subject: str
    body: str
    customer_email: Optional[str] = None
    customer_name: Optional[str] = None
    category: Optional[TicketCategory] = None
    priority: TicketPriority
    status: TicketStatus
    created_at: datetime
    updated_at: datetime
    analysis: Optional[AnalysisRead] = None


class TicketListResponse(BaseModel):
    items: list[TicketRead]
    total: int
