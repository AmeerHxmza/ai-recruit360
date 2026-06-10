import asyncio
import uuid as uuid_lib
from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, Query, UploadFile
from pydantic import BaseModel
from middleware.auth import get_current_user
from core.supabase_client import supabase
from services.pdf_parser import extract_text_from_pdf
from services.ai_service import parse_resume
from services.scoring_engine import determine_candidate_status

router = APIRouter()

MAX_PDF_SIZE = 5 * 1024 * 1024  # 5 MB


# ─────────────────────────────────────
# GET /api/v1/candidates/
# List all candidates (with optional filters)
# ─────────────────────────────────────
@router.get("/")
async def list_candidates(
    job_id: str = Query(None, description="Filter by job ID"),
    status: str = Query(None, description="Filter by status string"),
    current_user: dict = Depends(get_current_user),
):
    """
    Returns candidates with their scores.
    Optional filters: job_id, status.
    """
    query = (
        supabase.table("candidates")
        .select(
            "id, name, email, role_applied, status, rank, created_at, job_id, "
            "candidate_scores(match_score, quiz_score, interview_score, truthfulness_score, hiring_confidence_score)"
        )
        .order("rank", desc=False)
    )
    if job_id:
        query = query.eq("job_id", job_id)
    if status:
        query = query.eq("status", status)

    result = query.execute()
    return result.data or []


# ─────────────────────────────────────
# GET /api/v1/candidates/{candidate_id}
# Full candidate detail
# ─────────────────────────────────────
@router.get("/{candidate_id}")
async def get_candidate(
    candidate_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Full candidate record including scores, skills, interview responses, reasoning logs, and recruiter notes.
    """
    result = (
        supabase.table("candidates")
        .select(
            "*, "
            "candidate_scores(*), "
            "skills(*), "
            "interview_responses(*), "
            "reasoning_logs(*), "
            "recruiter_notes(*)"
        )
        .eq("id", candidate_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Candidate not found.")
    return result.data


# ─────────────────────────────────────
# POST /api/v1/candidates/process
# Recruiter uploads a resume + job description
# ─────────────────────────────────────
@router.post("/process", status_code=202)
async def process_candidate(
    background_tasks: BackgroundTasks,
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    job_id: str = Form(None),
    current_user: dict = Depends(get_current_user),
):
    """
    Accepts a resume PDF and job description.
    1. Validates file
    2. Creates a pending candidate record
    3. Queues AI evaluation in background
    Returns immediately with candidate_id.
    """
    if resume.content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    pdf_bytes = await resume.read()
    if len(pdf_bytes) > MAX_PDF_SIZE:
        raise HTTPException(status_code=400, detail="File size must be under 5MB.")

    # Extract text immediately to validate it's a real resume
    try:
        resume_text = extract_text_from_pdf(pdf_bytes)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    if len(resume_text) < 100:
        raise HTTPException(status_code=422, detail="Could not extract meaningful text from PDF.")

    # Upload raw PDF to Supabase Storage
    storage_path = None
    try:
        file_name = f"{uuid_lib.uuid4()}.pdf"
        supabase.storage.from_("resumes").upload(
            file_name,
            pdf_bytes,
            {"content-type": "application/pdf"},
        )
        storage_path = file_name
    except Exception:
        pass  # Storage upload is best-effort

    # Create pending candidate record
    candidate_data = {
        "role_applied": "Pending Evaluation",
        "status": "Pending",
        "cv_url": storage_path,
        "summary": "Evaluation in progress...",
        "rank": 999,
    }
    if job_id:
        candidate_data["job_id"] = job_id

    result = supabase.table("candidates").insert(candidate_data).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create candidate record.")

    candidate_id = result.data[0]["id"]

    # Queue AI background processing
    background_tasks.add_task(
        _run_ai_evaluation,
        candidate_id=candidate_id,
        resume_text=resume_text,
        job_description=job_description,
        job_id=job_id,
    )

    return {
        "candidate_id": candidate_id,
        "message": "Candidate submitted. AI evaluation in progress.",
        "status": "Pending",
    }


async def _run_ai_evaluation(
    candidate_id: str,
    resume_text: str,
    job_description: str,
    job_id: str | None,
):
    """
    Background task that runs the full AI evaluation pipeline.
    Updates candidate record and scores in Supabase when done.
    """
    try:
        # 1. Parse resume with Gemini
        parsed = await parse_resume(resume_text, job_description)
        match_score = int(parsed.get("match_score", 0))
        summary = parsed.get("summary", "")
        skills = parsed.get("skills", [])

        # 2. Determine initial role from job description (first 80 chars)
        role_applied = job_description.strip()[:80].split("\n")[0].strip()

        # 3. Determine initial status based on match score alone
        initial_status = "Pending"
        if match_score < 40:
            initial_status = "Rejected"

        # 4. Update candidate record
        supabase.table("candidates").update({
            "role_applied": role_applied,
            "status": initial_status,
            "summary": summary,
        }).eq("id", candidate_id).execute()

        # 5. Upsert initial scores (no interview yet)
        supabase.table("candidate_scores").upsert({
            "candidate_id": candidate_id,
            "match_score": match_score,
            "quiz_score": 0,
            "interview_score": 0,
            "truthfulness_score": 0,
            "hiring_confidence_score": round(match_score * 0.25),  # partial score, match only
        }).execute()

        # 6. Insert extracted skills
        if skills:
            skill_rows = [
                {"candidate_id": candidate_id, "skill_name": s.get("name", ""), "is_verified": False}
                for s in skills if s.get("name")
            ]
            supabase.table("skills").insert(skill_rows).execute()

        # 7. Write resume analysis reasoning log
        supabase.table("reasoning_logs").insert({
            "candidate_id": candidate_id,
            "category": "Resume Match",
            "status": "Pass" if match_score >= 60 else "Warning" if match_score >= 40 else "Fail",
            "message": f"Resume analyzed against job description. Match score: {match_score}/100. {summary}",
        }).execute()

        # 8. Re-rank all candidates in this job
        if job_id:
            pass # ranking is now dynamic

    except Exception as e:
        # Mark candidate as errored so recruiter knows
        supabase.table("candidates").update({
            "status": "Pending",
            "summary": f"Evaluation failed: {str(e)[:200]}",
        }).eq("id", candidate_id).execute()


# ─────────────────────────────────────
# GET /api/v1/candidates/{id}/notes
# POST /api/v1/candidates/{id}/notes
# ─────────────────────────────────────
class NoteRequest(BaseModel):
    note_content: str


@router.post("/{candidate_id}/notes", status_code=201)
async def add_note(
    candidate_id: str,
    body: NoteRequest,
    current_user: dict = Depends(get_current_user),
):
    if not body.note_content.strip():
        raise HTTPException(status_code=400, detail="Note content cannot be empty.")
    result = supabase.table("recruiter_notes").insert({
        "candidate_id": candidate_id,
        "recruiter_id": current_user["user_id"],
        "note_content": body.note_content.strip(),
    }).execute()
    return result.data[0] if result.data else {}


@router.get("/{candidate_id}/notes")
async def get_notes(
    candidate_id: str,
    current_user: dict = Depends(get_current_user),
):
    result = (
        supabase.table("recruiter_notes")
        .select("*")
        .eq("candidate_id", candidate_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


# ─────────────────────────────────────
# POST /api/v1/candidates/{id}/action
# Reject or advance candidate
# ─────────────────────────────────────
class ActionRequest(BaseModel):
    action: str  # "reject" | "advance" | "shortlist"


@router.post("/{candidate_id}/action")
async def candidate_action(
    candidate_id: str,
    body: ActionRequest,
    current_user: dict = Depends(get_current_user),
):
    status_map = {
        "reject": "Rejected",
        "advance": "Verified Match",
        "shortlist": "Strong Candidate",
    }
    new_status = status_map.get(body.action)
    if not new_status:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid action '{body.action}'. Must be one of: reject, advance, shortlist"
        )

    result = (
        supabase.table("candidates")
        .update({"status": new_status})
        .eq("id", candidate_id)
        .execute()
    )
    return {"candidate_id": candidate_id, "new_status": new_status}
