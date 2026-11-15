import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * data — data-display primitives (2.3.0 "Universal Web Components & AI
 * Signature Codex"; 2.4.1 "Intuitive Form Anatomy & Alignment Fix" grows
 * DataTableColumn.align).
 *
 * Three flat components wired to the styles in css/data.css:
 * `<DataTable>`, `<Tabs>`, `<Callout>`.
 *
 * ATTRIBUTE-DRIVEN STATE (the nav contract): `<Tabs>` renders ZERO
 * .is-active classes — [aria-selected="true"] IS the selected state and
 * css/data.css answers it directly (Flamingo underline, THE nav visual
 * contract). Same doctrine as GlobalNav's [aria-current="page"] and the
 * switch's [aria-checked]: the attribute is the state machine, so the
 * state survives any DOM shape and any consumer CSS.
 *
 * WRAPPER JUSTIFICATION (the one sanctioned wrapper in this file):
 * `<DataTable>` renders `<div class="sig-table-scroll">` around the bare
 * `<table>`. This wrapper is STRUCTURAL, not decorative — a table
 * element ignores `overflow` in table layout, so scroll containment on
 * narrow viewports is impossible without a block ancestor; the wrapper
 * IS the mobile strategy (see the css/data.css header). Everything else
 * here is peak-pruning flat.
 *
 * CALLOUTS ARE TOASTS' PERSISTENT SIBLING: `<Callout>` maps status → a
 * `--sig-*` token set INLINE as `--status` (css/data.css reads it for
 * the 4px left strip) — the exact mechanism of css/toast.css — but a
 * callout never auto-dismisses. Toasts report an outcome and leave;
 * callouts hold context on the page.
 */
import { memo } from "react";
import { useFlipIndicator } from "./motion.js";
/**
 * Column → cell className (2.4.1). The numeric convenience composes
 * with the alignment utility — a money column carries BOTH classes.
 * Class-based (not inline style) so css/data.css owns the paint and
 * the release gates can probe the needle.
 */
function dataTableCellClass(column) {
    const classes = [
        column.numeric === true ? "sig-data-table__num" : undefined,
        column.align !== undefined
            ? `sig-data-table__align-${column.align}`
            : undefined,
    ].filter((name) => name !== undefined);
    return classes.length > 0 ? classes.join(" ") : undefined;
}
/**
 * `<DataTable>` — the ledger table.
 *
 * `<div class="sig-table-scroll">` (the justified scroll-containment
 * wrapper — the mobile strategy, see the module docstring) →
 * `<table class="sig-data-table">` → optional `<caption>`,
 * `<thead>><tr><th scope="col">`, `<tbody>><tr><td>`. Numeric columns
 * wear .sig-data-table__num on BOTH the th and the td (right-aligned,
 * tabular-nums); an explicit `align` wears the .sig-data-table__align-*
 * utility on both too (2.4.1 — the header finally sits flush over its
 * values). No sorting, no pagination, no virtualization —
 * the pruning protocol: a static table is the feature.
 *
 * @example
 * ```tsx
 * <DataTable
 *   columns={[
 *     { key: "member", header: "Member" },
 *     { key: "status", header: "Status" },
 *     { key: "share", header: "Contribution", numeric: true, align: "right" },
 *   ]}
 *   rows={[
 *     { member: "Ana Souza", status: "Confirmed", share: "$120" },
 *     { member: "Leo Martins", status: "Pending", share: "$0" },
 *   ]}
 *   caption="Shared pot ledger · updated after every response"
 * />
 * ```
 */
export const DataTable = memo(function DataTable({ columns, rows, caption }) {
    return (_jsx("div", { className: "sig-table-scroll", children: _jsxs("table", { className: "sig-data-table", children: [caption !== undefined && _jsx("caption", { children: caption }), _jsx("thead", { children: _jsx("tr", { children: columns.map((column) => (_jsx("th", { scope: "col", className: dataTableCellClass(column), children: column.header }, column.key))) }) }), _jsx("tbody", { children: rows.map((row, index) => (_jsx("tr", { children: columns.map((column) => (_jsx("td", { className: dataTableCellClass(column), children: row[column.key] }, column.key))) }, index))) })] }) }));
});
/**
 * `<Tabs>` — the controlled module switcher.
 *
 * `<div role="tablist" aria-label={label} class="sig-tabs">` with one
 * `<button type="button" role="tab" aria-selected>` per tab. ZERO
 * .is-active classes — attribute-driven, the same contract as the nav's
 * [aria-current="page"]: css/data.css styles [aria-selected="true"]
 * directly. Controlled: pass `activeId` and react to `onChange(id)`;
 * state stays with you. Panels are YOURS — render the active branch
 * yourself (the component ships no panel wrapper, no context, nothing
 * to un-flatten).
 *
 * 3.7.0 THE FLIP GLIDING INDICATOR: the per-tab border-bottom underline
 * RETIRES — it teleported (the old tab's underline vanished while the
 * new tab's appeared — two disconnected blinks). One shared
 * .sig-tabs-indicator span now lives inside the tablist (aria-hidden —
 * pure decoration; selection is announced by aria-selected, never by
 * the underline) and GLIDES between tabs via the FLIP choreography of
 * useFlipIndicator (react/motion.tsx): measure both boxes, invert to
 * the previous geometry, play the transform to the new one over
 * var(--dur-glide) var(--ease-glide). The aria-selected CONTRACT IS
 * UNTOUCHED — the attribute is still the only state machine; the
 * indicator is a projection of it. Reduced motion: the indicator jumps
 * (tokens collapse to 1ms; css/motion.css + data.css stand down).
 *
 * @example
 * ```tsx
 * const [moduleId, setModuleId] = useState("core");
 * <Tabs
 *   label="Dashboard modules"
 *   tabs={[
 *     { id: "core", label: "Core Dashboard" },
 *     { id: "data", label: "Data & Tables" },
 *   ]}
 *   activeId={moduleId}
 *   onChange={setModuleId}
 * />
 * ```
 */
export function Tabs({ tabs, activeId, onChange, label }) {
    const { listRef, indicatorRef } = useFlipIndicator('[aria-selected="true"]');
    return (_jsxs("div", { role: "tablist", "aria-label": label, className: "sig-tabs", ref: listRef, children: [tabs.map((tab) => (_jsx("button", { type: "button", role: "tab", "aria-selected": activeId === tab.id, className: "sig-tabs__tab", onClick: () => onChange(tab.id), children: tab.label }, tab.id))), _jsx("span", { "aria-hidden": "true", className: "sig-tabs-indicator", ref: indicatorRef })] }));
}
/**
 * Status → strip token, INLINE as `--status` for css/data.css's
 * `border-left: 4px solid var(--status)` — the css/toast.css mechanism,
 * content tokens for content outcomes (Rule of Engagement).
 */
const CALLOUT_VARIABLE = {
    info: "var(--sig-sky)",
    success: "var(--sig-green)",
    warning: "var(--sig-peach)",
};
/**
 * `<Callout>` — the persistent note (Toast's sibling, never dismissing).
 *
 * ONE `<div class="sig-callout" role="note">` with `--status` set INLINE
 * from the status → token map (info → --sig-sky, success →
 * --sig-green, warning → --sig-peach); css/data.css paints the 4px
 * left strip from it. PERSISTENT by contract: no auto-dismiss, no timer,
 * no close button — a callout is page context, not an event feed. When
 * you need the transient version, that is `<ToastProvider>` + useToast().
 *
 * @example
 * ```tsx
 * <Callout status="warning">3 pending responses close Friday.</Callout>
 * ```
 */
export function Callout({ status, children }) {
    return (_jsx("div", { className: "sig-callout", role: "note", style: { "--status": CALLOUT_VARIABLE[status] }, children: children }));
}
