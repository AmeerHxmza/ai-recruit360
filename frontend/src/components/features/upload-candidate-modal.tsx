"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, UploadCloud, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function UploadCandidateModal() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [jobId, setJobId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ candidateId: string } | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF resume.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please enter a job description.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess(null);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("job_description", jobDescription);
    if (jobId.trim()) {
      formData.append("job_id", jobId.trim());
    }

    const backendUrl = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://127.0.0.1:8000";

    try {
      // Get Supabase session token for authorization
      const { data: { session } } = await supabase.auth.getSession();

      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`${backendUrl}/api/candidates/process`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setSuccess({ candidateId: data.candidate_id });

      // After 2 seconds, close modal and refresh page
      setTimeout(() => {
        setOpen(false);
        setFile(null);
        setJobDescription("");
        setJobId("");
        setSuccess(null);
        router.refresh();
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during evaluation.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) {
      setFile(null);
      setJobDescription("");
      setJobId("");
      setError("");
      setSuccess(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2" variant="accent">
          <UploadCloud className="w-4 h-4" />
          Evaluate New Candidate
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Evaluate Candidate</DialogTitle>
          <DialogDescription>
            Upload a candidate's resume (PDF) and provide the job description to run the autonomous AI evaluation pipeline.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-success" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Evaluation Started!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Candidate <span className="font-mono text-xs">{success.candidateId.split("-")[0]}</span> is being processed by AI in the background.
              </p>
              <p className="text-xs text-muted-foreground mt-1">Closing in 2 seconds...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 mt-2">
            {/* Resume Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Resume (PDF, max 5MB)</label>
              <label
                htmlFor="resume-upload"
                className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-border p-4 hover:border-primary/50 hover:bg-primary/[0.04] transition-colors"
              >
                <UploadCloud className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm text-muted-foreground">
                  {file ? (
                    <span className="text-foreground font-medium">{file.name}</span>
                  ) : (
                    "Click to choose PDF file"
                  )}
                </span>
              </label>
              <Input
                id="resume-upload"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                disabled={isLoading}
              />
            </div>

            {/* Job Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Description *</label>
              <Textarea
                placeholder="Paste the full job description here. The AI will match the resume against these requirements..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[140px] resize-none"
                disabled={isLoading}
              />
            </div>

            {/* Optional Job ID */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Job ID <span className="text-xs">(optional — links candidate to a job listing)</span>
              </label>
              <Input
                placeholder="e.g. abc12345-..."
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                disabled={isLoading}
                className="font-mono text-sm"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive font-medium">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2 border-t border-border">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !file || !jobDescription.trim()} variant="accent">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting to AI...
                  </>
                ) : (
                  "Run AI Evaluation"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
