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
import type { CSSProperties, ReactNode } from "react";
import { Icon, type IconName } from "./primitives.js";

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
export function CarouselItem({ className, children }: CarouselItemProps) {
  return (
    <div className={className !== undefined ? `ptp-carousel__item ${className}` : "ptp-carousel__item"}>
      {children}
    </div>
  );
}

export interface CarouselProps {
  /** The accessible name for the scroll region (role="region"). */
  label?: string;
  /**
   * 3.0.0 — THE MODE. "free-scroll" (default) is the historical snap
   * strip: every child is a content-width snap unit, Prev/Next advance
   * ONE ITEM, dots are one per child, and the active index syncs
   * through an IntersectionObserver (majority-visible item = active —
   * 3.0.0 replaces the old scrollLeft/itemWidth scroll math). "paged-3"
   * chunks the children into pages of THREE (pure math: ceil(n / 3))
   * and renders each page as ONE snap unit — a `repeat(3, 1fr)` grid
   * with the 16px gap (css: .ptp-carousel__page); Prev/Next advance
   * ±1 PAGE, dots are one per PAGE, the indicator reads "p / P".
   */
  mode?: "paged-3" | "free-scroll";
  /** The items — must already be `<CarouselItem>` elements. */
  children?: ReactNode;
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
export function Carousel({ label, mode = "free-scroll", children }: CarouselProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const [page, setPage] = useState(1);
  // Read ONCE per instance — no listener, no re-render churn.
  const reduceMotion = useRef<boolean>(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const items = Children.toArray(children);
  const paged = mode === "paged-3";
  const stride = paged ? 3 : 1;
  const pageCount = Math.max(1, Math.ceil(items.length / stride));

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  // THE INTERSECTION OBSERVER (3.0.0, free-scroll): observe the items,
  // majority-visible wins. Ratios land in a Map keyed by item index;
  // each callback picks the highest ≥ 0.5. This replaces the scroll
  // math the indicator used to run — the track's own scroll handler
  // only serves paged-3's page sync now.
  useEffect(() => {
    if (paged || typeof IntersectionObserver === "undefined") return;
    const track = trackRef.current;
    if (track === null) return;
    const ratios = new Map<number, number>();
    const itemElements = Array.from(track.querySelectorAll(":scope > .ptp-carousel__item"));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = itemElements.indexOf(entry.target as Element);
          if (index !== -1) ratios.set(index, entry.intersectionRatio);
        }
        let best = -1;
        let bestRatio = 0;
        for (const [index, ratio] of ratios) {
          if (ratio >= 0.5 && ratio > bestRatio) {
            best = index;
            bestRatio = ratio;
          }
        }
        if (best !== -1) setPage(best + 1);
      },
      { root: track, threshold: [0.5, 0.75, 1] },
    );
    for (const el of itemElements) observer.observe(el);
    return () => observer.disconnect();
  }, [paged, items.length]);

  const itemWidthOf = (track: HTMLDivElement): number => {
    const first = track.firstElementChild;
    const width =
      first instanceof HTMLElement ? first.getBoundingClientRect().width : 0;
    return width > 0 ? width : track.clientWidth;
  };

  const scrollToIndex = (index: number): void => {
    const track = trackRef.current;
    if (track === null) return;
    const left = paged ? index * track.clientWidth : index * itemWidthOf(track);
    track.scrollTo({ left, behavior: reduceMotion.current ? "auto" : "smooth" });
  };

  const scrollByItem = (direction: -1 | 1): void => {
    // paged-3 strides PAGE-wise; free-scroll strides item-wise.
    const next = Math.min(pageCount, Math.max(1, page + direction));
    scrollToIndex(next - 1);
  };

  // THE PAGE TRACKER (paged-3) — rAF-throttled: coalesce the per-pixel
  // scroll events into one state write per frame. The page formula is
  // stride math: Math.round(scrollLeft / track.clientWidth) + 1.
  const handleScroll = (): void => {
    if (!paged) return;
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const track = trackRef.current;
      if (track === null) return;
      setPage(
        Math.min(pageCount, Math.round(track.scrollLeft / track.clientWidth) + 1),
      );
    });
  };

  return (
    <div className={paged ? "ptp-carousel ptp-carousel--paged" : "ptp-carousel"}>
      <div
        className="ptp-carousel__track"
        ref={trackRef}
        tabIndex={0}
        role="region"
        aria-label={label}
        onScroll={handleScroll}
      >
        {paged
          ? // Pages of three: chunk ONCE, render each page as ONE snap
            // slide (width 100%); the page owns the 3-up grid + gap.
            Array.from({ length: pageCount }, (_, pageIdx) => (
              <div
                key={pageIdx}
                className="ptp-carousel__page"
                style={{ flex: "0 0 100%" }}
              >
                {items.slice(pageIdx * 3, pageIdx * 3 + 3)}
              </div>
            ))
          : children}
      </div>
      {/* THE DOCKED CONTROL BAR (3.0.0): prev · dots · indicator · next.
          The "1 / N" readout is bar-docked metadata — never overlapping
          card content. */}
      <div className="ptp-carousel__controls">
        <button
          type="button"
          className="ptp-carousel__btn"
          aria-label="Previous"
          onClick={() => scrollByItem(-1)}
        >
          <Icon name="ChevronLeft" aria-hidden />
        </button>
        {items.length > 0 && (
          <div className="ptp-carousel__dots">
            {Array.from({ length: pageCount }, (_, index) => (
              <button
                key={index}
                type="button"
                className="ptp-carousel__dot"
                data-active={index === page - 1 ? "true" : "false"}
                aria-label={paged ? `Go to page ${index + 1}` : `Go to item ${index + 1}`}
                onClick={() => scrollToIndex(index)}
              />
            ))}
          </div>
        )}
        <span className="ptp-carousel__indicator" aria-live="polite">
          {page} / {pageCount}
        </span>
        <button
          type="button"
          className="ptp-carousel__btn"
          aria-label="Next"
          onClick={() => scrollByItem(1)}
        >
          <Icon name="ChevronRight" aria-hidden />
        </button>
      </div>
    </div>
  );
}

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
export function ProseBlock({ className, children }: ProseBlockProps) {
  return (
    <div className={className !== undefined ? `ptp-prose ${className}` : "ptp-prose"}>
      {children}
    </div>
  );
}

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
 * Variant → strip token, INLINE as `--status` for css/editorial.css's
 * `border-left: 4px solid var(--status)` — the css/toast.css +
 * css/data.css mechanism. info/warning keep the party content map
 * (sky/peach); announcement lifts to the structural Flamingo — the
 * release note speaks in the house voice (owner spec, 2.4.1).
 */
const ANNOUNCEMENT_VARIABLE: Record<AnnouncementVariant, string> = {
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
const ANNOUNCEMENT_ICONS: Record<AnnouncementVariant, IconName> = {
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
export function AnnouncementBanner({
  variant = "announcement",
  icon,
  action,
  dismissible = false,
  onDismiss,
  children,
}: AnnouncementBannerProps) {
  const resolvedIcon: IconName = icon ?? ANNOUNCEMENT_ICONS[variant];
  return (
    <div
      className="ptp-announcement"
      role="status"
      style={{ "--status": ANNOUNCEMENT_VARIABLE[variant] } as CSSProperties}
    >
      <span className="ptp-announcement__icon">
        <Icon name={resolvedIcon} aria-hidden />
      </span>
      <span className="ptp-announcement__text">{children}</span>
      {action !== undefined && (
        <button
          type="button"
          className="ptp-announcement__action"
          onClick={() => action.onClick()}
        >
          {action.label}
        </button>
      )}
      {dismissible && (
        <button
          type="button"
          aria-label="Dismiss"
          className="ptp-announcement__close"
          onClick={() => onDismiss?.()}
        >
          <Icon name="X" aria-hidden />
        </button>
      )}
    </div>
  );
}
