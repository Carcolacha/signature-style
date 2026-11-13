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
  /** Outer diameter in px. Default 64 — an 8px-grid multiple. */
  size?: number;
  /** Track/fill weight in px — grid-perfect: 4 (half unit) or 8 (one unit). Default 8. */
  strokeWidth?: 4 | 8;
  /** 2.2.0: centered ring readout inside the SVG. Default true. */
  showValue?: boolean;
  /** The accessible name for the progressbar (e.g. "RSVP ratio"). */
  label?: string;
}

export function StatRing({
  value,
  colorToken,
  size = 64,
  strokeWidth = 8,
  showValue = true,
  label,
}: StatRingProps) {
  if (!colorToken.startsWith("--party-")) {
    console.warn(
      `[signature-style] dropped "${colorToken}" — StatRing accepts --party-* tokens only (Rule of Engagement: structural chrome keeps Flamingo/Teal).`,
    );
    return null;
  }
  const clamped = Math.min(100, Math.max(0, value));
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  // px → viewBox units: identical visual weight at every size.
  const strokeUnits = (strokeWidth / size) * 100;
  return (
    <svg
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      aria-label={label}
      width={size}
      height={size}
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
