from typing import Optional
from pydantic import BaseModel, Field


class AvatarSessionRequest(BaseModel):
    candidate_id: str = Field(..., description="Candidate UUID initializing the Simli video session")
    face_id: Optional[str] = Field(None, description="Optional custom Simli Avatar Face ID")


class AvatarSessionResponse(BaseModel):
    session_id: str
    face_id: str
    simli_url: str
    webrtc_token: str
    message: str
