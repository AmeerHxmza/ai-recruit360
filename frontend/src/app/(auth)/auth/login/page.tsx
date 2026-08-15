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
      <div className="space-y-1.5">
        <h2 className="font-display text-2xl font-medium text-[#F2F5F9]">
          Welcome back
        </h2>
        <p className="font-sans text-xs text-[#9AA6B8]">
          Enter your recruiter credentials to sign in.
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
              <FormItem>
                <label className="eyebrow block mb-1">Email Address *</label>
                <FormControl>
                  <input type="email" placeholder="name@company.com" className="input-enterprise w-full h-11" {...field} />
                </FormControl>
                <FormMessage className="text-[11px] font-mono text-[#EF4444]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <label className="eyebrow block mb-1">Password *</label>
                <FormControl>
                  <input type="password" placeholder="••••••••" className="input-enterprise w-full h-11" {...field} />
                </FormControl>
                <FormMessage className="text-[11px] font-mono text-[#EF4444]" />
              </FormItem>
            )}
          />

          <button
            type="submit"
            className="btn-primary w-full justify-center h-11 text-xs"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </form>
      </Form>

      <div className="pt-2 text-center text-xs text-[#9AA6B8] border-t border-[rgba(148,163,184,0.12)]">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/signup"
          className="text-[#8AB4F8] hover:underline font-mono"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
