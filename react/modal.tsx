/**
 * modal — <EventModal> + useModal(), the Event Detail overlay (0.7.0
 * "Event Modal"), the final Info1 composition on top of <EventTimeline>.
 *
 * Architecture: `createPortal` mounts the overlay on `document.body`, so
 * it breaks free of the timeline's CSS Grid stacking context entirely.
 * The z-index pillars (Pillar 3) are then the ONLY stacking authority:
 * the backdrop wears `var(--z-overlay, 40)`, the card `var(--z-modal, 50)`
 * (see css/modal.css — the two are portal siblings-in-one-subtree, card
 * nested in backdrop, so one portal host carries both).
 *
 * A11y contract: the card is role="dialog" with aria-modal="true" and
 * aria-label = the event title. Escape closes (a document keydown listener
 * installed in a useEffect and ALWAYS cleaned up on unmount/disable), a
 * click on the backdrop closes, and a click inside the card does NOT —
 * the card stops propagation (required because it is nested inside the
 * backdrop's click target).
 *
 * DOM shape (Pruning Protocol): backdrop (div) → card (div, the grid)
 * whose DIRECT children are the title (h2), the close button, the
 * PartyBadge (span), and flat label/value pairs (span + span/time/p).
 * Zero wrapper divs — rows are grid lines, not divs.
 *
 * Aesthetics: every color comes from tokens (Flamingo structure, Teal
 * hover accent — the Rule of Engagement untouched; content categories
 * wear <PartyBadge>). The single documented exception is the neutral
 * rgba scrim in css/modal.css, which must dim regardless of theme.
 */

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon, PartyBadge } from "./primitives.js";
import type { PtpEvent } from "./timeline.js";

/** The state + stable callbacks returned by {@link useModal}. */
export interface UseModalReturn<T> {
  /** True between `open(event)` and `close()`. */
  isOpen: boolean;
  /** The event passed to the latest `open()` call; survives `close()`. */
  selectedEvent: T | null;
  /** Select an event and open the modal (stable identity). */
  open: (event: T) => void;
  /** Close the modal without forgetting the selection (stable identity). */
  close: () => void;
}

/**
 * `useModal<T>()` — the minimal selection state behind <EventModal>.
 *
 * Two useState values (`isOpen`, `selectedEvent`) plus stable `open` /
 * `close` callbacks (useCallback with empty deps — safe to hand straight
 * to <EventTimeline onEventSelect>). No context, no portals, no magic:
 * the hook owns state, the component owns the DOM.
 *
 * @example
 * ```tsx
 * const modal = useModal<PtpEvent>();
 * <EventTimeline events={events} onEventSelect={modal.open} />
 * {modal.selectedEvent !== null && (
 *   <EventModal event={modal.selectedEvent} open={modal.isOpen} onClose={modal.close} />
 * )}
 * ```
 */
export function useModal<T>(): UseModalReturn<T> {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<T | null>(null);
  const open = useCallback((event: T) => {
    setSelectedEvent(event);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);
  return { isOpen, selectedEvent, open, close };
}

export interface EventModalProps {
  /** The event to render; typically `modal.selectedEvent`. */
  event: PtpEvent;
  /** Visibility flag; typically `modal.isOpen`. False renders nothing. */
  open: boolean;
  /** Called on Escape, backdrop click, and close-button click. */
  onClose: () => void;
}

/** The icon-only close button — muted by default, Teal on hover. */
function renderClose(onClose: () => void): ReactNode {
  return (
    <button
      className="ptp-modal-close"
      type="button"
      aria-label="Close"
      onClick={onClose}
    >
      <Icon name="X" aria-hidden />
    </button>
  );
}

/** Flat label/value grid rows for the detail fields that exist. */
function detailRows(event: PtpEvent): ReactNode[] {
  const rows: ReactNode[] = [
    <span key="date-label" className="ptp-modal-label">Date</span>,
    <span key="date-value" className="ptp-modal-value">{event.date}</span>,
  ];
  if (event.time !== undefined) {
    rows.push(
      <span key="time-label" className="ptp-modal-label">Time</span>,
      <time key="time-value" className="ptp-modal-value">{event.time}</time>,
    );
  }
  if (event.description !== undefined) {
    rows.push(
      <span key="about-label" className="ptp-modal-label">About</span>,
      <p key="about-value" className="ptp-modal-value">{event.description}</p>,
    );
  }
  return rows;
}

/** Backdrop + card: one portal subtree, flat grid children, zero wrappers. */
function renderOverlay(event: PtpEvent, onClose: () => void): ReactNode {
  return (
    <div className="ptp-modal-backdrop" onClick={onClose}>
      <div
        className="ptp-modal-card"
        role="dialog"
        aria-modal="true"
        aria-label={event.title}
        onClick={(domEvent) => domEvent.stopPropagation()}
      >
        <h2 className="ptp-modal-title">{event.title}</h2>
        {renderClose(onClose)}
        <PartyBadge colorToken={event.category} label={event.categoryLabel} />
        {detailRows(event)}
      </div>
    </div>
  );
}

/**
 * `<EventModal>` — the interactive Event Detail overlay.
 *
 * Portaled to `document.body` so the Pillar 3 z-scale
 * (`--z-overlay` 40 backdrop / `--z-modal` 50 card) rules the stacking
 * context instead of the timeline grid. Closes on Escape, backdrop
 * click, or the Teal-hover close button; clicks inside the card are
 * stopped. Closed (`open === false`) renders nothing at all — no
 * hidden chrome in the DOM.
 *
 * @example
 * ```tsx
 * <EventModal event={modal.selectedEvent!} open={modal.isOpen} onClose={modal.close} />
 * ```
 */
export function EventModal({ event, open, onClose }: EventModalProps) {
  // Escape closes — a document-level listener, cleaned up on unmount and
  // whenever the modal closes, so it never leaks across toggles.
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (domEvent: KeyboardEvent): void => {
      if (domEvent.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(renderOverlay(event, onClose), document.body);
}
