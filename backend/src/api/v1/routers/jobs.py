from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Literal
from middleware.auth import get_current_user
from core.supabase_client import supabase

router = APIRouter()


class CreateJobRequest(BaseModel):
    title: str
    department: str
    description: str = ""
    github_required: bool = False
    knockout_enabled: bool = False


class UpdateJobRequest(BaseModel):
    title: str | None = None
    department: str | None = None
    description: str | None = None
    status: Literal["Active", "Closed", "Draft"] | None = None
    github_required: bool | None = None
    knockout_enabled: bool | None = None


@router.get("/")
async def list_jobs(current_user: dict = Depends(get_current_user)):
    """List all jobs, ordered by created_at descending."""
    result = supabase.table("jobs").select("*").order("created_at", desc=True).execute()
    return result.data


@router.get("/{job_id}")
async def get_job(job_id: str):
    """
    Fetch a single job by ID.
    Public endpoint — no auth required (used by apply portal to display job title).
    """
    result = supabase.table("jobs").select("*").eq("id", job_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Job not found.")
    return result.data


@router.post("/", status_code=201)
async def create_job(
    body: CreateJobRequest,
    current_user: dict = Depends(get_current_user),
):
    """Create a new job listing."""
    data = {
        "title": body.title.strip(),
        "department": body.department.strip(),
        "description": body.description.strip(),
        "github_required": body.github_required,
        "knockout_enabled": body.knockout_enabled,
        "status": "Active",
        "created_by": current_user["user_id"],
    }
    result = supabase.table("jobs").insert(data).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create job")
    return result.data[0]


@router.put("/{job_id}")
async def update_job(
    job_id: str,
    body: UpdateJobRequest,
    current_user: dict = Depends(get_current_user),
):
    """Update job fields."""
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = supabase.table("jobs").update(updates).eq("id", job_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Job not found")
    return result.data[0]


@router.delete("/{job_id}", status_code=204)
async def delete_job(
    job_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete a job and cascade to candidates."""
    supabase.table("jobs").delete().eq("id", job_id).execute()
    return None


@router.post("/{job_id}/close")
async def close_job(
    job_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Mark a job as Closed."""
    result = (
        supabase.table("jobs").update({"status": "Closed"}).eq("id", job_id).execute()
    )
    return result.data[0] if result.data else {"detail": "Job not found"}
