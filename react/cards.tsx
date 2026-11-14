/**
 * cards — the ARCHETYPE CARDS (2.5.0 "Ergonomic Form Rules, Button &
 * Card Archetypes, and the 12-Column Bento").
 *
 * Four composable card metaphors the composition layer kept hand-
 * rolling, now official, wired to css/cards.css:
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
 * DOCTRINE: cards are STRUCTURE — hairlines separate, never shadows
 * (css/cards.css is shadow-free and hex-free, the e1 scope holds);
 * Flamingo/Teal stays structural (hover borders, focus rings); --party-*
 * rides only where the Rule of Engagement already admits it (avatar
 * rings). Zero decorative wrappers: every element carries content or a
 * justified composition job.
 */

import { useState } from "react";
import type { ReactNode } from "react";
import { Icon, type IconName, type PartyTokenName } from "./primitives.js";
import { Avatar } from "./forms.js";

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
 * ONE `<button class="ptp-action-tile">` → the icon well (a 40px
 * rounded `.ptp-action-tile__well` on --bg-inset), the body
 * (strong title + muted subtitle), and the optional
 * `.ptp-action-tile__kbd` shortcut chip (mono, inset — the standalone
 * cousin of the prose kbd chip; css/cards.css owns it because
 * editorial.css scopes its kbd under .ptp-prose). ZERO divs: spans
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
    <button type="button" className="ptp-action-tile" onClick={onClick}>
      <span className="ptp-action-tile__well">
        <Icon name={icon} aria-hidden />
      </span>
      <span className="ptp-action-tile__body">
        <strong>{title}</strong>
        {subtitle !== undefined && <span>{subtitle}</span>}
      </span>
      {kbdShortcut !== undefined && (
        <kbd className="ptp-action-tile__kbd">{kbdShortcut}</kbd>
      )}
    </button>
  );
}

/**
 * Props for `<FlipCard>` — INTERNAL state by design (the uncontrolled
 * default): the card owns its flipped boolean, `aria-pressed` carries
 * it to the DOM, `onFlip` (optional) reports each flip. A controlled
 * mode can be added later without breaking this surface.
 */
export interface FlipCardProps {
  /** The face content (any nodes — text, prose, a PartyBadge). */
  front: ReactNode;
  /** The hidden face revealed by the flip. */
  back: ReactNode;
  /** Fired AFTER each flip with the NEW state (true = showing back). */
  onFlip?: (flipped: boolean) => void;
}

/**
 * `<FlipCard>` — the two-face reveal (2.5.0).
 *
 * ONE `<button class="ptp-flip-card" aria-pressed>` — THE FLAT
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
export function FlipCard({ front, back, onFlip }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      type="button"
      className="ptp-flip-card"
      aria-pressed={flipped}
      onClick={() => {
        const next = !flipped;
        setFlipped(next);
        onFlip?.(next);
      }}
    >
      <span className="ptp-flip-card__inner">
        <span className="ptp-flip-card__face ptp-flip-card__front">
          <span className="ptp-flip-card__tag">FRONT</span>
          {front}
        </span>
        <span className="ptp-flip-card__face ptp-flip-card__back">
          <span className="ptp-flip-card__tag">BACK</span>
          {back}
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
 * `<AccordionCard>` — the zero-JS accordion (2.5.0).
 *
 * `<details class="ptp-accordion">` → `<summary
 * class="ptp-accordion__summary">` (title + the token chevron) → the
 * `__body` div. No state, no handler, no aria wiring: `<details>`
 * carries disclosure semantics natively, the marker is stripped in css
 * (list-style: none + ::-webkit-details-marker), and
 * `details[open] .ptp-accordion__chevron` rotates the chevron 180° —
 * an attribute selector answering an attribute the USER toggled.
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
    <details className="ptp-accordion">
      <summary className="ptp-accordion__summary">
        {title}
        <Icon name="ChevronDown" className="ptp-accordion__chevron" aria-hidden />
      </summary>
      <div className="ptp-accordion__body">{children}</div>
    </details>
  );
}

/** One side of a `<MatchupCard>`: the competitor's name + optional party ring. */
export interface MatchupSide {
  /** The competitor's name — also the Avatar's accessible name. */
  name: string;
  /** A `--party-*` content token for the 2px avatar ring (typed). */
  ringToken?: PartyTokenName;
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
 * `<div class="ptp-matchup">` (grid `1fr auto 1fr`, centered) → side /
 * VS pill / side, each side a centered column (the 40px `<Avatar>` +
 * the name), the VS pill a mono inset capsule, and the optional
 * `__stakes` footer on `grid-column: 1 / -1` (inset well, mono muted
 * 0.75rem). The avatars carry the party rings when `ringToken` is set —
 * content decoration, the Rule of Engagement as typed.
 *
 * @example
 * ```tsx
 * <MatchupCard
 *   left={{ name: "Ana Souza", ringToken: "--party-mauve-soft" }}
 *   right={{ name: "Leo Martins", ringToken: "--party-sky" }}
 *   stakes="Winner picks the next venue — loser brings the ice."
 * />
 * ```
 */
export function MatchupCard({ title, left, right, stakes }: MatchupCardProps) {
  return (
    <div className="ptp-matchup">
      {title !== undefined && (
        <strong className="ptp-matchup__title">{title}</strong>
      )}
      <span className="ptp-matchup__side">
        <Avatar name={left.name} ringToken={left.ringToken} size={40} />
        <span>{left.name}</span>
      </span>
      <span className="ptp-matchup__vs">VS</span>
      <span className="ptp-matchup__side">
        <Avatar name={right.name} ringToken={right.ringToken} size={40} />
        <span>{right.name}</span>
      </span>
      {stakes !== undefined && (
        <footer className="ptp-matchup__stakes">{stakes}</footer>
      )}
    </div>
  );
}
