import logging
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from src.api.router import api_router
from src.core.config import settings
from src.core.session_cache import session_cache
from src.core.exceptions import DomainException

# Logging Configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ai_recruit360")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Handles startup background tasks and session cache cleanup on shutdown.
    """
    logger.info("Initializing AI-Recruit360 Backend Engine...")
    
    # Background task for in-memory session cache eviction
    async def session_cache_cleanup_task():
        while True:
            await asyncio.sleep(600)  # Run cleanup every 10 minutes
            await session_cache.cleanup_expired_sessions(settings.SESSION_CACHE_TTL_SECONDS)

    cleanup_task = asyncio.create_task(session_cache_cleanup_task())

    yield

    logger.info("Shutting down AI-Recruit360 Backend Engine...")
    cleanup_task.cancel()


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "Enterprise-Grade Autonomous AI Recruitment Intelligence Backend Engine — "
        "PyMuPDF CV parsing, LangGraph 3-Node screening, 4D Explainable AI scoring, "
        "Simli AI Video Avatar streaming, Super Admin Governance, and B2B SaaS Credit Economy."
    ),
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development & deployment flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Register Routers ─────────────────────────────────────────────────────────
# Main API v1 Router: /api/v1
app.include_router(api_router, prefix="/api/v1")

# Backward Compatibility Router Mount: /api
app.include_router(api_router, prefix="/api")
# ──────────────────────────────────────────────────────────────────────────────


@app.exception_handler(DomainException)
async def domain_exception_handler(request: Request, exc: DomainException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message, "error": exc.__class__.__name__}
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled system error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred.", "error": str(exc)}
    )


@app.get("/", tags=["Health"])
async def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "running",
        "docs": "/docs",
        "endpoints": {
            "jobs": "/api/v1/jobs",
            "apply": "/api/v1/apply/{job_id}",
            "interview_next": "/api/v1/interview/{candidate_id}/next",
            "interview_answer": "/api/v1/interview/{candidate_id}/answer",
            "avatar_session": "/api/v1/interview/avatar-session",
            "admin_overview": "/api/v1/admin/overview"
        }
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok", "service": settings.PROJECT_NAME}
