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
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { Icon, type IconName } from "./primitives.js";

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
export function CarouselItem({ className, children }: CarouselItemProps) {
  return (
    <div className={className !== undefined ? `sig-carousel__item ${className}` : "sig-carousel__item"}>
      {children}
    </div>
  );
}

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
  const [page, setPage] = useState(1);
  // Read ONCE per instance — no listener, no re-render churn.
  const reduceMotion = useRef<boolean>(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const items = Children.toArray(children);
  const paged = mode === "paged-3";
  const pageCount = Math.max(1, Math.ceil(items.length / 3));
  // The clamped current page (item-count changes can shrink the deck).
  const current = Math.min(page, pageCount);

  // THE INTERSECTION OBSERVER (free-scroll): observe the items,
  // majority-visible wins. Ratios land in a Map keyed by item index;
  // each callback picks the highest ≥ 0.5.
  useEffect(() => {
    if (paged || typeof IntersectionObserver === "undefined") return;
    const track = trackRef.current;
    if (track === null) return;
    const ratios = new Map<number, number>();
    const itemElements = Array.from(track.querySelectorAll(":scope > .sig-carousel__item"));
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

  /** paged-3 — the stateful page step (the deck's ONLY mover). */
  const goToPage = (next: number): void => {
    setPage(Math.min(pageCount, Math.max(1, next)));
  };

  /** free-scroll — scroll to the item at `index` (0-based). */
  const scrollToIndex = (index: number): void => {
    const track = trackRef.current;
    if (track === null) return;
    track.scrollTo({ left: index * itemWidthOf(track), behavior: reduceMotion.current ? "auto" : "smooth" });
  };

  const scrollByItem = (direction: -1 | 1): void => {
    scrollToIndex(Math.min(items.length, Math.max(1, current + direction)) - 1);
  };

  // paged-3 — ←/→ flip pages when focus rests anywhere inside the
  // carousel (the dots and the chevrons included).
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (!paged) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToPage(current + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToPage(current - 1);
    }
  };

  return (
    <div
      className={paged ? "sig-carousel sig-carousel--paged" : "sig-carousel"}
      onKeyDown={handleKeyDown}
    >
      {paged ? (
        // THE PAGE DECK (3.6.0): every page renders (stable DOM), ONE is
        // visible; the non-current wrappers carry hidden + inert so
        // their content leaves the a11y tree AND the tab order.
        <div className="sig-carousel__stage" role="group" aria-label={label}>
          {Array.from({ length: pageCount }, (_, pageIdx) => {
            const isCurrent = pageIdx === current - 1;
            return (
              <div
                key={pageIdx}
                className="sig-carousel__page"
                hidden={!isCurrent}
                ref={(el) => {
                  if (el !== null) el.inert = !isCurrent;
                }}
              >
                {items.slice(pageIdx * 3, pageIdx * 3 + 3)}
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="sig-carousel__track"
          ref={trackRef}
          tabIndex={0}
          role="region"
          aria-label={label}
        >
          {children}
        </div>
      )}
      {/* THE DOCKED CONTROL BAR: prev · dots · indicator · next. Paged
          mode reads "Page p of P" (tabular-nums) and disables the
          chevrons at the bounds; free-scroll keeps the "1 / N" readout. */}
      <div className="sig-carousel__controls">
        <button
          type="button"
          className="sig-carousel__btn"
          aria-label="Previous"
          disabled={paged && current <= 1}
          onClick={() => (paged ? goToPage(current - 1) : scrollByItem(-1))}
        >
          <Icon name="ChevronLeft" aria-hidden />
        </button>
        {items.length > 0 && (
          <div className="sig-carousel__dots">
            {Array.from({ length: paged ? pageCount : items.length }, (_, index) => (
              <button
                key={index}
                type="button"
                className="sig-carousel__dot"
                data-active={index === current - 1 ? "true" : "false"}
                aria-label={paged ? `Go to page ${index + 1}` : `Go to item ${index + 1}`}
                onClick={() => (paged ? goToPage(index + 1) : scrollToIndex(index))}
              />
            ))}
          </div>
        )}
        <span className="sig-carousel__indicator" aria-live="polite">
          {paged ? `Page ${current} of ${pageCount}` : `${current} / ${Math.max(items.length, 1)}`}
        </span>
        <button
          type="button"
          className="sig-carousel__btn"
          aria-label="Next"
          disabled={paged && current >= pageCount}
          onClick={() => (paged ? goToPage(current + 1) : scrollByItem(1))}
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
export function ProseBlock({ className, children }: ProseBlockProps) {
  return (
    <div className={className !== undefined ? `sig-prose ${className}` : "sig-prose"}>
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
 * Variant → strip token, INLINE as `--status` for css/editorial.css's
 * `border-left: 4px solid var(--status)` — the css/toast.css +
 * css/data.css mechanism. info/warning keep the chromatic content map
 * (sky/peach); announcement lifts to the structural Flamingo — the
 * release note speaks in the house voice (owner spec, 2.4.1).
 */
const ANNOUNCEMENT_VARIABLE: Record<AnnouncementVariant, string> = {
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
const ANNOUNCEMENT_ICONS: Record<AnnouncementVariant, IconName> = {
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
      className="sig-announcement"
      role="status"
      style={{ "--status": ANNOUNCEMENT_VARIABLE[variant] } as CSSProperties}
    >
      <span className="sig-announcement__icon">
        <Icon name={resolvedIcon} aria-hidden />
      </span>
      <span className="sig-announcement__text">{children}</span>
      {action !== undefined && (
        <button
          type="button"
          className="sig-announcement__action"
          onClick={() => action.onClick()}
        >
          {action.label}
        </button>
      )}
      {dismissible && (
        <button
          type="button"
          aria-label="Dismiss"
          className="sig-announcement__close"
          onClick={() => onDismiss?.()}
        >
          <Icon name="X" aria-hidden />
        </button>
      )}
    </div>
  );
}
