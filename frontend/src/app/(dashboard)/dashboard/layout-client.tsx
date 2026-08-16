"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Settings,
  Menu,
  LogOut,
  Bell,
  ClipboardCheck,
  Video,
  TrendingUp,
  BarChart3,
  ChevronRight,
  ShieldCheck,
  Search,
  Command
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/logo";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
  { label: "Candidates", href: "/dashboard/candidates", icon: Users },
  { label: "Assessments", href: "/dashboard/assessments", icon: ClipboardCheck },
  { label: "AI Interviews", href: "/dashboard/interviews", icon: Video },
  { label: "Rankings & XAI", href: "/dashboard/rankings", icon: TrendingUp },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function SidebarContent({ pathname }: { pathname: string }) {
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };

  return (
    <div className="flex h-full flex-col bg-[#111827] text-gray-300 border-r border-gray-800 select-none font-sans overflow-hidden">
      {/* Brand Header with Official Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800 shrink-0 bg-[#0F172A]">
        <Logo size="md" href="/dashboard" variant="dark" />
        <span className="bg-[#4361EE]/20 text-[#4361EE] border border-[#4361EE]/30 text-[10px] font-mono font-bold py-0.5 px-2 rounded-full shrink-0">
          PRO
        </span>
      </div>

      {/* Navigation Links with border-l-4 border-[#4361EE] for active route */}
      <div className="flex-1 space-y-1 py-6 overflow-y-auto">
        <p className="eyebrow px-6 pb-2 block text-[10px] text-gray-400 tracking-wider">
          RECRUITING PLATFORM
        </p>
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3.5 px-6 py-3 text-sm font-sans transition-all duration-200",
                isActive
                  ? "bg-gray-800 text-white font-semibold border-l-4 border-[#4361EE]"
                  : "text-gray-400 hover:bg-gray-800/60 hover:text-white"
              )}
            >
              <item.icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-[#4361EE]" : "text-gray-400")} strokeWidth={2} />
              <span>{item.label}</span>
              {isActive && (
                <ChevronRight className="w-4 h-4 ml-auto text-[#4361EE]" strokeWidth={2} />
              )}
            </Link>
          );
        })}

        <div className="pt-6">
          <p className="eyebrow px-6 pb-2 block text-[10px] text-gray-400 tracking-wider">
            ANALYTICS &amp; ENGINE
          </p>
          {NAV_ITEMS.slice(5, 7).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3.5 px-6 py-3 text-sm font-sans transition-all duration-200",
                  isActive
                    ? "bg-gray-800 text-white font-semibold border-l-4 border-[#4361EE]"
                    : "text-gray-400 hover:bg-gray-800/60 hover:text-white"
                )}
              >
                <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-[#4361EE]" : "text-gray-400")} strokeWidth={2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="pt-6">
          <p className="eyebrow px-6 pb-2 block text-[10px] text-gray-400 tracking-wider">
            SYSTEM SETTINGS
          </p>
          {NAV_ITEMS.slice(7).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3.5 px-6 py-3 text-sm font-sans transition-all duration-200",
                  isActive
                    ? "bg-gray-800 text-white font-semibold border-l-4 border-[#4361EE]"
                    : "text-gray-400 hover:bg-gray-800/60 hover:text-white"
                )}
              >
                <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-[#4361EE]" : "text-gray-400")} strokeWidth={2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Sign Out Footer */}
      <div className="border-t border-gray-800 p-4 shrink-0 bg-[#0F172A]">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 text-gray-400 hover:text-red-400 text-xs font-sans px-4 py-2.5 rounded-lg transition-colors w-full hover:bg-red-500/10 cursor-pointer text-left font-medium"
        >
          <LogOut className="w-4 h-4 shrink-0 text-gray-400" strokeWidth={2} />
          <span>Sign Out Session</span>
        </button>
      </div>
    </div>
  );
}

export function DashboardLayoutClient({
  children,
  userProfile,
}: {
  children: React.ReactNode;
  userProfile: { fullName: string; companyName: string };
}) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const currentSection =
    segments.length === 1
      ? "Recruiter Control Center"
      : segments[segments.length - 1].charAt(0).toUpperCase() +
        segments[segments.length - 1].slice(1);

  const initials = userProfile.companyName
    ? userProfile.companyName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "REC";

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#6B7280] font-sans selection:bg-[#4361EE] selection:text-white">
      {/* Mobile Drawer */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed left-4 top-3.5 z-50 border-gray-200 bg-white text-[#1F2937] lg:hidden h-9 w-9 shadow-sm"
          >
            <Menu className="w-4 h-4" strokeWidth={2} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 border-r-0 p-0 bg-[#111827]">
          <SidebarContent pathname={pathname} />
        </SheetContent>
      </Sheet>

      {/* Desktop Fixed Left Sidebar (w-64 bg-[#111827] text-white) */}
      <div className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <SidebarContent pathname={pathname} />
      </div>

      {/* Main Workspace Area (Canvas: bg-[#F3F4F6]) */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header: Clean White Bar (h-16 bg-white shadow-sm px-6 flex items-center justify-between) */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white shadow-sm px-6">
          <div className="flex items-center gap-3 pl-10 lg:pl-0">
            <h1 className="font-display text-base font-bold text-[#1F2937]">
              {currentSection}
            </h1>
            <span className="text-gray-300">/</span>
            <span className="font-mono text-xs text-[#4361EE] font-medium">Talent Workspace</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Input (rounded-lg bg-gray-100 border-none) */}
            <div className="relative hidden md:block w-72">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" strokeWidth={2} />
              <input
                type="text"
                placeholder="Search candidates, skills, jobs..."
                className="w-full h-9 pl-9 pr-4 text-xs font-sans rounded-lg bg-gray-100 border-none text-[#1F2937] placeholder:text-gray-400 focus:ring-2 focus:ring-[#4361EE] focus:bg-white transition-all"
              />
            </div>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-gray-500 hover:bg-gray-100 hover:text-[#1F2937] h-9 w-9 rounded-lg border border-gray-200"
            >
              <Bell className="w-4 h-4" strokeWidth={2} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#4361EE]" />
            </Button>

            {/* Recruiter Profile */}
            <div className="flex items-center gap-3 border-l border-gray-200 pl-4 ml-1">
              <div className="text-right hidden sm:block">
                <div className="font-display text-xs font-bold text-[#1F2937] leading-tight truncate max-w-[140px]">
                  {userProfile.fullName || "Recruiter Manager"}
                </div>
                <div className="font-mono text-[10px] text-[#4361EE] truncate max-w-[140px]">
                  {userProfile.companyName || "TechCorp Intelligence"}
                </div>
              </div>
              <Avatar className="h-9 w-9 border border-gray-200 shadow-sm">
                <AvatarFallback className="bg-blue-50 text-[#4361EE] text-xs font-mono font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Canvas Content (bg-[#F3F4F6]) */}
        <main className="flex-1 p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
