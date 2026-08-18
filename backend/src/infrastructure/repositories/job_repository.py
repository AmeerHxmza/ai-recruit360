from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from src.infrastructure.repositories.base import BaseRepository
from src.core.supabase_client import supabase


class JobRepository(BaseRepository):
    def __init__(self):
        super().__init__("jobs")

    def get_job_with_recruiter_check(self, job_id: str, recruiter_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        query = supabase.table("jobs").select("*").eq("id", job_id)
        if recruiter_id:
            query = query.eq("recruiter_id", recruiter_id)
        res = query.execute()
        return res.data[0] if res.data else None

    def list_recruiter_jobs(self, recruiter_id: str) -> List[Dict[str, Any]]:
        res = supabase.table("jobs")\
            .select("*, applications(count)")\
            .eq("recruiter_id", recruiter_id)\
            .order("created_at", desc=True)\
            .execute()
        
        now_utc = datetime.now(timezone.utc)
        jobs = res.data or []
        for j in jobs:
            exp_str = j.get("expires_at")
            if exp_str:
                try:
                    exp_dt = datetime.fromisoformat(exp_str.replace("Z", "+00:00"))
                    j["is_expired"] = now_utc > exp_dt or j.get("status") == "expired"
                    if j["is_expired"] and j.get("status") == "active":
                        j["status"] = "expired"
                except Exception:
                    j["is_expired"] = False
            else:
                j["is_expired"] = False
            
            # Format applicant count
            apps = j.get("applications", [])
            j["applicant_count"] = apps[0].get("count", 0) if apps and isinstance(apps, list) else 0

        return jobs

    def delete_job_cascade(self, job_id: str, recruiter_id: str) -> bool:
        """Cascade deletes a job and all child applications, interviews, questions, and proctor logs."""
        res = supabase.table("jobs").delete().eq("id", job_id).eq("recruiter_id", recruiter_id).execute()
        return bool(res.data)
