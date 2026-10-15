"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/design-system";
import { SearchInput } from "@/design-system";
import { CommandBar } from "@/design-system";
import { Avatar } from "@/design-system";
import { BookOpen, Users, Compass, Bell } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/design-system";
import { LogOut } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

export default function Header() {
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const { user, isLoggedIn, openLoginModal, logout } = useAuth();
  const { t } = useLanguage();

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-14 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md">
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
            {/* Language Switcher (EN / KO / VI) */}
            <LanguageSwitcher />

            {/* Theme Toggle (Light / Dark) */}
            <ThemeToggle />

            {isLoggedIn ? (
              <>
                {/* Notification Button */}
                <button
                  type="button"
                  className="relative p-2 rounded-[var(--radius-button)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-container-low)] border border-transparent hover:border-[var(--border)]"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-[var(--surface)]" />
                </button>

                {/* User Profile Avatar */}
                <Link href="/mypage" className="shrink-0 ml-1 flex items-center gap-2 group">
                  <Avatar
                    name={user?.name || "홍길동"}
                    size="sm"
                    className="ring-1 ring-[var(--border)]"
                  />
                  <span className="hidden sm:inline text-xs font-medium text-[var(--text-primary)] group-hover:text-[var(--primary)]">
                    {user?.name || "학우"}
                  </span>
                </Link>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={logout}
                  title={t.nav.logout}
                  className="p-1.5 rounded-lg text-[var(--text-faint)] hover:text-[var(--error)] hover:bg-[var(--surface-container-low)] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => openLoginModal()}
                className="text-xs"
              >
                {t.nav.login}
              </Button>
            )}
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
