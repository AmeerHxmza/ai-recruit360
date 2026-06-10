export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#F4F3FF] to-white border-r border-border text-foreground p-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center font-bold shadow-md">
            AI
          </div>
          <span className="text-xl font-bold tracking-tight text-primary">AI-Recruit360</span>
        </div>

        <div className="space-y-6 max-w-lg">
          <blockquote className="text-2xl font-medium leading-relaxed tracking-tight">
            &ldquo;We cut our hiring time by 70% and eliminated fraudulent candidates completely. The Truthfulness Score is a game changer.&rdquo;
          </blockquote>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              JD
            </div>
            <div>
              <div className="font-semibold">Jane Doe</div>
              <div className="text-sm text-secondary-foreground">VP of Talent, TechCorp</div>
            </div>
          </div>
        </div>

        <div className="text-sm text-muted-foreground font-medium">
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
