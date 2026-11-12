# @edwyn/signature-style

> One command. One import. Your entire personal UI theme — Catppuccin-mapped, cake colors, zero manual hex codes.

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

## CSS usage — one import

```html
<link rel="stylesheet" href="node_modules/@edwyn/signature-style/css/signature-style.css" />
```

or with a bundler:

```js
import "@edwyn/signature-style"; // → css/signature-style.css
```

Individual layers are also exported: `@edwyn/signature-style/tokens.css`,
`/cascade.css`, `/overrides.css`, plus the token manifest `/tokens.json` and
the AI prompt `/system-prompt.md`.

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
font/radius/transition/spacing tokens, the z-index scale, and the ten
`--party-*` content tokens (31 keys, typed at compile time and enforced at
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
| VULN-3 | Provider FOUC, style-tag leaks, arbitrary prop injection | Isomorphic layout effect (`useLayoutEffect`/`useEffect`), `useId`-keyed deduped style tags, strict self-only cleanup, memoized serialization, token whitelist (all 31 tokens, type + runtime), CSS-injection guard on values |

## Changelog

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

This repo doubles as a GitHub template: click **Use this template** to start
a new project that already speaks Signature Style — or install the package
into an existing one and keep the repo as the style's source of truth.

## Development

```sh
npm install
npm run build      # compile react/*.tsx → react/*.js (+ .d.ts)
npm run typecheck  # strict tsc, no emit
npm run verify     # theme parity, per-theme signature hexes, retired-hex bans, whitelist parity, z-scale values, party palette hexes + reserved flags, v0.3.0 structural freeze, bundle head, exports, provider hardening
npm pack --dry-run # inspect the publishable tarball
```

## License

[MIT](./LICENSE) © 2026 edwyn
