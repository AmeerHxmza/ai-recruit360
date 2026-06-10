# Authentication Architecture & Route Protection Plan

This document outlines the proposed authentication architecture for AI-Recruit360, upgrading the current basic JWT validation to a robust, role-based security model utilizing Supabase Auth.

## 1. Authentication Architecture

The system will use **Supabase Auth** as the central identity provider. To differentiate between Recruiters and Candidates, we will implement **Role-Based Access Control (RBAC)**.

- **Session Management**: Sessions will be managed via secure, HTTP-only cookies on the frontend using `@supabase/ssr`. The backend will consume the JWT provided in the `Authorization: Bearer <token>` header.
- **Role Assignment**: 
  - Roles (`recruiter`, `candidate`) can be managed via a `public.user_roles` table, or by using Supabase Custom Claims (`app_metadata.role`).
  - For simplicity and database-level security, we will use a `public.profiles` or `public.user_roles` table that is automatically populated via a Supabase Database Trigger upon user signup.
- **Recruiter Role Flow**: Recruiters log in via the `/auth/login` portal. Upon successful login, they receive a JWT. The frontend routes them to the `/dashboard`.
- **Candidate Role Flow**: Candidates applying for a job or taking an interview authenticate via Magic Link or OTP sent to their email. This issues a candidate-scoped JWT, allowing them to access their specific `/interview/[id]` session without needing a permanent password.

## 2. Route Protection Plan

Route protection will be enforced at three layers: Frontend Middleware, Backend API Dependencies, and Database RLS.

### Frontend (Next.js Middleware)
A Next.js `middleware.ts` file will run on the Edge to intercept requests and validate the Supabase session cookie before rendering pages.
- **`/dashboard/:path*`**: Requires an active session AND the `recruiter` role. If unauthenticated, redirect to `/auth/login`. If a candidate tries to access it, redirect to an `/unauthorized` or `/interview` page.
- **`/interview/:path*`**: Requires an active session AND the `candidate` role.
- **`/auth/:path*`**: If a user is already authenticated, redirect them automatically to their respective home page (`/dashboard` for recruiters, `/interview` for candidates).
- **Public Routes**: `/` (Landing Page), `/apply/[job_id]` (Job Application Form) remain fully public.

### Backend (FastAPI Dependencies)
FastAPI will utilize granular dependency injection to protect routes based on roles.
- `get_current_user`: Base dependency to validate the JWT.
- `require_recruiter`: Inherits from `get_current_user` and asserts `role == 'recruiter'`. Applied to all job creation and candidate evaluation endpoints.
- `require_candidate`: Inherits from `get_current_user` and asserts `role == 'candidate'`. Applied only to interview response submissions.

## 3. Security Improvements

> [!WARNING]  
> The current backend uses a hardcoded `SUPABASE_JWT_SECRET` to symmetrically decode tokens. This is a security risk.

1. **Verify via Supabase Client or JWKS**: Instead of manually using the `jose` library to decode the token with a symmetric secret, the backend should ideally verify the token against Supabase's JWKS endpoint, or utilize the official Supabase Python client `supabase.auth.get_user(jwt)` which handles secure validation automatically.
2. **Strict RLS Policies**: Database Row Level Security (RLS) policies will be updated to explicitly check the user's role. For example: `CREATE POLICY "Recruiters can update jobs" ON jobs FOR UPDATE USING (auth.uid() = recruiter_id AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'recruiter');`
3. **Cookie Security**: Ensure the `@supabase/ssr` client sets cookies with `Secure`, `HttpOnly`, and `SameSite=Lax` attributes.

## 4. Required File Changes

To implement this architecture, the following files will be created or modified (no code will be written until approved):

### Frontend Changes
- **[NEW]** `src/middleware.ts`: Next.js middleware for route interception and role checking.
- **[NEW]** `src/lib/supabase/server.ts`, `client.ts`, `middleware.ts`: Setup of `@supabase/ssr` to securely handle auth cookies across Server Components, Client Components, and Middleware.
- **[MODIFY]** `src/app/layout.tsx`: Add a Supabase Auth Provider context to manage client-side session state seamlessly.
- **[MODIFY]** `src/app/auth/page.tsx`: Update login forms to use the new `@supabase/ssr` client actions.

### Backend Changes
- **[NEW]** `src/core/security.py`: Create the robust `require_recruiter` and `require_candidate` dependency functions.
- **[MODIFY]** `src/middleware/auth.py`: Deprecate or refactor the current symmetric JWT decoding logic to use secure Supabase token validation.
- **[MODIFY]** `src/api/v1/routers/jobs.py` & `candidates.py`: Inject the `require_recruiter` dependency into all state-mutating endpoints.
- **[MODIFY]** `src/api/v1/routers/apply.py`: Inject the `require_candidate` dependency into the interview submission endpoints.

### Database Changes
- **[NEW]** `database/schema.sql` (Additions):
  - Create a `profiles` or `user_roles` table mapping `auth.users(id)` to roles.
  - Create a Postgres Trigger `on_auth_user_created` to automatically insert a role record when a user signs up.
