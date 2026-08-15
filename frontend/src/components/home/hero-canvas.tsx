"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Cpu, Activity, ShieldCheck, CheckCircle2, FileText, Layers } from "lucide-react";
import { ScoreRadar } from "@/components/ui/score-radar";

export function HeroCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Radial Glow Behind Mockup */}
      <div className="absolute -inset-4 bg-[rgba(96,146,240,0.22)] rounded-[20px] blur-2xl pointer-events-none" />

      {/* Product Mockup Window */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-[#0A0E16] border border-[rgba(148,163,184,0.12)] rounded-[12px] overflow-hidden shadow-2xl"
      >
        {/* Top Window Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#070B12] border-b border-[rgba(148,163,184,0.12)]">
          {/* Traffic Light Dots */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
            <span className="w-3 h-3 rounded-full bg-[#EAB308]" />
            <span className="w-3 h-3 rounded-full bg-[#22C55E]" />
          </div>

          {/* Centered Mono URL Pill */}
          <div className="px-4 py-1 rounded-full bg-[#0C121D] border border-[rgba(148,163,184,0.12)] font-mono text-[11px] text-[#9AA6B8] truncate max-w-[280px]">
            https://app.ai-recruit360.com/live-eval
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="font-mono text-[11px] text-[#7DA2F2]">LIVE</span>
          </div>
        </div>

        {/* Product Inner Mockup Body */}
        <div className="p-6 space-y-6">
          {/* Mockup Header */}
          <div className="flex items-center justify-between border-b border-[rgba(148,163,184,0.12)] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[rgba(138,180,248,0.10)] text-[#8AB4F8] flex items-center justify-center">
                <Cpu className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div>
                <h4 className="font-display text-sm font-medium text-[#F2F5F9]">Candidate Evaluation Engine</h4>
                <p className="font-mono text-[11px] text-[#66707F]">LangGraph 3-Node Connected</p>
              </div>
            </div>

            <span className="badge-success">
              Verified 92%
            </span>
          </div>

          {/* Score Radar Chart Preview */}
          <div className="py-2 flex justify-center">
            <div className="w-full max-w-[260px]">
              <ScoreRadar technical={94} communication={88} honesty={95} />
            </div>
          </div>

          {/* Score Breakdown Bars */}
          <div className="space-y-3 pt-2 border-t border-[rgba(148,163,184,0.12)]">
            <div className="space-y-1">
              <div className="flex justify-between text-[12px] font-sans">
                <span className="text-[#9AA6B8]">Technical Competence</span>
                <span className="font-mono text-[#8AB4F8] font-medium">94%</span>
              </div>
              <div className="h-1.5 w-full bg-[#0C121D] rounded-full overflow-hidden">
                <div className="h-full bg-[#8AB4F8] rounded-full" style={{ width: "94%" }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[12px] font-sans">
                <span className="text-[#9AA6B8]">Communication Structure</span>
                <span className="font-mono text-[#F2F5F9] font-medium">88%</span>
              </div>
              <div className="h-1.5 w-full bg-[#0C121D] rounded-full overflow-hidden">
                <div className="h-full bg-[#66707F] rounded-full" style={{ width: "88%" }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[12px] font-sans">
                <span className="text-[#9AA6B8]">Honesty &amp; Behavioral Integrity</span>
                <span className="font-mono text-[#22C55E] font-medium">95%</span>
              </div>
              <div className="h-1.5 w-full bg-[#0C121D] rounded-full overflow-hidden">
                <div className="h-full bg-[#22C55E] rounded-full" style={{ width: "95%" }} />
              </div>
            </div>
          </div>

          {/* XAI Evidence Quote */}
          <div className="bg-[#0C121D] p-3.5 rounded-[8px] border border-[rgba(148,163,184,0.12)] space-y-1">
            <span className="eyebrow block">XAI Evidence Quote</span>
            <p className="font-sans text-[12px] text-[#9AA6B8] italic">
              &quot;Candidate articulated deep architectural mastery of async PostgreSQL and FastAPI endpoints...&quot;
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
