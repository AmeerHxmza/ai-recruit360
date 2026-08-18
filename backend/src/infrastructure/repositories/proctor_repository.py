from typing import List, Dict, Any, Optional
from src.infrastructure.repositories.base import BaseRepository
from src.core.supabase_client import supabase


class ProctorRepository(BaseRepository):
    def __init__(self):
        super().__init__("proctor_logs")

    def record_proctor_event(self, interview_id: str, candidate_id: str, event_type: str, description: Optional[str] = None, severity: str = "warning") -> Dict[str, Any]:
        return self.insert({
            "interview_id": interview_id,
            "candidate_id": candidate_id,
            "event_type": event_type,
            "description": description or f"Anti-cheat telemetry trigger: {event_type}",
            "severity": severity
        })

    def list_proctor_logs(self, interview_id: str) -> List[Dict[str, Any]]:
        res = supabase.table("proctor_logs").select("*").eq("interview_id", interview_id).order("created_at", desc=False).execute()
        return res.data or []
