"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  LayoutGrid,
  Users,
  PlusCircle,
} from "lucide-react";
import { useLanguageStore } from "@/stores/languageStore";
import type { NavItem } from "@/lib/types";

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguageStore();

  const mainNavItems: NavItem[] = [
    {
      label: t.nav.groups,
      shortLabel: t.nav.groups,
      href: "/groups",
      icon: Compass,
    },
    {
      label: t.nav.myPage,
      shortLabel: t.nav.myPage,
      href: "/mypage",
      icon: LayoutGrid,
    },
    {
      label: t.nav.manage,
      shortLabel: t.nav.manage,
      href: "/manage",
      icon: Users,
    },
    {
      label: t.nav.createGroup,
      shortLabel: t.nav.createGroup,
      href: "/create-group",
      icon: PlusCircle,
    },
  ];

  if (pathname === "/") {
    return null;
  }

  return (
    <aside
      className="app-nav-sidebar md:w-64"
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
                className={`group app-nav-item ${
                  isActive ? "app-nav-item-active" : "app-nav-item-inactive"
                }`}
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
                  className={`w-5 h-5 shrink-0 ${
                    isActive
                      ? "text-[var(--primary)]"
                      : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                  }`}
                />

                {/* Desktop Label */}
                <span className="app-nav-label-desktop truncate flex-1 min-w-0">
                  {item.label}
                </span>

                {/* Mobile Label (always visible below icon) */}
                <span className="app-nav-label-mobile truncate">
                  {item.shortLabel || item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
