"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Brain,
  Check,
  CheckCircle2,
  ChevronRight,
  FileSearch,
  Globe2,
  Lock,
  Mic,
  ShieldCheck,
  Sparkles,
  Zap,
  HelpCircle,
  Video,
  BarChart3,
  UserCheck,
  Award,
  ArrowUpRight,
  FileText,
  Activity,
  Layers,
  Sparkle,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function EnterpriseLandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(1);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#94A3B8] font-sans selection:bg-[#0EA5E9] selection:text-white relative overflow-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#0EA5E9]/15 via-[#0EA5E9]/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[400px] right-0 w-[500px] h-[500px] bg-[#0284C7]/10 blur-[120px] pointer-events-none -z-10" />

      {/* Header Navbar */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#0F172A]/80 border-b border-[#334155]/60 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Logo size="lg" href="/" variant="dark" glow />

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#94A3B8]">
            <a href="#pipeline" className="hover:text-[#F8FAFC] transition-colors">
              Pipeline Architecture
            </a>
            <a href="#features" className="hover:text-[#F8FAFC] transition-colors">
              Enterprise Features
            </a>
            <a href="#proctoring" className="hover:text-[#F8FAFC] transition-colors">
              Proctoring & XAI
            </a>
            <a href="#metrics" className="hover:text-[#F8FAFC] transition-colors">
              Metrics
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/auth"
              className="text-sm font-semibold text-[#F8FAFC] hover:text-[#0EA5E9] transition-colors px-3 py-2"
            >
              Recruiter Sign In
            </Link>
            <Link href="/dashboard" className="btn-cyan">
              <span>Launch Platform</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#1E293B] border border-[#334155] mb-8 animate-pulse-cyan">
          <Sparkles className="w-4 h-4 text-[#0EA5E9]" />
          <span className="text-xs font-semibold text-[#F8FAFC] tracking-wide uppercase font-mono">
            AI-Recruit360 Enterprise Project ID: 13145477300436648467
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#F8FAFC] tracking-tight max-w-5xl mx-auto leading-[1.1]">
          Autonomous AI Hiring. <br />
          <span className="bg-gradient-to-r from-[#0EA5E9] via-[#38BDF8] to-[#0284C7] bg-clip-text text-transparent">
            Zero Human Bias.
          </span>{" "}
          10x Faster.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-[#94A3B8] max-w-3xl mx-auto font-normal leading-relaxed">
          The next-generation enterprise recruitment engine powered by PyMuPDF resume screening, bilingual English/Urdu conversational question generation, live proctored video interviews, and explainable XAI score cards.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard" className="btn-cyan text-base px-8 py-3.5 shadow-lg shadow-[#0EA5E9]/25">
            <span>Enter Recruiter Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/apply/demo-job" className="btn-slate text-base px-8 py-3.5">
            <span>Try Candidate Portal</span>
            <ArrowUpRight className="w-5 h-5 text-[#0EA5E9]" />
          </Link>
        </div>

        {/* Live Interactive Pipeline Preview Card */}
        <div id="pipeline" className="mt-16 glass-card-dark p-6 sm:p-10 text-left border border-[#334155]/80 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-[#334155] gap-4">
            <div>
              <div className="eyebrow text-[#0EA5E9]">Enterprise Recruitment Pipeline</div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] mt-1">
                4-Stage End-to-End Autonomous Workflow
              </h3>
            </div>
            <div className="flex items-center gap-2 bg-[#0F172A] p-1.5 rounded-lg border border-[#334155]">
              {[1, 2, 3, 4].map((step) => (
                <button
                  key={step}
                  onClick={() => setActiveStep(step)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    activeStep === step
                      ? "bg-[#0EA5E9] text-white shadow-md shadow-[#0EA5E9]/30"
                      : "text-[#94A3B8] hover:text-[#F8FAFC]"
                  }`}
                >
                  Stage {step}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
            {/* Step 1 */}
            <div
              onClick={() => setActiveStep(1)}
              className={`p-5 rounded-xl border transition-all cursor-pointer ${
                activeStep === 1
                  ? "bg-[#1E293B] border-[#0EA5E9] shadow-lg shadow-[#0EA5E9]/15"
                  : "bg-[#0F172A]/60 border-[#334155] hover:border-[#475569]"
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center justify-center text-[#0EA5E9] mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-xs font-mono text-[#0EA5E9] mb-1">STAGE 01</div>
              <h4 className="text-base font-bold text-[#F8FAFC] mb-2">Job Spec & Apply</h4>
              <p className="text-xs text-[#94A3B8]">
                Candidates upload PDF resume. PyMuPDF extracts raw text in &lt;500ms for immediate AI processing.
              </p>
            </div>

            {/* Step 2 */}
            <div
              onClick={() => setActiveStep(2)}
              className={`p-5 rounded-xl border transition-all cursor-pointer ${
                activeStep === 2
                  ? "bg-[#1E293B] border-[#0EA5E9] shadow-lg shadow-[#0EA5E9]/15"
                  : "bg-[#0F172A]/60 border-[#334155] hover:border-[#475569]"
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center justify-center text-[#0EA5E9] mb-4">
                <FileSearch className="w-5 h-5" />
              </div>
              <div className="text-xs font-mono text-[#0EA5E9] mb-1">STAGE 02</div>
              <h4 className="text-base font-bold text-[#F8FAFC] mb-2">Resume Knockout Filter</h4>
              <p className="text-xs text-[#94A3B8]">
                LangGraph Node 1 evaluates candidate credentials against job requirements. Auto-rejects unqualified matches.
              </p>
            </div>

            {/* Step 3 */}
            <div
              onClick={() => setActiveStep(3)}
              className={`p-5 rounded-xl border transition-all cursor-pointer ${
                activeStep === 3
                  ? "bg-[#1E293B] border-[#0EA5E9] shadow-lg shadow-[#0EA5E9]/15"
                  : "bg-[#0F172A]/60 border-[#334155] hover:border-[#475569]"
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center justify-center text-[#0EA5E9] mb-4">
                <Brain className="w-5 h-5" />
              </div>
              <div className="text-xs font-mono text-[#0EA5E9] mb-1">STAGE 03</div>
              <h4 className="text-base font-bold text-[#F8FAFC] mb-2">Bilingual 10 Q Generator</h4>
              <p className="text-xs text-[#94A3B8]">
                Generates 10 customized technical questions probing resume claims with English & Urdu articulation.
              </p>
            </div>

            {/* Step 4 */}
            <div
              onClick={() => setActiveStep(4)}
              className={`p-5 rounded-xl border transition-all cursor-pointer ${
                activeStep === 4
                  ? "bg-[#1E293B] border-[#0EA5E9] shadow-lg shadow-[#0EA5E9]/15"
                  : "bg-[#0F172A]/60 border-[#334155] hover:border-[#475569]"
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center justify-center text-[#0EA5E9] mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="text-xs font-mono text-[#0EA5E9] mb-1">STAGE 04</div>
              <h4 className="text-base font-bold text-[#F8FAFC] mb-2">Interview & XAI Radar</h4>
              <p className="text-xs text-[#94A3B8]">
                Proctored interview room generates instant Recharts Radar scores and XAI Claim vs Reality audit quotes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Ticker */}
      <section id="metrics" className="py-12 border-y border-[#334155]/60 bg-[#070D1B]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC]">98.4%</div>
            <div className="text-xs font-mono text-[#0EA5E9] mt-1 uppercase tracking-wider">Knockout Accuracy</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC]">10x</div>
            <div className="text-xs font-mono text-[#0EA5E9] mt-1 uppercase tracking-wider">Recruitment Velocity</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC]">100%</div>
            <div className="text-xs font-mono text-[#0EA5E9] mt-1 uppercase tracking-wider">XAI Audit Transparency</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC]">0%</div>
            <div className="text-xs font-mono text-[#0EA5E9] mt-1 uppercase tracking-wider">Unconscious Bias</div>
          </div>
        </div>
      </section>

      {/* Enterprise Feature Grid */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="eyebrow text-[#0EA5E9]">Enterprise Design & AI Core</div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#F8FAFC] mt-2 tracking-tight">
            Designed for Modern Technical Hiring Teams
          </h2>
          <p className="mt-4 text-[#94A3B8] text-base">
            Every screen built with Stitch UI precision, low latency backend integrations, and airtight proctoring telemetries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass-card-dark p-8 border border-[#334155]">
            <div className="w-12 h-12 rounded-xl bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center justify-center text-[#0EA5E9] mb-6">
              <FileSearch className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#F8FAFC] mb-3">FastAPI + PyMuPDF Extraction</h3>
            <p className="text-sm text-[#94A3B8]">
              High-speed parsing extracts structured skills, projects, and work history directly from raw PDF resume uploads.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card-dark p-8 border border-[#334155]">
            <div className="w-12 h-12 rounded-xl bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center justify-center text-[#0EA5E9] mb-6">
              <Globe2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#F8FAFC] mb-3">Bilingual English & Urdu Qs</h3>
            <p className="text-sm text-[#94A3B8]">
              Dynamic 10-question generator crafts context-aware questions tailored to candidate project experience in Urdu and English.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card-dark p-8 border border-[#334155]">
            <div className="w-12 h-12 rounded-xl bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center justify-center text-[#0EA5E9] mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#F8FAFC] mb-3">Proctoring & Anti-Cheat</h3>
            <p className="text-sm text-[#94A3B8]">
              Real-time tab switch and visibility tracking logs events automatically into PostgreSQL database timeline for integrity audits.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-card-dark p-8 border border-[#334155]">
            <div className="w-12 h-12 rounded-xl bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center justify-center text-[#0EA5E9] mb-6">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#F8FAFC] mb-3">Recharts XAI Radar Radar</h3>
            <p className="text-sm text-[#94A3B8]">
              Multi-dimensional evaluation measuring Technical Mastery, Communication Clarity, and Honesty Integrity on a radar scale.
            </p>
          </div>

          {/* Card 5 */}
          <div className="glass-card-dark p-8 border border-[#334155]">
            <div className="w-12 h-12 rounded-xl bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center justify-center text-[#0EA5E9] mb-6">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#F8FAFC] mb-3">Claim vs. Reality Audit</h3>
            <p className="text-sm text-[#94A3B8]">
              XAI explainable quotes line up resume claims directly against interview transcript responses for zero-doubt verification.
            </p>
          </div>

          {/* Card 6 */}
          <div className="glass-card-dark p-8 border border-[#334155]">
            <div className="w-12 h-12 rounded-xl bg-[#0EA5E9]/10 border border-[#0EA5E9]/30 flex items-center justify-center text-[#0EA5E9] mb-6">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#F8FAFC] mb-3">Leaderboard & Drilldown</h3>
            <p className="text-sm text-[#94A3B8]">
              Instant candidate sorting by overall AI score, equipped with candidate review drawer sheets and interview transcripts.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card-dark p-12 text-center border border-[#0EA5E9]/30 bg-gradient-to-b from-[#1E293B] to-[#0F172A] relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#0EA5E9]/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
            Ready to Automate Your Hiring Pipeline?
          </h2>
          <p className="mt-4 text-[#94A3B8] max-w-2xl mx-auto text-base">
            Access the Recruiter Command Center or test candidate application portals in real-time.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/dashboard" className="btn-cyan text-base px-8 py-3.5">
              Enter Recruiter Portal
            </Link>
            <Link href="/apply/demo-job" className="btn-slate text-base px-8 py-3.5">
              Apply to Position
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#334155]/60 py-8 bg-[#070D1B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <Logo size="sm" variant="dark" />
          <div>© 2026 AI-Recruit360 Enterprise. Stitch Project ID: 13145477300436648467</div>
        </div>
      </footer>
    </div>
  );
}
