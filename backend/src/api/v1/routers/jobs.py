from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from src.core.security import get_current_recruiter
from src.core.supabase_client import supabase

router = APIRouter()


class JobCreateRequest(BaseModel):
    title: str
    description: str
    department: Optional[str] = "Engineering"
    min_experience: Optional[int] = 0


class JobEnhanceRequest(BaseModel):
    title: str
    department: Optional[str] = "Engineering"
    description: Optional[str] = ""


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

Requirements for the generated output:
Structure the text clearly with plain section titles:
ROLE OVERVIEW:
[Provide 2-3 sentence overview]

KEY RESPONSIBILITIES:
- [List 4-5 key bullet points]

TECHNICAL STACK & REQUIRED QUALIFICATIONS:
- [List core technical skills, experience years, and tools]

LOCATION & ELIGIBILITY REQUIREMENTS:
- [Specify location, remote/on-site flexibility, and communication skills]

HARD KNOCKOUT CRITERIA:
- [Specify explicit baseline experience & technical stack requirements needed to pass screening]

Keep the formatting clean, authoritative, and concise. Do not include markdown code block backticks.
"""

    try:
        from src.services.ai_agent import get_llm
        llm = get_llm()
        response = llm.invoke(prompt)
        enhanced = str(response.content).strip()
        return {"enhanced_description": enhanced}
    except Exception as e:
        fallback_text = f"""ROLE OVERVIEW:
We are seeking a highly motivated {title} to join our {department} team. In this role, you will lead critical initiatives, architect robust solutions, and collaborate closely with cross-functional team members to drive technical excellence.

KEY RESPONSIBILITIES:
- Design, build, and deploy production-grade solutions aligned with business objectives.
- Collaborate with engineering and product teams to refine technical specifications.
- Ensure high code quality, security, performance, and comprehensive documentation.
- Participate in agile sprint planning, technical code reviews, and system architecture design.

TECHNICAL STACK & REQUIRED QUALIFICATIONS:
- Minimum 3+ years of professional experience in {title} or related field.
- Proficient in relevant programming languages, modern frameworks, and database systems.
- Strong understanding of software design patterns, REST APIs, and version control (Git).
- Proven track record of delivering scalable features in production environments.

LOCATION & ELIGIBILITY REQUIREMENTS:
- Open to qualified applicants with valid work authorization.
- Strong verbal and written communication skills.

HARD KNOCKOUT CRITERIA:
- Must have verified core technical experience matching role requirements.
- Must meet location and minimum experience thresholds."""
        return {"enhanced_description": fallback_text}


@router.post("", status_code=status.HTTP_201_CREATED)
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_job(
    job: JobCreateRequest,
    current_user: dict = Depends(get_current_recruiter)
):
    """
    Creates a new Job posting. Protected by Recruiter Auth.
    """
    recruiter_id = current_user["user_id"]
    
    # Ensure recruiter profile exists
    try:
        supabase.table("recruiters").upsert({
            "id": recruiter_id,
            "full_name": current_user.get("email", "Recruiter").split("@")[0].capitalize(),
            "company_name": "My Organization"
        }, on_conflict="id").execute()
    except Exception:
        pass

    try:
        res = supabase.table("jobs").insert({
            "recruiter_id": recruiter_id,
            "title": job.title,
            "description": job.description,
            "department": job.department,
            "min_experience": job.min_experience,
            "status": "active"
        }).execute()

        if not res.data:
            raise HTTPException(status_code=400, detail="Failed to create job posting.")

        return {
            "message": "Job created successfully",
            "job": res.data[0]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("")
@router.get("/")
async def list_jobs(current_user: dict = Depends(get_current_recruiter)):
    """
    Lists all job postings created by the logged-in recruiter along with applicant counts.
    """
    recruiter_id = current_user["user_id"]
    try:
        res = supabase.table("jobs")\
            .select("*, candidates(count)")\
            .eq("recruiter_id", recruiter_id)\
            .order("created_at", desc=True)\
            .execute()

        return {"jobs": res.data or []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch jobs: {str(e)}")
