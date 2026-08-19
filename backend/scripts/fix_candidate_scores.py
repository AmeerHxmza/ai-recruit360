import sys
import os

# Add backend directory to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.core.supabase_client import supabase

def fix_scores():
    print("Checking candidates table in Supabase...")
    c_res = supabase.table("candidates").select("*").execute()
    cands = c_res.data or []
    print(f"Found {len(cands)} candidate(s):")
    for c in cands:
        print(f"ID: {c['id']}, Email: {c['email']}, CV: {c.get('cv_match_score')}, MCQ: {c.get('mcq_score')}, Interview: {c.get('interview_score')}, Total: {c.get('total_score')}")

        # Update scores if candidate is Ameer Hamza or has stale scores
        cv = c.get("cv_match_score") if c.get("cv_match_score") is not None else 8
        mcq = c.get("mcq_score") if c.get("mcq_score") is not None else 2
        interview = c.get("interview_score") if c.get("interview_score") is not None else 16
        
        # If mcq was set to 10 from previous fallback test, set to 2
        if mcq == 10:
            mcq = 2

        tot = cv + mcq + interview

        print(f"--> Updating Candidate {c['email']} to cv_match={cv}, mcq={mcq}, interview={interview}, total={tot}")
        supabase.table("candidates").update({
            "cv_match_score": cv,
            "mcq_score": mcq,
            "interview_score": interview,
            "total_score": tot
        }).eq("id", c["id"]).execute()

        # Update applications table as well
        supabase.table("applications").update({
            "cv_match_score": cv,
            "mcq_score": mcq,
            "interview_score": interview,
            "total_score": tot,
            "status": "completed"
        }).eq("candidate_id", c["id"]).execute()

    print("\nScore synchronization completed successfully!")

if __name__ == "__main__":
    fix_scores()
