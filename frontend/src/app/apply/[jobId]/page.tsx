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
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

type Stage = "apply" | "screening" | "knockout" | "submitting" | "done" | "error";

type ApplicationData = {
  fullName: string;
  email: string;
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
  }>({
    title: "Senior AI & Full-Stack Engineer",
    department: "Enterprise Engineering",
    minExperience: 3,
    description: "Join AI-Recruit360 engineering team to build enterprise autonomous hiring and XAI evaluation engines.",
  });

  const [application, setApplication] = useState<ApplicationData>({
    fullName: "",
    email: "",
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
        const res = await fetch(`${FASTAPI_URL}/api/jobs/${jobId}`);
        if (res.ok) {
          const job = await res.json();
          setJobDetails({
            title: job.title || "Open Position",
            department: job.department || "Engineering",
            minExperience: job.min_experience || 2,
            description: job.description || "Exciting enterprise engineering position at AI-Recruit360.",
          });
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
    if (!application.fullName.trim() || !application.email.trim() || !application.cvFile) {
      alert("Please fill in your name, email, and upload your PDF resume.");
      return;
    }

    setStage("screening");
    setScreeningMessage("PyMuPDF extracting resume text & running LangGraph Node 1 knockout filter...");

    try {
      const formData = new FormData();
      formData.append("name", application.fullName.trim());
      formData.append("email", application.email.trim());
      formData.append("gender", application.gender);
      formData.append("city", application.city.trim() || "Remote");
      formData.append("address", application.city.trim() || "Remote");
      formData.append("github_url", application.githubUrl.trim());
      formData.append("linkedin_url", application.linkedinUrl.trim());
      if (application.cvFile) {
        formData.append("file", application.cvFile);
      }

      const res = await fetch(`${FASTAPI_URL}/api/apply/${jobId}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg =
          typeof err.detail === "string"
            ? err.detail
            : Array.isArray(err.detail)
            ? err.detail.map((e: any) => e.msg || JSON.stringify(e)).join(", ")
            : "Application submission failed";
        throw new Error(msg);
      }

      const data = await res.json();

      if (data.stage === "knockout" || data.passed_knockout === false || data.status === "rejected") {
        setStage("knockout");
        return;
      }

      // Hard Knockout Passed -> Proceed to Technical Assessment
      if (data.candidate_id) {
        router.push(`/assessment/${data.candidate_id}`);
      } else {
        // Mock fallback candidate ID for UI demonstration
        router.push(`/assessment/demo-candidate-123`);
      }
    } catch (err: any) {
      console.warn("API Error during application, proceeding to demo mode:", err);
      // Fallback for seamless demo execution if backend offline
      setTimeout(() => {
        router.push(`/assessment/demo-candidate-123`);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#94A3B8] font-sans py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#0EA5E9]/10 blur-[140px] pointer-events-none -z-10" />

      {/* Top Header Logo */}
      <div className="mb-8 text-center">
        <Logo size="xl" href="/" variant="dark" glow />
        <div className="text-xs font-mono text-[#0EA5E9] uppercase tracking-widest mt-2">
          Stitch Screen ID: 06b8323866d7437e9099b0cf31d3b28e
        </div>
      </div>

      <main className="w-full max-w-3xl">
        {stage === "screening" && (
          <div className="glass-card-dark p-12 text-center border border-[#0EA5E9]/40 shadow-2xl">
            <Loader2 className="w-12 h-12 text-[#0EA5E9] animate-spin mx-auto mb-6" />
            <h3 className="text-2xl font-extrabold text-[#F8FAFC] mb-2">Analyzing Resume & Credentials</h3>
            <p className="text-sm text-[#94A3B8] max-w-md mx-auto">{screeningMessage}</p>
            <div className="mt-8 flex justify-center items-center gap-2 text-xs font-mono text-[#0EA5E9]">
              <ShieldCheck className="w-4 h-4" />
              <span>AI Knockout Screening Active</span>
            </div>
          </div>
        )}

        {stage === "knockout" && (
          <div className="glass-card-dark p-10 text-center border border-[#EF4444]/40 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center text-[#F87171] mx-auto mb-6">
              <XCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-extrabold text-[#F8FAFC] mb-3">Application Status: Rejected</h3>
            <p className="text-sm text-[#94A3B8] max-w-lg mx-auto mb-6">
              Thank you for your interest in joining AI-Recruit360. Based on our AI resume knockout assessment, your current experience profile does not meet the minimum required qualifications for this role.
            </p>
            <button onClick={() => setStage("apply")} className="btn-slate">
              Return to Position Overview
            </button>
          </div>
        )}

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
              <p className="text-sm text-[#94A3B8] mt-2 leading-relaxed">{jobDetails.description}</p>
            </div>

            {/* Application Form */}
            <form onSubmit={handleApplySubmit} className="space-[#1E293B] space-y-6">
              {/* Drag-and-Drop Resume PDF Upload */}
              <div>
                <label className="block text-sm font-semibold text-[#F8FAFC] mb-2">
                  Upload Resume (PDF Required) <span className="text-[#0EA5E9]">*</span>
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
                        Click or drag & drop PDF resume file here
                      </div>
                      <div className="text-xs text-[#64748B] mt-1">
                        PyMuPDF extracts candidate skills & experience automatically
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#F8FAFC] uppercase tracking-wider mb-2">
                    Full Name <span className="text-[#0EA5E9]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ameer Hamza"
                    value={application.fullName}
                    onChange={(e) => setApplication({ ...application, fullName: e.target.value })}
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
                    placeholder="ameer@company.com"
                    value={application.email}
                    onChange={(e) => setApplication({ ...application, email: e.target.value })}
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
                    placeholder="e.g. Islamabad / Remote"
                    value={application.city}
                    onChange={(e) => setApplication({ ...application, city: e.target.value })}
                    className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#0EA5E9]"
                  />
                </div>
              </div>

              {/* Developer Links */}
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
                  disabled={!application.cvFile || !application.fullName || !application.email}
                  className="btn-cyan w-full text-base py-3.5 justify-center shadow-lg shadow-[#0EA5E9]/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Submit Resume & Launch Assessment</span>
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
