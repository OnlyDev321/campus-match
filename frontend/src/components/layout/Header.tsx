"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/design-system";
import { SearchInput } from "@/design-system";
import { CommandBar } from "@/design-system";
import { Avatar } from "@/design-system";
import { BookOpen, Users, Compass, Bell } from "lucide-react";

export default function Header() {
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-14 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md transition-colors duration-150">
        <div className="w-full h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-bold tracking-tight text-[var(--text-primary)] hover:opacity-90 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-(--primary-container) flex items-center justify-center text-white shadow-sm font-mono font-bold text-sm">
                CM
              </div>
              <span className="text-base font-semibold tracking-tight">
                Campus<span className="text-(--primary)">Match</span>
              </span>
            </Link>
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle (Light / Dark) */}
            <ThemeToggle />

            {/* Notification Button */}
            <button
              type="button"
              className="relative p-2 rounded-[var(--radius-button)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-container-low)] transition-colors border border-transparent hover:border-[var(--border)]"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-[var(--surface)]" />
            </button>

            {/* User Profile Avatar */}
            <Link href="/mypage" className="shrink-0 ml-1">
              <Avatar
                name="Alex Nguyen"
                size="sm"
                className="ring-1 ring-[var(--border)]"
              />
            </Link>
          </div>
        </div>
      </header>

      {/* Global Command Bar modal */}
      <CommandBar
        isOpen={isCommandBarOpen}
        onClose={() => setIsCommandBarOpen(false)}
      />
    </>
  );
}
