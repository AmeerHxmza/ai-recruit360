import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileText,
  Video,
} from "lucide-react";
import Link from "next/link";
import { CandidateActions } from "./candidate-actions";
import { RecruiterNotes } from "./recruiter-notes";

export const revalidate = 0;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "Verified Match": "bg-success text-white border-transparent hover:bg-success",
    "Strong Candidate": "bg-primary text-primary-foreground border-transparent hover:bg-primary/90",
    "Review Needed": "bg-warning text-white border-transparent hover:bg-warning",
    "Risk Detected": "bg-destructive text-white border-transparent hover:bg-destructive",
    Rejected: "bg-muted text-muted-foreground",
  };
  return (
    <Badge className={map[status] || ""}>{status || "Pending"}</Badge>
  );
}

function EvalBadge({ status }: { status: string }) {
  if (status === "Excellent")
    return <Badge variant="outline" className="text-success border-success bg-success/5 text-xs">Excellent</Badge>;
  if (status === "Strong")
    return <Badge variant="outline" className="text-primary border-primary bg-primary/5 text-xs">Strong</Badge>;
  if (status === "Weak")
    return <Badge variant="outline" className="text-warning border-warning bg-warning/5 text-xs">Weak</Badge>;
  return <Badge variant="outline" className="text-destructive border-destructive bg-destructive/5 text-xs">Poor</Badge>;
}

export default async function CandidateProfilePage({
  params,
}: {
  params: { id: string };
}) {
  // Fetch candidate with all related data
  const supabase = await createClient();
  const { data: candidateData } = await supabase
    .from("candidates")
    .select(`
      id, first_name, last_name, email, created_at,
      applications (
        id, status, match_score, hiring_confidence, ai_summary, cv_url, applied_at,
        jobs ( title ),
        interviews (
          id, overall_score, truthfulness_score,
          evaluations (
            candidate_answer, ai_score, evaluation_status, ai_feedback,
            questions ( question_text )
          ),
          proctor_logs (
            event_type, description, severity, created_at
          )
        )
      )
    `)
    .eq("id", params.id)
    .single();

  if (!candidateData || !candidateData.applications || candidateData.applications.length === 0) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold text-foreground mb-2">Candidate not found</h2>
        <Link href="/dashboard/candidates" className="text-primary hover:underline text-sm">
          ← Back to Candidates
        </Link>
      </div>
    );
  }

  const app: any = Array.isArray(candidateData.applications) ? candidateData.applications[0] : candidateData.applications;
  const job: any = app?.jobs;
  const interview: any = app?.interviews && Array.isArray(app.interviews) ? app.interviews[0] : app.interviews;
  
  const evaluations: any[] = interview?.evaluations || [];
  const proctorLogs: any[] = interview?.proctor_logs || [];

  const fullName = `${candidateData.first_name || ''} ${candidateData.last_name || ''}`.trim() || 'Unknown';

  const candidate = {
    id: candidateData.id,
    name: fullName,
    role: job?.title || "Unknown Role",
    email: candidateData.email || "",
    cvUrl: app?.cv_url || "",
    appliedDate: new Date(app?.applied_at || candidateData.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    status: app?.status || "Pending",
    scores: {
      match: app?.match_score || 0,
      truth: interview?.truthfulness_score || 0,
      quiz: 0, // removed
      interview: interview?.overall_score || 0,
      confidence: app?.hiring_confidence || 0,
    },
    summary: app?.ai_summary || "No summary available.",
    skills: [] as any[], // removed from schema
  };

  const confidenceColor =
    candidate.scores.confidence >= 80
      ? "text-success"
      : candidate.scores.confidence >= 60
      ? "text-primary"
      : candidate.scores.confidence >= 40
      ? "text-warning"
      : "text-destructive";

  const strokeColor =
    candidate.scores.confidence >= 80
      ? "text-success"
      : candidate.scores.confidence >= 60
      ? "text-primary"
      : candidate.scores.confidence >= 40
      ? "text-warning"
      : "text-destructive";

  return (
    <div className="space-y-6 pb-10 max-w-5xl mx-auto animate-slide-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/dashboard/candidates" className="hover:text-foreground transition-colors">Candidates</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground font-medium truncate max-w-[200px]">{candidate.name}</span>
      </div>

      {/* Profile Header */}
      <div className="surface-card p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5">
          <div className="flex items-start gap-4">
            {/* Dynamic Avatar */}
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xl font-black border-2 border-primary/20 shrink-0">
              {getInitials(candidate.name)}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{candidate.name}</h1>
                <StatusBadge status={candidate.status} />
              </div>
              <p className="text-muted-foreground font-medium mt-0.5">{candidate.role}</p>
              <div className="flex items-center flex-wrap gap-4 text-xs text-muted-foreground mt-2">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  Applied: {candidate.appliedDate}
                </span>
                {candidate.cvUrl && (
                  <a
                    href={candidate.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Resume.pdf
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons — Client Component */}
          <CandidateActions candidateId={candidate.id} currentStatus={candidate.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Hiring Confidence Score */}
          <div className="surface-card p-5">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">
              Hiring Confidence Score
            </h3>
            <div className="flex justify-center mb-5">
              <div className="w-28 h-28 relative flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="9" className="text-muted/40" />
                  <circle
                    cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="9"
                    strokeDasharray={`${276.5 * (candidate.scores.confidence / 100)} 276.5`}
                    strokeLinecap="round"
                    className={strokeColor}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-black tracking-tighter ${confidenceColor}`}>
                    {candidate.scores.confidence}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground">/ 100</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              {[
                { label: "Job Match", value: candidate.scores.match, color: "bg-primary" },
                { label: "Interview", value: candidate.scores.interview, color: "bg-blue-500" },
                { label: "Truthfulness", value: candidate.scores.truth, color: candidate.scores.truth >= 70 ? "bg-success" : candidate.scores.truth >= 40 ? "bg-warning" : "bg-destructive" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-semibold text-foreground">{item.value}%</span>
                  </div>
                  <div className="score-bar">
                    <div className={`score-bar-fill ${item.color}`} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation */}
          <div className={`rounded-xl p-5 border shadow-sm ${
            candidate.status === "Risk Detected"
              ? "bg-destructive/5 border-destructive/20"
              : candidate.status === "Rejected"
              ? "bg-muted border-border"
              : "bg-success/5 border-success/20"
          }`}>
            <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
              candidate.status === "Risk Detected" ? "text-destructive" : candidate.status === "Rejected" ? "text-muted-foreground" : "text-success"
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              AI Recommendation
            </h3>
            <p className={`text-sm font-medium leading-relaxed ${
              candidate.status === "Risk Detected" ? "text-destructive" : candidate.status === "Rejected" ? "text-muted-foreground" : "text-success"
            }`}>
              {candidate.status === "offered"
                ? "Strong Hire. Candidate's verified skills align perfectly with core requirements. No truthfulness risks detected."
                : candidate.status === "interviewed"
                ? "Recommended. Solid skills match and good performance. Minor gaps worth exploring in final round."
                : candidate.status === "rejected"
                ? "Not qualified. Skills and experience do not meet minimum job requirements."
                : "Under evaluation. Full scoring pending."}
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-2 space-y-5">
          {/* Summary & Skills */}
          <div className="surface-card p-5">
            <h3 className="text-base font-bold tracking-tight text-foreground mb-3">
              CV Summary &amp; Job Match
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              {candidate.summary}
            </p>
            {candidate.skills.length > 0 && (
              <>
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                  Skill Verification Results
                </h4>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <Badge
                      key={skill.name}
                      variant={skill.verified ? "outline" : "secondary"}
                      className={
                        skill.verified
                          ? "border-success text-success bg-success/5"
                          : ""
                      }
                    >
                      {skill.name}
                      {skill.verified && <CheckCircle2 className="w-3 h-3 ml-1" />}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Interview Q&A */}
          {evaluations.length > 0 && (
            <div className="surface-card p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold tracking-tight text-foreground">
                  Interview Analysis
                </h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                  {evaluations.length} questions
                </span>
              </div>
              <div className="space-y-3">
                {evaluations.map((r: any, i: number) => (
                  <div key={i} className="p-3.5 border border-border rounded-lg bg-muted/10">
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <span className="text-sm font-semibold text-foreground">
                        Q{i + 1}: {r.questions?.question_text}
                      </span>
                      <EvalBadge status={r.evaluation_status} />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {r.ai_feedback || r.candidate_answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Proctor Logs */}
          {proctorLogs.length > 0 && (
            <div className="surface-card p-5">
              <h3 className="text-base font-bold tracking-tight text-foreground mb-3">
                Proctor Logs
              </h3>
              <div className="bg-[#060D1F] rounded-lg p-4 space-y-3 font-mono text-xs">
                {proctorLogs.map((log: any, i: number) => (
                  <div
                    key={i}
                    className={`border-l-2 pl-3 ${
                      log.severity === "info"
                        ? "border-success"
                        : log.severity === "warning"
                        ? "border-warning"
                        : "border-destructive"
                    }`}
                  >
                    <div className={`text-[10px] uppercase font-bold mb-1 ${
                      log.severity === "info"
                        ? "text-success"
                        : log.severity === "warning"
                        ? "text-warning"
                        : "text-destructive"
                    }`}>
                      {log.severity} • {log.event_type}
                    </div>
                    <p className="text-slate-300 leading-relaxed">{log.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recruiter Notes — Client Component */}
          <RecruiterNotes candidateId={candidate.id} />
        </div>
      </div>
    </div>
  );
}
