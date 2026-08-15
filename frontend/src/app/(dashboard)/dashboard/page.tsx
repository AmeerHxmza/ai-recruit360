import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Briefcase, CalendarCheck, CheckCircle2, ChevronRight, ShieldCheck, Sparkles, Plus, TrendingUp, Cpu, Activity, Award, ArrowRight } from "lucide-react";
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
  const verifiedMatches = candidates.filter((c) => (c.ai_score ?? 0) >= 80).length;

  let totalScore = 0;
  candidates.forEach((c) => {
    totalScore += c.ai_score || 0;
  });
  const avgScore = totalCandidates > 0 ? Math.round(totalScore / totalCandidates) : 0;

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
      return (
        <span className="chip-enterprise">
          Strong Candidate
        </span>
      );
    }
    if (status === "completed" && aiScore < 40) {
      return (
        <span className="badge-danger">
          Risk Detected
        </span>
      );
    }
    if (status === "rejected") {
      return <span className="badge-danger">Rejected</span>;
    }
    return <span className="badge-warning">Interviewing</span>;
  };

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[rgba(148,163,184,0.12)] pb-6">
        <div>
          <div className="eyebrow flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#8AB4F8]" strokeWidth={1.75} />
            <span>Executive Command Center</span>
          </div>
          <h1 className="font-display text-3xl font-medium text-[#F2F5F9]">
            Hiring Intelligence Dashboard
          </h1>
          <p className="font-sans text-xs text-[#9AA6B8] mt-1">
            Real-time candidate evaluation, multi-axis technical scoring, and behavioral audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/jobs">
            <button className="btn-primary text-xs">
              <Plus className="w-4 h-4" strokeWidth={1.75} />
              <span>Create New Job</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 5 Enterprise KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1 */}
        <div className="card-enterprise space-y-3">
          <div className="flex items-center justify-between">
            <span className="eyebrow text-[11px]">Active Jobs</span>
            <div className="w-8 h-8 rounded-[8px] bg-[rgba(138,180,248,0.10)] text-[#8AB4F8] flex items-center justify-center">
              <Briefcase className="w-4 h-4" strokeWidth={1.75} />
            </div>
          </div>
          <div className="font-mono text-3xl font-medium text-[#F2F5F9]">{activeJobsCount || 0}</div>
          <div className="font-mono text-[11px] text-[#22C55E]">Open requisitions</div>
        </div>

        {/* Card 2 */}
        <div className="card-enterprise space-y-3">
          <div className="flex items-center justify-between">
            <span className="eyebrow text-[11px]">Applicants</span>
            <div className="w-8 h-8 rounded-[8px] bg-[rgba(138,180,248,0.10)] text-[#8AB4F8] flex items-center justify-center">
              <Users className="w-4 h-4" strokeWidth={1.75} />
            </div>
          </div>
          <div className="font-mono text-3xl font-medium text-[#F2F5F9]">{totalCandidates}</div>
          <div className="font-mono text-[11px] text-[#66707F]">Total submissions</div>
        </div>

        {/* Card 3 */}
        <div className="card-enterprise space-y-3">
          <div className="flex items-center justify-between">
            <span className="eyebrow text-[11px]">Interviews</span>
            <div className="w-8 h-8 rounded-[8px] bg-[rgba(138,180,248,0.10)] text-[#8AB4F8] flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" strokeWidth={1.75} />
            </div>
          </div>
          <div className="font-mono text-3xl font-medium text-[#F2F5F9]">{completedInterviews}</div>
          <div className="font-mono text-[11px] text-[#66707F]">AI sessions done</div>
        </div>

        {/* Card 4 */}
        <div className="card-enterprise space-y-3">
          <div className="flex items-center justify-between">
            <span className="eyebrow text-[11px]">Verified Match</span>
            <div className="w-8 h-8 rounded-[8px] bg-[rgba(34,197,94,0.12)] text-[#22C55E] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" strokeWidth={1.75} />
            </div>
          </div>
          <div className="font-mono text-3xl font-medium text-[#F2F5F9]">{verifiedMatches}</div>
          <div className="font-mono text-[11px] text-[#22C55E]">Score $\ge$ 80%</div>
        </div>

        {/* Card 5 */}
        <div className="card-enterprise space-y-3">
          <div className="flex items-center justify-between">
            <span className="eyebrow text-[11px]">Quality Index</span>
            <div className="w-8 h-8 rounded-[8px] bg-[rgba(138,180,248,0.10)] text-[#8AB4F8] flex items-center justify-center">
              <Award className="w-4 h-4" strokeWidth={1.75} />
            </div>
          </div>
          <div className="font-mono text-3xl font-medium text-[#8AB4F8]">{avgScore}%</div>
          <div className="font-mono text-[11px] text-[#66707F]">Average overall score</div>
        </div>
      </div>

      {/* Candidate Leaderboard DataTable */}
      <div className="card-enterprise p-0 overflow-hidden">
        <div className="p-6 border-b border-[rgba(148,163,184,0.12)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#8AB4F8] animate-pulse" />
              <h2 className="font-display text-lg font-medium text-[#F2F5F9]">
                Candidate Leaderboard &amp; AI Scores
              </h2>
            </div>
            <p className="font-sans text-xs text-[#9AA6B8]">
              Ranked dynamically by multi-axis technical, communication, and honesty scores.
            </p>
          </div>
          <Link href="/dashboard/candidates">
            <button className="btn-secondary text-xs py-1.5 px-3">
              <span>View All Candidates</span>
              <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[rgba(148,163,184,0.12)] bg-[#0A0F18]">
                <TableHead className="w-16 text-center eyebrow text-[11px]">Rank</TableHead>
                <TableHead className="eyebrow text-[11px]">Candidate Name</TableHead>
                <TableHead className="eyebrow text-[11px]">Requisition</TableHead>
                <TableHead className="eyebrow text-[11px]">Technical</TableHead>
                <TableHead className="eyebrow text-[11px]">Communication</TableHead>
                <TableHead className="eyebrow text-[11px]">Honesty</TableHead>
                <TableHead className="eyebrow text-[11px]">Overall Score</TableHead>
                <TableHead className="eyebrow text-[11px]">Status</TableHead>
                <TableHead className="text-right eyebrow text-[11px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-14 text-[#66707F] text-xs font-mono">
                    No candidates evaluated yet. Candidates will appear here as soon as they complete their interview.
                  </TableCell>
                </TableRow>
              ) : (
                candidates.map((candidate: any, index: number) => {
                  const rank = index + 1;
                  const jobTitle = candidate.jobs?.title || "Engineering Position";
                  const aiScore = candidate.ai_score || 0;

                  return (
                    <TableRow
                      key={candidate.id}
                      className="border-b border-[rgba(148,163,184,0.12)] hover:bg-[#121B2B] transition-colors"
                    >
                      {/* Rank Badge */}
                      <TableCell className="text-center">
                        <span className="font-mono text-xs font-medium text-[#7DA2F2]">
                          #{rank < 10 ? `0${rank}` : rank}
                        </span>
                      </TableCell>

                      {/* Candidate Name */}
                      <TableCell>
                        <div className="flex flex-col">
                          <Link
                            href={`/dashboard/candidates/${candidate.id}`}
                            className="font-display font-medium text-sm text-[#F2F5F9] hover:text-[#8AB4F8] transition-colors"
                          >
                            {candidate.name}
                          </Link>
                          <span className="font-mono text-[11px] text-[#66707F]">{candidate.email}</span>
                        </div>
                      </TableCell>

                      {/* Job Role */}
                      <TableCell>
                        <span className="font-sans text-xs text-[#9AA6B8]">
                          {jobTitle}
                        </span>
                      </TableCell>

                      {/* Technical Score */}
                      <TableCell>
                        <span className="font-mono text-xs font-medium text-[#F2F5F9]">
                          {candidate.technical_score || aiScore || 0}%
                        </span>
                      </TableCell>

                      {/* Communication Score */}
                      <TableCell>
                        <span className="font-mono text-xs font-medium text-[#F2F5F9]">
                          {candidate.communication_score || aiScore || 0}%
                        </span>
                      </TableCell>

                      {/* Honesty Score */}
                      <TableCell>
                        <span className="font-mono text-xs font-medium text-[#F2F5F9]">
                          {candidate.honesty_score || 85}%
                        </span>
                      </TableCell>

                      {/* Overall AI Score Progress Bar */}
                      <TableCell>
                        <div className="flex items-center gap-3 max-w-[140px]">
                          <div className="flex-1 h-1.5 bg-[#0B1019] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                aiScore >= 80
                                  ? "bg-[#22C55E]"
                                  : aiScore >= 60
                                  ? "bg-[#8AB4F8]"
                                  : "bg-[#EF4444]"
                              }`}
                              style={{ width: `${aiScore}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-medium text-[#8AB4F8] min-w-[32px]">
                            {aiScore}%
                          </span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        {getStatusBadge(candidate.status, aiScore)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <Link href={`/dashboard/candidates/${candidate.id}`}>
                          <button className="btn-secondary text-[11px] py-1 px-2.5">
                            <span>XAI Report</span>
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
        </div>
      </div>
    </div>
  );
}
