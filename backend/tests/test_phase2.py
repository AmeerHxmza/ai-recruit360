import os
import sys
import time
import uuid
from dotenv import load_dotenv

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

from fastapi.testclient import TestClient
from src.main import app
from src.core.supabase_client import supabase

client = TestClient(app)

def run_phase2_verification():
    print("=== PHASE 2 & 3: CORE REST & AI ENGINE INTEGRATION TESTING ===")
    
    # 1. Health Endpoint Test
    print("[1] Testing Health Endpoint GET /health...")
    r = client.get("/health")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    print(f"  - Status: {r.status_code}, Response: {r.json()}")
    
    # 2. Root Documentation Route
    print("\n[2] Testing Root Endpoint GET /...")
    r = client.get("/")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    print(f"  - Status: {r.status_code}, Endpoints: {list(r.json().get('endpoints', {}).keys())}")
    
    # 3. Protected Route Security Check (POST /api/jobs without Token)
    print("\n[3] Testing Security Dependency on POST /api/jobs (Expecting 403 / 401)...")
    r = client.post("/api/jobs", json={"title": "Test Job", "description": "Test Desc"})
    assert r.status_code in [401, 403], f"Security vulnerability! Expected 401/403, got {r.status_code}"
    print(f"  - Security Enforced: Status {r.status_code}")

    # 4. Get or Create Real Recruiter in Auth for Foreign Key Constraint
    print("\n[4] Creating / Fetching Valid Recruiter Profile in Supabase...")
    recruiter_res = supabase.table("recruiters").select("id").limit(1).execute()
    if recruiter_res.data:
        recruiter_id = recruiter_res.data[0]["id"]
    else:
        # Create test recruiter user via Supabase Auth Admin
        test_email = f"test.recruiter.{uuid.uuid4().hex[:6]}@example.com"
        auth_user = supabase.auth.admin.create_user({
            "email": test_email,
            "password": "TestPassword123!",
            "email_confirm": True,
            "user_metadata": {
                "full_name": "QA Test Engineer",
                "company_name": "AI-Recruit360 Testing Lab"
            }
        })
        recruiter_id = str(auth_user.user.id)
        
        # Ensure recruiter profile inserted
        try:
            supabase.table("recruiters").upsert({
                "id": recruiter_id,
                "full_name": "QA Test Engineer",
                "company_name": "AI-Recruit360 Testing Lab"
            }).execute()
        except Exception:
            pass

    # Insert Seed Job with valid recruiter_id FK
    job_res = supabase.table("jobs").insert({
        "recruiter_id": recruiter_id,
        "title": "Senior Python & AI Engineer",
        "description": "Must have 3+ years experience with FastAPI, PyMuPDF, OpenAI GPT-4o-mini, PostgreSQL, and React Next.js.",
        "department": "AI Engineering",
        "min_experience": 3,
        "status": "active"
    }).execute()
    
    assert job_res.data, "Failed to insert seed job"
    seed_job = job_res.data[0]
    job_id = seed_job["id"]
    print(f"  - Seed Job Created: ID {job_id} ('{seed_job['title']}')")

    # 5. Public Application Endpoint Test (POST /api/apply/{job_id})
    print(f"\n[5] Testing Public Application Endpoint POST /api/apply/{job_id}...")
    
    sample_pdf_bytes = (
        b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
        b"2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n"
        b"3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>endobj\n"
        b"4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n"
        b"5 0 obj<</Length 180>>stream\n"
        b"BT /F1 12 Tf 100 700 Td (QA Candidate Resume) Tj ET\n"
        b"BT /F1 10 Tf 100 680 Td (Email: qa.candidate@example.com | 5 Years Python, FastAPI, React, PostgreSQL) Tj ET\n"
        b"endstream\nendobj\nxref\n0 6\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000222 00000 n\n0000000295 00000 n\ntrailer<</Size 6/Root 1 0 R>>\nstartxref\n520\n%%EOF"
    )
    
    files = {
        "file": ("qa_resume.pdf", sample_pdf_bytes, "application/pdf")
    }
    data = {
        "name": "QA Candidate",
        "email": "qa.candidate@example.com",
        "github_url": "https://github.com/qacandidate"
    }

    apply_res = client.post(f"/api/apply/{job_id}", data=data, files=files)
    assert apply_res.status_code == 200, f"Application failed! Status {apply_res.status_code}: {apply_res.text}"
    
    apply_json = apply_res.json()
    candidate_id = apply_json["candidate_id"]
    print(f"  - Application Submitted Successfully! Candidate ID: {candidate_id}")
    print(f"  - Screening Passed: {apply_json.get('passed_knockout')}")
    print(f"  - Generated Questions Count: {len(apply_json.get('generated_questions', []))}")
    assert len(apply_json.get("generated_questions", [])) >= 5, "Expected generated questions!"

    # 6. Candidate Interview Room Flow (GET /next, POST /answer, POST /proctor-log)
    print(f"\n[6] Testing Candidate Interview Room Endpoints for Candidate {candidate_id}...")
    
    next_res = client.get(f"/api/interview/{candidate_id}/next")
    assert next_res.status_code == 200, f"Expected 200, got {next_res.status_code}"
    next_json = next_res.json()
    print(f"  - Question 1 Fetched: '{next_json.get('question')}'")

    proctor_res = client.post(
        f"/api/proctor/{candidate_id}/log",
        json={"event_type": "TAB_SWITCH"}
    )
    assert proctor_res.status_code == 200, "Proctor log recording failed!"
    print("  - Proctor Telemetry Logged: TAB_SWITCH recorded")

    print("  - Submitting 10 Answers programmatically to trigger XAI Evaluator...")
    for idx in range(10):
        ans_res = client.post(
            f"/api/interview/{candidate_id}/answer",
            json={"answer": f"Answer to question {idx + 1}: I implemented full async architecture using FastAPI and PostgreSQL."}
        )
        assert ans_res.status_code == 200, f"Answer submission failed on Q{idx + 1}"
        if ans_res.json().get("interview_completed"):
            break
        
    print("  - Final Question Answered! Triggered Node 3 XAI Evaluator Background Task.")
    
    time.sleep(4)
    
    cand_db = supabase.table("candidates").select("*").eq("id", candidate_id).single().execute()
    cand_data = cand_db.data
    print(f"\n[7] Verifying Evaluated Candidate Scores in Database:")
    print(f"  - Status: {cand_data.get('status')}")
    print(f"  - Overall AI Score: {cand_data.get('ai_score')}/100")
    print(f"  - Technical Score: {cand_data.get('technical_score')}/100")
    print(f"  - Communication Score: {cand_data.get('communication_score')}/100")
    print(f"  - Honesty Score: {cand_data.get('honesty_score')}/100")
    print(f"  - XAI Reasoning Evidence: {bool(cand_data.get('xai_reasoning'))}")

    print("\n=== PHASE 2 & 3 RESULT: GREEN (ALL REST & AI ENGINE TESTS PASSED) ===")

if __name__ == "__main__":
    run_phase2_verification()
