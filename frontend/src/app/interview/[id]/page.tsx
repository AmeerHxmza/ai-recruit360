"use client";

import { useEffect, useState, use } from "react";
import { Video, ShieldAlert, Send, CheckCircle2, AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InterviewRoomPage({ params }: PageProps) {
  const { id: candidateId } = use(params);

  const [questionData, setQuestionData] = useState<any>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

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
    <div className="min-h-screen bg-[#05070D] text-[#9AA6B8] flex flex-col font-sans selection:bg-[#8AB4F8] selection:text-[#06101F]">
      {/* Top Bar */}
      <header className="border-b border-[rgba(148,163,184,0.12)] bg-[#05070D]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-[#8AB4F8] animate-pulse shadow-sm shadow-[#8AB4F8]" />
          <span className="font-display font-medium text-base text-[#F2F5F9]">AI-Recruit360 Candidate Interview Portal</span>
        </div>
        <div className="flex items-center gap-4 font-mono text-xs">
          {tabSwitchCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(234,179,8,0.12)] text-[#EAB308] border border-[rgba(234,179,8,0.25)]">
              <ShieldAlert className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Proctor Warning: {tabSwitchCount} tab switch(es)</span>
            </div>
          )}
          <div className="text-[#66707F] hidden sm:block">
            Candidate ID: <code className="text-[#8AB4F8] font-medium">{candidateId.slice(0, 8)}</code>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: AI Video Frame */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-video rounded-[12px] bg-[#0A0E16] border border-[rgba(148,163,184,0.12)] overflow-hidden shadow-2xl flex flex-col items-center justify-center group">
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[rgba(37,99,235,0.15)] via-transparent to-transparent opacity-80" />
            
            {/* Simli AI Video Avatar Frame View */}
            <div className="relative z-10 text-center space-y-4 p-6">
              <div className="w-20 h-20 mx-auto rounded-[12px] bg-[rgba(138,180,248,0.10)] border border-[rgba(148,163,184,0.12)] flex items-center justify-center">
                <Video className="w-10 h-10 text-[#8AB4F8] animate-pulse" strokeWidth={1.75} />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-lg font-medium text-[#F2F5F9]">AI Interview Avatar</h3>
                <div className="flex items-center justify-center gap-2 font-mono text-xs text-[#7DA2F2]">
                  <Sparkles className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>Bilingual Voice &amp; Text Stream Active</span>
                </div>
              </div>

              {/* Audio Wave Visualizer Simulation */}
              <div className="flex items-center justify-center gap-1.5 pt-2">
                <span className="w-1 h-4 bg-[#8AB4F8] rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1 h-6 bg-[#8AB4F8] rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1 h-8 bg-[#8AB4F8] rounded-full animate-bounce" />
                <span className="w-1 h-6 bg-[#8AB4F8] rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1 h-4 bg-[#8AB4F8] rounded-full animate-bounce [animation-delay:-0.3s]" />
              </div>
            </div>

            {/* Subtitle / Question Display */}
            {questionData?.question && (
              <div className="absolute bottom-4 inset-x-4 z-20 bg-[#0C121D]/90 backdrop-blur-md p-4 rounded-[8px] border border-[rgba(148,163,184,0.12)] text-sm text-[#9AA6B8] shadow-xl">
                <div className="flex items-center justify-between font-mono text-xs uppercase text-[#7DA2F2] mb-1.5">
                  <span>Question {questionData.current_question_index + 1} of {questionData.total_questions}</span>
                  <span className="text-[#66707F]">Technical Screening</span>
                </div>
                <p className="font-sans text-sm text-[#F2F5F9] leading-relaxed">{questionData.question}</p>
              </div>
            )}
          </div>

          {showWarning && (
            <div className="p-4 rounded-[8px] bg-[rgba(234,179,8,0.10)] border border-[rgba(234,179,8,0.25)] text-[#EAB308] text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-[#EAB308]" strokeWidth={1.75} />
              <div>
                <p className="font-display font-medium text-[#EAB308]">Tab Switch Warning Logged</p>
                <p className="font-sans text-xs text-[#9AA6B8] mt-0.5 leading-relaxed">
                  Switching tabs during an active interview session is recorded by behavioral proctoring telemetry and directly influences your honesty rating score.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Candidate Answer Input */}
        <div className="lg:col-span-5 card-enterprise flex flex-col min-h-[420px]">
          {completed ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-8">
              <div className="w-16 h-16 rounded-full bg-[rgba(34,197,94,0.12)] text-[#22C55E] flex items-center justify-center border border-[rgba(34,197,94,0.25)]">
                <CheckCircle2 className="w-10 h-10" strokeWidth={1.75} />
              </div>
              <h2 className="font-display text-2xl font-medium text-[#F2F5F9]">Interview Session Completed!</h2>
              <p className="font-sans text-xs text-[#9AA6B8] leading-relaxed max-w-sm">
                Your answers and proctoring telemetry logs have been submitted to our Explainable AI (XAI) Scoring Engine.
              </p>
              <Link href="/">
                <button className="btn-primary text-xs">
                  <span>Return to Home</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </Link>
            </div>
          ) : loading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-2 border-[#8AB4F8] border-t-transparent rounded-full animate-spin" />
              <p className="font-mono text-xs text-[#66707F]">Fetching next interview question...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitAnswer} className="flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#9AA6B8] border-b border-[rgba(148,163,184,0.12)] pb-2">
                  <span className="eyebrow">Candidate Response Panel</span>
                  <span className="font-mono text-xs text-[#F2F5F9]">
                    Q {questionData?.current_question_index + 1} / {questionData?.total_questions}
                  </span>
                </div>
                <label className="eyebrow block">
                  Type Your Response:
                </label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your response clearly here (English or Urdu articulation supported)..."
                  rows={8}
                  className="input-enterprise w-full resize-none font-sans"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !answer.trim()}
                className="btn-primary w-full justify-center text-xs h-11"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-[#06101F] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Submit Answer &amp; Proceed</span>
                    <Send className="w-4 h-4" strokeWidth={1.75} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
