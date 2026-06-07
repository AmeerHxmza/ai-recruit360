"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TruthfulnessScore } from "@/components/truthfulness-score";
import {
  Briefcase,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  Fingerprint,
  LineChart,
  Code2,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

const easeOut = [0.16, 1, 0.3, 1] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOut } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* ─── Navbar ─────────────────────────────────── */}
      <header className="fixed top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-6 lg:px-8 flex h-14 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center w-7 h-7 rounded-lg shadow-sm"
              style={{ background: "linear-gradient(135deg, #0052FF, #4D7CFF)" }}
            >
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-foreground tracking-tight">AI Recruit360</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="#platform" className="hover:text-foreground transition-colors duration-150">Platform</Link>
            <Link href="#verification" className="hover:text-foreground transition-colors duration-150">Verification</Link>
            <Link href="#customers" className="hover:text-foreground transition-colors duration-150">Customers</Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors duration-150">Pricing</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/auth/signup" className="group flex items-center gap-1.5">
                Book Demo
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-14">
        {/* ─── Hero ─────────────────────────────────── */}
        <section className="relative overflow-hidden bg-background pt-24 pb-20 lg:pt-32 lg:pb-28 px-6 lg:px-8">
          {/* Radial glow decorations */}
          <div
            className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(0,82,255,0.07), transparent 70%)" }}
          />
          <div
            className="absolute -bottom-20 -left-40 w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(77,124,255,0.05), transparent 70%)" }}
          />

          <div className="mx-auto w-full max-w-6xl">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
              {/* Left — Text */}
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="flex flex-col items-start"
              >
                {/* Section badge */}
                <motion.div variants={fadeInUp} className="mb-8">
                  <div className="section-label">
                    <span className="section-label-dot-pulse" />
                    <span className="section-label-text">AI-Powered Recruiting</span>
                  </div>
                </motion.div>

                {/* Headline */}
                <motion.h1
                  variants={fadeInUp}
                  className="text-[2.75rem] sm:text-5xl lg:text-[5.25rem] leading-[1.05] tracking-[-0.02em] mb-6 max-w-xl"
                  style={{ fontFamily: "var(--font-calistoga), Georgia, serif" }}
                >
                  Hire With Evidence.{" "}
                  <span className="relative inline-block">
                    <span className="gradient-text">Not Assumptions.</span>
                    <span
                      className="absolute bottom-[-0.25rem] left-0 h-3 w-full rounded-sm pointer-events-none"
                      style={{ background: "linear-gradient(to right, rgba(0,82,255,0.12), rgba(77,124,255,0.06))" }}
                    />
                  </span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                  variants={fadeInUp}
                  className="text-muted-foreground text-lg leading-relaxed max-w-lg mb-10"
                >
                  AI Recruit360 verifies candidate qualifications, evaluates performance, and
                  generates a{" "}
                  <span className="text-foreground font-medium">Hiring Confidence Score</span>{" "}
                  before recruiters invest valuable time.
                </motion.p>

                {/* CTAs */}
                <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Button size="lg" className="group" asChild>
                    <Link href="/auth/signup" className="flex items-center gap-2">
                      Start Evaluating Candidates
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="#demo">Book a Demo</Link>
                  </Button>
                </motion.div>

                {/* Trust signal */}
                <motion.div variants={fadeInUp} className="flex items-center gap-3 mt-10">
                  <div className="flex -space-x-2">
                    {["R", "B", "V", "S"].map((l, i) => (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ background: `hsl(${220 + i * 12}, 80%, ${45 + i * 5}%)` }}
                      >
                        {l}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Trusted by <span className="text-foreground font-semibold">200+</span> engineering teams
                  </p>
                </motion.div>
              </motion.div>

              {/* Right — Animated Graphic */}
              <motion.div
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                className="relative hidden lg:flex items-center justify-center"
              >
                {/* Abstract hero graphic */}
                <div className="relative w-[400px] h-[400px]">
                  {/* Rotating outer ring */}
                  <div className="animate-spin-slow absolute inset-0 rounded-full border-2 border-dashed border-primary/20" />
                  {/* Inner ring */}
                  <div
                    className="absolute inset-6 rounded-full"
                    style={{ border: "1px solid rgba(0,82,255,0.1)" }}
                  />

                  {/* Central orb */}
                  <div
                    className="absolute inset-[60px] rounded-full flex items-center justify-center shadow-xl"
                    style={{ background: "linear-gradient(135deg, #0052FF 0%, #4D7CFF 100%)" }}
                  >
                    <ShieldCheck className="w-16 h-16 text-white/90" />
                  </div>

                  {/* Floating card 1 — top right */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
                    className="absolute -top-4 -right-4 bg-card rounded-xl border border-border shadow-xl p-3 w-44"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      <span className="text-[11px] font-semibold text-foreground">Verified Match</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Liam Johnson • 96% match</p>
                    <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full w-[96%]" style={{ background: "linear-gradient(to right, #0052FF, #4D7CFF)" }} />
                    </div>
                  </motion.div>

                  {/* Floating card 2 — bottom left */}
                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 4, ease: "easeInOut", delay: 0.8, repeat: Infinity }}
                    className="absolute -bottom-6 -left-6 bg-card rounded-xl border border-border shadow-xl p-3 w-40"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Zap className="w-3 h-3 text-primary" />
                      <span className="text-[11px] font-semibold text-foreground">Confidence Score</span>
                    </div>
                    <div className="text-2xl font-bold gradient-text">87%</div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Strong Candidate</p>
                  </motion.div>

                  {/* Dot grid decoration */}
                  <div className="absolute top-2 left-2 grid grid-cols-3 gap-2 opacity-30">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Dashboard Preview Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-20 w-full rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden"
            >
              <div className="h-10 border-b border-border flex items-center px-4 gap-4 bg-muted/40">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="w-72 h-5 rounded bg-background border border-border flex items-center px-3 text-[10px] text-muted-foreground gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-primary" />
                    ai-recruit360.com/dashboard/candidates
                  </div>
                </div>
              </div>

              <div className="bg-background p-6 min-h-[380px]">
                <div className="flex justify-between items-end mb-5">
                  <div>
                    <h3 className="text-foreground text-base font-semibold tracking-tight">Software Engineer, Core Infrastructure</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">42 Candidates Processed • 12 Verified</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-28 bg-surface rounded-lg border border-border" />
                    <div className="h-8 w-8 rounded-lg" style={{ background: "linear-gradient(135deg, #0052FF, #4D7CFF)" }} />
                  </div>
                </div>

                <div className="border border-border rounded-xl overflow-hidden bg-surface">
                  <div className="grid grid-cols-6 border-b border-border p-3 text-[11px] font-semibold text-muted-foreground bg-muted/20 uppercase tracking-wider">
                    <div className="col-span-2">Candidate</div>
                    <div>Match %</div>
                    <div>Truthfulness</div>
                    <div>Interview</div>
                    <div>Status</div>
                  </div>
                  {[
                    { name: "Liam Johnson", match: "96%", interview: "92%", score: 98, status: "Verified", statusColor: "text-success bg-success/10 border-success/20" },
                    { name: "Emma Wilson", match: "88%", interview: "89%", score: 85, status: "Strong Match", statusColor: "text-primary bg-primary/10 border-primary/20" },
                    { name: "Noah Brown", match: "92%", interview: "41%", score: 35, status: "Risk Detected", statusColor: "text-destructive bg-destructive/10 border-destructive/20" },
                  ].map((row, i) => (
                    <div key={i} className="grid grid-cols-6 p-3 border-b last:border-0 border-border items-center text-sm hover:bg-muted/10 transition-colors">
                      <div className="col-span-2 text-foreground font-medium">{row.name}</div>
                      <div className="font-medium">{row.match}</div>
                      <div><TruthfulnessScore score={row.score} size="sm" showLabel={false} /></div>
                      <div className="text-muted-foreground">{row.interview}</div>
                      <div>
                        <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold uppercase tracking-wider ${row.statusColor}`}>
                          {row.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── Logo Cloud ─────────────────────────────── */}
        <section className="bg-background py-16 px-6 lg:px-8 border-y border-border">
          <div className="mx-auto w-full max-w-6xl text-center">
            <p className="text-[11px] font-mono font-medium text-muted-foreground uppercase tracking-[0.2em] mb-10">
              Trusted by operational engineering teams at
            </p>
            <div className="flex flex-wrap justify-center items-center gap-x-14 gap-y-6 opacity-50 grayscale">
              {["Ramp", "Brex", "Vercel", "Retool", "Scale AI"].map((name) => (
                <span key={name} className="text-xl font-bold text-foreground tracking-tight">{name}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Features (Inverted Section) ──────────── */}
        <section id="platform" className="relative overflow-hidden section-inverted py-28 lg:py-36 px-6 lg:px-8">
          {/* Dot grid texture */}
          <div className="absolute inset-0 dot-grid pointer-events-none" />
          {/* Radial glows */}
          <div
            className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(0,82,255,0.12), transparent 70%)" }}
          />

          <div className="relative mx-auto w-full max-w-6xl">
            {/* Section label */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/5 px-4 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse-dot" />
                <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/70 font-medium">
                  Platform Capabilities
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7 }}
              className="mb-14"
            >
              <h2 className="text-3xl lg:text-[3.25rem] leading-[1.1] text-white mb-4">
                Candidate Verification +{" "}
                <span className="gradient-text">Hiring Confidence.</span>
              </h2>
              <p className="text-white/60 text-lg max-w-2xl leading-relaxed">
                A complete evaluation pipeline that answers one question: Can I trust this candidate enough to move forward?
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-5">
              {/* Feature 1 — wide, gradient border */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="col-span-1 md:col-span-2"
              >
                <div className="rounded-xl p-[1.5px] h-full" style={{ background: "linear-gradient(135deg, #0052FF, #4D7CFF)" }}>
                  <div className="h-full rounded-[calc(0.75rem-1.5px)] bg-foreground/95 p-8">
                    <div className="flex items-center justify-center w-11 h-11 rounded-xl mb-6" style={{ background: "linear-gradient(135deg, #0052FF, #4D7CFF)" }}>
                      <Fingerprint className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Candidate Matching & Truthfulness</h3>
                    <p className="text-sm text-white/50 leading-relaxed max-w-md">
                      Does the candidate fit the role, and how trustworthy is the information provided? Our engines cross-reference history and past repositories to detect risk instantly.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Feature 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="col-span-1 rounded-xl border border-white/10 bg-white/5 p-8 hover:bg-white/[0.07] transition-colors duration-300"
              >
                <div className="flex items-center justify-center w-11 h-11 rounded-xl mb-6" style={{ background: "linear-gradient(135deg, #0052FF, #4D7CFF)" }}>
                  <BrainCircuit className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Skill Verification</h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  Can the candidate demonstrate the skills claimed? Evaluate real engineering architecture and decisions automatically.
                </p>
              </motion.div>

              {/* Feature 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="col-span-1 rounded-xl border border-white/10 bg-white/5 p-8 hover:bg-white/[0.07] transition-colors duration-300"
              >
                <div className="flex items-center justify-center w-11 h-11 rounded-xl mb-6" style={{ background: "linear-gradient(135deg, #0052FF, #4D7CFF)" }}>
                  <Code2 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Interview Intelligence</h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  How did the candidate perform? Questions are generated dynamically targeting specific application claims to validate actual knowledge.
                </p>
              </motion.div>

              {/* Feature 4 — gradient bg */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="col-span-1 md:col-span-2 rounded-xl p-8 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #0052FF, #4D7CFF)" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                <div className="relative">
                  <LineChart className="w-5 h-5 text-white/70 mb-6" />
                  <h3 className="text-lg font-semibold text-white mb-2">Hiring Confidence Score</h3>
                  <p className="text-sm text-white/70 leading-relaxed max-w-md">
                    Should you move forward? By the time you open the dashboard, applicants are strictly ranked with a comprehensive score so you can confidently identify the best candidates.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── Pricing ─────────────────────────────────── */}
        <section id="pricing" className="bg-background py-28 lg:py-36 px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">
            {/* Section label */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <div className="section-label">
                <span className="section-label-dot" />
                <span className="section-label-text">Pricing</span>
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7 }}
              className="text-3xl lg:text-[3.25rem] leading-[1.1] mb-16"
            >
              Enterprise Pricing.{" "}
              <span className="gradient-text">No Surprises.</span>
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
              {/* Tier 1 — Professional */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-card border border-border rounded-2xl p-8 flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <h3 className="text-base font-semibold text-foreground mb-2">Professional</h3>
                <div className="text-4xl font-bold text-foreground mb-1 tracking-tight">
                  $499<span className="text-base font-medium text-muted-foreground">/mo</span>
                </div>
                <p className="text-sm text-muted-foreground mb-8">For growing teams hiring up to 10 roles concurrently.</p>
                <ul className="space-y-3.5 mb-8 flex-1">
                  {["Full Verification Engine", "500 Automated Interviews / month", "ATS Integrations"].map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full">Start Trial</Button>
              </motion.div>

              {/* Tier 2 — Enterprise (gradient border, elevated) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
                style={{ marginTop: "-12px" }}
              >
                <div className="rounded-2xl p-[2px] shadow-[0_8px_24px_rgba(0,82,255,0.25)]" style={{ background: "linear-gradient(135deg, #0052FF, #4D7CFF)" }}>
                  <div className="rounded-[calc(1rem-2px)] bg-card p-8 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-base font-semibold text-foreground">Enterprise</h3>
                      <span className="section-label" style={{ padding: "2px 10px", fontSize: "10px" }}>
                        <span className="section-label-dot" style={{ width: "5px", height: "5px" }} />
                        <span className="section-label-text" style={{ fontSize: "10px", letterSpacing: "0.12em" }}>Popular</span>
                      </span>
                    </div>
                    <div className="text-4xl font-bold text-foreground mb-1 tracking-tight">Custom</div>
                    <p className="text-sm text-muted-foreground mb-8">For operational teams requiring unlimited scale and custom models.</p>
                    <ul className="space-y-3.5 mb-8 flex-1">
                      {[
                        "Unlimited Automated Interviews",
                        "Custom Evaluation Modules",
                        "SOC2 Compliance Reports",
                        "Dedicated Account Manager",
                      ].map((f) => (
                        <li key={f} className="flex items-center gap-3 text-sm text-foreground">
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full group">
                      Contact Sales
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      {/* ─── Footer ─────────────────────────────────── */}
      <footer className="bg-card pt-16 pb-8 px-6 lg:px-8 border-t border-border">
        <div className="mx-auto w-full max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-border text-sm">
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="flex items-center justify-center w-6 h-6 rounded-lg shadow-sm"
                  style={{ background: "linear-gradient(135deg, #0052FF, #4D7CFF)" }}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-foreground tracking-tight">AI Recruit360</span>
              </div>
              <p className="text-muted-foreground max-w-xs mb-6 leading-relaxed">
                Autonomous Hiring Intelligence Platform for modern engineering teams.
              </p>
              <div className="flex gap-3">
                {["X", "Li", "Gh"].map((s) => (
                  <div
                    key={s}
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors duration-150 cursor-pointer"
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-3 text-muted-foreground">
                {["Platform", "Verification", "Interviews", "Pricing"].map((l) => (
                  <li key={l}><Link href="#" className="hover:text-foreground transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-3 text-muted-foreground">
                {["About Us", "Careers", "Blog", "Contact"].map((l) => (
                  <li key={l}><Link href="#" className="hover:text-foreground transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-3 text-muted-foreground">
                {["Privacy Policy", "Terms of Service", "Security"].map((l) => (
                  <li key={l}><Link href="#" className="hover:text-foreground transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 flex justify-between items-center text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} AI Recruit360 Inc. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span>System Status: Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
