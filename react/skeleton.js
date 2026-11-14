import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * `<SkeletonLine>` — one shimmering text-line placeholder (16px tall,
 * two 8px steps).
 *
 * @example
 * ```tsx
 * <SkeletonLine width="60%" />
 * ```
 */
export function SkeletonLine({ width }) {
    const style = width === undefined ? {} : { width: typeof width === "number" ? `${width}px` : width };
    return _jsx("div", { className: "sig-skeleton sig-skeleton--line", style: style, "aria-hidden": "true" });
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
    return (_jsxs("div", { className: "sig-skeleton-card", "aria-hidden": "true", children: [_jsx("div", { className: "sig-skeleton sig-skeleton--line", style: { width: "40%" } }), _jsx("div", { className: "sig-skeleton sig-skeleton--row" }), _jsx("div", { className: "sig-skeleton sig-skeleton--row", style: { width: "92%" } }), _jsx("div", { className: "sig-skeleton sig-skeleton--row", style: { width: "76%" } })] }));
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
export function SkeletonTableRow({ columns = 3 }) {
    const cells = [];
    for (let i = 0; i < columns; i += 1) {
        cells.push(_jsx("td", { children: _jsx("div", { className: "sig-skeleton sig-skeleton--row", style: { width: i === 0 ? "72%" : "88%" } }) }, i));
    }
    return (_jsx("tr", { className: "sig-skeleton-tr", "aria-hidden": "true", children: cells }));
}
