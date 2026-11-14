/**
 * timeline — <EventTimeline>, the chronological party-events component
 * (0.6.0 "Event Timeline").
 *
 * Engine v2.5 compliance: the DOM is perfectly FLAT — one grid container
 * whose direct children are date headers (`h2`), nodes (`span`) and event
 * content blocks (`div`). No row wrappers, and the vertical line is a
 * `::before` pseudo-element on the container, never a div (Pruning
 * Protocol). Structure (nodes, line) stays Flamingo/Teal; content
 * categories wear Party Palette tokens via <PartyBadge> (Rule of
 * Engagement).
 *
 * 0.7.0: nodes are `<button>` elements (interactive — an optional
 * `onEventSelect` callback fires with the clicked event; pass `modal.open`
 * from useModal() to wire the <EventModal> composition). Without the prop
 * the buttons render unchanged and simply do nothing on click.
 *
 * Layout contract with css/timeline.css: elements are placed with INLINE
 * `gridRow`/`gridColumn` styles against a `1fr auto 1fr` desktop grid
 * (content | node column | content). The CSS remaps the placement columns
 * via custom properties at max-width 768px (`auto 1fr` — line to the far
 * left, all events stacked right), so these inline styles are
 * breakpoint-neutral. A row counter assigns every child its row; the
 * empty side of an alternating row is left EMPTY — no placeholder div.
 *
 * Sticky headers are spanning grid items, so each date header spans its
 * whole group (`gridRow: "${headerRow} / ${spanEnd}"`). That span is what
 * gives the header travel room; the first event of each group carries the
 * `--group-first` clearance class so the statically-positioned header
 * never covers it. Afterwards content scrolls BENEATH the opaque,
 * `--z-sticky` header — the Pillar 3 z-index contract.
 */
import { type IconName, type PartyTokenName } from "./primitives.js";
/**
 * One event on the timeline.
 *
 * Grouping contract: events are bucketed by `dateKey ?? date` using exact
 * string equality, preserving first-occurrence order. Put the DISPLAY
 * string in `date` (e.g. "October 2026") and — only when that display
 * string is not itself a stable grouping key (localized strings,
 * duplicate display names) — provide `dateKey` (e.g. "2026-10").
 */
export interface PtpEvent {
    /** Stable unique identifier. */
    id: string;
    /** Display string shown in the sticky date header (e.g. "October 2026"). */
    date: string;
    /** Optional explicit grouping bucket; defaults to `date`. */
    dateKey?: string;
    /** Optional time-of-day display string (e.g. "14:00"). */
    time?: string;
    /** Event title. */
    title: string;
    /** Content category — a `--sig-*` token (Rule of Engagement). */
    category: PartyTokenName;
    /** Human label shown on the category badge. */
    categoryLabel: string;
    /** Node icon; defaults to "Circle". */
    icon?: IconName;
    /** Optional longer copy shown in the <EventModal> "About" row. */
    description?: string;
}
export interface EventTimelineProps {
    /**
     * Events in chronological order; group and event order are preserved
     * exactly as given. An empty array renders the Pillar 4 EmptyState and
     * no timeline chrome at all.
     */
    events: PtpEvent[];
    /**
     * Optional selection callback — fired with the clicked event. When
     * provided, every node becomes an interactive `<button>` (it always is
     * one, since 0.7.0); without it the buttons simply do nothing. Pass
     * `modal.open` from `useModal()` to compose <EventModal>.
     */
    onEventSelect?: (event: PtpEvent) => void;
}
/**
 * `<EventTimeline>` — a chronological, alternating party timeline.
 *
 * Desktop: vertical center line, events alternate left/right. Mobile
 * (max-width 768px): the line moves to the far left and all events stack
 * on the right (pure CSS — no JS breakpoint). Empty input renders
 * `<EmptyState icon="CalendarX" …>` immediately: no line, no chrome.
 *
 * @example
 * ```tsx
 * <EventTimeline
 *   events={[
 *     {
 *       id: "cake",
 *       date: "October 2026",
 *       time: "15:00",
 *       title: "Cake cutting",
 *       category: "--sig-peach",
 *       categoryLabel: "Birthday",
 *       icon: "Cake",
 *     },
 *   ]}
 * />
 * ```
 */
export declare const EventTimeline: import("react").NamedExoticComponent<EventTimelineProps>;
