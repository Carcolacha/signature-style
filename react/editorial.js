import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
 * `<Carousel>` — the horizontal scroll strip (3.0.0: TWO MODES).
 *
 * THE 3.0.0 ANATOMY — the mechanics move to a DOCKED CONTROL BAR: the
 * track rides on top (full width, never squeezed between buttons), and
 * BELOW it one `.ptp-carousel__controls` flex row: prev · dots ·
 * indicator ("1 / N", aria-live polite) · next. The readout never
 * overlaps card content — it lives in its own bar.
 *
 * free-scroll (DEFAULT — the historical behavior): every child is a
 * content-width snap unit (`flex: 0 0 auto` + scroll-snap-align), the
 * chevrons scrollBy ±ONE ITEM WIDTH, dots are one per child and
 * clickable (`scrollTo({ left: index * itemWidth })`). 3.0.0 UPGRADE:
 * the active-index sync is an IntersectionObserver — the track's items
 * are observed and the MAJORITY-VISIBLE item (intersectionRatio ≥ 0.5,
 * highest wins) is the active dot. The old per-pixel scroll math is
 * gone; the track's scroll handler now only drives the paged mode.
 *
 * paged-3: the children are chunked into PAGES OF THREE (pure math:
 * pageCount = ceil(count / 3)) and each page renders as ONE snap unit
 * — a `.ptp-carousel__page` slide wearing the 100% width and the
 * `repeat(3, 1fr)` grid with the 16px gap (css/editorial.css). The
 * chevrons advance ±1 PAGE (`scrollTo(page × track.clientWidth)`),
 * dots are one per page, and the indicator reads "p / P" (pages). The
 * active page syncs from the track's scroll event, rAF-throttled (one
 * state write per frame), with the page formula
 * `Math.round(scrollLeft / track.clientWidth) + 1`.
 *
 * ZERO-DEPENDENCY MOTION: scrolling uses `behavior: "smooth"` unless
 * the visitor prefers reduced motion — matchMedia is read ONCE per
 * component instance. The IO is disconnected on unmount; the pending
 * rAF frame is cancelled on unmount.
 *
 * @example
 * ```tsx
 * <Carousel label="Palette clippings" mode="paged-3">
 *   <CarouselItem>…</CarouselItem>
 *   <CarouselItem>…</CarouselItem>
 *   <CarouselItem>…</CarouselItem>
 * </Carousel>
 * ```
 */
export function Carousel({ label, mode = "free-scroll", children }) {
    const trackRef = useRef(null);
    const frameRef = useRef(null);
    const [page, setPage] = useState(1);
    // Read ONCE per instance — no listener, no re-render churn.
    const reduceMotion = useRef(typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const items = Children.toArray(children);
    const paged = mode === "paged-3";
    const stride = paged ? 3 : 1;
    const pageCount = Math.max(1, Math.ceil(items.length / stride));
    useEffect(() => {
        return () => {
            if (frameRef.current !== null)
                cancelAnimationFrame(frameRef.current);
        };
    }, []);
    // THE INTERSECTION OBSERVER (3.0.0, free-scroll): observe the items,
    // majority-visible wins. Ratios land in a Map keyed by item index;
    // each callback picks the highest ≥ 0.5. This replaces the scroll
    // math the indicator used to run — the track's own scroll handler
    // only serves paged-3's page sync now.
    useEffect(() => {
        if (paged || typeof IntersectionObserver === "undefined")
            return;
        const track = trackRef.current;
        if (track === null)
            return;
        const ratios = new Map();
        const itemElements = Array.from(track.querySelectorAll(":scope > .ptp-carousel__item"));
        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                const index = itemElements.indexOf(entry.target);
                if (index !== -1)
                    ratios.set(index, entry.intersectionRatio);
            }
            let best = -1;
            let bestRatio = 0;
            for (const [index, ratio] of ratios) {
                if (ratio >= 0.5 && ratio > bestRatio) {
                    best = index;
                    bestRatio = ratio;
                }
            }
            if (best !== -1)
                setPage(best + 1);
        }, { root: track, threshold: [0.5, 0.75, 1] });
        for (const el of itemElements)
            observer.observe(el);
        return () => observer.disconnect();
    }, [paged, items.length]);
    const itemWidthOf = (track) => {
        const first = track.firstElementChild;
        const width = first instanceof HTMLElement ? first.getBoundingClientRect().width : 0;
        return width > 0 ? width : track.clientWidth;
    };
    const scrollToIndex = (index) => {
        const track = trackRef.current;
        if (track === null)
            return;
        const left = paged ? index * track.clientWidth : index * itemWidthOf(track);
        track.scrollTo({ left, behavior: reduceMotion.current ? "auto" : "smooth" });
    };
    const scrollByItem = (direction) => {
        // paged-3 strides PAGE-wise; free-scroll strides item-wise.
        const next = Math.min(pageCount, Math.max(1, page + direction));
        scrollToIndex(next - 1);
    };
    // THE PAGE TRACKER (paged-3) — rAF-throttled: coalesce the per-pixel
    // scroll events into one state write per frame. The page formula is
    // stride math: Math.round(scrollLeft / track.clientWidth) + 1.
    const handleScroll = () => {
        if (!paged)
            return;
        if (frameRef.current !== null)
            return;
        frameRef.current = requestAnimationFrame(() => {
            frameRef.current = null;
            const track = trackRef.current;
            if (track === null)
                return;
            setPage(Math.min(pageCount, Math.round(track.scrollLeft / track.clientWidth) + 1));
        });
    };
    return (_jsxs("div", { className: paged ? "ptp-carousel ptp-carousel--paged" : "ptp-carousel", children: [_jsx("div", { className: "ptp-carousel__track", ref: trackRef, tabIndex: 0, role: "region", "aria-label": label, onScroll: handleScroll, children: paged
                    ? // Pages of three: chunk ONCE, render each page as ONE snap
                        // slide (width 100%); the page owns the 3-up grid + gap.
                        Array.from({ length: pageCount }, (_, pageIdx) => (_jsx("div", { className: "ptp-carousel__page", style: { flex: "0 0 100%" }, children: items.slice(pageIdx * 3, pageIdx * 3 + 3) }, pageIdx)))
                    : children }), _jsxs("div", { className: "ptp-carousel__controls", children: [_jsx("button", { type: "button", className: "ptp-carousel__btn", "aria-label": "Previous", onClick: () => scrollByItem(-1), children: _jsx(Icon, { name: "ChevronLeft", "aria-hidden": true }) }), items.length > 0 && (_jsx("div", { className: "ptp-carousel__dots", children: Array.from({ length: pageCount }, (_, index) => (_jsx("button", { type: "button", className: "ptp-carousel__dot", "data-active": index === page - 1 ? "true" : "false", "aria-label": paged ? `Go to page ${index + 1}` : `Go to item ${index + 1}`, onClick: () => scrollToIndex(index) }, index))) })), _jsxs("span", { className: "ptp-carousel__indicator", "aria-live": "polite", children: [page, " / ", pageCount] }), _jsx("button", { type: "button", className: "ptp-carousel__btn", "aria-label": "Next", onClick: () => scrollByItem(1), children: _jsx(Icon, { name: "ChevronRight", "aria-hidden": true }) })] })] }));
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
