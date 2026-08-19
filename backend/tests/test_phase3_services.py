import os
import sys
import uuid
from dotenv import load_dotenv

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

from fastapi.testclient import TestClient
from jose import jwt
from src.main import app
from src.core.supabase_client import supabase
from src.core.config import settings

client = TestClient(app)

def run_phase3_verification():
    print("=== PHASE 3: ADMIN GOVERNANCE, PROCTORING & SERVICES VERIFICATION ===")
    
    # 1. Super Admin Authentication Setup
    print("[1] Setting up Super Admin Test Tokens...")
    admin_uuid = str(uuid.uuid4())
    admin_payload = {
        "sub": admin_uuid,
        "email": "admin@ai-recruit360.com",
        "role": "authenticated"
    }
    admin_token = jwt.encode(admin_payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    recruiter_uuid = str(uuid.uuid4())
    recruiter_payload = {
        "sub": recruiter_uuid,
        "email": f"recruiter.{uuid.uuid4().hex[:6]}@example.com",
        "role": "authenticated"
    }
    non_admin_token = jwt.encode(recruiter_payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")
    non_admin_headers = {"Authorization": f"Bearer {non_admin_token}"}

    # 2. Testing Super Admin Authorization Protection
    print("\n[2] Testing Super Admin RBAC Authorization...")
    unauth_res = client.get("/api/v1/admin/overview")
    assert unauth_res.status_code in [401, 403], f"Expected 401/403 for unauthenticated request, got {unauth_res.status_code}"
    
    forbidden_res = client.get("/api/v1/admin/overview", headers=non_admin_headers)
    assert forbidden_res.status_code == 403, f"Expected 403 for non-admin user, got {forbidden_res.status_code}"
    print("  - RBAC Enforcement Passed: Non-admin users blocked with 403 Forbidden")

    # 3. Super Admin Overview Dashboard Metrics
    print("\n[3] Testing GET /api/v1/admin/overview...")
    overview_res = client.get("/api/v1/admin/overview", headers=admin_headers)
    assert overview_res.status_code == 200, f"Overview failed! Status {overview_res.status_code}: {overview_res.text}"
    overview_data = overview_res.json()
    print(f"  - Metrics Retrieved: Total Recruiters: {overview_data.get('total_recruiters', 0)}, Active Jobs: {overview_data.get('total_active_jobs', 0)}")

    # 4. Super Admin Recruiter Listing & Credit Management
    print("\n[4] Testing GET /api/v1/admin/users & Credit Management...")
    users_res = client.get("/api/v1/admin/users", headers=admin_headers)
    assert users_res.status_code == 200, f"List users failed! Status {users_res.status_code}"
    users_data = users_res.json()
    print(f"  - Total Recruiter Accounts: {users_data.get('total_users')}")
    
    if users_data.get("users"):
        target_user = users_data["users"][0]
        user_id = target_user["id"]
        
        # Test Topup
        topup_res = client.post(
            f"/api/v1/admin/users/{user_id}/topup",
            json={"credits_to_add": 25},
            headers=admin_headers
        )
        assert topup_res.status_code == 200, f"Credit topup failed: {topup_res.text}"
        print(f"  - Credit Top-up Passed: Added 25 credits to User {user_id[:8]}...")
        
        # Test Status Toggle
        toggle_res = client.patch(
            f"/api/v1/admin/users/{user_id}/status",
            json={"is_allowed": True},
            headers=admin_headers
        )
        assert toggle_res.status_code == 200, f"Status toggle failed: {toggle_res.text}"
        print(f"  - User Status Toggle Passed for User {user_id[:8]}...")

    # 5. Anti-Cheat Proctoring Endpoint
    print("\n[5] Testing Anti-Cheat Telemetry Logging POST /api/v1/proctor/{candidate_id}/log...")
    dummy_candidate_id = str(uuid.uuid4())
    proctor_res = client.post(
        f"/api/v1/proctor/{dummy_candidate_id}/log",
        json={"event_type": "MULTIPLE_FACES", "description": "Secondary face detected", "severity": "high"}
    )
    assert proctor_res.status_code == 200, f"Proctor log failed: {proctor_res.text}"
    assert proctor_res.json().get("status") == "logged", "Proctor status mismatch!"
    print("  - Proctor Log Telemetry Recorded Successfully")

    # 6. Simli AI Avatar Session Endpoint
    print("\n[6] Testing Simli AI Avatar Session Creation POST /api/v1/interview/avatar-session...")
    avatar_res = client.post("/api/v1/interview/avatar-session", json={"candidate_id": dummy_candidate_id, "face_id": "tmp_face_id"})
    assert avatar_res.status_code == 200, f"Avatar session failed: {avatar_res.text}"
    avatar_json = avatar_res.json()
    print(f"  - Avatar Session Created: Session ID: {avatar_json.get('session_id')}, Mode: {avatar_json.get('mode')}")

    # 7. MCQ Assessment Endpoints
    print("\n[7] Testing MCQ Assessment GET /mcqs & POST /submit...")
    # Fetch candidate for MCQ test
    cands = supabase.table("candidates").select("id").limit(1).execute()
    if cands.data:
        cand_id = cands.data[0]["id"]
        mcq_get_res = client.get(f"/api/v1/assessment/{cand_id}/mcqs")
        assert mcq_get_res.status_code == 200, f"MCQ fetch failed: {mcq_get_res.text}"
        print(f"  - MCQ Assessment Questions Fetched for Candidate {cand_id[:8]}: Count = {mcq_get_res.json().get('total_questions')}")
        
        submit_res = client.post(
            "/api/v1/assessment/submit",
            json={
                "candidate_id": cand_id,
                "answers": {"0": "A", "1": "B"}
            }
        )
        assert submit_res.status_code == 200, f"MCQ submit failed: {submit_res.text}"
        print(f"  - MCQ Submission Processed: Calculated Score = {submit_res.json().get('mcq_score')}/100")

    print("\n=== PHASE 3 RESULT: GREEN (ALL ADMIN, PROCTOR & SERVICE TESTS PASSED) ===")

if __name__ == "__main__":
    run_phase3_verification()
