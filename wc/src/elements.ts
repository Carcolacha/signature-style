/**
 * elements.ts — the six zero-react Signature Style custom elements
 * (3.4.0 "Zero-React Native Web Components").
 *
 * Every element is the attribute-driven twin of its React counterpart,
 * styled INSIDE its shadow root by a string that mirrors the package
 * css/ anatomy byte-for-byte in spirit: same tokens (100% var() +
 * color-mix, zero hex), same radii, same spacing — and the SAME e1
 * treaty: the sanctioned ambient elevation shadows appear ONLY on the
 * surface-card's inner `.card` element (the shadow mirror of the
 * surface.css sanction); every other element is flat.
 *
 * TOKENS PREREQUISITE: the --sig-* and structural custom properties are
 * NOT shipped by the elements — link the tokens stylesheet once
 * (`@edwyn/signature-style/css`) and the values inherit through every
 * shadow boundary (custom properties inherit; shadows don't block them).
 *
 * Elements (attribute → React prop map):
 *   <sig-surface-card eyebrow meta title accent-token elevation interactive>
 *     ← <SurfaceCard eyebrow meta title accentToken elevation interactive>
 *   <sig-badge label variant? accent-token?>        ← <SigBadge colorToken label>
 *   <sig-progress-bar value max?=100 label? limit-text? accent-token?>
 *                                                   ← <ProgressBar value colorToken label limitText>
 *   <sig-stat-ring value total? unit? size?=120 accent-token? show-value?>
 *                                                   ← <StatRing value total unit size colorToken showValue>
 *   <sig-callout status?>                           ← <Callout status>
 *   <sig-carousel mode?="free">                     ← <Carousel mode> (free | paged)
 */
import { SigElement } from "./base.js";

/* ---- shared helpers -------------------------------------------------------- */

/** Parse a boolean attribute: present and not "false" = true. */
function boolAttr(value: string | null): boolean {
  return value !== null && value !== "false";
}

/** Parse a numeric attribute with a fallback (NaN guards included). */
function numAttr(value: string | null, fallback: number): number {
  if (value === null) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Clamp to a range. */
function clamp(value: number, min: number, number_max: number): number {
  return Math.min(number_max, Math.max(min, value));
}

/** The canonical mono stack (css/viz.css caption family). */
const FONT_MONO = 'var(--font-mono, ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace)';

/** The reduced-motion escape — honored INSIDE shadow sheets. */
const REDUCED_MOTION = `
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition: none !important;
    animation: none !important;
    scroll-behavior: auto !important;
  }
}
`;

/* ---- <sig-surface-card> ---------------------------------------------------- */

/** The elevation tier (2.6.0 ladder). */
export type SigElevation = "flat" | "raised" | "floating";

/** The elevation ladder — the sanctioned ambient shadows, mirrored from
 * css/surface.css EXACTLY, and scoped here to the inner `.card` ONLY
 * (the shadow-DOM reading of the e1 sanction). */
const SURFACE_CSS = `
:host { display: block; min-width: 0; }
.card {
  background: var(--bg-surface);
  border: 1px solid color-mix(in srgb, var(--text-muted) 15%, transparent);
  border-radius: var(--radius-ui);
  padding: var(--space-section);
  display: flex;
  flex-direction: column;
  gap: var(--space-standard);
  min-width: 0;
  contain: layout style paint;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 12px 32px rgba(0, 0, 0, 0.42);
}
.card[data-elevation-equivalent="flat"] { box-shadow: none; }
.card[data-elevation-equivalent="raised"] {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 12px 32px rgba(0, 0, 0, 0.42);
}
.card[data-elevation-equivalent="floating"] {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.10),
    0 22px 52px rgba(0, 0, 0, 0.60);
}
.meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--space-tight);
}
.eyebrow {
  color: var(--color-cake-secondary);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
.card[data-accent] .eyebrow { color: var(--sig-accent); }
.path {
  font-family: ${FONT_MONO};
  color: var(--text-muted);
  font-size: 0.75rem;
}
.title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-main);
  margin: 0 0 var(--space-standard);
  padding-bottom: var(--space-tight);
  border-bottom: 1px solid color-mix(in srgb, var(--text-muted) 10%, transparent);
}
.card[data-accent] .title { border-bottom: 2px solid var(--sig-accent); }
:host([interactive]) .card {
  transition:
    transform var(--transition-transform),
    box-shadow var(--transition-standard);
}
:host([interactive]) .card:hover {
  transform: translateY(-2px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 16px 40px rgba(0, 0, 0, 0.5);
}
:host([interactive]) .card[data-elevation-equivalent="flat"]:hover {
  transform: translateY(-2px);
  box-shadow: none;
}
:host([interactive]) .card[data-elevation-equivalent="floating"]:hover {
  transform: translateY(-4px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.10),
    0 22px 52px rgba(0, 0, 0, 0.60);
}
:host([interactive]) .card[data-accent]:hover {
  transform: translateY(-2px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 16px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px color-mix(in srgb, var(--sig-accent) 35%, transparent),
    0 8px 32px color-mix(in srgb, var(--sig-accent) 18%, transparent);
}
:host([interactive]) .card[data-accent][data-elevation-equivalent="floating"]:hover {
  transform: translateY(-4px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.10),
    0 22px 52px rgba(0, 0, 0, 0.60),
    0 0 0 1px color-mix(in srgb, var(--sig-accent) 35%, transparent),
    0 8px 32px color-mix(in srgb, var(--sig-accent) 18%, transparent);
}
slot { display: block; }
${REDUCED_MOTION}
`;

/**
 * `<sig-surface-card>` — the shadow twin of `<SurfaceCard>`. The body
 * content is a default `<slot>`; the meta row + ruled title are
 * attribute-driven. The elevation ladder shadows live ONLY on `.card`
 * (data-elevation-equivalent mirrors the host's `elevation` attribute).
 */
export class SigSurfaceCard extends SigElement {
  static get observedAttributes(): string[] {
    return ["eyebrow", "meta", "title", "accent-token", "elevation", "interactive"];
  }

  constructor() {
    super();
    this.adoptStyles(SURFACE_CSS);
  }

  /** @returns The shadow anatomy: meta row + ruled title + content slot. */
  protected override buildAnatomy(): HTMLElement {
    const card = document.createElement("section");
    card.className = "card";
    const accent = this.getAttribute("accent-token");
    if (accent !== null) {
      card.setAttribute("data-accent", "");
      // The react SurfaceCard contract: the variable carries the RESOLVED
      // color (`var(--sig-peach)`), never the bare token name.
      card.style.setProperty("--sig-accent", `var(${accent})`);
    }
    const elevation = this.getAttribute("elevation");
    card.setAttribute("data-elevation-equivalent", elevation ?? "raised");

    const meta = document.createElement("div");
    meta.className = "meta";
    const eyebrow = document.createElement("span");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = this.getAttribute("eyebrow") ?? "";
    const path = document.createElement("span");
    path.className = "path";
    path.textContent = this.getAttribute("meta") ?? "";
    if (eyebrow.textContent !== "" || path.textContent !== "") meta.append(eyebrow, path);

    const title = document.createElement("h2");
    title.className = "title";
    title.textContent = this.getAttribute("title") ?? "";

    const slot = document.createElement("slot");

    card.append(meta, title, slot);
    return card;
  }
}

/* ---- <sig-badge> ----------------------------------------------------------- */

/** The variant → token map (content colors only — the RoE holds). */
const BADGE_VARIANTS: Readonly<Record<string, string>> = {
  peach: "--sig-peach",
  sky: "--sig-sky",
  green: "--sig-green",
  cobalt: "--sig-cobalt",
  lavender: "--sig-lavender",
  "mauve-soft": "--sig-mauve-soft",
  "pink-bright": "--sig-pink-bright",
  yellow: "--sig-yellow",
  orchid: "--sig-orchid",
};

/** A badge variant name (a key of BADGE_VARIANTS). */
export type SigBadgeVariant = keyof typeof BADGE_VARIANTS;

/** The pill — flat by law (zero box-shadow anywhere in this sheet). */
const BADGE_CSS = `
:host { display: inline-flex; }
.pill {
  display: inline-flex;
  align-items: center;
  padding: var(--space-tight) var(--space-standard);
  border-radius: var(--radius-ui);
  font-weight: 500;
  font-size: 0.75rem;
  line-height: 1;
  color: var(--text-main);
  background: color-mix(in srgb, var(--sig-accent, var(--text-muted)) 18%, transparent);
  border: 1px solid color-mix(in srgb, var(--sig-accent, var(--text-muted)) 45%, transparent);
}
${REDUCED_MOTION}
`;

/**
 * `<sig-badge>` — the pill twin of `<SigBadge>`. The token comes from
 * `accent-token` (a literal `--sig-*` name) or `variant` (a content
 * color name from the frozen map); without either the pill goes
 * neutral (muted hairline + well).
 */
export class SigBadge extends SigElement {
  static get observedAttributes(): string[] {
    return ["label", "variant", "accent-token"];
  }

  constructor() {
    super();
    this.adoptStyles(BADGE_CSS);
  }

  /** @returns The token the pill paints with (accent-token wins). */
  #token(): string {
    const accent = this.getAttribute("accent-token");
    if (accent !== null && accent !== "") return accent;
    const variant = this.getAttribute("variant");
    if (variant !== null && variant in BADGE_VARIANTS) {
      return BADGE_VARIANTS[variant] ?? "--text-muted";
    }
    return "--text-muted";
  }

  /** @returns The flat pill: one span, the label text. */
  protected override buildAnatomy(): HTMLElement {
    const pill = document.createElement("span");
    pill.className = "pill";
    pill.style.setProperty("--sig-accent", `var(${this.#token()})`);
    pill.textContent = this.getAttribute("label") ?? "";
    return pill;
  }
}

/* ---- <sig-progress-bar> ---------------------------------------------------- */

/** Track + fill + caption — mirrors css/viz.css .sig-progress. */
const PROGRESS_CSS = `
:host { display: block; }
.track {
  height: 8px;
  border-radius: var(--radius-ui);
  background: var(--bg-inset);
  border: 1px solid color-mix(in srgb, var(--text-muted) 20%, transparent);
  overflow: hidden;
}
.fill {
  height: 100%;
  border-radius: inherit;
  transition: width 0.3s ease-out;
}
.caption {
  font-family: ${FONT_MONO};
  font-variant-numeric: tabular-nums;
  color: var(--text-muted);
  font-size: 0.75rem;
  margin-top: var(--space-tight);
}
${REDUCED_MOTION}
`;

/**
 * `<sig-progress-bar>` — the track twin of `<ProgressBar>`. The host
 * carries the progressbar ARIA contract (role + valuenow recomputed on
 * every `value` change); the fill width animates with the
 * owner-mandated physics (width 0.3s ease-out).
 */
export class SigProgressBar extends SigElement {
  static get observedAttributes(): string[] {
    return ["value", "max", "label", "limit-text", "accent-token"];
  }

  constructor() {
    super();
    this.adoptStyles(PROGRESS_CSS);
  }

  /** @returns The clamped percent the fill paints. */
  #percent(): number {
    const max = Math.max(numAttr(this.getAttribute("max"), 100), 1);
    const value = numAttr(this.getAttribute("value"), 0);
    return clamp((value / max) * 100, 0, 100);
  }

  /** @returns track + fill + optional limit caption. */
  protected override buildAnatomy(): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "wrap";

    const track = document.createElement("div");
    track.className = "track";
    const fill = document.createElement("div");
    fill.className = "fill";
    const accent = this.getAttribute("accent-token");
    fill.style.background = `var(${accent ?? "--sig-cobalt"})`;
    fill.style.width = `${this.#percent()}%`;
    track.appendChild(fill);

    wrap.appendChild(track);

    const limitText = this.getAttribute("limit-text");
    if (limitText !== null) {
      const caption = document.createElement("div");
      caption.className = "caption";
      caption.textContent = limitText;
      wrap.appendChild(caption);
    }

    // The ARIA contract rides the HOST (visible to AT without shadow
    // traversal): role + min/max/now recomputed on every value change.
    this.setAttribute("role", "progressbar");
    this.setAttribute("aria-valuemin", "0");
    this.setAttribute("aria-valuemax", "100");
    this.setAttribute("aria-valuenow", String(Math.round(this.#percent())));
    const label = this.getAttribute("label");
    if (label !== null) this.setAttribute("aria-label", label);
    return wrap;
  }
}

/* ---- <sig-stat-ring> ------------------------------------------------------- */

/** The ring geometry constants (react/viz.tsx StatRing, viewBox 0 0 100 100). */
const RING_RADIUS = 44;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** Pure SVG in the shadow: track + arc + boundary hairline + readout. */
const RING_CSS = `
:host { display: inline-block; }
.dial { display: block; }
.dial > svg { display: block; width: 100%; height: 100%; }
.arc { transition: stroke-dashoffset 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
.readout {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  fill: var(--text-main);
}
${REDUCED_MOTION}
`;

/**
 * `<sig-stat-ring>` — the SVG twin of `<StatRing>`: the track circle in
 * var(--bg-inset), the progress arc in the accent token, the boundary
 * hairline OVER the ink, and the centered tabular readout. A `value`
 * attribute change animates stroke-dashoffset (the transition lives in
 * this shadow sheet; the reduced-motion escape kills it on request).
 */
export class SigStatRing extends SigElement {
  static get observedAttributes(): string[] {
    return ["value", "total", "unit", "size", "accent-token", "show-value", "label"];
  }

  constructor() {
    super();
    this.adoptStyles(RING_CSS);
  }

  /** @returns The clamped percent (total present → value is the part). */
  #percent(): number {
    const value = numAttr(this.getAttribute("value"), 0);
    const total = this.getAttribute("total");
    if (total === null) return clamp(value, 0, 100);
    const denominator = Math.max(numAttr(total, 0), 1);
    return clamp((value / denominator) * 100, 0, 100);
  }

  /** @returns The centered readout text ("85%" default; unit overrides). */
  #readout(): string {
    if (!boolAttr(this.getAttribute("show-value") ?? "true")) return "";
    const unit = this.getAttribute("unit") ?? "%";
    return `${Math.round(this.#percent())}${unit}`;
  }

  /** @returns The SVG dial: hairline boundary over track over arc + text. */
  protected override buildAnatomy(): HTMLElement {
    const size = Math.max(numAttr(this.getAttribute("size"), 120), 16);
    const percent = this.#percent();
    const strokeWidthUnits = (8 / size) * 100;

    const dial = document.createElement("div");
    dial.className = "dial";
    dial.style.width = `${size}px`;
    dial.style.height = `${size}px`;

    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-hidden", "true");

    const hairline = document.createElementNS(NS, "circle");
    hairline.setAttribute("cx", "50");
    hairline.setAttribute("cy", "50");
    hairline.setAttribute("r", "47.5");
    hairline.setAttribute("fill", "none");
    hairline.setAttribute("stroke", "color-mix(in srgb, var(--text-muted) 20%, transparent)");
    hairline.setAttribute("stroke-width", "1.5");

    const track = document.createElementNS(NS, "circle");
    track.setAttribute("cx", "50");
    track.setAttribute("cy", "50");
    track.setAttribute("r", String(RING_RADIUS));
    track.setAttribute("fill", "none");
    track.setAttribute("stroke", "var(--bg-inset)");
    track.setAttribute("stroke-width", String(strokeWidthUnits));

    const accent = this.getAttribute("accent-token");
    const arc = document.createElementNS(NS, "circle");
    arc.setAttribute("class", "arc");
    arc.setAttribute("cx", "50");
    arc.setAttribute("cy", "50");
    arc.setAttribute("r", String(RING_RADIUS));
    arc.setAttribute("fill", "none");
    arc.setAttribute("stroke", `var(${accent ?? "--sig-cobalt"})`);
    arc.setAttribute("stroke-width", String(strokeWidthUnits));
    arc.setAttribute("stroke-linecap", "round");
    arc.setAttribute("stroke-dasharray", String(RING_CIRCUMFERENCE));
    arc.setAttribute("stroke-dashoffset", String(RING_CIRCUMFERENCE * (1 - percent / 100)));
    arc.setAttribute("transform", "rotate(-90 50 50)");

    const text = document.createElementNS(NS, "text");
    text.setAttribute("class", "readout");
    text.setAttribute("x", "50");
    text.setAttribute("y", "50");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "central");
    text.setAttribute("font-size", "14");
    text.textContent = this.#readout();

    svg.append(hairline, track, arc, text);
    dial.appendChild(svg);

    // The ARIA contract on the host: progressbar + valuenow.
    // 3.6.0 a11y: a progressbar REQUIRES an accessible name (axe
    // aria-progressbar-name) — the `label` attribute mirrors the
    // SigProgressBar contract (label → aria-label on the host).
    this.setAttribute("role", "progressbar");
    this.setAttribute("aria-valuemin", "0");
    this.setAttribute("aria-valuemax", "100");
    this.setAttribute("aria-valuenow", String(Math.round(percent)));
    const ringLabel = this.getAttribute("label");
    if (ringLabel !== null) this.setAttribute("aria-label", ringLabel);
    return dial;
  }
}

/* ---- <sig-callout> --------------------------------------------------------- */

/** The status → token map (react/data.tsx Callout: the --status contract). */
const CALLOUT_STATUSES: Readonly<Record<string, string>> = {
  info: "--sig-sky",
  success: "--sig-green",
  warning: "--sig-peach",
};

/** A callout status name. */
export type SigCalloutStatus = keyof typeof CALLOUT_STATUSES;

/** The persistent note — flat, 4px status strip, inset well. */
const CALLOUT_CSS = `
:host { display: block; }
.callout {
  border-left: 4px solid var(--sig-accent, var(--sig-sky));
  background: var(--bg-inset);
  border-radius: var(--radius-ui);
  padding: var(--space-standard);
  color: var(--text-main);
  font-size: 0.875rem;
}
.callout[status="info"] { border-left-color: var(--sig-sky); }
${REDUCED_MOTION}
`;

/**
 * `<sig-callout>` — the persistent note twin of `<Callout>` (role note,
 * no close button, never auto-dismisses): a 4px left strip — info →
 * --sig-sky, success → --sig-green, warning → --sig-peach — over the
 * inset well, with the body content slotted.
 */
export class SigCallout extends SigElement {
  static get observedAttributes(): string[] {
    return ["status"];
  }

  constructor() {
    super();
    this.adoptStyles(CALLOUT_CSS);
  }

  /** @returns The note: the status strip + the slotted body. */
  protected override buildAnatomy(): HTMLElement {
    this.setAttribute("role", "note");
    const note = document.createElement("div");
    note.className = "callout";
    const status = this.getAttribute("status");
    const token = status !== null && status in CALLOUT_STATUSES
      ? CALLOUT_STATUSES[status] ?? "--sig-sky"
      : "--sig-sky";
    note.style.setProperty("--sig-accent", `var(${token})`);
    note.setAttribute("status", status ?? "info");
    const slot = document.createElement("slot");
    note.appendChild(slot);
    return note;
  }
}

/* ---- <sig-carousel> -------------------------------------------------------- */

/** The scroll strip + docked control bar — mirrors css/editorial.css. */
const CAROUSEL_CSS = `
:host { display: block; }
.track {
  display: flex;
  gap: var(--space-standard);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  padding-bottom: var(--space-tight);
}
.track::-webkit-scrollbar { display: none; }
.track:focus-visible {
  outline: 1px solid color-mix(in srgb, var(--color-cake-secondary) 60%, transparent);
  outline-offset: 2px;
}
::slotted(*) {
  flex: 0 0 auto;
  scroll-snap-align: start;
}
.controls {
  display: flex;
  align-items: center;
  gap: var(--space-standard);
  margin-top: var(--space-tight);
}
.ghost {
  appearance: none;
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--text-muted) 20%, transparent);
  border-radius: var(--radius-ui);
  color: var(--text-main);
  font: inherit;
  font-size: 0.875rem;
  padding: var(--space-tight) var(--space-standard);
  cursor: pointer;
}
.ghost:hover { background: var(--bg-inset); }
.ghost:disabled { opacity: 0.4; cursor: default; }
.dots { display: flex; gap: var(--space-tight); }
.dot {
  appearance: none;
  width: 8px;
  height: 8px;
  padding: 0;
  border-radius: 50%;
  border: 1px solid color-mix(in srgb, var(--text-muted) 45%, transparent);
  background: transparent;
  cursor: pointer;
}
.dot[aria-current="true"] {
  background: var(--color-cake-secondary);
  border-color: var(--color-cake-secondary);
}
.indicator {
  font-family: ${FONT_MONO};
  font-variant-numeric: tabular-nums;
  color: var(--text-muted);
  font-size: 0.75rem;
  margin-left: auto;
}
${REDUCED_MOTION}
`;

/**
 * `<sig-carousel>` — the scroll-strip twin of `<Carousel>`. Light-DOM
 * children slot into a scroll-snap track; N comes from the slotchange
 * event (assigned element count). `mode="paged"` advances one TRACK
 * WIDTH per Prev/Next; the default "free" advances one ITEM. Dots are
 * one per item and clickable; the "1 / N" indicator is tabular-nums and
 * aria-live polite. The track is keyboard-reachable (tabIndex 0,
 * Arrow keys drive the buttons).
 */
export class SigCarousel extends SigElement {
  static get observedAttributes(): string[] {
    return ["mode", "label"];
  }

  /** The assigned light-DOM items (element nodes only). */
  #items: Element[] = [];

  /** The active index (majority-visible item). */
  #index = 0;

  /** @returns "paged" | "free". */
  get #mode(): "paged" | "free" {
    return this.getAttribute("mode") === "paged" ? "paged" : "free";
  }

  /** @returns The smooth-scroll behavior (reduced motion → auto). */
  get #scrollBehavior(): ScrollBehavior {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  }

  constructor() {
    super();
    this.adoptStyles(CAROUSEL_CSS);
  }

  /** @returns The full anatomy: track + slot, then the control bar. */
  protected override buildAnatomy(): HTMLElement {
    const wrap = document.createElement("div");
    wrap.setAttribute("role", "region");
    wrap.setAttribute("aria-roledescription", "carousel");

    const track = document.createElement("div");
    track.className = "track";
    track.tabIndex = 0;
    track.setAttribute("aria-label", this.getAttribute("label") ?? "carousel items");
    const slot = document.createElement("slot");
    slot.addEventListener("slotchange", () => this.#onSlotChange(slot, track));
    track.appendChild(slot);
    track.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") { event.preventDefault(); this.#advance(1, track); }
      if (event.key === "ArrowLeft") { event.preventDefault(); this.#advance(-1, track); }
    });
    wrap.appendChild(track);

    wrap.appendChild(this.#controls(track));
    return wrap;
  }

  /**
   * The docked control bar: prev · dots · next · "1 / N" indicator.
   *
   * @param track The scroll track the buttons drive.
   * @returns The controls row (dots rebuilt from #items).
   */
  #controls(track: HTMLElement): HTMLElement {
    const controls = document.createElement("div");
    controls.className = "controls";

    const prev = document.createElement("button");
    prev.type = "button";
    prev.className = "ghost";
    prev.textContent = "‹ Prev";
    // WCAG 2.5.3 (axe label-content-name-mismatch): the accessible name
    // must CONTAIN the visible text — the description rides AFTER it.
    prev.setAttribute("aria-label", "‹ Prev — previous items");
    prev.addEventListener("click", () => this.#advance(-1, track));

    const dots = document.createElement("div");
    dots.className = "dots";
    dots.setAttribute("aria-label", "carousel dots");
    this.#items.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "dot";
      dot.setAttribute("aria-label", `go to item ${index + 1}`);
      dot.setAttribute("aria-current", index === this.#index ? "true" : "false");
      dot.addEventListener("click", () => this.#scrollToIndex(index, track));
      dots.appendChild(dot);
    });

    const next = document.createElement("button");
    next.type = "button";
    next.className = "ghost";
    next.textContent = "Next ›";
    // WCAG 2.5.3: same contract as the Prev button — visible text first.
    next.setAttribute("aria-label", "Next › — next items");
    next.addEventListener("click", () => this.#advance(1, track));

    const indicator = document.createElement("span");
    indicator.className = "indicator";
    indicator.setAttribute("aria-live", "polite");
    indicator.textContent = `${this.#index + 1} / ${Math.max(this.#items.length, 1)}`;

    controls.append(prev, dots, next, indicator);
    return controls;
  }

  /**
   * slotchange: recount the assigned nodes, rebuild the control bar.
   *
   * @param slot The anatomy slot.
   * @param track The scroll track (kept for the control bar wiring).
   */
  #onSlotChange(slot: HTMLSlotElement, track: HTMLElement): void {
    this.#items = slot
      .assignedNodes({ flatten: true })
      .filter((node): node is Element => node.nodeType === Node.ELEMENT_NODE);
    const anatomy = this.shadowRoot?.querySelector("[data-sig-root]");
    if (anatomy === null) return;
    const controls = anatomy.querySelector(".controls");
    if (controls !== null) controls.replaceWith(this.#controls(track));
    this.#observeItems(track);
  }

  /**
   * IntersectionObserver sync — the majority-visible item is active.
   *
   * @param track The scroll track (the IO root).
   */
  #observeItems(track: HTMLElement): void {
    if (typeof IntersectionObserver === "undefined" || this.#items.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        let bestIndex = -1;
        let bestRatio = 0;
        entries.forEach((entry) => {
          const index = this.#items.indexOf(entry.target);
          if (index >= 0 && entry.intersectionRatio > bestRatio) {
            bestIndex = index;
            bestRatio = entry.intersectionRatio;
          }
        });
        if (bestIndex >= 0 && bestRatio >= 0.5 && bestIndex !== this.#index) {
          this.#setIndex(bestIndex, track);
        }
      },
      { root: track, threshold: [0.5] },
    );
    this.#items.forEach((item) => observer.observe(item));
  }

  /**
   * Advance by one item (free) or one track width (paged).
   *
   * @param direction -1 = previous, 1 = next.
   * @param track The scroll track.
   */
  #advance(direction: -1 | 1, track: HTMLElement): void {
    const behavior = this.#scrollBehavior;
    if (this.#mode === "paged") {
      track.scrollBy({ left: direction * track.clientWidth, behavior });
      return;
    }
    const step = (this.#items[0]?.getBoundingClientRect().width ?? track.clientWidth)
      + parseFloat(getComputedStyle(track).columnGap || "0");
    track.scrollBy({ left: direction * step, behavior });
  }

  /**
   * Jump the track to a dot's item.
   *
   * @param index The item index.
   * @param track The scroll track.
   */
  #scrollToIndex(index: number, track: HTMLElement): void {
    const step = (this.#items[0]?.getBoundingClientRect().width ?? track.clientWidth)
      + parseFloat(getComputedStyle(track).columnGap || "0");
    track.scrollTo({ left: index * step, behavior: this.#scrollBehavior });
    this.#setIndex(index, track);
  }

  /**
   * Sync the active dot + the "1 / N" indicator.
   *
   * @param index The active item index.
   * @param track The scroll track (for locating the controls row).
   */
  #setIndex(index: number, track: HTMLElement): void {
    this.#index = index;
    const anatomy = this.shadowRoot?.querySelector("[data-sig-root]");
    if (anatomy === null) return;
    anatomy.querySelectorAll(".dot").forEach((dot, dotIndex) => {
      dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
    });
    const indicator = anatomy.querySelector(".indicator");
    if (indicator !== null) {
      indicator.textContent = `${index + 1} / ${Math.max(this.#items.length, 1)}`;
    }
    void track;
  }
}
