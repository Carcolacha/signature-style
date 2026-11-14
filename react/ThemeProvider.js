import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
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
import { useEffect, useId, useLayoutEffect, useMemo, } from "react";
/**
 * The complete whitelist of injectable tokens (VULN-3) — every custom
 * property in css/tokens.css: the core 6, the keeper tokens, the shared
 * theme-independent tokens, the z-index scale (Pillar 3, including the
 * 1.2.0 navbar notch --z-nav and the 1.4.0 zenith rung --z-toast) — and
 * since 0.4.0 — the ten --party-*
 * content tokens (Rule of Engagement: party tokens are for CONTENT only —
 * badges, tags, avatars, calendar, data-viz; structural UI keeps
 * Flamingo/Teal).
 */
const TOKEN_KEYS = [
    /* core 6 — catppuccin structure + harmonized accents */
    "--bg-base",
    "--bg-surface",
    "--color-cake-primary",
    "--color-cake-secondary",
    "--text-main",
    "--text-muted",
    /* keepers — legacy colors with semantic jobs */
    "--bg-inset",
    "--text-bright",
    "--color-success",
    "--text-muted-soft",
    /* shared, theme-independent tokens */
    "--color-on-cake",
    "--font-sans",
    "--radius-ui",
    "--transition-standard",
    "--transition-transform",
    "--space-tight",
    "--space-standard",
    "--space-section",
    /* z-index scale — structural pillars (0.3.0); 1.4.0 adds the zenith rung */
    "--z-sticky",
    "--z-nav",
    "--z-overlay",
    "--z-modal",
    "--z-toast",
    /* party palette — CONTENT-only tokens (0.4.0); never for structural chrome.
       2.5.0 adds --party-yellow: the strength meter's Fair stage (feedback
       meter stages join the content reservation, the peach-error precedent). */
    "--party-pink-bright",
    "--party-pink-soft",
    "--party-pink-alt",
    "--party-mauve-bright",
    "--party-mauve-soft",
    "--party-lavender",
    "--party-sky",
    "--party-blue",
    "--party-peach",
    "--party-green",
    "--party-yellow",
];
/** Canonical layer order — must be the first style in the document (VULN-2). */
const LAYER_ORDER = "@layer tokens, base, cascade, overrides;";
/** Layout effect where a DOM exists, plain effect under SSR. */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
/** True when a value could escape its declaration (CSS injection). */
function isUnsafeValue(value) {
    return /[{};\\]/.test(value);
}
/** Filter + serialize overrides into a `@layer tokens` block. */
function serializeTheme(theme) {
    const declarations = Object.entries(theme)
        .filter(([key, value]) => {
        if (!TOKEN_KEYS.includes(key)) {
            console.warn(`[signature-style] dropped unknown token "${String(key)}" — not in the whitelist.`);
            return false;
        }
        if (typeof value !== "string" || isUnsafeValue(value)) {
            console.warn(`[signature-style] dropped unsafe value for "${String(key)}" — CSS injection guard.`);
            return false;
        }
        return true;
    })
        .map(([key, value]) => `${key}:${value};`)
        .join("");
    return `@layer tokens{:root{${declarations}}}`;
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
export function ThemeProvider({ theme = {}, children }) {
    const rawId = useId();
    // useId emits ':' (e.g. ":r0:"), which is illegal in CSS selectors.
    const styleId = `signature-style-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
    const css = useMemo(() => serializeTheme(theme), [theme]);
    // VULN-2: claim layer order before any other runtime style can.
    useIsomorphicLayoutEffect(() => {
        if (typeof document === "undefined")
            return;
        if (!("CSSLayerBlockRule" in window)) {
            console.warn("[signature-style] browser lacks CSS @layer support; cascade precedence may degrade.");
        }
        const layerId = `${styleId}-layers`;
        const existing = document.getElementById(layerId);
        const owns = existing === null;
        const el = existing ?? document.createElement("style");
        if (owns) {
            el.id = layerId;
            document.head.insertBefore(el, document.head.firstChild);
        }
        el.textContent = LAYER_ORDER;
        return () => {
            if (owns && el.parentNode !== null)
                el.parentNode.removeChild(el);
        };
    }, [styleId]);
    // VULN-3: deduped, memoized, self-owned token tag.
    useIsomorphicLayoutEffect(() => {
        if (typeof document === "undefined")
            return;
        const existing = document.getElementById(styleId);
        const owns = existing === null;
        const el = existing ?? document.createElement("style");
        if (owns) {
            el.id = styleId;
            document.head.appendChild(el);
        }
        el.textContent = css;
        return () => {
            if (owns && el.parentNode !== null)
                el.parentNode.removeChild(el);
        };
    }, [styleId, css]);
    return _jsx(_Fragment, { children: children });
}
export default ThemeProvider;
