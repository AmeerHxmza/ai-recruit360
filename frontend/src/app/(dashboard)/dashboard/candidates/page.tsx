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
    if (status === "completed" || aiScore >= 80) {
      return (
        <span className="rounded-full px-3 py-1 text-xs font-medium bg-emerald-50 text-[#10B981] border border-emerald-100 inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          Passed
        </span>
      );
    }
    if (status === "rejected" || aiScore < 40) {
      return (
        <span className="rounded-full px-3 py-1 text-xs font-medium bg-rose-50 text-[#EF4444] border border-rose-100 inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
          Rejected
        </span>
      );
    }
    return (
      <span className="rounded-full px-3 py-1 text-xs font-medium bg-amber-50 text-[#F59E0B] border border-amber-100 inline-flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
        Interviewing
      </span>
    );
  };

  return (
    <div className="space-y-8 pb-12 font-sans">
      {toast ? <FeedbackToast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} /> : null}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="eyebrow flex items-center gap-2 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#4361EE]" strokeWidth={2} />
            <span>Candidate Intelligence Pool</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">Candidates Leaderboard</h1>
          <p className="font-sans text-xs text-[#6B7280] mt-1">
            Real-time candidate evaluation, multi-axis technical scores, and anti-cheat telemetry logs.
          </p>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" strokeWidth={2} />
          <input
            placeholder="Search candidates by name, email, or position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-xs font-sans rounded-lg border border-gray-200 text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4361EE]"
          />
        </div>

        <div className="w-full sm:w-64">
          <Select value={selectedJob} onValueChange={setSelectedJob}>
            <SelectTrigger className="w-full h-10 bg-white border-gray-200 text-[#1F2937] text-xs font-sans rounded-lg focus:ring-2 focus:ring-[#4361EE]">
              <SelectValue placeholder="All Requisitions" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 text-[#1F2937]">
              <SelectItem value="all">All Requisitions</SelectItem>
              {roles.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Candidate Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-gray-50/50">
                <TableHead className="w-16 text-center font-mono text-xs uppercase text-[#6B7280] font-semibold py-3">Rank</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#6B7280] font-semibold py-3">Candidate Name</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#6B7280] font-semibold py-3">Position</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#6B7280] font-semibold py-3">Technical</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#6B7280] font-semibold py-3">Communication</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#6B7280] font-semibold py-3">Honesty</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#6B7280] font-semibold py-3">AI Score</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#6B7280] font-semibold py-3">Status</TableHead>
                <TableHead className="text-right font-mono text-xs uppercase text-[#6B7280] font-semibold py-3">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell colSpan={9} className="py-4">
                      <Skeleton className="h-6 w-full bg-gray-100" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredAndSortedCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-16 text-[#6B7280] text-xs font-mono">
                    No candidate applications match your search query.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedCandidates.map((candidate, index) => {
                  const rank = index + 1;
                  return (
                    <TableRow key={candidate.id} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                      <TableCell className="text-center py-4">
                        <span className="font-mono text-xs font-bold text-[#4361EE]">
                          #{rank < 10 ? `0${rank}` : rank}
                        </span>
                      </TableCell>

                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <Link
                            href={`/dashboard/candidates/${candidate.id}`}
                            className="font-display font-bold text-sm text-[#1F2937] hover:text-[#4361EE] transition-colors"
                          >
                            {candidate.name}
                          </Link>
                          <span className="font-mono text-[11px] text-[#6B7280]">{candidate.email}</span>
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        <span className="font-sans text-xs text-[#1F2937] font-medium">{candidate.role}</span>
                      </TableCell>

                      <TableCell className="py-4 font-mono text-xs font-semibold text-[#1F2937]">
                        {candidate.techScore}%
                      </TableCell>

                      <TableCell className="py-4 font-mono text-xs font-semibold text-[#1F2937]">
                        {candidate.commScore}%
                      </TableCell>

                      <TableCell className="py-4 font-mono text-xs font-semibold text-[#10B981]">
                        {candidate.honestyScore}%
                      </TableCell>

                      <TableCell className="py-4">
                        <div className="flex items-center gap-3 max-w-[130px]">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                candidate.aiScore >= 80
                                  ? "bg-[#10B981]"
                                  : candidate.aiScore >= 60
                                  ? "bg-[#4361EE]"
                                  : "bg-[#EF4444]"
                              }`}
                              style={{ width: `${candidate.aiScore}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-bold text-[#1F2937] w-8 text-right">
                            {candidate.aiScore}%
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        {getStatusBadge(candidate.status, candidate.aiScore)}
                      </TableCell>

                      <TableCell className="text-right py-4">
                        <Link href={`/dashboard/candidates/${candidate.id}`}>
                          <button className="px-3.5 py-1.5 rounded-lg bg-blue-50 text-[#4361EE] hover:bg-[#4361EE] hover:text-white border border-blue-100 text-xs font-semibold transition-all active:scale-95">
                            View Report
                          </button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default function CandidatesPage() {
  return (
    <Suspense fallback={
      <div className="p-12 text-center text-xs font-mono text-[#6B7280]">
        Loading candidate intelligence telemetry...
      </div>
    }>
      <CandidatesPageContent />
    </Suspense>
  );
}
