"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();
import { Skeleton } from "@/components/ui/skeleton";
import { Video, Search, MessageSquare, CheckCircle2, AlertTriangle, XCircle, ChevronRight } from "lucide-react";
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
  if (status === "Excellent" || status === "Strong") return <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] shrink-0" strokeWidth={1.75} />;
  if (status === "Weak") return <AlertTriangle className="w-3.5 h-3.5 text-[#EAB308] shrink-0" strokeWidth={1.75} />;
  return <XCircle className="w-3.5 h-3.5 text-[#EF4444] shrink-0" strokeWidth={1.75} />;
}

function evalBadgeClass(status: string) {
  if (status === "Excellent" || status === "Strong") return "badge-success";
  if (status === "Weak") return "badge-warning";
  return "badge-danger";
}

export default function InterviewsPage() {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
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
        const grouped: Record<string, InterviewSession> = {};
        for (const row of data as any[]) {
          const cid = row.candidate_id;
          const cand = Array.isArray(row.candidates) ? row.candidates[0] : row.candidates;
          if (!grouped[cid]) {
            grouped[cid] = {
              candidateId: cid,
              candidateName: cand?.name || "Unknown",
              roleApplied: cand?.role_applied || "Engineering Role",
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
          if (row.created_at > grouped[cid].completedAt) {
            grouped[cid].completedAt = row.created_at;
          }
        }

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
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="border-b border-[rgba(148,163,184,0.12)] pb-6">
        <div className="eyebrow flex items-center gap-2 mb-1">
          <Video className="w-3.5 h-3.5 text-[#8AB4F8]" strokeWidth={1.75} />
          <span>Interview Evaluation Portal</span>
        </div>
        <h1 className="font-display text-3xl font-medium text-[#F2F5F9]">
          Interviews
        </h1>
        <p className="font-sans text-xs text-[#9AA6B8] mt-1">
          Completed AI interview sessions with response-level evaluation.
        </p>
      </div>

      {/* Search Input Filter */}
      <div className="card-enterprise p-4">
        <div className="relative sm:max-w-sm">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#66707F]" strokeWidth={1.75} />
          <input
            placeholder="Search candidate name or position..."
            className="input-enterprise w-full pl-10 h-10 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card-enterprise p-6 space-y-3">
              <Skeleton className="h-5 w-1/3 bg-[#0B1019]" />
              <Skeleton className="h-4 w-1/4 bg-[#0B1019]" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="card-enterprise p-12 text-center flex flex-col items-center justify-center">
            <Video className="w-10 h-10 text-[#66707F] mb-3" strokeWidth={1.75} />
            <h3 className="font-display text-lg font-medium text-[#F2F5F9] mb-1">No interviews completed yet</h3>
            <p className="font-sans text-xs text-[#9AA6B8] max-w-md">
              Candidate interview responses will appear here once they complete the AI interview portal.
            </p>
          </div>
        ) : (
          filtered.map((session) => (
            <div key={session.candidateId} className="card-enterprise p-0 overflow-hidden">
              {/* Session Summary Header */}
              <button
                onClick={() =>
                  setExpandedId(
                    expandedId === session.candidateId ? null : session.candidateId
                  )
                }
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-[#121B2B] transition-colors"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-[rgba(138,180,248,0.10)] border border-[rgba(148,163,184,0.12)] text-[#8AB4F8] font-mono text-xs font-medium flex items-center justify-center shrink-0">
                  {session.candidateName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/candidates/${session.candidateId}`}
                      className="font-display text-base font-medium text-[#F2F5F9] hover:text-[#8AB4F8] transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {session.candidateName}
                    </Link>
                    {session.candidateStatus === "Risk Detected" && (
                      <span className="badge-danger">Risk</span>
                    )}
                  </div>
                  <p className="font-sans text-xs text-[#9AA6B8]">{session.roleApplied}</p>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-6 text-xs font-mono shrink-0">
                  <div className="text-center">
                    <div className="font-medium text-[#F2F5F9]">{session.questionCount}</div>
                    <div className="text-[10px] text-[#66707F]">Questions</div>
                  </div>
                  <div className="text-center">
                    <div className={`font-medium ${session.avgScore >= 70 ? "text-[#22C55E]" : session.avgScore >= 50 ? "text-[#EAB308]" : "text-[#EF4444]"}`}>
                      {session.avgScore}%
                    </div>
                    <div className="text-[10px] text-[#66707F]">Avg Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-[#9AA6B8]">
                      {new Date(session.completedAt).toLocaleDateString()}
                    </div>
                    <div className="text-[10px] text-[#66707F]">Completed</div>
                  </div>
                </div>

                {/* Expand chevron */}
                <div className={`transition-transform duration-200 text-[#9AA6B8] ${expandedId === session.candidateId ? "rotate-90" : ""}`}>
                  <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
                </div>
              </button>

              {/* Expanded Q&A List */}
              {expandedId === session.candidateId && (
                <div className="border-t border-[rgba(148,163,184,0.12)] p-5 bg-[#0B1019] space-y-3">
                  <span className="eyebrow block mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#8AB4F8]" strokeWidth={1.75} />
                    Response Breakdown
                  </span>
                  <div className="space-y-3">
                    {session.responses.map((r, i) => (
                      <div key={i} className="bg-[#0C121D] rounded-[8px] border border-[rgba(148,163,184,0.12)] p-4 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-sans text-xs font-medium text-[#F2F5F9]">
                            Q{i + 1}: {r.question}
                          </p>
                          <span className={`${evalBadgeClass(r.evaluation_status)} shrink-0`}>
                            {r.evaluation_status}
                          </span>
                        </div>
                        {r.feedback && (
                          <p className="font-sans text-xs text-[#9AA6B8] flex items-start gap-2 pt-1 border-t border-[rgba(148,163,184,0.12)]">
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
