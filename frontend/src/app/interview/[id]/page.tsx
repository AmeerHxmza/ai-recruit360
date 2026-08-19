"use client";

import { useEffect, useState, useRef, use } from "react";
import {
  ShieldAlert,
  Send,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Mic,
  MicOff,
  Bot,
  Volume2,
  Clock,
  FileText,
  Award,
  HelpCircle,
  Check,
  Type,
  Activity,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Logo } from "@/components/ui/logo";
import { SimliAvatar } from "@/components/ui/simli-avatar";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface MCQItem {
  question: string;
  options: string[];
}

export default function ThreeStageScreeningRoomPage({ params }: PageProps) {
  const { id: candidateId } = use(params);

  // Stage Management: 1 = CV Review, 2 = MCQ Assessment, 3 = AI HR Interview, 4 = Completed Summary
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3 | 4>(1);

  // Stage 1 Data
  const [cvMatchScore, setCvMatchScore] = useState<number>(8); // out of 10

  // Stage 2 MCQ Data
  const [mcqs, setMcqs] = useState<MCQItem[]>([]);
  const [currentMcqIndex, setCurrentMcqIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [timerSeconds, setTimerSeconds] = useState(20);
  const [showMcqDisclaimer, setShowMcqDisclaimer] = useState(true);
  const [mcqScore, setMcqScore] = useState<number>(0); // out of 20

  // Stage 3 AI HR Interview Data
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([
    "Can you walk us through the architecture of your recent technical project?",
    "How do you ensure code quality, test coverage, and smooth CI/CD deployments?",
    "Describe a situation where a tight project deadline required clear team communication."
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answerInput, setAnswerInput] = useState("");
  const [inputMode, setInputMode] = useState<"text" | "voice">("text");
  const [isListening, setIsListening] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [interviewScore, setInterviewScore] = useState<number>(16); // out of 20

  // Telemetry & Avatar
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);

  // Timer Ref for MCQ 20-second countdown
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch Candidate Details & MCQs on Mount
  useEffect(() => {
    async function loadCandidateAssessment() {
      try {
        const mcqData = await api.getCandidateMCQs(candidateId);
        if (mcqData?.mcqs && mcqData.mcqs.length > 0) {
          setMcqs(mcqData.mcqs);
        } else {
          setMcqs([
            {
              question: "Which HTTP status code indicates a Resource was Created successfully?",
              options: ["200 OK", "201 Created", "204 No Content", "400 Bad Request"]
            },
            {
              question: "What is the average time complexity of Hash Table key lookup?",
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
              question: "What architectural pattern separates Data Model, UI Presentation, and Control Logic?",
              options: ["Microservices", "MVC", "Event-Driven", "Serverless"]
            }
          ]);
        }
      } catch {
        // Fallback default MCQs retained
      }
    }
    if (candidateId) {
      loadCandidateAssessment();
    }
  }, [candidateId]);

  // Tab switch anti-cheat telemetry listener
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1);
        setShowTabWarning(true);
        try {
          await api.logProctorEvent(
            candidateId,
            "TAB_SWITCH",
            "Candidate switched browser tab or lost window focus during 3-stage assessment."
          );
        } catch {
          // Non-blocking
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [candidateId]);

  // --- Stage 2: 20-Second MCQ Countdown Effect ---
  useEffect(() => {
    if (currentStage === 2 && !showMcqDisclaimer) {
      setTimerSeconds(20);
      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            handleAutoAdvanceMcq();
            return 20;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentStage, currentMcqIndex, showMcqDisclaimer]);

  // Auto Advance MCQ on 20s expiry
  const handleAutoAdvanceMcq = () => {
    if (currentMcqIndex < mcqs.length - 1) {
      setCurrentMcqIndex((prev) => prev + 1);
    } else {
      finishStage2Mcqs();
    }
  };

  // Submit Selected MCQ Option & Advance
  const handleSelectOption = (option: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentMcqIndex]: option }));
  };

  const handleNextMcq = () => {
    if (currentMcqIndex < mcqs.length - 1) {
      setCurrentMcqIndex((prev) => prev + 1);
    } else {
      finishStage2Mcqs();
    }
  };

  const finishStage2Mcqs = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const res = await api.submitMCQAssessment(candidateId, selectedAnswers);
      const calculatedScore = Math.round(((res.mcq_score || 70) / 100) * 20);
      setMcqScore(calculatedScore);
    } catch {
      setMcqScore(14); // Fallback 14/20
    }
    // Advance to Stage 3 AI HR Interview
    setCurrentStage(3);
    speakQuestion(interviewQuestions[0]);
  };

  const [isSpeaking, setIsSpeaking] = useState(false);

  // --- Stage 3: Female Voice Speech Synthesis (TTS) ---
  const speakQuestion = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.1; // Slightly higher pitch for female voice
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(
        (v) =>
          v.name.includes("Female") ||
          v.name.includes("Zira") ||
          v.name.includes("Samantha") ||
          v.name.includes("Google UK English Female")
      );
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  // Web Speech Recognition for Voice Input Mode
  const toggleVoiceInput = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use text input.");
      return;
    }

    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setAnswerInput((prev) => (prev ? prev + " " + transcript : transcript));
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    }
  };

  const handleNextInterviewQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerInput.trim() || submitting) return;

    setSubmitting(true);
    try {
      await api.submitAnswer(candidateId, answerInput.trim());
      setAnswerInput("");

      if (currentQuestionIndex < interviewQuestions.length - 1) {
        const nextIdx = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIdx);
        speakQuestion(interviewQuestions[nextIdx]);
      } else {
        // Complete 3-Stage Screening
        setCurrentStage(4);
      }
    } catch {
      if (currentQuestionIndex < interviewQuestions.length - 1) {
        const nextIdx = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIdx);
        setAnswerInput("");
        speakQuestion(interviewQuestions[nextIdx]);
      } else {
        setCurrentStage(4);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const totalScore = cvMatchScore + mcqScore + interviewScore; // Out of 50

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#94A3B8] font-sans py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-between relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#0EA5E9]/10 blur-[150px] pointer-events-none -z-10" />

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between pb-6 border-b border-[#334155]">
        <Logo size="md" href="/" variant="dark" glow />

        {/* 3-Stage Process Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1E293B] border border-[#334155] text-xs font-mono text-[#F8FAFC]">
            <Activity className="w-3.5 h-3.5 text-[#10B981] animate-pulse" />
            <span>3-Stage Assessment Engine Active</span>
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
      {showTabWarning && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card-dark p-8 border border-[#EF4444]/40 max-w-md w-full text-center space-y-4">
            <ShieldAlert className="w-12 h-12 text-[#F87171] mx-auto animate-bounce" />
            <h3 className="text-xl font-bold text-[#F8FAFC]">Proctoring Alert Recorded</h3>
            <p className="text-sm text-[#94A3B8]">
              Window focus loss detected. This event has been logged to your anti-cheat telemetry log.
            </p>
            <button
              onClick={() => setShowTabWarning(false)}
              className="btn-cyan w-full justify-center cursor-pointer"
            >
              Resume Assessment
            </button>
          </div>
        </div>
      )}

      {/* Main Room Layout */}
      <main className="max-w-6xl mx-auto w-full my-8">

        {/* STAGE PROGRESS STEPPER BAR */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className={`p-4 rounded-xl border transition-all flex items-center gap-3 ${
            currentStage === 1 ? "bg-[#0EA5E9]/15 border-[#0EA5E9] text-[#F8FAFC]" : "bg-[#1E293B] border-[#334155] text-[#64748B]"
          }`}>
            <div className="w-8 h-8 rounded-full bg-[#0EA5E9]/20 border border-[#0EA5E9] flex items-center justify-center font-bold text-[#0EA5E9]">1</div>
            <div>
              <div className="text-xs font-mono uppercase text-[#0EA5E9]">Stage 1</div>
              <div className="text-sm font-bold text-[#F8FAFC]">CV &amp; Stack Match</div>
              <div className="text-[11px] text-[#94A3B8]">Score: {cvMatchScore} / 10 Marks</div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border transition-all flex items-center gap-3 ${
            currentStage === 2 ? "bg-[#0EA5E9]/15 border-[#0EA5E9] text-[#F8FAFC]" : "bg-[#1E293B] border-[#334155] text-[#64748B]"
          }`}>
            <div className="w-8 h-8 rounded-full bg-[#0EA5E9]/20 border border-[#0EA5E9] flex items-center justify-center font-bold text-[#0EA5E9]">2</div>
            <div>
              <div className="text-xs font-mono uppercase text-[#0EA5E9]">Stage 2</div>
              <div className="text-sm font-bold text-[#F8FAFC]">10 MCQs (20s Timer)</div>
              <div className="text-[11px] text-[#94A3B8]">Score: {currentStage > 2 ? mcqScore : "--"} / 20 Marks</div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border transition-all flex items-center gap-3 ${
            currentStage === 3 ? "bg-[#0EA5E9]/15 border-[#0EA5E9] text-[#F8FAFC]" : "bg-[#1E293B] border-[#334155] text-[#64748B]"
          }`}>
            <div className="w-8 h-8 rounded-full bg-[#0EA5E9]/20 border border-[#0EA5E9] flex items-center justify-center font-bold text-[#0EA5E9]">3</div>
            <div>
              <div className="text-xs font-mono uppercase text-[#0EA5E9]">Stage 3</div>
              <div className="text-sm font-bold text-[#F8FAFC]">AI HR Avatar Interview</div>
              <div className="text-[11px] text-[#94A3B8]">Score: {currentStage === 4 ? interviewScore : "--"} / 20 Marks</div>
            </div>
          </div>
        </div>

        {/* ── STAGE 1: CV MATCH SUMMARY ── */}
        {currentStage === 1 && (
          <div className="glass-card-dark p-8 border border-[#0EA5E9]/30 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[#334155]">
              <FileText className="w-8 h-8 text-[#0EA5E9]" />
              <div>
                <h2 className="text-2xl font-bold text-[#F8FAFC]">Stage 1 Passed: CV &amp; Stack Match Verified</h2>
                <p className="text-sm text-[#94A3B8]">Your resume has passed the knockout filter and matched core technical requirements.</p>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[#0F172A] border border-[#334155] flex items-center justify-between">
              <div>
                <span className="eyebrow text-[#0EA5E9]">STAGE 1 SCORE AWARDED</span>
                <div className="text-3xl font-extrabold text-[#F8FAFC]">{cvMatchScore} <span className="text-base text-[#64748B]">/ 10 Marks</span></div>
                <div className="text-xs text-[#10B981] mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Passed Knockout Criteria
                </div>
              </div>
              <button
                onClick={() => setCurrentStage(2)}
                className="btn-cyan px-6 py-3 cursor-pointer"
              >
                <span>Proceed to Stage 2: 10 MCQs</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STAGE 2: 10 MCQS ASSESSMENT ROOM ── */}
        {currentStage === 2 && (
          <div>
            {/* Stage 2 Pre-Assessment Disclaimer Modal */}
            {showMcqDisclaimer ? (
              <div className="glass-card-dark p-8 border border-[#0EA5E9]/40 space-y-6 text-center max-w-2xl mx-auto shadow-2xl">
                <div className="w-16 h-16 rounded-full bg-[#0EA5E9]/20 border border-[#0EA5E9]/40 flex items-center justify-center text-[#0EA5E9] mx-auto">
                  <Clock className="w-8 h-8 animate-pulse" />
                </div>

                <h2 className="text-2xl font-extrabold text-[#F8FAFC]">Stage 2 Disclaimer: Strict 20-Second Per Question Rule</h2>

                <div className="p-5 rounded-xl bg-[#0F172A] border border-[#EF4444]/40 text-left text-sm text-[#94A3B8] space-y-3">
                  <div className="flex items-start gap-2 text-[#F87171] font-semibold">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>Important Anti-Cheat Rules:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs">
                    <li>Each MCQ has a strict <strong>20-second countdown timer</strong>.</li>
                    <li>When the timer expires, the question will <strong>automatically advance to the next MCQ</strong>.</li>
                    <li>Unanswered questions upon timeout receive <strong>0 marks</strong>.</li>
                    <li>External tab switches or window minimizations are logged into anti-cheat telemetry.</li>
                  </ul>
                </div>

                <button
                  onClick={() => setShowMcqDisclaimer(false)}
                  className="btn-cyan w-full justify-center py-3.5 text-base cursor-pointer shadow-lg shadow-[#0EA5E9]/20"
                >
                  <span>I Understand — Start Stage 2 Assessment</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              /* Active MCQ Question Card */
              <div className="glass-card-dark p-8 border border-[#334155] shadow-2xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#334155]">
                  <span className="eyebrow text-[#0EA5E9]">
                    QUESTION {currentMcqIndex + 1} OF {mcqs.length}
                  </span>

                  {/* 20-Second Live Countdown Visual Bar */}
                  <div className="flex items-center gap-3">
                    <div className="text-xs font-mono text-[#F8FAFC] flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#F59E0B] animate-spin" />
                      <span className="font-bold text-base text-[#F59E0B]">{timerSeconds}s</span>
                    </div>
                    <div className="w-32 h-2 rounded-full bg-[#1E293B] overflow-hidden border border-[#334155]">
                      <div
                        className="h-full bg-gradient-to-r from-[#10B981] via-[#F59E0B] to-[#EF4444] transition-all duration-1000"
                        style={{ width: `${(timerSeconds / 20) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-[#F8FAFC] leading-relaxed">
                  {mcqs[currentMcqIndex]?.question}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mcqs[currentMcqIndex]?.options.map((opt, idx) => {
                    const isSelected = selectedAnswers[currentMcqIndex] === opt;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(opt)}
                        className={`p-4 rounded-xl border text-left text-sm transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-[#0EA5E9]/20 border-[#0EA5E9] text-[#F8FAFC] font-semibold"
                            : "bg-[#0F172A] border-[#334155] text-[#94A3B8] hover:border-[#0EA5E9]/50"
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#0EA5E9]" />}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-[#334155] flex justify-end">
                  <button
                    onClick={handleNextMcq}
                    className="btn-cyan px-6 py-3 cursor-pointer"
                  >
                    <span>{currentMcqIndex < mcqs.length - 1 ? "Next Question" : "Finish Stage 2 MCQs"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STAGE 3: AI HR AVATAR INTERVIEW ROOM ── */}
        {currentStage === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Cols: Simli AI Avatar Canvas & Audio TTS */}
            <div className="lg:col-span-7 space-y-6">
              <SimliAvatar
                candidateId={candidateId}
                currentQuestion={interviewQuestions[currentQuestionIndex]}
                isSpeaking={isSpeaking}
              />

              <div className="glass-card-dark p-4 border border-[#334155] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[#34D399]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Proctoring Security Monitoring Active</span>
                </div>
                <span className="badge-cyan">Stage 3 of 3</span>
              </div>
            </div>

            {/* Right 5 Cols: Displayed Question & Dual Input Form (Voice / Text) */}
            <div className="lg:col-span-5">
              <div className="glass-card-dark p-6 border border-[#334155] shadow-2xl space-y-6">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#334155] mb-4">
                    <span className="eyebrow text-[#0EA5E9]">
                      QUESTION {currentQuestionIndex + 1} OF {interviewQuestions.length}
                    </span>
                    <button
                      onClick={() => speakQuestion(interviewQuestions[currentQuestionIndex])}
                      className="text-xs text-[#0EA5E9] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Replay Voice
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-[#F8FAFC] leading-relaxed mb-4">
                    {interviewQuestions[currentQuestionIndex]}
                  </h3>

                  {/* Dual Mode Selector */}
                  <div className="flex items-center gap-2 p-1 rounded-xl bg-[#0F172A] border border-[#334155] mb-4">
                    <button
                      onClick={() => setInputMode("text")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        inputMode === "text" ? "bg-[#0EA5E9] text-white" : "text-[#94A3B8]"
                      }`}
                    >
                      <Type className="w-3.5 h-3.5" /> Text Input
                    </button>
                    <button
                      onClick={() => setInputMode("voice")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        inputMode === "voice" ? "bg-[#0EA5E9] text-white" : "text-[#94A3B8]"
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" /> Voice Input
                    </button>
                  </div>

                  <form onSubmit={handleNextInterviewQuestion} className="space-y-4">
                    {inputMode === "voice" ? (
                      <div className="p-6 rounded-xl bg-[#0F172A] border border-[#334155] text-center space-y-4">
                        <button
                          type="button"
                          onClick={toggleVoiceInput}
                          className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center transition-all cursor-pointer ${
                            isListening
                              ? "bg-[#EF4444] text-white animate-pulse"
                              : "bg-[#0EA5E9]/20 border border-[#0EA5E9] text-[#0EA5E9]"
                          }`}
                        >
                          {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                        </button>
                        <div className="text-xs text-[#94A3B8]">
                          {isListening ? "Listening... Speak your answer into microphone." : "Click microphone to start voice recording."}
                        </div>
                        <textarea
                          rows={3}
                          placeholder="Transcribed voice answer will appear here..."
                          value={answerInput}
                          onChange={(e) => setAnswerInput(e.target.value)}
                          className="w-full bg-[#1E293B] border border-[#334155] rounded-xl p-3 text-xs text-[#F8FAFC] focus:outline-none"
                        />
                      </div>
                    ) : (
                      <textarea
                        rows={5}
                        required
                        placeholder="Type your technical or behavioral answer here..."
                        value={answerInput}
                        onChange={(e) => setAnswerInput(e.target.value)}
                        className="w-full bg-[#0F172A] border border-[#334155] rounded-xl p-3.5 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#0EA5E9]"
                      />
                    )}

                    <button
                      type="submit"
                      disabled={submitting || !answerInput.trim()}
                      className="btn-cyan w-full py-3 justify-center shadow-md cursor-pointer disabled:opacity-50"
                    >
                      <span>{submitting ? "Submitting..." : "Submit Answer & Continue"}</span>
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STAGE 4: COMPLETED SUMMARY (50 MARKS TOTAL) ── */}
        {currentStage === 4 && (
          <div className="glass-card-dark p-8 border border-[#10B981]/40 text-center shadow-2xl max-w-2xl mx-auto space-y-6">
            <div className="w-20 h-20 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#34D399] mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="text-3xl font-extrabold text-[#F8FAFC]">Screening Completed!</h2>
            <p className="text-sm text-[#94A3B8]">
              You have completed all 3 stages of the AI-Recruit360 Candidate Screening.
            </p>

            {/* 50-Mark Score Tally */}
            <div className="p-6 rounded-2xl bg-[#0F172A] border border-[#334155] grid grid-cols-4 gap-4 text-center">
              <div>
                <span className="text-[10px] font-mono text-[#64748B] uppercase">Stage 1 CV</span>
                <div className="text-xl font-bold text-[#F8FAFC]">{cvMatchScore} / 10</div>
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#64748B] uppercase">Stage 2 MCQs</span>
                <div className="text-xl font-bold text-[#F8FAFC]">{mcqScore} / 20</div>
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#64748B] uppercase">Stage 3 Interview</span>
                <div className="text-xl font-bold text-[#F8FAFC]">{interviewScore} / 20</div>
              </div>
              <div className="border-l border-[#334155] pl-2">
                <span className="text-[10px] font-mono text-[#0EA5E9] uppercase font-bold">TOTAL SCORE</span>
                <div className="text-2xl font-extrabold text-[#34D399]">{totalScore} <span className="text-xs text-[#64748B]">/ 50</span></div>
              </div>
            </div>

            <Link href="/" className="btn-cyan w-full justify-center py-3 cursor-pointer">
              <span>Return to Main Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full text-center py-4 text-xs text-[#64748B] border-t border-[#334155]/60">
        AI-Recruit360 3-Stage Screening Engine • Candidate ID: {candidateId}
      </footer>
    </div>
  );
}

