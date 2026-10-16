"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/design-system";
import { CommandBar } from "@/design-system";
import { Avatar } from "@/design-system";
import { Bell, ChevronDown, User, LogOut } from "lucide-react";

import { useAuth } from "@/stores/authStore";
import { Button } from "@/design-system";
import { useLanguage } from "@/stores/languageStore";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

export default function Header() {
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user, isLoggedIn, openLoginModal, logout } = useAuth();
  const { t } = useLanguage();

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
                  className="relative p-2 rounded-[var(--radius-button)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-container-low)] border border-transparent hover:border-[var(--border)] cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-[var(--surface)]" />
                </button>

                {/* User Dropdown Trigger */}
                <div className="relative ml-1" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-[var(--surface-container-low)] border border-transparent hover:border-[var(--border)] cursor-pointer group"
                    aria-expanded={isUserMenuOpen}
                  >
                    <Avatar
                      name={user?.name || "홍길동"}
                      size="sm"
                      className="ring-1 ring-[var(--border)]"
                    />
                    <span className="hidden sm:inline text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)]">
                      {user?.name || "학우"}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[var(--text-faint)] transition-transform duration-200 ${
                        isUserMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu Popup */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[var(--surface)] border border-[var(--border-strong)] shadow-[var(--shadow-level-3)] py-1.5 z-50 animate-in fade-in-0 zoom-in-95">
                      {/* User Info Header */}
                      <div className="px-3.5 py-2.5 border-b border-[var(--border)]">
                        <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                          {user?.name || "홍길동"}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                          {user?.department || "컴퓨터학부"} ·{" "}
                          {user?.studentId || "20211234"}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="p-1 space-y-0.5">
                        <Link
                          href="/mypage"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-container-low)] transition-colors"
                        >
                          <User className="w-4 h-4 text-[var(--text-secondary)]" />
                          <span>{t.nav.myPage}</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--error)] hover:bg-[var(--error-bg)] transition-colors cursor-pointer text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{t.nav.logout}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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
