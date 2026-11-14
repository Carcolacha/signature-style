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
/** The elevation tier (2.6.0 ladder). */
export type SigElevation = "flat" | "raised" | "floating";
/**
 * `<sig-surface-card>` — the shadow twin of `<SurfaceCard>`. The body
 * content is a default `<slot>`; the meta row + ruled title are
 * attribute-driven. The elevation ladder shadows live ONLY on `.card`
 * (data-elevation-equivalent mirrors the host's `elevation` attribute).
 */
export declare class SigSurfaceCard extends SigElement {
    static get observedAttributes(): string[];
    constructor();
    /** @returns The shadow anatomy: meta row + ruled title + content slot. */
    protected buildAnatomy(): HTMLElement;
}
/** The variant → token map (content colors only — the RoE holds). */
declare const BADGE_VARIANTS: Readonly<Record<string, string>>;
/** A badge variant name (a key of BADGE_VARIANTS). */
export type SigBadgeVariant = keyof typeof BADGE_VARIANTS;
/**
 * `<sig-badge>` — the pill twin of `<SigBadge>`. The token comes from
 * `accent-token` (a literal `--sig-*` name) or `variant` (a content
 * color name from the frozen map); without either the pill goes
 * neutral (muted hairline + well).
 */
export declare class SigBadge extends SigElement {
    #private;
    static get observedAttributes(): string[];
    constructor();
    /** @returns The flat pill: one span, the label text. */
    protected buildAnatomy(): HTMLElement;
}
/**
 * `<sig-progress-bar>` — the track twin of `<ProgressBar>`. The host
 * carries the progressbar ARIA contract (role + valuenow recomputed on
 * every `value` change); the fill width animates with the
 * owner-mandated physics (width 0.3s ease-out).
 */
export declare class SigProgressBar extends SigElement {
    #private;
    static get observedAttributes(): string[];
    constructor();
    /** @returns track + fill + optional limit caption. */
    protected buildAnatomy(): HTMLElement;
}
/**
 * `<sig-stat-ring>` — the SVG twin of `<StatRing>`: the track circle in
 * var(--bg-inset), the progress arc in the accent token, the boundary
 * hairline OVER the ink, and the centered tabular readout. A `value`
 * attribute change animates stroke-dashoffset (the transition lives in
 * this shadow sheet; the reduced-motion escape kills it on request).
 */
export declare class SigStatRing extends SigElement {
    #private;
    static get observedAttributes(): string[];
    constructor();
    /** @returns The SVG dial: hairline boundary over track over arc + text. */
    protected buildAnatomy(): HTMLElement;
}
/** The status → token map (react/data.tsx Callout: the --status contract). */
declare const CALLOUT_STATUSES: Readonly<Record<string, string>>;
/** A callout status name. */
export type SigCalloutStatus = keyof typeof CALLOUT_STATUSES;
/**
 * `<sig-callout>` — the persistent note twin of `<Callout>` (role note,
 * no close button, never auto-dismisses): a 4px left strip — info →
 * --sig-sky, success → --sig-green, warning → --sig-peach — over the
 * inset well, with the body content slotted.
 */
export declare class SigCallout extends SigElement {
    static get observedAttributes(): string[];
    constructor();
    /** @returns The note: the status strip + the slotted body. */
    protected buildAnatomy(): HTMLElement;
}
/**
 * `<sig-carousel>` — the scroll-strip twin of `<Carousel>`. Light-DOM
 * children slot into a scroll-snap track; N comes from the slotchange
 * event (assigned element count). `mode="paged"` advances one TRACK
 * WIDTH per Prev/Next; the default "free" advances one ITEM. Dots are
 * one per item and clickable; the "1 / N" indicator is tabular-nums and
 * aria-live polite. The track is keyboard-reachable (tabIndex 0,
 * Arrow keys drive the buttons).
 */
export declare class SigCarousel extends SigElement {
    #private;
    static get observedAttributes(): string[];
    constructor();
    /** @returns The full anatomy: track + slot, then the control bar. */
    protected buildAnatomy(): HTMLElement;
}
export {};
