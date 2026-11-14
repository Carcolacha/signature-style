import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * editorial — editorial primitives (2.4.0 "Form Wrappers & Editorial
 * Primitives"; 2.4.1 grows the banner variant/action API, the prose
 * mauve bar + kbd/code, and the carousel page indicator).
 *
 * Three flat components wired to the styles in css/editorial.css:
 * `<Carousel>`, `<ProseBlock>`, `<AnnouncementBanner>`.
 *
 * JUSTIFIED WRAPPERS (documented per component): `<Carousel>` renders
 * track + two scroll buttons + the page indicator — the buttons ARE the
 * mechanics (keyboard users scroll the track directly; it is
 * focusable) and the indicator is the scroll position made legible
 * ("n / count", aria-live polite), so the wrapper count is exactly
 * four and none is decorative. `<ProseBlock>` is the opposite of a
 * wrapper problem: it is ONE div that is a pure typography container
 * (the editorial slot — styled DESCENDANTS, no props beyond className
 * passthrough). `<AnnouncementBanner>` mirrors the toast/callout
 * mechanism: variant → `--status` set INLINE (css reads it for the 4px
 * left strip).
 *
 * RULE OF ENGAGEMENT: the banner's strip is a CONTENT outcome
 * (info/warning → party tokens; announcement → the Flamingo banner —
 * a release note is the house voice, so it wears the structural
 * signature). Everything else in this file is structural chrome:
 * hairline borders, inset wells, Flamingo/Teal only. EXCEPTION (owner
 * override, 2.4.1): the ProseBlock quote rule wears `--party-mauve` —
 * a blockquote IS editorial content, so a party token on it is the
 * Rule of Engagement read correctly (v2.4.0's Flamingo rule borrowed
 * the structural accent for content; the owner moved it).
 *
 * ZERO-DEPENDENCY MOTION: the carousel buttons scroll with
 * `behavior: "smooth"` unless the visitor prefers reduced motion —
 * matchMedia is read ONCE per component instance (a ref, not a
 * listener; a live toggle mid-session is a nicety, not a contract).
 * The page indicator updates on scroll, rAF-throttled (one state write
 * per frame — scroll events fire per-pixel). css/editorial.css
 * separately kills its own transitions under prefers-reduced-motion.
 */
import { Children, useEffect, useRef, useState } from "react";
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
 * The mechanics row (2.4.1) + the DOT INDICATORS (2.6.0): a fragment of
 * TWO siblings — `<div class="ptp-carousel">` (the previous button →
 * the `<div class="ptp-carousel__track" tabIndex={0} role="region"
 * aria-label={label}>` scroll container → the `<span
 * class="ptp-carousel__indicator" aria-live="polite">` "n / count"
 * readout → the next button) and, when children exist, `<div
 * class="ptp-carousel__dots">` below the row: one button per child,
 * the active dot tracking the SAME rAF-throttled scroll index as the
 * indicator, `[data-active="true"]` painting the Flamingo pill.
 * Dots are clickable — `scrollTo({ left: index * itemWidth })` — with
 * per-dot aria-labels ("Go to item n"). Buttons scroll by ONE ITEM
 * WIDTH via ref (`scrollBy({ left: ±itemWidth, behavior })`); css
 * scroll-snap-type: x mandatory re-snaps to the nearest item start, so
 * the stride is exact. Reduced motion → `behavior: "auto"` (matchMedia
 * read once). The indicator + dots track the native scroll event,
 * rAF-throttled (one state write per frame), with the owner-spec'd
 * index formula `Math.round(scrollLeft / itemWidth) + 1`. The track's
 * scrollbar is hidden (css: scrollbar-width none + webkit display
 * none) — the dots ARE the position affordance.
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
    const frameRef = useRef(null);
    const [page, setPage] = useState(1);
    // Read ONCE per instance — no listener, no re-render churn.
    const reduceMotion = useRef(typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const count = Children.count(children);
    useEffect(() => {
        return () => {
            if (frameRef.current !== null)
                cancelAnimationFrame(frameRef.current);
        };
    }, []);
    const itemWidthOf = (track) => {
        const first = track.firstElementChild;
        const width = first instanceof HTMLElement ? first.getBoundingClientRect().width : 0;
        return width > 0 ? width : track.clientWidth;
    };
    const scrollByItem = (direction) => {
        const track = trackRef.current;
        if (track === null)
            return;
        track.scrollBy({
            left: direction * itemWidthOf(track),
            behavior: reduceMotion.current ? "auto" : "smooth",
        });
    };
    // DOT CLICK (2.6.0): scroll straight to the item's snap offset — the
    // same reduced-motion fallback as the chevrons.
    const scrollToIndex = (index) => {
        const track = trackRef.current;
        if (track === null)
            return;
        track.scrollTo({
            left: index * itemWidthOf(track),
            behavior: reduceMotion.current ? "auto" : "smooth",
        });
    };
    // THE INDICATOR TRACKER (2.4.1) — rAF-throttled: coalesce the
    // per-pixel scroll events into one state write per frame. The index
    // formula is the owner spec: Math.round(scrollLeft / itemWidth) + 1.
    // 2.6.0: the dot indicators read the SAME page state (1-based).
    const handleScroll = () => {
        if (frameRef.current !== null)
            return;
        frameRef.current = requestAnimationFrame(() => {
            frameRef.current = null;
            const track = trackRef.current;
            if (track === null)
                return;
            setPage(Math.round(track.scrollLeft / itemWidthOf(track)) + 1);
        });
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "ptp-carousel", children: [_jsx("button", { type: "button", className: "ptp-carousel__btn", "aria-label": "Previous", onClick: () => scrollByItem(-1), children: _jsx(Icon, { name: "ChevronLeft", "aria-hidden": true }) }), _jsx("div", { className: "ptp-carousel__track", ref: trackRef, tabIndex: 0, role: "region", "aria-label": label, onScroll: handleScroll, children: children }), _jsxs("span", { className: "ptp-carousel__indicator", "aria-live": "polite", children: [page, " / ", count] }), _jsx("button", { type: "button", className: "ptp-carousel__btn", "aria-label": "Next", onClick: () => scrollByItem(1), children: _jsx(Icon, { name: "ChevronRight", "aria-hidden": true }) })] }), count > 0 && (_jsx("div", { className: "ptp-carousel__dots", children: Array.from({ length: count }, (_, index) => (_jsx("button", { type: "button", className: "ptp-carousel__dot", "data-active": index === page - 1 ? "true" : "false", "aria-label": `Go to item ${index + 1}`, onClick: () => scrollToIndex(index) }, index))) }))] }));
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
 * Variant → strip token, INLINE as `--status` for css/editorial.css's
 * `border-left: 4px solid var(--status)` — the css/toast.css +
 * css/data.css mechanism. info/warning keep the party content map
 * (sky/peach); announcement lifts to the structural Flamingo — the
 * release note speaks in the house voice (owner spec, 2.4.1).
 */
const ANNOUNCEMENT_VARIABLE = {
    info: "var(--party-sky)",
    warning: "var(--party-peach)",
    announcement: "var(--color-cake-primary)",
};
/**
 * Variant → default icon. PROBED against the installed lucide-react
 * 1.72.0 icons map at gate time: "TriangleAlert" — the name everyone
 * remembers — is NOT a key in this map ("TriangleExclamationPoint"
 * is, the AudioLines/Music lesson); a non-key renders a blank square.
 */
const ANNOUNCEMENT_ICONS = {
    info: "Info",
    warning: "TriangleExclamationPoint",
    announcement: "Megaphone",
};
/**
 * `<AnnouncementBanner>` — the full-width announcement strip (2.4.0,
 * API evolved 2.4.1).
 *
 * `<div class="ptp-announcement" role="status">` (the live-region
 * contract: a banner that announces itself politely on mount — unlike
 * `<Callout>`'s static role="note") with `--status` set INLINE from
 * the variant map → `<span class="ptp-announcement__icon">` (the
 * variant's icon, tinted `var(--status)`) → `<span
 * class="ptp-announcement__text">` → the optional `action` ghost
 * button → the optional ghost close (the modal-close signature:
 * muted, Teal hover). Dismissal is YOUR state — the component never
 * unmounts itself.
 *
 * @example
 * ```tsx
 * <AnnouncementBanner
 *   variant="announcement"
 *   action={{ label: "See what shipped", onClick: announce }}
 *   dismissible
 *   onDismiss={hide}
 * >
 *   v2.4.1 — intuitive form anatomy & the alignment fix shipped.
 * </AnnouncementBanner>
 * ```
 */
export function AnnouncementBanner({ variant = "announcement", icon, action, dismissible = false, onDismiss, children, }) {
    const resolvedIcon = icon ?? ANNOUNCEMENT_ICONS[variant];
    return (_jsxs("div", { className: "ptp-announcement", role: "status", style: { "--status": ANNOUNCEMENT_VARIABLE[variant] }, children: [_jsx("span", { className: "ptp-announcement__icon", children: _jsx(Icon, { name: resolvedIcon, "aria-hidden": true }) }), _jsx("span", { className: "ptp-announcement__text", children: children }), action !== undefined && (_jsx("button", { type: "button", className: "ptp-announcement__action", onClick: () => action.onClick(), children: action.label })), dismissible && (_jsx("button", { type: "button", "aria-label": "Dismiss", className: "ptp-announcement__close", onClick: () => onDismiss?.(), children: _jsx(Icon, { name: "X", "aria-hidden": true }) }))] }));
}
