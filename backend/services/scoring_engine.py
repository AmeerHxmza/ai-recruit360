"""
Scoring Engine — AI-Recruit360
Composite Hiring Confidence Score formula (from blueprint):
  HiringConfidence = 0.25×Match + 0.20×Quiz + 0.35×Interview + 0.20×Truthfulness
"""


def calculate_hiring_confidence(
    match_score: int,
    interview_score: int,
    truthfulness_score: int,
    quiz_score: int = 0,
) -> int:
    """
    Composite Hiring Confidence Score:
      25% Job Match
      20% Skill Quiz (reserved — defaults to 0 when quiz not yet implemented)
      35% Interview Performance
      20% Truthfulness / Integrity
    """
    confidence = (
        match_score       * 0.25
        + quiz_score      * 0.20
        + interview_score * 0.35
        + truthfulness_score * 0.20
    )
    return min(100, max(0, round(confidence)))


def determine_candidate_status(
    confidence: int,
    truthfulness: int,
) -> str:
    """
    Maps scores to a candidate status string.
    Truthfulness is a hard gate — if too low, Risk Detected regardless of confidence.
    """
    if truthfulness < 40:
        return "Risk Detected"
    if confidence >= 85:
        return "Verified Match"
    if confidence >= 70:
        return "Strong Candidate"
    if confidence >= 50:
        return "Review Needed"
    return "Rejected"


def calculate_average_interview_score(scores: list[int]) -> int:
    """Returns the average of a list of per-question scores."""
    if not scores:
        return 0
    return round(sum(scores) / len(scores))


def rerank_candidates_for_job(job_id: str, supabase) -> None:
    """
    Re-ranks ALL candidates in a given job based on their hiring_confidence_score.
    Called after any evaluation completes. Higher confidence = lower rank number (rank 1 = best).
    """
    try:
        # Fetch all candidates in this job with their scores
        result = (
            supabase.table("candidates")
            .select("id, candidate_scores(hiring_confidence_score)")
            .eq("job_id", job_id)
            .execute()
        )
        if not result.data:
            return

        # Build list of (candidate_id, confidence)
        ranked = []
        for row in result.data:
            scores = row.get("candidate_scores")
            if isinstance(scores, list) and scores:
                conf = scores[0].get("hiring_confidence_score", 0)
            elif isinstance(scores, dict):
                conf = scores.get("hiring_confidence_score", 0)
            else:
                conf = 0
            ranked.append((row["id"], conf))

        # Sort descending by confidence
        ranked.sort(key=lambda x: x[1], reverse=True)

        # Assign rank 1, 2, 3, ...
        for rank_pos, (cid, _) in enumerate(ranked, start=1):
            supabase.table("candidates").update({"rank": rank_pos}).eq("id", cid).execute()

    except Exception:
        pass  # Non-blocking — ranking failure should not break the evaluation
