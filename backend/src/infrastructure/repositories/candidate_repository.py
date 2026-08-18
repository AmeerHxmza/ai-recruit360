from typing import List, Optional, Dict, Any
from src.infrastructure.repositories.base import BaseRepository
from src.core.supabase_client import supabase


class CandidateRepository(BaseRepository):
    def __init__(self):
        super().__init__("candidates")

    def check_duplicate_application(self, job_id: str, email: str, github_url: Optional[str] = None) -> bool:
        """
        Checks if candidate has already applied and PASSED screening for this specific job_id using email or github_url.
        Knocked-out candidates who failed screening are allowed to re-apply with an updated CV.
        """
        # Check by email
        candidate_res = supabase.table("candidates").select("id").eq("email", email.strip().lower()).execute()
        if candidate_res.data:
            candidate_id = candidate_res.data[0]["id"]
            app_res = supabase.table("applications").select("id, status, passed_knockout").eq("job_id", job_id).eq("candidate_id", candidate_id).execute()
            if app_res.data:
                for app in app_res.data:
                    # Duplicate ONLY if candidate passed screening (passed_knockout is True and status is not rejected)
                    if app.get("passed_knockout") is True and app.get("status") != "rejected":
                        return True

        # Check by github_url if provided
        if github_url and github_url.strip():
            gh_res = supabase.table("candidates").select("id").eq("github_url", github_url.strip()).execute()
            if gh_res.data:
                cid = gh_res.data[0]["id"]
                app_res = supabase.table("applications").select("id, status, passed_knockout").eq("job_id", job_id).eq("candidate_id", cid).execute()
                if app_res.data:
                    for app in app_res.data:
                        if app.get("passed_knockout") is True and app.get("status") != "rejected":
                            return True

        return False

    def get_or_create_candidate_profile(
        self,
        email: str,
        first_name: str,
        last_name: str,
        phone: Optional[str] = None,
        gender: Optional[str] = None,
        city: Optional[str] = None,
        github_url: Optional[str] = None,
        linkedin_url: Optional[str] = None
    ) -> Dict[str, Any]:
        email_clean = email.strip().lower()
        res = supabase.table("candidates").select("*").eq("email", email_clean).execute()
        if res.data:
            # Update candidate profile fields with latest submitted data
            update_data = {
                "first_name": first_name.strip() if first_name else "Candidate",
                "last_name": last_name.strip() if last_name else ""
            }
            if phone: update_data["phone"] = phone
            if gender: update_data["gender"] = gender
            if city: update_data["city"] = city
            if github_url: update_data["github_url"] = github_url
            if linkedin_url: update_data["linkedin_url"] = linkedin_url

            supabase.table("candidates").update(update_data).eq("id", res.data[0]["id"]).execute()
            updated_res = supabase.table("candidates").select("*").eq("id", res.data[0]["id"]).execute()
            return updated_res.data[0] if updated_res.data else res.data[0]

        candidate_data = {
            "email": email_clean,
            "first_name": first_name.strip() if first_name else "Candidate",
            "last_name": last_name.strip() if last_name else "",
            "phone": phone,
            "gender": gender,
            "city": city,
            "github_url": github_url,
            "linkedin_url": linkedin_url
        }
        return self.insert(candidate_data)

    def list_job_leaderboard(self, job_id: str) -> List[Dict[str, Any]]:
        """
        Fetches all applications for a job, joined with candidate info and interview evaluations,
        ordered by overall_score descending.
        """
        res = supabase.table("applications")\
            .select("*, interviews(*, evaluations(*))")\
            .eq("job_id", job_id)\
            .execute()

        apps = res.data or []
        if not apps:
            return []

        # Explicitly query candidate profiles to guarantee first_name and last_name match
        cand_ids = list(set([a["candidate_id"] for a in apps if a.get("candidate_id")]))
        cands_by_id = {}
        if cand_ids:
            c_res = supabase.table("candidates").select("*").in_("id", cand_ids).execute()
            for c in (c_res.data or []):
                cands_by_id[c["id"]] = c

        items = []
        for app in apps:
            cand = cands_by_id.get(app.get("candidate_id"), {})
            interviews = app.get("interviews") or []
            interview = interviews[0] if isinstance(interviews, list) and interviews else (interviews if isinstance(interviews, dict) else {})
            evals = interview.get("evaluations", []) or []
            evaluation = evals[0] if isinstance(evals, list) and evals else (evals if isinstance(evals, dict) else {})

            items.append({
                "id": cand.get("id", app.get("id")),
                "application_id": app.get("id"),
                "job_id": app.get("job_id"),
                "first_name": cand.get("first_name") or "Candidate",
                "last_name": cand.get("last_name") or "",
                "email": cand.get("email", ""),
                "city": cand.get("city"),
                "cv_url": app.get("cv_url", ""),
                "status": app.get("status", "pending"),
                "overall_score": evaluation.get("overall_score") or interview.get("overall_score") or 0,
                "technical_score": evaluation.get("technical_score") or 0,
                "communication_score": evaluation.get("communication_score") or 0,
                "honesty_score": evaluation.get("honesty_score") or interview.get("truthfulness_score") or 0,
                "problem_solving_score": evaluation.get("problem_solving_score") or 0,
                "passed_knockout": app.get("passed_knockout", True),
                "knockout_reason": app.get("knockout_reason"),
                "applied_at": app.get("applied_at", "")
            })

        # Sort by overall score descending
        items.sort(key=lambda x: x["overall_score"], reverse=True)
        return items
