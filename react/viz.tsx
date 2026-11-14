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
import { useId, useState } from "react";

/**
 * `<ProgressBar>` — the party-colored budget bar.
 *
 * ONE `div.ptp-progress` (role="progressbar", full aria value
 * contract) containing ONE `div.ptp-progress__fill` whose width is
 * the clamped value. The fill animates `width 0.3s ease-out`
 * (owner-mandated physics; `prefers-reduced-motion` disables it).
 * The track is `var(--bg-inset)` with the 20% hairline boundary
 * (2.2.0: visible 100% boundary on ANY card); the fill is
 * `var(colorToken)` — a `--party-*` token or the component refuses
 * to render.
 *
 * `limitText` (2.2.0): when present, the value's LIMIT is rendered as
 * a THIRD element — `div.ptp-progress__caption`, a mono tabular-nums
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

export function ProgressBar({ value, colorToken, label, limitText }: ProgressBarProps) {
  if (!colorToken.startsWith("--party-")) {
    console.warn(
      `[signature-style] dropped "${colorToken}" — ProgressBar accepts --party-* tokens only (Rule of Engagement: structural chrome keeps Flamingo/Teal).`,
    );
    return null;
  }
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <>
      <div
        className="ptp-progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        aria-label={label}
      >
        <div
          className="ptp-progress__fill"
          style={{ width: `${clamped}%`, background: `var(${colorToken})` }}
        />
      </div>
      {limitText !== undefined && (
        <div className="ptp-progress__caption">{limitText}</div>
      )}
    </>
  );
}

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
   * and a click toggles the `.ptp-ring__detail` strip below the ring —
   * "{value}% · {numerator}/{denominator} {unit}" with the numerator
   * derived from the value (85% of 200 → "170 / 200 Guests"). The core
   * dash geometry + the ARIA contract are untouched.
   */
  total?: number;
  /** 3.0.0 — the detail strip's unit label ("Guests"). Requires `total`. */
  unit?: string;
}

export function StatRing({
  value,
  colorToken,
  size = 120,
  strokeWidth = 8,
  showValue = true,
  label,
  total,
  unit,
}: StatRingProps) {
  if (!colorToken.startsWith("--party-")) {
    console.warn(
      `[signature-style] dropped "${colorToken}" — StatRing accepts --party-* tokens only (Rule of Engagement: structural chrome keeps Flamingo/Teal).`,
    );
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
    ? Math.round((clamped / 100) * (total as number))
    : 0;
  const ring = (
    <svg
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      aria-label={label}
      viewBox="0 0 100 100"
    >
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="var(--bg-inset)"
        strokeWidth={strokeUnits}
      />
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke={`var(${colorToken})`}
        strokeWidth={strokeUnits}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - clamped / 100)}
        transform="rotate(-90 50 50)"
      />
      {/* 2.2.0 boundary hairline — drawn last (over the ink) so the
          ring's full 100% boundary reads on any surface. */}
      <circle
        cx="50"
        cy="50"
        r={47.5}
        fill="none"
        stroke="color-mix(in srgb, var(--text-muted) 20%, transparent)"
        strokeWidth={1.5}
      />
      {showValue && (
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--text-main)"
          style={{
            fontVariantNumeric: "tabular-nums",
            fontWeight: 600,
            fontSize: 24,
          }}
        >
          {clamped}%
        </text>
      )}
    </svg>
  );
  if (!hasDetail) {
    // The bare dial (pre-3.0.0 consumers): svg direct, nothing new.
    return ring;
  }
  return (
    <div className="ptp-ring" data-expanded={detail || undefined}>
      <div
        className="ptp-ring__dial"
        style={{ width: size, height: size }}
        onClick={() => setDetail((current) => !current)}
      >
        {ring}
      </div>
      <div className="ptp-ring__detail" data-open={detail || undefined}>
        <div className="ptp-ring__detail-inner">
          {clamped}% · {numerator} / {total} {unit ?? ""}
        </div>
      </div>
    </div>
  );
}

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
 * The PURE geometry helper — data in, viewBox points out. No DOM, no
 * side effects, trivially testable. Normalizes the series into
 * `width × height` with a 2-unit vertical pad so the 2px stroke never
 * clips at the extremes; a FLAT series (max === min) rides the
 * vertical midline. Points are "x,y" strings joined by spaces —
 * polyline/polygon points syntax, nothing else.
 */
function sparkPoints(
  data: readonly number[],
  width: number,
  height: number,
): { line: string; area: string } {
  const pad = 2;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  const usable = height - pad * 2;
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y =
      height - pad - (range === 0 ? 0.5 : (value - min) / range) * usable;
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
export function Sparkline({
  data,
  colorToken = "--party-sky",
  width = 120,
  height = 36,
  label,
}: SparklineProps) {
  if (data.length < 2) {
    console.warn(
      `[signature-style] dropped sparkline — data needs ≥2 points (got ${data.length}); no trend, no ink.`,
    );
    return null;
  }
  if (!colorToken.startsWith("--party-")) {
    console.warn(
      `[signature-style] dropped "${colorToken}" — Sparkline accepts --party-* tokens only (Rule of Engagement: structural chrome keeps Flamingo/Teal).`,
    );
    return null;
  }
  const { line, area } = sparkPoints(data, width, height);
  return (
    <svg
      role="img"
      aria-label={label ?? "trend"}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      width={width}
      height={height}
    >
      <polygon
        points={area}
        fill={`color-mix(in srgb, var(${colorToken}) 15%, transparent)`}
      />
      <polyline
        points={line}
        fill="none"
        stroke={`var(${colorToken})`}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
export function StatCard({
  label,
  value,
  delta,
  deltaDirection,
  sparklineData,
  colorToken,
}: StatCardProps) {
  const deltaClass =
    deltaDirection !== undefined
      ? ` ptp-stat-card__delta--${deltaDirection}`
      : "";
  return (
    <div className="ptp-stat-card">
      <span className="ptp-stat-card__label">{label}</span>
      <span className="ptp-stat-card__value">{value}</span>
      {delta !== undefined && (
        <span className={`ptp-stat-card__delta${deltaClass}`}>{delta}</span>
      )}
      {sparklineData !== undefined && (
        <Sparkline
          data={sparklineData}
          colorToken={colorToken}
          label={`${label} trend`}
        />
      )}
    </div>
  );
}

/* ==========================================================================
   2.7.0 ANALYTICAL CHARTS — <BarChart> + <AreaChart>. Pure SVG over a
   fixed 320×200 viewBox: per-datum groups are the ONLY structure (no
   wrappers, no grid divs). Every fill/stroke is a var(--token) — the
   Rule of Engagement holds per datum; a structural token is refused
   with the warn-and-drop philosophy (that datum simply gets no ink).
   ========================================================================== */

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
function barScaleMax(data: readonly BarDatum[]): number {
  const values = data.flatMap((datum) => [datum.value, datum.max ?? datum.value]);
  const max = Math.max(...values);
  return max > 0 ? max : 1;
}

/** The bar's party ink — warn-and-drop to structural Flamingo is NOT allowed
    here (bars are content), so a structural token REFUSES the whole datum. */
function barToken(datum: BarDatum): string | null {
  const token = datum.colorToken ?? "--party-sky";
  if (!token.startsWith("--party-")) {
    console.warn(
      `[signature-style] dropped bar "${datum.label}" — colorToken accepts --party-* tokens only (Rule of Engagement).`,
    );
    return null;
  }
  return token;
}

/** One vertical bar group: track + bar + hover value + axis label. */
function verticalBar(datum: BarDatum, index: number, count: number, scaleMax: number) {
  const token = barToken(datum);
  if (token === null) return null;
  const plotHeight = BAR_BASELINE - BAR_PLOT_TOP;
  const band = (CHART_WIDTH - CHART_PAD_X * 2) / count;
  const center = CHART_PAD_X + band * (index + 0.5);
  const barWidth = band * 0.6;
  const trackMax = datum.max ?? scaleMax;
  const trackHeight = (trackMax / scaleMax) * plotHeight;
  const barHeight = (datum.value / scaleMax) * plotHeight;
  return (
    <g className="ptp-bars__group" key={`${datum.label}-${index}`}>
      <rect
        className="ptp-bars__track"
        x={center - barWidth / 2}
        y={BAR_BASELINE - trackHeight}
        width={barWidth}
        height={trackHeight}
        rx={3}
      />
      <rect
        className="ptp-bars__bar"
        x={center - barWidth / 2}
        y={BAR_BASELINE - barHeight}
        width={barWidth}
        height={barHeight}
        rx={3}
        style={{ fill: `var(${token})` }}
      />
      <text className="ptp-bars__value" x={center} y={BAR_BASELINE - barHeight - 6} textAnchor="middle">
        {datum.value}
      </text>
      <text className="ptp-bars__label" x={center} y={BAR_LABEL_Y} textAnchor="middle">
        {datum.label}
      </text>
    </g>
  );
}

/** One horizontal bar group — labels left, capacity tracks to the right. */
function horizontalBar(datum: BarDatum, index: number, count: number, scaleMax: number) {
  const token = barToken(datum);
  if (token === null) return null;
  const plotWidth = CHART_WIDTH - CHART_PAD_X - HORIZONTAL_PLOT_X;
  const band = (HORIZONTAL_BOTTOM - HORIZONTAL_TOP) / count;
  const center = HORIZONTAL_TOP + band * (index + 0.5);
  const barHeight = band * 0.6;
  const trackMax = datum.max ?? scaleMax;
  const trackWidth = (trackMax / scaleMax) * plotWidth;
  const barWidth = (datum.value / scaleMax) * plotWidth;
  return (
    <g className="ptp-bars__group" key={`${datum.label}-${index}`}>
      <rect
        className="ptp-bars__track"
        x={HORIZONTAL_PLOT_X}
        y={center - barHeight / 2}
        width={trackWidth}
        height={barHeight}
        rx={3}
      />
      <rect
        className="ptp-bars__bar"
        x={HORIZONTAL_PLOT_X}
        y={center - barHeight / 2}
        width={barWidth}
        height={barHeight}
        rx={3}
        style={{ fill: `var(${token})` }}
      />
      <text className="ptp-bars__value" x={HORIZONTAL_PLOT_X + barWidth + 6} y={center + 4}>
        {datum.value}
      </text>
      <text className="ptp-bars__label" x={HORIZONTAL_LABEL_X} y={center + 4} textAnchor="end">
        {datum.label}
      </text>
    </g>
  );
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
export function BarChart({ data, orientation = "vertical", label }: BarChartProps) {
  if (data.length === 0) {
    console.warn(
      "[signature-style] dropped bar chart — data is empty; no data, no ink.",
    );
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
    return (
      <line
        key={quota}
        className="ptp-bars__refline"
        strokeDasharray="4 4"
        strokeWidth={1}
        {...geometry}
      />
    );
  });
  return (
    <svg
      role="img"
      aria-label={label ?? `Bar chart of ${data.length} categories`}
      className="ptp-bars"
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
    >
      {refLines}
      {data.map((datum, index) =>
        isVertical
          ? verticalBar(datum, index, data.length, scaleMax)
          : horizontalBar(datum, index, data.length, scaleMax),
      )}
    </svg>
  );
}

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
export function smoothPath(coords: ReadonlyArray<{ x: number; y: number }>): string {
  if (coords.length === 0) return "";
  if (coords.length === 1) return `M ${coords[0]?.x} ${coords[0]?.y}`;
  let d = `M ${coords[0]?.x} ${coords[0]?.y}`;
  for (let i = 0; i < coords.length - 1; i += 1) {
    const p0 = coords[i - 1] ?? coords[i] as { x: number; y: number };
    const p1 = coords[i] as { x: number; y: number };
    const p2 = coords[i + 1] as { x: number; y: number };
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
function areaCoords(points: readonly AreaPoint[]): Array<{ x: number; y: number }> {
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const plotHeight = AREA_PLOT_BOTTOM - AREA_PLOT_TOP;
  const plotWidth = CHART_WIDTH - AREA_PAD_X * 2;
  return points.map((point, index) => ({
    x: AREA_PAD_X + (index / (points.length - 1)) * plotWidth,
    y:
      AREA_PLOT_TOP +
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
 *   colorToken="--party-sky"
 *   label="RSVP momentum"
 * />
 * ```
 */
export function AreaChart({
  points,
  colorToken = "--party-sky",
  height = 200,
  label,
}: AreaChartProps) {
  if (points.length < 2) {
    console.warn(
      `[signature-style] dropped area chart — points needs ≥2 samples (got ${points.length}); no trend, no ink.`,
    );
    return null;
  }
  if (!colorToken.startsWith("--party-")) {
    console.warn(
      `[signature-style] dropped "${colorToken}" — AreaChart accepts --party-* tokens only (Rule of Engagement: structural chrome keeps Flamingo/Teal).`,
    );
    return null;
  }
  // React ids carry colons — strip them so url(#id) parses everywhere.
  const gradientId = `ptp-area${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const coords = areaCoords(points);
  const line = smoothPath(coords);
  const first = coords[0] as { x: number; y: number };
  const last = coords[coords.length - 1] as { x: number; y: number };
  const area = `${line} L ${last.x} ${AREA_PLOT_BOTTOM} L ${first.x} ${AREA_PLOT_BOTTOM} Z`;
  return (
    <svg
      role="img"
      aria-label={label ?? `Area chart of ${points.length} points`}
      className="ptp-area"
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      style={{ height }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={`color-mix(in srgb, var(${colorToken}) 30%, transparent)`} />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path className="ptp-area__fill" d={area} fill={`url(#${gradientId})`} />
      <path
        className="ptp-area__line"
        d={line}
        style={{ stroke: `var(${colorToken})` }}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((point, index) => {
        const coord = coords[index];
        if (coord === undefined) return null;
        return (
          <g className="ptp-area__spot" key={`${point.label}-${index}`}>
            <circle
              className="ptp-area__point"
              cx={coord.x}
              cy={coord.y}
              r={4}
              strokeWidth={2}
              style={{ stroke: `var(${colorToken})` }}
            />
            <text className="ptp-area__readout" x={coord.x} y={coord.y - 10} textAnchor="middle">
              {point.value}
            </text>
            <text className="ptp-area__xlabel" x={coord.x} y={AREA_LABEL_Y} textAnchor="middle">
              {point.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
