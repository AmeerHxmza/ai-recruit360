import { Quote } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#F4F7FE] text-[#6B7280] font-sans selection:bg-[#4361EE] selection:text-white">
      {/* Left Side - Visual Enterprise Banner */}
      <div className="hidden lg:flex flex-col justify-between bg-[#111827] border-r border-gray-800 p-12 relative overflow-hidden select-none">
        {/* Background Ambient Glow */}
        <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-[#4361EE]/10 blur-3xl pointer-events-none" />

        {/* Official Logo */}
        <div className="relative z-10">
          <Logo size="lg" href="/" variant="dark" />
        </div>

        {/* Recruiter Testimonial Quote Card */}
        <div className="space-y-6 max-w-lg relative z-10 bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10">
          <div className="eyebrow flex items-center gap-2 text-[#4361EE]">
            <Quote className="w-4 h-4 text-[#4361EE]" strokeWidth={2} />
            <span>RECRUITER REVIEW</span>
          </div>
          <blockquote className="font-display text-xl font-bold text-white leading-relaxed">
            &ldquo;We cut our technical screening cycle by 70% while verifying candidate claims. The XAI evidence transparency is a game changer.&rdquo;
          </blockquote>
          <div className="flex items-center gap-4 pt-2">
            <div className="w-10 h-10 rounded-full bg-[#4361EE]/20 border border-[#4361EE]/30 text-white font-mono text-xs flex items-center justify-center font-bold">
              VP
            </div>
            <div>
              <div className="font-display text-sm font-bold text-white">Talent Acquisition Lead</div>
              <div className="font-mono text-[11px] text-gray-400">Enterprise AI Engineering</div>
            </div>
          </div>
        </div>

        <div className="font-mono text-xs text-gray-500 relative z-10">
          &copy; {new Date().getFullYear()} AI-Recruit360. All rights reserved.
        </div>
      </div>

      {/* Right Side - Center Form Card Container */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-[#F4F7FE]">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-10 space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}
