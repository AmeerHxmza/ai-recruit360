-- =============================================================
-- AI RECRUIT360 — NEW SUPABASE SCHEMA
-- Run this in Supabase SQL Editor (Project > SQL Editor > New Query)
-- =============================================================

-- ─────────────────────────────────────────
-- 1. RECRUITERS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.recruiters (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name VARCHAR,
    role VARCHAR CHECK (role IN ('admin', 'recruiter')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 2. JOBS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID REFERENCES public.recruiters(id) ON DELETE SET NULL,
    title VARCHAR NOT NULL,
    department VARCHAR,
    description TEXT,
    status VARCHAR CHECK (status IN ('draft', 'active', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 3. CANDIDATES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR UNIQUE NOT NULL,
    first_name VARCHAR,
    last_name VARCHAR,
    phone VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 4. APPLICATIONS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
    status VARCHAR CHECK (status IN ('pending', 'screening', 'interviewed', 'offered', 'rejected')),
    cv_url VARCHAR,
    ai_summary TEXT,
    match_score SMALLINT CHECK (match_score >= 0 AND match_score <= 100),
    hiring_confidence SMALLINT CHECK (hiring_confidence >= 0 AND hiring_confidence <= 100),
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(job_id, candidate_id)
);

-- ─────────────────────────────────────────
-- 5. QUESTIONS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    ideal_answer TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 6. INTERVIEWS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID UNIQUE REFERENCES public.applications(id) ON DELETE CASCADE,
    status VARCHAR CHECK (status IN ('scheduled', 'in_progress', 'completed', 'abandoned')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    overall_score SMALLINT CHECK (overall_score >= 0 AND overall_score <= 100),
    truthfulness_score SMALLINT CHECK (truthfulness_score >= 0 AND truthfulness_score <= 100)
);

-- ─────────────────────────────────────────
-- 7. EVALUATIONS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID REFERENCES public.interviews(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    candidate_answer TEXT,
    ai_score SMALLINT CHECK (ai_score >= 0 AND ai_score <= 100),
    evaluation_status VARCHAR CHECK (evaluation_status IN ('Excellent', 'Strong', 'Weak', 'Irrelevant')),
    ai_feedback TEXT
);

-- ─────────────────────────────────────────
-- 8. PROCTOR LOGS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.proctor_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID REFERENCES public.interviews(id) ON DELETE CASCADE,
    event_type VARCHAR NOT NULL,
    description TEXT,
    severity VARCHAR CHECK (severity IN ('info', 'warning', 'critical')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 9. RECRUITER NOTES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.recruiter_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
    recruiter_id UUID REFERENCES public.recruiters(id) ON DELETE CASCADE DEFAULT auth.uid(),
    note_content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- INDEXES
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_id ON public.jobs(recruiter_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_candidates_email ON public.candidates(email);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON public.applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_application_id ON public.interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_interview_id ON public.evaluations(interview_id);
CREATE INDEX IF NOT EXISTS idx_proctor_logs_interview_id ON public.proctor_logs(interview_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_evaluations_interview_question ON public.evaluations(interview_id, question_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_notes_candidate_id ON public.recruiter_notes(candidate_id);

-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================
ALTER TABLE public.recruiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proctor_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_notes ENABLE ROW LEVEL SECURITY;

-- 1. recruiters
CREATE POLICY "Users can read own recruiter profile" ON public.recruiters FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own recruiter profile" ON public.recruiters FOR UPDATE USING (id = auth.uid());

-- 2. jobs
CREATE POLICY "Public read active jobs" ON public.jobs FOR SELECT USING (status = 'active');
CREATE POLICY "Recruiters read own jobs" ON public.jobs FOR SELECT USING (recruiter_id = auth.uid());
CREATE POLICY "Recruiters insert jobs" ON public.jobs FOR INSERT WITH CHECK (recruiter_id = auth.uid());
CREATE POLICY "Recruiters update jobs" ON public.jobs FOR UPDATE USING (recruiter_id = auth.uid());
CREATE POLICY "Recruiters delete jobs" ON public.jobs FOR DELETE USING (recruiter_id = auth.uid());

-- 3. candidates
CREATE POLICY "Recruiters read candidates applied to their jobs" ON public.candidates FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.applications a
        JOIN public.jobs j ON a.job_id = j.id
        WHERE a.candidate_id = public.candidates.id AND j.recruiter_id = auth.uid()
    )
);
CREATE POLICY "Public insert candidates" ON public.candidates FOR INSERT WITH CHECK (true);
CREATE POLICY "Service Role update candidates" ON public.candidates FOR UPDATE USING (true);
CREATE POLICY "Service Role delete candidates" ON public.candidates FOR DELETE USING (true);

-- 4. applications
CREATE POLICY "Recruiters read applications for their jobs" ON public.applications FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = public.applications.job_id AND jobs.recruiter_id = auth.uid())
);
CREATE POLICY "Public insert applications" ON public.applications FOR INSERT WITH CHECK (true);

-- 5. questions
CREATE POLICY "Public read questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Recruiters insert questions" ON public.questions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = public.questions.job_id AND jobs.recruiter_id = auth.uid())
);
CREATE POLICY "Recruiters update questions" ON public.questions FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = public.questions.job_id AND jobs.recruiter_id = auth.uid())
);
CREATE POLICY "Recruiters delete questions" ON public.questions FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = public.questions.job_id AND jobs.recruiter_id = auth.uid())
);

-- 6. interviews
CREATE POLICY "Public insert interviews" ON public.interviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Recruiters read interviews" ON public.interviews FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.applications a 
        JOIN public.jobs j ON a.job_id = j.id 
        WHERE a.id = public.interviews.application_id AND j.recruiter_id = auth.uid()
    )
);

-- 7. evaluations
CREATE POLICY "Public insert evaluations" ON public.evaluations FOR INSERT WITH CHECK (true);
CREATE POLICY "Recruiters read evaluations" ON public.evaluations FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.interviews i
        JOIN public.applications a ON i.application_id = a.id
        JOIN public.jobs j ON a.job_id = j.id
        WHERE i.id = public.evaluations.interview_id AND j.recruiter_id = auth.uid()
    )
);

-- 8. proctor_logs
CREATE POLICY "Public insert proctor logs" ON public.proctor_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Recruiters read proctor logs" ON public.proctor_logs FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.interviews i
        JOIN public.applications a ON i.application_id = a.id
        JOIN public.jobs j ON a.job_id = j.id
        WHERE i.id = public.proctor_logs.interview_id AND j.recruiter_id = auth.uid()
    )
);

-- 9. recruiter_notes
CREATE POLICY "Recruiters read own notes" ON public.recruiter_notes FOR SELECT USING (recruiter_id = auth.uid());
CREATE POLICY "Recruiters insert own notes" ON public.recruiter_notes FOR INSERT WITH CHECK (recruiter_id = auth.uid());
CREATE POLICY "Recruiters update own notes" ON public.recruiter_notes FOR UPDATE USING (recruiter_id = auth.uid());
CREATE POLICY "Recruiters delete own notes" ON public.recruiter_notes FOR DELETE USING (recruiter_id = auth.uid());

-- =============================================================
-- SUPABASE STORAGE BUCKET (Resumes)
-- =============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Public upload to resumes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resumes');
CREATE POLICY "Authenticated read resumes" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'resumes');
CREATE POLICY "Service role full access to resumes" ON storage.objects FOR ALL TO service_role USING (bucket_id = 'resumes');
