import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronDown, Star, CheckCircle2, Bot, Target } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100">
      {/* Navigation */}
      <header className="flex items-center justify-between px-6 py-6 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-2">
          {/* Logo mimicking the reference */}
          <div className="relative flex items-center justify-center w-8 h-8">
            <div className="absolute w-full h-full border-2 border-[#4A65FF] rounded-full opacity-40"></div>
            <div className="absolute w-5 h-5 border-2 border-[#4A65FF] rounded-full opacity-70"></div>
            <div className="absolute w-2 h-2 bg-[#4A65FF] rounded-full"></div>
          </div>
          <span className="font-bold text-[22px] tracking-tight text-slate-800">
            airecruit360.
          </span>
        </div>
        
        <nav className="hidden lg:flex items-center gap-8 text-[15px] font-medium text-slate-600">
          <Link href="#" className="hover:text-slate-900 flex items-center gap-1 transition-colors">
            Product <ChevronDown className="w-4 h-4 text-slate-400" />
          </Link>
          <Link href="#" className="hover:text-slate-900 flex items-center gap-1 transition-colors">
            Solutions <ChevronDown className="w-4 h-4 text-slate-400" />
          </Link>
          <Link href="#" className="hover:text-slate-900 transition-colors">Pricing</Link>
          <Link href="#" className="hover:text-slate-900 transition-colors">Blog</Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <Link href="/auth/login">
            <Button variant="outline" className="border-slate-200 text-slate-700 font-bold px-6 h-10 hover:bg-slate-50 transition-colors text-xs tracking-wide">
              SIGN IN
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button className="bg-[#4A65FF] hover:bg-[#3B52D9] text-white font-bold px-6 h-10 rounded-md transition-colors text-xs tracking-wide shadow-sm shadow-blue-200">
              SIGN UP
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-[1400px] mx-auto px-6 pt-20 pb-24 flex flex-col lg:flex-row items-center gap-16 lg:gap-8">
        
        {/* Left Content */}
        <div className="flex-1 space-y-8 max-w-xl z-10">
          <h1 className="text-5xl lg:text-[64px] font-bold leading-[1.1] tracking-tight text-slate-900">
            Hire the top 1%<br />
            of talent with<br />
            AI agents
          </h1>
          <p className="text-[19px] text-slate-500 leading-relaxed max-w-md font-medium">
            Automate resume screening, conduct dynamic technical interviews, and make data-driven hiring decisions using advanced AI.
          </p>
          <Link href="/auth/signup" className="inline-block pt-2">
            <Button className="bg-[#4A65FF] hover:bg-[#3B52D9] text-white font-bold px-8 h-[52px] rounded-md transition-colors text-sm tracking-widest uppercase shadow-lg shadow-blue-500/20">
              GET STARTED
            </Button>
          </Link>
        </div>

        {/* Right Content - Abstract UI Mockup mimicking the reference style */}
        <div className="flex-1 relative w-full h-[500px] lg:h-[600px] flex items-center justify-center">
          {/* Background concentric circles */}
          <div className="absolute w-[450px] h-[450px] rounded-full border border-slate-100 bg-slate-50/30 -z-10"></div>
          <div className="absolute w-[280px] h-[280px] rounded-full border border-slate-100 bg-white shadow-xl shadow-slate-200/40 -z-10 flex items-center justify-center">
            {/* Center target icon */}
            <div className="relative flex items-center justify-center w-24 h-24">
              <div className="absolute w-full h-full border-[6px] border-[#4A65FF]/20 rounded-full"></div>
              <div className="absolute w-16 h-16 border-[5px] border-[#4A65FF]/60 rounded-full"></div>
              <div className="absolute w-6 h-6 bg-[#4A65FF] rounded-full"></div>
            </div>
          </div>

          {/* Connected Profile Nodes */}
          <div className="absolute left-[5%] top-[25%] flex items-center gap-4">
             <div className="w-14 h-14 rounded-full bg-indigo-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center relative z-20">
               <img src="https://i.pravatar.cc/150?img=47" alt="Candidate" className="w-full h-full object-cover" />
             </div>
             {/* Connection line */}
             <div className="w-24 h-1 bg-gradient-to-r from-transparent to-[#4A65FF] absolute left-10 top-1/2 -translate-y-1/2 rotate-[15deg] origin-left -z-10 opacity-60"></div>
          </div>

          <div className="absolute left-[0%] top-[50%] flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-emerald-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center relative z-20">
               <img src="https://i.pravatar.cc/150?img=11" alt="Candidate" className="w-full h-full object-cover" />
             </div>
             <div className="w-24 h-1 bg-gradient-to-r from-transparent to-[#4A65FF] absolute left-8 top-1/2 -translate-y-1/2 -rotate-[5deg] origin-left -z-10 opacity-60"></div>
          </div>

          <div className="absolute left-[10%] bottom-[25%] flex items-center gap-4">
             <div className="w-14 h-14 rounded-full bg-amber-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center relative z-20">
               <img src="https://i.pravatar.cc/150?img=33" alt="Candidate" className="w-full h-full object-cover" />
             </div>
             <div className="w-24 h-1 bg-gradient-to-r from-transparent to-[#4A65FF] absolute left-10 top-1/2 -translate-y-1/2 -rotate-[25deg] origin-left -z-10 opacity-60"></div>
          </div>

          {/* Main App Window Mockup */}
          <div className="absolute right-[-5%] lg:right-[0%] top-1/2 -translate-y-1/2 w-[400px] h-[320px] bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col z-30">
            {/* Window Header */}
            <div className="h-4 bg-slate-800 flex items-center px-3 gap-1.5 w-full">
              <div className="w-2 h-2 rounded-full bg-red-400"></div>
              <div className="w-2 h-2 rounded-full bg-amber-400"></div>
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
            </div>
            {/* Split layout inside window */}
            <div className="flex flex-1">
              <div className="flex-1 p-6 flex flex-col justify-center relative">
                {/* Decorative floating line */}
                <div className="absolute -left-16 top-1/2 w-16 h-1 bg-[#4A65FF] -translate-y-1/2"></div>

                <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-2">
                  Top Match
                </div>
                <h3 className="text-2xl font-semibold text-slate-800 mb-1">
                  Hello <span className="text-[#4A65FF]">Alex</span>
                </h3>
                <div className="w-16 h-1.5 bg-slate-200 rounded-full mb-6 mt-3"></div>
                
                <div className="w-24 h-8 bg-[#4A65FF] rounded-md shadow-md mb-8"></div>
                
                {/* Stats Row */}
                <div className="flex items-center gap-4 mt-auto">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Star className="w-3 h-3 text-white fill-white" />
                    </div>
                    <div className="flex text-amber-400">
                      <Star className="w-2.5 h-2.5 fill-amber-400" /><Star className="w-2.5 h-2.5 fill-amber-400" /><Star className="w-2.5 h-2.5 fill-amber-400" /><Star className="w-2.5 h-2.5 fill-amber-400" /><Star className="w-2.5 h-2.5 fill-amber-400" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-[160px] bg-blue-50 relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=600" alt="Professional" className="w-full h-full object-cover" />
                {/* Floating overlay tag */}
                <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded text-[10px] font-bold text-slate-600 shadow-sm">
                  98% Match
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Trust/Social Proof Section */}
      <section className="mt-12 pb-24 flex flex-col items-center">
        <h3 className="text-[17px] font-bold text-slate-700 mb-10">
          Trusted by modern engineering teams around the world
        </h3>
        
        <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16">
          {/* G2 Badge */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#FF492C] flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xl italic font-serif leading-none">G<span className="text-[14px]">2</span></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-lg leading-none">5</span>
                <div className="flex text-[#FFB400] gap-0.5">
                  <Star className="w-4 h-4 fill-[#FFB400]" /><Star className="w-4 h-4 fill-[#FFB400]" /><Star className="w-4 h-4 fill-[#FFB400]" /><Star className="w-4 h-4 fill-[#FFB400]" /><Star className="w-4 h-4 fill-[#FFB400]" />
                </div>
              </div>
              <p className="text-[13px] text-slate-500 mt-1">G2 - 50+ reviews</p>
            </div>
          </div>

          {/* Built In Badge */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#95C11F] flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xl leading-none">B</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-lg leading-none">5</span>
                <div className="flex text-[#FFB400] gap-0.5">
                  <Star className="w-4 h-4 fill-[#FFB400]" /><Star className="w-4 h-4 fill-[#FFB400]" /><Star className="w-4 h-4 fill-[#FFB400]" /><Star className="w-4 h-4 fill-[#FFB400]" /><Star className="w-4 h-4 fill-[#FFB400]" />
                </div>
              </div>
              <p className="text-[13px] text-slate-500 mt-1">Built In - 100+ reviews</p>
            </div>
          </div>

          {/* Capterra Badge */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#003B5C] flex items-center justify-center shadow-sm relative overflow-hidden">
              <div className="absolute w-full h-full bg-gradient-to-tr from-[#00A1E0] to-transparent opacity-50"></div>
              <Target className="w-6 h-6 text-white relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-lg leading-none">5</span>
                <div className="flex text-[#FFB400] gap-0.5">
                  <Star className="w-4 h-4 fill-[#FFB400]" /><Star className="w-4 h-4 fill-[#FFB400]" /><Star className="w-4 h-4 fill-[#FFB400]" /><Star className="w-4 h-4 fill-[#FFB400]" /><Star className="w-4 h-4 fill-[#FFB400]" />
                </div>
              </div>
              <p className="text-[13px] text-slate-500 mt-1">Capterra - 10+ reviews</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
