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
import { Medal, Trophy, TrendingUp, Users, ShieldCheck } from "lucide-react";
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
    return <Trophy className="w-5 h-5 text-[#EAB308]" strokeWidth={1.75} />;
  if (rank === 2)
    return <Medal className="w-5 h-5 text-[#9AA6B8]" strokeWidth={1.75} />;
  if (rank === 3)
    return <Medal className="w-5 h-5 text-[#7DA2F2]" strokeWidth={1.75} />;
  return (
    <span className="font-mono text-xs font-medium text-[#66707F]">
      #{rank < 10 ? `0${rank}` : rank}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "Verified Match":   return <span className="badge-success">Verified Match</span>;
    case "Strong Candidate": return <span className="chip-enterprise">Strong Candidate</span>;
    case "Review Needed":    return <span className="badge-warning">Review Needed</span>;
    case "Risk Detected":    return <span className="badge-danger">Risk Detected</span>;
    default:                 return <span className="badge-warning">{status || "Pending"}</span>;
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
          candidates ( id, first_name, last_name ),
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
            name: `${candidate?.first_name || ''} ${candidate?.last_name || ''}`.trim() || 'Unknown Candidate',
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[rgba(148,163,184,0.12)] pb-6">
        <div>
          <div className="eyebrow flex items-center gap-2 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#8AB4F8]" strokeWidth={1.75} />
            <span>Leaderboard Analytics</span>
          </div>
          <h1 className="font-display text-3xl font-medium text-[#F2F5F9]">
            Rankings
          </h1>
          <p className="font-sans text-xs text-[#9AA6B8] mt-1">
            Candidate leaderboard ranked by Hiring Confidence Score.
          </p>
        </div>
        <div className="w-full sm:w-64">
          {jobsLoading ? (
            <Skeleton className="h-10 w-full bg-[#0C121D]" />
          ) : (
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger className="w-full h-10 bg-[#0B1019] border-[rgba(148,163,184,0.12)] text-[#F2F5F9] font-mono text-xs rounded-[8px]">
                <SelectValue placeholder="Select a job..." />
              </SelectTrigger>
              <SelectContent className="bg-[#0C121D] border-[rgba(148,163,184,0.12)] text-[#F2F5F9] font-sans">
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* No Jobs State */}
      {!jobsLoading && jobs.length === 0 && (
        <div className="card-enterprise p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <Users className="w-10 h-10 text-[#66707F] mb-4" strokeWidth={1.75} />
          <h2 className="font-display text-xl font-medium text-[#F2F5F9] mb-2">No Active Jobs</h2>
          <p className="font-sans text-xs text-[#9AA6B8] max-w-md">
            Create an active job listing and process candidates to generate rankings.
          </p>
        </div>
      )}

      {/* Top Candidate Hero */}
      {!isLoading && topCandidate && (
        <div className="card-enterprise p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[rgba(234,179,8,0.12)] border border-[rgba(234,179,8,0.25)] shrink-0">
            <Trophy className="w-7 h-7 text-[#EAB308]" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="eyebrow text-[#EAB308] block mb-1">
              🏆 Top Candidate — {selectedJob?.title}
            </span>
            <h2 className="font-display text-2xl font-medium text-[#F2F5F9] truncate">{topCandidate.name}</h2>
            <p className="font-sans text-xs text-[#9AA6B8]">{topCandidate.role_applied}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="font-mono text-3xl font-medium text-[#F2F5F9]">
              {topCandidate.scores.hiring_confidence_score}
              <span className="text-xs text-[#66707F]">/100</span>
            </div>
            <p className="font-mono text-[11px] text-[#66707F] mt-1">Hiring Confidence</p>
          </div>
        </div>
      )}

      {/* Rankings Table */}
      <div className="card-enterprise p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-[rgba(148,163,184,0.12)] bg-[#0A0F18] flex items-center justify-between">
          <h3 className="font-display text-sm font-medium text-[#F2F5F9]">
            {selectedJob ? `${selectedJob.title} — ${selectedJob.department}` : "Select a job"}
          </h3>
          {candidates.length > 0 && (
            <span className="chip-enterprise">
              {candidates.length} candidates
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full bg-[#0B1019] rounded-[8px]" />
            ))}
          </div>
        ) : candidates.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldCheck className="w-10 h-10 text-[#66707F] mx-auto mb-3" strokeWidth={1.75} />
            <h3 className="font-display text-lg font-medium text-[#F2F5F9] mb-1">
              Insufficient Data for Ranking
            </h3>
            <p className="font-sans text-xs text-[#9AA6B8] max-w-md mx-auto">
              Process candidate applications for this job to generate confidence scores and rankings.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[rgba(148,163,184,0.12)]">
            {candidates.map((candidate, idx) => (
              <Link
                key={candidate.id}
                href={`/dashboard/candidates/${candidate.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-[#121B2B] transition-colors group"
              >
                {/* Rank */}
                <div className="w-8 flex items-center justify-center shrink-0 font-mono text-xs">
                  <MedalIcon rank={candidate.rank || idx + 1} />
                </div>

                {/* Avatar + Name */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[rgba(138,180,248,0.10)] text-[#8AB4F8] font-mono text-xs font-medium flex items-center justify-center shrink-0">
                    {candidate.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-medium text-sm text-[#F2F5F9] truncate group-hover:text-[#8AB4F8] transition-colors">
                      {candidate.name}
                    </p>
                    <p className="font-sans text-xs text-[#9AA6B8] truncate">{candidate.role_applied}</p>
                  </div>
                </div>

                {/* Scores */}
                <div className="hidden lg:flex items-center gap-6 font-mono text-xs">
                  <div className="text-center">
                    <div className="font-medium text-[#F2F5F9]">{candidate.scores.match_score}%</div>
                    <div className="text-[10px] text-[#66707F]">Match</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-[#F2F5F9]">{candidate.scores.interview_score}%</div>
                    <div className="text-[10px] text-[#66707F]">Interview</div>
                  </div>
                  <div className="text-center">
                    <div className={`font-medium ${candidate.scores.truthfulness_score >= 70 ? "text-[#22C55E]" : candidate.scores.truthfulness_score >= 50 ? "text-[#EAB308]" : "text-[#EF4444]"}`}>
                      {candidate.scores.truthfulness_score}%
                    </div>
                    <div className="text-[10px] text-[#66707F]">Truthfulness</div>
                  </div>
                </div>

                {/* Status */}
                <div className="shrink-0">
                  <StatusBadge status={candidate.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
