"use client";

import { ScrambleText } from "@/design-system/components/ScrambleText";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/design-system";
import { CommandBar } from "@/design-system";
import { Avatar } from "@/design-system";
import { ChevronDown, User, LogOut } from "lucide-react";

import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/design-system";
import { useLanguageStore } from "@/stores/languageStore";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import NotificationDropdown from "@/components/layout/NotificationDropdown";
import { BrandLogo } from "@/components/layout/BrandLogo";

export default function Header() {
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user, isLoggedIn, openLoginModal, logout } = useAuthStore();
  const { t } = useLanguageStore();

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
        <div className="w-full h-full px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-6 shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold tracking-tight text-[var(--text-primary)] hover:opacity-90 transition-opacity"
            >
              <BrandLogo size={32} priority />
              <span className="text-base font-semibold tracking-tight hidden min-[440px]:inline">
                Campus<span className="text-(--primary)">Match</span>
              </span>
            </Link>
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Language Switcher (EN / KO / VI) */}
            <LanguageSwitcher />

            {/* Theme Toggle (Light / Dark) */}
            <ThemeToggle />

            {isLoggedIn ? (
              <>
                {/* Notification Dropdown */}
                <NotificationDropdown />

                {/* User Dropdown Trigger */}
                <div className="relative ml-0.5 sm:ml-1" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1 sm:gap-1.5 p-0.5 sm:p-1 pl-1 sm:pl-1.5 pr-1.5 sm:pr-2.5 rounded-full hover:bg-[var(--surface-container-low)] border border-transparent hover:border-[var(--border)] cursor-pointer group"
                    aria-expanded={isUserMenuOpen}
                  >
                    <Avatar
                      src={user?.avatarUrl}
                      name={user?.name || "홍길동"}
                      size="sm"
                      className="ring-1 ring-[var(--border)] shrink-0"
                    />
                    <span className="hidden md:inline text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] truncate max-w-[90px]">
                      {user?.name || "학우"}
                    </span>
                    <ChevronDown
                      className={`w-3 h-3 text-[var(--text-faint)] transition-transform duration-200 shrink-0 ${
                        isUserMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu Popup */}
                  {isUserMenuOpen && (
                    <div className="motion-popover absolute right-0 mt-2 w-52 rounded-2xl bg-[var(--surface)] border border-[var(--border-strong)] shadow-[var(--shadow-level-3)] py-1.5 z-50">
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
                          <span><ScrambleText text={t.nav.myPage} /></span>
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
                          <span><ScrambleText text={t.nav.logout} /></span>
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
                <ScrambleText text={t.nav.login} />
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
