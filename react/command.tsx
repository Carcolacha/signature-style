/**
 * command — <CommandPalette>, the keyboard-first launcher (2.9.0
 * "Power-User Utilities").
 *
 * Architecture: CONTROLLED — the parent owns `open` (this component owns
 * no open state); the palette registers ONE global keydown listener for
 * Ctrl+K / Cmd+K (the launcher shortcut, ignored while the focus is in
 * an input/textarea/select/contentEditable so typing never triggers it)
 * and calls `onOpen` when closed / `onClose` when open. While open the
 * same listener drives the row navigation: ArrowDown / ArrowUp move the
 * selection, Enter runs the selected command, Escape closes.
 *
 * Focus contract: at open (false → true) the palette captures
 * `document.activeElement` as the TRIGGER; on every close (Escape,
 * backdrop, or a successful run) focus is restored to it — keyboard
 * users never fall off the page.
 *
 * A11y contract (the combobox/listbox pattern): the filter input is
 * role="combobox" with aria-expanded/aria-controls/aria-activedescendant;
 * the rows are role="listbox" > role="option" with aria-selected. The
 * input is auto-focused on open. Type-to-filter is a case-insensitive
 * substring over `label` + `keywords`.
 *
 * Aesthetics (css/command.css): the modal conventions — the documented
 * neutral rgba scrim + backdrop-filter blur(8px), the --z-modal rung,
 * surface panel, hairline borders, the doctrine focus ring. ZERO
 * box-shadow (the e1 treaty: glass = scrim + border, never shadow).
 * Zero hex beyond the documented scrim. Closed renders nothing at all.
 *
 * Pruning Protocol: backdrop (div) → panel (div) → input + list. The
 * kbd chips reuse .ptp-action-tile__kbd (cards.css) instead of growing
 * a second chip anatomy.
 */

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./primitives.js";
import type { IconName } from "./primitives.js";

/** One launcher command. `run` fires on Enter / click; the palette then closes. */
export interface CommandEntry {
  /** Stable id — also the option's DOM id prefix namespace. */
  id: string;
  /** The visible row label. */
  label: string;
  /** Extra case-insensitive match text (type-to-filter). */
  keywords?: string;
  /** The muted mono hint rendered at the row's far edge. */
  hint?: string;
  /** A strict lucide icon key, rendered muted before the label. */
  icon?: IconName;
  /** The action. */
  run: () => void;
}

export interface CommandPaletteProps {
  /** The command list, filtered live by the type-to-filter box. */
  commands: CommandEntry[];
  /** Visibility flag (controlled). False renders nothing. */
  open: boolean;
  /** Called on Escape, backdrop click, close via the launcher, and after a run. */
  onClose: () => void;
  /**
   * Called when the Ctrl+K / Cmd+K launcher fires while closed — the
   * parent flips `open` (the palette never owns open state).
   */
  onOpen?: () => void;
}

/** True when the launcher shortcut should be ignored (the user is typing). */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

/**
 * `<CommandPalette>` — the keyboard-first command launcher.
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 * <CommandPalette
 *   commands={[{ id: "home", label: "Go home", run: goHome }]}
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   onOpen={() => setOpen(true)}
 * />
 * ```
 */
export function CommandPalette({
  commands,
  open,
  onClose,
  onOpen,
}: CommandPaletteProps) {
  const baseId = useId();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  // The element to hand focus back to on close — captured at open.
  const triggerRef = useRef<HTMLElement | null>(null);

  // Case-insensitive substring over label + keywords.
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle === "") return commands;
    return commands.filter((command) =>
      `${command.label} ${command.keywords ?? ""}`.toLowerCase().includes(needle),
    );
  }, [commands, query]);

  // Reset the view state at open: the box clears, the selection starts
  // at the top, and the trigger is captured for the focus restore.
  useEffect(() => {
    if (open) {
      triggerRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      setQuery("");
      setActiveIndex(0);
      inputRef.current?.focus();
    }
  }, [open]);

  // THE FOCUS RESTORE — on every close (Escape, backdrop, run, or the
  // launcher toggle) focus returns to the pre-open trigger so keyboard
  // users never fall off the page. Null trigger (initial mount, nothing
  // captured) is a no-op.
  useEffect(() => {
    if (!open && triggerRef.current !== null) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [open]);

  // THE ONE LISTENER: the launcher (Ctrl/Cmd+K) when closed — ignored
  // while the user is typing in a field; navigation + Escape while open.
  // Cleaned up on unmount.
  useEffect(() => {
    const onKeyDown = (domEvent: KeyboardEvent): void => {
      if (
        !isTypingTarget(domEvent.target) &&
        (domEvent.ctrlKey || domEvent.metaKey) &&
        domEvent.key.toLowerCase() === "k"
      ) {
        domEvent.preventDefault();
        if (open) onClose();
        else onOpen?.();
        return;
      }
      if (!open) return;
      if (domEvent.key === "Escape") {
        domEvent.preventDefault();
        onClose();
      } else if (domEvent.key === "ArrowDown") {
        domEvent.preventDefault();
        setActiveIndex((current) =>
          filtered.length === 0 ? 0 : (current + 1) % filtered.length,
        );
      } else if (domEvent.key === "ArrowUp") {
        domEvent.preventDefault();
        setActiveIndex((current) =>
          filtered.length === 0
            ? 0
            : (current - 1 + filtered.length) % filtered.length,
        );
      } else if (domEvent.key === "Enter") {
        domEvent.preventDefault();
        const selected = filtered[activeIndex];
        if (selected !== undefined) {
          selected.run();
          onClose();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, onOpen, filtered, activeIndex]);

  // Keep the active row in view and mirror it to aria-activedescendant.
  useEffect(() => {
    listRef.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, filtered]);

  if (!open) return null;

  const activeId =
    filtered[activeIndex] !== undefined
      ? `${baseId}-opt-${filtered[activeIndex].id}`
      : undefined;

  const renderRows = (): ReactNode[] =>
    filtered.map((command, index) => (
      <li
        key={command.id}
        id={`${baseId}-opt-${command.id}`}
        role="option"
        aria-selected={index === activeIndex}
        className="ptp-command__option"
        data-testid={`command-${command.id}`}
        onMouseEnter={() => setActiveIndex(index)}
        onClick={() => {
          command.run();
          onClose();
        }}
      >
        {command.icon !== undefined && (
          <Icon name={command.icon} size={16} aria-hidden />
        )}
        <span className="ptp-command__label">{command.label}</span>
        {command.hint !== undefined && (
          <span className="ptp-command__hint">{command.hint}</span>
        )}
      </li>
    ));

  return createPortal(
    <div
      className="ptp-command-backdrop"
      data-testid="command-backdrop"
      onClick={onClose}
    >
      <div
        className="ptp-command"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onClick={(domEvent) => domEvent.stopPropagation()}
      >
        <div className="ptp-command__inputrow">
          <Icon name="Search" size={16} aria-hidden />
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded="true"
            aria-controls={`${baseId}-list`}
            aria-activedescendant={activeId}
            aria-label="Filter commands"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(domEvent) => {
              setQuery(domEvent.target.value);
              setActiveIndex(0);
            }}
            placeholder="Type a command…"
            data-testid="command-input"
          />
          <kbd className="ptp-action-tile__kbd">esc</kbd>
        </div>
        {filtered.length === 0 ? (
          <p className="ptp-command__empty">No command matches “{query}”.</p>
        ) : (
          <ul
            ref={listRef}
            id={`${baseId}-list`}
            role="listbox"
            aria-label="Commands"
            className="ptp-command__list"
            data-testid="command-list"
          >
            {renderRows()}
          </ul>
        )}
        <div className="ptp-command__legend">
          <span>
            <kbd className="ptp-action-tile__kbd">↑↓</kbd> navigate
          </span>
          <span>
            <kbd className="ptp-action-tile__kbd">↵</kbd> run
          </span>
          <span>
            <kbd className="ptp-action-tile__kbd">esc</kbd> close
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default CommandPalette;
