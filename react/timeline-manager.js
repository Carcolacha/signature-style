import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import { useState } from "react";
import { Button, EmptyState, Icon, SigBadge, } from "./primitives.js";
import { Input, Select } from "./forms.js";
/** The composer's twelve month options. */
const MONTH_OPTIONS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];
/** The composer's category options — the chromatic tokens with human labels. */
const CATEGORY_OPTIONS = [
    { token: "--sig-pink-bright", label: "Invites" },
    { token: "--sig-pink-soft", label: "Members" },
    { token: "--sig-pink-alt", label: "Decor" },
    { token: "--sig-mauve-bright", label: "Venue" },
    { token: "--sig-mauve-soft", label: "Admin" },
    { token: "--sig-lavender", label: "Ceremony" },
    { token: "--sig-sky", label: "Music" },
    { token: "--sig-cobalt", label: "Logistics" }, /* 3.0.0: --sig-blue
       RETIRED — value carried by cobalt (same hex). OWNER-SANCTIONED pin
       re-target: this frozen file's typed array pinned the retired name and
       the typecheck made the retirement unsatisfiable (the 2.9.1 verify.mjs
       precedent — the floor rebases with the release). */
    { token: "--sig-peach", label: "Catering" },
    { token: "--sig-green", label: "Attendance" },
    { token: "--sig-yellow", label: "Meter" },
];
const FILTERS = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "settled", label: "Settled" },
];
/** The visibility predicate for one filter id. */
function matchesFilter(item, filter) {
    if (filter === "settled")
        return item.settled === true;
    if (filter === "pending")
        return item.settled !== true;
    return true;
}
export function TimelineManager({ items, onAdd, onToggleSettled, onDelete, onInspect, label, }) {
    const [draftTitle, setDraftTitle] = useState("");
    const [draftMonth, setDraftMonth] = useState("January");
    const [draftCategory, setDraftCategory] = useState("--sig-sky");
    const [filter, setFilter] = useState("all");
    const settledCount = items.filter((item) => item.settled === true).length;
    const visible = items.filter((item) => matchesFilter(item, filter));
    const handleAdd = () => {
        const trimmed = draftTitle.trim();
        if (trimmed === "") {
            console.warn("[signature-style] TimelineManager composer ignored an empty milestone title.");
            return;
        }
        const categoryLabel = CATEGORY_OPTIONS.find((option) => option.token === draftCategory)?.label ??
            "Milestone";
        onAdd({
            date: draftMonth,
            title: trimmed,
            category: draftCategory,
            categoryLabel,
            settled: false,
        });
        setDraftTitle("");
    };
    return (_jsxs("section", { className: "sig-tmanager", "aria-label": label ?? "Milestone manager", children: [_jsxs("div", { className: "sig-tmanager__composer", children: [_jsx(Input, { placeholder: "Milestone title", "aria-label": "Milestone title", value: draftTitle, onChange: (event) => setDraftTitle(event.target.value) }), _jsx(Select, { label: "Month", value: draftMonth, onChange: (event) => setDraftMonth(event.target.value), children: MONTH_OPTIONS.map((month) => (_jsx("option", { value: month, children: month }, month))) }), _jsx(Select, { label: "Category", value: draftCategory, onChange: (event) => setDraftCategory(event.target.value), children: CATEGORY_OPTIONS.map((option) => (_jsx("option", { value: option.token, children: option.label }, option.token))) }), _jsx(Button, { variant: "primary", size: "sm", onClick: handleAdd, children: "Settle Item" })] }), _jsxs("div", { className: "sig-tmanager__filters", children: [FILTERS.map((entry) => (_jsx("button", { type: "button", className: "sig-tmanager__pill", "aria-pressed": filter === entry.id, onClick: () => setFilter(entry.id), children: entry.label }, entry.id))), _jsxs("span", { className: "sig-tmanager__count", children: [settledCount, " / ", items.length, " Settled"] })] }), visible.length === 0 ? (_jsx(EmptyState, { icon: "Funnel", title: "Nothing here", message: "No milestones match this filter." })) : (_jsx("ul", { className: "sig-tmanager__list", children: visible.map((item) => (_jsxs("li", { className: `sig-tmanager__row${item.settled === true ? " sig-tmanager__row--settled" : ""}`, children: [_jsx("button", { type: "button", className: "sig-tmanager__settle", "aria-pressed": item.settled === true, "aria-label": "Toggle settled", onClick: () => onToggleSettled(item.id), children: _jsx(Icon, { name: "Check", "aria-hidden": true }) }), _jsxs("button", { type: "button", className: "sig-tmanager__body", onClick: () => onInspect?.(item), children: [_jsx("span", { className: "sig-tmanager__meta", children: item.date }), _jsx("span", { className: "sig-tmanager__title", children: item.title }), _jsx(SigBadge, { colorToken: item.category, label: item.categoryLabel }), item.settled === true && (_jsx("span", { className: "sig-tmanager__done", children: "Settled" }))] }), _jsx("button", { type: "button", className: "sig-tmanager__delete", "aria-label": `Delete ${item.title}`, onClick: () => onDelete(item.id), children: _jsx(Icon, { name: "Trash", "aria-hidden": true }) })] }, item.id))) }))] }));
}
