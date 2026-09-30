"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";
import { Sun, Moon, Laptop } from "lucide-react";

interface ThemeToggleProps {
  variant?: "icon-toggle" | "segmented";
  className?: string;
}

export function ThemeToggle({
  variant = "icon-toggle",
  className = "",
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Avoid hydration mismatch by rendering a placeholder of equal size
    return (
      <div
        className={`w-9 h-9 rounded-md border border-(--border) bg-(--surface) opacity-50 ${className}`}
        aria-hidden="true"
      />
    );
  }

  if (variant === "segmented") {
    return (
      <div
        role="group"
        aria-label="Theme selector"
        className={`inline-flex items-center p-1 rounded-lg border border-[var(--border)] bg-[var(--surface-container-low)] text-xs font-medium text-[var(--text-secondary)] ${className}`}
      >
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-button)] transition-colors ${
            theme === "light"
              ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-sm font-semibold"
              : "hover:text-[var(--text-primary)] hover:bg-[var(--surface-container)]"
          }`}
          aria-pressed={theme === "light"}
          title="Light theme"
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Light</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-button)] transition-colors ${
            theme === "dark"
              ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-sm font-semibold"
              : "hover:text-[var(--text-primary)] hover:bg-[var(--surface-container)]"
          }`}
          aria-pressed={theme === "dark"}
          title="Dark theme"
        >
          <Moon className="w-3.5 h-3.5" />
          <span>Dark</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme("system")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-button)] transition-colors ${
            theme === "system"
              ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-sm font-semibold"
              : "hover:text-[var(--text-primary)] hover:bg-[var(--surface-container)]"
          }`}
          aria-pressed={theme === "system"}
          title="System preference"
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>System</span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-[var(--radius-button)] border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-container-low)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] active:scale-95 ${className}`}
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
      title={`Current: ${resolvedTheme === "dark" ? "Dark Mode" : "Light Mode"} (click to toggle)`}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-(--primary) transition-transform rotate-0 hover:-rotate-12" />
      )}
    </button>
  );
}
