import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    if (!colorToken.startsWith("--party-")) {
        console.warn(`[signature-style] dropped "${colorToken}" — PartyBadge accepts --party-* tokens only (Rule of Engagement: structural chrome keeps Flamingo/Teal).`);
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
