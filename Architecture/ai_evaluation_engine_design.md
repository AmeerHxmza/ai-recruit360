# AI Evaluation Engine Design

This document details the architecture and strategy for the AI Evaluation Engine. This engine takes the candidate's raw interview data and produces a multi-dimensional, explainable assessment.

## 1. Prompt Engineering Strategy

To ensure reliable, objective, and explainable scoring, the prompt will employ a **Chain-of-Thought (CoT)** methodology combined with strict **Persona Prompting**.

- **Persona**: "You are an elite Senior Engineering Manager and Behavioral Psychologist evaluating a candidate. Your goal is to be rigorously objective, heavily penalizing contradictions and rewarding deep, practical insights."
- **Context Grounding**: The LLM will be fed:
  1. The Candidate's `Resume` (to establish baseline claims).
  2. The list of `Questions` asked.
  3. The individual `Answers` provided.
  4. The complete `Transcript` (to analyze communication flow, hesitations, and structure).
- **Rubric Enforcement**: The prompt will contain a strict grading rubric defining what constitutes a 90+ (Exceptional), 70-89 (Strong), 50-69 (Average), and <50 (Red Flag) for each metric.

## 2. Scoring Logic

The engine evaluates four distinct dimensions, resulting in an aggregated Overall Score.

1. **Technical Score (Weight: 40%)**: 
   - *Logic*: Measures the accuracy, depth, and relevance of technical answers. Heavily cross-referenced against the `Resume` (e.g., if they claim 5 years of React, they must answer senior-level React questions flawlessly).
2. **Problem Solving Score (Weight: 25%)**: 
   - *Logic*: Evaluates the candidate's methodology. Did they ask clarifying questions? Did they break down complex problems logically in their `Answers`?
3. **Communication Score (Weight: 15%)**: 
   - *Logic*: Analyzed primarily via the `Transcript`. Rewards clear, structured, and concise articulation. Penalizes rambling, excessive filler words, or inability to get to the point.
4. **Honesty Score (Weight: 20%)**: 
   - *Logic*: Cross-references claims. Flags contradictions between the `Resume` and the `Answers`. Analyzes the `Transcript` for robotic, overly formal, or suspiciously fast responses that might indicate reading from a script or using AI assistance.
5. **Overall Score**: Weighted average of the above. 
   - *Hard Gate*: If the `Honesty Score` drops below 40, the candidate is automatically flagged with a "Risk Detected" status regardless of the Overall Score.

## 3. JSON Output Format

Using OpenAI's Structured Outputs (enforced via Pydantic on the FastAPI backend), the LLM will guarantee the following JSON schema:

```json
{
  "xai_reasoning": {
    "technical_analysis": "...",
    "communication_analysis": "...",
    "honesty_analysis": "...",
    "problem_solving_analysis": "..."
  },
  "scores": {
    "technical_score": 85,
    "communication_score": 90,
    "honesty_score": 95,
    "problem_solving_score": 80,
    "overall_score": 86
  },
  "summary_points": {
    "strengths": [
      "Demonstrated deep architectural knowledge of React",
      "Clear, structured communication"
    ],
    "red_flags": []
  }
}
```

## 4. Storage Schema

A dedicated `evaluations` table will be created to store these results, linking directly to the `interviews` table.

```sql
CREATE TABLE public.evaluations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    interview_id UUID REFERENCES public.interviews(id) ON DELETE CASCADE UNIQUE,
    
    -- Scores
    technical_score SMALLINT CHECK (technical_score >= 0 AND technical_score <= 100),
    communication_score SMALLINT CHECK (communication_score >= 0 AND communication_score <= 100),
    honesty_score SMALLINT CHECK (honesty_score >= 0 AND honesty_score <= 100),
    problem_solving_score SMALLINT CHECK (problem_solving_score >= 0 AND problem_solving_score <= 100),
    overall_score SMALLINT CHECK (overall_score >= 0 AND overall_score <= 100),
    
    -- XAI Reasoning (Stored as JSONB for flexible querying)
    xai_reasoning JSONB NOT NULL,
    
    -- Summary Arrays
    strengths TEXT[] DEFAULT '{}',
    red_flags TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE INDEX idx_evaluations_interview ON public.evaluations(interview_id);
```

## 5. XAI (Explainable AI) Reasoning Format

To build trust with recruiters, the AI must justify *every* score using evidence from the inputs. The `xai_reasoning` JSONB object will mandate the following structured format for each category:

- **Claim vs. Reality**: Explicitly state what the candidate claimed on their resume versus what they demonstrated in the interview.
- **Transcript Evidence**: Require the AI to quote a specific snippet from the transcript to back up its claim (e.g., *"Candidate hesitated and stated 'I haven't actually used Redux in production...' despite claiming 3 years of Redux on the resume."*).
- **Rubric Mapping**: A brief justification of why the exact numerical score was chosen based on the provided grading rubric.
