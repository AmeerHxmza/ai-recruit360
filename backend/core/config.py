from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str  # service_role key — bypasses RLS
    SUPABASE_JWT_SECRET: str   # From Supabase > Settings > API > JWT Secret
    OPENAI_API_KEY: str        # OpenAI API key — used for GPT-4o-mini
    NEXT_PUBLIC_FASTAPI_URL: str = "http://localhost:8000"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
