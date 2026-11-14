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
export declare abstract class SigElement extends HTMLElement {
    #private;
    /** The open shadow root — attached in the constructor, never null. */
    readonly shadowRoot: ShadowRoot;
    constructor();
    /**
     * Adopt the shadow stylesheet — constructable CSSStyleSheet when the
     * engine has one (fast, document-independent), a <style> element
     * otherwise. Idempotent: a second call replaces the previous sheet.
     *
     * @param css The shadow style string (mirrors the package css/ anatomy).
     */
    protected adoptStyles(css: SigShadowCss): void;
    /**
     * Swap the anatomy root for a freshly built node (attribute-safe:
     * the style sheet and any non-root nodes stay put).
     *
     * @param node The new anatomy root from buildAnatomy().
     */
    protected mountAnatomy(node: HTMLElement): void;
    /**
     * Queue one debounced render — a microtask per attribute batch.
     * Multiple attributeChangedCallback calls in the same task coalesce.
     */
    protected queueRender(): void;
    /** The first render + every debounced re-render land here. */
    protected render(): void;
    /** First render on insertion. */
    connectedCallback(): void;
    /** Debounced re-render on attribute change (base coalesces the batch). */
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void;
    /** Build the shadow anatomy from the CURRENT attributes. */
    protected abstract buildAnatomy(): HTMLElement;
}
