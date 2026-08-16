"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { FeedbackToast } from "@/components/ui/feedback-toast";
import { Loader2, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    tone: "success" | "error" | "info";
  } | null>(null);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginForm) {
    setIsSubmitting(true);
    setToast(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email.trim(),
      password: values.password,
    });

    if (error) {
      setToast({
        message: error.message || "Invalid email or password. Please try again.",
        tone: "error",
      });
      setIsSubmitting(false);
      return;
    }

    setToast({ message: "Signed in successfully!", tone: "success" });
    setTimeout(() => router.push("/dashboard"), 600);
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="space-y-1.5 border-b border-gray-100 pb-4">
        <h2 className="font-display text-2xl font-extrabold text-[#1F2937] tracking-tight">
          Welcome back
        </h2>
        <p className="font-sans text-xs text-[#6B7280]">
          Enter your recruiter credentials to sign in to your AI-Recruit360 workspace.
        </p>
      </div>

      {toast && (
        <FeedbackToast
          message={toast.message}
          tone={toast.tone}
          onClose={() => setToast(null)}
        />
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <label className="font-mono text-xs uppercase font-bold text-[#1F2937]">Email Address *</label>
                <FormControl>
                  <input type="email" placeholder="name@company.com" className="w-full h-11 px-4 text-xs font-sans rounded-lg border border-gray-200 text-[#1F2937] focus:ring-2 focus:ring-[#4361EE] focus:outline-none placeholder:text-gray-400" {...field} />
                </FormControl>
                <FormMessage className="text-[11px] font-mono text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <label className="font-mono text-xs uppercase font-bold text-[#1F2937]">Password *</label>
                <FormControl>
                  <input type="password" placeholder="••••••••" className="w-full h-11 px-4 text-xs font-sans rounded-lg border border-gray-200 text-[#1F2937] focus:ring-2 focus:ring-[#4361EE] focus:outline-none placeholder:text-gray-400" {...field} />
                </FormControl>
                <FormMessage className="text-[11px] font-mono text-red-500" />
              </FormItem>
            )}
          />

          <button
            type="submit"
            className="bg-[#4361EE] hover:bg-[#3A56D4] text-white font-bold w-full justify-center h-12 text-xs rounded-full shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <span>Sign In to Dashboard</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </form>
      </Form>

      <div className="pt-4 text-center text-xs text-[#6B7280] border-t border-gray-100 font-sans">
        Don&apos;t have a recruiter account?{" "}
        <Link
          href="/auth/signup"
          className="text-[#4361EE] hover:underline font-bold"
        >
          Create Recruiter Account
        </Link>
      </div>
    </div>
  );
}
