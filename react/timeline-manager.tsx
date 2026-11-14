/**
 * timeline-manager — <TimelineManager>, the CONTROLLED milestone
 * manager (2.7.0 "Interactive Knowledge Graph, Analytical SVG Charts
 * & Manageable Timeline").
 *
 * Backward compatibility is a hard line: <EventTimeline>
 * (react/timeline.tsx) is UNTOUCHED — this module EXTENDS its contract
 * (`TimelineItem extends PtpEvent`) and adds the working half: a
 * composer, filter pills, settle toggles, deletes and an inspect
 * callback. The styles APPEND to css/timeline.css under the
 * .ptp-tmanager namespace — zero rules above were edited.
 *
 * CONTROLLED, like the package's switches: the component owns NO
 * items — `items` renders, and every mutation rides the callbacks
 * (onAdd / onToggleSettled / onDelete). The only internal state is
 * UI-local: the composer fields and the active filter pill.
 *
 * DOM (Pruning Protocol): ONE `<section class="ptp-tmanager">` → the
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
 * through; the settle toggle fills --party-green and a mono "Settled"
 * chip rides the body. NOT a PartyBadge — settled is a STATE, not a
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
  PartyBadge,
  type PartyTokenName,
} from "./primitives.js";
import { Input, Select } from "./forms.js";
import type { PtpEvent } from "./timeline.js";

/** One managed milestone — a PtpEvent plus its settle state. */
export interface TimelineItem extends PtpEvent {
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
const CATEGORY_OPTIONS: ReadonlyArray<{ token: PartyTokenName; label: string }> = [
  { token: "--party-pink-bright", label: "Invites" },
  { token: "--party-pink-soft", label: "Guests" },
  { token: "--party-pink-alt", label: "Decor" },
  { token: "--party-mauve-bright", label: "Venue" },
  { token: "--party-mauve-soft", label: "Admin" },
  { token: "--party-lavender", label: "Ceremony" },
  { token: "--party-sky", label: "Music" },
  { token: "--party-blue", label: "Logistics" },
  { token: "--party-peach", label: "Catering" },
  { token: "--party-green", label: "RSVP" },
  { token: "--party-yellow", label: "Meter" },
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
  const [draftCategory, setDraftCategory] = useState<PartyTokenName>("--party-sky");
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
    <section className="ptp-tmanager" aria-label={label ?? "Milestone manager"}>
      <div className="ptp-tmanager__composer">
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
          onChange={(event) => setDraftCategory(event.target.value as PartyTokenName)}
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.token} value={option.token}>{option.label}</option>
          ))}
        </Select>
        <Button variant="primary" size="sm" onClick={handleAdd}>
          Settle Item
        </Button>
      </div>
      <div className="ptp-tmanager__filters">
        {FILTERS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className="ptp-tmanager__pill"
            aria-pressed={filter === entry.id}
            onClick={() => setFilter(entry.id)}
          >
            {entry.label}
          </button>
        ))}
        <span className="ptp-tmanager__count">
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
        <ul className="ptp-tmanager__list">
          {visible.map((item) => (
            <li
              key={item.id}
              className={`ptp-tmanager__row${item.settled === true ? " ptp-tmanager__row--settled" : ""}`}
            >
              <button
                type="button"
                className="ptp-tmanager__settle"
                aria-pressed={item.settled === true}
                aria-label="Toggle settled"
                onClick={() => onToggleSettled(item.id)}
              >
                <Icon name="Check" aria-hidden />
              </button>
              <button
                type="button"
                className="ptp-tmanager__body"
                onClick={() => onInspect?.(item)}
              >
                <span className="ptp-tmanager__meta">{item.date}</span>
                <span className="ptp-tmanager__title">{item.title}</span>
                <PartyBadge colorToken={item.category} label={item.categoryLabel} />
                {item.settled === true && (
                  <span className="ptp-tmanager__done">Settled</span>
                )}
              </button>
              <button
                type="button"
                className="ptp-tmanager__delete"
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
