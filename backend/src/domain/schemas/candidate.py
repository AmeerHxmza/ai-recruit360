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
    cv_match_score: int = Field(default=0, description="Stage 1 CV Match Score out of 10")
    mcq_score: int = Field(default=0, description="Stage 2 MCQ Score out of 20")
    interview_score: int = Field(default=0, description="Stage 3 AI HR Interview Score out of 20")
    total_score: int = Field(default=0, description="Total Composite Score out of 50")
    overall_score: int = Field(default=0, description="Composite score out of 50")
    technical_score: int = Field(default=0)
    communication_score: int = Field(default=0)
    honesty_score: int = Field(default=100)
    problem_solving_score: int = Field(default=0)
    passed_knockout: bool
    knockout_reason: Optional[str]
    applied_at: str


class CandidateDetailResponse(BaseModel):
    candidate: CandidateBase
    application: Dict[str, Any]
    interview: Optional[Dict[str, Any]]
    evaluation: Optional[Dict[str, Any]]
    proctor_logs: List[Dict[str, Any]] = []
