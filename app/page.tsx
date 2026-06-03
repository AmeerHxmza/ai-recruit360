import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TruthfulnessScore } from "@/components/truthfulness-score";
import { 
  Link as LinkIcon, 
  FileText, 
  Cpu, 
  Mic, 
  Radar, 
  Globe, 
  CheckCircle2,
  ChevronRight
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans tracking-tight">
      {/* 1. Premium Navbar (Dark Theme) */}
      <header className="fixed top-0 z-50 w-full bg-[#0F172A] border-b border-slate-800">
        <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#0EA5E9] rounded-sm" />
            <span className="text-lg font-bold text-white tracking-tight">AI-Recruit360</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#64748B]">
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-white hover:bg-white/10 hidden sm:inline-flex rounded-md text-sm font-medium" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button className="bg-[#0EA5E9] text-white hover:bg-[#0EA5E9]/90 rounded-md text-sm font-medium h-9 px-6 shadow-none" asChild>
              <Link href="/auth/signup">Start Hiring</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* 2. The "Linear-Style" Hero Section (Dark Theme) */}
        <section className="bg-[#0F172A] pt-24 pb-32 px-6 lg:px-8 relative text-center">
          <div className="mx-auto w-full max-w-[1280px] flex flex-col items-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center rounded-md border border-slate-800 bg-[#0F172A] px-3 py-1 text-xs font-medium text-[#64748B]">
              v1.0 Now Live — Powered by Agentic AI
            </div>
            
            {/* Headline */}
            <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-6 max-w-4xl leading-[1.1]">
              Automate Technical Hiring. <br className="hidden md:block" /> Eliminate Bias.
            </h1>
            
            {/* Subheadline */}
            <p className="text-[#64748B] text-lg max-w-2xl mb-10 leading-relaxed">
              The only recruitment platform that parses resumes, extracts real projects, and conducts live bilingual video interviews autonomously.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-16">
              <Button size="lg" className="bg-[#0EA5E9] text-white hover:bg-[#0EA5E9]/90 rounded-md h-12 px-8 text-base shadow-none" asChild>
                <Link href="/auth/signup">Start Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-slate-800 text-white hover:bg-slate-800 bg-transparent rounded-md h-12 px-8 text-base shadow-none" asChild>
                <Link href="#demo">
                  View Interactive Demo
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Dashboard Preview Mockup */}
        <section className="relative -mt-24 px-6 lg:px-8 z-10" id="demo">
          <div className="mx-auto w-full max-w-[1024px]">
            <div className="rounded-t-xl border border-slate-800 bg-[#0F172A] shadow-2xl overflow-hidden flex flex-col">
              {/* Mockup Header */}
              <div className="h-12 border-b border-slate-800 flex items-center px-4 gap-4 bg-[#0F172A]">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                </div>
                <div className="flex-1 max-w-md mx-auto h-6 rounded bg-slate-800 border border-slate-700" />
              </div>
              {/* Mockup Body (Recruiter Dashboard) */}
              <div className="bg-[#0F172A] p-6 text-left min-h-[400px]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-white font-medium">Active Candidates</h3>
                  <div className="h-8 w-64 bg-slate-800 rounded border border-slate-700" />
                </div>
                
                <div className="border border-slate-800 rounded-md overflow-hidden bg-[#0F172A]">
                  <div className="grid grid-cols-4 border-b border-slate-800 p-3 text-xs font-medium text-[#64748B] bg-slate-900/50">
                    <div>Name</div>
                    <div>Role</div>
                    <div>Status</div>
                    <div>Match Score</div>
                  </div>
                  <div className="grid grid-cols-4 p-3 border-b border-slate-800 items-center text-sm hover:bg-slate-800/50">
                    <div className="text-white font-medium">Liam Johnson</div>
                    <div className="text-[#64748B]">Frontend Engineer</div>
                    <div><span className="text-[#0EA5E9] bg-[#0EA5E9]/10 px-2 py-1 rounded text-xs">Interviewed</span></div>
                    <div><TruthfulnessScore score={92} size="sm" showLabel={false} /></div>
                  </div>
                  <div className="grid grid-cols-4 p-3 border-b border-slate-800 items-center text-sm hover:bg-slate-800/50">
                    <div className="text-white font-medium">Emma Wilson</div>
                    <div className="text-[#64748B]">Backend Developer</div>
                    <div><span className="text-green-500 bg-green-500/10 px-2 py-1 rounded text-xs">Verified</span></div>
                    <div><TruthfulnessScore score={85} size="sm" showLabel={false} /></div>
                  </div>
                  <div className="grid grid-cols-4 p-3 items-center text-sm hover:bg-slate-800/50">
                    <div className="text-white font-medium">Noah Brown</div>
                    <div className="text-[#64748B]">Fullstack Engineer</div>
                    <div><span className="text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded text-xs">Flagged</span></div>
                    <div><TruthfulnessScore score={45} size="sm" showLabel={false} /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Logo Cloud (Social Proof - Light Theme) */}
        <section className="bg-[#F8FAFC] py-20 px-6 lg:px-8 border-b border-gray-200">
          <div className="mx-auto w-full max-w-[1280px] text-center">
            <p className="text-sm font-medium text-[#64748B] mb-8">Trusted by forward-thinking engineering teams:</p>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale">
              {/* Using generic placeholders to represent company logos */}
              <div className="text-xl font-bold font-serif text-[#0F172A]">Acme Corp</div>
              <div className="text-xl font-black uppercase text-[#0F172A]">GlobalTech</div>
              <div className="text-xl font-semibold tracking-widest text-[#0F172A]">NEXUS</div>
              <div className="text-xl font-bold italic text-[#0F172A]">Vertex</div>
              <div className="text-xl font-extrabold text-[#0F172A]">Quantum</div>
            </div>
          </div>
        </section>

        {/* 4. "How It Works" Pipeline (Light Theme) */}
        <section id="how-it-works" className="bg-white py-24 px-6 lg:px-8 border-b border-gray-200">
          <div className="mx-auto w-full max-w-[1280px]">
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-[#0F172A] tracking-tight">From Job Post to Final Hire in Minutes.</h2>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="p-6 border border-gray-200 rounded-md bg-white">
                <div className="w-10 h-10 border border-gray-200 rounded-md flex items-center justify-center mb-6 bg-[#F8FAFC]">
                  <LinkIcon className="w-5 h-5 text-[#0F172A]" />
                </div>
                <h3 className="text-base font-bold text-[#0F172A] mb-2">Step 1: Create & Share</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  Post a job, define the technical requirements, and get a custom application link instantly.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-6 border border-gray-200 rounded-md bg-white">
                <div className="w-10 h-10 border border-gray-200 rounded-md flex items-center justify-center mb-6 bg-[#F8FAFC]">
                  <FileText className="w-5 h-5 text-[#0F172A]" />
                </div>
                <h3 className="text-base font-bold text-[#0F172A] mb-2">Step 2: Smart Knockout</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  Candidates upload PDFs. AI parses real experience and instantly verifies it against the JD.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-6 border border-gray-200 rounded-md bg-white">
                <div className="w-10 h-10 border border-gray-200 rounded-md flex items-center justify-center mb-6 bg-[#F8FAFC]">
                  <Cpu className="w-5 h-5 text-[#0F172A]" />
                </div>
                <h3 className="text-base font-bold text-[#0F172A] mb-2">Step 3: Dynamic Gen</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  LangGraph AI generates 10 custom questions based strictly on the candidate's actual GitHub/CV projects.
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-6 border border-gray-200 rounded-md bg-white">
                <div className="w-10 h-10 border border-gray-200 rounded-md flex items-center justify-center mb-6 bg-[#F8FAFC]">
                  <Mic className="w-5 h-5 text-[#0F172A]" />
                </div>
                <h3 className="text-base font-bold text-[#0F172A] mb-2">Step 4: Avatar Interview</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  The Simli API avatar conducts the interview in English or Urdu and grades the transcript.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Deep-Dive Features (Zig-Zag Layout - Light Theme) */}
        <section id="features" className="bg-[#F8FAFC] py-24 px-6 lg:px-8 border-b border-gray-200">
          <div className="mx-auto w-full max-w-[1024px] flex flex-col gap-24">
            
            {/* Feature A */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <div className="w-10 h-10 border border-gray-200 rounded-md flex items-center justify-center mb-6 bg-white shadow-sm">
                  <Radar className="w-5 h-5 text-[#0EA5E9]" />
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-4">Don't trust black boxes. <br />See the exact reasoning.</h3>
                <p className="text-[#64748B] text-base leading-relaxed mb-6">
                  Our Explainable AI provides a detailed breakdown of every candidate's score. Review the Radar Chart covering Technical ability, Communication, and Honesty based on verifiable facts.
                </p>
              </div>
              <div className="flex-1 w-full">
                <div className="border border-gray-200 rounded-md bg-white p-6 shadow-sm flex flex-col items-center">
                  {/* Mock Radar Chart */}
                  <div className="w-48 h-48 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center relative mb-6">
                    <div className="absolute top-0 text-xs font-medium text-[#64748B] -mt-5">Technical</div>
                    <div className="absolute bottom-4 left-0 text-xs font-medium text-[#64748B] -ml-4">Honesty</div>
                    <div className="absolute bottom-4 right-0 text-xs font-medium text-[#64748B] -mr-6">Comms</div>
                    <div className="w-32 h-32 bg-[#0EA5E9]/10 border border-[#0EA5E9]/30" style={{ clipPath: 'polygon(50% 0%, 100% 75%, 0% 100%)' }} />
                  </div>
                  <div className="w-full bg-[#F8FAFC] border border-gray-200 rounded text-xs p-3 font-mono text-[#64748B]">
                    &gt; AI Reasoning Log:<br/>
                    Found matching project: "React-Dashboard"<br/>
                    Verified commits: 142<br/>
                    Confidence Score: 0.94
                  </div>
                </div>
              </div>
            </div>

            {/* Feature B */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="flex-1">
                <div className="w-10 h-10 border border-gray-200 rounded-md flex items-center justify-center mb-6 bg-white shadow-sm">
                  <Globe className="w-5 h-5 text-[#0EA5E9]" />
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-4">Speak their language.</h3>
                <p className="text-[#64748B] text-base leading-relaxed mb-6">
                  Evaluate true engineering talent without language barriers. Our autonomous avatar switches seamlessly between English and Urdu, focusing on problem-solving ability rather than accent or fluency constraints.
                </p>
              </div>
              <div className="flex-1 w-full">
                <div className="border border-gray-200 rounded-md bg-white p-6 shadow-sm">
                  <div className="flex gap-4 mb-4">
                    <Button variant="outline" size="sm" className="bg-[#F8FAFC] border-gray-200 shadow-none h-8 rounded text-xs font-medium text-[#0F172A]">English Mode</Button>
                    <Button size="sm" className="bg-[#0EA5E9] text-white shadow-none h-8 rounded text-xs font-medium border border-[#0EA5E9]">Urdu Mode (Active)</Button>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-[#F8FAFC] border border-gray-200 rounded p-3 text-sm text-[#64748B] flex gap-3">
                      <div className="w-6 h-6 rounded-sm bg-[#0F172A] flex-shrink-0" />
                      <p>"Can you explain how you optimized the database queries in your last project?"</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded p-3 text-sm text-[#0F172A] flex gap-3 flex-row-reverse">
                      <div className="w-6 h-6 rounded-sm bg-[#0EA5E9]/20 flex-shrink-0" />
                      <p className="text-right">"Maine indexes create kiye the aur N+1 queries ko resolve kiya tha using eager loading..."</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 6. Enterprise Pricing Cards (Light Theme) */}
        <section id="pricing" className="bg-[#F8FAFC] py-24 px-6 lg:px-8 border-b border-gray-200">
          <div className="mx-auto w-full max-w-[1024px]">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold text-[#0F172A] tracking-tight">Simple, transparent pricing.</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Tier 1 (Starter) */}
              <div className="bg-white border border-gray-200 rounded-md p-8 flex flex-col">
                <h3 className="text-lg font-bold text-[#0F172A] mb-2">Starter</h3>
                <div className="text-3xl font-bold text-[#0F172A] mb-6">Free</div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-2 text-sm text-[#64748B]"><CheckCircle2 className="w-4 h-4 text-[#0EA5E9]" /> Basic PDF parsing</li>
                  <li className="flex items-center gap-2 text-sm text-[#64748B]"><CheckCircle2 className="w-4 h-4 text-[#0EA5E9]" /> 5 interviews/month</li>
                  <li className="flex items-center gap-2 text-sm text-[#64748B]"><CheckCircle2 className="w-4 h-4 text-[#0EA5E9]" /> Email support</li>
                </ul>
                <Button variant="outline" className="w-full border-gray-200 text-[#0F172A] shadow-none rounded-md">Get Started</Button>
              </div>

              {/* Tier 2 (Pro) */}
              <div className="bg-white border border-[#0EA5E9] rounded-md p-8 flex flex-col relative shadow-sm">
                <div className="absolute top-0 right-0 bg-[#0EA5E9] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-bl-md rounded-tr-md">Most Popular</div>
                <h3 className="text-lg font-bold text-[#0F172A] mb-2">Pro</h3>
                <div className="text-3xl font-bold text-[#0F172A] mb-6">$49<span className="text-sm font-normal text-[#64748B]">/mo</span></div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-2 text-sm text-[#64748B]"><CheckCircle2 className="w-4 h-4 text-[#0EA5E9]" /> Unlimited parsing</li>
                  <li className="flex items-center gap-2 text-sm text-[#64748B]"><CheckCircle2 className="w-4 h-4 text-[#0EA5E9]" /> 50 Avatar Interviews</li>
                  <li className="flex items-center gap-2 text-sm text-[#64748B]"><CheckCircle2 className="w-4 h-4 text-[#0EA5E9]" /> Urdu/English support</li>
                  <li className="flex items-center gap-2 text-sm text-[#64748B]"><CheckCircle2 className="w-4 h-4 text-[#0EA5E9]" /> XAI Radar Charts</li>
                </ul>
                <Button className="w-full bg-[#0EA5E9] text-white hover:bg-[#0EA5E9]/90 shadow-none rounded-md">Start Pro Trial</Button>
              </div>

              {/* Tier 3 (Enterprise) */}
              <div className="bg-white border border-gray-200 rounded-md p-8 flex flex-col">
                <h3 className="text-lg font-bold text-[#0F172A] mb-2">Enterprise</h3>
                <div className="text-3xl font-bold text-[#0F172A] mb-6">Custom</div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-2 text-sm text-[#64748B]"><CheckCircle2 className="w-4 h-4 text-[#0EA5E9]" /> Custom Avatar cloning</li>
                  <li className="flex items-center gap-2 text-sm text-[#64748B]"><CheckCircle2 className="w-4 h-4 text-[#0EA5E9]" /> API access</li>
                  <li className="flex items-center gap-2 text-sm text-[#64748B]"><CheckCircle2 className="w-4 h-4 text-[#0EA5E9]" /> ATS Integration</li>
                  <li className="flex items-center gap-2 text-sm text-[#64748B]"><CheckCircle2 className="w-4 h-4 text-[#0EA5E9]" /> Priority support</li>
                </ul>
                <Button className="w-full bg-[#0F172A] text-white hover:bg-[#0F172A]/90 shadow-none rounded-md">Contact Sales</Button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* 7. Final CTA & Footer (Dark Theme) */}
      <footer className="bg-[#0F172A] pt-24 pb-12 px-6 lg:px-8 border-t border-slate-800">
        <div className="mx-auto w-full max-w-[1280px]">
          <div className="text-center mb-24">
            <h2 className="text-3xl font-bold text-white tracking-tight mb-8">
              Ready to build your dream engineering team?
            </h2>
            <Button size="lg" className="bg-[#0EA5E9] text-white hover:bg-[#0EA5E9]/90 rounded-md h-12 px-8 text-base shadow-none" asChild>
              <Link href="/auth/signup">Create Recruiter Account</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-slate-800 text-sm text-[#64748B]">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 bg-[#0EA5E9] rounded-sm" />
                <span className="font-bold text-white tracking-tight">AI-Recruit360</span>
              </div>
              <p className="mb-4">Automating technical hiring with Zero Bias.</p>
              <p>© {new Date().getFullYear()} AI-Recruit360</p>
            </div>
            
            <div>
              <h4 className="font-medium text-white mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Integrations</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Changelog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-white mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Case Studies</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
