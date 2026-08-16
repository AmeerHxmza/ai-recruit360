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
      ai_score,
      technical_score,
      communication_score,
      honesty_score
    `);

  const allCandidates = candidates || [];
  const totalApplications = allCandidates.length;
  
  const verifiedMatchCount = allCandidates.filter(c => c.status === 'completed' || (c.ai_score || 0) >= 80).length;
  const recommendedCount = allCandidates.filter(c => (c.ai_score || 0) >= 60).length;

  let totalConfidence = 0;
  let confidenceCount = 0;
  
  allCandidates.forEach((c: any) => {
    if (typeof c.ai_score === 'number' && c.ai_score > 0) {
      totalConfidence += c.ai_score;
      confidenceCount++;
    }
  });

  const avgScore = confidenceCount > 0 ? Math.round(totalConfidence / confidenceCount) : 0;
  const passRate = totalApplications > 0 ? Math.round((verifiedMatchCount / totalApplications) * 100) : 0;
  const conversionRate = totalApplications > 0 ? Math.round((recommendedCount / totalApplications) * 100) : 0;

  // Funnel Metrics
  const screenedCount = totalApplications;
  const interviewedCount = allCandidates.filter((c: any) => c.status === 'completed' || c.ai_score > 0).length;

  // Time Saved Estimations (10 mins per resume, 30 mins per interview)
  const resumeScreenHours = Math.round(totalApplications * (10 / 60));
  const interviewHours = Math.round(interviewedCount * (30 / 60));
  const totalHoursSaved = resumeScreenHours + interviewHours;

  return (
    <div className="space-y-8 pb-12 font-sans">
      <div className="border-b border-gray-200 pb-6">
        <div className="eyebrow flex items-center gap-2 mb-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-[#4361EE]" strokeWidth={2} />
          <span>Platform Metrics</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">Analytics &amp; Pipeline Performance</h1>
        <p className="font-sans text-xs text-[#6B7280] mt-1">Recruitment outcomes, pipeline efficiency, and automated recruiter time saved.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-2">
          <span className="font-mono text-xs uppercase font-semibold text-[#6B7280]">App Conversion Rate</span>
          <div className="font-mono text-3xl font-extrabold text-[#1F2937]">{conversionRate}%</div>
          <div className="font-sans text-xs text-[#6B7280]">Candidates moving forward</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-2">
          <span className="font-mono text-xs uppercase font-semibold text-[#6B7280]">Verification Pass Rate</span>
          <div className="font-mono text-3xl font-extrabold text-[#10B981]">{passRate}%</div>
          <div className="font-sans text-xs text-[#6B7280]">Candidates clearing truth checks</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-2">
          <span className="font-mono text-xs uppercase font-semibold text-[#6B7280]">Interview Completion</span>
          <div className="font-mono text-3xl font-extrabold text-[#1F2937]">{totalApplications > 0 ? 100 : 0}%</div>
          <div className="font-sans text-xs text-[#6B7280]">Of candidates invited</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-2">
          <span className="font-mono text-xs uppercase font-semibold text-[#6B7280]">Avg Candidate Score</span>
          <div className="font-mono text-3xl font-extrabold text-[#4361EE]">{avgScore}%</div>
          <div className="font-sans text-xs text-[#6B7280]">Hiring Confidence Average</div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h3 className="font-display text-lg font-bold text-[#1F2937]">Hiring Funnel</h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-[#1F2937] font-medium">Total Applications Received</span>
                <span className="font-mono text-[#6B7280] font-bold">{totalApplications}</span>
              </div>
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#4361EE] rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-[#1F2937] font-medium">Job Match Screened</span>
                <span className="font-mono text-[#6B7280] font-bold">{screenedCount}</span>
              </div>
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: `${totalApplications > 0 ? (screenedCount/totalApplications)*100 : 0}%` }}></div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-[#1F2937] font-medium">Verified Matches Passed</span>
                <span className="font-mono text-[#6B7280] font-bold">{verifiedMatchCount}</span>
              </div>
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${totalApplications > 0 ? (verifiedMatchCount/totalApplications)*100 : 0}%` }}></div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-[#1F2937] font-medium">Interviews Completed</span>
                <span className="font-mono text-[#6B7280] font-bold">{interviewedCount}</span>
              </div>
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${totalApplications > 0 ? (interviewedCount/totalApplications)*100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#4361EE]">
              <Clock className="w-5 h-5" strokeWidth={2} />
            </div>
            <h3 className="font-display text-lg font-bold text-[#1F2937]">Recruiter Time Saved</h3>
            <p className="font-sans text-xs text-[#6B7280] leading-relaxed">
              Estimated manual screening &amp; interview time saved by automated PyMuPDF parsing and AI voice sessions.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
            <div className="font-mono text-3xl font-extrabold text-[#4361EE]">{totalHoursSaved} Hours</div>
            <div className="font-sans text-[11px] text-[#6B7280]">Saved this evaluation period</div>
          </div>
        </div>
      </div>
    </div>
  );
}
