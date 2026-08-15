import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://hkybdnbrrdjkrotwftrn.supabase.co";

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhreWJkbmJycmRqa3JvdHdmdHJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3Njc1NjEsImV4cCI6MjEwMjM0MzU2MX0.n6CfsNz32OH-jPK0unDY9outlr0kFHRIlwKqN6pW4ss";

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey,
  );
