/**
 * ThemeProvider — the runtime half of Signature Style.
 *
 * Hardening (approved design addendum):
 * - VULN-2 — injects the canonical `@layer` order declaration as the FIRST
 *   style tag in <head>, so host CSS can never win a layer-order race, and
 *   warns when the browser cannot represent layers at all.
 * - VULN-3 — SSR-safe isomorphic layout effect; style tags keyed by useId
 *   with dedup; strict cleanup that only ever removes nodes this instance
 *   created; memoized theme serialization; a strict token whitelist (unknown
 *   keys are warned and dropped, injection-capable values are rejected).
 */
import { type ReactNode } from "react";
/** The complete whitelist of injectable tokens (VULN-3). */
declare const TOKEN_KEYS: readonly ["--bg-base", "--bg-surface", "--color-cake-primary", "--color-cake-secondary", "--text-main", "--text-muted", "--radius-ui", "--transition-standard"];
/** A token name known to Signature Style. */
export type KnownToken = (typeof TOKEN_KEYS)[number];
/** Overrides accepted by <ThemeProvider>; keys outside KnownToken are dropped. */
export type ThemeOverrides = Partial<Record<KnownToken, string>>;
export interface ThemeProviderProps {
    /** Token overrides. Values must be plain CSS values (no `{`, `}`, `;`, `\`). */
    theme?: ThemeOverrides;
    children?: ReactNode;
}
/**
 * Renders children and injects your tokens into `@layer tokens`.
 *
 * @example
 * ```tsx
 * <ThemeProvider theme={{ "--color-cake-primary": "#FFD1DC" }}>
 *   <App />
 * </ThemeProvider>
 * ```
 */
export declare function ThemeProvider({ theme, children }: ThemeProviderProps): ReactNode;
export default ThemeProvider;
