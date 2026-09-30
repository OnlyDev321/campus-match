"use client";

import React from "react";

export type AvatarSize = "xs" | "sm" | "md" | "lg";

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: AvatarSize;
  className?: string;
}

export function Avatar({ src, name = "", size = "md", className = "" }: AvatarProps) {
  const sizeClasses = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-7 h-7 text-xs",
    md: "w-8 h-8 text-xs",
    lg: "w-10 h-10 text-sm",
  }[size];

  // Derive initials from name
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full font-semibold border border-[var(--border)] overflow-hidden bg-[var(--surface-container-high)] text-[var(--text-primary)] select-none ${sizeClasses} ${className}`}
      title={name}
    >
      {src ? (
        <img src={src} alt={name || "Avatar"} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

export interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  total?: number;
  size?: AvatarSize;
  className?: string;
}

export function AvatarGroup({
  children,
  max = 4,
  total,
  size = "sm",
  className = "",
}: AvatarGroupProps) {
  const childrenArray = React.Children.toArray(children);
  const visibleAvatars = childrenArray.slice(0, max);
  const remainingCount = total ? total - max : childrenArray.length - max;

  const sizeClasses = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-7 h-7 text-xs",
    md: "w-8 h-8 text-xs",
    lg: "w-10 h-10 text-sm",
  }[size];

  return (
    <div className={`inline-flex items-center -space-x-1.5 ${className}`}>
      {visibleAvatars.map((child, index) => (
        <div key={index} className="relative transition-transform hover:scale-110 hover:z-10 ring-2 ring-[var(--surface)] rounded-full">
          {child}
        </div>
      ))}

      {remainingCount > 0 && (
        <div
          className={`relative inline-flex items-center justify-center rounded-full font-mono font-medium ring-2 ring-[var(--surface)] bg-[var(--surface-container-high)] text-[var(--text-secondary)] border border-[var(--border)] ${sizeClasses}`}
          title={`${remainingCount} more members`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
