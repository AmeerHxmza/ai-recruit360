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
  PlayCircle,
  Filter,
  Timer,
  Volume2,
  ChevronDown,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { HeroCanvas } from "@/components/home/hero-canvas";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">("annual");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FE] text-[#6B7280] font-sans selection:bg-[#4361EE] selection:text-white relative">
      {/* Header Navbar */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-md border-b border-gray-200/80 shadow-sm"
            : "bg-white/60 backdrop-blur-sm border-b border-gray-200/40"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Logo size="lg" href="/" variant="light" glow />

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#4B5563]">
            <a href="#platform" className="hover:text-[#4361EE] transition-colors">
              Platform
            </a>
            <a href="#features" className="hover:text-[#4361EE] transition-colors">
              Solutions
            </a>
            <a href="#pricing" className="hover:text-[#4361EE] transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-[#4361EE] transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/auth"
              className="text-sm font-semibold text-[#1F2937] hover:text-[#4361EE] transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link href="/dashboard" className="btn-pill-primary text-sm">
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EEF2FF] border border-blue-100 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[#4361EE]" />
          <span className="text-xs font-semibold text-[#4361EE] tracking-wide uppercase font-mono">
            AI-Powered Enterprise Recruitment Platform
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#1F2937] tracking-tight max-w-5xl mx-auto leading-[1.1]">
          Hire Smarter, <br className="hidden sm:inline" />
          <span className="text-[#4361EE]">Not Harder.</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-[#6B7280] max-w-2xl mx-auto font-normal leading-relaxed">
          AI-Recruit360 automates candidate screening, bilingual interviews, and XAI evaluations—bringing top talent to the surface faster. Experience the future of enterprise recruiting today.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard" className="btn-pill-primary text-base px-8 py-3.5 w-full sm:w-auto">
            <span>Start Free Trial</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#demo"
            className="btn-pill-secondary text-base px-8 py-3.5 w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <PlayCircle className="w-5 h-5 text-[#4361EE]" />
            <span>Watch Demo</span>
          </a>
        </div>

        {/* Embedded Interactive Hero Canvas */}
        <div id="demo" className="mt-16">
          <HeroCanvas />
        </div>
      </section>

      {/* Key Metrics Ticker */}
      <section className="py-12 bg-white border-y border-gray-200/80 shadow-diffused">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#1F2937]">98.4%</div>
            <div className="text-xs font-mono text-[#4361EE] mt-1 uppercase tracking-wider font-semibold">
              Knockout Accuracy
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#1F2937]">10x</div>
            <div className="text-xs font-mono text-[#4361EE] mt-1 uppercase tracking-wider font-semibold">
              Recruitment Velocity
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#1F2937]">100%</div>
            <div className="text-xs font-mono text-[#4361EE] mt-1 uppercase tracking-wider font-semibold">
              Audit Transparency
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#1F2937]">0%</div>
            <div className="text-xs font-mono text-[#4361EE] mt-1 uppercase tracking-wider font-semibold">
              Unconscious Bias
            </div>
          </div>
        </div>
      </section>

      {/* Bento Box Feature Grid Section */}
      <section id="platform" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="eyebrow-blue">Built for High-Growth Engineering Teams</div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1F2937] mt-2 tracking-tight">
            End-to-End Recruitment Intelligence
          </h2>
          <p className="mt-4 text-[#6B7280] text-base">
            Every feature designed to cut manual screening hours, ensure interview integrity, and provide audit-ready candidate evaluations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Feature 1: Smart Knockout Layer (Large 8 Cols) */}
          <div className="md:col-span-8 card-bento flex flex-col justify-between relative overflow-hidden group">
            <div className="z-10">
              <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] border border-blue-100 flex items-center justify-center text-[#4361EE] mb-6">
                <Filter className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-[#1F2937] mb-3">Smart Knockout Layer</h3>
              <p className="text-sm text-[#6B7280] max-w-lg leading-relaxed">
                Instantly filter out unqualified candidates based on dynamic criteria. Save hundreds of hours in manual resume reviews by automatically screening skill sets, qualifications, and project experiences.
              </p>
            </div>

            <div className="mt-8 bg-[#F8FAFC] rounded-xl p-4 border border-gray-200/80 flex items-center justify-center h-48 relative overflow-hidden">
              <div className="w-full h-full flex flex-col justify-center space-y-3 px-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 shadow-sm text-xs">
                  <span className="font-semibold text-[#1F2937]">PyMuPDF Text Extractor</span>
                  <span className="badge-emerald">Passed (0.42s)</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 shadow-sm text-xs">
                  <span className="font-semibold text-[#1F2937]">LangGraph Candidate Screening</span>
                  <span className="badge-blue">94% Skill Match</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Timed Technical MCQs (4 Cols) */}
          <div className="md:col-span-4 card-bento flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] border border-blue-100 flex items-center justify-center text-[#4361EE] mb-6">
                <Timer className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-[#1F2937] mb-3">Timed Technical MCQs</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Assess core technical competencies quickly with auto-graded, timed multiple-choice questionnaires tailored specifically to target engineering roles.
              </p>
            </div>

            <div className="mt-8 p-4 rounded-xl bg-[#F8FAFC] border border-gray-200 text-center">
              <div className="text-2xl font-extrabold text-[#1F2937]">20s per Question</div>
              <div className="text-xs text-[#6B7280] mt-1 font-mono">Automated Score Dispatch</div>
            </div>
          </div>

          {/* Feature 3: Bilingual Avatar Interviews (12 Cols Wide) */}
          <div id="features" className="md:col-span-12 card-bento flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] border border-blue-100 flex items-center justify-center text-[#4361EE] mb-6">
                <Volume2 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#1F2937] mb-4">
                Bilingual Avatar Interviews
              </h3>
              <p className="text-base text-[#6B7280] leading-relaxed mb-6">
                Conduct initial screening interviews using conversational AI avatars capable of interacting naturally in both English and Urdu, ensuring a consistent, accessible, and unbiased preliminary assessment.
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold text-[#4361EE]">
                <Globe2 className="w-4 h-4" />
                <span>Supports English & Urdu Articulation</span>
              </div>
            </div>

            <div className="flex-1 w-full bg-[#F8FAFC] rounded-xl p-6 border border-gray-200 flex flex-col justify-center space-y-4">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm text-xs">
                <div className="w-8 h-8 rounded-full bg-[#4361EE]/10 flex items-center justify-center text-[#4361EE] font-bold">
                  AI
                </div>
                <div>
                  <div className="font-semibold text-[#1F2937]">English Prompt</div>
                  <div className="text-[#6B7280]">"Can you walk us through your backend system architecture?"</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm text-xs">
                <div className="w-8 h-8 rounded-full bg-[#10B981]/10 flex items-center justify-center text-[#10B981] font-bold">
                  UR
                </div>
                <div>
                  <div className="font-semibold text-[#1F2937]">Urdu Prompt</div>
                  <div className="text-[#6B7280]">"کیا آپ اپنے پائیتھن اور فاسٹ اے پی آئی پروجیکٹ کی وضاحت کر سکتے ہیں؟"</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4: Explainable XAI Audit (6 Cols) */}
          <div className="md:col-span-6 card-bento">
            <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] border border-blue-100 flex items-center justify-center text-[#4361EE] mb-6">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-[#1F2937] mb-3">Explainable XAI Audit</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed mb-6">
              Multi-axis evaluation measuring Technical Mastery, Communication Clarity, and Honesty Integrity on an auditable radar scale with direct transcript quotes.
            </p>
            <span className="badge-blue">Claim vs. Reality Check</span>
          </div>

          {/* Feature 5: Recruiter Command Center (6 Cols) */}
          <div className="md:col-span-6 card-bento">
            <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] border border-blue-100 flex items-center justify-center text-[#4361EE] mb-6">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-[#1F2937] mb-3">Recruiter Command Center</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed mb-6">
              Real-time candidate leaderboard with instant score sorting, evaluation review drawers, and automatic proctoring event logs.
            </p>
            <span className="badge-emerald">Proctoring Telemetry Active</span>
          </div>
        </div>
      </section>

      {/* Tiered Pricing Section */}
      <section id="pricing" className="py-24 bg-white border-t border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="eyebrow-blue">Flexible Enterprise Plans</div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1F2937] mt-2 tracking-tight">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-[#6B7280] text-base">
              Choose the plan that fits your hiring volume. Upgrade or downgrade anytime.
            </p>

            {/* Billing Toggle */}
            <div className="mt-8 inline-flex items-center gap-3 bg-[#F4F7FE] p-1.5 rounded-full border border-gray-200">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-[#4361EE] text-white shadow-sm"
                    : "text-[#6B7280] hover:text-[#1F2937]"
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-5 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
                  billingCycle === "annual"
                    ? "bg-[#4361EE] text-white shadow-sm"
                    : "text-[#6B7280] hover:text-[#1F2937]"
                }`}
              >
                <span>Annual Billing</span>
                <span className="bg-[#10B981] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="card-bento flex flex-col justify-between">
              <div>
                <div className="text-sm font-mono font-bold text-[#6B7280] uppercase mb-2">Starter</div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-extrabold text-[#1F2937]">
                    {billingCycle === "annual" ? "$39" : "$49"}
                  </span>
                  <span className="text-xs text-[#6B7280]">/ month</span>
                </div>
                <p className="text-xs text-[#6B7280] mb-6">
                  Perfect for small teams and startups initiating automated hiring workflows.
                </p>

                <ul className="space-y-3 text-xs text-[#4B5563]">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#10B981]" />
                    <span>Up to 5 Active Job Postings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#10B981]" />
                    <span>PyMuPDF Resume Knockout Screening</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#10B981]" />
                    <span>Timed MCQ Assessments</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#10B981]" />
                    <span>Standard Email Support</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Link href="/auth" className="btn-pill-secondary w-full text-center">
                  Start Free Trial
                </Link>
              </div>
            </div>

            {/* Professional Plan (Featured) */}
            <div className="card-bento flex flex-col justify-between border-2 border-[#4361EE] shadow-diffused-lg relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#4361EE] text-white text-[10px] font-mono font-bold uppercase px-4 py-1 rounded-full shadow-sm">
                Most Popular
              </div>

              <div>
                <div className="text-sm font-mono font-bold text-[#4361EE] uppercase mb-2">Professional</div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-extrabold text-[#1F2937]">
                    {billingCycle === "annual" ? "$159" : "$199"}
                  </span>
                  <span className="text-xs text-[#6B7280]">/ month</span>
                </div>
                <p className="text-xs text-[#6B7280] mb-6">
                  Ideal for scaling companies requiring bilingual interviews and XAI audits.
                </p>

                <ul className="space-y-3 text-xs text-[#4B5563]">
                  <li className="flex items-center gap-2 font-medium text-[#1F2937]">
                    <Check className="w-4 h-4 text-[#4361EE]" />
                    <span>Unlimited Active Job Postings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#4361EE]" />
                    <span>Bilingual English & Urdu AI Avatar Interviews</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#4361EE]" />
                    <span>Recharts XAI Radar Score Cards</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#4361EE]" />
                    <span>Real-time Tab Switch Proctoring Telemetry</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#4361EE]" />
                    <span>Priority 24/7 Dedicated Support</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Link href="/auth" className="btn-pill-primary w-full text-center">
                  Get Started Now
                </Link>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="card-bento flex flex-col justify-between">
              <div>
                <div className="text-sm font-mono font-bold text-[#6B7280] uppercase mb-2">Enterprise</div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-extrabold text-[#1F2937]">Custom</span>
                </div>
                <p className="text-xs text-[#6B7280] mb-6">
                  For large enterprises needing custom ATS integrations and SLA guarantees.
                </p>

                <ul className="space-y-3 text-xs text-[#4B5563]">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#10B981]" />
                    <span>Custom ATS & Greenhouse/Workday Integrations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#10B981]" />
                    <span>Dedicated Fine-Tuned AI Models</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#10B981]" />
                    <span>SSO / SAML Authentication</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#10B981]" />
                    <span>Custom SLA & Account Manager</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Link href="/auth" className="btn-pill-secondary w-full text-center">
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="eyebrow-blue">Got Questions?</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937] mt-2 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "How does the PyMuPDF resume knockout filter work?",
              a: "Candidates upload their PDF resume during application. PyMuPDF extracts raw text in under 500ms and feeds it to LangGraph Node 1, which evaluates experience rubrics against job requirements to automatically screen candidates.",
            },
            {
              q: "Are the AI video interviews supported in Urdu and English?",
              a: "Yes! AI-Recruit360 supports natural language speech and transcript processing in both English and Urdu, allowing candidates to articulate technical concepts comfortably in their preferred language.",
            },
            {
              q: "How does the real-time proctoring telemetry prevent cheating?",
              a: "During the assessment and video interview room sessions, visibility listeners automatically capture window blur and tab-switch events, logging every occurrence into the candidate proctor audit timeline for recruiter verification.",
            },
            {
              q: "What is an Explainable AI (XAI) Radar Score?",
              a: "Instead of a black-box score, XAI evaluates candidates across 3 distinct axes: Technical Mastery, Communication Clarity, and Honesty Integrity. It provides exact transcript quotes and Claim vs. Reality reasoning for total transparency.",
            },
          ].map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm transition-all"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-6 text-left flex items-center justify-between font-bold text-[#1F2937] text-base hover:text-[#4361EE]"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-[#6B7280] transition-transform ${
                    openFaq === idx ? "rotate-180 text-[#4361EE]" : ""
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-6 text-sm text-[#6B7280] border-t border-gray-100 pt-4 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer Component */}
      <footer className="bg-white border-t border-gray-200 text-xs text-[#6B7280] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Logo size="md" variant="light" />
            <p className="text-[#6B7280] text-xs leading-relaxed">
              Intelligent recruitment for the modern enterprise. Autonomous AI screening, bilingual video interviews, and XAI evaluations.
            </p>
          </div>

          <div>
            <div className="font-bold text-[#1F2937] uppercase tracking-wider mb-3">Product</div>
            <ul className="space-y-2">
              <li><a href="#platform" className="hover:text-[#4361EE]">Platform Features</a></li>
              <li><a href="#pricing" className="hover:text-[#4361EE]">Pricing Plans</a></li>
              <li><a href="#demo" className="hover:text-[#4361EE]">Live Interactive Demo</a></li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-[#1F2937] uppercase tracking-wider mb-3">Company</div>
            <ul className="space-y-2">
              <li><Link href="/auth" className="hover:text-[#4361EE]">Recruiter Login</Link></li>
              <li><Link href="/dashboard" className="hover:text-[#4361EE]">Dashboard Portal</Link></li>
              <li><a href="#faq" className="hover:text-[#4361EE]">Support & FAQ</a></li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-[#1F2937] uppercase tracking-wider mb-3">Legal</div>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-[#4361EE]">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#4361EE]">Terms of Service</a></li>
              <li><a href="#" className="hover:text-[#4361EE]">Proctoring Ethics</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-[#9CA3AF]">
          <div>© 2026 AI-Recruit360 Enterprise. All rights reserved.</div>
          <div className="mt-2 sm:mt-0 font-mono text-[11px]">Clean Enterprise Edition v2.0</div>
        </div>
      </footer>
    </div>
  );
}
