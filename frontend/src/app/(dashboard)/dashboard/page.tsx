import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Briefcase, CalendarCheck, ChevronRight, Plus, Sparkles, Filter, Search, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch candidate applications from Supabase with joined candidate and job data
  const { data: candidatesData } = await supabase
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
      xai_reasoning,
      created_at,
      jobs (
        id,
        title,
        department
      )
    `)
    .order("ai_score", { ascending: false });

  const candidates = candidatesData || [];

  // Fetch Active Jobs Count
  const { count: activeJobsCount } = await supabase
    .from("jobs")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  const totalCandidates = candidates.length;
  const completedInterviews = candidates.filter((c) => c.status === "completed").length;

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
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="eyebrow flex items-center gap-2 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#4361EE]" strokeWidth={2} />
            <span>Recruiter Intelligence Control Center</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">
            Candidate Pipeline &amp; Evaluations
          </h1>
          <p className="font-sans text-xs text-[#6B7280] mt-1 max-w-2xl">
            Real-time candidate evaluation telemetry, multi-axis technical scoring, and AI proctoring logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/jobs">
            <button className="bg-[#4361EE] hover:bg-[#3A56D4] text-white text-xs font-bold py-2.5 px-5 rounded-lg shadow-sm flex items-center gap-2 transition-all active:scale-95">
              <Plus className="w-4 h-4" strokeWidth={2} />
              <span>Create New Job</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Top KPI Cards (3 Cards Row: Active Jobs, Total Candidates, Interviews Completed) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Active Jobs */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Active Jobs</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#4361EE] flex items-center justify-center">
              <Briefcase className="w-5 h-5" strokeWidth={2} />
            </div>
          </div>
          <div className="font-mono text-4xl font-extrabold text-[#1F2937]">{activeJobsCount || 0}</div>
          <div className="flex items-center gap-1 font-mono text-xs text-[#10B981] font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Open requisitions</span>
          </div>
        </div>

        {/* Card 2: Total Candidates */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Total Candidates</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#4361EE] flex items-center justify-center">
              <Users className="w-5 h-5" strokeWidth={2} />
            </div>
          </div>
          <div className="font-mono text-4xl font-extrabold text-[#1F2937]">{totalCandidates}</div>
          <div className="flex items-center gap-1 font-mono text-xs text-[#10B981] font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Submissions received</span>
          </div>
        </div>

        {/* Card 3: Interviews Completed */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Interviews Completed</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" strokeWidth={2} />
            </div>
          </div>
          <div className="font-mono text-4xl font-extrabold text-[#1F2937]">{completedInterviews}</div>
          <div className="flex items-center gap-1 font-mono text-xs text-[#6B7280] font-medium">
            <span>AI voice &amp; video proctored</span>
          </div>
        </div>
      </div>

      {/* Candidate DataTable Component (Pure white card rounded-xl, spacious py-4 rows, sorted by ai_score desc) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="space-y-1">
            <h2 className="font-display text-lg font-bold text-[#1F2937]">
              Evaluated Candidate Leaderboard
            </h2>
            <p className="font-sans text-xs text-[#6B7280]">
              Candidates sorted by AI score descending with multi-axis technical breakdown.
            </p>
          </div>
          <Link href="/dashboard/candidates">
            <button className="btn-secondary text-xs py-2 px-4 rounded-lg">
              <span>View All Candidates</span>
              <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-gray-50/50">
                <TableHead className="w-16 text-center font-mono text-xs uppercase text-[#6B7280] font-semibold py-3">Rank</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#6B7280] font-semibold py-3">Candidate Name</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#6B7280] font-semibold py-3">Requisition</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#6B7280] font-semibold py-3">Technical</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#6B7280] font-semibold py-3">Communication</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#6B7280] font-semibold py-3">Honesty</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#6B7280] font-semibold py-3">AI Score</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#6B7280] font-semibold py-3">Status</TableHead>
                <TableHead className="text-right font-mono text-xs uppercase text-[#6B7280] font-semibold py-3">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-16 text-[#6B7280] text-xs font-mono">
                    No candidates evaluated yet. Candidates will stream here live as soon as they complete their interview.
                  </TableCell>
                </TableRow>
              ) : (
                candidates.map((candidate: any, index: number) => {
                  const rank = index + 1;
                  const jobTitle = candidate.jobs?.title || "Engineering Requisition";
                  const aiScore = candidate.ai_score || 0;

                  return (
                    <TableRow
                      key={candidate.id}
                      className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors"
                    >
                      {/* Rank Badge */}
                      <TableCell className="text-center py-4">
                        <span className="font-mono text-xs font-bold text-[#4361EE]">
                          #{rank < 10 ? `0${rank}` : rank}
                        </span>
                      </TableCell>

                      {/* Candidate Name */}
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

                      {/* Job Title */}
                      <TableCell className="py-4">
                        <span className="font-sans text-xs text-[#1F2937] font-medium">
                          {jobTitle}
                        </span>
                      </TableCell>

                      {/* Technical Score */}
                      <TableCell className="py-4">
                        <span className="font-mono text-xs font-semibold text-[#1F2937]">
                          {candidate.technical_score || aiScore || 0}%
                        </span>
                      </TableCell>

                      {/* Communication Score */}
                      <TableCell className="py-4">
                        <span className="font-mono text-xs font-semibold text-[#1F2937]">
                          {candidate.communication_score || aiScore || 0}%
                        </span>
                      </TableCell>

                      {/* Honesty Score */}
                      <TableCell className="py-4">
                        <span className="font-mono text-xs font-semibold text-[#10B981]">
                          {candidate.honesty_score || 88}%
                        </span>
                      </TableCell>

                      {/* Overall AI Score */}
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3 max-w-[130px]">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                aiScore >= 80
                                  ? "bg-[#10B981]"
                                  : aiScore >= 60
                                  ? "bg-[#4361EE]"
                                  : "bg-[#EF4444]"
                              }`}
                              style={{ width: `${aiScore}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-bold text-[#1F2937] w-8 text-right">
                            {aiScore}%
                          </span>
                        </div>
                      </TableCell>

                      {/* Status Pill Badge */}
                      <TableCell className="py-4">
                        {getStatusBadge(candidate.status, aiScore)}
                      </TableCell>

                      {/* Action Button */}
                      <TableCell className="text-right py-4">
                        <Link href={`/dashboard/candidates/${candidate.id}`}>
                          <button className="px-3.5 py-1.5 rounded-lg bg-blue-50 text-[#4361EE] hover:bg-[#4361EE] hover:text-white border border-blue-100 text-xs font-semibold transition-all active:scale-95">
                            Details
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
