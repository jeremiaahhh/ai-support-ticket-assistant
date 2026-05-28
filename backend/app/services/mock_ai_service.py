"""Deterministic mock AI used for demos and tests.

The mock is intentionally a bit smart: it inspects keywords to make
realistic-looking category, priority, and tone decisions so the UI feels alive
even without an API key. Replacement with a real LLM is a one-line change in
the LLM service.
"""

from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass

from app.models.ticket import TicketCategory, TicketPriority


_CATEGORY_KEYWORDS: dict[TicketCategory, tuple[str, ...]] = {
    TicketCategory.BILLING: (
        "invoice",
        "billing",
        "charge",
        "payment",
        "subscription",
        "refund",
        "price",
        "plan",
        "credit card",
        "rechnung",
    ),
    TicketCategory.TECHNICAL_ISSUE: (
        "error",
        "exception",
        "stack trace",
        "500",
        "timeout",
        "latency",
        "slow",
        "outage",
        "downtime",
        "performance",
    ),
    TicketCategory.ACCOUNT_ACCESS: (
        "login",
        "password",
        "reset",
        "2fa",
        "mfa",
        "locked out",
        "cannot access",
        "sso",
        "sign in",
        "account",
    ),
    TicketCategory.FEATURE_REQUEST: (
        "feature",
        "would be great",
        "wishlist",
        "roadmap",
        "could you add",
        "please add",
        "support for",
        "request",
    ),
    TicketCategory.BUG_REPORT: (
        "bug",
        "broken",
        "doesn't work",
        "not working",
        "regression",
        "unexpected",
        "crash",
        "reproduce",
        "steps to reproduce",
    ),
    TicketCategory.GENERAL_QUESTION: (
        "question",
        "how do i",
        "how to",
        "is it possible",
        "documentation",
        "clarify",
    ),
}


_PRIORITY_RULES: tuple[tuple[TicketPriority, tuple[str, ...]], ...] = (
    (
        TicketPriority.CRITICAL,
        (
            "production down",
            "outage",
            "cannot login",
            "all users",
            "data loss",
            "security",
            "urgent",
            "asap",
            "p0",
            "critical",
            "compliance",
        ),
    ),
    (
        TicketPriority.HIGH,
        (
            "blocking",
            "blocker",
            "important",
            "high priority",
            "affecting customers",
            "revenue",
            "deadline",
            "payment failed",
            "refund",
        ),
    ),
    (
        TicketPriority.LOW,
        (
            "minor",
            "cosmetic",
            "typo",
            "nice to have",
            "low priority",
            "whenever",
            "no rush",
        ),
    ),
)


@dataclass(slots=True)
class MockAnalysis:
    category: TicketCategory
    priority: TicketPriority
    summary: str
    suggested_response: str
    reasoning_short: str
    confidence_score: float
    model_name: str = "mock-classifier-1"


class MockAIService:
    """Pure-Python implementation of the analysis contract.

    Identical interface to the real LLMService.analyze method — that's
    deliberate: the LLM service falls back to this class when no key is
    configured, so the rest of the app cannot tell the difference.
    """

    def analyze(self, *, subject: str, body: str, customer_name: str | None = None) -> MockAnalysis:
        text = f"{subject}\n{body}".lower()
        category, category_hits = self._classify_category(text)
        priority, priority_hits = self._classify_priority(text)
        summary = self._summarize(subject, body)
        suggested_response = self._compose_response(
            customer_name=customer_name,
            category=category,
            priority=priority,
            subject=subject,
        )
        reasoning = self._reasoning(category, category_hits, priority, priority_hits)
        confidence = self._confidence(text, category_hits, priority_hits)
        return MockAnalysis(
            category=category,
            priority=priority,
            summary=summary,
            suggested_response=suggested_response,
            reasoning_short=reasoning,
            confidence_score=confidence,
        )

    # ──────────────────────────────────────────────────────────────────────
    # internal helpers
    # ──────────────────────────────────────────────────────────────────────

    def _classify_category(self, text: str) -> tuple[TicketCategory, list[str]]:
        best: tuple[TicketCategory, list[str]] = (
            TicketCategory.GENERAL_QUESTION,
            [],
        )
        for category, keywords in _CATEGORY_KEYWORDS.items():
            hits = [k for k in keywords if k in text]
            if len(hits) > len(best[1]):
                best = (category, hits)
        return best

    def _classify_priority(self, text: str) -> tuple[TicketPriority, list[str]]:
        for priority, keywords in _PRIORITY_RULES:
            hits = [k for k in keywords if k in text]
            if hits:
                return priority, hits
        return TicketPriority.MEDIUM, []

    def _summarize(self, subject: str, body: str) -> str:
        sentences = re.split(r"(?<=[.!?])\s+", body.strip())
        first = sentences[0] if sentences else body.strip()
        if len(first) > 220:
            first = first[:217].rstrip() + "…"
        return f"{subject.strip().rstrip('.')}. {first}".strip()

    def _compose_response(
        self,
        *,
        customer_name: str | None,
        category: TicketCategory,
        priority: TicketPriority,
        subject: str,
    ) -> str:
        greeting = f"Hi {customer_name.split()[0]}," if customer_name else "Hi there,"

        opener = {
            TicketCategory.BILLING: "Thanks for reaching out about your billing question — I'd be happy to help look into this.",
            TicketCategory.TECHNICAL_ISSUE: "Thanks for the detailed report. I'm sorry you're hitting this issue, and I want to make sure we get to the root cause quickly.",
            TicketCategory.ACCOUNT_ACCESS: "Thanks for getting in touch — I'll help you get back into your account as quickly as possible.",
            TicketCategory.FEATURE_REQUEST: "Thanks for sharing this idea! Feedback like yours is exactly how we decide what to build next.",
            TicketCategory.BUG_REPORT: "Thanks for flagging this. I want to confirm what you're seeing so I can route it to the right engineer.",
            TicketCategory.GENERAL_QUESTION: "Thanks for writing in — happy to clarify.",
        }[category]

        next_step = {
            TicketCategory.BILLING: "I'll pull up the most recent invoice on your account and reply with a breakdown shortly.",
            TicketCategory.TECHNICAL_ISSUE: "Could you share the approximate time the issue started and any error message you saw? In parallel I'm checking our status logs.",
            TicketCategory.ACCOUNT_ACCESS: "I've just sent a fresh password reset link to your account email. If you don't see it within a few minutes, please check spam and let me know.",
            TicketCategory.FEATURE_REQUEST: "I've logged this request in our roadmap tracker. If you can share the workflow you're trying to support, I'll attach that context to the ticket.",
            TicketCategory.BUG_REPORT: "If you can share the steps to reproduce and the browser/OS you're on, I'll loop in our engineering team right away.",
            TicketCategory.GENERAL_QUESTION: "Could you share a little more about what you're trying to accomplish? I'll point you to the right docs or walk you through it directly.",
        }[category]

        urgency_note = ""
        if priority == TicketPriority.CRITICAL:
            urgency_note = " I've also flagged this internally as critical so it gets immediate attention."
        elif priority == TicketPriority.HIGH:
            urgency_note = " I've prioritized this so we can respond as quickly as possible."

        signoff = "Best,\nThe Support Team"
        return f"{greeting}\n\n{opener}{urgency_note}\n\n{next_step}\n\n{signoff}"

    def _reasoning(
        self,
        category: TicketCategory,
        category_hits: list[str],
        priority: TicketPriority,
        priority_hits: list[str],
    ) -> str:
        parts = []
        if category_hits:
            parts.append(
                f"Category {category.value} based on keywords: {', '.join(category_hits[:4])}."
            )
        else:
            parts.append(
                f"Category defaulted to {category.value} — no strong category signal in the message."
            )
        if priority_hits:
            parts.append(
                f"Priority {priority.value} based on phrases: {', '.join(priority_hits[:3])}."
            )
        else:
            parts.append(
                f"Priority defaulted to {priority.value} — neutral urgency language."
            )
        return " ".join(parts)

    def _confidence(self, text: str, cat_hits: list[str], prio_hits: list[str]) -> float:
        # A simple but stable score: more keyword hits + longer message = higher confidence.
        # Hashed jitter keeps the score deterministic per input but varies it a little.
        signal = min(0.55 + 0.07 * len(cat_hits) + 0.05 * len(prio_hits), 0.95)
        length_bonus = min(len(text), 600) / 6000  # up to 0.1
        digest = hashlib.sha1(text.encode("utf-8")).digest()
        jitter = (digest[0] / 255 - 0.5) * 0.04
        score = max(0.4, min(0.97, signal + length_bonus + jitter))
        return round(score, 3)
