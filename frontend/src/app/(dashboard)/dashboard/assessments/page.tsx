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
import { ClipboardCheck, Search, ShieldCheck, AlertTriangle, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
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
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="font-mono text-xs font-bold text-[#1F2937] w-8 text-right">{value}%</span>
    </div>
  );
}

function IntegrityIcon({ score }: { score: number }) {
  if (score >= 70)
    return <CheckCircle2 className="w-4 h-4 text-[#10B981]" strokeWidth={2} />;
  if (score >= 40)
    return <AlertTriangle className="w-4 h-4 text-amber-500" strokeWidth={2} />;
  return <AlertTriangle className="w-4 h-4 text-red-500" strokeWidth={2} />;
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
          candidates ( id, first_name, last_name, name ),
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
            name: candidate?.name || `${candidate?.first_name || ''} ${candidate?.last_name || ''}`.trim() || 'Unknown Candidate',
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
      <div className="border-b border-gray-200 pb-6">
        <div className="eyebrow flex items-center gap-2 mb-1.5">
          <ClipboardCheck className="w-3.5 h-3.5 text-[#4361EE]" strokeWidth={2} />
          <span>Candidate Evaluation Database</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">
          Assessments &amp; Evaluation Rubrics
        </h1>
        <p className="font-sans text-xs text-[#6B7280] mt-1">
          All candidate evaluation scores across match, interview, and truthfulness metrics.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" strokeWidth={2} />
          <input
            placeholder="Search candidate name or position..."
            className="w-full h-10 pl-10 pr-4 text-xs font-sans rounded-lg border border-gray-200 text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4361EE]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={selectedJobId} onValueChange={setSelectedJobId}>
          <SelectTrigger className="w-full sm:w-[220px] h-10 bg-white border-gray-200 text-[#1F2937] text-xs font-sans rounded-lg focus:ring-2 focus:ring-[#4361EE]">
            <SelectValue placeholder="All Jobs" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200 text-[#1F2937]">
            <SelectItem value="all">All Jobs</SelectItem>
            {jobs.map((j) => (
              <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="font-mono text-xs uppercase text-[#6B7280] font-semibold py-3 px-4">Candidate</th>
                <th className="font-mono text-xs uppercase text-[#6B7280] font-semibold py-3 px-4">Position</th>
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
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-[#6B7280] text-xs font-mono">
                    No candidate assessment records found.
                  </td>
                </tr>
              ) : (
                filtered.map((r: any) => (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-4 font-display font-bold text-[#1F2937]">{r.name}</td>
                    <td className="py-4 px-4 font-sans text-xs text-[#6B7280]">{r.role_applied}</td>
                    <td className="py-4 px-4">
                      <ScoreBar value={r.match_score} color="bg-[#4361EE]" />
                    </td>
                    <td className="py-4 px-4">
                      <ScoreBar value={r.interview_score} color="bg-[#4361EE]" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <IntegrityIcon score={r.truthfulness_score} />
                        <span className="font-bold text-[#1F2937]">{r.truthfulness_score}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-mono text-xs font-bold text-[#4361EE]">
                        {r.hiring_confidence_score}%
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link href={`/dashboard/candidates/${r.id}`}>
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
