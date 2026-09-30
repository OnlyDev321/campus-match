"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export interface CompatibilityTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  score?: number;
  label?: string;
  showIcon?: boolean;
}

export function CompatibilityTag({
  score,
  label = "Schedule Match",
  showIcon = true,
  className = "",
  ...props
}: CompatibilityTagProps) {
  const displayText = score !== undefined ? `${score}% ${label}` : label;

  return (
    <span
      style={{ borderRadius: "var(--radius-badge)" }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium bg-(--primary-soft) text-(--primary) border border-(--primary-soft-border) select-none ${className}`}
      {...props}
    >
      {showIcon && <Sparkles className="w-3 h-3 text-(--primary) shrink-0" />}
      <span className="font-mono font-semibold">{score !== undefined ? `${score}%` : ""}</span>
      <span className="font-sans opacity-90">{label}</span>
    </span>
  );
}
