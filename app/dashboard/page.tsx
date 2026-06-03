import { StatsCard } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, CalendarCheck, Clock, CheckCircle2 } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Active Jobs"
          value="12"
          description="+2 from last month"
          icon={Briefcase}
        />
        <StatsCard
          title="Total Candidates"
          value="1,284"
          description="+180 new applications"
          icon={Users}
        />
        <StatsCard
          title="Interviews Completed"
          value="342"
          description="AI conducted interviews"
          icon={CalendarCheck}
        />
        <StatsCard
          title="Avg. Truth Score"
          value="78%"
          description="+4% increase in quality"
          icon={CheckCircle2}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-7">
        <Card className="surface-card xl:col-span-4">
          <CardHeader>
            <CardTitle className="text-brand-navy tracking-tight">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { name: "Sarah Williams", action: "completed interview for", role: "Senior React Developer", time: "2m ago", score: "High Truthfulness" },
                { name: "Michael Chen", action: "applied to", role: "Backend Engineer", time: "15m ago", score: "Pending" },
                { name: "Jessica Davis", action: "was flagged for", role: "Product Manager", time: "1h ago", score: "Fraud Alert" },
                { name: "David Kim", action: "completed interview for", role: "DevOps Engineer", time: "3h ago", score: "High Truthfulness" },
              ].map((item, i) => (
                <div key={i} className="flex flex-wrap items-start gap-3 sm:flex-nowrap sm:items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none text-brand-navy">
                      <span className="font-bold">{item.name}</span> {item.action} <span className="text-brand-cyan">{item.role}</span>
                    </p>
                    <p className="text-xs text-brand-slate">
                      {item.time} • {item.score}
                    </p>
                  </div>
                  <div className={`text-xs font-medium sm:ml-auto ${item.score === "Fraud Alert" ? "text-brand-archived" : item.score === "High Truthfulness" ? "text-brand-success" : "text-brand-slate"}`}>
                    {item.score === "Fraud Alert" ? "⚠️ Flagged" : item.score === "High Truthfulness" ? "Verified" : "Processing"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="surface-card xl:col-span-3">
          <CardHeader>
            <CardTitle className="text-brand-navy tracking-tight">Upcoming Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-md border border-gray-200 bg-brand-light p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-brand-cyan" />
                  <span className="text-xs font-bold text-brand-navy">Today, 2:00 PM</span>
                </div>
                <div className="font-semibold text-sm text-brand-navy">Review Flagged Candidates</div>
                <p className="text-xs text-brand-slate mt-1">3 candidates detected with suspicious activity</p>
              </div>
              <div className="rounded-md border border-gray-200 bg-brand-light p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-brand-cyan" />
                  <span className="text-xs font-bold text-brand-navy">Tomorrow, 10:00 AM</span>
                </div>
                <div className="font-semibold text-sm text-brand-navy">Frontend Team Sync</div>
                <p className="text-xs text-brand-slate mt-1">Review top 5 candidates for React role</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
