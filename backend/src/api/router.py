from fastapi import APIRouter
from src.api.v1.routers import jobs, candidates, apply, interview, proctor, admin, assessment

api_router = APIRouter()

# Register v1 Routers
api_router.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
api_router.include_router(candidates.router, prefix="/candidates", tags=["Candidates"])
api_router.include_router(apply.router, prefix="/apply", tags=["Candidate Apply Portal"])
api_router.include_router(interview.router, prefix="/interview", tags=["Candidate Interview Room"])
api_router.include_router(proctor.router, prefix="/proctor", tags=["Anti-Cheat Telemetry"])
api_router.include_router(admin.router, prefix="/admin", tags=["Super Admin Governance"])
api_router.include_router(assessment.router, prefix="/assessment", tags=["MCQ Assessment"])
