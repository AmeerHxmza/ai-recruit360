from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
from src.infrastructure.repositories.job_repository import JobRepository
from src.services.credit_service import credit_service
from src.core.config import settings
from src.core.exceptions import JobNotFoundError


class JobService:
    def __init__(self):
        self.job_repo = JobRepository()

    def create_job(
        self,
        recruiter_id: str,
        title: str,
        description: str,
        department: str = "Engineering",
        min_experience: int = 0,
        duration_days: int = 30
    ) -> Dict[str, Any]:
        # 1. Deduct credits for job creation
        credit_service.verify_and_deduct_credits(
            recruiter_id=recruiter_id,
            required_credits=settings.CREDIT_COST_JOB_CREATE,
            action_name="Create Job Posting"
        )

        # 2. Compute expires_at timestamp
        now_utc = datetime.now(timezone.utc)
        expires_at = now_utc + timedelta(days=duration_days)

        job_data = {
            "recruiter_id": recruiter_id,
            "title": title.strip(),
            "description": description.strip(),
            "department": department.strip() if department else "Engineering",
            "min_experience": min_experience,
            "duration_days": duration_days,
            "expires_at": expires_at.isoformat(),
            "status": "active"
        }

        return self.job_repo.insert(job_data)

    def list_jobs(self, recruiter_id: str) -> List[Dict[str, Any]]:
        return self.job_repo.list_recruiter_jobs(recruiter_id)

    def get_job_public(self, job_id: str) -> Optional[Dict[str, Any]]:
        job = self.job_repo.get_job_with_recruiter_check(job_id)
        if not job:
            return None
        
        now_utc = datetime.now(timezone.utc)
        exp_str = job.get("expires_at")
        if exp_str:
            try:
                exp_dt = datetime.fromisoformat(exp_str.replace("Z", "+00:00"))
                job["is_expired"] = now_utc > exp_dt or job.get("status") == "expired"
                if job["is_expired"] and job.get("status") == "active":
                    job["status"] = "expired"
            except Exception:
                job["is_expired"] = False
        else:
            job["is_expired"] = False

        return job

    def delete_job(self, job_id: str, recruiter_id: str) -> bool:
        job = self.job_repo.get_job_with_recruiter_check(job_id, recruiter_id)
        if not job:
            raise JobNotFoundError(job_id)
        return self.job_repo.delete_job_cascade(job_id, recruiter_id)


job_service = JobService()
