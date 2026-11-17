/**
 * cards — the ARCHETYPE CARDS (2.5.0 "Ergonomic Form Rules, Button &
 * Card Archetypes, and the 12-Column Bento"; 2.6.0 "Universal Developer
 * Card Suite" grows the five UNIVERSAL archetypes).
 *
 * 4.0.0 — THE GEOMETRY DEFECT FIXES ("Motion Lab Rebuild, Flip/Accordion
 * Geometry Fix…"): <FlipCard> is TRUE full-card 3D — the button is a
 * `display: grid` perspective stage (1000px), `.sig-flip-inner` owns
 * the rotateY(180deg) (never rotateX — the back face can never render
 * upside-down), the faces share grid-area 1/1 with both
 * backface-visibility spellings; rich faces (eyebrow/title/body +
 * the flip hint) layer over the plain children slots.
 * <AccordionCard> gains TRUE height expansion — the body is a
 * `grid-template-rows: 0fr → 1fr` transition (320ms ×
 * --ease-spring-gentle) with an overflow-hidden inner, so a closed
 * accordion hugs its header and grids that contain it use
 * `align-items: start` to kill the dead stretch.
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
 *   <ProfileCard>       — avatar (chromatic ring) + role + tabular stats +
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

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  Button,
  Icon,
  type IconName,
  type SigTokenName,
} from "./primitives.js";
import { Avatar } from "./forms.js";
import { SigBadge } from "./primitives.js";
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
export function ActionTile({ title, subtitle, icon, kbdShortcut, onClick }: ActionTileProps) {
  return (
    <button type="button" className="sig-action-tile" onClick={onClick}>
      <span className="sig-action-tile__well">
        <Icon name={icon} aria-hidden />
      </span>
      <span className="sig-action-tile__body">
        <strong>{title}</strong>
        {subtitle !== undefined && <span>{subtitle}</span>}
      </span>
      {kbdShortcut !== undefined && (
        <kbd className="sig-action-tile__kbd">{kbdShortcut}</kbd>
      )}
    </button>
  );
}

/**
 * Props for `<FlipCard>` — INTERNAL state by design (the uncontrolled
 * default): the card owns its flipped boolean, `aria-pressed` carries
 * it to the DOM, `onFlip` (optional) reports each flip. A controlled
 * mode can be added later without breaking this surface.
 *
 * 4.0.0 RICH FACES — the plain `front`/`back` children stay (the
 * string-slot contract the simple usages and the docs rely on), and
 * the structured face fields layer ON TOP: `frontEyebrow` /
 * `frontTitle` / `frontBody` (+ the back trio) render the balanced
 * prompt/reveal anatomy — eyebrow badge, accent-underlined title,
 * muted body — above the children slot. Both faces carry the mono
 * flip hint. `accentToken` paints both titles' 2px underline.
 */
export interface FlipCardProps {
  /** The face content (any nodes — text, prose, a SigBadge). */
  front: ReactNode;
  /** The hidden face revealed by the flip. */
  back: ReactNode;
  /** The front face's eyebrow badge (mono chip above the title). */
  frontEyebrow?: string;
  /** The front face's title (accent-underlined). */
  frontTitle?: string;
  /** The front face's muted body description. */
  frontBody?: string;
  /** The back face's eyebrow badge (mono chip above the title). */
  backEyebrow?: string;
  /** The back face's title (accent-underlined). */
  backTitle?: string;
  /** The back face's muted body description. */
  backBody?: string;
  /** The chromatic accent: a 2px underline on BOTH face titles. */
  accentToken?: AccentToken;
  /** Fired AFTER each flip with the NEW state (true = showing back). */
  onFlip?: (flipped: boolean) => void;
}

/**
 * `<FlipCard>` — the two-face reveal (2.5.0; 4.0.0 TRUE 3D GEOMETRY).
 *
 * ONE `<button class="sig-flip-card" aria-pressed>` — THE 4.0.0
 * FULL-CARD 3D ANATOMY: the button is a `display: grid` box with
 * `perspective: 1000px` and the 220px parity floor; `.sig-flip-inner`
 * (grid-area 1/1, `transform-style: preserve-3d`) carries THE
 * ROTATION — `rotateY(180deg)` NEVER `rotateX`, so the back face can
 * never render upside-down; the two faces `.sig-flip-front` /
 * `.sig-flip-back` share `grid-area: 1/1; width/height: 100%` with
 * both `backface-visibility` spellings hidden and the back
 * pre-rotated 180°. Because the faces ride the grid (no absolute
 * positioning), the card's height owns the box AND the faces' boxes
 * are exact. Faces are spans, not divs — a button may not contain
 * divs. Click, Space and Enter all flip through the button's native
 * semantics — no keydown wiring, no tabindex.
 *
 * THE RICH FACE (4.0.0): optional eyebrow badge (mono chip) + title
 * (2px accent underline via the inline --sig-accent contract) + muted
 * body above the children slot, and the mono "Click to flip" hint
 * pinned to each face's floor. Reduced motion: the rotation stands
 * down — the faces crossfade via opacity (css/cards.css).
 *
 * @example
 * ```tsx
 * <FlipCard
 *   frontEyebrow="Prompt" frontTitle="Dare: sing the chorus"
 *   backEyebrow="Reveal" backTitle="…or forfeit 10 points"
 *   front="Warm-up round" back="The forfeit is binding."
 *   accentToken="--sig-cyan"
 * />
 * ```
 */
export function FlipCard({
  front,
  back,
  frontEyebrow,
  frontTitle,
  frontBody,
  backEyebrow,
  backTitle,
  backBody,
  accentToken,
  onFlip,
}: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  // THE INERT SWEEP (3.6.0): the HIDDEN face carries `inert` so Tab can
  // never land on content inside a face that is not visible
  // (backface-visibility hides it optically, not from the a11y tree).
  // React 18 has no boolean `inert` prop (that API is React 19+) — the
  // ref-effect workaround below is the documented equivalent; both faces
  // swap in ONE commit so focus integrity never splits.
  const frontFaceRef = useRef<HTMLSpanElement>(null);
  const backFaceRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (frontFaceRef.current !== null) frontFaceRef.current.inert = flipped;
    if (backFaceRef.current !== null) backFaceRef.current.inert = !flipped;
  }, [flipped]);
  return (
    <button
      type="button"
      className="sig-flip-card"
      aria-pressed={flipped}
      {...accentProps(accentToken)}
      onClick={() => {
        const next = !flipped;
        setFlipped(next);
        onFlip?.(next);
      }}
    >
      <span className="sig-flip-inner">
        <span ref={frontFaceRef} className="sig-flip-front">
          {frontEyebrow !== undefined && (
            <span className="sig-flip-face__eyebrow">{frontEyebrow}</span>
          )}
          {frontTitle !== undefined && (
            <span className="sig-flip-face__title">{frontTitle}</span>
          )}
          {frontBody !== undefined && (
            <span className="sig-flip-face__body">{frontBody}</span>
          )}
          {front !== null && front !== undefined && (
            <span className="sig-flip-face__content">{front}</span>
          )}
          <span className="sig-flip-face__hint">Click to flip</span>
        </span>
        <span ref={backFaceRef} className="sig-flip-back">
          {backEyebrow !== undefined && (
            <span className="sig-flip-face__eyebrow">{backEyebrow}</span>
          )}
          {backTitle !== undefined && (
            <span className="sig-flip-face__title">{backTitle}</span>
          )}
          {backBody !== undefined && (
            <span className="sig-flip-face__body">{backBody}</span>
          )}
          {back !== null && back !== undefined && (
            <span className="sig-flip-face__content">{back}</span>
          )}
          <span className="sig-flip-face__hint">Click to flip</span>
        </span>
      </span>
    </button>
  );
}

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
 * `<AccordionCard>` — the zero-JS accordion (2.5.0; 4.0.0 TRUE HEIGHT
 * EXPANSION).
 *
 * `<details class="sig-accordion">` → `<summary
 * class="sig-accordion__summary">` (title + the token chevron) → the
 * `__body` div → the `__body-inner` div. No state, no handler, no
 * aria wiring: `<details>` carries disclosure semantics natively, the
 * marker is stripped in css (list-style: none + ::-webkit-details-
 * marker), and `details[open] .sig-accordion__chevron` rotates the
 * chevron 180° — an attribute selector answering an attribute the
 * USER toggled.
 *
 * THE 4.0.0 EXPANSION: the body animates through the modern
 * grid-rows technique — `.sig-accordion__body` is `display: grid;
 * grid-template-rows: 0fr` and `details[open]` expands it to `1fr`
 * (the transition rides 320ms × --ease-spring-gentle), with
 * `__body-inner` carrying `overflow: hidden` so the content clips
 * during the glide. No max-height hack, no JS measurement — the
 * native details/summary mechanism still IS the state machine, the
 * animation is pure CSS answering `details[open]`.
 *
 * @example
 * ```tsx
 * <AccordionCard title="House Rules">
 *   <p>Conflict resolves to rock-paper-scissors, best of one.</p>
 * </AccordionCard>
 * ```
 */
export function AccordionCard({ title, children }: AccordionCardProps) {
  return (
    <details className="sig-accordion">
      <summary className="sig-accordion__summary">
        {title}
        <Icon name="ChevronDown" className="sig-accordion__chevron" aria-hidden />
      </summary>
      <div className="sig-accordion__body">
        <div className="sig-accordion__body-inner">{children}</div>
      </div>
    </details>
  );
}

/** One side of a `<MatchupCard>`: the competitor's name + optional chromatic ring. */
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
 * 0.75rem). The avatars carry the chromatic rings when `ringToken` is set —
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
export function MatchupCard({ title, left, right, stakes }: MatchupCardProps) {
  return (
    <div className="sig-matchup">
      {title !== undefined && (
        <strong className="sig-matchup__title">{title}</strong>
      )}
      <span className="sig-matchup__side">
        <Avatar name={left.name} ringToken={left.ringToken} size={40} />
        <span>{left.name}</span>
      </span>
      <span className="sig-matchup__vs">VS</span>
      <span className="sig-matchup__side">
        <Avatar name={right.name} ringToken={right.ringToken} size={40} />
        <span>{right.name}</span>
      </span>
      {stakes !== undefined && (
        <footer className="sig-matchup__stakes">{stakes}</footer>
      )}
    </div>
  );
}

/* ==========================================================================
   THE UNIVERSAL DEVELOPER CARD SUITE (2.6.0) — five archetypes that make
   "a card about anything" a one-line import. All token-driven, flat DOM,
   chromatic through the shared [data-accent] + --sig-accent contract.
   ========================================================================== */

/**
 * The shared chromatic mechanism (2.6.0): the root element wears
 * `data-accent` + the inline `--sig-accent` variable so the css side
 * paints (underline, badges, glow) — identical to <SurfaceCard>'s and
 * AnnouncementBanner's inline-variable mechanism.
 */
function accentProps(
  accentToken: AccentToken | undefined,
): { "data-accent"?: true; style?: CSSProperties } {
  if (accentToken === undefined) {
    return {};
  }
  return {
    "data-accent": true,
    style: { "--sig-accent": `var(${accentToken})` } as CSSProperties,
  };
}

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
export function ContentCard({
  title,
  description,
  image,
  category,
  categoryToken,
  meta,
  accentToken,
  action,
  className,
}: ContentCardProps) {
  const classes =
    className !== undefined ? `sig-content-card ${className}` : "sig-content-card";
  // The gradient art: accent-tinted 135° wash into the inset ground —
  // 100% var()/color-mix, zero hex (falls back to Flamingo when no
  // accentToken is set).
  const art = image
    ? `url("${image}") center / cover no-repeat`
    : `linear-gradient(135deg, color-mix(in srgb, var(--sig-accent, var(--color-cake-primary)) 30%, var(--bg-inset)), var(--bg-inset))`;
  return (
    <section className={classes} {...accentProps(accentToken)}>
      <div className="sig-content-card__visual" style={{ background: art }} />
      {(category !== undefined || meta !== undefined) && (
        <div className="sig-content-card__meta">
          {category !== undefined && categoryToken !== undefined && (
            <SigBadge colorToken={categoryToken} label={category} />
          )}
          {meta?.map((pill) => (
            <span key={pill} className="sig-content-card__pill">
              {pill}
            </span>
          ))}
        </div>
      )}
      <h3 className="sig-content-card__title">{title}</h3>
      {description !== undefined && (
        <p className="sig-content-card__desc">{description}</p>
      )}
      {action !== undefined && (
        <footer className="sig-content-card__footer">
          <Button variant="secondary" size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        </footer>
      )}
    </section>
  );
}

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
export function ReferenceCard({
  tag,
  title,
  code,
  accentToken,
  link,
  onCopied,
  className,
}: ReferenceCardProps) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | null>(null);
  // The one-shot copied-reset timer never outlives the card.
  useEffect(
    () => () => {
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    },
    [],
  );

  const copy = (): void => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopied(true);
        onCopied?.();
        if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
        resetTimer.current = window.setTimeout(() => {
          setCopied(false);
          resetTimer.current = null;
        }, 2000);
      })
      .catch(() => {
        // Clipboard unavailable (permissions / insecure context): stay
        // silent — the label must never flash "Copied!" on a failure.
      });
  };

  const classes =
    className !== undefined
      ? `sig-reference-card ${className}`
      : "sig-reference-card";
  return (
    <section className={classes} {...accentProps(accentToken)}>
      <div className="sig-reference-card__top">
        <span className="sig-reference-card__tag">{tag}</span>
        {link !== undefined && (
          <a
            className="sig-reference-card__link"
            href={link}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open reference: ${title}`}
          >
            <Icon name="ArrowUpRight" aria-hidden />
          </a>
        )}
      </div>
      <h3 className="sig-reference-card__title">{title}</h3>
      <pre
        className="sig-reference-card__code"
        /* 3.6.0 a11y: the snippet well is a scrollable region — keyboard
           access is REQUIRED (axe scrollable-region-focusable). */
        tabIndex={0}
        aria-label={`Code snippet: ${title}`}
      >
        <code>{code}</code>
      </pre>
      <footer className="sig-reference-card__footer">
        <Button variant="ghost" size="sm" leftIcon="Copy" onClick={copy}>
          {copied ? "Copied!" : "Copy Snippet"}
        </Button>
        {link !== undefined && (
          <a className="sig-reference-card__anchor" href={link}>
            Reference ↗
          </a>
        )}
      </footer>
    </section>
  );
}

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
  /** The feature list — each a Check bullet (sig-green). */
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
 * feature `<ul>` (each `<li>` a sig-green Check bullet), and the CTA
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
export function TierCard({
  name,
  price,
  features,
  accentToken,
  featured = false,
  cta,
  onCta,
  className,
}: TierCardProps) {
  const classes = [
    "sig-tier-card",
    ...(featured ? ["sig-tier-card--featured"] : []),
    ...(className !== undefined ? [className] : []),
  ].join(" ");
  return (
    <section
      className={classes}
      data-elevation={featured ? "floating" : "raised"}
      {...accentProps(accentToken)}
    >
      <span className="sig-tier-card__name">{name}</span>
      <span className="sig-tier-card__price">{price}</span>
      <ul className="sig-tier-card__features">
        {features.map((feature) => (
          <li key={feature}>
            <Icon name="Check" aria-hidden />
            {feature}
          </li>
        ))}
      </ul>
      <Button
        variant={featured ? "primary" : "secondary"}
        onClick={onCta}
      >
        {cta ?? "Choose"}
      </Button>
    </section>
  );
}

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
 * ONE `<section class="sig-profile-card">`: the 40px `<Avatar>` (chromatic
 * ring via `accentToken` — the Rule of Engagement as typed), the name
 * (weight 600) over the muted role, the stats row (value tabular-nums
 * weight 600 text-main, label muted 0.6875rem; min 2 / max 3 entries,
 * dev-warned outside), and the skills row (SigBadges).
 *
 * @example
 * ```tsx
 * <ProfileCard
 *   name="Ana Souza" role="Head of Catering" accentToken="--sig-peach"
 *   stats={[{ label: "Events", value: "24" }, { label: "Members", value: "412" }]}
 *   skills={[{ colorToken: "--sig-peach", label: "Catering" }]}
 * />
 * ```
 */
export function ProfileCard({
  name,
  role,
  stats,
  skills,
  accentToken,
  avatarSize = 40,
  className,
}: ProfileCardProps) {
  if (stats !== undefined && (stats.length < 2 || stats.length > 3)) {
    console.warn(
      `[signature-style] ProfileCard "${name}" carries ${stats.length} stats — the row reads best with 2–3 (fewer is empty, more wraps).`,
    );
  }
  const classes =
    className !== undefined ? `sig-profile-card ${className}` : "sig-profile-card";
  return (
    <section className={classes}>
      <Avatar name={name} size={avatarSize} ringToken={accentToken} />
      <div className="sig-profile-card__id">
        <strong className="sig-profile-card__name">{name}</strong>
        <span className="sig-profile-card__role">{role}</span>
      </div>
      {stats !== undefined && (
        <div className="sig-profile-card__stats">
          {stats.map((stat) => (
            <div key={stat.label} className="sig-profile-card__stat">
              <span className="sig-profile-card__stat-value">{stat.value}</span>
              <span className="sig-profile-card__stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      )}
      {skills !== undefined && (
        <div className="sig-profile-card__skills">
          {skills.map((skill) => (
            <SigBadge key={skill.label} colorToken={skill.colorToken} label={skill.label} />
          ))}
        </div>
      )}
    </section>
  );
}

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
export function ChronicleTimeline({
  releases,
  label,
  className,
}: ChronicleTimelineProps) {
  const classes =
    className !== undefined ? `sig-chronicle ${className}` : "sig-chronicle";
  return (
    <ol className={classes} aria-label={label ?? "Version chronicle"}>
      {releases.map((release) => (
        <li
          key={release.tag}
          className="sig-chronicle__item"
          style={
            {
              "--accent": `var(${release.accentToken ?? "--sig-lavender"})`,
            } as CSSProperties
          }
        >
          <span className="sig-chronicle__node" />
          <span className="sig-chronicle__tag">{release.tag}</span>
          <div className="sig-chronicle__body">
            <strong>{release.title}</strong>
            {release.story !== undefined && (
              <span className="sig-chronicle__story">{release.story}</span>
            )}
            {release.stat !== undefined && (
              <span className="sig-chronicle__stat">{release.stat}</span>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
