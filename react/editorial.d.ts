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
import type { ReactNode } from "react";
import { type IconName } from "./primitives.js";
/**
 * Props for `<CarouselItem>` — the required child wrapper of a
 * `<Carousel>`. Children of `<Carousel>` must ALREADY be
 * `.ptp-carousel__item` elements (the track styles snap/flex them);
 * this helper is the one-line way to produce them.
 */
export interface CarouselItemProps {
    /** Passthrough for composing (e.g. a min-width modifier). */
    className?: string;
    /** The item content — rendered inside the snap slot. */
    children?: ReactNode;
}
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
export declare function CarouselItem({ className, children }: CarouselItemProps): import("react").JSX.Element;
export interface CarouselProps {
    /** The accessible name for the scroll region (role="region"). */
    label?: string;
    /** The items — must already be `<CarouselItem>` elements. */
    children?: ReactNode;
}
/**
 * `<Carousel>` — the horizontal scroll strip.
 *
 * FOUR justified elements (the mechanics + the position readout, none
 * decorative): `<div class="ptp-carousel">` → the previous button
 * (ghost, ChevronLeft) → `<div class="ptp-carousel__track"
 * tabIndex={0} role="region" aria-label={label}>` (the scroll
 * container; keyboard focusable so arrow-key/scroll scrolling needs no
 * button) → `<span class="ptp-carousel__indicator" aria-live="polite">`
 * (2.4.1: "n / count", mono tabular-nums — the scroll position made
 * legible; aria-live polite so scroll users hear the page turn without
 * a focus grab) → the next button (ChevronRight). Buttons scroll by
 * ONE ITEM WIDTH via ref (`scrollBy({ left: ±itemWidth, behavior })`);
 * css scroll-snap-type: x mandatory re-snaps to the nearest item start,
 * so the stride is exact. Reduced motion → `behavior: "auto"`
 * (matchMedia read once). The indicator tracks the native scroll event,
 * rAF-throttled (one state write per frame), with the owner-spec'd
 * index formula `Math.round(scrollLeft / itemWidth) + 1`.
 *
 * @example
 * ```tsx
 * <Carousel label="Palette clippings">
 *   <CarouselItem>…</CarouselItem>
 * </Carousel>
 * ```
 */
export declare function Carousel({ label, children }: CarouselProps): import("react").JSX.Element;
export interface ProseBlockProps {
    /** Passthrough for composing on the container. */
    className?: string;
    /** The editorial content — styled as descendants (see css). */
    children?: ReactNode;
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
     * The mood — info → `--party-sky`, warning → `--party-peach`,
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
export declare function AnnouncementBanner({ variant, icon, action, dismissible, onDismiss, children, }: AnnouncementBannerProps): import("react").JSX.Element;
