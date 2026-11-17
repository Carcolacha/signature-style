# @edwyn/signature-style

> One command. One import. Your entire personal UI theme — Catppuccin-mapped, cake colors, zero manual hex codes.

📖 **Read the manual:** [STORYBOOK.md](./STORYBOOK.md) — the official, human-readable guide to the philosophy, every color token, and the component API.

## Standalone identity (v3.1.0 — "Pure Engine")

`@edwyn/signature-style` is a **standalone, general-purpose design
engine** — a universal Catppuccin-based design system, not a sub-folder
of any other project. v3.1.0 is the complete domain decoupling: the
engine's vocabulary is its own (`sig-` classes, `--sig-*` tokens,
`TimelineEvent`, `SigBadge`, `Attendee`/`attendance`), its examples are
universal engineering samples (workbench telemetry, resource
allocation, benchmarks, milestone planners, knowledge graphs), and a
dedicated purity gate (`npm run verify:standalone`) proves the working
tree carries zero residue of any former host project. Same discipline
as every release: token VALUES byte-identical, layout byte-stable —
a pure rename, proven by the zero-delta cortex probe.

`@edwyn/signature-style` installs edwyn's **Signature Style** into any project:
a **harmonized** foundation — 100% official Catppuccin, per-theme
(**Mocha (dark) by default, Latte (light) on request**, each wearing its own
palette's signature Flamingo/Teal pairing) — where every hover, active,
disabled and focus-visible state is *derived* from the core tokens
instead of hand-authored. It ships a zero-dependency CSS core, an optional
hardened React provider, a machine-readable token manifest, and the
**Dynamic Signature Engine v4.1** system prompt so AI agents can extend the
style faithfully.

```
npm i @edwyn/signature-style
```

## Scaffold any project — npx init (v3.3.0)

No install, no config: one command scaffolds the Signature Style — the
resolved theme tokens plus (optionally) a starter — into any project,
using **zero external dependencies** (node built-ins only):

```
npx @edwyn/signature-style init
npx @edwyn/signature-style init --template bento --theme oled --yes
```

| flag | values | default | what it does |
|---|---|---|---|
| `--template` | `minimal` \| `bento` | `minimal` | tokens only, or tokens + a starter |
| `--theme` | `mocha` \| `oled` \| `daylight` | `mocha` | which surface theme is resolved into `signature-tokens.css` |
| `--dir` | any path | `.` | target directory (created when missing) |
| `--force` | — | off | overwrite existing generated files |
| `--yes` | — | off | skip the interactive prompts (CI-safe; a non-TTY run never prompts either) |
| `-h`, `--help` | — | — | usage text |

**Framework detection** adapts the bento template to the host project:

| detection | trigger | bento output |
|---|---|---|
| `next` | `next.config.*` | `SignatureStarter.tsx` + `signature-bento.css` |
| `vite-react` | `vite.config.*` or `vite` in deps | `SignatureStarter.tsx` + `signature-bento.css` |
| `html` | `index.html` (without those) | `signature-starter.html` (self-contained, zero JS) |
| `fresh` | empty directory | `signature-starter.html` |

The starter is standalone by design — vanilla React hooks / pure
HTML+CSS, **no package component imports**, every color from the tokens.

**Safe injection:** every generated file is existence-checked — an
existing file is reported `[skip]` and left byte-identical unless you
pass `--force` (`[overwrite]`). Nothing outside the generated file list
(`signature-tokens.css`, the starter, `signature-bento.css`, `README-SIGNATURE.md`)
is ever touched.

The CLI's theme values live in an embedded, frozen map (`bin/themes.mjs`)
gated against `css/tokens.css :root` by the **cli2 drift needle** in
`npm run verify:cli` — if the canonical tokens ever change, the gate
fails and the map is regenerated, so `npx init` can never scaffold stale
colors.


## BREAKING CHANGES (v3.1.0 — the renames table for consumers)

The 3.1.0 release is a **pure rename**: every value, layout metric and
behavior is byte-stable — but the PUBLIC NAMES changed. Consumers must
mechanically re-aim:

| v3.0.0 (old) | v3.1.0 (new) |
|---|---|
| `.ptp-*` CSS classes (191 names, e.g. `.ptp-btn`, `.ptp-timeline__node`, `.ptp-stat-card`) | `.sig-*` (identity map: `.sig-btn`, `.sig-timeline__node`, `.sig-stat-card` — zero collisions with the pre-existing `.sig-shell`/`.sig-cell`/`.sig-span-*`/card-archetype classes) |
| `--party-*` tokens (26) | `--sig-*` (the 26 chromatic tokens: `--sig-cobalt`, `--sig-orchid`, `--sig-azure`, `--sig-neon-green`, … + the 10 legacy-suffix tokens `--sig-pink-bright`, `--sig-mauve-soft`, `--sig-lavender`, `--sig-sky`, `--sig-peach`, `--sig-green`, `--sig-yellow`, `--sig-pink-alt`, `--sig-pink-soft`, `--sig-mauve-bright`) — VALUES byte-identical |
| tokens.json `partyPalette` key | `sigPalette` |
| `PartyColorToken` type | `SigColorToken` |
| `PartyTokenName` type | `SigTokenName` |
| `PartyBadge` / `PartyBadgeProps` | `SigBadge` / `SigBadgeProps` |
| `PtpEvent` interface | `TimelineEvent` |
| `RsvpStatus` / `isRsvpStatus` (shared/schema.ts) | `AttendanceStatus` / `isAttendanceStatus` |
| `Guest` / `isGuest` (shared/schema.ts) | `Attendee` / `isAttendee` (`rsvp` → `attendance`, `contributionCents` → `allocationCents`, `guestId` → `attendeeId`) |
| localStorage keys `sig.v27.graph` / `sig.v27.timeline` (+ `-positions`/`links`) | `sig.workspace.v3.graph` / `sig.workspace.v3.timeline` (+ `-positions`/`links`) |
| snapshot version `"sig.v27"` | `"sig.workspace.v3"` |
| export filename `signature-snapshot.json` | `signature-workspace.json` |

Sample copy changed too (guest → member, RSVP → attendance, party →
chromatic/gathering-neutral): strings your tests may assert — the
ledger badge labels (`Confirmed/Pending/Declined`) are unchanged.

## Import paths (v1.0.0)

| Import | Resolves to | Peers needed |
|---|---|---|
| `@edwyn/signature-style` | `tokens.json` — the machine-readable manifest (AI tooling core) | never |
| `@edwyn/signature-style/css` | `css/signature-style.css` — the compiled bundle: tokens, base, cascade (timeline + modal + nav included), overrides | never |
| `@edwyn/signature-style/react` | umbrella `react/index.js` — `ThemeProvider`, `Icon`, `EmptyState`, `SigBadge`, `EventTimeline`, `EventModal`, `useModal`, `GlobalNav`, `ProgressBar`, `StatRing` | `react` + `react-dom`; `lucide-react` optional |
| `@edwyn/signature-style/wc` | `dist/wc/signature-wc.es.js` — the six zero-react custom elements (`sig-surface-card`, `sig-badge`, `sig-progress-bar`, `sig-stat-ring`, `sig-callout`, `sig-carousel`) + `dist/wc/index.d.ts` types | never (link the css once for the tokens) |

## Web Components usage — zero-react (v3.4.0)

One module import registers all six elements; one stylesheet link themes
them (the `--sig-*` custom properties inherit through shadow DOM):

```html
<link rel="stylesheet" href="node_modules/@edwyn/signature-style/css/signature-style.css" />
<script type="module">
  import "@edwyn/signature-style/wc";
</script>

<sig-surface-card eyebrow="Telemetry" meta="wc/elements.ts" title="Attendance Pulse"
                  accent-token="--sig-peach" elevation="floating" interactive>
  <p>Shadow-DOM body content rides the default slot.</p>
</sig-surface-card>

<sig-badge label="Confirmed" variant="green"></sig-badge>

<sig-progress-bar value="70" max="100" label="Budget remaining"
                  limit-text="70 / 100" accent-token="--sig-cobalt"></sig-progress-bar>

<sig-stat-ring value="85" size="120" accent-token="--sig-cobalt" show-value="true"></sig-stat-ring>

<sig-callout status="warning">3 pending responses close Friday.</sig-callout>

<sig-carousel mode="paged">
  <div>Slide one</div>
  <div>Slide two</div>
  <div>Slide three</div>
</sig-carousel>
```

Attribute reference (the React prop twin in parentheses):

| Element | Attributes | React twin |
|---|---|---|
| `sig-surface-card` | `eyebrow` · `meta` · `title` · `accent-token` · `elevation="flat\|raised\|floating"` (default raised) · `interactive` | `<SurfaceCard>` |
| `sig-badge` | `label` · `variant="peach\|sky\|green\|cobalt\|lavender\|mauve-soft\|pink-bright\|yellow\|orchid"` · `accent-token` (wins) | `<SigBadge>` |
| `sig-progress-bar` | `value` · `max` (default 100) · `label` (→ aria-label) · `limit-text` · `accent-token` | `<ProgressBar>` |
| `sig-stat-ring` | `value` · `total` · `unit` (default "%") · `size` (default 120) · `accent-token` · `show-value` | `<StatRing>` |
| `sig-callout` | `status="info\|success\|warning"` (default info → sky/green/peach strip) | `<Callout>` |
| `sig-carousel` | `mode="free\|paged"` (default free) · `label` — children slot in; dots + "1 / N" grow from the slotchange count | `<Carousel>` |

Imperative use works too — the module exports the classes:

```js
import { SigStatRing } from "@edwyn/signature-style/wc";
document.querySelector("sig-stat-ring").setAttribute("value", "40"); // arc animates
```

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

### Surface themes — one attribute (v3.2.0)

Three verified surface themes ride the canonical `data-sig-theme` attribute
on `<html>` (absent = Mocha). Every theme is WCAG-gated against its OWN
surface — the per-theme contrast tables are part of the release gate:

| theme | attribute | --bg-base | --bg-surface | --bg-inset | text |
|---|---|---|---|---|---|
| Mocha (default) | absent / `"mocha"` | #1E1E2E | #313244 | #282A36 | #CDD6F4 family |
| OLED true-black | `"oled"` | #000000 | #0B0C10 | #12141C | inherits (≥13.5:1) |
| Daylight | `"daylight"` | #F8FAFC | #FFFFFF | #F1F5F9 | dark slate ink |

```html
<html data-sig-theme="oled">
```

OLED declares ONLY the background trio — every other token inherits, and
the chromatic ratios only increase on true black. Daylight re-inks the
chromatic family with COMPUTED ink variants — each override measured ≥3.1:1
against #FFFFFF and documented with its ratio in `tokens.json →
sigThemes.daylight.inkVariants` (cross-checked by the contrast gate).
Geometry is an orthogonal axis: `data-sig-radius="standard"` (8px UI / 12px
cards — 8px-grid-pure) or `"sharp"` (0px/0px, brutalist); the `:root`
defaults stay 6px/12px. The live Theme & Surface Customizer ships in the
playground's Pattern Studio (theme + radius + per-token contrast badges +
tokens.css download/copy), also reachable via ⌘K.

### Light theme (legacy) — one attribute

The white version is Catppuccin Latte — the v3.2.0 canonical triad above
supersedes it, and the legacy toggle keeps working untouched. Opt in on any
element that wraps your app (usually `<html>`):

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

As of 2.5.0 the whitelist covers **every** custom property in
`css/tokens.css` — the core 6, the keeper tokens, the shared
font/radius/transition/spacing tokens, the z-index scale (now with the
navbar rung `--z-nav`), and the eleven
`--sig-*` content tokens (34 keys, typed at compile time and enforced at
runtime; 2.5.0 added `--sig-yellow`, the strength meter's Fair stage):

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
| VULN-3 | Provider FOUC, style-tag leaks, arbitrary prop injection | Isomorphic layout effect (`useLayoutEffect`/`useEffect`), `useId`-keyed deduped style tags, strict self-only cleanup, memoized serialization, token whitelist (all 34 tokens, type + runtime), CSS-injection guard on values |

## Changelog

### 4.0.0 — Motion Lab Rebuild, Flip/Accordion Geometry Fix, Destructive Confirm Norm & Human-Crafted Blueprints

**BREAKING — the template set changes.** The generic SaaS Landing +
Docs Reader blueprints RETIRE; the registry, the Templates Studio tabs,
and the CLI `--template` set are now exactly `telemetry | microlab`
(alongside `minimal | bento`). `telemetry` is REPLACED IN PLACE (the
CLI file stays `SignatureTelemetryCenter.tsx`) and `microlab` is NEW
(`SignatureMicroLab.tsx`). Both blueprints are authentic, human-crafted
pages with ORIGINAL content — invented call signs, invented maps,
deterministic mock numbers; the style genre is the inspiration, never
anyone's data. `StatRing`/`AccordionCard`/`FlipCard` consumers who pass
removed `saas`/`docs` ids must migrate; the components' props surfaces
only GROW (FlipCard gains optional rich-face fields, AccordionCard's is
untouched).

**The four defect fixes, proven:**

| # | The defect (v3.9.0) | The fix (4.0.0) | The proof |
|---|---|---|---|
| 1 | FlipCard 3D was a fake: the faces were absolutely positioned (contributing no height — the 220px floor owned the box), the perspective sat at 800px on the button, and any rotateX use rendered the back face upside-down. | TRUE full-card 3D: the button is a `display: grid` perspective stage (1000px); `.sig-flip-inner` docks at `grid-area: 1/1` with `transform-style: preserve-3d` and owns THE rotation — `rotateY(180deg)`, NEVER rotateX; both faces `.sig-flip-front`/`.sig-flip-back` share `grid-area: 1/1; width/height: 100%` with BOTH `backface-visibility` spellings hidden and `padding: 20px`. Rich faces layer on top: eyebrow badge + accent-underlined title + body + the mono "Click to flip" hint on both faces (front = prompt, back = reveal). Reduced motion keeps the opacity crossfade. | `node scripts/gates-v400.mjs` (cd1) pins grid-area 1/1, both backface spellings, rotateY-on-inner, min-height 220, radius-card — and FAILS a rotateX mutant (negative test n1). |
| 2 | AccordionCard expanded via browser default (no animation); closed accordions in card grids were STRETCHED over dead space by `align-items: stretch` rows. | TRUE height expansion: `.sig-accordion__body` is `display: grid; grid-template-rows: 0fr` expanding to `1fr` on `details[open]` — `transition: grid-template-rows 320ms var(--ease-spring-gentle)`, the inner carrying `overflow: hidden` (the modern technique, no max-height hack; the native details/summary mechanism still IS the state machine). Containing grids use `align-items: start` (`.hub__row--4` audited + fixed). | Computed check: closed body reads `0fr`, open reads `1fr`; gate (cd2) pins the 320ms spring needle + the overflow-hidden inner (negative n3 kills the expansion → FAIL). |
| 3 | Destructive actions were one-click: node deletes, canvas resets and workspace resets fired immediately on the button press (or on Delete/Backspace). | THE DESTRUCTIVE ACTION NORM: `<ConfirmDialog>` (NEW `react/overlays.tsx` + `css/overlays.css`) — portal-mounted on the z-40 scrim/z-50 card rungs, Escape/scrim/cancel all CANCEL, Tab is TRAPPED inside, the cancel button takes focus on open (one accidental Enter never destroys), focus returns to the trigger on close (`useFocusReturn`). Confirm = solid `var(--sig-crimson)` + `#FFFFFF` ink (4.18:1 ≥ 3.1, gate-asserted). Wired EVERYWHERE: Graph Studio's inspector Delete Node + the Delete/Backspace key route (children promote to roots), Reset Canvas ("Yes, Reset"), and the Analytics & Planner Reset Workspace. Pattern Studio carries the live recipe frame. | Gate (ov1) asserts portal/z-rungs/trap/Escape/aria-modal/contrast; negative n2 strips the trap → FAIL; negative n4 drifts the crimson → FAIL. |
| 4 | The Motion Lab's v3.9.0 showcases were derivative (detent panels, an Open-Meteo fetch demo) and half the frames' Play buttons merely replayed an entrance. | WIPE & REBUILD — six vivid showcases, every Play/Trigger fires immediate motion: 01 Aurora Beam & 3D Tilt (Play forces the always-on beam beat), 02 Staggered Bento Wave (key-remounted `@keyframes` cascade, 60ms stagger from `opacity 0 · translate3d(0,24px,0) · scale(0.94)`), 03 Tactile Spring Detents (two pucks race on snappy vs gentle — the overshoot crystal-clear), 04 FLIP Gliding Pill (--sig-cyan re-ink) & Morphing Drawer (the Task-2 grid-rows technique), 05 Kinetic Equalizer & Pulse Beacons (3-color bars + sequential sonar rings), 06 Live Telemetry Sweep (one button rolls an AnimatedNumber, jumps the 128px StatRing, re-draws the AreaChart path sweep). Control bar stays: 1.0× / 0.25× Slow-Mo (`--sig-motion-scale`) / Reduced Motion Preview / Replay All. | Gate (ml1) pins all six showcases + the puck container/cqw finish line + the wave stagger + both reduced-motion belts per mechanic; the (mo6) gate pins the deterministic spike roster (no `Math.random`, no fetch). |

**The human-crafted blueprints.** `telemetry` — Match & Telemetry
Analytics Hub: Player Summary header (rank SigBadge, call sign, live
AnimatedNumber rating, the 128px win-rate StatRing), Role Mastery
(BarChart + ProgressBar per role), Rating Momentum (AreaChart), and the
filterable Match History DataTable with `--sig-mint` Win / `--sig-crimson`
Loss badges. `microlab` — Interactive Micro-Lab & Discovery Deck: the
Millisecond Reaction-Time Test (idle → waiting → green → result; a
random 1–3s hold, exact ms in tabular-nums, "Too soon!" reset,
best-of-5), the fixed-seed FlipCard Prompt Deck, and the Focus Rhythm
Waveform Toy (toggle + tempo controls over WaveformBars + StatusBeacon).
Templates Studio tabs read `01 · Analytics Hub | 02 · Micro-Lab` with
the viewport emulator, theme switcher and Copy Full Page preserved;
`verify:cli` scenarios G/H scaffold both flavors, and the retired
saas/docs ids are clean exit-1 errors.

**The ConfirmDialog norm ships in the package surface.** `react/overlays.tsx`
+ `css/overlays.css` join the bundle (the (bd1) blur sanction grows one
file, enumerated) and the umbrella exports; `SYSTEM_PROMPT.md` gains the
"Destructive Action Norm" subsection with the copy-paste recipe. Pack
count: 68 → EXACTLY 71 (+ `css/overlays.css`, `react/overlays.js`,
`react/overlays.d.ts`; the `.tsx` source stays negated like every
package source).

### 3.9.0 — Full-Viewport Tree & Mind-Map Graph Studio, Colorful Kinetic Suite & Responsive Layout Closure

The four diagnosed defects, fixed and PROVEN (the cortex probe
`playground/probe-v390-cortex.mjs` measures every number below live):

| # | The defect (v3.8.0) | The fix (3.9.0) | The proof |
|---|---|---|---|
| 1 | The Templates Studio emulator lied: the templates' reflow never answered the 375px stage inside a 1920px window — the Telemetry grid stayed 12 columns (9.25px tracks) and its KPI tiles physically overlapped, because each template declared its container ON its own root and a container query cannot restyle its own container (the breakpoint rewrites were dead CSS). | ONE shared container name `template-stage`, declared by the studio stage AND each template root (standalone purity); the telemetry grid moved to an inner wrapper the queries can legally restyle; three tiers everywhere (12-col >1024 / 2-col 640–1024 / 1-col <640 for telemetry; 3→2→1 for SaaS; docs keeps its ≤1023 collapse). | Stage 375/768/1440 → three distinct computed grid states; tiles pairwise-disjoint; zero stage overflow (`probe-v390-templates.mjs`, `--before` mode documents the v3.8.0 baseline). |
| 2 | The Motion Lab StatRing ballooned to ~700px: `size` was a bare number and the svg had no box contract, so a wide flex row stretched it. | BREAKING: `size` is now the enum `"sm" \| "md" \| "lg"` (88 / 128 / 168 px, default `"md"` — legacy numbers warn and fall back to md). The enum resolves to an inline `--ring-size`; css/viz.css answers with the `.sig-stat-ring` box: exact width/height, `aspect-ratio: 1/1`, `flex-shrink: 0` — it can never stretch again. All call sites migrated (Motion Lab, Telemetry gauges, Pattern Studio, the Workbench ring). | The Motion Lab ring measures EXACTLY 128×128 inside the wide telemetry row (cortex c1). |
| 3 | The Workbench Chromatic Palette sat in a span-3 cell (264px) where the auto-fill grid resolved to ONE column — 26 swatches stacked vertically and the page stretched to 4609px. | The palette moves to the WIDE BOTTOM COMPARTMENT (`sig-span-12`, the row math kept hole-free by promoting Telemetry to row-span 2); the swatch grid packs `repeat(auto-fill, minmax(120px, 1fr))`; the FlipCard's 220px floor is pinned by the mm3 gate + probe. | Page height 4609 → 3279 (−1330px, −29%); 10 swatch columns at 1440; FlipCard 220px; zero overlapping bento cells (cortex c2). |
| 4 | The Motion Lab was static and cryptic: entrances fired before scroll, nothing explained itself, no per-card trigger. | Every one of the SIX frames now carries (a) a plain-English explanation line, (b) a per-card **Play Effect** button (per-frame remount keys), (c) an IntersectionObserver auto-trigger — entrances fire when the frame scrolls into view (verified: unvisited frames hold hidden). | Cortex c4: 6 frames × 3 contracts; IO holds + reveals on scroll. |

**The full-viewport Graph Studio.** The view BYPASSES the shell —
full-bleed under the 56px nav (`width: 100%; height: calc(100vh -
56px); position: relative; overflow: hidden`, the 24px dot-matrix
board edge to edge, the svg filling the stage via a ResizeObserver).
**THE LAYOUT ENGINE**: nodes gain `nodeKind?: "root" | "branch" |
"leaf" | "note"` (dashed ring for notes; `data-kind` + `data-layout-mode`
stamped for probes) and the canvas gains `layoutMode?: "free" | "tree" |
"radial"` (default `free` — the untouched contract). Two new pure,
gate-testable helpers: `layoutTree` (deterministic top-down tidy:
hash-sorted, leaf slots, parents centered, one row per depth) and
`layoutRadial` (the historical ring engine under its mode name), plus
`treeEdge`'s vertical cubic Beziers. Dragging/nudging is free-mode only
— the deterministic layouts are the law. **THE 3 FLOATING HUD CARDS**
(`.graph-hud` + the `.sig-surface-card` elevation, position absolute,
z-30, the bd1-sanctioned blur): ① top-left toolbar — Search (dims
non-matches 0.25), the Free/Tree/Radial segmented switcher, Auto-Layout,
Zoom − / tabular % / Zoom +, the Nodes·Edges counter; ② bottom-center
Action Dock — + Add Node, + Spawn Branch, **AI Expand Node** (a LOCAL
heuristic generator — `playground/graph-expansion.ts`: curated pools
per token bucket, deterministic id-hash seeds, distinct four-token
accents, NO network; same selection = same sub-nodes, probe-proven
across a reset/re-expand cycle), Reset Canvas, Export JSON; ③ the
right inspector (320px, floats on selection, ✕ collapses) — Title,
Node Kind, the 16-swatch chromatic picker, Tags, Notes, Connected
Edges (unlink + jump). The layout mode persists through the EXISTING
`sig.workspace.v3.prefs` object (optional `graphLayout` field); edge
unlink is preserved AND FIXED — the pan handler's pointer capture had
been swallowing real edge clicks since 3.6.0 (capture retargeted the
follow-up click; the gates only ever dispatched synthetic events).
60fps drag re-verified (rAF median 16.7ms).

**The Colorful Kinetic Suite** (4 new primitives, zero external
animation deps, every one standing down under reduced motion):

| Primitive | Signature | Mechanism |
|---|---|---|
| `AuroraBorderCard` | `accentTokens?` (default cyan/orchid/mint/cobalt) · `trigger?: "hover" \| "always"` | css/motion.css REGISTERS `--sig-beam-angle` (`@property`, syntax `"<angle>"`); the `::before` is a conic-gradient masked to a 2px ring. NEVER a box-shadow. Fallback: no-`@property` engines keep a static 4-color ring. |
| `TiltSurface` | `tilt?: number` (default 4) · `accentToken?` | `perspective(600px)` rotateX/rotateY tracking the pointer via the KineticSurface rAF math extended with `--tilt-x/--tilt-y`; the sheen rides along. |
| `StatusBeacon` | `status` · `colorToken` · `size?` (default 8) | One `role="status"` span + a `::after` ping (scale 1→2.2, fade — transform/opacity only). Reduced motion: static dot. |
| `WaveformBars` | `data?` · `bars?` (default 12) · `active?` · `colorToken?` | Per-bar animation-delay equalizer (`calc(--bar-i × 90ms)` on the snappy spring); heights from `data` (normalized) or the deterministic golden-angle curve. |

Also: the Motion Lab's frame mix refreshed (01 Chromatic Stagger Wave ·
02 Aurora Beam & 3D Tilt + the sheen trio · 03 Spring Detents, kept ·
04 FLIP Tabs & Elastic Drawer · 05 Proportional Rolling Telemetry ·
06 Open-Meteo, restyled with the status beacon + cyan/violet chart
pair); `PatternFrame` grew the `note` explanation prop; and one suite
lesson is documented in-code — Chrome's IntersectionObserver applies
the target's own clip-path to the intersection, so `clip-reveal`
(zero-area clip) can never trigger its own reveal.

**Gates grown**: (ring2) evolved + (mm1) container reflow, (mm2) ring
enum, (mm3) workbench, (mm4) graph studio, (mm5) kinetic suite — as
pure functions in `scripts/gates-v390.mjs`, run by verify.mjs AND by
the negative tests (`scripts/verify-negative-v390.mjs`: deleting the
`@property` block trips mm5, deleting the stage `container-type` trips
mm1 — every gate proven able to fail). verify:mcp grew the (s2f) graph
HUD + (s2g) kinetic-suite presence probes. Pack count unchanged (68 —
no new shipped files; all growth landed in existing packed files).
tokens.json meta → 3.9.0, VALUES frozen (the whitelist stays 60 — the
owner's "--sig-amber" maps to our `--sig-yellow`; the "--sig-primary"
halo maps to `--color-cake-primary`; both documented mappings).

### 3.8.0 — Full-Page Layout Templates, Interactive Viewport Previewer & CLI Template Expansion

The engine now scaffolds **entire sites**: three self-contained full-page
templates, a studio that previews them at any width and any theme, and a CLI
that emits them into any project — with the same discipline (token VALUES
byte-frozen, the whitelist stays 60, css/ react/ wc/ demo/ tools/ byte-frozen,
e1 treaty, reduced-motion on everything new).

#### The three full-page blueprints (`playground/templates/`, NEW)

One default-export React page each, built **exclusively** from
`@edwyn/signature-style` exports + the v3.7.0 kinetic primitives, each with an
embedded token-driven `<style>` block (zero hex, 8px grid, container queries,
reduced-motion honored) and its own `ToastProvider` where toasts are wired —
scaffold it and it renders complete:

| id | name | blocks (top to bottom) |
|---|---|---|
| `saas` | **SaaS Landing** | AnnouncementBanner → staggered MotionReveal PageHero + dual CTAs → 3-col KineticSurface feature grid (tinted icon wells) → Tabs billing switcher (FLIP indicator) wired to the AnimatedNumber price strip over the 3-col TierCard row (annual = 20% off computed) → 3 AccordionCard FAQ → structured footer |
| `docs` | **Docs Reader** | Breadcrumbs → the 220px / reading / 200px-outline grid (`@container` collapse below 1023px) → ProseBlock chapters with the violet-glow quote bar → info Callout → ReferenceCard (copyable TSX snippet) → 5-row config DataTable → static On This Page outline → Prev/Next ActionTiles |
| `telemetry` | **Telemetry Center** | 12-col asymmetric bento: 4 KPI tiles (2 rolling AnimatedNumber+Sparkline tiles + 2 StatCards) → 2 StatRing capacity gauges → AreaChart + BarChart panels → the state-wired TimelineManager deployment schedule → the filterable node-status DataTable |

The registry is `playground/template-registry.ts` — `PAGE_TEMPLATES:
Array<{ id, name, description, Component, source }>` — where `source` is the
formatted standalone TSX, **mechanically derived** from the shipped component
file (`playground/template-sources.ts`), so the copy payload can never drift
from the live page (gate (tpl1) byte-checks the parity).

#### The Templates Studio (`#/templates`)

The 9-view model grows one REAL view: a sticky glass control bar over one
stage:

- **Viewport Width Emulator** — Desktop (100%) | Tablet (768px) | Mobile
  (375px). The stage's width transitions over `var(--dur-glide)
  var(--ease-glide)`; the templates reflow via their own container queries,
  which answer the stage, not the window. Reduced motion strips the
  transition.
- **Live Theme Switcher (SCOPED)** — Mocha | OLED | Daylight sets
  `data-sig-theme` on the STAGE WRAPPER only. The tokens.css theme blocks are
  plain attribute selectors (`[data-sig-theme="oled"]`), so a div re-themes
  exactly its subtree: the preview swaps surface triads while the rest of the
  app keeps the user's theme (probe-proven: wrap `--bg-base` #000000, root
  #1E1E2E).
- **Preview | Full TSX Code** — the live page inside the stage, or the
  registry source as `<pre><code>`.
- **Copy Full Page** — the registry source on your clipboard, confirmed by
  the mint-accented aria-live chip (`--sig-mint`) + the standard toast.

FLIP-numbered template tabs (01 · 02 · 03), palette jumps per template,
breadcrumbs `engine / templates / saas-landing`, and the templates' live state
(billing math, chapter nav, ledger filter, deployment manager) is fully
interactive in Preview.

#### CLI template expansion

`--template` grows `saas | docs | telemetry` (alongside `minimal | bento`):

| detection | output |
|---|---|
| `next` / `vite-react` | `SignatureSaasLanding.tsx` / `SignatureDocsReader.tsx` / `SignatureTelemetryCenter.tsx` — the React blueprint, importing `@edwyn/signature-style/react`, with the install + tokens-css note in the summary and README |
| `html` / `fresh` | `signature-starter.html` — the per-template **static HTML mirror**: the same blocks as plain HTML + the tokens variables, one honest snapshot (not the React statefulness), zero JS, zero hex, reduced-motion guard |

The embedded template map ships as `bin/templates.mjs` (pure data, zero
imports — the `bin/themes.mjs` pattern); the drift-lite needle (gate tpl3)
pins registry-id parity 3 = 3. `verify:cli` grows scenarios E/F/G (99 checks
green) and the tarball grows 67 → **68** files.

#### Certification

`verify:mcp` adds the Templates navigation probe (s2d: the studio, control
bar, stage and the live SaaS landing measure alive rects) + the 4-viewport
capture matrix ON the Templates view (s2e); `verify:a11y` and
`verify:visual-diff` grow to the 9-view census (focus halos EMPTY exception
table); `probe-v380-templates.mjs` is the release-blocker proof (emulator
widths measured, container-query reflow, scoped theming, copy, live billing
math, filter, 4-viewport zero-overflow sweep). Goldens re-certified with
intent (the studio + templates are new visuals). SYSTEM_PROMPT rises to
**v4.0** — the Full-Page Layout Blueprints section is the capstone chapter;
`llms-full.txt` now carries the three full-page sources (the generator reads
the registry's data layer).

### 3.7.0 — The Intelligent Kinetic Engine, Motion Lab & Live Data Choreography

The engine learns to MOVE — native `linear()` springs, a time-dilation
dial, one gliding underline, and a live zero-key data stage — with the
same discipline: zero external animation dependencies (native CSS
`linear()` curves, `@keyframes`, `rAF`, `IntersectionObserver` only),
the e1 motion amendment (animate ONLY transform / opacity / clip-path /
custom properties — `box-shadow` NEVER, gate-enforced), and reduced-motion
mercy on every animation.

#### The kinetic tokens (whitelist 51 → 60)

Nine motion tokens join `css/tokens.css` (`:root`), `tokens.json`
(`motionTokens`) and the ThemeProvider whitelist; the 50 color tokens
are byte-frozen:

| Token | Value | Role |
|---|---|---|
| `--ease-spring-snappy` | `linear(0, 0.44 6.4%, … 1 69.1%, 1)` | damped fast spring — detents, toggles, ring arcs |
| `--ease-spring-gentle` | `linear(0, 0.36 8.9%, … 1)` | smooth harmonic — reveals, number rolls |
| `--ease-kinetic-out` | `linear(0, 0.61 10.8%, … 1)` | high-velocity deceleration — chart sweeps |
| `--ease-glide` | `linear(0, 0.63 14.5%, … 1)` | sliding indicators — FLIP underline, pages |
| `--dur-spring-snappy` | `calc(var(--sig-motion-scale, 1) * 320ms)` | snappy duration |
| `--dur-spring-gentle` | `calc(var(--sig-motion-scale, 1) * 480ms)` | gentle duration |
| `--dur-kinetic-out` | `calc(var(--sig-motion-scale, 1) * 380ms)` | sweep duration |
| `--dur-glide` | `calc(var(--sig-motion-scale, 1) * 280ms)` | glide duration |
| `--sig-motion-scale` | `1` | the time-dilation master (Slow-Mo sets 0.25) |

`linear()` is Chrome 113+ / Safari 17.2 / Firefox 112+; a
`@supports not (transition-timing-function: linear(0, 1))` block
re-declares the four as cubic-bezier approximations (snappy 0.34,1.56,0.64,1 ·
gentle 0.25,1.25,0.45,1 · kinetic-out 0.16,1,0.3,1 · glide 0.4,0,0.2,1).
Under `prefers-reduced-motion: reduce` AND the
`[data-sig-motion="reduced"]` root override, all four durations collapse
to 1ms.

#### The kinetic primitives (`react/motion.tsx`, NEW)

- **`<AnimatedNumber value prefix suffix decimals duration>`** — rAF
  roll from the previous value, spring-interpolated (easeOutQuint + a
  damped 2% overshoot peaking at 70%), tabular-nums, no aria-live (the
  final value lands), instant under reduced motion.
- **`<MotionReveal variant staggerIndex delay>`** — IntersectionObserver
  once-entrance: `fade-up` / `scale-in` / `clip-reveal`; the stagger
  wave rides `calc(index × 45ms)`; replay = remount.
- **`<KineticSurface accentToken>`** — cursor-tracking sheen:
  rAF-throttled `--ptr-x/--ptr-y` writes, a 240px radial-gradient
  `::after`, opacity-only fade (the position repaints, never animates).

#### The FLIP gliding indicators + directional choreography

`<Tabs>` and `<GlobalNav>` retire their teleporting per-item underline
for ONE shared indicator (`.sig-tabs-indicator` / `.sig-nav-indicator`)
that glides via the FLIP mechanics of `useFlipIndicator` — measure both
boxes, invert to the previous geometry, play the transform over
`var(--dur-glide) var(--ease-glide)`. The `aria-selected` /
`aria-current` contracts are untouched (the drawer keeps its per-link
underline). `<Carousel>` paged mode records its travel direction and
the incoming page glides in from that edge (±24px + opacity).
`<AreaChart>`/`<Sparkline>` lines draw themselves on mount
(`pathLength={1}` + a dashoffset sweep), and the StatRing arc now
rides the snappy spring.

#### The Motion Lab (`#/motion`)

A new view stages the engine: a sticky glass control bar (Speed
Multiplier **1.0× / 0.25× Slow-Mo** — sets `--sig-motion-scale` on the
lab root; **Replay Choreography** — remount key re-arms every entrance;
**Reduced Motion Preview** — the `data-sig-motion="reduced"` toggle)
over six PatternFrame showcases: 01 the staggered bento cascade, 02 the
Snappy-vs-Gentle spring detents (LAB-only scoped overrides), 03 the
cursor-tracked kinetic sheen trio, 04 the FLIP gliding navigation, 05
rolling telemetry (AnimatedNumber + StatRing + Sparkline), and 06 the
**live zero-key API choreography** — the fallback-first pattern against
`api.open-meteo.com` (deterministic offline sample renders FIRST,
labeled as a sample; the live fetch swaps in on success; SkeletonCard
during the window; failure keeps the fallback and toasts on manual
refetches; AbortController on unmount).

#### Also in 3.7.0

- Gates: `(mo1)` motion tokens + fallback + mercy · `(mo2)` the Motion
  Lab view + six showcases + control bar · `(mo3)` the FLIP indicators
  (transform-only transition; the per-tab underline must be GONE) ·
  `(mo4)` AnimatedNumber rAF + instant reduced motion · `(mo5)` the sheen
  ptr-vars + opacity-only · `(mo6)` the Open-Meteo URL + fallback-first ·
  `(e1-motion)` zero box-shadow animations in motion.css/viz.css/tokens.css
  (`@keyframes` blocks included). Negative-tested: deleting the
  `@supports` fallback block fails `(mo1)`.
- Pack: EXACTLY 67 files (64 + `css/motion.css` + `react/motion.js` +
  `react/motion.d.ts`; the `!react/motion.tsx` negation joins the files
  array). The a11y + visual-diff censuses grow to the eight-view map.
- `SYSTEM_PROMPT.md` title steps to **v3.9** with the kinetic recipes;
  `llms.txt`/`llms-full.txt` regenerated (60 tokens, Set 08 · Motion &
  Kinetics).

### 3.6.0 — Graph Studio, 3×3 Carousel, Zero-Defect A11y & Live Schema Sandbox

The release closes every deferred a11y item, promotes the knowledge graph
to its own view, and rehearses the async backend before it exists.

#### The six-view map

| View | Hash | What lives there |
|---|---|---|
| Workbench | `#/dashboard` | the 12-column live bento (the "Dashboard" nav label retires) |
| **Graph Studio** | `#/graph` | the dot-matrix canvas, the floating HUD, the 340px inspector |
| Analytics & Planner | `#/planner` | BarChart + AreaChart + the Milestone Manager + the snapshot toolbar |
| Pattern Studio | `#/studio` | the 6-set taxonomy + the live theme customizer |
| Master Index | `#/index` | the archetype catalog (the GRAPH STUDIO + STUDIO gateway doors now navigate for real) |
| AI Codex | `#/codex` | tokens, rules & recipes |
| Chronicle | `#/chronicle` | the Night of Versions memorial — off the nav bar, still hash- and palette-reachable |

#### Graph Studio — the centerpiece

- **The edge model grows up:** explicit edges are `GraphEdge { id, fromId, toId }` records
  (persisted `sig.workspace.v3.links`, legacy `{from,to}` migrates on write); parent edges
  stay derived (`parent:${childId}`). Every edge renders an invisible 14px hit path under
  the hairline — click selects it (crimson `--sig-crimson`), `Delete`/`Backspace` unlinks
  (typing-target guarded), the inspector shows the edge card with an Unlink button.
- **The imperative handle:** `ref → { zoomIn, zoomOut, getZoom, autoArrange, selectNode }`
  drives the HUD's zoom group (center-anchored), the Auto-Arrange button (clears persisted
  positions → the deterministic layout re-runs → re-persists) and Jump-to-target.
- **The inspector:** Title / Color Token (the 26-token Select) / Tags (comma-separated →
  chips; `GraphNodeRecord.tags` joins the shared schema, enumerated) / Notes — debounced
  300ms into the persisted graph; Connected Edges; Spawn linked child.
- **The HUD:** Search Nodes (dims non-matching nodes/edges to 0.25), the tabular
  `Nodes n · Edges e` counter, and the "?" shortcuts ghost button.

#### The true 3×3 Carousel

`paged-3` is no longer a scroll track — it is a **stateful page deck**: pages of three in
`repeat(3, minmax(0, 1fr))` grids with equal heights, exactly one visible, the rest
`hidden` **and** `inert`. Dots are one per PAGE (`6 items → 2 pages → 2 dots`), chevrons
disable at the bounds, the indicator reads "Page p of P", and ←/→ flip pages. Free-scroll
keeps the snap track + IntersectionObserver dots.

#### Zero-Defect A11y

- The v3.5.0 deferred finding closed: the master-index gateway doors wear the doctrine
  halo (`:focus-visible → 2px var(--color-cake-primary)`; the spec's `--sig-primary` does
  not exist — the mapping is documented in styles.css), with scoped
  `:focus:not(:focus-visible)` outline kills on the doors and the action tile.
- The **inert sweep**: FlipCard hidden faces swap `inert` with the flip; the aria-hidden
  container-query probe is inert; the closed-`<details>` contract asserted, not re-implemented.
- Real axe findings fixed: the ReferenceCard code well is keyboard-focusable with the halo;
  `sig-stat-ring` honors `label` (progressbar accessible name); the settled-row dim is
  scoped to the title (muted × 0.6 measured 2.29:1 — below the floor); WCAG 2.5.3 labels
  (the copy buttons and the graph nodes now carry their visible text in their names).
- The gate: axe **zero critical + serious + moderate on ALL SEVEN views**, color-contrast
  adjudicated by the two-tier policy (every axe-flagged pair must still clear 3.0:1).

#### The two-tier contrast policy

`tokens.json → doctrine.contrastPolicy` + per-token `contrastTier` codify what the
measurements say: ink-tier tokens (pink-bright 4.76, pink-soft 7.97, pink-alt 7.68,
mauve-soft 6.19, sky 4.50, cobalt 5.97, green 7.25, yellow 9.89) carry body text at
**≥4.5:1** — on ALL THREE canonical themes, no value changed. The sub-4.5 inks —
mauve-bright 3.22, lavender 3.95, peach 4.22, `--text-muted` 3.40 — are declared
**display tier (≥3.0:1)**: large headings (≥1.5rem/600), borders, fills, badges,
caption metadata — never body text. Values stay frozen; the policy documents the tier
and `verify:contrast` (ct8) enforces the metadata against the gate's own table.

#### The WorkspaceRepository — the live schema sandbox

`playground/workspace-repository.ts` is the async persistence seam
(`getGraph/getTimeline/getPrefs/getLinks` + `save*` + `latency`). The studio HUD's
"Simulate 600ms latency" toggle (and its palette command) turns every workspace save
into a 600ms async round-trip: skeletons render in the affected cards, content returns
on completion, and the error path (a save with an empty node title) rejects into the
error toast. Swap the adapter for the FastAPI HTTP adapter when the backend ships —
**`examples/fastapi-starter/`** is the runnable reference (FastAPI + stdlib sqlite3,
CORS wired for `:5173`, the SCHEMA_V3 endpoints; excluded from the npm pack —
`verify:examples` py_compiles it and proves the pack stays EXACTLY 64 files).

#### Also in 3.6.0

- **Theme/radius prefs merged** into one object under `sig.workspace.v3.prefs` (the
  v3.2.0 per-axis keys migrate on first load) + **Copy Theme Snippet** in the customizer
  (`<html data-sig-theme="…" data-sig-radius="…">` to the clipboard).
- **The ShortcutModal** — `?` opens the full keyboard map (kbd chips) from any view.
- **The command palette** grew to the full workflow set: seven "Go to" destinations,
  the theme/radius commands, Simulate Async Load, Export `signature-workspace.json`
  (now carrying links), the shortcuts modal, and the latency toggle.
- **The system prompt** is now **v3.8** (Graph Studio, the repository pattern, the
  carousel contract).


### 3.5.0 — Standalone Visual Cortex MCP Server & CI Pixel-Diff Certification

Milestone 4 of 4 — **the ecosystem closer**. Zero component changes
(`css/`, `react/`, `wc/`, `dist/wc/`, `demo/`, `scripts/verify.mjs`,
`shared/`, `docs/` byte-frozen; the token VALUES + the 50-token whitelist
byte-frozen). The MCP package is NEW, the certifications are NEW scripts,
`ci.yml` is NEW, and the repo-local inspector is retired upstream into its
own product.

#### The ecosystem, shipped across v3.2.0 → v3.5.0

| Milestone | Version | What shipped | The proof it stays true |
|---|---|---|---|
| Multi-Theme Surface Engine | v3.2.0 | The canonical surface triad — Mocha (default) / OLED true-black / Daylight high-contrast — via `data-sig-theme`, with computed daylight ink variants and the `data-sig-radius` geometry presets | `verify:contrast` (ct1–ct7, all 26 tokens × 3 themes) |
| Pure npx Scaffolder | v3.3.0 | `npx @edwyn/signature-style init` — resolved `signature-tokens.css`, zero dependencies, `--template bento` starter | `verify:cli` (cli1–cli3, drift-gated theme map) |
| Zero-React Web Components | v3.4.0 | Six framework-free custom elements (`import "@edwyn/signature-style/wc"`) — shadow DOM, token-driven, attribute-reactive | `verify:wc` (zero-react greps + a real Chromium render proof) |
| Visual Cortex as a Product | v3.5.0 | `packages/signature-mcp` — the standalone 4-tool MCP server (inspect_layout · audit_contrast · audit_e1_shadows · capture_viewport_matrix) + the CI certification battery | `verify:mcp` (raw JSON-RPC smoke) · `verify:a11y` · `verify:visual-diff` |

#### What shipped in 3.5.0

- **`packages/signature-mcp` (NEW, private `@edwyn/signature-mcp` v1.0.0)** —
  the Visual Cortex as a product: a standalone MCP stdio server giving AI
  sessions spatial awareness of the rendered app. FOUR tools —
  `inspect_layout` (the verbatim port of the proven bounding-rect mapper),
  `audit_contrast` (runtime WCAG ratios: effective background walked from
  the first painted ancestor → body/html → the documented `#1E1E2E`
  assumption; effective text color alpha-blended; worst-first failure
  summary at the 3.0 floor), `audit_e1_shadows` (the e1 treaty
  operationalized at runtime: every computed box-shadow with an
  `allowed` verdict against the sanctioned surface hooks), and
  `capture_viewport_matrix` (the doctrine 4-viewport screenshot sweep).
  Playwright pinned EXACTLY `1.65.0` — the repo's installed Chromium, no
  second download. Attach configs for **VS Code** (`.vscode/mcp.json`),
  **Claude Code** (`claude mcp add` + the `mcpServers` JSON), and
  **OpenCode** (`opencode.json` `mcp.servers`, per
  <https://opencode.ai/docs/mcp-servers>) in
  [`packages/signature-mcp/README.md`](./packages/signature-mcp/README.md) —
  all pointing at `node <abs>/packages/signature-mcp/dist/server.js`.
  First-run evidence: 61 layout hits · contrast **49 pass / 0 fail** ·
  e1 **14 sanctioned / 0 violations** (545 elements swept) · 4 viewport
  PNGs (33–116 KB).
- **`tools/mcp-viz/` DELETED** — the inspector's logic lives on in the
  package (the sweep ported verbatim, server version 3.5.0). The six
  playground probes retarget their playwright `createRequire` to the
  package manifest. `npm run inspect` now points at the package.
- **`verify:mcp` rewired** — `scripts/verify-mcp.mjs` (NEW) is the proven
  v2.7.0 JSON-RPC harness grown to the four tools: exactly-4 tools/list,
  ≥20 layout hits, the studio zero-react proof carried, contrast
  pass/fail summary, e1 sanctioned/violations, exactly-4 matrix paths
  with bytes on disk.
- **`verify:visual-diff` (NEW)** — golden-master pixel certification:
  5 committed baselines (`scripts/goldens/*.png`, the 5 real views at
  1440×900 full-page), pixelmatch at 0.1% tolerance. Determinism:
  `reducedMotion: "reduce"` + `animations: "disabled"` + 800ms settle —
  measured ZERO diff pixels run-to-run. **Negative proof
  (restore-verified):** nudging `--bg-surface` flipped ALL 5 views to
  FAIL (35–66% diff) → restore → PASS, `css/` byte-identical. The
  negative test ALSO caught pixelmatch's default `threshold: 0.1` YIQ
  dead-zone swallowing the uniform ~10%-luminance theme shift (0 flagged
  pixels at 0.1 vs 66% at 0.05) — the gate pins `threshold: 0.05`.
  Font-risk honesty: goldens are machine-dependent; `update:snapshots`
  regenerates; CI runs this suite `continue-on-error` while LOCAL runs
  are the strict gate.
- **`verify:a11y` (NEW)** — keyboard certification across the 5 views:
  60-stop tab walks (every stop interactive, no focus traps, DOM-order
  advance with ≤1 clean wrap), the doctrine focus halo (≥2px) at every
  stop with the ring ink asserted as `var(--color-cake-primary)` —
  measured **100% cake** (58/58 · 60/60 · 9/9 · 46/46) — the toast live
  region (`role="status" aria-live="polite"`) firing and updating, the
  role census (progressbar+valuenow ×4, tablist/tab+aria-selected,
  radiogroup), and injected axe-core (offline-safe, bundled devDep) at
  **zero critical**. Two serious findings REPORTED, owner-deferred:
  `aria-hidden-focus` (1 node) and axe's `color-contrast` at its 4.5:1
  AA bar (73 nodes — the package doctrine pins 3.0/3.1 for the token
  inks, enforced at runtime by `audit_contrast`). One real css finding:
  the master-index gateway buttons (`.hub__card--gateway`) still carry
  the UA-default 1px ring — enumerated as the gate's single exception
  (`css/` is frozen this release).
- **CI (NEW `.github/workflows/ci.yml`)** — push(main) + pull_request;
  two parallel jobs: `gates` (typecheck · verify · verify:standalone ·
  verify:contrast · verify:cli · build · build:wc · verify:wc ·
  verify:playground · verify:mcp — with Chromium installed and the dev
  server started detached + curl-retry wait-for-200 for the browser
  suites) and `a11y-visual` (verify:a11y strict · verify:visual-diff
  `continue-on-error` per the font risk). `publish.yml` untouched.
  Badge: *placeholder — add after the first remote push* (no remote
  exists yet; nothing has run on GitHub CI).
- **Gates** — `verify:playground` evolves: (m1)/(m2)/(dd6) retargeted to
  the package; (b7)/(n-hub4) rebased with the enumerated 3.5.0
  authorization (six `tools/mcp-viz` deletions + the certification
  scripts + `goldens/`); NEW (v35) certification gate (the 4-tool
  source, private manifest, the exact playwright pin, zero extra deps,
  the CI workflow needles, exactly-5 goldens); the codex title steps to
  v3.7. `tokens.json` gains ONLY `meta.version → 3.5.0`.
- **npm pack stays EXACTLY 64 files** — `packages/`, `scripts/goldens/`,
  `.github/` are outside the files allowlist (the (b3) proof runs on
  every `verify:playground`).
- **`space/`** — the memorial exhibit is Oscar's; untouched, outside
  this repo's scope.

### 3.4.0 — Zero-React Native Web Components (`@edwyn/signature-style/wc`)

Milestone 3 of the ecosystem roadmap. The Signature Style escapes React:
**six framework-free custom elements** — `<sig-surface-card>`,
`<sig-badge>`, `<sig-progress-bar>`, `<sig-stat-ring>`, `<sig-callout>`,
`<sig-carousel>` — for Vue, Svelte, plain HTML, and any-stack developers
(and AI agents generating vanilla code). Plain TypeScript `HTMLElement`
subclasses with **zero runtime dependencies** (no React, no Lit — the
settled shadow-DOM API only), shipped as one auditable, unminified ESM
bundle.

- **One import, all six:** `import "@edwyn/signature-style/wc";` —
  the module registers every element (guarded: an already-registered
  name is skipped, hot-reload safe) and exports the classes + types.
  Exports map: `./wc` → `dist/wc/signature-wc.es.js` + the tsc-honest
  `dist/wc/index.d.ts` (per-module declarations: base + elements).
- **Tokens are the ONLY prerequisite:** the elements ship NO colors —
  link `@edwyn/signature-style/css` once and the `--sig-*` custom
  properties **inherit through every shadow-DOM boundary** (custom
  properties inherit; shadows don't block them), so
  `<html data-sig-theme="daylight">` re-inks all six elements with zero
  per-element wiring.
- **Attribute-driven, shadow-domed:** every element is the attribute
  twin of its React counterpart (see the usage section below); the
  shadow style strings mirror the package css/ anatomy — same tokens,
  same 8px grid, same z-ladder-free flatness — and the **e1 treaty is
  mirrored inside the shadows**: the sanctioned ambient elevation
  shadows appear ONLY on the surface-card's inner `.card` element,
  everything else stays flat.
- **Reactive by attribute:** `sig-progress-bar` recomputes the fill
  width + `aria-valuenow` on every `value` change;
  `sig-stat-ring` animates `stroke-dashoffset` (smooth transition in
  the shadow sheet, `prefers-reduced-motion` escape honored INSIDE the
  shadow styles); `sig-carousel` counts its items from the `slotchange`
  event and rebuilds its dots + "1 / N" indicator.
- **Proven twice:** `npm run verify:wc` greps the bundle + sources for
  react/react-dom (must find ZERO), resolves the exports map, counts
  the six `customElements.define` names in dist, packs the tarball —
  then generates a vanilla HTML fixture page in /tmp (no build step)
  and drives it with headless Chromium: all six elements must upgrade,
  the ring readout must change "85%" → "40%" on `setAttribute` with the
  transition present, and the screenshot lands at
  `/tmp/visual-cortex/wc-proof.png`. And the Pattern Studio grows
  **SET 07 · Web Components (zero-react)** — six PatternFrames mounting
  the REAL elements inside the vite app (the wc bundle is imported and
  the elements register in-app), ring preview driven live by
  `setAttribute`.
- **Pack grows 60 → 64** — the dist/wc quartet ships (bundle + three
  .d.ts); the wc/src sources stay out of the tarball exactly like the
  react .tsx sources do.
- **Untouched by design:** css/, react/, demo/ are byte-identical to
  3.3.0; tokens.json changes ONLY `meta.version` (NO token changes —
  the 50-key whitelist is byte-stable); the e1 surface.css sanction is
  mirrored, not edited.

### 3.3.0 — Zero-Dependency npx CLI Scaffolder

Milestone 2 of the ecosystem roadmap. The package becomes self-installing:
`npx @edwyn/signature-style init` scaffolds the Signature Style — resolved
theme tokens and a bento starter — into ANY project, from a CLI that ships
zero external dependencies (node:fs, node:path, node:process, node:readline
only; no commander, no chalk, no build step — plain ESM straight from the
tarball).

**What it generates** (per run, always under the safe-injection protocol):

- `signature-tokens.css` — ALWAYS: the chosen theme (mocha default, oled,
  daylight) resolved into ONE `:root` block with the **standard geometry
  preset baked in** (8px UI / 12px cards, 8px-grid-pure), a "generated by
  @edwyn/signature-style init" header, and the full 26-token chromatic
  palette (daylight re-inks all 20 computed variants). Regenerating is the
  theme switch: `init --theme oled --force`.
- `--template bento` — the 12-column bento starter mirroring the
  playground's assembly (span-12 announcement banner, 3 stat cards with
  inline SVG sparklines, a live check-in form, a member ledger table).
  Framework-adaptive: `next` / `vite-react` → `SignatureStarter.tsx` +
  `signature-bento.css` (vanilla hooks, ZERO package component imports —
  typechecks clean under `--strict` with real react types);
  `html` / `fresh` → `signature-starter.html` (self-contained page linking
  the tokens, mirroring the grid inline, zero JS).
- `README-SIGNATURE.md` — what was generated, the wire-in snippet
  (`import "./signature-tokens.css"` / the `<link>`), the theme-switch
  snippet, and the package pointer.

**Interactive when human, flags when machine:** omitted flags are prompted
via node:readline on a TTY (theme → template → target-dir confirmation,
empty answer = default, invalid answer re-prompts); a non-TTY run never
prompts — flags-or-defaults, so CI pipelines just work with `--yes`.

**The embedded theme map (`bin/themes.mjs`) is a drift-gated FREEZE:** the
CLI's copy of the three themes was ported byte-identical from
`css/tokens.css :root` (all 51 declarations) and frozen as a data module.
Gate **(cli2)** re-parses `tokens.css :root` on every `verify:cli` run and
fails on any drift — the canonical css stays the single source of truth;
when it changes, the map is regenerated to match.

| Area | Change | Where |
|---|---|---|
| CLI | `init` command, argv parser, detection, prompts, safe injection, summary | `bin/cli.mjs` (NEW) |
| Theme map | frozen 3-theme/51-token const + `resolveThemeTokens()` | `bin/themes.mjs` (NEW) |
| Gate script | scenarios A–D + gates cli1/cli2/cli3/b3 | `scripts/verify-cli.mjs` (NEW) |
| Wiring | `bin` entry, `files` += bin, `scripts.cli`, `scripts.verify:cli` | package.json |
| Gates | (cli1) zero-external-imports · (cli2) theme drift needle · (cli3) wiring · (b3) pack EXACTLY 60 | npm run verify:cli |
| Docs | npx init usage section (flags, framework matrix, safe injection) | README.md |
| Drive-by | the stale Chromatic Palette section (still naming `--sig-blue` / mauve-bright `#8839ef`) rewritten to the 26-token v3.0.0 truth; the 2.9.0-audit contrast flag annotated as resolved | SYSTEM_PROMPT.md |

**Negative tests (falsifiability, restore-verified, tree byte-identical):**
planting `import chalk from "chalk"` in `bin/cli.mjs` flips (cli1) FAIL
(`✗ every import is node: or relative — chalk`) AND crashes scenario A at
the module level; drifting one mocha hex in `bin/themes.mjs` flips (cli2)
FAIL naming `--bg-base`; a stray file in `bin/` flips (b3) FAIL (found 61).
Restore → PASS in every case.

**Release gate:** verify (the frozen core, untouched) ·
verify:standalone (the CLI content is domain-neutral — zero banned
vocabulary) · verify:playground · verify:contrast · **verify:cli** (new,
43 checks) · verify:mcp · vite build exit 0 · pack grows 58 → **EXACTLY
60** (the plan's arithmetic said 59 assuming a single-file bin, but
`bin/themes.mjs` is mandated as its own module AND must ship — cli.mjs
imports it at npx runtime — so the tarball carries both; the b3 gate pins
the true count). Playground source untouched this release; only the
generated `llms*.txt` manifests regenerated (version line).

### 3.2.0 — Multi-Flavor Surface Engine & Live Theme Customizer

Milestone 1 of the ecosystem roadmap. The surface becomes a VERIFIED AXLE:
three WCAG-gated themes, a geometry axis, and a live customizer — with the
per-theme contrast contract enforced by the release gate.

**The three surface themes** (canonical `data-sig-theme` on `<html>`;
absent = mocha; the `data-theme="latte"` light toggle stays working as the
documented legacy mechanism):

| theme | --bg-base | --bg-surface | --bg-inset | text | chromatic ink |
|---|---|---|---|---|---|
| Mocha (default) | #1E1E2E | #313244 | #282A36 | #CDD6F4 family | the 26 mocha values, byte-identical |
| OLED true-black | **#000000** | **#0B0C10** | **#12141C** | inherited (13.52:1 on surface) | inherited — ratios only increase (worst fill crimson 4.68:1 vs surface / 5.03:1 vs black; floor 3.1) |
| Daylight | #F8FAFC | **#FFFFFF** | #F1F5F9 (light wells — the dark-well concept inverts) | #0F172A / #020617 / #475569 / #64748B | COMPUTED INK VARIANTS |

**The 16 daylight ink variants** — each computed with the WCAG engine to
measure ≥ 3.1:1 vs #FFFFFF (the strictest daylight surface), every chosen
hex + measured ratio documented in css/tokens.css comments AND
`tokens.json → sigThemes.daylight.inkVariants` (the contrast gate
cross-checks the two; ratios re-measured per gate run):

| token | mocha | daylight | ratio |
|---|---|---|---|
| --sig-cobalt | #89b4fa | #2563EB | 5.17:1 |
| --sig-orchid | #F5C2E7 | #DB2777 | 4.60:1 |
| --sig-cyan | #64DFDF | #0E7490 | 5.36:1 |
| --sig-magenta | #CF64DF | inherits | 3.21:1 |
| --sig-mint | #64DF99 | #059669 | 3.77:1 |
| --sig-spring | #6EDF64 | #16A34A | 3.30:1 |
| --sig-citron | #DBDF64 | #4D7C0F | 4.99:1 |
| --sig-violet-glow | #C29EFF | #6D28D9 | 7.10:1 |
| --sig-pink-glow | #F29EFF | #C026D3 | 4.71:1 |
| --sig-rose-glow | #FF9EDB | #BE185D | 6.04:1 |
| --sig-lime-glow | #DBFF9E | #3F6212 | 7.08:1 |
| --sig-mint-glow | #9EFFC2 | #047857 | 5.48:1 |
| --sig-crimson | #F22222 | inherits | 4.18:1 |
| --sig-azure | #228AF2 | inherits | 3.51:1 |
| --sig-tangerine | #F25622 | inherits | 3.43:1 |
| --sig-neon-green | #56F222 | #15803D | 5.02:1 |

Plus the ink-floor re-inks the same engine requires on white:
pink-bright #A21CAF (6.32) · pink-soft #9D174D (7.88) · pink-alt #86198F
(8.24) · mauve-soft #7C3AED (5.70) · sky #0369A1 (5.93) · peach #C2410C
(5.18) · green #166534 (7.13) · yellow #A16207 (4.92, the amber-900 family —
the meter's Fair stage was 1.27:1 on white); mauve-bright (3.91) and
lavender (3.18) inherit. Cakes stay official pastels carrying dark ink:
--color-on-cake keeps #1E1E2E (11.24:1 on #F2CDCD / 10.74:1 on #F5C2E7).

**Geometry presets** — the orthogonal `data-sig-radius` axis:
`"standard"` → 8px UI / 12px cards (8px-GRID-PURE: the legacy 6px never
snapped to the grid; 12 keeps the cards-earn-rounder step);
`"sharp"` → 0px/0px (brutalist). `:root` keeps 6px/12px — absent attribute
renders the historical look, byte-stable.

**The live Theme & Surface Customizer** — a panel at the top of the
playground's Pattern Studio (before Set 01) and seven ⌘K commands
("Theme: Mocha / OLED / Daylight", "Radius: Standard / Sharp",
"Download tokens.css", "Copy CSS Variables"). One `useSigTheme` owner
persists `sig.workspace.v3.theme` + `sig.workspace.v3.radius`, mirrors
`data-sig-theme` / `data-sig-radius` onto `documentElement`, and renders
the LIVE contrast badges — all 16 chromatic tokens scored per WCAG against
the ACTIVE theme's surface (green ≥3.1 / amber 2.0–3.1 / red <2.0) with the
SHARED `sig-contrast.ts` math the contrast gate imports (a badge ratio IS a
gate ratio). Download/Copy emit the active theme's resolved `:root` block,
generated client-side from tokens.json.

**Gates evolved:** (th3) theme blocks + the `--bg-canvas` alias (the
owner's name for --bg-base — whitelist 50 → 51) + the manifest cross-check;
(rad2) the radius presets; (cus) the customizer wiring; verify:contrast
grew to PER-THEME tables (mocha contract unchanged; OLED ≥3.1 vs #0B0C10
AND #000000; daylight ≥3.0 ink-floor / ≥3.1 canonical vs #FFFFFF; the
negative test — deleting the daylight yellow override FAILs at the measured
1.27:1, restore-verified). Pack stays EXACTLY 58 (zero new shipped files);
llms.txt/llms-full.txt regenerate with the theme tables.

### 3.0.0 — 16-Color Chromatic System, Obsidian Graph, 3×3 Carousel, Symmetrical Forms & 60fps

The major that gives the palette its full chromatic voice, makes the
graph feel like Obsidian, and writes the data layer's contract down.

- **The 16-color chromatic system** — the Chromatic Palette grows 11 → **26
  tokens**: `--sig-blue` **retires** (the name, not the value — the
  official Mocha Blue #89b4fa continues as `--sig-cobalt`, and the old
  name is *banned* from css/, tokens.json and the whitelist by the new
  (p3)/(chrom) gates), and 15 **chromatic fill/series accents** join:
  orchid, cyan, magenta, mint, spring, citron, violet-glow, pink-glow,
  rose-glow, lime-glow, mint-glow, crimson, azure, tangerine,
  neon-green. They are DECLARED fill/series color (bars, node rings,
  borders, tinted wells — never body-text ink) and carry a 2.0:1
  visibility floor vs surface; every value cleared it out of the box
  (the floor leader is crimson at 3.01:1 — zero adjustments needed).
  The ink-floor eleven keep their ≥3.0:1 contract (cobalt at 5.97:1).
  The full 26-token WCAG table prints in `npm run verify:contrast`.
  OWNER-SANCTIONED, per the 2.9.1 precedent: the frozen `scripts/verify.mjs`
  (c)/(p) pins re-targeted — #F5C2E7 (the retired Catppuccin Pink) is
  re-homed as `--sig-orchid`, and the chromatic pin list grew to the 26.
  `react/timeline-manager.tsx` carries the one type-forced line
  (`--sig-blue` → `--sig-cobalt`).
- **`--radius-card: 12px`** — cards earn rounder corners than the 6px
  controls. TOKEN_KEYS 34 → **50** (+ `KnownToken`, recompiled).
- **The Data Architecture Blueprint** — `shared/schema.ts` (nine
  zero-dependency DTO interfaces + runtime guards, money in **integer
  cents** — floats drift, ledgers don't) + `docs/SCHEMA_V3.md`
  (normalized ERD, SQLite + PostgreSQL DDL with CHECK constraints, the
  FastAPI Pydantic v2 mirror, and the REST contract table). `shared/`
  is the future backend's half and is deliberately NOT packed
  (the pack stays exactly 58 files).
- **Card parity + chromatic enrichment** — `.sig-flip-card`,
  `.sig-accordion` and `.sig-matchup` become self-contained surfaces
  (var(--bg-surface) + the 15% glass hairline + `var(--radius-card)` +
  a 220px floor — never transparent/collapsed in grid rows); ActionTile
  icon wells tint 12% from the accent; `[data-accent]` cards wear a 45%
  translucent chromatic top border (distinct from the title underline).
  cards.css keeps its absolute-zero shadow law. BarChart series read as
  a spectrum: cobalt/cyan/mint/tangerine.
- **Carousel modes** — `mode?: "paged-3" | "free-scroll"`. paged-3
  chunks the children into pages of three (pure math), each page ONE
  snap slide wearing a repeat(3, 1fr) grid + 16px gap; chevrons stride
  pages, dots are per page and clickable, the indicator reads "p / P".
  free-scroll (the default) keeps the snap strip and UPGRADES its
  active-index sync to an IntersectionObserver (majority-visible wins).
  The mechanics dock into a bottom control bar — prev · dots ·
  indicator · next — so the readout never overlaps card content. The
  Field Notes card carries the live two-button mode toggle pill.
- **Symmetrical form fields** — the owner's reversal of the 2.5.0
  desc-above anatomy: the label row is a fixed 20px rail (side-by-side
  fields align on the same baseline) and can carry an `infoTooltip` ⓘ
  (pure-CSS bubble above the trigger, shown on hover AND
  :focus-visible); `description` + `hint` move BELOW the control into
  `.sig-form-field__helpers` (a 20px bottom rail). **A11y preserved:**
  the description id rides `aria-describedby` onto the control via a
  cloneElement merge — screen readers still announce the format rule
  (the GOV.UK concern survives the visual move; documented in
  css/forms.css).
- **StatRing zoom + detail** — the dial defaults to 120px; with
  `total` (+ `unit`) the ring zooms to scale(1.07) on hover/press and a
  click slides the detail strip open (0fr → 1fr, reduced-motion safe):
  "85% · 170 / 200 Seats". The dash geometry is byte-identical.
- **The Obsidian graph** — generous nodes (r 34, 13px labels, 16-char
  truncation + `<title>` tooltips); **60fps drag** (pointer capture →
  rAF mutates the node transform directly, no setState per move → one
  `onMoveNode` commit per drag, persisted); **right-click tethers**
  (a live azure dashed line chases the cursor; release over another
  node fires `onLinkNodes` — the extra-links model persists in
  `sig.v27.links`); **double-click spawn** on empty canvas; **pan**
  (empty-canvas drag) and **wheel zoom** (0.5×–2.5×, cursor-anchored,
  viewBox math so coordinates stay in graph space); Escape cancels;
  arrow keys nudge the selected node 8px.
- **60fps perf** — React.memo fences the five hot exports
  (KnowledgeGraph, DataTable, AreaChart, BarChart, EventTimeline);
  `usePersistentState` debounces its localStorage write to a 300ms
  trailing window (sync read preserved, flush on unmount +
  beforeunload, reset cancels immediately); `.sig-surface-card` carries
  `contain: layout style paint`. The backdrop audit (bd1) pins the
  glass: command.css on the z-50 rung, the 1.8.0 timeline glass header
  where it has always been, the modal scrim honest (plain rgba, no
  blur), nav blur-free. The measured proof: `playground/probe-perf-drag.mjs`
  samples real rAF deltas during a playwright node drag — median
  < 20ms, p95 < 40ms, and the commit proof (the node's transform
  persists).
- **The codex moves to v3.3** — refreshed FormField/StatRing/
  KnowledgeGraph/Carousel recipes + a NEW Data Architecture subsection
  pointing at `shared/schema.ts` + `docs/SCHEMA_V3.md`. llms.txt +
  llms-full.txt regenerated from the 50-token whitelist.

**Negative tests (falsifiability, restore-verified, git-checked
byte-identical):** (ct4) dropping `--sig-crimson` to `#7a0e0e` flips
`verify:contrast` FAIL with the measured 1.136:1 against the 2.0 floor;
re-declaring `--sig-blue` in css/tokens.css flips the frozen (p3)
retirement ban + the (d) whitelist parity FAIL; breaking a parity floor
to `min-height: 9rem` flips (par) FAIL; a 2-column page grid flips
(car3) FAIL; killing the helpers rail flips (ff2) FAIL; killing the
zoom flips (ring2) FAIL; removing `setPointerCapture` flips (ob1)
FAIL. Restore → PASS in every case.

**Release gate:** `verify` (the frozen core, now carrying the 26-token
(p) pins + the (p3) retirement bans + the `--radius-card` pin) ·
`verify:contrast` (the 26-token table) · `verify:playground` (all
gates, the (b7)/(n-hub4) safety diff rebased to v2.9.1 with the
enumerated 3.0.0 authorized set) · `verify:mcp` · vite build exit 0 ·
pack EXACTLY 58 with `shared/` and `docs/` excluded.

### 2.9.1 — Zero Contrast Debt & Live Skeleton Trigger

The patch that pays the contrast bill the 2.9.0 hostile audit ran up
(its (a4) spot-check flagged two chromatic tokens under WCAG 3:1) and makes
the skeletons *runnable*:

- **Zero contrast debt** — two `--sig-*` values are lightened at the
  SOURCE so **every chromatic token now measures ≥ 3.1:1 on the Mocha
  surface** (and ≥ 3.0:1 on base), computed per WCAG 2.x relative
  luminance. Both fixes stay in-hue; theme-independence is untouched
  (the tokens stay defined once in `:root`):

  | Token | BEFORE | vs surface / base | AFTER | vs surface / base | Rationale |
  |---|---|---|---|---|---|
  | `--sig-mauve-bright` | `#8839ef` | 2.32:1 / 3.03:1 | `#9e5ff2` | **3.22:1 / 4.20:1** | the MINIMAL lightness increase in the violet family — H266°/S85% preserved, L 58%→66%, the first rung measuring ≥ 3.1:1 |
  | `--sig-blue` | `#1e66f5` | 2.56:1 / 3.34:1 | `#89b4fa` | **5.97:1 / 7.79:1** | the official Catppuccin Mocha Blue — the exact value v3.0.0's planned `--sig-cobalt` retires it into, so the patch converges with the planned major |

  The other nine chromatic tokens already measured 3.95:1–9.89:1 on surface
  and are untouched. Full before/after ratio table: `npm run
  verify:contrast` (new script, below).

- **`verify:contrast` — the automated contrast gate** — new
  `playground/verify-contrast.mjs` wired as `npm run verify:contrast`
  and re-asserted inside `verify:playground`'s new (ct1) gate: reads the
  live `:root` block, computes WCAG 2.x relative-luminance ratios, and
  asserts all 11 chromatic tokens ≥ 3.0:1 against **both** `--bg-surface`
  and `--bg-base`, with the two fixed pair at ≥ 3.1:1 and their hexes
  pinned — prints the full ratio table. Negative test (falsifiability,
  restore-verified): reverting `--sig-blue` to `#1e66f5` flips the
  gate to FAIL with the measured 2.559:1 ratio; restore → PASS,
  byte-identical.

- **`scripts/verify.mjs` floor rebase (owner-sanctioned)** — the frozen
  `(p)` gate pinned the exact old hexes against BOTH `css/tokens.css`
  and `tokens.json`; a legitimate value change makes that
  unsatisfiable (the manifest must carry the real value). The two pins
  re-target (#9e5ff2 / #89b4fa) — the same "each release that
  legitimately touches core rebases the floor" discipline the (b7)
  gate already carries. Every other `scripts/` byte stays frozen.

- **The live skeleton trigger** — the 2.9.0 skeletons are now
  *runnable*: the command palette grows **"Simulate Async Load (800ms)"**
  (keywords: skeleton / loading / async / cls) and the dashboard's
  Form & Input Matrix card grows a matching **Simulate Async Load**
  button (`data-testid="btn-simulate-load"` — the documented
  most-natural spot: cause and effect share the view; the palette
  command covers cross-view runs). For 800ms the Core Dashboard's six
  bento card bodies swap to `<SkeletonCard />` and the ledger DataTable
  swaps to `<SkeletonTableRow columns={3} />` × current-rows — then
  everything restores. No toast, on purpose: the skeleton IS the
  feedback.

- **CLS = 0, proven (release blocker)** — the swap is height-locked by
  construction: `SimSlot` measures each card body's exact footprint
  BEFORE the swap and renders the skeleton inside that explicit height
  during the window (no css-side min-heights needed). The proof,
  `playground/probe-skeleton-cls.mjs`, fires the palette command in a
  real browser and measures every `.bento12` child's bounding rect
  BEFORE / DURING (mid-skeleton) / AFTER: **all deltas 0.00px**
  (±1px tolerance), 6 skeleton cards + 5 ledger rows live mid-window,
  DataTable restored, zero console errors.

- **Pack stays EXACTLY 58** — zero new shipped files: both the gate and
  the probe live in `playground/` (files-array excluded). `tokens.json`
  meta → 2.9.1; the two token descriptions carry the fix provenance
  (before/after hexes + measured ratios), regenerated into
  `llms-full.txt` via `npm run llms`.

### 2.9.0 — Autonomous Optimization Sprint: CSS Container Queries, Power-User Utilities, Humanized Craft & Full Self-Audit

The release that makes the components **truly portable**: they now answer
their CONTAINER, not the viewport. Plus three power-user primitives
(`<CommandPalette>`, the `<Skeleton*>` family, `<Breadcrumbs>`), a
humanizer pass over the studio's copy, and a hostile self-audit whose
every catch is logged in SYSTEM_PROMPT.md ("The v2.9.0 Self-Audit Log").

**Phase 1 — CSS Container Queries.** The playground ships `.sig-cell {
container-type: inline-size; }` (containment on OUTER wrappers only — a
container cannot measure itself) and the package answers with
`@container` reflows, never media queries: `.sig-matchup` stacks its
sides below a 380px container (the VS pill becomes a horizontal hairline
divider); `.sig-content-card` + `.sig-profile-card` grow their
media-object alignment at ≥ 440px; `.sig-stat-card` docks its sparkline
beside the metric at ≥ 360px (the KPI value scales 1.5 → 1.75rem); the
FormField radio rows collapse below 480px. The authoring doctrine: the
BASE rule keeps the historical layout, so consumers without a container
ancestor keep today's rendering — zero regression. The release blocker
is a playwright proof (`playground/probe-container-queries.mjs`)
placing the SAME MatchupCard/StatCard/ContentCard in a 280px and a 900px
container and asserting different computed layouts (matchup
`grid-template-columns` 1fr vs 3 tracks; stat-card display flex vs grid;
content-card 16px flex column vs 24px media-object grid).

**Phase 2 — Power-user primitives.** `<CommandPalette>` (controlled
keyboard-first launcher: Ctrl/Cmd+K global shortcut that ignores typing
fields, combobox/listbox aria contract with `aria-activedescendant`,
type-to-filter over label + keywords, Enter runs + closes, Escape closes
AND restores focus to the pre-open trigger; modal-scrim + blur(8px)
glass, zero shadows). `<SkeletonLine>` / `<SkeletonCard>` /
`<SkeletonTableRow>` (8px-grid heights, one background-position shimmer
sweep, mandatory reduced-motion static ground, aria-hidden decorative
pulse). `<Breadcrumbs>` (mono path, last crumb
`span[aria-current="page"]`, aria-hidden "/" separators). The playground
wires all three: the hub topbar carries per-view breadcrumbs beside a ⌘K
trigger, and the palette's 15 commands cover the 5 views, the 6 Pattern
Studio sets, Export Workspace JSON, the reduced-motion preview toggle
(`[data-motion="reduced"]`), a keyboard-shortcuts dialog, and the
llms.txt URL copy. Pack grows 52 → 58 files (css/command.css +
css/skeleton.css + react/command.{js,d.ts} + react/skeleton.{js,d.ts});
`package.json files` gains the `!react/command.tsx` + `!react/skeleton.tsx`
negations (the sources never ship, their compiled pairs do).

**Phase 3 — The Humanizer.** Every playground string audited against
robotic boilerplate: `Saved`, `Panel: N.`, `modal.open(sample event)`,
`Send test toast` are gone — replaced with domain-real copy (workbench
planning, catering, budgets). The 6-Set blurbs audited and two rewritten
in the when/why voice; `npm run llms` regenerates llms-full.txt from the
humanized sources (drift-proof by generator).

**Phase 4 — The hostile self-audit.** A playwright audit
(`playground/probe-audit-v290.mjs`) swept 4 viewports (375/768/1440/1920)
× 5 views × 3 module tabs asserting zero horizontal overflow and live
shell margins, exercised the palette's full keyboard contract, emulated
`prefers-reduced-motion` (shimmer/flip/shake/meter all degrade), read
the 11 chromatic tokens' contrast against both grounds, and collected console
noise (zero errors, zero pageerror events). Four bugs were caught and
fixed (tab-bar wraps, the Chronicle hero's unbreakable tracked word, a
preview-stage bleed, the palette's typing-guard wiring) — the full log
lives in SYSTEM_PROMPT.md.

**Phase 5 — The close.** SYSTEM_PROMPT.md moves to **Engine v3.2** with
the three new recipes + the `.sig-cell` container-query authoring
pattern + the transparent self-audit log. `tokens.json` carries one
authorized delta (`meta.version` → 2.9.0); the 34-token whitelist stays
byte-equal (meta-only deep-equal gate). `npm pack` is EXACTLY 58 files.

**Container-query authoring (for consumers).** Wrap any card in a
`.sig-cell` (copy the one-liner into your own css — the package ships no
wrapper element by design):

```html
<div class="sig-cell" style="container-type: inline-size">
  <!-- any package card reflows to THIS width -->
</div>
```

The card inside needs no props — the reflows are pure css. Without a
`.sig-cell` ancestor nothing changes (the @container blocks simply never
match), so adoption is opt-in per slot.

### 2.8.0 — The Signature Pattern Website, 6-Set Taxonomy & One-Click Copy Studio

The playground becomes the **public-ready Signature Design Website** —
built entirely with `@edwyn/signature-style`, dogfooding every export. The
package itself is FROZEN: css/, react/, SYSTEM_PROMPT.md, demo/, scripts/
and tools/ are byte-identical to v2.7.0 (safety-gated), and `npm pack`
stays EXACTLY 52 files — `playground/public/` is a dev-server-only
directory (the files array excludes `playground/` wholesale) and is NOT
shipped. `tokens.json` carries one authorized delta: `meta.version` →
2.8.0 (the 34-token whitelist is untouched and gate-guarded by a
meta-only deep-equal check).

**The 5-view nav map.** The old switcher's 2 real + 3 placeholder views
(dashboard/index + events/members/budget) become FIVE REAL views, keeping
the HubLink/hash mechanism untouched: **Dashboard** (the live bento,
untouched), **Pattern Studio** (the primary catalog — see below), **Index**
(the Master Index catalog, unchanged), **Chronicle** (the Night of
Versions full-width: `<ChronicleTimeline>` rendering all 23 releases of
RELEASE_HISTORY in the package's own SurfaceCard, beside a memorial
ProseBlock), and **AI Codex** (the machine-readable face, for humans AND
agents). The workshop placeholders retire with their EmptyState dogfood —
EmptyState lives on in the studio's Set 06 frame.

**The Pattern Studio.** A two-column doc layout: a sticky 240px sidebar
listing the 6-Set Taxonomy with tabular-nums component counts (state
filter — one click shows that set's section; stacks below 768px), and the
right stream of ruled `SET 0N · name` sections, each with a 1–2 sentence
human explanation and one **`<PatternFrame>`** per component:

| Set | Components | Count |
|---|---|---|
| 01 · Shell & Navigation | ThemeProvider, GlobalNav, Tabs, the sig-shell layout note | 4 |
| 02 · Surface & Card Archetypes | SurfaceCard, PageHero, Icon, Avatar, SigBadge, ContentCard, ReferenceCard, TierCard, ProfileCard, ActionTile, FlipCard, AccordionCard, MatchupCard | 13 |
| 03 · Ergonomic Forms & Inputs | FormField, Input, TextArea, Select, Checkbox, RadioCardGroup, ToggleSwitch, PasswordInput, Button | 9 |
| 04 · Analytical Telemetry & Graphs | ProgressBar, StatRing, StatCard, Sparkline, BarChart, AreaChart, KnowledgeGraph, smoothPath, layoutGraph, cubicBezierEdge | 10 |
| 05 · Chronology & Planners | EventTimeline, useModal, EventModal, TimelineManager, ChronicleTimeline | 5 |
| 06 · Data, Editorial & Feedback | DataTable, Callout, Carousel, CarouselItem, ProseBlock, AnnouncementBanner, EmptyState, ToastProvider, useToast | 9 |

**PatternFrame** (`playground/components/PatternFrame.tsx`) — one
`<article data-sig-set data-sig-component>` per pattern: a header bar
(component name weight 600 + the set SigBadge + the Preview | JSX |
HTML segmented mini-tabs, `aria-pressed`-driven + the **Copy Card**
button) over a body that renders the LIVE interactive preview (check the
checkbox, flip the card, add a graph node, type a password, open the
modal, settle a milestone), the formatted JSX snippet in an inset
`<pre><code>` well (mono 0.8125rem), or the documented HTML variant (a
muted "HTML variant not documented — use the JSX form." note when none).
The COPY PATH: Copy Card writes the active tab's text to the clipboard,
flashes Copy → Check for 2s (timer cleaned on unmount and re-copy), and
pushes the "Copied <ComponentName> snippet" toast through the app-level
ToastProvider; a clipboard failure pushes the error toast instead of
dying silently. The 2.8.0 css anatomy is FLAT — the e1 treaty holds.

**The AI Codex view** (`playground/components/CodexView.tsx`) — the
honest color census: exactly **22 click-to-copy swatches** (11 core/keeper
+ the 11-token Chromatic Palette), each a flat card that copies the var name
and toasts — the whitelist is 34, and the remaining 12 tokens (spatial,
z-index, type, motion) get their own displays instead of being mislabeled
"colors": the 8px spatial scale as visual bars (4/8/16/24/32/64px), the
5-rung z-ladder as a DataTable (rung/token/value/used-by, CommandPalette
on the modal rung), and the doctrines (Cascade, Override, Rule of
Engagement, Pruning, 8px grid, mechanical physics, the e1 shadow treaty)
as ProseBlocks.

**llms.txt + llms-full.txt** (`playground/public/`, generated) — the
machine-readable signature. `npm run llms` runs
`playground/generate-llms.mjs`, which imports the SNIPPETS registry
natively (Node ≥ 23.6 type stripping), reads tokens.json (the 34-token
whitelist, verbatim), SYSTEM_PROMPT.md (the doctrines) and react/*.d.ts
(brace-matched prop surfaces) and emits BOTH manifests — so they can
never drift from source. `llms.txt` is the concise index (H1, blockquote,
Tokens / Rules / Component Sets / Recipes); `llms-full.txt` is the 60KB
self-complete version: every token with value + description, the rules
verbatim-in-spirit, all 6 sets with every component's copy-paste JSX
(+ HTML variants) and 44 prop tables. Vite serves `playground/public/` at
the server root: both are reachable at `/llms.txt` and `/llms-full.txt`
(HTTP 200, release-gate probed).

**The SNIPPETS registry** (`playground/snippets.ts`) — one typed map from
EVERY value export of the package to its clean, formatted, copy-paste
snippet (`{ jsx, html?, set, componentName }`), ported from
SYSTEM_PROMPT.md v3.0's Universal AI Replication Contract and
fact-checked against the shipped prop contracts. It powers the Copy Card,
the JSX/HTML toggle, and llms-full.txt generation — one source of truth,
three consumers.

| Area | Change | Where |
|---|---|---|
| Pattern Studio | the 6-Set Taxonomy: sticky set sidebar + 50 PatternFrames with live previews | playground/components/PatternStudio.tsx |
| PatternFrame | Preview ↔ JSX ↔ HTML toggle + one-click Copy Card + data-sig-* | playground/components/PatternFrame.tsx |
| AI Codex | 22 honest swatches, 8px scale, z-ladder DataTable, doctrine ProseBlocks | playground/components/CodexView.tsx |
| Chronicle | full-width Night of Versions (23 releases) + memorial prose | playground/App.tsx |
| Nav map | 5 real views replace 2 real + 3 placeholders | playground/App.tsx |
| SNIPPETS registry | every value export → copy-paste JSX/HTML | playground/snippets.ts |
| llms manifests | machine-readable signature, generated drift-proof | playground/public/, playground/generate-llms.mjs |
| Gates | (nav5), (ps-studio), (ps-copy), (ps-llms); b7/n-hub4 rebased to v2.7.0 + tokens meta-only guard | playground/verify-playground.mjs |
| Version | package/lock/tokens-meta → 2.8.0 (+ `llms` script) | package.json, package-lock.json, tokens.json |

**Signature changes** — NONE at the package surface. Every existing prop
contract is byte-identical; zero tokens added or changed; `npm pack`
stays EXACTLY 52 files. The release is playground + manifests + release
plumbing only.

### 2.7.0 — Interactive Knowledge Graph, Analytical SVG Charts & Manageable Timeline

`npm pack` grows 47 → EXACTLY 52 files (47 + css/graph.css +
react/graph.{js,d.ts} + react/timeline-manager.{js,d.ts} — the
negations precedent adds "!react/graph.tsx" and
"!react/timeline-manager.tsx"). `tokens.json` and `tokens.css` are
UNTOUCHED (whitelist 34 — zero new tokens). The e1 shadow treaty holds
without amendment: chart interiors and the graph canvas stay FLAT —
css/graph.css and the viz.css growth declare zero box-shadow and zero
hex; elevation still lives only in css/surface.css's sanctioned blocks.
`<EventTimeline>` is byte-identical (backward compatibility is the
release's hard line — the TimelineManager styles APPEND to
css/timeline.css under the `.sig-tmanager` namespace, and the (e2)
deletion guard proves the file only grows).

**KnowledgeGraph** (react/graph.tsx + css/graph.css, layered after
cards.css) — an interactive node-link graph in ONE pure-SVG
`<svg role="application">` (viewBox 0 0 640 320): zero charting
packages, the Pruning Protocol intact. The layout is DETERMINISTIC —
`layoutGraph` (an exported, gate-tested pure helper) sorts by id hash
before BFS, centers the roots, rides each BFS depth up a ring
(radius 90 + depth·110, projected elliptically + clamped into the
box), and fans each parent's children across an angular span around
the parent's angle — the same node set always yields the same
coordinates, in any input order. Edges are one cubic-Bezier
(`cubicBezierEdge`, control points 60% along the radial) per
node-with-parent. Selection dims everything non-adjacent to opacity
0.25 (class-driven `.sig-graph--focused` + `data-dim`), flips the
selected ring to structural Flamingo at width 3, and the footer strip
inspects the node's label + note. `addOn` renders the "Add & Link"
toolbar: a new lavender node parents to the SELECTION (else the root;
with no nodes at all it becomes the root).

**BarChart + AreaChart** (react/viz.tsx + css/viz.css GROW —
ProgressBar/StatRing logic untouched) — pure SVG analytics over a
320×200 viewBox. `<BarChart>`: per-datum capacity tracks (inset
rounded rects out to `max ?? scale`), chromatic value bars, dashed
`"4 4"` reference lines at 25/50/75% of the scale, mono axis labels,
and class-driven hover readouts (bar brightens, the tabular value
appears); `orientation` flips vertical/horizontal. `<AreaChart>`: a
`useId`-keyed linearGradient (30% token mix → transparent, no id
collisions) under a Catmull-Rom-smoothed line (`smoothPath`, the
exported pure helper, 2px round) at 50% opacity, with hoverable point
circles (r 4 → 6) and tabular readouts.

**TimelineManager** (react/timeline-manager.tsx; styles appended to
css/timeline.css) — the CONTROLLED working half of the EventTimeline
contract: `TimelineItem extends TimelineEvent { settled?: boolean }`. The
composer (package Input + month/category Selects + the primary sm
"Settle Item" Button; empty titles warn and are ignored), the filter
pills (All/Pending/Settled, attribute-driven `aria-pressed` answering
with the Flamingo underline — the Tabs contract) plus the tabular
`{settled} / {total} Settled` counter, per-item rows (the
`aria-pressed` settle toggle filling sig-green, the body button
firing `onInspect` — pass `modal.open` to compose the EventModal —
and the delete button), and the EmptyState edge when the current
filter matches nothing. LIVE-MAP PROBE: the installed lucide-react
1.72.0 icons map has NO "Trash2" and NO "Filter" key — the manager
renders the live-map-valid "Trash" and "Funnel" (the AudioLines/Music
precedent, gate-probed).

**Persistence & JSON portability** (playground/persistence.ts +
playground/App.tsx) — the Excalidraw/tldraw pattern: your work
survives a reload. `usePersistentState<T>(key, fallback)` mirrors
state into localStorage through try/catch on every boundary (corrupt
JSON → fallback; quota/private-mode → memory keeps working) with a
`reset()` that removes the key and restores the seed. The new
"Graphs & Planner" module tab keys BOTH stores under the versioned
contract — `sig.v27.graph` / `sig.v27.timeline` (bump the prefix when
a stored shape breaks; never store new shapes under an old prefix) —
seeded with a Core Engine root graph (4 nodes) and a five-milestone
timeline (2 settled). The Milestone Manager card's toolbar is the
portability hatch: **Export JSON** (a Blob → objectURL → temp-anchor
→ immediate revoke dance downloading `signature-workspace.json`),
**Import JSON** (hidden file input → FileReader → `Array.isArray`
shape checks on both arrays → set both + success toast, else the
"Invalid snapshot structure" refusal), and **Reset** (danger variant
→ both keys wiped → seeds restored). THE PROOF (release blocker,
playwright): add a "Persistence proof" node, RELOAD the page, assert
the node is still there; Export fires the `signature-workspace.json`
download; Reset restores the seeds.

| Area | Change | Where |
|---|---|---|
| KnowledgeGraph | deterministic radial SVG graph, focus dimming, Add & Link | react/graph.tsx, css/graph.css |
| BarChart | capacity tracks, dashed reflines, hover readouts, orientation | react/viz.tsx, css/viz.css |
| AreaChart | useId gradient, smoothPath (Catmull-Rom), point readouts | react/viz.tsx, css/viz.css |
| TimelineManager | composer, filter pills, settle/delete, EmptyState edge | react/timeline-manager.tsx, css/timeline.css |
| Persistence | usePersistentState + export/import/reset, `sig.v27.*` keys | playground/persistence.ts, playground/App.tsx |
| Codex | v3.0 — four new recipes + the Local Persistence & JSON Snapshot Pattern | SYSTEM_PROMPT.md |
| Cortex | sweep + `.sig-graph__node` / `.sig-bars__bar` / `.sig-tmanager__count`; version 2.7.0 | tools/mcp-viz/server.ts |

**Signature changes** — ADDITIVE: `KnowledgeGraph`
(`GraphNode`, `KnowledgeGraphProps`, `GraphPosition`, `layoutGraph`,
`cubicBezierEdge`), `BarChart` (`BarChartProps`, `BarDatum`),
`AreaChart` (`AreaChartProps`, `AreaPoint`, `smoothPath`),
`TimelineManager` (`TimelineManagerProps`, `TimelineItem`), and
`css/graph.css` joined the bundle after cards.css. BEHAVIORAL: none —
every existing prop contract is byte-identical (viz.tsx's
ProgressBar/StatRing/Sparkline/StatCard logic untouched;
EventTimeline untouched; zero token changes).

### 2.6.0 — Universal Developer Card Suite, Chromatic Elevation & The Master Index Overhaul

Zero new files — every delta grows an existing one, so `npm pack` still
packs EXACTLY 47 files. `tokens.json` stays 1.4.0 (whitelist 34 — no new
tokens; the 11 chromatic tokens already exist and are now TYPED as
`SigColorToken`). The e1 shadow treaty is AMENDED: box-shadow is
sanctioned in css/surface.css under `.sig-surface-card` rules, the three
`[data-elevation="…"]` tier blocks, and the `[data-accent]` glow rules;
css/cards.css stays absolute zero.

**Chromatic elevation** — `<SurfaceCard>` grows two additive props:
`accentToken?: AccentToken` (any of the 11 `--sig-*` tokens plus the
structural Flamingo/Teal pair) renders `data-accent` + the inline
`--sig-accent` variable — the eyebrow and the ruled title underline take
the accent (the underline grows to 2px solid, the GlobalNav/Tabs
contract) and the interactive hover gains a chromatic glow; and
`elevation?: "flat" | "raised" | "floating"` (default "raised") picks a
shadow tier through the shared `data-elevation` ladder — flat is the
border-only slab, raised is the historical ambient (values tuned to an
0.06 inset highlight + 0.42 ambient), floating is the deep display
shadow (interactive+floating lifts −4px on hover; interactive alone
stays −2px — the reconciliation is documented in css/surface.css).

**The universal card suite** — five archetypes in react/cards.tsx:
`ContentCard` (16/9 image-or-gradient header, category SigBadge, mono
meta pills, accent title, package-Button footer),
`ReferenceCard` (uppercase tag chip, inset code well, ghost Copy button
— `navigator.clipboard.writeText` in a silent-catch try, `onCopied`
fires after success for YOUR toast, the "Copied!" flash resets after
2s), `TierCard` (eyebrow plan, 2rem tabular price, sig-green Check
bullets; featured → floating elevation + 2px accent border, no scale),
`ProfileCard` (chromatic-ringed avatar, role, 2–3 tabular stats — dev-warned
outside the band — SigBadge skills), and `ChronicleTimeline` (the
"Night of Versions" memorial as an official primitive: a flat `<ol>` of
tagged releases down a 2px hairline spine, accent-ringed 12px nodes).
All five are token-driven, flat-DOM, `SigColorToken`/`AccentToken`
typed, and shadow-free (css/cards.css zero box-shadow).

**Carousel polish** — the track's native scrollbar is gone
(`scrollbar-width: none` + the webkit kill) and the Carousel grows DOT
indicators: one button per child under the mechanics row, the active dot
tracking the same rAF-throttled scroll index as the "n / count"
indicator, `[data-active="true"]` painting the Flamingo 1.5rem pill,
clickable with per-dot aria-labels. `css/forms.css`: the textarea is
`resize: vertical` (owner mandate). Form audit: no FormField boots in an
error state anymore — the Input Matrix's Contribution field skips
pristine values exactly like its siblings (empty or untouched stays
quiet; only non-empty invalid shakes).

**The Master Index overhaul** — the index stops being three doors and
becomes THE CATALOG: a filter `<Tabs>` bar (All / App Gateways / Food &
Carousels / Commerce & Profiles / Docs & Chronicles) driving conditional
row rendering; Row 1 the three BALANCED chromatic gateways
(`.hub__row--3`, equal width — Bento Workbench in Flamingo,
Interactive Graph & Planner in lavender, Pattern Studio in peach);
Row 2 the commerce trio (ContentCard · ReferenceCard · TierCard
dogfooding the suite); Row 3 the food slab (a five-item Carousel of
mini-cards + the `.hub__row--4` profile row: ProfileCard, FlipCard,
AccordionCard, MatchupCard); Row 4 the chronicle slab — a FLAT
SurfaceCard housing `<ChronicleTimeline>` with all 23 releases
(v0.1.0 → v2.6.0; the patch releases fold into their minors). The shell
widens to 1520px with a 24px padding floor. The dashboard (BentoCore)
is untouched.

| Area | Change | Where |
|---|---|---|
| SurfaceCard | `accentToken` + `elevation` props; data-accent/--sig-accent css contract; the 3-tier ladder | react/surface.tsx, css/surface.css |
| Card suite | ContentCard, ReferenceCard, TierCard, ProfileCard, ChronicleTimeline | react/cards.tsx, css/cards.css |
| Carousel | scrollbar-free track + dot indicators | react/editorial.tsx, css/editorial.css |
| Forms | `resize: vertical` textarea; pristine-skip audit | css/forms.css, playground/App.tsx |
| Master Index | filter tabs, chromatic balanced gateways, universal catalog, 23-release chronicle | playground/App.tsx, playground/styles.css |
| Codex | v2.9 — six new recipes, fact-checked vs the compiled .d.ts | SYSTEM_PROMPT.md |
| Cortex | sweep + `.sig-carousel__dot` / `.sig-chronicle__item`; version 2.6.0 | tools/mcp-viz/server.ts |

**Signature changes** — ADDITIVE: `SurfaceCard.accentToken`,
`SurfaceCard.elevation`, `ContentCard`/`ReferenceCard`/`TierCard`/
`ProfileCard`/`ChronicleTimeline` (+ props types), `SigColorToken`,
`StructuralAccentToken`, `AccentToken`, `SurfaceElevation`,
`Carousel` dot indicators. BEHAVIORAL (backwards compatible): the
raised elevation default re-tunes the base card shadow by one step
(0.05/0.40 → 0.06/0.42 — visually the same ambient, numerically on the
ladder); the interactive hover deepens with the same values as v2.5.0.

### 2.5.0 — Ergonomic Form Rules, Button & Card Archetypes, and the 12-Column Bento

The first release built backwards from five owner defects. `npm pack`
now packs EXACTLY 47 files (43 + css/primitives.css + css/cards.css +
react/cards.js + react/cards.d.ts — the negations precedent adds
`!react/cards.tsx`). `tokens.json` gains one token (`--sig-yellow`,
Mocha Yellow — the strength meter's Fair stage) and moves to meta
2.5.0; the whitelist is 34. `react/viz.tsx` and `scripts/verify.mjs`
stay BYTE-FROZEN (the ring animates through a playground-scoped
stroke-dashoffset transition).

| # | The defect (owner) | The fix | Where |
|---|---|---|---|
| 1 | Data & Tables + Form & Input Matrix tabs render edge-to-edge (0px side margins) | `.sig-shell` wraps EVERY view's content — max-width 1400px, centered, `padding-inline: clamp(20px, 4vw, 48px)`; the tab modules and their cards render inside it. GlobalNav stays outside (it is its own bar). Measured: ≥20px viewport margins on all three tabs | playground/App.tsx (Shell), playground/styles.css (.sig-shell; .hub__module de-constrained) |
| 2 | FormField rendered format rules BELOW the input; "$" was concatenated into the label | FormField top-down anatomy: label (PROMOTED: text-main 0.875rem/500) → `description` ABOVE the control ("5 numbers only · e.g., 79901") → control → validation zone (error → `validMessage` → hint). `prefix`/`suffix` compose the `.sig-form-field__well` — mono chips flanking a BARE input, separated from the cursor by a hairline; the well owns border/focus ring/error. The `$` chip is never glued into the label again | react/forms.tsx (FormField), css/forms.css (__label/__desc/__well/__chip/__valid, `sig-shake`), playground FormsModule + allocation |
| 3 | ToggleSwitch had no visible label text | Fixed in 2.4.1 (`.sig-switch__text`), EXERCISED here: the allocation card's "Add to game rotation" switch renders visible text beside the pill | playground/App.tsx (AllocationForm) |
| 4 | CONTRIBUTION table header left-aligned while values right-align | Fixed in 2.4.1 (`.sig-data-table__align-right`, ancestor-scoped 0,2,0), EXERCISED here: the LIVE ledger's Contribution column carries `numeric: true, align: "right"`; the probe measures th/td right edges within ±2px | playground/App.tsx (BENTO_LEDGER_COLUMNS), react/data.tsx (unchanged) |
| 5 | Core Dashboard = old rigid grid, no card archetypes, no button variants, no live validation | The 12-column bento (`.bento12`, explicit spans 12/4/5/4/3/5/3/7/5) with LIVE state (`SEED_MEMBERS` → `useMemo` → ledger/ring/bars/KPI react to allocations), `<Button>` (4 variants, 3 sizes, loading), the archetypes (ActionTile, FlipCard, AccordionCard, MatchupCard), PasswordInput, and per-field live validation (`/^\d+$/`, `/^\d{5}$/`) | playground/App.tsx (BentoCore, AllocationForm), react/primitives.tsx (Button), react/cards.tsx (NEW), css/primitives.css + css/cards.css (NEW), css/forms.css (PasswordInput) |

**The live-state wiring** — one array, everything derives:

```
SEED_MEMBERS (5 typed rows)
        │  useState<Member[]>                      (DashboardView)
        ▼
┌─ members ────────────────────────────────────────────────┐
│                                                          │
│  checkIn() ← AllocationForm submit                          │
│  (name, attendance→state, numeric allocation) — appends      │
└──────────┬───────────────────────────────────────────────┘
           ▼  useMemo(members)
   confirmedCount ──► Confirmed Seats StatCard (span 4)
                  ──► Seats bar + "n / 200" caption
                  ──► ringValue = confirmed/200 %
                  ──► StatRing (span 3) — stroke-dashoffset
                        glides via playground-scoped css
           potTotal (Σ confirmed contributions)
                  ──► Budget spent bar ($sum / $2,000, peach)
                  ──► Budget remaining bar ($rest / $2,000, green)
           ledgerRows ──► DataTable (span 7, attendance badge cells,
                          Contribution numeric + align right)
           toast ──► "Checked in — see you there 🎉"
```

**Signature changes** — ADDITIVE: `Button`/`ButtonProps`,
`PasswordInput`/`PasswordInputProps`, `ActionTile`/`FlipCard`/
`AccordionCard`/`MatchupCard` (+ types), `FormField.description`,
`FormField.validMessage`, `FormField.suffix`, `--sig-yellow`
(KnownToken 33 → 34). BEHAVIORAL: `FormField.prefix` now composes the
owning well (children must be bare inputs — the 2.4.1 `__row`/`__prefix`
retire); the field label is promoted to the primary text voice;
RadioCardGroup warns at dev-time when an option lacks a description.
`css/primitives.css` is ZERO-shadow (the flat primary is package law;
the playground re-adds the v1.6.0 button shadow as a composition
layer decision). The well focus halo renders as a 3px translucent
Flamingo OUTLINE — the box-shadow spelling is banned by the frozen (f1)
gate and the release safety scan.

### 2.4.1 — Intuitive Form Anatomy & Alignment Fix

The first patch release: v2.4.0 shipped the primitive SET; the owner's
canonical spec arrived with DELTAS. `npm pack` still packs EXACTLY 43
files — every delta grows an existing file (zero new files, zero new
tokens; `tokens.json` stays 1.4.0). `scripts/verify.mjs` stays
BYTE-FROZEN; `tools/` fully frozen (all 2.4.1 classes keep the `sig-`
prefix — the cortex sweep's DEFAULT_SELECTORS need no change).

| # | v2.4.0 shipped | Owner spec refined (2.4.1) | Where |
|---|---|---|---|
| 1 | `<DataTable>` with `numeric: true` — cells right-aligned, **header left** (the bug: `.sig-data-table thead th` at specificity 0,1,2 outranks the bare `__num` class 0,1,0) | `DataTableColumn.align?: "left" \| "right" \| "center"` — ancestor-scoped `.sig-data-table__align-*` utilities (0,2,0) applied to BOTH th and td, composing with `__num` (align = geometry, numeric = digits). Playground ledger: Contribution `numeric + align: "right"` — the header finally sits flush over the $120 values | react/data.tsx:37-70, css/data.css:75-95, playground/App.tsx:641-647 |
| 2 | `<FormField>` = label + control + hint XOR error | `required?: boolean` — an aria-hidden peach `*` after the label text (VISUAL only; the CONTROL's `aria-required` stays consumer wiring). `prefix?: string` — a mono muted weight-600 adornment before the control, riding the justified `.sig-form-field__row` flex wrapper. Playground money field: `label="Contribution" prefix="$"` (the dollar sign left the label) | react/forms.tsx (FormFieldProps + render), css/forms.css (__required/__row/__prefix), playground/App.tsx:827-845 |
| 3 | `<RadioCardGroup>` selected = 2px Flamingo + 10% cake tint (a highlight read) | selected card **lifts** to `var(--bg-surface)` over the inset siblings — the owner override; the 2px Flamingo border stays the state signal | css/forms.css:368-379 |
| 4 | `<ToggleSwitch>`: ONE element, `label` = aria-label ONLY — orphaned switches | `label` renders as VISIBLE text: every pill selector migrates `.sig-switch` → `.sig-switch__pill` (audited: no pill property left on the bare name, no `[aria-checked]` outside the pill, reduced-motion list follows); `.sig-switch` becomes the justified wrapper (pill + visible-text composition, the `.sig-select` sanction) around the pill + `.sig-switch__text` (text-main, 0.875rem, weight 500). ONLY the pill is interactive; the button keeps its aria-label | react/forms.tsx (ToggleSwitch), css/forms.css:136-195, 396-409 |
| 5 | `<AnnouncementBanner status?: "info"\|"success"\|"warning">`, fixed Megaphone | API EVOLVED: `variant?: "info" \| "warning" \| "announcement"` (default `announcement` — the Flamingo banner `--color-cake-primary`; info → sky, warning → peach strips; `status`/`"success"` retired). `icon?: IconName` with probed defaults — Info / **TriangleExclamationPoint** / Megaphone (PROBED: the installed lucide-react 1.72.0 map has NO `TriangleAlert` key — the AudioLines/"Music" lesson; the (icons) gate logs the probe). `action?: { label; onClick }` — a small token-driven ghost button (Teal border hover) after the text. Still dismissible. Playground Data-view banner: `variant="announcement"` + `action={{ label: "See what shipped", onClick: toast }}`, v2.4.1 copy | react/editorial.tsx (AnnouncementBanner), css/editorial.css (__action), playground/App.tsx:684-707, react/index.ts (type re-exports) |
| 6 | ProseBlock blockquote: 4px **Flamingo** rule; styled `p`/`blockquote`/`footer`/`cite` only | quote rule → **`var(--sig-mauve)`** (OWNER OVERRIDE: a blockquote IS editorial content, so the Rule of Engagement reads FOR the chromatic token — Flamingo was borrowing the structural action color); `h3` ensured (0.9375rem, weight 600, text-main, margin); inline `code`/`kbd` chips added (mono stack, `--bg-inset` body, 15% muted hairline, 0.25rem radius, 0.125rem × 0.375rem padding, 0.8125rem, `--text-bright`) | css/editorial.css:112-156 |
| 7 | `<Carousel>`: three justified elements (track + 2 buttons), no position readout | page indicator added (a FOURTH justified element — the position made legible): `onScroll` → rAF-throttled → `<span class="sig-carousel__indicator" aria-live="polite">{n} / {count}</span>` with the owner formula `Math.round(scrollLeft / itemWidth) + 1`, mono tabular-nums muted, placed between the two buttons | react/editorial.tsx (Carousel), css/editorial.css:99-111 |
| 8 | Codex title v2.6, 21 snippets | Codex → **v2.7**: FormField/RadioCardGroup/Carousel/ProseBlock/AnnouncementBanner recipes ADDED; DataTable (align), ToggleSwitch (visible label) refreshed — every snippet factual against the new `.d.ts`; contract version string → 2.4.1 | SYSTEM_PROMPT.md |

- **Signature changes** — BREAKING: `AnnouncementBannerProps.status` →
  `variant` (the `"success"` mood retires with the old union;
  `AnnouncementStatus` → `AnnouncementVariant`, plus new
  `AnnouncementBannerAction`). ADDITIVE: `DataTableColumn.align`,
  `FormField.required`, `FormField.prefix`, `AnnouncementBanner.icon`,
  `AnnouncementBanner.action`. Behavioral: `ToggleSwitch` with a
  `label` now renders a wrapper span (pill + text) — the no-label
  form stays the single-element pill.
- **Gate evolution (verify:playground)** — (b7)/(n-hub4) REBASED to the
  v2.4.0 baseline: the authorized 2.4.1 deltas are css/data.css +
  css/forms.css + css/editorial.css (grow), react/data.{tsx,js,d.ts} +
  react/forms.{tsx,js,d.ts} + react/editorial.{tsx,js,d.ts} (grow),
  react/index.{ts,js,d.ts} (type re-exports), SYSTEM_PROMPT.md —
  css/viz.css and css/signature-style.css must stay BYTE-IDENTICAL.
  (dd4) title needle → v2.7; (ed1) quote-rule needle → mauve; (ed2)
  AnnouncementVariant + AnnouncementBannerAction; (ed3) selected bg →
  the --bg-surface lift; (icons) += Info/TriangleExclamationPoint;
  (showcase) → Contribution/prefix/variant/action/v2.4.1 copy. NEW
  gates: (af1) the align utilities (ancestor-scoped — the gate
  REGEX-verifies the 0,2,0 scoping, because a bare class would lose
  the cascade and re-create the bug), the th+td flow (exactly 2
  `dataTableCellClass` sites), the compiled .d.ts fact, the ledger
  usage; (af2) required/prefix slots, the switch migration audit
  (comment-stripped attribute scan), the __text contract, the radio
  lift; (af3) mauve/h3/kbd/indicator/action needles, the variant map,
  the probed icon defaults, the owner index formula, and the v2.7
  codex needles. Negative test (falsifiability, restore-verified):
  surgically removing the `.sig-data-table__align-right` rule from
  css/data.css flips (af1) to FAIL (both needles) — restore → PASS
  (git-verified byte-identical).
- **Release proof** — `npm run verify` PASS (the frozen floor);
  `npm run verify:playground` PASS (with (af1)–(af3) + the amended
  gates); `npm run verify:mcp` SMOKE ALL PASS; the one-off cortex
  probe (clicks the Forms + Data tabs) measured the deltas live:
  `.sig-switch__text` visible ("Make event public"), the ledger
  numeric header computed `text-align: right` (was left — the fix,
  verified computed-style), the banner strip `rgb(242, 205, 205)`
  (Mocha Flamingo — the announcement accent), the `$` prefix +
  indicator "1 / 5" rendered; `vite build` exit 0; `npm pack` exactly
  43 files; `git diff v2.4.0 -- css/ react/` = EXACTLY css/data.css +
  css/forms.css + css/editorial.css (grow), react/data.{tsx,js,d.ts} +
  react/forms.{tsx,js,d.ts} + react/editorial.{tsx,js,d.ts} (grow),
  react/index.{ts,d.ts} (type re-exports; index.js unchanged — type
  names elide from compiled JS) — nothing else; tokens.json 1.4.0;
  dev server relaunched detached with `--config
  playground/vite.config.ts`, `curl localhost:5173` → 200.

### 2.4.0 — Form Wrappers & Editorial Primitives

- **THE STORY — the scaffold around the control, and the slots around
  the text.** Seven new exports: `<FormField>` and `<RadioCardGroup>`
  (forms grows), `<Carousel>`, `<ProseBlock>`, `<AnnouncementBanner>`
  (NEW css/editorial.css + react/editorial.tsx), and `<StatCard>` +
  `<Sparkline>` (viz grows). These primitives exist to serve the
  v2.5.0 12-column bento rebuild coming next. `tokens.json` stays
  1.4.0 (the 33-token whitelist is FROZEN — zero new tokens); `npm
  pack` now packs EXACTLY 43 files (40 + css/editorial.css +
  react/editorial.js/.d.ts; `!react/editorial.tsx` joins the
  files-array negations, the 2.2.0/2.3.0 precedent).
- **`<FormField>` — the accessible around-the-control scaffold.**
  `<div class="sig-form-field">` (flex column, tight gap — the
  `__field` slot contract lives ON the root, one class fewer) →
  `<label class="sig-form-field__label" htmlFor={htmlFor}>` (muted
  0.75rem, weight 500) → children (the bare control, untouched) →
  hint (`.sig-form-field__hint`, muted 0.75rem) OR error
  (`.sig-form-field__error`, role="alert", --sig-peach 0.75rem).
  ERROR REPLACES HINT — one message slot, two states; a field shows
  one message. THE CONSUMER WIRES id/htmlFor: pass the same `id` to
  the child control and `htmlFor` to the field — the package renders
  no ids it cannot verify. The v1.4.0 "no message slot" doctrine
  still holds for the CONTROL (`<Input>` stays ONE element); the
  FIELD wrapper is the sanctioned scaffold around it.
- **`<RadioCardGroup>` — the card-metaphor radio.**
  `<div role="radiogroup" aria-label class="sig-radio-cards">` (grid
  auto-fit minmax(140px, 1fr)) → one `<label class="sig-radio-card
  [--selected]">` per option — the wrapper is a SEMANTIC necessity
  (native label association, the `<Checkbox>` doctrine) → visually
  hidden `<input type="radio">` (position absolute + opacity 0;
  arrow-key navigation and forms stay native) + the body span
  (label 0.875rem/600 + optional muted description). Cards: inset
  background, 20% hairline, --radius-ui, teal hover; selected → 2px
  Flamingo border + 10% cake-tint background via BOTH the `--selected`
  class mirror (specificity-safe vs :hover) and
  `:has(input:checked)` — the attribute is the state. THE :HAS()
  FOCUS RING + FALLBACK NOTE: keyboard focus lands on the hidden
  input and the CARD rings through
  `.sig-radio-card:has(input:focus-visible)` → the doctrine outline.
  :has() needs Chrome 105+ / Safari 15.4+ / Firefox 121+; without it
  the card loses ONLY the visible ring — the selected card still
  reads via the Flamingo border (:checked is universal) and the group
  stays fully keyboard operable. Documented degrade. The 2px border
  is padding-compensated (−1px) so the card never shifts.
- **`<Carousel>` — the scroll strip with three justified elements.**
  `<div class="sig-carousel">` → ghost previous button (ChevronLeft)
  → `<div class="sig-carousel__track" ref tabIndex={0} role="region"
  aria-label>` (flex, gap, overflow-x auto, scroll-snap-type x
  mandatory, scrollbar-width thin) → ghost next button (ChevronRight).
  The buttons ARE the mechanics — keyboard users scroll the track
  itself (it is focusable). Children must already be
  `.sig-carousel__item` elements; the tiny `<CarouselItem>` helper
  renders exactly that div (flex 0 0 auto, snap-align start).
  Buttons scroll by one item width via ref (`scrollBy({ left:
  ±itemWidth })`, snap re-snaps to the item start); reduced motion →
  `behavior: "auto"` (matchMedia read ONCE per instance). Ghost
  buttons: transparent body, hairline border, Teal hover.
- **`<ProseBlock>` — the editorial slot.** ONE `<div class="sig-prose">`,
  no props beyond className passthrough — a pure typography container
  with styled DESCENDANTS: `p` (0.875rem, 1.6 line-height),
  `blockquote` (inset well, 4px Flamingo left rule, italic
  --text-bright), `footer`/`cite` (mono muted 0.75rem attribution,
  display block). No variants, no knobs — you bring the markup, the
  block makes it read.
- **`<AnnouncementBanner>` — the toast strip's announcing sibling.**
  `<div class="sig-announcement" role="status">` (live region —
  unlike `<Callout>`'s static role="note", a banner announces itself)
  with `--status` set INLINE from the SAME chromatic map as Callout
  (info → `--sig-sky`, success → `--sig-green`, warning →
  `--sig-peach`): full width, inset body, 15% hairline, 4px
  --status left rule. Megaphone icon tinted var(--status); optional
  `dismissible` renders the ghost close (aria-label "Dismiss", the
  modal-close signature: muted, Teal hover). Dismissal is YOUR state
  — the component never unmounts itself.
- **`<Sparkline>` + `<StatCard>` — the KPI pair.** `<Sparkline>` is
  ONE `<svg role="img" aria-label viewBox="0 0 w h"
  preserveAspectRatio="none">` with EXACTLY TWO elements: the area
  `<polygon>` (`color-mix(in srgb, var(colorToken) 15%, transparent)`)
  and the `<polyline>` line (2px, round cap/join) — geometry computed
  in the pure `sparkPoints` helper (data in, viewBox points out; flat
  series rides the midline; ≥2 points enforced — fewer warns and
  renders null; --sig-* tokens only, the runtime guard refuses
  structural tokens). No CSS at all — pure SVG attributes, like
  StatRing. `<StatCard>`: `<div class="sig-stat-card">` → muted
  uppercase label (0.1em tracking) → 1.5rem weight-600 tabular-nums
  value → optional delta span (`--up` → --sig-green, `--down` →
  --sig-peach) → optional Sparkline labeled "<label> trend". FLAT
  by the e1 doctrine: surface background + 20% hairline, NO shadow.
- **The playground grows the showcase (light touch — the big layout
  rebuild is v2.5.0).** The Form & Input Matrix card wraps Name /
  $ Contribution side-by-side in `<FormField>` (hint demoed on the
  first, error-replaces-hint + aria-invalid on the second) and adds
  the attendance `<RadioCardGroup>` (Attending "See you there" / Maybe /
  Can't make it). The Data view gains the release
  `<AnnouncementBanner>` ("v2.4.0 — six new editorial & form
  primitives shipped." — dismissible), the `<StatCard>` KPI trio
  (Total Budget $2,000 +$440 on green / Confirmed Seats 170 +12 on
  sky / Active Game Rooms 6 +2 on mauve-soft, each with its
  sparkline), and the Field Notes card — a `<ProseBlock>` (two
  paragraphs + the "Weeks of coding can save you hours of planning"
  blockquote + a Signature Style citation) and a `<Carousel>` of five
  palette clippings (real scrollable overflow, probe-scrolled).
  New testids: `kpi-trio`, `banner-release`, `carousel-clippings`.
- **Gate evolution (verify:playground)** — (b2 AMENDMENT) files =
  v1.4.0 + `!react/surface.tsx` + `!react/data.tsx` +
  `!react/editorial.tsx`; (b3) 40 → 43; (b7)/(n-hub4) REBASED to the
  v2.3.0 baseline with the authorized 2.4.0 deltas enumerated
  (editorial layer, forms/viz growth, umbrella re-exports) — tools/
  is FULLY frozen this release (the cortex sweep's class targets are
  unchanged; sig- prefixes only); scripts/verify.mjs stays
  BYTE-FROZEN; (m3) += the three new hooks. NEW gates: (ed1)
  editorial.css anatomy (carousel snap, prose blockquote, banner
  --status strip, layered import after data.css, zero hex AND zero
  box-shadow — the e1 scope extends: ALL css/ files stay flat except
  surface.css's sanctioned .sig-surface-card rules, editorial
  included); (ed2) umbrella re-exports the 2.4.0 names in .d.ts AND
  .js with compiled artifacts; (ed3) forms additions (:has() focus
  ring + the DOCUMENTED no-:has degrade, radio selected contract,
  hidden input, card grid, field anatomy); (ed4) Sparkline
  one-svg-two-elements + StatCard flatness; (icons) Megaphone /
  ChevronLeft / ChevronRight probed against the live lucide map;
  (showcase) the FormField/RadioCardGroup/Data-view wiring. Negative
  test (falsifiability, restore-verified): removing the
  `:has(input:checked)` Flamingo selected rule from css/forms.css
  flips (ed3) to FAIL — restore → PASS (git-verified byte-identical).
- **Release proof** — `npm run verify` PASS (the frozen floor);
  `npm run verify:playground` PASS (with (ed1)–(ed4), (icons),
  (showcase)); `npm run verify:mcp` SMOKE ALL PASS; the one-off
  cortex probe (clicks the Data tab) measured the new primitives
  live: 3/3 `.sig-stat-card` visible, `.sig-carousel__track`
  scrollable (scrollWidth > clientWidth), the banner present with
  role="status"; `vite build` exit 0; `npm pack` exactly 43 files;
  `git diff v2.3.0 -- css/ react/` = EXACTLY css/editorial.css (new),
  css/forms.css + css/viz.css (grow), css/signature-style.css (the
  editorial.css import), react/editorial.{tsx,js,d.ts} (new),
  react/forms.{tsx,js,d.ts} + react/viz.{tsx,js,d.ts} (grow),
  react/index.{ts,js,d.ts} (re-exports) — nothing else; tokens.json
  1.4.0; dev server relaunched detached with `--config
  playground/vite.config.ts`, `curl localhost:5173` → 200.

### 2.3.0 — Universal Web Components & AI Signature Codex

- **THE STORY — the package learns to show data, and teaches AI to
  reproduce itself.** Six new components: `<DataTable>`, `<Tabs>`,
  `<Callout>` (NEW css/data.css + react/data.tsx) and `<Select>`,
  `<Checkbox>`, `<Avatar>` (forms grows). SYSTEM_PROMPT.md gains the
  **Universal AI Replication Contract** — copy-paste JSX for all 21
  exported components, factual against the .d.ts — and the engine
  title moves to v2.6 (owner decision made by the implementor: the
  contract is a major DOCTRINE addition, and this file's version has
  always tracked doctrine, not package releases). `tokens.json` stays
  1.4.0; `npm pack` now packs EXACTLY 40 files (37 + css/data.css +
  react/data.js/.d.ts; `!react/data.tsx` joins the files-array
  negations, the 2.2.0 precedent).
- **`<DataTable>` — the ledger table inside its justified wrapper.**
  `<div class="sig-table-scroll">` (STRUCTURAL: a bare `<table>`
  ignores overflow in table layout, so scroll containment — the
  mobile strategy, NO 768px media query in data.css — needs a block
  ancestor) → `<table class="sig-data-table">` → optional
  `<caption>` (caption-side bottom, mono muted 0.75rem), thead th
  (scope="col", uppercase, 0.1em tracking, muted 0.75rem/600,
  20%-mix hairline), tbody td (10%-mix hairline, --text-main),
  `tbody tr:hover` → the subtle 8% Flamingo wash
  (`color-mix(in srgb, var(--color-cake-primary) 8%, transparent)`),
  and `.sig-data-table__num` (right-aligned tabular-nums) on both
  the th and td of `numeric: true` columns. Cell values are
  ReactNode — a `<SigBadge>` composes straight into a status
  column. No sorting, no pagination: a static table IS the feature.
- **`<Tabs>` — the module switcher, attribute-driven like the nav.**
  `<div role="tablist" aria-label class="sig-tabs">` of
  `<button type="button" role="tab" aria-selected>`; ZERO .is-active
  classes — `[aria-selected="true"]` IS the active state and
  css/data.css answers it with the Flamingo underline
  (`border-bottom-color: var(--color-cake-primary)`), THE nav visual
  contract. Controlled (`activeId` + `onChange(id)`, the component
  owns no state); hover = --text-main, press = scale(0.97),
  focus-visible = the doctrine ring, reduced-motion = none. Panels
  are the consumer's: render the active branch yourself.
- **`<Callout>` — Toast's persistent sibling.** ONE
  `<div class="sig-callout" role="note">` with `--status` set INLINE
  from the status map (info → `--sig-sky`, success →
  `--sig-green`, warning → `--sig-peach`) — the css/toast.css
  strip mechanism, but a callout NEVER auto-dismisses: no timer, no
  close button. Inset-well body, --radius-ui corners, 0.875rem.
- **`<Select>` / `<Checkbox>` / `<Avatar>` — the forms grow.**
  `<Select>` wraps its native select in a justified `<span
  class="sig-select">` (STRUCTURAL: `appearance: none` strips the UA
  arrow and the `ChevronDown` icon — live-map-probed, exists in the
  installed lucide-react — needs a positioned ancestor; pointer-
  events none, muted, 16px); aria-invalid → the peach error border
  (v1.4.0 doctrine), :focus-visible → the Flamingo ring. `<Checkbox>`
  wraps a native input in a `<label>` (SEMANTIC necessity — native
  label association is the feature); `appearance: none`, 16px box,
  `:checked` → the Teal fill + the ::after checkmark (6×10 L of two
  2px `--color-on-cake` borders rotated 45°, opacity-swapped) — dark
  ink on bright cake, the on-cake doctrine. `<Avatar>` derives
  initials (word-initials, ≤2, uppercase; empty name → empty span)
  into ONE `<span class="sig-avatar">` (32|40 px, INLINE width/
  height); `ringToken` is SigTokenName-typed AND runtime-guarded —
  a structural token warns and renders WITHOUT the ring (documented
  choice: an avatar without its ring is still an avatar, unlike
  SigBadge/ProgressBar where the token IS the content); the ring
  is an inline `border: 2px solid var(--sig-token)` — BORDER,
  never box-shadow (probe-proven: computed box-shadow "none").
- **The playground grows module tabs.** The dashboard gains `<Tabs
  label="Dashboard modules">` (core / data / forms, local state,
  testid `tabs-module`) over three branches: **core** (the unchanged
  4-SurfaceCard board — the tab bar lives in .hub__module ABOVE the
  grid so the nth-child stagger is untouched), **data** (the Member &
  Budget Ledger: DataTable with the five crew rows — Ana Souza
  Confirmed $120 as the composed `<SigBadge>`, Leo Martins Pending
  $0, Priya Nair Confirmed $200, Tom Weller Declined $0, Ana + 1
  Pending $120, tabular contribution column, provenance caption;
  the three callout moods; five Avatars, 32px ×3 / 40px ×2, mauve-
  soft + sky rings; testid `data-table-ledger`), **forms** (The
  Input Matrix: Input, TextArea, Select with three options,
  Checkbox, ToggleSwitch stacked in the v2.1.0 spacing pattern).
- **The codex — SYSTEM_PROMPT.md § Universal AI Replication
  Contract.** "Any AI consuming @edwyn/signature-style@2.3.0 can
  reproduce this signature verbatim — these snippets are the law":
  21 copy-paste JSX snippets (ThemeProvider, PageHero, SurfaceCard,
  GlobalNav + the as={NavLink}/activeHref note, Tabs, EventTimeline,
  useModal+EventModal, ProgressBar + limitText, StatRing, DataTable,
  Callout, Avatar, Input, TextArea, Select, Checkbox, ToggleSwitch,
  ToastProvider+useToast, SigBadge, Icon, EmptyState), each
  one-line-preambled and FACTUAL against the shipped .d.ts (no
  invented props), ending on the three doctrines one-liner +
  "never invent tokens; never hardcode hex".
- **Cortex sweep grown (tools/ is our tooling — owner-editable).**
  DEFAULT_SELECTORS add `.sig-data-table`, `.sig-tabs__tab`,
  `.sig-callout`; server version → 2.3.0. HONEST SWEEP NOTE: the
  default view is dashboard/core, so table/tab/callout hits do NOT
  appear in the default sweep — module content mounts on click. The
  shipped smoke is UNCHANGED (it asserts timeline nodes, which the
  default view renders); the release proof ran a one-off probe that
  CLICKS the Data tab first.
- **Gate evolution (verify:playground)** — (b2 AMENDMENT) files =
  v1.4.0 + `!react/surface.tsx` + `!react/data.tsx`; (b3) 37 → 40;
  (b7)/(n-hub4) REBASED to the v2.2.0 baseline with the authorized
  2.3.0 deltas enumerated (data layer, forms growth, umbrella
  re-exports, codex, cortex sweep) — scripts/verify.mjs stays
  BYTE-FROZEN; (m3) += `tabs-module` + `data-table-ledger`; NEW:
  (dd1) data.css anatomy (scroll containment AND the ABSENCE of a
  768px query, uppercase thead, tabular-nums, 8% hover wash,
  aria-selected contract, comment-stripped .is-active ban, zero
  hex/shadow, layered import after surface.css); (dd2) all six new
  names re-exported in index.d.ts AND index.js (+ types + compiled
  artifacts); (dd3) forms additions (appearance:none, :checked
  Teal, ::after on-cake checkmark, positioned chevron, avatar disc,
  inline-border ring, runtime --sig-* guard, declaration-scoped
  boxShadow ban); (dd4) the codex (section present, ≥15 snippet
  headings, engine v2.6 title, the closing law); (dd5) the tabs
  showcase (switcher ids, ledger rows, composed badge, three
  callouts, avatar rings, matrix); (dd6) the cortex selectors +
  server version. Negative test (falsifiability, restore-verified):
  removing the `[aria-selected="true"]` Flamingo-underline rule from
  css/data.css flips (dd1) to FAIL — "must contain
  border-bottom-color: var(--color-cake-primary)" — restore → PASS
  (git-verified byte-identical).
- **Release proof** — `npm run verify` PASS (the frozen floor);
  `npm run verify:playground` PASS (with (dd1)–(dd6)); `npm run
  verify:mcp` SMOKE ALL PASS (39 layout hits, 6/6 timeline nodes
  with area); `vite build` exit 0; `npm pack` exactly 40 files;
  `git diff v2.2.0 -- css/ react/` = EXACTLY css/data.css (new),
  css/forms.css, css/signature-style.css (+1 import line),
  react/data.{tsx,js,d.ts} (new), react/forms.{tsx,js,d.ts},
  react/index.{ts,js,d.ts} — nothing else. `package.json`/lock →
  2.3.0, `tokens.json` stays 1.4.0. Relaunch proof (dev server
  killed and restarted fresh — the /mnt/c inotify lesson; HTTP 200)
  and the one-off cortex probe (click-path: Data & Tables tab →
  aria-selected=true, underline computed #F2CDCD Mocha Flamingo;
  .sig-data-table: 5 tbody rows, thead uppercase/1.2px tracking,
  numeric cells tabular-nums right-aligned, caption-side bottom;
  callouts: 4px strips computed #04a5e5 / #a6d189 / #fe640b on the
  #282A36 inset body, role="note" ×3; avatars: AS/LM/PN/TW/A+
  initials, inline `border: 2px solid var(--sig-mauve-soft)` /
  `var(--sig-sky)` on the two ringed discs, radius 50%, computed
  box-shadow "none"). Honest note: the 8% hover wash is gate-
  asserted (dd1 needle), not probe-computed — a synthetic
  mouseover does not trip the browser's :hover state.

### 2.2.0 — Telemetry Limits & Official Surface Primitives

- **THE STORY — the tracks become visible, and the playground's
  anatomy graduates into the package.** Two moves: the telemetry
  primitives get their LIMITS (visible track boundaries, limit
  captions, ring readouts), and the Shed card anatomy the playground
  invented in 2.0.0 is promoted into OFFICIAL exports —
  `<SurfaceCard>` / `<PageHero>` with the owner-mandated `.sig-*`
  class prefix. The playground becomes a consumer of its own package.
  `tokens.json` stays 1.4.0; `npm pack` now packs EXACTLY 37 files
  (34 + css/surface.css + react/surface.js/.d.ts).
- **Track-contrast fix (the telemetry limit story).** The
  `--bg-surface` tracks were INVISIBLE on `--bg-surface` cards —
  surface-on-surface meant zero contrast, and the 100% boundary of a
  half-filled bar simply disappeared the moment it sat on a card. The
  fix (owner-authorized in css/viz.css + react/viz.tsx): the track
  retargets to `var(--bg-inset)` AND draws a hairline —
  `border: 1px solid color-mix(in srgb, var(--text-muted) 20%,
  transparent)` — so the full boundary reads on ANY card. StatRing's
  track retargets identically, plus an SVG-native boundary hairline
  (a THIRD circle, r 47.5, fixed 1.5 viewBox-unit stroke of the same
  20% mix, fill none, drawn over the ink) — the ring's DOM is now 3
  circles + the optional value text.
- **`limitText` + `showValue` — the telemetry grows its readouts.**
  `<ProgressBar limitText="…">` renders a THIRD element after the
  track — `.sig-progress__caption`, a mono `tabular-nums` muted
  0.75rem caption inside a fragment (no wrapper around the track;
  the ARIA contract is unchanged). `<StatRing showValue>` (default
  true) renders the centered readout — `<text>` at the exact center
  in viewBox units (scales with `size`), `var(--text-main)`,
  tabular-nums, weight 600 — showing the CLAMPED value, so text,
  geometry and `aria-valuenow` can never disagree. The 2.1.0
  "consumers place their own numbers" pruning is relaxed BY THE
  OWNER for the readout only.
- **The promotion — SurfaceCard + PageHero.** css/surface.css +
  react/surface.tsx are the official home of the Shed skeleton:
  `.sig-surface-card` (surface + 15% token-mix border + inset
  top-highlight + ambient shadow), `.sig-surface-card--interactive`
  (translateY(-2px) hover + deepened shadow, on the package's own
  transition tokens), `__meta`/`__eyebrow` (teal all-caps)/`__path`
  (muted mono)/`__title` (ruled), `.sig-page-hero` (serif display
  h1, clamp 2.25rem → 4rem, 0.35em tracking + muted mono subtitle).
  The component renders EXACTLY ONE `<section>` (meta row only when
  eyebrow/meta given, ruled h2 only when title given, children slot
  bare); `<PageHero>` renders ONE `<header>` (h1 + optional sub +
  children slot). The class-on-the-h2 upgrade: the ruled title rides
  `__title` itself, so the old `.hub__card > h2` child-combinator
  specificity contest is gone by construction. Re-exported from the
  umbrella (+ compiled artifacts; `!react/surface.tsx` joins the
  files-array negations).
- **DOCTRINE — the owner elevation sanction, scoped.** The rgba
  elevation literals (inset top-highlight + ambient shadows) are
  OWNER-SANCTIONED in css/surface.css ONLY — the ambient elevation
  contract ships WITH the surface primitive. Gate (e1) is rescoped
  accordingly: every other css/ file stays ABSOLUTE ZERO on
  box-shadow, and surface.css may declare shadows only inside
  `.sig-surface-card` rules (parsed per rule block; a shadow on
  `.sig-page-hero` fails). Hex stays banned everywhere, sanctioned
  file included. The rgba-scrim precedent (modal.css) is unchanged.
- **The playground consumes its package.** All four dashboard cards
  render `<SurfaceCard eyebrow=… meta=… title=… interactive>`
  (timeline included — they're hover modules; the chronology keeps
  its `hub__card--timeline` grid modifier via className), the hero
  is `<PageHero title="THE ENGINE" subtitle="every primitive, one
  dashboard · live showcase" />`, and the placeholder modules
  dogfood `<SurfaceCard>` + `<EmptyState>`. The gateway cards keep
  their v2.1.0 `<button>` semantics — a button cannot be the
  `<section>`-rendering SurfaceCard — so they WEAR the package's
  sig classes and the local css only neutralizes the UA button
  chrome. styles.css DELETES the anatomy/hero it used to own
  (package-owned now) and keeps the genuinely local: the 1400px
  auto-fit grid, the metric rows (+ the ≥16px air mandate), the
  stagger (retargeted to `.sig-surface-card:nth-child`, reduced-
  motion escape intact), the node elevation (retargeted to the
  `.sig-surface-card` ancestor), the button pop, the 900px index
  column, the 2.1.0 measured breathing room (unchanged, composed on
  the className modifier). The telemetry card wears its limits:
  budget-remaining "$1,440 / $2,000", spent "$1,325 / $2,000", and
  a NEW members row — 170 / 200 on `--sig-sky` at 85%, the Attendance
  ring's own ratio, coherent.
- **Cortex sweep updated (tools/ is our tooling — owner-editable).**
  The MCP server's DEFAULT_SELECTORS retarget the retired
  `.bento__*` classes to the live contract — `.sig-surface-card`,
  `.hub__metric`, `.hub__btn` — and the server version string moves
  to 2.2.0. Card-level data-testids retired with the `.hub__card`
  section: the cortex's stable card hook is the class selector
  itself; metric + button hooks stay (plus the new
  `metric-seats`).
- **Gate evolution (verify:playground)** — (b2 AMENDMENT) the frozen
  files array evolves exactly one step (v1.4.0 + `!react/surface.tsx`);
  (b3) 34 → 37; (b7)/(n-hub4) safety proofs REBASED to the v2.1.0
  baseline with the authorized deltas enumerated (viz limits, surface
  promotion incl. compiled artifacts + the bundle import, cortex
  sweep) — scripts/verify.mjs stays BYTE-FROZEN (its frozen v1 floor
  reads the migration marker in the viz.css header; the LIVING 2.2.0
  viz gate is (v22) here: inset track + hairline boundary + caption
  needles, limitText/ring-hairline/centered-readout needles);
  (e1 AMENDMENT) the surface-scoped shadow contract (above);
  (s1) the promoted anatomy needles; (s2) the umbrella re-exports +
  compiled artifacts; (b4)/(h1)/(g2)/(n-hub2)/(n-hub3)/(m3)/(b5)
  retargeted to the package-owned anatomy with intent kept
  (4 SurfaceCards audited inside the dashboard branch, all
  interactive). Negative tests (falsifiability, restore-verified):
  (1) a box-shadow appended to css/forms.css flips (e1) to FAIL;
  (2) a shadow on `.sig-page-hero` in css/surface.css flips (e1) to
  FAIL (the sanction is scoped to `.sig-surface-card` rules);
  (3) dropping `tabular-nums` from the viz caption flips (s1) to
  FAIL. Restore → PASS each time.
- **Release proof** — `npm run verify` PASS (the frozen floor);
  `npm run verify:playground` PASS; `npm run verify:mcp` SMOKE ALL
  PASS (the default sweep now reports `.sig-surface-card` hits; 6/6
  timeline nodes with area); `vite build` exit 0; `npm pack` exactly
  37 files; safety diff vs v2.1.0 (`react/ tokens.json demo/
  SYSTEM_PROMPT.md scripts/`) EMPTY beyond the authorized deltas:
  react/surface.{tsx,js,d.ts} (the promotion), react/viz.{tsx,js,d.ts}
  (the telemetry limits, owner-authorized), react/index.{ts,js,d.ts}
  (the umbrella re-exports, compiled); css/ deltas
  (css/surface.css NEW, css/viz.css retarget, css/signature-style.css
  import) are outside that pathspec. `package.json`/lock → 2.2.0,
  `tokens.json` stays 1.4.0. Relaunch proof: dev server killed and
  restarted fresh (the `/mnt/c` inotify lesson — vite never sees file
  edits on the Windows mount), computed-style probe: the progress
  track measures `background-color` = the inset token and a 1px
  20%-mix border; the ring SVG carries the centered "85%" text.

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
  (headerRect.bottom → first `.sig-timeline__node` rect.top):

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
  actually incremental. The first `.sig-timeline__item` BOX still sits
  under the slab (−77px) by design: its group-first padding is empty
  space; the node is the visual invariant.
- **The Master Index — a state-based view switcher.** `type View =
  "dashboard" | "index" | "events" | "members" | "budget"`, default
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
  Members, Budget, Index — hrefs `#/dashboard` … `#/index`, one explicit
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
  Flashcard Generator and GAMES / modules/games.tsx / chromatic Game
  Modules — roadmap doors. **Decision (documented):** the roadmap doors
  fire a success toast ("… is on the roadmap.") instead of routing to
  an EmptyState view, because the nav's workshop entries already
  dogfood `<EmptyState>` as placeholder views and a toast keeps the
  reader at the index. Cards are `<button>`s for free keyboard/press
  semantics; the hub hover lift carries the interaction.
- **Placeholder doctrine — the workshop dogfood.** The Events / Members
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
  "dashboard", so the smoke's `.sig-timeline` assertions still hold);
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
  The Chronology / Budget & Attendance / The Chromatic Palette; labels: Forms /
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
  6/6 `.sig-timeline__node` visible with area; all three metric rows
  no-overlap (value left ≥ label right), flush right within 1px of the
  card's content edge, and 40px/40px/32px of air below the label rows
  (≥16px mandate — the attendance row's nearest viz is the classless
  StatRing `svg[role="progressbar"]`, swept explicitly). BEFORE/AFTER
  rect table (1280px viewport): the asymmetric stage measured
  315.4/473.1/315.4px columns at y=83 with a hole under the telemetry;
  the hub measures 600px columns at y=232 (the hero announces first)
  with one one-card void beside the palette — both layouts carry
  exactly one one-card hole; the hub's is pixel-equal to its row-mate.
  Proof screenshot: `/tmp/visual-cortex/v200-proof.png`.
- **Release proof** — `npm run verify` PASS; `npm run verify:playground`
  PASS; `npm run verify:mcp` SMOKE ALL PASS (tools/ byte-frozen — the
  smoke's `.sig-timeline__node` assertion still holds); `vite build`
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
  `.sig-timeline__header` swaps its opaque `background: var(--bg-base)`
  slab for `color-mix(in srgb, var(--bg-surface) 80%, transparent)` +
  `backdrop-filter: blur(8px)` (webkit-prefixed): scrolled content
  stays legible THROUGH the sticky date header. The 1.6.0 resurrection
  contract is untouched and still load-bearing — `position: sticky`,
  `top: 0`, `z-index: var(--z-sticky, 10)`, `align-self: start` (a
  spanning grid item must not stretch into a cover slab). Cortex-proven
  post-change: all three headers height 69px, visible, unchanged.
- **Axis-aligned typography (css/timeline.css)** — text flows TOWARD
  the axis: `.sig-timeline__item--left` keeps `text-align: right`,
  `.sig-timeline__item--right` gains the explicit
  `text-align: left`, and the 768px media query resets BOTH modifiers
  to `text-align: left` explicitly (one right-hand stack, no axis to
  hug).
- **Node elevation — composition layer ONLY (doctrine boundary)** —
  the nodes float: `.bento__card .sig-timeline__node` gets
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
  via `.bento__metric .sig-progress, .bento__metric + .sig-progress`
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
  anatomy — `[data-testid]`, `.sig-timeline__node`,
  `.sig-timeline__item`, `.sig-timeline__header`, `.sig-progress`,
  `.sig-progress__fill`, `.bento__card`, `.bento__metric`,
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
  `.sig-timeline__node` with width>0 && height>0, and non-empty
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
  `metric-budget-remaining`, `metric-budget-spent`, `metric-attendance`,
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
  1. **The cover slab** — `.sig-timeline__header` is a *spanning* grid
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
  2. **The dropped node rule** — the `.sig-timeline__node` rule's own
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
  without a mapping layer. Field-by-field against `TimelineEvent`, two
  required fields never arrive: with `date` `undefined`,
  `groupEvents` buckets every record under the single key `undefined`
  (`react/timeline.js`: `const key = event.dateKey ?? event.date`) and
  the sticky header prints no text — the **empty header**; with
  `category` `undefined`, `SigBadge`'s
  `!colorToken.startsWith("--sig-")` guard
  (`react/primitives.js:25`) throws on the `undefined` dereference and
  React unmounts the timeline — **without events**. Both halves were
  reproduced by an SSR probe against the compiled package modules; the
  1.5.0 playground's own `SAMPLE_EVENTS` was field-complete and renders
  correctly — the defect was the missing owner-data → package-contract
  mapping pattern, which the playground never demonstrated.
- **The hydration fix** — `playground/App.tsx` now mirrors the real
  integration: `mockEvents` in the owner's shape (6 complete entries,
  3 month buckets, 4 modal descriptions), mapped to `TimelineEvent` in ONE
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
  package-rendered `.sig-timeline__header` h2s (0,1,1 beats 0,1,0) and
  override their sticky-header geometry. The `bento__btn` press physics
  are untouched: `:active { transform: scale(0.97) }` +
  `transition: var(--transition-standard), var(--transition-transform)`.
- **Release gates** — `verify:playground` now runs b1–b7 PLUS h1–h3:
  the stagger/escape/hairline strings in `styles.css`, complete
  owner-shaped `mockEvents` (≥4 entries, ≥2 buckets, every field
  present, `--sig-*` tokens only) + the mapping layer greps, and
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
  - **Telemetry** — `<ProgressBar>` (sig-green / sig-peach) and
    `<StatRing>` (sig-sky) with consumer-rendered label rows — the
    Rule of Engagement (chromatic tokens = content only) in practice.
  - **Chromatic Palette** — all ten `--sig-*` tokens as `<SigBadge>`s
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
    <AttendanceForm />
  </ToastProvider>

  // inside <AttendanceForm>:
  const toast = useToast(); // throws without a provider — fail loudly
  saveAttendance().then(() => toast("success", "Attendance saved"))
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
    `var(--sig-green)`, error → `var(--sig-peach)`, set INLINE as a
    `--status` custom property that css/toast.css reads for the 4px
    left border. Status is a content-outcome signal, so chromatic tokens are
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
  dependencies**. Two shapes cover the Signature Style data story:

  ```tsx
  import { ProgressBar, StatRing } from "@edwyn/signature-style/react";

  // Budget bar — 72% remaining, on a sig-green fill:
  <ProgressBar value={72} colorToken="--sig-green" label="Budget remaining" />

  // Attendance ring — 85% of invitees in, on a sig-sky arc:
  <StatRing value={85} colorToken="--sig-sky" />
  ```

  - **`<ProgressBar value colorToken label? />`** — ONE
    `div.sig-progress` (role="progressbar" with the full aria value
    contract) containing ONE `div.sig-progress__fill` whose width is
    the clamped value. The fill animates `width 0.3s ease-out`
    (owner-mandated physics; `prefers-reduced-motion` disables it).
    Exactly two elements, no wrappers.
  - **`<StatRing value colorToken size? strokeWidth? label? />`** — ONE
    `<svg role="progressbar">` (viewBox `0 0 100 100`, default
    `size` 64 — an 8px-grid multiple) with exactly two circles
    (r 44): a `var(--bg-surface)` track and a chromatic-colored progress
    arc revealed by `strokeDasharray = 2π·44` /
    `strokeDashoffset = C × (1 − v/100)`, rotated −90° so 0% starts at
    12 o'clock. `strokeWidth` is a `4 | 8` union (grid-perfect) and is
    converted to viewBox units, so the visual weight is exact at any
    size. No center text, no third element — consumers place their
    numbers beside the ring. Needs NO CSS at all: pure SVG attributes.
  - **Rule of Engagement, enforced twice** — `colorToken` is typed
    `SigTokenName`, so a structural token like `--color-cake-primary`
    is a compile error; a runtime guard (`startsWith("--sig-")`)
    warns and renders null for anything JS slips past the types (same
    warn-and-drop pattern as `<SigBadge>`).
- **The data-ink doctrine** — high data-to-ink ratio, zero decoration:
  no grid lines, no drop shadows, no 3D. Tracks are structural chrome
  (`var(--bg-surface)`); data fills are ALWAYS `--sig-*` content
  tokens. New stylesheet **`css/viz.css`** (`.sig-progress*` classes
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
  prop types, and the runtime chromatic guard in the viz source.

### 1.2.0 — GlobalNav

- **`<GlobalNav>`** — routing between views in Signature Style: a sticky
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
    `{ href, className: "sig-nav__link", children }`; the drawer links go
    through the same renderer.
  - **Mobile drawer** — `createPortal` to `document.body` (the modal.tsx
    architecture): it reuses the existing modal backdrop (z-40) as its
    scrim and the existing `.sig-modal-close` class for its close button
    (the Teal hover stays the close signature). Escape closes with a
    cleaned-up listener, backdrop click closes, drawer links close, and
    focus moves into the drawer on open / back to the hamburger on close.
  - New stylesheet **`css/nav.css`** (`.sig-nav*` classes), layered into
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

  const modal = useModal(); // or useModal<TimelineEvent>() for explicit typing

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
    are the title (`h2`), the close button, the `<SigBadge>` row, and
    flat label/value rows (Date / Time / About) — zero wrapper divs, even
    the header row is pure grid placement. The close button is muted
    `--text-muted` by default and hovers to `--color-cake-secondary`
    (Teal — structural chrome, Rule of Engagement untouched).
  - New stylesheet **`css/modal.css`** (`.sig-modal-*` classes,
    token-driven, zero box-shadow, `prefers-reduced-motion` respected,
    768px collapse), imported into the `cascade` layer after
    `timeline.css`. One documented exception to the token doctrine, by
    owner mandate: the backdrop scrim is the neutral
    `rgba(0, 0, 0, 0.6)` — a dimming layer must dim regardless of theme.
    `cascade.css` and `overrides.css` remain untouched — the structural
    freeze holds.
- **`<EventTimeline onEventSelect?>`** — new optional prop
  `(event: TimelineEvent) => void`. Timeline nodes are now real `<button>`
  elements (was `span`) with pointer cursor and the shared Flamingo
  focus ring; without the prop they render identically and simply do
  nothing on click. Nodes expose `aria-label` = the event title.
- **`TimelineEvent.description?`** — new optional field rendered as the
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
  Chromatic Palette): a chronological chromatic-events timeline for
  Signature Style.

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
        category: "--sig-peach", // --sig-* tokens only (type-enforced)
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
    (`.sig-timeline`) whose DIRECT children are date headers (`h2`),
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
    `--bg-surface` fill. Categories are CONTENT (chromatic tokens):
    `<SigBadge colorToken label>`. Titles wear `--text-main` weight
    500; times wear `--text-muted` mono at 0.875rem.
  - New stylesheet **`css/timeline.css`** (`.sig-timeline*` classes,
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
  import { ThemeProvider, Icon, EmptyState, SigBadge } from "@edwyn/signature-style/react";
  <Icon name="Rocket" />
  <EmptyState icon="PackageOpen" title="Nothing here" message="Add your first event." />
  <SigBadge colorToken="--sig-peach" label="Birthday" />
  ```

  - `<Icon name />` — strict lucide-react wrapper: `name` must be a real
    lucide icon name (typo = compile error), inherits `currentColor`,
    `strokeWidth` locked to 2 by default per Pillar 1 (overridable).
  - `<EmptyState icon title message />` — the Pillar 4 empty state as one
    `div.empty-state` (centered flex column, surface bg, hairline border);
    nothing else in the DOM.
  - `<SigBadge colorToken label />` — the Rule of Engagement at compile
    time: `colorToken` only accepts `--sig-*` tokens
    (`Extract<KnownToken, \`--sig-${string}\`>`); a structural token like
    `--color-cake-primary` is a type error, and a runtime guard
    warn-and-drops anything JS slips past the types. Renders ONE `<span>`
    with a subtle `color-mix` tint of the chromatic token and guaranteed
    high-contrast `--text-main` label on both themes.
- **lucide-react is an optional peer** — declared in
  `peerDependenciesMeta` as `optional: true`. CSS-only consumers never
  install icons; React consumers using `<Icon>`/`<EmptyState>` should add
  `lucide-react >= 0.400.0`.
- `exports["./react"]` now resolves to the umbrella `react/index.js`
  entry, re-exporting `ThemeProvider` alongside all three primitives.
  Tokens and token VALUES are unchanged — `TOKEN_KEYS` stays at 31; the
  structural freeze holds (`css/` is byte-identical to 0.4.0).

### 0.4.0 — Chromatic Palette

- **New token family: the Chromatic Palette** — ten theme-independent,
  content-reserved tokens, defined ONCE in `:root` and inherited by both
  Mocha and Latte untouched (theme-independent by design, so content wears
  the same chromatic colors on both sides of the toggle):

  | Token | Hex | Role |
  |---|---|---|
  | `--sig-pink-bright` | `#ea76cb` | badges, tag fills, event highlights |
  | `--sig-pink-soft` | `#f5bde6` | tag surfaces, avatar rings, soft calendar fills |
  | `--sig-pink-alt` | `#f4b8e4` | alternate pink for content categories |
  | `--sig-mauve-bright` | `#9e5ff2` | chart series, bold tags |
  | `--sig-mauve-soft` | `#cba6f7` | avatar dots, calendar blocks |
  | `--sig-lavender` | `#7287fd` | content links, calendar themes, data-viz series |
  | `--sig-sky` | `#04a5e5` | informational tags, data-viz series |
  | `--sig-blue` | `#89b4fa` | data-viz series, event themes |
  | `--sig-peach` | `#fe640b` | calendar block edges, attention tags |
  | `--sig-green` | `#a6d189` | status tags, positive data-viz series |

- **Rule of Engagement** — `--sig-*` tokens are reserved EXCLUSIVELY for
  content: badges, tags, avatars, event theme overrides, calendar blocks,
  data visualization. The Engine keeps Flamingo/Teal for ALL structural UI
  actions — buttons, inputs, focus rings. Never use `--sig-*` for
  structural chrome; never use Flamingo/Teal for content categories.
  The v0.3.0 structural UI is LOCKED and the release gate enforces it: a
  structural-freeze gate requires `git diff v0.3.0 -- css/cascade.css
  css/overrides.css` to be empty and the structural + Flamingo/Teal values
  in `tokens.css` to be unchanged.
- **Whitelist covers everything, chromatic included** — `TOKEN_KEYS` grows
  from 21 to 31 keys; `<ThemeProvider theme={…}>` now accepts every custom
  property in `css/tokens.css`, the chromatic tokens included. Guard logic is
  unchanged. Because chromatic tokens are whitelisted, a user can retheme
  their event content dynamically — for example changing their event
  theme's accent:

  ```tsx
  <ThemeProvider theme={{ "--sig-peach": "#ff8800" }}>
    <Calendar />
  </ThemeProvider>
  ```

- **Engine v2.4** — `SYSTEM_PROMPT.md` gains the "Chromatic Palette
  (Content-Only Tokens)" section listing all ten tokens plus the Rule of
  Engagement. The demo gains a compact "Chromatic Palette · content only"
  strip (all 10 swatches with muted mono names) plus three content chips:
  a `birthday` badge on `--sig-pink-bright` (text `--color-on-cake`), an
  avatar dot on `--sig-mauve-soft`, and a calendar block edged in
  `--sig-peach`.
- **Release gates** — verify now asserts the exact ten chromatic hexes in
  both `tokens.css` (`:root`, theme-independent) and `tokens.json`
  (`sigPalette` entries with `"reserved": true` and the content-only
  role), chromatic whitelist parity, and the v0.3.0 structural freeze.

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
npm run verify     # theme parity, per-theme signature hexes, retired-hex bans, whitelist parity, z-scale values, chromatic palette hexes + reserved flags, v0.3.0 structural freeze, bundle head, 3-path exports contract, provider hardening, timeline gates, modal gates, nav gates, viz gates
npm pack --dry-run # inspect the publishable tarball (expect 52 files)
```

## License

[MIT](./LICENSE) © 2026 edwyn
# signature-style
# signature-style
