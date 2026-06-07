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
    <div className={cn(
      "group relative bg-card rounded-xl border border-border p-5 shadow-sm",
      "transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5",
      "overflow-hidden",
      className
    )}>
      {/* Subtle hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase mb-3">
            {title}
          </p>
          <div className="text-2xl font-bold tracking-tight text-foreground mb-1">
            {value}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground/70 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl shadow-sm"
            style={{ background: "linear-gradient(135deg, #0052FF, #4D7CFF)" }}
          >
            <Icon className="h-4.5 w-4.5 text-white" />
          </div>
        )}
      </div>
    </div>
  );
}
