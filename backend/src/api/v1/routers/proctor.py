from fastapi import APIRouter, HTTPException
from src.domain.schemas.proctor import ProctorLogEvent
from src.core.session_cache import session_cache
from src.infrastructure.repositories.proctor_repository import ProctorRepository

router = APIRouter()
proctor_repo = ProctorRepository()


@router.post("/{candidate_id}")
@router.post("/{candidate_id}/log")
async def record_proctor_log(candidate_id: str, payload: ProctorLogEvent):
    """
    Public Candidate Endpoint: Records anti-cheat proctoring telemetry event (e.g. TAB_SWITCH).
    Buffers event in In-Memory Session Cache for sub-millisecond response.
    """
    try:
        session = await session_cache.get_session(candidate_id)
        if session:
            session.record_proctor_event(
                event_type=payload.event_type,
                description=payload.description,
                severity=payload.severity or "warning"
            )
        return {"status": "logged", "event_type": payload.event_type}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record proctor event: {str(e)}")
