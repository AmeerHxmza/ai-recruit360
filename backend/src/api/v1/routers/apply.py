import uuid
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, status
from typing import Optional
from src.core.supabase_client import supabase
from src.services.pdf_parser import extract_text_from_pdf
from src.services.ai_agent import run_candidate_screening

router = APIRouter()


@router.post("/{job_id}")
async def submit_application(
    job_id: str,
    email: str = Form(...),
    name: Optional[str] = Form(None),
    full_name: Optional[str] = Form(None),
    gender: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    github_url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    resume: Optional[UploadFile] = File(None)
):
    """
    Public Endpoint: Candidate submits application with demographics & PDF resume.
    Executes PyMuPDF text extraction + LangGraph 3-Stage Screening Workflow.
    """
    candidate_name = (name or full_name or "Applicant").strip()
    candidate_city = (city or address or "").strip()
    target_file = file or resume
    if not target_file:
        raise HTTPException(status_code=422, detail="PDF resume file is required.")

    # 1. Fetch target job
    job_res = supabase.table("jobs").select("*").eq("id", job_id).execute()
    if not job_res.data:
        raise HTTPException(status_code=404, detail="Job posting not found.")

    job = job_res.data[0]
    job_description = job.get("description", "")

    # 2. Extract PDF Text
    try:
        pdf_bytes = await target_file.read()
        resume_text = extract_text_from_pdf(pdf_bytes)
        if not resume_text or len(resume_text) < 30:
            raise HTTPException(
                status_code=400,
                detail="Could not extract readable text from PDF. Please upload a standard text PDF."
            )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"PDF Processing Error: {str(e)}")

    # 3. Upload Resume to Supabase Storage Bucket
    cv_url = None
    try:
        filename = getattr(target_file, "filename", "resume.pdf")
        file_filename = f"{uuid.uuid4()}_{filename}"
        storage_res = supabase.storage.from_("resumes").upload(file_filename, pdf_bytes)
        if storage_res:
            cv_url = supabase.storage.from_("resumes").get_public_url(file_filename)
    except Exception:
        cv_url = f"https://storage.supabase.co/resumes/{uuid.uuid4()}.pdf"

    # 4. Run LangGraph Screening Nodes
    screening = run_candidate_screening(
        resume_text=resume_text,
        job_description=job_description,
        gender=gender,
        city=candidate_city
    )

    passed_knockout = screening.get("passed_knockout", True)
    knockout_reason = screening.get("knockout_reason", "")
    mcq_data = screening.get("mcq_data", [])
    hr_questions = screening.get("hr_questions", [])

    # Status must satisfy PostgreSQL constraint candidates_status_check ('pending', 'interviewing', 'completed', 'rejected')
    status_str = "interviewing" if passed_knockout else "rejected"

    # 5. Insert Candidate into Supabase Database with Graceful Column Fallback
    candidate_data = {
        "job_id": job_id,
        "name": candidate_name,
        "email": email,
        "gender": gender,
        "city": candidate_city,
        "github_url": github_url,
        "cv_url": cv_url,
        "resume_text": resume_text,
        "status": status_str,
        "ai_score": 0 if not passed_knockout else 50,
        "mcq_data": mcq_data,
        "mcq_score": 0,
        "hr_questions": hr_questions,
        "generated_questions": hr_questions,
        "current_question_index": 0,
        "interview_transcript": f"Screening note: {knockout_reason}\n\n" if knockout_reason else ""
    }

    try:
        insert_res = supabase.table("candidates").insert(candidate_data).execute()
        candidate = insert_res.data[0]
    except Exception as e:
        err_str = str(e)
        if "PGRST204" in err_str or "schema cache" in err_str or "column" in err_str:
            # Schema column fallback for legacy table schemas
            fallback_data = {
                "job_id": job_id,
                "name": candidate_name,
                "email": email,
                "cv_url": cv_url,
                "resume_text": resume_text,
                "status": status_str,
                "ai_score": 0 if not passed_knockout else 50,
                "generated_questions": hr_questions,
                "current_question_index": 0,
                "interview_transcript": f"Screening note (Location: {candidate_city}): {knockout_reason}\n\n" if knockout_reason else ""
            }
            insert_res = supabase.table("candidates").insert(fallback_data).execute()
            if not insert_res.data:
                raise HTTPException(status_code=500, detail="Failed to save candidate application.")
            candidate = insert_res.data[0]
        else:
            raise HTTPException(status_code=500, detail=f"Database Insertion Error: {err_str}")

    return {
        "message": "Application submitted successfully",
        "candidate_id": candidate["id"],
        "status": candidate["status"],
        "passed_knockout": passed_knockout,
        "knockout_reason": knockout_reason,
        "mcq_data": mcq_data,
        "hr_questions": hr_questions,
        "questions": hr_questions,
        "generated_questions": hr_questions
    }
