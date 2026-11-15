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
 * (info/warning → chromatic tokens; announcement → the Flamingo banner —
 * a release note is the house voice, so it wears the structural
 * signature). Everything else in this file is structural chrome:
 * hairline borders, inset wells, Flamingo/Teal only. EXCEPTION (owner
 * override, 2.4.1): the ProseBlock quote rule wears `--sig-mauve` —
 * a blockquote IS editorial content, so a chromatic token on it is the
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
 * `<CarouselItem>` — ONE `<div class="sig-carousel__item">`. The snap
 * slot: `flex: 0 0 auto` + `scroll-snap-align: start` come from
 * css/editorial.css; width is content-driven (compose a min-width to
 * control the scroll rhythm).
 *
 * @example
 * ```tsx
 * <Carousel label="Clippings">
 *   <CarouselItem><SigBadge colorToken="--sig-sky" label="Sky" /></CarouselItem>
 *   <CarouselItem><SigBadge colorToken="--sig-peach" label="Peach" /></CarouselItem>
 * </Carousel>
 * ```
 */
export function CarouselItem({ className, children }) {
    return (_jsx("div", { className: className !== undefined ? `sig-carousel__item ${className}` : "sig-carousel__item", children: children }));
}
/**
 * `<Carousel>` — the horizontal strip (3.0.0: TWO MODES; 3.6.0: the
 * paged mode is a TRUE 3×3 page deck).
 *
 * THE ANATOMY — a full-width stage on top, and BELOW it one
 * `.sig-carousel__controls` flex row: prev · dots · indicator · next.
 * The readout never overlaps card content — it lives in its own bar.
 *
 * free-scroll (DEFAULT — the historical behavior): every child is a
 * content-width snap unit (`flex: 0 0 auto` + scroll-snap-align), the
 * chevrons scrollBy ±ONE ITEM WIDTH, dots are one per child and
 * clickable (`scrollTo({ left: index * itemWidth })`), and the active
 * index syncs through an IntersectionObserver — the track's items are
 * observed and the MAJORITY-VISIBLE item (intersectionRatio ≥ 0.5,
 * highest wins) is the active dot.
 *
 * paged-3 (3.6.0 REBUILD — the owner's "true 3-per-page grids" spec):
 * the children chunk into PAGES OF THREE (`pageCount = ceil(n / 3)`)
 * rendered as a STATEFUL PAGE DECK — a page-index state, not a scroll
 * track. Every page wrapper renders as a `.sig-carousel__page` grid
 * (`repeat(3, minmax(0, 1fr))`, 16px gap, `align-items: stretch` for
 * equal heights; collapses to `1fr` under a 640px container); exactly
 * one is visible (conditional `hidden`), and the non-current wrappers
 * also carry `inert` (React 18 has no inert prop — the ref callback
 * workaround; React 19 could take `inert={...}` directly) so Tab never
 * lands in an off-screen page. Prev/Next step ±1 page and DISABLE at
 * the bounds; dots are ONE PER PAGE (never per item in paged mode) and
 * clickable; the indicator reads "Page p of P" in tabular-nums; ←/→
 * (captured on the root, so focus may rest on any control inside) flip
 * pages too.
 *
 * ZERO-DEPENDENCY MOTION: free-scroll scrolling uses `behavior:
 * "smooth"` unless the visitor prefers reduced motion — matchMedia is
 * read ONCE per component instance. The IO is disconnected on unmount.
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
    const [page, setPage] = useState(1);
    // Read ONCE per instance — no listener, no re-render churn.
    const reduceMotion = useRef(typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const items = Children.toArray(children);
    const paged = mode === "paged-3";
    const pageCount = Math.max(1, Math.ceil(items.length / 3));
    // The clamped current page (item-count changes can shrink the deck).
    const current = Math.min(page, pageCount);
    // THE INTERSECTION OBSERVER (free-scroll): observe the items,
    // majority-visible wins. Ratios land in a Map keyed by item index;
    // each callback picks the highest ≥ 0.5.
    useEffect(() => {
        if (paged || typeof IntersectionObserver === "undefined")
            return;
        const track = trackRef.current;
        if (track === null)
            return;
        const ratios = new Map();
        const itemElements = Array.from(track.querySelectorAll(":scope > .sig-carousel__item"));
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
    /** paged-3 — the stateful page step (the deck's ONLY mover). */
    const goToPage = (next) => {
        setPage(Math.min(pageCount, Math.max(1, next)));
    };
    /** free-scroll — scroll to the item at `index` (0-based). */
    const scrollToIndex = (index) => {
        const track = trackRef.current;
        if (track === null)
            return;
        track.scrollTo({ left: index * itemWidthOf(track), behavior: reduceMotion.current ? "auto" : "smooth" });
    };
    const scrollByItem = (direction) => {
        scrollToIndex(Math.min(items.length, Math.max(1, current + direction)) - 1);
    };
    // paged-3 — ←/→ flip pages when focus rests anywhere inside the
    // carousel (the dots and the chevrons included).
    const handleKeyDown = (event) => {
        if (!paged)
            return;
        if (event.key === "ArrowRight") {
            event.preventDefault();
            goToPage(current + 1);
        }
        else if (event.key === "ArrowLeft") {
            event.preventDefault();
            goToPage(current - 1);
        }
    };
    return (_jsxs("div", { className: paged ? "sig-carousel sig-carousel--paged" : "sig-carousel", onKeyDown: handleKeyDown, children: [paged ? (
            // THE PAGE DECK (3.6.0): every page renders (stable DOM), ONE is
            // visible; the non-current wrappers carry hidden + inert so
            // their content leaves the a11y tree AND the tab order.
            _jsx("div", { className: "sig-carousel__stage", role: "group", "aria-label": label, children: Array.from({ length: pageCount }, (_, pageIdx) => {
                    const isCurrent = pageIdx === current - 1;
                    return (_jsx("div", { className: "sig-carousel__page", hidden: !isCurrent, ref: (el) => {
                            if (el !== null)
                                el.inert = !isCurrent;
                        }, children: items.slice(pageIdx * 3, pageIdx * 3 + 3) }, pageIdx));
                }) })) : (_jsx("div", { className: "sig-carousel__track", ref: trackRef, tabIndex: 0, role: "region", "aria-label": label, children: children })), _jsxs("div", { className: "sig-carousel__controls", children: [_jsx("button", { type: "button", className: "sig-carousel__btn", "aria-label": "Previous", disabled: paged && current <= 1, onClick: () => (paged ? goToPage(current - 1) : scrollByItem(-1)), children: _jsx(Icon, { name: "ChevronLeft", "aria-hidden": true }) }), items.length > 0 && (_jsx("div", { className: "sig-carousel__dots", children: Array.from({ length: paged ? pageCount : items.length }, (_, index) => (_jsx("button", { type: "button", className: "sig-carousel__dot", "data-active": index === current - 1 ? "true" : "false", "aria-label": paged ? `Go to page ${index + 1}` : `Go to item ${index + 1}`, onClick: () => (paged ? goToPage(index + 1) : scrollToIndex(index)) }, index))) })), _jsx("span", { className: "sig-carousel__indicator", "aria-live": "polite", children: paged ? `Page ${current} of ${pageCount}` : `${current} / ${Math.max(items.length, 1)}` }), _jsx("button", { type: "button", className: "sig-carousel__btn", "aria-label": "Next", disabled: paged && current >= pageCount, onClick: () => (paged ? goToPage(current + 1) : scrollByItem(1)), children: _jsx(Icon, { name: "ChevronRight", "aria-hidden": true }) })] })] }));
}
/**
 * `<ProseBlock>` — the editorial slot (2.4.0).
 *
 * ONE `<div class="sig-prose">`, NO props beyond className passthrough —
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
    return (_jsx("div", { className: className !== undefined ? `sig-prose ${className}` : "sig-prose", children: children }));
}
/**
 * Variant → strip token, INLINE as `--status` for css/editorial.css's
 * `border-left: 4px solid var(--status)` — the css/toast.css +
 * css/data.css mechanism. info/warning keep the chromatic content map
 * (sky/peach); announcement lifts to the structural Flamingo — the
 * release note speaks in the house voice (owner spec, 2.4.1).
 */
const ANNOUNCEMENT_VARIABLE = {
    info: "var(--sig-sky)",
    warning: "var(--sig-peach)",
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
 * `<div class="sig-announcement" role="status">` (the live-region
 * contract: a banner that announces itself politely on mount — unlike
 * `<Callout>`'s static role="note") with `--status` set INLINE from
 * the variant map → `<span class="sig-announcement__icon">` (the
 * variant's icon, tinted `var(--status)`) → `<span
 * class="sig-announcement__text">` → the optional `action` ghost
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
    return (_jsxs("div", { className: "sig-announcement", role: "status", style: { "--status": ANNOUNCEMENT_VARIABLE[variant] }, children: [_jsx("span", { className: "sig-announcement__icon", children: _jsx(Icon, { name: resolvedIcon, "aria-hidden": true }) }), _jsx("span", { className: "sig-announcement__text", children: children }), action !== undefined && (_jsx("button", { type: "button", className: "sig-announcement__action", onClick: () => action.onClick(), children: action.label })), dismissible && (_jsx("button", { type: "button", "aria-label": "Dismiss", className: "sig-announcement__close", onClick: () => onDismiss?.(), children: _jsx(Icon, { name: "X", "aria-hidden": true }) }))] }));
}
