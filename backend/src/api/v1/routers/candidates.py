from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from src.api.dependencies.auth import require_active_recruiter
from src.services.candidate_service import candidate_service
from src.services.notification_service import notification_service
from src.domain.schemas.email import SendInterviewInviteRequest
from src.core.supabase_client import supabase

router = APIRouter()


@router.get("")
@router.get("/")
async def list_candidates_leaderboard(
    job_id: str,
    current_user: dict = Depends(require_active_recruiter)
):
    """
    Recruiter Endpoint: Fetches candidate leaderboard for a specific job, ranked by overall AI score.
    """
    try:
        leaderboard = candidate_service.get_leaderboard(job_id)
        return {
            "job_id": job_id,
            "total_candidates": len(leaderboard),
            "candidates": leaderboard
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch candidate leaderboard: {str(e)}")


@router.get("/{candidate_id}")
async def get_candidate_deep_dive(
    candidate_id: str,
    current_user: dict = Depends(require_active_recruiter)
):
    """
    Recruiter Endpoint: Fetches complete candidate profile, CV url, transcript, proctor logs, and XAI report.
    """
    try:
        cand_res = supabase.table("candidates").select("*").eq("id", candidate_id).execute()
        if not cand_res.data:
            raise HTTPException(status_code=404, detail="Candidate profile not found.")

        cand = cand_res.data[0]
        app_res = supabase.table("applications").select("*").eq("candidate_id", candidate_id).execute()
        app = app_res.data[0] if app_res.data else {}

        interview_res = supabase.table("interviews").select("*, evaluations(*)").eq("candidate_id", candidate_id).execute()
        interview = interview_res.data[0] if interview_res.data else {}
        evals = interview.get("evaluations", []) or []
        evaluation = evals[0] if isinstance(evals, list) and evals else (evals if isinstance(evals, dict) else {})

        proctor_res = supabase.table("proctor_logs").select("*").eq("candidate_id", candidate_id).execute()

        return {
            "candidate": cand,
            "application": app,
            "interview": interview,
            "evaluation": evaluation,
            "proctor_logs": proctor_res.data or []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching candidate profile: {str(e)}")


@router.post("/send-interview-invite")
async def send_onsite_interview_invite(
    payload: SendInterviewInviteRequest,
    current_user: dict = Depends(require_active_recruiter)
):
    """
    Recruiter Endpoint: Dispatches customized Onsite Interview Invitation emails to selected top candidates.
    """
    result = notification_service.send_onsite_interview_invitations(
        candidate_ids=payload.candidate_ids,
        subject=payload.subject,
        custom_message=payload.custom_message,
        interview_date_location=payload.interview_date_location or "Headquarters Main Office / Online Stream"
    )
    return result
