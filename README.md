# @carcolacha/signature-style

> One command installs **edwyn's Signature Style** into any project — a Catppuccin-harmonized design engine with three WCAG-verified surface themes, GPU-only motion, and 50+ production-ready components. Zero manual hex codes. Zero dependency bloat.

```bash
npx @carcolacha/signature-style init
```

---

## Why @carcolacha/signature-style Exists

- **Zero Dependency Bloat** — the CSS core, the web components, and the CLI run on nothing but the platform: no runtime deps, no CSS-in-JS engine, no polyfill carousel. The React library rides peer dependencies only; everything else is plain CSS custom properties and native browser APIs.

- **60fps GPU-Only Motion** — motion is a first-class citizen, not a garnish. Native `linear()` spring curves, FLIP-measured gliding indicators, and rAF-throttled pointer tracking animate **transform and opacity only** — `box-shadow` never animates (gate-enforced). Every effect stands down instantly under `prefers-reduced-motion`.

- **Optical 8px Grid & WCAG Contrast Discipline** — every spacing step snaps to the optical 8px grid, and every token pair is contrast-measured against its own theme's surface by the release gate. Ink tiers are documented, enforced, and re-measured on every run — no "looks fine to me" contrast.

- **AI-Ready Architecture** — the whole system is machine-readable by design: the `tokens.json` manifest, `/llms.txt` + `llms-full.txt` agent indexes, the `SYSTEM_PROMPT.md` style codex, and a standalone **MCP visual inspector** that gives AI sessions spatial awareness of the rendered app.

---

## What's Inside (The Cool Stuff)

### Full-Viewport Mind-Map & Tree Graph Studio

A knowledge-graph canvas that bypasses the page shell and runs edge-to-edge: **60fps pointer-events drag** (rAF-batched, measured), **right-click tethers** to link nodes, and three deterministic layout modes — **Tree** (tidy top-down), **Radial** (ring engine), and **Free** (drag anywhere). The **AI branch expansion** button grows four idea-nodes from any selection using a local, deterministic heuristic — no network, no API keys, same selection always yields the same branches. A floating HUD carries search (dims non-matches), zoom, and a live nodes/edges counter; the right-side inspector edits title, kind, a 16-swatch chromatic picker, tags, and notes. Everything persists to workspace storage.

**New in 4.1.0 — Graph Motion Layer:** the canvas now choreographs its own changes. New nodes **pop in on a spring** (scale 0.68 → 1, staggered 70ms per batch — an AI expansion arrives as a wave, each child landing as its parent wire **draws itself** across the canvas), and Delete Node / Reset Canvas **collapse out** through an exit spring instead of vanishing. Two engines, one rule: animejs draws the edges (`strokeDashoffset` only), motion/react springs the cards (`scale`/`opacity` only) — one engine per file, never a shadow/width/height keyframe anywhere, fully disabled under reduced motion.

Graphs export to a single portable workspace JSON — one click from the HUD, one command from the palette — and re-import intact: positions, tethers, tags, notes, and the active layout mode all ride along.

### 16-Color Harmonic Palette & 3 Themes

Sixteen chromatic tokens — cobalt, orchid, mint, crimson, and friends — layered over 100% official Catppuccin surfaces. Three verified themes, one attribute:

| Theme | Vibe | Attribute |
|---|---|---|
| **Catppuccin Mocha** | the dark default — warm surfaces, flamingo & teal accents | absent / `"mocha"` |
| **True OLED Black** | pure `#000000` base, chroma cranked by true black | `"oled"` |
| **High-Contrast Daylight** | computed ink variants, each WCAG-measured on white | `"daylight"` |

```html
<html data-sig-theme="oled">
```

Geometry is an orthogonal axis: `data-sig-radius="standard"` (8px-grid-pure) or `"sharp"` (brutalist). Every theme's contrast table is part of the automated release gate — the tokens can't drift into illegibility.

Theming is scoped by construction: the theme blocks are plain attribute selectors, so any wrapper element can re-theme just its subtree — stage a component in OLED black inside a Mocha page and both stay pixel-correct.

### GPU Kinetic Engine & Motion Lab

The motion system is built from native browser primitives — **`linear()` spring easings** with cubic-bezier fallbacks, a time-dilation variable that re-times the whole system, and zero external animation libraries. The toolkit: **aurora border beams** (conic-gradient masked rings, never box-shadow), **3D cursor tilt** surfaces with a riding sheen, **FLIP gliding tabs** that measure-and-invert instead of teleporting, spring-interpolated number rolls, staggered entrance waves, and SVG line sweeps. The **Motion Lab** stages it all live — six interactive showcases with per-card triggers and a **quarter-speed Slow-Mo scrubber** so you can study every beat frame by frame.

### 50+ Bento Components & App Blueprints

Fifty-plus React components across an 8-set pattern taxonomy — bento grids, surface cards, ergonomic forms, telemetry charts, timelines, editorial blocks, feedback systems — plus six zero-React web components. Two **human-crafted app blueprints** scaffold entire pages: the **competitive telemetry dashboard** (live rating rolls, role-mastery bars, filterable match history) and the **interactive micro-lab** (reaction-time test, flip-card prompt deck, focus-rhythm waveform). Everywhere you look: **3D flip cards**, **expanding accordions** (true `0fr → 1fr` height animation), **zoomable stat rings**, spring detents, status beacons, and waveform equalizers.

### Multi-Framework Delivery

The same style ships four ways:

- **React library** — `@carcolacha/signature-style/react`, peer-dependency only, SSR-safe `ThemeProvider` with a compile-time token whitelist.
- **Zero-React web components** — `<sig-surface-card>`, `<sig-badge>`, `<sig-progress-bar>`, `<sig-stat-ring>`, `<sig-callout>`, `<sig-carousel>` for Vue, Svelte, plain HTML, and any-stack agents.
- **Interactive CLI scaffolder** — `npx @carcolacha/signature-style init` detects your framework (Next, Vite, plain HTML) and writes tokens + starters with safe injection (existing files are never clobbered without `--force`).
- **Standalone Playwright MCP visual auditor** — `packages/signature-mcp` serves four tools (`inspect_layout`, `audit_contrast`, `audit_e1_shadows`, `capture_viewport_matrix`) so AI sessions can see layout boxes, measure real WCAG ratios, and audit the motion treaty at runtime.

Four import paths, one mental model:

| Import | Resolves to | Peers needed |
|---|---|---|
| `@carcolacha/signature-style` | `tokens.json` — the machine-readable manifest | never |
| `@carcolacha/signature-style/css` | the compiled CSS bundle: tokens, base, cascade, overrides | never |
| `@carcolacha/signature-style/react` | the component library + `ThemeProvider` | `react` + `react-dom` (`lucide-react` optional) |
| `@carcolacha/signature-style/wc` | the six zero-React custom elements + their types | never (link the CSS once for tokens) |

---

## 30-Second Quick Start

### CLI Init

```bash
npx @carcolacha/signature-style init --template bento --theme oled --yes
```

Writes `signature-tokens.css` (your resolved theme) plus a framework-adaptive starter — Next, Vite, or plain HTML. Re-run with `--theme daylight --force` to re-theme.

| Flag | Values | What it does |
|---|---|---|
| `--template` | `minimal` \| `bento` \| `telemetry` \| `microlab` | tokens only, or tokens + a starter, or a full-page blueprint |
| `--theme` | `mocha` \| `oled` \| `daylight` | which surface theme is resolved into the tokens |
| `--dir` | any path | target directory (created when missing) |
| `--force` | — | overwrite existing generated files |
| `--yes` | — | skip the interactive prompts (CI-safe) |

### React Usage

```tsx
import "@carcolacha/signature-style/css";
import { ThemeProvider, SigBadge } from "@carcolacha/signature-style/react";

export function Root() {
  return (
    <ThemeProvider>
      <SigBadge label="Shipped" variant="green" />
    </ThemeProvider>
  );
}
```

One import themes everything; the provider claims the CSS layer order before anything else renders. Pass `theme={{ "--sig-cobalt": "#89b4fa" }}` to override any of the 60 tokens.

### Zero-React Web Component Usage

```html
<link rel="stylesheet" href="node_modules/@carcolacha/signature-style/css/signature-style.css" />
<script type="module">
  import "@carcolacha/signature-style/wc";
</script>

<sig-stat-ring value="85" accent-token="--sig-cobalt" show-value="true"></sig-stat-ring>
<sig-badge label="Confirmed" variant="green"></sig-badge>
```

One module import registers all six elements; the `--sig-*` custom properties inherit straight through shadow DOM — no per-element wiring, ever.

> **Go deeper:** the human-readable component manual lives in [STORYBOOK.md](./STORYBOOK.md); the machine-readable indexes for AI agents are [`llms.txt`](./playground/public/llms.txt), `llms-full.txt`, and [SYSTEM_PROMPT.md](./SYSTEM_PROMPT.md).

---

## Repository Map

| Path | What lives there |
|---|---|
| **package root** — `tokens.json`, `css/`, `react/` | the engine: the machine-readable token manifest, the compiled zero-dependency CSS core, the React component library |
| **`playground/`** | the live showcase: 9 views — Graph Studio, Motion Lab, Templates Studio, Pattern Lab, Analytics & Planner, and friends — plus the MCP probes and gate scripts |
| **`packages/signature-mcp/`** | the standalone MCP visual auditor: four Playwright-powered tools for layout, contrast, motion-treaty, and viewport-matrix inspection |
| **`examples/fastapi-starter/`** | the reference backend: a runnable FastAPI + SQLite workspace API (dev-only — never shipped in the npm package) |
| **`wc/` + `dist/wc/`** | the zero-React custom elements: sources plus the shipped, auditable ESM bundle and its type declarations |

---

## Accessibility & License

- **Keyboard-first** — every interactive element is reachable; visible focus rings ride a doctrine halo; `?` opens the full keyboard map; Tab is trapped (and released) inside modals; the graph canvas, carousels, and command palette are fully keyboard-driven.
- **Reduced-motion compliance** — every animation, spring, and entrance checks `prefers-reduced-motion` (plus an explicit `data-sig-motion="reduced"` override) and collapses to instant, static states. No exceptions.
- **Real semantics, not decorations** — `aria-selected` tablists, `aria-valuenow` progress bars and rings, `role="status"` live regions for toasts, `inert` hidden flip-card faces, and label-in-text accessible names (the WCAG label-in-text criterion) on every icon button.
- **Contrast you can audit** — ink tiers are documented per token, per theme, and re-measured by the contrast gate on every release; the a11y certification walks every playground view with axe-core and keyboard tab-walks.
- **MIT** — free to use, fork, and ship. See [LICENSE](./LICENSE).
