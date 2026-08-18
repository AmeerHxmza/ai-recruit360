from fastapi import APIRouter, Depends, HTTPException, status
from src.api.dependencies.auth import require_super_admin
from src.services.admin_service import admin_service
from src.domain.schemas.admin import (
    UserStatusToggleRequest,
    CreditTopupRequest
)

router = APIRouter()


@router.get("/overview")
async def get_admin_overview(current_user: dict = Depends(require_super_admin)):
    """
    Super Admin Endpoint: Fetches platform-wide SaaS metrics (Total Users, Tokens Consumed, System Cost USD).
    """
    try:
        return admin_service.get_platform_overview()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch admin metrics: {str(e)}")


@router.get("/users")
async def list_all_users(current_user: dict = Depends(require_super_admin)):
    """
    Super Admin Endpoint: Lists all registered recruiter user accounts with credit balances and active status.
    """
    try:
        users = admin_service.list_all_recruiters()
        return {"total_users": len(users), "users": users}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch recruiter list: {str(e)}")


@router.patch("/users/{user_id}/status")
async def toggle_user_status(
    user_id: str,
    payload: UserStatusToggleRequest,
    current_user: dict = Depends(require_super_admin)
):
    """
    Super Admin Endpoint: Enables (is_allowed = true) or suspends (is_allowed = false) a recruiter account.
    """
    try:
        updated = admin_service.toggle_user_status(user_id, payload.is_allowed)
        status_text = "activated" if payload.is_allowed else "suspended"
        return {
            "message": f"User '{user_id}' has been {status_text}.",
            "user": updated
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/users/{user_id}/topup")
async def topup_user_credits(
    user_id: str,
    payload: CreditTopupRequest,
    current_user: dict = Depends(require_super_admin)
):
    """
    Super Admin Endpoint: Tops up evaluation credits for a recruiter user account.
    """
    try:
        updated = admin_service.topup_user_credits(user_id, payload.credits_to_add)
        return {
            "message": f"Added {payload.credits_to_add} credits to User '{user_id}'. New Balance: {updated.get('credits_balance')}",
            "user": updated
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
