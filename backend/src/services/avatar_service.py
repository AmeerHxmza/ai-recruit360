from typing import Dict, Any, Optional
from src.infrastructure.external.simli_client import simli_client


class AvatarService:
    async def initialize_simli_session(self, candidate_id: str, face_id: Optional[str] = None) -> Dict[str, Any]:
        """Initializes a Simli AI Video Avatar WebRTC session for live interactive interview."""
        return await simli_client.create_avatar_session(candidate_id, face_id)


avatar_service = AvatarService()
