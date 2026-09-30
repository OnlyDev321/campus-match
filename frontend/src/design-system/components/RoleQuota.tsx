"use client";

import React from "react";

export interface RoleQuotaItem {
  role: string;
  current: number;
  max: number;
}

export interface RoleQuotaProps {
  current?: number;
  max?: number;
  label?: string;
  roles?: RoleQuotaItem[];
  variant?: "summary" | "detailed";
  className?: string;
}

export function RoleQuota({
  current = 0,
  max = 0,
  label = "Filled",
  roles,
  variant = "summary",
  className = "",
}: RoleQuotaProps) {
  const percent = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;
  const isFull = max > 0 && current >= max;

  if (variant === "detailed" && roles && roles.length > 0) {
    return (
      <div className={`space-y-2 text-xs ${className}`}>
        {roles.map((item, idx) => {
          const itemPercent = item.max > 0 ? Math.min(100, Math.round((item.current / item.max) * 100)) : 0;
          const isItemFull = item.current >= item.max;

          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-(--text-secondary) font-medium">
                <span>{item.role}</span>
                <span className="font-mono text-(--text-muted)">
                  {item.current}/{item.max}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-(--surface-container-high) overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isItemFull ? "bg-(--text-muted)" : "bg-(--primary-container)"
                  }`}
                  style={{ width: `${itemPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 text-xs ${className}`}>
      <div className="w-16 h-1.5 rounded-full bg-(--surface-container-high) overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isFull ? "bg-(--warning)" : "bg-(--primary-container)"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="font-mono font-medium text-[var(--text-secondary)]">
        {current}/{max} <span className="font-sans text-[var(--text-muted)]">{label}</span>
      </span>
    </div>
  );
}
