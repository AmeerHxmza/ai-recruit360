-- =============================================================
-- AI RECRUIT360 — FULL SUPABASE SCHEMA
-- Run this in Supabase SQL Editor (Project > SQL Editor > New Query)
-- =============================================================

-- ─────────────────────────────────────────
-- 1. JOBS TABLE
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT,
  description TEXT,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Closed', 'Draft')),
  github_required BOOLEAN DEFAULT false,
  knockout_enabled BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─────────────────────────────────────────
-- 2. CANDIDATES TABLE
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  gender TEXT,
  address TEXT,
  cv_url TEXT,
  role_applied TEXT,
  status TEXT DEFAULT 'Pending' CHECK (
    status IN ('Verified Match', 'Strong Candidate', 'Review Needed',
               'Risk Detected', 'Pending', 'Rejected')
  ),
  summary TEXT,
  rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─────────────────────────────────────────
-- 3. CANDIDATE SCORES TABLE
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.candidate_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE UNIQUE,
  match_score INTEGER DEFAULT 0 CHECK (match_score >= 0 AND match_score <= 100),
  quiz_score INTEGER DEFAULT 0 CHECK (quiz_score >= 0 AND quiz_score <= 100),
  interview_score INTEGER DEFAULT 0 CHECK (interview_score >= 0 AND interview_score <= 100),
  truthfulness_score INTEGER DEFAULT 0 CHECK (truthfulness_score >= 0 AND truthfulness_score <= 100),
  hiring_confidence_score INTEGER DEFAULT 0 CHECK (hiring_confidence_score >= 0 AND hiring_confidence_score <= 100),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─────────────────────────────────────────
-- 4. SKILLS TABLE
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─────────────────────────────────────────
-- 5. INTERVIEW RESPONSES TABLE
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.interview_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  evaluation_status TEXT CHECK (
    evaluation_status IN ('Excellent', 'Strong', 'Weak', 'Irrelevant')
  ),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─────────────────────────────────────────
-- 6. REASONING LOGS TABLE (AI integrity flags)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reasoning_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  -- Examples: 'Resume Match', 'Quiz Integrity', 'Interview Performance', 'Browser Behavior'
  status TEXT NOT NULL CHECK (status IN ('Pass', 'Warning', 'Fail')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─────────────────────────────────────────
-- 7. RECRUITER NOTES TABLE
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.recruiter_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  recruiter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reasoning_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_notes ENABLE ROW LEVEL SECURITY;

-- Allow anonymous/public read (for candidate portal + dashboard without auth guard)
-- Tighten to 'authenticated' when auth is enforced in production
CREATE POLICY "Public read access" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.candidates FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.candidate_scores FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.interview_responses FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.reasoning_logs FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.recruiter_notes FOR SELECT USING (true);

-- Allow authenticated users to write
CREATE POLICY "Authenticated write" ON public.jobs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update" ON public.jobs FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete" ON public.jobs FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated write" ON public.candidates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update" ON public.candidates FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated write" ON public.candidate_scores FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update" ON public.candidate_scores FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated write" ON public.skills FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated write" ON public.interview_responses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated write" ON public.reasoning_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated write" ON public.recruiter_notes FOR INSERT TO authenticated WITH CHECK (true);

-- Also allow service_role (FastAPI backend) to write everything
-- This is handled automatically when using SUPABASE_SERVICE_KEY (bypasses RLS)

-- =============================================================
-- SUPABASE STORAGE BUCKET
-- Run separately in Supabase dashboard: Storage > New Bucket
-- Name: 'resumes', Public: false
-- =============================================================

-- =============================================================
-- SEED DATA — for testing (optional, comment out in production)
-- =============================================================
INSERT INTO public.jobs (id, title, department, description, status, github_required, knockout_enabled)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 
   'Senior React Developer', 
   'Engineering',
   'We are looking for a Senior React Developer with 5+ years of experience building scalable web applications. You will lead frontend architecture decisions and mentor junior developers.',
   'Active',
   true,
   true
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.candidates (id, job_id, name, email, role_applied, status, summary, rank)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 
   '11111111-1111-1111-1111-111111111111', 
   'Sarah Williams', 
   'sarah.williams@email.com',
   'Senior React Developer', 
   'Verified Match', 
   'Senior frontend engineer with 6 years of experience building React applications at scale. Led migration from class components to hooks at previous company, resulting in 40% performance improvement.',
   1
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.candidate_scores (candidate_id, match_score, quiz_score, interview_score, truthfulness_score, hiring_confidence_score)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 94, 88, 92, 97, 94)
ON CONFLICT (candidate_id) DO NOTHING;

INSERT INTO public.skills (candidate_id, skill_name, is_verified)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 'React / Next.js', true),
  ('22222222-2222-2222-2222-222222222222', 'TypeScript', true),
  ('22222222-2222-2222-2222-222222222222', 'Node.js', true),
  ('22222222-2222-2222-2222-222222222222', 'GraphQL', false),
  ('22222222-2222-2222-2222-222222222222', 'PostgreSQL', false)
ON CONFLICT DO NOTHING;

INSERT INTO public.interview_responses (candidate_id, question_text, answer_text, score, evaluation_status, feedback)
VALUES 
  ('22222222-2222-2222-2222-222222222222',
   'Explain React render optimization techniques you have used in production.',
   'I have extensively used useMemo and useCallback to prevent unnecessary re-renders. At my last company, I implemented React.memo for expensive list components and used the Profiler API to identify bottlenecks. We also adopted code splitting with React.lazy which cut our initial bundle size by 35%.',
   94,
   'Excellent',
   'Candidate demonstrated deep understanding of React optimization. Mentioned specific metrics from production experience — strong signal of practical expertise.'
  ),
  ('22222222-2222-2222-2222-222222222222',
   'Describe a challenging technical decision you made and its outcome.',
   'We needed to choose between Redux and Zustand for a new project. After evaluating both, I recommended Zustand for its simplicity and minimal boilerplate. The team adopted it and our state management code reduced by 60% compared to similar Redux implementations.',
   88,
   'Strong',
   'Good technical decision-making demonstrated with measurable outcomes. Could have mentioned more about trade-off analysis process.'
  )
ON CONFLICT DO NOTHING;

INSERT INTO public.reasoning_logs (candidate_id, category, status, message)
VALUES 
  ('22222222-2222-2222-2222-222222222222',
   'Resume Match',
   'Pass',
   'CV demonstrates 6 years of React experience across 3 companies. Skills claimed are consistent with GitHub activity and portfolio projects provided.'
  ),
  ('22222222-2222-2222-2222-222222222222',
   'Interview Performance',
   'Pass',
   'Candidate answered all 10 questions with high specificity. Production metrics cited in answers are verifiable and consistent with resume claims.'
  ),
  ('22222222-2222-2222-2222-222222222222',
   'Browser Behavior',
   'Pass',
   'No tab switching detected during interview session. Response time patterns are consistent with live, unassisted answers.'
  )
ON CONFLICT DO NOTHING;
