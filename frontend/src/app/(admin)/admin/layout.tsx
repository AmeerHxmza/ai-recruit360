'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  ShieldAlert,
  Users,
  LayoutDashboard,
  LogOut,
  ArrowLeft,
  Activity,
  Cpu,
  Sparkles
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAdminStatus() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      setUserEmail(session.user.email || '');

      // Check recruiter role in database
      const { data, error } = await supabase
        .from('recruiters')
        .select('role, is_allowed')
        .eq('id', session.user.id)
        .single();

      if (data && (data.role === 'admin' || session.user.email === 'admin@ai-recruit360.com')) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    }
    checkAdminStatus();
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex items-center space-x-3">
          <Activity className="w-6 h-6 animate-spin text-purple-400" />
          <span className="text-sm font-medium">Verifying Super Admin Authorization...</span>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white p-6">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-8 text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-red-400">Access Denied: Super Admin Only</h2>
          <p className="text-sm text-slate-400">
            Your account (<span className="text-slate-200">{userEmail}</span>) does not have Super Admin platform owner privileges.
          </p>
          <div className="pt-4 flex flex-col space-y-2">
            <Link
              href="/dashboard"
              className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-xl transition"
            >
              Return to Recruiter Dashboard
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'SaaS Telemetry', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Governance', href: '/admin/users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/80 border-r border-slate-800 flex flex-col justify-between p-4 sticky top-0 h-screen">
        <div>
          {/* Brand Header */}
          <div className="flex items-center space-x-3 px-3 py-4 mb-6 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-tight">AI-Recruit360</h1>
              <span className="inline-flex items-center space-x-1 text-[10px] uppercase font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                <Sparkles className="w-2.5 h-2.5 mr-0.5" /> Super Admin
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / User Profile & Exit */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Switch to Recruiter View</span>
          </Link>
          <div className="px-3 py-2 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
            <div className="truncate pr-2">
              <p className="text-xs font-medium text-slate-200 truncate">{userEmail}</p>
              <p className="text-[10px] text-purple-400 font-semibold uppercase">Platform Owner</p>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
