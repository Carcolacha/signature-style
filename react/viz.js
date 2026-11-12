import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function ProgressBar({ value, colorToken, label }) {
    if (!colorToken.startsWith("--party-")) {
        console.warn(`[signature-style] dropped "${colorToken}" — ProgressBar accepts --party-* tokens only (Rule of Engagement: structural chrome keeps Flamingo/Teal).`);
        return null;
    }
    const clamped = Math.min(100, Math.max(0, value));
    return (_jsx("div", { className: "ptp-progress", role: "progressbar", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": clamped, "aria-label": label, children: _jsx("div", { className: "ptp-progress__fill", style: { width: `${clamped}%`, background: `var(${colorToken})` } }) }));
}
export function StatRing({ value, colorToken, size = 64, strokeWidth = 8, label, }) {
    if (!colorToken.startsWith("--party-")) {
        console.warn(`[signature-style] dropped "${colorToken}" — StatRing accepts --party-* tokens only (Rule of Engagement: structural chrome keeps Flamingo/Teal).`);
        return null;
    }
    const clamped = Math.min(100, Math.max(0, value));
    const radius = 44;
    const circumference = 2 * Math.PI * radius;
    // px → viewBox units: identical visual weight at every size.
    const strokeUnits = (strokeWidth / size) * 100;
    return (_jsxs("svg", { role: "progressbar", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": clamped, "aria-label": label, width: size, height: size, viewBox: "0 0 100 100", children: [_jsx("circle", { cx: "50", cy: "50", r: radius, fill: "none", stroke: "var(--bg-surface)", strokeWidth: strokeUnits }), _jsx("circle", { cx: "50", cy: "50", r: radius, fill: "none", stroke: `var(${colorToken})`, strokeWidth: strokeUnits, strokeLinecap: "round", strokeDasharray: circumference, strokeDashoffset: circumference * (1 - clamped / 100), transform: "rotate(-90 50 50)" })] }));
}
