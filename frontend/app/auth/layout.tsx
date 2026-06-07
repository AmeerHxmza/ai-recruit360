export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#0b1735] to-[#10224f] text-white p-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center font-bold ring-1 ring-white/20">
            AI
          </div>
          <span className="text-xl font-bold tracking-tight">AI-Recruit360</span>
        </div>

        <div className="space-y-6">
          <blockquote className="text-2xl font-medium leading-relaxed">
            &ldquo;We cut our hiring time by 70% and eliminated fraudulent candidates completely. The Truthfulness Score is a game changer.&rdquo;
          </blockquote>
        </div>

        <div className="text-sm text-primary/80">
          © 2026 AI-Recruit360 Inc.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center p-4 sm:p-6 bg-background">
        <div className="w-full max-w-md space-y-8 rounded-2xl border bg-card p-5 shadow-sm sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
