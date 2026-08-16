"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { UploadCloud, Loader2, CheckCircle2, XCircle, ArrowRight, FileText } from "lucide-react";
import { Logo } from "@/components/ui/logo";

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
      
      // Redirect to full interview room or inline stage
      if (data.candidate_id) {
        router.push(`/interview/${data.candidate_id}`);
      } else {
        setStage("interview");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong. Please try again.");
      setStage("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FE] text-[#6B7280] px-4 py-12 flex flex-col items-center justify-center font-sans selection:bg-[#4361EE] selection:text-white">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        {/* Top Header Branding */}
        <div className="text-center space-y-2">
          <Logo size="lg" href="/" variant="light" className="mx-auto" />
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight mt-2">{jobTitle}</h1>
          <p className="font-mono text-xs text-[#6B7280]">Requisition Reference: {jobId}</p>
        </div>

        {/* ── APPLY STAGE FORM CARD ── */}
        {stage === "apply" && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-10 space-y-6">
            <div className="space-y-1.5 border-b border-gray-100 pb-5">
              <h2 className="font-display text-xl font-bold text-[#1F2937]">Start Candidate Application</h2>
              <p className="font-sans text-xs text-[#6B7280] leading-relaxed">
                Fill in your candidate profile details and upload your PDF resume. Our AI engine will evaluate your experience against role rubrics and formulate 10 custom interview questions.
              </p>
            </div>

            <div className="space-y-5">
              <div className="grid gap-1.5">
                <label className="font-mono text-xs uppercase font-bold text-[#1F2937]">Full Name *</label>
                <input
                  placeholder="e.g. Alex Morgan"
                  className="w-full h-11 px-4 text-sm font-sans rounded-lg border border-gray-200 text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4361EE] transition-all placeholder:text-gray-400"
                  value={application.fullName}
                  onChange={(e) => setApplication((p) => ({ ...p, fullName: e.target.value }))}
                />
              </div>

              <div className="grid gap-1.5">
                <label className="font-mono text-xs uppercase font-bold text-[#1F2937]">Email Address *</label>
                <input
                  type="email"
                  placeholder="alex@company.com"
                  className="w-full h-11 px-4 text-sm font-sans rounded-lg border border-gray-200 text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4361EE] transition-all placeholder:text-gray-400"
                  value={application.email}
                  onChange={(e) => setApplication((p) => ({ ...p, email: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <label className="font-mono text-xs uppercase font-bold text-[#1F2937]">Gender</label>
                  <input
                    placeholder="e.g. Male, Female"
                    className="w-full h-11 px-4 text-sm font-sans rounded-lg border border-gray-200 text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4361EE] transition-all placeholder:text-gray-400"
                    value={application.gender}
                    onChange={(e) => setApplication((p) => ({ ...p, gender: e.target.value }))}
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="font-mono text-xs uppercase font-bold text-[#1F2937]">City / Location</label>
                  <input
                    placeholder="e.g. San Francisco, CA"
                    className="w-full h-11 px-4 text-sm font-sans rounded-lg border border-gray-200 text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4361EE] transition-all placeholder:text-gray-400"
                    value={application.address}
                    onChange={(e) => setApplication((p) => ({ ...p, address: e.target.value }))}
                  />
                </div>
              </div>

              {/* Large Dashed PDF CV Upload Zone */}
              <div className="grid gap-1.5">
                <label className="font-mono text-xs uppercase font-bold text-[#1F2937]">PDF Resume *</label>
                <label
                  htmlFor="cv"
                  className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50/50 hover:bg-blue-50/60 hover:border-[#4361EE] transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-[#4361EE] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UploadCloud className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <div className="space-y-1">
                    <span className="font-sans text-sm font-bold text-[#1F2937] block">
                      {application.cvFile ? (
                        <span className="text-[#4361EE] flex items-center gap-1.5 justify-center">
                          <FileText className="w-4 h-4" />
                          {application.cvFile.name}
                        </span>
                      ) : (
                        "Click or drop your PDF CV here"
                      )}
                    </span>
                    <span className="font-mono text-xs text-[#6B7280]">Supports PDF up to 5MB</span>
                  </div>
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
                className="bg-[#4361EE] hover:bg-[#3A56D4] text-white font-bold w-full justify-center h-12 text-sm rounded-lg shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                onClick={handleApplySubmit}
                disabled={!application.fullName.trim() || !application.email.trim() || !application.cvFile}
              >
                <span>Submit Resume &amp; Begin Assessment</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        )}

        {/* ── SCREENING STAGE ── */}
        {stage === "screening" && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-[#4361EE] flex items-center justify-center mx-auto shadow-sm">
              <Loader2 className="h-8 w-8 animate-spin text-[#4361EE]" strokeWidth={2} />
            </div>
            <h3 className="font-display text-xl font-bold text-[#1F2937]">AI Resume Screening Active</h3>
            <p className="font-sans text-xs text-[#6B7280] max-w-md mx-auto">{screeningMessage}</p>
            <p className="font-mono text-[11px] text-gray-400">Autonomous Candidate Evaluation Engine Online...</p>
          </div>
        )}

        {/* ── KNOCKOUT STAGE ── */}
        {stage === "knockout" && (
          <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-[#EF4444] flex items-center justify-center mx-auto">
              <XCircle className="h-8 w-8 text-[#EF4444]" strokeWidth={2} />
            </div>
            <h3 className="font-display text-xl font-bold text-[#1F2937]">Application Criteria Not Matched</h3>
            <p className="font-sans text-xs text-[#6B7280] max-w-lg leading-relaxed mx-auto">
              Thank you for your interest. Based on our AI resume screening against job rubric requirements, your profile did not meet minimum threshold criteria for this specific role.
            </p>
            <button onClick={() => router.push("/")} className="btn-secondary text-xs rounded-lg px-6 py-2.5">
              Return to Home
            </button>
          </div>
        )}

        {/* ── DONE STAGE ── */}
        {stage === "done" && (
          <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#10B981] flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-[#10B981]" strokeWidth={2} />
            </div>
            <h3 className="font-display text-xl font-bold text-[#1F2937]">Application &amp; Assessment Complete</h3>
            <p className="font-sans text-xs text-[#6B7280] max-w-lg leading-relaxed mx-auto">
              Your responses have been processed by our Explainable AI Scoring Engine and delivered to the recruiter leaderboard.
            </p>
            <button onClick={() => router.push("/")} className="btn-primary text-xs rounded-lg px-6 py-2.5">
              Return to Home
            </button>
          </div>
        )}

        {/* ── ERROR STAGE ── */}
        {stage === "error" && (
          <div className="bg-white rounded-2xl shadow-lg border border-rose-100 p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-[#EF4444] flex items-center justify-center mx-auto">
              <XCircle className="h-8 w-8 text-[#EF4444]" strokeWidth={2} />
            </div>
            <h3 className="font-display text-xl font-bold text-[#1F2937]">Submission Failed</h3>
            <p className="font-sans text-xs text-rose-500 max-w-md mx-auto">{errorMessage}</p>
            <button onClick={() => setStage("apply")} className="btn-secondary text-xs rounded-lg px-6 py-2.5">
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
