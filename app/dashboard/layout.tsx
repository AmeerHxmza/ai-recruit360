"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Bot
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
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
  { label: "Candidates", href: "/dashboard/candidates", icon: Users },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <div className="flex h-full flex-col bg-brand-white text-brand-navy border-r border-gray-200">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <Bot className="mr-2 h-6 w-6 text-brand-cyan" />
        <span className="font-bold text-lg tracking-tight">AI-Recruit360</span>
      </div>
      <div className="flex-1 space-y-1 px-3 py-6">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium",
              pathname === item.href
                ? "bg-brand-cyan text-brand-white"
                : "text-brand-slate hover:bg-brand-light hover:text-brand-navy"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </Link>
        ))}
      </div>
      <div className="border-t border-gray-200 p-4">
        <Button variant="ghost" className="w-full justify-start gap-2 text-brand-slate hover:bg-brand-light hover:text-brand-navy" asChild>
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
  const currentSection = pathname === "/dashboard" ? "overview" : pathname.split("/").pop();
  const [profile, setProfile] = useState<DashboardProfile>(DEFAULT_DASHBOARD_PROFILE);

  useEffect(() => {
    const loadProfile = () => {
      try {
        const rawValue = localStorage.getItem(DASHBOARD_PROFILE_KEY);
        if (!rawValue) {
          setProfile(DEFAULT_DASHBOARD_PROFILE);
          return;
        }
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

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="fixed left-4 top-4 z-50 border-gray-200 bg-brand-white shadow-sm lg:hidden">
            <Menu className="w-5 h-5 text-brand-navy" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 border-r-0 p-0">
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
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-brand-white px-4 sm:px-6">
          <h1 className="pl-12 text-lg font-semibold tracking-tight capitalize lg:pl-0 text-brand-navy">
            {currentSection}
          </h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative text-brand-slate hover:bg-brand-light">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand-success rounded-full" />
            </Button>
            <div className="flex items-center gap-3 border-l border-gray-200 pl-4 ml-2">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-brand-navy">{profile.recruiterName}</div>
                <div className="text-xs text-brand-slate font-medium">{profile.companyName}</div>
                <div className="text-[10px] text-brand-slate uppercase tracking-wider">{profile.recruiterRole}</div>
              </div>
              <Avatar>
                <AvatarImage src={profile.companyLogo} />
                <AvatarFallback>
                  {profile.companyName
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
