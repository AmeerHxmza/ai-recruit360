"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { FeedbackToast } from "@/components/ui/feedback-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ChevronRight,
  Sparkles,
  Plus
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
const supabase = createClient();

type Candidate = {
  id: string;
  name: string;
  email: string;
  role: string;
  jobId: string;
  status: string;
  aiScore: number;
  techScore: number;
  commScore: number;
  honestyScore: number;
  applied: string;
};

function CandidatesPageContent() {
  const searchParams = useSearchParams();
  const jobParam = searchParams.get("job");

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>(jobParam || "all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" | "info" } | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const { data } = await supabase
        .from("candidates")
        .select(`
          id,
          name,
          email,
          status,
          ai_score,
          technical_score,
          communication_score,
          honesty_score,
          created_at,
          job_id,
          jobs (
            id,
            title
          )
        `)
        .order("ai_score", { ascending: false });

      if (data) {
        const mapped: Candidate[] = data.map((c: any) => {
          const job = c.jobs || {};
          return {
            id: c.id,
            name: c.name || "Unknown Candidate",
            email: c.email || "",
            role: job.title || "Engineering Position",
            jobId: c.job_id || "",
            status: c.status || "interviewing",
            aiScore: c.ai_score || 0,
            techScore: c.technical_score || c.ai_score || 0,
            commScore: c.communication_score || c.ai_score || 0,
            honestyScore: c.honesty_score || 85,
            applied: new Date(c.created_at || Date.now()).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
          };
        });

        setCandidates(mapped);
        const uniqueRoles = Array.from(new Set(mapped.map((c) => c.role)));
        setRoles(uniqueRoles);
      }
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const filteredAndSortedCandidates = useMemo(
    () =>
      candidates
        .filter((c) => (selectedJob === "all" ? true : c.jobId === selectedJob || c.role === selectedJob))
        .filter((c) => `${c.name} ${c.role} ${c.email}`.toLowerCase().includes(search.toLowerCase().trim()))
        .sort((a, b) => b.aiScore - a.aiScore),
    [search, selectedJob, candidates]
  );

  const getStatusBadge = (status: string, aiScore: number) => {
    if (status === "completed" && aiScore >= 80) {
      return (
        <span className="badge-success">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
          Verified Match
        </span>
      );
    }
    if (status === "completed" && aiScore >= 60) {
      return <span className="chip-enterprise">Strong Candidate</span>;
    }
    if (status === "completed" && aiScore < 40) {
      return <span className="badge-danger">Risk Detected</span>;
    }
    if (status === "rejected") {
      return <span className="badge-danger">Rejected</span>;
    }
    return <span className="badge-warning">Interviewing</span>;
  };

  return (
    <div className="space-y-8 pb-12 font-sans">
      {toast ? <FeedbackToast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} /> : null}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(148,163,184,0.12)] pb-6">
        <div>
          <div className="eyebrow flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#8AB4F8]" strokeWidth={1.75} />
            <span>Candidate Evaluation Database</span>
          </div>
          <h1 className="font-display text-3xl font-medium text-[#F2F5F9]">Candidates</h1>
          <p className="font-sans text-xs text-[#9AA6B8] mt-1">
            View evaluated applicant profiles, multi-axis technical scores, and XAI evidence reports.
          </p>
        </div>

        <Link href="/dashboard/jobs">
          <button className="btn-primary text-xs">
            <Plus className="w-4 h-4" strokeWidth={1.75} />
            <span>Post New Requisition</span>
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div className="card-enterprise p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#66707F]" strokeWidth={1.75} />
          <input
            type="search"
            placeholder="Search candidate name, email, or position..."
            className="input-enterprise w-full pl-10 h-10 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={selectedJob} onValueChange={(val) => setSelectedJob(val)}>
          <SelectTrigger className="w-full sm:w-[220px] h-10 bg-[#0B1019] border-[rgba(148,163,184,0.12)] text-[#F2F5F9] font-mono text-xs rounded-[8px]">
            <SelectValue placeholder="Filter by Job Role" />
          </SelectTrigger>
          <SelectContent className="bg-[#0C121D] border-[rgba(148,163,184,0.12)] text-[#F2F5F9] font-sans">
            <SelectItem value="all">All Open Positions</SelectItem>
            {roles.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Candidates DataTable */}
      <div className="card-enterprise p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-12 w-full bg-[#0B1019] rounded-[8px]" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[rgba(148,163,184,0.12)] bg-[#0A0F18]">
                <TableHead className="w-16 text-center eyebrow text-[11px]">Rank</TableHead>
                <TableHead className="eyebrow text-[11px]">Candidate</TableHead>
                <TableHead className="eyebrow text-[11px]">Position</TableHead>
                <TableHead className="eyebrow text-[11px]">Technical</TableHead>
                <TableHead className="eyebrow text-[11px]">Honesty</TableHead>
                <TableHead className="eyebrow text-[11px]">Overall Score</TableHead>
                <TableHead className="eyebrow text-[11px]">Applied Date</TableHead>
                <TableHead className="eyebrow text-[11px]">Status</TableHead>
                <TableHead className="text-right eyebrow text-[11px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-14 text-[#66707F] text-xs font-mono">
                    No candidates match the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedCandidates.map((c, idx) => {
                  const rank = idx + 1;
                  return (
                    <TableRow key={c.id} className="border-b border-[rgba(148,163,184,0.12)] hover:bg-[#121B2B] transition-colors">
                      <TableCell className="text-center font-mono text-xs font-medium text-[#7DA2F2]">
                        #{rank < 10 ? `0${rank}` : rank}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <Link href={`/dashboard/candidates/${c.id}`} className="font-display font-medium text-sm text-[#F2F5F9] hover:text-[#8AB4F8] transition-colors">
                            {c.name}
                          </Link>
                          <span className="font-mono text-[11px] text-[#66707F]">{c.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-sans text-xs text-[#9AA6B8]">{c.role}</TableCell>
                      <TableCell className="font-mono text-xs font-medium text-[#F2F5F9]">{c.techScore}%</TableCell>
                      <TableCell className="font-mono text-xs font-medium text-[#F2F5F9]">{c.honestyScore}%</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3 max-w-[140px]">
                          <div className="flex-1 h-1.5 bg-[#0B1019] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                c.aiScore >= 80 ? "bg-[#22C55E]" : c.aiScore >= 60 ? "bg-[#8AB4F8]" : "bg-[#EF4444]"
                              }`}
                              style={{ width: `${c.aiScore}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-medium text-[#8AB4F8]">{c.aiScore}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-[#66707F]">{c.applied}</TableCell>
                      <TableCell>{getStatusBadge(c.status, c.aiScore)}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/candidates/${c.id}`}>
                          <button className="btn-secondary text-[11px] py-1 px-2.5">
                            <span>Deep Dive</span>
                            <ChevronRight className="w-3 h-3" strokeWidth={1.75} />
                          </button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

export default function CandidatesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-8">
          <Skeleton className="h-10 w-full bg-[#0C121D]" />
          <Skeleton className="h-64 w-full bg-[#0C121D]" />
        </div>
      }
    >
      <CandidatesPageContent />
    </Suspense>
  );
}
