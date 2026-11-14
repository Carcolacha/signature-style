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
import {
  Button,
  EmptyState,
  Icon,
  SigBadge,
  type SigTokenName,
} from "./primitives.js";
import { Input, Select } from "./forms.js";
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

/** The composer's twelve month options. */
const MONTH_OPTIONS: readonly string[] = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** The composer's category options — the party tokens with human labels. */
const CATEGORY_OPTIONS: ReadonlyArray<{ token: SigTokenName; label: string }> = [
  { token: "--sig-pink-bright", label: "Invites" },
  { token: "--sig-pink-soft", label: "Guests" },
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
  { token: "--sig-green", label: "RSVP" },
  { token: "--sig-yellow", label: "Meter" },
];

/** The filter pills — attribute-driven (aria-pressed IS the state). */
type FilterId = "all" | "pending" | "settled";

const FILTERS: ReadonlyArray<{ id: FilterId; label: string }> = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "settled", label: "Settled" },
];

/** The visibility predicate for one filter id. */
function matchesFilter(item: TimelineItem, filter: FilterId): boolean {
  if (filter === "settled") return item.settled === true;
  if (filter === "pending") return item.settled !== true;
  return true;
}

export function TimelineManager({
  items,
  onAdd,
  onToggleSettled,
  onDelete,
  onInspect,
  label,
}: TimelineManagerProps) {
  const [draftTitle, setDraftTitle] = useState("");
  const [draftMonth, setDraftMonth] = useState<string>("January");
  const [draftCategory, setDraftCategory] = useState<SigTokenName>("--sig-sky");
  const [filter, setFilter] = useState<FilterId>("all");

  const settledCount = items.filter((item) => item.settled === true).length;
  const visible = items.filter((item) => matchesFilter(item, filter));

  const handleAdd = (): void => {
    const trimmed = draftTitle.trim();
    if (trimmed === "") {
      console.warn(
        "[signature-style] TimelineManager composer ignored an empty milestone title.",
      );
      return;
    }
    const categoryLabel =
      CATEGORY_OPTIONS.find((option) => option.token === draftCategory)?.label ??
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

  return (
    <section className="sig-tmanager" aria-label={label ?? "Milestone manager"}>
      <div className="sig-tmanager__composer">
        <Input
          placeholder="Milestone title"
          aria-label="Milestone title"
          value={draftTitle}
          onChange={(event) => setDraftTitle(event.target.value)}
        />
        <Select
          label="Month"
          value={draftMonth}
          onChange={(event) => setDraftMonth(event.target.value)}
        >
          {MONTH_OPTIONS.map((month) => (
            <option key={month} value={month}>{month}</option>
          ))}
        </Select>
        <Select
          label="Category"
          value={draftCategory}
          onChange={(event) => setDraftCategory(event.target.value as SigTokenName)}
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.token} value={option.token}>{option.label}</option>
          ))}
        </Select>
        <Button variant="primary" size="sm" onClick={handleAdd}>
          Settle Item
        </Button>
      </div>
      <div className="sig-tmanager__filters">
        {FILTERS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className="sig-tmanager__pill"
            aria-pressed={filter === entry.id}
            onClick={() => setFilter(entry.id)}
          >
            {entry.label}
          </button>
        ))}
        <span className="sig-tmanager__count">
          {settledCount} / {items.length} Settled
        </span>
      </div>
      {visible.length === 0 ? (
        <EmptyState
          icon="Funnel"
          title="Nothing here"
          message="No milestones match this filter."
        />
      ) : (
        <ul className="sig-tmanager__list">
          {visible.map((item) => (
            <li
              key={item.id}
              className={`sig-tmanager__row${item.settled === true ? " sig-tmanager__row--settled" : ""}`}
            >
              <button
                type="button"
                className="sig-tmanager__settle"
                aria-pressed={item.settled === true}
                aria-label="Toggle settled"
                onClick={() => onToggleSettled(item.id)}
              >
                <Icon name="Check" aria-hidden />
              </button>
              <button
                type="button"
                className="sig-tmanager__body"
                onClick={() => onInspect?.(item)}
              >
                <span className="sig-tmanager__meta">{item.date}</span>
                <span className="sig-tmanager__title">{item.title}</span>
                <SigBadge colorToken={item.category} label={item.categoryLabel} />
                {item.settled === true && (
                  <span className="sig-tmanager__done">Settled</span>
                )}
              </button>
              <button
                type="button"
                className="sig-tmanager__delete"
                aria-label={`Delete ${item.title}`}
                onClick={() => onDelete(item.id)}
              >
                <Icon name="Trash" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
