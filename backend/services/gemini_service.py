"""
AI Service — AI-Recruit360
Uses OpenAI GPT-4o-mini for all AI operations:
  - Resume parsing & match scoring
  - Dynamic interview question generation
  - Answer evaluation & feedback
  - Truthfulness / integrity analysis
"""

import json
import re
from openai import AsyncOpenAI
from core.config import settings

# Async client — works natively with FastAPI's async/await
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

MODEL = "gpt-4o-mini"


def _parse_json(text: str) -> dict | list:
    """Strip markdown code fences and parse JSON from model output."""
    cleaned = re.sub(r"```(?:json)?", "", text).strip().rstrip("```").strip()
    # Handle cases where model wraps in extra whitespace or newlines
    return json.loads(cleaned)


async def _chat(system: str, user: str, temperature: float = 0.3) -> str:
    """Single-turn chat completion. Returns the assistant message text."""
    response = await client.chat.completions.create(
        model=MODEL,
        temperature=temperature,
        messages=[
            {"role": "system", "content": system},
            {"role": "user",   "content": user},
        ],
    )
    return response.choices[0].message.content.strip()


# ─────────────────────────────────────────────────────────────────────────────
# 1. Resume Parsing & Match Scoring
# ─────────────────────────────────────────────────────────────────────────────
async def parse_resume(resume_text: str, job_description: str) -> dict:
    """
    Analyzes a resume against a job description.
    Returns: {summary, match_score, skills: [{name, is_verified}]}
    """
    system = "You are an expert technical recruiter and talent evaluator. Always return valid JSON only — no markdown, no extra text."

    user = f"""CANDIDATE RESUME:
{resume_text[:4000]}

JOB DESCRIPTION:
{job_description[:2000]}

Task:
1. Write a concise 2-3 sentence professional summary of the candidate's core expertise.
2. Calculate a Job Match Score (0-100) based on how well their experience aligns with this specific role.
3. Extract a list of key technical skills mentioned in the resume.

Scoring guide:
- 90-100: Perfect match, all requirements met with strong experience
- 75-89: Strong match, most requirements met
- 60-74: Partial match, some gaps
- 40-59: Weak match, significant gaps
- Below 40: Does not meet minimum requirements

Return ONLY valid JSON:
{{
  "summary": "...",
  "match_score": 85,
  "skills": [
    {{"name": "React", "is_verified": false}},
    {{"name": "TypeScript", "is_verified": false}}
  ]
}}"""

    text = await _chat(system, user, temperature=0.2)
    return _parse_json(text)


# ─────────────────────────────────────────────────────────────────────────────
# 2. Dynamic Interview Question Generation
# ─────────────────────────────────────────────────────────────────────────────
async def generate_interview_questions(
    resume_text: str,
    job_title: str,
    num_questions: int = 10,
) -> list[str]:
    """
    Generates targeted interview questions based on the candidate's specific resume claims.
    Returns a list of question strings.
    """
    system = "You are a senior technical interviewer. Always return valid JSON only — no markdown, no extra text."

    user = f"""You are conducting a rigorous screening for a {job_title} position.

CANDIDATE RESUME (excerpt):
{resume_text[:3000]}

Task:
Generate exactly {num_questions} technical interview questions that:
1. Directly challenge specific claims made in this candidate's resume
2. Probe the depth of their stated experience
3. Include scenario-based questions relevant to the role
4. Mix conceptual and practical questions
5. Are appropriately challenging for the seniority level indicated

Do NOT generate generic questions. Make each question specific to THIS candidate's background.

Return ONLY a valid JSON array of strings:
["Question 1", "Question 2", ..., "Question {num_questions}"]"""

    text = await _chat(system, user, temperature=0.5)
    result = _parse_json(text)
    if isinstance(result, list):
        return [str(q) for q in result[:num_questions]]
    return []


# ─────────────────────────────────────────────────────────────────────────────
# 3. Answer Evaluation
# ─────────────────────────────────────────────────────────────────────────────
async def evaluate_answer(question: str, answer: str) -> dict:
    """
    Evaluates a single interview answer for accuracy, depth, and clarity.
    Returns: {score, evaluation_status, feedback}
    """
    system = "You are an expert technical interviewer evaluating candidate responses. Always return valid JSON only — no markdown, no extra text."

    user = f"""QUESTION: {question}

CANDIDATE'S ANSWER: {answer}

Evaluate the answer on:
1. Technical accuracy and correctness
2. Depth of understanding shown
3. Communication clarity
4. Practical experience evidence

Score guide:
- 90-100 → "Excellent"
- 70-89  → "Strong"
- 50-69  → "Weak"
- 0-49   → "Irrelevant"

Return ONLY valid JSON:
{{
  "score": 85,
  "evaluation_status": "Strong",
  "feedback": "One concise sentence describing quality and any gaps."
}}

evaluation_status must be exactly one of: "Excellent", "Strong", "Weak", "Irrelevant"
"""

    text = await _chat(system, user, temperature=0.1)
    return _parse_json(text)


# ─────────────────────────────────────────────────────────────────────────────
# 4. Truthfulness & Integrity Analysis
# ─────────────────────────────────────────────────────────────────────────────
async def calculate_truthfulness_ai(
    responses: list[dict],
    tab_switches: int,
    time_taken_seconds: int,
) -> tuple[int, list[dict]]:
    """
    Analyzes answer consistency and behavioral signals to produce a truthfulness score.
    Returns: (truthfulness_score 0-100, list of reasoning_log dicts)
    """
    logs = []
    score = 100

    # ── Browser behavior check ─────────────────────────────────────────────
    if tab_switches >= 4:
        score -= 45
        logs.append({
            "category": "Browser Behavior",
            "status": "Fail",
            "message": (
                f"Tab switching detected {tab_switches} times during the interview session. "
                "High probability of external assistance or answer lookup."
            ),
        })
    elif tab_switches >= 2:
        score -= 20
        logs.append({
            "category": "Browser Behavior",
            "status": "Warning",
            "message": (
                f"Tab switching detected {tab_switches} times. Minor integrity concern — "
                "recommend follow-up in onsite round."
            ),
        })
    else:
        logs.append({
            "category": "Browser Behavior",
            "status": "Pass",
            "message": (
                "No tab switching detected during the interview session. "
                "Response patterns consistent with live, unassisted answers."
            ),
        })

    # ── Response time check ────────────────────────────────────────────────
    avg_time_per_q = time_taken_seconds / max(len(responses), 1)
    if avg_time_per_q < 8:
        score -= 15
        logs.append({
            "category": "Response Time",
            "status": "Warning",
            "message": (
                f"Average response time of {avg_time_per_q:.0f}s per question is unusually fast. "
                "May indicate pre-prepared or copied answers."
            ),
        })
    else:
        logs.append({
            "category": "Response Time",
            "status": "Pass",
            "message": (
                f"Average response time of {avg_time_per_q:.0f}s per question is within normal range."
            ),
        })

    # ── AI consistency check across responses ─────────────────────────────
    if len(responses) >= 3:
        answers_sample = "\n".join(
            [f"Q: {r['question']}\nA: {r['answer']}" for r in responses[:5]]
        )
        system = "You are an integrity analyst reviewing interview responses. Return valid JSON only."
        user = f"""Analyze these interview responses for consistency and signs of AI-generated or copy-pasted content.

{answers_sample}

Return ONLY valid JSON:
{{
  "is_consistent": true,
  "has_ai_patterns": false,
  "reasoning": "Brief 1-sentence assessment."
}}"""
        try:
            text = await _chat(system, user, temperature=0.1)
            consistency = _parse_json(text)
            if consistency.get("has_ai_patterns"):
                score -= 20
                logs.append({
                    "category": "Answer Authenticity",
                    "status": "Warning",
                    "message": f"AI-generated content patterns detected. {consistency.get('reasoning', '')}",
                })
            else:
                logs.append({
                    "category": "Answer Authenticity",
                    "status": "Pass",
                    "message": f"Answers appear authentic and original. {consistency.get('reasoning', '')}",
                })
        except Exception:
            pass  # Non-blocking — don't fail the whole evaluation

    return max(0, score), logs
