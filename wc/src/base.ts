/**
 * base.ts — SigElement, the zero-react base class for the Signature Style
 * custom elements (3.4.0 "Zero-React Native Web Components").
 *
 * ZERO DEPENDENCIES: plain HTMLElement + the settled shadow-DOM API.
 * Nothing here imports react, lit, or any library — the WC surface is the
 * framework-free twin of react/index.js, driven entirely by the --sig-*
 * CSS custom properties (custom properties INHERIT through shadow-DOM
 * boundaries, so `<html data-sig-theme="daylight">` re-inks every
 * element's shadow content with zero per-element wiring).
 *
 * What the base owns:
 *   - the open shadow root (attachShadow in the constructor — set before
 *     any attribute fires, so attributeChangedCallback can always render);
 *   - adoptStyles(): constructable stylesheets with a <style> fallback —
 *     the shadow style strings mirror the package css/ anatomy (including
 *     the e1 treaty: the sanctioned ambient elevation shadows appear ONLY
 *     on the surface-card's inner .card element, everywhere else flat);
 *   - the re-render debounce: attributeChangedCallback queues ONE
 *     microtask per batch (an element receiving five attributes in one
 *     hydration pass renders once, not five times);
 *   - connectedCallback queues the first render.
 *
 * Subclasses implement buildAnatomy() (a fresh root node from the current
 * attributes) and call markRoot() once; the base swaps the previous root
 * for the new one — attribute-driven re-render without stale listeners
 * inside the shadow tree.
 */

/** The shadow style string a subclass adopts. */
export type SigShadowCss = string;

/**
 * SigElement — the base every `sig-*` element extends.
 */
export abstract class SigElement extends HTMLElement {
  /** The open shadow root — attached in the constructor, never null. */
  declare readonly shadowRoot: ShadowRoot;

  /** The constructable stylesheet adopted by the last adoptStyles call. */
  #sheet: CSSStyleSheet | null = null;

  /** The current anatomy root inside the shadow tree. */
  #root: Element | null = null;

  /** Whether a microtask render is already queued. */
  #renderQueued = false;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  /**
   * Adopt the shadow stylesheet — constructable CSSStyleSheet when the
   * engine has one (fast, document-independent), a <style> element
   * otherwise. Idempotent: a second call replaces the previous sheet.
   *
   * @param css The shadow style string (mirrors the package css/ anatomy).
   */
  protected adoptStyles(css: SigShadowCss): void {
    const root = this.shadowRoot;
    if (typeof CSSStyleSheet === "function" && typeof CSSStyleSheet.prototype.replaceSync === "function") {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(css);
      const previous = this.#sheet;
      root.adoptedStyleSheets =
        previous !== null
          ? root.adoptedStyleSheets.map((existing) => (existing === previous ? sheet : existing))
          : [...root.adoptedStyleSheets, sheet];
      this.#sheet = sheet;
      return;
    }
    // Fallback path: a <style> element survives anatomy rebuilds because
    // the base only ever swaps the marked [data-sig-root] node.
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
  protected mountAnatomy(node: HTMLElement): void {
    node.setAttribute("data-sig-root", "");
    if (this.#root !== null) this.#root.replaceWith(node);
    else this.shadowRoot.appendChild(node);
    this.#root = node;
  }

  /**
   * Queue one debounced render — a microtask per attribute batch.
   * Multiple attributeChangedCallback calls in the same task coalesce.
   */
  protected queueRender(): void {
    if (this.#renderQueued) return;
    this.#renderQueued = true;
    queueMicrotask(() => {
      this.#renderQueued = false;
      this.render();
    });
  }

  /** The first render + every debounced re-render land here. */
  protected render(): void {
    this.mountAnatomy(this.buildAnatomy());
  }

  /** First render on insertion. */
  connectedCallback(): void {
    this.queueRender();
  }

  /** Debounced re-render on attribute change (base coalesces the batch). */
  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;
    void name;
    this.queueRender();
  }

  /** Build the shadow anatomy from the CURRENT attributes. */
  protected abstract buildAnatomy(): HTMLElement;
}
