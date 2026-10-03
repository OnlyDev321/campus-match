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
      background: "#000000",
      surface: "#131313",
      surfaceDim: "#131313",
      surfaceBright: "#393939",

      surfaceContainerLowest: "#0E0E0E",
      surfaceContainerLow: "#1B1B1B",
      surfaceContainer: "#1F1F1F",
      surfaceContainerHigh: "#2A2A2A",
      surfaceContainerHighest: "#353535",

      textPrimary: "#FFFFFF",
      textSecondary: "#E4E4E7",
      textMuted: "#A1A1AA",
      textFaint: "#71717A",

      inverseSurface: "#E2E2E2",
      inverseOnSurface: "#303030",

      border: "#1F1F23",
      borderMuted: "#1F1F23",
      borderStrong: "#27272A",
      borderInteractive: "#3F3F46",
      outline: "#8D90A0",
      outlineVariant: "#434655",

      primary: "#B4C5FF",
      primaryHover: "#3B82F6",
      primaryContainer: "#2563EB",
      onPrimary: "#002A78",
      onPrimaryContainer: "#EEEFFF",

      secondary: "#4EDEA3",
      secondaryContainer: "#00A572",
      onSecondary: "#003824",
      onSecondaryContainer: "#00311F",

      tertiary: "#FFB95F",
      tertiaryContainer: "#996100",
      onTertiary: "#472A00",
      onTertiaryContainer: "#FFEEDD",

      success: "#10B981",
      successBg: "#052E16",
      successText: "#6EE7B7",
      successBorder: "#10B981",

      warning: "#F59E0B",
      warningBg: "#451A03",
      warningText: "#FCD34D",
      warningBorder: "#F59E0B",

      error: "#FFB4AB",
      errorBg: "#93000A",
      errorText: "#FFDAD6",
      errorBorder: "#FFB4AB",

      primarySoft: "#1B1B1B",
      primarySoftBorder: "#27272A",
      focusRing: "rgba(37, 99, 235, 0.25)",
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
      level1: "none",
      level2: "0 4px 12px rgba(0, 0, 0, 0.4)",
      level3: "0 16px 32px -8px rgba(0, 0, 0, 0.8)",
    },
    fonts: {
      primary: "Inter, sans-serif",
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
