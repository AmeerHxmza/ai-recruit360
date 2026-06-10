"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FeedbackToast } from "@/components/ui/feedback-toast";
import { Loader2 } from "lucide-react";
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
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="space-y-1 px-0">
        <CardTitle className="text-2xl font-bold tracking-tight sm:text-3xl">
          Welcome back
        </CardTitle>
        <CardDescription>Enter your email to sign in.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {toast && (
          <FeedbackToast
            className="mb-4"
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@company.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              variant="accent"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="px-0 flex flex-col gap-4">
        <div className="text-center text-sm text-muted-foreground w-full">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="underline underline-offset-4 hover:text-primary font-medium"
          >
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
