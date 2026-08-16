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
  Sparkle
} from "lucide-react";
import { HeroCanvas } from "@/components/home/hero-canvas";
import { Logo } from "@/components/ui/logo";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">("annual");
  const [activeNav, setActiveNav] = useState<"home" | "how-it-works" | "features" | "pricing" | "faq">("home");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F7FE] text-[#6B7280] font-sans selection:bg-[#4361EE] selection:text-white">
      {/* Floating Header Navbar (Transitions to bg-white/80 backdrop-blur-md shadow-sm on scroll) */}
      <header className="sticky top-4 z-50 max-w-6xl mx-auto px-4 sm:px-6 transition-all duration-300">
        <div
          className={`w-full rounded-full transition-all duration-300 px-6 py-3 flex items-center justify-between ${
            scrolled
              ? "bg-white/80 backdrop-blur-md shadow-sm border border-gray-200/80"
              : "bg-white/60 backdrop-blur-sm border border-gray-200/40"
          }`}
        >
          {/* Logo */}
          <Logo size="md" href="/" variant="light" />

          {/* Centered Floating Pill Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-100/80 p-1 rounded-full text-xs font-sans border border-gray-200/60">
            <a
              href="#"
              onClick={() => setActiveNav("home")}
              className={`px-4 py-1.5 rounded-full transition-all ${
                activeNav === "home"
                  ? "bg-[#4361EE] text-white font-semibold shadow-sm"
                  : "text-[#6B7280] hover:text-[#1F2937]"
              }`}
            >
              Home
            </a>
            <a
              href="#how-it-works"
              onClick={() => setActiveNav("how-it-works")}
              className={`px-4 py-1.5 rounded-full transition-all ${
                activeNav === "how-it-works"
                  ? "bg-[#4361EE] text-white font-semibold shadow-sm"
                  : "text-[#6B7280] hover:text-[#1F2937]"
              }`}
            >
              Workflow
            </a>
            <a
              href="#features"
              onClick={() => setActiveNav("features")}
              className={`px-4 py-1.5 rounded-full transition-all ${
                activeNav === "features"
                  ? "bg-[#4361EE] text-white font-semibold shadow-sm"
                  : "text-[#6B7280] hover:text-[#1F2937]"
              }`}
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={() => setActiveNav("pricing")}
              className={`px-4 py-1.5 rounded-full transition-all ${
                activeNav === "pricing"
                  ? "bg-[#4361EE] text-white font-semibold shadow-sm"
                  : "text-[#6B7280] hover:text-[#1F2937]"
              }`}
            >
              Pricing
            </a>
            <a
              href="#faq"
              onClick={() => setActiveNav("faq")}
              className={`px-4 py-1.5 rounded-full transition-all ${
                activeNav === "faq"
                  ? "bg-[#4361EE] text-white font-semibold shadow-sm"
                  : "text-[#6B7280] hover:text-[#1F2937]"
              }`}
            >
              FAQ
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <button className="px-4 py-2 rounded-full text-xs font-semibold text-[#1F2937] hover:bg-gray-100 transition-all">
                Login
              </button>
            </Link>
            <Link href="/auth/signup">
              <button className="btn-primary text-xs py-2 px-5 rounded-full">
                <span>Start Free</span>
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            {/* Eyebrow Label */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#4361EE]">
              <Sparkles className="w-4 h-4 text-[#4361EE]" strokeWidth={1.75} />
              <span className="eyebrow text-[11px]">Autonomous Hiring Intelligence</span>
            </div>

            {/* H1 Heading */}
            <h1 className="font-display text-5xl md:text-7xl font-extrabold text-[#1F2937] tracking-tight leading-[1.1]">
              Screen Resumes &amp; Conduct Voice AI Interviews <span className="text-[#4361EE]">10x Faster</span>
            </h1>

            {/* Subtitle */}
            <p className="font-sans text-base sm:text-lg text-[#6B7280] max-w-2xl mx-auto leading-relaxed font-normal">
              AI-Recruit360 parses candidate applications, executes bilingual AI interviews, and delivers Explainable AI (XAI) evidence audit reports to hiring managers.
            </p>

            {/* Hero CTA Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link href="/auth/signup">
                <button className="bg-[#4361EE] hover:bg-[#3A56D4] rounded-full px-8 py-4 text-white font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-2 text-sm">
                  <span>Start Hiring</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </button>
              </Link>
              <a href="#how-it-works">
                <button className="btn-secondary text-sm px-7 py-4 rounded-full">
                  Explore Workflow
                </button>
              </a>
            </div>

            {/* Micro Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-[#6B7280] pt-4 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" strokeWidth={1.75} />
                SOC-2 Type II Certified
              </span>
              <span className="flex items-center gap-1.5">
                <Globe2 className="w-4 h-4 text-[#4361EE]" strokeWidth={1.75} />
                Bilingual (English &amp; Urdu)
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" strokeWidth={1.75} />
                Zero Hiring Bias Audited
              </span>
            </div>
          </div>

          {/* Floating 2.5D Mockup Visual Overlapping Section Below */}
          <div className="pt-4 max-w-5xl mx-auto shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <HeroCanvas />
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-24 px-6 bg-white border-y border-gray-200/80">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="eyebrow block">Capabilities Engine</span>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-[#1F2937] tracking-tight">
              Discover Powerful Features Built for Smarter Hiring
            </h2>
            <p className="font-sans text-sm text-[#6B7280] leading-relaxed">
              Enhance your HR processes with AI features designed to automate, analyze, and optimize workforce management.
            </p>
          </div>

          {/* Features Grid: Pure white cards (rounded-3xl, soft 2.5D shadows) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1: Highlighted Resume Knockout */}
            <div className="rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:-translate-y-1 transition-all duration-300 space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#4361EE] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <FileSearch className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <h3 className="font-display text-lg font-bold text-[#1F2937]">
                Resume Knockout &amp; Parsing
              </h3>
              <p className="font-sans text-xs text-[#6B7280] leading-relaxed">
                Automatically filter candidates based on experience rubrics, eliminating unverified PDF claims instantly.
              </p>
              <div className="pt-2 flex items-center gap-1 text-xs font-mono text-[#4361EE] font-semibold">
                <span>Instant screening</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 2: Highlighted Bilingual Avatar */}
            <div className="rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:-translate-y-1 transition-all duration-300 space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#4361EE] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <Mic className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <h3 className="font-display text-lg font-bold text-[#1F2937]">
                Bilingual Avatar Interviewer
              </h3>
              <p className="font-sans text-xs text-[#6B7280] leading-relaxed">
                Execute automated bilingual video/voice sessions in English or Urdu with real-time proctoring telemetry.
              </p>
              <div className="pt-2 flex items-center gap-1 text-xs font-mono text-[#4361EE] font-semibold">
                <span>Simli avatar stream</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 3: Predictive Insights */}
            <div className="rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:-translate-y-1 transition-all duration-300 space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#4361EE] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <BarChart3 className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <h3 className="font-display text-lg font-bold text-[#1F2937]">
                Predictive Radar Scoring
              </h3>
              <p className="font-sans text-xs text-[#6B7280] leading-relaxed">
                Use multi-axis radar charts to forecast technical competency, communication clarity, and honesty scores.
              </p>
              <div className="pt-2 flex items-center gap-1 text-xs font-mono text-[#4361EE] font-semibold">
                <span>Multi-axis analytics</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 4: Explainable AI Audit */}
            <div className="rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:-translate-y-1 transition-all duration-300 space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#4361EE] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <UserCheck className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <h3 className="font-display text-lg font-bold text-[#1F2937]">
                Explainable AI Compliance
              </h3>
              <p className="font-sans text-xs text-[#6B7280] leading-relaxed">
                Review verified transcript quotes, SOC-2 audit logs, and unbiased hiring recommendation ranks.
              </p>
              <div className="pt-2 flex items-center gap-1 text-xs font-mono text-[#4361EE] font-semibold">
                <span>SOC-2 certified</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Requisition Workflow */}
      <section id="how-it-works" className="py-24 px-6 bg-[#F4F7FE]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="eyebrow block">Autonomous Pipeline</span>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-[#1F2937] tracking-tight">
              Scale Hiring Operations in 4 Steps
            </h2>
            <p className="font-sans text-sm text-[#6B7280]">
              From open requisition setup to verified candidate offers in 4 automated stages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 space-y-4">
              <span className="font-mono text-3xl font-extrabold text-[#4361EE]">01</span>
              <h3 className="font-display text-lg font-bold text-[#1F2937]">Requisition Setup</h3>
              <p className="font-sans text-xs text-[#6B7280] leading-relaxed">
                Define target experience levels, technical skill rubrics, and knockout requirements.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 space-y-4">
              <span className="font-mono text-3xl font-extrabold text-[#4361EE]">02</span>
              <h3 className="font-display text-lg font-bold text-[#1F2937]">CV Intake &amp; Parsing</h3>
              <p className="font-sans text-xs text-[#6B7280] leading-relaxed">
                Applicants submit PDF resumes. Our engine screens experience and formulates 10 custom questions.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 space-y-4">
              <span className="font-mono text-3xl font-extrabold text-[#4361EE]">03</span>
              <h3 className="font-display text-lg font-bold text-[#1F2937]">Conversational AI Session</h3>
              <p className="font-sans text-xs text-[#6B7280] leading-relaxed">
                Candidates complete a voice and text avatar session monitored by real-time proctoring telemetry.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 space-y-4">
              <span className="font-mono text-3xl font-extrabold text-[#4361EE]">04</span>
              <h3 className="font-display text-lg font-bold text-[#1F2937]">Explainable AI Audit</h3>
              <p className="font-sans text-xs text-[#6B7280] leading-relaxed">
                Recruiters review candidate multi-axis radar charts, transcript quotes, and verified rankings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-white border-t border-gray-200/80">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="eyebrow block">Predictable Plans</span>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-[#1F2937] tracking-tight">
              Simple Enterprise Pricing
            </h2>
            <p className="font-sans text-sm text-[#6B7280]">
              Deploy autonomous AI recruiting for your hiring managers today.
            </p>

            <div className="inline-flex items-center gap-2 p-1.5 rounded-full bg-gray-100 border border-gray-200">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all ${
                  billingCycle === "monthly"
                    ? "bg-[#4361EE] text-white font-bold shadow-sm"
                    : "text-[#6B7280]"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all ${
                  billingCycle === "annual"
                    ? "bg-[#4361EE] text-white font-bold shadow-sm"
                    : "text-[#6B7280]"
                }`}
              >
                Annual (Save 20%)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[#1F2937]">Starter</h3>
                <p className="font-sans text-xs text-[#6B7280]">Ideal for growing startups.</p>
                <div className="font-mono text-4xl font-extrabold text-[#1F2937]">
                  {billingCycle === "annual" ? "$49" : "$59"}
                  <span className="text-xs text-[#6B7280] font-sans font-normal"> / month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-[#6B7280]">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10B981]" /> Up to 5 Active Jobs</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10B981]" /> 50 Candidate AI Interviews</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10B981]" /> Automated Resume Screening</li>
                </ul>
              </div>
              <Link href="/auth/signup">
                <button className="btn-secondary w-full text-xs py-3 rounded-full">
                  Get Started
                </button>
              </Link>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-2 border-[#4361EE] space-y-6 flex flex-col justify-between relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#4361EE] text-white text-[10px] font-mono font-bold tracking-wider uppercase shadow-md">
                Most Popular
              </div>
              <div className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[#1F2937]">Enterprise Pro</h3>
                <p className="font-sans text-xs text-[#6B7280]">For scaling companies &amp; agencies.</p>
                <div className="font-mono text-4xl font-extrabold text-[#4361EE]">
                  {billingCycle === "annual" ? "$149" : "$179"}
                  <span className="text-xs text-[#6B7280] font-sans font-normal"> / month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-[#6B7280]">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10B981]" /> Unlimited Active Jobs</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10B981]" /> 500 Candidate AI Interviews</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10B981]" /> Real-time Anti-Cheat Proctoring</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10B981]" /> Bilingual Voice &amp; Video Avatar</li>
                </ul>
              </div>
              <Link href="/auth/signup">
                <button className="btn-primary w-full text-xs py-3 rounded-full">
                  Start Pro Trial
                </button>
              </Link>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-display text-xl font-bold text-[#1F2937]">Custom Enterprise</h3>
                <p className="font-sans text-xs text-[#6B7280]">Dedicated infrastructure &amp; SLAs.</p>
                <div className="font-mono text-4xl font-extrabold text-[#1F2937]">
                  Custom
                </div>
                <ul className="space-y-2.5 text-xs text-[#6B7280]">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10B981]" /> Unlimited Everything</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10B981]" /> Custom AI Model Fine-Tuning</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10B981]" /> Dedicated Account Executive</li>
                </ul>
              </div>
              <Link href="/auth/signup">
                <button className="btn-secondary w-full text-xs py-3 rounded-full">
                  Contact Sales
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-24 px-6 bg-[#F4F7FE] border-t border-gray-200/80">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="eyebrow block">Frequently Asked Questions</span>
            <h2 className="font-display text-3xl font-bold text-[#1F2937]">
              Everything You Need to Know
            </h2>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200/80 space-y-2">
              <h3 className="font-display text-sm font-bold text-[#1F2937]">
                How does AI-Recruit360 prevent candidate proxy cheating?
              </h3>
              <p className="font-sans text-xs text-[#6B7280] leading-relaxed">
                Our proctoring engine monitors gaze tracking, voice biometric consistency, audio background noise, and browser window tab switches during active sessions.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200/80 space-y-2">
              <h3 className="font-display text-sm font-bold text-[#1F2937]">
                Is the candidate scoring audit explainable (XAI)?
              </h3>
              <p className="font-sans text-xs text-[#6B7280] leading-relaxed">
                Yes. AI-Recruit360 generates an Explainable AI (XAI) report with direct transcript quotes, technical accuracy ratings, and multi-axis radar score justification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-white border-t border-gray-200 text-xs text-[#6B7280]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size="md" href="/" variant="light" />
          <p className="font-sans text-[11px]">
            &copy; 2026 AI-Recruit360 Inc. All rights reserved. SOC-2 Certified Talent Intelligence Platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
