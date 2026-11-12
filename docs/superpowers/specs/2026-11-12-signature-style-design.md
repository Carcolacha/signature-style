# Signature Style v1 — Design Spec

**Date:** 2026-11-12
**Author:** edwyn (design), Scout (plan), Ivan (implementation)
**Status:** Approved

## Intent

Package edwyn's personal "Signature Style" UI theme — a Linux-inspired
minimalist aesthetic built on deep soft greys and vibrant pastel "cake
colors" — so that any project (and any AI coding agent) can install and
apply it with one command, and so the style survives contact with real
production environments.

## Goals

- **G1.** `npm i @edwyn/signature-style` + one CSS import installs the whole theme.
- **G2.** Token Cascade: hover / active / disabled / focus-visible states are
  *derived* from the core tokens. The user never writes a state hex code.
- **G3.** Override Protocol: scoped utility classes that break the rules
  locally, without ever mutating global tokens.
- **G4.** Progressive Enhancement: minimal, zero-dependency CSS core; React
  provider is optional and peer-dependent only.
- **G5.** Ships its own AI system prompt (Dynamic Signature Engine v2.0) so
  agents can reproduce the style in generated code.
- **G6.** Works as a GitHub "Use this template" repo.

## Non-goals

- No CSS-in-JS runtime, no PostCSS build step, no styling of application
  layout (grid/flex helpers).
- No framework components beyond the single React provider.
- No light/dark mode switching in v1 (theme is dark-first).
- No per-token theming API beyond `ThemeProvider` overrides in v1.

## Chosen approach: C — npm package + GitHub template

Alternatives considered:

- **A. Copy-paste snippet / gist** — rejected: no versioning, no hardening,
  drifts between projects.
- **B. Framework plugin (Next/Vite only)** — rejected: locks the style to one
  ecosystem, violates Progressive Enhancement.
- **C. npm package + template repo (chosen)** — versioned, installable
  anywhere CSS loads, template-able for new projects, and can ship the AI
  system prompt as a package export.

## The aesthetic

A Linux-inspired minimalist environment built for human eye comfort:
deep, soft greys for structure; vibrant pastels for interaction; deliberate,
ergonomic, handcrafted — never generic.

## Core design tokens (EXACT values — do not alter)

| Token | Value | Meaning |
|---|---|---|
| `--bg-base` | `#1E1E2E` | Linux terminal deep grey |
| `--bg-surface` | `#282A36` | Elevated grey |
| `--color-cake-primary` | `#FFB7B2` | Pastel strawberry |
| `--color-cake-secondary` | `#E2F0CB` | Soft matcha green |
| `--text-main` | `#F8F8F2` | Low-fatigue off-white |
| `--text-muted` | `#6272A4` | Dimmed text |
| `--radius-ui` | `6px` | Minimalist corners |
| `--transition-standard` | `all 0.3s ease-in-out` | Deliberate motion |

## Layer architecture

One canonical declaration, always first:

```css
@layer tokens, base, cascade, overrides;
```

`tokens` (custom properties) < `base` (reset floor) < `cascade` (derived
states) < `overrides` (the Golden Weapon). Unlayered CSS outranks everything,
which is exactly why host CSS must never write `:root` tokens outside the
`tokens` layer — enforced by `scripts/verify.mjs`.

## Cascade mechanics (Token Cascade)

- hover = `color-mix(in srgb, <token> 85%, white)` (lighten)
- active = `color-mix(in srgb, <token> 85%, black)` (darken)
- disabled = `--bg-surface` background + `--text-muted` text + `cursor: not-allowed`
- focus-visible = `2px solid var(--color-cake-secondary)` outline, offset 2px
- every interactive element carries `var(--transition-standard)`

## Override Protocol

`.override-danger`, `.override-success`, `.override-gold` — scoped utilities
in the `overrides` layer. Doctrine: **Overrides are the Golden Weapon: they
alter ONE component locally. NEVER add a rule that touches `:root`.** Each
override carries its own derived states so the cascade's states cannot bleed
through from lower layers.

## Production hardening (approved addendum — REQUIRED)

| ID | Vulnerability | Patch |
|---|---|---|
| **VULN-1** | `color-mix()` unsupported → hover/active silently dead (invalid at parse time) | `cascade.css` gains `@supports not (color: color-mix(in srgb, red, blue))` block re-deriving the same states via `filter: brightness(1.12)` / `brightness(0.88)` |
| **VULN-2** | `@layer` fragility: unlayered host CSS beats all layered CSS; layer-order declaration races | `ThemeProvider` injects the canonical layer-order declaration as the FIRST style tag in `<head>` at runtime; plus runtime guard `if (typeof window !== 'undefined' && !('CSSLayerBlockRule' in window)) console.warn(...)`; bundle also declares order statically first |
| **VULN-3** | `ThemeProvider` FOUC + style-tag leak + arbitrary prop injection | SSR-safe isomorphic layout effect (`useLayoutEffect` when `window` exists, `useEffect` otherwise); style element keyed by `useId` with dedup; strict unmount cleanup removing only its own node; memoized theme serialization; token whitelist — only the 8 known keys accepted (type level AND runtime); unknown keys `console.warn`'d and dropped; injection-capable values rejected |

## Acceptance criteria (v1)

1. `demo/index.html` renders opened directly from `file://` (relative CSS link, no server needed).
2. `npx tsc --noEmit` passes on `ThemeProvider` with strict mode.
3. `node scripts/verify.mjs` prints `PASS` (token parity + export targets exist).
4. `npm pack --dry-run` includes `css/`, `react/`, `tokens.json`, `SYSTEM_PROMPT.md`.
5. No rule in `css/` writes to `:root` outside `@layer tokens`.
6. One commit per task (9 commits), tag `v0.1.0` exists.
