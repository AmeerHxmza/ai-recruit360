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
