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
export declare function CommandPalette({ commands, open, onClose, onOpen, }: CommandPaletteProps): import("react").ReactPortal | null;
export default CommandPalette;
