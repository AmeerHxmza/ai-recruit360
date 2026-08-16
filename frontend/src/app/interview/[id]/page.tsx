"use client";

import { useEffect, useState, use } from "react";
import { Video, ShieldAlert, Send, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, Mic, MicOff, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InterviewRoomPage({ params }: PageProps) {
  const { id: candidateId } = use(params);
  const router = useRouter();

  const [questionData, setQuestionData] = useState<any>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [micActive, setMicActive] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

  // Fetch current question
  const fetchQuestion = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/interview/${candidateId}/next`);
      if (!res.ok) throw new Error("Failed to fetch question");
      const data = await res.json();
      
      if (data.completed) {
        setCompleted(true);
      } else {
        setQuestionData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, [candidateId]);

  // Tab switch telemetry proctoring listener
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1);
        setShowWarning(true);
        try {
          await fetch(`${API_URL}/api/interview/${candidateId}/proctor-log`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ event_type: "TAB_SWITCH" }),
          });
        } catch (e) {
          console.error(e);
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

      const data = await res.json();
      setAnswer("");

      if (data.interview_completed) {
        setCompleted(true);
      } else {
        await fetchQuestion();
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col font-sans selection:bg-[#4361EE] selection:text-white">
      {/* Completion Dialog Modal Triggered when final question is answered */}
      <Dialog open={completed} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md bg-white text-[#1F2937] font-sans rounded-2xl shadow-2xl p-8 border border-gray-100 text-center">
          <DialogHeader className="space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#10B981] flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
              <Mail className="w-8 h-8 text-[#10B981]" strokeWidth={2} />
            </div>
            <DialogTitle className="font-display text-2xl font-bold text-[#1F2937]">Interview Submitted</DialogTitle>
            <DialogDescription className="font-sans text-sm text-[#6B7280] leading-relaxed pt-2 font-medium">
              Thank you. After the selection for the final interview, we will inform you through email.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 sm:justify-center">
            <button
              onClick={() => router.push("/")}
              className="bg-[#4361EE] hover:bg-[#3A56D4] text-white font-bold text-xs py-3 px-8 rounded-full shadow-lg shadow-blue-500/25 w-full transition-all active:scale-95"
            >
              Return to Home
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Top Header Bar */}
      <header className="border-b border-white/10 bg-[#0B0F19]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Logo size="sm" href="/" variant="dark" />
          <span className="text-gray-500">|</span>
          <span className="font-display font-bold text-sm text-gray-200">Candidate Avatar Interview</span>
        </div>
        <div className="flex items-center gap-4 font-mono text-xs">
          {tabSwitchCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldAlert className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Proctor Warning: {tabSwitchCount} tab switch(es)</span>
            </div>
          )}
          <div className="text-gray-400 hidden sm:block">
            Candidate Ref: <code className="text-[#4361EE] font-bold">{candidateId.slice(0, 8)}</code>
          </div>
        </div>
      </header>

      {/* Main Container: Focus Dark Mode */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {!completed ? (
          <>
            {/* Massive 16:9 Video Box (Simli API Avatar Frame) */}
            <div className="relative aspect-video w-full rounded-2xl bg-[#111827] border border-white/10 overflow-hidden shadow-[0_0_40px_rgba(14,165,233,0.1)] flex flex-col items-center justify-center group">
              {/* Subtle Ambient Glow Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent opacity-90" />
              
              {/* Simli AI Video Avatar Stream Preview */}
              <div className="relative z-10 text-center space-y-4 p-6">
                <div className="relative">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-[#4361EE] via-cyan-400 to-blue-500 p-1 shadow-[0_0_30px_rgba(67,97,238,0.4)]">
                    <div className="w-full h-full rounded-full bg-[#0B0F19] flex items-center justify-center text-white">
                      <Video className="w-10 h-10 text-cyan-400 animate-pulse" strokeWidth={2} />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMicActive(!micActive)}
                    className={`absolute bottom-0 right-1/3 transform translate-x-4 p-2 rounded-full text-white shadow-lg transition-all ${
                      micActive
                        ? "bg-[#4361EE] hover:bg-[#3A56D4] shadow-[0_0_20px_rgba(67,97,238,0.5)]"
                        : "bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>
                </div>

                <div className="space-y-1">
                  <h3 className="font-display text-xl font-bold text-white">Simli AI Avatar Interviewer</h3>
                  <div className="flex items-center justify-center gap-2 font-mono text-xs text-cyan-400">
                    <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>HR &amp; Project Interview Stream (English &amp; Urdu)</span>
                  </div>
                </div>

                {/* Audio Waveform Simulation */}
                <div className="flex items-center justify-center gap-1.5 pt-2">
                  <span className="w-1 h-4 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1 h-6 bg-[#4361EE] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1 h-8 bg-cyan-400 rounded-full animate-bounce" />
                  <span className="w-1 h-6 bg-[#4361EE] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1 h-4 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                </div>
              </div>

              {/* Question Overlay Subtitle Bar */}
              {questionData?.question && (
                <div className="absolute bottom-4 inset-x-4 z-20 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15 text-sm text-gray-200 shadow-2xl">
                  <div className="flex items-center justify-between font-mono text-xs uppercase text-cyan-400 mb-1 font-bold">
                    <span>Question {questionData.current_question_index + 1} of {questionData.total_questions}</span>
                    <span className="text-gray-400">HR &amp; Behavioral Assessment</span>
                  </div>
                  <p className="font-sans text-base text-white font-medium leading-relaxed">{questionData.question}</p>
                </div>
              )}
            </div>

            {/* Tab Switch Warning Overlay */}
            {showWarning && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400" strokeWidth={2} />
                <div>
                  <p className="font-display font-bold text-amber-400">Tab Switch Warning Logged</p>
                  <p className="font-sans text-xs text-gray-300 mt-0.5 leading-relaxed">
                    Switching tabs during an active interview session is recorded by behavioral proctoring telemetry and directly influences your honesty rating score.
                  </p>
                </div>
              </div>
            )}

            {/* Response Form */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6 space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <p className="font-mono text-xs text-gray-400">Fetching next HR question...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitAnswer} className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-gray-400 border-b border-white/10 pb-3">
                    <span className="font-mono uppercase font-bold text-cyan-400">Candidate Real-Time Transcription</span>
                    <span className="font-mono text-xs text-white">
                      Q {questionData?.current_question_index + 1} / {questionData?.total_questions}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-mono text-xs uppercase font-bold text-gray-300 block">
                        Type or Dictate Response:
                      </label>
                      <button
                        type="button"
                        onClick={() => setMicActive(!micActive)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4361EE] hover:bg-[#3A56D4] text-white text-xs font-mono shadow-[0_0_15px_rgba(67,97,238,0.5)] transition-all"
                      >
                        <Mic className="w-3.5 h-3.5" />
                        <span>{micActive ? "Voice Active" : "Voice Muted"}</span>
                      </button>
                    </div>

                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Type your response clearly here (English or Urdu response supported)..."
                      rows={6}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-sans text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4361EE] transition-all resize-none"
                      required
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={submitting || !answer.trim()}
                      className="bg-[#4361EE] hover:bg-[#3A56D4] text-white font-bold px-8 py-3 rounded-full text-xs shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Submit Answer &amp; Next</span>
                          <Send className="w-4 h-4" strokeWidth={2} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center space-y-4 py-16 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" strokeWidth={2} />
            </div>
            <h2 className="font-display text-2xl font-bold text-white">Interview Session Completed</h2>
            <p className="font-sans text-sm text-gray-300 leading-relaxed max-w-md font-medium">
              Thank you. After the selection for the final interview, we will inform you through email.
            </p>
            <button
              onClick={() => router.push("/")}
              className="bg-[#4361EE] hover:bg-[#3A56D4] text-white text-xs font-bold py-3 px-8 rounded-full shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all"
            >
              <span>Return to Home</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
