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
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mainNavItems: NavItem[] = [
  {
    label: "Groups",
    href: "/groups",
    icon: Compass,
  },
  {
    label: "My Page",
    href: "/mypage",
    icon: LayoutGrid,
  },
  {
    label: "Manage",
    href: "/manage",
    icon: Users,
  },
  {
    label: "Create Group",
    href: "/create-group",
    icon: PlusCircle,
  },
  {
    label: "Design System",
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
      className={`hidden md:flex sticky top-14 h-[calc(100vh-3.5rem)] flex-col border-r border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] transition-all duration-200 ease-in-out z-30 select-none ${
        isCollapsed ? "w-16" : "w-64"
      }`}
      aria-label="Sidebar Navigation"
    >
      {/* Main Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 pt-4 pb-3 space-y-6">
        <nav className="space-y-1">
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
                className={`group relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-50/90 dark:bg-blue-950/40 text-[var(--primary)] font-semibold shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-container-low)]"
                } ${isCollapsed ? "justify-center px-0" : ""}`}
              >
                {/* Left vertical accent indicator for active state */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1.5 bottom-1.5 w-[3.5px] rounded-r-full bg-[var(--primary)]"
                    aria-hidden="true"
                  />
                )}

                <Icon
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive
                      ? "text-[var(--primary)]"
                      : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                  }`}
                />

                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <span className="truncate">{item.label}</span>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Section: My Active Study Groups */}
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

      {/* Footer / User Profile & Collapse Toggle */}
      <div className="p-2 border-t border-[var(--border)] bg-[var(--surface-container-lowest)] flex flex-col gap-2">
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
