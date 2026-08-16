"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();
import { Skeleton } from "@/components/ui/skeleton";
import { Video, Search, MessageSquare, CheckCircle2, AlertTriangle, XCircle, ChevronRight, Sparkles } from "lucide-react";
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
  if (status === "Excellent" || status === "Strong") return <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" strokeWidth={2} />;
  if (status === "Weak") return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" strokeWidth={2} />;
  return <XCircle className="w-4 h-4 text-red-500 shrink-0" strokeWidth={2} />;
}

function evalBadgeClass(status: string) {
  if (status === "Excellent" || status === "Strong") return "rounded-full px-3 py-1 text-xs font-medium bg-emerald-50 text-[#10B981] border border-emerald-100";
  if (status === "Weak") return "rounded-full px-3 py-1 text-xs font-medium bg-amber-50 text-[#F59E0B] border border-amber-100";
  return "rounded-full px-3 py-1 text-xs font-medium bg-rose-50 text-[#EF4444] border border-rose-100";
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
              candidateName: cand?.name || "Unknown Candidate",
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
      <div className="border-b border-gray-200 pb-6">
        <div className="eyebrow flex items-center gap-2 mb-1.5">
          <Video className="w-3.5 h-3.5 text-[#4361EE]" strokeWidth={2} />
          <span>Interview Evaluation Portal</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">
          AI Interview Rooms &amp; Transcripts
        </h1>
        <p className="font-sans text-xs text-[#6B7280] mt-1">
          Completed AI interview sessions with response-level evaluation telemetry.
        </p>
      </div>

      {/* Search Input Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative sm:max-w-sm">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" strokeWidth={2} />
          <input
            placeholder="Search candidate name or position..."
            className="w-full h-10 pl-10 pr-4 text-xs font-sans rounded-lg border border-gray-200 text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4361EE]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Session Cards */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-3">
              <Skeleton className="h-5 w-1/3 bg-gray-100" />
              <Skeleton className="h-4 w-1/4 bg-gray-100" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center space-y-2">
            <h3 className="font-display text-lg font-bold text-[#1F2937]">No interview sessions found</h3>
            <p className="font-sans text-xs text-[#6B7280]">Candidates will appear here as soon as they complete their Q&amp;A sessions.</p>
          </div>
        ) : (
          filtered.map((s) => {
            const isExpanded = expandedId === s.candidateId;
            return (
              <div key={s.candidateId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all">
                <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-display text-lg font-bold text-[#1F2937]">{s.candidateName}</h3>
                      <span className="rounded-full px-3 py-1 text-xs font-mono font-bold bg-blue-50 text-[#4361EE]">
                        Score {s.avgScore}%
                      </span>
                    </div>
                    <p className="font-sans text-xs text-[#6B7280]">
                      {s.roleApplied} • {s.questionCount} Questions Answered
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : s.candidateId)}
                      className="bg-gray-100 hover:bg-gray-200 text-[#1F2937] text-xs font-bold py-2 px-4 rounded-lg transition-all"
                    >
                      {isExpanded ? "Hide Q&A" : "View Responses"}
                    </button>

                    <Link href={`/dashboard/candidates/${s.candidateId}`}>
                      <button className="bg-[#4361EE] hover:bg-[#3A56D4] text-white text-xs font-bold py-2 px-4 rounded-lg shadow-sm">
                        Full Report
                      </button>
                    </Link>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-6 bg-gray-50/50 border-t border-gray-100 space-y-4">
                    <h4 className="font-display text-xs font-bold text-[#1F2937] uppercase tracking-wider">Interview Responses &amp; AI Telemetry</h4>
                    <div className="space-y-3">
                      {s.responses.map((r, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-[#4361EE]">Q{idx + 1}: {r.question}</span>
                            <span className={evalBadgeClass(r.evaluation_status)}>{r.evaluation_status}</span>
                          </div>
                          <p className="font-sans text-xs text-[#6B7280] leading-relaxed">{r.feedback}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
