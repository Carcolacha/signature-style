import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
 * `PartyColorToken`/`AccentToken` typed):
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
 * Flamingo/Teal stays structural (hover borders, focus rings); --party-*
 * rides where the Rule of Engagement admits it (avatar rings, Check
 * bullets, badges, chronicle accents). Zero decorative wrappers: every
 * element carries content or a justified composition job.
 */
import { useEffect, useRef, useState } from "react";
import { Button, Icon, } from "./primitives.js";
import { Avatar } from "./forms.js";
import { PartyBadge } from "./primitives.js";
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
export function ActionTile({ title, subtitle, icon, kbdShortcut, onClick }) {
    return (_jsxs("button", { type: "button", className: "ptp-action-tile", onClick: onClick, children: [_jsx("span", { className: "ptp-action-tile__well", children: _jsx(Icon, { name: icon, "aria-hidden": true }) }), _jsxs("span", { className: "ptp-action-tile__body", children: [_jsx("strong", { children: title }), subtitle !== undefined && _jsx("span", { children: subtitle })] }), kbdShortcut !== undefined && (_jsx("kbd", { className: "ptp-action-tile__kbd", children: kbdShortcut }))] }));
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
export function FlipCard({ front, back, onFlip }) {
    const [flipped, setFlipped] = useState(false);
    return (_jsx("button", { type: "button", className: "ptp-flip-card", "aria-pressed": flipped, onClick: () => {
            const next = !flipped;
            setFlipped(next);
            onFlip?.(next);
        }, children: _jsxs("span", { className: "ptp-flip-card__inner", children: [_jsxs("span", { className: "ptp-flip-card__face ptp-flip-card__front", children: [_jsx("span", { className: "ptp-flip-card__tag", children: "FRONT" }), front] }), _jsxs("span", { className: "ptp-flip-card__face ptp-flip-card__back", children: [_jsx("span", { className: "ptp-flip-card__tag", children: "BACK" }), back] })] }) }));
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
export function AccordionCard({ title, children }) {
    return (_jsxs("details", { className: "ptp-accordion", children: [_jsxs("summary", { className: "ptp-accordion__summary", children: [title, _jsx(Icon, { name: "ChevronDown", className: "ptp-accordion__chevron", "aria-hidden": true })] }), _jsx("div", { className: "ptp-accordion__body", children: children })] }));
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
export function MatchupCard({ title, left, right, stakes }) {
    return (_jsxs("div", { className: "ptp-matchup", children: [title !== undefined && (_jsx("strong", { className: "ptp-matchup__title", children: title })), _jsxs("span", { className: "ptp-matchup__side", children: [_jsx(Avatar, { name: left.name, ringToken: left.ringToken, size: 40 }), _jsx("span", { children: left.name })] }), _jsx("span", { className: "ptp-matchup__vs", children: "VS" }), _jsxs("span", { className: "ptp-matchup__side", children: [_jsx(Avatar, { name: right.name, ringToken: right.ringToken, size: 40 }), _jsx("span", { children: right.name })] }), stakes !== undefined && (_jsx("footer", { className: "ptp-matchup__stakes", children: stakes }))] }));
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
function accentProps(accentToken) {
    if (accentToken === undefined) {
        return {};
    }
    return {
        "data-accent": true,
        style: { "--sig-accent": `var(${accentToken})` },
    };
}
/**
 * `<ContentCard>` — the universal content card (2.6.0).
 *
 * ONE `<section class="sig-content-card" [data-accent]>`: the 16/9
 * visual header (`__visual` — the image URL or the accent-tinted
 * gradient art; css owns `aspect-ratio: 16 / 9`), the meta row
 * (`__meta` — the category PartyBadge + the mono `__pill` chips), the
 * accent-underlined title, the muted description, and the action
 * footer (`margin-top: auto` parks it at the card's floor). The
 * Button is the PACKAGE's — the archetype composes, never re-invents.
 *
 * @example
 * ```tsx
 * <ContentCard
 *   category="Catering" categoryToken="--party-peach"
 *   meta={["25 MIN", "SPICY", "$14"]} accentToken="--party-yellow"
 *   title="Birria & Street Taco Catering"
 *   description="Slow-braised birria, consomé on the side."
 *   action={{ label: "Book the taco cart" }}
 * />
 * ```
 */
export function ContentCard({ title, description, image, category, categoryToken, meta, accentToken, action, className, }) {
    const classes = className !== undefined ? `sig-content-card ${className}` : "sig-content-card";
    // The gradient art: accent-tinted 135° wash into the inset ground —
    // 100% var()/color-mix, zero hex (falls back to Flamingo when no
    // accentToken is set).
    const art = image
        ? `url("${image}") center / cover no-repeat`
        : `linear-gradient(135deg, color-mix(in srgb, var(--sig-accent, var(--color-cake-primary)) 30%, var(--bg-inset)), var(--bg-inset))`;
    return (_jsxs("section", { className: classes, ...accentProps(accentToken), children: [_jsx("div", { className: "sig-content-card__visual", style: { background: art } }), (category !== undefined || meta !== undefined) && (_jsxs("div", { className: "sig-content-card__meta", children: [category !== undefined && categoryToken !== undefined && (_jsx(PartyBadge, { colorToken: categoryToken, label: category })), meta?.map((pill) => (_jsx("span", { className: "sig-content-card__pill", children: pill }, pill)))] })), _jsx("h3", { className: "sig-content-card__title", children: title }), description !== undefined && (_jsx("p", { className: "sig-content-card__desc", children: description })), action !== undefined && (_jsx("footer", { className: "sig-content-card__footer", children: _jsx(Button, { variant: "secondary", size: "sm", onClick: action.onClick, children: action.label }) }))] }));
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
 *   tag="JSX" title="The Signature Surface" accentToken="--party-sky"
 *   code="<SurfaceCard eyebrow=\"Hi\" title=\"Hello\" />"
 *   onCopied={() => toast("success", "Snippet copied")}
 * />
 * ```
 */
export function ReferenceCard({ tag, title, code, accentToken, link, onCopied, className, }) {
    const [copied, setCopied] = useState(false);
    const resetTimer = useRef(null);
    // The one-shot copied-reset timer never outlives the card.
    useEffect(() => () => {
        if (resetTimer.current !== null)
            window.clearTimeout(resetTimer.current);
    }, []);
    const copy = () => {
        navigator.clipboard
            .writeText(code)
            .then(() => {
            setCopied(true);
            onCopied?.();
            if (resetTimer.current !== null)
                window.clearTimeout(resetTimer.current);
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
    const classes = className !== undefined
        ? `sig-reference-card ${className}`
        : "sig-reference-card";
    return (_jsxs("section", { className: classes, ...accentProps(accentToken), children: [_jsxs("div", { className: "sig-reference-card__top", children: [_jsx("span", { className: "sig-reference-card__tag", children: tag }), link !== undefined && (_jsx("a", { className: "sig-reference-card__link", href: link, target: "_blank", rel: "noreferrer", "aria-label": `Open reference: ${title}`, children: _jsx(Icon, { name: "ArrowUpRight", "aria-hidden": true }) }))] }), _jsx("h3", { className: "sig-reference-card__title", children: title }), _jsx("pre", { className: "sig-reference-card__code", children: _jsx("code", { children: code }) }), _jsxs("footer", { className: "sig-reference-card__footer", children: [_jsx(Button, { variant: "ghost", size: "sm", leftIcon: "Copy", onClick: copy, children: copied ? "Copied!" : "Copy Snippet" }), link !== undefined && (_jsx("a", { className: "sig-reference-card__anchor", href: link, children: "Reference \u2197" }))] })] }));
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
 *   name="Arena Pass" price="$49" featured accentToken="--party-mauve-soft"
 *   features={["All 40 game modules", "1v1 & 2v2 brackets"]}
 *   cta="Claim the pass"
 * />
 * ```
 */
export function TierCard({ name, price, features, accentToken, featured = false, cta, onCta, className, }) {
    const classes = [
        "sig-tier-card",
        ...(featured ? ["sig-tier-card--featured"] : []),
        ...(className !== undefined ? [className] : []),
    ].join(" ");
    return (_jsxs("section", { className: classes, "data-elevation": featured ? "floating" : "raised", ...accentProps(accentToken), children: [_jsx("span", { className: "sig-tier-card__name", children: name }), _jsx("span", { className: "sig-tier-card__price", children: price }), _jsx("ul", { className: "sig-tier-card__features", children: features.map((feature) => (_jsxs("li", { children: [_jsx(Icon, { name: "Check", "aria-hidden": true }), feature] }, feature))) }), _jsx(Button, { variant: featured ? "primary" : "secondary", onClick: onCta, children: cta ?? "Choose" })] }));
}
/**
 * `<ProfileCard>` — the person card (2.6.0).
 *
 * ONE `<section class="sig-profile-card">`: the 40px `<Avatar>` (party
 * ring via `accentToken` — the Rule of Engagement as typed), the name
 * (weight 600) over the muted role, the stats row (value tabular-nums
 * weight 600 text-main, label muted 0.6875rem; min 2 / max 3 entries,
 * dev-warned outside), and the skills row (PartyBadges).
 *
 * @example
 * ```tsx
 * <ProfileCard
 *   name="Ana Souza" role="Head of Catering" accentToken="--party-peach"
 *   stats={[{ label: "Events", value: "24" }, { label: "Guests", value: "412" }]}
 *   skills={[{ colorToken: "--party-peach", label: "Catering" }]}
 * />
 * ```
 */
export function ProfileCard({ name, role, stats, skills, accentToken, avatarSize = 40, className, }) {
    if (stats !== undefined && (stats.length < 2 || stats.length > 3)) {
        console.warn(`[signature-style] ProfileCard "${name}" carries ${stats.length} stats — the row reads best with 2–3 (fewer is empty, more wraps).`);
    }
    const classes = className !== undefined ? `sig-profile-card ${className}` : "sig-profile-card";
    return (_jsxs("section", { className: classes, children: [_jsx(Avatar, { name: name, size: avatarSize, ringToken: accentToken }), _jsxs("div", { className: "sig-profile-card__id", children: [_jsx("strong", { className: "sig-profile-card__name", children: name }), _jsx("span", { className: "sig-profile-card__role", children: role })] }), stats !== undefined && (_jsx("div", { className: "sig-profile-card__stats", children: stats.map((stat) => (_jsxs("div", { className: "sig-profile-card__stat", children: [_jsx("span", { className: "sig-profile-card__stat-value", children: stat.value }), _jsx("span", { className: "sig-profile-card__stat-label", children: stat.label })] }, stat.label))) })), skills !== undefined && (_jsx("div", { className: "sig-profile-card__skills", children: skills.map((skill) => (_jsx(PartyBadge, { colorToken: skill.colorToken, label: skill.label }, skill.label))) }))] }));
}
/**
 * `<ChronicleTimeline>` — the release chronicle (2.6.0).
 *
 * ONE `<ol class="ptp-chronicle" aria-label>`: per release an `<li>`
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
 *     { tag: "v2.6.0", title: "Universal Developer Card Suite", accentToken: "--party-peach" },
 *   ]}
 * />
 * ```
 */
export function ChronicleTimeline({ releases, label, className, }) {
    const classes = className !== undefined ? `ptp-chronicle ${className}` : "ptp-chronicle";
    return (_jsx("ol", { className: classes, "aria-label": label ?? "Version chronicle", children: releases.map((release) => (_jsxs("li", { className: "ptp-chronicle__item", style: {
                "--accent": `var(${release.accentToken ?? "--party-lavender"})`,
            }, children: [_jsx("span", { className: "ptp-chronicle__node" }), _jsx("span", { className: "ptp-chronicle__tag", children: release.tag }), _jsxs("div", { className: "ptp-chronicle__body", children: [_jsx("strong", { children: release.title }), release.story !== undefined && (_jsx("span", { className: "ptp-chronicle__story", children: release.story })), release.stat !== undefined && (_jsx("span", { className: "ptp-chronicle__stat", children: release.stat }))] })] }, release.tag))) }));
}
