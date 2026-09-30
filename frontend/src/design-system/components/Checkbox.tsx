"use client";

import React, { forwardRef } from "react";
import { Check } from "lucide-react";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, checked, defaultChecked, id, className = "", disabled, ...props }, ref) => {
    const inputId = id || (typeof label === "string" ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <label
        htmlFor={inputId}
        className={`inline-flex items-start gap-2.5 cursor-pointer select-none group ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            id={inputId}
            type="checkbox"
            ref={ref}
            checked={checked}
            defaultChecked={defaultChecked}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <div
            className={`w-4 h-4 rounded-[4px] border transition-all duration-150 flex items-center justify-center border-(--border-strong) bg-(--surface) peer-checked:bg-(--primary-container) peer-checked:border-(--primary-container) peer-focus-visible:ring-2 peer-focus-visible:ring-(--focus-ring) peer-focus-visible:ring-offset-1 ${className}`}
          >
            <Check className="w-3 h-3 text-white stroke-[2.5] opacity-0 peer-checked:opacity-100 transition-opacity" />
          </div>
        </div>

        {(label || description) && (
          <div className="flex flex-col text-left">
            {label && (
              <span className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--text-primary)]">
                {label}
              </span>
            )}
            {description && (
              <span className="text-xs text-[var(--text-muted)] leading-normal">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
