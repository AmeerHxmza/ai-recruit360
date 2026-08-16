"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { UploadCloud, Loader2, CheckCircle2, XCircle, ArrowRight, FileText } from "lucide-react";
import { Logo } from "@/components/ui/logo";

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

type Stage = "apply" | "screening" | "knockout" | "submitting" | "done" | "error";

type ApplicationData = {
  fullName: string;
  email: string;
  gender: string;
  city: string;
  cvFile: File | null;
};

export default function ApplyJobPage() {
  const params = useParams<{ jobId: string }>();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [stage, setStage] = useState<Stage>("apply");
  const [screeningMessage, setScreeningMessage] = useState("Analyzing your resume against target experience rubrics...");
  const [errorMessage, setErrorMessage] = useState("");
  const [jobTitle, setJobTitle] = useState("Open Position");

  const [application, setApplication] = useState<ApplicationData>({
    fullName: "",
    email: "",
    gender: "Male",
    city: "",
    cvFile: null,
  });

  // Fetch job title on mount
  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await fetch(`${FASTAPI_URL}/api/jobs/${jobId}`);
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

  const handleApplySubmit = async () => {
    if (!application.fullName.trim() || !application.email.trim() || !application.cvFile) {
      return;
    }

    setStage("screening");
    setScreeningMessage("Evaluating location, CV stack, and generating technical assessment...");

    try {
      const formData = new FormData();
      formData.append("name", application.fullName.trim());
      formData.append("email", application.email.trim());
      formData.append("gender", application.gender);
      formData.append("city", application.city.trim());
      formData.append("address", application.city.trim());
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

      // Hard Knockout passed -> Redirect to 10 MCQ Assessment room
      if (data.candidate_id) {
        router.push(`/assessment/${data.candidate_id}`);
      } else {
        setStage("error");
        setErrorMessage("Failed to initialize candidate assessment ID.");
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
              <h2 className="font-display text-xl font-bold text-[#1F2937]">Candidate Screening Application</h2>
              <p className="font-sans text-xs text-[#6B7280] leading-relaxed">
                Fill in your candidate demographics and upload your PDF resume. Our AI engine will run baseline location/stack verification and generate a 10-question technical MCQ assessment.
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
                  <label className="font-mono text-xs uppercase font-bold text-[#1F2937]">Gender *</label>
                  <select
                    className="w-full h-11 px-4 text-sm font-sans rounded-lg border border-gray-200 text-[#1F2937] bg-white focus:outline-none focus:ring-2 focus:ring-[#4361EE] transition-all"
                    value={application.gender}
                    onChange={(e) => setApplication((p) => ({ ...p, gender: e.target.value }))}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other / Prefer not to say</option>
                  </select>
                </div>
                <div className="grid gap-1.5">
                  <label className="font-mono text-xs uppercase font-bold text-[#1F2937]">City / Location *</label>
                  <input
                    placeholder="e.g. San Francisco, CA or Lahore"
                    className="w-full h-11 px-4 text-sm font-sans rounded-lg border border-gray-200 text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4361EE] transition-all placeholder:text-gray-400"
                    value={application.city}
                    onChange={(e) => setApplication((p) => ({ ...p, city: e.target.value }))}
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
                disabled={!application.fullName.trim() || !application.email.trim() || !application.city.trim() || !application.cvFile}
              >
                <span>Submit Application &amp; Start MCQs</span>
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
            <h3 className="font-display text-xl font-bold text-[#1F2937]">AI Multi-Stage Screening Active</h3>
            <p className="font-sans text-xs text-[#6B7280] max-w-md mx-auto">{screeningMessage}</p>
            <p className="font-mono text-[11px] text-gray-400">Running Hard Knockout &amp; MCQ Generation Graph...</p>
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
              Thank you for your interest. Based on our AI hard knockout screening against location and technical stack requirements, your profile did not meet minimum threshold criteria for this specific role.
            </p>
            <button onClick={() => router.push("/")} className="btn-secondary text-xs rounded-lg px-6 py-2.5">
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
