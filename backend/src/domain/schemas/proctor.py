from typing import Optional
from pydantic import BaseModel, Field


class ProctorLogEvent(BaseModel):
    event_type: str = Field("TAB_SWITCH", description="Telemetry event type (e.g. TAB_SWITCH, FOCUS_LOSS, COPY_PASTE)")
    description: Optional[str] = Field(None, description="Additional context or event details")
    severity: Optional[str] = Field("warning", description="Severity level: info, warning, critical")
