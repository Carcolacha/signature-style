# Signature Style v1 — Implementation Plan

**Date:** 2026-11-12
**Repo:** greenfield at `DesigningStyleProject/` — empty, not yet a git repo.
**Constraints:** do NOT touch `../space`; do NOT push (no remote exists).
Spec: [`docs/superpowers/specs/2026-11-12-signature-style-design.md`](../superpowers/specs/2026-11-12-signature-style-design.md)

## Task 0 — Scaffold
`git init -b main`. `package.json` (`@carcolacha/signature-style` 0.1.0, type module,
exports map for `.`, `./tokens.css`, `./cascade.css`, `./overrides.css`,
`./tokens.json`, `./system-prompt.md`, `./react` with types/import/default;
peerDeps react >=18; devDeps typescript + @types/react + @types/react-dom),
`LICENSE` (MIT 2026 edwyn), README stub, `.gitignore`, this plan + the spec doc.
**Commit:** `chore: scaffold signature-style v1`

## Task 1 — Tokens
`css/tokens.css` (`@layer tokens { :root { ...8 tokens... } }`) +
`tokens.json` (meta + name/value/description per token).
**Commit:** `feat: core design tokens (css + json)`

## Task 2 — Token Cascade
`css/cascade.css` in `@layer cascade`: `.btn-primary`, `.btn-secondary`,
inputs, generic `[data-cascade]` hook; hover/active via `color-mix`,
disabled gray-out, focus-visible ring, transitions everywhere; VULN-1
`@supports not (color: color-mix(...))` fallback with `filter: brightness()`.
Header comment: the Cascade doctrine.
**Commit:** `feat: token cascade with color-mix + legacy fallback`

## Task 3 — Override Protocol
`css/overrides.css` in `@layer overrides`: `.override-danger`, `.override-success`,
`.override-gold` (gradient + background-size shine), each with own derived
states + shared ring/disabled. STRICT doctrine comment: never touch `:root`.
**Commit:** `feat: override protocol scoped utilities`

## Task 4 — Bundle
`css/signature-style.css`: layer-order declaration first, `@import`s, inline
minimal `@layer base` (box-sizing, body colors, reduced-motion).
**Commit:** `feat: one-line bundle import`

## Task 5 — ThemeProvider.tsx (hardened)
`react/ThemeProvider.tsx` + `react/index.ts`: TOKEN_KEYS whitelist (VULN-3,
type + runtime), isomorphic layout effect, useId-keyed deduped style tag with
strict self-cleanup, memoized serialization, first-in-head layer-order tag
(VULN-2) + `CSSLayerBlockRule` guard warn. `npx tsc --noEmit --jsx react-jsx
--strict --moduleResolution bundler --target es2020 --lib dom,es2020` must be
clean (devDeps installed first). Commit compiled `.js`/`.d.ts` alongside sources.
**Commit:** `feat: hardened ThemeProvider (SSR-safe, leak-proof, layer-order injection)`

## Task 6 — System prompt
`SYSTEM_PROMPT.md` = Dynamic Signature Engine v2.0 instruction, VERBATIM.
**Commit:** `feat: dynamic signature engine v2.0 system prompt`

## Task 7 — Demo
`demo/index.html`: zero build, relative `../css/signature-style.css` (file://
AND `npx serve`), buttons row (primary/secondary/disabled/overrides), palette
swatches (6 colors, hex in muted monospace), cascade section with
auto-generated-states note. Max-width ~720px, radius 6px, system fonts.
**Commit:** `feat: zero-build living demo`

## Task 8 — README + verify
Full README (install, CSS usage, React usage, three doctrines, hardening
table, template note, license). `scripts/verify.mjs`: (a) tokens.json keys
=== 8 var names in tokens.css; (b) every package.json export target exists.
`node scripts/verify.mjs` → PASS; `npm pack --dry-run` → all exports, no junk.
**Commit:** `docs: readme, verify script, v0.1.0 ready` → **tag `v0.1.0`**

## Acceptance criteria
1. demo works from `file://` (relative link, no server needed)
2. strict `tsc --noEmit` clean on ThemeProvider
3. `node scripts/verify.mjs` prints PASS
4. `npm pack --dry-run` includes css/, react/, tokens.json, SYSTEM_PROMPT.md
5. no `:root` rule in css/ outside `@layer tokens`
6. 9 commits (one per task), tag `v0.1.0`
