import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * primitives — the official React primitives for Signature Style (0.5.0).
 *
 * Pruning Protocol compliance: every component here renders the flattest
 * possible DOM (no decorative wrappers), consumes CSS variables dynamically
 * (`var(--token)` — never hardcoded hexes), and leans on the cascade classes
 * already shipped in css/cascade.css.
 */
import { icons } from "lucide-react";
export function Icon({ name, strokeWidth = 2, ...rest }) {
    const Cmp = icons[name];
    return _jsx(Cmp, { strokeWidth: strokeWidth, ...rest });
}
export function EmptyState({ icon, title, message }) {
    return (_jsxs("div", { className: "empty-state", children: [_jsx(Icon, { name: icon, "aria-hidden": true }), title !== undefined && (_jsx("strong", { style: { color: "var(--text-main)", fontWeight: 600 }, children: title })), _jsx("p", { style: { margin: 0 }, children: message })] }));
}
export function PartyBadge({ colorToken, label }) {
    if (!colorToken.startsWith("--sig-")) {
        console.warn(`[signature-style] dropped "${colorToken}" — PartyBadge accepts --sig-* tokens only (Rule of Engagement: structural chrome keeps Flamingo/Teal).`);
        return null;
    }
    return (_jsx("span", { style: {
            background: `color-mix(in srgb, var(${colorToken}) 18%, transparent)`,
            border: `1px solid color-mix(in srgb, var(${colorToken}) 45%, transparent)`,
            color: "var(--text-main)",
            fontWeight: 500,
            padding: "var(--space-tight) var(--space-standard)",
            borderRadius: "var(--radius-ui)",
        }, children: label }));
}
/**
 * `<Button>` — the ONE button (2.5.0).
 *
 * Renders ONE `<button class="sig-btn sig-btn--{variant} [-sm/-lg]">` —
 * the flat, token-driven action the composition layer has been
 * hand-rolling since 1.6.0, now official. Press physics: `:active
 * scale(0.97)` (the doctrine press), focus-visible: the Flamingo ring,
 * loading: the css spinner (2px currentColor ring with a transparent
 * top arc, `sig-spin` 0.8s linear infinite) REPLACING the icons —
 * never spinning beside them. Icons are strict `IconName`s (the same
 * live-map contract as `<Icon>`), constrained to 1rem via
 * css/primitives.css so they sit inside the text line.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" leftIcon="Check" loading={submitting}>
 *   Check In
 * </Button>
 * ```
 */
export function Button({ variant = "primary", size = "md", leftIcon, rightIcon, loading = false, className, disabled, children, ...rest }) {
    const sizeClass = size === "sm" ? " sig-btn--sm" : size === "lg" ? " sig-btn--lg" : "";
    return (_jsx("button", { className: `sig-btn sig-btn--${variant}${sizeClass}${className !== undefined ? ` ${className}` : ""}`, "aria-busy": loading || undefined, disabled: loading || disabled, ...rest, children: loading ? (_jsx("span", { className: "sig-btn__spinner", "aria-hidden": "true" })) : (_jsxs(_Fragment, { children: [leftIcon !== undefined && (_jsx(Icon, { name: leftIcon, className: "sig-btn__icon", "aria-hidden": true })), children, rightIcon !== undefined && (_jsx(Icon, { name: rightIcon, className: "sig-btn__icon", "aria-hidden": true }))] })) }));
}
