from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class XAIReasoningSchema(BaseModel):
    claim_vs_reality: str = Field(description="Audit of resume claims vs demonstrated capability")
    transcript_evidence: str = Field(description="Direct verbatim quotes from interview transcript")
    rubric_justification: str = Field(description="Numerical score justification based on standardized rubric")


class MetricScoresSchema(BaseModel):
    technical_score: int = Field(ge=0, le=100)
    communication_score: int = Field(ge=0, le=100)
    honesty_score: int = Field(ge=0, le=100)
    problem_solving_score: int = Field(ge=0, le=100)
    overall_score: int = Field(ge=0, le=100)


class EvaluationResultSchema(BaseModel):
    scores: MetricScoresSchema
    xai_reasoning: XAIReasoningSchema
    strengths: List[str] = []
    red_flags: List[str] = []
