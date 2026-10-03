"use client";

import React, { forwardRef } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  /** Khi có href, Button render thành <Link> (điều hướng) thay vì <button>. */
  href?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      href,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    // Height & padding based on DESIGN.md (medium: 36px, small: 32px, large: 42px)
    const sizeClasses = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-9 px-4 text-sm gap-2",
      lg: "h-11 px-5 text-base gap-2.5",
    }[size];

    const variantClasses = {
      primary:
        "bg-(--primary-container) text-white hover:bg-(--primary-hover) active:scale-[0.98] shadow-xs hover:shadow-sm",
      secondary:
        "bg-(--surface-container-low) text-(--text-primary) border border-(--border) hover:bg-(--surface-container) hover:border-(--border-strong) active:scale-[0.98]",
      outline:
        "bg-(--surface) text-(--text-primary) border border-(--border) hover:bg-(--surface-container-low) hover:border-(--border-strong) active:scale-[0.98]",
      ghost:
        "bg-transparent text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--surface-container-low) active:scale-[0.98]",
      destructive:
        "bg-(--error-bg) text-(--error-text) border border-(--error-border) hover:opacity-90 active:scale-[0.98]",
    }[variant];

    const classes = `inline-flex items-center justify-center font-medium transition-all duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed disabled:pointer-events-none ${
      fullWidth ? "w-full" : ""
    } ${sizeClasses} ${variantClasses} ${className}`;
    const style = { borderRadius: "var(--radius-button)" };

    if (href !== undefined) {
      return (
        <Link href={href} style={style} className={classes}>
          {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        style={style}
        className={classes}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
