"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface DashboardChartsProps {
  candidatesCount: number;
  completedCount: number;
  verifiedCount: number;
  avgScore: number;
}

const areaChartData = [
  { month: "May", score: 210, baseline: 140 },
  { month: "Jun", score: 280, baseline: 210 },
  { month: "Jul", score: 180, baseline: 160 },
  { month: "Aug", score: 260, baseline: 220 },
  { month: "Sep", score: 220, baseline: 190 },
  { month: "Oct", score: 300, baseline: 240 },
];

export function DonutChartCard({
  hiredPercent = 54,
  canceledPercent = 20,
  pendingPercent = 26,
}: {
  hiredPercent?: number;
  canceledPercent?: number;
  pendingPercent?: number;
}) {
  const donutData = [
    { name: "Total Hired", value: hiredPercent, color: "#0066FF" },
    { name: "Total Canceled", value: canceledPercent, color: "#10B981" },
    { name: "Total Pending", value: pendingPercent, color: "#EF4444" },
  ];

  return (
    <div className="card-enterprise bg-[#0F172A] border-[rgba(255,255,255,0.08)] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-[#F8FAFC]">
          Hire vs Cancel
        </h3>
        <span className="px-2.5 py-1 rounded-md bg-[#141E36] text-[10px] font-mono text-[#94A3B8]">
          Today
        </span>
      </div>

      <div className="flex flex-col items-center justify-center py-1 relative">
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0F172A",
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#F8FAFC",
                  fontSize: "12px"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-2.5 pt-1 border-t border-[rgba(255,255,255,0.08)] text-xs font-sans">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0066FF]" />
            <span className="text-[#94A3B8]">Total Hired</span>
          </div>
          <span className="font-mono font-semibold text-[#F8FAFC] flex items-center gap-1">
            {hiredPercent}% <ArrowUpRight className="w-3 h-3 text-[#10B981]" />
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <span className="text-[#94A3B8]">Total Canceled</span>
          </div>
          <span className="font-mono font-semibold text-[#F8FAFC] flex items-center gap-1">
            {canceledPercent}% <ArrowUpRight className="w-3 h-3 text-[#10B981]" />
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
            <span className="text-[#94A3B8]">Total Pending</span>
          </div>
          <span className="font-mono font-semibold text-[#F8FAFC] flex items-center gap-1">
            {pendingPercent}% <ArrowDownRight className="w-3 h-3 text-[#EF4444]" />
          </span>
        </div>
      </div>
    </div>
  );
}

export function SplineAreaChartCard() {
  return (
    <div className="card-enterprise bg-[#0F172A] border-[rgba(255,255,255,0.08)] p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="font-display text-base font-semibold text-[#F8FAFC]">
          Earning &amp; Evaluation Summary
        </h3>
        <div className="flex items-center gap-4 text-xs font-mono text-[#64748B]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0066FF]" />
            Last 6 months
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#64748B]" />
            Same period last year
          </span>
        </div>
      </div>

      <div className="h-56 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={areaChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMainScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0066FF" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0066FF" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}k`} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0F172A",
                borderColor: "rgba(0,102,255,0.3)",
                borderRadius: "10px",
                color: "#F8FAFC",
                fontSize: "12px"
              }}
            />
            <Area type="monotone" dataKey="score" stroke="#0066FF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMainScore)" />
            <Area type="monotone" dataKey="baseline" stroke="#64748B" strokeWidth={1.5} strokeDasharray="3 3" fillOpacity={0} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
