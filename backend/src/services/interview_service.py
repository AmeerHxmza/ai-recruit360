import logging
from typing import Dict, Any, List, Optional
from src.core.session_cache import session_cache
from src.infrastructure.repositories.interview_repository import InterviewRepository
from src.infrastructure.repositories.candidate_repository import CandidateRepository
from src.infrastructure.repositories.proctor_repository import ProctorRepository
from src.services.evaluation_service import evaluation_service
from src.services.credit_service import credit_service
from src.core.supabase_client import supabase
from src.core.config import settings
from src.core.exceptions import CandidateNotFoundError, SessionExpiredError

logger = logging.getLogger(__name__)


class InterviewService:
    def __init__(self):
        self.interview_repo = InterviewRepository()
        self.candidate_repo = CandidateRepository()
        self.proctor_repo = ProctorRepository()

    async def get_next_question(self, candidate_id: str) -> Dict[str, Any]:
        """
        Fetches current question with ultra-low latency (<1ms) from In-Memory Session Cache.
        Fallbacks to Supabase DB if cache miss.
        """
        session = await session_cache.get_session(candidate_id)
        if session:
            q_text = session.get_current_question()
            if not q_text:
                return {
                    "completed": True,
                    "message": "Interview completed! Thank you for your time.",
                    "current_question_index": session.current_index,
                    "total_questions": len(session.questions),
                    "question": None
                }
            return {
                "completed": False,
                "candidate_name": session.candidate_name,
                "current_question_index": session.current_index,
                "total_questions": len(session.questions),
                "question": q_text
            }

        # Fallback to Supabase Database
        cand_res = supabase.table("candidates").select("*, applications(*, jobs(*))").eq("id", candidate_id).execute()
        if not cand_res.data:
            raise CandidateNotFoundError(candidate_id)

        cand = cand_res.data[0]
        apps = cand.get("applications", [])
        app = apps[0] if isinstance(apps, list) and apps else (apps if isinstance(apps, dict) else {})
        job = app.get("jobs", {}) if isinstance(app, dict) else {}
        
        # Fetch job questions
        q_res = supabase.table("questions").select("question_text").eq("job_id", app.get("job_id")).execute()
        questions = [q["question_text"] for q in (q_res.data or [])]
        if not questions:
            questions = [
                "Can you walk me through the most significant project listed on your resume?",
                "What specific technical role did you play in your team for your latest software release?",
                "How do you approach communicating technical requirements to non-technical stakeholders?",
                "Describe a situation where a project deadline was at risk and how you handled it.",
                "Why are you interested in joining our engineering team for this specific role?"
            ]

        # Initialize session cache
        cand_name = f"{cand.get('first_name', '')} {cand.get('last_name', '')}".strip() or "Candidate"
        session = await session_cache.get_or_create_session(
            candidate_id=candidate_id,
            candidate_name=cand_name,
            job_id=app.get("job_id", ""),
            job_description=job.get("description", ""),
            questions=questions
        )

        q_text = session.get_current_question()
        return {
            "completed": False,
            "candidate_name": session.candidate_name,
            "current_question_index": session.current_index,
            "total_questions": len(session.questions),
            "question": q_text
        }

    async def submit_answer(self, candidate_id: str, answer_text: str) -> Dict[str, Any]:
        """
        Appends answer to session cache in memory (<1ms).
        On final question completion, triggers async evaluation flush to database.
        """
        session = await session_cache.get_session(candidate_id)
        if not session:
            # Load session into cache
            await self.get_next_question(candidate_id)
            session = await session_cache.get_session(candidate_id)
            if not session:
                raise SessionExpiredError(candidate_id)

        result = session.record_answer(answer_text)
        is_completed = result["is_completed"]

        if is_completed:
            # Asynchronously flush interview results and run XAI evaluation
            asyncio.create_task(self.flush_completed_interview(session))

        return {
            "message": "Answer recorded successfully.",
            "next_question_index": result["next_question_index"],
            "total_questions": result["total_questions"],
            "interview_completed": is_completed
        }

    async def flush_completed_interview(self, session):
        """Flushes in-memory transcript, proctor logs, and runs 4D XAI evaluation to Supabase DB."""
        try:
            candidate_id = session.candidate_id
            transcript = "".join(session.transcript_parts)
            proctor_events = session.proctor_events

            # Fetch application record
            app_res = supabase.table("applications").select("id, job_id, jobs(recruiter_id)").eq("candidate_id", candidate_id).execute()
            if not app_res.data:
                return

            app = app_res.data[0]
            application_id = app["id"]
            job_id = app["job_id"]
            recruiter_id = app.get("jobs", {}).get("recruiter_id") if app.get("jobs") else None

            # Get or create DB interview record
            interview_db = self.interview_repo.get_or_create_interview_session(application_id, candidate_id)
            interview_id = interview_db["id"]

            # Save proctor logs to DB
            for pe in proctor_events:
                self.proctor_repo.record_proctor_event(
                    interview_id=interview_id,
                    candidate_id=candidate_id,
                    event_type=pe["event_type"],
                    description=pe.get("description"),
                    severity=pe.get("severity", "warning")
                )

            # Deduct evaluation credits if recruiter exists
            if recruiter_id:
                try:
                    credit_service.verify_and_deduct_credits(
                        recruiter_id=recruiter_id,
                        required_credits=settings.CREDIT_COST_INTERVIEW_EVAL,
                        action_name="XAI Candidate Evaluation"
                    )
                except Exception:
                    pass

            # Run 4D XAI Evaluation Service
            eval_res = await evaluation_service.evaluate_interview_session(
                candidate_id=candidate_id,
                job_description=session.job_description,
                transcript=transcript,
                proctor_events=proctor_events
            )

            scores = eval_res.get("scores", {})
            tech_score = scores.get("technical_score", 75)
            comm_score = scores.get("communication_score", 80)
            honesty_score = scores.get("honesty_score", 85)
            problem_score = scores.get("problem_solving_score", 75)
            overall_score = scores.get("overall_score", 79)
            xai = eval_res.get("xai_reasoning", {})

            # Save evaluation results to Supabase DB
            self.interview_repo.save_interview_evaluation(
                interview_id=interview_id,
                application_id=application_id,
                overall_score=overall_score,
                truthfulness_score=honesty_score,
                technical_score=tech_score,
                communication_score=comm_score,
                honesty_score=honesty_score,
                problem_solving_score=problem_score,
                xai_reasoning=xai,
                strengths=eval_res.get("strengths", []),
                red_flags=eval_res.get("red_flags", [])
            )

            # Remove session from in-memory cache
            await session_cache.remove_session(candidate_id)
            logger.info(f"Successfully flushed interview and XAI evaluation for Candidate {candidate_id}")

        except Exception as e:
            logger.error(f"Failed to flush interview session for candidate {session.candidate_id}: {e}", exc_info=True)


interview_service = InterviewService()
