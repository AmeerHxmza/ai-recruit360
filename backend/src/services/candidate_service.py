import uuid
import csv
import io
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from src.infrastructure.repositories.candidate_repository import CandidateRepository
from src.infrastructure.repositories.job_repository import JobRepository
from src.infrastructure.external.pdf_parser import extract_text_from_pdf
from src.services.ai_agent import run_candidate_screening
from src.services.credit_service import credit_service
from src.core.supabase_client import supabase
from src.core.config import settings
from src.core.exceptions import (
    JobNotFoundError,
    JobExpiredError,
    DuplicateApplicationError,
    PDFParsingError
)


class CandidateService:
    def __init__(self):
        self.candidate_repo = CandidateRepository()
        self.job_repo = JobRepository()

    async def process_candidate_application(
        self,
        job_id: str,
        first_name: str,
        last_name: str,
        email: str,
        pdf_bytes: bytes,
        filename: str = "resume.pdf",
        phone: Optional[str] = None,
        gender: Optional[str] = None,
        city: Optional[str] = None,
        github_url: Optional[str] = None,
        linkedin_url: Optional[str] = None
    ) -> Dict[str, Any]:
        # 1. Fetch & Verify Target Job
        job = self.job_repo.get_by_id(job_id)
        if not job:
            raise JobNotFoundError(job_id)

        # Check Expiration Lifecycle
        exp_str = job.get("expires_at")
        if exp_str:
            try:
                exp_dt = datetime.fromisoformat(exp_str.replace("Z", "+00:00"))
                if datetime.now(timezone.utc) > exp_dt or job.get("status") == "expired":
                    raise JobExpiredError(job.get("title", "Job posting"))
            except JobExpiredError:
                raise
            except Exception:
                pass

        # 2. Check Candidate Duplicate Prevention (Only blocks candidates who PASSED screening)
        if self.candidate_repo.check_duplicate_application(job_id, email, github_url):
            raise DuplicateApplicationError(email)

        # 3. Deduct Recruiter Application Credit if recruiter exists
        recruiter_id = job.get("recruiter_id")
        if recruiter_id:
            try:
                credit_service.verify_and_deduct_credits(
                    recruiter_id=recruiter_id,
                    required_credits=settings.CREDIT_COST_APPLICATION_PARSE,
                    action_name="Process CV Application"
                )
            except Exception:
                pass

        # 4. Extract PDF Resume Text
        resume_text = extract_text_from_pdf(pdf_bytes)

        # 5. Run LangGraph Screening Graph FIRST to evaluate knockout eligibility
        screening = run_candidate_screening(
            resume_text=resume_text,
            job_description=job.get("description", ""),
            gender=gender,
            city=city
        )

        passed_knockout = screening.get("passed_knockout", True)
        knockout_reason = screening.get("knockout_reason", "")
        mcq_data = screening.get("mcq_data", [])
        hr_questions = screening.get("hr_questions", [])

        # 6. Upload PDF Resume to Supabase Storage ONLY IF Candidate PASSED Knockout Screening
        cv_url = ""
        if passed_knockout:
            try:
                file_filename = f"{uuid.uuid4()}_{filename}"
                storage_res = supabase.storage.from_("resumes").upload(file_filename, pdf_bytes)
                if storage_res:
                    cv_url = supabase.storage.from_("resumes").get_public_url(file_filename)
            except Exception:
                cv_url = f"https://storage.supabase.co/resumes/{uuid.uuid4()}.pdf"

        # 7. Get or Create Candidate Profile with real candidate name
        cand_profile = self.candidate_repo.get_or_create_candidate_profile(
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            gender=gender,
            city=city,
            github_url=github_url,
            linkedin_url=linkedin_url
        )

        # 8. Create or Update Application Record
        status_str = "screening" if passed_knockout else "rejected"
        app_data = {
            "job_id": job_id,
            "candidate_id": cand_profile["id"],
            "status": status_str,
            "cv_url": cv_url,
            "resume_text": resume_text,
            "ai_summary": knockout_reason or "Resume screening completed.",
            "match_score": 50 if passed_knockout else 0,
            "hiring_confidence": 50 if passed_knockout else 0,
            "passed_knockout": passed_knockout,
            "knockout_reason": knockout_reason
        }

        # Check if an existing application record exists for (job_id, candidate_id)
        existing_apps = supabase.table("applications")\
            .select("id")\
            .eq("job_id", job_id)\
            .eq("candidate_id", cand_profile["id"])\
            .execute()

        if existing_apps.data:
            existing_id = existing_apps.data[0]["id"]
            app_res = supabase.table("applications").update(app_data).eq("id", existing_id).execute()
            application = app_res.data[0]
        else:
            app_res = supabase.table("applications").insert(app_data).execute()
            application = app_res.data[0]

        # 9. Create or Update Interview Session Record
        existing_interviews = supabase.table("interviews")\
            .select("id")\
            .eq("application_id", application["id"])\
            .execute()

        interview_data = {
            "application_id": application["id"],
            "candidate_id": cand_profile["id"],
            "status": "scheduled",
            "current_question_index": 0,
            "interview_transcript": f"Screening note: {knockout_reason}\n\n" if knockout_reason else ""
        }

        if existing_interviews.data:
            i_id = existing_interviews.data[0]["id"]
            interview_res = supabase.table("interviews").update(interview_data).eq("id", i_id).execute()
            interview = interview_res.data[0]
        else:
            interview_res = supabase.table("interviews").insert(interview_data).execute()
            interview = interview_res.data[0]

        # Store generated questions in questions table
        for idx, q_text in enumerate(hr_questions):
            try:
                supabase.table("questions").insert({
                    "job_id": job_id,
                    "question_text": q_text,
                    "category": "technical"
                }).execute()
            except Exception:
                pass

        return {
            "application_id": application["id"],
            "candidate_id": cand_profile["id"],
            "interview_id": interview["id"],
            "status": application["status"],
            "passed_knockout": passed_knockout,
            "knockout_reason": knockout_reason,
            "mcq_data": mcq_data,
            "questions": hr_questions,
            "cv_url": cv_url
        }

    def get_leaderboard(self, job_id: str) -> List[Dict[str, Any]]:
        return self.candidate_repo.list_job_leaderboard(job_id)

    def export_top_candidates_csv(self, job_id: str) -> str:
        """Generates a CSV string of top candidates ranked by overall AI score."""
        candidates = self.get_leaderboard(job_id)
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow([
            "Rank", "Candidate Name", "Email", "City", "Overall Score",
            "Technical Score", "Problem Solving Score", "Communication Score",
            "Honesty Score", "Knockout Passed", "CV Link", "Applied Date"
        ])
        
        for rank, c in enumerate(candidates, 1):
            writer.writerow([
                rank,
                f"{c['first_name']} {c['last_name']}",
                c['email'],
                c.get('city', ''),
                c['overall_score'],
                c['technical_score'],
                c['problem_solving_score'],
                c['communication_score'],
                c['honesty_score'],
                "YES" if c['passed_knockout'] else "NO",
                c['cv_url'],
                c['applied_at']
            ])
            
        return output.getvalue()


candidate_service = CandidateService()
