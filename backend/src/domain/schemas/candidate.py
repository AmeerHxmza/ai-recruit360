from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class CandidateBase(BaseModel):
    first_name: str = Field(..., description="Candidate first name")
    last_name: str = Field(..., description="Candidate last name")
    email: str = Field(..., description="Candidate email address")
    phone: Optional[str] = None
    gender: Optional[str] = None
    city: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None


class ApplicationSubmissionPayload(BaseModel):
    job_id: str
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    gender: Optional[str] = None
    city: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None


class CandidateLeaderboardItem(BaseModel):
    id: str
    application_id: str
    job_id: str
    first_name: str
    last_name: str
    email: str
    city: Optional[str]
    cv_url: str
    status: str
    overall_score: int
    technical_score: int
    communication_score: int
    honesty_score: int
    problem_solving_score: int
    passed_knockout: bool
    knockout_reason: Optional[str]
    applied_at: str


class CandidateDetailResponse(BaseModel):
    candidate: CandidateBase
    application: Dict[str, Any]
    interview: Optional[Dict[str, Any]]
    evaluation: Optional[Dict[str, Any]]
    proctor_logs: List[Dict[str, Any]] = []
