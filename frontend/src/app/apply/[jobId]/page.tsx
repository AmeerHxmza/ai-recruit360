"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { UploadCloud, Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

type Stage = "apply" | "screening" | "knockout" | "interview" | "submitting" | "done" | "error";

type ApplicationData = {
  fullName: string;
  email: string;
  gender: string;
  address: string;
  cvFile: File | null;
};

export default function ApplyJobPage() {
  const params = useParams<{ jobId: string }>();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [stage, setStage] = useState<Stage>("apply");
  const [screeningMessage, setScreeningMessage] = useState("Analyzing your resume against target experience rubrics...");
  const [errorMessage, setErrorMessage] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [candidateId, setCandidateId] = useState<string>("");
  const [jobTitle, setJobTitle] = useState("Open Position");

  // Browser integrity tracking
  const tabSwitchCount = useRef(0);
  const startTime = useRef(Date.now());

  const [application, setApplication] = useState<ApplicationData>({
    fullName: "",
    email: "",
    gender: "",
    address: "",
    cvFile: null,
  });

  // Fetch job title on mount
  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await fetch(`${FASTAPI_URL}/api/v1/jobs/${jobId}`);
        if (res.ok) {
          const job = await res.json();
          setJobTitle(job.title || "Open Position");
        }
      } catch {
        // Use default title if API unreachable
      }
    }
    fetchJob();
  }, [jobId]);

  // Track tab switches for integrity scoring
  useEffect(() => {
    if (stage !== "interview") return;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabSwitchCount.current++;
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [stage]);

  const handleApplySubmit = async () => {
    if (!application.fullName.trim() || !application.email.trim() || !application.cvFile) {
      return;
    }

    setStage("screening");
    setScreeningMessage("Extracting experience and matching against job rubric standards...");

    try {
      const formData = new FormData();
      formData.append("name", application.fullName.trim());
      formData.append("email", application.email.trim());
      if (application.cvFile) {
        formData.append("file", application.cvFile);
      }

      const res = await fetch(`${FASTAPI_URL}/api/apply/${jobId}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = typeof err.detail === "string"
          ? err.detail
          : Array.isArray(err.detail)
          ? err.detail.map((e: any) => e.msg || JSON.stringify(e)).join(", ")
          : "Submission failed";
        throw new Error(msg);
      }

      const data = await res.json();

      if (data.stage === "knockout" || data.passed_knockout === false || data.status === "rejected") {
        setStage("knockout");
        return;
      }

      // Interview stage
      const fetchedQuestions = data.generated_questions || data.questions || [];
      setCandidateId(data.candidate_id);
      setQuestions(fetchedQuestions);
      setAnswers({});
      setQuestionIndex(0);
      startTime.current = Date.now();
      setStage("interview");
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong. Please try again.");
      setStage("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#05070D] text-[#9AA6B8] px-4 py-12 selection:bg-[#8AB4F8] selection:text-[#06101F] font-sans">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <span className="eyebrow block">AI-Recruit360 Candidate Portal</span>
          <h1 className="font-display text-3xl font-medium text-[#F2F5F9]">{jobTitle}</h1>
          <p className="font-mono text-xs text-[#66707F]">Requisition ID: {jobId}</p>
        </div>

        {/* ── APPLY STAGE ── */}
        {stage === "apply" && (
          <div className="card-enterprise p-6 sm:p-8 space-y-6">
            <div className="space-y-1.5 border-b border-[rgba(148,163,184,0.12)] pb-4">
              <h2 className="font-display text-xl font-medium text-[#F2F5F9]">Start Your Application</h2>
              <p className="font-sans text-xs text-[#9AA6B8] leading-relaxed">
                Fill in your details and upload your PDF resume. Our hiring engine will parse your experience and formulate 10 custom interview questions tailored to this position.
              </p>
            </div>
            <div className="space-y-4">
              <div className="grid gap-2">
                <label className="eyebrow">Full Name *</label>
                <input
                  placeholder="e.g. Alex Morgan"
                  className="input-enterprise h-11"
                  value={application.fullName}
                  onChange={(e) => setApplication((p) => ({ ...p, fullName: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <label className="eyebrow">Email Address *</label>
                <input
                  type="email"
                  placeholder="alex@company.com"
                  className="input-enterprise h-11"
                  value={application.email}
                  onChange={(e) => setApplication((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="eyebrow">Gender</label>
                  <input
                    placeholder="e.g. Male, Female"
                    className="input-enterprise h-11"
                    value={application.gender}
                    onChange={(e) => setApplication((p) => ({ ...p, gender: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="eyebrow">City / Address</label>
                  <input
                    placeholder="e.g. San Francisco, CA"
                    className="input-enterprise h-11"
                    value={application.address}
                    onChange={(e) => setApplication((p) => ({ ...p, address: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="eyebrow">PDF Resume *</label>
                <label
                  htmlFor="cv"
                  className="flex cursor-pointer items-center gap-4 rounded-[8px] border border-dashed border-[rgba(148,163,184,0.25)] bg-[#0B1019] p-5 hover:border-[#8AB4F8] transition-all"
                >
                  <UploadCloud className="h-7 w-7 text-[#8AB4F8] shrink-0" strokeWidth={1.75} />
                  <span className="font-mono text-xs text-[#9AA6B8]">
                    {application.cvFile
                      ? <span className="text-[#8AB4F8] font-medium">{application.cvFile.name}</span>
                      : "Click to select your PDF CV (max 5MB)"}
                  </span>
                </label>
                <input
                  id="cv"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => setApplication((p) => ({ ...p, cvFile: e.target.files?.[0] ?? null }))}
                />
              </div>
              <button
                className="btn-primary w-full justify-center h-12 text-sm"
                onClick={handleApplySubmit}
                disabled={!application.fullName.trim() || !application.email.trim() || !application.cvFile}
              >
                <span>Submit Resume &amp; Begin Assessment</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        )}

        {/* ── SCREENING STAGE ── */}
        {stage === "screening" && (
          <div className="card-enterprise p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[rgba(138,180,248,0.10)] border border-[rgba(148,163,184,0.12)] flex items-center justify-center mx-auto">
              <Loader2 className="h-7 w-7 animate-spin text-[#8AB4F8]" strokeWidth={1.75} />
            </div>
            <h3 className="font-display text-xl font-medium text-[#F2F5F9]">AI Resume Screening Active</h3>
            <p className="font-sans text-xs text-[#9AA6B8] max-w-md mx-auto">{screeningMessage}</p>
            <p className="font-mono text-[11px] text-[#66707F]">Autonomous Candidate Evaluation Engine Online...</p>
          </div>
        )}

        {/* ── KNOCKOUT STAGE ── */}
        {stage === "knockout" && (
          <div className="card-enterprise p-12 text-center space-y-4 border-[rgba(239,68,68,0.25)]">
            <div className="w-14 h-14 rounded-full bg-[rgba(239,68,68,0.12)] flex items-center justify-center mx-auto">
              <XCircle className="h-7 w-7 text-[#EF4444]" strokeWidth={1.75} />
            </div>
            <h3 className="font-display text-xl font-medium text-[#F2F5F9]">Application Criteria Not Matched</h3>
            <p className="font-sans text-xs text-[#9AA6B8] max-w-lg leading-relaxed mx-auto">
              Thank you for your interest. Based on our AI resume screening against job requirements, your profile did not meet minimum threshold criteria for this specific role.
            </p>
            <button onClick={() => router.push("/")} className="btn-secondary text-xs">
              Return to Home
            </button>
          </div>
        )}

        {/* ── DONE STAGE ── */}
        {stage === "done" && (
          <div className="card-enterprise p-12 text-center space-y-4 border-[rgba(34,197,94,0.25)]">
            <div className="w-16 h-16 rounded-full bg-[rgba(34,197,94,0.12)] flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-[#22C55E]" strokeWidth={1.75} />
            </div>
            <h3 className="font-display text-2xl font-medium text-[#F2F5F9]">Interview Completed!</h3>
            <p className="font-sans text-xs text-[#9AA6B8] max-w-lg leading-relaxed mx-auto">
              Thank you for completing your interview, <strong>{application.fullName}</strong>. Your answers and proctoring telemetry have been sent to our Explainable AI engine.
            </p>
            <button onClick={() => router.push("/")} className="btn-secondary text-xs">
              Return to Home
            </button>
          </div>
        )}

        {/* ── ERROR STAGE ── */}
        {stage === "error" && (
          <div className="card-enterprise p-12 text-center space-y-4 border-[rgba(239,68,68,0.25)]">
            <XCircle className="h-9 w-9 text-[#EF4444] mx-auto" strokeWidth={1.75} />
            <h3 className="font-display text-xl font-medium text-[#F2F5F9]">Submission Failed</h3>
            <p className="font-sans text-xs text-[#9AA6B8] max-w-md mx-auto">{errorMessage}</p>
            <button onClick={() => setStage("apply")} className="btn-secondary text-xs">
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
