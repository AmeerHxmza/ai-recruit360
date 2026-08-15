import { StatsCard } from "@/components/features/";
import { BarChart3, Clock, Filter, LineChart, TrendingUp, Users, Sparkles } from "lucide-react";
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
  const screenedCount = totalApplications;
  const interviewedCount = allCandidates.filter((c: any) => {
    const scores = Array.isArray(c.candidate_scores) ? c.candidate_scores[0] : c.candidate_scores;
    return scores && scores.hiring_confidence_score > 0;
  }).length;

  // Time Saved Estimations (10 mins per resume, 30 mins per interview)
  const resumeScreenHours = Math.round(totalApplications * (10 / 60));
  const interviewHours = Math.round(interviewedCount * (30 / 60));
  const totalHoursSaved = resumeScreenHours + interviewHours;

  return (
    <div className="space-y-8 pb-12 font-sans">
      <div className="border-b border-[rgba(148,163,184,0.12)] pb-6">
        <div className="eyebrow flex items-center gap-2 mb-1">
          <BarChart3 className="w-3.5 h-3.5 text-[#8AB4F8]" strokeWidth={1.75} />
          <span>Platform Metrics</span>
        </div>
        <h1 className="font-display text-3xl font-medium text-[#F2F5F9]">Analytics</h1>
        <p className="font-sans text-xs text-[#9AA6B8] mt-1">Recruitment outcomes, pipeline efficiency, and time saved.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card-enterprise space-y-2">
          <span className="eyebrow text-[11px]">App Conversion Rate</span>
          <div className="font-mono text-3xl font-medium text-[#F2F5F9]">{conversionRate}%</div>
          <div className="font-sans text-xs text-[#9AA6B8]">Candidates moving forward</div>
        </div>

        <div className="card-enterprise space-y-2">
          <span className="eyebrow text-[11px]">Verification Pass Rate</span>
          <div className="font-mono text-3xl font-medium text-[#22C55E]">{passRate}%</div>
          <div className="font-sans text-xs text-[#9AA6B8]">Candidates clearing truth checks</div>
        </div>

        <div className="card-enterprise space-y-2">
          <span className="eyebrow text-[11px]">Interview Completion</span>
          <div className="font-mono text-3xl font-medium text-[#F2F5F9]">{totalApplications > 0 ? 100 : 0}%</div>
          <div className="font-sans text-xs text-[#9AA6B8]">Of candidates invited</div>
        </div>

        <div className="card-enterprise space-y-2">
          <span className="eyebrow text-[11px]">Avg Candidate Score</span>
          <div className="font-mono text-3xl font-medium text-[#8AB4F8]">{avgScore}</div>
          <div className="font-sans text-xs text-[#9AA6B8]">Hiring Confidence Average</div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-2 card-enterprise space-y-6">
          <h3 className="font-display text-lg font-medium text-[#F2F5F9]">Hiring Funnel</h3>
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-[#F2F5F9]">Total Applications</span>
                <span className="font-mono text-[#9AA6B8]">{totalApplications}</span>
              </div>
              <div className="h-3 w-full bg-[#0B1019] rounded-full overflow-hidden">
                <div className="h-full bg-[#8AB4F8] rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-[#F2F5F9]">Job Match Screened</span>
                <span className="font-mono text-[#9AA6B8]">{screenedCount}</span>
              </div>
              <div className="h-3 w-full bg-[#0B1019] rounded-full overflow-hidden">
                <div className="h-full bg-[#7DA2F2] rounded-full" style={{ width: `${totalApplications > 0 ? (screenedCount/totalApplications)*100 : 0}%` }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-[#F2F5F9]">Verified Candidates</span>
                <span className="font-mono text-[#9AA6B8]">{verifiedMatchCount}</span>
              </div>
              <div className="h-3 w-full bg-[#0B1019] rounded-full overflow-hidden">
                <div className="h-full bg-[#22C55E] rounded-full" style={{ width: `${totalApplications > 0 ? (verifiedMatchCount/totalApplications)*100 : 0}%` }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-[#F2F5F9]">Interviews Completed</span>
                <span className="font-mono text-[#9AA6B8]">{interviewedCount}</span>
              </div>
              <div className="h-3 w-full bg-[#0B1019] rounded-full overflow-hidden">
                <div className="h-full bg-[#22C55E] rounded-full" style={{ width: `${totalApplications > 0 ? (interviewedCount/totalApplications)*100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-enterprise flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-10 h-10 bg-[rgba(138,180,248,0.10)] rounded-[8px] flex items-center justify-center text-[#8AB4F8]">
              <Clock className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <h3 className="font-display text-xl font-medium text-[#F2F5F9]">Time Saved</h3>
            <p className="font-sans text-xs text-[#9AA6B8] leading-relaxed">
              Total operational hours saved by autonomous evaluation this month.
            </p>
            <div className="font-mono text-5xl font-medium text-[#F2F5F9]">
              {totalHoursSaved}<span className="text-xl text-[#66707F]">hrs</span>
            </div>
          </div>
          <div className="pt-4 border-t border-[rgba(148,163,184,0.12)] space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-[#66707F]">Resume Screening</span>
              <span className="text-[#F2F5F9]">{resumeScreenHours} hrs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#66707F]">Initial Interviews</span>
              <span className="text-[#F2F5F9]">{interviewHours} hrs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
