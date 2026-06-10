import { StatsCard } from "@/components/features/";
import { BarChart3, Clock, Filter, LineChart, TrendingUp, Users } from "lucide-react";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: candidates } = await supabase
    .from('candidates')
    .select(`
      id,
      status,
      candidate_scores (
        hiring_confidence_score,
        truthfulness_score
      )
    `);

  const allCandidates = candidates || [];
  const totalApplications = allCandidates.length;
  
  const verifiedMatchCount = allCandidates.filter(c => c.status === 'Verified Match').length;
  const recommendedCount = allCandidates.filter(c => c.status === 'Verified Match' || c.status === 'Strong Candidate').length;

  let totalConfidence = 0;
  let confidenceCount = 0;
  
  allCandidates.forEach((c: any) => {
    const scores = Array.isArray(c.candidate_scores) ? c.candidate_scores[0] : c.candidate_scores;
    if (scores && typeof scores.hiring_confidence_score === 'number') {
      totalConfidence += scores.hiring_confidence_score;
      confidenceCount++;
    }
  });

  const avgScore = confidenceCount > 0 ? Math.round(totalConfidence / confidenceCount) : 0;
  const passRate = totalApplications > 0 ? Math.round((verifiedMatchCount / totalApplications) * 100) : 0;
  const conversionRate = totalApplications > 0 ? Math.round((recommendedCount / totalApplications) * 100) : 0;

  // Funnel Metrics
  const screenedCount = totalApplications; // Assume all are screened
  const interviewedCount = allCandidates.filter((c: any) => {
    const scores = Array.isArray(c.candidate_scores) ? c.candidate_scores[0] : c.candidate_scores;
    return scores && scores.hiring_confidence_score > 0;
  }).length;

  // Time Saved Estimations (10 mins per resume, 30 mins per interview)
  const resumeScreenHours = Math.round(totalApplications * (10 / 60));
  const interviewHours = Math.round(interviewedCount * (30 / 60));
  const totalHoursSaved = resumeScreenHours + interviewHours;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Recruitment outcomes, pipeline efficiency, and time saved.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="App Conversion Rate"
          value={`${conversionRate}%`}
          description="Candidates moving forward"
          icon={TrendingUp}
        />
        <StatsCard
          title="Verification Pass Rate"
          value={`${passRate}%`}
          description="Candidates clearing truth checks"
          icon={Filter}
        />
        <StatsCard
          title="Interview Completion"
          value={`${totalApplications > 0 ? 100 : 0}%`}
          description="Of candidates invited"
          icon={Users}
        />
        <StatsCard
          title="Avg Candidate Score"
          value={avgScore.toString()}
          description="Hiring Confidence Average"
          icon={LineChart}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-2 border border-border rounded-xl bg-card p-6 shadow-sm flex flex-col min-h-[300px]">
          <h3 className="text-lg font-semibold tracking-tight mb-6 text-foreground">Hiring Funnel</h3>
          <div className="flex-1 flex flex-col justify-center space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Total Applications</span>
                <span className="text-muted-foreground">{totalApplications}</span>
              </div>
              <div className="h-4 w-full bg-muted rounded-sm overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '100%' }}></div>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Job Match Screened</span>
                <span className="text-muted-foreground">{screenedCount}</span>
              </div>
              <div className="h-4 w-[100%] bg-muted rounded-sm overflow-hidden mx-auto">
                <div className="h-full bg-primary" style={{ width: `${totalApplications > 0 ? (screenedCount/totalApplications)*100 : 0}%` }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Verified Candidates (Quiz & Truth)</span>
                <span className="text-muted-foreground">{verifiedMatchCount}</span>
              </div>
              <div className="h-4 w-[100%] bg-muted rounded-sm overflow-hidden mx-auto">
                <div className="h-full bg-primary" style={{ width: `${totalApplications > 0 ? (verifiedMatchCount/totalApplications)*100 : 0}%` }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Interviews Completed</span>
                <span className="text-muted-foreground">{interviewedCount}</span>
              </div>
              <div className="h-4 w-[100%] bg-muted rounded-sm overflow-hidden mx-auto">
                <div className="h-full bg-success" style={{ width: `${totalApplications > 0 ? (interviewedCount/totalApplications)*100 : 0}%` }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-success">Recommended to Recruiter</span>
                <span className="text-muted-foreground">{recommendedCount}</span>
              </div>
              <div className="h-4 w-[100%] bg-muted rounded-sm overflow-hidden mx-auto">
                <div className="h-full bg-success" style={{ width: `${totalApplications > 0 ? (recommendedCount/totalApplications)*100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-border rounded-xl bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">Time Saved</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Total operational hours saved by autonomous evaluation this month.
            </p>
            <div className="text-5xl font-black text-foreground tracking-tighter mb-2">
              {totalHoursSaved}<span className="text-2xl text-muted-foreground font-semibold">hrs</span>
            </div>
          </div>
          <div className="pt-4 border-t border-border mt-auto">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Resume Screening</span>
              <span className="font-medium">{resumeScreenHours} hrs</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Initial Phone Screens</span>
              <span className="font-medium">{interviewHours} hrs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
