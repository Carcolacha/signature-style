import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { memo, useId, useState } from "react";
export function ProgressBar({ value, colorToken, label, limitText }) {
    if (!colorToken.startsWith("--sig-")) {
        console.warn(`[signature-style] dropped "${colorToken}" — ProgressBar accepts --sig-* tokens only (Rule of Engagement: structural chrome keeps Flamingo/Teal).`);
        return null;
    }
    const clamped = Math.min(100, Math.max(0, value));
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "sig-progress", role: "progressbar", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": clamped, "aria-label": label, children: _jsx("div", { className: "sig-progress__fill", style: { width: `${clamped}%`, background: `var(${colorToken})` } }) }), limitText !== undefined && (_jsx("div", { className: "sig-progress__caption", children: limitText }))] }));
}
export function StatRing({ value, colorToken, size = 120, strokeWidth = 8, showValue = true, label, total, unit, }) {
    if (!colorToken.startsWith("--sig-")) {
        console.warn(`[signature-style] dropped "${colorToken}" — StatRing accepts --sig-* tokens only (Rule of Engagement: structural chrome keeps Flamingo/Teal).`);
        return null;
    }
    // 3.0.0 — the internal EXPAND state (the zoom): a click toggles
    // data-expanded on the wrapper (css/viz.css answers scale(1.07)) and
    // slides the detail strip open (the 0fr → 1fr grid trick).
    const [detail, setDetail] = useState(false);
    const clamped = Math.min(100, Math.max(0, value));
    const radius = 44;
    const circumference = 2 * Math.PI * radius;
    // px → viewBox units: identical visual weight at every size.
    const strokeUnits = (strokeWidth / size) * 100;
    const hasDetail = total !== undefined && total > 0;
    const numerator = hasDetail
        ? Math.round((clamped / 100) * total)
        : 0;
    const ring = (_jsxs("svg", { role: "progressbar", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": clamped, "aria-label": label, viewBox: "0 0 100 100", children: [_jsx("circle", { cx: "50", cy: "50", r: radius, fill: "none", stroke: "var(--bg-inset)", strokeWidth: strokeUnits }), _jsx("circle", { cx: "50", cy: "50", r: radius, fill: "none", stroke: `var(${colorToken})`, strokeWidth: strokeUnits, strokeLinecap: "round", strokeDasharray: circumference, strokeDashoffset: circumference * (1 - clamped / 100), transform: "rotate(-90 50 50)" }), _jsx("circle", { cx: "50", cy: "50", r: 47.5, fill: "none", stroke: "color-mix(in srgb, var(--text-muted) 20%, transparent)", strokeWidth: 1.5 }), showValue && (_jsxs("text", { x: "50", y: "50", textAnchor: "middle", dominantBaseline: "central", fill: "var(--text-main)", style: {
                    fontVariantNumeric: "tabular-nums",
                    fontWeight: 600,
                    fontSize: 24,
                }, children: [clamped, "%"] }))] }));
    if (!hasDetail) {
        // The bare dial (pre-3.0.0 consumers): svg direct, nothing new.
        return ring;
    }
    return (_jsxs("div", { className: "sig-ring", "data-expanded": detail || undefined, children: [_jsx("div", { className: "sig-ring__dial", style: { width: size, height: size }, onClick: () => setDetail((current) => !current), children: ring }), _jsx("div", { className: "sig-ring__detail", "data-open": detail || undefined, children: _jsxs("div", { className: "sig-ring__detail-inner", children: [clamped, "% \u00B7 ", numerator, " / ", total, " ", unit ?? ""] }) })] }));
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
 * no trend to draw (warn + null, the SigBadge philosophy); a
 * structural `colorToken` is refused (Rule of Engagement). No CSS at
 * all — pure SVG attributes, like StatRing.
 *
 * @example
 * ```tsx
 * <Sparkline data={[1200, 1450, 1380, 1600, 1780, 2000]} colorToken="--sig-green" label="Budget trend" />
 * ```
 */
export function Sparkline({ data, colorToken = "--sig-sky", width = 120, height = 36, label, }) {
    if (data.length < 2) {
        console.warn(`[signature-style] dropped sparkline — data needs ≥2 points (got ${data.length}); no trend, no ink.`);
        return null;
    }
    if (!colorToken.startsWith("--sig-")) {
        console.warn(`[signature-style] dropped "${colorToken}" — Sparkline accepts --sig-* tokens only (Rule of Engagement: structural chrome keeps Flamingo/Teal).`);
        return null;
    }
    const { line, area } = sparkPoints(data, width, height);
    return (_jsxs("svg", { role: "img", "aria-label": label ?? "trend", viewBox: `0 0 ${width} ${height}`, preserveAspectRatio: "none", width: width, height: height, children: [_jsx("polygon", { points: area, fill: `color-mix(in srgb, var(${colorToken}) 15%, transparent)` }), _jsx("polyline", { points: line, fill: "none", stroke: `var(${colorToken})`, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" })] }));
}
/**
 * `<StatCard>` — the KPI card (2.4.0).
 *
 * `<div class="sig-stat-card">` → the label span (muted, uppercase,
 * 0.1em tracking) → the value span (1.5rem, weight 600, tabular-nums)
 * → optional delta span (`--up` → var(--sig-green), `--down` →
 * var(--sig-peach) — content outcomes, party tokens) → optional
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
 *   colorToken="--sig-green"
 * />
 * ```
 */
export function StatCard({ label, value, delta, deltaDirection, sparklineData, colorToken, }) {
    const deltaClass = deltaDirection !== undefined
        ? ` sig-stat-card__delta--${deltaDirection}`
        : "";
    return (_jsxs("div", { className: "sig-stat-card", children: [_jsx("span", { className: "sig-stat-card__label", children: label }), _jsx("span", { className: "sig-stat-card__value", children: value }), delta !== undefined && (_jsx("span", { className: `sig-stat-card__delta${deltaClass}`, children: delta })), sparklineData !== undefined && (_jsx(Sparkline, { data: sparklineData, colorToken: colorToken, label: `${label} trend` }))] }));
}
/* The shared 320×200 chart box. Top pad leaves room for hover readouts;
   the baseline strip carries the mono axis labels. */
const CHART_WIDTH = 320;
const CHART_HEIGHT = 200;
const CHART_PAD_X = 8;
const BAR_PLOT_TOP = 20;
const BAR_BASELINE = 180;
const BAR_LABEL_Y = 194;
const HORIZONTAL_LABEL_X = 60;
const HORIZONTAL_PLOT_X = 68;
const HORIZONTAL_TOP = 12;
const HORIZONTAL_BOTTOM = 188;
/** The chart's shared scale: the largest value OR declared max (never 0). */
function barScaleMax(data) {
    const values = data.flatMap((datum) => [datum.value, datum.max ?? datum.value]);
    const max = Math.max(...values);
    return max > 0 ? max : 1;
}
/** The bar's party ink — warn-and-drop to structural Flamingo is NOT allowed
    here (bars are content), so a structural token REFUSES the whole datum. */
function barToken(datum) {
    const token = datum.colorToken ?? "--sig-sky";
    if (!token.startsWith("--sig-")) {
        console.warn(`[signature-style] dropped bar "${datum.label}" — colorToken accepts --sig-* tokens only (Rule of Engagement).`);
        return null;
    }
    return token;
}
/** One vertical bar group: track + bar + hover value + axis label. */
function verticalBar(datum, index, count, scaleMax) {
    const token = barToken(datum);
    if (token === null)
        return null;
    const plotHeight = BAR_BASELINE - BAR_PLOT_TOP;
    const band = (CHART_WIDTH - CHART_PAD_X * 2) / count;
    const center = CHART_PAD_X + band * (index + 0.5);
    const barWidth = band * 0.6;
    const trackMax = datum.max ?? scaleMax;
    const trackHeight = (trackMax / scaleMax) * plotHeight;
    const barHeight = (datum.value / scaleMax) * plotHeight;
    return (_jsxs("g", { className: "sig-bars__group", children: [_jsx("rect", { className: "sig-bars__track", x: center - barWidth / 2, y: BAR_BASELINE - trackHeight, width: barWidth, height: trackHeight, rx: 3 }), _jsx("rect", { className: "sig-bars__bar", x: center - barWidth / 2, y: BAR_BASELINE - barHeight, width: barWidth, height: barHeight, rx: 3, style: { fill: `var(${token})` } }), _jsx("text", { className: "sig-bars__value", x: center, y: BAR_BASELINE - barHeight - 6, textAnchor: "middle", children: datum.value }), _jsx("text", { className: "sig-bars__label", x: center, y: BAR_LABEL_Y, textAnchor: "middle", children: datum.label })] }, `${datum.label}-${index}`));
}
/** One horizontal bar group — labels left, capacity tracks to the right. */
function horizontalBar(datum, index, count, scaleMax) {
    const token = barToken(datum);
    if (token === null)
        return null;
    const plotWidth = CHART_WIDTH - CHART_PAD_X - HORIZONTAL_PLOT_X;
    const band = (HORIZONTAL_BOTTOM - HORIZONTAL_TOP) / count;
    const center = HORIZONTAL_TOP + band * (index + 0.5);
    const barHeight = band * 0.6;
    const trackMax = datum.max ?? scaleMax;
    const trackWidth = (trackMax / scaleMax) * plotWidth;
    const barWidth = (datum.value / scaleMax) * plotWidth;
    return (_jsxs("g", { className: "sig-bars__group", children: [_jsx("rect", { className: "sig-bars__track", x: HORIZONTAL_PLOT_X, y: center - barHeight / 2, width: trackWidth, height: barHeight, rx: 3 }), _jsx("rect", { className: "sig-bars__bar", x: HORIZONTAL_PLOT_X, y: center - barHeight / 2, width: barWidth, height: barHeight, rx: 3, style: { fill: `var(${token})` } }), _jsx("text", { className: "sig-bars__value", x: HORIZONTAL_PLOT_X + barWidth + 6, y: center + 4, children: datum.value }), _jsx("text", { className: "sig-bars__label", x: HORIZONTAL_LABEL_X, y: center + 4, textAnchor: "end", children: datum.label })] }, `${datum.label}-${index}`));
}
/**
 * `<BarChart>` — capacity tracks + party value bars + dashed reference
 * lines (2.7.0). Every datum renders ONE group: an inset rounded track
 * out to its capacity (`max ?? scale`), the party-colored value bar,
 * a hover-revealed tabular value readout, and a mono axis label. Three
 * `strokeDasharray "4 4"` reference lines mark 25/50/75% of the scale.
 * Hover emphasis is class-driven (css/viz.css): the bar brightens and
 * its value appears — nothing inline, no JS state.
 *
 * @example
 * ```tsx
 * <BarChart
 *   data={[
 *     { label: "Venue", value: 800, max: 1000, colorToken: "--sig-mauve-soft" },
 *     { label: "Catering", value: 620, max: 900, colorToken: "--sig-peach" },
 *   ]}
 *   label="Spending by category"
 * />
 * ```
 */
export const BarChart = memo(function BarChart({ data, orientation = "vertical", label }) {
    if (data.length === 0) {
        console.warn("[signature-style] dropped bar chart — data is empty; no data, no ink.");
        return null;
    }
    const scaleMax = barScaleMax(data);
    const plotHeight = BAR_BASELINE - BAR_PLOT_TOP;
    const plotWidth = CHART_WIDTH - CHART_PAD_X - HORIZONTAL_PLOT_X;
    const isVertical = orientation === "vertical";
    const refLines = [0.25, 0.5, 0.75].map((quota) => {
        const geometry = isVertical
            ? {
                x1: CHART_PAD_X,
                x2: CHART_WIDTH - CHART_PAD_X,
                y1: BAR_PLOT_TOP + plotHeight * (1 - quota),
                y2: BAR_PLOT_TOP + plotHeight * (1 - quota),
            }
            : {
                x1: HORIZONTAL_PLOT_X + plotWidth * quota,
                x2: HORIZONTAL_PLOT_X + plotWidth * quota,
                y1: HORIZONTAL_TOP,
                y2: HORIZONTAL_BOTTOM,
            };
        return (_jsx("line", { className: "sig-bars__refline", strokeDasharray: "4 4", strokeWidth: 1, ...geometry }, quota));
    });
    return (_jsxs("svg", { role: "img", "aria-label": label ?? `Bar chart of ${data.length} categories`, className: "sig-bars", viewBox: `0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`, children: [refLines, data.map((datum, index) => isVertical
                ? verticalBar(datum, index, data.length, scaleMax)
                : horizontalBar(datum, index, data.length, scaleMax))] }));
});
/* The area chart's plot box inside the shared 320×200 chart. */
const AREA_PAD_X = 16;
const AREA_PLOT_TOP = 24;
const AREA_PLOT_BOTTOM = 168;
const AREA_LABEL_Y = 192;
/**
 * The PURE smoothing helper — Catmull-Rom through every point,
 * converted to cubic-Bezier segments (control points at ±1/6 of the
 * neighbors' span). Data in, `d` string out; gate-testable.
 */
export function smoothPath(coords) {
    if (coords.length === 0)
        return "";
    if (coords.length === 1)
        return `M ${coords[0]?.x} ${coords[0]?.y}`;
    let d = `M ${coords[0]?.x} ${coords[0]?.y}`;
    for (let i = 0; i < coords.length - 1; i += 1) {
        const p0 = coords[i - 1] ?? coords[i];
        const p1 = coords[i];
        const p2 = coords[i + 1];
        const p3 = coords[i + 2] ?? p2;
        const c1x = p1.x + (p2.x - p0.x) / 6;
        const c1y = p1.y + (p2.y - p0.y) / 6;
        const c2x = p2.x - (p3.x - p1.x) / 6;
        const c2y = p2.y - (p3.y - p1.y) / 6;
        d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`;
    }
    return d;
}
/** The plot coordinates for the series — normalized into the area box. */
function areaCoords(points) {
    const values = points.map((point) => point.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const plotHeight = AREA_PLOT_BOTTOM - AREA_PLOT_TOP;
    const plotWidth = CHART_WIDTH - AREA_PAD_X * 2;
    return points.map((point, index) => ({
        x: AREA_PAD_X + (index / (points.length - 1)) * plotWidth,
        y: AREA_PLOT_TOP +
            (range === 0 ? 0.5 : (point.value - min) / range) * plotHeight,
    }));
}
/**
 * `<AreaChart>` — the gradient area under a smoothed line (2.7.0).
 * ONE svg (role="img"): a `useId`-keyed linearGradient (30% token mix
 * fading to transparent — no id collisions across instances), the
 * Catmull-Rom-smoothed line (`smoothPath`, 2px round), the area path
 * filled with the gradient at 50% opacity, and one hoverable group per
 * point — the circle enlarges and a tabular readout appears (both
 * class-driven, css/viz.css).
 *
 * @example
 * ```tsx
 * <AreaChart
 *   points={[
 *     { label: "W1", value: 12 }, { label: "W2", value: 18 },
 *     { label: "W3", value: 26 }, { label: "W4", value: 41 },
 *   ]}
 *   colorToken="--sig-sky"
 *   label="RSVP momentum"
 * />
 * ```
 */
export const AreaChart = memo(function AreaChart({ points, colorToken = "--sig-sky", height = 200, label, }) {
    if (points.length < 2) {
        console.warn(`[signature-style] dropped area chart — points needs ≥2 samples (got ${points.length}); no trend, no ink.`);
        return null;
    }
    if (!colorToken.startsWith("--sig-")) {
        console.warn(`[signature-style] dropped "${colorToken}" — AreaChart accepts --sig-* tokens only (Rule of Engagement: structural chrome keeps Flamingo/Teal).`);
        return null;
    }
    // React ids carry colons — strip them so url(#id) parses everywhere.
    const gradientId = `sig-area${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
    const coords = areaCoords(points);
    const line = smoothPath(coords);
    const first = coords[0];
    const last = coords[coords.length - 1];
    const area = `${line} L ${last.x} ${AREA_PLOT_BOTTOM} L ${first.x} ${AREA_PLOT_BOTTOM} Z`;
    return (_jsxs("svg", { role: "img", "aria-label": label ?? `Area chart of ${points.length} points`, className: "sig-area", viewBox: `0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`, style: { height }, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: gradientId, x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: `color-mix(in srgb, var(${colorToken}) 30%, transparent)` }), _jsx("stop", { offset: "100%", stopColor: "transparent" })] }) }), _jsx("path", { className: "sig-area__fill", d: area, fill: `url(#${gradientId})` }), _jsx("path", { className: "sig-area__line", d: line, style: { stroke: `var(${colorToken})` }, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }), points.map((point, index) => {
                const coord = coords[index];
                if (coord === undefined)
                    return null;
                return (_jsxs("g", { className: "sig-area__spot", children: [_jsx("circle", { className: "sig-area__point", cx: coord.x, cy: coord.y, r: 4, strokeWidth: 2, style: { stroke: `var(${colorToken})` } }), _jsx("text", { className: "sig-area__readout", x: coord.x, y: coord.y - 10, textAnchor: "middle", children: point.value }), _jsx("text", { className: "sig-area__xlabel", x: coord.x, y: AREA_LABEL_Y, textAnchor: "middle", children: point.label })] }, `${point.label}-${index}`));
            })] }));
});
