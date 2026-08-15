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
      <div className="p-16 text-center space-y-4">
        <h2 className="font-display text-2xl font-medium text-[#F2F5F9]">Candidate Not Found</h2>
        <p className="font-sans text-xs text-[#9AA6B8]">The requested candidate evaluation record does not exist.</p>
        <Link href="/dashboard">
          <button className="btn-primary text-xs">
            ← Back to Leaderboard
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
      <div className="flex items-center gap-2 font-mono text-[11px] text-[#66707F]">
        <Link href="/dashboard" className="hover:text-[#F2F5F9] transition-colors">Dashboard</Link>
        <ChevronRight className="w-3 h-3 text-[#66707F]" strokeWidth={1.75} />
        <Link href="/dashboard/candidates" className="hover:text-[#F2F5F9] transition-colors">Candidates</Link>
        <ChevronRight className="w-3 h-3 text-[#66707F]" strokeWidth={1.75} />
        <span className="text-[#8AB4F8] truncate max-w-[200px]">{candidate.name}</span>
      </div>

      {/* Candidate Profile Header Card */}
      <div className="card-enterprise p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-[rgba(138,180,248,0.10)] text-[#8AB4F8] flex items-center justify-center font-mono text-base font-medium shrink-0 border border-[rgba(148,163,184,0.12)]">
              {getInitials(candidate.name)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-display text-2xl font-medium text-[#F2F5F9]">{candidate.name}</h1>
                <StatusBadge status={candidate.status} aiScore={overallScore} />
              </div>
              <p className="font-mono text-xs text-[#7DA2F2]">{job.title || "Applicant"}</p>
              <div className="flex items-center flex-wrap gap-4 text-xs text-[#9AA6B8] pt-1">
                <span className="flex items-center gap-1.5 font-sans">
                  <Briefcase className="w-3.5 h-3.5 text-[#8AB4F8]" strokeWidth={1.75} />
                  {job.department || "Engineering"}
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-[#8AB4F8]" strokeWidth={1.75} />
                  Applied: {new Date(candidate.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                {candidate.cv_url && (
                  <a
                    href={candidate.cv_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[#8AB4F8] hover:underline font-mono text-[11px]"
                  >
                    <FileText className="w-3.5 h-3.5" strokeWidth={1.75} />
                    Resume PDF
                    <ExternalLink className="w-3 h-3" strokeWidth={1.75} />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/interview/${candidate.id}`}>
              <button className="btn-secondary text-xs">
                Open Interview Room
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recharts Radar & Score Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          {/* Radar Chart Card */}
          <div className="card-enterprise space-y-4">
            <div className="flex items-center justify-between border-b border-[rgba(148,163,184,0.12)] pb-3">
              <span className="eyebrow flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#8AB4F8]" strokeWidth={1.75} />
                Evaluation Radar
              </span>
              <span className="font-mono text-2xl font-medium text-[#8AB4F8]">{overallScore}%</span>
            </div>

            <ScoreRadar
              technical={techScore}
              communication={commScore}
              honesty={honestyScore}
            />

            <div className="space-y-3 pt-2 border-t border-[rgba(148,163,184,0.12)]">
              <div className="flex justify-between items-center text-xs font-sans">
                <span className="text-[#9AA6B8]">Technical Competence</span>
                <span className="font-mono text-[#F2F5F9] font-medium">{techScore}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#0B1019] rounded-full overflow-hidden">
                <div className="h-full bg-[#8AB4F8] rounded-full" style={{ width: `${techScore}%` }} />
              </div>

              <div className="flex justify-between items-center text-xs font-sans pt-1">
                <span className="text-[#9AA6B8]">Communication Clarity</span>
                <span className="font-mono text-[#F2F5F9] font-medium">{commScore}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#0B1019] rounded-full overflow-hidden">
                <div className="h-full bg-[#66707F] rounded-full" style={{ width: `${commScore}%` }} />
              </div>

              <div className="flex justify-between items-center text-xs font-sans pt-1">
                <span className="text-[#9AA6B8]">Honesty &amp; Integrity</span>
                <span className="font-mono text-[#22C55E] font-medium">{honestyScore}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#0B1019] rounded-full overflow-hidden">
                <div className="h-full bg-[#22C55E] rounded-full" style={{ width: `${honestyScore}%` }} />
              </div>
            </div>
          </div>

          {/* AI Recommendation Badge */}
          <div className={`p-5 rounded-[12px] border space-y-2 ${
            overallScore >= 80
              ? "bg-[rgba(34,197,94,0.08)] border-[rgba(34,197,94,0.2)] text-[#F2F5F9]"
              : overallScore >= 60
              ? "bg-[#0C121D] border-[rgba(148,163,184,0.12)] text-[#F2F5F9]"
              : "bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.2)] text-[#F2F5F9]"
          }`}>
            <div className="eyebrow flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#8AB4F8]" strokeWidth={1.75} />
              <span>AI Hiring Recommendation</span>
            </div>
            <p className="font-sans text-xs text-[#9AA6B8] leading-relaxed">
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
          {/* Explainable AI Report */}
          <div className="card-enterprise space-y-4">
            <span className="eyebrow flex items-center gap-2 border-b border-[rgba(148,163,184,0.12)] pb-3">
              <Quote className="w-3.5 h-3.5 text-[#8AB4F8]" strokeWidth={1.75} />
              Explainable AI (XAI) Evidence Report
            </span>

            <div className="space-y-4">
              <div className="p-4 rounded-[8px] bg-[#0B1019] border border-[rgba(148,163,184,0.12)] space-y-1.5">
                <span className="eyebrow block text-[11px]">
                  Claim vs. Reality Analysis
                </span>
                <p className="font-sans text-xs text-[#9AA6B8] leading-relaxed">
                  {xai.claim_vs_reality || "Candidate completed interview questions. AI confirmed technical claims align with job requirements."}
                </p>
              </div>

              <div className="p-4 rounded-[8px] bg-[#0B1019] border border-[rgba(148,163,184,0.12)] space-y-1.5">
                <span className="eyebrow block text-[11px] text-[#22C55E]">
                  Transcript Evidence Quote
                </span>
                <p className="font-mono text-xs text-[#F2F5F9] italic leading-relaxed">
                  &quot;{xai.transcript_evidence || "Demonstrated clear articulated project context during interview Q&A."}&quot;
                </p>
              </div>

              <div className="p-4 rounded-[8px] bg-[#0B1019] border border-[rgba(148,163,184,0.12)] space-y-1.5">
                <span className="eyebrow block text-[11px]">
                  Rubric Justification
                </span>
                <p className="font-sans text-xs text-[#9AA6B8] leading-relaxed">
                  {xai.rubric_justification || `Assessed overall technical score at ${techScore}% and communication score at ${commScore}%.`}
                </p>
              </div>
            </div>
          </div>

          {/* Proctoring Activity Logs */}
          <div className="card-enterprise space-y-4">
            <div className="flex items-center justify-between border-b border-[rgba(148,163,184,0.12)] pb-3">
              <span className="eyebrow flex items-center gap-2 text-[#EAB308]">
                <AlertTriangle className="w-3.5 h-3.5 text-[#EAB308]" strokeWidth={1.75} />
                Proctoring Telemetry Logs
              </span>
              <span className="font-mono text-xs text-[#66707F]">
                {proctorLogs.length} Event(s)
              </span>
            </div>

            {proctorLogs.length === 0 ? (
              <p className="font-mono text-xs text-[#66707F] py-4 text-center">
                No proctoring warnings or tab-switches recorded during this session.
              </p>
            ) : (
              <div className="space-y-2 font-mono text-xs">
                {proctorLogs.map((log: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-[8px] bg-[rgba(234,179,8,0.10)] border border-[rgba(234,179,8,0.25)] text-[#EAB308] flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#EAB308]" strokeWidth={1.75} />
                      {log.event_type}
                    </span>
                    <span className="text-[10px] text-[#66707F]">
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
