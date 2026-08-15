"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Cpu,
  ClipboardCheck,
  Video,
  TrendingUp,
  BarChart3,
  ChevronRight,
  ShieldCheck,
  Search
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
  { label: "Candidates", href: "/dashboard/candidates", icon: Users },
  { label: "Assessments", href: "/dashboard/assessments", icon: ClipboardCheck },
  { label: "Interviews", href: "/dashboard/interviews", icon: Video },
  { label: "Rankings", href: "/dashboard/rankings", icon: TrendingUp },
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
    <div className="flex h-full flex-col bg-[#0C121D] text-[#9AA6B8] border-r border-[rgba(148,163,184,0.12)] select-none font-sans overflow-hidden">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[rgba(148,163,184,0.12)] shrink-0 bg-[#0A0F18]">
        <div className="flex items-center justify-center w-9 h-9 rounded-[8px] bg-[#8AB4F8] text-[#06101F] font-bold shrink-0 shadow-md shadow-[rgba(138,180,248,0.2)]">
          <Cpu className="w-4 h-4" strokeWidth={1.75} />
        </div>
        <div className="flex flex-col min-w-0 justify-center">
          <div className="flex items-center gap-1.5">
            <span className="font-display font-medium text-sm text-[#F2F5F9] truncate leading-none">
              AI-Recruit360
            </span>
            <span className="bg-[rgba(138,180,248,0.12)] text-[#7DA2F2] border border-[rgba(138,180,248,0.25)] text-[9px] font-mono font-medium py-0.5 px-1.5 rounded-full shrink-0">
              PRO
            </span>
          </div>
          <p className="font-mono text-[10px] text-[#66707F] truncate mt-1">
            Talent Intelligence Platform
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 space-y-1 px-3 py-5 overflow-y-auto">
        <p className="eyebrow px-3 pb-2 block">
          Recruiting Platform
        </p>
        {NAV_ITEMS.slice(0, 7).map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-[8px] px-3.5 py-2.5 text-xs font-sans transition-all",
                isActive
                  ? "bg-[rgba(148,163,184,0.14)] text-[#F2F5F9] font-medium"
                  : "text-[#9AA6B8] hover:bg-[#121B2B] hover:text-[#F2F5F9]"
              )}
            >
              <item.icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-[#8AB4F8]" : "text-[#66707F]")} strokeWidth={1.75} />
              <span>{item.label}</span>
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#8AB4F8]" strokeWidth={1.75} />
              )}
            </Link>
          );
        })}

        <div className="pt-5">
          <p className="eyebrow px-3 pb-2 block">
            System Settings
          </p>
          {NAV_ITEMS.slice(7).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-[8px] px-3.5 py-2.5 text-xs font-sans transition-all",
                  isActive
                    ? "bg-[rgba(148,163,184,0.14)] text-[#F2F5F9] font-medium"
                    : "text-[#9AA6B8] hover:bg-[#121B2B] hover:text-[#F2F5F9]"
                )}
              >
                <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-[#8AB4F8]" : "text-[#66707F]")} strokeWidth={1.75} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* System Health Card */}
        <div className="pt-5 px-1">
          <div className="rounded-[8px] bg-[#0B1019] border border-[rgba(148,163,184,0.12)] p-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-display text-xs font-medium text-[#F2F5F9] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" strokeWidth={1.75} />
                AI Screening Core
              </span>
              <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" />
            </div>
            <p className="font-mono text-[10px] text-[#66707F]">
              SOC-2 Engine Active
            </p>
          </div>
        </div>
      </div>

      {/* Sign Out Button - Sign Out of Supabase & redirect */}
      <div className="border-t border-[rgba(148,163,184,0.12)] p-4 pb-8 shrink-0 bg-[#0A0F18]">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 text-[#9AA6B8] hover:text-[#EF4444] text-xs font-sans px-3 py-2 rounded-[8px] transition-colors w-full hover:bg-[rgba(239,68,68,0.08)] cursor-pointer text-left"
        >
          <LogOut className="w-4 h-4 shrink-0 text-[#66707F]" strokeWidth={1.75} />
          <span className="font-medium">Sign Out</span>
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
      ? "Executive Control Center"
      : segments[segments.length - 1].charAt(0).toUpperCase() +
        segments[segments.length - 1].slice(1);

  const initials = userProfile.companyName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#05070D] text-[#9AA6B8] font-sans selection:bg-[#8AB4F8] selection:text-[#06101F]">
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed left-4 top-3.5 z-50 border-[rgba(148,163,184,0.12)] bg-[#0C121D] text-[#F2F5F9] lg:hidden h-9 w-9"
          >
            <Menu className="w-4 h-4" strokeWidth={1.75} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 border-r-0 p-0 bg-[#0C121D]">
          <SidebarContent pathname={pathname} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <SidebarContent pathname={pathname} />
      </div>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[rgba(148,163,184,0.12)] bg-[rgba(5,7,13,0.8)] backdrop-blur-md px-6">
          <div className="flex items-center gap-3 pl-10 lg:pl-0">
            <h1 className="font-display text-lg font-medium text-[#F2F5F9]">
              {currentSection}
            </h1>
            <span className="text-[#66707F]">/</span>
            <span className="font-mono text-xs text-[#7DA2F2]">Talent Command Center</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative hidden md:block w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#66707F]" strokeWidth={1.75} />
              <input
                type="text"
                placeholder="Search requisitions, candidates..."
                className="input-enterprise w-full h-9 pl-9 pr-4 text-xs font-sans placeholder:text-[#66707F]"
              />
            </div>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-[#9AA6B8] hover:bg-[#121B2B] hover:text-[#F2F5F9] h-9 w-9 rounded-[8px]"
            >
              <Bell className="w-4 h-4" strokeWidth={1.75} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#8AB4F8]" />
            </Button>

            {/* Profile */}
            <div className="flex items-center gap-3 border-l border-[rgba(148,163,184,0.12)] pl-4 ml-1">
              <div className="text-right hidden sm:block">
                <div className="font-display text-xs font-medium text-[#F2F5F9] leading-tight truncate max-w-[140px]">{userProfile.fullName}</div>
                <div className="font-mono text-[10px] text-[#7DA2F2] truncate max-w-[140px]">{userProfile.companyName}</div>
              </div>
              <Avatar className="h-9 w-9 border border-[rgba(148,163,184,0.12)]">
                <AvatarFallback className="bg-[#121B2B] text-[#8AB4F8] text-xs font-mono font-medium">
                  {initials || "REC"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Animated Page Content */}
        <main className="flex-1 p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
