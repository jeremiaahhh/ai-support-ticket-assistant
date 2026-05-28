"""Mock AI classification behaviour."""

from __future__ import annotations

from app.models.ticket import TicketCategory, TicketPriority
from app.services.mock_ai_service import MockAIService


def test_outage_is_classified_as_critical_technical_issue() -> None:
    svc = MockAIService()
    result = svc.analyze(
        subject="Production outage — checkout returns 500s",
        body=(
            "All checkout requests are erroring with HTTP 500. We're experiencing a full "
            "production outage. Treat as urgent."
        ),
        customer_name="Priya Anand",
    )

    assert result.category == TicketCategory.TECHNICAL_ISSUE
    assert result.priority == TicketPriority.CRITICAL
    assert "Priya" in result.suggested_response
    assert result.confidence_score >= 0.7


def test_refund_classified_as_billing() -> None:
    svc = MockAIService()
    result = svc.analyze(
        subject="Refund for duplicate invoice",
        body="We were charged twice — please refund the duplicate payment.",
    )

    assert result.category == TicketCategory.BILLING
    assert result.priority in (TicketPriority.HIGH, TicketPriority.MEDIUM)


def test_locked_out_classified_as_account_access() -> None:
    svc = MockAIService()
    result = svc.analyze(
        subject="Cannot log in after enabling 2FA",
        body="My account is locked out — codes from authenticator app are rejected.",
    )

    assert result.category == TicketCategory.ACCOUNT_ACCESS


def test_feature_request_classified() -> None:
    svc = MockAIService()
    result = svc.analyze(
        subject="Feature request: bulk assign",
        body="Could you add a way to bulk assign by label? Nice to have, no rush.",
    )

    assert result.category == TicketCategory.FEATURE_REQUEST
    assert result.priority == TicketPriority.LOW


def test_confidence_is_deterministic() -> None:
    svc = MockAIService()
    a = svc.analyze(subject="X", body="Y")
    b = svc.analyze(subject="X", body="Y")
    assert a.confidence_score == b.confidence_score
