import os
from dotenv import load_dotenv

load_dotenv()

from src.api.v1.routers.jobs import enhance_job_description, JobEnhanceRequest
import asyncio

async def test_enhance():
    print("Testing POST /api/jobs/enhance Endpoint...")
    req = JobEnhanceRequest(
        title="Senior Python & Next.js Engineer",
        department="Engineering",
        description="Looking for 4+ years experience with FastAPI, Next.js App Router, Tailwind CSS, PostgreSQL, and Docker. Remote friendly."
    )

    res = await enhance_job_description(req)
    print("\n--- AI ENHANCED JOB DESCRIPTION ---")
    print(res["enhanced_description"])

if __name__ == "__main__":
    asyncio.run(test_enhance())
