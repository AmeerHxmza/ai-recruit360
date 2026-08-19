from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Any
from src.core.supabase_client import supabase

router = APIRouter()


class MCQSubmissionPayload(BaseModel):
    candidate_id: str
    answers: Dict[str, str]


FALLBACK_MCQS = [
    {
        "question": "Which HTTP method is idempotent and used to create or replace a resource?",
        "options": ["GET", "POST", "PUT", "DELETE"],
        "correct_answer": "PUT"
    },
    {
        "question": "What is the time complexity of looking up a key in a Python dictionary on average?",
        "options": ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
        "correct_answer": "O(1)"
    },
    {
        "question": "In React, which hook is used for performing side effects in functional components?",
        "options": ["useState", "useEffect", "useContext", "useReducer"],
        "correct_answer": "useEffect"
    },
    {
        "question": "Which SQL clause is used to filter records after aggregation with GROUP BY?",
        "options": ["WHERE", "HAVING", "ORDER BY", "FILTER"],
        "correct_answer": "HAVING"
    },
    {
        "question": "What architectural pattern separates an application into Model, View, and Controller?",
        "options": ["Microservices", "MVC", "Event-Driven", "Serverless"],
        "correct_answer": "MVC"
    }
]


@router.get("/{candidate_id}/mcqs")
async def get_candidate_mcqs(candidate_id: str):
    """
    Public Candidate Endpoint: Fetches generated MCQ assessment questions for candidate.
    """
    res = supabase.table("candidates").select("id").eq("id", candidate_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Candidate not found.")

    # Try fetching candidate's application to get job_id
    app_res = supabase.table("applications").select("job_id").eq("candidate_id", candidate_id).limit(1).execute()
    job_id = app_res.data[0]["job_id"] if app_res.data else None

    mcqs_list = []
    if job_id:
        q_res = supabase.table("questions").select("question_text, mcq_options, correct_option").eq("job_id", job_id).eq("category", "mcq").execute()
        if q_res.data:
            for q in q_res.data:
                mcqs_list.append({
                    "question": q["question_text"],
                    "options": q.get("mcq_options") or ["A", "B", "C", "D"],
                    "correct_answer": q.get("correct_option") or ""
                })

    if not mcqs_list:
        mcqs_list = FALLBACK_MCQS

    sanitized_mcqs = []
    for item in mcqs_list:
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
    res = supabase.table("candidates").select("id").eq("id", payload.candidate_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Candidate not found.")

    app_res = supabase.table("applications").select("job_id").eq("candidate_id", payload.candidate_id).limit(1).execute()
    job_id = app_res.data[0]["job_id"] if app_res.data else None

    mcqs_list = []
    if job_id:
        q_res = supabase.table("questions").select("question_text, correct_option").eq("job_id", job_id).eq("category", "mcq").execute()
        if q_res.data:
            for q in q_res.data:
                mcqs_list.append({
                    "question": q["question_text"],
                    "correct_answer": q.get("correct_option") or ""
                })

    if not mcqs_list:
        mcqs_list = FALLBACK_MCQS

    correct_count = 0
    total = len(mcqs_list)

    for idx, item in enumerate(mcqs_list):
        correct_ans = item.get("correct_answer", "").strip().lower()
        user_ans = payload.answers.get(str(idx), payload.answers.get(item.get("question", "")))
        if user_ans and str(user_ans).strip().lower() == correct_ans:
            correct_count += 1

    mcq_score_pct = int((correct_count / max(total, 1)) * 100)
    mcq_score_20 = int((correct_count / max(total, 1)) * 20)

    # Fetch candidate's current Stage 1 (CV) and Stage 3 (Interview) scores to calculate composite total
    cv_match_score_10 = 8
    interview_score_20 = 0
    try:
        cand_data = supabase.table("candidates").select("cv_match_score, interview_score").eq("id", payload.candidate_id).execute()
        if cand_data.data:
            c = cand_data.data[0]
            cv_match_score_10 = c.get("cv_match_score") if c.get("cv_match_score") is not None else 8
            interview_score_20 = c.get("interview_score") if c.get("interview_score") is not None else 0
    except Exception:
        pass

    total_score_50 = cv_match_score_10 + mcq_score_20 + interview_score_20

    # Persist Stage 2 MCQ score (out of 20) and total score (out of 50) to Supabase
    try:
        supabase.table("candidates").update({
            "mcq_score": mcq_score_20,
            "total_score": total_score_50
        }).eq("id", payload.candidate_id).execute()
        
        supabase.table("applications").update({
            "mcq_score": mcq_score_20,
            "total_score": total_score_50
        }).eq("candidate_id", payload.candidate_id).execute()
    except Exception:
        pass

    return {
        "candidate_id": payload.candidate_id,
        "mcq_score": mcq_score_20,
        "mcq_score_pct": mcq_score_pct,
        "correct_count": correct_count,
        "total_questions": total
    }
