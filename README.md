# @edwyn/signature-style

> One command. One import. Your entire personal UI theme — Linux-inspired minimalist, cake colors, zero manual hex codes.

`@edwyn/signature-style` installs edwyn's **Signature Style** into any project:
a dark, soft-grey foundation with vibrant pastel interactions, where every
hover, active, disabled and focus-visible state is *derived* from 8 core
tokens instead of hand-authored. It ships a zero-dependency CSS core, an
optional hardened React provider, a machine-readable token manifest, and the
**Dynamic Signature Engine v2.0** system prompt so AI agents can extend the
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

## The three doctrines

1. **Token Cascade** — one token in, four states out. Hover lightens
   (`color-mix … 85%, white`), active darkens (`… 85%, black`), disabled
   grays out (`--bg-surface` + `--text-muted`), focus rings with
   `--color-cake-secondary`. You never write a state hex code.
2. **Override Protocol** — scoped utilities (`.override-danger`,
   `.override-success`, `.override-gold`) that break the rules for ONE
   component locally. Never a `:root` edit. Overrides are the Golden Weapon.
3. **Progressive Enhancement** — a minimal, zero-dependency CSS core; the
   React provider is peer-dependency only; legacy browsers get a
   `filter: brightness()` fallback instead of broken states.

## Hardening

| ID | Vulnerability | Patch |
|---|---|---|
| VULN-1 | `color-mix()` unsupported → hover/active silently dead | `@supports not (color: color-mix(in srgb, red, blue))` block re-derives states via `filter: brightness(1.12)` / `brightness(0.88)` |
| VULN-2 | `@layer` fragility: unlayered host CSS beats layered CSS; layer-order races | `ThemeProvider` injects `@layer tokens, base, cascade, overrides;` as the FIRST style tag in `<head>` + `CSSLayerBlockRule` support warning; bundle declares the same order statically |
| VULN-3 | Provider FOUC, style-tag leaks, arbitrary prop injection | Isomorphic layout effect (`useLayoutEffect`/`useEffect`), `useId`-keyed deduped style tags, strict self-only cleanup, memoized serialization, token whitelist (8 keys, type + runtime), CSS-injection guard on values |

## Use this template

This repo doubles as a GitHub template: click **Use this template** to start
a new project that already speaks Signature Style — or install the package
into an existing one and keep the repo as the style's source of truth.

## Development

```sh
npm install
npm run build      # compile react/*.tsx → react/*.js (+ .d.ts)
npm run typecheck  # strict tsc, no emit
npm run verify     # token parity + export targets
npm pack --dry-run # inspect the publishable tarball
```

## License

[MIT](./LICENSE) © 2026 edwyn
