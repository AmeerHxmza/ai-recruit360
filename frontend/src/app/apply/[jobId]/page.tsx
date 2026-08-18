"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  UploadCloud,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  FileText,
  Building2,
  MapPin,
  Briefcase,
  Globe,
  Github,
  Linkedin,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Clock
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

type Stage = "apply" | "screening" | "knockout" | "duplicate" | "expired" | "error";

type ApplicationData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  city: string;
  githubUrl: string;
  linkedinUrl: string;
  cvFile: File | null;
};

export default function ApplyJobPage() {
  const params = useParams<{ jobId: string }>();
  const router = useRouter();
  const jobId = (params?.jobId as string) || "demo-job";

  const [stage, setStage] = useState<Stage>("apply");
  const [screeningMessage, setScreeningMessage] = useState("Extracting resume text via PyMuPDF...");
  const [errorMessage, setErrorMessage] = useState("");
  const [jobDetails, setJobDetails] = useState<{
    title: string;
    department: string;
    minExperience: number;
    description: string;
    isExpired: boolean;
  }>({
    title: "Senior AI & Full-Stack Engineer",
    department: "Engineering",
    minExperience: 3,
    description: "Join AI-Recruit360 engineering team to build enterprise autonomous hiring and XAI evaluation engines.",
    isExpired: false,
  });

  const [application, setApplication] = useState<ApplicationData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "Male",
    city: "",
    githubUrl: "",
    linkedinUrl: "",
    cvFile: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await fetch(`${FASTAPI_URL}/api/v1/jobs/public/${jobId}`);
        if (res.ok) {
          const job = await res.json();
          setJobDetails({
            title: job.title || "Open Position",
            department: job.department || "Engineering",
            minExperience: job.min_experience !== undefined ? job.min_experience : 0,
            description: job.description || "Exciting engineering position at AI-Recruit360.",
            isExpired: job.is_expired || job.status === "expired",
          });
          if (job.is_expired || job.status === "expired") {
            setStage("expired");
          }
        }
      } catch {
        // Fallback default details retained
      }
    }
    if (jobId) fetchJob();
  }, [jobId]);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        setApplication((prev) => ({ ...prev, cvFile: file }));
      } else {
        alert("Please upload a valid PDF resume file.");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setApplication((prev) => ({ ...prev, cvFile: file }));
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application.firstName.trim() || !application.email.trim() || !application.cvFile) {
      alert("Please fill in your name, email, and upload your PDF resume.");
      return;
    }

    setStage("screening");
    setScreeningMessage("PyMuPDF extracting resume text & running LangGraph Node 1 knockout filter...");

    try {
      const formData = new FormData();
      formData.append("first_name", application.firstName.trim());
      formData.append("last_name", application.lastName.trim() || "Candidate");
      formData.append("email", application.email.trim().toLowerCase());
      formData.append("phone", application.phone.trim());
      formData.append("gender", application.gender);
      formData.append("city", application.city.trim() || "Remote");
      formData.append("github_url", application.githubUrl.trim());
      formData.append("linkedin_url", application.linkedinUrl.trim());
      if (application.cvFile) {
        formData.append("file", application.cvFile);
      }

      const res = await fetch(`${FASTAPI_URL}/api/v1/apply/${jobId}`, {
        method: "POST",
        body: formData,
      });

      if (res.status === 409) {
        setStage("duplicate");
        return;
      }

      if (res.status === 410) {
        setStage("expired");
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = typeof err.detail === "string" ? err.detail : "Application submission failed";
        throw new Error(msg);
      }

      const data = await res.json();

      if (data.passed_knockout === false || data.status === "rejected") {
        setStage("knockout");
        return;
      }

      // Candidate Screening Passed -> Route to Technical MCQs Assessment Test first
      if (data.candidate_id) {
        router.push(`/assessment/${data.candidate_id}`);
      } else {
        router.push(`/assessment/demo-candidate-123`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during application processing.");
      setStage("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#94A3B8] font-sans py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#0EA5E9]/10 blur-[140px] pointer-events-none -z-10" />

      {/* Top Header Logo */}
      <div className="mb-8 text-center">
        <Logo size="xl" href="/" variant="dark" glow />
      </div>

      <main className="w-full max-w-3xl">
        {/* Loading / Screening Stage */}
        {stage === "screening" && (
          <div className="glass-card-dark p-12 text-center border border-[#0EA5E9]/40 shadow-2xl">
            <Loader2 className="w-12 h-12 text-[#0EA5E9] animate-spin mx-auto mb-6" />
            <h3 className="text-2xl font-extrabold text-[#F8FAFC] mb-2">Analyzing Resume &amp; Credentials</h3>
            <p className="text-sm text-[#94A3B8] max-w-md mx-auto">{screeningMessage}</p>
            <div className="mt-8 flex justify-center items-center gap-2 text-xs font-mono text-[#0EA5E9]">
              <ShieldCheck className="w-4 h-4" />
              <span>AI Knockout Screening Active</span>
            </div>
          </div>
        )}

        {/* Duplicate Application Stage */}
        {stage === "duplicate" && (
          <div className="glass-card-dark p-10 text-center border border-amber-500/40 shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-extrabold text-[#F8FAFC]">Application Already Submitted</h3>
            <p className="text-sm text-[#94A3B8] max-w-lg mx-auto leading-relaxed">
              Our records show that an application with email <strong className="text-white">{application.email}</strong> or GitHub profile has already been submitted for this position.
            </p>
            <p className="text-xs text-amber-400 font-mono">
              Duplicate submissions are restricted to ensure fair screening evaluation.
            </p>
            <button onClick={() => setStage("apply")} className="btn-slate">
              Return to Position Overview
            </button>
          </div>
        )}

        {/* Expired Job Stage */}
        {stage === "expired" && (
          <div className="glass-card-dark p-10 text-center border border-amber-500/40 shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-extrabold text-[#F8FAFC]">Application Deadline Passed</h3>
            <p className="text-sm text-[#94A3B8] max-w-lg mx-auto leading-relaxed">
              The duration for this job posting has ended, and it is no longer accepting new candidate applications.
            </p>
          </div>
        )}

        {/* Hard Knockout Rejected Stage */}
        {stage === "knockout" && (
          <div className="glass-card-dark p-10 text-center border border-[#EF4444]/40 shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center text-[#F87171] mx-auto">
              <XCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-extrabold text-[#F8FAFC]">Application Status: Screening Unsuccessful</h3>
            <p className="text-sm text-[#94A3B8] max-w-lg mx-auto">
              Thank you for your interest in joining our team. Based on our AI resume screening, your experience profile does not meet the mandatory technical stack requirements for this role.
            </p>
            <button onClick={() => setStage("apply")} className="btn-slate">
              Return to Position Overview
            </button>
          </div>
        )}

        {/* General Error Stage */}
        {stage === "error" && (
          <div className="glass-card-dark p-10 text-center border border-rose-500/40 shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <XCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-extrabold text-[#F8FAFC]">Submission Error</h3>
            <p className="text-sm text-rose-300 max-w-lg mx-auto">{errorMessage}</p>
            <button onClick={() => setStage("apply")} className="btn-slate">
              Try Again
            </button>
          </div>
        )}

        {/* Primary Application Form Stage */}
        {stage === "apply" && (
          <div className="glass-card-dark p-8 sm:p-10 border border-[#334155] shadow-2xl">
            {/* Position Banner */}
            <div className="pb-8 border-b border-[#334155] mb-8">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="badge-cyan">{jobDetails.department}</span>
                <span className="badge-emerald">{jobDetails.minExperience}+ Years Experience Required</span>
                <span className="badge-cyan">Full-Time</span>
              </div>
              <h1 className="text-3xl font-extrabold text-[#F8FAFC] tracking-tight">{jobDetails.title}</h1>
              <p className="text-sm text-[#94A3B8] mt-2 leading-relaxed whitespace-pre-line">{jobDetails.description}</p>
            </div>

            {/* Application Form */}
            <form onSubmit={handleApplySubmit} className="space-y-6">
              {/* Drag-and-Drop Resume PDF Upload */}
              <div>
                <label className="block text-sm font-semibold text-[#F8FAFC] mb-2">
                  Upload PDF Resume <span className="text-[#0EA5E9]">*</span>
                </label>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    dragActive
                      ? "border-[#0EA5E9] bg-[#0EA5E9]/10"
                      : application.cvFile
                      ? "border-[#10B981] bg-[#10B981]/5"
                      : "border-[#334155] bg-[#0F172A]/50 hover:border-[#475569]"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {application.cvFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="w-8 h-8 text-[#34D399]" />
                      <div className="text-left">
                        <div className="text-sm font-bold text-[#F8FAFC]">{application.cvFile.name}</div>
                        <div className="text-xs text-[#94A3B8]">
                          {(application.cvFile.size / (1024 * 1024)).toFixed(2)} MB PDF
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <UploadCloud className="w-10 h-10 text-[#0EA5E9] mx-auto mb-3" />
                      <div className="text-sm font-bold text-[#F8FAFC]">
                        Click or drag &amp; drop PDF resume file here
                      </div>
                      <div className="text-xs text-[#64748B] mt-1">
                        PyMuPDF extracts candidate skills &amp; experience automatically
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#F8FAFC] uppercase tracking-wider mb-2">
                    First Name <span className="text-[#0EA5E9]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah"
                    value={application.firstName}
                    onChange={(e) => setApplication({ ...application, firstName: e.target.value })}
                    className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#0EA5E9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F8FAFC] uppercase tracking-wider mb-2">
                    Last Name <span className="text-[#0EA5E9]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Williams"
                    value={application.lastName}
                    onChange={(e) => setApplication({ ...application, lastName: e.target.value })}
                    className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#0EA5E9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F8FAFC] uppercase tracking-wider mb-2">
                    Email Address <span className="text-[#0EA5E9]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@example.com"
                    value={application.email}
                    onChange={(e) => setApplication({ ...application, email: e.target.value })}
                    className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#0EA5E9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F8FAFC] uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={application.phone}
                    onChange={(e) => setApplication({ ...application, phone: e.target.value })}
                    className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#0EA5E9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F8FAFC] uppercase tracking-wider mb-2">
                    Gender
                  </label>
                  <select
                    value={application.gender}
                    onChange={(e) => setApplication({ ...application, gender: e.target.value })}
                    className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#0EA5E9]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F8FAFC] uppercase tracking-wider mb-2">
                    Current Location / City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco, CA / Remote"
                    value={application.city}
                    onChange={(e) => setApplication({ ...application, city: e.target.value })}
                    className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#0EA5E9]"
                  />
                </div>
              </div>

              {/* Developer Profile Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#F8FAFC] uppercase tracking-wider mb-2">
                    GitHub Profile URL
                  </label>
                  <div className="relative">
                    <Github className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
                    <input
                      type="url"
                      placeholder="https://github.com/username"
                      value={application.githubUrl}
                      onChange={(e) => setApplication({ ...application, githubUrl: e.target.value })}
                      className="w-full bg-[#0F172A] border border-[#334155] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#0EA5E9]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F8FAFC] uppercase tracking-wider mb-2">
                    LinkedIn Profile URL
                  </label>
                  <div className="relative">
                    <Linkedin className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={application.linkedinUrl}
                      onChange={(e) => setApplication({ ...application, linkedinUrl: e.target.value })}
                      className="w-full bg-[#0F172A] border border-[#334155] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#0EA5E9]"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={!application.cvFile || !application.firstName || !application.email}
                  className="btn-cyan w-full text-base py-3.5 justify-center shadow-lg shadow-[#0EA5E9]/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>Submit Application &amp; Launch AI Screening</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
