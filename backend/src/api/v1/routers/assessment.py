from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Any
from src.core.supabase_client import supabase

router = APIRouter()


class MCQSubmissionPayload(BaseModel):
    candidate_id: str
    answers: Dict[str, str]


@router.get("/{candidate_id}/mcqs")
async def get_candidate_mcqs(candidate_id: str):
    """
    Public Candidate Endpoint: Fetches generated 10 MCQ assessment questions for candidate.
    """
    res = supabase.table("candidates").select("mcq_data, status").eq("id", candidate_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Candidate not found.")

    cand = res.data[0]
    mcq_data = cand.get("mcq_data") or []
    
    # Strip correct answers before sending to client for anti-cheat
    sanitized_mcqs = []
    for item in mcq_data:
        sanitized_mcqs.append({
            "question": item.get("question", ""),
            "options": item.get("options", [])
        })

    return {
        "candidate_id": candidate_id,
        "total_questions": len(sanitized_mcqs),
        "mcqs": sanitized_mcqs
    }


@router.post("/submit")
async def submit_mcq_assessment(payload: MCQSubmissionPayload):
    """
    Public Candidate Endpoint: Validates candidate MCQ answers and calculates MCQ Score (0-100).
    """
    res = supabase.table("candidates").select("mcq_data").eq("id", payload.candidate_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Candidate not found.")

    mcq_data = res.data[0].get("mcq_data") or []
    if not mcq_data:
        return {"candidate_id": payload.candidate_id, "score": 100, "correct_count": 0, "total": 0}

    correct_count = 0
    total = len(mcq_data)

    for idx, item in enumerate(mcq_data):
        correct_ans = item.get("correct_answer", "").strip().lower()
        user_ans = payload.answers.get(str(idx), payload.answers.get(item.get("question", "")))
        if user_ans and str(user_ans).strip().lower() == correct_ans:
            correct_count += 1

    mcq_score = int((correct_count / max(total, 1)) * 100)

    # Save MCQ score to database
    supabase.table("candidates").update({
        "mcq_score": mcq_score
    }).eq("id", payload.candidate_id).execute()

    return {
        "candidate_id": payload.candidate_id,
        "mcq_score": mcq_score,
        "correct_count": correct_count,
        "total_questions": total
    }
