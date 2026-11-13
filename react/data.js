import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * `<DataTable>` — the ledger table.
 *
 * `<div class="ptp-table-scroll">` (the justified scroll-containment
 * wrapper — the mobile strategy, see the module docstring) →
 * `<table class="ptp-data-table">` → optional `<caption>`,
 * `<thead>><tr><th scope="col">`, `<tbody>><tr><td>`. Numeric columns
 * wear .ptp-data-table__num on BOTH the th and the td (right-aligned,
 * tabular-nums). No sorting, no pagination, no virtualization — the
 * pruning protocol: a static table is the feature.
 *
 * @example
 * ```tsx
 * <DataTable
 *   columns={[
 *     { key: "guest", header: "Guest" },
 *     { key: "status", header: "Status" },
 *     { key: "share", header: "Contribution", numeric: true },
 *   ]}
 *   rows={[
 *     { guest: "Ana Souza", status: "Confirmed", share: "$120" },
 *     { guest: "Leo Martins", status: "Pending", share: "$0" },
 *   ]}
 *   caption="Shared pot ledger · updated after every RSVP"
 * />
 * ```
 */
export function DataTable({ columns, rows, caption }) {
    return (_jsx("div", { className: "ptp-table-scroll", children: _jsxs("table", { className: "ptp-data-table", children: [caption !== undefined && _jsx("caption", { children: caption }), _jsx("thead", { children: _jsx("tr", { children: columns.map((column) => (_jsx("th", { scope: "col", className: column.numeric === true ? "ptp-data-table__num" : undefined, children: column.header }, column.key))) }) }), _jsx("tbody", { children: rows.map((row, index) => (_jsx("tr", { children: columns.map((column) => (_jsx("td", { className: column.numeric === true ? "ptp-data-table__num" : undefined, children: row[column.key] }, column.key))) }, index))) })] }) }));
}
/**
 * `<Tabs>` — the controlled module switcher.
 *
 * `<div role="tablist" aria-label={label} class="ptp-tabs">` with one
 * `<button type="button" role="tab" aria-selected>` per tab. ZERO
 * .is-active classes — attribute-driven, the same contract as the nav's
 * [aria-current="page"]: css/data.css styles [aria-selected="true"]
 * directly (Flamingo underline). Controlled: pass `activeId` and react
 * to `onChange(id)`; state stays with you. Panels are YOURS — render
 * the active branch yourself (the component ships no panel wrapper, no
 * context, nothing to un-flatten).
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
    return (_jsx("div", { role: "tablist", "aria-label": label, className: "ptp-tabs", children: tabs.map((tab) => (_jsx("button", { type: "button", role: "tab", "aria-selected": activeId === tab.id, className: "ptp-tabs__tab", onClick: () => onChange(tab.id), children: tab.label }, tab.id))) }));
}
/**
 * Status → strip token, INLINE as `--status` for css/data.css's
 * `border-left: 4px solid var(--status)` — the css/toast.css mechanism,
 * content tokens for content outcomes (Rule of Engagement).
 */
const CALLOUT_VARIABLE = {
    info: "var(--party-sky)",
    success: "var(--party-green)",
    warning: "var(--party-peach)",
};
/**
 * `<Callout>` — the persistent note (Toast's sibling, never dismissing).
 *
 * ONE `<div class="ptp-callout" role="note">` with `--status` set INLINE
 * from the status → token map (info → --party-sky, success →
 * --party-green, warning → --party-peach); css/data.css paints the 4px
 * left strip from it. PERSISTENT by contract: no auto-dismiss, no timer,
 * no close button — a callout is page context, not an event feed. When
 * you need the transient version, that is `<ToastProvider>` + useToast().
 *
 * @example
 * ```tsx
 * <Callout status="warning">3 pending RSVPs close Friday.</Callout>
 * ```
 */
export function Callout({ status, children }) {
    return (_jsx("div", { className: "ptp-callout", role: "note", style: { "--status": CALLOUT_VARIABLE[status] }, children: children }));
}
