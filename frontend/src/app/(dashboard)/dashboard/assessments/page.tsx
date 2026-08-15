"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
      <div className="flex-1 h-1.5 bg-[#0B1019] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="font-mono text-xs font-medium text-[#F2F5F9] w-8 text-right">{value}%</span>
    </div>
  );
}

function IntegrityIcon({ score }: { score: number }) {
  if (score >= 70)
    return <CheckCircle2 className="w-4 h-4 text-[#22C55E]" strokeWidth={1.75} />;
  if (score >= 40)
    return <AlertTriangle className="w-4 h-4 text-[#EAB308]" strokeWidth={1.75} />;
  return <AlertTriangle className="w-4 h-4 text-[#EF4444]" strokeWidth={1.75} />;
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
      const [jobsRes, appsRes] = await Promise.all([
        supabase.from("jobs").select("id, title").order("created_at", { ascending: false }),
        supabase.from("applications").select(`
          id, status, match_score, hiring_confidence, job_id,
          candidates ( id, first_name, last_name ),
          jobs ( title ),
          interviews ( overall_score, truthfulness_score )
        `),
      ]);

      if (jobsRes.data) setJobs(jobsRes.data);

      if (appsRes.data) {
        const mapped: AssessmentRow[] = appsRes.data.map((app: any) => {
          const candidate = app.candidates;
          const job = app.jobs;
          const interview = Array.isArray(app.interviews) ? app.interviews[0] : app.interviews;
          
          return {
            id: candidate?.id || app.id,
            name: `${candidate?.first_name || ''} ${candidate?.last_name || ''}`.trim() || 'Unknown Candidate',
            role_applied: job?.title || "Engineering Role",
            status: app.status || "Pending",
            job_id: app.job_id,
            match_score: app.match_score || 0,
            quiz_score: 0,
            interview_score: interview?.overall_score || 0,
            truthfulness_score: interview?.truthfulness_score || 0,
            hiring_confidence_score: app.hiring_confidence || 0,
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
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="border-b border-[rgba(148,163,184,0.12)] pb-6">
        <div className="eyebrow flex items-center gap-2 mb-1">
          <ClipboardCheck className="w-3.5 h-3.5 text-[#8AB4F8]" strokeWidth={1.75} />
          <span>Candidate Evaluation Database</span>
        </div>
        <h1 className="font-display text-3xl font-medium text-[#F2F5F9]">
          Assessments
        </h1>
        <p className="font-sans text-xs text-[#9AA6B8] mt-1">
          All candidate evaluation scores across match, interview, and truthfulness metrics.
        </p>
      </div>

      {/* Filters */}
      <div className="card-enterprise p-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#66707F]" strokeWidth={1.75} />
          <input
            placeholder="Search candidate name or position..."
            className="input-enterprise w-full pl-10 h-10 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={selectedJobId} onValueChange={setSelectedJobId}>
          <SelectTrigger className="w-full sm:w-[220px] h-10 bg-[#0B1019] border-[rgba(148,163,184,0.12)] text-[#F2F5F9] font-mono text-xs rounded-[8px]">
            <SelectValue placeholder="All Jobs" />
          </SelectTrigger>
          <SelectContent className="bg-[#0C121D] border-[rgba(148,163,184,0.12)] text-[#F2F5F9] font-sans">
            <SelectItem value="all">All Jobs</SelectItem>
            {jobs.map((j) => (
              <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="card-enterprise p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[rgba(148,163,184,0.12)] bg-[#0A0F18]">
                <th className="text-left px-4 py-3 eyebrow text-[11px]">Candidate</th>
                <th className="text-left px-4 py-3 eyebrow text-[11px]">Job Match</th>
                <th className="text-left px-4 py-3 eyebrow text-[11px]">Interview</th>
                <th className="text-left px-4 py-3 eyebrow text-[11px]">Truthfulness</th>
                <th className="text-left px-4 py-3 eyebrow text-[11px]">Confidence</th>
                <th className="text-left px-4 py-3 eyebrow text-[11px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(148,163,184,0.12)]">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-5 w-full bg-[#0B1019]" />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtered.map((row) => (
                    <tr key={row.id} className="hover:bg-[#121B2B] transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/candidates/${row.id}`}
                          className="font-display font-medium text-sm text-[#F2F5F9] hover:text-[#8AB4F8] transition-colors"
                        >
                          {row.name}
                        </Link>
                        <p className="font-sans text-[11px] text-[#9AA6B8]">{row.role_applied}</p>
                      </td>
                      <td className="px-4 py-3">
                        <ScoreBar value={row.match_score} color="bg-[#8AB4F8]" />
                      </td>
                      <td className="px-4 py-3">
                        <ScoreBar value={row.interview_score} color="bg-[#7DA2F2]" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <IntegrityIcon score={row.truthfulness_score} />
                          <ScoreBar
                            value={row.truthfulness_score}
                            color={
                              row.truthfulness_score >= 70
                                ? "bg-[#22C55E]"
                                : row.truthfulness_score >= 40
                                ? "bg-[#EAB308]"
                                : "bg-[#EF4444]"
                            }
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 font-mono text-sm font-medium text-[#F2F5F9]">
                          <span>{row.hiring_confidence_score}</span>
                          <span className="text-[#66707F] text-xs">/100</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {row.status === "Verified Match" && <span className="badge-success">{row.status}</span>}
                        {row.status === "Strong Candidate" && <span className="chip-enterprise">{row.status}</span>}
                        {row.status === "Review Needed" && <span className="badge-warning">{row.status}</span>}
                        {row.status === "Risk Detected" && <span className="badge-danger">{row.status}</span>}
                        {!["Verified Match","Strong Candidate","Review Needed","Risk Detected"].includes(row.status) && (
                          <span className="badge-warning">{row.status}</span>
                        )}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {!isLoading && filtered.length === 0 && (
          <div className="p-12 text-center">
            <ShieldCheck className="w-10 h-10 text-[#66707F] mx-auto mb-3" strokeWidth={1.75} />
            <h3 className="font-display text-lg font-medium text-[#F2F5F9] mb-1">No assessment data yet</h3>
            <p className="font-sans text-xs text-[#9AA6B8]">
              Process candidate applications to populate assessment scores.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
