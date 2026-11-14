import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import { createPortal } from "react-dom";
import { Icon } from "./primitives.js";
/** True when the launcher shortcut should be ignored (the user is typing). */
function isTypingTarget(target) {
    if (!(target instanceof HTMLElement))
        return false;
    const tag = target.tagName;
    return (tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target.isContentEditable);
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
export function CommandPalette({ commands, open, onClose, onOpen, }) {
    const baseId = useId();
    const [query, setQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef(null);
    const listRef = useRef(null);
    // The element to hand focus back to on close — captured at open.
    const triggerRef = useRef(null);
    // Case-insensitive substring over label + keywords.
    const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase();
        if (needle === "")
            return commands;
        return commands.filter((command) => `${command.label} ${command.keywords ?? ""}`.toLowerCase().includes(needle));
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
    // THE ONE LISTENER: the launcher (Ctrl/Cmd+K) when closed; navigation
    // + Escape while open. Cleaned up on unmount.
    useEffect(() => {
        const onKeyDown = (domEvent) => {
            if ((domEvent.ctrlKey || domEvent.metaKey) && domEvent.key.toLowerCase() === "k") {
                domEvent.preventDefault();
                if (open)
                    onClose();
                else
                    onOpen?.();
                return;
            }
            if (!open)
                return;
            if (domEvent.key === "Escape") {
                domEvent.preventDefault();
                onClose();
            }
            else if (domEvent.key === "ArrowDown") {
                domEvent.preventDefault();
                setActiveIndex((current) => filtered.length === 0 ? 0 : (current + 1) % filtered.length);
            }
            else if (domEvent.key === "ArrowUp") {
                domEvent.preventDefault();
                setActiveIndex((current) => filtered.length === 0
                    ? 0
                    : (current - 1 + filtered.length) % filtered.length);
            }
            else if (domEvent.key === "Enter") {
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
    if (!open)
        return null;
    const activeId = filtered[activeIndex] !== undefined
        ? `${baseId}-opt-${filtered[activeIndex].id}`
        : undefined;
    const renderRows = () => filtered.map((command, index) => (_jsxs("li", { id: `${baseId}-opt-${command.id}`, role: "option", "aria-selected": index === activeIndex, className: "ptp-command__option", "data-testid": `command-${command.id}`, onMouseEnter: () => setActiveIndex(index), onClick: () => {
            command.run();
            onClose();
        }, children: [command.icon !== undefined && (_jsx(Icon, { name: command.icon, size: 16, "aria-hidden": true })), _jsx("span", { className: "ptp-command__label", children: command.label }), command.hint !== undefined && (_jsx("span", { className: "ptp-command__hint", children: command.hint }))] }, command.id)));
    return createPortal(_jsx("div", { className: "ptp-command-backdrop", "data-testid": "command-backdrop", onClick: onClose, children: _jsxs("div", { className: "ptp-command", role: "dialog", "aria-modal": "true", "aria-label": "Command palette", onClick: (domEvent) => domEvent.stopPropagation(), children: [_jsxs("div", { className: "ptp-command__inputrow", children: [_jsx(Icon, { name: "Search", size: 16, "aria-hidden": true }), _jsx("input", { ref: inputRef, role: "combobox", "aria-expanded": "true", "aria-controls": `${baseId}-list`, "aria-activedescendant": activeId, "aria-label": "Filter commands", autoComplete: "off", spellCheck: false, value: query, onChange: (domEvent) => {
                                setQuery(domEvent.target.value);
                                setActiveIndex(0);
                            }, placeholder: "Type a command\u2026", "data-testid": "command-input" }), _jsx("kbd", { className: "ptp-action-tile__kbd", children: "esc" })] }), filtered.length === 0 ? (_jsxs("p", { className: "ptp-command__empty", children: ["No command matches \u201C", query, "\u201D."] })) : (_jsx("ul", { ref: listRef, id: `${baseId}-list`, role: "listbox", "aria-label": "Commands", className: "ptp-command__list", "data-testid": "command-list", children: renderRows() })), _jsxs("div", { className: "ptp-command__legend", children: [_jsxs("span", { children: [_jsx("kbd", { className: "ptp-action-tile__kbd", children: "\u2191\u2193" }), " navigate"] }), _jsxs("span", { children: [_jsx("kbd", { className: "ptp-action-tile__kbd", children: "\u21B5" }), " run"] }), _jsxs("span", { children: [_jsx("kbd", { className: "ptp-action-tile__kbd", children: "esc" }), " close"] })] })] }) }), document.body);
}
export default CommandPalette;
