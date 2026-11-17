# Signature Style · Cake Edition — The Official Manual

> The human interface to **@carcolacha/signature-style**: what it looks like, why it looks that way, and how to build with it — written for teammates, not for compilers.

**Version:** `v1.1.0` — *"Storybook — The Human Interface"* · ships as documentation alongside the `@carcolacha/signature-style@1.0.0+` export surface (`.`, `./css`, `./react`). No code changed in this release — and that is the point: the system below is stable enough to be read like a book.

---

## 1. The Core Philosophy

Signature Style is a **Catppuccin-mapped minimalist environment built for human eye comfort, inspired by a Linux terminal's calm.** Four ideas hold the whole system together:

**Catppuccin Mocha structure, cake interactions.** The structural world — backgrounds, surfaces, text — is 100% official Catppuccin Mocha: soft dark blues that never stab at your eyes. On top of that calm lives the owner's signature: two pastel "cake" accents, **Mocha Flamingo** (`#F2CDCD`) and **Mocha Teal** (`#94E2D5`), that own every interactive moment — buttons, focus rings, timeline nodes. Harmony is mathematical by construction: each theme wears its own palette's official pairing, so contrast is correct on both sides of the light toggle without a single hand-tuned hex.

**Eye comfort is a feature, not an accident.** Deep, soft greys for surfaces; a low-fatigue off-white (`#CDD6F4`, never pure `#FFFFFF`) for text; muted greys for everything secondary. Long sessions in this theme should feel like working in a dim, quiet room — nothing glows, nothing shouts.

**Linux minimalism.** Surfaces are separated by **hairline 1px borders** (`1px solid color-mix(in srgb, var(--text-muted) 20%, transparent)`) — never drop shadows. There are **zero shadows and zero gloss** anywhere in the package: flat panels, thin rules, 6px corners (`--radius-ui`). If an element looks like it is floating, it is wrong; it should look like it is *drawn*.

**The 8px spatial grid.** All spacing comes from three tokens — `--space-tight` (0.5rem), `--space-standard` (1rem), `--space-section` (1.5rem) — and no magic numbers. When in doubt, take the larger tier: **err on breathing room.** Maximize negative space; a crowded layout is a bug.

**Mechanical animation physics.** Motion is a machine, not a toy — snappy and exact, with **no bounce, no overshoot, no elastic easing**:

| What moves | Token | Physics |
|---|---|---|
| Colors & opacity | `--transition-standard` | `all 0.15s ease-out` — instant to start, fast to settle |
| Transforms | `--transition-transform` | `transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)` — smooth arrival |
| The press | `:active` | `transform: scale(0.97)` — a tactile, mechanical click |

And one humane rule above the physics: **motion is a gift, not a requirement** — everything respects `prefers-reduced-motion`.

---

## 2. The Color Glossary

Every color in the system is a CSS custom property defined in `css/tokens.css`. Nobody ever writes a hex in a component — you consume the token, and the four interaction states (hover, active, disabled, focus) are *derived* for you.

### Table 1 — Structural tokens (the room you're in)

The quiet Mocha surfaces and text. These are the walls, desks, and ink of the interface.

| Swatch | Token | Hex | Use it for |
|---|---|---|---|
| <span style="background:#1E1E2E;display:inline-block;width:1em;height:1em;border-radius:4px"></span> | `--bg-base` | `#1E1E2E` | App & page backgrounds — Mocha base |
| <span style="background:#313244;display:inline-block;width:1em;height:1em;border-radius:4px"></span> | `--bg-surface` | `#313244` | Cards, sidebars, modals, inputs, disabled surfaces |
| <span style="background:#282A36;display:inline-block;width:1em;height:1em;border-radius:4px"></span> | `--bg-inset` ★ | `#282A36` | Wells, code blocks, input interiors |
| <span style="background:#CDD6F4;display:inline-block;width:1em;height:1em;border-radius:4px"></span> | `--text-main` | `#CDD6F4` | Primary text — the low-fatigue off-white |
| <span style="background:#F8F8F2;display:inline-block;width:1em;height:1em;border-radius:4px"></span> | `--text-bright` ★ | `#F8F8F2` | Emphasis text, headings |
| <span style="background:#7F849C;display:inline-block;width:1em;height:1em;border-radius:4px"></span> | `--text-muted` | `#7F849C` | Secondary text — subtitles, hints, disabled labels |
| <span style="background:#6272A4;display:inline-block;width:1em;height:1em;border-radius:4px"></span> | `--text-muted-soft` ★ | `#6272A4` | Tertiary text, quiet captions |

> ★ **Keeper tokens** — beloved colors carried over from the original signature palette, each given a permanent semantic job. They survive every edition unchanged.

### Table 2 — Interactive tokens (the way it talks back)

The cake accents. These own **all structural UI**: buttons, inputs, focus rings, chrome.

| Swatch | Token | Hex | Use it for |
|---|---|---|---|
| <span style="background:#F2CDCD;display:inline-block;width:1em;height:1em;border-radius:4px"></span> | `--color-cake-primary` | `#F2CDCD` | **Mocha Flamingo** — primary actions, focus rings, timeline node rings |
| <span style="background:#94E2D5;display:inline-block;width:1em;height:1em;border-radius:4px"></span> | `--color-cake-secondary` | `#94E2D5` | **Mocha Teal** — success/secondary accents, close-button hover |
| <span style="background:#1E1E2E;display:inline-block;width:1em;height:1em;border-radius:4px"></span> | `--color-on-cake` | `#1E1E2E` | Text & icons placed *on* cake-colored surfaces |
| <span style="background:#A8E6CF;display:inline-block;width:1em;height:1em;border-radius:4px"></span> | `--color-success` ★ | `#A8E6CF` | Success actions |

> ★ Keeper token — see the note above Table 1.

### Table 3 — The Chromatic Palette (content-only, all ten)

Ten theme-independent colors reserved **exclusively for content** — badges, tags, avatars, event theme overrides, calendar blocks, data-viz. They are defined once in `:root` and inherited by both themes untouched, so a badge wears the same chromatic color on both sides of the toggle. *Never* use them for structural chrome (see §4).

| Swatch | Token | Hex | Reserved usage |
|---|---|---|---|
| <span style="background:#ea76cb;display:inline-block;width:1em;height:1em;border-radius:4px"></span> | `--sig-pink-bright` | `#ea76cb` | Badges, tag fills, event highlights |
| <span style="background:#f5bde6;display:inline-block;width:1em;height:1em;border-radius:4px"></span> | `--sig-pink-soft` | `#f5bde6` | Tag surfaces, avatar rings, soft calendar fills |
| <span style="background:#f4b8e4;display:inline-block;width:1em;height:1em;border-radius:4px"></span> | `--sig-pink-alt` | `#f4b8e4` | Alternate pink for content categories |
| <span style="background:#8839ef;display:inline-block;width:1em;height:1em;border-radius:4px"></span> | `--sig-mauve-bright` | `#8839ef` | Chart series, bold tags |
| <span style="background:#cba6f7;display:inline-block;width:1em;height:1em;border-radius:4px"></span> | `--sig-mauve-soft` | `#cba6f7` | Avatar dots, calendar blocks |
| <span style="background:#7287fd;display:inline-block;width:1em;height:1em;border-radius:4px"></span> | `--sig-lavender` | `#7287fd` | Content links, calendar themes, data-viz series |
| <span style="background:#04a5e5;display:inline-block;width:1em;height:1em;border-radius:4px"></span> | `--sig-sky` | `#04a5e5` | Informational tags, data-viz series |
| <span style="background:#1e66f5;display:inline-block;width:1em;height:1em;border-radius:4px"></span> | `--sig-blue` | `#1e66f5` | Data-viz series, event themes |
| <span style="background:#fe640b;display:inline-block;width:1em;height:1em;border-radius:4px"></span> | `--sig-peach` | `#fe640b` | Calendar block edges, attention tags |
| <span style="background:#a6d189;display:inline-block;width:1em;height:1em;border-radius:4px"></span> | `--sig-green` | `#a6d189` | Status tags, positive data-viz series |

> Swatch legend: each chip is a tiny inline-styled square — rendered in color by Markdown viewers that allow inline styles (GitHub included), and silently skipped elsewhere. The hex column is always there, so nothing is lost.

### The Latte counterparts (light theme)

Opt in with `<html data-theme="latte">`. The light theme is 100% official Catppuccin Latte — and per the **Harmonized Doctrine**, each theme wears its *own* palette's official Flamingo/Teal pairing (no cross-theme imports):

| Family | Mocha (dark, default) | Latte (light) |
|---|---|---|
| Signature accents | Flamingo `#F2CDCD` · Teal `#94E2D5` | Flamingo `#DD7878` · Teal `#179299` |
| Structure | base `#1E1E2E` · surface `#313244` | base `#EFF1F5` · surface `#CCD0DA` |
| Chromatic tokens | ten `--sig-*` values | *unchanged* — content keeps the same colors |

---

## 3. The Primitive Component API

All components live under one import: `import { … } from "@carcolacha/signature-style/react"`. Every one renders the flattest possible DOM — that's the Pruning Protocol at work (§4).

### `<Icon>` — the strictly typed icon

Wraps **lucide-react** so that a typo (`name="Wrenchh"`) is a compile error, not a blank square at runtime. Color is inherited (`stroke="currentColor"`), and the stroke width is locked to **2** by default — the 2px stroke matches Inter weight 500 exactly — but stays overridable per instance.

```ts
interface IconProps extends Omit<LucideProps, "ref"> {
  name: IconName; // keyof typeof icons — any real lucide icon name
}
```

```tsx
<Icon name="Rocket" size={16} />
```

**Renders:** a bare `<svg>` — no wrapper element.

### `<EmptyState>` — the Pillar 4 empty state

One centered card for "there is nothing here yet": an `aria-hidden` icon, an optional high-contrast title, and a muted message. Used automatically by `<EventTimeline>` for empty input.

```ts
interface EmptyStateProps {
  icon: IconName;
  title?: string;
  message: string;
}
```

```tsx
<EmptyState icon="PackageOpen" title="Nothing here" message="Add your first event." />
```

**Renders:** `div.empty-state` → `svg[aria-hidden]` + `strong` + `p` — one div, nothing else.

### `<SigBadge>` — the Rule of Engagement, enforced by the compiler

A chromatic-colored content badge: a subtle tinted background of the chosen `--sig-*` token with a guaranteed high-contrast label on both themes. `colorToken` **only** accepts `--sig-*` tokens — handing it a structural token like `--color-cake-primary` fails at compile time, and a runtime guard warn-and-drops anything plain JavaScript slips past the types (rendering `null`).

```ts
interface SigBadgeProps {
  colorToken: SigTokenName; // Extract<KnownToken, `--sig-${string}`> — chromatic tokens ONLY
  label: string;
}
```

```tsx
<SigBadge colorToken="--sig-peach" label="Birthday" />
```

**Renders:** exactly one `<span>`.

### The compositions

Two bigger pieces build on the primitives — they are components, not primitives, and they never receive new CSS files without their own layer in the bundle.

> **3.9.0 note — the ring is an enum.** `<StatRing>`'s `size` prop takes
> `"sm" | "md" | "lg"` (88 / 128 / 168 px, default `"md"`) — the bare
> number is retired, and css/viz.css pins the dial with `aspect-ratio:
> 1/1; flex-shrink: 0` so no flex row can stretch it. The same release
> adds four kinetic primitives (`AuroraBorderCard`, `TiltSurface`,
> `StatusBeacon`, `WaveformBars`) and the full-viewport Graph Studio's
> tree/radial layout engine — see the README's 3.9.0 chapter and the
> Motion Lab (`#/motion`) for the live anatomy.

#### `<EventTimeline>` — the chronological event timeline

A flat CSS Grid: one container (`.sig-timeline`) whose **direct children** are date headers (`h2`), node circles, and event content blocks — no row wrappers, and the vertical line is the container's `::before` pseudo-element, never a div. Desktop events alternate left/right around a center line; at **max-width 768px** the line moves to the far left and everything stacks right (pure CSS, no JS breakpoint). Sticky date headers pin at `z-index: var(--z-sticky)` (10) with opaque backgrounds, and content scrolls beneath them. An empty `events` array renders `<EmptyState icon="CalendarX">` immediately — no line, no chrome.

```ts
interface TimelineEvent {
  id: string;
  date: string;            // display string, e.g. "October 2026"
  dateKey?: string;        // explicit grouping bucket, e.g. "2026-10"
  time?: string;
  title: string;
  category: SigTokenName; // --sig-* tokens only (Rule of Engagement)
  categoryLabel: string;
  icon?: IconName;          // defaults to "Circle"
  description?: string;     // becomes the modal's "About" row
}

interface EventTimelineProps {
  events: TimelineEvent[];       // chronological; group & event order preserved
  onEventSelect?: (event: TimelineEvent) => void; // nodes are <button>s
}
```

```tsx
<EventTimeline events={events} onEventSelect={modal.open} />
```

#### `useModal()` + `<EventModal>` — the Event Detail overlay

`useModal<T>()` is the minimal selection state behind the overlay — two `useState` values plus stable callbacks (safe to hand straight to `onEventSelect`). `<EventModal>` portals to `document.body`, so the Pillar 3 z-scale rules the stacking: the backdrop sits at `z-index: var(--z-overlay)` (40) with the neutral `rgba(0, 0, 0, 0.6)` scrim (the package's single documented non-token color), and the card at `z-index: var(--z-modal)` (50). The card is `role="dialog"` with `aria-modal="true"` and the event title as its label; it closes on **Escape**, on **backdrop click**, or via the close button — which is muted by default and hovers to **Teal**. Clicks inside the card do *not* close it. When `open` is false it renders nothing at all — no hidden chrome in the DOM.

```ts
function useModal<T>(): {
  isOpen: boolean;
  selectedEvent: T | null;   // survives close()
  open: (event: T) => void;  // stable identity
  close: () => void;         // stable identity
};

interface EventModalProps {
  event: TimelineEvent;
  open: boolean;   // typically modal.isOpen — false renders nothing
  onClose: () => void;
}
```

The full composition, straight from the README:

```tsx
import { EventTimeline, EventModal, useModal } from "@carcolacha/signature-style/react";

const modal = useModal<TimelineEvent>();

<EventTimeline events={events} onEventSelect={modal.open} />
{modal.selectedEvent !== null && (
  <EventModal event={modal.selectedEvent} open={modal.isOpen} onClose={modal.close} />
)}
```

#### `<ThemeProvider>` — the runtime half

Renders children and injects your token overrides into `@layer tokens`. Its whitelist covers all **31** custom properties in `css/tokens.css` (the core 6, the keepers, the shared tokens, the z-scale, and the ten chromatic tokens). Unknown keys are warned and dropped; values containing `{`, `}`, `;` or `\` are rejected — CSS injection has no seat at this table. It also claims the canonical `@layer` order as the first style tag in `<head>`, so host CSS can never win a layer-order race.

```ts
interface ThemeProviderProps {
  theme?: ThemeOverrides; // Partial<Record<KnownToken, string>>
  children?: ReactNode;
}
```

```tsx
<ThemeProvider theme={{ "--color-cake-primary": "#FFD1DC" }}>
  <App />
</ThemeProvider>
```

---

## 4. The Rules of Engagement

### (a) The Pruning Protocol — subtract by default

Before writing a line of code, ask what line you can *delete* instead. Three mandates:

1. **Subtract by default** — you are authorized and encouraged to delete redundant code. Subtraction is a feature.
2. **DOM Flattening** — never use a wrapper `<div>` if Flexbox or Grid on the parent can do the same job. If an element looks identical without a wrapper, the wrapper dies.
3. **Minimalist code** — no "extra stuff", no decorative chrome. If 3 lines of HTML look as clean as 10, ship 3.

This is why `<EmptyState>` is one div, `<SigBadge>` is one span, and the timeline's line is a pseudo-element: the flattest DOM that can hold the design is the only DOM.

### (b) Structural vs Content — never crossed

Two color families, two jobs, one iron rule:

- **Flamingo & Teal** (`--color-cake-primary`, `--color-cake-secondary`) own **structure**: buttons, inputs, focus rings, node rings, close-button hover — all interactive chrome.
- **chromatic tokens** (`--sig-*`) own **content categories**: badges, tags, avatars, calendar blocks, data-viz.

The families never cross — and `<SigBadge>` enforces this **at compile time**. Pass it `--color-cake-primary` and TypeScript answers with `TS2322: … not assignable to type 'SigTokenName'` before your code ever runs; the runtime guard catches whatever JS sneaks past.

One line on the layer doctrine that keeps it all honest: **tokens < base < cascade < overrides** — that exact order is declared once and injected first, and the override layer *never* touches `:root`. A scoped override breaks a rule for one component; `:root` is canonical and untouchable.

---

## 5. Getting Started

Three import paths, no more:

| Import | You get | Peers needed |
|---|---|---|
| `@carcolacha/signature-style` | `tokens.json` — the machine-readable manifest | never |
| `@carcolacha/signature-style/css` | the compiled bundle — tokens, base, cascade (timeline + modal included), overrides | never |
| `@carcolacha/signature-style/react` | `ThemeProvider`, `Icon`, `EmptyState`, `SigBadge`, `EventTimeline`, `EventModal`, `useModal` | `react` + `react-dom` (strict peers); `lucide-react` optional |

**CSS-only** — one line and the theme breathes:

```html
<link rel="stylesheet" href="node_modules/@carcolacha/signature-style/css/signature-style.css" />
```

**React** — the full composition in nine lines:

```tsx
import { ThemeProvider, EventTimeline, EventModal, useModal } from "@carcolacha/signature-style/react";

const modal = useModal<TimelineEvent>();

<ThemeProvider>
  <EventTimeline events={events} onEventSelect={modal.open} />
  {modal.selectedEvent !== null && (
    <EventModal event={modal.selectedEvent} open={modal.isOpen} onClose={modal.close} />
  )}
</ThemeProvider>
```

> **Peer dependencies:** `react >=18` and `react-dom >=18` are strict peers (required for `./react`); `lucide-react >= 0.400.0` is an *optional* peer — CSS-only consumers never install icons. Nothing is ever bundled: peers stay peers.

Light theme? One attribute: `<html data-theme="latte">`. No second stylesheet, no JS, no rebuild.

---

## Appendix — Where to go next

- [`SYSTEM_PROMPT.md`](./SYSTEM_PROMPT.md) — the Dynamic Signature Engine v2.5 doctrine, written **for AI sessions** that extend the style.
- [`README.md`](./README.md) — the technical reference: hardening details, changelog, template usage.
- [`docs/PUBLISHING.md`](./docs/PUBLISHING.md) — the release runbook (tags, gates, CI publish).
- [`tokens.json`](./tokens.json) — the **machine-readable** token manifest (package root, for AI tooling).
- [LICENSE](./LICENSE) — MIT © 2026 edwyn.
