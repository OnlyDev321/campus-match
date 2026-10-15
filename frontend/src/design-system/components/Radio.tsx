"use client";

import React, { forwardRef } from "react";

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
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
            type="radio"
            ref={ref}
            checked={checked}
            defaultChecked={defaultChecked}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <div
            className={`w-4 h-4 rounded-full border flex items-center justify-center border-(--border-strong) bg-(--surface) peer-checked:border-(--primary-container) peer-checked:bg-(--primary-container) peer-checked:[&>span]:scale-100 ${className}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white scale-0 transition-transform duration-150" />
          </div>
        </div>

        {(label || description) && (
          <div className="flex flex-col text-left">
            {label && (
              <span className="text-sm font-medium text-[var(--text-primary)]">
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

Radio.displayName = "Radio";
