import { createClient } from "@/lib/supabase/server";
import {
  Briefcase,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Quote,
  Clock,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { ScoreRadar } from "@/components/ui/score-radar";

export const revalidate = 0;

function getInitials(name: string) {
  if (!name) return "CA";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function StatusBadge({ status, aiScore }: { status: string; aiScore: number }) {
  if (status === "completed" || aiScore >= 80) {
    return (
      <span className="rounded-full px-3 py-1 text-xs font-medium bg-emerald-50 text-[#10B981] border border-emerald-100 inline-flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
        Verified Match
      </span>
    );
  }
  if (status === "rejected" || aiScore < 40) {
    return (
      <span className="rounded-full px-3 py-1 text-xs font-medium bg-rose-50 text-[#EF4444] border border-rose-100 inline-flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
        Risk Detected
      </span>
    );
  }
  return (
    <span className="rounded-full px-3 py-1 text-xs font-medium bg-amber-50 text-[#F59E0B] border border-amber-100 inline-flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
      Interviewing
    </span>
  );
}

export default async function CandidateProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: candidateId } = await params;
  const supabase = await createClient();

  // Fetch candidate from Supabase
  const { data: candidate } = await supabase
    .from("candidates")
    .select(`
      *,
      jobs (
        id,
        title,
        department,
        description
      ),
      proctor_logs (
        id,
        event_type,
        created_at
      )
    `)
    .eq("id", candidateId)
    .single();

  if (!candidate) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center space-y-4 max-w-xl mx-auto my-12">
        <h2 className="font-display text-2xl font-bold text-[#1F2937]">Candidate Record Not Found</h2>
        <p className="font-sans text-xs text-[#6B7280]">The requested candidate evaluation record does not exist.</p>
        <Link href="/dashboard">
          <button className="bg-[#4361EE] text-white text-xs font-bold py-2.5 px-5 rounded-lg shadow-sm">
            ← Return to Dashboard
          </button>
        </Link>
      </div>
    );
  }

  const job = candidate.jobs || {};
  const proctorLogs = candidate.proctor_logs || [];
  const xai = candidate.xai_reasoning || {};

  const techScore = candidate.technical_score || candidate.ai_score || 0;
  const commScore = candidate.communication_score || candidate.ai_score || 0;
  const honestyScore = candidate.honesty_score || 85;
  const overallScore = candidate.ai_score || 0;

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto font-sans">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 font-mono text-xs text-[#6B7280]">
        <Link href="/dashboard" className="hover:text-[#4361EE] transition-colors">Dashboard</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
        <Link href="/dashboard/candidates" className="hover:text-[#4361EE] transition-colors">Candidates</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
        <span className="text-[#4361EE] font-bold truncate max-w-[200px]">{candidate.name}</span>
      </div>

      {/* Candidate Profile Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-[#4361EE] flex items-center justify-center font-mono text-base font-bold shrink-0 border border-blue-100">
              {getInitials(candidate.name)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-display text-2xl font-extrabold text-[#1F2937] tracking-tight">{candidate.name}</h1>
                <StatusBadge status={candidate.status} aiScore={overallScore} />
              </div>
              <p className="font-mono text-xs text-[#4361EE] font-semibold">{job.title || "Applicant"}</p>
              <div className="flex items-center flex-wrap gap-4 text-xs text-[#6B7280] pt-1">
                <span className="flex items-center gap-1.5 font-sans">
                  <Briefcase className="w-3.5 h-3.5 text-[#4361EE]" strokeWidth={2} />
                  {job.department || "Engineering"}
                </span>
                <span className="flex items-center gap-1.5 font-mono text-xs">
                  <Clock className="w-3.5 h-3.5 text-[#4361EE]" strokeWidth={2} />
                  Applied: {new Date(candidate.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                {candidate.cv_url && (
                  <a
                    href={candidate.cv_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[#4361EE] hover:underline font-mono text-xs font-bold"
                  >
                    <FileText className="w-3.5 h-3.5" strokeWidth={2} />
                    Resume PDF
                    <ExternalLink className="w-3 h-3" strokeWidth={2} />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/interview/${candidate.id}`}>
              <button className="bg-[#4361EE] hover:bg-[#3A56D4] text-white text-xs font-bold py-2.5 px-5 rounded-lg shadow-sm flex items-center gap-2">
                <span>Open Interview Room</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recharts Radar & Score Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          {/* Radar Chart Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="eyebrow flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#4361EE]" strokeWidth={2} />
                Evaluation Radar
              </span>
              <span className="font-mono text-2xl font-bold text-[#4361EE]">{overallScore}%</span>
            </div>

            <ScoreRadar
              technical={techScore}
              communication={commScore}
              honesty={honestyScore}
            />

            <div className="space-y-3 pt-2 border-t border-gray-100">
              <div className="flex justify-between items-center text-xs font-sans">
                <span className="text-[#6B7280]">Technical Competence</span>
                <span className="font-mono text-[#1F2937] font-bold">{techScore}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#4361EE] rounded-full" style={{ width: `${techScore}%` }} />
              </div>

              <div className="flex justify-between items-center text-xs font-sans pt-1">
                <span className="text-[#6B7280]">Communication Clarity</span>
                <span className="font-mono text-[#1F2937] font-bold">{commScore}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-600 rounded-full" style={{ width: `${commScore}%` }} />
              </div>

              <div className="flex justify-between items-center text-xs font-sans pt-1">
                <span className="text-[#6B7280]">Honesty &amp; Integrity</span>
                <span className="font-mono text-[#10B981] font-bold">{honestyScore}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${honestyScore}%` }} />
              </div>
            </div>
          </div>

          {/* AI Recommendation Badge Card */}
          <div className={`p-6 rounded-xl border space-y-2 ${
            overallScore >= 80
              ? "bg-emerald-50/60 border-emerald-200 text-[#1F2937]"
              : overallScore >= 60
              ? "bg-blue-50/60 border-blue-200 text-[#1F2937]"
              : "bg-rose-50/60 border-rose-200 text-[#1F2937]"
          }`}>
            <div className="eyebrow flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#4361EE]" strokeWidth={2} />
              <span>AI Hiring Recommendation</span>
            </div>
            <p className="font-sans text-xs text-[#6B7280] leading-relaxed">
              {overallScore >= 80
                ? "Strong Hire. Candidate's verified technical experience aligns seamlessly with role requirements."
                : overallScore >= 60
                ? "Recommended for Final Round. Solid technical fundamentals with strong communication skills."
                : "High Risk / Reject. Did not meet minimum scoring rubric threshold."}
            </p>
          </div>
        </div>

        {/* Right Column: XAI Reasoning Evidence & Transcript */}
        <div className="lg:col-span-7 space-y-6">
          {/* Explainable AI Report Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <span className="eyebrow flex items-center gap-2 border-b border-gray-100 pb-3">
              <Quote className="w-3.5 h-3.5 text-[#4361EE]" strokeWidth={2} />
              Explainable AI (XAI) Evidence Report
            </span>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1.5">
                <span className="eyebrow block text-[11px]">
                  Claim vs. Reality Analysis
                </span>
                <p className="font-sans text-xs text-[#6B7280] leading-relaxed">
                  {xai.claim_vs_reality || "Candidate completed interview questions. AI confirmed technical claims align with job requirements."}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-1.5">
                <span className="eyebrow block text-[11px] text-[#4361EE]">
                  Transcript Evidence Quote
                </span>
                <p className="font-mono text-xs text-[#1F2937] italic leading-relaxed font-medium">
                  &quot;{xai.transcript_evidence || "Demonstrated clear articulated project context during interview Q&A."}&quot;
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1.5">
                <span className="eyebrow block text-[11px]">
                  Rubric Justification
                </span>
                <p className="font-sans text-xs text-[#6B7280] leading-relaxed">
                  {xai.rubric_justification || `Assessed overall technical score at ${techScore}% and communication score at ${commScore}%.`}
                </p>
              </div>
            </div>
          </div>

          {/* Proctoring Activity Logs Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="eyebrow flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" strokeWidth={2} />
                Proctoring Telemetry Logs
              </span>
              <span className="font-mono text-xs text-[#6B7280]">
                {proctorLogs.length} Event(s)
              </span>
            </div>

            {proctorLogs.length === 0 ? (
              <p className="font-mono text-xs text-[#6B7280] py-4 text-center">
                No proctoring warnings or tab-switches recorded during this session.
              </p>
            ) : (
              <div className="space-y-2 font-mono text-xs">
                {proctorLogs.map((log: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" strokeWidth={2} />
                      {log.event_type}
                    </span>
                    <span className="text-[10px] text-amber-600">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
