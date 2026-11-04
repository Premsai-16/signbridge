from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator


class DatasetSample(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1, max_length=100)
    schemaVersion: str = Field(min_length=1, max_length=20)
    project: str = Field(min_length=1, max_length=100)
    language: str = Field(min_length=1, max_length=20)
    label: str = Field(min_length=1, max_length=100)
    signerId: str = Field(min_length=1, max_length=100)
    recordedAt: datetime
    durationMs: int = Field(ge=1)
    samplingRate: int = Field(ge=1, le=120)
    consentConfirmed: bool
    frames: list[dict[str, Any]] = Field(min_length=1)

    @field_validator("label", "signerId", "language")
    @classmethod
    def strip_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("This field cannot be empty.")
        return cleaned

    @field_validator("consentConfirmed")
    @classmethod
    def require_consent(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("Consent must be confirmed before uploading.")
        return value