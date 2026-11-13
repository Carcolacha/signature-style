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

### 2.1.0 — Timeline Breathing Room & The Master Index

- **THE STORY — the timeline learns personal space, and the hub becomes
  a place you can leave and return to.** Two playground-layer moves:
  a MEASURED spacing fix for the sticky timeline headers, and the
  Master Index — a state-based view system that turns the dashboard
  into one door among several. **The package is untouched**:
  `git diff v2.0.0 -- css/ react/ tokens.json demo/ SYSTEM_PROMPT.md
  scripts/ tools/` is EMPTY at the release gate, `npm pack` still packs
  EXACTLY 34 files, and `tokens.json` stays 1.4.0.
- **Timeline header breathing room (MEASURED — the release blocker).**
  The sticky month headers crowded the first event node beneath them.
  Probe-proven (playwright + the cortex's Chromium, 1280px viewport,
  scrollY 0): the package reserves `--tl-header-clearance` = 68px of
  group-first clearance, but its own header slab renders **69px** tall
  (16px pad-top + 36px text line + 16px pad-bottom + 1px hairline) —
  every group's first node started **1px UNDER the glass slab**. The
  fix is composition-layer only, two scoped levers in
  `playground/styles.css`: the slab grows one `--space-tight` step
  (padding-bottom 16 → 24px, slab 69 → 77px) and the group-first
  clearance mirrors the growth on BOTH siblings (item padding-top AND
  node margin-top = `calc(var(--tl-header-clearance) +
  var(--space-standard) * 2)` = 100px — siblings move together or the
  title drifts off the node). BEFORE → AFTER clearance per group
  (headerRect.bottom → first `.ptp-timeline__node` rect.top):

  | Group | BEFORE | AFTER |
  |---|---|---|
  | December 2026 | **−1px (overlap)** | **23px** |
  | January 2027 | **−1px (overlap)** | **23px** |
  | February 2027 | **−1px (overlap)** | **23px** |

  All ≥16px, every offset on the 4px grid (24 = 6×4, 100 = 25×4).
  Documented deviation: the brief's literal
  `padding-bottom: var(--space-standard)` would have been a NO-OP (the
  package shorthand already sets 16px there) — the shipped override is
  `calc(var(--space-standard) + var(--space-tight))`, var-based and
  actually incremental. The first `.ptp-timeline__item` BOX still sits
  under the slab (−77px) by design: its group-first padding is empty
  space; the node is the visual invariant.
- **The Master Index — a state-based view switcher.** `type View =
  "dashboard" | "index" | "events" | "guests" | "budget"`, default
  `"dashboard"` (the cortex smoke must find the timeline on load). The
  nav goes through GlobalNav's component-agnostic `as` prop — **no
  package change**, but the contract has two load-bearing details
  (read from `react/nav.tsx` before wiring): a custom renderer receives
  `{ href, className, children, onClick? }` and NEVER `aria-current`
  (GlobalNav only self-annotates plain anchors), and the drawer hands
  its close callback through `onClick`. So the playground ships
  `HubLink` + `createHubLink(onNavigate, activeHref)` — a factory
  closure that stamps `aria-current="page"` on the active link (css/
  nav.css styling keeps working) and composes GlobalNav's onClick after
  its own `event.preventDefault()` (no full-reload fragment jumps; the
  switch is state-only). Nav order per owner: Dashboard, Events,
  Guests, Budget, Index — hrefs `#/dashboard` … `#/index`, one explicit
  routing table. The hero is shared across views, its copy switches:
  THE ENGINE stays on the dashboard, THE MASTER INDEX ("three doors ·
  one engine · zero dead ends") announces the index, THE WORKSHOP the
  placeholder modules.
- **The index view — three gateway cards, exact Shed anatomy** (teal
  all-caps label / muted mono path / ruled title / description) in a
  900px-constrained column (`.hub--index`; owner call, documented:
  three doors read better narrow than stretched to 1400px): PLANNER /
  views/planner.tsx / Event Planner Bento — a REAL gateway, clicking
  returns to the dashboard; STUDY / modules/study.tsx / Study &
  Flashcard Generator and GAMES / modules/games.tsx / Party Game
  Modules — roadmap doors. **Decision (documented):** the roadmap doors
  fire a success toast ("… is on the roadmap.") instead of routing to
  an EmptyState view, because the nav's workshop entries already
  dogfood `<EmptyState>` as placeholder views and a toast keeps the
  reader at the index. Cards are `<button>`s for free keyboard/press
  semantics; the hub hover lift carries the interaction.
- **Placeholder doctrine — the workshop dogfood.** The Events / Guests
  / Budget views render the package's `<EmptyState icon="Hammer"
  title="In the workshop" message="This module ships in a future
  release." />` inside a `hub__card` with the full Shed anatomy (real
  label / mono path / ruled title per module) — the doctrine shows even
  where the feature isn't yet.
- **Gate evolution (verify:playground)** — (sp1) the MEASURED breathing
  room: the scoped slab padding AND both mirrored group-first
  clearances (100px); (ix1) the view switcher: `type View`, the
  `"dashboard"` default (cortex contract), HubLink +
  `createHubLink` factory wiring, `event.preventDefault()`, the
  EmptyState dogfood, the per-view hero copy; (ix2) the three exact
  gateway label/path/title strings and the 900px index column. The
  (b5) 4-section audit now counts INSIDE the dashboard branch
  (`function DashboardView` … `function IndexView`) — the switcher
  legitimately adds cards elsewhere in the file. Negative test
  (falsifiability, restore-verified): removing `event.preventDefault()`
  from App.tsx flips (ix1) to FAIL; restore → PASS.
- **Release proof** — `npm run verify` PASS; `npm run verify:playground`
  PASS; `npm run verify:mcp` SMOKE ALL PASS (the default view stays
  "dashboard", so the smoke's `.ptp-timeline` assertions still hold);
  `vite build` exit 0; `npm pack` exactly 34 files; safety diff vs
  v2.0.0 (incl. tools/) EMPTY; `package.json`/lock → 2.1.0,
  `tokens.json` stays 1.4.0. Relaunch proof: dev server killed and
  restarted fresh (the `/mnt/c` inotify lesson — vite never sees file
  edits on the Windows mount, every probe below ran against a freshly
  started server), then a one-off playwright probe: (a) dashboard
  clearance 23px/23px/23px (all ≥16px); (b) Index nav click → THE
  MASTER INDEX hero + 3 gateway cards with exact anatomy + aria-current
  tracking; (c) PLANNER click → dashboard with 6 nodes; plus Events →
  EmptyState placeholder and GAMES → roadmap toast.

### 2.0.0 — The Hub Migration (Shed Aesthetic)

- **THE STORY — the dashboard finally has discipline.** The diagnosis:
  1.5.0's bento grid read as scattered boxes. The cards were fine; the
  PAGE had no discipline — no constrained column (an asymmetric stage
  of hand-placed coordinates), no announcement (the nav opened straight
  onto raw cards), no shared anatomy (every card was just "an h2 and
  some stuff"), no tactile feedback (surfaces never answered the
  pointer). The strategy: migrate the playground presentation layer to
  The Shed's language — the same rules that discipline this repo's own
  aesthetic. **The package is untouched**: `git diff v1.8.0 -- css/
  react/ tokens.json demo/ SYSTEM_PROMPT.md scripts/ tools/` is EMPTY
  at the release gate (tools/ joins the freeze this release), and
  `npm pack` still yields EXACTLY 34 files. `tokens.json` stays 1.4.0.
- **Anatomy mapping (old → new), the migration in one table:**

  | Bento era | Hub era | Role |
  |---|---|---|
  | `.bento` — asymmetric 3-col stage, hand placements, `minmax(300px,1fr) minmax(400px,1.5fr) minmax(300px,1fr)` | `.hub` — `max-width: 1400px`, centered, `repeat(auto-fit, minmax(400px, 1fr))`, gap 2rem | the constrained column |
  | — (cards started at y=83, unannounced) | `.hub__hero` — h1 `THE ENGINE` (serif "Besley", Georgia, serif; `clamp(2.25rem, 6vw, 4rem)`; tracking 0.35em) + `.hub__hero-sub` mono subtitle | the announced header |
  | `.bento__card` | `.hub__card` — same surface tokens, + `:hover { translateY(-2px) }` with `0 16px 40px rgba(0,0,0,0.5)` | the strict card surface, now tactile |
  | — (h2 was the header) | `.hub__meta` → `.hub__label` (teal `--color-cake-secondary`, all-caps via `text-transform`, 0.2em tracking) + `.hub__path` (muted mono, the module's source path) | the shed meta row |
  | `.bento__card > h2` (1rem) | `.hub__card > h2` (1.125rem, child combinator kept so package timeline h2s stay untouched) | the elegant ruled title |
  | `.bento__metric` / `-label` / `-value` | `.hub__metric` (+ owner mandate: `margin-bottom: var(--space-standard)` — ≥16px air under every label row; value now mono) | telemetry rows |
  | `.bento__btn` | `.hub__btn` (identical v1.6.0 doctrine shape) | the doctrine button |
  | `.bento__palette` | `.hub__palette` | the palette cluster |
  | `data-testid="bento-card-*"` | `data-testid="hub-card-*"` (metric/btn hooks unchanged) | the cortex hooks |

  Every card: meta → ruled h2 → content. Titles: Form Controls /
  The Chronology / Budget & RSVP / The Party Palette; labels: Forms /
  Timeline / Telemetry / Palette; paths: components/forms.tsx /
  timeline.tsx / viz.tsx / primitives.tsx.
- **The timeline span decision (owner fallback rule, probe-decided)** —
  `.hub__card--timeline { grid-row: span 2; }` was built in, then
  probed per the owner's rule ("drop the span if it creates a dead
  void larger than one card"). Cortex verdict at the 1280px viewport:
  the auto-fit grid packs 2 × 600px columns; the span puts forms+timeline
  on row 1, telemetry+timeline on row 2, palette on row 3 — leaving
  EXACTLY ONE empty cell (600 × 244px = 146,400px², pixel-equal to its
  row-mate palette's cell). Not larger than one card → **the span
  stays**. Dropping it would be worse: the timeline (1142px tall with
  6 nodes across 3 month groups) would stretch its row-mates to its
  own height instead. The 768px collapse resets the span (`grid-row:
  auto`), where spanning makes no sense.
- **Kept and renamed (bento → hub)** — the slideUpFade stagger +
  mandatory reduced-motion escape (1.5.1), the elevation border +
  inset/ambient shadows (1.6.0, composition layer only), the timeline
  node elevation via the card descendant (1.8.0 doctrine boundary),
  the telemetry space-between/flex-end rows + breathing bars (1.8.0),
  the 768px collapse (1.5.0), and the doctrine button (1.6.0). Zero hex
  literals; the only raw colors remain the owner-sanctioned rgba
  elevation shadows.
- **Gate evolution (verify:playground)** — every bento needle became its
  hub equivalent, preserving intent: new (n-hub1) the constrained
  column (`max-width: 1400px` + auto-fit `minmax(400px, 1fr)`) AND the
  probed timeline span; (n-hub2) the announcing hero (THE ENGINE +
  subtitle); (n-hub3) the shed anatomy (teal label / mono path / meta
  row / `translateY(-2px)` + `0 16px 40px` hover lift / the ≥16px
  metric-air mandate) plus a scan asserting no bento-era classes or
  testids remain in the DOM contract; (n-hub4) the NEW v2.0.0 frozen
  proof — `git diff v1.8.0` over css/ react/ tokens.json demo/
  SYSTEM_PROMPT.md scripts/ **tools/** must be EMPTY. (m3) hooks
  renamed hub-card-*; (g1) retired with the asymmetric stage it pinned;
  (g2)/(g3) re-needled to the hub ancestors. **e2 AMENDMENT:** the
  deletion guard REBASES to v1.8.0 and the v1.8.0 single-use allowlist
  entry (`background: var(--bg-base);`) is consumed — the v2.0.0
  allowlist is EMPTY; timeline.css was untouched, so e2 passes
  trivially while still guarding the future. Negative test
  (falsifiability, restore-verified): gutting the hover lift to
  `transform: none` flips (n-hub3) to FAIL; restore → PASS. (First
  attempt COMMENTED the lift out instead of deleting it — the needle
  still matched the literal inside the comment and the "negative" test
  passed; a falsifiability test only counts if it actually falsifies.)
- **Cortex proof** — dev server killed and relaunched fresh (the 1.8.0
  `/mnt/c` inotify lesson), then `inspect_layout` with hub selectors:
  4/4 `.hub__card` visible; timeline card 600px wide (≥400 floor);
  6/6 `.ptp-timeline__node` visible with area; all three metric rows
  no-overlap (value left ≥ label right), flush right within 1px of the
  card's content edge, and 40px/40px/32px of air below the label rows
  (≥16px mandate — the RSVP row's nearest viz is the classless
  StatRing `svg[role="progressbar"]`, swept explicitly). BEFORE/AFTER
  rect table (1280px viewport): the asymmetric stage measured
  315.4/473.1/315.4px columns at y=83 with a hole under the telemetry;
  the hub measures 600px columns at y=232 (the hero announces first)
  with one one-card void beside the palette — both layouts carry
  exactly one one-card hole; the hub's is pixel-equal to its row-mate.
  Proof screenshot: `/tmp/visual-cortex/v200-proof.png`.
- **Release proof** — `npm run verify` PASS; `npm run verify:playground`
  PASS; `npm run verify:mcp` SMOKE ALL PASS (tools/ byte-frozen — the
  smoke's `.ptp-timeline__node` assertion still holds); `vite build`
  exit 0; `npm pack` exactly 34 files; safety diff (incl. tools/)
  EMPTY; `package.json`/lock → 2.0.0, `tokens.json` stays 1.4.0.

### 1.8.0 — Bento Refinement & Spatial Harmony

- **THE STORY — the composition gets its final polish, measured by the
  cortex.** 1.7.0 gave sessions eyes; 1.8.0 is the first release
  styled WITH them: every layout claim below is backed by a
  BEFORE/AFTER `inspect_layout` rect table (one-off probe through the
  MCP server, raw JSON-RPC), not by eyeballing. All changes are
  composition-layer (`playground/`) plus ONE authorized package file
  (`css/timeline.css`); every other package file is byte-frozen vs
  1.7.0 (proved at the release gate), and `tokens.json` stays 1.4.0
  per the standing decision.
- **Asymmetric bento grid (composition)** — `.bento` moves from
  `repeat(3, 1fr)` to
  `minmax(300px, 1fr) minmax(400px, 1.5fr) minmax(300px, 1fr)`: the
  center timeline takes the stage. Cortex-proven: the timeline card
  renders 473.1px wide vs 315.4px side cards (was a flat 368px × 3 at
  the 1280px probe viewport) — +28.5% for the date axis — while the
  768px single-column collapse, placement resets, slideUpFade stagger
  and reduced-motion escape are untouched.
- **Glass header (the ONE authorized css/ change)** —
  `.ptp-timeline__header` swaps its opaque `background: var(--bg-base)`
  slab for `color-mix(in srgb, var(--bg-surface) 80%, transparent)` +
  `backdrop-filter: blur(8px)` (webkit-prefixed): scrolled content
  stays legible THROUGH the sticky date header. The 1.6.0 resurrection
  contract is untouched and still load-bearing — `position: sticky`,
  `top: 0`, `z-index: var(--z-sticky, 10)`, `align-self: start` (a
  spanning grid item must not stretch into a cover slab). Cortex-proven
  post-change: all three headers height 69px, visible, unchanged.
- **Axis-aligned typography (css/timeline.css)** — text flows TOWARD
  the axis: `.ptp-timeline__item--left` keeps `text-align: right`,
  `.ptp-timeline__item--right` gains the explicit
  `text-align: left`, and the 768px media query resets BOTH modifiers
  to `text-align: left` explicitly (one right-hand stack, no axis to
  hug).
- **Node elevation — composition layer ONLY (doctrine boundary)** —
  the nodes float: `.bento__card .ptp-timeline__node` gets
  `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2)` in
  `playground/styles.css` (owner-decided). THE PACKAGE KEEPS ITS
  ZERO-BOX-SHADOW LAW: `css/timeline.css` gains backdrop-filter/
  color-mix but ZERO box-shadow declarations this release, and gate
  (e1)'s css/-wide scan stays green — same override shape as the 1.6.0
  card/button elevation.
- **Telemetry spacing (composition)** — `.bento__metric` is
  `justify-content: space-between` + `align-items: flex-end` (caption
  left, value flush right, shared bottom floor), and the progress bars
  breathe: `margin-top: var(--space-tight)` scoped to the composition
  via `.bento__metric .ptp-progress, .bento__metric + .ptp-progress`
  (the adjacent-sibling arm is the DOM truth — App.tsx renders
  ProgressBar as the metric row's next sibling, which a descendant
  selector could never reach; package `css/viz.css` untouched).
  Cortex-proven: bars shifted +8px (`--space-tight` = 0.5rem) below
  their caption rows.
- **Gate evolution (verify:playground)** — new gates: (g1) the
  asymmetric grid string, (g2) glass needles in timeline.css + the
  node-shadow needle ONLY in the playground styles + a targeted
  re-assertion that timeline.css still declares zero box-shadow, (g3)
  metric space-between/flex-end + the scoped breathing-bar margin.
  **e2 AMENDMENT:** the v1.4.0-deletion guard now carries a ONE-LINE,
  SINGLE-USE owner-sanctioned ALLOWLIST — exactly
  `background: var(--bg-base);` (the header slab the glass header
  replaced); every other deleted line must still trace to comments.
  Negative test (falsifiability, restore-verified): reverting the grid
  to `repeat(3, 1fr)` flips (g1) to FAIL; restore → PASS.
- **Release proof** — `npm run verify:mcp` SMOKE ALL PASS (35 layout
  hits, 6/6 timeline nodes with area, sample 44×44 @ x=617.98 — the
  centered axis of the wider stage), proof screenshot
  `/tmp/visual-cortex/v180-proof.png`; `vite build` exit 0; `npm pack`
  still EXACTLY 34 files; `git diff v1.7.0 -- react/ tokens.json demo/
  SYSTEM_PROMPT.md scripts/` EMPTY and `css/` shows ONLY
  timeline.css changes. One operational lesson: on this box the vite
  dev server lives on a Windows mount (`/mnt/c`) where inotify never
  fires — a long-running server serves STALE transforms after edits
  (the first AFTER probe measured the old grid until the server was
  relaunched). When the cortex disagrees with the disk, restart the
  server before doubting the CSS.

### 1.7.0 — The Visual Cortex (MCP Integration)

- **THE STORY — the AI can now measure what it styles.** Every previous
  release fixed layout defects the hard way: spin up a scratch headless
  browser, probe rects by hand, eyeball numbers, throw the harness away
  (the 1.6.0 cover-slab hunt is the canonical example). 1.7.0 promotes
  that ritual into a permanent tool: `tools/mcp-viz/` ships an MCP stdio
  server — `@edwyn/visual-cortex-mcp`, `private: true`, never packed
  (the 34-file pack proof now also proves `tools/` is excluded) — that
  any AI session can attach to and ask "what does the dashboard actually
  look like right now?" before touching another CSS token.
- **Tool `inspect_layout`** — params `url` (default
  `http://localhost:5173`) and `selectors` (default: the dashboard
  anatomy — `[data-testid]`, `.ptp-timeline__node`,
  `.ptp-timeline__item`, `.ptp-timeline__header`, `.ptp-progress`,
  `.ptp-progress__fill`, `.bento__card`, `.bento__metric`,
  `.bento__btn`). Headless Playwright Chromium navigates with
  `waitUntil: networkidle` **plus a 600ms settle** (the 1.5.1
  slideUpFade stagger taught us mid-animation rects lie), then returns,
  per matched element: `{ selector, tag, classes[], rect {x, y, width,
  height}, text (first 40 chars, trimmed), visible (width>0 &&
  height>0) }` — plus a per-unique-class coverage summary
  (`total`/`visible`/`notVisible`). Unreachable URL → graceful MCP error
  telling the session to run `npm run playground`.
- **Tool `capture_screenshot`** — params `url`, `fullPage` (default
  `true`), `path` (optional; ALSO writes the PNG to disk, default
  `/tmp/opencode/dashboard-mcp.png`, dirs created). Returns MCP image
  content (`{ type: "image", data: <base64>, mimeType: "image/png" }`)
  plus the written path as text. Graceful degrade: if the requested path
  is unwritable (this box ships a root-owned `/tmp/opencode`), it falls
  back to `/tmp/visual-cortex/<name>` and says so.
- **Prerequisite** — the playground dev server must be running
  (`npm run playground`); both tools fail with a pointer to that command
  otherwise. **No npm token needed** — nothing is published; all
  dependencies resolve from the public registry.
- **One browser per server lifetime** — Chromium launches lazily on
  first tool call and is closed on SIGINT/SIGTERM/process exit.
  Server built with the official `@modelcontextprotocol/sdk` (^1.32.2,
  current `registerTool` API — the older `tool()` overloads are
  deprecated), TypeScript strict, `npx tsc` exit 0. The smoke harness
  (`tools/mcp-viz/smoke.mjs`) spawns the compiled server and speaks RAW
  newline-delimited JSON-RPC over stdio — initialize → tools/list →
  tools/call × 2 — asserting exactly the two tools, at least one
  `.ptp-timeline__node` with width>0 && height>0, and non-empty
  screenshot base64. Proof run: 27 layout hits, 6/6 timeline nodes with
  area (sample 44×44 at x=618,y=241), 150,676 base64 chars / 113,005
  bytes on disk.
- **Attach configs** (full copies in `tools/mcp-viz/README.md`) —
  OpenCode V2 puts server names under `mcp.servers` (NOT directly under
  `mcp`; verified against the V2 docs at
  <https://opencode.ai/docs/mcp-servers> and the local OpenCode skill):
  `{ "$schema": "https://opencode.ai/config.json", "mcp": { "servers":
  { "visual-cortex": { "type": "local", "command": ["node",
  "<abs>/tools/mcp-viz/dist/server.js"] } } } }`; Claude-Desktop-style
  hosts use `{ "mcpServers": { "visual-cortex": { "command": "node",
  "args": ["<abs>/tools/mcp-viz/dist/server.js"] } } }`. Convenience
  script: `npm run inspect` (starts the server over stdio from the repo
  root).
- **data-testid wiring (playground layer only)** — stable hooks for the
  cortex's default `[data-testid]` sweep: `bento-card-forms`,
  `bento-card-timeline`, `bento-card-telemetry`, `bento-card-palette`,
  `metric-budget-remaining`, `metric-budget-spent`, `metric-rsvp`,
  `btn-toast`. Timeline nodes/items/headers stay covered by the class
  defaults; `App.tsx` remains a pure consumer otherwise.
- **Release gates** — `verify:playground` now runs b1–b7, h1–h3, e1–e2
  PLUS m1 (compiled `tools/mcp-viz/dist/server.js` exists), m2 (smoke
  artifact + private package identity + `verify:mcp` script wired), and
  m3 (all eight testid needles). New `npm run verify:mcp` builds the
  server and runs the smoke for real. Negative test
  (falsifiability, restore-verified): deleting
  `tools/mcp-viz/dist/server.js` flips (m1) to FAIL. `npm pack` still
  EXACTLY 34 files; core files byte-frozen vs v1.6.0
  (`git diff v1.6.0 -- css/ react/ tokens.json SYSTEM_PROMPT.md demo/
  scripts/` is EMPTY); `tokens.json` stays 1.4.0 per the standing
  decision.

### 1.6.0 — Ambient Elevation & Timeline Resurrection

- **TIMELINE ROOT CAUSE — two stacked defects, both probe-proven with a
  headless-Chrome harness (puppeteer in a scratch dir, never shipped)**:
  1. **The cover slab** — `.ptp-timeline__header` is a *spanning* grid
     item (inline `grid-row: "1 / 5"` group spans from
     `react/timeline.tsx:118`) with no explicit block size, so the
     implicit **`align-self: stretch`** stretched its opaque box
     (`background: var(--bg-base)`, `z-index: var(--z-sticky, 10)`)
     across the ENTIRE group span: measured `headerH == groupH`
     (slabRatio 1.00 — a 553.5px header slab over a 553.5px group).
     Every node, title, badge and the `::before` line painted BENEATH
     it. This is why headers rendered while nothing else did — and it
     was host-independent, NOT a bento-container bug: the EventTimeline
     grid was never collapsing (probe: all node/item rects were
     non-zero; hit-tests resolved to the header).
  2. **The dropped node rule** — the `.ptp-timeline__node` rule's own
     comment contained a stray comment-terminator mid-sentence
     (`.btn-` + `*/` + `[data-cascade]`). That early terminator turned
     the trailing prose into live CSS tokens, malformed the selector
     list, and **every browser silently dropped the entire rule since
     0.6.0** — computed style was `display: block`, `width: 40px`, no
     circle, no Flamingo ring, no size, in ANY host.
- **The resurrection fix (css/timeline.css, generic — not
  bento-specific)**: `align-self: start` on the header returns the box
  to content height (69px; the grid-area span still provides the
  sticky travel room, and the 68px `--tl-header-clearance` now
  outranks it exactly as designed) — plus the comment rewrite that
  lets the node rule apply again (44px Flamingo circles), plus
  `position: relative` on nodes so they paint over the absolutely
  positioned `::before` center line instead of the 2px stripe
  crossing their icon centers. Probe after the fix: all 6 nodes
  44×44 hit-visible, all 6 items hit-visible, line absolute inside
  the card. The (t1) needles in `scripts/verify.mjs` are untouched;
  `cascade.css`/`overrides.css` remain byte-frozen vs v0.3.0.
- **DOCTRINE AMENDMENT — OWNER-MANDATED (ambient elevation)**: the
  zero-box-shadow border doctrine is OVERRIDDEN FOR THE COMPOSITION
  LAYER ONLY, by explicit owner decision. `.bento__card` now wears
  `border: 1px solid color-mix(in srgb, var(--text-muted) 15%,
  transparent)` and `box-shadow: inset 0 1px 0 rgba(255, 255, 255,
  0.05), 0 12px 32px rgba(0, 0, 0, 0.4)` (glass top-highlight + soft
  ambient). The rgba literals are allowed by the same override. THE
  PACKAGE STAYS FLAT: gates f1/fb1/t1/v1 keep enforcing zero
  box-shadow across `css/`, and the new (e1) gate scans every package
  css file (timeline.css included) for shadow declarations. Radius,
  padding, the slideUpFade stagger and the mandatory reduced-motion
  escape from 1.5.1 are unchanged.
- **Visual hierarchy**: the forms card pins `gap:
  var(--space-standard)` explicitly (inputs/textarea/switch/button
  breathe; no new wrappers), and `.bento__btn` pops against the
  elevated cards — `font-weight: 600` (was 500) plus its own ambient
  shadow `0 4px 16px rgba(0, 0, 0, 0.3)`. Flamingo fill, on-cake ink,
  `:active scale(0.97)` and the 0.15s transition tokens unchanged.
- **Release gates** — `verify:playground` now runs b1–b7, h1–h3 PLUS
  e1–e2 (elevation markers + package zero-shadow scan; resurrection
  needles + a precise code-deletion guard that maps every deleted
  timeline.css line back to v1.4.0 and requires it to have lived
  inside a comment). The blanket (b7) freeze excludes
  css/timeline.css, governed by (e2) instead. Negative tests
  (falsifiability, restore-verified): stripping the elevation flips
  (e1) to FAIL; appending a shadow to package css flips the doctrine
  scan to FAIL. `npm pack` still exactly 34 files; `tokens.json`
  stays 1.4.0 per the standing decision.

### 1.5.1 — Bento Modernization & Timeline Patch

- **Root cause of the "empty headers without events" report** — the
  owner's source records arrive in HIS shape (`id`, `month`, `title`,
  `time`, `colorToken`, `iconName`) and were passed to `<EventTimeline>`
  without a mapping layer. Field-by-field against `PtpEvent`, two
  required fields never arrive: with `date` `undefined`,
  `groupEvents` buckets every record under the single key `undefined`
  (`react/timeline.js`: `const key = event.dateKey ?? event.date`) and
  the sticky header prints no text — the **empty header**; with
  `category` `undefined`, `PartyBadge`'s
  `!colorToken.startsWith("--party-")` guard
  (`react/primitives.js:25`) throws on the `undefined` dereference and
  React unmounts the timeline — **without events**. Both halves were
  reproduced by an SSR probe against the compiled package modules; the
  1.5.0 playground's own `SAMPLE_EVENTS` was field-complete and renders
  correctly — the defect was the missing owner-data → package-contract
  mapping pattern, which the playground never demonstrated.
- **The hydration fix** — `playground/App.tsx` now mirrors the real
  integration: `mockEvents` in the owner's shape (6 complete entries,
  3 month buckets, 4 modal descriptions), mapped to `PtpEvent` in ONE
  explicit layer at the render boundary (`month → date`,
  `colorToken → category`, `iconName → icon`, badge labels derived from
  a token-exhaustive `CATEGORY_LABELS` table). `Music` looked like a
  lucide icon but is NOT a key of the installed lucide-react 1.72.0
  icons map — `AudioLines` is the live-map-valid stand-in; the new
  (h3) gate probes every `iconName` against the live map so a
  plausible-but-wrong name fails the build, not the runtime.
- **Staggered load-in** — `@keyframes slideUpFade` (opacity 0→1,
  translateY 20px→0); `.bento__card` animates
  `0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards` from an `opacity: 0`
  base; `nth-child(1..4)` stagger 0.1s–0.4s in DOM order.
- **The mandatory reduced-motion escape** — `@media
  (prefers-reduced-motion: reduce)` sets `animation: none;
  opacity: 1`. Without it, the `opacity: 0` base would leave
  reduced-motion users with permanently invisible cards. The negative
  test proves the gate: deleting the escape flips
  `verify:playground` to FAIL.
- **Spacing modernization** — ruled card headers:
  `.bento__card > h2 { margin: 0 0 var(--space-standard);
  padding-bottom: var(--space-tight); border-bottom: 1px solid
  color-mix(in srgb, var(--text-muted) 10%, transparent); }` on
  breathing-room `var(--space-section)` cards. The child combinator is
  deliberate — a descendant selector would also hit the timeline's
  package-rendered `.ptp-timeline__header` h2s (0,1,1 beats 0,1,0) and
  override their sticky-header geometry. The `bento__btn` press physics
  are untouched: `:active { transform: scale(0.97) }` +
  `transition: var(--transition-standard), var(--transition-transform)`.
- **Release gates** — `verify:playground` now runs b1–b7 PLUS h1–h3:
  the stagger/escape/hairline strings in `styles.css`, complete
  owner-shaped `mockEvents` (≥4 entries, ≥2 buckets, every field
  present, `--party-*` tokens only) + the mapping layer greps, and
  live-map icon probes. Core package untouched: `git diff v1.5.0 -- css/
  react/ tokens.json SYSTEM_PROMPT.md demo/ scripts/` empty, `npm pack`
  still exactly 34 files.

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
