"""Application settings loaded from environment variables."""

from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    database_url: str = Field(
        default="sqlite:///./support.db",
        description="SQLAlchemy URL. Defaults to a local SQLite file for zero-friction dev.",
    )

    use_mock_ai: bool = Field(default=True)
    ai_provider: Literal["anthropic", "openai"] = "anthropic"

    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-6"

    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

    cors_origins: str = "http://localhost:3000"
    seed_on_startup: bool = True

    @field_validator("use_mock_ai", mode="before")
    @classmethod
    def _coerce_bool(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip().lower() in {"1", "true", "yes", "on"}
        return value

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def effective_mock_mode(self) -> bool:
        """True when no live key is configured for the selected provider."""

        if self.use_mock_ai:
            return True
        if self.ai_provider == "anthropic":
            return not self.anthropic_api_key
        return not self.openai_api_key


@lru_cache
def get_settings() -> Settings:
    return Settings()
