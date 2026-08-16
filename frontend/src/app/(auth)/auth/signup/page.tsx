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
      <div className="space-y-1.5 border-b border-gray-100 pb-4">
        <h2 className="font-display text-2xl font-extrabold text-[#1F2937] tracking-tight">
          Create Recruiter Account
        </h2>
        <p className="font-sans text-xs text-[#6B7280]">
          Get started with AI-Recruit360 Enterprise Talent Intelligence.
        </p>
      </div>

      {toast ? <FeedbackToast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} /> : null}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <label className="font-mono text-xs uppercase font-bold text-[#1F2937]">Full Name *</label>
                <FormControl>
                  <input placeholder="Jane Doe" className="w-full h-11 px-4 text-xs font-sans rounded-lg border border-gray-200 text-[#1F2937] focus:ring-2 focus:ring-[#4361EE] focus:outline-none placeholder:text-gray-400" {...field} />
                </FormControl>
                <FormMessage className="text-[11px] font-mono text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <label className="font-mono text-xs uppercase font-bold text-[#1F2937]">Company Name *</label>
                <FormControl>
                  <input placeholder="Acme Inc" className="w-full h-11 px-4 text-xs font-sans rounded-lg border border-gray-200 text-[#1F2937] focus:ring-2 focus:ring-[#4361EE] focus:outline-none placeholder:text-gray-400" {...field} />
                </FormControl>
                <FormMessage className="text-[11px] font-mono text-red-500" />
              </FormItem>
            )}
          />

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
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            <span>Create Recruiter Account</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </form>
      </Form>

      <div className="pt-4 text-center text-xs text-[#6B7280] border-t border-gray-100 font-sans">
        Already have a recruiter account?{" "}
        <Link href="/auth/login" className="text-[#4361EE] hover:underline font-bold">
          Sign In
        </Link>
      </div>
    </div>
  );
}
