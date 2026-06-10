"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Video, Search, MessageSquare, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import Link from "next/link";

type InterviewSession = {
  candidateId: string;
  candidateName: string;
  roleApplied: string;
  candidateStatus: string;
  questionCount: number;
  avgScore: number;
  completedAt: string;
  responses: Array<{
    question: string;
    score: number;
    evaluation_status: string;
    feedback: string;
  }>;
};

function EvalIcon({ status }: { status: string }) {
  if (status === "Excellent") return <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />;
  if (status === "Strong")    return <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />;
  if (status === "Weak")      return <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />;
  return <XCircle className="w-3.5 h-3.5 text-destructive shrink-0" />;
}

function evalBadgeClass(status: string) {
  if (status === "Excellent") return "badge-verified";
  if (status === "Strong")    return "badge-strong";
  if (status === "Weak")      return "badge-review";
  return "badge-risk";
}

export default function InterviewsPage() {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      // Fetch interview_responses joined with candidates
      const { data } = await supabase
        .from("interview_responses")
        .select(`
          candidate_id,
          question_text,
          answer_text,
          score,
          evaluation_status,
          feedback,
          created_at,
          candidates (
            id, name, role_applied, status
          )
        `)
        .order("created_at", { ascending: false });

      if (data) {
        // Group by candidate_id
        const grouped: Record<string, InterviewSession> = {};
        for (const row of data as any[]) {
          const cid = row.candidate_id;
          const cand = Array.isArray(row.candidates) ? row.candidates[0] : row.candidates;
          if (!grouped[cid]) {
            grouped[cid] = {
              candidateId: cid,
              candidateName: cand?.name || "Unknown",
              roleApplied: cand?.role_applied || "Unknown Role",
              candidateStatus: cand?.status || "Pending",
              questionCount: 0,
              avgScore: 0,
              completedAt: row.created_at,
              responses: [],
            };
          }
          grouped[cid].questionCount++;
          grouped[cid].responses.push({
            question: row.question_text,
            score: row.score || 0,
            evaluation_status: row.evaluation_status || "Weak",
            feedback: row.feedback || "",
          });
          // Latest timestamp
          if (row.created_at > grouped[cid].completedAt) {
            grouped[cid].completedAt = row.created_at;
          }
        }
        // Calculate avg scores
        const result = Object.values(grouped).map((s) => ({
          ...s,
          avgScore:
            s.responses.length > 0
              ? Math.round(
                  s.responses.reduce((acc, r) => acc + r.score, 0) / s.responses.length
                )
              : 0,
        }));
        setSessions(result);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return sessions.filter((s) =>
      `${s.candidateName} ${s.roleApplied}`
        .toLowerCase()
        .includes(search.toLowerCase().trim())
    );
  }, [sessions, search]);

  return (
    <div className="space-y-6 pb-10 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Video className="w-7 h-7 text-primary" />
          Interviews
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Completed AI interview sessions with response-level analysis.
        </p>
      </div>

      {/* Search */}
      <div className="surface-card p-3">
        <div className="relative sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="surface-card p-4">
              <Skeleton className="h-5 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="surface-card p-12 text-center flex flex-col items-center">
            <Video className="w-10 h-10 text-muted-foreground mb-3" />
            <h3 className="font-semibold text-foreground mb-1">No interviews completed yet</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Candidate interview responses will appear here once they complete the AI interview portal.
            </p>
          </div>
        ) : (
          filtered.map((session) => (
            <div key={session.candidateId} className="surface-card hover-lift overflow-hidden">
              {/* Session Header */}
              <button
                onClick={() =>
                  setExpandedId(
                    expandedId === session.candidateId ? null : session.candidateId
                  )
                }
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/20 transition-colors"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  {session.candidateName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/candidates/${session.candidateId}`}
                      className="font-semibold text-foreground hover:text-primary transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {session.candidateName}
                    </Link>
                    {session.candidateStatus === "Risk Detected" && (
                      <span className="badge-risk text-[10px]">Risk</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{session.roleApplied}</p>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-6 text-sm shrink-0">
                  <div className="text-center">
                    <div className="font-bold text-foreground">{session.questionCount}</div>
                    <div className="text-[10px] text-muted-foreground">Questions</div>
                  </div>
                  <div className="text-center">
                    <div className={`font-bold ${session.avgScore >= 70 ? "text-success" : session.avgScore >= 50 ? "text-warning" : "text-destructive"}`}>
                      {session.avgScore}%
                    </div>
                    <div className="text-[10px] text-muted-foreground">Avg Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">
                      {new Date(session.completedAt).toLocaleDateString()}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Completed</div>
                  </div>
                </div>

                {/* Expand chevron */}
                <div className={`transition-transform duration-200 text-muted-foreground ${expandedId === session.candidateId ? "rotate-90" : ""}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </button>

              {/* Expanded Q&A */}
              {expandedId === session.candidateId && (
                <div className="border-t border-border px-4 pb-4 pt-3 bg-muted/10">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Interview Responses
                  </h4>
                  <div className="space-y-3">
                    {session.responses.map((r, i) => (
                      <div key={i} className="bg-card rounded-lg border border-border p-3">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <p className="text-xs font-semibold text-foreground">
                            Q{i + 1}: {r.question}
                          </p>
                          <span className={`${evalBadgeClass(r.evaluation_status)} shrink-0`}>
                            {r.evaluation_status}
                          </span>
                        </div>
                        {r.feedback && (
                          <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <EvalIcon status={r.evaluation_status} />
                            {r.feedback}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
