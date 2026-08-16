import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from src.api.v1.routers import jobs, apply, interview, assessment
from src.core.config import settings

logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI-Recruit360 API Engine",
    description=(
        "Enterprise-grade recruitment intelligence backend — "
        "PyMuPDF resume parsing, LangGraph 3-Node AI screening, and XAI candidate scoring."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware — Allows all origins in development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local dev and testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
# Jobs Router: /api/jobs (Create, List)
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])

# Apply Router: /api/apply (Public candidate resume upload & screening)
app.include_router(apply.router, prefix="/api/apply", tags=["Apply Portal"])

# Assessment Router: /api/assessment (MCQ fetching & evaluation)
app.include_router(assessment.router, prefix="/api/assessment", tags=["Assessment"])

# Interview Router: /api/interview (Question fetching, answer posting, proctoring)
app.include_router(interview.router, prefix="/api/interview", tags=["Interview Room"])
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
        "service": "AI-Recruit360 API Engine",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "endpoints": {
            "jobs": "/api/jobs",
            "apply": "/api/apply/{job_id}",
            "interview_next": "/api/interview/{candidate_id}/next",
            "interview_answer": "/api/interview/{candidate_id}/answer",
            "proctor_log": "/api/interview/{candidate_id}/proctor-log",
        },
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}
