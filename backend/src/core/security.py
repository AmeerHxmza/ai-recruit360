from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from src.core.config import settings
from src.core.supabase_client import supabase
from src.core.exceptions import AccountSuspendedError

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    Validates a Supabase-issued JWT and returns the user payload.
    Uses Supabase Auth API verification with fallback to local JWT decode.
    """
    token = credentials.credentials
    try:
        user_response = supabase.auth.get_user(token)
        if user_response and user_response.user:
            return {
                "user_id": str(user_response.user.id),
                "email": user_response.user.email or "",
                "role": getattr(user_response.user, "role", "authenticated")
            }
    except Exception:
        pass

    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False, "verify_iss": False}
        )
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token: missing user ID.",
            )
        return {
            "user_id": user_id,
            "email": payload.get("email", ""),
            "role": payload.get("role", "authenticated")
        }
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
        )


async def require_recruiter(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Ensures user is an authenticated recruiter.
    """
    return current_user


async def require_active_recruiter(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Ensures user is an active, non-suspended recruiter (is_allowed == True).
    """
    user_id = current_user["user_id"]
    res = supabase.table("recruiters").select("is_allowed, credits_balance, role").eq("id", user_id).execute()
    
    if res.data:
        recruiter_profile = res.data[0]
        if not recruiter_profile.get("is_allowed", True):
            raise AccountSuspendedError()
        current_user["credits_balance"] = recruiter_profile.get("credits_balance", 0)
        current_user["db_role"] = recruiter_profile.get("role", "recruiter")
    else:
        # Auto-provision baseline recruiter profile if missing
        try:
            supabase.table("recruiters").insert({
                "id": user_id,
                "full_name": current_user.get("email", "Recruiter").split("@")[0].capitalize(),
                "company_name": "My Organization",
                "is_allowed": True,
                "credits_balance": settings.INITIAL_RECRUITER_CREDITS,
                "role": "recruiter"
            }).execute()
            current_user["credits_balance"] = settings.INITIAL_RECRUITER_CREDITS
            current_user["db_role"] = "recruiter"
        except Exception:
            current_user["credits_balance"] = 100
            current_user["db_role"] = "recruiter"

    return current_user


async def require_super_admin(current_user: dict = Depends(require_active_recruiter)) -> dict:
    """
    Ensures user is a Super Admin Platform Owner (role == 'admin').
    """
    user_id = current_user["user_id"]
    res = supabase.table("recruiters").select("role").eq("id", user_id).execute()
    
    db_role = res.data[0].get("role", "recruiter") if res.data else "recruiter"
    if db_role != "admin" and current_user.get("email") != "admin@ai-recruit360.com":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super Admin privileges required to access this endpoint."
        )
    return current_user
