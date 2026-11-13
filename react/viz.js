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
/**
 * The PURE geometry helper — data in, viewBox points out. No DOM, no
 * side effects, trivially testable. Normalizes the series into
 * `width × height` with a 2-unit vertical pad so the 2px stroke never
 * clips at the extremes; a FLAT series (max === min) rides the
 * vertical midline. Points are "x,y" strings joined by spaces —
 * polyline/polygon points syntax, nothing else.
 */
function sparkPoints(data, width, height) {
    const pad = 2;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    const usable = height - pad * 2;
    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - pad - (range === 0 ? 0.5 : (value - min) / range) * usable;
        return `${x},${y}`;
    });
    const line = points.join(" ");
    // Close the area to the bottom edge — the fill under the line.
    const area = `${line} ${width},${height} 0,${height}`;
    return { line, area };
}
/**
 * `<Sparkline>` — the inline trend (2.4.0).
 *
 * ONE `<svg role="img" aria-label>` with EXACTLY TWO elements: the
 * area `<polygon>` (`color-mix(in srgb, var(colorToken) 15%,
 * transparent)` — the line's ghost) and the `<polyline>` line itself
 * (`var(colorToken)`, 2px, round cap/join). The data normalizes into
 * the viewBox (0 0 w h) via the pure `sparkPoints` helper;
 * `preserveAspectRatio="none"` lets the svg stretch to any box while
 * the geometry stays exact. Guards: a series shorter than 2 points has
 * no trend to draw (warn + null, the PartyBadge philosophy); a
 * structural `colorToken` is refused (Rule of Engagement). No CSS at
 * all — pure SVG attributes, like StatRing.
 *
 * @example
 * ```tsx
 * <Sparkline data={[1200, 1450, 1380, 1600, 1780, 2000]} colorToken="--party-green" label="Budget trend" />
 * ```
 */
export function Sparkline({ data, colorToken = "--party-sky", width = 120, height = 36, label, }) {
    if (data.length < 2) {
        console.warn(`[signature-style] dropped sparkline — data needs ≥2 points (got ${data.length}); no trend, no ink.`);
        return null;
    }
    if (!colorToken.startsWith("--party-")) {
        console.warn(`[signature-style] dropped "${colorToken}" — Sparkline accepts --party-* tokens only (Rule of Engagement: structural chrome keeps Flamingo/Teal).`);
        return null;
    }
    const { line, area } = sparkPoints(data, width, height);
    return (_jsxs("svg", { role: "img", "aria-label": label ?? "trend", viewBox: `0 0 ${width} ${height}`, preserveAspectRatio: "none", width: width, height: height, children: [_jsx("polygon", { points: area, fill: `color-mix(in srgb, var(${colorToken}) 15%, transparent)` }), _jsx("polyline", { points: line, fill: "none", stroke: `var(${colorToken})`, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" })] }));
}
/**
 * `<StatCard>` — the KPI card (2.4.0).
 *
 * `<div class="ptp-stat-card">` → the label span (muted, uppercase,
 * 0.1em tracking) → the value span (1.5rem, weight 600, tabular-nums)
 * → optional delta span (`--up` → var(--party-green), `--down` →
 * var(--party-peach) — content outcomes, party tokens) → optional
 * `<Sparkline>` (labeled "<label> trend"). FLAT by the e1 doctrine:
 * the card separates with the 20% hairline, NO shadow (css/viz.css).
 * The sparkline's own token guard applies — a structural token drops
 * just the trend, the figures stay.
 *
 * @example
 * ```tsx
 * <StatCard
 *   label="Total Budget"
 *   value="$2,000"
 *   delta="+$440"
 *   deltaDirection="up"
 *   sparklineData={[1200, 1450, 1380, 1600, 1780, 2000]}
 *   colorToken="--party-green"
 * />
 * ```
 */
export function StatCard({ label, value, delta, deltaDirection, sparklineData, colorToken, }) {
    const deltaClass = deltaDirection !== undefined
        ? ` ptp-stat-card__delta--${deltaDirection}`
        : "";
    return (_jsxs("div", { className: "ptp-stat-card", children: [_jsx("span", { className: "ptp-stat-card__label", children: label }), _jsx("span", { className: "ptp-stat-card__value", children: value }), delta !== undefined && (_jsx("span", { className: `ptp-stat-card__delta${deltaClass}`, children: delta })), sparklineData !== undefined && (_jsx(Sparkline, { data: sparklineData, colorToken: colorToken, label: `${label} trend` }))] }));
}
