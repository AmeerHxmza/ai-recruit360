# Recruiter Dashboard Design

This document details the architecture and layout for the production-grade Recruiter Dashboard, designed to provide high-level analytics, candidate leaderboards, and deep-dive XAI reports.

## 1. UI Structure

The dashboard will follow a modern, data-dense, yet clean layout utilizing Shadcn UI components.

- **Global Shell**: A persistent left-hand Sidebar (Navigation) and Top Header (Breadcrumbs, Search, User Menu).
- **Job Overview View (`/dashboard/jobs/[id]`)**: 
  - **Top Row**: KPI Cards (Total Candidates, Avg Technical Score, High Risk Flags).
  - **Middle Row**: Analytics charts (Score Distribution, Interview Funnel).
  - **Bottom Row**: **Candidate Leaderboard** (A sortable, filterable Data Table ranking candidates by their AI-generated Overall Score).
- **Candidate Detail View (`/dashboard/candidates/[id]`)**:
  - **Header**: Candidate Name, Applied Role, Status Badge (e.g., "Verified Match", "Risk Detected").
  - **Content Area (Tabs)**:
    - *Overview*: Resume summary, extracted skills, and a Radar chart of their 4 core scores.
    - *XAI Report*: Detailed breakdown of the AI's reasoning (Claim vs Reality, Transcript Evidence).
    - *Proctor Logs*: A timeline visualization of interview events (e.g., "Tab switch detected at 04:12").

## 2. Component Tree

A highly modular approach using React Server Components for data fetching and Client Components for interactivity.

```text
DashboardLayout (Server)
├── Sidebar (Client)
├── Header (Client)
└── PageContent
    ├── JobOverviewPage (Server)
    │   ├── JobMetricCards (Server)
    │   ├── AnalyticsDash (Client - uses Recharts)
    │   │   ├── ScoreDistributionBarChart
    │   │   └── FunnelChart
    │   └── CandidateLeaderboard (Client - Shadcn DataTable)
    │
    └── CandidateProfilePage (Server)
        ├── ProfileHeader (Server)
        ├── ScoreRadar (Client - uses Recharts)
        └── ProfileTabs (Client - Shadcn Tabs)
            ├── OverviewTab (Server)
            ├── XAIReportViewer (Client - Accordions for explanations)
            └── ProctorTimeline (Server)
```

## 3. API Flow

Adhering to our Data-Flow Architecture, the dashboard primarily performs **Read** operations.

1. **Next.js App Router**: A user visits `/dashboard/jobs/[id]`.
2. **Server Component Fetching**: The `page.tsx` file initializes the `@supabase/ssr` server client.
3. **Direct Supabase Query**: It executes the necessary joins via PostgREST (bypassing FastAPI entirely for low latency).
4. **Data Hydration**: The server passes the strongly typed data down to Client Components (like Recharts and DataTables) as props.
5. **Real-time Optional**: For the leaderboard, we can wrap the table in a Supabase Realtime subscription hook to see candidates pop into the ranking live as they finish interviews.

## 4. Database Queries

The following are the core PostgREST queries required to power the dashboard:

### A. Candidate Leaderboard (Fetch & Rank)
```javascript
// Fetch applications for a job, joined with candidate info and evaluations, ordered by score.
const { data, error } = await supabase
  .from('applications')
  .select(`
    id,
    status,
    match_score,
    candidates (first_name, last_name, email),
    interviews (
      overall_score,
      evaluations (
        technical_score, honesty_score, communication_score, problem_solving_score
      )
    )
  `)
  .eq('job_id', currentJobId)
  .order('interviews(overall_score)', { ascending: false });
```

### B. Candidate Deep-Dive (Profile, XAI, Logs)
```javascript
// Fetch everything related to a single interview for the deep dive
const { data, error } = await supabase
  .from('interviews')
  .select(`
    id, status, started_at, completed_at, overall_score, truthfulness_score,
    applications (
      candidate_id, cv_url, ai_summary,
      candidates (first_name, last_name, email, phone)
    ),
    evaluations (
      xai_reasoning, strengths, red_flags, 
      technical_score, communication_score, honesty_score, problem_solving_score
    ),
    proctor_logs (
      event_type, severity, description, created_at
    )
  `)
  .eq('application_id', currentApplicationId)
  .single();
```

## 5. Recharts Implementation Plan

To make the dashboard visually compelling and easy to parse at a glance, we will implement three primary chart types using `recharts`.

1. **Score Distribution (BarChart)**
   - **Location**: Job Analytics Dashboard.
   - **Purpose**: Shows the bell curve of candidate quality.
   - **Data Transformation**: Group candidates into score buckets (e.g., `<50`, `50-69`, `70-89`, `90-100`).
   - **UI**: A simple `<BarChart>` with customized tooltips and bars colored conditionally based on the bucket (red, yellow, green).

2. **Candidate Multi-Dimensional Profile (RadarChart)**
   - **Location**: Candidate Detail View.
   - **Purpose**: Instantly visually convey a candidate's strengths and weaknesses across the 4 core pillars.
   - **Data Structure**:
     ```javascript
     [
       { subject: 'Technical', score: 85, fullMark: 100 },
       { subject: 'Communication', score: 92, fullMark: 100 },
       { subject: 'Problem Solving', score: 78, fullMark: 100 },
       { subject: 'Honesty', score: 98, fullMark: 100 }
     ]
     ```
   - **UI**: A `<RadarChart>` with a filled `<Radar>` polygon, using the primary brand color with reduced opacity for a modern "glass" aesthetic.

3. **Interview Completion Trends (AreaChart)**
   - **Location**: Job Analytics Dashboard.
   - **Purpose**: Track pipeline velocity (how many interviews were completed per day).
   - **Data Transformation**: Group `interviews.completed_at` by date (`YYYY-MM-DD`) and count.
   - **UI**: A sleek `<AreaChart>` with a gradient fill under the curve to visualize momentum.
