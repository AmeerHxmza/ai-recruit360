from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import jobs, candidates, apply

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
    allow_origins=[
        "http://localhost:3000",        # Next.js dev
        "http://localhost:3001",
        "https://ai-recruit360.vercel.app",  # Production (update with your domain)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
# Jobs: /api/v1/jobs  (list, create, get, update, delete, close)
app.include_router(jobs.router, prefix="/api/v1/jobs", tags=["Jobs"])

# Candidates: /api/v1/candidates  (list, detail, process, action, notes)
# Also mounted at legacy /api/candidates for backward-compat with upload modal
app.include_router(candidates.router, prefix="/api/v1/candidates", tags=["Candidates"])
app.include_router(candidates.router, prefix="/api/candidates", tags=["Candidates (legacy)"], include_in_schema=False)

# Apply Portal: /api/apply  (submit application, submit interview)
app.include_router(apply.router, prefix="/api/apply", tags=["Apply Portal"])
# ──────────────────────────────────────────────────────────────────────────────


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
