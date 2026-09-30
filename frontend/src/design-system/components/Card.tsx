"use client";

import React, { forwardRef } from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  isInteractive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, isInteractive = false, className = "", style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          borderRadius: "var(--radius-card)",
          ...style,
        }}
        className={`bg-(--surface) text-(--text-primary) border border-(--border) p-5 transition-all duration-150 ${
          isInteractive
            ? "cursor-pointer hover:border-(--border-interactive) hover:-translate-y-0.5 hover:shadow-(--shadow-level-2) hover:bg-(--surface-hover)"
            : "shadow-(--shadow-level-1)"
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div ref={ref} className={`flex items-start justify-between gap-4 mb-3 ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={`text-base font-semibold text-[var(--text-primary)] tracking-tight line-clamp-1 ${className}`}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ children, className = "", ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={`text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed ${className}`}
      {...props}
    >
      {children}
    </p>
  );
});

CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div ref={ref} className={`my-3 space-y-3 ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex items-center justify-between gap-3 pt-3 border-t border-[var(--border-muted)] ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = "CardFooter";
