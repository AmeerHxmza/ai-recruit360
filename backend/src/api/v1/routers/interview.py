from fastapi import APIRouter, Depends, HTTPException, status
from src.domain.schemas.interview import AnswerSubmitRequest
from src.domain.schemas.avatar import AvatarSessionRequest
from src.services.interview_service import interview_service
from src.services.avatar_service import avatar_service
from src.core.exceptions import CandidateNotFoundError, SessionExpiredError

router = APIRouter()


@router.get("/{candidate_id}/next")
async def get_next_question(candidate_id: str):
    """
    Public Candidate Endpoint: Sub-millisecond question fetch via In-Memory Session Cache (<1ms).
    """
    try:
        return await interview_service.get_next_question(candidate_id)
    except CandidateNotFoundError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch next question: {str(e)}")


@router.post("/{candidate_id}/answer")
async def submit_answer(candidate_id: str, payload: AnswerSubmitRequest):
    """
    Public Candidate Endpoint: Accepts text answer, appends to transcript in memory (<1ms).
    On final question completion, triggers async XAI evaluation flush.
    """
    try:
        return await interview_service.submit_answer(candidate_id, payload.answer)
    except SessionExpiredError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record answer: {str(e)}")


@router.post("/avatar-session")
async def create_avatar_session(payload: AvatarSessionRequest):
    """
    Public Candidate Endpoint: Initializes a Simli AI Video Avatar WebRTC streaming session.
    """
    try:
        return await avatar_service.initialize_simli_session(payload.candidate_id, payload.face_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create avatar session: {str(e)}")
