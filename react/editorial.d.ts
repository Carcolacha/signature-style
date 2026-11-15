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
import type { ReactNode } from "react";
import { type IconName } from "./primitives.js";
/**
 * Props for `<CarouselItem>` — the required child wrapper of a
 * `<Carousel>`. Children of `<Carousel>` must ALREADY be
 * `.sig-carousel__item` elements (the track styles snap/flex them);
 * this helper is the one-line way to produce them.
 */
export interface CarouselItemProps {
    /** Passthrough for composing (e.g. a min-width modifier). */
    className?: string;
    /** The item content — rendered inside the snap slot. */
    children?: ReactNode;
}
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
export declare function CarouselItem({ className, children }: CarouselItemProps): import("react").JSX.Element;
export interface CarouselProps {
    /** The accessible name for the scroll region (role="region"). */
    label?: string;
    /**
     * 3.0.0 — THE MODE; 3.6.0 rebuilds paged-3 as TRUE PAGE GRIDS.
     * "free-scroll" (default) is the historical snap strip: every child is
     * a content-width snap unit, Prev/Next advance ONE ITEM, dots are one
     * per child, and the active index syncs through an
     * IntersectionObserver (majority-visible item = active). "paged-3"
     * chunks the children into pages of THREE (pure math: ceil(n / 3))
     * and renders a STATEFUL PAGE DECK — one `.sig-carousel__page` grid
     * (repeat(3, minmax(0, 1fr)), 16px gap, stretch) visible at a time;
     * non-current page wrappers carry `hidden` + `inert` (the inert
     * sweep: off-screen pages leave both the a11y tree and the tab
     * order), dots are ONE PER PAGE, Prev/Next step pages and disable at
     * the bounds, the indicator reads "Page p of P", and ←/→ (focus
     * anywhere inside the carousel) flip pages.
     */
    mode?: "paged-3" | "free-scroll";
    /** The items — must already be `<CarouselItem>` elements. */
    children?: ReactNode;
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
 * 3.7.0 THE DIRECTIONAL GLIDE: paged mode records its travel direction
 * and the incoming page glides in from that edge (±24px + opacity,
 * var(--dur-glide) var(--ease-glide), css/editorial.css); free-scroll
 * keeps its native snap. Reduced motion: pages appear in place.
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
export declare function Carousel({ label, mode, children }: CarouselProps): import("react").JSX.Element;
export interface ProseBlockProps {
    /** Passthrough for composing on the container. */
    className?: string;
    /** The editorial content — styled as descendants (see css). */
    children?: ReactNode;
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
export declare function ProseBlock({ className, children }: ProseBlockProps): import("react").JSX.Element;
/**
 * The three announcement moods (2.4.1 — replaces the 2.4.0 status
 * union). announcement is the DEFAULT: a banner that isn't info or
 * warning IS an announcement — the house voice, Flamingo banner.
 */
export type AnnouncementVariant = "info" | "warning" | "announcement";
/** The 2.4.1 call-to-action slot: a small ghost button after the text. */
export interface AnnouncementBannerAction {
    /** The visible button text. */
    label: string;
    /** Called when the button is clicked. */
    onClick: () => void;
}
export interface AnnouncementBannerProps {
    /**
     * The mood — info → `--sig-sky`, warning → `--sig-peach`,
     * announcement (default) → `--color-cake-primary` (the Flamingo
     * banner: a release note is the house voice). Rendered INLINE as
     * `--status`; css/editorial.css paints the 4px left rule from it.
     */
    variant?: AnnouncementVariant;
    /**
     * Override the mood's default icon (info → "Info", warning →
     * "TriangleExclamationPoint", announcement → "Megaphone" — all
     * gate-probed against the LIVE lucide map; this future-major map
     * spells the warning triangle "TriangleExclamationPoint", not
     * "TriangleAlert", the "Music" lesson again). Must be a real
     * lucide key — the IconName contract makes a typo a compile error.
     */
    icon?: IconName;
    /**
     * The call-to-action (2.4.1) — rendered as a small ghost button
     * AFTER the text (token-driven hairline border, Teal hover), before
     * the optional dismiss close. Omit for a plain announcement strip.
     */
    action?: AnnouncementBannerAction;
    /** Renders the ghost close button (aria-label "Dismiss"). */
    dismissible?: boolean;
    /** Called when the close button is clicked. Hiding is YOUR state. */
    onDismiss?: () => void;
    /** The announcement text. */
    children?: ReactNode;
}
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
export declare function AnnouncementBanner({ variant, icon, action, dismissible, onDismiss, children, }: AnnouncementBannerProps): import("react").JSX.Element;
