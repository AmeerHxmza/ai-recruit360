# AI-Recruit360 Project Audit Report

> [!NOTE]
> This audit report has been generated based on a comprehensive static analysis of the `frontend` and `backend` codebases.

## 1. Overall Architecture
The project follows a **decoupled Client-Server architecture**:
- **Frontend**: A modern web application built with Next.js and React.
- **Backend**: A RESTful API built with FastAPI (Python).
- **Database & Auth**: Supabase (PostgreSQL) is used as a Database-as-a-Service, handling data persistence, user authentication (JWT), and file storage (resumes).
- **AI Integration**: OpenAI (`gpt-4o-mini`) is utilized heavily for resume parsing, dynamic interview question generation, and candidate evaluation.

## 2. Frontend Architecture
- **Framework**: Next.js 16.1.6 utilizing the modern App Router (`app/` directory).
- **Styling**: Tailwind CSS v4 alongside Radix UI for accessible, unstyled component primitives.
- **Animations**: Framer Motion and `tailwindcss-animate` for dynamic UI feedback.
- **State & Data**: Relies on React 19 features and the Supabase JS client for direct database interactions where appropriate.
- **Routing**: Segregated into logical areas such as `/auth`, `/dashboard`, and `/apply`.

## 3. Backend Architecture
- **Framework**: FastAPI (0.115.5) providing async API endpoints with automatic Swagger/ReDoc documentation.
- **Structure**: Modularized into `core/` (config), `middleware/` (auth), `routers/` (API endpoints), and `services/` (business logic).
- **AI Services**: The `gemini_service.py` (which actually utilizes OpenAI's Async client) handles interactions with LLMs, enforcing JSON outputs via prompt engineering.
- **Scoring Engine**: A composite evaluation engine (`scoring_engine.py`) calculates hiring confidence based on job match, interview performance, truthfulness, and quiz scores.

## 4. Database Architecture
- **Database**: PostgreSQL hosted on Supabase.
- **Schema**:
  - Core Entities: `jobs`, `candidates`, `skills`.
  - Evaluation Entities: `candidate_scores`, `interview_responses`, `reasoning_logs`, `recruiter_notes`.
- **Security**: Row Level Security (RLS) is enabled, though current policies are heavily relaxed for the "FYP demo" state.
- **Storage**: A dedicated `resumes` bucket is defined for CV uploads.

---

## 5. Identified Missing Features
- **Quiz System**: The `scoring_engine.py` reserves 20% of the score for `quiz_score`, but mentions it defaults to 0 as the quiz is "not yet implemented."
- **Testing Suite**: There are no automated tests (e.g., `pytest` for backend, `jest` or Cypress for frontend) present in the repository.
- **Rate Limiting**: No rate limiting is configured on the backend endpoints, leaving it vulnerable to abuse or excessive OpenAI API costs.
- **Global Error Handler**: The FastAPI backend lacks a centralized exception handler to format errors consistently for the frontend.

## 6. Bad Coding Practices
> [!WARNING]
> Several anti-patterns were identified that should be refactored before production.
- **Swallowed Exceptions**: In `gemini_service.py` and `scoring_engine.py`, there are bare `except Exception: pass` blocks. This silently hides failures (e.g., if re-ranking fails or AI integrity checks fail), making debugging extremely difficult.
- **Fragile JSON Parsing**: `_parse_json` in `gemini_service.py` relies on regex (`re.sub`) to strip markdown from LLM responses. This is brittle; it is highly recommended to use OpenAI's native JSON mode or Structured Outputs via Pydantic.
- **Hardcoded Configurations**: `main.py` hardcodes allowed CORS origins. This should be driven entirely by environment variables.
- **Misleading Naming**: The file `gemini_service.py` actually instantiates an `AsyncOpenAI` client using the `gpt-4o-mini` model.

## 7. Security Risks
> [!CAUTION]
> Critical security vulnerabilities exist in the current configuration.
- **Severe Data Exposure (RLS)**: In `frontend/supabase_schema.sql`, policies like `CREATE POLICY "Public read access" ON public.candidates FOR SELECT USING (true);` are defined. This exposes Personally Identifiable Information (PII) including names, emails, and CV URLs to the public internet without authentication.
- **Symmetric JWT Verification**: The backend (`middleware/auth.py`) manually decodes Supabase JWTs using `SUPABASE_JWT_SECRET`. While functional, the standard and more secure practice is to verify tokens asynchronously using Supabase's JWKS endpoint.

## 8. Scalability Risks
- **Synchronous Re-ranking**: The `rerank_candidates_for_job` function pulls all candidates for a job, sorts them in memory, and then executes an `UPDATE` query inside a loop for *every* candidate sequentially. As candidate volume grows, this will cause severe performance degradation and database lock contention.
- **Blocking I/O**: If `pdf_parser.py` (using `pypdf`) is executed synchronously within FastAPI route handlers, it will block the async event loop during heavy PDF processing, reducing backend throughput.

## 9. Duplicate Code
- **Database Schemas**: There are overlapping and redundant SQL definitions between `frontend/supabase_schema.sql` and `backend/supabase_schema_additions.sql` (e.g., redefining tables, columns, and RLS policies). This split-brain schema management will inevitably lead to drift and deployment failures.
- **Router Duplication**: In `main.py`, the `candidates.router` is mounted twice (once at `/api/v1/candidates` and again at `/api/candidates`). While marked for "legacy backward-compat", it increases the API surface area unnecessarily.
