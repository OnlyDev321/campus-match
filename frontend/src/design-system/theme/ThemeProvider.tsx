"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from "react";
import { flushSync } from "react-dom";
import type { ThemeMode, ResolvedTheme } from "../tokens";
import type { ThemeContextType } from "@/lib/types";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "campus-match-theme";

function applyTheme(theme: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;
  root.style.backgroundColor = theme === "dark" ? "#090d16" : "#faf8ff";
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
}) {
  const activeTransition = useRef<ReturnType<Document["startViewTransition"]> | null>(null);

  useEffect(() => () => {
    activeTransition.current?.skipTransition();
  }, []);

  // Khởi tạo theme đồng bộ từ localStorage để triệt tiêu hoàn toàn nhấp nháy FOUC khi tải lại trang
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return defaultTheme;
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (stored === "light" || stored === "dark" || stored === "system") {
        return stored;
      }
    } catch {}
    return defaultTheme;
  });

  const [systemDark, setSystemDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Theo dõi khi hệ điều hành thay đổi chế độ sáng/tối
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const resolvedTheme: ResolvedTheme = useMemo(() => {
    if (theme === "system") {
      return systemDark ? "dark" : "light";
    }
    return theme;
  }, [theme, systemDark]);

  // Cập nhật thuộc tính theme mượt mà lên document root
  useEffect(() => {
    if (typeof window === "undefined") return;
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback<ThemeContextType["setTheme"]>((newTheme, event) => {
    // Không chồng nhiều ảnh chụp khi người dùng bấm liên tục.
    if (activeTransition.current) return;

    const nextResolved = newTheme === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : newTheme;
    const commit = () => {
      setThemeState(newTheme);
      applyTheme(nextResolved);
      try {
        localStorage.setItem(STORAGE_KEY, newTheme);
      } catch {
        // Theme vẫn hoạt động khi trình duyệt không cho phép lưu trữ.
      }
    };

    if (
      nextResolved === resolvedTheme ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof document.startViewTransition !== "function"
    ) {
      commit();
      return;
    }

    // Kích hoạt bằng bàn phím sẽ lấy tâm nút thay cho tọa độ chuột.
    const bounds = event?.currentTarget.getBoundingClientRect();
    const x = event && event.detail > 0 ? event.clientX : bounds ? bounds.left + bounds.width / 2 : window.innerWidth / 2;
    const y = event && event.detail > 0 ? event.clientY : bounds ? bounds.top + bounds.height / 2 : window.innerHeight / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );
    const root = document.documentElement;
    root.style.setProperty("--theme-origin-x", `${x}px`);
    root.style.setProperty("--theme-origin-y", `${y}px`);
    root.style.setProperty("--theme-radius", `${radius}px`);
    root.setAttribute("data-theme-transition", "");

    const cleanup = () => {
      activeTransition.current = null;
      root.removeAttribute("data-theme-transition");
      root.style.removeProperty("--theme-origin-x");
      root.style.removeProperty("--theme-origin-y");
      root.style.removeProperty("--theme-radius");
    };

    try {
      const transition = document.startViewTransition(() => {
        // React và DOM phải cập nhật trước khi trình duyệt chụp theme mới.
        flushSync(commit);
      });
      activeTransition.current = transition;
      void transition.finished.then(cleanup, cleanup);
    } catch {
      cleanup();
      commit();
    }
  }, [resolvedTheme]);

  const toggleTheme = useCallback<ThemeContextType["toggleTheme"]>((event) => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark", event);
  }, [resolvedTheme, setTheme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
