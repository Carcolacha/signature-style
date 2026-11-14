/**
 * viz — telemetry primitives (1.3.0 "Telemetry Module", 2.2.0
 * "Telemetry Limits & Official Surface Primitives", 2.4.0 grows
 * Sparkline / StatCard).
 *
 * Four lightweight SVG/HTML charting primitives with ZERO external
 * charting dependencies — the data-ink doctrine in component form:
 * no grid lines, no drop shadows, no 3D. Tracks are structural chrome
 * (`var(--bg-inset)` since 2.2.0 — owner-authorized retarget: the old
 * `var(--bg-surface)` track was invisible on var(--bg-surface) cards);
 * data fills are STRICTLY `--party-*` content tokens (Rule of
 * Engagement: party colors are the content/data colors). The ring
 * needs no CSS at all — pure SVG attributes; the bar's and the stat
 * card's classes live in css/viz.css. `<Sparkline>` is likewise pure
 * SVG — EXACTLY two elements (area polygon + line polyline) over a
 * normalized viewBox, geometry computed in a pure helper.
 *
 * Rule of Engagement, enforced per component: `colorToken` is
 * typed as `PartyTokenName` (an `Extract` on `KnownToken`), so passing
 * a structural token like `--color-cake-primary` is a compile error —
 * and a runtime guard (`startsWith("--party-")`) warns and renders
 * null for JS consumers, same warn-and-drop philosophy as PartyBadge.
 *
 * 2.2.0 TELEMETRY LIMITS (owner-authorized): ProgressBar grew the
 * optional `limitText` caption (rendered as a THIRD element AFTER the
 * track, inside a fragment — never a wrapper), and StatRing grew the
 * SVG-native boundary hairline (a third circle) plus the optional
 * centered ring readout (`showValue`, default true) — the 2.1.0
 * "consumers place their own numbers" pruning is relaxed BY THE OWNER
 * for the readout only; the track/fill geometry and the ARIA contract
 * are untouched.
 *
 * 2.7.0 ANALYTICAL CHARTS — the module GROWS (ProgressBar/StatRing
 * logic untouched above): <BarChart> (capacity tracks + party value
 * bars + dashed 25/50/75% reference lines + hover readouts, vertical
 * or horizontal) and <AreaChart> (a useId-gradient area under a
 * Catmull-Rom-smoothed line + hoverable point readouts). Both stay
 * PURE SVG over a fixed 320×200 viewBox — zero charting packages, the
 * geometry computed in pure helpers (`smoothPath` is exported and
 * gate-testable). Hover reveals are CLASS-driven (css/viz.css answers
 * :hover with opacity, never inline styles).
 *
 * Pruning Protocol: ProgressBar renders EXACTLY two elements plus the
 * optional caption (no wrappers around the track); StatRing renders
 * ONE svg with EXACTLY three circles (track + progress + boundary
 * hairline) and the optional centered value text; Sparkline renders
 * ONE svg with EXACTLY two elements (polygon + polyline); StatCard is
 * label + value + optional delta + optional sparkline — flat, no
 * shadow (the e1 doctrine).
 */
import type { PartyTokenName } from "./primitives.js";
/**
 * `<ProgressBar>` — the party-colored budget bar.
 *
 * ONE `div.sig-progress` (role="progressbar", full aria value
 * contract) containing ONE `div.sig-progress__fill` whose width is
 * the clamped value. The fill animates `width 0.3s ease-out`
 * (owner-mandated physics; `prefers-reduced-motion` disables it).
 * The track is `var(--bg-inset)` with the 20% hairline boundary
 * (2.2.0: visible 100% boundary on ANY card); the fill is
 * `var(colorToken)` — a `--party-*` token or the component refuses
 * to render.
 *
 * `limitText` (2.2.0): when present, the value's LIMIT is rendered as
 * a THIRD element — `div.sig-progress__caption`, a mono tabular-nums
 * caption AFTER the track inside a fragment (no wrapper around the
 * track itself; the ARIA contract is unchanged — the caption is
 * sibling metadata, not part of the progressbar). The budget use
 * case: "$1,325 / $2,000" under the spent bar, digits pinned to the
 * same grid by font-variant-numeric.
 *
 * The PlanThenParty use case: budget remaining (72 of 100 on
 * `--party-green`), savings progress, RSVP counts — any single
 * scalar that reads as a filled portion of a whole.
 *
 * @example
 * ```tsx
 * <ProgressBar value={72} colorToken="--party-green" label="Budget remaining" limitText="$720 / $1,000" />
 * ```
 */
export interface ProgressBarProps {
    /** The filled percentage — clamped to 0–100 before rendering. */
    value: number;
    /** A `--party-*` content token — the ONLY tokens allowed here. */
    colorToken: PartyTokenName;
    /** The accessible name for the progressbar (e.g. "Budget remaining"). */
    label?: string;
    /** 2.2.0: limit caption rendered after the track (e.g. "$1,325 / $2,000"). */
    limitText?: string;
}
export declare function ProgressBar({ value, colorToken, label, limitText }: ProgressBarProps): import("react").JSX.Element | null;
/**
 * `<StatRing>` — the party-colored RSVP ratio ring.
 *
 * ONE `<svg role="progressbar">` (viewBox 0 0 100 100, square at
 * `size`) with EXACTLY three circles: the track in `var(--bg-inset)`
 * (2.2.0 retarget — visible on any card) and the progress arc in
 * `var(colorToken)`, both r 44, revealed by
 * `strokeDasharray = C = 2π·44` / `strokeDashoffset = C × (1 − v/100)`
 * and rotated −90° so 0% starts at 12 o'clock; plus the 2.2.0
 * BOUNDARY HAIRLINE — a third circle (r 47.5, fixed 1.5 viewBox-unit
 * stroke of `color-mix(in srgb, var(--text-muted) 20%, transparent)`,
 * fill none) drawn OVER the ink as the SVG-native border, so the
 * ring's full 100% boundary reads on any surface. The stroke width is
 * supplied in px and converted to viewBox units
 * (`strokeWidth / size × 100`), so the visual weight is exact at any
 * `size` — an 8px stroke at size 64 is the same ink as at size 96.
 * `strokeWidth` is a `4 | 8` union: only grid-perfect weights.
 *
 * Round linecaps (a deliberate call): they match the `--radius-ui`
 * rounding everywhere else in the system. Known ±(stroke/2) tolerance
 * at the extremes — the round cap pokes past the exact dash ends by
 * half a stroke — accepted in exchange for the rounded terminus; at
 * 0% the cap renders as the arc's origin point at 12 o'clock.
 *
 * `showValue` (2.2.0, default true): the centered ring readout — a
 * `<text>` at the exact center (viewBox units scale with `size`),
 * `var(--text-main)`, tabular-nums, weight 600. Renders the clamped
 * value (the interface contract clamps `value` before rendering), so
 * the text, the geometry and `aria-valuenow` can never disagree.
 * Pass `showValue={false}` to restore the bare 2.1.0 dial.
 *
 * The PlanThenParty use case: the RSVP ratio (85% of invitees in on
 * `--party-sky`), attendance, completion — any single ratio that
 * reads as a dial.
 *
 * @example
 * ```tsx
 * <StatRing value={85} colorToken="--party-sky" label="RSVP ratio" />
 * ```
 */
export interface StatRingProps {
    /** The filled percentage — clamped to 0–100 before rendering. */
    value: number;
    /** A `--party-*` content token — the ONLY tokens allowed here. */
    colorToken: PartyTokenName;
    /** Outer diameter in px. Default 120 — the 3.0.0 zoom default. */
    size?: number;
    /** Track/fill weight in px — grid-perfect: 4 (half unit) or 8 (one unit). Default 8. */
    strokeWidth?: 4 | 8;
    /** 2.2.0: centered ring readout inside the SVG. Default true. */
    showValue?: boolean;
    /** The accessible name for the progressbar (e.g. "RSVP ratio"). */
    label?: string;
    /**
     * 3.0.0 — the denominator for the expandable detail strip (e.g. 200).
     * When present, the ring renders zoomable: hover/press scale(1.07),
     * and a click toggles the `.sig-ring__detail` strip below the ring —
     * "{value}% · {numerator}/{denominator} {unit}" with the numerator
     * derived from the value (85% of 200 → "170 / 200 Guests"). The core
     * dash geometry + the ARIA contract are untouched.
     */
    total?: number;
    /** 3.0.0 — the detail strip's unit label ("Guests"). Requires `total`. */
    unit?: string;
}
export declare function StatRing({ value, colorToken, size, strokeWidth, showValue, label, total, unit, }: StatRingProps): import("react").JSX.Element | null;
export interface SparklineProps {
    /** The series — ≥2 points (fewer warns and renders null: no trend, no ink). */
    data: number[];
    /** A `--party-*` content token — the ONLY tokens allowed here. Default --party-sky. */
    colorToken?: PartyTokenName;
    /** Width in px (also the viewBox width). Default 120. */
    width?: number;
    /** Height in px (also the viewBox height). Default 36. */
    height?: number;
    /** The accessible name (role="img"); defaults to "trend". */
    label?: string;
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
export declare function Sparkline({ data, colorToken, width, height, label, }: SparklineProps): import("react").JSX.Element | null;
export interface StatCardProps {
    /** The muted uppercase caption (e.g. "Total Budget"). */
    label: string;
    /** The headline figure (e.g. "$2,000") — rendered tabular-nums. */
    value: string;
    /** The optional change caption (e.g. "+$440"). */
    delta?: string;
    /** The delta's direction — up → --party-green, down → --party-peach. */
    deltaDirection?: "up" | "down";
    /** The optional inline trend — renders a <Sparkline> labeled "<label> trend". */
    sparklineData?: number[];
    /** A `--party-*` content token for the sparkline (passed through). */
    colorToken?: PartyTokenName;
}
/**
 * `<StatCard>` — the KPI card (2.4.0).
 *
 * `<div class="sig-stat-card">` → the label span (muted, uppercase,
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
export declare function StatCard({ label, value, delta, deltaDirection, sparklineData, colorToken, }: StatCardProps): import("react").JSX.Element;
/** One BarChart datum. `max` extends that bar's capacity track past its value. */
export interface BarDatum {
    /** The axis label (mono, muted — rendered under/beside the bar). */
    label: string;
    /** The bar's value. */
    value: number;
    /** The capacity ceiling for THIS bar's track; defaults to the chart scale. */
    max?: number;
    /** A `--party-*` content token — this bar's ink. Default --party-sky. */
    colorToken?: PartyTokenName;
}
export interface BarChartProps {
    /** The data — an empty array warns and renders null (no data, no ink). */
    data: BarDatum[];
    /** The bars' direction. Default "vertical". */
    orientation?: "vertical" | "horizontal";
    /** The accessible name (role="img"); defaults to "Bar chart of N categories". */
    label?: string;
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
 *     { label: "Venue", value: 800, max: 1000, colorToken: "--party-mauve-soft" },
 *     { label: "Catering", value: 620, max: 900, colorToken: "--party-peach" },
 *   ]}
 *   label="Spending by category"
 * />
 * ```
 */
export declare const BarChart: import("react").NamedExoticComponent<BarChartProps>;
/** One AreaChart sample. The label renders under the point's x position. */
export interface AreaPoint {
    /** The axis label (mono, muted — rendered under the point). */
    label: string;
    /** The sample's value. */
    value: number;
}
export interface AreaChartProps {
    /** The series — ≥2 points (fewer warns and renders null: no trend, no ink). */
    points: AreaPoint[];
    /** A `--party-*` content token. Default --party-sky. */
    colorToken?: PartyTokenName;
    /** The svg's rendered height in px. Default 200. */
    height?: number;
    /** The accessible name (role="img"); defaults to "Area chart of N points". */
    label?: string;
}
/**
 * The PURE smoothing helper — Catmull-Rom through every point,
 * converted to cubic-Bezier segments (control points at ±1/6 of the
 * neighbors' span). Data in, `d` string out; gate-testable.
 */
export declare function smoothPath(coords: ReadonlyArray<{
    x: number;
    y: number;
}>): string;
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
 *   colorToken="--party-sky"
 *   label="RSVP momentum"
 * />
 * ```
 */
export declare const AreaChart: import("react").NamedExoticComponent<AreaChartProps>;
