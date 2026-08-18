from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # System Information
    PROJECT_NAME: str = "AI-Recruit360 API Engine"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"

    # Supabase Settings
    SUPABASE_URL: str = "https://your-project-id.supabase.co"
    SUPABASE_SERVICE_KEY: str = "your-service-role-key-here"
    SUPABASE_JWT_SECRET: str = "your-jwt-secret-here"

    # OpenAI & AI Settings
    OPENAI_API_KEY: str = "your-openai-api-key-here"
    OPENAI_MODEL: str = "gpt-4o-mini"
    SIMLI_API_KEY: str = "your-simli-api-key-here"
    SIMLI_FACE_ID: str = "tmp_face_id_123"

    # SaaS Credit Economy Rates
    INITIAL_RECRUITER_CREDITS: int = 100
    CREDIT_COST_JOB_CREATE: int = 5
    CREDIT_COST_APPLICATION_PARSE: int = 1
    CREDIT_COST_INTERVIEW_EVAL: int = 3

    # Default Job Life Cycle
    DEFAULT_JOB_DURATION_DAYS: int = 30

    # Session Cache Settings
    SESSION_CACHE_TTL_SECONDS: int = 7200  # 2 Hours in-memory interview session cache

    # Email Service (SMTP Settings)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = "noreply@ai-recruit360.com"
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "noreply@ai-recruit360.com"

    # CORS Settings
    ALLOWED_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://ai-recruit360.vercel.app"
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
