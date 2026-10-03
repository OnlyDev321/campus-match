"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  LayoutGrid,
  Users,
  PlusCircle,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Avatar } from "@/design-system";

interface NavItem {
  label: string;
  shortLabel?: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mainNavItems: NavItem[] = [
  {
    label: "Groups",
    shortLabel: "Groups",
    href: "/groups",
    icon: Compass,
  },
  {
    label: "My Page",
    shortLabel: "My Page",
    href: "/mypage",
    icon: LayoutGrid,
  },
  {
    label: "Manage",
    shortLabel: "Manage",
    href: "/manage",
    icon: Users,
  },
  {
    label: "Create Group",
    shortLabel: "Create",
    href: "/create-group",
    icon: PlusCircle,
  },
  {
    label: "Design System",
    shortLabel: "Design",
    href: "/design",
    icon: Layers,
  },
];

// Pinned / Active groups for students
const pinnedGroups = [
  {
    id: "cs490",
    code: "CS490",
    name: "AI Academic Planner",
    status: "active",
  },
  {
    id: "is334",
    code: "IS334",
    name: "Microservices Simulator",
    status: "pending",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load collapse state from localStorage if available
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("campus-match-sidebar-collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch (e) {}
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("campus-match-sidebar-collapsed", String(next));
      } catch (e) {}
      return next;
    });
  };

  return (
    <aside
      className={`app-nav-sidebar ${
        isCollapsed ? "md:w-16" : "md:w-64"
      }`}
      aria-label="Sidebar Navigation"
    >
      {/* Navigation Content Area */}
      <div className="app-nav-content">
        <nav className="app-nav-list">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={`group app-nav-item ${
                  isActive ? "app-nav-item-active" : "app-nav-item-inactive"
                } ${isCollapsed ? "md:justify-center md:px-0" : ""}`}
              >
                {/* Active Indicator: Desktop left accent / Mobile top bar */}
                {isActive && (
                  <>
                    <span
                      className="app-nav-indicator-desktop"
                      aria-hidden="true"
                    />
                    <span
                      className="app-nav-indicator-mobile"
                      aria-hidden="true"
                    />
                  </>
                )}

                <Icon
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive
                      ? "text-[var(--primary)]"
                      : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                  }`}
                />

                {/* Desktop Label (hidden when sidebar collapsed) */}
                {!isCollapsed && (
                  <span className="app-nav-label-desktop truncate flex-1 min-w-0">
                    {item.label}
                  </span>
                )}

                {/* Mobile Label (always visible below icon) */}
                <span className="app-nav-label-mobile truncate">
                  {item.shortLabel || item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Only: Pinned / Active Study Groups */}
        <div className="app-nav-desktop-only">
          {!isCollapsed && (
            <div className="space-y-1.5 pt-4 border-t border-[var(--border-muted)]">
              <div className="px-3.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] font-mono flex items-center justify-between">
                <span>My Groups</span>
                <span className="text-[10px] text-[var(--text-faint)]">
                  {pinnedGroups.length}
                </span>
              </div>

              <div className="space-y-1">
                {pinnedGroups.map((group) => (
                  <Link
                    key={group.id}
                    href={`/groups/${group.id}`}
                    className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-container-low)] transition-colors group"
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        group.status === "active"
                          ? "bg-[var(--success)] shadow-[0_0_8px_var(--success)]"
                          : "bg-[var(--warning)]"
                      }`}
                    />
                    <div className="flex-1 min-w-0 flex flex-col">
                      <span className="font-mono text-[10px] font-semibold text-[var(--primary)] truncate">
                        {group.code}
                      </span>
                      <span className="truncate text-[11px] text-[var(--text-primary)] group-hover:underline">
                        {group.name}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Only: Footer User Profile & Collapse Toggle */}
      <div className="app-nav-desktop-only p-2 border-t border-[var(--border)] bg-[var(--surface-container-lowest)] flex flex-col gap-2">
        {/* User Card */}
        <div
          className={`flex items-center gap-3 p-1.5 rounded-xl hover:bg-[var(--surface-container-low)] transition-colors ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <Avatar name="Hau Tran" size="sm" />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                Hau Tran
              </p>
              <p className="text-[11px] font-mono text-[var(--text-muted)] truncate">
                21520000 • SE K21
              </p>
            </div>
          )}
        </div>

        {/* Collapse / Expand Toggle Button */}
        <button
          onClick={toggleCollapse}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex items-center justify-center gap-2 w-full py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-container-low)] rounded-xl transition-colors cursor-pointer"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-[11px] font-medium">Collapse sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
