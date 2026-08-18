"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedbackToast } from "@/components/ui/feedback-toast";
import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Link2,
  Users,
  Share2,
  Copy,
  Clock,
  AlertCircle,
  CheckCircle2,
  FileText
} from "lucide-react";

type Job = {
  id: string;
  recruiter_id: string;
  title: string;
  description: string;
  department: string;
  min_experience?: number;
  duration_days?: number;
  expires_at?: string;
  status: string;
  is_expired?: boolean;
  applicant_count?: number;
  created_at?: string;
};

type ToastState = {
  message: string;
  tone: "success" | "error" | "info";
} | null;

export default function JobManagementPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<ToastState>(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await api.getJobs();
      setJobs(data.jobs || []);
    } catch (error: any) {
      setToast({ message: `Error loading jobs: ${error.message}`, tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        (j.department || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [jobs, search]);

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job posting? All candidate data and interviews will be cleanly deleted.")) {
      return;
    }
    try {
      await api.deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      setToast({ message: "Job requisition and candidate records deleted.", tone: "info" });
    } catch (err: any) {
      setToast({ message: `Failed to delete job: ${err.message}`, tone: "error" });
    }
  };

  const copyPortalLink = (jobId: string) => {
    const link = `${window.location.origin}/apply/${jobId}`;
    navigator.clipboard.writeText(link);
    setToast({ message: "Candidate application link copied.", tone: "success" });
  };

  return (
    <div className="space-y-6 text-[#1F2937] font-sans selection:bg-[#4361EE] selection:text-white">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-[#1F2937] tracking-tight">Job Requisitions</h1>
          <p className="font-sans text-xs text-[#6B7280] mt-1">
            Create, enhance, and manage position criteria with auto-expiration lifecycles.
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/jobs/new")}
          className="bg-[#4361EE] hover:bg-[#3A56D4] text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={2} /> Create Job Requisition
        </button>
      </div>

      {/* Search Bar & Filter Controls */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
          <input
            placeholder="Search requisitions by title or department..."
            className="w-full h-10 pl-10 pr-4 text-xs font-sans rounded-xl border border-gray-200 text-[#1F2937] bg-white focus:ring-2 focus:ring-[#4361EE] focus:outline-none placeholder:text-gray-400 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="font-mono text-xs text-[#6B7280]">
          Total Requisitions: <strong className="text-[#1F2937]">{jobs.length}</strong>
        </span>
      </div>

      {/* Job Requisitions Data Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-[#4361EE] flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7" strokeWidth={2} />
          </div>
          <h3 className="font-display text-lg font-bold text-[#1F2937]">No Job Requisitions Found</h3>
          <p className="font-sans text-xs text-[#6B7280] max-w-md mx-auto">
            Create your first job posting to start receiving candidates and generating AI screening assessments.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => {
            const applicantCount = job.applicant_count || 0;
            const isExpired = job.is_expired || job.status === "expired";
            return (
              <div
                key={job.id}
                className={`bg-white rounded-2xl border p-5 space-y-4 hover:shadow-md transition-all flex flex-col justify-between group ${
                  isExpired ? "border-amber-200/80 bg-amber-50/20" : "border-gray-100 hover:border-blue-100"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-block font-mono text-[10px] uppercase font-bold text-[#4361EE] bg-blue-50 border border-blue-100 rounded-full px-2.5 py-0.5">
                      {job.department || "Engineering"}
                    </span>

                    {/* Expired Status Badge */}
                    {isExpired ? (
                      <span className="inline-flex items-center space-x-1 font-mono text-[10px] uppercase font-bold text-amber-700 bg-amber-100 border border-amber-300 rounded-full px-2 py-0.5">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Expired</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 font-mono text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 rounded-full px-2 py-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Active</span>
                      </span>
                    )}

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => copyPortalLink(job.id)}
                        title="Copy Application Link"
                        className="p-1.5 text-gray-400 hover:text-[#4361EE] hover:bg-blue-50 rounded-lg transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        title="Delete Job"
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-display text-base font-bold text-[#1F2937] group-hover:text-[#4361EE] transition-colors line-clamp-1">
                    {job.title}
                  </h3>
                  <p className="font-sans text-xs text-[#6B7280] line-clamp-3 leading-relaxed">
                    {job.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-sans text-xs font-semibold text-[#1F2937]">
                    <Users className="w-4 h-4 text-[#4361EE]" strokeWidth={2} />
                    <span>{applicantCount} Candidate{applicantCount === 1 ? "" : "s"}</span>
                  </div>

                  <button
                    onClick={() => router.push(`/dashboard/candidates?job_id=${job.id}`)}
                    className="bg-gray-50 hover:bg-blue-50 text-[#4361EE] text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200 hover:border-blue-200 transition-all cursor-pointer"
                  >
                    View Pool
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Feedback Toast */}
      {toast && (
        <FeedbackToast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
