from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from src.core.config import settings
from src.core.supabase_client import supabase

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    Validates a Supabase-issued JWT and returns the user payload.
    Uses Supabase Auth API verification with fallback to JWT decode.
    """
    token = credentials.credentials
    try:
        # First try official Supabase Auth verification
        user_response = supabase.auth.get_user(token)
        if user_response and user_response.user:
            return {
                "user_id": str(user_response.user.id),
                "email": user_response.user.email,
                "role": user_response.user.role
            }
    except Exception:
        pass

    # Fallback to local JWT decode if JWT secret is configured
    try:
        issuer = f"{settings.SUPABASE_URL}/auth/v1"
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
                detail="Invalid authentication token",
            )
        return {
            "user_id": user_id,
            "email": payload.get("email", ""),
        }
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
        )

# Alias get_current_recruiter for semantic clarity across routers
get_current_recruiter = get_current_user
