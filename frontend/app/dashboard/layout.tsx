"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  ShieldCheck,
  ClipboardCheck,
  Video,
  TrendingUp,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  DASHBOARD_PROFILE_KEY,
  DASHBOARD_PROFILE_UPDATED_EVENT,
  DEFAULT_DASHBOARD_PROFILE,
  type DashboardProfile,
} from "@/lib/dashboard-profile";

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
  return (
    <div className="flex h-full flex-col bg-card text-foreground border-r border-border">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-5 gap-3">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-xl shadow-sm flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #0052FF, #4D7CFF)" }}
        >
          <ShieldCheck className="w-4.5 h-4.5 text-white" />
        </div>
        <div>
          <span className="font-bold text-sm tracking-tight text-foreground">AI-Recruit360</span>
          <p className="text-[10px] text-muted-foreground font-medium leading-none mt-0.5 font-mono tracking-wide">
            Hiring Intelligence
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 space-y-0.5 px-3 py-4 overflow-y-auto">
        <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.18em] px-3 pb-2 pt-1 font-mono">
          Main Menu
        </p>
        {NAV_ITEMS.slice(0, 7).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "nav-item",
                isActive ? "nav-item-active" : "nav-item-inactive"
              )}
            >
              <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-primary" : "")} />
              {item.label}
              {isActive && <ChevronRight className="w-3 h-3 ml-auto text-primary/50" />}
            </Link>
          );
        })}

        <div className="pt-4">
          <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.18em] px-3 pb-2 font-mono">
            Account
          </p>
          {NAV_ITEMS.slice(7).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "nav-item",
                  isActive ? "nav-item-active" : "nav-item-inactive"
                )}
              >
                <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-primary" : "")} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Sign Out */}
      <div className="border-t border-border p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2.5 text-muted-foreground hover:bg-destructive/[0.08] hover:text-destructive text-sm h-9"
          asChild
        >
          <Link href="/auth/login">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const currentSection =
    segments.length === 1
      ? "Dashboard"
      : segments[segments.length - 1].charAt(0).toUpperCase() +
        segments[segments.length - 1].slice(1);

  const [profile, setProfile] = useState<DashboardProfile>(DEFAULT_DASHBOARD_PROFILE);

  useEffect(() => {
    const loadProfile = () => {
      try {
        const rawValue = localStorage.getItem(DASHBOARD_PROFILE_KEY);
        if (!rawValue) { setProfile(DEFAULT_DASHBOARD_PROFILE); return; }
        const parsed = JSON.parse(rawValue) as Partial<DashboardProfile>;
        setProfile({
          recruiterName: parsed.recruiterName || DEFAULT_DASHBOARD_PROFILE.recruiterName,
          recruiterEmail: parsed.recruiterEmail || DEFAULT_DASHBOARD_PROFILE.recruiterEmail,
          companyName: parsed.companyName || DEFAULT_DASHBOARD_PROFILE.companyName,
          recruiterRole: parsed.recruiterRole || DEFAULT_DASHBOARD_PROFILE.recruiterRole,
          companyLogo: parsed.companyLogo || "",
        });
      } catch {
        setProfile(DEFAULT_DASHBOARD_PROFILE);
      }
    };

    loadProfile();
    window.addEventListener(DASHBOARD_PROFILE_UPDATED_EVENT, loadProfile);
    window.addEventListener("storage", loadProfile);
    return () => {
      window.removeEventListener(DASHBOARD_PROFILE_UPDATED_EVENT, loadProfile);
      window.removeEventListener("storage", loadProfile);
    };
  }, []);

  const initials = profile.companyName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed left-4 top-3.5 z-50 border-border bg-card shadow-sm lg:hidden h-9 w-9"
          >
            <Menu className="w-4 h-4 text-foreground" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 border-r-0 p-0">
          <SidebarContent pathname={pathname} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <SidebarContent pathname={pathname} />
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-4 sm:px-6">
          <div className="flex items-center gap-2 pl-10 lg:pl-0">
            <h1 className="text-base font-semibold tracking-tight text-foreground">
              {currentSection}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:bg-muted hover:text-foreground h-9 w-9"
            >
              <Bell className="w-4 h-4" />
              <span
                className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ring-1 ring-card"
                style={{ background: "#0052FF" }}
              />
            </Button>

            {/* Profile */}
            <div className="flex items-center gap-3 border-l border-border pl-3 ml-1">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-foreground leading-tight">{profile.recruiterName}</div>
                <div className="text-[11px] text-muted-foreground">{profile.companyName}</div>
              </div>
              <Avatar className="h-8 w-8 ring-2 ring-border">
                <AvatarImage src={profile.companyLogo} />
                <AvatarFallback
                  className="text-white text-xs font-bold"
                  style={{ background: "linear-gradient(135deg, #0052FF, #4D7CFF)" }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
