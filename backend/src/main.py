from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from routers import jobs, candidates, apply
from core.config import settings
import logging

logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI-Recruit360 API",
    description=(
        "AI-powered recruitment intelligence backend — "
        "resume parsing, interview evaluation, and hiring confidence scoring."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow Next.js dev and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
# Jobs: /api/v1/jobs  (list, create, get, update, delete, close)
app.include_router(jobs.router, prefix="/api/v1/jobs", tags=["Jobs"])

app.include_router(candidates.router, prefix="/api/v1/candidates", tags=["Candidates"])

# Apply Portal: /api/apply  (submit application, submit interview)
app.include_router(apply.router, prefix="/api/apply", tags=["Apply Portal"])
# ──────────────────────────────────────────────────────────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred.", "error": str(exc)},
    )

@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "AI-Recruit360 API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "routes": {
            "jobs":       "/api/v1/jobs",
            "candidates": "/api/v1/candidates",
            "apply":      "/api/apply",
        },
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}
