/**
 * timeline-manager — <TimelineManager>, the CONTROLLED milestone
 * manager (2.7.0 "Interactive Knowledge Graph, Analytical SVG Charts
 * & Manageable Timeline").
 *
 * Backward compatibility is a hard line: <EventTimeline>
 * (react/timeline.tsx) is UNTOUCHED — this module EXTENDS its contract
 * (`TimelineItem extends TimelineEvent`) and adds the working half: a
 * composer, filter pills, settle toggles, deletes and an inspect
 * callback. The styles APPEND to css/timeline.css under the
 * .sig-tmanager namespace — zero rules above were edited.
 *
 * CONTROLLED, like the package's switches: the component owns NO
 * items — `items` renders, and every mutation rides the callbacks
 * (onAdd / onToggleSettled / onDelete). The only internal state is
 * UI-local: the composer fields and the active filter pill.
 *
 * DOM (Pruning Protocol): ONE `<section class="sig-tmanager">` → the
 * composer row (package Input + two package Selects + the package
 * Button) → the filter strip (attribute-driven pills — aria-pressed IS
 * the state, the Flamingo underline answers it — plus the tabular
 * live counter) → ONE `<ul>` of rows (settle button · body button ·
 * delete button) → the Pillar 4 EmptyState when the CURRENT filter
 * matches nothing. No wrappers beyond that anatomy.
 *
 * Icon names are live-map-probed lucide keys: the owner-spec'd
 * "Trash2" and "Filter" are NOT keys of the installed lucide-react
 * 1.72.0 icons map (gate-probed — the "Music" lesson) — the
 * live-map-valid equivalents "Trash" and "Funnel" render instead.
 *
 * Settled styling: the body fades to 0.6 and the title strikes
 * through; the settle toggle fills --sig-green and a mono "Settled"
 * chip rides the body. NOT a SigBadge — settled is a STATE, not a
 * content category.
 *
 * @example
 * ```tsx
 * <TimelineManager
 *   items={items}
 *   onAdd={(item) => setItems((cur) => [...cur, { ...item, id: nextId() }])}
 *   onToggleSettled={(id) => toggle(id)}
 *   onDelete={(id) => remove(id)}
 *   onInspect={(item) => modal.open(item)}
 *   label="Milestone manager"
 * />
 * ```
 */
import type { TimelineEvent } from "./timeline.js";
/** One managed milestone — a TimelineEvent plus its settle state. */
export interface TimelineItem extends TimelineEvent {
    /** Settled milestones fade + strike through and flip the toggle green. */
    settled?: boolean;
}
export interface TimelineManagerProps {
    /** The milestones — the component owns NONE of them (controlled). */
    items: TimelineItem[];
    /** Called with the composed item (minus its id) from the composer. */
    onAdd: (item: Omit<TimelineItem, "id">) => void;
    /** Called with the id of the toggled milestone. */
    onToggleSettled: (id: string) => void;
    /** Called with the id of the deleted milestone. */
    onDelete: (id: string) => void;
    /** Fired when a row body is clicked (pass useModal().open to compose <EventModal>). */
    onInspect?: (item: TimelineItem) => void;
    /** The section's accessible name. Default "Milestone manager". */
    label?: string;
}
export declare function TimelineManager({ items, onAdd, onToggleSettled, onDelete, onInspect, label, }: TimelineManagerProps): import("react").JSX.Element;
