-- ============================================================================
-- AI-Recruit360 Database Schema (Supabase PostgreSQL)
-- Multi-Tenant Recruiter & Candidate Isolation Schema
-- ============================================================================

-- 1. Create Recruiters Profile Table (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.recruiters (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    company_name TEXT NOT NULL,
    company_website TEXT,
    role TEXT DEFAULT 'recruiter',
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- 2. Create Jobs Table (Linked to Recruiter)
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recruiter_id UUID REFERENCES public.recruiters(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    department TEXT,
    min_experience INT DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- 3. Create Candidates Table (Linked to Specific Job)
CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    github_url TEXT,
    cv_url TEXT,
    resume_text TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'interviewing', 'completed', 'rejected')),
    ai_score INT DEFAULT 0,
    technical_score INT DEFAULT 0,
    communication_score INT DEFAULT 0,
    honesty_score INT DEFAULT 0,
    xai_reasoning JSONB DEFAULT '{}'::jsonb,
    generated_questions JSONB DEFAULT '[]'::jsonb,
    current_question_index INT DEFAULT 0,
    interview_transcript TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- 4. Create Proctor Logs Table (Linked to Candidate)
CREATE TABLE IF NOT EXISTS public.proctor_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- 5. Automatic Trigger: Create Recruiter Profile on Auth User Signup
CREATE OR REPLACE FUNCTION public.handle_new_recruiter()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.recruiters (id, full_name, company_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Recruiter'),
        COALESCE(NEW.raw_user_meta_data->>'company_name', 'My Company')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists before recreating
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_recruiter();

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.recruiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proctor_logs ENABLE ROW LEVEL SECURITY;

-- 7. Define Row Level Security (RLS) Policies

-- Recruiters Table RLS Policies
DROP POLICY IF EXISTS "Recruiters read/update own profile" ON public.recruiters;
CREATE POLICY "Recruiters read/update own profile" ON public.recruiters
    FOR ALL USING (auth.uid() = id);

-- Jobs Table RLS Policies
DROP POLICY IF EXISTS "Recruiters manage own jobs" ON public.jobs;
CREATE POLICY "Recruiters manage own jobs" ON public.jobs 
    FOR ALL USING (auth.uid() = recruiter_id);

DROP POLICY IF EXISTS "Public read active jobs" ON public.jobs;
CREATE POLICY "Public read active jobs" ON public.jobs
    FOR SELECT USING (status = 'active');

-- Candidates Table RLS Policies
DROP POLICY IF EXISTS "Public insert candidates" ON public.candidates;
CREATE POLICY "Public insert candidates" ON public.candidates 
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read candidate interview" ON public.candidates;
CREATE POLICY "Public read candidate interview" ON public.candidates 
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Recruiters view own job candidates" ON public.candidates;
CREATE POLICY "Recruiters view own job candidates" ON public.candidates 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.jobs 
            WHERE jobs.id = candidates.job_id 
            AND jobs.recruiter_id = auth.uid()
        )
    );

-- Proctor Logs Table RLS Policies
DROP POLICY IF EXISTS "Public insert proctor logs" ON public.proctor_logs;
CREATE POLICY "Public insert proctor logs" ON public.proctor_logs 
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Recruiters view proctor logs for own candidates" ON public.proctor_logs;
CREATE POLICY "Recruiters view proctor logs for own candidates" ON public.proctor_logs 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.candidates
            JOIN public.jobs ON jobs.id = candidates.job_id
            WHERE candidates.id = proctor_logs.candidate_id
            AND jobs.recruiter_id = auth.uid()
        )
    );

-- 8. Storage Bucket Setup for Resumes
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;
