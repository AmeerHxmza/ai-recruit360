-- =============================================================================
-- AI-Recruit360 Master Production Database Schema (PostgreSQL on Supabase)
-- Enterprise Multi-Tenant DDL Specification & Candidate Screening Pipeline
-- =============================================================================

-- 0. CLEAN SLATE: DROP EXISTING TABLES IN REVERSE DEPENDENCY ORDER
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.proctor_logs CASCADE;
DROP TABLE IF EXISTS public.evaluations CASCADE;
DROP TABLE IF EXISTS public.interviews CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.candidates CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.recruiters CASCADE;

-- 1. RECRUITERS (Extends Native Supabase auth.users for B2B SaaS Governance)
CREATE TABLE public.recruiters (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'recruiter' CHECK (role IN ('admin', 'recruiter')),
    is_allowed BOOLEAN DEFAULT true NOT NULL,
    credits_balance INT DEFAULT 100 CHECK (credits_balance >= 0) NOT NULL,
    total_credits_used INT DEFAULT 0 CHECK (total_credits_used >= 0) NOT NULL,
    total_ai_tokens_used INT DEFAULT 0 CHECK (total_ai_tokens_used >= 0) NOT NULL,
    total_ai_cost_usd NUMERIC(10, 4) DEFAULT 0.0000 CHECK (total_ai_cost_usd >= 0) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- 2. JOBS (Recruiter Job Postings with Expiration Lifecycle)
CREATE TABLE public.jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recruiter_id UUID REFERENCES public.recruiters(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(100) DEFAULT 'Engineering',
    description TEXT NOT NULL,
    min_experience SMALLINT DEFAULT 0 CHECK (min_experience >= 0),
    duration_days SMALLINT DEFAULT 30 CHECK (duration_days > 0),
    expires_at TIMESTAMPTZ DEFAULT timezone('utc', now() + interval '30 days') NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'expired', 'closed')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- 3. CANDIDATES (Demographic Profiles & 50-Mark Stage Breakdown Scores)
CREATE TABLE public.candidates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    gender VARCHAR(20),
    city VARCHAR(100),
    github_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    cv_match_score SMALLINT DEFAULT 0 CHECK (cv_match_score >= 0 AND cv_match_score <= 10),
    mcq_score SMALLINT DEFAULT 0 CHECK (mcq_score >= 0 AND mcq_score <= 20),
    interview_score SMALLINT DEFAULT 0 CHECK (interview_score >= 0 AND interview_score <= 20),
    total_score SMALLINT DEFAULT 0 CHECK (total_score >= 0 AND total_score <= 50),
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- 4. APPLICATIONS (Junction Table: Job Applications & 3-Stage Composite Scores)
CREATE TABLE public.applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'screening', 'interviewing', 'completed', 'offered', 'rejected')),
    cv_url VARCHAR(512) NOT NULL,
    resume_text TEXT,
    ai_summary TEXT,
    match_score SMALLINT CHECK (match_score >= 0 AND match_score <= 100),
    cv_match_score SMALLINT DEFAULT 0 CHECK (cv_match_score >= 0 AND cv_match_score <= 10),
    mcq_score SMALLINT DEFAULT 0 CHECK (mcq_score >= 0 AND mcq_score <= 20),
    interview_score SMALLINT DEFAULT 0 CHECK (interview_score >= 0 AND interview_score <= 20),
    total_score SMALLINT DEFAULT 0 CHECK (total_score >= 0 AND total_score <= 50),
    hiring_confidence SMALLINT CHECK (hiring_confidence >= 0 AND hiring_confidence <= 100),
    passed_knockout BOOLEAN DEFAULT true,
    knockout_reason TEXT,
    applied_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
    CONSTRAINT unique_candidate_per_job UNIQUE(job_id, candidate_id)
);

-- 5. QUESTIONS (Technical, HR & MCQ Question Bank)
CREATE TABLE public.questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'technical' CHECK (category IN ('technical', 'hr', 'mcq')),
    ideal_answer TEXT,
    mcq_options JSONB,
    correct_option VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- 6. INTERVIEWS (Candidate AI HR Voice & Simli Avatar Interview Sessions)
CREATE TABLE public.interviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id UUID UNIQUE NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'abandoned')),
    current_question_index SMALLINT DEFAULT 0 CHECK (current_question_index >= 0),
    interview_transcript TEXT DEFAULT '',
    overall_score SMALLINT CHECK (overall_score >= 0 AND overall_score <= 100),
    truthfulness_score SMALLINT CHECK (truthfulness_score >= 0 AND truthfulness_score <= 100),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- 7. EVALUATIONS (4-Dimensional XAI Scoring & Candidate Feedback)
CREATE TABLE public.evaluations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
    technical_score SMALLINT CHECK (technical_score >= 0 AND technical_score <= 100),
    communication_score SMALLINT CHECK (communication_score >= 0 AND communication_score <= 100),
    honesty_score SMALLINT CHECK (honesty_score >= 0 AND honesty_score <= 100),
    problem_solving_score SMALLINT CHECK (problem_solving_score >= 0 AND problem_solving_score <= 100),
    overall_score SMALLINT CHECK (overall_score >= 0 AND overall_score <= 100),
    xai_reasoning JSONB NOT NULL,
    strengths TEXT[] DEFAULT '{}',
    red_flags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- 8. PROCTOR_LOGS (Anti-Cheat Telemetry & Integrity Logs)
CREATE TABLE public.proctor_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    description TEXT,
    severity VARCHAR(20) DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- 9. AUDIT_LOGS (System Governance & Security Audit Trail)
CREATE TABLE public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    target_resource VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- =============================================================================
-- INDEXES & PERFORMANCE OPTIMIZATIONS
-- =============================================================================
CREATE INDEX idx_jobs_recruiter ON public.jobs(recruiter_id);
CREATE INDEX idx_jobs_status_expires ON public.jobs(status, expires_at);
CREATE INDEX idx_candidates_email ON public.candidates(email);
CREATE INDEX idx_applications_job ON public.applications(job_id);
CREATE INDEX idx_applications_candidate ON public.applications(candidate_id);
CREATE INDEX idx_questions_job_category ON public.questions(job_id, category);
CREATE INDEX idx_interviews_application ON public.interviews(application_id);
CREATE INDEX idx_evaluations_interview ON public.evaluations(interview_id);
CREATE INDEX idx_proctor_logs_interview ON public.proctor_logs(interview_id);
CREATE INDEX idx_audit_logs_actor ON public.audit_logs(actor_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES & GOVERNANCE
-- =============================================================================
ALTER TABLE public.recruiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proctor_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Recruiters Profile Access
CREATE POLICY "Recruiters access own profile" ON public.recruiters 
    FOR ALL USING (auth.uid() = id);

-- Public Read & Recruiter Job Management
CREATE POLICY "Public read active jobs" ON public.jobs 
    FOR SELECT USING (status = 'active' AND expires_at > timezone('utc', now()));

CREATE POLICY "Recruiters manage own jobs" ON public.jobs 
    FOR ALL USING (recruiter_id = auth.uid());

-- Recruiter Access to Applications & Candidates
CREATE POLICY "Recruiters view applications" ON public.applications 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.jobs 
            WHERE jobs.id = applications.job_id 
            AND jobs.recruiter_id = auth.uid()
        )
    );
