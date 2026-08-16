from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from src.core.supabase_client import supabase

router = APIRouter()


class MCQSubmitRequest(BaseModel):
    candidate_id: str = Field(..., description="ID of the candidate submitting the MCQ assessment")
    answers: Dict[str, str] = Field(..., description="Map of question index (e.g. '0', '1') to selected option string")


@router.get("/mcq/{candidate_id}")
async def get_candidate_mcqs(candidate_id: str):
    """
    Fetch the 10 generated technical MCQs for a specific candidate.
    """
    res = supabase.table("candidates").select("*").eq("id", candidate_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Candidate record not found.")

    candidate = res.data[0]
    return {
        "candidate_id": candidate["id"],
        "candidate_name": candidate.get("name", "Applicant"),
        "mcq_data": candidate.get("mcq_data") or [],
        "status": candidate.get("status", "interviewing")
    }


@router.post("/mcq")
async def submit_mcq_assessment(payload: MCQSubmitRequest):
    """
    Receives candidate's 10 MCQ answers, calculates the mcq_score (0-100),
    updates Supabase candidate record, and returns hr_questions for the Avatar Interview.
    """
    candidate_id = payload.candidate_id
    user_answers = payload.answers or {}

    # 1. Fetch candidate from database
    res = supabase.table("candidates").select("*").eq("id", candidate_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Candidate record not found.")

    candidate = res.data[0]
    mcq_data: List[Dict[str, Any]] = candidate.get("mcq_data") or []
    hr_questions: List[str] = candidate.get("hr_questions") or candidate.get("generated_questions") or []

    # 2. Calculate score
    correct_count = 0
    total_questions = len(mcq_data) if len(mcq_data) > 0 else 10

    for idx, item in enumerate(mcq_data):
        correct = item.get("correct_answer", "").strip()
        candidate_ans = user_answers.get(str(idx)) or user_answers.get(item.get("question", "")) or ""
        if candidate_ans.strip() == correct:
            correct_count += 1

    # Percentage score
    mcq_score = int((correct_count / total_questions) * 100) if total_questions > 0 else 0

    # 3. Update candidate in Supabase with status satisfying candidates_status_check ('interviewing', 'pending', 'completed', 'rejected')
    try:
        update_data = {
            "mcq_score": mcq_score,
            "status": "interviewing",
            "ai_score": max(candidate.get("ai_score", 0), int(mcq_score * 0.5 + 25))
        }
        supabase.table("candidates").update(update_data).eq("id", candidate_id).execute()
    except Exception:
        try:
            supabase.table("candidates").update({"status": "interviewing"}).eq("id", candidate_id).execute()
        except Exception:
            pass

    return {
        "message": "MCQ assessment evaluated successfully",
        "candidate_id": candidate_id,
        "correct_count": correct_count,
        "total_questions": total_questions,
        "mcq_score": mcq_score,
        "hr_questions": hr_questions,
        "questions": hr_questions
    }
