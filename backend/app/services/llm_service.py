"""LLM provider abstraction.

The rest of the codebase only knows about `LLMService.analyze_ticket` — it
doesn't care whether the implementation behind it is Anthropic, OpenAI, or the
deterministic mock. Provider selection is config-driven; when no API key is
available we automatically fall back to the mock so the app remains demoable.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Protocol

from app.core.config import Settings, get_settings
from app.core.errors import AIProviderError
from app.core.logging import logger
from app.models.ticket import TicketCategory, TicketPriority
from app.services.mock_ai_service import MockAIService


@dataclass(slots=True)
class AnalysisResult:
    category: TicketCategory
    priority: TicketPriority
    summary: str
    suggested_response: str
    reasoning_short: str
    confidence_score: float
    model_name: str
    used_mock: bool


class _Provider(Protocol):
    name: str

    def analyze(
        self, *, subject: str, body: str, customer_name: str | None
    ) -> AnalysisResult: ...


_SYSTEM_PROMPT = """You are a senior customer support triage assistant for a SaaS company.
Given a support ticket, you must produce a strict JSON object with the keys:
  category: one of [billing, technical_issue, account_access, feature_request, bug_report, general_question]
  priority: one of [low, medium, high, critical]
  summary: a one or two sentence factual summary of what the customer is asking
  suggested_response: a polished response the support agent could send, signed "The Support Team"
  reasoning_short: one sentence explaining how you chose category and priority
  confidence_score: a float between 0 and 1 reflecting how confident you are

Rules:
- Respond with valid JSON only. No prose around it.
- The suggested_response must be empathetic, concrete, and actionable.
- Use critical priority only for outages, security incidents, data loss, or fully blocked customers.
"""


def _coerce_category(value: object) -> TicketCategory:
    if isinstance(value, str):
        try:
            return TicketCategory(value.lower().strip())
        except ValueError:
            pass
    return TicketCategory.GENERAL_QUESTION


def _coerce_priority(value: object) -> TicketPriority:
    if isinstance(value, str):
        try:
            return TicketPriority(value.lower().strip())
        except ValueError:
            pass
    return TicketPriority.MEDIUM


def _parse_payload(payload: str) -> dict:
    payload = payload.strip()
    # Strip code fences if a model wrapped its JSON.
    if payload.startswith("```"):
        payload = payload.strip("`")
        if payload.lower().startswith("json"):
            payload = payload[4:]
    try:
        return json.loads(payload)
    except json.JSONDecodeError as exc:
        raise AIProviderError(f"LLM returned non-JSON payload: {exc}") from exc


class _MockProvider:
    name = "mock"

    def __init__(self) -> None:
        self._svc = MockAIService()

    def analyze(self, *, subject: str, body: str, customer_name: str | None) -> AnalysisResult:
        result = self._svc.analyze(subject=subject, body=body, customer_name=customer_name)
        return AnalysisResult(
            category=result.category,
            priority=result.priority,
            summary=result.summary,
            suggested_response=result.suggested_response,
            reasoning_short=result.reasoning_short,
            confidence_score=result.confidence_score,
            model_name=result.model_name,
            used_mock=True,
        )


class _AnthropicProvider:
    def __init__(self, settings: Settings) -> None:
        from anthropic import Anthropic

        self._client = Anthropic(api_key=settings.anthropic_api_key)
        self._model = settings.anthropic_model
        self.name = settings.anthropic_model

    def analyze(self, *, subject: str, body: str, customer_name: str | None) -> AnalysisResult:
        user = (
            f"Customer name: {customer_name or 'Unknown'}\n"
            f"Subject: {subject}\n\nBody:\n{body}"
        )
        try:
            message = self._client.messages.create(
                model=self._model,
                max_tokens=900,
                system=_SYSTEM_PROMPT,
                messages=[{"role": "user", "content": user}],
            )
        except Exception as exc:  # noqa: BLE001
            raise AIProviderError(f"Anthropic call failed: {exc}") from exc
        text = "".join(
            getattr(block, "text", "") for block in message.content if getattr(block, "type", "") == "text"
        )
        data = _parse_payload(text)
        return _result_from_dict(data, model_name=self._model)


class _OpenAIProvider:
    def __init__(self, settings: Settings) -> None:
        from openai import OpenAI

        self._client = OpenAI(api_key=settings.openai_api_key)
        self._model = settings.openai_model
        self.name = settings.openai_model

    def analyze(self, *, subject: str, body: str, customer_name: str | None) -> AnalysisResult:
        user = (
            f"Customer name: {customer_name or 'Unknown'}\n"
            f"Subject: {subject}\n\nBody:\n{body}"
        )
        try:
            response = self._client.chat.completions.create(
                model=self._model,
                temperature=0.2,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": _SYSTEM_PROMPT},
                    {"role": "user", "content": user},
                ],
            )
        except Exception as exc:  # noqa: BLE001
            raise AIProviderError(f"OpenAI call failed: {exc}") from exc
        payload = response.choices[0].message.content or "{}"
        data = _parse_payload(payload)
        return _result_from_dict(data, model_name=self._model)


def _result_from_dict(data: dict, *, model_name: str) -> AnalysisResult:
    try:
        confidence = float(data.get("confidence_score", 0.7))
    except (TypeError, ValueError):
        confidence = 0.7
    confidence = max(0.0, min(1.0, confidence))
    return AnalysisResult(
        category=_coerce_category(data.get("category")),
        priority=_coerce_priority(data.get("priority")),
        summary=str(data.get("summary", "")).strip() or "No summary provided.",
        suggested_response=str(data.get("suggested_response", "")).strip()
        or "Thanks for getting in touch — we're looking into this and will follow up shortly.",
        reasoning_short=str(data.get("reasoning_short", "")).strip()
        or "Reasoning unavailable.",
        confidence_score=round(confidence, 3),
        model_name=model_name,
        used_mock=False,
    )


class LLMService:
    """Public surface used by the rest of the app."""

    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()
        self._provider = self._build_provider()

    @property
    def used_mock(self) -> bool:
        return isinstance(self._provider, _MockProvider)

    def analyze_ticket(
        self, *, subject: str, body: str, customer_name: str | None = None
    ) -> AnalysisResult:
        try:
            return self._provider.analyze(
                subject=subject, body=body, customer_name=customer_name
            )
        except AIProviderError:
            logger.warning("ai_provider_failed_falling_back_to_mock")
            return _MockProvider().analyze(
                subject=subject, body=body, customer_name=customer_name
            )

    # ──────────────────────────────────────────────────────────────────────

    def _build_provider(self) -> _Provider:
        if self._settings.effective_mock_mode:
            logger.info("llm_service_provider", provider="mock")
            return _MockProvider()
        if self._settings.ai_provider == "anthropic":
            logger.info("llm_service_provider", provider="anthropic", model=self._settings.anthropic_model)
            return _AnthropicProvider(self._settings)
        logger.info("llm_service_provider", provider="openai", model=self._settings.openai_model)
        return _OpenAIProvider(self._settings)
