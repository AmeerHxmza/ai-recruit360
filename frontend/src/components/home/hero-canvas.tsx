"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Mic, CheckCircle2, FileText, Sparkles, Activity, ShieldCheck, User, ArrowUpRight } from "lucide-react";
import { ScoreRadar } from "@/components/ui/score-radar";

export function HeroCanvas() {
  const [activeTab, setActiveTab] = useState<"meeting" | "notes" | "feedback">("meeting");

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* 2.5D Floating Shadow & Card Canvas */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-white border border-gray-200/80 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-2 sm:p-4"
      >
        {/* Top Floating Control Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-gray-50/80 rounded-2xl border border-gray-100 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className="font-mono text-xs text-[#6B7280] ml-2 hidden sm:inline font-medium">
              AI-Recruit360 Candidate Telemetry Engine
            </span>
          </div>

          {/* Pill Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-gray-200 shadow-sm text-xs font-sans">
            <button
              onClick={() => setActiveTab("meeting")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all ${
                activeTab === "meeting"
                  ? "bg-[#4361EE] text-white font-semibold shadow-md shadow-blue-500/25"
                  : "text-[#6B7280] hover:text-[#1F2937]"
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Smart Meeting Display</span>
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all ${
                activeTab === "notes"
                  ? "bg-[#4361EE] text-white font-semibold shadow-md shadow-blue-500/25"
                  : "text-[#6B7280] hover:text-[#1F2937]"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Auto Notes</span>
            </button>
            <button
              onClick={() => setActiveTab("feedback")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all ${
                activeTab === "feedback"
                  ? "bg-[#4361EE] text-white font-semibold shadow-md shadow-blue-500/25"
                  : "text-[#6B7280] hover:text-[#1F2937]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Feedback</span>
            </button>
          </div>
        </div>

        {/* Inner Content Area */}
        <div className="p-4 sm:p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
          <AnimatePresence mode="wait">
            {activeTab === "meeting" && (
              <motion.div
                key="meeting"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              >
                {/* Left Feed: Candidate Video Interview Frame */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50 text-[#4361EE] flex items-center justify-center font-bold font-mono text-xs border border-blue-100">
                        TT
                      </div>
                      <div>
                        <div className="font-display text-xs font-bold text-[#1F2937]">
                          Senior Frontend Engineer Assessment
                        </div>
                        <p className="font-mono text-[11px] text-[#6B7280]">Candidate: Tania Shahira • ID #8492</p>
                      </div>
                    </div>

                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-100 text-[11px] font-mono font-semibold">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      Live Stream
                    </span>
                  </div>

                  {/* Video Screen Feed Mockup */}
                  <div className="relative rounded-2xl bg-[#111827] overflow-hidden h-64 sm:h-72 flex flex-col justify-between p-4 shadow-inner">
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-mono text-white">
                        Simli AI Avatar Active
                      </span>
                      <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                        <Activity className="w-3.5 h-3.5 text-[#4361EE] animate-pulse" />
                        <span className="font-mono text-[10px] text-white">Bilingual Audio Active</span>
                      </div>
                    </div>

                    <div className="relative z-10 flex flex-col items-center justify-center space-y-2 py-4">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#4361EE] to-blue-400 p-1 shadow-xl">
                          <div className="w-full h-full rounded-full bg-[#111827] flex items-center justify-center text-white">
                            <User className="w-9 h-9 text-blue-400" />
                          </div>
                        </div>
                        <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#10B981] border-2 border-[#111827] flex items-center justify-center text-[10px]">
                          <Mic className="w-3 h-3 text-white" />
                        </span>
                      </div>
                      <span className="font-display text-sm font-bold text-white">
                        Tania Shahira
                      </span>
                    </div>

                    <div className="relative z-10 flex items-center justify-between bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 text-white">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          <span className="w-1 h-3 bg-[#4361EE] rounded-full animate-bounce" />
                          <span className="w-1 h-5 bg-[#4361EE] rounded-full animate-bounce delay-100" />
                          <span className="w-1 h-2 bg-[#4361EE] rounded-full animate-bounce delay-200" />
                        </div>
                        <span className="font-mono text-[11px] text-gray-300">04:28 / 15:00</span>
                      </div>
                      <span className="badge-emerald bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                        <ShieldCheck className="w-3.5 h-3.5" /> Proctor Integrity 99%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Panel: AI Real-Time Takeaways */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#4361EE] font-semibold">
                      <Sparkles className="w-4 h-4 text-[#4361EE]" />
                      <span>XAI Real-Time Evaluation Summary</span>
                    </div>
                    <p className="font-sans text-xs text-[#6B7280] leading-relaxed">
                      &quot;Candidate articulated deep architectural mastery of React lazy loading, state memoization, and custom hooks with zero hiring bias.&quot;
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <span className="eyebrow text-[10px] text-[#6B7280]">Evaluated Rubrics</span>
                    
                    <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="font-display text-xs font-bold text-[#1F2937]">
                          React Performance &amp; State Optimization
                        </div>
                        <p className="font-sans text-[11px] text-[#6B7280] line-clamp-2">
                          Utilized code splitting, memoization, and custom hook caching.
                        </p>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="font-display text-xs font-bold text-[#1F2937]">
                          Design Systems &amp; Tailwind CSS
                        </div>
                        <p className="font-sans text-[11px] text-[#6B7280] line-clamp-2">
                          Applied strict token hierarchies and responsive layout design.
                        </p>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "notes" && (
              <motion.div
                key="notes"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4 py-2"
              >
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <h4 className="font-display text-base font-bold text-[#1F2937] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#4361EE]" />
                    Auto-Organized Transcript Notes
                  </h4>
                  <span className="badge-emerald">Passed Knockout</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
                    <span className="eyebrow text-[10px]">Technical Competence</span>
                    <p className="font-sans text-xs text-[#6B7280] leading-relaxed">
                      Scored 94% on technical questions, demonstrating deep understanding of modern web architectures.
                    </p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
                    <span className="eyebrow text-[10px]">Communication Structure</span>
                    <p className="font-sans text-xs text-[#6B7280] leading-relaxed">
                      Articulated concepts with extreme clarity in both English and Urdu interview prompts.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "feedback" && (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.25 }}
                className="py-2 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <h4 className="font-display text-base font-bold text-[#1F2937] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#4361EE]" />
                    Multi-Axis Technical Radar Feedback
                  </h4>
                  <span className="badge-emerald font-mono font-bold">AI Score 92%</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-around gap-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="w-48">
                    <ScoreRadar technical={94} communication={88} honesty={95} />
                  </div>
                  <div className="space-y-3 font-sans text-xs flex-1">
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-[#6B7280]">Technical Accuracy</span>
                      <span className="font-mono text-[#4361EE] font-bold">94%</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-[#6B7280]">Communication Clarity</span>
                      <span className="font-mono text-[#1F2937] font-bold">88%</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-[#6B7280]">Honesty &amp; Proctor Integrity</span>
                      <span className="font-mono text-[#10B981] font-bold">95%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
