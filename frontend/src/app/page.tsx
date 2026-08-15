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
  Cpu,
  FileSearch,
  Globe2,
  Lock,
  Mic,
  ShieldCheck,
  Sparkles,
  Zap,
  HelpCircle
} from "lucide-react";
import { HeroCanvas } from "@/components/home/hero-canvas";

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">("annual");
  const [activeTab, setActiveTab] = useState<"screening" | "interview" | "xai">("screening");
  const [activeNav, setActiveNav] = useState<"home" | "how-it-works" | "platform-tour" | "pricing" | "security" | "faq">("home");

  return (
    <div className="min-h-screen bg-[#05070D] text-[#9AA6B8] font-sans selection:bg-[#8AB4F8] selection:text-[#06101F]">
      {/* Floating Glassmorphism Sticky Navbar */}
      <header className="sticky top-4 z-50 max-w-6xl mx-auto px-4 sm:px-6 transition-all duration-300">
        <div className="w-full rounded-[18px] bg-[#070C18]/75 backdrop-blur-xl border border-[rgba(148,163,184,0.18)] shadow-2xl shadow-[rgba(0,0,0,0.6)] px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[8px] bg-[#8AB4F8] text-[#06101F] flex items-center justify-center font-bold shadow-md shadow-[rgba(138,180,248,0.3)]">
              <Cpu className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <span className="font-display font-medium text-lg text-[#F2F5F9] tracking-tight">
              AI-Recruit<span className="text-[#7DA2F2]">360</span>
            </span>
          </div>

          {/* Centered Floating Pill Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#0A0F1D]/80 border border-[rgba(148,163,184,0.12)] p-1 rounded-full text-xs font-sans">
            <a
              href="#"
              onClick={() => setActiveNav("home")}
              className={`px-4 py-1.5 rounded-full transition-all ${
                activeNav === "home"
                  ? "bg-[rgba(138,180,248,0.16)] text-[#F2F5F9] font-medium border border-[rgba(138,180,248,0.3)] shadow-sm"
                  : "text-[#9AA6B8] hover:text-[#F2F5F9]"
              }`}
            >
              Home
            </a>
            <a
              href="#how-it-works"
              onClick={() => setActiveNav("how-it-works")}
              className={`px-4 py-1.5 rounded-full transition-all ${
                activeNav === "how-it-works"
                  ? "bg-[rgba(138,180,248,0.16)] text-[#F2F5F9] font-medium border border-[rgba(138,180,248,0.3)] shadow-sm"
                  : "text-[#9AA6B8] hover:text-[#F2F5F9]"
              }`}
            >
              How It Works
            </a>
            <a
              href="#platform-tour"
              onClick={() => setActiveNav("platform-tour")}
              className={`px-4 py-1.5 rounded-full transition-all ${
                activeNav === "platform-tour"
                  ? "bg-[rgba(138,180,248,0.16)] text-[#F2F5F9] font-medium border border-[rgba(138,180,248,0.3)] shadow-sm"
                  : "text-[#9AA6B8] hover:text-[#F2F5F9]"
              }`}
            >
              Platform Tour
            </a>
            <a
              href="#pricing"
              onClick={() => setActiveNav("pricing")}
              className={`px-4 py-1.5 rounded-full transition-all ${
                activeNav === "pricing"
                  ? "bg-[rgba(138,180,248,0.16)] text-[#F2F5F9] font-medium border border-[rgba(138,180,248,0.3)] shadow-sm"
                  : "text-[#9AA6B8] hover:text-[#F2F5F9]"
              }`}
            >
              Pricing
            </a>
            <a
              href="#security"
              onClick={() => setActiveNav("security")}
              className={`px-4 py-1.5 rounded-full transition-all ${
                activeNav === "security"
                  ? "bg-[rgba(138,180,248,0.16)] text-[#F2F5F9] font-medium border border-[rgba(138,180,248,0.3)] shadow-sm"
                  : "text-[#9AA6B8] hover:text-[#F2F5F9]"
              }`}
            >
              Security
            </a>
            <a
              href="#faq"
              onClick={() => setActiveNav("faq")}
              className={`px-4 py-1.5 rounded-full transition-all ${
                activeNav === "faq"
                  ? "bg-[rgba(138,180,248,0.16)] text-[#F2F5F9] font-medium border border-[rgba(138,180,248,0.3)] shadow-sm"
                  : "text-[#9AA6B8] hover:text-[#F2F5F9]"
              }`}
            >
              FAQ
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <button className="px-4 py-2 rounded-[10px] border border-[rgba(148,163,184,0.25)] text-xs font-sans text-[#F2F5F9] hover:bg-[#121B2B] hover:border-[rgba(148,163,184,0.4)] transition-all">
                Login
              </button>
            </Link>
            <Link href="/auth/signup">
              <button className="px-5 py-2 rounded-[10px] bg-[#8AB4F8] text-[#06101F] font-semibold text-xs font-sans hover:bg-[#A9C8FA] transition-all shadow-md shadow-[rgba(138,180,248,0.25)] flex items-center gap-1.5">
                <span>Start Free</span>
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-6 overflow-hidden">
        {/* Scattered Background Circles & Glow */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[rgba(37,99,235,0.18)] blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-[rgba(138,180,248,0.10)] blur-[90px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            {/* Eyebrow Label */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[rgba(138,180,248,0.10)] border border-[rgba(148,163,184,0.14)] text-[#7DA2F2]">
              <Sparkles className="w-3.5 h-3.5 text-[#8AB4F8]" strokeWidth={1.75} />
              <span className="eyebrow text-[11px]">Autonomous Hiring Intelligence Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-medium text-[#F2F5F9] tracking-tight leading-[1.1]">
              Screen Resumes &amp; Conduct Voice AI Interviews <span className="text-[#7DA2F2]">10x Faster</span>
            </h1>

            {/* Subtitle Copy */}
            <p className="font-sans text-base sm:text-lg text-[#9AA6B8] max-w-2xl mx-auto leading-relaxed">
              AI-Recruit360 parses candidate applications, executes bilingual AI interviews, and delivers Explainable AI (XAI) evidence audit reports to engineering leaders.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link href="/auth/signup">
                <button className="btn-primary text-sm h-12 px-7">
                  <span>Deploy Hiring Engine</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </Link>
              <a href="#how-it-works">
                <button className="btn-secondary text-sm h-12 px-7">
                  Explore Workflow
                </button>
              </a>
            </div>

            {/* Trust Micro-Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-[#66707F] pt-4">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#22C55E]" strokeWidth={1.75} />
                SOC-2 Type II Certified
              </span>
              <span className="flex items-center gap-1.5">
                <Globe2 className="w-4 h-4 text-[#8AB4F8]" strokeWidth={1.75} />
                Bilingual (English &amp; Urdu)
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E]" strokeWidth={1.75} />
                Zero Hiring Bias Audited
              </span>
            </div>
          </div>

          {/* Product Mockup Frame */}
          <div className="pt-6">
            <HeroCanvas />
          </div>
        </div>
      </section>

      {/* How It Works (4-Step Enterprise Workflow) */}
      <section id="how-it-works" className="py-24 px-6 bg-[#0A0F18] border-y border-[rgba(148,163,184,0.12)]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="eyebrow block">Autonomous Pipeline</span>
            <h2 className="font-display text-3xl sm:text-5xl font-medium text-[#F2F5F9]">
              How AI-Recruit360 Works
            </h2>
            <p className="font-sans text-sm text-[#9AA6B8] leading-relaxed">
              From open requisition setup to anti-cheat verified candidate offers in 4 automated stages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="card-enterprise space-y-4 relative">
              <span className="font-mono text-3xl font-medium text-[#7DA2F2]">01</span>
              <h3 className="font-display text-lg font-medium text-[#F2F5F9]">Requisition Setup</h3>
              <p className="font-sans text-xs text-[#9AA6B8] leading-relaxed">
                Define target experience levels, technical skill rubrics, and mandatory knockout requirements in seconds.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card-enterprise space-y-4 relative">
              <span className="font-mono text-3xl font-medium text-[#7DA2F2]">02</span>
              <h3 className="font-display text-lg font-medium text-[#F2F5F9]">CV Intake &amp; Screening</h3>
              <p className="font-sans text-xs text-[#9AA6B8] leading-relaxed">
                Applicants submit PDF resumes. Our engine screens experience and instantly generates 10 tailored interview questions.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card-enterprise space-y-4 relative">
              <span className="font-mono text-3xl font-medium text-[#7DA2F2]">03</span>
              <h3 className="font-display text-lg font-medium text-[#F2F5F9]">Conversational AI Session</h3>
              <p className="font-sans text-xs text-[#9AA6B8] leading-relaxed">
                Candidates complete a voice and text interview avatar session monitored by real-time proctoring telemetry.
              </p>
            </div>

            {/* Step 4 */}
            <div className="card-enterprise space-y-4 relative">
              <span className="font-mono text-3xl font-medium text-[#7DA2F2]">04</span>
              <h3 className="font-display text-lg font-medium text-[#F2F5F9]">Explainable AI Audit</h3>
              <p className="font-sans text-xs text-[#9AA6B8] leading-relaxed">
                Recruiters review candidate multi-axis radar charts, transcript evidence quotes, and verified hiring rankings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Platform Tour / How to Use */}
      <section id="platform-tour" className="py-24 px-6 bg-[#05070D]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="eyebrow block">Platform Preview</span>
            <h2 className="font-display text-3xl sm:text-5xl font-medium text-[#F2F5F9]">
              Designed for Enterprise Talent Teams
            </h2>
            <p className="font-sans text-sm text-[#9AA6B8]">
              Switch tabs to explore the core modules used by hiring managers.
            </p>
          </div>

          {/* Tab Controls */}
          <div className="flex justify-center gap-2 p-1.5 rounded-[10px] bg-[#0C121D] border border-[rgba(148,163,184,0.12)] max-w-md mx-auto">
            <button
              onClick={() => setActiveTab("screening")}
              className={`flex-1 py-2 px-4 rounded-[8px] text-xs font-mono transition-all ${
                activeTab === "screening"
                  ? "bg-[#8AB4F8] text-[#06101F] font-semibold"
                  : "text-[#9AA6B8] hover:text-[#F2F5F9]"
              }`}
            >
              Resume Screening
            </button>
            <button
              onClick={() => setActiveTab("interview")}
              className={`flex-1 py-2 px-4 rounded-[8px] text-xs font-mono transition-all ${
                activeTab === "interview"
                  ? "bg-[#8AB4F8] text-[#06101F] font-semibold"
                  : "text-[#9AA6B8] hover:text-[#F2F5F9]"
              }`}
            >
              AI Interview Room
            </button>
            <button
              onClick={() => setActiveTab("xai")}
              className={`flex-1 py-2 px-4 rounded-[8px] text-xs font-mono transition-all ${
                activeTab === "xai"
                  ? "bg-[#8AB4F8] text-[#06101F] font-semibold"
                  : "text-[#9AA6B8] hover:text-[#F2F5F9]"
              }`}
            >
              XAI Evidence
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="card-enterprise p-8 space-y-6 max-w-4xl mx-auto bg-[#0A0E16]">
            {activeTab === "screening" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[rgba(148,163,184,0.12)] pb-4">
                  <div className="flex items-center gap-3">
                    <FileSearch className="w-5 h-5 text-[#8AB4F8]" strokeWidth={1.75} />
                    <h3 className="font-display text-lg font-medium text-[#F2F5F9]">Automated Resume Parsing &amp; Question Generation</h3>
                  </div>
                  <span className="chip-enterprise">Instant Parse</span>
                </div>
                <p className="font-sans text-xs text-[#9AA6B8] leading-relaxed">
                  Extract candidate work history, key project contributions, and technical skills directly from uploaded PDF resumes to dynamically formulate role-specific evaluation rubrics.
                </p>
                <div className="p-4 rounded-[8px] bg-[#0B1019] border border-[rgba(148,163,184,0.12)] font-mono text-xs text-[#7DA2F2] space-y-1">
                  <div>✓ Extracted 5+ years React &amp; Node.js experience</div>
                  <div>✓ Verified Github portfolio repository commit history</div>
                  <div>✓ Generated 10 customized technical interview questions</div>
                </div>
              </div>
            )}

            {activeTab === "interview" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[rgba(148,163,184,0.12)] pb-4">
                  <div className="flex items-center gap-3">
                    <Mic className="w-5 h-5 text-[#8AB4F8]" strokeWidth={1.75} />
                    <h3 className="font-display text-lg font-medium text-[#F2F5F9]">Bilingual Voice &amp; Video Interview Avatar</h3>
                  </div>
                  <span className="badge-success">Live Session Active</span>
                </div>
                <p className="font-sans text-xs text-[#9AA6B8] leading-relaxed">
                  Candidates converse naturally with an AI avatar in English or Urdu. Real-time proctoring telemetry logs tab switches, secondary window focus, and response latency.
                </p>
                <div className="p-4 rounded-[8px] bg-[#0B1019] border border-[rgba(148,163,184,0.12)] font-mono text-xs text-[#F2F5F9] space-y-1">
                  <div className="text-[#66707F]">Q3: Explain how you optimize SQL query execution plans in high-throughput PostgreSQL databases.</div>
                  <div className="text-[#8AB4F8] pt-1">&quot;I analyze EXPLAIN ANALYZE output, add composite indexes, and leverage connection pooling...&quot;</div>
                </div>
              </div>
            )}

            {activeTab === "xai" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[rgba(148,163,184,0.12)] pb-4">
                  <div className="flex items-center gap-3">
                    <Brain className="w-5 h-5 text-[#8AB4F8]" strokeWidth={1.75} />
                    <h3 className="font-display text-lg font-medium text-[#F2F5F9]">Explainable AI Candidate Audit</h3>
                  </div>
                  <span className="badge-success">Score: 92%</span>
                </div>
                <p className="font-sans text-xs text-[#9AA6B8] leading-relaxed">
                  No black-box scores. Every rating is accompanied by direct transcript quotes, claim vs. reality verification, and behavioral integrity checks.
                </p>
                <div className="p-4 rounded-[8px] bg-[#0B1019] border border-[rgba(148,163,184,0.12)] font-mono text-xs text-[#22C55E]">
                  ✓ Verified Match: Candidate technical score exceeds 90%. Anti-cheat proctoring log clean.
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Enterprise SaaS Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-[#0A0F18] border-t border-[rgba(148,163,184,0.12)]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="eyebrow block">Flexible SaaS Plans</span>
            <h2 className="font-display text-3xl sm:text-5xl font-medium text-[#F2F5F9]">
              Predictable Enterprise Pricing
            </h2>
            <p className="font-sans text-sm text-[#9AA6B8]">
              Scale your hiring capacity without increasing talent acquisition headcount.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <span className={`text-xs font-mono ${billingCycle === "monthly" ? "text-[#F2F5F9]" : "text-[#66707F]"}`}>Monthly</span>
              <button
                onClick={() => setBillingCycle((prev) => (prev === "annual" ? "monthly" : "annual"))}
                className="w-12 h-6 rounded-full bg-[#0C121D] border border-[rgba(148,163,184,0.25)] p-1 relative transition-colors"
              >
                <div className={`w-4 h-4 rounded-full bg-[#8AB4F8] transition-transform ${billingCycle === "annual" ? "translate-x-6" : "translate-x-0"}`} />
              </button>
              <span className={`text-xs font-mono flex items-center gap-1.5 ${billingCycle === "annual" ? "text-[#F2F5F9]" : "text-[#66707F]"}`}>
                Annual <span className="chip-enterprise text-[9px] py-0 px-1.5">Save 20%</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="card-enterprise p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="eyebrow block">Startup Tier</span>
                <h3 className="font-display text-2xl font-medium text-[#F2F5F9]">Starter</h3>
                <p className="font-sans text-xs text-[#9AA6B8]">Ideal for growing startups hiring technical talent.</p>
                <div className="font-mono text-4xl font-medium text-[#F2F5F9]">
                  ${billingCycle === "annual" ? "159" : "199"}
                  <span className="text-xs text-[#66707F] font-sans">/month</span>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-[rgba(148,163,184,0.12)] font-sans text-xs">
                  <div className="flex items-center gap-2 text-[#F2F5F9]">
                    <Check className="w-4 h-4 text-[#8AB4F8]" strokeWidth={1.75} />
                    Up to 5 active job requisitions
                  </div>
                  <div className="flex items-center gap-2 text-[#F2F5F9]">
                    <Check className="w-4 h-4 text-[#8AB4F8]" strokeWidth={1.75} />
                    100 AI candidate interviews / mo
                  </div>
                  <div className="flex items-center gap-2 text-[#F2F5F9]">
                    <Check className="w-4 h-4 text-[#8AB4F8]" strokeWidth={1.75} />
                    Automated PDF resume parsing
                  </div>
                  <div className="flex items-center gap-2 text-[#F2F5F9]">
                    <Check className="w-4 h-4 text-[#8AB4F8]" strokeWidth={1.75} />
                    Standard XAI audit reports
                  </div>
                </div>
              </div>

              <Link href="/auth/signup">
                <button className="btn-secondary w-full justify-center text-xs h-11">
                  Start Starter Trial
                </button>
              </Link>
            </div>

            {/* Growth / Professional Plan (Popular) */}
            <div className="card-enterprise p-8 flex flex-col justify-between space-y-6 border-[#8AB4F8] relative bg-[#0C121D]">
              <div className="absolute -top-3.5 right-6 bg-[#8AB4F8] text-[#06101F] font-mono text-[10px] font-semibold uppercase tracking-wider py-1 px-3 rounded-full">
                Most Popular
              </div>

              <div className="space-y-4">
                <span className="eyebrow text-[#7DA2F2] block">Scale Tier</span>
                <h3 className="font-display text-2xl font-medium text-[#F2F5F9]">Professional</h3>
                <p className="font-sans text-xs text-[#9AA6B8]">For scaling companies evaluating high volume applications.</p>
                <div className="font-mono text-4xl font-medium text-[#8AB4F8]">
                  ${billingCycle === "annual" ? "399" : "499"}
                  <span className="text-xs text-[#66707F] font-sans">/month</span>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-[rgba(148,163,184,0.12)] font-sans text-xs">
                  <div className="flex items-center gap-2 text-[#F2F5F9]">
                    <Check className="w-4 h-4 text-[#8AB4F8]" strokeWidth={1.75} />
                    Up to 25 active job requisitions
                  </div>
                  <div className="flex items-center gap-2 text-[#F2F5F9]">
                    <Check className="w-4 h-4 text-[#8AB4F8]" strokeWidth={1.75} />
                    1,000 AI candidate interviews / mo
                  </div>
                  <div className="flex items-center gap-2 text-[#F2F5F9]">
                    <Check className="w-4 h-4 text-[#8AB4F8]" strokeWidth={1.75} />
                    Real-time Anti-Cheat proctoring
                  </div>
                  <div className="flex items-center gap-2 text-[#F2F5F9]">
                    <Check className="w-4 h-4 text-[#8AB4F8]" strokeWidth={1.75} />
                    Bilingual voice avatar interviews
                  </div>
                  <div className="flex items-center gap-2 text-[#F2F5F9]">
                    <Check className="w-4 h-4 text-[#8AB4F8]" strokeWidth={1.75} />
                    Custom evaluation rubrics &amp; ATS integration
                  </div>
                </div>
              </div>

              <Link href="/auth/signup">
                <button className="btn-primary w-full justify-center text-xs h-11">
                  <span>Start Professional Trial</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="card-enterprise p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="eyebrow block">Custom Tier</span>
                <h3 className="font-display text-2xl font-medium text-[#F2F5F9]">Enterprise</h3>
                <p className="font-sans text-xs text-[#9AA6B8]">Custom model fine-tuning, SOC-2 SLAs, and unlimited hiring.</p>
                <div className="font-mono text-4xl font-medium text-[#F2F5F9]">
                  Custom
                </div>

                <div className="space-y-2.5 pt-4 border-t border-[rgba(148,163,184,0.12)] font-sans text-xs">
                  <div className="flex items-center gap-2 text-[#F2F5F9]">
                    <Check className="w-4 h-4 text-[#8AB4F8]" strokeWidth={1.75} />
                    Unlimited job requisitions &amp; interviews
                  </div>
                  <div className="flex items-center gap-2 text-[#F2F5F9]">
                    <Check className="w-4 h-4 text-[#8AB4F8]" strokeWidth={1.75} />
                    White-label candidate portal branding
                  </div>
                  <div className="flex items-center gap-2 text-[#F2F5F9]">
                    <Check className="w-4 h-4 text-[#8AB4F8]" strokeWidth={1.75} />
                    Dedicated AI model fine-tuning
                  </div>
                  <div className="flex items-center gap-2 text-[#F2F5F9]">
                    <Check className="w-4 h-4 text-[#8AB4F8]" strokeWidth={1.75} />
                    99.99% Uptime SLA &amp; dedicated success manager
                  </div>
                </div>
              </div>

              <Link href="/auth/signup">
                <button className="btn-secondary w-full justify-center text-xs h-11">
                  Contact Enterprise Sales
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance Grid */}
      <section id="security" className="py-24 px-6 bg-[#05070D]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="eyebrow block">Security &amp; Trust</span>
            <h2 className="font-display text-3xl sm:text-5xl font-medium text-[#F2F5F9]">
              Enterprise Security First
            </h2>
            <p className="font-sans text-sm text-[#9AA6B8]">
              Engineered with SOC-2, GDPR, and anti-bias audit protections from day one.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-enterprise space-y-3">
              <Lock className="w-6 h-6 text-[#8AB4F8]" strokeWidth={1.75} />
              <h3 className="font-display text-lg font-medium text-[#F2F5F9]">SOC-2 Type II Certified</h3>
              <p className="font-sans text-xs text-[#9AA6B8] leading-relaxed">
                All candidate PII, transcripts, and resume PDFs are encrypted in transit via TLS 1.3 and at rest via AES-256.
              </p>
            </div>

            <div className="card-enterprise space-y-3">
              <ShieldCheck className="w-6 h-6 text-[#22C55E]" strokeWidth={1.75} />
              <h3 className="font-display text-lg font-medium text-[#F2F5F9]">Anti-Bias Audited</h3>
              <p className="font-sans text-xs text-[#9AA6B8] leading-relaxed">
                Our AI scoring rubrics evaluate strictly against technical job criteria and transcript evidence, completely blind to demographic indicators.
              </p>
            </div>

            <div className="card-enterprise space-y-3">
              <Globe2 className="w-6 h-6 text-[#8AB4F8]" strokeWidth={1.75} />
              <h3 className="font-display text-lg font-medium text-[#F2F5F9]">GDPR &amp; Global Compliance</h3>
              <p className="font-sans text-xs text-[#9AA6B8] leading-relaxed">
                Full compliance with EU candidate data retention regulations, right-to-be-forgotten deletion APIs, and candidate consent logs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 bg-[#0A0F18] border-t border-[rgba(148,163,184,0.12)]">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="eyebrow block">Frequently Asked Questions</span>
            <h2 className="font-display text-3xl sm:text-5xl font-medium text-[#F2F5F9]">
              Executive Answers
            </h2>
          </div>

          <div className="space-y-4">
            <div className="card-enterprise space-y-2 p-6">
              <h3 className="font-display text-base font-medium text-[#F2F5F9]">How does AI-Recruit360 prevent candidate cheating or proxy test takers?</h3>
              <p className="font-sans text-xs text-[#9AA6B8] leading-relaxed">
                Our platform embeds browser integrity telemetry that monitors tab switches, window blur events, and response latency. Suspicious behavior is logged and flagged directly in the candidate&apos;s proctoring report.
              </p>
            </div>

            <div className="card-enterprise space-y-2 p-6">
              <h3 className="font-display text-base font-medium text-[#F2F5F9]">Is the candidate scoring explainable or a black box?</h3>
              <p className="font-sans text-xs text-[#9AA6B8] leading-relaxed">
                100% Explainable. Every candidate score is backed by exact transcript evidence quotes, rubric score justifications, and claim vs. reality evaluations accessible in the recruiter dashboard.
              </p>
            </div>

            <div className="card-enterprise space-y-2 p-6">
              <h3 className="font-display text-base font-medium text-[#F2F5F9]">Can candidates conduct interviews in Urdu or English?</h3>
              <p className="font-sans text-xs text-[#9AA6B8] leading-relaxed">
                Yes. Our AI avatar natively understands and evaluates responses in both English and Urdu, facilitating global technical recruitment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#04060B] border-t border-[rgba(148,163,184,0.12)] py-16 px-6 font-sans text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[6px] bg-[#8AB4F8] text-[#06101F] flex items-center justify-center font-bold">
                <Cpu className="w-3.5 h-3.5" strokeWidth={1.75} />
              </div>
              <span className="font-display font-medium text-base text-[#F2F5F9]">AI-Recruit360</span>
            </div>
            <p className="font-sans text-xs text-[#66707F] leading-relaxed">
              Autonomous hiring intelligence platform for high-growth tech companies.
            </p>
          </div>

          <div className="space-y-3">
            <span className="eyebrow block">Platform</span>
            <ul className="space-y-2 text-[#9AA6B8]">
              <li><a href="#how-it-works" className="hover:text-[#F2F5F9]">How It Works</a></li>
              <li><a href="#platform-tour" className="hover:text-[#F2F5F9]">Platform Tour</a></li>
              <li><a href="#pricing" className="hover:text-[#F2F5F9]">Pricing Plans</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="eyebrow block">Security</span>
            <ul className="space-y-2 text-[#9AA6B8]">
              <li><a href="#security" className="hover:text-[#F2F5F9]">SOC-2 Compliance</a></li>
              <li><a href="#security" className="hover:text-[#F2F5F9]">Anti-Bias Audit</a></li>
              <li><a href="#security" className="hover:text-[#F2F5F9]">Privacy Policy</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="eyebrow block">Account</span>
            <ul className="space-y-2 text-[#9AA6B8]">
              <li><Link href="/auth/login" className="hover:text-[#F2F5F9]">Sign In</Link></li>
              <li><Link href="/auth/signup" className="hover:text-[#F2F5F9]">Create Account</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-[rgba(148,163,184,0.12)] flex flex-col sm:flex-row items-center justify-between text-[#66707F] font-mono text-[11px]">
          <div>&copy; {new Date().getFullYear()} AI-Recruit360 Inc. Enterprise B2B SaaS.</div>
          <div>All candidate data encrypted via AES-256.</div>
        </div>
      </footer>
    </div>
  );
}
