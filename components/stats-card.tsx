import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("surface-card border-gray-200", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium tracking-tight text-brand-slate">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-brand-cyan" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight text-brand-navy">{value}</div>
        {description && (
          <p className="text-xs text-brand-slate mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
