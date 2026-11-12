import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { EmptyState, Icon, PartyBadge, } from "./primitives.js";
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
    return (_jsx("h2", { className: "ptp-timeline__header", style: { gridRow: `${headerRow} / ${spanEnd}` }, children: group.displayDate }, `date-${group.key}`));
}
function renderNode(event, row, index) {
    const groupFirst = index === 0 ? " ptp-timeline__node--group-first" : "";
    return (_jsx("span", { className: `ptp-timeline__node${groupFirst}`, style: { gridRow: row, gridColumn: "var(--tl-node-col)" }, children: _jsx(Icon, { name: event.icon ?? "Circle", "aria-hidden": true }) }, `node-${event.id}`));
}
function renderItem(event, row, index) {
    const side = index % 2 === 0 ? "left" : "right";
    const groupFirst = index === 0 ? " ptp-timeline__item--group-first" : "";
    return (_jsxs("div", { className: `ptp-timeline__item ptp-timeline__item--${side}${groupFirst}`, style: { gridRow: row }, children: [_jsx(PartyBadge, { colorToken: event.category, label: event.categoryLabel }), _jsx("h3", { className: "ptp-timeline__title", children: event.title }), event.time !== undefined && (_jsx("time", { className: "ptp-timeline__time", children: event.time }))] }, `event-${event.id}`));
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
 *       category: "--party-peach",
 *       categoryLabel: "Birthday",
 *       icon: "Cake",
 *     },
 *   ]}
 * />
 * ```
 */
export function EventTimeline({ events }) {
    if (events.length === 0) {
        return (_jsx(EmptyState, { icon: "CalendarX", title: "No events planned yet", message: "Add your first event and the timeline will appear." }));
    }
    let row = 1;
    const children = [];
    for (const group of groupEvents(events)) {
        children.push(renderHeader(group, row));
        row += 1;
        for (const [index, event] of group.events.entries()) {
            children.push(renderNode(event, row, index));
            children.push(renderItem(event, row, index));
            row += 1;
        }
    }
    return _jsx("div", { className: "ptp-timeline", children: children });
}
