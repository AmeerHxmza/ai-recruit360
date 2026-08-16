"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();
import { Skeleton } from "@/components/ui/skeleton";
import { FeedbackToast } from "@/components/ui/feedback-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Loader2,
  Sparkles,
  FileText,
} from "lucide-react";

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

type Job = {
  id: string;
  recruiter_id: string;
  title: string;
  description: string;
  department: string;
  min_experience?: number;
  status: string;
  created_at?: string;
  candidates?: { count: number }[];
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
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("jobs")
      .select("*, candidates(count)")
      .eq("recruiter_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setToast({ message: `Error loading jobs: ${error.message}`, tone: "error" });
    } else if (data) {
      setJobs(data as unknown as Job[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.department.toLowerCase().includes(search.toLowerCase())
    );
  }, [jobs, search]);

  const handleDeleteJob = async (jobId: string) => {
    const { error } = await supabase.from("jobs").delete().eq("id", jobId);
    if (error) {
      setToast({ message: `Failed to delete job: ${error.message}`, tone: "error" });
    } else {
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      setToast({ message: "Job requisition deleted.", tone: "info" });
    }
  };

  const handleUpdateJob = async (updated: Job) => {
    const { error } = await supabase
      .from("jobs")
      .update({
        title: updated.title,
        department: updated.department,
        description: updated.description,
      })
      .eq("id", updated.id);

    if (error) {
      setToast({ message: `Failed to update job: ${error.message}`, tone: "error" });
    } else {
      setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
      setEditingJob(null);
      setToast({ message: "Job requisition updated successfully.", tone: "success" });
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
            Create, enhance, and manage position criteria for multi-stage candidate screening.
          </p>
        </div>
        <CreateJobDialog
          onDone={(message, tone) => setToast({ message, tone })}
          onCreated={fetchJobs}
        />
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
            <Skeleton key={i} className="h-44 w-full rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-[#4361EE] flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7" strokeWidth={2} />
          </div>
          <h3 className="font-display text-lg font-bold text-[#1F2937]">No Job Requisitions Found</h3>
          <p className="font-sans text-xs text-[#6B7280] max-w-md mx-auto">
            Create your first job posting to start receiving candidates and generating 5-stage screening assessments.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => {
            const applicantCount = job.candidates?.[0]?.count || 0;
            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 hover:shadow-md hover:border-blue-100 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-block font-mono text-[10px] uppercase font-bold text-[#4361EE] bg-blue-50 border border-blue-100 rounded-full px-2.5 py-0.5">
                      {job.department || "Engineering"}
                    </span>
                    <JobActionsMenu
                      job={job}
                      onDelete={handleDeleteJob}
                      onUpdate={(id) => setEditingJob(jobs.find((j) => j.id === id) || null)}
                      onCopyLink={copyPortalLink}
                    />
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

                  <div className="flex items-center gap-2">
                    <ShareJobDialog jobTitle={job.title} jobId={job.id} onDone={(m, t) => setToast({ message: m, tone: t })} />
                    <button
                      onClick={() => router.push(`/dashboard/candidates?job_id=${job.id}`)}
                      className="bg-gray-50 hover:bg-blue-50 text-[#4361EE] text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200 hover:border-blue-200 transition-all"
                    >
                      View Pool
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Job Modal */}
      <EditJobDialog
        job={editingJob}
        onClose={() => setEditingJob(null)}
        onSave={handleUpdateJob}
        onDone={(message, tone) => setToast({ message, tone })}
      />

      {/* Feedback Toast Banner */}
      {toast && (
        <FeedbackToast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />
      )}
    </div>
  );
}

function CreateJobDialog({
  onDone,
  onCreated,
}: {
  onDone: (message: string, tone: "success" | "error" | "info") => void;
  onCreated?: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);

  const handleEnhanceWithAI = async () => {
    if (!title.trim()) {
      onDone("Please enter a Job Title first before enhancing.", "info");
      return;
    }
    setIsEnhancing(true);
    try {
      const res = await fetch(`${FASTAPI_URL}/api/jobs/enhance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          department: department.trim(),
          description: description.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.enhanced_description) {
          setDescription(data.enhanced_description);
          onDone("Job description enhanced with AI!", "success");
        }
      } else {
        throw new Error("Failed to generate enhancement");
      }
    } catch {
      onDone("Could not enhance description. Please try again.", "error");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleCreate = async () => {
    if (!title.trim() || !department.trim()) {
      onDone("Title and department are required.", "error");
      return;
    }
    setIsSubmitting(true);
    
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      onDone("Recruiter authentication required. Please sign in.", "error");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from("jobs").insert({
      recruiter_id: user.id,
      title: title.trim(),
      department: department.trim(),
      description: description.trim() || "Role description.",
      status: "active",
    });
    setIsSubmitting(false);
    if (error) {
      onDone(`Failed to create job: ${error.message}`, "error");
    } else {
      setTitle(""); setDepartment(""); setDescription("");
      setOpen(false);
      onDone("Job requisition created successfully.", "success");
      onCreated?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="bg-[#4361EE] hover:bg-[#3A56D4] text-white text-xs font-bold py-2.5 px-5 rounded-lg shadow-sm flex items-center gap-2 transition-all active:scale-95">
          <Plus className="w-4 h-4" strokeWidth={2} /> Create Job Requisition
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[540px] bg-white border-gray-200 text-[#1F2937] font-sans rounded-2xl shadow-xl p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold text-[#1F2937]">Create Job Requisition</DialogTitle>
          <DialogDescription className="font-sans text-xs text-[#6B7280]">
            Set position requirements for multi-stage candidate screening &amp; AI knockout evaluation.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <label htmlFor="title" className="font-mono text-xs uppercase font-bold text-[#1F2937]">Job Title *</label>
              <input id="title" placeholder="e.g. Senior Full-Stack Engineer" className="w-full h-10 px-3.5 text-xs font-sans rounded-lg border border-gray-200 text-[#1F2937] focus:ring-2 focus:ring-[#4361EE] focus:outline-none" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="department" className="font-mono text-xs uppercase font-bold text-[#1F2937]">Department *</label>
              <input id="department" placeholder="e.g. Engineering" className="w-full h-10 px-3.5 text-xs font-sans rounded-lg border border-gray-200 text-[#1F2937] focus:ring-2 focus:ring-[#4361EE] focus:outline-none" value={department} onChange={(e) => setDepartment(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="desc" className="font-mono text-xs uppercase font-bold text-[#1F2937]">
                Description &amp; Knockout Requirements
              </label>
              <button
                type="button"
                onClick={handleEnhanceWithAI}
                disabled={isEnhancing || !title.trim()}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#4361EE] hover:bg-blue-100 font-mono text-[11px] font-bold border border-blue-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEnhancing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4361EE]" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-[#4361EE]" />
                )}
                <span>{isEnhancing ? "Enhancing..." : "Enhance with AI"}</span>
              </button>
            </div>
            <textarea
              id="desc"
              rows={7}
              placeholder="Enter rough role notes or click 'Enhance with AI' to generate a detailed job description with knockout criteria..."
              className="w-full p-3.5 text-xs font-sans rounded-xl border border-gray-200 text-[#1F2937] focus:ring-2 focus:ring-[#4361EE] focus:outline-none placeholder:text-gray-400 resize-none leading-relaxed"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <button className="bg-[#4361EE] hover:bg-[#3A56D4] text-white font-bold text-xs w-full justify-center h-10 rounded-lg flex items-center gap-2 transition-all active:scale-95" onClick={handleCreate} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Publish Requisition
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ShareJobDialog({
  jobTitle,
  jobId,
  onDone,
}: {
  jobTitle: string;
  jobId: string;
  onDone: (message: string, tone: "success" | "error" | "info") => void;
}) {
  const jobLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/apply/${jobId}`
      : `/apply/${jobId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jobLink);
    onDone("Candidate application link copied.", "success");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#4361EE] hover:bg-blue-50 rounded-lg" title="Share Job">
          <Share2 className="w-4 h-4" strokeWidth={2} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white border-gray-200 text-[#1F2937] font-sans rounded-2xl shadow-xl p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold text-[#1F2937]">Share Candidate Portal</DialogTitle>
          <DialogDescription className="font-sans text-xs text-[#6B7280]">
            Share this link with applicants for {jobTitle}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 mt-4">
          <input id="link" defaultValue={jobLink} readOnly className="w-full h-10 px-3.5 font-mono text-xs rounded-lg border border-gray-200 text-[#1F2937] bg-gray-50 focus:outline-none" />
          <button type="button" className="bg-[#4361EE] hover:bg-[#3A56D4] text-white font-bold h-10 px-4 text-xs rounded-lg flex items-center justify-center font-sans" onClick={copyToClipboard}>
            <Copy className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function JobActionsMenu({
  job,
  onDelete,
  onUpdate,
  onCopyLink,
}: {
  job: Job;
  onDelete: (jobId: string) => void;
  onUpdate: (jobId: string) => void;
  onCopyLink: (jobId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:bg-gray-100 rounded-lg" onClick={() => setIsOpen((prev) => !prev)}>
        <MoreVertical className="w-4 h-4" strokeWidth={2} />
      </Button>
      {isOpen ? (
        <div className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg text-[#1F2937] text-xs font-sans">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-gray-100 font-medium"
            onClick={() => { onUpdate(job.id); setIsOpen(false); }}
          >
            <Pencil className="h-3.5 w-3.5 text-[#4361EE]" strokeWidth={2} /> Update
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-gray-100 font-medium"
            onClick={() => { onCopyLink(job.id); setIsOpen(false); }}
          >
            <Link2 className="h-3.5 w-3.5 text-[#4361EE]" strokeWidth={2} /> Copy Portal Link
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-red-600 hover:bg-red-50 font-medium"
            onClick={() => { onDelete(job.id); setIsOpen(false); }}
          >
            <Trash2 className="h-3.5 w-3.5 text-red-600" strokeWidth={2} /> Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}

function EditJobDialog({
  job,
  onClose,
  onSave,
  onDone,
}: {
  job: Job | null;
  onClose: () => void;
  onSave: (job: Job) => void;
  onDone: (message: string, tone: "success" | "error" | "info") => void;
}) {
  const [formState, setFormState] = useState<Job | null>(job);
  const [isEnhancing, setIsEnhancing] = useState(false);

  useEffect(() => {
    setFormState(job);
  }, [job]);

  if (!job || !formState) return null;

  const handleEnhanceWithAI = async () => {
    if (!formState.title.trim()) {
      onDone("Please enter a Job Title first before enhancing.", "info");
      return;
    }
    setIsEnhancing(true);
    try {
      const res = await fetch(`${FASTAPI_URL}/api/jobs/enhance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formState.title.trim(),
          department: formState.department.trim(),
          description: formState.description.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.enhanced_description) {
          setFormState((prev) => (prev ? { ...prev, description: data.enhanced_description } : prev));
          onDone("Job description enhanced with AI!", "success");
        }
      } else {
        throw new Error("Failed to generate enhancement");
      }
    } catch {
      onDone("Could not enhance description. Please try again.", "error");
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <Dialog open={!!job} onOpenChange={(open) => (!open ? onClose() : null)}>
      <DialogContent className="sm:max-w-[540px] bg-white border-gray-200 text-[#1F2937] font-sans rounded-2xl shadow-xl p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold text-[#1F2937]">Update Job Requisition</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <label htmlFor="edit-title" className="font-mono text-xs uppercase font-bold text-[#1F2937]">Job Title</label>
              <input id="edit-title" value={formState.title} onChange={(e) => setFormState((p) => p ? { ...p, title: e.target.value } : p)} className="w-full h-10 px-3.5 text-xs font-sans rounded-lg border border-gray-200 text-[#1F2937] focus:ring-2 focus:ring-[#4361EE] focus:outline-none" />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="edit-department" className="font-mono text-xs uppercase font-bold text-[#1F2937]">Department</label>
              <input id="edit-department" value={formState.department} onChange={(e) => setFormState((p) => p ? { ...p, department: e.target.value } : p)} className="w-full h-10 px-3.5 text-xs font-sans rounded-lg border border-gray-200 text-[#1F2937] focus:ring-2 focus:ring-[#4361EE] focus:outline-none" />
            </div>
          </div>

          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="edit-desc" className="font-mono text-xs uppercase font-bold text-[#1F2937]">
                Description &amp; Requirements
              </label>
              <button
                type="button"
                onClick={handleEnhanceWithAI}
                disabled={isEnhancing || !formState.title.trim()}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#4361EE] hover:bg-blue-100 font-mono text-[11px] font-bold border border-blue-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEnhancing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4361EE]" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-[#4361EE]" />
                )}
                <span>{isEnhancing ? "Enhancing..." : "Enhance with AI"}</span>
              </button>
            </div>
            <textarea
              id="edit-desc"
              rows={7}
              className="w-full p-3.5 text-xs font-sans rounded-xl border border-gray-200 text-[#1F2937] focus:ring-2 focus:ring-[#4361EE] focus:outline-none placeholder:text-gray-400 resize-none leading-relaxed"
              value={formState.description}
              onChange={(e) => setFormState((p) => (p ? { ...p, description: e.target.value } : p))}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <button className="bg-gray-100 hover:bg-gray-200 text-[#1F2937] text-xs font-semibold px-4 py-2 rounded-lg" onClick={onClose}>Cancel</button>
          <button className="bg-[#4361EE] hover:bg-[#3A56D4] text-white text-xs font-bold px-4 py-2 rounded-lg" onClick={() => onSave(formState)}>
            Save Changes
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
