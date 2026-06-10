"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type FeedbackTone = "success" | "error" | "info";

const toneStyles: Record<FeedbackTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
};

export function FeedbackToast({
  message,
  tone = "info",
  onClose,
  className,
}: {
  message: string;
  tone?: FeedbackTone;
  onClose?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm", toneStyles[tone], className)}>
      <span>{message}</span>
      {onClose ? (
        <Button variant="ghost" size="icon-xs" className="h-6 w-6" onClick={onClose}>
          <X className="h-3 w-3" />
        </Button>
      ) : null}
    </div>
  );
}
