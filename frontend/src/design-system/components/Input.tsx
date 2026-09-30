"use client";

import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      className = "",
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-[var(--text-secondary)]"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 flex items-center pointer-events-none text-[var(--text-faint)]">
              {leftIcon}
            </span>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            style={{
              borderRadius: "var(--radius-input)",
              ...style,
            }}
            className={`w-full h-[38px] text-sm bg-(--surface) text-(--text-primary) border transition-all duration-150 placeholder:text-(--text-faint) focus:outline-none focus:border-(--primary-container) focus:ring-2 focus:ring-(--focus-ring) disabled:opacity-50 disabled:cursor-not-allowed ${
              leftIcon ? "pl-9" : "pl-3"
            } ${rightIcon ? "pr-9" : "pr-3"} ${
              error
                ? "border-(--error) focus:border-(--error) focus:ring-(--error-border)"
                : "border-(--border) hover:border-(--border-strong)"
            } ${className}`}
            {...props}
          />

          {rightIcon && (
            <span className="absolute right-3 flex items-center pointer-events-none text-[var(--text-faint)]">
              {rightIcon}
            </span>
          )}
        </div>

        {error ? (
          <p className="text-xs text-[var(--error-text)] font-medium flex items-center gap-1">
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-xs text-[var(--text-muted)]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
