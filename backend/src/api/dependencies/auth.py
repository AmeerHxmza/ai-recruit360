"""
FastAPI Auth & Security Dependency Wrappers
"""

from fastapi import Depends
from src.core.security import (
    get_current_user,
    require_recruiter,
    require_active_recruiter,
    require_super_admin
)

__all__ = [
    "get_current_user",
    "require_recruiter",
    "require_active_recruiter",
    "require_super_admin"
]
