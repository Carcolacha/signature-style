/**
 * skeleton — the loading placeholders (2.9.0 "Power-User Utilities").
 *
 * The Pillar 4 edge-state, made composable: three shapes that render
 * while real content loads. Heights are LOCKED to the 8px grid
 * (lines 16px, card rows and gaps in 8px multiples), and the shimmer
 * is the single linear-gradient sweep defined in css/skeleton.css —
 * between color-mix(in srgb, var(--bg-inset) 60%, transparent) and
 * var(--bg-surface). Under prefers-reduced-motion the animation
 * stands down to a static var(--bg-surface) block (css-side guard).
 *
 * A11y contract: every shape is aria-hidden="true" — they are
 * decorative pulse, never content. The LOADING announcement belongs to
 * the consumer (aria-busy on the region, a visually-hidden "Loading…"
 * line, or the region's live role). Render NOTHING here that a screen
 * reader would try to read.
 *
 * Pruning Protocol: SkeletonLine is ONE div. SkeletonCard is ONE div
 * whose rows are ::before-stacked? No — a card stub with real row divs
 * keeps the DOM honest (the rows have distinct widths); four flat
 * children, zero wrappers around them. SkeletonTableRow renders a
 * native <tr> of <td>s — it must sit inside a real <tbody> (it IS a
 * table row, not a lookalike).
 *
 * Zero hex, zero box-shadow (the e1 treaty) — the shimmer is
 * background-position animation only.
 */

import type { CSSProperties, ReactNode } from "react";

export interface SkeletonLineProps {
  /**
   * The line's width — any css width ("60%", "12rem", 96). Defaults
   * to "100%" (a full-width text row).
   */
  width?: string | number;
}

/**
 * `<SkeletonLine>` — one shimmering text-line placeholder (16px tall,
 * two 8px steps).
 *
 * @example
 * ```tsx
 * <SkeletonLine width="60%" />
 * ```
 */
export function SkeletonLine({ width }: SkeletonLineProps) {
  const style: CSSProperties =
    width === undefined ? {} : { width: typeof width === "number" ? `${width}px` : width };
  return <div className="sig-skeleton sig-skeleton--line" style={style} aria-hidden="true" />;
}

/**
 * `<SkeletonCard />` — a card stub: a short title line plus three
 * body rows on the 8px grid (16px title, 8px rows, 8px gaps).
 *
 * @example
 * ```tsx
 * <SkeletonCard />
 * ```
 */
export function SkeletonCard() {
  return (
    <div className="sig-skeleton-card" aria-hidden="true">
      <div className="sig-skeleton sig-skeleton--line" style={{ width: "40%" }} />
      <div className="sig-skeleton sig-skeleton--row" />
      <div className="sig-skeleton sig-skeleton--row" style={{ width: "92%" }} />
      <div className="sig-skeleton sig-skeleton--row" style={{ width: "76%" }} />
    </div>
  );
}

export interface SkeletonTableRowProps {
  /**
   * How many skeleton cells the row renders (the table's column
   * count). Defaults to 3.
   */
  columns?: number;
}

/**
 * `<SkeletonTableRow />` — a native `<tr>` of shimmering cells. Mount
 * it INSIDE a `<tbody>` of your own table while real rows load.
 *
 * @example
 * ```tsx
 * <tbody>
 *   {rows.length === 0 && <SkeletonTableRow columns={3} />}
 * </tbody>
 * ```
 */
export function SkeletonTableRow({ columns = 3 }: SkeletonTableRowProps) {
  const cells: ReactNode[] = [];
  for (let i = 0; i < columns; i += 1) {
    cells.push(
      <td key={i}>
        <div
          className="sig-skeleton sig-skeleton--row"
          style={{ width: i === 0 ? "72%" : "88%" }}
        />
      </td>,
    );
  }
  return (
    <tr className="sig-skeleton-tr" aria-hidden="true">
      {cells}
    </tr>
  );
}
