"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ClipboardCheck, Search, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

type Job = { id: string; title: string };
type AssessmentRow = {
  id: string;
  name: string;
  role_applied: string;
  status: string;
  match_score: number;
  quiz_score: number;
  interview_score: number;
  truthfulness_score: number;
  hiring_confidence_score: number;
};

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="score-bar flex-1">
        <div
          className={`score-bar-fill ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-foreground w-8 text-right">{value}%</span>
    </div>
  );
}

function IntegrityIcon({ score }: { score: number }) {
  if (score >= 70)
    return <CheckCircle2 className="w-4 h-4 text-success" />;
  if (score >= 40)
    return <AlertTriangle className="w-4 h-4 text-warning" />;
  return <AlertTriangle className="w-4 h-4 text-destructive" />;
}

export default function AssessmentsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("all");
  const [rows, setRows] = useState<AssessmentRow[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const [jobsRes, candidatesRes] = await Promise.all([
        supabase.from("jobs").select("id, title").order("created_at", { ascending: false }),
        supabase.from("candidates").select(`
          id, name, role_applied, status, job_id,
          candidate_scores (
            match_score, quiz_score, interview_score,
            truthfulness_score, hiring_confidence_score
          )
        `),
      ]);

      if (jobsRes.data) setJobs(jobsRes.data);

      if (candidatesRes.data) {
        const mapped: AssessmentRow[] = candidatesRes.data.map((c: any) => {
          const s = Array.isArray(c.candidate_scores)
            ? c.candidate_scores[0]
            : c.candidate_scores || {};
          return {
            id: c.id,
            name: c.name || "Unknown",
            role_applied: c.role_applied || "—",
            status: c.status || "Pending",
            job_id: c.job_id,
            match_score: s.match_score || 0,
            quiz_score: s.quiz_score || 0,
            interview_score: s.interview_score || 0,
            truthfulness_score: s.truthfulness_score || 0,
            hiring_confidence_score: s.hiring_confidence_score || 0,
          };
        });
        setRows(mapped);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return (rows as any[])
      .filter((r) => selectedJobId === "all" || r.job_id === selectedJobId)
      .filter((r) =>
        `${r.name} ${r.role_applied}`.toLowerCase().includes(search.toLowerCase().trim())
      )
      .sort((a, b) => b.hiring_confidence_score - a.hiring_confidence_score);
  }, [rows, selectedJobId, search]);

  return (
    <div className="space-y-6 pb-10 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ClipboardCheck className="w-7 h-7 text-primary" />
          Assessments
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          All candidate evaluation scores across match, quiz, interview, and truthfulness.
        </p>
      </div>

      {/* Filters */}
      <div className="surface-card flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={selectedJobId} onValueChange={setSelectedJobId}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="All Jobs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jobs</SelectItem>
            {jobs.map((j) => (
              <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Candidate</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Job Match</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Interview</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Truthfulness</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Confidence</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-5 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtered.map((row) => (
                    <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/candidates/${row.id}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors"
                        >
                          {row.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{row.role_applied}</p>
                      </td>
                      <td className="px-4 py-3">
                        <ScoreBar value={row.match_score} color="bg-primary" />
                      </td>
                      <td className="px-4 py-3">
                        <ScoreBar value={row.interview_score} color="bg-blue-500" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <IntegrityIcon score={row.truthfulness_score} />
                          <ScoreBar
                            value={row.truthfulness_score}
                            color={
                              row.truthfulness_score >= 70
                                ? "bg-success"
                                : row.truthfulness_score >= 40
                                ? "bg-warning"
                                : "bg-destructive"
                            }
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-black text-foreground">
                            {row.hiring_confidence_score}
                          </div>
                          <span className="text-muted-foreground text-xs">/100</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {row.status === "Verified Match" && <span className="badge-verified">{row.status}</span>}
                        {row.status === "Strong Candidate" && <span className="badge-strong">{row.status}</span>}
                        {row.status === "Review Needed" && <span className="badge-review">{row.status}</span>}
                        {row.status === "Risk Detected" && <span className="badge-risk">{row.status}</span>}
                        {!["Verified Match","Strong Candidate","Review Needed","Risk Detected"].includes(row.status) && (
                          <span className="badge-pending">{row.status}</span>
                        )}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {!isLoading && filtered.length === 0 && (
          <div className="p-12 text-center">
            <ShieldCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">No assessment data yet</h3>
            <p className="text-sm text-muted-foreground">
              Process candidate applications to populate assessment scores.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
