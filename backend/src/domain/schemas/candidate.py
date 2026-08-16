from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class CandidateBase(BaseModel):
    name: str = Field(..., description="Candidate full name")
    email: str = Field(..., description="Candidate email address")
    gender: Optional[str] = Field(None, description="Gender identity (e.g. Male, Female, Other)")
    city: Optional[str] = Field(None, description="Candidate city/location")


class CandidateCreate(CandidateBase):
    job_id: str
    github_url: Optional[str] = None


class MCQOptionItem(BaseModel):
    question: str
    options: List[str] = Field(..., min_items=4, max_items=4)
    correct_answer: str


class MCQSubmissionPayload(BaseModel):
    candidate_id: str
    answers: Dict[str, str] = Field(..., description="Map of question index or question string to selected option")


class CandidateResponse(CandidateBase):
    id: str
    job_id: str
    status: str
    ai_score: int
    mcq_score: Optional[int] = 0
    mcq_data: Optional[List[Dict[str, Any]]] = None
    hr_questions: Optional[List[str]] = None
    created_at: Optional[str] = None
