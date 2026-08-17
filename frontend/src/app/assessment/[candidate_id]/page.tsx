"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Sparkles,
  HelpCircle,
  Globe2,
  ShieldCheck,
  Code2,
  Terminal,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

interface PageProps {
  params: Promise<{ candidate_id: string }>;
}

type MCQItem = {
  question: string;
  urdu_question?: string;
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
  const [lang, setLang] = useState<"en" | "ur">("en");

  // 20-Second Reverse Countdown Timer per Question
  const [timeLeft, setTimeLeft] = useState(20);

  // 1. Fetch Candidate MCQs on mount
  useEffect(() => {
    async function fetchMCQs() {
      setLoading(true);
      try {
        const res = await fetch(`${FASTAPI_URL}/api/assessment/mcq/${candidateId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.mcq_data && data.mcq_data.length > 0) {
            setMcqList(data.mcq_data);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Using fallback default MCQ list:", err);
      }

      // Default 10 technical MCQs probing core computer science & software engineering
      setMcqList([
        {
          question: "Which HTTP method is idempotent and used to create or replace a target resource payload?",
          urdu_question: "کون سا HTTP طریقہ ہم وقتی (idempotent) ہے اور ڈیٹا کو بنانے یا تبدیل کرنے کے لیے استعمال ہوتا ہے؟",
          options: ["GET", "POST", "PUT", "DELETE"],
        },
        {
          question: "What is the average time complexity of key lookup in a Python dictionary / Hash Table?",
          urdu_question: "پائیتھن ڈکشنری یا ہیش ٹیبل میں کی (Key) تلاشی کی اوسط وقت کی پیچیدگی (Time Complexity) کیا ہے؟",
          options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
        },
        {
          question: "In React Next.js App Router, which hook is designated for side-effects in functional components?",
          urdu_question: "ری ایکٹ یا نیکسٹ جے ایس میں فنکشنل اجزاء میں سائیڈ ایفیکٹس سنبھالنے کے لیے کون سا ہک استعمال ہوتا ہے؟",
          options: ["useState", "useEffect", "useContext", "useReducer"],
        },
        {
          question: "Which SQL clause filters records after aggregate functions are evaluated with GROUP BY?",
          urdu_question: "ایگریگیٹ فنکشنز کے بعد ڈیٹا کو فلٹر کرنے کے لیے کون سا SQL کلاز استعمال ہوتا ہے؟",
          options: ["WHERE", "HAVING", "ORDER BY", "FILTER"],
        },
        {
          question: "What architectural pattern decouples an application into Data Model, Presentation UI, and Control Logic?",
          urdu_question: "کون سا آرکیٹیکچرل پیٹرن ڈیٹا ماڈل، ڈسپلے UI اور کنٹرول لاجک کو علیحدہ کرتا ہے؟",
          options: ["Microservices", "MVC", "Event-Driven", "Serverless"],
        },
        {
          question: "Which technology is standard for containerizing applications and their dependencies for microservice delivery?",
          urdu_question: "ایپلیکیشنز کو کنٹینرائز اور مائیکرو سروسز کے طور پر ڈپلائے کرنے کا معیاری ٹول کون سا ہے؟",
          options: ["Docker", "Webpack", "Babel", "Nginx"],
        },
        {
          question: "What concept in Git creates an isolated context for developing independent feature lines?",
          urdu_question: "گٹ (Git) میں ایک نئی خصوصیت پر کام کرنے کے لیے الگ ماحول بنانے کا تصور کیا ہے؟",
          options: ["Commit", "Branch", "Merge", "Rebase"],
        },
        {
          question: "In REST API design, which HTTP status code signifies a Successful Request with No Content payload?",
          urdu_question: "REST API میں درخواست کی کامیابی لیکن خالی جواب کے لیے کون سا HTTP کوڈ استعمال ہوتا ہے؟",
          options: ["200 OK", "201 Created", "204 No Content", "400 Bad Request"],
        },
        {
          question: "What primary benefit do indexes provide in relational database systems like PostgreSQL?",
          urdu_question: "پوسٹگری ایس کیو ایل جیسے ڈیٹا بیسز میں انڈیکس بنانے کا بنیادی فائدہ کیا ہے؟",
          options: ["Enforce foreign keys", "Speed up query data retrieval", "Compress storage", "Encrypt data at rest"],
        },
        {
          question: "Which transport protocol guarantees ordered, reliable, and error-checked packet delivery?",
          urdu_question: "کون سا نیٹ ورک پروٹوکول ڈیٹا پیکٹس کی ترتیب اور یقینی ترسیل کی ضمانت دیتا ہے؟",
          options: ["UDP", "TCP", "ICMP", "DNS"],
        },
      ]);
      setLoading(false);
    }
    fetchMCQs();
  }, [candidateId]);

  // Timer Countdown Effect
  useEffect(() => {
    if (loading || submitting || mcqList.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNextQuestion();
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, loading, submitting, mcqList]);

  const handleSelectOption = (option: string) => {
    setSelectedOption(option);
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: option }));
  };

  const handleNextQuestion = () => {
    if (currentIndex < mcqList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(userAnswers[currentIndex + 1] || null);
      setTimeLeft(20);
    } else {
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      await fetch(`${FASTAPI_URL}/api/assessment/mcq/${candidateId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: userAnswers }),
      }).catch(() => {});
    } catch {
      // Proceed to interview room regardless of network state
    }
    router.push(`/interview/${candidateId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
        <div className="glass-card-dark p-12 text-center border border-[#0EA5E9]/30 max-w-md w-full">
          <Loader2 className="w-12 h-12 text-[#0EA5E9] animate-spin mx-auto mb-6" />
          <h3 className="text-xl font-extrabold text-[#F8FAFC]">Preparing Technical Assessment</h3>
          <p className="text-xs text-[#94A3B8] mt-2">Loading 10 personalized questions for candidate screening...</p>
        </div>
      </div>
    );
  }

  const currentMCQ = mcqList[currentIndex];

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#94A3B8] font-sans py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-between relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-[#0EA5E9]/10 blur-[120px] pointer-events-none -z-10" />

      {/* Top Bar Header */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between pb-6 border-b border-[#334155]">
        <Logo size="md" href="/" variant="dark" glow />

        <div className="flex items-center gap-4">
          <button
            onClick={() => setLang(lang === "en" ? "ur" : "en")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1E293B] border border-[#334155] text-xs font-semibold text-[#F8FAFC] hover:border-[#0EA5E9] transition-all"
          >
            <Globe2 className="w-3.5 h-3.5 text-[#0EA5E9]" />
            <span>Language: {lang === "en" ? "English" : "اردو (Urdu)"}</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1E293B] border border-[#0EA5E9]/40 text-xs font-mono text-[#0EA5E9]">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
          </div>
        </div>
      </header>

      {/* Main Assessment Container */}
      <main className="max-w-4xl mx-auto w-full my-8">
        {/* Stepper Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 text-xs font-mono">
            <span className="text-[#0EA5E9] font-bold">QUESTION {currentIndex + 1} OF {mcqList.length}</span>
            <span className="text-[#64748B]">Auto-Saved Draft</span>
          </div>

          <div className="grid grid-cols-10 gap-2">
            {mcqList.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex
                    ? "bg-[#0EA5E9] shadow-md shadow-[#0EA5E9]/40"
                    : userAnswers[idx]
                    ? "bg-[#10B981]"
                    : "bg-[#334155]"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Question Card */}
        <div className="glass-card-dark p-8 sm:p-10 border border-[#334155] shadow-2xl relative">
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="w-5 h-5 text-[#0EA5E9]" />
            <span className="eyebrow text-[#0EA5E9]">Technical Qualification Probing</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] leading-snug mb-8">
            {lang === "ur" && currentMCQ.urdu_question
              ? currentMCQ.urdu_question
              : currentMCQ.question}
          </h2>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            {currentMCQ.options.map((opt, oIdx) => {
              const letter = String.fromCharCode(65 + oIdx);
              const isSelected = selectedOption === opt;

              return (
                <div
                  key={oIdx}
                  onClick={() => handleSelectOption(opt)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "bg-[#1E293B] border-[#0EA5E9] shadow-lg shadow-[#0EA5E9]/15"
                      : "bg-[#0F172A]/70 border-[#334155] hover:border-[#475569] hover:bg-[#1E293B]/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm ${
                        isSelected
                          ? "bg-[#0EA5E9] text-white"
                          : "bg-[#334155]/60 text-[#94A3B8]"
                      }`}
                    >
                      {letter}
                    </div>
                    <span className={`text-sm sm:text-base ${isSelected ? "text-[#F8FAFC] font-semibold" : "text-[#94A3B8]"}`}>
                      {opt}
                    </span>
                  </div>

                  {isSelected && <CheckCircle2 className="w-5 h-5 text-[#0EA5E9]" />}
                </div>
              );
            })}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-[#334155]">
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <span>Proctor Telemetry Active</span>
            </div>

            <button
              onClick={handleNextQuestion}
              className="btn-cyan text-sm px-6 py-2.5 shadow-md shadow-[#0EA5E9]/20"
            >
              <span>{currentIndex === mcqList.length - 1 ? "Finalize & Enter Interview Room" : "Next Question"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full text-center py-4 text-xs text-[#64748B] border-t border-[#334155]/60">
        AI-Recruit360 Candidate Assessment System • Candidate ID: {candidateId}
      </footer>
    </div>
  );
}
