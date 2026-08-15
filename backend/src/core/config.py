from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SUPABASE_URL: str = "https://your-project-id.supabase.co"
    SUPABASE_SERVICE_KEY: str = "your-service-role-key-here"
    SUPABASE_JWT_SECRET: str = "your-jwt-secret-here"
    OPENAI_API_KEY: str = "your-openai-api-key-here"
    SIMLI_API_KEY: str = "your-simli-api-key-here"
    NEXT_PUBLIC_FASTAPI_URL: str = "http://localhost:8000"
    ALLOWED_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://ai-recruit360.vercel.app"
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
