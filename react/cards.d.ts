/**
 * cards — the ARCHETYPE CARDS (2.5.0 "Ergonomic Form Rules, Button &
 * Card Archetypes, and the 12-Column Bento"; 2.6.0 "Universal Developer
 * Card Suite" grows the five UNIVERSAL archetypes).
 *
 * 2.5.0 — four composable card metaphors the composition layer kept
 * hand-rolling, now official, wired to css/cards.css:
 *
 *   <ActionTile>    — the ONE-button action row (icon well + title/
 *                     subtitle + optional kbd shortcut chip). ZERO divs.
 *   <FlipCard>      — the two-face reveal: ONE <button aria-pressed>,
 *                     internal state (uncontrolled default), Space/
 *                     Enter flip for free through button semantics.
 *   <AccordionCard> — ZERO JavaScript: <details>/<summary> with the
 *                     token chevron; the open state IS details[open].
 *   <MatchupCard>   — the 1v1 grid (side / VS pill / side + stakes
 *                     footer) over two <Avatar> discs.
 *
 * 2.6.0 — the UNIVERSAL DEVELOPER CARD SUITE, five archetypes that make
 * "a card about anything" a one-line import (token-driven, flat DOM,
 * `SigColorToken`/`AccentToken` typed):
 *
 *   <ContentCard>       — image/gradient header + category badge +
 *                         meta pills + accent-underlined title + action.
 *   <ReferenceCard>     — mono tag chip + code snippet + copy button
 *                         (clipboard + onCopied toast contract).
 *   <TierCard>          — plan name / price / Check features / CTA;
 *                         featured → floating elevation + accent border.
 *   <ProfileCard>       — avatar (party ring) + role + tabular stats +
 *                         skill badges.
 *   <ChronicleTimeline> — the "Night of Versions" memorial as an
 *                         official primitive: an <ol> of tagged releases
 *                         down a hairline spine (credits in the JSDoc).
 *
 * DOCTRINE: cards are STRUCTURE — hairlines separate, never shadows
 * (css/cards.css is shadow-free and hex-free; the e1 scope holds — the
 * featured TierCard's floating shadow arrives through the SHARED
 * [data-elevation] ladder in css/surface.css, not from this file);
 * Flamingo/Teal stays structural (hover borders, focus rings); --sig-*
 * rides where the Rule of Engagement admits it (avatar rings, Check
 * bullets, badges, chronicle accents). Zero decorative wrappers: every
 * element carries content or a justified composition job.
 */
import type { ReactNode } from "react";
import { type IconName, type SigTokenName } from "./primitives.js";
import type { AccentToken, SigColorToken } from "./surface.js";
/**
 * Props for `<ActionTile>` — the action-row card. `onClick` optional:
 * a tile without a handler is a static affordance (still a button —
 * give it one in real UIs).
 */
export interface ActionTileProps {
    /** The tile's headline (rendered in a `<strong>`). */
    title: string;
    /** The muted second line under the title. */
    subtitle?: string;
    /** The lucide icon in the inset well (strict IconName contract). */
    icon: IconName;
    /** An optional keyboard-shortcut chip (e.g. "D"), rendered as kbd. */
    kbdShortcut?: string;
    /** The click handler. */
    onClick?: () => void;
}
/**
 * `<ActionTile>` — the action-row card (2.5.0).
 *
 * ONE `<button class="sig-action-tile">` → the icon well (a 40px
 * rounded `.sig-action-tile__well` on --bg-inset), the body
 * (strong title + muted subtitle), and the optional
 * `.sig-action-tile__kbd` shortcut chip (mono, inset — the standalone
 * cousin of the prose kbd chip; css/cards.css owns it because
 * editorial.css scopes its kbd under .sig-prose). ZERO divs: spans
 * inside the button, `margin-left: auto` parks the kbd at the far
 * edge. Hover: the Teal border (structural hover, the radio-card
 * precedent); press: `:active scale(0.98)`.
 *
 * @example
 * ```tsx
 * <ActionTile title="Open Deck Editor" subtitle="42 prompts" icon="SquarePen" kbdShortcut="D" />
 * ```
 */
export declare function ActionTile({ title, subtitle, icon, kbdShortcut, onClick }: ActionTileProps): import("react").JSX.Element;
/**
 * Props for `<FlipCard>` — INTERNAL state by design (the uncontrolled
 * default): the card owns its flipped boolean, `aria-pressed` carries
 * it to the DOM, `onFlip` (optional) reports each flip. A controlled
 * mode can be added later without breaking this surface.
 */
export interface FlipCardProps {
    /** The face content (any nodes — text, prose, a SigBadge). */
    front: ReactNode;
    /** The hidden face revealed by the flip. */
    back: ReactNode;
    /** Fired AFTER each flip with the NEW state (true = showing back). */
    onFlip?: (flipped: boolean) => void;
}
/**
 * `<FlipCard>` — the two-face reveal (2.5.0).
 *
 * ONE `<button class="sig-flip-card" aria-pressed>` — THE FLAT
 * STRUCTURE: button → `__inner` (the 3d stage: `transform-style:
 * preserve-3d`, the owner mechanical bezier on the rotateY) → two
 * `__face` spans (backface-visibility: hidden; the back pre-rotated
 * 180°). Faces are spans, not divs — a button may not contain divs.
 * `min-height: 9rem` on the button because absolutely-positioned faces
 * contribute no height. Click, Space and Enter all flip through the
 * button's native semantics — no keydown wiring, no tabindex. The
 * `FRONT`/`BACK` tags are mono muted letterspaced 0.625rem metadata.
 * Reduced motion: the rotation stands down — the faces swap via
 * opacity (css/cards.css).
 *
 * @example
 * ```tsx
 * <FlipCard front="Dare: sing the chorus" back="…or forfeit 10 points" />
 * ```
 */
export declare function FlipCard({ front, back, onFlip }: FlipCardProps): import("react").JSX.Element;
/**
 * Props for `<AccordionCard>` — title + collapsible body. ZERO props
 * beyond the content: the open/close state is the DOM's own
 * `details[open]` attribute — the attribute IS the state machine, the
 * same doctrine as aria-current/aria-checked.
 */
export interface AccordionCardProps {
    /** The always-visible summary line. */
    title: string;
    /** The body revealed when the details element is open. */
    children: ReactNode;
}
/**
 * `<AccordionCard>` — the zero-JS accordion (2.5.0).
 *
 * `<details class="sig-accordion">` → `<summary
 * class="sig-accordion__summary">` (title + the token chevron) → the
 * `__body` div. No state, no handler, no aria wiring: `<details>`
 * carries disclosure semantics natively, the marker is stripped in css
 * (list-style: none + ::-webkit-details-marker), and
 * `details[open] .sig-accordion__chevron` rotates the chevron 180° —
 * an attribute selector answering an attribute the USER toggled.
 *
 * @example
 * ```tsx
 * <AccordionCard title="House Rules">
 *   <p>Conflict resolves to rock-paper-scissors, best of one.</p>
 * </AccordionCard>
 * ```
 */
export declare function AccordionCard({ title, children }: AccordionCardProps): import("react").JSX.Element;
/** One side of a `<MatchupCard>`: the competitor's name + optional party ring. */
export interface MatchupSide {
    /** The competitor's name — also the Avatar's accessible name. */
    name: string;
    /** A `--sig-*` content token for the 2px avatar ring (typed). */
    ringToken?: SigTokenName;
}
/**
 * Props for `<MatchupCard>` — the 1v1 card. `title` is the optional
 * headline row (spans the grid); `stakes` is the optional mono footer
 * (also spans the grid).
 */
export interface MatchupCardProps {
    title?: string;
    /** The left competitor. */
    left: MatchupSide;
    /** The right competitor. */
    right: MatchupSide;
    /** The mono stakes line under the matchup. */
    stakes?: string;
}
/**
 * `<MatchupCard>` — the 1v1 grid (2.5.0).
 *
 * `<div class="sig-matchup">` (grid `1fr auto 1fr`, centered) → side /
 * VS pill / side, each side a centered column (the 40px `<Avatar>` +
 * the name), the VS pill a mono inset capsule, and the optional
 * `__stakes` footer on `grid-column: 1 / -1` (inset well, mono muted
 * 0.75rem). The avatars carry the party rings when `ringToken` is set —
 * content decoration, the Rule of Engagement as typed.
 *
 * @example
 * ```tsx
 * <MatchupCard
 *   left={{ name: "Ana Souza", ringToken: "--sig-mauve-soft" }}
 *   right={{ name: "Leo Martins", ringToken: "--sig-sky" }}
 *   stakes="Winner picks the next venue — loser brings the ice."
 * />
 * ```
 */
export declare function MatchupCard({ title, left, right, stakes }: MatchupCardProps): import("react").JSX.Element;
/** The footer action of a `<ContentCard>`: label + optional handler. */
export interface ContentCardAction {
    /** The visible button text. */
    label: string;
    /** The click handler (the Button renders regardless — give it one). */
    onClick?: () => void;
}
/**
 * Props for `<ContentCard>` — the universal content card. `image` is
 * optional: WITHOUT it the 16/9 visual header paints the token-driven
 * gradient art (accent-tinted, zero hex); WITH it the URL renders as a
 * cover image. To compose richer art (inline SVG, layered gradients),
 * treat the visual slot's contract as "one decorative block" and pass
 * the art through `image` as a data URL — the card itself stays flat.
 */
export interface ContentCardProps {
    /** The card title (h3, accent-underlined when accentToken is set). */
    title: string;
    /** The muted description paragraph under the title. */
    description?: string;
    /** An image URL for the 16/9 visual header (rendered cover). */
    image?: string;
    /** The category badge label (rendered as a <SigBadge>). */
    category?: string;
    /** The `--sig-*` token for the category badge (required with it). */
    categoryToken?: SigColorToken;
    /** Mono meta pills, e.g. ["25 MIN", "SPICY", "$14"]. */
    meta?: string[];
    /** The chromatic accent: title underline + gradient-art tint. */
    accentToken?: AccentToken;
    /** The footer action — a package <Button variant="secondary" size="sm">. */
    action?: ContentCardAction;
    /** Passthrough classes for grid placement. */
    className?: string;
}
/**
 * `<ContentCard>` — the universal content card (2.6.0).
 *
 * ONE `<section class="sig-content-card" [data-accent]>`: the 16/9
 * visual header (`__visual` — the image URL or the accent-tinted
 * gradient art; css owns `aspect-ratio: 16 / 9`), the meta row
 * (`__meta` — the category SigBadge + the mono `__pill` chips), the
 * accent-underlined title, the muted description, and the action
 * footer (`margin-top: auto` parks it at the card's floor). The
 * Button is the PACKAGE's — the archetype composes, never re-invents.
 *
 * @example
 * ```tsx
 * <ContentCard
 *   category="Catering" categoryToken="--sig-peach"
 *   meta={["25 MIN", "SPICY", "$14"]} accentToken="--sig-yellow"
 *   title="Birria & Street Taco Catering"
 *   description="Slow-braised birria, consomé on the side."
 *   action={{ label: "Book the taco cart" }}
 * />
 * ```
 */
export declare function ContentCard({ title, description, image, category, categoryToken, meta, accentToken, action, className, }: ContentCardProps): import("react").JSX.Element;
/**
 * Props for `<ReferenceCard>` — the copy-to-clipboard reference card.
 * THE TOAST CONTRACT (decoupled by design): the card never renders a
 * toast itself — wrap it in a `ToastProvider` and pass
 * `onCopied={() => toast("success", "Copied")}` to fire one. The card
 * only owns the copied flash ("Copied!" for 2s) and the clipboard call.
 */
export interface ReferenceCardProps {
    /** The mono tag chip above the title (e.g. "JSX" — uppercased by css). */
    tag: string;
    /** The card title (accent-underlined when accentToken is set). */
    title: string;
    /** The code snippet — rendered verbatim inside <pre><code>. */
    code: string;
    /** The chromatic accent: title underline + tag chip ink. */
    accentToken?: AccentToken;
    /** A reference URL: renders the top-right icon link + footer anchor. */
    link?: string;
    /** Fires AFTER a successful copy (wire it to your toast). */
    onCopied?: () => void;
    /** Passthrough classes for grid placement. */
    className?: string;
}
/**
 * `<ReferenceCard>` — the copy-to-clipboard reference card (2.6.0).
 *
 * ONE `<section class="sig-reference-card" [data-accent]>`: the tag row
 * (mono chip on --bg-inset, uppercased + the optional ArrowUpRight link
 * top-right), the accent-underlined title, the `<pre><code>` snippet
 * (inset well, mono 0.8125rem, overflow-x auto), and the footer (the
 * ghost Copy button + the optional "Reference ↗" anchor). COPY: the
 * async clipboard API in a try/catch — failure is silent (the label
 * never flashes a lie); success flips the label to "Copied!", fires
 * `onCopied?.()`, and resets after 2s (timer cleaned up on unmount).
 *
 * @example
 * ```tsx
 * const toast = useToast();
 * <ReferenceCard
 *   tag="JSX" title="The Signature Surface" accentToken="--sig-sky"
 *   code="<SurfaceCard eyebrow=\"Hi\" title=\"Hello\" />"
 *   onCopied={() => toast("success", "Snippet copied")}
 * />
 * ```
 */
export declare function ReferenceCard({ tag, title, code, accentToken, link, onCopied, className, }: ReferenceCardProps): import("react").JSX.Element;
/**
 * Props for `<TierCard>` — the pricing tier. `featured` is the whole
 * hierarchy system: floating elevation (the shared data-elevation
 * ladder), a 2px accent border, and the primary CTA variant.
 */
export interface TierCardProps {
    /** The plan name — the eyebrow voice (uppercase, tracked). */
    name: string;
    /** The price line (e.g. "$49") — 2rem tabular-nums weight 600. */
    price: string;
    /** The feature list — each a Check bullet (party-green). */
    features: string[];
    /** The chromatic accent: featured border + eyebrow ink. */
    accentToken?: AccentToken;
    /** Featured: floating elevation + 2px accent border + primary CTA. */
    featured?: boolean;
    /** The CTA label (default "Choose"). */
    cta?: string;
    /** The CTA handler. */
    onCta?: () => void;
    /** Passthrough classes for grid placement. */
    className?: string;
}
/**
 * `<TierCard>` — the pricing tier (2.6.0).
 *
 * ONE `<section class="sig-tier-card [--featured]" data-elevation>`:
 * the plan name (eyebrow voice), the 2rem tabular-nums price, the
 * feature `<ul>` (each `<li>` a party-green Check bullet), and the CTA
 * (the package Button — primary when featured, secondary otherwise).
 * FEATURED: `data-elevation="floating"` (the shared ladder in
 * css/surface.css paints the deep shadow — cards.css stays flat) + the
 * 2px accent border. NO scale — border + elevation only, per spec.
 *
 * @example
 * ```tsx
 * <TierCard
 *   name="Arena Pass" price="$49" featured accentToken="--sig-mauve-soft"
 *   features={["All 40 game modules", "1v1 & 2v2 brackets"]}
 *   cta="Claim the pass"
 * />
 * ```
 */
export declare function TierCard({ name, price, features, accentToken, featured, cta, onCta, className, }: TierCardProps): import("react").JSX.Element;
/** One stat in a `<ProfileCard>`: the big value + the muted label. */
export interface ProfileStat {
    /** The muted caption under the value (e.g. "Events"). */
    label: string;
    /** The value (tabular-nums, weight 600 — e.g. "412" or "4.9"). */
    value: string;
}
/** One skill badge in a `<ProfileCard>` (a SigBadge). */
export interface ProfileSkill {
    /** The `--sig-*` token for the badge. */
    colorToken: SigColorToken;
    /** The badge label (e.g. "Catering"). */
    label: string;
}
/**
 * Props for `<ProfileCard>` — the person card. `stats` carries TWO to
 * THREE entries (fewer reads empty, more breaks the row) — a dev-time
 * warn fires outside that band, the render never lies.
 */
export interface ProfileCardProps {
    /** The person's name — the Avatar's initials AND the headline. */
    name: string;
    /** The muted role line (0.8125rem). */
    role: string;
    /** Two to three {label, value} stats (tabular values, muted labels). */
    stats?: ProfileStat[];
    /** Skill badges (SigBadges) on the last row. */
    skills?: ProfileSkill[];
    /** The `--sig-*` token for the avatar ring (content-only rule). */
    accentToken?: SigColorToken;
    /** Avatar diameter (32 | 40, default 40 — the grid-perfect pair). */
    avatarSize?: 32 | 40;
    /** Passthrough classes for grid placement. */
    className?: string;
}
/**
 * `<ProfileCard>` — the person card (2.6.0).
 *
 * ONE `<section class="sig-profile-card">`: the 40px `<Avatar>` (party
 * ring via `accentToken` — the Rule of Engagement as typed), the name
 * (weight 600) over the muted role, the stats row (value tabular-nums
 * weight 600 text-main, label muted 0.6875rem; min 2 / max 3 entries,
 * dev-warned outside), and the skills row (SigBadges).
 *
 * @example
 * ```tsx
 * <ProfileCard
 *   name="Ana Souza" role="Head of Catering" accentToken="--sig-peach"
 *   stats={[{ label: "Events", value: "24" }, { label: "Guests", value: "412" }]}
 *   skills={[{ colorToken: "--sig-peach", label: "Catering" }]}
 * />
 * ```
 */
export declare function ProfileCard({ name, role, stats, skills, accentToken, avatarSize, className, }: ProfileCardProps): import("react").JSX.Element;
/** One release in a `<ChronicleTimeline>`: tag, title, story, stat, accent. */
export interface ChronicleRelease {
    /** The version tag (e.g. "v2.6.0") — the mono chip + the key. */
    tag: string;
    /** The release name — the bold headline of the entry. */
    title: string;
    /** The one-line story under the title. */
    story?: string;
    /** The mono stat footnote (e.g. "5 archetypes · 3 tiers"). */
    stat?: string;
    /** The `--sig-*` accent for this milestone's node + tag. */
    accentToken?: SigColorToken;
}
/**
 * Props for `<ChronicleTimeline>` — the release chronicle.
 */
export interface ChronicleTimelineProps {
    /** The releases, oldest first (the spine reads downward). */
    releases: ChronicleRelease[];
    /** The accessible name (default "Version chronicle"). */
    label?: string;
    /** Passthrough classes for placement. */
    className?: string;
}
/**
 * `<ChronicleTimeline>` — the release chronicle (2.6.0).
 *
 * ONE `<ol class="sig-chronicle" aria-label>`: per release an `<li>`
 * carrying the inline `--accent` variable → the milestone node (a 12px
 * circle, 2px solid var(--accent), surface-filled, absolutely parked
 * OVER the ::before hairline spine), the mono tag in the accent, and
 * the body (bold title + optional story + optional mono stat). FLAT:
 * zero shadows — the spine is a 2px color-mix hairline (css/cards.css).
 *
 * MEMORIAL CREDIT: this primitive officializes the "Night of Versions"
 * chronicle the owner read aloud at the memorial release review — every
 * tag, name and stat of the engine's life, one accent per milestone.
 * Port your release history; the timeline keeps it honest.
 *
 * @example
 * ```tsx
 * <ChronicleTimeline
 *   releases={[
 *     { tag: "v2.5.0", title: "The 12-Column Bento", stat: "whitelist 34" },
 *     { tag: "v2.6.0", title: "Universal Developer Card Suite", accentToken: "--sig-peach" },
 *   ]}
 * />
 * ```
 */
export declare function ChronicleTimeline({ releases, label, className, }: ChronicleTimelineProps): import("react").JSX.Element;
