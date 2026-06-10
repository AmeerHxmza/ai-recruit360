# Folder Structure & Migration Plan

This plan outlines the transition of AI-Recruit360 from its current monolithic structure to an enterprise-grade, production-ready architecture. The frontend will adopt a scalable `src/` directory pattern with Shadcn UI, and the backend will embrace Clean Architecture with the Repository Pattern.

## User Review Required
> [!IMPORTANT]
> Please review the proposed folder structure and the migration phases below. Once you approve, I will begin executing the migration step-by-step.

---

## 1. Current Structure

### Frontend
```text
frontend/
├── app/
│   ├── apply/
│   ├── auth/
│   ├── dashboard/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
├── lib/
├── public/
├── .env
├── .gitignore
├── components.json
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── supabase_schema.sql
└── tsconfig.json
```

### Backend
```text
backend/
├── core/
│   ├── config.py
│   └── supabase_client.py
├── middleware/
│   └── auth.py
├── routers/
│   ├── apply.py
│   ├── candidates.py
│   └── jobs.py
├── services/
│   ├── gemini_service.py
│   ├── pdf_parser.py
│   └── scoring_engine.py
├── .env
├── .env.example
├── .gitignore
├── main.py
├── requirements.txt
└── supabase_schema_additions.sql
```

---

## 2. Proposed Structure

### Frontend (Next.js 15, TypeScript, Tailwind, Shadcn)
Adopting the `src` directory pattern prevents clutter in the root and enforces a clean separation of concerns.

```text
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Route groups for layout sharing without affecting URL
│   │   ├── (dashboard)/
│   │   ├── api/                # Next.js API Routes (if needed)
│   │   ├── globals.css         # Global Tailwind & Shadcn styles
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Auto-generated Shadcn components (Button, Input, etc.)
│   │   ├── layout/             # Layout-specific components (Sidebar, Navbar)
│   │   └── features/           # Feature-specific components (CandidateCard, JobForm)
│   ├── hooks/                  # Custom React hooks (e.g., useCandidates, useAuth)
│   ├── lib/                    # Utility functions and core configuration
│   │   ├── supabase/           # Supabase client initialization
│   │   └── utils.ts            # Common utilities (cn for tailwind-merge)
│   ├── types/                  # Global TypeScript types (Supabase generated DB types)
│   ├── schemas/                # Zod schemas for form and API validation
│   └── services/               # API call wrappers (fetching data from FastAPI)
├── public/                     # Static assets (images, icons)
├── .env.local
├── components.json             # Shadcn configuration
├── next.config.ts
├── package.json
├── tailwind.config.ts          # Migrated from inline postcss for v4/v3 compat if needed
└── tsconfig.json               # Configured with paths compiler option ("@/*")
```

### Backend (FastAPI, Clean Architecture)
Decoupling the API routing, business logic, and database interactions using the Repository Pattern.

```text
backend/
├── src/
│   ├── api/                    # API Presentation Layer
│   │   ├── dependencies/       # FastAPI Depends (auth_user, get_db)
│   │   ├── v1/                 # API Versioning
│   │   │   └── routers/        # FastAPI routers (jobs, candidates, etc.)
│   │   └── router.py           # Main API router aggregator
│   ├── core/                   # Application Core Configurations
│   │   ├── config.py           # Pydantic Settings
│   │   ├── exceptions.py       # Custom Domain Exceptions & Error Handlers
│   │   ├── logger.py           # Centralized Logging
│   │   └── security.py         # JWT validation logic
│   ├── domain/                 # Domain Layer (Enterprise Logic)
│   │   └── schemas/            # Pydantic Schemas for Requests/Responses
│   ├── infrastructure/         # External Dependencies (DB, 3rd Party APIs)
│   │   ├── database/           # Supabase Client setup
│   │   ├── repositories/       # Data Access Layer (Repository Pattern)
│   │   │   ├── base.py         # Generic CRUD operations
│   │   │   ├── job_repository.py
│   │   │   └── candidate_repository.py
│   │   └── external/           # 3rd Party Integrations
│   │       ├── openai_client.py # Renamed from gemini_service to reflect actual model
│   │       └── pdf_parser.py
│   ├── services/               # Application Service Layer (Business Rules)
│   │   ├── job_service.py
│   │   ├── candidate_service.py
│   │   ├── evaluation_service.py
│   │   └── scoring_engine.py
│   └── main.py                 # Application Entrypoint
├── tests/                      # Automated Testing Suite (Pytest)
│   ├── api/
│   ├── services/
│   └── infrastructure/
├── database/                   # Unified Database Migrations & Schemas
│   └── schema.sql              # Merged and cleaned up schema
├── requirements.txt            
├── .env.example
└── .gitignore
```

---

## 3. Migration Plan

### Phase 1: Preparation & Configuration Setup
1. Create the new directory skeletons for `frontend/src/` and `backend/src/`.
2. Update `tsconfig.json` to properly alias the `@/*` paths to `src/*`.
3. Reconfigure Shadcn UI (`components.json`) to target `src/components/ui`.
4. Setup unified database folder and merge duplicate schema files (`frontend/supabase_schema.sql` & `backend/supabase_schema_additions.sql`) into `backend/database/schema.sql`.

### Phase 2: Backend Refactoring (Clean Architecture)
1. **Core & Infrastructure**: Move configurations to `src/core/`. Set up `src/infrastructure/database/` and implement the base and specific Repositories to handle all Supabase I/O.
2. **External Integrations**: Move PDF parsing and AI clients into `src/infrastructure/external/`. Rename `gemini_service.py` to `openai_client.py` for accuracy.
3. **Domain & Services**: Define strong Pydantic schemas in `src/domain/schemas/`. Update `src/services/` to accept Repositories via dependency injection rather than calling Supabase directly.
4. **API Layer**: Update `src/api/v1/routers/` to utilize dependencies and call the Service Layer. Bind everything to `src/main.py`.
5. Run the server to ensure functionality remains intact.

### Phase 3: Frontend Refactoring (App Router & Shadcn)
1. **Move Core App**: Relocate `app/`, `components/`, and `lib/` into the `src/` directory.
2. **Reorganize Components**: Split components into `ui/`, `layout/`, and `features/`.
3. **Route Grouping**: Create logical route groups (`(auth)`, `(dashboard)`) within the `app` directory to allow for isolated layouts.
4. **Type Safety & Data Fetching**: Centralize Supabase types in `src/types/` and extract external API calls to `src/services/`.
5. Run `next dev` and verify routing and styling are working correctly.

### Phase 4: Clean Up
1. Delete legacy folders and duplicate files.
2. Fix broken imports across both codebases.
3. Generate initial `pytest` scaffolding for the backend to encourage future test coverage.

## Open Questions
- Shall we unify the environment variables handling (e.g., separating `.env.local` vs `.env.development`)?
- Do you want me to automatically install `pytest` and basic testing scaffolding during Phase 4?
