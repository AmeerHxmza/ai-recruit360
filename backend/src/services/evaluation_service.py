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
        Multi-dimensional XAI candidate evaluation engine.
        Calculates Technical (40%), Problem Solving (25%), Communication (15%), Honesty (20%).
        Enforces Hard Gate: if Honesty < 40, overall score capped at 39 with "Risk Detected" flag.
        """
        # Calculate behavioral proctoring penalty
        tab_switches = sum(1 for p in proctor_events if p.get("event_type") == "TAB_SWITCH")
        proctor_penalty = min(60, tab_switches * 20)

        system = (
            "You are an elite Senior Engineering Director and Behavioral Analyst evaluating a technical interview candidate. "
            "Be rigorously objective, justify every metric with direct transcript quotes, and output valid JSON only."
        )

        user = f"""JOB DESCRIPTION:
{job_description[:2000]}

INTERVIEW TRANSCRIPT:
{transcript[:4000]}

PROCTORING TELEMETRY:
- Tab switch count: {tab_switches}
- Telemetry events: {len(proctor_events)}

Scoring Matrix:
1. technical_score (0-100): Accuracy & depth of technical answers (Weight: 40%).
2. problem_solving_score (0-100): Methodological problem decomposition (Weight: 25%).
3. communication_score (0-100): Structural clarity, conciseness, articulation (Weight: 15%).
4. honesty_score (0-100): Resume claim consistency vs transcript evidence, penalized by proctoring tab switches (Weight: 20%). Base penalty: -{proctor_penalty} points for tab switches.

HARD GATE RULE:
If honesty_score < 40, overall_score MUST be capped at maximum 39.

Explainable AI (XAI) Mandate:
- claim_vs_reality: Compare claimed experience with demonstrated depth.
- transcript_evidence: Direct verbatim quotes from the transcript backing deductions or praise.
- rubric_justification: Standardized score justification.

Return ONLY valid JSON matching this exact structure:
{{
  "scores": {{
    "technical_score": 85,
    "problem_solving_score": 80,
    "communication_score": 90,
    "honesty_score": 95,
    "overall_score": 86
  }},
  "xai_reasoning": {{
    "claim_vs_reality": "...",
    "transcript_evidence": "...",
    "rubric_justification": "..."
  }},
  "strengths": ["Demonstrated React DOM knowledge"],
  "red_flags": []
}}"""

        try:
            result = await _chat(system, user, temperature=0.1)
            # Hard Gate Verification
            scores = result.get("scores", {})
            h_score = scores.get("honesty_score", 100)
            if h_score < 40:
                scores["overall_score"] = min(39, scores.get("overall_score", 39))
                result["red_flags"] = result.get("red_flags", []) + ["Risk Detected: Low Honesty / Proctoring Fraud Signal"]

            return result
        except Exception as e:
            logger.error(f"XAI Evaluation failed: {e}")
            # Baseline Fallback
            honesty = max(10, 100 - proctor_penalty)
            overall = 39 if honesty < 40 else 75
            return {
                "scores": {
                    "technical_score": 75,
                    "problem_solving_score": 75,
                    "communication_score": 80,
                    "honesty_score": honesty,
                    "overall_score": overall
                },
                "xai_reasoning": {
                    "claim_vs_reality": "Candidate completed interview questions.",
                    "transcript_evidence": transcript[:200] if transcript else "N/A",
                    "rubric_justification": f"Evaluation calculated (fallback mode: {str(e)})"
                },
                "strengths": ["Completed screening session"],
                "red_flags": [] if honesty >= 40 else ["Proctoring Tab Switch Warning"]
            }


evaluation_service = EvaluationService()
