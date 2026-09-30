"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Compass, Users, BookOpen, Sparkles, ArrowRight } from "lucide-react";

export interface CommandItem {
  id: string;
  title: string;
  category: string;
  icon?: React.ReactNode;
  onSelect?: () => void;
}

export interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  items?: CommandItem[];
}

export function CommandBar({ isOpen, onClose, items }: CommandBarProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const defaultItems: CommandItem[] = [
    {
      id: "browse-groups",
      title: "Browse All Study Groups",
      category: "Navigation",
      icon: <Users className="w-4 h-4 text-blue-500" />,
    },
    {
      id: "capstone-projects",
      title: "Capstone Project Teams (CS490)",
      category: "Groups",
      icon: <BookOpen className="w-4 h-4 text-emerald-500" />,
    },
    {
      id: "match-finder",
      title: "AI Schedule & Skills Matcher",
      category: "Discovery",
      icon: <Sparkles className="w-4 h-4 text-purple-500" />,
    },
    {
      id: "create-group",
      title: "Create New Study Group",
      category: "Actions",
      icon: <Compass className="w-4 h-4 text-amber-500" />,
    },
  ];

  const availableItems = items || defaultItems;

  const filteredItems = availableItems.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle on Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else setSelectedIndex(0);
      }

      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + (filteredItems.length || 1)) % (filteredItems.length || 1));
      } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
        e.preventDefault();
        filteredItems[selectedIndex].onSelect?.();
        onClose();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, filteredItems, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Command Palette Card */}
      <div
        style={{ borderRadius: "var(--radius-modal)" }}
        className="relative w-full max-w-xl bg-(--surface) border border-(--border-strong) shadow-(--shadow-level-3) z-10 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
      >
        {/* Search Header */}
        <div className="flex items-center px-4 border-b border-(--border)">
          <Search className="w-4 h-4 text-(--text-faint) shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search groups..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full h-12 px-3 text-sm bg-transparent text-(--text-primary) placeholder:text-(--text-faint) focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-medium text-(--text-muted) bg-(--surface-container-low) border border-(--border) rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="p-6 text-center text-xs text-(--text-muted)">
              No matching results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    item.onSelect?.();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-(--radius-button) text-left text-sm transition-colors ${
                    isSelected
                      ? "bg-(--primary-container) text-white"
                      : "text-(--text-primary) hover:bg-(--surface-container-low)"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isSelected ? "text-white" : ""}>
                      {item.icon || <Compass className="w-4 h-4" />}
                    </span>
                    <span className="font-medium">{item.title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs ${
                        isSelected ? "text-white/80" : "text-(--text-muted)"
                      }`}
                    >
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-white" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2 text-[11px] font-mono text-(--text-muted) bg-(--surface-container-low) border-t border-(--border)">
          <div className="flex items-center gap-2">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>CampusMatch Quick Search</span>
        </div>
      </div>
    </div>
  );
}
