---
name: CampusMatch UI Design System
description: Unified Light and Dark Theme Design System for CampusMatch
version: 2.0
---

# CampusMatch — Design System

## 1. Brand & Style

CampusMatch is a modern academic productivity platform that helps university students discover, organize, and manage study groups and capstone project teams.

The design system combines the precision of modern SaaS products such as Linear, Notion, and Vercel with a focused, professional university collaboration experience.

The interface must support **Light Mode and Dark Mode** using one consistent design system. Both themes share the same layout, component structure, interaction patterns, and visual hierarchy while using theme-specific colors, typography, borders, and elevation.

### Design Principles

- **Precision-Driven:** Clear hierarchy, predictable interactions, and information-dense layouts without unnecessary visual noise.
- **Academic Rigor Meets Modern Tech:** Professional enough for capstone projects and collaborative academic work.
- **Calm & Focused:** Comfortable contrast, restrained colors, and minimal distractions.
- **Consistent Across Themes:** Light and Dark Mode must provide equivalent functionality and visual hierarchy.
- **Accessible by Design:** Maintain readable contrast, visible focus states, and clear status indicators in both themes.

### Design Aesthetic

**Light Mode — Clean Modern SaaS**

- Soft off-white canvases with crisp white surfaces.
- Slate-colored borders and subtle ambient shadows.
- Blue interactive accents and clear information hierarchy.
- Spacious, readable, professional layouts.

**Dark Mode — Minimalist Developer Workspace**

- OLED-inspired black and neutral dark surfaces.
- Tonal layering and crisp micro-outlines instead of heavy shadows.
- Electric blue interactive accents and restrained status colors.
- Compact, focused layouts with strong typographic clarity.

---

## 2. Theme Architecture

CampusMatch supports two appearance modes:

| Mode  | Description                              |
| ----- | ---------------------------------------- |
| Light | Bright, clean, professional interface    |
| Dark  | Minimalist, OLED-inspired dark interface |

### Theme Requirements

- Implement both themes within the same component system.
- Use semantic design tokens instead of hardcoded colors.
- All components must respond to the currently active theme.
- Switching themes must not change page structure, spacing, component sizes, or functionality.
- Persist the user's selected theme when application-level theme preferences are implemented.
- Support system appearance as an optional default.
- Avoid mixing Light Mode surfaces with Dark Mode text or borders.
- Ensure hover, focus, active, disabled, and selected states are defined for both themes.

### Theme Token Usage

Use semantic tokens such as:

- `background`
- `surface`
- `surface-container`
- `text-primary`
- `text-secondary`
- `text-muted`
- `border`
- `primary`
- `success`
- `warning`
- `error`

Never hardcode theme-specific hex values directly into reusable components when a semantic token is available.

---

## 3. Color System

### 3.1 Light Theme — Color Tokens

```yaml
light:
  colors:
    background: "#FAF8FF"
    surface: "#FFFFFF"
    surface-dim: "#D2D9F4"
    surface-bright: "#FAF8FF"

    surface-container-lowest: "#FFFFFF"
    surface-container-low: "#F2F3FF"
    surface-container: "#EAEDFF"
    surface-container-high: "#E2E7FF"
    surface-container-highest: "#DAE2FD"

    text-primary: "#131B2E"
    text-secondary: "#434655"
    text-muted: "#64748B"
    text-faint: "#94A3B8"

    inverse-surface: "#283044"
    inverse-on-surface: "#EEF0FF"

    border: "#E2E8F0"
    border-muted: "#F1F5F9"
    border-strong: "#C3C6D7"
    outline: "#737686"
    outline-variant: "#C3C6D7"

    primary: "#004AC6"
    primary-hover: "#1D4ED8"
    primary-container: "#2563EB"
    on-primary: "#FFFFFF"
    on-primary-container: "#EEEFFF"

    secondary: "#006C49"
    secondary-container: "#6CF8BB"
    on-secondary: "#FFFFFF"
    on-secondary-container: "#00714D"

    tertiary: "#784B00"
    tertiary-container: "#996100"
    on-tertiary: "#FFFFFF"
    on-tertiary-container: "#FFEEDD"

    success: "#10B981"
    success-bg: "#ECFDF5"
    success-text: "#065F46"
    success-border: "#A7F3D0"

    warning: "#F59E0B"
    warning-bg: "#FFFBEB"
    warning-text: "#92400E"
    warning-border: "#FDE68A"

    error: "#EF4444"
    error-bg: "#FEF2F2"
    error-text: "#991B1B"
    error-border: "#FECACA"

    primary-soft: "#EFF6FF"
    primary-soft-border: "#DBEAFE"

    focus-ring: "rgba(37, 99, 235, 0.15)"
```

### 3.2 Dark Theme — Color Tokens

```yaml
dark:
  colors:
    background: "#000000"
    surface: "#131313"
    surface-dim: "#131313"
    surface-bright: "#393939"

    surface-container-lowest: "#0E0E0E"
    surface-container-low: "#1B1B1B"
    surface-container: "#1F1F1F"
    surface-container-high: "#2A2A2A"
    surface-container-highest: "#353535"

    text-primary: "#FFFFFF"
    text-secondary: "#E4E4E7"
    text-muted: "#A1A1AA"
    text-faint: "#71717A"

    inverse-surface: "#E2E2E2"
    inverse-on-surface: "#303030"

    border: "#1F1F23"
    border-muted: "#1F1F23"
    border-strong: "#27272A"
    border-interactive: "#3F3F46"
    outline: "#8D90A0"
    outline-variant: "#434655"

    primary: "#B4C5FF"
    primary-hover: "#3B82F6"
    primary-container: "#2563EB"
    on-primary: "#002A78"
    on-primary-container: "#EEEFFF"

    secondary: "#4EDEA3"
    secondary-container: "#00A572"
    on-secondary: "#003824"
    on-secondary-container: "#00311F"

    tertiary: "#FFB95F"
    tertiary-container: "#996100"
    on-tertiary: "#472A00"
    on-tertiary-container: "#FFEEDD"

    success: "#10B981"
    success-bg: "#052E16"
    success-text: "#6EE7B7"
    success-border: "#10B981"

    warning: "#F59E0B"
    warning-bg: "#451A03"
    warning-text: "#FCD34D"
    warning-border: "#F59E0B"

    error: "#FFB4AB"
    error-bg: "#93000A"
    error-text: "#FFDAD6"
    error-border: "#FFB4AB"

    primary-soft: "#1B1B1B"
    primary-soft-border: "#27272A"

    focus-ring: "rgba(37, 99, 235, 0.25)"
```

### 3.3 Color Application Rules

- Primary blue is used for primary actions, active navigation, links, selected controls, and focus states.
- Success green represents Recruiting, Active, Open, and Accepted states.
- Warning amber represents Pending Approval, Applying, Waitlisted, and time-sensitive milestones.
- Error red represents Rejected, destructive actions, and error states.
- Closed, Full, and Archived states use subdued neutral colors unless an error-specific meaning is required.
- Course labels, technology tags, and academic role chips use subtle theme-aware accent surfaces.
- Do not rely on color alone to communicate status. Include readable text or an appropriate icon.
- Ensure accent colors remain legible against their corresponding theme surfaces.

---

## 4. Typography

CampusMatch uses a theme-aware typography system.

### Font Families

| Theme | Primary Font | Monospace Font |
| ----- | ------------ | -------------- |
| Light | Inter        | JetBrains Mono |
| Dark  | Geist        | JetBrains Mono |

Inter provides a clean, geometric appearance for the Light Theme. Geist provides a modern, technical appearance for the Dark Theme.

JetBrains Mono is used for technical and structured information such as course codes, dates, status labels, membership quotas, and keyboard shortcuts.

### 4.1 Light Theme Typography

```yaml
light:
  typography:
    display-lg:
      fontFamily: Inter
      fontSize: 36px
      fontWeight: "700"
      lineHeight: 44px
      letterSpacing: -0.025em

    display-lg-mobile:
      fontFamily: Inter
      fontSize: 28px
      fontWeight: "700"
      lineHeight: 36px
      letterSpacing: -0.02em

    headline-lg:
      fontFamily: Inter
      fontSize: 24px
      fontWeight: "600"
      lineHeight: 32px
      letterSpacing: -0.02em

    headline-md:
      fontFamily: Inter
      fontSize: 20px
      fontWeight: "600"
      lineHeight: 28px
      letterSpacing: -0.015em

    headline-sm:
      fontFamily: Inter
      fontSize: 16px
      fontWeight: "600"
      lineHeight: 24px
      letterSpacing: -0.01em

    body-lg:
      fontFamily: Inter
      fontSize: 16px
      fontWeight: "400"
      lineHeight: 24px

    body-md:
      fontFamily: Inter
      fontSize: 14px
      fontWeight: "400"
      lineHeight: 20px

    body-sm:
      fontFamily: Inter
      fontSize: 13px
      fontWeight: "400"
      lineHeight: 18px
      letterSpacing: 0.005em

    label-md:
      fontFamily: Inter
      fontSize: 14px
      fontWeight: "500"
      lineHeight: 20px

    label-sm:
      fontFamily: Inter
      fontSize: 12px
      fontWeight: "500"
      lineHeight: 16px
      letterSpacing: 0.01em

    label-xs:
      fontFamily: Inter
      fontSize: 11px
      fontWeight: "600"
      lineHeight: 14px
      letterSpacing: 0.02em

    code-sm:
      fontFamily: JetBrains Mono
      fontSize: 12px
      fontWeight: "400"
      lineHeight: 16px
```

### 4.2 Dark Theme Typography

```yaml
dark:
  typography:
    display-lg:
      fontFamily: Geist
      fontSize: 48px
      fontWeight: "600"
      lineHeight: 56px
      letterSpacing: -0.03em

    display-lg-mobile:
      fontFamily: Geist
      fontSize: 32px
      fontWeight: "600"
      lineHeight: 40px
      letterSpacing: -0.02em

    headline-lg:
      fontFamily: Geist
      fontSize: 30px
      fontWeight: "600"
      lineHeight: 38px
      letterSpacing: -0.02em

    headline-lg-mobile:
      fontFamily: Geist
      fontSize: 24px
      fontWeight: "600"
      lineHeight: 32px
      letterSpacing: -0.015em

    headline-md:
      fontFamily: Geist
      fontSize: 22px
      fontWeight: "500"
      lineHeight: 28px
      letterSpacing: -0.015em

    title-lg:
      fontFamily: Geist
      fontSize: 18px
      fontWeight: "500"
      lineHeight: 24px
      letterSpacing: -0.01em

    title-sm:
      fontFamily: Geist
      fontSize: 15px
      fontWeight: "500"
      lineHeight: 20px
      letterSpacing: -0.005em

    body-lg:
      fontFamily: Geist
      fontSize: 16px
      fontWeight: "400"
      lineHeight: 24px

    body-md:
      fontFamily: Geist
      fontSize: 14px
      fontWeight: "400"
      lineHeight: 21px

    body-sm:
      fontFamily: Geist
      fontSize: 12px
      fontWeight: "400"
      lineHeight: 18px
      letterSpacing: 0.01em

    label-md:
      fontFamily: JetBrains Mono
      fontSize: 13px
      fontWeight: "500"
      lineHeight: 18px
      letterSpacing: 0.02em

    label-sm:
      fontFamily: JetBrains Mono
      fontSize: 11px
      fontWeight: "500"
      lineHeight: 14px
      letterSpacing: 0.04em
```

### Typography Rules

- Use display and headline styles for page titles and major section headings.
- Use body styles for descriptions, explanatory content, and student-generated text.
- Use label styles for buttons, form labels, and interactive controls.
- Use JetBrains Mono for course codes, membership statistics, status indicators, and technical metadata.
- Maintain consistent typography hierarchy within each theme.
- Avoid excessive font weights and decorative typography.
- Use negative letter spacing for large headings as defined by the typography tokens.
- In Dark Mode, avoid unnecessary large blocks of pure white text to reduce visual glare.

---

## 5. Layout & Spacing

CampusMatch uses a responsive, fixed-sidebar and fluid-workspace layout.

### 5.1 Application Shell

#### Desktop — 1024px and above

- Fixed sidebar width: `256px` (260px may be used where required by the existing layout).
- Collapsed sidebar width: `64px`.
- Sticky top navigation height: `56px`.
- Main content area uses a fluid layout.
- Maximum content width: `1440px`.
- Use a 12-column grid.
- Sidebar remains pinned to the left.
- Main canvas must account for the sidebar width.

#### Tablet — 768px to 1023px

- Use an 8-column grid.
- Sidebar collapses to a `64px` icon rail.
- Main content remains fluid.
- Use master-detail layouts where appropriate.
- Reduce outer margins and inter-component spacing.

#### Mobile — Below 768px

- Use a 4-column grid.
- Sidebar becomes a bottom navigation bar or top drawer overlay.
- Stack content vertically.
- Cards and form controls should use the available width.
- Avoid horizontal overflow.
- Preserve important actions and status information.

### 5.2 Spacing Tokens

```yaml
spacing:
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem

  gutter: 1.5rem
  gutter-sm: 1rem

  margin: 2rem
  margin-sm: 1rem

  gutter-desktop: 1.5rem
  margin-desktop: 2.5rem
```

### Spacing Rules

- `space-xs` (4px): Inline icon spacing, compact pill padding, and avatar overlap.
- `space-sm` (8px): Form field spacing, list item gaps, and compact component padding.
- `space-md` (12px): Standard component spacing and grouped filters.
- `space-lg` (20px): Card padding and spacing between component sections.
- `space-xl` (32px): Major section spacing and dashboard widget separation.
- Use consistent spacing tokens rather than arbitrary values.
- Maintain the same component dimensions across both themes.

---

## 6. Elevation & Depth

### 6.1 Light Theme

Light Mode uses crisp borders and subtle ambient shadows.

| Level   | Usage                      | Style                                             |
| ------- | -------------------------- | ------------------------------------------------- |
| Level 0 | App canvas                 | `#F8FAFC`, flat                                   |
| Level 1 | Cards, sidebar, containers | White surface, `1px solid #E2E8F0`, subtle shadow |
| Level 2 | Hovered cards, dropdowns   | White surface, stronger border and subtle shadow  |
| Level 3 | Modals, drawers            | White surface, backdrop blur and elevated shadow  |

Level 1 shadow:

`0 1px 2px 0 rgba(15, 23, 42, 0.04)`

Level 2 shadow:

`0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`

Level 3 shadow:

`0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`

### 6.2 Dark Theme

Dark Mode uses tonal stepping and micro-outlines instead of traditional shadows.

| Level   | Usage                          | Surface               |
| ------- | ------------------------------ | --------------------- |
| Level 0 | App canvas                     | `#000000`             |
| Level 1 | Navigation, recessed panels    | `#050505` – `#0D0D0D` |
| Level 2 | Cards, workspaces              | `#121212`             |
| Level 3 | Hovered and focused components | `#1A1A1A`             |
| Level 4 | Modals, command palettes       | `#1A1A1A` – `#242424` |

- Level 1 surfaces use a `1px solid #1F1F23` border.
- Level 2 surfaces use a `1px solid #27272A` border.
- Level 3 surfaces use a `1px solid #3F3F46` border.
- Floating interfaces may use a subtle directional ambient glow.

Dark Mode ambient shadow:

`0 16px 32px -8px rgba(0, 0, 0, 0.8)`

### Elevation Rules

- Every elevated card, modal, and popover must have a clearly defined boundary.
- Avoid heavy shadows in Dark Mode.
- Avoid excessive shadows in Light Mode.
- Use surface contrast and borders as the primary separation method.
- Elevation must communicate hierarchy, not decoration.

---

## 7. Shapes & Border Radius

### 7.1 Light Theme

```yaml
light:
  rounded:
    sm: 0.25rem
    DEFAULT: 0.5rem
    md: 0.75rem
    lg: 1rem
    xl: 1.5rem
    full: 9999px
```

### 7.2 Dark Theme

```yaml
dark:
  rounded:
    sm: 0.125rem
    DEFAULT: 0.25rem
    md: 0.375rem
    lg: 0.5rem
    xl: 0.75rem
    full: 9999px
```

### Shape Rules

- Light Mode uses softer, more approachable curvature.
- Dark Mode uses crisp, technical geometry.
- Use the theme-specific radius tokens while keeping component dimensions consistent.

Typical usage:

| Component   | Light Mode | Dark Mode |
| ----------- | ---------- | --------- |
| Small chips | 4px        | 4px       |
| Buttons     | 8px        | 6px       |
| Inputs      | 8px        | 6px       |
| Cards       | 12px       | 8px       |
| Modals      | 16px       | 10px      |
| Avatars     | Full       | Full      |

---

## 8. Components

All components must support both Light and Dark Mode through semantic theme tokens.

### 8.1 Buttons

#### Primary Button

**Light Mode**

- Background: `#2563EB`
- Text: `#FFFFFF`
- Hover: `#1D4ED8`
- Radius: `8px`

**Dark Mode**

- Background: `#2563EB`
- Text: `#FFFFFF`
- Hover: `#3B82F6`
- Radius: `6px`

Shared behavior:

- Height: `36px` (medium), `32px` (small).
- Font weight: Medium or SemiBold.
- Active state: Slight scale reduction or darker interaction state.
- Focus ring: `2px` with `2px` offset.
- Use for the primary action within a section or form.

#### Secondary / Outline Button

**Light Mode**

- White background.
- `1px solid #E2E8F0` border.
- Text: `#0F172A`.
- Hover background: `#F8FAFC`.

**Dark Mode**

- `#000000` background.
- `1px solid #27272A` border.
- Text: `#E4E4E7`.
- Hover background: `#121212`.

#### Ghost Button

- Transparent background.
- No prominent border.
- Use secondary text color.
- Apply a subtle theme-aware hover background.
- Destructive ghost buttons use the error color and a subtle error-tinted background.

---

### 8.2 Badges & Status Chips

Status chips communicate group availability, application progress, and project state.

#### Recruiting / Active

**Light Mode**

- Background: `#ECFDF5`
- Text: `#065F46`
- Border: `#A7F3D0`

**Dark Mode**

- Background: `#052E16`
- Text: `#6EE7B7`
- Border: `#10B981`

#### Pending / Applying

**Light Mode**

- Background: `#FFFBEB`
- Text: `#92400E`
- Border: `#FDE68A`

**Dark Mode**

- Background: `#451A03`
- Text: `#FCD34D`
- Border: `#F59E0B`

#### Closed / Archived

**Light Mode**

- Background: `#FEF2F2`
- Text: `#991B1B`
- Border: `#FECACA`

**Dark Mode**

- Background: `#18181B`
- Text: `#71717A`
- Border: `#27272A`

#### Badge Rules

- Use JetBrains Mono for technical or transactional status indicators.
- Compact badges use `11px–12px` text.
- Use `2px 8px` padding for compact chips.
- Use `4px` radius in Dark Mode and `9999px` for rounded Light Mode pills where appropriate.
- Recruiting and Active badges may include a `6px` emerald dot.
- Avoid excessive animation. Pulsing indicators should be reserved for meaningful live states.

---

### 8.3 Study Group & Project Cards

Cards are the primary building blocks of the group directory and dashboard.

#### Light Mode

- Background: `#FFFFFF`
- Border: `1px solid #E2E8F0`
- Radius: `12px`
- Padding: `20px`
- Hover border: `#93C5FD`
- Hover shadow: Level 2
- Hover transform: `translateY(-1px)`

#### Dark Mode

- Background: `#121212`
- Border: `1px solid #1F1F23`
- Radius: `8px`
- Padding: `1.25rem`
- Hover background: `#1A1A1A`
- Hover border: `#3F3F46`

#### Card Structure

1. Header row:
   - Course code or category label on the left.
   - Recruiting, Closed, or other status badge on the right.

2. Main content:
   - Group title.
   - Short description.
   - Relevant technology tags or academic information.

3. Footer:
   - Member avatars.
   - Available seat counter.
   - Apply or View Details action.

#### Card Rules

- Keep cards visually compact and easy to scan.
- Clamp long descriptions to two lines where appropriate.
- Use consistent alignment across card grids.
- Use the same layout in both themes.
- Hover transitions should be subtle and approximately `150ms ease`.
- Do not use excessive decorative gradients or shadows.

---

### 8.4 Form Inputs & Search Fields

#### Light Mode

- Background: `#FFFFFF`
- Border: `1px solid #CBD5E1`
- Text: `#0F172A`
- Placeholder: `#94A3B8`
- Focus border: `#2563EB`
- Focus ring: `3px rgba(37, 99, 235, 0.15)`

#### Dark Mode

- Background: `#050505`
- Border: `1px solid #27272A`
- Text: `#FFFFFF`
- Placeholder: `#52525B`
- Focus border: `#2563EB`
- Focus outline: `1px solid #2563EB`

#### Shared Rules

- Default input height: `38px`.
- Use consistent label placement and field spacing.
- Provide clear focus and validation states.
- Maintain readable placeholder contrast.
- Validation errors must include text or an icon, not only a border color.

#### Global Search

- Integrate a keyboard shortcut badge such as `⌘K` or `Ctrl+K`.
- Use JetBrains Mono for keyboard shortcut hints.
- Light Mode keycap: `#F1F5F9`.
- Dark Mode keycap: `#1A1A1A`.
- Keep the shortcut aligned to the right inside the search field.

---

### 8.5 Checkboxes & Radio Buttons

#### Light Mode

- Border: `#CBD5E1`
- Checked background: `#2563EB`
- Checked icon: White

#### Dark Mode

- Unchecked background: `#0D0D0D`
- Border: `#27272A`
- Checked background: `#2563EB`
- Checked icon: White

#### Shared Rules

- Standard size: `16px × 16px`.
- Checkbox radius: `4px`.
- Radio buttons use a circular shape.
- Selected states must remain visually clear in both themes.
- Disabled states must remain distinguishable without appearing interactive.

---

### 8.6 Lists & Activity Rows

Used for member management, application review, and group directories.

#### Light Mode

- Row separators: `1px solid #F1F5F9`
- Hover background: `#F8FAFC`

#### Dark Mode

- Row separators: `1px solid #1F1F23`
- Hover background: `#0D0D0D`

#### Shared Rules

- Support single-line and double-line rows.
- Keep primary information left-aligned.
- Align metadata and contextual actions consistently.
- Use ellipsis menus for secondary actions.
- Avoid excessive row height.
- Ensure hover states do not obscure text or status indicators.

---

### 8.7 Domain-Specific Components

#### Role Quota Indicator

Displays group capacity and role distribution.

Examples:

- `3/5 Filled`
- Frontend: 1/2
- Backend: 1/2
- Design: 1/1

Requirements:

- Use compact bars or segmented circular indicators.
- Keep labels and counts readable.
- Use semantic status colors.
- Ensure indicators remain distinguishable in both themes.

#### Compatibility Tag

Displays shared schedules, majors, interests, or other compatibility information.

Example:

- `92% Schedule Match`

Requirements:

- Use a subtle blue or indigo-tinted surface.
- Avoid making compatibility scores visually dominate the group title.
- Do not imply a guaranteed match when displaying an estimated compatibility value.

---

### 8.8 Command Bar / Quick Search

Used for global search and quick navigation.

#### Light Mode

- Background: `#FFFFFF`
- Border: `1px solid #E2E8F0`
- Elevated Level 3 shadow.
- Backdrop: subtle dark overlay with blur.

#### Dark Mode

- Background: `#121212`
- Border: `1px solid #3F3F46`
- Radius: `10px`
- Subtle directional ambient shadow.

#### Shared Rules

- Center the command bar within the viewport.
- Use a clear, full-width search input.
- Support keyboard shortcut hints using monospaced keycaps.
- Keep search results visually separated.
- Maintain a clear selected-result state.
- Ensure keyboard navigation and focus indicators are visible.

---

## 9. Navigation & Application Shell Components

### Sidebar

- Desktop width: approximately `256px`.
- Collapsed width: `64px`.
- Fixed to the left side of the viewport.
- Use a `1px` theme-aware vertical border.
- Active navigation uses the primary accent and a subtle theme-specific surface.
- Icons and labels must maintain consistent alignment.

### Top Navigation Bar

- Height: `56px`.
- Sticky at the top.
- Contains global search, notifications, and user/workspace controls.
- Light Mode may use a translucent white surface with blur.
- Dark Mode uses a dark surface with a subtle bottom border.

### Mobile Navigation

- Use bottom navigation or a top drawer overlay.
- Prioritize the most frequently used destinations.
- Ensure labels and icons remain visible in both themes.
- Prevent navigation from obscuring page content or primary actions.

---

## 10. Interaction & Motion

CampusMatch uses subtle, purposeful interactions.

### Interaction Principles

- Every interactive component must have a clear hover, focus, active, and disabled state.
- Use transitions to improve feedback, not to decorate.
- Keep animations fast and unobtrusive.
- Maintain consistent interaction behavior across Light and Dark Mode.
- Avoid excessive bouncing, scaling, or animated gradients.

### Motion Guidelines

| Interaction             | Recommended Duration |
| ----------------------- | -------------------- |
| Button hover            | 150ms                |
| Card hover              | 150ms                |
| Border/color transition | 150ms                |
| Modal appearance        | 150–200ms            |
| Dropdown appearance     | 100–150ms            |

- Prefer `ease` or similarly subtle easing.
- Respect reduced-motion preferences.
- Never use animation as the only indication of a state change.

---

## 11. Accessibility & Responsive Behavior

- Maintain sufficient contrast between text and background.
- Ensure interactive elements have visible focus states.
- Provide semantic labels for form controls.
- Do not rely on color alone for status communication.
- Keep primary actions accessible on mobile screens.
- Avoid horizontal overflow at all supported breakpoints.
- Ensure modals and drawers remain usable on smaller screens.
- Use consistent spacing and typography hierarchy across themes.
- Test both themes in desktop, tablet, and mobile layouts.

---

## 12. Implementation Guidelines

### Theme Implementation

- Implement Light and Dark Mode through centralized theme tokens.
- Use CSS variables or the existing theme provider to expose semantic colors.
- Components should reference semantic tokens rather than individual theme hex values.
- Do not duplicate entire pages or components for each theme.
- Keep theme switching independent of application business logic.
- Reuse the same component structure, spacing system, and responsive rules.

### Component Development

When creating or modifying a component:

1. Follow the shared layout and component specifications.
2. Use semantic theme tokens for all colors.
3. Implement Light and Dark Mode states.
4. Preserve responsive behavior.
5. Include hover, focus, active, and disabled states where applicable.
6. Maintain consistent typography and spacing.
7. Avoid introducing new colors, radii, or shadows without a clear design-system requirement.

### Final Design Principle

**CampusMatch must feel like one cohesive product in both Light and Dark Mode.**

Light Mode emphasizes clarity, whitespace, and approachable SaaS aesthetics. Dark Mode emphasizes focus, tonal depth, and technical precision.

The visual treatment may differ, but the underlying component system, information hierarchy, usability, and product identity must remain consistent.
