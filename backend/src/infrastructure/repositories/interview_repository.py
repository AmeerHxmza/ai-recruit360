from typing import Optional, Dict, Any, List
from src.infrastructure.repositories.base import BaseRepository
from src.core.supabase_client import supabase


class InterviewRepository(BaseRepository):
    def __init__(self):
        super().__init__("interviews")

    def get_or_create_interview_session(self, application_id: str, candidate_id: str) -> Dict[str, Any]:
        res = supabase.table("interviews").select("*").eq("application_id", application_id).execute()
        if res.data:
            return res.data[0]

        return self.insert({
            "application_id": application_id,
            "candidate_id": candidate_id,
            "status": "in_progress",
            "current_question_index": 0,
            "interview_transcript": ""
        })

    def save_interview_evaluation(
        self,
        interview_id: str,
        application_id: str,
        overall_score: int,
        truthfulness_score: int,
        technical_score: int,
        communication_score: int,
        honesty_score: int,
        problem_solving_score: int,
        xai_reasoning: Dict[str, Any],
        strengths: List[str] = None,
        red_flags: List[str] = None
    ) -> Dict[str, Any]:
        # 1. Update interview status and overall scores
        supabase.table("interviews").update({
            "status": "completed",
            "overall_score": overall_score,
            "truthfulness_score": truthfulness_score
        }).eq("id", interview_id).execute()

        # 2. Update application status
        supabase.table("applications").update({
            "status": "completed",
            "hiring_confidence": overall_score
        }).eq("id", application_id).execute()

        # 3. Upsert evaluation record
        eval_data = {
            "interview_id": interview_id,
            "technical_score": technical_score,
            "communication_score": communication_score,
            "honesty_score": honesty_score,
            "problem_solving_score": problem_solving_score,
            "overall_score": overall_score,
            "xai_reasoning": xai_reasoning,
            "strengths": strengths or [],
            "red_flags": red_flags or []
        }
        
        eval_res = supabase.table("evaluations").select("id").eq("interview_id", interview_id).execute()
        if eval_res.data:
            return supabase.table("evaluations").update(eval_data).eq("interview_id", interview_id).execute().data[0]
        else:
            return supabase.table("evaluations").insert(eval_data).execute().data[0]
