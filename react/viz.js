import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
export function ProgressBar({ value, colorToken, label, limitText }) {
    if (!colorToken.startsWith("--party-")) {
        console.warn(`[signature-style] dropped "${colorToken}" — ProgressBar accepts --party-* tokens only (Rule of Engagement: structural chrome keeps Flamingo/Teal).`);
        return null;
    }
    const clamped = Math.min(100, Math.max(0, value));
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "ptp-progress", role: "progressbar", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": clamped, "aria-label": label, children: _jsx("div", { className: "ptp-progress__fill", style: { width: `${clamped}%`, background: `var(${colorToken})` } }) }), limitText !== undefined && (_jsx("div", { className: "ptp-progress__caption", children: limitText }))] }));
}
export function StatRing({ value, colorToken, size = 64, strokeWidth = 8, showValue = true, label, }) {
    if (!colorToken.startsWith("--party-")) {
        console.warn(`[signature-style] dropped "${colorToken}" — StatRing accepts --party-* tokens only (Rule of Engagement: structural chrome keeps Flamingo/Teal).`);
        return null;
    }
    const clamped = Math.min(100, Math.max(0, value));
    const radius = 44;
    const circumference = 2 * Math.PI * radius;
    // px → viewBox units: identical visual weight at every size.
    const strokeUnits = (strokeWidth / size) * 100;
    return (_jsxs("svg", { role: "progressbar", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": clamped, "aria-label": label, width: size, height: size, viewBox: "0 0 100 100", children: [_jsx("circle", { cx: "50", cy: "50", r: radius, fill: "none", stroke: "var(--bg-inset)", strokeWidth: strokeUnits }), _jsx("circle", { cx: "50", cy: "50", r: radius, fill: "none", stroke: `var(${colorToken})`, strokeWidth: strokeUnits, strokeLinecap: "round", strokeDasharray: circumference, strokeDashoffset: circumference * (1 - clamped / 100), transform: "rotate(-90 50 50)" }), _jsx("circle", { cx: "50", cy: "50", r: 47.5, fill: "none", stroke: "color-mix(in srgb, var(--text-muted) 20%, transparent)", strokeWidth: 1.5 }), showValue && (_jsxs("text", { x: "50", y: "50", textAnchor: "middle", dominantBaseline: "central", fill: "var(--text-main)", style: {
                    fontVariantNumeric: "tabular-nums",
                    fontWeight: 600,
                    fontSize: 24,
                }, children: [clamped, "%"] }))] }));
}
