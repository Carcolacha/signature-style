import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * timeline — <EventTimeline>, the chronological events component
 * (0.6.0 "Event Timeline").
 *
 * Engine v2.5 compliance: the DOM is perfectly FLAT — one grid container
 * whose direct children are date headers (`h2`), nodes (`span`) and event
 * content blocks (`div`). No row wrappers, and the vertical line is a
 * `::before` pseudo-element on the container, never a div (Pruning
 * Protocol). Structure (nodes, line) stays Flamingo/Teal; content
 * categories wear Chromatic Palette tokens via <SigBadge> (Rule of
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
import { memo } from "react";
import { EmptyState, Icon, SigBadge, } from "./primitives.js";
/** Bucket events by `dateKey ?? date`, preserving first-occurrence order. */
function groupEvents(events) {
    const groups = new Map();
    for (const event of events) {
        const key = event.dateKey ?? event.date;
        const existing = groups.get(key);
        if (existing !== undefined) {
            existing.events.push(event);
            continue;
        }
        groups.set(key, { key, displayDate: event.date, events: [event] });
    }
    return [...groups.values()];
}
function renderHeader(group, headerRow) {
    // Span the whole group so the sticky header can travel its section.
    const spanEnd = headerRow + group.events.length + 1;
    return (_jsx("h2", { className: "sig-timeline__header", style: { gridRow: `${headerRow} / ${spanEnd}` }, children: group.displayDate }, `date-${group.key}`));
}
function renderNode(event, row, index, onEventSelect) {
    const groupFirst = index === 0 ? " sig-timeline__node--group-first" : "";
    return (_jsx("button", { type: "button", className: `sig-timeline__node${groupFirst}`, style: { gridRow: row, gridColumn: "var(--tl-node-col)" }, "aria-label": event.title, onClick: onEventSelect !== undefined ? () => onEventSelect(event) : undefined, children: _jsx(Icon, { name: event.icon ?? "Circle", "aria-hidden": true }) }, `node-${event.id}`));
}
function renderItem(event, row, index) {
    const side = index % 2 === 0 ? "left" : "right";
    const groupFirst = index === 0 ? " sig-timeline__item--group-first" : "";
    return (_jsxs("div", { className: `sig-timeline__item sig-timeline__item--${side}${groupFirst}`, style: { gridRow: row }, children: [_jsx(SigBadge, { colorToken: event.category, label: event.categoryLabel }), _jsx("h3", { className: "sig-timeline__title", children: event.title }), event.time !== undefined && (_jsx("time", { className: "sig-timeline__time", children: event.time }))] }, `event-${event.id}`));
}
/**
 * `<EventTimeline>` — a chronological, alternating event timeline.
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
export const EventTimeline = memo(function EventTimeline({ events, onEventSelect }) {
    if (events.length === 0) {
        return (_jsx(EmptyState, { icon: "CalendarX", title: "No events planned yet", message: "Add your first event and the timeline will appear." }));
    }
    let row = 1;
    const children = [];
    for (const group of groupEvents(events)) {
        children.push(renderHeader(group, row));
        row += 1;
        for (const [index, event] of group.events.entries()) {
            children.push(renderNode(event, row, index, onEventSelect));
            children.push(renderItem(event, row, index));
            row += 1;
        }
    }
    return _jsx("div", { className: "sig-timeline", children: children });
});
