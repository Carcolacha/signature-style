/**
 * toast — <ToastProvider> + useToast(), the feedback layer (1.4.0
 * "Input & Feedback Layer").
 *
 * Architecture: the same portal doctrine as modal.tsx — createPortal
 * mounts ONE region div on document.body, outside any host stacking
 * context. The region wears var(--z-toast, 60) (css/toast.css): the
 * zenith rung, one above --z-modal (50) — toasts float over modals.
 *
 * THE STATUS CONTRACT: `toast("success" | "error", message)` maps the
 * status to a CSS custom property set INLINE on the toast element —
 * success → var(--party-green), error → var(--party-peach) — which
 * css/toast.css reads as the 4px `border-left: 4px solid var(--status)`
 * strip. Status is a content-outcome signal, so party tokens are the
 * sanctioned palette (Rule of Engagement); the component never hardcodes
 * a hex.
 *
 * LIFECYCLE: each toast runs the css/toast.css `toast-life` animation —
 * 3s, slide in → hold → slide out — and is removed on its `animationend`
 * (pure CSS timing; no timers in the normal path). REDUCED-MOTION
 * FALLBACK, documented per css/toast.css: under prefers-reduced-motion
 * the stylesheet sets `animation: none`, so animationend NEVER fires and
 * a motion-free toast would otherwise live forever. Each toast therefore
 * also carries a 3s timeout with the SAME duration as a safety net.
 * Removal is idempotent (filter by id) — in normal motion both paths
 * race and the second is a no-op; behavior is identical.
 *
 * IDS: a module-level-free monotonic counter on a ref — SSR-safe (no
 * crypto.randomUUID, which is absent in Node < 19 and some runtimes).
 *
 * A11Y: the region is role="status" aria-live="polite" — screen readers
 * announce new toasts without interrupting. toasts are plain divs keyed
 * by id.
 */
import { type ReactNode } from "react";
/** The two outcomes a toast can report. */
export type ToastStatus = "success" | "error";
/** One queued toast — internal list entry, exposed for completeness. */
export interface ToastItem {
    /** Monotonic id from the provider's counter — the React key. */
    id: number;
    /** The outcome: paints the status strip via --status. */
    status: ToastStatus;
    /** The message body — rendered as the toast's text content. */
    message: string;
}
/** The push function handed out by {@link useToast}. */
export type ToastFn = (status: ToastStatus, message: string) => void;
/**
 * `<ToastProvider>` — mounts the toast region on document.body and hands
 * `toast(status, message)` to the tree via context.
 *
 * Wrap an app once; call `useToast()` anywhere beneath it. The region is
 * role="status" aria-live="polite", fixed bottom-right at the zenith
 * z-rung (css/toast.css). Zero dependencies beyond react/react-dom.
 *
 * @example
 * ```tsx
 * <ToastProvider>
 *   <RsvpForm />
 * </ToastProvider>
 *
 * // inside <RsvpForm>:
 * const toast = useToast();
 * toast("success", "RSVP saved");
 * toast("error", "Could not save — try again");
 * ```
 */
export declare function ToastProvider({ children }: {
    children?: ReactNode;
}): import("react").JSX.Element;
/**
 * `useToast()` — the push function: `toast(status, message)`.
 *
 * Requires a `<ToastProvider>` ancestor; throws a named error at call
 * time otherwise (fail loudly, not silently).
 *
 * @example
 * ```tsx
 * const toast = useToast();
 * <button
 *   className="btn-primary"
 *   onClick={() => toast("success", "Saved")}
 * >Save</button>
 * ```
 */
export declare function useToast(): ToastFn;
