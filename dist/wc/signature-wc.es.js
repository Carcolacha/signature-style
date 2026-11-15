var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var _sheet, _root, _renderQueued, _SigBadge_instances, token_fn, _SigProgressBar_instances, percent_fn, _SigStatRing_instances, percent_fn2, readout_fn, _items, _index, _SigCarousel_instances, mode_get, scrollBehavior_get, controls_fn, onSlotChange_fn, observeItems_fn, advance_fn, scrollToIndex_fn, setIndex_fn;
class SigElement extends HTMLElement {
  constructor() {
    super();
    /** The constructable stylesheet adopted by the last adoptStyles call. */
    __privateAdd(this, _sheet, null);
    /** The current anatomy root inside the shadow tree. */
    __privateAdd(this, _root, null);
    /** Whether a microtask render is already queued. */
    __privateAdd(this, _renderQueued, false);
    this.attachShadow({ mode: "open" });
  }
  /**
   * Adopt the shadow stylesheet — constructable CSSStyleSheet when the
   * engine has one (fast, document-independent), a <style> element
   * otherwise. Idempotent: a second call replaces the previous sheet.
   *
   * @param css The shadow style string (mirrors the package css/ anatomy).
   */
  adoptStyles(css) {
    const root = this.shadowRoot;
    if (typeof CSSStyleSheet === "function" && typeof CSSStyleSheet.prototype.replaceSync === "function") {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(css);
      const previous = __privateGet(this, _sheet);
      root.adoptedStyleSheets = previous !== null ? root.adoptedStyleSheets.map((existing) => existing === previous ? sheet : existing) : [...root.adoptedStyleSheets, sheet];
      __privateSet(this, _sheet, sheet);
      return;
    }
    let styleEl = root.querySelector("style[data-sig-adopted]");
    if (styleEl === null) {
      styleEl = document.createElement("style");
      styleEl.setAttribute("data-sig-adopted", "");
      root.prepend(styleEl);
    }
    styleEl.textContent = css;
  }
  /**
   * Swap the anatomy root for a freshly built node (attribute-safe:
   * the style sheet and any non-root nodes stay put).
   *
   * @param node The new anatomy root from buildAnatomy().
   */
  mountAnatomy(node) {
    node.setAttribute("data-sig-root", "");
    if (__privateGet(this, _root) !== null) __privateGet(this, _root).replaceWith(node);
    else this.shadowRoot.appendChild(node);
    __privateSet(this, _root, node);
  }
  /**
   * Queue one debounced render — a microtask per attribute batch.
   * Multiple attributeChangedCallback calls in the same task coalesce.
   */
  queueRender() {
    if (__privateGet(this, _renderQueued)) return;
    __privateSet(this, _renderQueued, true);
    queueMicrotask(() => {
      __privateSet(this, _renderQueued, false);
      this.render();
    });
  }
  /** The first render + every debounced re-render land here. */
  render() {
    this.mountAnatomy(this.buildAnatomy());
  }
  /** First render on insertion. */
  connectedCallback() {
    this.queueRender();
  }
  /** Debounced re-render on attribute change (base coalesces the batch). */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    this.queueRender();
  }
}
_sheet = new WeakMap();
_root = new WeakMap();
_renderQueued = new WeakMap();
function boolAttr(value) {
  return value !== null && value !== "false";
}
function numAttr(value, fallback) {
  if (value === null) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
function clamp(value, min, number_max) {
  return Math.min(number_max, Math.max(min, value));
}
const FONT_MONO = 'var(--font-mono, ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace)';
const REDUCED_MOTION = `
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition: none !important;
    animation: none !important;
    scroll-behavior: auto !important;
  }
}
`;
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
class SigSurfaceCard extends SigElement {
  static get observedAttributes() {
    return ["eyebrow", "meta", "title", "accent-token", "elevation", "interactive"];
  }
  constructor() {
    super();
    this.adoptStyles(SURFACE_CSS);
  }
  /** @returns The shadow anatomy: meta row + ruled title + content slot. */
  buildAnatomy() {
    const card = document.createElement("section");
    card.className = "card";
    const accent = this.getAttribute("accent-token");
    if (accent !== null) {
      card.setAttribute("data-accent", "");
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
const BADGE_VARIANTS = {
  peach: "--sig-peach",
  sky: "--sig-sky",
  green: "--sig-green",
  cobalt: "--sig-cobalt",
  lavender: "--sig-lavender",
  "mauve-soft": "--sig-mauve-soft",
  "pink-bright": "--sig-pink-bright",
  yellow: "--sig-yellow",
  orchid: "--sig-orchid"
};
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
class SigBadge extends SigElement {
  constructor() {
    super();
    __privateAdd(this, _SigBadge_instances);
    this.adoptStyles(BADGE_CSS);
  }
  static get observedAttributes() {
    return ["label", "variant", "accent-token"];
  }
  /** @returns The flat pill: one span, the label text. */
  buildAnatomy() {
    const pill = document.createElement("span");
    pill.className = "pill";
    pill.style.setProperty("--sig-accent", `var(${__privateMethod(this, _SigBadge_instances, token_fn).call(this)})`);
    pill.textContent = this.getAttribute("label") ?? "";
    return pill;
  }
}
_SigBadge_instances = new WeakSet();
/** @returns The token the pill paints with (accent-token wins). */
token_fn = function() {
  const accent = this.getAttribute("accent-token");
  if (accent !== null && accent !== "") return accent;
  const variant = this.getAttribute("variant");
  if (variant !== null && variant in BADGE_VARIANTS) {
    return BADGE_VARIANTS[variant] ?? "--text-muted";
  }
  return "--text-muted";
};
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
class SigProgressBar extends SigElement {
  constructor() {
    super();
    __privateAdd(this, _SigProgressBar_instances);
    this.adoptStyles(PROGRESS_CSS);
  }
  static get observedAttributes() {
    return ["value", "max", "label", "limit-text", "accent-token"];
  }
  /** @returns track + fill + optional limit caption. */
  buildAnatomy() {
    const wrap = document.createElement("div");
    wrap.className = "wrap";
    const track = document.createElement("div");
    track.className = "track";
    const fill = document.createElement("div");
    fill.className = "fill";
    const accent = this.getAttribute("accent-token");
    fill.style.background = `var(${accent ?? "--sig-cobalt"})`;
    fill.style.width = `${__privateMethod(this, _SigProgressBar_instances, percent_fn).call(this)}%`;
    track.appendChild(fill);
    wrap.appendChild(track);
    const limitText = this.getAttribute("limit-text");
    if (limitText !== null) {
      const caption = document.createElement("div");
      caption.className = "caption";
      caption.textContent = limitText;
      wrap.appendChild(caption);
    }
    this.setAttribute("role", "progressbar");
    this.setAttribute("aria-valuemin", "0");
    this.setAttribute("aria-valuemax", "100");
    this.setAttribute("aria-valuenow", String(Math.round(__privateMethod(this, _SigProgressBar_instances, percent_fn).call(this))));
    const label = this.getAttribute("label");
    if (label !== null) this.setAttribute("aria-label", label);
    return wrap;
  }
}
_SigProgressBar_instances = new WeakSet();
/** @returns The clamped percent the fill paints. */
percent_fn = function() {
  const max = Math.max(numAttr(this.getAttribute("max"), 100), 1);
  const value = numAttr(this.getAttribute("value"), 0);
  return clamp(value / max * 100, 0, 100);
};
const RING_RADIUS = 44;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
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
class SigStatRing extends SigElement {
  constructor() {
    super();
    __privateAdd(this, _SigStatRing_instances);
    this.adoptStyles(RING_CSS);
  }
  static get observedAttributes() {
    return ["value", "total", "unit", "size", "accent-token", "show-value", "label"];
  }
  /** @returns The SVG dial: hairline boundary over track over arc + text. */
  buildAnatomy() {
    const size = Math.max(numAttr(this.getAttribute("size"), 120), 16);
    const percent = __privateMethod(this, _SigStatRing_instances, percent_fn2).call(this);
    const strokeWidthUnits = 8 / size * 100;
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
    text.textContent = __privateMethod(this, _SigStatRing_instances, readout_fn).call(this);
    svg.append(hairline, track, arc, text);
    dial.appendChild(svg);
    this.setAttribute("role", "progressbar");
    this.setAttribute("aria-valuemin", "0");
    this.setAttribute("aria-valuemax", "100");
    this.setAttribute("aria-valuenow", String(Math.round(percent)));
    const ringLabel = this.getAttribute("label");
    if (ringLabel !== null) this.setAttribute("aria-label", ringLabel);
    return dial;
  }
}
_SigStatRing_instances = new WeakSet();
/** @returns The clamped percent (total present → value is the part). */
percent_fn2 = function() {
  const value = numAttr(this.getAttribute("value"), 0);
  const total = this.getAttribute("total");
  if (total === null) return clamp(value, 0, 100);
  const denominator = Math.max(numAttr(total, 0), 1);
  return clamp(value / denominator * 100, 0, 100);
};
/** @returns The centered readout text ("85%" default; unit overrides). */
readout_fn = function() {
  if (!boolAttr(this.getAttribute("show-value") ?? "true")) return "";
  const unit = this.getAttribute("unit") ?? "%";
  return `${Math.round(__privateMethod(this, _SigStatRing_instances, percent_fn2).call(this))}${unit}`;
};
const CALLOUT_STATUSES = {
  info: "--sig-sky",
  success: "--sig-green",
  warning: "--sig-peach"
};
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
class SigCallout extends SigElement {
  static get observedAttributes() {
    return ["status"];
  }
  constructor() {
    super();
    this.adoptStyles(CALLOUT_CSS);
  }
  /** @returns The note: the status strip + the slotted body. */
  buildAnatomy() {
    this.setAttribute("role", "note");
    const note = document.createElement("div");
    note.className = "callout";
    const status = this.getAttribute("status");
    const token = status !== null && status in CALLOUT_STATUSES ? CALLOUT_STATUSES[status] ?? "--sig-sky" : "--sig-sky";
    note.style.setProperty("--sig-accent", `var(${token})`);
    note.setAttribute("status", status ?? "info");
    const slot = document.createElement("slot");
    note.appendChild(slot);
    return note;
  }
}
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
class SigCarousel extends SigElement {
  constructor() {
    super();
    __privateAdd(this, _SigCarousel_instances);
    /** The assigned light-DOM items (element nodes only). */
    __privateAdd(this, _items, []);
    /** The active index (majority-visible item). */
    __privateAdd(this, _index, 0);
    this.adoptStyles(CAROUSEL_CSS);
  }
  static get observedAttributes() {
    return ["mode", "label"];
  }
  /** @returns The full anatomy: track + slot, then the control bar. */
  buildAnatomy() {
    const wrap = document.createElement("div");
    wrap.setAttribute("role", "region");
    wrap.setAttribute("aria-roledescription", "carousel");
    const track = document.createElement("div");
    track.className = "track";
    track.tabIndex = 0;
    track.setAttribute("aria-label", this.getAttribute("label") ?? "carousel items");
    const slot = document.createElement("slot");
    slot.addEventListener("slotchange", () => __privateMethod(this, _SigCarousel_instances, onSlotChange_fn).call(this, slot, track));
    track.appendChild(slot);
    track.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        __privateMethod(this, _SigCarousel_instances, advance_fn).call(this, 1, track);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        __privateMethod(this, _SigCarousel_instances, advance_fn).call(this, -1, track);
      }
    });
    wrap.appendChild(track);
    wrap.appendChild(__privateMethod(this, _SigCarousel_instances, controls_fn).call(this, track));
    return wrap;
  }
}
_items = new WeakMap();
_index = new WeakMap();
_SigCarousel_instances = new WeakSet();
mode_get = function() {
  return this.getAttribute("mode") === "paged" ? "paged" : "free";
};
scrollBehavior_get = function() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
};
/**
 * The docked control bar: prev · dots · next · "1 / N" indicator.
 *
 * @param track The scroll track the buttons drive.
 * @returns The controls row (dots rebuilt from #items).
 */
controls_fn = function(track) {
  const controls = document.createElement("div");
  controls.className = "controls";
  const prev = document.createElement("button");
  prev.type = "button";
  prev.className = "ghost";
  prev.textContent = "‹ Prev";
  prev.setAttribute("aria-label", "‹ Prev — previous items");
  prev.addEventListener("click", () => __privateMethod(this, _SigCarousel_instances, advance_fn).call(this, -1, track));
  const dots = document.createElement("div");
  dots.className = "dots";
  dots.setAttribute("aria-label", "carousel dots");
  __privateGet(this, _items).forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "dot";
    dot.setAttribute("aria-label", `go to item ${index + 1}`);
    dot.setAttribute("aria-current", index === __privateGet(this, _index) ? "true" : "false");
    dot.addEventListener("click", () => __privateMethod(this, _SigCarousel_instances, scrollToIndex_fn).call(this, index, track));
    dots.appendChild(dot);
  });
  const next = document.createElement("button");
  next.type = "button";
  next.className = "ghost";
  next.textContent = "Next ›";
  next.setAttribute("aria-label", "Next › — next items");
  next.addEventListener("click", () => __privateMethod(this, _SigCarousel_instances, advance_fn).call(this, 1, track));
  const indicator = document.createElement("span");
  indicator.className = "indicator";
  indicator.setAttribute("aria-live", "polite");
  indicator.textContent = `${__privateGet(this, _index) + 1} / ${Math.max(__privateGet(this, _items).length, 1)}`;
  controls.append(prev, dots, next, indicator);
  return controls;
};
/**
 * slotchange: recount the assigned nodes, rebuild the control bar.
 *
 * @param slot The anatomy slot.
 * @param track The scroll track (kept for the control bar wiring).
 */
onSlotChange_fn = function(slot, track) {
  var _a;
  __privateSet(this, _items, slot.assignedNodes({ flatten: true }).filter((node) => node.nodeType === Node.ELEMENT_NODE));
  const anatomy = (_a = this.shadowRoot) == null ? void 0 : _a.querySelector("[data-sig-root]");
  if (anatomy === null) return;
  const controls = anatomy.querySelector(".controls");
  if (controls !== null) controls.replaceWith(__privateMethod(this, _SigCarousel_instances, controls_fn).call(this, track));
  __privateMethod(this, _SigCarousel_instances, observeItems_fn).call(this, track);
};
/**
 * IntersectionObserver sync — the majority-visible item is active.
 *
 * @param track The scroll track (the IO root).
 */
observeItems_fn = function(track) {
  if (typeof IntersectionObserver === "undefined" || __privateGet(this, _items).length === 0) return;
  const observer = new IntersectionObserver(
    (entries) => {
      let bestIndex = -1;
      let bestRatio = 0;
      entries.forEach((entry) => {
        const index = __privateGet(this, _items).indexOf(entry.target);
        if (index >= 0 && entry.intersectionRatio > bestRatio) {
          bestIndex = index;
          bestRatio = entry.intersectionRatio;
        }
      });
      if (bestIndex >= 0 && bestRatio >= 0.5 && bestIndex !== __privateGet(this, _index)) {
        __privateMethod(this, _SigCarousel_instances, setIndex_fn).call(this, bestIndex, track);
      }
    },
    { root: track, threshold: [0.5] }
  );
  __privateGet(this, _items).forEach((item) => observer.observe(item));
};
/**
 * Advance by one item (free) or one track width (paged).
 *
 * @param direction -1 = previous, 1 = next.
 * @param track The scroll track.
 */
advance_fn = function(direction, track) {
  var _a;
  const behavior = __privateGet(this, _SigCarousel_instances, scrollBehavior_get);
  if (__privateGet(this, _SigCarousel_instances, mode_get) === "paged") {
    track.scrollBy({ left: direction * track.clientWidth, behavior });
    return;
  }
  const step = (((_a = __privateGet(this, _items)[0]) == null ? void 0 : _a.getBoundingClientRect().width) ?? track.clientWidth) + parseFloat(getComputedStyle(track).columnGap || "0");
  track.scrollBy({ left: direction * step, behavior });
};
/**
 * Jump the track to a dot's item.
 *
 * @param index The item index.
 * @param track The scroll track.
 */
scrollToIndex_fn = function(index, track) {
  var _a;
  const step = (((_a = __privateGet(this, _items)[0]) == null ? void 0 : _a.getBoundingClientRect().width) ?? track.clientWidth) + parseFloat(getComputedStyle(track).columnGap || "0");
  track.scrollTo({ left: index * step, behavior: __privateGet(this, _SigCarousel_instances, scrollBehavior_get) });
  __privateMethod(this, _SigCarousel_instances, setIndex_fn).call(this, index, track);
};
/**
 * Sync the active dot + the "1 / N" indicator.
 *
 * @param index The active item index.
 * @param track The scroll track (for locating the controls row).
 */
setIndex_fn = function(index, track) {
  var _a;
  __privateSet(this, _index, index);
  const anatomy = (_a = this.shadowRoot) == null ? void 0 : _a.querySelector("[data-sig-root]");
  if (anatomy === null) return;
  anatomy.querySelectorAll(".dot").forEach((dot, dotIndex) => {
    dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
  });
  const indicator = anatomy.querySelector(".indicator");
  if (indicator !== null) {
    indicator.textContent = `${index + 1} / ${Math.max(__privateGet(this, _items).length, 1)}`;
  }
};
const REGISTRY = [
  ["sig-surface-card", SigSurfaceCard],
  ["sig-badge", SigBadge],
  ["sig-progress-bar", SigProgressBar],
  ["sig-stat-ring", SigStatRing],
  ["sig-callout", SigCallout],
  ["sig-carousel", SigCarousel]
];
for (const [name, ctor] of REGISTRY) {
  if (customElements.get(name) === void 0) customElements.define(name, ctor);
}
export {
  SigBadge,
  SigCallout,
  SigCarousel,
  SigElement,
  SigProgressBar,
  SigStatRing,
  SigSurfaceCard
};
