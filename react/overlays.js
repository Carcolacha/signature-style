import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * overlays — THE DESTRUCTIVE-CONFIRMATION NORM (4.0.0 "Motion Lab
 * Rebuild, Flip/Accordion Geometry Fix, Destructive Confirm Norm &
 * Human-Crafted Blueprints").
 *
 *   <ConfirmDialog> — the ONE portal-mounted confirmation dialog every
 *     destructive action in any site built with the engine MUST route
 *     through. THE NORM (SYSTEM_PROMPT.md "Destructive Action Norm"):
 *     no delete, reset, or irreversible commit may fire on a single
 *     click — it opens a ConfirmDialog, and only the explicit confirm
 *     commits.
 *
 * THE MODAL RUNG CONTRACT (the EventModal precedent, css/modal.css):
 *   · createPortal to document.body — the dialog breaks free of any
 *     stacking context its host carries; the z-ladder values are the
 *     ONLY stacking authority (scrim var(--z-overlay, 40), card
 *     var(--z-modal, 50)).
 *   · THE SCRIM rgba exception (modal.css doctrine, mirrored): the
 *     dimming layer is rgba(0, 0, 0, 0.6) — a neutral black alpha is
 *     the correct primitive for "dim what is BEHIND me regardless of
 *     theme". The CARD carries the (bd1)-sanctioned backdrop blur —
 *     css/overlays.css joins modal.css/command.css as the sanctioned
 *     blur surfaces.
 *   · Escape = cancel (the safe close — NEVER the destructive action).
 *   · THE FOCUS TRAP: Tab cycles within the dialog (forward wraps to
 *     the first focusable, Shift+Tab wraps to the last); the CANCEL
 *     button receives focus on open (the safe default for destructive
 *     dialogs — one accidental Enter must never confirm); focus
 *     returns to the trigger on close via useFocusReturn.
 *   · aria-modal role="dialog" aria-labelledby/describedby wired from
 *     title/description; scrim click = cancel.
 *
 * THE BUTTONS: Confirm = solid var(--sig-crimson) fill + #FFFFFF ink
 * (the high-contrast destructive voice — #FFFFFF on #F22222 computes
 * 4.18:1, above the 3.1 gate floor, gated in scripts/gates-v400.mjs);
 * Cancel = the neutral surface/inset hairline. `variant` is reserved
 * ("danger" is the only value today — the norm's default voice).
 *
 * Pruning: scrim + card + the two buttons — no wrappers, no icons in
 * the css (the consumer's trigger button carries the Trash icon).
 * Zero hex beyond the two documented literals (the scrim rgba and the
 * confirm ink #FFFFFF, both owner-mandated); zero box-shadow (e1).
 */
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "./primitives.js";
/**
 * useFocusReturn(enabled) — capture document.activeElement when
 * `enabled` flips true and restore focus to it when it flips false
 * (or on unmount). ConfirmDialog passes its `open` flag: the capture
 * lands at OPEN time (the trigger the user just pressed), the restore
 * lands at CLOSE time — keyboard users are never stranded after a
 * confirm or a cancel. Mounting alone captures nothing (the preview
 * mount's activeElement is the page body, not the trigger).
 */
export function useFocusReturn(enabled) {
    const restoreRef = useRef(null);
    useEffect(() => {
        if (!enabled)
            return undefined;
        restoreRef.current =
            document.activeElement instanceof HTMLElement ? document.activeElement : null;
        return () => {
            const restore = restoreRef.current;
            if (restore !== null && restore.isConnected)
                restore.focus();
        };
    }, [enabled]);
}
/** The focusables inside the dialog card, in DOM order. */
function focusablesIn(card) {
    return Array.from(card.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter((el) => !el.hasAttribute("disabled"));
}
/**
 * `<ConfirmDialog>` — the destructive-action norm (4.0.0).
 *
 * Portal-mounted scrim + dialog card on the z-40/50 rungs (the
 * EventModal anatomy), Escape/scrim/cancel all CANCEL, Tab is trapped
 * inside the card, the cancel button takes focus on open, and focus
 * returns to the trigger on close (useFocusReturn). The confirm button
 * is the solid --sig-crimson voice; cancel is the neutral hairline.
 *
 * @example
 * ```tsx
 * const toast = useToast();
 * const [confirming, setConfirming] = useState(false);
 * <Button variant="danger" leftIcon="Trash" onClick={() => setConfirming(true)}>
 *   Delete Node
 * </Button>
 * <ConfirmDialog
 *   open={confirming}
 *   title="Delete Node?"
 *   description={'This removes "Core Engine" and all edges attached to it.'}
 *   onCancel={() => setConfirming(false)}
 *   onConfirm={() => { deleteNode(id); setConfirming(false); }}
 * />
 * ```
 */
export function ConfirmDialog({ open, title, description, confirmLabel = "Yes", cancelLabel = "No", variant = "danger", onConfirm, onCancel, }) {
    const titleId = useId();
    const descriptionId = useId();
    const cardRef = useRef(null);
    // THE FOCUS RETURN — armed on `open`: activeElement at OPEN-time is
    // the trigger; it gets focus back at CLOSE-time.
    useFocusReturn(open);
    useEffect(() => {
        if (!open)
            return;
        const card = cardRef.current;
        if (card === null)
            return undefined;
        // The safe default: focus lands on the CANCEL button (the FIRST
        // focusable in the card's DOM order — the buttons render
        // cancel-first by design) — one accidental Enter (or Space) must
        // never commit the destructive action.
        const focusables = focusablesIn(card);
        focusables[0]?.focus();
        // THE TRAP — Tab cycles inside the card; Escape cancels.
        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                event.stopPropagation();
                onCancel();
                return;
            }
            if (event.key !== "Tab")
                return;
            const cycle = focusablesIn(card);
            if (cycle.length === 0)
                return;
            const first = cycle[0];
            const last = cycle[cycle.length - 1];
            const active = document.activeElement;
            if (event.shiftKey) {
                if (active === first || active === card) {
                    event.preventDefault();
                    last.focus();
                }
            }
            else if (active === last) {
                event.preventDefault();
                first.focus();
            }
        };
        card.addEventListener("keydown", onKeyDown);
        return () => card.removeEventListener("keydown", onKeyDown);
    }, [open, onCancel]);
    if (!open)
        return null;
    return createPortal(_jsxs(_Fragment, { children: [_jsx("div", { className: "sig-confirm-scrim", "data-testid": "confirm-scrim", onClick: onCancel, "aria-hidden": "true" }), _jsxs("div", { ref: cardRef, className: "sig-confirm-card", role: "dialog", "aria-modal": "true", "aria-labelledby": titleId, "aria-describedby": description !== undefined ? descriptionId : undefined, "data-testid": "confirm-dialog", "data-variant": variant, children: [_jsx("h2", { id: titleId, className: "sig-confirm__title", children: title }), description !== undefined && (_jsx("p", { id: descriptionId, className: "sig-confirm__description", children: description })), _jsxs("div", { className: "sig-confirm__actions", children: [_jsx(Button, { variant: "secondary", size: "sm", "data-testid": "confirm-cancel", onClick: onCancel, children: cancelLabel }), _jsx(Button, { className: "sig-confirm__confirm", variant: "danger", size: "sm", "data-testid": "confirm-confirm", onClick: onConfirm, children: confirmLabel })] })] })] }), document.body);
}
