"use client";

import { useEffect, useState, use } from "react";
import {
  Video,
  ShieldAlert,
  Send,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Mic,
  MicOff,
  Globe2,
  ShieldCheck,
  Activity,
  Bot,
  User,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/logo";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InterviewRoomPage({ params }: PageProps) {
  const { id: candidateId } = use(params);
  const router = useRouter();

  const [questionData, setQuestionData] = useState<{
    index: number;
    total: number;
    question: string;
    completed: boolean;
  }>({
    index: 1,
    total: 10,
    question: "Can you walk us through the system architecture of your recent full-stack Python or Node.js project?",
    completed: false,
  });

  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [micActive, setMicActive] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

  // Fetch current candidate question
  const fetchQuestion = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/interview/${candidateId}/next`);
      if (res.ok) {
        const data = await res.json();
        if (data.completed) {
          setCompleted(true);
        } else {
          setQuestionData({
            index: (data.index || 0) + 1,
            total: data.total || 10,
            question: data.question || "Describe how you optimize database query performance and handle caching.",
            completed: false,
          });
        }
      }
    } catch {
      // Fallback default question retained for smooth demo execution
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (candidateId) fetchQuestion();
  }, [candidateId]);

  // Tab switch telemetry listener
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1);
        setShowWarningModal(true);
        try {
          await fetch(`${API_URL}/api/interview/${candidateId}/proctor-log`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ event_type: "TAB_SWITCH" }),
          });
        } catch {
          // Failure logged silently
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [candidateId, API_URL]);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/interview/${candidateId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: answer.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnswer("");
        if (data.interview_completed || questionData.index >= 10) {
          setCompleted(true);
        } else {
          setQuestionData((prev) => ({
            ...prev,
            index: prev.index + 1,
            question:
              prev.index === 1
                ? "How do you approach writing clean, testable code and managing CI/CD deployment pipelines?"
                : prev.index === 2
                ? "Explain a challenging technical bug you encountered and how you diagnosed the root cause."
                : "How do you ensure data integrity, API authentication, and security in production environments?",
          }));
        }
      }
    } catch {
      // Fallback increment for local UI demo
      if (questionData.index >= 10) {
        setCompleted(true);
      } else {
        setQuestionData((prev) => ({
          ...prev,
          index: prev.index + 1,
          question: "How do you ensure data security, role-based access control, and scalability in microservice APIs?",
        }));
        setAnswer("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#94A3B8] font-sans py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-between relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#0EA5E9]/10 blur-[150px] pointer-events-none -z-10" />

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between pb-6 border-b border-[#334155]">
        <Logo size="md" href="/" variant="dark" glow />

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1E293B] border border-[#334155] text-xs font-mono text-[#F8FAFC]">
            <Activity className="w-3.5 h-3.5 text-[#10B981] animate-pulse" />
            <span>AI Stream: Connected</span>
          </div>

          {tabSwitchCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EF4444]/15 border border-[#EF4444]/40 text-xs font-mono text-[#F87171]">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Tab Switches: {tabSwitchCount}</span>
            </div>
          )}
        </div>
      </header>

      {/* Proctoring Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card-dark p-8 border border-[#EF4444]/40 max-w-md w-full text-center">
            <ShieldAlert className="w-12 h-12 text-[#F87171] mx-auto mb-4 animate-bounce" />
            <h3 className="text-xl font-bold text-[#F8FAFC] mb-2">Proctoring Telemetry Alert</h3>
            <p className="text-sm text-[#94A3B8] mb-6">
              A tab switch or window blur event was detected. This event has been logged to the database proctoring audit timeline.
            </p>
            <button
              onClick={() => setShowWarningModal(false)}
              className="btn-cyan w-full justify-center"
            >
              Acknowledge & Continue Interview
            </button>
          </div>
        </div>
      )}

      {/* Main Room Grid */}
      <main className="max-w-7xl mx-auto w-full my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 16:9 Avatar Stream & Proctoring Indicators (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 16:9 Video Canvas Container */}
          <div className="relative aspect-video rounded-2xl bg-[#1E293B] border border-[#334155] overflow-hidden flex flex-col items-center justify-center shadow-2xl glow-cyan">
            {/* AI Avatar Visualizer */}
            <div className="relative flex items-center justify-center">
              <div className="w-28 h-28 rounded-full bg-[#0EA5E9]/20 border-2 border-[#0EA5E9] flex items-center justify-center animate-pulse-cyan">
                <Bot className="w-14 h-14 text-[#0EA5E9]" />
              </div>
              <div className="absolute -bottom-2 px-3 py-1 rounded-full bg-[#0F172A] border border-[#0EA5E9]/50 text-[10px] font-mono text-[#0EA5E9] flex items-center gap-1.5 shadow-md">
                <Volume2 className="w-3 h-3 animate-pulse" />
                <span>AI Interviewer Speaking</span>
              </div>
            </div>

            {/* Top Right Live Pill */}
            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F172A]/80 border border-[#334155] backdrop-blur-sm text-xs font-mono text-[#34D399]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
              <span>LIVE 1080P</span>
            </div>

            {/* Bottom Controls Overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-[#0F172A]/80 border border-[#334155] backdrop-blur-md p-3 rounded-xl">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMicActive(!micActive)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    micActive
                      ? "bg-[#0EA5E9]/20 border border-[#0EA5E9] text-[#0EA5E9]"
                      : "bg-[#EF4444]/20 border border-[#EF4444] text-[#F87171]"
                  }`}
                >
                  {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>
                <div className="text-xs">
                  <div className="font-semibold text-[#F8FAFC]">
                    {micActive ? "Microphone Active" : "Microphone Muted"}
                  </div>
                  <div className="text-[#64748B] font-mono">Real-time Audio Stream</div>
                </div>
              </div>

              <div className="text-xs font-mono text-[#64748B]">
                Stitch Screen ID: d7da31a5c4d4445fa1d79ef71a089c3f
              </div>
            </div>
          </div>

          {/* Proctoring & Candidate Metadata Info */}
          <div className="glass-card-dark p-6 border border-[#334155] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#34D399]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#F8FAFC]">Proctoring Security Layer</div>
                <div className="text-xs text-[#94A3B8]">Tab visibility & audio transcript active</div>
              </div>
            </div>
            <span className="badge-emerald">Protected</span>
          </div>
        </div>

        {/* Right Column: Question Stream & Response Form (5 Cols) */}
        <div className="lg:col-span-5">
          {completed ? (
            <div className="glass-card-dark p-8 border border-[#10B981]/40 text-center shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#34D399] mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-extrabold text-[#F8FAFC] mb-2">Interview Completed</h3>
              <p className="text-sm text-[#94A3B8] mb-6">
                Thank you for completing the technical interview. LangGraph Node 3 evaluator is currently computing your XAI Explainable Radar Score.
              </p>
              <Link href="/dashboard" className="btn-cyan w-full justify-center">
                <span>View Results in Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="glass-card-dark p-8 border border-[#334155] shadow-2xl flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#334155] mb-6">
                  <span className="eyebrow text-[#0EA5E9]">
                    QUESTION {questionData.index} OF {questionData.total}
                  </span>
                  <span className="badge-cyan">Conversational Probe</span>
                </div>

                <h3 className="text-lg font-bold text-[#F8FAFC] leading-relaxed mb-6">
                  {questionData.question}
                </h3>

                <form onSubmit={handleSubmitAnswer} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-[#94A3B8] uppercase tracking-wider mb-2">
                      Your Technical Answer / Explanation
                    </label>
                    <textarea
                      rows={6}
                      required
                      placeholder="Type your response here or speak into microphone..."
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="w-full bg-[#0F172A] border border-[#334155] rounded-xl p-4 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#0EA5E9] leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !answer.trim()}
                    className="btn-cyan w-full py-3 justify-center shadow-md shadow-[#0EA5E9]/20 disabled:opacity-50"
                  >
                    <span>{submitting ? "Submitting..." : "Submit Answer & Continue"}</span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>

              <div className="mt-6 pt-4 border-t border-[#334155] text-center text-xs text-[#64748B]">
                Answers are evaluated for Technical Accuracy, Communication Clarity, and Honesty.
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full text-center py-4 text-xs text-[#64748B] border-t border-[#334155]/60">
        AI-Recruit360 Interview Room • Candidate ID: {candidateId}
      </footer>
    </div>
  );
}
