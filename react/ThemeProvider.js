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
/** The complete whitelist of injectable tokens (VULN-3). */
const TOKEN_KEYS = [
    "--bg-base",
    "--bg-surface",
    "--color-cake-primary",
    "--color-cake-secondary",
    "--text-main",
    "--text-muted",
    "--radius-ui",
    "--transition-standard",
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
