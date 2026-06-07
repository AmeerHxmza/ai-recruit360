from fastapi import APIRouter, HTTPException, UploadFile, File, Form, BackgroundTasks
from pydantic import BaseModel, EmailStr
from core.supabase_client import supabase
from services.pdf_parser import extract_text_from_pdf
from services.gemini_service import (
    parse_resume,
    generate_interview_questions,
    evaluate_answer,
    calculate_truthfulness_ai,
)
from services.scoring_engine import (
    calculate_hiring_confidence,
    calculate_average_interview_score,
    determine_candidate_status,
    rerank_candidates_for_job,
)

router = APIRouter()


# ─────────────────────────────────────
# POST /api/apply/{job_id}
# Candidate submits application
# ─────────────────────────────────────
@router.post("/{job_id}")
async def submit_application(
    job_id: str,
    full_name: str = Form(...),
    email: str = Form(...),
    gender: str = Form(""),
    address: str = Form(""),
    resume: UploadFile = File(...),
):
    """
    Candidate submits application form + resume PDF.
    1. Fetch job details (knockout_enabled, description)
    2. Parse CV and run match analysis
    3. If knockout_enabled and match < 40: return knockout stage
    4. Create candidate record
    5. Generate 10 targeted interview questions
    6. Return questions + candidate_id to frontend
    """
    # Validate file
    pdf_bytes = await resume.read()
    if len(pdf_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Resume file must be under 5MB.")

    # Extract text
    try:
        resume_text = extract_text_from_pdf(pdf_bytes)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    # Fetch job details
    job_result = supabase.table("jobs").select("*").eq("id", job_id).single().execute()
    if not job_result.data:
        raise HTTPException(status_code=404, detail="Job not found.")
    job = job_result.data
    job_description = job.get("description", job.get("title", ""))

    # Parse resume
    try:
        parsed = await parse_resume(resume_text, job_description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI evaluation failed: {str(e)}")

    match_score = int(parsed.get("match_score", 0))
    summary = parsed.get("summary", "")
    skills = parsed.get("skills", [])

    # Knockout check
    if job.get("knockout_enabled") and match_score < 40:
        return {
            "stage": "knockout",
            "match_score": match_score,
            "message": "Your CV did not meet the minimum requirements for this role.",
        }

    # Create candidate record
    candidate_insert = {
        "job_id": job_id,
        "name": full_name.strip(),
        "email": email.strip(),
        "gender": gender.strip(),
        "address": address.strip(),
        "role_applied": job.get("title", ""),
        "status": "Pending",
        "summary": summary,
    }
    candidate_result = supabase.table("candidates").insert(candidate_insert).execute()
    if not candidate_result.data:
        raise HTTPException(status_code=500, detail="Failed to create candidate record.")
    candidate_id = candidate_result.data[0]["id"]

    # Insert initial scores
    supabase.table("candidate_scores").insert({
        "candidate_id": candidate_id,
        "match_score": match_score,
        "quiz_score": 0,
        "interview_score": 0,
        "truthfulness_score": 0,
        "hiring_confidence_score": 0,
    }).execute()

    # Insert skills
    if skills:
        skill_rows = [
            {"candidate_id": candidate_id, "skill_name": s.get("name", ""), "is_verified": False}
            for s in skills if s.get("name")
        ]
        supabase.table("skills").insert(skill_rows).execute()

    # Generate interview questions
    try:
        questions = await generate_interview_questions(
            resume_text=resume_text,
            job_title=job.get("title", "this role"),
            num_questions=10,
        )
    except Exception:
        # Fallback to generic questions if AI fails
        questions = [
            f"Tell me about yourself and your experience relevant to {job.get('title', 'this role')}.",
            "Walk me through the most impactful project you have built.",
            "Describe a technical challenge you solved and what you learned.",
            "How do you approach learning new technologies?",
            "Tell me about a time you disagreed with a team decision and how you handled it.",
            "What achievement from your CV best demonstrates your impact?",
            "How do you ensure code quality in your projects?",
            "Describe your experience working under tight deadlines.",
            "What are your compensation and availability expectations?",
            "Why should we shortlist you for the onsite interview?",
        ]

    return {
        "stage": "interview",
        "candidate_id": candidate_id,
        "questions": questions,
        "match_score": match_score,
    }


# ─────────────────────────────────────
# POST /api/apply/{job_id}/interview/{candidate_id}/submit
# Candidate submits all answers in batch
# ─────────────────────────────────────
class AnswerItem(BaseModel):
    question: str
    answer: str


class InterviewSubmitRequest(BaseModel):
    responses: list[AnswerItem]
    tab_switches: int = 0
    time_taken_seconds: int = 600


@router.post("/{job_id}/interview/{candidate_id}/submit")
async def submit_interview(
    job_id: str,
    candidate_id: str,
    body: InterviewSubmitRequest,
    background_tasks: BackgroundTasks,
):
    """
    Receives all interview answers in a single batch at the end.
    Queues evaluation as a background task and returns immediately.
    """
    if not body.responses:
        raise HTTPException(status_code=400, detail="No responses provided.")

    # Store raw responses metadata for background processing
    # (actual evaluation happens in background)
    background_tasks.add_task(
        _evaluate_interview_batch,
        candidate_id=candidate_id,
        responses=[{"question": r.question, "answer": r.answer} for r in body.responses],
        tab_switches=body.tab_switches,
        time_taken_seconds=body.time_taken_seconds,
    )

    return {
        "stage": "done",
        "message": "Interview submitted successfully. Your results are being processed.",
        "candidate_id": candidate_id,
    }


async def _evaluate_interview_batch(
    candidate_id: str,
    responses: list[dict],
    tab_switches: int,
    time_taken_seconds: int,
):
    """Background task: evaluates all answers, calculates scores, updates DB."""
    try:
        # 1. Evaluate each answer with Gemini
        evaluated = []
        per_scores = []
        for r in responses:
            try:
                result = await evaluate_answer(r["question"], r["answer"])
                score = int(result.get("score", 50))
                status = result.get("evaluation_status", "Weak")
                feedback = result.get("feedback", "")
            except Exception:
                score, status, feedback = 50, "Weak", "Evaluation unavailable."

            evaluated.append({
                "candidate_id": candidate_id,
                "question_text": r["question"],
                "answer_text": r["answer"],
                "score": score,
                "evaluation_status": status,
                "feedback": feedback,
            })
            per_scores.append(score)

        # 2. Batch insert interview responses
        supabase.table("interview_responses").insert(evaluated).execute()

        # 3. Calculate scores
        interview_score = calculate_average_interview_score(per_scores)

        # 4. Calculate truthfulness + get integrity logs
        truthfulness_score, integrity_logs = await calculate_truthfulness_ai(
            responses=responses,
            tab_switches=tab_switches,
            time_taken_seconds=time_taken_seconds,
        )

        # 5. Get match score from DB
        scores_result = (
            supabase.table("candidate_scores")
            .select("match_score")
            .eq("candidate_id", candidate_id)
            .single()
            .execute()
        )
        match_score = scores_result.data.get("match_score", 0) if scores_result.data else 0

        # 6. Calculate final Hiring Confidence Score
        confidence = calculate_hiring_confidence(
            match_score=match_score,
            interview_score=interview_score,
            truthfulness_score=truthfulness_score,
        )

        # 8. Determine final status
        final_status = determine_candidate_status(confidence, truthfulness_score)

        # 9. Update candidate_scores
        supabase.table("candidate_scores").update({
            "interview_score": interview_score,
            "truthfulness_score": truthfulness_score,
            "hiring_confidence_score": confidence,
        }).eq("candidate_id", candidate_id).execute()

        # 10. Fetch candidate to get job_id for per-job reranking
        candidate_result = (
            supabase.table("candidates")
            .select("id, job_id")
            .eq("id", candidate_id)
            .single()
            .execute()
        )
        job_id = candidate_result.data.get("job_id") if candidate_result.data else None

        # 11. Update candidate status
        supabase.table("candidates").update({
            "status": final_status,
        }).eq("id", candidate_id).execute()

        # 12. Re-rank all candidates in the same job
        if job_id:
            rerank_candidates_for_job(job_id, supabase)
        # (If no job_id, candidate was uploaded without job context — ranking skipped)

        # 13. Insert integrity reasoning logs
        for log in integrity_logs:
            supabase.table("reasoning_logs").insert({
                "candidate_id": candidate_id,
                **log,
            }).execute()

        # 11. Add interview performance log
        supabase.table("reasoning_logs").insert({
            "candidate_id": candidate_id,
            "category": "Interview Performance",
            "status": "Pass" if interview_score >= 60 else "Warning",
            "message": f"Completed {len(responses)} interview questions. Average score: {interview_score}/100. Hiring confidence: {confidence}/100.",
        }).execute()

    except Exception as e:
        # Mark candidate with error note
        supabase.table("reasoning_logs").insert({
            "candidate_id": candidate_id,
            "category": "System",
            "status": "Warning",
            "message": f"Interview evaluation encountered an error: {str(e)[:200]}",
        }).execute()


def _calculate_rank(candidate_id: str, confidence: int) -> int:
    """
    Assigns a rank by counting how many candidates in the same job have higher confidence.
    Simplified rank — full re-ranking should be a separate admin job.
    """
    try:
        result = (
            supabase.table("candidate_scores")
            .select("candidate_id, hiring_confidence_score")
            .execute()
        )
        if result.data:
            higher = sum(
                1 for r in result.data
                if r.get("hiring_confidence_score", 0) > confidence
                and r.get("candidate_id") != candidate_id
            )
            return higher + 1
    except Exception:
        pass
    return 1
