"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellOff,
  CheckCheck,
  CheckCircle2,
  Info,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
  XCircle,
  ShieldCheck,
} from "lucide-react";
import { useNotificationStore } from "@/stores/notificationStore";
import { useLanguageStore } from "@/stores/languageStore";
import type { AppNotification, NotificationType } from "@/lib/types";

function formatRelativeTime(
  dateString: string,
  t: {
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
    daysAgo: string;
  }
): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMin = Math.max(0, Math.floor(diffMs / (1000 * 60)));
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return t.justNow;
  if (diffMin < 60) return t.minutesAgo.replace("{count}", String(diffMin));
  if (diffHour < 24) return t.hoursAgo.replace("{count}", String(diffHour));
  return t.daysAgo.replace("{count}", String(diffDay));
}

function getNotificationVisuals(type: NotificationType) {
  switch (type) {
    case "APPLICATION_RECEIVED":
      return {
        icon: UserPlus,
        bgColor: "bg-blue-500/10 dark:bg-blue-500/15",
        textColor: "text-blue-600 dark:text-blue-400",
        borderColor: "border-blue-500/20",
      };
    case "APPLICATION_ACCEPTED":
      return {
        icon: CheckCircle2,
        bgColor: "bg-emerald-500/10 dark:bg-emerald-500/15",
        textColor: "text-emerald-600 dark:text-emerald-400",
        borderColor: "border-emerald-500/20",
      };
    case "APPLICATION_REJECTED":
      return {
        icon: XCircle,
        bgColor: "bg-rose-500/10 dark:bg-rose-500/15",
        textColor: "text-rose-600 dark:text-rose-400",
        borderColor: "border-rose-500/20",
      };
    case "NEW_MEMBER_JOINED":
      return {
        icon: Users,
        bgColor: "bg-indigo-500/10 dark:bg-indigo-500/15",
        textColor: "text-indigo-600 dark:text-indigo-400",
        borderColor: "border-indigo-500/20",
      };
    case "GROUP_UPDATED":
      return {
        icon: Sparkles,
        bgColor: "bg-amber-500/10 dark:bg-amber-500/15",
        textColor: "text-amber-600 dark:text-amber-400",
        borderColor: "border-amber-500/20",
      };
    case "GROUP_FULL":
      return {
        icon: ShieldCheck,
        bgColor: "bg-purple-500/10 dark:bg-purple-500/15",
        textColor: "text-purple-600 dark:text-purple-400",
        borderColor: "border-purple-500/20",
      };
    default:
      return {
        icon: Info,
        bgColor: "bg-[var(--surface-container-high)]",
        textColor: "text-[var(--text-secondary)]",
        borderColor: "border-[var(--border)]",
      };
  }
}

export default function NotificationDropdown() {
  const router = useRouter();
  const { t } = useLanguageStore();
  const copy = t.notifications;
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotificationStore();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const containerRef = useRef<HTMLDivElement>(null);

  // Tải thông báo mới nhất từ Database khi component mount hoặc khi mở dropdown
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const filteredNotifications = useMemo(() => {
    if (activeTab === "unread") {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications;
  }, [notifications, activeTab]);

  const handleNotificationClick = (notif: AppNotification) => {
    markAsRead(notif.id);
    setIsOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Notification Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-1.5 sm:p-2 rounded-[var(--radius-button)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-container-low)] border border-transparent hover:border-[var(--border)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] transition-colors"
        aria-label={copy.title}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4" />

        {/* Live Contextual Unread Indicator (UI/UX Pro Max Accessibility Guideline) */}
        {unreadCount > 0 && (
          <>
            <span
              className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[var(--surface)] animate-pulse"
              aria-hidden="true"
            />
            <span role="status" aria-atomic="true" className="sr-only">
              {unreadCount} {copy.unreadTab}
            </span>
          </>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label={copy.title}
          className="motion-popover absolute right-0 mt-2 w-[calc(100vw-24px)] sm:w-96 max-w-[420px] rounded-2xl bg-[var(--surface)] border border-[var(--border-strong)] shadow-[var(--shadow-level-3)] z-50 overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[580px]"
        >
          {/* 1. Header */}
          <div className="p-3.5 sm:p-4 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center font-bold">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
                  {copy.title}
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {copy.unreadBadge.replace("{count}", String(unreadCount))}
                  </span>
                )}
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--primary)] hover:text-[var(--primary-hover)] hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--primary)] rounded px-1.5 py-0.5 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>{copy.markAllRead}</span>
              </button>
            )}
          </div>

          {/* 2. Filter Tabs */}
          <div className="px-3 pt-2 pb-1.5 border-b border-[var(--border-muted)] bg-[var(--surface-container-low)] flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === "all"
                  ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-2xs font-semibold border border-[var(--border)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-container-high)]/50"
              }`}
            >
              {copy.allTab} ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("unread")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "unread"
                  ? "bg-[var(--surface)] text-[var(--primary)] shadow-2xs font-semibold border border-[var(--border)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-container-high)]/50"
              }`}
            >
              <span>{copy.unreadTab}</span>
              {unreadCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[var(--primary)] text-white text-[10px] font-mono flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* 3. Notification List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-muted)] overscroll-contain">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--border)] flex items-center justify-center mx-auto text-[var(--text-muted)]">
                  <BellOff className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-[var(--text-primary)]">
                    {activeTab === "unread" ? copy.emptyUnread : copy.emptyAll}
                  </h4>
                  <p className="text-[11px] text-[var(--text-muted)] max-w-xs mx-auto leading-relaxed">
                    {activeTab === "unread"
                      ? copy.emptyUnreadDesc
                      : copy.emptyAllDesc}
                  </p>
                </div>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const visual = getNotificationVisuals(notif.type);
                const IconComponent = visual.icon;

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`group relative p-3.5 sm:p-4 transition-colors cursor-pointer flex items-start gap-3 ${
                      !notif.isRead
                        ? "bg-[var(--primary-soft)]/20 hover:bg-[var(--primary-soft)]/35"
                        : "hover:bg-[var(--surface-container-low)]"
                    }`}
                  >
                    {/* Event Icon Badge */}
                    <div
                      className={`w-8 h-8 rounded-xl ${visual.bgColor} ${visual.textColor} border ${visual.borderColor} flex items-center justify-center shrink-0 mt-0.5`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={`text-xs truncate ${
                            !notif.isRead
                              ? "font-bold text-[var(--text-primary)]"
                              : "font-semibold text-[var(--text-secondary)]"
                          }`}
                        >
                          {notif.title}
                        </h4>

                        <span className="text-[10px] font-mono text-[var(--text-muted)] shrink-0">
                          {formatRelativeTime(notif.createdAt, copy)}
                        </span>
                      </div>

                      <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed break-words">
                        {notif.message}
                      </p>

                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        {notif.groupTitle && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--surface-container-high)] text-[var(--text-secondary)] truncate max-w-[150px]">
                            {notif.groupTitle}
                          </span>
                        )}
                        {!notif.isRead && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {copy.unreadTab}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Individual Delete Button on Hover */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notif.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-muted)] hover:text-[var(--error)] rounded transition-opacity cursor-pointer shrink-0"
                      title={copy.clearAll}
                      aria-label={copy.clearAll}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* 4. Footer */}
          {notifications.length > 0 && (
            <div className="p-2.5 px-4 border-t border-[var(--border)] bg-[var(--surface-container-low)] flex items-center justify-between text-xs">
              <span className="text-[11px] text-[var(--text-muted)]">
                {notifications.length} {copy.title.toLowerCase()}
              </span>
              <button
                type="button"
                onClick={clearAll}
                className="text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--error)] hover:underline cursor-pointer transition-colors"
              >
                {copy.clearAll}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

