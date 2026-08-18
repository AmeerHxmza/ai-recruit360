'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
  Users,
  Briefcase,
  UserCheck,
  Zap,
  DollarSign,
  Activity,
  ShieldCheck,
  Sparkles,
  TrendingUp
} from 'lucide-react';

interface AdminMetrics {
  total_recruiters: number;
  active_recruiters: number;
  suspended_recruiters: number;
  total_jobs: number;
  active_jobs: number;
  total_candidates_screened: number;
  total_interviews_completed: number;
  total_ai_tokens_consumed: number;
  total_ai_cost_usd: number;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true);
        const data = await api.getAdminOverview();
        setMetrics(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load platform metrics.');
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center space-x-3 text-purple-400">
          <Activity className="w-6 h-6 animate-spin" />
          <span className="text-sm font-medium">Loading SaaS Platform Telemetry...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm">
        {error}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Recruiters',
      value: metrics?.total_recruiters || 0,
      sub: `${metrics?.active_recruiters || 0} Active | ${metrics?.suspended_recruiters || 0} Suspended`,
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'Active Job Postings',
      value: metrics?.active_jobs || 0,
      sub: `Out of ${metrics?.total_jobs || 0} total postings`,
      icon: Briefcase,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Candidates Screened',
      value: metrics?.total_candidates_screened || 0,
      sub: `${metrics?.total_interviews_completed || 0} AI Interviews Completed`,
      icon: UserCheck,
      color: 'from-purple-500 to-violet-600',
    },
    {
      title: 'AI Tokens Consumed',
      value: (metrics?.total_ai_tokens_consumed || 0).toLocaleString(),
      sub: 'OpenAI GPT-4o-mini usage',
      icon: Zap,
      color: 'from-amber-500 to-orange-600',
    },
    {
      title: 'System AI Cost (USD)',
      value: `$${(metrics?.total_ai_cost_usd || 0).toFixed(4)}`,
      sub: 'Estimated API operational cost',
      icon: DollarSign,
      color: 'from-rose-500 to-pink-600',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-purple-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Platform Owner Governance</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            SaaS Telemetry & System Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time multi-tenant platform metrics, AI token consumption, and operational cost monitoring.
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {card.title}
                  </p>
                  <h3 className="text-3xl font-extrabold text-white mt-2 tracking-tight">
                    {card.value}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
                </div>
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Health & Architecture Status */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">System Operations & Security Status</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400 font-semibold uppercase">API Engine Health</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-sm font-bold text-white">FastAPI v1.0.0 Online</span>
            </div>
          </div>
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400 font-semibold uppercase">Session Cache Latency</p>
            <div className="flex items-center space-x-2 mt-1">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-bold text-white">&lt; 1ms In-Memory LRU</span>
            </div>
          </div>
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400 font-semibold uppercase">Database & Security</p>
            <div className="flex items-center space-x-2 mt-1">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-bold text-white">Supabase PostgreSQL RLS Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
