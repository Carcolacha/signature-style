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
/**
 * The complete whitelist of injectable tokens (VULN-3) — every custom
 * property in css/tokens.css: the core 6, the keeper tokens, the shared
 * theme-independent tokens, the z-index scale (Pillar 3), and — since 0.4.0
 * — the ten --party-* content tokens (Rule of Engagement: party tokens are
 * for CONTENT only — badges, tags, avatars, calendar, data-viz; structural
 * UI keeps Flamingo/Teal).
 */
declare const TOKEN_KEYS: readonly ["--bg-base", "--bg-surface", "--color-cake-primary", "--color-cake-secondary", "--text-main", "--text-muted", "--bg-inset", "--text-bright", "--color-success", "--text-muted-soft", "--color-on-cake", "--font-sans", "--radius-ui", "--transition-standard", "--transition-transform", "--space-tight", "--space-standard", "--space-section", "--z-sticky", "--z-overlay", "--z-modal", "--party-pink-bright", "--party-pink-soft", "--party-pink-alt", "--party-mauve-bright", "--party-mauve-soft", "--party-lavender", "--party-sky", "--party-blue", "--party-peach", "--party-green"];
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
