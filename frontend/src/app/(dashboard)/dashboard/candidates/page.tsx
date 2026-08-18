"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { FeedbackToast } from "@/components/ui/feedback-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Sparkles,
  Download,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  FileText,
  ShieldAlert,
  Zap,
  Activity
} from "lucide-react";

type Candidate = {
  id: string;
  application_id: string;
  job_id: string;
  first_name: string;
  last_name: string;
  email: string;
  city?: string;
  cv_url: string;
  status: string;
  overall_score: number;
  technical_score: number;
  communication_score: number;
  honesty_score: number;
  problem_solving_score: number;
  passed_knockout: boolean;
  knockout_reason?: string;
  applied_at: string;
};

function CandidatesPageContent() {
  const searchParams = useSearchParams();
  const jobIdParam = searchParams.get("job_id") || "";

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" | "info" } | null>(null);

  // Email Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState("technical_onsite");
  const [emailSubject, setEmailSubject] = useState("Invitation for Onsite Technical Interview - AI-Recruit360");
  const [customMessage, setCustomMessage] = useState(
    "We were highly impressed by your AI technical interview performance. We would like to invite you for an in-person / technical interview with our Senior Engineering Leads."
  );
  const [interviewVenue, setInterviewVenue] = useState("Headquarters Office / Google Meet Link (To be shared)");
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    async function fetchLeaderboard() {
      setIsLoading(true);
      try {
        if (jobIdParam) {
          const res = await api.getLeaderboard(jobIdParam);
          setCandidates(res.candidates || []);
        } else {
          // Fetch default first job candidates or all
          const jobsRes = await api.getJobs();
          const jobs = jobsRes.jobs || [];
          if (jobs.length > 0) {
            const res = await api.getLeaderboard(jobs[0].id);
            setCandidates(res.candidates || []);
          }
        }
      } catch (err: any) {
        setToast({ message: `Error loading candidates: ${err.message}`, tone: "error" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchLeaderboard();
  }, [jobIdParam]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) =>
      `${c.first_name} ${c.last_name} ${c.email} ${c.city || ''}`
        .toLowerCase()
        .includes(search.toLowerCase().trim())
    );
  }, [candidates, search]);

  const toggleSelectCandidate = (id: string) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedCandidateIds.length === filteredCandidates.length) {
      setSelectedCandidateIds([]);
    } else {
      setSelectedCandidateIds(filteredCandidates.map((c) => c.id));
    }
  };

  const handleExportCsv = async () => {
    if (!jobIdParam && candidates.length === 0) return;
    const targetJobId = jobIdParam || (candidates[0]?.job_id);
    if (!targetJobId) return;

    try {
      const res = await api.exportJobCandidatesCsv(targetJobId);
      const blob = new Blob([res.csv_content], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", res.filename || "candidates_leaderboard.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setToast({ message: "Candidate leaderboard CSV exported successfully.", tone: "success" });
    } catch (err: any) {
      setToast({ message: `Failed to export CSV: ${err.message}`, tone: "error" });
    }
  };

  const handleSendInterviewEmails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCandidateIds.length === 0) return;

    try {
      setSendingEmail(true);
      const res = await api.sendInterviewInvite({
        candidate_ids: selectedCandidateIds,
        template_type: emailTemplate,
        subject: emailSubject,
        custom_message: customMessage,
        interview_date_location: interviewVenue
      });
      setIsEmailModalOpen(false);
      setSelectedCandidateIds([]);
      setToast({ message: res.message || "Onsite Interview Invitations dispatched successfully!", tone: "success" });
    } catch (err: any) {
      setToast({ message: `Failed to dispatch emails: ${err.message}`, tone: "error" });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleTemplateChange = (template: string) => {
    setEmailTemplate(template);
    if (template === "technical_onsite") {
      setEmailSubject("Invitation for Onsite Technical Interview - AI-Recruit360");
      setCustomMessage("We were highly impressed by your AI technical interview performance. We would like to invite you for an in-person technical interview with our Senior Engineering Leads.");
    } else if (template === "hr_assessment") {
      setEmailSubject("Invitation for HR Cultural Fit Assessment Round");
      setCustomMessage("Your interview evaluation scores meet our top applicant criteria! We are pleased to invite you for a 30-minute HR Cultural Fit discussion.");
    } else if (template === "executive") {
      setEmailSubject("Invitation for Executive Leadership Interview");
      setCustomMessage("Congratulations on ranking in the top tier of our talent pool. You are invited for a final interview round with our VP of Engineering.");
    }
  };

  return (
    <div className="space-y-8 pb-12 font-sans">
      {toast ? <FeedbackToast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} /> : null}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="eyebrow flex items-center gap-2 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#4361EE]" strokeWidth={2} />
            <span>AI Candidate Filtration &amp; Screening Engine</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">Candidates Leaderboard</h1>
          <p className="font-sans text-xs text-[#6B7280] mt-1">
            Top candidate pool ranked by composite 4D score. Review CV PDFs, export CSV data, and dispatch Onsite Interview Emails.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold shadow-xs transition"
          >
            <Download className="w-4 h-4 text-gray-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              if (selectedCandidateIds.length === 0) {
                setToast({ message: "Please select at least 1 candidate from the leaderboard using checkboxes.", tone: "info" });
                return;
              }
              setIsEmailModalOpen(true);
            }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-[#4361EE] hover:bg-[#3451d1] text-white rounded-xl text-xs font-bold shadow-md shadow-[#4361EE]/20 transition"
          >
            <Mail className="w-4 h-4" />
            <span>Send Onsite Email Invite ({selectedCandidateIds.length})</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" strokeWidth={2} />
          <input
            placeholder="Search candidates by name, email, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-xs font-sans rounded-lg border border-gray-200 text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4361EE]"
          />
        </div>
        <div className="text-xs font-mono text-gray-500">
          Showing <strong>{filteredCandidates.length}</strong> Candidate{filteredCandidates.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Candidate Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-gray-50/50">
                <TableHead className="w-12 text-center">
                  <input
                    type="checkbox"
                    checked={selectedCandidateIds.length > 0 && selectedCandidateIds.length === filteredCandidates.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-[#4361EE] focus:ring-[#4361EE]"
                  />
                </TableHead>
                <TableHead className="w-16 text-center font-mono text-xs uppercase text-[#6B7280] font-semibold py-3">Rank</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#6B7280] font-semibold py-3">Candidate Name</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#6B7280] font-semibold py-3">Technical (40%)</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#6B7280] font-semibold py-3">Problem Solving (25%)</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#6B7280] font-semibold py-3">Communication (15%)</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#6B7280] font-semibold py-3">Honesty (20%)</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#6B7280] font-semibold py-3">Overall AI Score</TableHead>
                <TableHead className="text-right font-mono text-xs uppercase text-[#6B7280] font-semibold py-3">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell colSpan={9} className="py-4">
                      <Skeleton className="h-6 w-full bg-gray-100" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-16 text-[#6B7280] text-xs font-mono">
                    No candidate applications match your search query.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCandidates.map((candidate, index) => {
                  const rank = index + 1;
                  const isSelected = selectedCandidateIds.includes(candidate.id);
                  return (
                    <TableRow key={candidate.id} className={`border-b border-gray-100 hover:bg-gray-50/80 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}>
                      <TableCell className="text-center py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectCandidate(candidate.id)}
                          className="rounded border-gray-300 text-[#4361EE] focus:ring-[#4361EE]"
                        />
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <span className="font-mono text-xs font-bold text-[#4361EE]">
                          #{rank < 10 ? `0${rank}` : rank}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <span className="font-display font-bold text-sm text-[#1F2937]">
                            {candidate.first_name} {candidate.last_name}
                          </span>
                          <span className="font-mono text-[11px] text-[#6B7280]">{candidate.email}</span>
                          {candidate.city && (
                            <span className="text-[10px] text-gray-400">{candidate.city}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 font-mono text-xs font-semibold text-[#1F2937]">
                        {candidate.technical_score}%
                      </TableCell>
                      <TableCell className="py-4 font-mono text-xs font-semibold text-[#1F2937]">
                        {candidate.problem_solving_score}%
                      </TableCell>
                      <TableCell className="py-4 font-mono text-xs font-semibold text-[#1F2937]">
                        {candidate.communication_score}%
                      </TableCell>
                      <TableCell className="py-4 font-mono text-xs font-semibold text-[#10B981]">
                        {candidate.honesty_score}%
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3 max-w-[130px]">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                candidate.overall_score >= 80
                                  ? "bg-[#10B981]"
                                  : candidate.overall_score >= 60
                                  ? "bg-[#4361EE]"
                                  : "bg-[#EF4444]"
                              }`}
                              style={{ width: `${candidate.overall_score}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-bold text-[#1F2937] w-8 text-right">
                            {candidate.overall_score}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-4 space-x-2">
                        {candidate.cv_url && (
                          <a
                            href={candidate.cv_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold inline-flex items-center space-x-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>PDF CV</span>
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Manual Onsite Interview Invitation Email Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-[#4361EE]" />
                <h3 className="text-lg font-bold text-gray-900">Send Onsite Interview Invitation</h3>
              </div>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="text-gray-400 hover:text-gray-900"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Dispatching invitation email to <strong>{selectedCandidateIds.length} selected candidate(s)</strong>.
            </p>

            <form onSubmit={handleSendInterviewEmails} className="space-y-4">
              {/* Template Preset Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Email Template Preset
                </label>
                <select
                  value={emailTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#4361EE] focus:outline-none"
                >
                  <option value="technical_onsite">Technical Onsite Interview Invite</option>
                  <option value="hr_assessment">HR Cultural Fit Assessment Round</option>
                  <option value="executive">Executive Leadership Final Round</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#4361EE] focus:outline-none"
                  required
                />
              </div>

              {/* Custom Message */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Custom HR Message
                </label>
                <textarea
                  rows={4}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-sans text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#4361EE] focus:outline-none leading-relaxed"
                  required
                />
              </div>

              {/* Venue / Link Details */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Interview Venue / Date Details
                </label>
                <input
                  type="text"
                  value={interviewVenue}
                  onChange={(e) => setInterviewVenue(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#4361EE] focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="inline-flex items-center space-x-2 px-5 py-2 bg-[#4361EE] hover:bg-[#3451d1] text-white rounded-xl text-xs font-bold shadow-md shadow-[#4361EE]/20 transition disabled:opacity-50"
                >
                  {sendingEmail ? (
                    <>
                      <Activity className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch Invitations</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CandidatesPage() {
  return (
    <Suspense fallback={
      <div className="p-12 text-center text-xs font-mono text-[#6B7280]">
        Loading candidate intelligence telemetry...
      </div>
    }>
      <CandidatesPageContent />
    </Suspense>
  );
}
