"use client";

import React, { forwardRef, useEffect, useState } from "react";
import { Search } from "lucide-react";

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  shortcut?: string;
  onShortcutTrigger?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      placeholder = "Search groups, courses, skills...",
      shortcut = "⌘K",
      onShortcutTrigger,
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    const [displayShortcut, setDisplayShortcut] = useState(shortcut);

    // Detect Mac vs Windows/Linux for shortcut display
    useEffect(() => {
      if (typeof window !== "undefined") {
        const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent);
        setDisplayShortcut(isMac ? "⌘K" : "Ctrl+K");
      }
    }, []);

    return (
      <div className="relative flex items-center w-full">
        <Search className="absolute left-3 w-4 h-4 text-(--text-faint) pointer-events-none" />

        <input
          type="search"
          ref={ref}
          placeholder={placeholder}
          style={{
            borderRadius: "var(--radius-input)",
            ...style,
          }}
          className={`w-full h-[38px] pl-9 pr-14 text-sm bg-(--surface) text-(--text-primary) border border-(--border) placeholder:text-(--text-faint) transition-all duration-150 hover:border-(--border-strong) focus:outline-none focus:border-(--primary-container) focus:ring-2 focus:ring-(--focus-ring) ${className}`}
          {...props}
        />

        {displayShortcut && (
          <div className="absolute right-2.5 flex items-center pointer-events-none">
            <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-[var(--text-muted)] bg-[var(--surface-container-low)] border border-[var(--border)] rounded">
              {displayShortcut}
            </kbd>
          </div>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";
