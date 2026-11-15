/**
 * ShortcutModal — THE KEYBOARD MAP (3.6.0). Opens on the "?" key
 * (when the event target is not a text-entry surface — the v2.9.0
 * isTypingTarget contract, imported from the package's graph module),
 * from the command palette's "Open Keyboard Shortcuts" command, or from
 * the Graph Studio HUD's "?" ghost button.
 *
 * THE MODAL CONVENTIONS (the Pruning Protocol — no second anatomy): the
 * package's own `.sig-modal-backdrop` scrim + `.sig-modal-close` button,
 * the z-50 modal rung via the package css; Escape and the backdrop
 * close; focus starts on the card; role="dialog" + aria-modal.
 *
 * Every shortcut wears a `<kbd class="sig-action-tile__kbd">` chip (the
 * ActionTile's mono kbd anatomy — one kbd style, zero new chrome).
 */
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@edwyn/signature-style/react";

export interface ShortcutModalProps {
  /** Closes the modal (Escape, the backdrop, or the close button). */
  readonly onClose: () => void;
}

/** One shortcut row: the kbd chip + its description. */
interface ShortcutRow {
  readonly keys: string;
  readonly description: string;
}

/** THE MAP — every shortcut the playground honors (the 8px note last). */
const SHORTCUTS: ReadonlyArray<ShortcutRow> = [
  { keys: "⌘K / Ctrl K", description: "Open or close the command palette" },
  { keys: "?", description: "Open or close this keyboard map" },
  { keys: "Space / Enter", description: "Flip a FlipCard to its back face" },
  { keys: "Delete / Backspace", description: "Unlink the selected graph edge" },
  { keys: "← / →", description: "Flip a 3-by-3 carousel page" },
  { keys: "Arrow keys", description: "Nudge the selected graph node 8px — the grid step" },
  { keys: "Esc", description: "Close this modal, the palette, or the event modal" },
  { keys: "8px", description: "Every nudge, gap and step rides the 8px grid — shortcuts included" },
];

export function ShortcutModal({ onClose }: ShortcutModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    cardRef.current?.focus();
    const onKeyDown = (domEvent: KeyboardEvent): void => {
      if (domEvent.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return createPortal(
    <div className="sig-modal-backdrop" onClick={onClose} data-testid="shortcut-modal">
      <div
        ref={cardRef}
        className="hub__shortcuts-card"
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        tabIndex={-1}
        onClick={(domEvent) => domEvent.stopPropagation()}
      >
        <div className="hub__shortcuts-row">
          <h2>Keyboard shortcuts</h2>
          <button className="sig-modal-close" type="button" aria-label="Close" onClick={onClose}>
            <Icon name="X" aria-hidden />
          </button>
        </div>
        {SHORTCUTS.map((shortcut) => (
          <div key={shortcut.keys} className="hub__shortcuts-row">
            <kbd className="sig-action-tile__kbd">{shortcut.keys}</kbd>
            <span>{shortcut.description}</span>
          </div>
        ))}
      </div>
    </div>,
    document.body,
  );
}
