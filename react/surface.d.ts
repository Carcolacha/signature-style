/**
 * surface — the OFFICIAL surface primitives (2.2.0 "Telemetry Limits &
 * Official Surface Primitives"; 2.6.0 "Universal Developer Card Suite,
 * Chromatic Elevation & The Master Index Overhaul" grows the chromatic
 * accent + elevation-tier contract). This is the Shed anatomy (the v2.0.0
 * playground layer: meta row → ruled title → content) promoted into the
 * package with the owner-mandated `.sig-*` class prefix; the css half
 * lives in css/surface.css (layered into `cascade` after toast.css).
 *
 * Pruning Protocol: <SurfaceCard> renders EXACTLY ONE <section> — the
 * meta row appears only when `eyebrow` or `meta` is provided, the ruled
 * h2 only when `title` is; no wrappers around the children slot.
 * <PageHero> renders EXACTLY ONE <header> — h1, optional subtitle p,
 * then the children slot for extras. No div soup, no context, no
 * portality: plain elements wearing the doctrine.
 *
 * The elevation (inset highlight + ambient shadow + the hover lift on
 * `interactive`) is OWNER-SANCTIONED in css/surface.css ONLY — the
 * ambient elevation contract ships with the surface primitive (see the
 * css file header for the doctrine boundary; gate (e1) scopes the
 * package's zero-shadow law around exactly that file).
 *
 * 2.6.0 CHROMATIC ELEVATION — two additive props on <SurfaceCard>:
 *
 *   - `accentToken` — a party (or structural) accent rendered through
 *     the `data-accent` attribute + the inline `--sig-accent` variable:
 *     the eyebrow and the ruled title underline take the accent, and the
 *     interactive hover gains a chromatic glow (css/surface.css). The
 *     mechanism is attribute-driven so ANY archetype (the 2.6.0 card
 *     suite included) can reuse the identical contract.
 *   - `elevation` — the three-tier shadow ladder "flat" | "raised" |
 *     "floating" (default "raised", the historical look, values tuned).
 *     Rendered as `data-elevation`; the shadow blocks are shared
 *     attribute selectors in css/surface.css so any element — the
 *     featured <TierCard> included — rides the same ladder.
 */
import type { ReactNode } from "react";
import type { PartyTokenName } from "./primitives.js";
/**
 * The content-accent alias: the ELEVEN `--sig-*` tokens, typed. The
 * owner's shorthand names map 1:1 onto the reserved tokens:
 *
 *   pink bright → --sig-pink-bright     sky    → --sig-sky
 *   pink soft   → --sig-pink-soft       blue   → --sig-blue
 *   pink alt    → --sig-pink-alt        peach  → --sig-peach
 *   mauve       → --sig-mauve-bright    green  → --sig-green
 *   mauve soft  → --sig-mauve-soft      yellow → --sig-yellow
 *   lavender    → --sig-lavender
 *
 * (The alias resolves through `Extract<KnownToken, `--sig-${string}`>`,
 * so the ThemeProvider whitelist IS the union — the 11-token sweep gate
 * pins the count against that whitelist.)
 */
export type PartyColorToken = PartyTokenName;
/**
 * The STRUCTURAL accents — the two signature tokens (Flamingo primary /
 * Teal secondary). Only these two may accent structural chrome; every
 * other structural token is out (Rule of Engagement).
 */
export type StructuralAccentToken = "--color-cake-primary" | "--color-cake-secondary";
/**
 * The full accent union accepted by chromatic props (`accentToken` on
 * <SurfaceCard> and the 2.6.0 card archetypes): the eleven party content
 * tokens PLUS the two structural signatures — gateways like the Event
 * Planner door wear Flamingo, content cards wear the party palette.
 */
export type AccentToken = PartyColorToken | StructuralAccentToken;
/** The three-tier elevation ladder (2.6.0). */
export type SurfaceElevation = "flat" | "raised" | "floating";
/**
 * `<SurfaceCard>` — the Shed surface: meta → ruled title → content.
 *
 * ONE `<section class="sig-surface-card [--interactive] [className]">`.
 * `eyebrow` (teal all-caps) and `meta` (muted mono path) share ONE
 * `.sig-surface-card__meta` baseline row; `title` renders the ruled
 * `.sig-surface-card__title` h2; everything else is the children slot.
 * `interactive` adds the tactile modifier — translateY(-2px) + the
 * deepened ambient shadow on hover (css/surface.css).
 *
 * 2.6.0: `accentToken` renders `data-accent` + the inline `--sig-accent`
 * variable — the eyebrow and the title underline take the accent color
 * (the underline grows to 2px solid, the GlobalNav/Tabs contract), and
 * the interactive hover gains the chromatic glow. `elevation` picks the
 * shadow tier via `data-elevation`: "flat" (hairline only, no shadow),
 * "raised" (default — the historical ambient, values tuned), "floating"
 * (the deep display shadow; interactive+floating lifts -4px on hover).
 *
 * The modifier classes of the world (grid spans like the playground's
 * `hub__card--timeline`) arrive through `className` — the composition
 * layer composes ON the primitive, never around it.
 *
 * @example
 * ```tsx
 * <SurfaceCard eyebrow="Forms" meta="components/forms.tsx" title="Form Controls" interactive>
 *   <Input placeholder="Guest name" />
 * </SurfaceCard>
 * <SurfaceCard
 *   eyebrow="Planner" meta="views/planner.tsx" title="Event Planner Bento"
 *   interactive accentToken="--color-cake-primary" elevation="floating"
 * >
 *   <ProgressBar value={72} colorToken="--sig-sky" label="RSVP ratio" />
 * </SurfaceCard>
 * ```
 */
export interface SurfaceCardProps {
    /** Teal all-caps eyebrow label (left half of the meta row). */
    eyebrow?: string;
    /** Muted mono source path (right half of the meta row). */
    meta?: string;
    /** The ruled card title (h2). */
    title?: string;
    /** The tactile hover: translateY(-2px) + deepened ambient shadow. */
    interactive?: boolean;
    /**
     * The chromatic accent (2.6.0): a `--sig-*` content token or one of
     * the two structural signatures. Colors the eyebrow + the ruled title
     * underline (2px solid — the GlobalNav/Tabs contract) and tints the
     * interactive hover glow. Omit for the classic teal/muted card.
     */
    accentToken?: AccentToken;
    /**
     * The shadow tier (2.6.0, default "raised"): "flat" — border hairline
     * only, zero shadow; "raised" — the historical ambient (values tuned
     * to 0.06 inset / 0.42 ambient); "floating" — the deep display shadow
     * (interactive hover lifts -4px).
     */
    elevation?: SurfaceElevation;
    /** Extra classes composed ON the primitive (e.g. grid placement). */
    className?: string;
    /** The card content — rendered directly inside the section. */
    children?: ReactNode;
}
export declare function SurfaceCard({ eyebrow, meta, title, interactive, accentToken, elevation, className, children, }: SurfaceCardProps): import("react").JSX.Element;
/**
 * `<PageHero>` — the announcing page header.
 *
 * ONE `<header class="sig-page-hero">`: the serif display h1
 * (clamp 2.25rem → 4rem, 0.35em tracking), the optional muted mono
 * subtitle, then the children slot for extras (buttons, badges —
 * anything that belongs under the announcement).
 *
 * @example
 * ```tsx
 * <PageHero title="THE ENGINE" subtitle="every primitive, one dashboard · live showcase" />
 * ```
 */
export interface PageHeroProps {
    /** The serif display title (h1). */
    title: string;
    /** The muted mono subtitle line. */
    subtitle?: string;
    /** Extras rendered after the subtitle (the children slot). */
    children?: ReactNode;
}
export declare function PageHero({ title, subtitle, children }: PageHeroProps): import("react").JSX.Element;
