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

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  companyName: z.string().min(2, { message: "Company Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export default function SignupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" | "info" } | null>(null);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      companyName: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof signupSchema>) {
    setIsSubmitting(true);
    setToast({ message: "Creating your workspace...", tone: "info" });

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: values.email.trim(),
      password: values.password,
      options: {
        data: {
          full_name: values.name.trim(),
          company_name: values.companyName.trim(),
        },
        emailRedirectTo: `${location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      setToast({ message: error.message || "Failed to create account.", tone: "error" });
      setIsSubmitting(false);
      return;
    }

    setToast({ message: "Please check your email to verify your account!", tone: "success" });
    setIsSubmitting(false);
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="space-y-1.5">
        <h2 className="font-display text-2xl font-medium text-[#F2F5F9]">
          Create an account
        </h2>
        <p className="font-sans text-xs text-[#9AA6B8]">
          Get started with AI-Recruit360 Enterprise
        </p>
      </div>

      {toast ? <FeedbackToast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} /> : null}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <label className="eyebrow block mb-1">Full Name *</label>
                <FormControl>
                  <input placeholder="John Doe" className="input-enterprise w-full h-11" {...field} />
                </FormControl>
                <FormMessage className="text-[11px] font-mono text-[#EF4444]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <label className="eyebrow block mb-1">Company Name *</label>
                <FormControl>
                  <input placeholder="Acme Corp" className="input-enterprise w-full h-11" {...field} />
                </FormControl>
                <FormMessage className="text-[11px] font-mono text-[#EF4444]" />
              </FormItem>
            )}
          />

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

          <button type="submit" className="btn-primary w-full justify-center h-11 text-xs" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </form>
      </Form>

      <div className="pt-2 text-center text-xs text-[#9AA6B8] border-t border-[rgba(148,163,184,0.12)]">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-[#8AB4F8] hover:underline font-mono">
          Sign in
        </Link>
      </div>
    </div>
  );
}
