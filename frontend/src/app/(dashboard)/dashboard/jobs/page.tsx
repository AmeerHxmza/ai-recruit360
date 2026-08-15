"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Sparkles
} from "lucide-react";

type Job = {
  id: string;
  title: string;
  department: string;
  description?: string;
  candidates: number;
  status: "Active" | "Closed" | "Draft";
  githubRequired: boolean;
  knockoutEnabled: boolean;
};

export default function JobsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "closed">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" | "info" } | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);

  const loadJobs = async () => {
    setIsLoading(true);
    const { data: jobsData } = await supabase
      .from("jobs")
      .select("id, title, department, description, status")
      .order("created_at", { ascending: false });

    if (jobsData) {
      const { data: countData } = await supabase
        .from("candidates")
        .select("job_id");

      const countMap: Record<string, number> = {};
      (countData || []).forEach((c: any) => {
        if (c.job_id) {
          countMap[c.job_id] = (countMap[c.job_id] || 0) + 1;
        }
      });

      setJobs(jobsData.map((j: any) => ({
        id: j.id,
        title: j.title,
        department: j.department || "Engineering",
        description: j.description || "",
        candidates: countMap[j.id] || 0,
        status: j.status === "closed" ? "Closed" : "Active",
        githubRequired: false,
        knockoutEnabled: true,
      })));
    }
    setIsLoading(false);
  };

  useEffect(() => { loadJobs(); }, []);

  const handleDeleteJob = async (jobId: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    await supabase.from("jobs").delete().eq("id", jobId);
    setToast({ message: "Job requisition deleted.", tone: "success" });
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch = `${job.title} ${job.department}`.toLowerCase().includes(search.toLowerCase().trim());
      const matchesStatus =
        statusFilter === "all" ? true : statusFilter === "active" ? job.status === "Active" : job.status === "Closed";
      return matchesSearch && matchesStatus;
    });
  }, [jobs, search, statusFilter]);

  return (
    <div className="space-y-6 lg:space-y-8 pb-12 font-sans">
      {toast ? <FeedbackToast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} /> : null}
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[rgba(148,163,184,0.12)] pb-6">
        <div>
          <div className="eyebrow flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#8AB4F8]" strokeWidth={1.75} />
            <span>Requisition Management</span>
          </div>
          <h2 className="font-display text-3xl font-medium text-[#F2F5F9]">Job Postings</h2>
          <p className="font-sans text-xs text-[#9AA6B8] mt-1">
            Create, manage, and share active AI-screened job openings.
          </p>
        </div>
        <CreateJobDialog onDone={(message, tone) => setToast({ message, tone })} onCreated={loadJobs} />
      </div>

      {/* Filters */}
      <div className="card-enterprise p-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#66707F]" strokeWidth={1.75} />
          <input
            type="search"
            placeholder="Search job title or department..."
            className="input-enterprise w-full pl-10 h-10 text-xs"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <button
          className="btn-secondary text-xs font-mono py-2 px-4"
          onClick={() => {
            setStatusFilter((prev) => (prev === "all" ? "active" : prev === "active" ? "closed" : "all"));
          }}
        >
          Status Filter: {statusFilter}
        </button>
      </div>

      {/* Jobs List */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="card-enterprise p-6 space-y-4">
                <Skeleton className="h-5 w-2/3 bg-[#0B1019]" />
                <Skeleton className="h-4 w-1/3 bg-[#0B1019]" />
                <Skeleton className="h-12 w-full bg-[#0B1019]" />
              </div>
            ))
          : filteredJobs.map((job) => (
          <div key={job.id} className="card-enterprise p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="eyebrow block mb-1">
                    {job.department}
                  </span>
                  <h3 className="font-display text-xl font-medium text-[#F2F5F9]">{job.title}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <ShareJobDialog jobTitle={job.title} jobId={job.id} onDone={(message, tone) => setToast({ message, tone })} />
                  <JobActionsMenu
                    job={job}
                    onCopyLink={(jobId) => {
                      navigator.clipboard.writeText(`${window.location.origin}/apply/${jobId}`);
                      setToast({ message: "Candidate application link copied.", tone: "success" });
                    }}
                    onUpdate={(jobId) => {
                      const selected = jobs.find((item) => item.id === jobId) ?? null;
                      setEditingJob(selected);
                    }}
                    onDelete={handleDeleteJob}
                  />
                </div>
              </div>

              <p className="font-sans text-xs text-[#9AA6B8] line-clamp-3 leading-relaxed">
                {job.description || "Active engineering position with automated PyMuPDF resume screening and 10-question AI interview generation."}
              </p>
            </div>

            <div className="space-y-4 pt-3 border-t border-[rgba(148,163,184,0.12)]">
              <div className="flex items-center justify-between text-xs font-sans">
                <span className="flex items-center gap-1.5 text-[#9AA6B8]">
                  <Users className="w-4 h-4 text-[#8AB4F8]" strokeWidth={1.75} />
                  {job.candidates} Candidate{job.candidates !== 1 ? "s" : ""} Applied
                </span>
                <span className={job.status === "Active" ? "badge-success" : "badge-warning"}>
                  {job.status}
                </span>
              </div>

              <button
                className="btn-primary w-full justify-center text-xs"
                onClick={() => router.push(`/dashboard/candidates?job=${encodeURIComponent(job.id)}`)}
              >
                View Requisition Candidates
              </button>
            </div>
          </div>
        ))}

        {!isLoading && filteredJobs.length === 0 ? (
          <div className="card-enterprise col-span-full p-12 text-center space-y-2">
            <h3 className="font-display text-lg font-medium text-[#F2F5F9]">No job postings found</h3>
            <p className="font-sans text-xs text-[#9AA6B8]">Create your first job posting to start evaluating applicants.</p>
          </div>
        ) : null}
      </div>

      <EditJobDialog
        key={editingJob?.id ?? "no-edit"}
        job={editingJob}
        onClose={() => setEditingJob(null)}
        onSave={async (updatedJob) => {
          await supabase.from("jobs").update({
            title: updatedJob.title,
            department: updatedJob.department,
            status: updatedJob.status.toLowerCase(),
          }).eq("id", updatedJob.id);
          setJobs((prev) => prev.map((item) => (item.id === updatedJob.id ? updatedJob : item)));
          setEditingJob(null);
          setToast({ message: "Job updated successfully.", tone: "success" });
        }}
      />
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
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);

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
        <button className="btn-primary text-xs">
          <Plus className="w-4 h-4" strokeWidth={1.75} /> Create New Job Posting
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px] bg-[#0C121D] border-[rgba(148,163,184,0.12)] text-[#F2F5F9] font-sans">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-medium text-[#F2F5F9]">Create Job Requisition</DialogTitle>
          <DialogDescription className="font-sans text-xs text-[#9AA6B8]">
            Set position requirements for candidate resume screening.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-3">
          <div className="grid gap-2">
            <Label htmlFor="title" className="eyebrow">Job Title *</Label>
            <input id="title" placeholder="e.g. Senior Full-Stack Engineer" className="input-enterprise h-10" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="department" className="eyebrow">Department *</Label>
            <input id="department" placeholder="e.g. Engineering" className="input-enterprise h-10" value={department} onChange={(e) => setDepartment(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="desc" className="eyebrow">Description</Label>
            <input id="desc" placeholder="Role description & required skills" className="input-enterprise h-10" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <button className="btn-primary text-xs w-full justify-center h-10" onClick={handleCreate} disabled={isSubmitting}>
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
        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#8AB4F8] hover:bg-[#121B2B]" title="Share Job">
          <Share2 className="w-4 h-4" strokeWidth={1.75} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#0C121D] border-[rgba(148,163,184,0.12)] text-[#F2F5F9] font-sans">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-medium text-[#F2F5F9]">Share Candidate Portal</DialogTitle>
          <DialogDescription className="font-sans text-xs text-[#9AA6B8]">
            Share this link with applicants for {jobTitle}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 mt-4">
          <input id="link" defaultValue={jobLink} readOnly className="input-enterprise flex-1 font-mono text-xs h-10" />
          <button type="button" className="btn-primary h-10 px-4 text-xs" onClick={copyToClipboard}>
            <Copy className="h-4 w-4" strokeWidth={1.75} />
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
      <Button variant="ghost" size="icon" className="h-8 w-8 text-[#9AA6B8] hover:bg-[#121B2B]" onClick={() => setIsOpen((prev) => !prev)}>
        <MoreVertical className="w-4 h-4" strokeWidth={1.75} />
      </Button>
      {isOpen ? (
        <div className="absolute right-0 z-20 mt-2 w-40 rounded-[8px] border border-[rgba(148,163,184,0.12)] bg-[#0C121D] p-1 shadow-lg text-[#F2F5F9] text-xs font-sans">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-[6px] px-3 py-2 text-left hover:bg-[#121B2B]"
            onClick={() => { onUpdate(job.id); setIsOpen(false); }}
          >
            <Pencil className="h-3.5 w-3.5 text-[#8AB4F8]" strokeWidth={1.75} /> Update
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-[6px] px-3 py-2 text-left hover:bg-[#121B2B]"
            onClick={() => { onCopyLink(job.id); setIsOpen(false); }}
          >
            <Link2 className="h-3.5 w-3.5 text-[#8AB4F8]" strokeWidth={1.75} /> Copy Portal Link
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-[6px] px-3 py-2 text-left text-[#EF4444] hover:bg-[rgba(239,68,68,0.1)]"
            onClick={() => { onDelete(job.id); setIsOpen(false); }}
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} /> Delete
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
}: {
  job: Job | null;
  onClose: () => void;
  onSave: (job: Job) => void;
}) {
  const [formState, setFormState] = useState<Job | null>(job);

  if (!job || !formState) return null;

  return (
    <Dialog open={!!job} onOpenChange={(open) => (!open ? onClose() : null)}>
      <DialogContent className="sm:max-w-[440px] bg-[#0C121D] border-[rgba(148,163,184,0.12)] text-[#F2F5F9] font-sans">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-medium text-[#F2F5F9]">Update Job Requisition</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="edit-title" className="eyebrow">Job Title</Label>
            <input id="edit-title" value={formState.title} onChange={(e) => setFormState((p) => p ? { ...p, title: e.target.value } : p)} className="input-enterprise h-10" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-department" className="eyebrow">Department</Label>
            <input id="edit-department" value={formState.department} onChange={(e) => setFormState((p) => p ? { ...p, department: e.target.value } : p)} className="input-enterprise h-10" />
          </div>
        </div>
        <DialogFooter>
          <button className="btn-secondary text-xs h-10" onClick={onClose}>Cancel</button>
          <button className="btn-primary text-xs h-10" onClick={() => onSave(formState)}>
            Save Changes
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
