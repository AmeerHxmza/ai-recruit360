"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  textClassName?: string;
  glow?: boolean;
  href?: string;
  className?: string;
  variant?: "light" | "dark";
}

const sizeMap = {
  sm: { img: 32, box: "w-8 h-8", text: "text-base" },
  md: { img: 40, box: "w-10 h-10", text: "text-lg" },
  lg: { img: 48, box: "w-12 h-12", text: "text-xl sm:text-2xl" },
  xl: { img: 64, box: "w-16 h-16", text: "text-2xl sm:text-3xl" },
};

export function Logo({
  size = "md",
  showText = true,
  textClassName,
  glow = true,
  href,
  className,
  variant = "light",
}: LogoProps) {
  const { img, box, text } = sizeMap[size];

  const content = (
    <div className={cn("inline-flex items-center gap-2.5 select-none group flex-nowrap whitespace-nowrap shrink-0", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center shrink-0 rounded-full bg-white overflow-hidden p-0 shadow-sm border border-gray-200 transition-transform duration-300 group-hover:scale-105",
          box,
          glow && "shadow-[0_0_12px_rgba(67,97,238,0.3)]"
        )}
      >
        <Image
          src="/Logo.png"
          alt="AI-Recruit360 Logo"
          width={img}
          height={img}
          className="object-cover rounded-full w-full h-full scale-125 transform transition-transform duration-300"
          priority
        />
      </div>
      {showText && (
        <span
          className={cn(
            "font-display font-extrabold tracking-tight whitespace-nowrap shrink-0 inline-block",
            variant === "dark" ? "text-white" : "text-[#1F2937]",
            text,
            textClassName
          )}
        >
          AI-Recruit<span className="text-[#4361EE]">360</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href} className="inline-flex shrink-0">{content}</Link>;
  }

  return content;
}
