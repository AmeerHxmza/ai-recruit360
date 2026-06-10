import { cn } from "@/lib/utils";

interface HiringConfidenceScoreProps {
  matchScore: number;
  quizScore: number;
  interviewScore: number;
  truthfulnessScore: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function HiringConfidenceScore({
  matchScore,
  quizScore,
  interviewScore,
  truthfulnessScore,
  size = "md",
  showLabel = true,
  className
}: HiringConfidenceScoreProps) {
  // Proprietary Formula Concept
  // In reality, this would be computed on the backend.
  // We use a weighted average here for the visual component.
  const rawScore = (matchScore * 0.3) + (quizScore * 0.2) + (interviewScore * 0.3) + (truthfulnessScore * 0.2);
  const confidence = Math.round(rawScore);

  let statusColor = "bg-primary";
  let textColor = "text-primary";
  let label = "High Confidence";

  if (confidence >= 85) {
    statusColor = "bg-success";
    textColor = "text-success";
    label = "Verified Match";
  } else if (confidence >= 70) {
    statusColor = "bg-primary";
    textColor = "text-primary";
    label = "Strong Candidate";
  } else if (confidence >= 50) {
    statusColor = "bg-warning";
    textColor = "text-warning";
    label = "Review Needed";
  } else {
    statusColor = "bg-destructive";
    textColor = "text-destructive";
    label = "Risk Detected";
  }

  const heightClass = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4"
  }[size];

  const textClass = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm"
  }[size];

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between">
        {showLabel && (
          <span className={cn("font-medium tracking-tight", textClass, textColor)}>
            {label}
          </span>
        )}
        <span className={cn("font-bold tracking-tight", textClass)}>
          {confidence}%
        </span>
      </div>
      <div className={cn("w-full bg-muted overflow-hidden rounded-full", heightClass)}>
        <div 
          className={cn("h-full rounded-full transition-all duration-500 ease-out", statusColor)} 
          style={{ width: `${confidence}%` }}
        />
      </div>
    </div>
  );
}
