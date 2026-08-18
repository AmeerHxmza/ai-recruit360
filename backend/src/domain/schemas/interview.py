from typing import Optional, List
from pydantic import BaseModel, Field


class AnswerSubmitRequest(BaseModel):
    answer: str = Field(..., description="The candidate's text answer to the current question")


class NextQuestionResponse(BaseModel):
    completed: bool
    message: Optional[str] = None
    candidate_name: Optional[str] = None
    current_question_index: int
    total_questions: int
    question: Optional[str] = None


class AnswerSubmitResponse(BaseModel):
    message: str
    next_question_index: int
    total_questions: int
    interview_completed: bool
