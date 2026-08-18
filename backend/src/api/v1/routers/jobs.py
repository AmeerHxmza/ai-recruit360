from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from src.api.dependencies.auth import require_active_recruiter
from src.domain.schemas.job import (
    JobCreateRequest,
    JobEnhanceRequest,
    JobResponse
)
from src.services.job_service import job_service
from src.services.candidate_service import candidate_service

router = APIRouter()


@router.post("/enhance")
async def enhance_job_description(payload: JobEnhanceRequest):
    """
    AI Endpoint: Expands title, department, and draft description into a detailed,
    professional Job Description with clear role responsibilities, tech stack requirements,
    and hard knockout criteria.
    """
    title = payload.title.strip() if payload.title else "Software Engineer"
    department = payload.department.strip() if payload.department else "Engineering"
    draft = payload.description.strip() if payload.description else ""

    prompt = f"""You are an Executive Talent Acquisition Director and Lead Technical Recruiter.
Expand the following rough job posting details into a highly detailed, professional, structured Job Description.

Job Title: {title}
Department: {department}
Draft Notes / Requirements:
{draft if draft else "Looking for a skilled professional with strong technical expertise, domain experience, and collaborative problem-solving abilities."}

Structure the text clearly:
ROLE OVERVIEW:
[2-3 sentence overview]

KEY RESPONSIBILITIES:
- [List 4-5 key bullet points]

TECHNICAL STACK & REQUIRED QUALIFICATIONS:
- [List core technical skills, experience years, and tools]

LOCATION & ELIGIBILITY REQUIREMENTS:
- [Specify location, remote/on-site flexibility, and communication skills]

HARD KNOCKOUT CRITERIA:
- [Specify explicit baseline experience & technical stack requirements needed to pass screening]
"""

    try:
        from src.services.ai_agent import get_llm
        llm = get_llm()
        response = llm.invoke(prompt)
        enhanced = str(response.content).strip()
        return {"enhanced_description": enhanced}
    except Exception as e:
        fallback_text = f"""ROLE OVERVIEW:
We are seeking a highly motivated {title} to join our {department} team. In this role, you will lead critical initiatives, architect robust solutions, and collaborate closely with cross-functional team members.

KEY RESPONSIBILITIES:
- Design, build, and deploy production-grade solutions aligned with business objectives.
- Collaborate with engineering and product teams to refine technical specifications.
- Ensure high code quality, security, performance, and comprehensive documentation.

TECHNICAL STACK & REQUIRED QUALIFICATIONS:
- Minimum 3+ years of professional experience in {title} or related field.
- Proficient in relevant programming languages, modern frameworks, and database systems.

LOCATION & ELIGIBILITY REQUIREMENTS:
- Open to qualified applicants with valid work authorization.

HARD KNOCKOUT CRITERIA:
- Must have verified core technical experience matching role requirements."""
        return {"enhanced_description": fallback_text}


@router.post("", status_code=status.HTTP_201_CREATED)
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_job(
    payload: JobCreateRequest,
    current_user: dict = Depends(require_active_recruiter)
):
    """
    Creates a new Job posting with calculated expiration lifecycle. Consumes 5 Recruiter Credits.
    """
    try:
        job = job_service.create_job(
            recruiter_id=current_user["user_id"],
            title=payload.title,
            description=payload.description,
            department=payload.department or "Engineering",
            min_experience=payload.min_experience or 0,
            duration_days=payload.duration_days or 30
        )
        return {
            "message": "Job posting created successfully",
            "job": job
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/public/{job_id}")
@router.get("/{job_id}/public")
async def get_public_job_details(job_id: str):
    """
    Public Endpoint: Fetches job title, department, min_experience, description, and expiration status for candidates applying.
    No authentication required.
    """
    job = job_service.get_job_public(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found.")
    return job


@router.get("")
@router.get("/")
async def list_jobs(current_user: dict = Depends(require_active_recruiter)):
    """
    Lists all job postings created by the logged-in recruiter along with applicant counts and expiration status.
    """
    try:
        jobs = job_service.list_jobs(current_user["user_id"])
        return {"jobs": jobs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch jobs: {str(e)}")


@router.delete("/{job_id}", status_code=status.HTTP_200_OK)
async def delete_job(
    job_id: str,
    current_user: dict = Depends(require_active_recruiter)
):
    """
    Cascade deletes a job posting and all associated candidate applications, interviews, questions, and proctor logs.
    """
    success = job_service.delete_job(job_id, current_user["user_id"])
    if not success:
        raise HTTPException(status_code=404, detail="Job not found or access denied.")
    return {"message": "Job posting and all associated candidate data cleanly deleted."}


@router.get("/{job_id}/export")
async def export_candidates_csv(
    job_id: str,
    current_user: dict = Depends(require_active_recruiter)
):
    """
    Exports top ranked candidates data and CV links for a job as a CSV download payload.
    """
    csv_data = candidate_service.export_top_candidates_csv(job_id)
    return {
        "job_id": job_id,
        "filename": f"job_{job_id}_leaderboard.csv",
        "csv_content": csv_data
    }
