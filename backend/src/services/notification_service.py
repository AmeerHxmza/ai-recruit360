import logging
from typing import List, Dict, Any
from src.infrastructure.external.email_client import send_onsite_interview_email
from src.core.supabase_client import supabase

logger = logging.getLogger(__name__)


class NotificationService:
    def send_onsite_interview_invitations(
        self,
        candidate_ids: List[str],
        subject: str,
        custom_message: str,
        interview_date_location: str
    ) -> Dict[str, Any]:
        """
        Fetches selected candidates' profiles and dispatches customized Onsite Interview Invitation emails.
        """
        success_count = 0
        failed_candidates = []

        for cid in candidate_ids:
            try:
                res = supabase.table("candidates").select("email, first_name, last_name").eq("id", cid).execute()
                if res.data:
                    c = res.data[0]
                    name = f"{c.get('first_name', '')} {c.get('last_name', '')}".strip() or "Applicant"
                    email = c.get("email")

                    if email:
                        sent = send_onsite_interview_email(
                            to_email=email,
                            candidate_name=name,
                            subject=subject,
                            custom_message=custom_message,
                            interview_date_location=interview_date_location
                        )
                        if sent:
                            success_count += 1
                        else:
                            failed_candidates.append(email)
            except Exception as e:
                logger.error(f"Failed to invite candidate {cid}: {e}")
                failed_candidates.append(cid)

        return {
            "message": f"Successfully sent interview invitations to {success_count} candidate(s).",
            "total_sent": success_count,
            "failed_candidates": failed_candidates
        }


notification_service = NotificationService()
