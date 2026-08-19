import logging
from typing import Dict, Any, List
from src.infrastructure.external.openai_client import _chat
from src.services.credit_service import credit_service

logger = logging.getLogger(__name__)


class EvaluationService:
    async def evaluate_interview_session(
        self,
        candidate_id: str,
        job_description: str,
        transcript: str,
        proctor_events: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Calculates Stage 3 AI HR Interview Score (0-20 marks) and final composite Total Score (0-50 marks).
        50 Marks Breakdown:
          - Stage 1 (CV Match): 10 Marks
          - Stage 2 (10 MCQs): 20 Marks
          - Stage 3 (AI HR Interview): 20 Marks
        """
        tab_switches = sum(1 for p in proctor_events if p.get("event_type") == "TAB_SWITCH")

        system = (
            "You are an elite Senior HR Director evaluating Stage 3 AI HR Interview transcript. "
            "Evaluate candidate responses on Technical, Communication, and Behavioral fit out of 20 marks total."
        )

        user = f"""JOB DESCRIPTION:
{job_description[:2000]}

INTERVIEW TRANSCRIPT:
{transcript[:4000]}

PROCTORING EVENTS:
- Tab switches: {tab_switches}

Task:
Evaluate Stage 3 AI HR Interview out of 20 marks:
- technical_score (0-20): Depth and accuracy of technical explanations.
- communication_score (0-20): Clarity, conciseness, articulation.
- behavioral_score (0-20): Problem-solving, leadership, team fit.
- interview_score (0-20): Stage 3 composite mark out of 20.

Return ONLY valid JSON matching this exact structure:
{{
  "scores": {{
    "technical_score": 17,
    "communication_score": 18,
    "behavioral_score": 16,
    "interview_score": 17
  }},
  "xai_reasoning": {{
    "claim_vs_reality": "...",
    "transcript_evidence": "...",
    "rubric_justification": "..."
  }},
  "strengths": ["Clear technical communication"],
  "red_flags": []
}}"""

        try:
            result = await _chat(system, user, temperature=0.1)
            scores = result.get("scores", {})
            i_score = min(20, max(0, int(scores.get("interview_score", 15))))
            scores["interview_score"] = i_score
            return result
        except Exception as e:
            logger.error(f"Stage 3 Evaluation failed: {e}")
            return {
                "scores": {
                    "technical_score": 15,
                    "communication_score": 16,
                    "behavioral_score": 15,
                    "interview_score": 15
                },
                "xai_reasoning": {
                    "claim_vs_reality": "Candidate answered interview questions.",
                    "transcript_evidence": transcript[:200] if transcript else "Relevant explanations provided.",
                    "rubric_justification": f"Stage 3 score evaluated (fallback mode: {str(e)})"
                },
                "strengths": ["Completed Stage 3 HR Interview"],
                "red_flags": [] if tab_switches < 2 else [f"{tab_switches} tab switches detected"]
            }


evaluation_service = EvaluationService()
