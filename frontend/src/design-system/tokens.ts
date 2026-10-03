/**
 * CampusMatch Design System Tokens
 * Source of truth mapped directly from DESIGN.md
 */

export const tokens = {
  light: {
    colors: {
      background: "#FAF8FF",
      surface: "#FFFFFF",
      surfaceDim: "#D2D9F4",
      surfaceBright: "#FAF8FF",

      surfaceContainerLowest: "#FFFFFF",
      surfaceContainerLow: "#F2F3FF",
      surfaceContainer: "#EAEDFF",
      surfaceContainerHigh: "#E2E7FF",
      surfaceContainerHighest: "#DAE2FD",

      textPrimary: "#131B2E",
      textSecondary: "#434655",
      textMuted: "#64748B",
      textFaint: "#94A3B8",

      inverseSurface: "#283044",
      inverseOnSurface: "#EEF0FF",

      border: "#E2E8F0",
      borderMuted: "#F1F5F9",
      borderStrong: "#C3C6D7",
      outline: "#737686",
      outlineVariant: "#C3C6D7",

      primary: "#004AC6",
      primaryHover: "#1D4ED8",
      primaryContainer: "#2563EB",
      onPrimary: "#FFFFFF",
      onPrimaryContainer: "#EEEFFF",

      secondary: "#006C49",
      secondaryContainer: "#6CF8BB",
      onSecondary: "#FFFFFF",
      onSecondaryContainer: "#00714D",

      tertiary: "#784B00",
      tertiaryContainer: "#996100",
      onTertiary: "#FFFFFF",
      onTertiaryContainer: "#FFEEDD",

      success: "#10B981",
      successBg: "#ECFDF5",
      successText: "#065F46",
      successBorder: "#A7F3D0",

      warning: "#F59E0B",
      warningBg: "#FFFBEB",
      warningText: "#92400E",
      warningBorder: "#FDE68A",

      error: "#EF4444",
      errorBg: "#FEF2F2",
      errorText: "#991B1B",
      errorBorder: "#FECACA",

      primarySoft: "#EFF6FF",
      primarySoftBorder: "#DBEAFE",
      focusRing: "rgba(37, 99, 235, 0.15)",
    },
    radii: {
      xs: "0.375rem",
      sm: "0.5rem",
      default: "0.625rem",
      md: "0.75rem",
      lg: "1rem",
      xl: "1.25rem",
      button: "12px",
      input: "12px",
      card: "16px",
      modal: "20px",
      badge: "9999px",
    },
    shadows: {
      level1: "0 1px 2px 0 rgba(15, 23, 42, 0.04)",
      level2: "0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.04)",
      level3: "0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.04)",
    },
    fonts: {
      primary: "Inter, sans-serif",
      mono: "JetBrains Mono, monospace",
    },
  },
  dark: {
    colors: {
      background: "#090D16",
      surface: "#111726",
      surfaceDim: "#0D121F",
      surfaceBright: "#1C243A",

      surfaceContainerLowest: "#060910",
      surfaceContainerLow: "#131929",
      surfaceContainer: "#172034",
      surfaceContainerHigh: "#1E2840",
      surfaceContainerHighest: "#263351",

      textPrimary: "#F8FAFC",
      textSecondary: "#94A3B8",
      textMuted: "#64748B",
      textFaint: "#475569",

      inverseSurface: "#F1F5F9",
      inverseOnSurface: "#0F172A",

      border: "rgba(255, 255, 255, 0.08)",
      borderMuted: "rgba(255, 255, 255, 0.05)",
      borderStrong: "rgba(255, 255, 255, 0.16)",
      borderInteractive: "rgba(96, 165, 250, 0.45)",
      outline: "#64748B",
      outlineVariant: "rgba(255, 255, 255, 0.1)",

      primary: "#3B82F6",
      primaryHover: "#60A5FA",
      primaryContainer: "#2563EB",
      onPrimary: "#FFFFFF",
      onPrimaryContainer: "#DBEAFE",

      secondary: "#34D399",
      secondaryContainer: "#059669",
      onSecondary: "#FFFFFF",
      onSecondaryContainer: "#D1FAE5",

      tertiary: "#FBBF24",
      tertiaryContainer: "#D97706",
      onTertiary: "#1E1B4B",
      onTertiaryContainer: "#FEF3C7",

      success: "#34D399",
      successBg: "rgba(16, 185, 129, 0.14)",
      successText: "#6EE7B7",
      successBorder: "rgba(52, 211, 153, 0.28)",

      warning: "#FBBF24",
      warningBg: "rgba(245, 158, 11, 0.14)",
      warningText: "#FCD34D",
      warningBorder: "rgba(251, 191, 36, 0.28)",

      error: "#F87171",
      errorBg: "rgba(239, 68, 68, 0.14)",
      errorText: "#FCA5A5",
      errorBorder: "rgba(248, 113, 113, 0.28)",

      primarySoft: "rgba(59, 130, 246, 0.14)",
      primarySoftBorder: "rgba(59, 130, 246, 0.28)",
      focusRing: "rgba(59, 130, 246, 0.35)",
    },
    radii: {
      xs: "0.375rem",
      sm: "0.5rem",
      default: "0.625rem",
      md: "0.75rem",
      lg: "1rem",
      xl: "1.25rem",
      button: "12px",
      input: "12px",
      card: "16px",
      modal: "20px",
      badge: "9999px",
    },
    shadows: {
      level1: "0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)",
      level2: "0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08), 0 0 20px -5px rgba(59, 130, 246, 0.08)",
      level3: "0 24px 38px -8px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.1)",
    },
    fonts: {
      primary: "Geist, Inter, sans-serif",
      mono: "JetBrains Mono, monospace",
    },
  },
  spacing: {
    xs: "0.25rem", // 4px
    sm: "0.5rem",  // 8px
    md: "0.75rem", // 12px
    lg: "1.25rem", // 20px
    xl: "2rem",    // 32px
    gutter: "1.5rem",
    gutterSm: "1rem",
    margin: "2rem",
    marginSm: "1rem",
    gutterDesktop: "1.5rem",
    marginDesktop: "2.5rem",
  },
  layout: {
    sidebarWidthDesktop: "256px",
    sidebarWidthCollapsed: "64px",
    topNavHeight: "56px",
    maxContentWidth: "1440px",
  },
} as const;

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";
