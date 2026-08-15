import { Cpu, Quote } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#05070D] text-[#9AA6B8] font-sans selection:bg-[#8AB4F8] selection:text-[#06101F]">
      {/* Left Side - Visual Banner */}
      <div className="hidden lg:flex flex-col justify-between bg-[#0A0F18] border-r border-[rgba(148,163,184,0.12)] p-12 relative overflow-hidden">
        {/* Scattered Background Glow */}
        <div className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full bg-[rgba(37,99,235,0.2)] blur-3xl pointer-events-none" />

        {/* Brand */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-8 h-8 rounded-[8px] bg-[#8AB4F8] text-[#06101F] flex items-center justify-center font-bold">
            <Cpu className="w-4 h-4" strokeWidth={1.75} />
          </div>
          <span className="font-display font-medium text-lg text-[#F2F5F9] tracking-tight">
            AI-Recruit<span className="text-[#7DA2F2]">360</span>
          </span>
        </div>

        {/* Quote Card */}
        <div className="space-y-6 max-w-lg relative z-10">
          <div className="eyebrow flex items-center gap-2">
            <Quote className="w-4 h-4 text-[#8AB4F8]" strokeWidth={1.75} />
            <span>Recruiter Review</span>
          </div>
          <blockquote className="font-display text-2xl font-medium text-[#F2F5F9] leading-relaxed">
            &ldquo;We cut our engineering screening time by 70% and eliminated unverified claims. The XAI evidence quote transparency is a total game changer.&rdquo;
          </blockquote>
          <div className="flex items-center gap-4 pt-2">
            <div className="w-10 h-10 rounded-full bg-[rgba(138,180,248,0.10)] border border-[rgba(148,163,184,0.12)] text-[#8AB4F8] font-mono text-xs flex items-center justify-center font-medium">
              JD
            </div>
            <div>
              <div className="font-display text-sm font-medium text-[#F2F5F9]">Jane Doe</div>
              <div className="font-mono text-[11px] text-[#66707F]">VP of Talent, TechCorp</div>
            </div>
          </div>
        </div>

        <div className="font-mono text-[11px] text-[#66707F] relative z-10">
          &copy; {new Date().getFullYear()} AI-Recruit360 Inc. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form Card Container */}
      <div className="flex items-center justify-center p-4 sm:p-8 bg-[#05070D]">
        <div className="w-full max-w-md space-y-6 card-enterprise">
          {children}
        </div>
      </div>
    </div>
  );
}
