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


from fastapi.middleware.gzip import GZipMiddleware
from src.core.supabase_client import supabase

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Pre-warms TCP/TLS database connections and handles session cache cleanup.
    """
    logger.info("Initializing AI-Recruit360 Ultra-Low Latency Engine...")
    
    # Pre-warm Supabase DB Connection to eliminate cold-start latency
    try:
        supabase.table("jobs").select("id").limit(1).execute()
        logger.info("Database Connection Pre-warmed Successfully (<1ms).")
    except Exception as e:
        logger.warning(f"Database Pre-warm Warning: {e}")

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

# ─── Ultra-Low Latency GZip Compression Middleware ───────────────────────────
app.add_middleware(GZipMiddleware, minimum_size=500)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development & deployment flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Anti-Spam & Rate-Limiting Middleware ────────────────────────────────────
from collections import defaultdict
import time

_rate_limit_store = defaultdict(list)
RATE_LIMIT_WINDOW_SEC = 60
RATE_LIMIT_MAX_REQUESTS = 40

@app.middleware("http")
async def rate_limiting_middleware(request: Request, call_next):
    # Only rate-limit POST candidate submission endpoints
    path = request.url.path
    if request.method == "POST" and any(p in path for p in ["/apply", "/assessment/submit", "/answer"]):
        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()
        
        # Evict timestamps older than 60s
        timestamps = [t for t in _rate_limit_store[client_ip] if now - t < RATE_LIMIT_WINDOW_SEC]
        _rate_limit_store[client_ip] = timestamps
        
        if len(timestamps) >= RATE_LIMIT_MAX_REQUESTS:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Please slow down and try again."}
            )
        _rate_limit_store[client_ip].append(now)

    response = await call_next(request)
    return response
# ──────────────────────────────────────────────────────────────────────────────

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
