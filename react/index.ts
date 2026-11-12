/**
 * React entry point for @edwyn/signature-style.
 *
 * ```ts
 * import { ThemeProvider } from "@edwyn/signature-style/react";
 * ```
 */

export {
  default,
  ThemeProvider,
  type KnownToken,
  type ThemeProviderProps,
  type ThemeOverrides,
} from "./ThemeProvider.js";
export {
  Icon,
  type IconProps,
  type IconName,
  EmptyState,
  type EmptyStateProps,
  PartyBadge,
  type PartyBadgeProps,
  type PartyTokenName,
} from "./primitives.js";
