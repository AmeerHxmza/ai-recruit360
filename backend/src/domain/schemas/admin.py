from typing import List, Optional
from pydantic import BaseModel, Field


class AdminOverviewMetrics(BaseModel):
    total_recruiters: int
    active_recruiters: int
    suspended_recruiters: int
    total_jobs: int
    active_jobs: int
    total_candidates_screened: int
    total_interviews_completed: int
    total_ai_tokens_consumed: int
    total_ai_cost_usd: float


class UserManagementItem(BaseModel):
    id: str
    full_name: str
    company_name: str
    email: str
    role: str
    is_allowed: bool
    credits_balance: int
    total_credits_used: int
    total_ai_tokens_used: int
    total_ai_cost_usd: float
    created_at: str


class UserStatusToggleRequest(BaseModel):
    is_allowed: bool = Field(..., description="Set true to enable access, false to suspend account")


class CreditTopupRequest(BaseModel):
    credits_to_add: int = Field(..., ge=1, le=10000, description="Number of evaluation credits to top up")
