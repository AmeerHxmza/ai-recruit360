"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TruthfulnessScoreProps extends React.HTMLAttributes<HTMLDivElement> {
  score: number; // 0 to 100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function TruthfulnessScore({
  score,
  size = "md",
  showLabel = true,
  className,
  ...props
}: TruthfulnessScoreProps) {
  // Determine color based on score thresholds
  const getColorClass = () => {
    if (score >= 80) return "bg-success";
    if (score >= 60) return "bg-primary";
    if (score >= 40) return "bg-warning";
    return "bg-destructive";
  };

  const getTextColorClass = () => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-primary";
    if (score >= 40) return "text-warning";
    return "text-destructive";
  };

  const getHeightClass = () => {
    if (size === "sm") return "h-1";
    if (size === "lg") return "h-2.5";
    return "h-1.5";
  };

  return (
    <div className={cn("flex flex-col gap-1.5 w-full min-w-[80px]", className)} {...props}>
      <div className="flex items-center justify-between gap-2">
        {showLabel && (
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Verification
          </span>
        )}
        <span className={cn(
          "font-bold tracking-tight",
          getTextColorClass(),
          size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm"
        )}>
          {score}%
        </span>
      </div>
      <div className={cn("w-full bg-border rounded-full overflow-hidden", getHeightClass())}>
        <div
          className={cn("h-full transition-all duration-500 rounded-full", getColorClass())}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

