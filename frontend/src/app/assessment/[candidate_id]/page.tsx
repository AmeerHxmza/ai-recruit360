"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, AlertTriangle, ArrowRight, Loader2, Sparkles, HelpCircle } from "lucide-react";
import { Logo } from "@/components/ui/logo";

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

interface PageProps {
  params: Promise<{ candidate_id: string }>;
}

type MCQItem = {
  question: string;
  options: string[];
  correct_answer?: string;
};

export default function MCQAssessmentPage({ params }: PageProps) {
  const { candidate_id: candidateId } = use(params);
  const router = useRouter();

  const [mcqList, setMcqList] = useState<MCQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // 15-Second Reverse Countdown Timer
  const [timeLeft, setTimeLeft] = useState(15);
  const [isLocked, setIsLocked] = useState(false);

  // 1. Fetch Candidate MCQs on mount
  useEffect(() => {
    async function fetchMCQs() {
      setLoading(true);
      try {
        const res = await fetch(`${FASTAPI_URL}/api/assessment/mcq/${candidateId}`);
        if (!res.ok) throw new Error("Failed to load technical MCQs.");
        const data = await res.json();

        if (data.mcq_data && data.mcq_data.length > 0) {
          setMcqList(data.mcq_data);
        } else {
          // Default 10 technical MCQs fallback
          setMcqList([
            {
              question: "Which HTTP method is idempotent and used to create or replace a resource?",
              options: ["GET", "POST", "PUT", "DELETE"]
            },
            {
              question: "What is the time complexity of looking up a key in a Python dictionary / Hash Table on average?",
              options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"]
            },
            {
              question: "In React, which hook is used for performing side effects in functional components?",
              options: ["useState", "useEffect", "useContext", "useReducer"]
            },
            {
              question: "Which SQL clause is used to filter records after aggregation with GROUP BY?",
              options: ["WHERE", "HAVING", "ORDER BY", "FILTER"]
            },
            {
              question: "What architectural pattern separates an application into Data Model, Presentation UI, and Control Logic?",
              options: ["Microservices", "MVC", "Event-Driven", "Serverless"]
            },
            {
              question: "Which tool is commonly used for containerizing applications for deployment?",
              options: ["Docker", "Webpack", "Babel", "Nginx"]
            },
            {
              question: "What concept in Git creates an isolated environment for developing a new feature?",
              options: ["Commit", "Branch", "Merge", "Rebase"]
            },
            {
              question: "In REST APIs, which status code indicates a Successful Request with No Content in response body?",
              options: ["200 OK", "201 Created", "204 No Content", "400 Bad Request"]
            },
            {
              question: "What is the purpose of indexes in relational databases like PostgreSQL?",
              options: ["Enforce foreign keys", "Speed up query data retrieval", "Compress database storage", "Encrypt data at rest"]
            },
            {
              question: "Which protocol guarantees ordered and reliable delivery of network packets?",
              options: ["UDP", "TCP", "ICMP", "DNS"]
            }
          ]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load MCQ assessment.");
      } finally {
        setLoading(false);
      }
    }
    fetchMCQs();
  }, [candidateId]);

  // 2. Strict 15-second timer per question with clean interval disposal
  useEffect(() => {
    if (loading || submitting || mcqList.length === 0 || currentIndex >= mcqList.length) return;

    // Reset timer to 15s for current question
    setTimeLeft(15);
    setIsLocked(false);
    setSelectedOption(null);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsLocked(true);
          // Automatically advance to next question on 0s timeout
          setTimeout(() => {
            handleAdvanceQuestion(null);
          }, 300);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, loading, submitting, mcqList.length]);

  const handleAdvanceQuestion = (chosen: string | null) => {
    const finalAnswer = chosen || selectedOption || "";
    const updatedAnswers = { ...userAnswers, [currentIndex]: finalAnswer };
    setUserAnswers(updatedAnswers);

    if (currentIndex + 1 < mcqList.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Finished 10th MCQ -> Submit assessment to backend
      submitAssessment(updatedAnswers);
    }
  };

  const submitAssessment = async (finalAnswers: Record<number, string>) => {
    setSubmitting(true);
    try {
      const res = await fetch(`${FASTAPI_URL}/api/assessment/mcq`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id: candidateId,
          answers: finalAnswers
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit MCQ assessment.");
      }

      // Route candidate to Avatar Interview Room
      router.push(`/interview/${candidateId}`);
    } catch (err: any) {
      console.error("MCQ submit error:", err);
      // Fallback route to interview room regardless of network glitch
      router.push(`/interview/${candidateId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#4361EE]/20 border border-[#4361EE]/30 flex items-center justify-center text-[#4361EE]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <h3 className="font-display text-xl font-bold">Initializing 10 Technical MCQs</h3>
        <p className="font-mono text-xs text-gray-400">Loading CV language &amp; stack assessment questions...</p>
      </div>
    );
  }

  if (error || mcqList.length === 0) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="font-display text-xl font-bold">Assessment Failed to Load</h3>
        <p className="font-sans text-xs text-gray-400 max-w-md">{error || "No MCQs available."}</p>
        <button
          onClick={() => router.push(`/interview/${candidateId}`)}
          className="bg-[#4361EE] hover:bg-[#3A56D4] text-white text-xs font-bold py-2.5 px-6 rounded-full"
        >
          Proceed to Avatar Interview
        </button>
      </div>
    );
  }

  const currentQ = mcqList[currentIndex];
  const isTimeCritical = timeLeft <= 5;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col font-sans selection:bg-[#4361EE] selection:text-white">
      {/* Header Bar */}
      <header className="border-b border-white/10 bg-[#0B0F19]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Logo size="sm" href="/" variant="dark" />
          <span className="text-gray-500">|</span>
          <span className="font-display font-bold text-sm text-gray-200">Technical MCQ Assessment</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="font-mono text-xs text-gray-400">
            Question <span className="text-cyan-400 font-bold">{currentIndex + 1}</span> of <span className="text-white font-bold">{mcqList.length}</span>
          </div>
        </div>
      </header>

      {/* Main MCQ Room */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center space-y-6">
        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono text-gray-400">
            <span>Assessment Progress</span>
            <span>{Math.round(((currentIndex + 1) / mcqList.length) * 100)}%</span>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#4361EE] to-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / mcqList.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card Container */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          {/* Prominent 15-Second Reverse Timer Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-cyan-400" strokeWidth={2} />
              <span className="font-mono text-xs uppercase font-bold text-gray-300">Technical Question {currentIndex + 1}</span>
            </div>

            {/* Timer Display (Turns RED when < 5 seconds) */}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-sm font-bold border transition-all duration-300 ${
                isTimeCritical
                  ? "bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse"
                  : "bg-[#4361EE]/20 text-cyan-400 border-[#4361EE]/30"
              }`}
            >
              <Clock className={`w-4 h-4 ${isTimeCritical ? "text-red-400 animate-spin" : "text-cyan-400"}`} strokeWidth={2} />
              <span>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}s</span>
            </div>
          </div>

          {/* Question Text */}
          <h2 className="font-display text-lg sm:text-xl font-bold text-white leading-relaxed">
            {currentQ.question}
          </h2>

          {/* 4 Options Grid */}
          <div className="space-y-3 pt-2">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOption === option;
              return (
                <button
                  key={idx}
                  disabled={isLocked || submitting}
                  onClick={() => setSelectedOption(option)}
                  className={`w-full text-left p-4 rounded-xl border text-sm font-sans flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#4361EE]/30 border-[#4361EE] text-white font-semibold shadow-[0_0_15px_rgba(67,97,238,0.3)]"
                      : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                      isSelected ? "bg-[#4361EE] text-white" : "bg-white/10 text-gray-400"
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" strokeWidth={2} />}
                </button>
              );
            })}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <span className="font-mono text-xs text-gray-400">
              {isLocked ? "Time Expired — Advancing..." : "Select answer and confirm"}
            </span>

            <button
              onClick={() => handleAdvanceQuestion(selectedOption)}
              disabled={submitting || isLocked}
              className="bg-[#4361EE] hover:bg-[#3A56D4] text-white font-bold px-6 py-2.5 rounded-full text-xs shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{currentIndex + 1 === mcqList.length ? "Finish MCQs & Continue" : "Confirm Answer"}</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
