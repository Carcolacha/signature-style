/**
 * viz — telemetry primitives (1.3.0 "Telemetry Module").
 *
 * Two lightweight SVG/HTML charting primitives with ZERO external
 * charting dependencies — the data-ink doctrine in component form:
 * no grid lines, no drop shadows, no 3D. Tracks are structural chrome
 * (`var(--bg-surface)`); data fills are STRICTLY `--party-*` content
 * tokens (Rule of Engagement: party colors are the content/data
 * colors). The ring needs no CSS at all — pure SVG attributes; the
 * bar's two classes live in css/viz.css.
 *
 * Rule of Engagement, enforced twice per component: `colorToken` is
 * typed as `PartyTokenName` (an `Extract` on `KnownToken`), so passing
 * a structural token like `--color-cake-primary` is a compile error —
 * and a runtime guard (`startsWith("--party-")`) warns and renders
 * null for JS consumers, same warn-and-drop philosophy as PartyBadge.
 *
 * Pruning Protocol: ProgressBar renders EXACTLY two elements (the
 * progressbar div + the fill div, no wrappers); StatRing renders ONE
 * svg with EXACTLY two circles (track + progress). Consumers place
 * their own numbers and labels beside them — nothing is centered,
 * nothing is decorated.
 */

import type { PartyTokenName } from "./primitives.js";

/**
 * `<ProgressBar>` — the party-colored budget bar.
 *
 * ONE `div.ptp-progress` (role="progressbar", full aria value
 * contract) containing ONE `div.ptp-progress__fill` whose width is
 * the clamped value. The fill animates `width 0.3s ease-out`
 * (owner-mandated physics; `prefers-reduced-motion` disables it).
 * The track is `var(--bg-surface)`; the fill is `var(colorToken)` —
 * a `--party-*` token or the component refuses to render.
 *
 * The PlanThenParty use case: budget remaining (72 of 100 on
 * `--party-green`), savings progress, RSVP counts — any single
 * scalar that reads as a filled portion of a whole.
 *
 * @example
 * ```tsx
 * <ProgressBar value={72} colorToken="--party-green" label="Budget remaining" />
 * ```
 */
export interface ProgressBarProps {
  /** The filled percentage — clamped to 0–100 before rendering. */
  value: number;
  /** A `--party-*` content token — the ONLY tokens allowed here. */
  colorToken: PartyTokenName;
  /** The accessible name for the progressbar (e.g. "Budget remaining"). */
  label?: string;
}

export function ProgressBar({ value, colorToken, label }: ProgressBarProps) {
  if (!colorToken.startsWith("--party-")) {
    console.warn(
      `[signature-style] dropped "${colorToken}" — ProgressBar accepts --party-* tokens only (Rule of Engagement: structural chrome keeps Flamingo/Teal).`,
    );
    return null;
  }
  const clamped = Math.min(100, Math.max(0, value));
  return (
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
  );
}

/**
 * `<StatRing>` — the party-colored RSVP ratio ring.
 *
 * ONE `<svg role="progressbar">` (viewBox 0 0 100 100, square at
 * `size`) with EXACTLY two circles sharing the same geometry
 * (cx 50, cy 50, r 44): the track in `var(--bg-surface)` and the
 * progress arc in `var(colorToken)`, revealed by
 * `strokeDasharray = C = 2π·44` / `strokeDashoffset = C × (1 − v/100)`
 * and rotated −90° so 0% starts at 12 o'clock. The stroke width is
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
 * NO center text, NO labels, NO third element (Pruning): consumers
 * place their numbers beside the ring. The PlanThenParty use case:
 * the RSVP ratio (85% of invitees in on `--party-sky`), attendance,
 * completion — any single ratio that reads as a dial.
 *
 * @example
 * ```tsx
 * <StatRing value={85} colorToken="--party-sky" />
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
  /** The accessible name for the progressbar (e.g. "RSVP ratio"). */
  label?: string;
}

export function StatRing({
  value,
  colorToken,
  size = 64,
  strokeWidth = 8,
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
        stroke="var(--bg-surface)"
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
    </svg>
  );
}
