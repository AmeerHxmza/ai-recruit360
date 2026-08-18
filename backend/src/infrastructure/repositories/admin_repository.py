from typing import List, Dict, Any
from src.core.supabase_client import supabase


class AdminRepository:
    def get_overview_metrics(self) -> Dict[str, Any]:
        """Fetches global system metrics for the Super Admin Platform Owner dashboard."""
        recruiters_res = supabase.table("recruiters").select("id, is_allowed, credits_balance, total_ai_tokens_used, total_ai_cost_usd").execute()
        recruiters = recruiters_res.data or []

        total_recruiters = len(recruiters)
        active_recruiters = sum(1 for r in recruiters if r.get("is_allowed", True))
        suspended_recruiters = total_recruiters - active_recruiters
        
        total_tokens = sum(r.get("total_ai_tokens_used", 0) for r in recruiters)
        total_cost = sum(float(r.get("total_ai_cost_usd", 0.0)) for r in recruiters)

        jobs_res = supabase.table("jobs").select("id, status").execute()
        jobs = jobs_res.data or []
        total_jobs = len(jobs)
        active_jobs = sum(1 for j in jobs if j.get("status") == "active")

        apps_res = supabase.table("applications").select("id, status").execute()
        apps = apps_res.data or []
        total_candidates_screened = len(apps)
        total_interviews_completed = sum(1 for a in apps if a.get("status") == "completed")

        return {
            "total_recruiters": total_recruiters,
            "active_recruiters": active_recruiters,
            "suspended_recruiters": suspended_recruiters,
            "total_jobs": total_jobs,
            "active_jobs": active_jobs,
            "total_candidates_screened": total_candidates_screened,
            "total_interviews_completed": total_interviews_completed,
            "total_ai_tokens_consumed": total_tokens,
            "total_ai_cost_usd": round(total_cost, 4)
        }

    def list_all_recruiters(self) -> List[Dict[str, Any]]:
        """Lists all registered recruiter accounts with credit balances and active status."""
        res = supabase.table("recruiters").select("*").order("created_at", desc=True).execute()
        return res.data or []

    def set_user_allowed_status(self, recruiter_id: str, is_allowed: bool) -> Dict[str, Any]:
        """Toggles a recruiter's active status (is_allowed = true/false)."""
        res = supabase.table("recruiters").update({"is_allowed": is_allowed}).eq("id", recruiter_id).execute()
        if res.data:
            return res.data[0]
        raise Exception(f"Recruiter '{recruiter_id}' not found.")

    def topup_credits(self, recruiter_id: str, credits_to_add: int) -> Dict[str, Any]:
        """Tops up a recruiter's evaluation credit balance."""
        res = supabase.table("recruiters").select("credits_balance").eq("id", recruiter_id).execute()
        if not res.data:
            raise Exception(f"Recruiter '{recruiter_id}' not found.")
        
        current_bal = res.data[0].get("credits_balance", 0)
        new_bal = current_bal + credits_to_add
        
        upd = supabase.table("recruiters").update({"credits_balance": new_bal}).eq("id", recruiter_id).execute()
        return upd.data[0]
