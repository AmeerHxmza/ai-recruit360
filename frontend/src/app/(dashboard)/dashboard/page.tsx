import { StatsCard } from "@/components/features/stats-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HiringConfidenceScore } from "@/components/features/hiring-confidence-score";
import { Users, Briefcase, CalendarCheck, CheckCircle2, ChevronRight, Download, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await createClient();
  // Fetch live applications from Supabase with joined candidate and job data
  const { data: applicationsData, error } = await supabase
    .from('applications')
    .select(`
      id,
      status,
      match_score,
      hiring_confidence,
      candidates (
        id,
        first_name,
        last_name
      ),
      jobs (
        id,
        title
      ),
      interviews (
        id,
        overall_score,
        truthfulness_score
      )
    `)
    .order('hiring_confidence', { ascending: false });

  const applications = applicationsData || [];

  // 1. Fetch Active Jobs Count
  const { count: activeJobsCount } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const candidatesCount = applications.length;
  // Let's treat 'offered' or 'interviewed' with high score as verified/strong for stats
  const verifiedCount = applications.filter(a => a.status === 'offered' || (a.status === 'interviewed' && (a.hiring_confidence ?? 0) > 85)).length;
  
  // Compute average confidence
  let totalConfidence = 0;
  let confidenceCount = 0;
  applications.forEach((a: any) => {
    if (typeof a.hiring_confidence === 'number') {
      totalConfidence += a.hiring_confidence;
      confidenceCount++;
    }
  });
  const avgConfidence = confidenceCount > 0 ? Math.round(totalConfidence / confidenceCount) : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "offered":
        return (
          <span className="badge-verified">
            Offered
          </span>
        );
      case "interviewed":
        return (
          <span className="badge-strong">
            Interviewed
          </span>
        );
      case "screening":
        return (
          <span className="badge-review">
            Screening
          </span>
        );
      case "rejected":
        return (
          <span className="badge-risk">
            Rejected
          </span>
        );
      default:
        return (
          <span className="badge-pending">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor candidate evaluation and verification outcomes.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <StatsCard
          title="Active Jobs"
          value={(activeJobsCount || 0).toString()}
          description="Open requisitions"
          icon={Briefcase}
        />
        <StatsCard
          title="Candidates Evaluated"
          value={candidatesCount.toString()}
          description="Total pipeline processed"
          icon={Users}
        />
        <StatsCard
          title="Interviews Completed"
          value={confidenceCount.toString()}
          description="Conducted automatically"
          icon={CalendarCheck}
        />
        <StatsCard
          title="Verified Candidates"
          value={verifiedCount.toString()}
          description="Passed truth verification"
          icon={CheckCircle2}
        />
        <StatsCard
          title="Avg Hiring Confidence"
          value={`${avgConfidence}%`}
          description="Overall candidate quality"
          icon={ShieldCheck}
        />
      </div>

      {/* Candidates Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border bg-muted/20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div
              className="w-1 h-6 rounded-full bg-primary"
            />
            <h2 className="text-base font-semibold tracking-tight">Top Ranked Candidates</h2>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground text-xs" asChild>
            <Link href="/dashboard/rankings" className="flex items-center gap-1">
              View All Rankings <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20 hover:bg-muted/20">
                <TableHead className="w-[250px] text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Candidate</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Job Match</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Interview</TableHead>
                <TableHead className="w-[180px] text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Hiring Confidence</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Rank</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app: any, index: number) => {
                const candidate = app.candidates;
                const job = app.jobs;
                const interview = Array.isArray(app.interviews) ? app.interviews[0] : app.interviews || {};

                const rank = index + 1;
                const isTopRank = rank <= 3;
                const fullName = `${candidate?.first_name || ''} ${candidate?.last_name || ''}`.trim() || 'Unknown';

                return (
                  <TableRow key={app.id} className="hover:bg-muted/20 transition-colors duration-150">
                    <TableCell>
                      <div className="flex flex-col">
                        <Link
                          href={`/dashboard/candidates/${candidate?.id}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors duration-150"
                        >
                          {fullName}
                        </Link>
                        <span className="text-xs text-muted-foreground mt-0.5">
                          {job?.title || 'Unknown Role'} • {candidate?.id?.split('-')[0]}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-foreground">{app.match_score || 0}%</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-muted-foreground">{interview?.overall_score || 0}%</div>
                    </TableCell>
                    <TableCell>
                      <HiringConfidenceScore 
                        matchScore={app.match_score || 0} 
                        quizScore={0}
                        interviewScore={interview?.overall_score || 0}
                        truthfulnessScore={interview?.truthfulness_score || 0} 
                        size="sm" 
                        showLabel={false} 
                      />
                    </TableCell>
                    <TableCell>
                      <div
                        className={
                          isTopRank
                            ? "inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold text-white bg-primary shadow-sm"
                            : "inline-flex items-center justify-center w-7 h-7 rounded-lg bg-muted text-muted-foreground text-xs font-bold"
                        }
                      >
                        #{rank}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(app.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" asChild>
                        <Link href={`/dashboard/candidates/${candidate?.id}`}>
                          <ChevronRight className="w-4 h-4" />
                          <span className="sr-only">View Details</span>
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
