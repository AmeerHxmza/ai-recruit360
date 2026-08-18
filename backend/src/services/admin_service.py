from typing import List, Dict, Any
from src.infrastructure.repositories.admin_repository import AdminRepository


class AdminService:
    def __init__(self):
        self.admin_repo = AdminRepository()

    def get_platform_overview(self) -> Dict[str, Any]:
        return self.admin_repo.get_overview_metrics()

    def list_all_recruiters(self) -> List[Dict[str, Any]]:
        return self.admin_repo.list_all_recruiters()

    def toggle_user_status(self, recruiter_id: str, is_allowed: bool) -> Dict[str, Any]:
        return self.admin_repo.set_user_allowed_status(recruiter_id, is_allowed)

    def topup_user_credits(self, recruiter_id: str, credits_to_add: int) -> Dict[str, Any]:
        return self.admin_repo.topup_credits(recruiter_id, credits_to_add)


admin_service = AdminService()
