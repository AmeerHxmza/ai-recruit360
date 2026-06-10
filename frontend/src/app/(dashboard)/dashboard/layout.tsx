import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { DashboardLayoutClient } from "./layout-client";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // Extract metadata from Supabase Auth User
  const userProfile = {
    fullName: user.user_metadata?.full_name || "Unknown User",
    companyName: user.user_metadata?.company_name || "Unknown Company",
  };

  return (
    <DashboardLayoutClient userProfile={userProfile}>
      {children}
    </DashboardLayoutClient>
  );
}
