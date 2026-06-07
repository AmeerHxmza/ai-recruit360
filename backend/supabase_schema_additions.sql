-- ============================================================
-- AI-Recruit360 — Supabase Schema Additions
-- Run this entire file in Supabase Dashboard > SQL Editor
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. SKILLS TABLE
--    (may already exist — wrapped in IF NOT EXISTS)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.skills (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL,
  skill_name  TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_skills_candidate ON public.skills(candidate_id);

-- ─────────────────────────────────────────────────────────────
-- 2. INTERVIEW_RESPONSES TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.interview_responses (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id      UUID REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL,
  question_text     TEXT NOT NULL,
  answer_text       TEXT NOT NULL,
  score             INTEGER CHECK (score >= 0 AND score <= 100),
  evaluation_status TEXT CHECK (evaluation_status IN ('Excellent', 'Strong', 'Weak', 'Irrelevant')),
  feedback          TEXT,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_interview_responses_candidate ON public.interview_responses(candidate_id);

-- ─────────────────────────────────────────────────────────────
-- 3. REASONING_LOGS TABLE
--    (cheating flags, AI observations, browser behaviour)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reasoning_logs (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL,
  category     TEXT NOT NULL,  -- 'Resume Match' | 'Browser Behavior' | 'Answer Authenticity' | 'Response Time' | 'Interview Performance' | 'System'
  status       TEXT NOT NULL CHECK (status IN ('Pass', 'Warning', 'Fail')),
  message      TEXT NOT NULL,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reasoning_logs_candidate ON public.reasoning_logs(candidate_id);

-- ─────────────────────────────────────────────────────────────
-- 4. RECRUITER_NOTES TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.recruiter_notes (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL,
  recruiter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note_content TEXT NOT NULL,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_recruiter_notes_candidate ON public.recruiter_notes(candidate_id);

-- ─────────────────────────────────────────────────────────────
-- 5. Ensure CANDIDATE_SCORES has all required columns
--    (adds columns if they don't already exist)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.candidate_scores
  ADD COLUMN IF NOT EXISTS quiz_score INTEGER DEFAULT 0 CHECK (quiz_score >= 0 AND quiz_score <= 100),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now());

-- ─────────────────────────────────────────────────────────────
-- 6. Ensure CANDIDATES has all required columns
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS email   TEXT,
  ADD COLUMN IF NOT EXISTS gender  TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS summary TEXT,
  ADD COLUMN IF NOT EXISTS rank    INTEGER DEFAULT 999;

-- ─────────────────────────────────────────────────────────────
-- 7. Ensure JOBS has all required columns
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS description      TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS github_required  BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS knockout_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- ─────────────────────────────────────────────────────────────
-- 8. Row Level Security (RLS) — permissive for FYP
--    In production: scope to recruiter's org
-- ─────────────────────────────────────────────────────────────

-- Enable RLS on new tables
ALTER TABLE public.skills             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reasoning_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_notes    ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all rows (open for FYP demo)
CREATE POLICY "Authenticated read skills"
  ON public.skills FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated read interview_responses"
  ON public.interview_responses FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated read reasoning_logs"
  ON public.reasoning_logs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated read recruiter_notes"
  ON public.recruiter_notes FOR SELECT TO authenticated USING (true);

-- Service role (backend) can do everything — INSERT/UPDATE/DELETE use service_role key, bypasses RLS

-- ─────────────────────────────────────────────────────────────
-- 9. Supabase Storage: Create 'resumes' bucket
--    (Run separately or via dashboard Storage tab)
-- ─────────────────────────────────────────────────────────────
-- Via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: allow authenticated users to upload
CREATE POLICY "Authenticated upload to resumes"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Service role full access to resumes"
  ON storage.objects FOR ALL TO service_role USING (bucket_id = 'resumes');

-- ─────────────────────────────────────────────────────────────
-- Done. Verify with:
--   SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public';
-- ─────────────────────────────────────────────────────────────
