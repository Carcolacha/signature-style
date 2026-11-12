# @edwyn/signature-style

> One command. One import. Your entire personal UI theme — Catppuccin-mapped, cake colors, zero manual hex codes.

`@edwyn/signature-style` installs edwyn's **Signature Style** into any project:
a **hybrid** foundation — Catppuccin structure for backgrounds and text
(**Mocha (dark) by default, Latte (light) on request**) with the owner's
**exact custom cake colors** driving every interaction — where every hover,
active, disabled and focus-visible state is *derived* from the core tokens
instead of hand-authored. It ships a zero-dependency CSS core, an optional
hardened React provider, a machine-readable token manifest, and the
**Dynamic Signature Engine v2.2** system prompt so AI agents can extend the
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

As of 0.2.1 the whitelist covers **every** custom property in
`css/tokens.css` — the core 6, the keeper tokens, and the shared
font/radius/transition/spacing tokens (18 keys, typed at compile time and
enforced at runtime):

```tsx
<ThemeProvider
  theme={{
    "--color-cake-primary": "#FFB7B2", // signature Pastel Strawberry
    "--bg-inset": "#282A36",           // keeper — inset wells, code blocks
    "--space-standard": "1rem",        // 8px grid tier 2
  }}
>
  <App />
</ThemeProvider>
```

Guard logic is unchanged: values containing `{`, `}`, `;` or `\` are warned
and dropped; unknown keys are warned and dropped.

> **Documented tradeoff (owner-mandated):** the signature cakes
> (`#FFB7B2` / `#E2F0CB`) are the exact same hexes in both themes, so focus
> rings and primary surfaces run pale on the Latte light theme. Deliberate.

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
| VULN-3 | Provider FOUC, style-tag leaks, arbitrary prop injection | Isomorphic layout effect (`useLayoutEffect`/`useEffect`), `useId`-keyed deduped style tags, strict self-only cleanup, memoized serialization, token whitelist (all 18 tokens, type + runtime), CSS-injection guard on values |

## Changelog

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
npm run verify     # theme parity, signature hexes, retired-hex ban, whitelist parity, bundle head, exports, provider hardening
npm pack --dry-run # inspect the publishable tarball
```

## License

[MIT](./LICENSE) © 2026 edwyn
