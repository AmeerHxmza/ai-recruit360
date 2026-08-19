import logging
import asyncio
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
            # Synchronously flush interview results and run XAI evaluation
            try:
                await self.flush_completed_interview(session)
            except Exception as e:
                logger.error(f"Error executing flush_completed_interview: {e}")

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

            # Run 4D XAI Evaluation Service for Stage 3 (0-20 Marks)
            eval_res = await evaluation_service.evaluate_interview_session(
                candidate_id=candidate_id,
                job_description=session.job_description,
                transcript=transcript,
                proctor_events=proctor_events
            )

            scores = eval_res.get("scores", {})
            interview_score_20 = scores.get("interview_score", 16)

            # Fetch candidate's exact Stage 1 (CV Match /10) and Stage 2 (MCQ /20) scores from DB
            cv_match_score_10 = 8
            mcq_score_20 = 2
            try:
                cand_data = supabase.table("candidates").select("cv_match_score, mcq_score").eq("id", candidate_id).execute()
                if cand_data.data:
                    c = cand_data.data[0]
                    if c.get("cv_match_score") is not None:
                        cv_match_score_10 = c.get("cv_match_score")
                    if c.get("mcq_score") is not None:
                        mcq_score_20 = c.get("mcq_score")
            except Exception:
                pass

            # Calculate Composite 50-Mark Total Score
            total_score_50 = cv_match_score_10 + mcq_score_20 + interview_score_20

            # Save evaluation results and composite 50-mark score to Supabase DB
            self.interview_repo.save_interview_evaluation(
                interview_id=interview_id,
                application_id=application_id,
                overall_score=total_score_50,
                truthfulness_score=100 - min(60, len(proctor_events) * 20),
                technical_score=scores.get("technical_score", 16),
                communication_score=scores.get("communication_score", 17),
                honesty_score=100 - min(60, len(proctor_events) * 20),
                problem_solving_score=scores.get("behavioral_score", 15),
                xai_reasoning=eval_res.get("xai_reasoning", {}),
                strengths=eval_res.get("strengths", []),
                red_flags=eval_res.get("red_flags", [])
            )

            # Update candidate & application records with 50-mark composite breakdown
            try:
                supabase.table("candidates").update({
                    "cv_match_score": cv_match_score_10,
                    "mcq_score": mcq_score_20,
                    "interview_score": interview_score_20,
                    "total_score": total_score_50
                }).eq("id", candidate_id).execute()

                supabase.table("applications").update({
                    "cv_match_score": cv_match_score_10,
                    "mcq_score": mcq_score_20,
                    "interview_score": interview_score_20,
                    "total_score": total_score_50,
                    "status": "completed"
                }).eq("id", application_id).execute()
            except Exception:
                pass

            # Remove session from in-memory cache
            await session_cache.remove_session(candidate_id)
            logger.info(f"Successfully flushed interview (Total Score: {total_score_50}/50) for Candidate {candidate_id}")

        except Exception as e:
            logger.error(f"Failed to flush interview session for candidate {session.candidate_id}: {e}", exc_info=True)


interview_service = InterviewService()
