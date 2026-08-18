from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime


class JobCreateRequest(BaseModel):
    title: str = Field(..., description="Job role title")
    description: str = Field(..., description="Detailed job description & technical requirements")
    department: Optional[str] = Field("Engineering", description="Department name")
    min_experience: Optional[int] = Field(0, ge=0, description="Minimum years of experience")
    duration_days: Optional[int] = Field(30, ge=1, le=365, description="Duration in days before application deadline expires")


class JobUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    department: Optional[str] = None
    min_experience: Optional[int] = None
    status: Optional[str] = Field(None, description="Status: draft, active, expired, closed")


class JobEnhanceRequest(BaseModel):
    title: str
    department: Optional[str] = "Engineering"
    description: Optional[str] = ""


class JobResponse(BaseModel):
    id: str
    recruiter_id: Optional[str]
    title: str
    department: Optional[str]
    description: str
    min_experience: int
    duration_days: int
    expires_at: str
    status: str
    is_expired: bool = False
    applicant_count: int = 0
    created_at: str
