# @edwyn/signature-style

> One command. One import. Your entire personal UI theme — Catppuccin-mapped, cake colors, zero manual hex codes.

📖 **Read the manual:** [STORYBOOK.md](./STORYBOOK.md) — the official, human-readable guide to the philosophy, every color token, and the component API.

`@edwyn/signature-style` installs edwyn's **Signature Style** into any project:
a **harmonized** foundation — 100% official Catppuccin, per-theme
(**Mocha (dark) by default, Latte (light) on request**, each wearing its own
palette's signature Flamingo/Teal pairing) — where every hover, active,
disabled and focus-visible state is *derived* from the core tokens
instead of hand-authored. It ships a zero-dependency CSS core, an optional
hardened React provider, a machine-readable token manifest, and the
**Dynamic Signature Engine v2.4** system prompt so AI agents can extend the
style faithfully.

```
npm i @edwyn/signature-style
```

## Import paths (v1.0.0)

| Import | Resolves to | Peers needed |
|---|---|---|
| `@edwyn/signature-style` | `tokens.json` — the machine-readable manifest (AI tooling core) | never |
| `@edwyn/signature-style/css` | `css/signature-style.css` — the compiled bundle: tokens, base, cascade (timeline + modal + nav included), overrides | never |
| `@edwyn/signature-style/react` | umbrella `react/index.js` — `ThemeProvider`, `Icon`, `EmptyState`, `PartyBadge`, `EventTimeline`, `EventModal`, `useModal`, `GlobalNav`, `ProgressBar`, `StatRing` | `react` + `react-dom`; `lucide-react` optional |

## CSS usage — one import

```html
<link rel="stylesheet" href="node_modules/@edwyn/signature-style/css/signature-style.css" />
```

or with a bundler:

```js
import "@edwyn/signature-style/css"; // → css/signature-style.css
```

The bundle covers everything — `tokens.css`, `cascade.css` (with the
timeline, modal and nav layers), and `overrides.css` are already layered into
it. The granular stylesheets and `SYSTEM_PROMPT.md` still ship in the
tarball, but there are no export-map entries for them anymore: import
them via the node_modules path (or a deep import) at your own risk.

### Light theme — one attribute

The white version is Catppuccin Latte. Opt in on any element that wraps your
app (usually `<html>`):

```html
<html data-theme="latte">
```

No second stylesheet, no JS, no rebuild — the `[data-theme="latte"]` block
ships inside `@layer tokens` in `tokens.css`.

## React usage

```tsx
import { ThemeProvider } from "@edwyn/signature-style/react";

export function Root() {
  return (
    <ThemeProvider theme={{ "--color-cake-primary": "#FFD1DC" }}>
      <App />
    </ThemeProvider>
  );
}
```

The provider injects your token overrides into `@layer tokens`, and — before
anything else — claims the canonical layer order as the first style tag in
`<head>`. It is SSR-safe, leak-proof, and rejects unknown token keys.

As of 0.4.0 the whitelist covers **every** custom property in
`css/tokens.css` — the core 6, the keeper tokens, the shared
font/radius/transition/spacing tokens, the z-index scale (now with the
navbar rung `--z-nav`), and the ten
`--party-*` content tokens (32 keys, typed at compile time and enforced at
runtime):

```tsx
<ThemeProvider
  theme={{
    "--color-cake-primary": "#F2CDCD", // signature Mocha Flamingo
    "--bg-inset": "#282A36",           // keeper — inset wells, code blocks
    "--space-standard": "1rem",        // 8px grid tier 2
    "--z-modal": "50",                 // z-index scale (Pillar 3)
  }}
>
  <App />
</ThemeProvider>
```

Guard logic is unchanged: values containing `{`, `}`, `;` or `\` are warned
and dropped; unknown keys are warned and dropped.

> **Per-theme harmony (0.3.0 decision):** the signature accents are each
> theme's *own* official Catppuccin pairing — Mocha Flamingo `#F2CDCD` /
> Mocha Teal `#94E2D5` on the dark side, Latte Flamingo `#DD7878` /
> Latte Teal `#179299` on the light side. Contrast is correct on both sides
> of the toggle by construction — the 0.2.1 pale-rings-on-Latte tradeoff is
> resolved, and no custom hexes remain in the palette.

## The three doctrines

1. **Token Cascade** — one token in, four states out. Hover lightens
   (`color-mix … 85%, white`), active darkens (`… 85%, black`) and presses
   (`transform: scale(0.97)`), disabled grays out (`--bg-surface` +
   `--text-muted`), focus rings with `--color-cake-primary`. You never write
   a state hex code.
2. **Override Protocol** — scoped utilities (`.override-danger`,
   `.override-success`, `.override-gold`) that break the rules for ONE
   component locally. Never a `:root` edit. Overrides are the Golden Weapon.
3. **Progressive Enhancement** — a minimal, zero-dependency CSS core; the
   React provider is peer-dependency only; legacy browsers get a
   `filter: brightness()` fallback instead of broken states (the scale press
   needs no fallback — transforms work everywhere).

## Hardening

| ID | Vulnerability | Patch |
|---|---|---|
| VULN-1 | `color-mix()` unsupported → hover/active silently dead | `@supports not (color: color-mix(in srgb, red, blue))` block re-derives states via `filter: brightness(1.12)` / `brightness(0.88)` |
| VULN-2 | `@layer` fragility: unlayered host CSS beats layered CSS; layer-order races | `ThemeProvider` injects `@layer tokens, base, cascade, overrides;` as the FIRST style tag in `<head>` + `CSSLayerBlockRule` support warning; bundle declares the same order statically |
| VULN-3 | Provider FOUC, style-tag leaks, arbitrary prop injection | Isomorphic layout effect (`useLayoutEffect`/`useEffect`), `useId`-keyed deduped style tags, strict self-only cleanup, memoized serialization, token whitelist (all 33 tokens, type + runtime), CSS-injection guard on values |

## Changelog

### 1.5.0 — Bento Box Showcase

- **The playground** — a real consumer app (`npm run playground` →
  http://localhost:5173) that imports the package through the PUBLISHED
  exports map (`@edwyn/signature-style/css` + `@edwyn/signature-style/react`
  via the `"@edwyn/signature-style": "file:."` self-link in
  devDependencies). Every module the library ships, on ONE asymmetric
  grid — `playground/` is excluded from `npm pack` by the files array,
  so the tarball stays exactly 34 files.
- **What each bento card proves**:
  - **Form Controls** — `<Input>`, `<TextArea>`, `<ToggleSwitch>` and a
    doctrine button firing `toast("success", …)` — the 1.4.0 feedback
    layer works end-to-end through a consumer's bundle.
  - **Timeline** — `<EventTimeline>` with six events across two date
    buckets; clicking a node opens `<EventModal>` via `useModal` — the
    0.6.0 + 0.7.0 composition, portaled overlay and all.
  - **Telemetry** — `<ProgressBar>` (party-green / party-peach) and
    `<StatRing>` (party-sky) with consumer-rendered label rows — the
    Rule of Engagement (party tokens = content only) in practice.
  - **Party Palette** — all ten `--party-*` tokens as `<PartyBadge>`s
    ("Pink" through "Green"), wrapped at `var(--space-tight)`.
- **The grid itself** — `.bento` (3 columns, `var(--space-section)`
  gaps, 75rem max) with placements for the tall timeline card; collapses
  to a single column at 768px. Zero hex literals — 100%
  `var()`/`color-mix()`, including the card hairline:
  `color-mix(in srgb, var(--text-muted) 20%, transparent)`.
- **Release gates** — `npm run verify:playground` (b1–b7): scaffold
  present, consumer wiring + exports/files/main deep-equal to 1.4.0,
  `npm pack` = 34 files, zero hex, 4-card DOM shape, lucide icon names
  verified against the installed icons map, and the core-file safety
  diff (`git diff v1.4.0 -- css/ react/ tokens.json SYSTEM_PROMPT.md
  demo/ scripts/`) empty.
- **Note** — `scripts/verify.mjs` is byte-frozen; the 1.5.0 gates live
  in `playground/verify-playground.mjs`. The playground is
  vite-checked (`npx vite build`), not root-tsc-checked.

### 1.4.0 — Input & Feedback Layer

- **The Input & Feedback primitives** — three flat form controls plus
  the toast system, all wired to tokens, all following the Pruning
  Protocol:

  ```tsx
  import { Input, TextArea, ToggleSwitch, ToastProvider, useToast }
    from "@edwyn/signature-style/react";

  // A field with the error FLAG — the message is yours:
  <Input
    value={name}
    onChange={(e) => setName(e.target.value)}
    error={name.length === 0 && "Name is required"}
    aria-describedby="name-error"
  />
  <span id="name-error">Name is required</span> {/* you render this */}

  // THE toggle — exactly ONE <button role="switch">, knob = ::before:
  <ToggleSwitch checked={on} onToggle={setOn} label="Enable notifications" />
  ```

  Wrap the app once, toast from anywhere beneath it:

  ```tsx
  <ToastProvider>
    <RsvpForm />
  </ToastProvider>

  // inside <RsvpForm>:
  const toast = useToast(); // throws without a provider — fail loudly
  saveRsvp().then(() => toast("success", "RSVP saved"))
            .catch(() => toast("error", "Could not save — try again"));
  ```

  - **`error` is a FLAG, not a message slot** — `<Input error>` /
    `<TextArea error>` only set `aria-invalid="true"`; the component
    never renders the error as text. You render your own message beside
    the field (and wire `aria-describedby` yourself) — the components
    stay flat: ONE element, no wrapper, no slot.
  - **`<ToggleSwitch>` is one DOM element** — a `<button type="button"
    role="switch">` whose knob is the CSS `::before` pseudo-element
    (peak pruning). State is the attribute: `[aria-checked="true"]`
    paints the Teal track and travels the knob.
  - **The status strips** — `toast(status, message)` maps success →
    `var(--party-green)`, error → `var(--party-peach)`, set INLINE as a
    `--status` custom property that css/toast.css reads for the 4px
    left border. Status is a content-outcome signal, so party tokens are
    the sanctioned palette here.
- **New stylesheet `css/forms.css`** — the inset wells
  (`--bg-inset` interiors, hairline borders, 14px Inter), the doctrine
  Flamingo focus ring, the peach error border, and the switch geometry
  (44×24px track, 16px knob, 20px travel). Layered into `cascade` after
  `viz.css`. Zero hex, zero box-shadow, `prefers-reduced-motion`
  respected.
- **New stylesheet `css/toast.css`** — the fixed bottom-right region at
  the zenith z-rung, the `toast-life` animation (slide in → hold → slide
  out over 3s, riding the owner's mechanical
  `cubic-bezier(0.2, 0.8, 0.2, 1)` — one curve shapes fast entry, long
  hold, fast exit; the timing function cannot be varied per keyframe
  segment, documented and deliberate). Toasts remove themselves on
  `animationend`; under `prefers-reduced-motion` the animation is
  disabled, so each toast also carries a matching 3s timeout fallback
  (idempotent — see css/toast.css and react/toast.tsx). Layered after
  `forms.css`. Zero hex, zero box-shadow.
- **The one new token: `--z-toast: 60`** — the zenith rung. The
  five-rung z-ladder (Pillar 3, theme-independent, `:root`-defined):

  | Token | Value | Layer |
  |---|---|---|
  | `--z-sticky` | 10 | sticky headers, toolbars |
  | `--z-nav` | 30 | the navbar notch (above sticky, below overlays) |
  | `--z-overlay` | 40 | dimming overlays, backdrops |
  | `--z-modal` | 50 | modals, popups, dropdowns |
  | `--z-toast` | 60 | **toasts — the zenith: above modals** |

  All other token VALUES are unchanged; `TOKEN_KEYS` grows 32 → 33
  (typed `KnownToken` union included).
- **The knob-color decision** — off knob: `--text-muted` on
  `--bg-surface`; on knob: `--bg-base` (the dark knob on the Teal
  track). The owner did not spec knob colors; the dark-on-accent pairing
  echoes the `--color-on-cake` doctrine (dark ink on bright cake
  surfaces). `--text-bright` was rejected: near-white on Teal is low
  contrast; dark-on-Teal is legible on both themes.
- **Release gates** — verify now asserts the forms stylesheet (inset
  wells, `aria-invalid` → peach, doctrine focus ring, knob travel,
  reduced-motion, zero hex / zero shadow), the toast stylesheet
  (`var(--z-toast, 60)`, `toast-life` keyframes, both status tokens,
  mechanical physics, zero hex / zero shadow), bundle membership order
  (viz → forms → toast), the five-rung z-ladder values 10/30/40/50/60,
  and all five feedback re-exports from the umbrella.

### 1.3.0 — Telemetry Module (Data Visualization)

- **`<ProgressBar>` + `<StatRing>`** — the telemetry primitives:
  lightweight SVG/HTML charting with **zero external charting
  dependencies**. Two shapes cover the PlanThenParty data story:

  ```tsx
  import { ProgressBar, StatRing } from "@edwyn/signature-style/react";

  // Budget bar — 72% remaining, on a party-green fill:
  <ProgressBar value={72} colorToken="--party-green" label="Budget remaining" />

  // RSVP ring — 85% of invitees in, on a party-sky arc:
  <StatRing value={85} colorToken="--party-sky" />
  ```

  - **`<ProgressBar value colorToken label? />`** — ONE
    `div.ptp-progress` (role="progressbar" with the full aria value
    contract) containing ONE `div.ptp-progress__fill` whose width is
    the clamped value. The fill animates `width 0.3s ease-out`
    (owner-mandated physics; `prefers-reduced-motion` disables it).
    Exactly two elements, no wrappers.
  - **`<StatRing value colorToken size? strokeWidth? label? />`** — ONE
    `<svg role="progressbar">` (viewBox `0 0 100 100`, default
    `size` 64 — an 8px-grid multiple) with exactly two circles
    (r 44): a `var(--bg-surface)` track and a party-colored progress
    arc revealed by `strokeDasharray = 2π·44` /
    `strokeDashoffset = C × (1 − v/100)`, rotated −90° so 0% starts at
    12 o'clock. `strokeWidth` is a `4 | 8` union (grid-perfect) and is
    converted to viewBox units, so the visual weight is exact at any
    size. No center text, no third element — consumers place their
    numbers beside the ring. Needs NO CSS at all: pure SVG attributes.
  - **Rule of Engagement, enforced twice** — `colorToken` is typed
    `PartyTokenName`, so a structural token like `--color-cake-primary`
    is a compile error; a runtime guard (`startsWith("--party-")`)
    warns and renders null for anything JS slips past the types (same
    warn-and-drop pattern as `<PartyBadge>`).
- **The data-ink doctrine** — high data-to-ink ratio, zero decoration:
  no grid lines, no drop shadows, no 3D. Tracks are structural chrome
  (`var(--bg-surface)`); data fills are ALWAYS `--party-*` content
  tokens. New stylesheet **`css/viz.css`** (`.ptp-progress*` classes
  only — the ring is attribute-driven), layered into `cascade` after
  `nav.css`: zero hex, zero box-shadow, `prefers-reduced-motion`
  respected. **No charting dependencies were added** — the React peers
  are unchanged, and `lucide-react` stays optional.
- **No new tokens** — the whitelist stays at 32 keys; `tokens.css` is
  untouched and the v0.3.0 structural freeze holds.
- **Release gates** — verify now asserts the viz stylesheet's contract
  (the 8px track, the owner physics, reduced motion, the surface track
  token, zero hex, zero box-shadow), its layered import after
  `nav.css`, the umbrella re-exports of `ProgressBar` / `StatRing` +
  prop types, and the runtime party guard in the viz source.

### 1.2.0 — GlobalNav

- **`<GlobalNav>`** — routing between views in PlanThenParty: a sticky
  navbar whose active state IS the `aria-current="page"` attribute (no
  `.is-active` class anywhere), plus a mobile drawer behind a hamburger
  at the strict 768px breakpoint. Two modes, one component:

  ```tsx
  import { GlobalNav } from "@edwyn/signature-style/react";

  // Plain-anchor mode — renders <a href>; activeHref sets aria-current="page":
  <GlobalNav
    items={[
      { href: "/timeline", label: "Timeline" },
      { href: "/budget", label: "Budget" },
    ]}
    activeHref="/timeline"
  />

  // React Router mode — pass NavLink as `as`; the ROUTER sets
  // aria-current, so leave activeHref undefined:
  import { NavLink } from "react-router";
  <GlobalNav as={NavLink} items={[{ href: "/timeline", label: "Timeline" }]} />
  ```

  - **Component-agnostic links** — `as?: React.ElementType` receives
    `{ href, className: "ptp-nav__link", children }`; the drawer links go
    through the same renderer.
  - **Mobile drawer** — `createPortal` to `document.body` (the modal.tsx
    architecture): it reuses the existing modal backdrop (z-40) as its
    scrim and the existing `.ptp-modal-close` class for its close button
    (the Teal hover stays the close signature). Escape closes with a
    cleaned-up listener, backdrop click closes, drawer links close, and
    focus moves into the drawer on open / back to the hamburger on close.
  - New stylesheet **`css/nav.css`** (`.ptp-nav*` classes), layered into
    `cascade` after `modal.css`. Token-driven: zero hex, zero box-shadow —
    the rgba scrim still lives ONLY in modal.css. Links press with
    `scale(0.97)`, the current page's underline is Flamingo, and the
    hamburger's hover is main-text (never Teal — that is the close
    signature).
- **New token `--z-nav: 30`** — the z-scale gains its missing rung, the
  gap between sticky chrome and the overlay scrim:

  | Token | Value | Role |
  |---|---|---|
  | `--z-sticky` | 10 | sticky headers, toolbars |
  | `--z-nav` | 30 | navbar — floats above sticky headers, below overlays |
  | `--z-overlay` | 40 | dimming overlays, backdrops |
  | `--z-modal` | 50 | modals, popups, dropdowns — and the nav drawer |

  The provider whitelist grows 31 → 32 keys (typed at compile time,
  enforced at runtime, same guards).
- **Release gates** — verify now asserts the nav stylesheet's contract
  (`var(--z-nav, 30)`, the 768px shift, the `[aria-current="page"]`
  selector, the `translateX` drawer states, zero hex, zero box-shadow),
  its layered import after `modal.css`, the umbrella re-exports of
  `GlobalNav` / `NavItem` / `GlobalNavProps`, and `--z-nav: 30` across
  `tokens.css` `:root`, `tokens.json` shared, and `TOKEN_KEYS`.

### 1.0.0 — Publish Flow & Distribution

Distribution release: no CSS, React or demo changes (the frontend is
locked; `css/`, `react/` and `demo/` are byte-identical to 0.7.0).
Packaging, CI and docs only.

- **3-path exports map** — the public surface is now exactly:

  | Path | Target |
  |---|---|
  | `@edwyn/signature-style` | `./tokens.json` (AI tooling core is the package root) |
  | `@edwyn/signature-style/css` | `./css/signature-style.css` (the compiled bundle — includes the timeline + modal layers) |
  | `@edwyn/signature-style/react` | umbrella `react/index.js` + `react/index.d.ts` |

  The older granular export entries (`./tokens.css`, `./cascade.css`,
  `./overrides.css`, `./tokens.json`, `./system-prompt.md`) are removed —
  **the bundle covers everything**. Consumers who need a granular file can
  still reach it inside the installed package via node_modules paths or
  deep imports, at their own risk. `main` is `./tokens.json`.
- **Strict peers, never bundled** — `react >=18` and `react-dom >=18` are
  required peer dependencies; `lucide-react >=0.400.0` stays a peer with
  `peerDependenciesMeta.optional: true` — **strictly peers, never bundled**;
  lucide is optional because only `./react` importers need it (CSS-only
  consumers never install icons). Nothing is added to `dependencies`.
- **Tag-driven npm publish (CI)** — `.github/workflows/publish.yml`:
  pushing a `v*` tag runs a `typecheck` job (`npm ci` →
  `npx tsc --noEmit`) and then the `publish` job (`npm ci` →
  `node scripts/verify.mjs` — the parity gates are a **release blocker**
  → `npm publish --access public` with the `NPM_TOKEN` repo secret).
  Full runbook: [`docs/PUBLISHING.md`](./docs/PUBLISHING.md).
- **Distribution-contract gate** — verify's export gate now pins the exact
  3-path map: every target must exist on disk, `main` must be
  `./tokens.json`, and the removed granular entries must not return.
- **`package.json` `files` unchanged** — the tarball still ships exactly
  21 files (6 stylesheets, 10 compiled React files, `tokens.json`,
  `SYSTEM_PROMPT.md`, plus `package.json`/`README`/`LICENSE`).

### 0.7.0 — Event Modal

- **`<EventModal>` + `useModal()`** — the final Info1 composition: an
  interactive Event Detail overlay that opens when a user clicks a
  timeline node. Three pieces, no magic:

  ```tsx
  import { EventTimeline, EventModal, useModal } from "@edwyn/signature-style/react";

  const modal = useModal(); // or useModal<PtpEvent>() for explicit typing

  <EventTimeline events={events} onEventSelect={modal.open} />
  {modal.selectedEvent && (
    <EventModal event={modal.selectedEvent} open={modal.isOpen} onClose={modal.close} />
  )}
  ```

  - **Portal architecture** — `createPortal` mounts the overlay on
    `document.body`, breaking free of the timeline's CSS Grid stacking
    context. The Pillar 3 z-scale is then the only stacking authority:
    backdrop `z-index: var(--z-overlay, 40)`, card
    `z-index: var(--z-modal, 50)`.
  - **A11y contract** — the card is `role="dialog"` with
    `aria-modal="true"` and `aria-label` = the event title. Escape closes
    (a document keydown listener installed in a `useEffect`, always
    cleaned up), clicking the backdrop closes, and clicking inside the
    card does NOT — the card stops propagation.
  - **`useModal<T>()`** — the minimal hook behind the overlay: two
    `useState` values (`isOpen`, `selectedEvent`) plus stable callbacks
    (`useCallback`, so `modal.open` can be handed straight to
    `onEventSelect`). No context, no portals inside the hook — the hook
    owns state, the component owns the DOM.
  - **Flat grid card** — the card is ONE CSS Grid whose direct children
    are the title (`h2`), the close button, the `<PartyBadge>` row, and
    flat label/value rows (Date / Time / About) — zero wrapper divs, even
    the header row is pure grid placement. The close button is muted
    `--text-muted` by default and hovers to `--color-cake-secondary`
    (Teal — structural chrome, Rule of Engagement untouched).
  - New stylesheet **`css/modal.css`** (`.ptp-modal-*` classes,
    token-driven, zero box-shadow, `prefers-reduced-motion` respected,
    768px collapse), imported into the `cascade` layer after
    `timeline.css`. One documented exception to the token doctrine, by
    owner mandate: the backdrop scrim is the neutral
    `rgba(0, 0, 0, 0.6)` — a dimming layer must dim regardless of theme.
    `cascade.css` and `overrides.css` remain untouched — the structural
    freeze holds.
- **`<EventTimeline onEventSelect?>`** — new optional prop
  `(event: PtpEvent) => void`. Timeline nodes are now real `<button>`
  elements (was `span`) with pointer cursor and the shared Flamingo
  focus ring; without the prop they render identically and simply do
  nothing on click. Nodes expose `aria-label` = the event title.
- **`PtpEvent.description?`** — new optional field rendered as the
  modal's "About" row (additive; 0.6.0 call sites are unaffected).
- **Release gates** — verify now asserts the modal stylesheet's z-pillars
  (`var(--z-overlay` / `var(--z-modal`), the documented-scrim-only hex
  exception (zero hex beyond `rgba(0, 0, 0, 0.6)`), the umbrella
  re-exports of `EventModal` + `useModal`, the modal source's portal +
  a11y contract, and that timeline nodes are buttons firing
  `onEventSelect`.

### 0.6.0 — Event Timeline

- **`<EventTimeline>`** — the first full component built on the 0.5.0
  primitives, exercising Engine v2.5 rules end to end (Info1 + Pruning +
  Party Palette): a chronological party-events timeline for
  PlanThenParty.

  ```tsx
  import { EventTimeline } from "@edwyn/signature-style/react";

  <EventTimeline
    events={[
      {
        id: "cake",
        date: "October 2026",      // display string in the date header
        dateKey: "2026-10",        // optional explicit grouping bucket
        time: "15:00",
        title: "Cake cutting",
        category: "--party-peach", // --party-* tokens only (type-enforced)
        categoryLabel: "Birthday",
        icon: "Cake",              // optional; defaults to "Circle"
      },
    ]}
  />
  ```

  - **Empty state first** — `events.length === 0` renders
    `<EmptyState icon="CalendarX">` immediately. No empty timeline lines
    are ever drawn.
  - **DOM shape (Pruning Protocol)** — perfectly flat: ONE grid container
    (`.ptp-timeline`) whose DIRECT children are date headers (`h2`),
    nodes (`span`) and event content blocks (`div`), each placed with
    inline `gridRow`/`gridColumn` styles against a maintained row
    counter. No row wrappers, no placeholder divs — the empty side of an
    alternating row is just empty grid track. The vertical line is the
    container's `::before` pseudo-element, never a div.
  - **768px collapse** — desktop: vertical center line
    (`grid-template-columns: 1fr auto 1fr`), events alternate left/right.
    Mobile (max-width 768px): `auto 1fr` — the line moves to the far
    left and all events stack on the right. Pure CSS; placement columns
    are remapped through custom properties so the component's inline
    styles stay breakpoint-neutral.
  - **Pillar 3 z-10 headers** — date headers are
    `position: sticky; top: 0; z-index: var(--z-sticky)` with opaque
    `--bg-base` and a hairline bottom border (`color-mix` muted 20%).
    Each header spans its date group's rows so the sticky position
    actually travels, and content scrolls beneath it. Grouping follows
    the `dateKey ?? date` contract (first-occurrence order preserved).
  - **Primitives, composed** — nodes are STRUCTURE (Flamingo): `<Icon>`
    in a small circle with a 2px `--color-cake-primary` ring and
    `--bg-surface` fill. Categories are CONTENT (party tokens):
    `<PartyBadge colorToken label>`. Titles wear `--text-main` weight
    500; times wear `--text-muted` mono at 0.875rem.
  - New stylesheet **`css/timeline.css`** (`.ptp-timeline*` classes,
    token-driven, zero hex, zero box-shadow, `prefers-reduced-motion`
    respected), imported into the `cascade` layer by
    `css/signature-style.css`. `cascade.css` and `overrides.css` are
    untouched — the structural freeze holds.

### 0.5.0 — Pruning Protocol + React Primitives

- **The Pruning Protocol (Subtract by Default)** — the Engine is now
  explicitly authorized and encouraged to delete redundant code. Three
  mandates: **DOM Flattening** (never use a wrapper `<div>` if CSS
  Flexbox/Grid on the parent can achieve the same layout — if an element
  looks visually identical without a wrapper, delete the wrapper) and
  **Minimalist Code** (no "extra stuff", no decorative wrappers — 3 lines
  of HTML over 10 whenever the UI stays clean and correct). Subtraction
  is a feature; the full mandate lives in
  [`SYSTEM_PROMPT.md`](./SYSTEM_PROMPT.md) (Engine v2.5).
- **Three official React primitives** — flat-DOM, `var(--token)`-driven
  components in the `./react` umbrella (no new tokens, zero CSS changes):

  ```jsx
  import { ThemeProvider, Icon, EmptyState, PartyBadge } from "@edwyn/signature-style/react";
  <Icon name="PartyPopper" />
  <EmptyState icon="PackageOpen" title="Nothing here" message="Add your first event." />
  <PartyBadge colorToken="--party-peach" label="Birthday" />
  ```

  - `<Icon name />` — strict lucide-react wrapper: `name` must be a real
    lucide icon name (typo = compile error), inherits `currentColor`,
    `strokeWidth` locked to 2 by default per Pillar 1 (overridable).
  - `<EmptyState icon title message />` — the Pillar 4 empty state as one
    `div.empty-state` (centered flex column, surface bg, hairline border);
    nothing else in the DOM.
  - `<PartyBadge colorToken label />` — the Rule of Engagement at compile
    time: `colorToken` only accepts `--party-*` tokens
    (`Extract<KnownToken, \`--party-${string}\`>`); a structural token like
    `--color-cake-primary` is a type error, and a runtime guard
    warn-and-drops anything JS slips past the types. Renders ONE `<span>`
    with a subtle `color-mix` tint of the party token and guaranteed
    high-contrast `--text-main` label on both themes.
- **lucide-react is an optional peer** — declared in
  `peerDependenciesMeta` as `optional: true`. CSS-only consumers never
  install icons; React consumers using `<Icon>`/`<EmptyState>` should add
  `lucide-react >= 0.400.0`.
- `exports["./react"]` now resolves to the umbrella `react/index.js`
  entry, re-exporting `ThemeProvider` alongside all three primitives.
  Tokens and token VALUES are unchanged — `TOKEN_KEYS` stays at 31; the
  structural freeze holds (`css/` is byte-identical to 0.4.0).

### 0.4.0 — Party Palette

- **New token family: the Party Palette** — ten theme-independent,
  content-reserved tokens, defined ONCE in `:root` and inherited by both
  Mocha and Latte untouched (theme-independent by design, so content wears
  the same party colors on both sides of the toggle):

  | Token | Hex | Role |
  |---|---|---|
  | `--party-pink-bright` | `#ea76cb` | badges, tag fills, event highlights |
  | `--party-pink-soft` | `#f5bde6` | tag surfaces, avatar rings, soft calendar fills |
  | `--party-pink-alt` | `#f4b8e4` | alternate pink for content categories |
  | `--party-mauve-bright` | `#8839ef` | chart series, bold tags |
  | `--party-mauve-soft` | `#cba6f7` | avatar dots, calendar blocks |
  | `--party-lavender` | `#7287fd` | content links, calendar themes, data-viz series |
  | `--party-sky` | `#04a5e5` | informational tags, data-viz series |
  | `--party-blue` | `#1e66f5` | data-viz series, event themes |
  | `--party-peach` | `#fe640b` | calendar block edges, attention tags |
  | `--party-green` | `#a6d189` | status tags, positive data-viz series |

- **Rule of Engagement** — `--party-*` tokens are reserved EXCLUSIVELY for
  content: badges, tags, avatars, event theme overrides, calendar blocks,
  data visualization. The Engine keeps Flamingo/Teal for ALL structural UI
  actions — buttons, inputs, focus rings. Never use `--party-*` for
  structural chrome; never use Flamingo/Teal for content categories.
  The v0.3.0 structural UI is LOCKED and the release gate enforces it: a
  structural-freeze gate requires `git diff v0.3.0 -- css/cascade.css
  css/overrides.css` to be empty and the structural + Flamingo/Teal values
  in `tokens.css` to be unchanged.
- **Whitelist covers everything, party included** — `TOKEN_KEYS` grows
  from 21 to 31 keys; `<ThemeProvider theme={…}>` now accepts every custom
  property in `css/tokens.css`, the party tokens included. Guard logic is
  unchanged. Because party tokens are whitelisted, a user can retheme
  their event content dynamically — for example changing their event
  theme's accent:

  ```tsx
  <ThemeProvider theme={{ "--party-peach": "#ff8800" }}>
    <Calendar />
  </ThemeProvider>
  ```

- **Engine v2.4** — `SYSTEM_PROMPT.md` gains the "Party Palette
  (Content-Only Tokens)" section listing all ten tokens plus the Rule of
  Engagement. The demo gains a compact "Party Palette · content only"
  strip (all 10 swatches with muted mono names) plus three content chips:
  a `birthday` badge on `--party-pink-bright` (text `--color-on-cake`), an
  avatar dot on `--party-mauve-soft`, and a calendar block edged in
  `--party-peach`.
- **Release gates** — verify now asserts the exact ten party hexes in
  both `tokens.css` (`:root`, theme-independent) and `tokens.json`
  (`partyPalette` entries with `"reserved": true` and the content-only
  role), party whitelist parity, and the v0.3.0 structural freeze.

### 0.3.0 — Harmonized Catppuccin

- **Harmonization** — the custom hybrid cake accents are retired. The
  signature now uses ONLY official Catppuccin colors, per theme: the dark
  default wears **Mocha Flamingo `#F2CDCD`** and **Mocha Teal `#94E2D5`**;
  the light theme wears its own **Latte Flamingo `#DD7878`** and
  **Latte Teal `#179299`**. Structural tokens are unchanged
  (Mocha `#1E1E2E`/`#313244`/`#CDD6F4`/`#7F849C`, Latte
  `#EFF1F5`/`#CCD0DA`/`#4C4F69`/`#6272A4`, keepers intact).
- **The Latte-counterparts decision** — 0.2.1 mandated the identical hexes
  in both themes, which left pale focus rings on Latte. 0.3.0 resolves the
  tradeoff by giving each theme its own official palette pairing: contrast
  is correct on both sides of the toggle by construction, and the palette
  is mathematically harmonious because every value is Catppuccin's own.
  The retired custom hexes (`#FFB7B2`, `#E2F0CB`) are banned everywhere in
  `css/` and `tokens.json` — enforced by the release gate.
- **Four structural pillars locked in** — (1) **Iconography**: Lucide-React
  exclusively, 2px stroke matching Inter weight 500, never mix libraries;
  (2) **Breakpoints**: strict mobile shift at `max-width: 768px`, all
  multi-column grids collapse to one column; (3) **Z-Index Scale**: new
  tokens `--z-sticky: 10`, `--z-overlay: 40`, `--z-modal: 50` —
  sticky/toolbars, overlays/backdrops, modals/popups/dropdowns;
  (4) **Edge States**: loading is a pulsing-opacity skeleton on
  `--bg-surface` (`@keyframes skeleton-pulse`, ~1.5s ease-in-out, disabled
  under `prefers-reduced-motion`); empty is a `--bg-surface` card with a
  Lucide icon and `--text-muted` text, centered — new `.skeleton` and
  `.empty-state` classes in `cascade.css`.
- **Provider whitelist** — grows to 21 keys (adds the three z-tokens).
  Guard mechanisms are behavior-identical: isomorphic layout effect,
  `useId` dedup, self-only cleanup, value-injection warn+drop,
  layer-order-first injection, and the `CSSLayerBlockRule` guard all
  survive untouched.
- **Engine v2.3** — `SYSTEM_PROMPT.md` gains the Structural Pillars section
  and the harmonized token mapping. The demo gains an Edge States section
  (inline Lucide SVG, zero network refs), a 768px grid collapse, and the
  harmonized swatches.
- **Release gates** — verify now asserts the per-theme signature hexes,
  bans the retired custom hexes alongside the older Catppuccin-accent ban,
  requires the z-tokens in both `tokens.css` and the provider whitelist,
  and checks their exact values (10/40/50).

### 0.2.1 — Hybrid Theme

- **Hybrid doctrine** — the strict Catppuccin accents of 0.2.0 erased the
  owner's personal "cake" signature. 0.2.1 restores it as a hybrid:
  Catppuccin Mocha/Latte structural colors (backgrounds, text) stay, and the
  owner's exact custom cake colors return for **all interaction tokens** —
  `--color-cake-primary #FFB7B2` (Pastel Strawberry) and
  `--color-cake-secondary #E2F0CB` (Soft Matcha). Catppuccin Pink/Green are
  never used for accents again.
- **Exact on both sides of the toggle** — the signature hexes are identical
  in Mocha and Latte by owner mandate ("exact" means exact). Known tradeoff,
  documented and deliberate: the pale cakes give quiet focus rings on the
  Latte light theme.
- **Provider whitelist expanded** — `<ThemeProvider theme={…}>` now accepts
  every custom property in `css/tokens.css`: the core 6, the 4 keepers,
  `--color-on-cake`, `--font-sans`, `--radius-ui`, both transitions, and the
  three 8px spacing tiers (18 keys). This removes the 0.2.0 known
  limitation. Guard mechanisms are byte-identical in behavior: the
  isomorphic layout effect, `useId` dedup, self-only cleanup, the
  value-injection guard, and the layer-order first injection all survive
  (asserted by the new verify hardening gate).
- **Release gates** — `verify.mjs` now asserts the signature hexes in both
  theme blocks, zero Catppuccin accent hexes anywhere in `css/` or
  `tokens.json`, whitelist parity between `tokens.css` and the provider, and
  that the provider's hardening strings survive edits.

### 0.2.0 — Catppuccin Edition

- **Mocha remap** — the core 6 tokens now map to Catppuccin Mocha:
  `--bg-base #1E1E2E`, `--bg-surface #313244`, `--color-cake-primary #F5C2E7`,
  `--color-cake-secondary #A6E3A1`, `--text-main #CDD6F4`,
  `--text-muted #7F849C`. The old pastel cakes (`#FFB7B2`, `#E2F0CB`) are
  fully retired.
- **Keeper tokens** — the owner's beloved legacy palette colors return with
  semantic jobs: `--bg-inset #282A36` (inset wells, code blocks, input
  interiors), `--text-bright #F8F8F2` (maximum-contrast emphasis, headings),
  `--color-success #A8E6CF` (success actions), `--text-muted-soft #6272A4`
  (tertiary text, quiet captions).
- **Latte light theme** — a `[data-theme="latte"]` block inside
  `@layer tokens` maps the palette to Catppuccin Latte. Usage:
  `<html data-theme="latte">`.
- **Inter** — the global default font (`--font-sans`), loaded via Google
  Fonts in `signature-style.css` with a `system-ui` fallback offline.
  Weights: 400 text, 500 buttons, 600 headings.
- **Mechanical physics** — `--transition-standard` is now
  `all 0.15s ease-out` (snappy colors), new `--transition-transform` is
  `transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)`, every `:active` presses
  with `scale(0.97)`, focus rings are `2px solid var(--color-cake-primary)`.
- **The 8px grid** — `--space-tight 0.5rem` / `--space-standard 1rem` /
  `--space-section 1.5rem` drive all padding and gaps; surfaces separate with
  `1px solid color-mix(in srgb, var(--text-muted) 20%, transparent)`; radius
  stays 6px; zero drop shadows anywhere.
- **New shared tokens** — `--color-on-cake` (text/icon color on cake
  surfaces) and the spacing tiers.
- **Known limitation** — the ThemeProvider whitelist doesn't cover the keeper
  tokens yet (see React usage above); pure-CSS usage is unaffected.
  *(Resolved in 0.2.1.)*

### 0.1.0

- Initial release: Linux-terminal palette, Token Cascade, Override Protocol,
  hardened ThemeProvider, living demo.

## Use this template

This repo is intended to be flagged as a **GitHub Template repository** —
enable it via **Settings → check "Template repository"** (a GitHub
setting, not a file). Click **Use this template** to start a new project
that already speaks Signature Style — package, gates, demo and the
tag-driven publish workflow included — or install the package into an
existing one and keep the repo as the style's source of truth. The full
release runbook lives in [`docs/PUBLISHING.md`](./docs/PUBLISHING.md).

## Development

```sh
npm install
npm run build      # compile react/*.tsx → react/*.js (+ .d.ts)
npm run typecheck  # strict tsc, no emit
npm run verify     # theme parity, per-theme signature hexes, retired-hex bans, whitelist parity, z-scale values, party palette hexes + reserved flags, v0.3.0 structural freeze, bundle head, 3-path exports contract, provider hardening, timeline gates, modal gates, nav gates, viz gates
npm pack --dry-run # inspect the publishable tarball (expect 28 files)
```

## License

[MIT](./LICENSE) © 2026 edwyn
