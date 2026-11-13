/**
 * data — data-display primitives (2.3.0 "Universal Web Components & AI
 * Signature Codex").
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
 * `<DataTable>` renders `<div class="ptp-table-scroll">` around the bare
 * `<table>`. This wrapper is STRUCTURAL, not decorative — a table
 * element ignores `overflow` in table layout, so scroll containment on
 * narrow viewports is impossible without a block ancestor; the wrapper
 * IS the mobile strategy (see the css/data.css header). Everything else
 * here is peak-pruning flat.
 *
 * CALLOUTS ARE TOASTS' PERSISTENT SIBLING: `<Callout>` maps status → a
 * `--party-*` token set INLINE as `--status` (css/data.css reads it for
 * the 4px left strip) — the exact mechanism of css/toast.css — but a
 * callout never auto-dismisses. Toasts report an outcome and leave;
 * callouts hold context on the page.
 */

import type { CSSProperties, ReactNode } from "react";

/**
 * One column of a `<DataTable>`: the row key it reads, the header text,
 * and whether the cells carry numbers (right-aligned tabular-nums via
 * the .ptp-data-table__num class).
 */
export interface DataTableColumn {
  /** The `rows` record key this column renders. */
  key: string;
  /** The thead header text (rendered uppercase by css). */
  header: string;
  /** Numeric column → right-aligned tabular-nums cells. */
  numeric?: boolean;
}

export interface DataTableProps {
  /** The column contract — order is render order. */
  columns: DataTableColumn[];
  /**
   * The records — one row per entry, keyed by `columns[].key`. Values
   * are ReactNode, so a cell may be plain text or a composed primitive
   * (e.g. a <PartyBadge> status).
   */
  rows: Array<Record<string, ReactNode>>;
  /** Optional provenance caption — renders BELOW the table (mono, muted). */
  caption?: string;
}

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
export function DataTable({ columns, rows, caption }: DataTableProps) {
  return (
    <div className="ptp-table-scroll">
      <table className="ptp-data-table">
        {caption !== undefined && <caption>{caption}</caption>}
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={column.numeric === true ? "ptp-data-table__num" : undefined}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={column.numeric === true ? "ptp-data-table__num" : undefined}
                >
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** One tab of a `<Tabs>` switcher: the stable id and its visible label. */
export interface TabsTab {
  /** The stable identity — the value `onChange` receives. */
  id: string;
  /** The visible button text. */
  label: string;
}

export interface TabsProps {
  /** The tabs, rendered once in the tablist in the given order. */
  tabs: TabsTab[];
  /** The active tab id (controlled — the component owns no state). */
  activeId: string;
  /** Called with the clicked tab's id: `onChange(tab.id)`. */
  onChange: (id: string) => void;
  /** The accessible name for the tablist (e.g. "Dashboard modules"). */
  label?: string;
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
export function Tabs({ tabs, activeId, onChange, label }: TabsProps) {
  return (
    <div role="tablist" aria-label={label} className="ptp-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeId === tab.id}
          className="ptp-tabs__tab"
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/** The three callout moods — each maps to its `--party-*` strip token. */
export type CalloutStatus = "info" | "success" | "warning";

export interface CalloutProps {
  /** The mood — info → sky, success → green, warning → peach (inline --status). */
  status: CalloutStatus;
  /** The note body — rendered directly inside the callout div. */
  children?: ReactNode;
}

/**
 * Status → strip token, INLINE as `--status` for css/data.css's
 * `border-left: 4px solid var(--status)` — the css/toast.css mechanism,
 * content tokens for content outcomes (Rule of Engagement).
 */
const CALLOUT_VARIABLE: Record<CalloutStatus, string> = {
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
export function Callout({ status, children }: CalloutProps) {
  return (
    <div
      className="ptp-callout"
      role="note"
      style={{ "--status": CALLOUT_VARIABLE[status] } as CSSProperties}
    >
      {children}
    </div>
  );
}
