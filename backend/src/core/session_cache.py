"""
Ultra-Low Latency In-Memory Session Cache for AI-Recruit360 Live Candidate Interviews.
Provides sub-millisecond (<1ms) response times for question fetching, answer recording,
and proctoring telemetry buffering, avoiding continuous database write roundtrips.
"""

import time
import asyncio
import logging
from typing import Dict, Any, Optional, List
from src.core.config import settings

logger = logging.getLogger(__name__)


class CandidateInterviewSession:
    def __init__(self, candidate_id: str, candidate_name: str, job_id: str, job_description: str, questions: List[str]):
        self.candidate_id = candidate_id
        self.candidate_name = candidate_name
        self.job_id = job_id
        self.job_description = job_description
        self.questions = questions
        self.current_index = 0
        self.transcript_parts: List[str] = []
        self.proctor_events: List[Dict[str, Any]] = []
        self.answers_map: Dict[int, str] = {}
        self.status = "in_progress"
        self.created_at = time.time()
        self.last_accessed_at = time.time()

    def get_current_question(self) -> Optional[str]:
        self.last_accessed_at = time.time()
        if 0 <= self.current_index < len(self.questions):
            return self.questions[self.current_index]
        return None

    def record_answer(self, answer_text: str) -> Dict[str, Any]:
        self.last_accessed_at = time.time()
        question_text = self.get_current_question() or f"Question {self.current_index + 1}"
        
        self.answers_map[self.current_index] = answer_text
        self.transcript_parts.append(f"Q{self.current_index + 1}: {question_text}\nA: {answer_text}\n")
        
        self.current_index += 1
        is_completed = self.current_index >= len(self.questions)
        if is_completed:
            self.status = "completed"

        return {
            "next_question_index": self.current_index,
            "total_questions": len(self.questions),
            "is_completed": is_completed,
            "transcript": "".join(self.transcript_parts)
        }

    def record_proctor_event(self, event_type: str, description: Optional[str] = None, severity: str = "warning"):
        self.last_accessed_at = time.time()
        self.proctor_events.append({
            "event_type": event_type,
            "description": description or f"Event {event_type} detected during interview.",
            "severity": severity,
            "timestamp": time.time()
        })

    def is_expired(self, ttl_seconds: int) -> bool:
        return (time.time() - self.last_accessed_at) > ttl_seconds


class InterviewSessionManager:
    """Thread-safe in-memory session manager."""
    def __init__(self):
        self._sessions: Dict[str, CandidateInterviewSession] = {}
        self._lock = asyncio.Lock()

    async def get_or_create_session(
        self,
        candidate_id: str,
        candidate_name: str,
        job_id: str,
        job_description: str,
        questions: List[str]
    ) -> CandidateInterviewSession:
        async with self._lock:
            if candidate_id not in self._sessions:
                self._sessions[candidate_id] = CandidateInterviewSession(
                    candidate_id=candidate_id,
                    candidate_name=candidate_name,
                    job_id=job_id,
                    job_description=job_description,
                    questions=questions
                )
            return self._sessions[candidate_id]

    async def get_session(self, candidate_id: str) -> Optional[CandidateInterviewSession]:
        async with self._lock:
            return self._sessions.get(candidate_id)

    async def remove_session(self, candidate_id: str):
        async with self._lock:
            if candidate_id in self._sessions:
                del self._sessions[candidate_id]

    async def cleanup_expired_sessions(self, ttl_seconds: int = 7200):
        async with self._lock:
            expired_keys = [
                cid for cid, sess in self._sessions.items()
                if sess.is_expired(ttl_seconds)
            ]
            for cid in expired_keys:
                logger.info(f"Evicting expired interview session for candidate {cid}")
                del self._sessions[cid]


# Global Singleton Session Cache Instance
session_cache = InterviewSessionManager()
