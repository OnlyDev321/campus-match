"use client";

import { ScrambleText } from "@/design-system/components/ScrambleText";
import { forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";
import type { SelectProps } from "@/lib/types";

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, id, className = "", children, style, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-medium text-(--text-secondary)">
            <ScrambleText text={label} />
          </label>
        )}
        <div className="relative">
          <select
            {...props}
            id={selectId}
            ref={ref}
            style={{ borderRadius: "var(--radius-input)", ...style }}
            className={`block h-11 w-full appearance-none cursor-pointer border border-(--border) bg-(--surface) pl-3 pr-10 text-sm text-(--text-primary) transition-colors hover:border-(--border-strong) focus-visible:outline-none focus-visible:border-(--primary) focus-visible:ring-2 focus-visible:ring-(--primary-soft-border) aria-invalid:border-(--error) disabled:cursor-not-allowed disabled:opacity-50 sm:h-[38px] ${className}`}
          >
            {children}
          </select>
          <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--text-secondary)" />
        </div>
      </div>
    );
  },
);

Select.displayName = "Select";
