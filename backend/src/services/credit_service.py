import logging
from typing import Dict, Any
from src.core.supabase_client import supabase
from src.core.exceptions import InsufficientCreditsError, AccountSuspendedError
from src.core.config import settings

logger = logging.getLogger(__name__)


class CreditService:
    def verify_and_deduct_credits(self, recruiter_id: str, required_credits: int, action_name: str) -> Dict[str, Any]:
        """
        Validates that recruiter is allowed and has sufficient credit balance.
        Deducts credits transactionally and records metric usage.
        """
        res = supabase.table("recruiters").select("is_allowed, credits_balance, total_credits_used").eq("id", recruiter_id).execute()
        if not res.data:
            raise AccountSuspendedError()

        recruiter = res.data[0]
        if not recruiter.get("is_allowed", True):
            raise AccountSuspendedError()

        balance = recruiter.get("credits_balance", 0)
        if balance < required_credits:
            raise InsufficientCreditsError(required=required_credits, available=balance)

        new_balance = balance - required_credits
        new_total_used = recruiter.get("total_credits_used", 0) + required_credits

        upd = supabase.table("recruiters").update({
            "credits_balance": new_balance,
            "total_credits_used": new_total_used
        }).eq("id", recruiter_id).execute()

        logger.info(f"Deducted {required_credits} credits for '{action_name}' from Recruiter {recruiter_id}. Remaining: {new_balance}")
        return upd.data[0]

    def log_ai_usage(self, recruiter_id: str, tokens_used: int, estimated_cost_usd: float):
        """Logs OpenAI token consumption and estimated USD cost."""
        try:
            res = supabase.table("recruiters").select("total_ai_tokens_used, total_ai_cost_usd").eq("id", recruiter_id).execute()
            if res.data:
                curr_tokens = res.data[0].get("total_ai_tokens_used", 0)
                curr_cost = float(res.data[0].get("total_ai_cost_usd", 0.0))

                supabase.table("recruiters").update({
                    "total_ai_tokens_used": curr_tokens + tokens_used,
                    "total_ai_cost_usd": round(curr_cost + estimated_cost_usd, 4)
                }).eq("id", recruiter_id).execute()
        except Exception as e:
            logger.error(f"Failed to log AI usage for recruiter {recruiter_id}: {e}")


credit_service = CreditService()
