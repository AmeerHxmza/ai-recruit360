"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Medal, Trophy, TrendingUp, Users, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

type Job = { id: string; title: string; department: string };
type RankedCandidate = {
  id: string;
  name: string;
  role_applied: string;
  status: string;
  rank: number;
  scores: {
    match_score: number;
    quiz_score: number;
    interview_score: number;
    truthfulness_score: number;
    hiring_confidence_score: number;
  };
};

function MedalIcon({ rank }: { rank: number }) {
  if (rank === 1)
    return <Trophy className="w-5 h-5 text-amber-500" strokeWidth={2} />;
  if (rank === 2)
    return <Medal className="w-5 h-5 text-slate-400" strokeWidth={2} />;
  if (rank === 3)
    return <Medal className="w-5 h-5 text-amber-700" strokeWidth={2} />;
  return (
    <span className="font-mono text-xs font-bold text-[#6B7280]">
      #{rank < 10 ? `0${rank}` : rank}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "Verified Match":   return <span className="rounded-full px-3 py-1 text-xs font-medium bg-emerald-50 text-[#10B981] border border-emerald-100">Verified Match</span>;
    case "Strong Candidate": return <span className="rounded-full px-3 py-1 text-xs font-medium bg-blue-50 text-[#4361EE] border border-blue-100">Strong Candidate</span>;
    case "Review Needed":    return <span className="rounded-full px-3 py-1 text-xs font-medium bg-amber-50 text-[#F59E0B] border border-amber-100">Review Needed</span>;
    case "Risk Detected":    return <span className="rounded-full px-3 py-1 text-xs font-medium bg-rose-50 text-[#EF4444] border border-rose-100">Risk Detected</span>;
    default:                 return <span className="rounded-full px-3 py-1 text-xs font-medium bg-emerald-50 text-[#10B981] border border-emerald-100">Passed</span>;
  }
}

export default function RankingsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [candidates, setCandidates] = useState<RankedCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(true);

  // Fetch jobs for dropdown
  useEffect(() => {
    async function fetchJobs() {
      setJobsLoading(true);
      const { data } = await supabase
        .from("jobs")
        .select("id, title, department")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (data && data.length > 0) {
        setJobs(data);
        setSelectedJobId(data[0].id);
      }
      setJobsLoading(false);
    }
    fetchJobs();
  }, []);

  // Fetch ranked candidates for selected job
  useEffect(() => {
    if (!selectedJobId) return;
    async function fetchRankings() {
      setIsLoading(true);
      const { data } = await supabase
        .from("applications")
        .select(`
          id, status, match_score, hiring_confidence,
          candidates ( id, first_name, last_name, name ),
          jobs ( title ),
          interviews ( overall_score, truthfulness_score )
        `)
        .eq("job_id", selectedJobId)
        .order("hiring_confidence", { ascending: false });

      if (data) {
        const mapped = data.map((app: any, idx) => {
          const candidate = app.candidates;
          const job = app.jobs;
          const interview = Array.isArray(app.interviews) ? app.interviews[0] : app.interviews;
          
          return {
            id: candidate?.id || app.id,
            name: candidate?.name || `${candidate?.first_name || ''} ${candidate?.last_name || ''}`.trim() || 'Unknown Candidate',
            role_applied: job?.title || "Engineering Role",
            status: app.status || "Pending",
            rank: idx + 1,
            scores: {
              match_score: app.match_score || 0,
              quiz_score: 0,
              interview_score: interview?.overall_score || 0,
              truthfulness_score: interview?.truthfulness_score || 0,
              hiring_confidence_score: app.hiring_confidence || 0,
            },
          };
        });
        setCandidates(mapped);
      }
      setIsLoading(false);
    }
    fetchRankings();
  }, [selectedJobId]);

  const selectedJob = jobs.find((j) => j.id === selectedJobId);
  const topCandidate = candidates[0];

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="eyebrow flex items-center gap-2 mb-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#4361EE]" strokeWidth={2} />
            <span>Leaderboard Analytics</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">
            Rankings &amp; XAI Leaderboard
          </h1>
          <p className="font-sans text-xs text-[#6B7280] mt-1">
            Candidates ranked dynamically by hiring confidence algorithm score.
          </p>
        </div>

        {/* Job Select */}
        <div className="w-full sm:w-[260px]">
          {jobsLoading ? (
            <Skeleton className="h-10 w-full bg-gray-100 rounded-lg" />
          ) : (
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger className="w-full h-10 bg-white border-gray-200 text-[#1F2937] text-xs font-sans rounded-lg focus:ring-2 focus:ring-[#4361EE]">
                <SelectValue placeholder="Select Job Requisition" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200 text-[#1F2937]">
                {jobs.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Top Candidate Spotlight */}
      {topCandidate && (
        <div className="bg-white rounded-xl shadow-sm border border-[#4361EE]/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-500 border border-amber-200 flex items-center justify-center font-bold font-mono text-xl shrink-0 shadow-sm">
              🏆
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#4361EE] uppercase">#1 Top Ranked Applicant</span>
                <StatusBadge status={topCandidate.status} />
              </div>
              <h2 className="font-display text-xl font-extrabold text-[#1F2937]">{topCandidate.name}</h2>
              <p className="font-sans text-xs text-[#6B7280]">{selectedJob?.title || topCandidate.role_applied}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="font-mono text-2xl font-extrabold text-[#4361EE]">
                {topCandidate.scores.hiring_confidence_score}%
              </div>
              <div className="font-sans text-[11px] text-[#6B7280]">Confidence Index</div>
            </div>
            <Link href={`/dashboard/candidates/${topCandidate.id}`}>
              <button className="bg-[#4361EE] hover:bg-[#3A56D4] text-white text-xs font-bold py-2.5 px-5 rounded-lg shadow-sm">
                View Full Audit
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="font-mono text-xs uppercase text-[#6B7280] font-semibold py-3 px-4 w-16 text-center">Rank</th>
                <th className="font-mono text-xs uppercase text-[#6B7280] font-semibold py-3 px-4">Candidate</th>
                <th className="font-mono text-xs uppercase text-[#6B7280] font-semibold py-3 px-4">Resume Match</th>
                <th className="font-mono text-xs uppercase text-[#6B7280] font-semibold py-3 px-4">AI Interview</th>
                <th className="font-mono text-xs uppercase text-[#6B7280] font-semibold py-3 px-4">Truthfulness</th>
                <th className="font-mono text-xs uppercase text-[#6B7280] font-semibold py-3 px-4">Confidence Score</th>
                <th className="font-mono text-xs uppercase text-[#6B7280] font-semibold py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td colSpan={7} className="p-4">
                      <Skeleton className="h-6 w-full bg-gray-100" />
                    </td>
                  </tr>
                ))
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-[#6B7280] text-xs font-mono">
                    No candidates evaluated for this requisition yet.
                  </td>
                </tr>
              ) : (
                candidates.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-4 text-center">
                      <MedalIcon rank={c.rank} />
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-display font-bold text-sm text-[#1F2937]">{c.name}</div>
                      <div className="font-sans text-[11px] text-[#6B7280]">{c.role_applied}</div>
                    </td>
                    <td className="py-4 px-4 font-mono text-xs font-semibold text-[#1F2937]">{c.scores.match_score}%</td>
                    <td className="py-4 px-4 font-mono text-xs font-semibold text-[#1F2937]">{c.scores.interview_score}%</td>
                    <td className="py-4 px-4 font-mono text-xs font-semibold text-[#10B981]">{c.scores.truthfulness_score}%</td>
                    <td className="py-4 px-4">
                      <div className="font-mono text-sm font-extrabold text-[#4361EE]">
                        {c.scores.hiring_confidence_score}%
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link href={`/dashboard/candidates/${c.id}`}>
                        <button className="px-3.5 py-1.5 rounded-lg bg-blue-50 text-[#4361EE] hover:bg-[#4361EE] hover:text-white border border-blue-100 text-xs font-semibold transition-all">
                          Details
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
