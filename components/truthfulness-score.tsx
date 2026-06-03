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
  const getDimensions = () => {
    switch (size) {
      case "sm": return { width: 36, height: 36, strokeWidth: 3 };
      case "lg": return { width: 64, height: 64, strokeWidth: 5 };
      default: return { width: 48, height: 48, strokeWidth: 4 };
    }
  };

  const { width, height, strokeWidth } = getDimensions();
  const radius = (width - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={cn("flex items-center gap-3", className)} {...props}>
      <div className="relative" style={{ width, height }}>
        <svg
          className="transform -rotate-90"
          width={width}
          height={height}
        >
          <circle
            cx={width / 2}
            cy={height / 2}
            r={radius}
            strokeWidth={strokeWidth}
            className="stroke-gray-100"
            fill="none"
          />
          <circle
            cx={width / 2}
            cy={height / 2}
            r={radius}
            strokeWidth={strokeWidth}
            className="stroke-brand-cyan"
            fill="none"
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(
            "font-bold text-brand-navy tracking-tight",
            size === "sm" ? "text-[10px]" : size === "lg" ? "text-base" : "text-xs"
          )}>
            {score}
          </span>
        </div>
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-brand-slate">
          Match Score
        </span>
      )}
    </div>
  );
}
