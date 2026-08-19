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
  Activity,
  ChevronRight
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

type Candidate = {
  id: string;
  application_id: string;
  job_id: string;
  job_title?: string;
  first_name: string;
  last_name: string;
  email: string;
  city?: string;
  cv_url: string;
  status: string;
  cv_match_score?: number;
  mcq_score?: number;
  interview_score?: number;
  total_score?: number;
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
  const [selectedCandidateForXai, setSelectedCandidateForXai] = useState<Candidate | null>(null);
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
        const res = await api.getLeaderboard(jobIdParam || "all");
        setCandidates(res.candidates || []);
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
      `${c.first_name} ${c.last_name} ${c.email} ${c.job_title || ''} ${c.city || ''}`
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
    if (candidates.length === 0) return;
    const targetJobId = jobIdParam || candidates[0]?.job_id || "all";

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

  const radarData = selectedCandidateForXai
    ? [
        { subject: "Technical", value: selectedCandidateForXai.technical_score || 85 },
        { subject: "Communication", value: selectedCandidateForXai.communication_score || 85 },
        { subject: "Honesty", value: selectedCandidateForXai.honesty_score || 90 },
      ]
    : [];

  return (
    <div className="space-y-8 pb-12 font-sans">
      {toast ? <FeedbackToast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} /> : null}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="eyebrow flex items-center gap-2 mb-1.5 text-[#4361EE]">
            <Sparkles className="w-3.5 h-3.5 text-[#4361EE]" strokeWidth={2} />
            <span>AI Candidate Filtration &amp; Screening Engine</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">Candidates Leaderboard</h1>
          <p className="font-sans text-xs text-[#6B7280] mt-1">
            Top candidate pool ranked by 50-mark composite score (Stage 1 CV: 10 + Stage 2 MCQs: 20 + Stage 3 Interview: 20).
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-gray-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              if (selectedCandidateIds.length === 0) {
                setToast({ message: "Please select at least 1 candidate using the checkboxes.", tone: "info" });
                return;
              }
              setIsEmailModalOpen(true);
            }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-[#4361EE] hover:bg-[#3451d1] text-white rounded-xl text-xs font-bold shadow-md shadow-[#4361EE]/20 transition cursor-pointer"
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
            placeholder="Search candidates by name, email, job position, or city..."
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
                <TableHead className="font-mono text-xs uppercase text-[#6B7280] font-semibold py-3">Target Position</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#6B7280] font-semibold py-3">Status</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#6B7280] font-semibold py-3">50-Mark Stage Breakdown</TableHead>
                <TableHead className="font-mono text-xs uppercase text-[#6B7280] font-semibold py-3">Total Composite Score</TableHead>
                <TableHead className="text-right font-mono text-xs uppercase text-[#6B7280] font-semibold py-3">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell colSpan={8} className="py-4">
                      <Skeleton className="h-6 w-full bg-gray-100" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16 text-[#6B7280] text-xs font-mono">
                    No candidate applications match your search query.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCandidates.map((candidate, index) => {
                  const rank = index + 1;
                  const isSelected = selectedCandidateIds.includes(candidate.id);
                  const cvScore = candidate.cv_match_score ?? 8;
                  const mcqScore = candidate.mcq_score ?? 2;
                  const interviewScore = candidate.interview_score ?? 16;
                  const totalScore = candidate.total_score ?? candidate.overall_score ?? (cvScore + mcqScore + interviewScore);

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
                      <TableCell className="py-4 font-medium text-xs text-[#1F2937]">
                        {candidate.job_title || "Junior AI Engineer"}
                      </TableCell>
                      <TableCell className="py-4">
                        {totalScore >= 35 ? (
                          <span className="badge-emerald">Passed</span>
                        ) : totalScore < 20 ? (
                          <span className="badge-rose">Rejected</span>
                        ) : (
                          <span className="badge-cyan">Screening</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4 font-mono text-xs">
                        <span className="text-[#4361EE] font-bold" title="Stage 1 CV Score">S1: {cvScore}/10</span> |{" "}
                        <span className="text-[#F59E0B] font-bold" title="Stage 2 MCQ Score">S2: {mcqScore}/20</span> |{" "}
                        <span className="text-[#10B981] font-bold" title="Stage 3 AI HR Interview Score">S3: {interviewScore}/20</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3 max-w-[130px]">
                          <span className="font-mono text-sm font-extrabold text-[#1F2937]">
                            {totalScore} <span className="text-[10px] text-gray-400">/ 50</span>
                          </span>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                totalScore >= 35
                                  ? "bg-[#10B981]"
                                  : totalScore >= 20
                                  ? "bg-[#4361EE]"
                                  : "bg-[#EF4444]"
                              }`}
                              style={{ width: `${Math.min(100, (totalScore / 50) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-4 space-x-2">
                        {candidate.cv_url && (
                          <a
                            href={candidate.cv_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold inline-flex items-center space-x-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>PDF CV</span>
                          </a>
                        )}
                        <button
                          onClick={() => setSelectedCandidateForXai(candidate)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#4361EE]/10 text-[#4361EE] hover:bg-[#4361EE]/20 text-xs font-semibold inline-flex items-center space-x-1 cursor-pointer"
                        >
                          <span>XAI Audit</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Candidate XAI Audit Drawer */}
      {selectedCandidateForXai && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-2xl w-full shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <span className="eyebrow text-[#4361EE]">Explainable AI Evaluation Audit</span>
                <h3 className="text-xl font-bold text-[#0F172A] mt-1">{selectedCandidateForXai.first_name} {selectedCandidateForXai.last_name}</h3>
                <div className="text-xs text-[#64748B]">{selectedCandidateForXai.email} • {selectedCandidateForXai.job_title || "Junior AI Engineer"}</div>
              </div>
              <button
                onClick={() => setSelectedCandidateForXai(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* 50-Mark Stage Score Tally */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-gray-200 grid grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-[10px] font-mono text-[#64748B] uppercase">Stage 1 CV</div>
                <div className="text-base font-bold text-[#4361EE]">{selectedCandidateForXai.cv_match_score ?? 8} / 10</div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-[#64748B] uppercase">Stage 2 MCQs</div>
                <div className="text-base font-bold text-[#F59E0B]">{selectedCandidateForXai.mcq_score ?? 2} / 20</div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-[#64748B] uppercase">Stage 3 Interview</div>
                <div className="text-base font-bold text-[#10B981]">{selectedCandidateForXai.interview_score ?? 16} / 20</div>
              </div>
              <div className="border-l border-gray-200 pl-2">
                <div className="text-[10px] font-mono text-[#4361EE] uppercase font-bold">TOTAL SCORE</div>
                <div className="text-lg font-extrabold text-[#10B981]">{selectedCandidateForXai.total_score ?? selectedCandidateForXai.overall_score} <span className="text-xs text-[#64748B]">/ 50</span></div>
              </div>
            </div>

            {/* Recharts Radar Chart */}
            <div className="bg-[#F8FAFC] rounded-xl p-4 border border-gray-200">
              <div className="text-xs font-mono font-bold text-[#0F172A] uppercase mb-2 text-center">
                Multi-Axis Evaluation Radar (Technical / Communication / Honesty)
              </div>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#CBD5E1" />
                    <PolarAngleAxis dataKey="subject" stroke="#0F172A" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94A3B8" />
                    <Radar name="Candidate" dataKey="value" stroke="#4361EE" fill="#4361EE" fillOpacity={0.35} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedCandidateIds([selectedCandidateForXai.id]);
                  setIsEmailModalOpen(true);
                  setSelectedCandidateForXai(null);
                }}
                className="btn-pill-primary text-xs py-2 px-4 cursor-pointer"
              >
                <span>Send Onsite Interview Invitation</span>
              </button>
              <button onClick={() => setSelectedCandidateForXai(null)} className="btn-pill-secondary text-xs py-2 px-5 cursor-pointer">
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

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
                className="text-gray-400 hover:text-gray-900 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Dispatching invitation email to <strong>{selectedCandidateIds.length} selected candidate(s)</strong>.
            </p>

            <form onSubmit={handleSendInterviewEmails} className="space-y-4">
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
                  className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="inline-flex items-center space-x-2 px-5 py-2 bg-[#4361EE] hover:bg-[#3451d1] text-white rounded-xl text-xs font-bold shadow-md shadow-[#4361EE]/20 transition disabled:opacity-50 cursor-pointer"
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
        Loading candidate intelligence leaderboard...
      </div>
    }>
      <CandidatesPageContent />
    </Suspense>
  );
}
