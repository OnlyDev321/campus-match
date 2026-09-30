/**
 * CampusMatch Reusable Design System
 * Unified Light & Dark Mode Tokens, Providers & Components
 * Documentation: frontend/DESIGN.md
 */

// Tokens
export * from "./tokens";

// Theme Context & Toggle
export { ThemeProvider, useTheme } from "./theme/ThemeProvider";
export { ThemeToggle } from "./theme/ThemeToggle";

// Core Primitives & Components
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from "./components/Button";
export { Badge, type BadgeProps, type BadgeVariant, type BadgeSize } from "./components/Badge";
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  type CardProps,
} from "./components/Card";
export { Input, type InputProps } from "./components/Input";
export { SearchInput, type SearchInputProps } from "./components/SearchInput";
export { Checkbox, type CheckboxProps } from "./components/Checkbox";
export { Radio, type RadioProps } from "./components/Radio";
export {
  Avatar,
  AvatarGroup,
  type AvatarProps,
  type AvatarGroupProps,
  type AvatarSize,
} from "./components/Avatar";
export { Modal, type ModalProps } from "./components/Modal";
export {
  RoleQuota,
  type RoleQuotaProps,
  type RoleQuotaItem,
} from "./components/RoleQuota";
export {
  CompatibilityTag,
  type CompatibilityTagProps,
} from "./components/CompatibilityTag";
export {
  CommandBar,
  type CommandBarProps,
  type CommandItem,
} from "./components/CommandBar";
