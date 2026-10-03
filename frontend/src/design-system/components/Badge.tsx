"use client";

import React from "react";

export type BadgeVariant =
  | "recruiting"
  | "active"
  | "pending"
  | "applying"
  | "closed"
  | "archived"
  | "neutral"
  | "primary";

export type BadgeSize = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  pulse?: boolean;
  mono?: boolean;
}

export function Badge({
  children,
  variant = "neutral",
  size = "md",
  dot = false,
  pulse = false,
  mono = false,
  className = "",
  ...props
}: BadgeProps) {
  // Styles strictly aligned with DESIGN.md 8.2
  const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
    recruiting: {
      container:
        "bg-(--success-bg) text-(--success-text) border border-(--success-border)",
      dot: "bg-(--success)",
    },
    active: {
      container:
        "bg-(--success-bg) text-(--success-text) border border-(--success-border)",
      dot: "bg-(--success)",
    },
    pending: {
      container:
        "bg-(--warning-bg) text-(--warning-text) border border-(--warning-border)",
      dot: "bg-(--warning)",
    },
    applying: {
      container:
        "bg-(--warning-bg) text-(--warning-text) border border-(--warning-border)",
      dot: "bg-(--warning)",
    },
    closed: {
      container:
        "bg-(--badge-closed-bg) text-(--badge-closed-text) border border-(--badge-closed-border)",
      dot: "bg-(--badge-closed-text)",
    },
    archived: {
      container:
        "bg-(--badge-closed-bg) text-(--badge-closed-text) border border-(--badge-closed-border)",
      dot: "bg-(--badge-closed-text)",
    },
    neutral: {
      container:
        "bg-(--surface-container-low) text-(--text-secondary) border border-(--border)",
      dot: "bg-(--outline)",
    },
    primary: {
      container:
        "bg-(--primary-soft) text-(--primary) border border-(--primary-soft-border)",
      dot: "bg-(--primary)",
    },
  };

  const sizeClasses = {
    sm: "text-[11px] px-2 py-0.5 leading-none",
    md: "text-xs px-2.5 py-1 leading-normal",
  }[size];

  const currentVariant = variantStyles[variant] || variantStyles.neutral;

  return (
    <span
      style={{ borderRadius: "var(--radius-badge)" }}
      className={`inline-flex items-center gap-1.5 font-medium select-none ${
        mono ? "font-mono" : ""
      } ${sizeClasses} ${currentVariant.container} ${className}`}
      {...props}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          {pulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${currentVariant.dot}`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${currentVariant.dot}`} />
        </span>
      )}
      <span>{children}</span>
    </span>
  );
}
