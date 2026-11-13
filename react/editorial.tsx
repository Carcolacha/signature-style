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
import type { CSSProperties, ReactNode } from "react";
import { Icon } from "./primitives.js";

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
  /** The items — must already be `<CarouselItem>` elements. */
  children?: ReactNode;
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
export function Carousel({ label, children }: CarouselProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  // Read ONCE per instance — no listener, no re-render churn.
  const reduceMotion = useRef<boolean>(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const scrollByItem = (direction: -1 | 1): void => {
    const track = trackRef.current;
    if (track === null) return;
    const first = track.firstElementChild;
    const itemWidth =
      first instanceof HTMLElement
        ? first.getBoundingClientRect().width
        : track.clientWidth;
    track.scrollBy({
      left: direction * itemWidth,
      behavior: reduceMotion.current ? "auto" : "smooth",
    });
  };

  return (
    <div className="ptp-carousel">
      <button
        type="button"
        className="ptp-carousel__btn"
        aria-label="Previous"
        onClick={() => scrollByItem(-1)}
      >
        <Icon name="ChevronLeft" aria-hidden />
      </button>
      <div
        className="ptp-carousel__track"
        ref={trackRef}
        tabIndex={0}
        role="region"
        aria-label={label}
      >
        {children}
      </div>
      <button
        type="button"
        className="ptp-carousel__btn"
        aria-label="Next"
        onClick={() => scrollByItem(1)}
      >
        <Icon name="ChevronRight" aria-hidden />
      </button>
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

/** The three announcement moods — each maps to its `--party-*` strip token. */
export type AnnouncementStatus = "info" | "success" | "warning";

export interface AnnouncementBannerProps {
  /** The mood — info → sky, success → green, warning → peach (inline --status). */
  status?: AnnouncementStatus;
  /** Renders the ghost close button (aria-label "Dismiss"). */
  dismissible?: boolean;
  /** Called when the close button is clicked. Hiding is YOUR state. */
  onDismiss?: () => void;
  /** The announcement text. */
  children?: ReactNode;
}

/**
 * Status → strip token, INLINE as `--status` for css/editorial.css's
 * `border-left: 4px solid var(--status)` — the css/toast.css +
 * css/data.css mechanism, and the SAME party map as `<Callout>`.
 */
const ANNOUNCEMENT_VARIABLE: Record<AnnouncementStatus, string> = {
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
export function AnnouncementBanner({
  status = "info",
  dismissible = false,
  onDismiss,
  children,
}: AnnouncementBannerProps) {
  return (
    <div
      className="ptp-announcement"
      role="status"
      style={{ "--status": ANNOUNCEMENT_VARIABLE[status] } as CSSProperties}
    >
      <span className="ptp-announcement__icon">
        <Icon name="Megaphone" aria-hidden />
      </span>
      <span className="ptp-announcement__text">{children}</span>
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
