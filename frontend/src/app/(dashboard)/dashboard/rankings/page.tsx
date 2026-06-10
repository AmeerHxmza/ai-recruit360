"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { HiringConfidenceScore } from "@/components/features/";
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
    return <Trophy className="w-5 h-5 text-amber-400" />;
  if (rank === 2)
    return <Medal className="w-5 h-5 text-slate-400" />;
  if (rank === 3)
    return <Medal className="w-5 h-5 text-amber-600" />;
  return (
    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
      {rank}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "Verified Match":   return <span className="badge-verified">Verified Match</span>;
    case "Strong Candidate": return <span className="badge-strong">Strong Candidate</span>;
    case "Review Needed":    return <span className="badge-review">Review Needed</span>;
    case "Risk Detected":    return <span className="badge-risk">Risk Detected</span>;
    default:                 return <span className="badge-pending">{status || "Pending"}</span>;
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
        .eq("status", "Active")
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
            name: `${candidate?.first_name || ''} ${candidate?.last_name || ''}`.trim() || 'Unknown',
            role_applied: job?.title || "Unknown Role",
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
    <div className="space-y-6 pb-10 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-primary" />
            Rankings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Candidate leaderboard ranked by Hiring Confidence Score.
          </p>
        </div>
        <div className="w-full sm:w-64">
          {jobsLoading ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a job..." />
              </SelectTrigger>
              <SelectContent>
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
        <div className="surface-card p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <Users className="w-10 h-10 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">No Active Jobs</h2>
          <p className="text-muted-foreground max-w-md">
            Create an active job listing and process candidates to generate rankings.
          </p>
        </div>
      )}

      {/* Top Candidate Hero — only when data exists */}
      {!isLoading && topCandidate && (
        <div className="gradient-border surface-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 shrink-0">
            <Trophy className="w-8 h-8 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-1">
              🏆 Top Candidate — {selectedJob?.title}
            </p>
            <h2 className="text-2xl font-bold text-foreground truncate">{topCandidate.name}</h2>
            <p className="text-sm text-muted-foreground">{topCandidate.role_applied}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-4xl font-black text-foreground tracking-tighter">
              {topCandidate.scores.hiring_confidence_score}
              <span className="text-lg text-muted-foreground font-medium">/100</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Hiring Confidence</p>
          </div>
        </div>
      )}

      {/* Rankings Table */}
      <div className="surface-card overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">
              {selectedJob ? `${selectedJob.title} — ${selectedJob.department}` : "Select a job"}
            </h3>
            {candidates.length > 0 && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                {candidates.length} candidates
              </span>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : candidates.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">
              Insufficient Data for Ranking
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Process candidate applications for this job to generate confidence scores and rankings.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {candidates.map((candidate, idx) => (
              <Link
                key={candidate.id}
                href={`/dashboard/candidates/${candidate.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors group"
              >
                {/* Rank */}
                <div className="w-8 flex items-center justify-center shrink-0">
                  <MedalIcon rank={candidate.rank || idx + 1} />
                </div>

                {/* Avatar + Name */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                    {candidate.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {candidate.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{candidate.role_applied}</p>
                  </div>
                </div>

                {/* Scores */}
                <div className="hidden lg:flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-foreground">{candidate.scores.match_score}%</div>
                    <div className="text-[10px] text-muted-foreground">Match</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-foreground">{candidate.scores.interview_score}%</div>
                    <div className="text-[10px] text-muted-foreground">Interview</div>
                  </div>
                  <div className="text-center">
                    <div className={`font-semibold ${candidate.scores.truthfulness_score >= 70 ? "text-success" : candidate.scores.truthfulness_score >= 50 ? "text-warning" : "text-destructive"}`}>
                      {candidate.scores.truthfulness_score}%
                    </div>
                    <div className="text-[10px] text-muted-foreground">Truthfulness</div>
                  </div>
                </div>

                {/* Confidence Score */}
                <div className="hidden sm:flex items-center gap-3 shrink-0">
                  <HiringConfidenceScore
                    matchScore={candidate.scores.match_score}
                    quizScore={candidate.scores.quiz_score}
                    interviewScore={candidate.scores.interview_score}
                    truthfulnessScore={candidate.scores.truthfulness_score}
                    size="sm"
                    showLabel={false}
                  />
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
