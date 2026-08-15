from fastapi import APIRouter, BackgroundTasks, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from src.core.supabase_client import supabase
from src.services.ai_agent import run_interview_evaluation

router = APIRouter()


class AnswerRequest(BaseModel):
    answer: str


class ProctorLogRequest(BaseModel):
    event_type: str = "TAB_SWITCH"


def async_evaluate_candidate(candidate_id: str, resume_text: str, job_description: str, transcript: str, proctor_logs: List[str]):
    """Background task to run LangGraph Node 3 Evaluator and update Supabase DB."""
    try:
        eval_result = run_interview_evaluation(
            resume_text=resume_text,
            job_description=job_description,
            transcript=transcript,
            proctor_logs=proctor_logs
        )
        
        tech_score = eval_result.get("technical_score", 75)
        comm_score = eval_result.get("communication_score", 80)
        honesty_score = eval_result.get("honesty_score", 85)
        overall_score = eval_result.get("overall_score", 79)
        xai = eval_result.get("xai_reasoning", {})

        supabase.table("candidates").update({
            "status": "completed",
            "ai_score": overall_score,
            "technical_score": tech_score,
            "communication_score": comm_score,
            "honesty_score": honesty_score,
            "xai_reasoning": xai
        }).eq("id", candidate_id).execute()
    except Exception as e:
        print(f"Error evaluating candidate {candidate_id}: {str(e)}")


@router.get("/{candidate_id}/next")
async def get_next_question(candidate_id: str):
    """
    Public Candidate Endpoint: Fetches current question string and progress index.
    """
    res = supabase.table("candidates").select("*").eq("id", candidate_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Candidate interview session not found.")

    candidate = res.data[0]
    questions = candidate.get("generated_questions", []) or []
    current_idx = candidate.get("current_question_index", 0)

    if not questions or current_idx >= len(questions):
        return {
            "completed": True,
            "message": "Interview completed! Thank you for your time.",
            "current_question_index": current_idx,
            "total_questions": len(questions),
            "question": None
        }

    return {
        "completed": False,
        "candidate_name": candidate.get("name"),
        "current_question_index": current_idx,
        "total_questions": len(questions),
        "question": questions[current_idx]
    }


@router.post("/{candidate_id}/answer")
async def submit_answer(
    candidate_id: str,
    payload: AnswerRequest,
    background_tasks: BackgroundTasks
):
    """
    Public Candidate Endpoint: Accepts text answer, appends to transcript, increments question index.
    On final question (question 10), triggers LangGraph Node 3 Evaluator in Background.
    """
    res = supabase.table("candidates").select("*, jobs(description)").eq("id", candidate_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Candidate session not found.")

    candidate = res.data[0]
    questions = candidate.get("generated_questions", []) or []
    current_idx = candidate.get("current_question_index", 0)
    existing_transcript = candidate.get("interview_transcript", "") or ""

    current_q = questions[current_idx] if current_idx < len(questions) else "Extra Question"
    updated_transcript = existing_transcript + f"\nQ{current_idx + 1}: {current_q}\nA: {payload.answer}\n"
    next_idx = current_idx + 1
    is_last = next_idx >= len(questions)

    update_payload = {
        "interview_transcript": updated_transcript,
        "current_question_index": next_idx
    }

    if is_last:
        update_payload["status"] = "completed"

    supabase.table("candidates").update(update_payload).eq("id", candidate_id).execute()

    if is_last:
        # Fetch proctor logs
        proctor_res = supabase.table("proctor_logs").select("event_type").eq("candidate_id", candidate_id).execute()
        logs = [p["event_type"] for p in (proctor_res.data or [])]
        job_desc = candidate.get("jobs", {}).get("description", "") if candidate.get("jobs") else ""
        
        background_tasks.add_task(
            async_evaluate_candidate,
            candidate_id=candidate_id,
            resume_text=candidate.get("resume_text", ""),
            job_description=job_desc,
            transcript=updated_transcript,
            proctor_logs=logs
        )

    return {
        "message": "Answer recorded successfully",
        "next_question_index": next_idx,
        "interview_completed": is_last
    }


@router.post("/{candidate_id}/proctor-log")
async def record_proctor_log(candidate_id: str, payload: ProctorLogRequest):
    """
    Public Candidate Endpoint: Records proctoring telemetry event (e.g. TAB_SWITCH).
    """
    try:
        supabase.table("proctor_logs").insert({
            "candidate_id": candidate_id,
            "event_type": payload.event_type
        }).execute()
        return {"status": "logged"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to log telemetry: {str(e)}")
