from typing import List, Optional
from pydantic import BaseModel, Field


class SendInterviewInviteRequest(BaseModel):
    candidate_ids: List[str] = Field(..., min_items=1, description="List of candidate UUIDs to invite for onsite interview")
    template_type: Optional[str] = Field("technical_onsite", description="Template preset: technical_onsite, hr_culture, executive")
    subject: str = Field("Invitation for Onsite Technical Interview - AI-Recruit360", description="Email subject line")
    custom_message: str = Field(..., description="Custom message / invitation instructions from HR recruiter")
    interview_date_location: Optional[str] = Field("Headquarters Main Office / Google Meet Link", description="Date, time, or location details")
