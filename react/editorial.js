import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * editorial — editorial primitives (2.4.0 "Form Wrappers & Editorial
 * Primitives").
 *
 * Three flat components wired to the styles in css/editorial.css:
 * `<Carousel>`, `<ProseBlock>`, `<AnnouncementBanner>`.
 *
 * JUSTIFIED WRAPPERS (documented per component): `<Carousel>` renders
 * track + two scroll buttons — the buttons ARE the mechanics (keyboard
 * users scroll the track directly; it is focusable), so the wrapper
 * count is exactly three and none is decorative. `<ProseBlock>` is the
 * opposite of a wrapper problem: it is ONE div that is a pure
 * typography container (the editorial slot — styled DESCENDANTS, no
 * props beyond className passthrough). `<AnnouncementBanner>` mirrors
 * the toast/callout mechanism: status → `--party-*` set INLINE as
 * `--status`, css reads it for the 4px left strip.
 *
 * RULE OF ENGAGEMENT: the banner's status strip is a CONTENT outcome
 * (info/success/warning), so party tokens are correct — the same map
 * as `<Callout>` (info → sky, success → green, warning → peach).
 * Everything else in this file is structural chrome: hairline borders,
 * inset wells, Flamingo/Teal only.
 *
 * ZERO-DEPENDENCY MOTION: the carousel buttons scroll with
 * `behavior: "smooth"` unless the visitor prefers reduced motion —
 * matchMedia is read ONCE per component instance (a ref, not a
 * listener; a live toggle mid-session is a nicety, not a contract).
 * css/editorial.css separately kills its own transitions under
 * prefers-reduced-motion.
 */
import { useRef } from "react";
import { Icon } from "./primitives.js";
/**
 * `<CarouselItem>` — ONE `<div class="ptp-carousel__item">`. The snap
 * slot: `flex: 0 0 auto` + `scroll-snap-align: start` come from
 * css/editorial.css; width is content-driven (compose a min-width to
 * control the scroll rhythm).
 *
 * @example
 * ```tsx
 * <Carousel label="Clippings">
 *   <CarouselItem><PartyBadge colorToken="--party-sky" label="Sky" /></CarouselItem>
 *   <CarouselItem><PartyBadge colorToken="--party-peach" label="Peach" /></CarouselItem>
 * </Carousel>
 * ```
 */
export function CarouselItem({ className, children }) {
    return (_jsx("div", { className: className !== undefined ? `ptp-carousel__item ${className}` : "ptp-carousel__item", children: children }));
}
/**
 * `<Carousel>` — the horizontal scroll strip.
 *
 * THREE justified elements (the mechanics, none decorative):
 * `<div class="ptp-carousel">` → the previous button (ghost,
 * ChevronLeft) → `<div class="ptp-carousel__track" tabIndex={0}
 * role="region" aria-label={label}>` (the scroll container; keyboard
 * focusable so arrow-key/scroll scrolling needs no button) → the next
 * button (ChevronRight). Buttons scroll by ONE ITEM WIDTH via ref
 * (`scrollBy({ left: ±itemWidth, behavior })`); css scroll-snap-type:
 * x mandatory re-snaps to the nearest item start, so the stride is
 * exact. Reduced motion → `behavior: "auto"` (matchMedia read once).
 *
 * @example
 * ```tsx
 * <Carousel label="Palette clippings">
 *   <CarouselItem>…</CarouselItem>
 * </Carousel>
 * ```
 */
export function Carousel({ label, children }) {
    const trackRef = useRef(null);
    // Read ONCE per instance — no listener, no re-render churn.
    const reduceMotion = useRef(typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const scrollByItem = (direction) => {
        const track = trackRef.current;
        if (track === null)
            return;
        const first = track.firstElementChild;
        const itemWidth = first instanceof HTMLElement
            ? first.getBoundingClientRect().width
            : track.clientWidth;
        track.scrollBy({
            left: direction * itemWidth,
            behavior: reduceMotion.current ? "auto" : "smooth",
        });
    };
    return (_jsxs("div", { className: "ptp-carousel", children: [_jsx("button", { type: "button", className: "ptp-carousel__btn", "aria-label": "Previous", onClick: () => scrollByItem(-1), children: _jsx(Icon, { name: "ChevronLeft", "aria-hidden": true }) }), _jsx("div", { className: "ptp-carousel__track", ref: trackRef, tabIndex: 0, role: "region", "aria-label": label, children: children }), _jsx("button", { type: "button", className: "ptp-carousel__btn", "aria-label": "Next", onClick: () => scrollByItem(1), children: _jsx(Icon, { name: "ChevronRight", "aria-hidden": true }) })] }));
}
/**
 * `<ProseBlock>` — the editorial slot (2.4.0).
 *
 * ONE `<div class="ptp-prose">`, NO props beyond className passthrough —
 * a pure typography container. css/editorial.css styles its
 * DESCENDANTS: `p` (0.875rem / 1.6 line-height), `blockquote` (inset
 * well, 4px Flamingo left rule, italic bright ink), `footer`/`cite`
 * (mono muted attribution line). You bring the markup; the block makes
 * it read. That is the whole contract — no variants, no sizes, no
 * knobs (the editorial slot, not a rich-text component).
 *
 * @example
 * ```tsx
 * <ProseBlock>
 *   <p>First paragraph…</p>
 *   <blockquote><p>“The quote.”</p><footer>— someone</footer></blockquote>
 *   <cite>Source, vol. 2</cite>
 * </ProseBlock>
 * ```
 */
export function ProseBlock({ className, children }) {
    return (_jsx("div", { className: className !== undefined ? `ptp-prose ${className}` : "ptp-prose", children: children }));
}
/**
 * Status → strip token, INLINE as `--status` for css/editorial.css's
 * `border-left: 4px solid var(--status)` — the css/toast.css +
 * css/data.css mechanism, and the SAME party map as `<Callout>`.
 */
const ANNOUNCEMENT_VARIABLE = {
    info: "var(--party-sky)",
    success: "var(--party-green)",
    warning: "var(--party-peach)",
};
/**
 * `<AnnouncementBanner>` — the full-width announcement strip (2.4.0).
 *
 * `<div class="ptp-announcement" role="status">` (the live-region
 * contract: a banner that announces itself politely on mount — unlike
 * `<Callout>`'s static role="note") → `<span class="ptp-announcement__icon">`
 * (Megaphone, tinted `var(--status)`) → `<span
 * class="ptp-announcement__text">` → optional ghost close (the
 * modal-close signature: muted, Teal hover). Dismissal is YOUR state —
 * the component never unmounts itself.
 *
 * @example
 * ```tsx
 * <AnnouncementBanner status="info" dismissible onDismiss={hide}>
 *   v2.4.0 — six new editorial & form primitives shipped.
 * </AnnouncementBanner>
 * ```
 */
export function AnnouncementBanner({ status = "info", dismissible = false, onDismiss, children, }) {
    return (_jsxs("div", { className: "ptp-announcement", role: "status", style: { "--status": ANNOUNCEMENT_VARIABLE[status] }, children: [_jsx("span", { className: "ptp-announcement__icon", children: _jsx(Icon, { name: "Megaphone", "aria-hidden": true }) }), _jsx("span", { className: "ptp-announcement__text", children: children }), dismissible && (_jsx("button", { type: "button", "aria-label": "Dismiss", className: "ptp-announcement__close", onClick: () => onDismiss?.(), children: _jsx(Icon, { name: "X", "aria-hidden": true }) }))] }));
}
