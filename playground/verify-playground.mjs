#!/usr/bin/env node
/**
 * verify-playground.mjs — the hub gates: 1.5.0 "Bento Box Showcase"
 * foundations evolved through 1.5.1 hydration/animation, 1.6.0 ambient
 * elevation + resurrection, 1.7.0 visual cortex, 1.8.0 spatial harmony,
 * and now 2.0.0 "The Hub Migration (Shed Aesthetic)".
 *
 * scripts/verify.mjs is byte-frozen (core safety rule), so the playground
 * gates live HERE, inside the playground directory. Asserts:
 *
 *   (b1)  playground/ exists with App.tsx + vite.config.ts (plus
 *         main.tsx, index.html, styles.css);
 *   (b2)  package.json carries the "playground" script, the file:
 *         consumer wiring (@edwyn/signature-style -> "file:."), and the
 *         exports/files/main/peerDependencies keys are deep-equal to
 *         v1.4.0 (the distribution surface is untouched);
 *   (b3)  `npm pack --dry-run` still packs EXACTLY 34 files —
 *         playground/ AND tools/ are auto-excluded by the files array;
 *   (b4)  playground/styles.css contains ZERO hex literals — 100%
 *         var()/color-mix (rgba literals from the 1.6.0 elevation
 *         override are not hex and stay legal); the card hairline is the
 *         elevation border (15% token mix); the grid collapses at
 *         max-width: 768px;
 *   (b5)  App.tsx imports from "@edwyn/signature-style/react" and uses
 *         ThemeProvider > ToastProvider > GlobalNav + the announcing
 *         .hub__hero + main.hub with exactly 4 card sections;
 *   (b6)  EVERY lucide icon name used in App.tsx (icon:/iconName:) exists
 *         in the installed lucide-react icons map — the strict IconName
 *         contract, verified at gate time;
 *   (b7)  SAFETY PROOF (v1.4.0 baseline): `git diff v1.4.0 -- css/
 *         react/ tokens.json SYSTEM_PROMPT.md demo/ scripts/` is EMPTY —
 *         EXCEPT css/timeline.css, governed by (e2).
 *
 * 1.5.1 gates:
 *   (h1)  styles.css carries the staggered load-in: @keyframes
 *         slideUpFade, the cubic-bezier animation with `forwards`, the
 *         opacity: 0 base, the nth-child(1..4) stagger, AND the
 *         MANDATORY prefers-reduced-motion escape (without it,
 *         reduced-motion users get permanently invisible cards) — plus
 *         the ruled card headers;
 *   (h2)  App.tsx declares ≥4 COMPLETE owner-shaped mockEvents entries
 *         (id / month / title / time / colorToken --party-* token /
 *         iconName) across ≥2 month buckets, with the ONE mapping layer
 *         present (month → date, colorToken → category, iconName →
 *         icon);
 *   (h3)  every mockEvents iconName probes against the LIVE lucide
 *         icons map (the "Music" lesson: a name that looks right but is
 *         not a key renders a blank node).
 *
 * 1.6.0 gates ("Ambient Elevation & Timeline Resurrection"):
 *   (e1)  AMBIENT ELEVATION (owner-override markers) — styles.css
 *         carries the exact card elevation: the inset top-highlight
 *         rgba(255, 255, 255, 0.05), the ambient rgba(0, 0, 0, 0.4)
 *         shadow, the 15% token-mix border, the button's 600 weight and
 *         its own 0 4px 16px rgba(0, 0, 0, 0.3) pop; AND — the doctrine
 *         boundary — a NEW scan asserts EVERY file in package css/
 *         (timeline.css included) still declares ZERO box-shadow
 *         declarations. Elevation lives in the composition layer ONLY.
 *   (e2)  TIMELINE RESURRECTION needles — css/timeline.css contains the
 *         two probe-proven fixes: `align-self: start` on the spanning
 *         sticky header (kills the full-group cover slab) and
 *         `position: relative` on the node (paints nodes over the
 *         ::before center line), plus the documented WHY comment
 *         marker; and the timeline diff deletes NO CSS code
 *         (braces/declarations) — only comment prose may be rewritten.
 *
 * 1.7.0 gates ("The Visual Cortex (MCP Integration)"):
 *   (m1)  tools/mcp-viz/dist/server.js EXISTS — the compiled MCP server
 *         is built (run `npm run build` inside tools/mcp-viz);
 *   (m2)  SMOKE PROOF ARTIFACT wired — tools/mcp-viz/smoke.mjs exists,
 *         the package is the private @edwyn/visual-cortex-mcp, and root
 *         package.json carries the "verify:mcp" script that actually
 *         runs the smoke (raw JSON-RPC: exactly two tools, a
 *         .ptp-timeline__node with real area, non-empty screenshot);
 *   (m3)  data-testid wiring in App.tsx — the stable hooks the cortex
 *         greps for: four hub cards, three telemetry metrics, and the
 *         primary toast button. 2.0.0: the card hooks were renamed
 *         bento-card-* → hub-card-* (they contained "bento"); the
 *         metric and button hooks are unchanged.
 *
 * 1.8.0 gates ("Bento Refinement & Spatial Harmony"), re-needled 2.0.0:
 *   (g2)  GLASS HEADER + NODE ELEVATION, doctrine boundary —
 *         css/timeline.css carries the 1.8.0 glass header needles
 *         (color-mix(in srgb, var(--bg-surface) 80%, transparent) +
 *         backdrop-filter: blur(8px), webkit-prefixed too) while
 *         playground/styles.css ALONE carries the node-shadow needle
 *         (`.hub__card .ptp-timeline__node` → 0 4px 12px
 *         rgba(0, 0, 0, 0.2)); a targeted scan re-asserts timeline.css
 *         declares ZERO box-shadow — the package keeps its shadow law,
 *         elevation lives in the composition layer (e1 stays green).
 *   (g3)  TELEMETRY — .hub__metric is space-between + flex-end (caption
 *         left, value flush right, shared bottom floor) and the
 *         progress bars breathe via the composition-scoped margin-top:
 *         var(--space-tight) rule (package viz.css untouched).
 *         2.0.0 adds the owner mandate: margin-bottom var(--space-
 *         standard) — ≥16px air under every metric label row.
 *
 * 2.0.0 gates ("The Hub Migration — Shed Aesthetic"):
 *   (n-hub1) THE CONSTRAINED COLUMN — styles.css declares the .hub
 *         container: max-width 1400px, centered, auto-fit
 *         minmax(400px, 1fr) grid (the 1.8.0 hand-placed asymmetric
 *         stage is retired; discipline comes from the column). The
 *         768px collapse stays pinned by (b4).
 *   (n-hub2) THE ANNOUNCED HEADER — App.tsx carries
 *         <header className="hub__hero"> announcing THE ENGINE with the
 *         subtitle "every primitive, one dashboard · live showcase".
 *   (n-hub3) THE SHED CARD ANATOMY + TACTILE HOVER — styles.css: every
 *         .hub__card is meta (.hub__meta space-between/baseline:
 *         .hub__label teal --color-cake-secondary, all-caps via
 *         text-transform, 0.2em tracking + .hub__path muted mono) under
 *         a ruled h2; the surface answers the pointer with
 *         translateY(-2px) and the deepened 0 16px 40px rgba(0,0,0,0.5)
 *         ambient shadow.
 *   (n-hub4) THE V2.0.0 FROZEN PROOF — `git diff v1.8.0 -- css/ react/
 *         tokens.json demo/ SYSTEM_PROMPT.md scripts/ tools/` is EMPTY.
 *         The hub migration touches the playground presentation layer
 *         ONLY; tools/ joins the freeze this release (the cortex server
 *         stays byte-identical — its default bento selectors are
 *         historical now, but custom selectors keep it fully useful).
 *   (e2 AMENDMENT 2.0.0)  the deletion guard REBASES to the v1.8.0
 *         baseline and the v1.8.0 single-use allowlist entry
 *         ("background: var(--bg-base);") is CONSUMED — gone with that
 *         release. The v2.0.0 allowlist is EMPTY: timeline.css may only
 *         gain changes traceable to comments vs v1.8.0. It was not
 *         touched this release, so (e2) passes trivially while still
 *         guarding every future release.
 *
 * 2.1.0 gates ("Timeline Breathing Room & The Master Index"):
 *   (sp1) TIMELINE HEADER BREATHING ROOM — styles.css carries the
 *         scoped composition override: the sticky header slab's
 *         padding-bottom grows to calc(var(--space-standard) +
 *         var(--space-tight)) (16 → 24px under the month text) AND the
 *         group-first clearance mirrors the growth on BOTH siblings —
 *         item padding-top AND node margin-top =
 *         calc(var(--tl-header-clearance) + var(--space-standard) * 2)
 *         = 100px. Measured contract (probe, release blocker): every
 *         group's header→first-node gap ≥ 16px (was −1px OVERLAP: the
 *         package reserves 68px but its slab renders 69px).
 *   (ix1) THE VIEW SWITCHER — App.tsx declares `type View` with the
 *         default `useState<View>("dashboard")` (the cortex smoke must
 *         find the timeline on load), the HubLink renderer with
 *         `event.preventDefault()` (no full-reload anchor — the
 *         negative-test target), the `as={navLink}` factory wiring into
 *         GlobalNav, and the <EmptyState> placeholder dogfood
 *         (icon="Hammer"). Hero copy is per-view: THE ENGINE stays on
 *         the dashboard, THE MASTER INDEX announces the index.
 *   (ix2) THE THREE GATEWAYS — exact Shed anatomy strings: PLANNER /
 *         views/planner.tsx / Event Planner Bento (the real gateway),
 *         STUDY / modules/study.tsx / Study & Flashcard Generator,
 *         GAMES / modules/games.tsx / Party Game Modules; the index
 *         column is the constrained .hub--index (900px — three doors
 *         read better narrow, owner call, documented).
 *
 * 2.2.0 gates ("Telemetry Limits & Official Surface Primitives"):
 *   (b2 AMENDMENT)  the FROZEN-KEYS contract evolves ONE step: exports/
 *         main/peerDependencies(Meta) stay deep-equal to v1.4.0, but
 *         the files array is v1.4.0's EXACTLY PLUS the single negation
 *         "!react/surface.tsx" (the negations precedent — the new
 *         surface source never ships, its compiled .js/.d.ts do).
 *   (b3)  npm pack now packs EXACTLY 37 files (34 + css/surface.css +
 *         react/surface.js + react/surface.d.ts).
 *   (b4)  the 15% elevation-border needle MOVED to (s1) — the card
 *         border is package-owned now (css/surface.css); styles.css
 *         keeps the zero-hex + 768px contract.
 *   (b7)  SAFETY PROOF REBASED to the v2.1.0 baseline (each release
 *         that legitimately touches core rebases the floor): diff vs
 *         v2.1.0 over css/ react/ tokens.json SYSTEM_PROMPT.md demo/
 *         scripts/ must be EMPTY except the owner-authorized 2.2.0
 *         deltas — css/viz.css + react/viz.tsx (telemetry limits),
 *         react/index.ts (re-exports), the NEW css/surface.css +
 *         react/surface.{tsx,js,d.ts}, and timeline.css (e2-governed).
 *         scripts/verify.mjs stays BYTE-FROZEN (its v1 needle reads the
 *         migration marker in viz.css; the LIVING 2.2.0 viz gate lives
 *         here as (v22)).
 *   (n-hub4)  V2.2.0 FROZEN PROOF, rebased to v2.1.0 incl tools/: same
 *         authorized-delta exclusions plus tools/mcp-viz/server.ts
 *         (the cortex sweep is our tooling, owner-editable this
 *         release: .bento__* selectors → the sig-* surface contract).
 *   (e1 AMENDMENT)  AMBIENT ELEVATION, rescoped — the package css/
 *         zero-box-shadow scan now carries ONE owner-sanctioned
 *         exception: css/surface.css may declare box-shadow ONLY
 *         inside selector blocks whose selector contains
 *         `.sig-surface-card` (the ambient elevation contract ships
 *         with the primitive; parsed per rule block, comments
 *         stripped). Every OTHER css file stays ABSOLUTE ZERO. The
 *         hex-ban extends to surface.css: the rgba elevation literals
 *         are sanctioned, hex literals are not. styles.css keeps the
 *         composition-layer elevations it still owns (the button pop,
 *         the node shadow).
 *   (s1)  SURFACE PRIMITIVES — css/surface.css carries the promoted
 *         Shed anatomy: the 15% token-mix border, the inset
 *         rgba(255,255,255,0.05) top-highlight, the ambient
 *         rgba(0,0,0,0.4) shadow, the hover translateY(-2px) +
 *         rgba(0,0,0,0.5) deepen, the teal eyebrow; and css/viz.css
 *         carries the tabular-nums limit caption (2.2.0 telemetry
 *         limits).
 *   (s2)  UMBRELLA RE-EXPORTS — react/index.d.ts re-exports
 *         SurfaceCard/PageHero (+ prop types), react/index.js the
 *         values, and the compiled react/surface.{js,d.ts} exist.
 *   (v22) TELEMETRY LIMITS, the LIVING v1 evolution — css/viz.css:
 *         track on var(--bg-inset) + the 20% hairline boundary +
 *         .ptp-progress__caption (mono, tabular-nums, muted, 0.75rem);
 *         react/viz.tsx: the limitText caption prop, the ring boundary
 *         hairline circle, the centered showValue readout with
 *         tabular-nums. (scripts/verify.mjs's frozen v1 floor reads
 *         the var(--bg-surface) migration marker in the viz.css header
 *         — see (b7).)
 *
 * 2.3.0 gates ("Universal Web Components & AI Signature Codex"):
 *   (b2 AMENDMENT)  the frozen files array evolves ONE more step:
 *         v1.4.0 + "!react/surface.tsx" + "!react/data.tsx" (the
 *         negations precedent — the new data source never ships, its
 *         compiled .js/.d.ts do).
 *   (b3)  npm pack now packs EXACTLY 40 files (37 + css/data.css +
 *         react/data.js + react/data.d.ts).
 *   (b7)  SAFETY PROOF REBASED to the v2.2.0 baseline (each release
 *         that legitimately touches core rebases the floor): diff vs
 *         v2.2.0 over css/ react/ tokens.json demo/ scripts/ must be
 *         EMPTY except the owner-authorized 2.3.0 deltas — css/data.css
 *         (NEW), css/forms.css (grows), css/signature-style.css (the
 *         data.css import), react/data.{tsx,js,d.ts} (NEW),
 *         react/forms.{tsx,js,d.ts} (grow), react/index.{ts,js,d.ts}
 *         (re-exports), SYSTEM_PROMPT.md (the codex — content pinned
 *         by (dd4)). scripts/verify.mjs stays BYTE-FROZEN.
 *   (n-hub4)  V2.3.0 FROZEN PROOF, rebased to v2.2.0 incl tools/: same
 *         authorized deltas plus tools/mcp-viz/server.ts (owner-editable
 *         this release: the cortex sweep grows the data-module
 *         selectors; the compiled dist/ is gitignored).
 *   (m3)  the 2.3.0 hooks join: data-testid="tabs-module" and
 *         data-testid="data-table-ledger".
 *   (dd1) DATA CSS — css/data.css carries the ledger/tab/callout
 *         anatomy: uppercase letter-spaced thead, tabular-nums numeric
 *         cells, the 8% Flamingo hover wash, the aria-selected tab
 *         contract (attribute-driven, Flamingo underline), the callout
 *         var(--status) strip, the scroll-containment wrapper (the
 *         mobile strategy — the file must NOT declare a 768px media
 *         query), reduced-motion, zero hex; and signature-style.css
 *         imports ./data.css layer(cascade) AFTER ./surface.css.
 *   (dd2) UMBRELLA RE-EXPORTS — all six new names (DataTable, Tabs,
 *         Callout, Select, Checkbox, Avatar) re-exported from BOTH
 *         react/index.d.ts AND react/index.js (+ their prop types).
 *   (dd3) FORMS ADDITIONS — css/forms.css: appearance-none select +
 *         checkbox, the :checked Teal fill, the ::after on-cake
 *         checkmark, the chevron wrapper anatomy, the avatar disc;
 *         react/forms.tsx: the ChevronDown icon (gate-probed against
 *         the live lucide map), the ring as an inline BORDER (never a
 *         box-shadow), the runtime --party-* ring guard.
 *   (dd4) THE CODEX — SYSTEM_PROMPT.md contains the "Universal AI
 *         Replication Contract" section, ≥15 component snippet
 *         headings, and the closing law ("never invent tokens; never
 *         hardcode hex"); the engine title moves to v2.6.
 *   (dd5) THE TABS SHOWCASE — App.tsx: the Tabs module switcher
 *         (label "Dashboard modules", the three module ids), the Data
 *         branch (DataTable ledger with the five crew rows + the
 *         composed PartyBadge, the three Callout moods, five Avatars,
 *         two party rings), the Forms branch (Select with three
 *         options, Checkbox, the v2.1.0 matrix).
 *   (dd6) CORTEX SWEEP — tools/mcp-viz/server.ts DEFAULT_SELECTORS
 *         carries .ptp-data-table / .ptp-tabs__tab / .ptp-callout
 *         (plus the 2.2.0 .sig-surface-card) and the server version
 *         string is 2.3.0.
 *
 * 2.4.0 gates ("Form Wrappers & Editorial Primitives"):
 *   (b2 AMENDMENT)  the frozen files array evolves ONE more step:
 *         v1.4.0 + "!react/surface.tsx" + "!react/data.tsx" +
 *         "!react/editorial.tsx" (the negations precedent — the new
 *         editorial source never ships, its compiled .js/.d.ts do).
 *   (b3)  npm pack now packs EXACTLY 43 files (40 + css/editorial.css
 *         + react/editorial.js + react/editorial.d.ts).
 *   (b7)  SAFETY PROOF REBASED to the v2.3.0 baseline (each release
 *         that legitimately touches core rebases the floor): diff vs
 *         v2.3.0 over css/ react/ tokens.json demo/ scripts/ must be
 *         EMPTY except the owner-authorized 2.4.0 deltas —
 *         css/editorial.css (NEW), css/forms.css (grows), css/viz.css
 *         (grows), css/signature-style.css (the editorial.css import),
 *         react/editorial.{tsx,js,d.ts} (NEW), react/forms.{tsx,js,d.ts}
 *         (grow), react/viz.{tsx,js,d.ts} (grow), react/index.{ts,js,d.ts}
 *         (re-exports). scripts/verify.mjs stays BYTE-FROZEN.
 *   (n-hub4)  V2.4.0 FROZEN PROOF, rebased to v2.3.0 incl tools/: tools/
 *         is UNTOUCHED this release (the cortex sweep's class targets
 *         are unchanged — ptp- prefixes only), so no tools exclusion
 *         delta is authorized; the sweep needles (dd6) stay pinned.
 *   (m3)  the 2.4.0 hooks join: data-testid="kpi-trio",
 *         data-testid="banner-release", data-testid="carousel-clippings".
 *   (ed1) EDITORIAL CSS — css/editorial.css carries the carousel snap
 *         (scroll-snap-type x mandatory + scroll-snap-align start),
 *         the prose blockquote (inset well + 4px Flamingo rule +
 *         italic), the banner var(--status) strip, the ghost Teal-hover
 *         buttons, zero hex AND zero box-shadow (the e1 scope extends:
 *         ALL css/ files stay shadow-free except surface.css's
 *         sanctioned .sig-surface-card rules — editorial included);
 *         signature-style.css imports ./editorial.css layer(cascade)
 *         AFTER ./data.css.
 *   (ed2) UMBRELLA RE-EXPORTS — the six new primitives + the Sparkline
 *         engine (FormField, RadioCardGroup, Carousel, CarouselItem,
 *         ProseBlock, AnnouncementBanner, StatCard, Sparkline + prop
 *         types) re-exported from BOTH react/index.d.ts AND
 *         react/index.js; react/editorial.{js,d.ts} compiled on disk.
 *   (ed3) FORMS ADDITIONS — css/forms.css: the :has() focus ring
 *         (.ptp-radio-card:has(input:focus-visible) → the Flamingo
 *         outline; the no-:has degrade documented), the radio selected
 *         contract (--selected class + :has(input:checked) → 2px
 *         Flamingo border + the 10% cake-tint background), the visually
 *         hidden input, the auto-fit minmax(140px,1fr) grid, the form
 *         field label/hint/error anatomy (error = --party-peach);
 *         react/forms.tsx: the FormField hint-XOR-error slot and the
 *         radiogroup/aria-label contract.
 *   (ed4) VIZ ADDITIONS — react/viz.tsx: Sparkline renders ONE svg
 *         (role="img", preserveAspectRatio="none") with EXACTLY two
 *         elements (polygon + polyline) plus the --party-* runtime
 *         guard and the ≥2-point guard; css/viz.css: .ptp-stat-card is
 *         FLAT (surface background + 20% hairline, zero shadow —
 *         e1-scanned) with tabular-nums value + uppercase label +
 *         up/down party delta colors.
 *   (icons) SDK-LUCIDE PROBE — Megaphone, ChevronLeft, ChevronRight
 *         exist in the installed lucide-react icons map (the "Music"
 *         lesson: editorial.tsx renders three new icon names).
 *   (showcase) THE EDITORIAL SHOWCASE — App.tsx: the FormField
 *         side-by-side (Name + $ Contribution), the RadioCardGroup
 *         RSVP sample (Attending/Maybe/Can't make it), the Data view
 *         banner + KPI trio + ProseBlock Field Notes + palette
 *         clippings Carousel.
 *
 * 2.4.1 gates ("Intuitive Form Anatomy & Alignment Fix" — the patch
 * release: owner-spec DELTAS on top of the v2.4.0 primitives, zero
 * new files, pack stays 43):
 *   (b7)/(n-hub4)  REBASED to the v2.4.0 baseline with the authorized
 *         2.4.1 deltas enumerated (css/data.css + css/forms.css +
 *         css/editorial.css growth, the matching react growth +
 *         compiled pairs, react/index.{ts,js,d.ts} for the
 *         AnnouncementStatus → AnnouncementVariant rename). css/viz.css
 *         and css/signature-style.css are NOT excluded — both must stay
 *         byte-identical to v2.4.0. scripts/verify.mjs stays
 *         BYTE-FROZEN; tools/ fully frozen (no DEFAULT_SELECTORS change
 *         needed — every 2.4.1 class keeps the ptp- prefix).
 *   (dd4 AMENDMENT)  the codex title needle moves to v2.7.
 *   (ed1 AMENDMENT)  the quote-rule needle moves Flamingo → mauve.
 *   (ed2 AMENDMENT)  AnnouncementStatus → AnnouncementVariant +
 *         AnnouncementBannerAction in the umbrella type list.
 *   (ed3 AMENDMENT)  the selected-radio background needle moves to the
 *         --bg-surface lift.
 *   (icons AMENDMENT)  += the banner default icons Info /
 *         TriangleExclamationPoint (PROBED: lucide 1.72.0 has NO
 *         "TriangleAlert" key — the owner-spec'd name maps to the
 *         live-map-valid equivalent, the AudioLines/Music precedent).
 *   (showcase AMENDMENT)  label="Contribution" + prefix="$", banner
 *         variant="announcement" + action, v2.4.1 banner copy.
 *   (af1) DATA ALIGN — css/data.css carries the ancestor-scoped
 *         .ptp-data-table__align-{left,center,right} utilities (the
 *         (0,2,0) prefix beats .ptp-data-table thead th (0,1,2) — the
 *         bare class would LOSE and re-create the bug); react/data.tsx
 *         declares align?: "left"|"right"|"center" and flows
 *         dataTableCellClass to BOTH th and td; react/data.d.ts is
 *         factual; App.tsx ledger sets numeric + align: "right".
 *   (af2) FORM ANATOMY — css/forms.css: __required (peach, visual
 *         only), __row/__prefix (the justified adornment composition),
 *         the switch wrapper .ptp-switch (inline-flex) + migrated
 *         .ptp-switch__pill (NO pill property left on the bare
 *         wrapper, no [aria-checked] outside the pill, reduced-motion
 *         follows) + __text (text-main 0.875rem/500), the radio
 *         selected lift to var(--bg-surface) with the 2px Flamingo
 *         border kept; react/forms.tsx: required/prefix props +
 *         renders, the label → visible text span (bare pill when no
 *         label), the .d.ts factual.
 *   (af3) EDITORIAL DELTAS + V2.7 CODEX — css/editorial.css: the mauve
 *         quote rule, h3 (0.9375rem/600), the code/kbd inline chip,
 *         the tabular-nums indicator, the Teal-hover action button;
 *         react/editorial.tsx: variant/icon/action API (default
 *         announcement → Flamingo, probed icons), the rAF-throttled
 *         indicator with the owner formula
 *         Math.round(scrollLeft/itemWidth)+1; the compiled .d.ts
 *         factual; SYSTEM_PROMPT.md carries the refreshed v2.7 recipes
 *         (FormField/RadioCardGroup/ToggleSwitch/AnnouncementBanner/
 *         ProseBlock/Carousel snippets + align/lift/mauve needles).
 *   Negative test (falsifiability, restore-verified): removing the
 *         `.ptp-data-table .ptp-data-table__align-right` rule from
 *         css/data.css flips (af1) to FAIL; restore → PASS
 *         (git-verified byte-identical).
 *
 * 2.5.0 gates ("Ergonomic Form Rules, Button & Card Archetypes, and
 * the 12-Column Bento" — built backwards from the owner's five
 * defects):
 *   (b2 AMENDMENT)  the frozen files array evolves ONE more step:
 *         v1.4.0 + the three prior negations + "!react/cards.tsx" (the
 *         negations precedent — the cards source never ships, its
 *         compiled .js/.d.ts do).
 *   (b3)  npm pack now packs EXACTLY 47 files (43 + css/primitives.css
 *         + css/cards.css + react/cards.js + react/cards.d.ts).
 *   (b7)  SAFETY PROOF REBASED to the v2.4.1 baseline (each release
 *         that legitimately touches core rebases the floor): diff vs
 *         v2.4.1 over css/ react/ tokens.json SYSTEM_PROMPT.md demo/
 *         scripts/ must be EMPTY except the owner-authorized 2.5.0
 *         deltas — css/tokens.css (+ --party-yellow), tokens.json
 *         (token + meta 2.5.0), css/forms.css (FormField anatomy +
 *         PasswordInput), css/primitives.css + css/cards.css (NEW),
 *         css/signature-style.css (the two layered imports),
 *         react/ThemeProvider.{tsx,js,d.ts} (whitelist 34),
 *         react/primitives.{tsx,js,d.ts} (Button), react/forms.{tsx,
 *         js,d.ts} (FormField rework + PasswordInput),
 *         react/cards.{tsx,js,d.ts} (NEW), react/index.{ts,js,d.ts}
 *         (re-exports), SYSTEM_PROMPT.md (the v2.8 codex).
 *         scripts/verify.mjs stays BYTE-FROZEN. react/viz.tsx and the
 *         frozen css files stay byte-identical.
 *   (n-hub4)  V2.5.0 FROZEN PROOF, rebased to v2.4.1 incl tools/: the
 *         ONLY tools/ delta authorized is tools/mcp-viz/server.ts
 *         (owner-editable: DEFAULT_SELECTORS += .ptp-btn,
 *         .ptp-stat-card, .sig-shell; version 2.5.0).
 *   (m3)  the 2.5.0 hooks join: data-testid="guest-form",
 *         "ledger-table", "ring-rsvp" (the live-state probes); the
 *         metric/button/tab/banner/carousel/kpi hooks stay.
 *   (b12) THE 12-COLUMN BENTO — styles.css declares .bento12
 *         (repeat(12, 1fr), section gap) + the span utilities
 *         (.sig-span-12/7/5/4/3, .sig-row-2) + the 768px single-column
 *         collapse with ALL spans reset; App.tsx renders
 *         <main className="bento12"> and uses every span class.
 *   (sh1) THE SHELL (defect #1's tombstone) — .sig-shell carries
 *         max-width 1400px + clamp(20px, 4vw, 48px) side padding +
 *         64px bottom air; App.tsx wraps EVERY view's content in it.
 *   (ff1) FORMFIELD TOP-DOWN ANATOMY (defect #2) — forms.tsx renders
 *         __desc BEFORE the well (grep order) and the validation zone
 *         after it; css/forms.css carries the promoted label
 *         (text-main 0.875rem/500), __desc, the owning well
 *         (focus-within Flamingo ring, [data-invalid] peach),
 *         the chips (hairline-separated), the scoped bare-input kill,
 *         @keyframes ptp-shake + the reduced-motion kill.
 *   (pw1) PASSWORDINPUT — forms.tsx: the Eye/EyeOff toggle
 *         (live-map-probed), the role="progressbar" meter (0..4, now
 *         score), data-score, the four rules + Weak/Fair/Good/Strong,
 *         data-satisfied pills; css: the 4-segment meter with the
 *         --party-yellow stage-2 fill and the green satisfied pills.
 *   (bt1) THE BUTTON FAMILY — primitives.tsx: 4 variants, 3 sizes,
 *         leftIcon/rightIcon, loading (spinner replaces icons, aria-busy
 *         + disabled); css/primitives.css: the 4 variant classes, 2
 *         size classes, @keyframes ptp-spin, :active scale(0.97), the
 *         Flamingo focus ring, ZERO hex + ZERO box-shadow (the flat
 *         primary is package law); bundle membership after data.css;
 *         umbrella re-export.
 *   (cd1) THE CARD ARCHETYPES — css/cards.css: preserve-3d +
 *         backface-visibility + the rotateY flip, details[open]
 *         chevron, the matchup 1fr auto 1fr grid, the standalone kbd
 *         chip, the reduced-motion opacity swap; react/cards.tsx: the
 *         aria-pressed flip button, the details/summary accordion, the
 *         40px avatars; zero hex + zero shadow; bundle membership
 *         after primitives.css; umbrella re-exports.
 *   (al1) THE LIVE LEDGER ALIGNMENT (defect #4) — App.tsx's
 *         BENTO_LEDGER_COLUMNS sets header "Contribution" numeric +
 *         align right; the ledger-table testid wraps it.
 *   (af2 AMENDMENT)  the 2.4.1 __row/__prefix needles retire — the
 *         adornment composition is the __well/__chip now (gate ff1
 *         carries the contract); __required, the switch migration and
 *         the radio lift needles stay.
 *   (dd4 AMENDMENT)  the codex title needle moves to v2.8.
 *   (dd6 AMENDMENT)  the cortex sweep grows .ptp-btn / .ptp-stat-card
 *         / .sig-shell; the server version moves to 2.5.0.
 *   (showcase AMENDMENT)  the bento needles: Postal Code +
 *         descriptions + validMessage + PasswordInput + the archetypes
 *         + the v2.5.0 banner copy; RSVP options ALL carry
 *         descriptions.
 *   (h1 AMENDMENT)  the stagger retargets to the bento cells
 *         (.bento12 > *), 11 cells at 50ms steps, the MANDATORY
 *         reduced-motion escape follows.
 *   Negative test (falsifiability, restore-verified): breaking the
 *         banner's span-12 class flips (b12) to FAIL; restore → PASS.
 *
 * 2.6.0 gates ("Universal Developer Card Suite, Chromatic Elevation &
 * The Master Index Overhaul" — zero new files, pack stays 47; every
 * delta grows an EXISTING file):
 *   (b7)/(n-hub4)  REBASED to the v2.5.0 baseline with the authorized
 *         2.6.0 deltas enumerated: css/surface.css (chromatic accents +
 *         elevation tiers), css/cards.css (the five universal
 *         archetypes), css/editorial.css (scrollbar-free track + dots),
 *         css/forms.css (textarea resize), react/surface.{tsx,js,d.ts},
 *         react/cards.{tsx,js,d.ts}, react/editorial.{tsx,js,d.ts},
 *         react/index.{ts,js,d.ts} (re-exports), SYSTEM_PROMPT.md (the
 *         v2.9 codex) — and for (n-hub4) additionally tools/mcp-viz/
 *         server.ts (version 2.6.0 + the chronicle/dot sweep
 *         selectors). react/forms.{tsx,js,d.ts} are NOT authorized —
 *         the textarea resize is css-only and the form audits live in
 *         the playground. scripts/verify.mjs stays BYTE-FROZEN.
 *   (sh1 AMENDMENT)  the shell WIDENS for the catalog: max-width
 *         1520px + clamp(24px, 4vw, 56px) side padding (the 24px
 *         floor).
 *   (acc1) THE ACCENT CONTRACT — css/surface.css carries the
 *         [data-accent] + --sig-accent rules (eyebrow color, 2px
 *         title underline, chromatic glow), react/surface.tsx exports
 *         the PartyColorToken alias (the 11 --party-* tokens) and the
 *         AccentToken union (party + the two structural signatures);
 *         <SurfaceCard> renders data-accent/data-elevation + the
 *         inline --sig-accent variable.
 *   (elev) THE ELEVATION LADDER — css/surface.css declares the three
 *         bare tier blocks ([data-elevation="flat"/"raised"/
 *         "floating"]) AND the (e1) scope is AMENDED: shadow
 *         declarations in surface.css are legal ONLY under (a)
 *         .sig-surface-card selectors, (b) the three tier blocks,
 *         (c) [data-accent] glow rules. css/cards.css stays ABSOLUTE
 *         ZERO (the featured TierCard's floating shadow arrives
 *         through the shared ladder) — both files' shadow policies
 *         asserted explicitly.
 *   (pt11) THE 11-TOKEN SWEEP — the ThemeProvider whitelist covers
 *         EXACTLY the 11 --party-* names, and the PartyColorToken
 *         alias exists in the compiled react/surface.d.ts (the union
 *         resolves through Extract<KnownToken, `--party-${string}`> —
 *         the whitelist IS the union).
 *   (cc1)  CONTENTCARD — css/cards.css: the 16/9 visual (aspect-ratio:
 *         16 / 9), the mono 0.6875rem meta pill, the accent underline,
 *         the footer's margin-top: auto; react/cards.tsx: the
 *         gradient-art fallback (color-mix + var, ZERO hex), the
 *         package Button footer.
 *   (cc2)  REFERENCECARD — react/cards.tsx: navigator.clipboard
 *         .writeText, the 2000ms copied reset (timer cleaned up), the
 *         onCopied-after-success contract, the "Copied!" flash;
 *         css/cards.css: the uppercase tag chip + the code well.
 *   (cc3)  TIERCARD — react/cards.tsx: featured → data-elevation
 *         "floating" + the Check bullets; css/cards.css: the 2px
 *         accent border on --featured, the party-green Check ink, the
 *         2rem tabular price.
 *   (cc4)  PROFILECARD — react/cards.tsx: the Avatar with
 *         size={avatarSize} + ringToken, the 2–3 stats dev-warn;
 *         css/cards.css: the tabular stat values.
 *   (cc5)  CHRONICLETIMELINE — react/cards.tsx: the <ol
 *         class="ptp-chronicle"> with the inline --accent variable;
 *         css/cards.css: the ::before spine, the absolutely-parked
 *         12px node, zero shadows.
 *   (mi1)  THE MASTER INDEX — App.tsx: the filter Tabs (label "Catalog
 *         categories", the five category ids, conditional rendering
 *         per row), the three chromatic gateways (PLANNER/STUDY/ARENA,
 *         data-accent + --sig-accent), the commerce trio, the food
 *         slab + the 4-up profile row, the flat chronicle slab with
 *         EXACTLY 23 RELEASE_HISTORY entries (v0.1.0 → v2.6.0);
 *         styles.css: .hub__row--3 (repeat(3, 1fr)) + .hub__row--4
 *         with the 768px collapses, .hub--index as the flex column.
 *   (ed1 AMENDMENT)  the track scrollbar needle moves thin → none +
 *         the webkit display:none; the .ptp-carousel__dots /
 *         .ptp-carousel__dot anatomy joins ([data-active="true"] →
 *         the Flamingo 1.5rem pill).
 *   (dd4 AMENDMENT)  the codex title needle moves to v2.9; the codex
 *         gains the six new recipes (SurfaceCard chromatic params,
 *         ContentCard, ReferenceCard, TierCard, ProfileCard,
 *         ChronicleTimeline) — fact-checked against the compiled
 *         .d.ts files.
 *   (dd6 AMENDMENT)  the cortex sweep grows .ptp-carousel__dot /
 *         .ptp-chronicle__item; the server version moves to 2.6.0.
 *   (s1 AMENDMENT)  the elevation literals re-tune: the raised tier is
 *         inset 0.06 + ambient 0.42 (the base card default); the
 *         hover deepen 0 16px 40px rgba(0, 0, 0, 0.5) stands.
 *   (icons AMENDMENT)  += Copy, Check, ArrowUpRight (the ReferenceCard
 *         and TierCard render them).
 *   Negative test (falsifiability, restore-verified): deleting the
 *         `[data-elevation="floating"]` tier block from css/surface.css
 *         flips BOTH (elev) and (cc3) to FAIL; restore → PASS
 *         (git-verified byte-identical).
 *
 * 2.7.0 gates ("Interactive Knowledge Graph, Analytical SVG Charts &
 * Manageable Timeline" — the persistence addendum folded in):
 *   (b2 AMENDMENT)  the frozen files array evolves ONE more step:
 *         v1.4.0 + the four prior negations + "!react/graph.tsx" +
 *         "!react/timeline-manager.tsx" (the negations precedent — the
 *         new sources never ship, their compiled .js/.d.ts do).
 *   (b3)  npm pack grows 47 → 52 files (47 + css/graph.css +
 *         react/graph.{js,d.ts} + react/timeline-manager.{js,d.ts}).
 *   (b7)/(n-hub4)  REBASED to the v2.6.0 baseline. The owner-authorized
 *         2.7.0 deltas, and NOTHING else: css/viz.css (BarChart +
 *         AreaChart classes), css/timeline.css (APPEND-only .ptp-tmanager
 *         block, e2-governed), css/graph.css (NEW), css/signature-style.css
 *         (the graph import), react/viz.{tsx,js,d.ts} (BarChart/AreaChart
 *         growth), react/graph.{tsx,js,d.ts} (NEW),
 *         react/timeline-manager.{tsx,js,d.ts} (NEW),
 *         react/index.{ts,js,d.ts} (re-exports), SYSTEM_PROMPT.md (the
 *         v3.0 codex), tools/mcp-viz/server.ts (n-hub4 only: the sweep
 *         selectors + version 2.7.0). ZERO token changes: tokens.json and
 *         css/tokens.css stay byte-identical; EventTimeline
 *         (react/timeline.tsx) stays intact; demo/ and scripts/
 *         byte-frozen. scripts/verify.mjs stays BYTE-FROZEN.
 *   (kg1) THE KNOWLEDGE GRAPH — css/graph.css: the inset canvas
 *         (--bg-inset), the 15% hairline border, the 0.25 dim answer,
 *         __footer + __toolbar anatomy, the focus-visible ring,
 *         reduced-motion, ZERO hex + ZERO box-shadow; react/graph.tsx:
 *         the exported PURE layoutGraph + cubicBezierEdge helpers, the
 *         role="application" svg, one bezier edge per node-with-parent
 *         (data-parent/data-child), the class-driven
 *         .ptp-graph--focused dim, the footer inspect strip, the
 *         "Add & Link" toolbar; signature-style.css imports
 *         ./graph.css layer(cascade) AFTER ./cards.css; umbrella
 *         re-exports.
 *
 * 2.8.0 gates ("The Signature Pattern Website, 6-Set Taxonomy & One-Click
 * Copy Studio"):
 *   (b2 AMENDMENT)  the frozen files array is UNCHANGED — zero new package
 *         files this release (the release grows the playground layer).
 *   (b3)  npm pack stays EXACTLY 52 — playground/public/ is NOT shipped
 *         (the files array excludes playground/ wholesale; this gate's
 *         number is the proof the manifests ride the dev server only).
 *   (b7)/(n-hub4)  REBASED to the v2.7.0 baseline. css/, react/,
 *         SYSTEM_PROMPT.md, demo/, scripts/ AND tools/ are LOCKED and
 *         EMPTY-diffed (zero package deltas this release). tokens.json
 *         carries ONE authorized delta — meta.version → 2.8.0 — guarded
 *         by a deep-equal check that neutralizes meta.version (themes/
 *         shared/partyPalette/doctrine must stay identical).
 *   (ix1 AMENDMENT)  the view union grows to the 5 real views; the
 *         EmptyState/Hammer placeholder needles retire with
 *         PlaceholderView (EmptyState lives in the Set 06 frame).
 *   (nav5)  THE FIVE REAL VIEWS — Dashboard / Pattern Studio / Index /
 *         Chronicle / AI Codex in NAV_ITEMS + the routing table + the
 *         render branches; negative needles: PlaceholderView,
 *         WorkshopView, PLACEHOLDERS, "#/events"/"#/guests"/"#/budget"
 *         must NOT exist.
 *   (ps-studio)  THE PATTERN STUDIO — PatternFrame's
 *         data-sig-set/data-sig-component article, the aria-pressed
 *         Preview|JSX|HTML segmented tabs, the pre/code well, the HTML
 *         fallback note; PatternStudio's registry-driven SET_FRAMES
 *         (EVERY SNIPPETS key mounts a frame), tabular-nums sidebar
 *         counts, 240px sticky sidebar + 768px stack; CodexView's
 *         HONEST census (exactly 22 color tokens, "the whitelist is 34"
 *         stated), click-to-copy swatches, the 5-rung z-ladder
 *         DataTable, the 6-bar 8px scale; the 2.8.0 css anatomy stays
 *         FLAT (e1: zero box-shadow in the new blocks — only the
 *         standing primary-button composition pop remains).
 *   (ps-copy)  THE COPY STUDIO PATH — navigator.clipboard.writeText →
 *         copied state → Copy→Check (COPIED_RESET_MS 2000, timer
 *         cleaned) → toast("success", `Copied ${componentName}
 *         snippet`), the clipboard-unavailable error toast, and the
 *         codex swatch copy path.
 *   (ps-llms)  THE MANIFESTS — public/llms.txt (H1 + blockquote +
 *         Tokens/Rules/Component Sets/Recipes) + public/llms-full.txt
 *         (EVERY SNIPPETS key + all 34 whitelist token names + the
 *         doctrines present); package.json scripts.llms wired; the
 *         generator exists.
 *   Negative test (falsifiability, restore-verified): removing
 *         `data-sig-set={setId}` from PatternFrame.tsx flips (ps-studio)
 *         to FAIL; restore → PASS (git-verified byte-identical).
 *   Probe (cortex, playwright): Pattern Studio renders 50
 *         PatternFrames across 6 data-sig-set sections; JSX toggle on 2
 *         frames; Copy Card → clipboard + toast + Copied! → 2s reset;
 *         HTML tab renders the documented variant; Chronicle 23 nodes;
 *         Codex 22 swatches → clipboard var name; /llms.txt HTTP 200.
 *
 * 2.9.1 gates ("Zero Contrast Debt & Live Skeleton Trigger" — the patch:
 * two token VALUES change, the skeletons get a live trigger, one new
 * playground gate script; pack stays 58, zero new shipped files):
 *   (b3)  npm pack stays EXACTLY 58 — the contrast gate + the CLS probe
 *         live in playground/ (files-array excluded); the shipped
 *         tarball's file LIST is unchanged (css/tokens.css content
 *         evolves, no new files).
 *   (ct1) THE CONTRAST GATE — playground/verify-contrast.mjs exists and
 *         is wired (scripts["verify:contrast"]); css/tokens.css carries
 *         the two fixed hexes (--party-mauve-bright #9e5ff2 — the
 *         minimal in-family lightness step H266°/S85% L58→66%, measured
 *         3.22:1 on surface / 4.20:1 on base, was #8839ef @ 2.32:1;
 *         --party-blue #89b4fa — official Catppuccin Mocha Blue, the
 *         v3.0.0 --party-cobalt convergence, 5.97:1 / 7.79:1, was
 *         #1e66f5 @ 2.56:1); and the gate itself RUNS green (all 11
 *         party tokens ≥3.0:1 vs surface AND base, the fixed pair
 *         ≥3.1:1). Negative test (falsifiability, restore-verified):
 *         reverting --party-blue to #1e66f5 flips verify:contrast to
 *         FAIL with the measured 2.559:1 ratio + the (ct3) pin refusal;
 *         restore → PASS (git-verified byte-identical).
 *   (sk1 AMENDMENT)  the LIVE TRIGGER wiring joins the package skeleton
 *         gate: the palette command (label "Simulate Async Load (800ms)",
 *         keywords skeleton/loading/async/cls, Hourglass — a probed
 *         lucide key), the Input Matrix button (btn-simulate-load), the
 *         800ms constant, SimSlot (the measured height lock) and the
 *         SkeletonTableRow columns={3} × current-rows ledger swap.
 *         CLS proof: playground/probe-skeleton-cls.mjs (release
 *         blocker, run against the dev server) — every .bento12 child's
 *         rect identical ±1px BEFORE/DURING/AFTER.
 *   (b7)/(n-hub4)  REBASED to the v2.9.0 baseline. The owner-authorized
 *         2.9.1 deltas, and NOTHING else: css/tokens.css (the two party
 *         values + their fix comments), tokens.json (the two values +
 *         descriptions + meta.version), scripts/verify.mjs (the two (p)
 *         pin re-targets — OWNER-SANCTIONED: the frozen gate pinned the
 *         exact old hexes in BOTH css and manifest, which a legitimate
 *         value change makes unsatisfiable; the floor rebases with the
 *         release, the b7 discipline). react/, demo/, SYSTEM_PROMPT.md,
 *         tools/ stay byte-identical. The tokens.json guard neutralizes
 *         meta.version AND the two authorized token deltas (value +
 *         description) — everything else must deep-equal v2.9.0.
 *
 * Prints PASS and exits 0; prints FAIL + reasons and exits 1.
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const playground = resolve(root, "playground");
const failures = [];

// ---- (b1) playground scaffold exists ------------------------------------------
for (const file of ["App.tsx", "vite.config.ts", "main.tsx", "index.html", "styles.css"]) {
  if (!existsSync(join(playground, file))) {
    failures.push(`(b1) playground/${file} is missing`);
  }
}

// ---- (b2) scripts + consumer wiring + frozen distribution keys ------------------
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));

for (const script of ["playground", "playground:build"]) {
  if (typeof pkg.scripts?.[script] !== "string") {
    failures.push(`(b2) package.json scripts["${script}"] is missing`);
  }
}

const pkgSelf = pkg.devDependencies?.["@edwyn/signature-style"];
const pkgSelfDeps = pkg.dependencies?.["@edwyn/signature-style"];
const selfWired =
  pkgSelf === "file:." || pkgSelfDeps === "file:." ||
  typeof pkgSelf === "string" || typeof pkgSelfDeps === "string";
if (!selfWired) {
  failures.push(
    '(b2) package.json has no @edwyn/signature-style file:/alias consumer wiring (devDependencies or dependencies)',
  );
}

// exports/main/peerDependencies(Meta) must be deep-equal to v1.4.0.
// 2.2.0 AMENDMENT: the files array froze at v1.4.0 for six releases;
// the surface promotion added the first negation ("!react/surface.tsx").
// 2.3.0 AMENDMENT: the data promotion adds the second, per the
// negations precedent ("!react/data.tsx" — the new source never ships,
// its compiled .js/.d.ts do) — asserted as the ONLY allowed deltas.
// 2.4.0 AMENDMENT: the editorial promotion adds the third
// ("!react/editorial.tsx"), same precedent.
// 2.5.0 AMENDMENT: the cards promotion adds the fourth
// ("!react/cards.tsx"), same precedent.
// 2.7.0 AMENDMENT: the graph + timeline-manager promotions add the
// fifth and sixth ("!react/graph.tsx", "!react/timeline-manager.tsx"),
// same precedent.
// 2.9.0 AMENDMENT: the command + skeleton promotions add the seventh
// and eighth ("!react/command.tsx", "!react/skeleton.tsx"), same
// precedent — the sources never ship, their compiled .js/.d.ts do.
const FROZEN_KEYS = ["exports", "main", "peerDependencies", "peerDependenciesMeta"];
const FILES_NEGATIONS = ["!react/surface.tsx", "!react/data.tsx", "!react/editorial.tsx", "!react/cards.tsx", "!react/graph.tsx", "!react/timeline-manager.tsx", "!react/command.tsx", "!react/skeleton.tsx"];
let v140pkg = null;
try {
  v140pkg = JSON.parse(execFileSync("git", ["show", "v1.4.0:package.json"], { cwd: root, encoding: "utf8" }));
} catch (error) {
  failures.push(`(b2) could not read v1.4.0:package.json — ${(error instanceof Error ? error.message : String(error)).split("\n")[0]}`);
}
if (v140pkg !== null) {
  const stableJson = (value) => JSON.stringify(value === undefined ? null : value);
  for (const key of FROZEN_KEYS) {
    if (stableJson(pkg[key]) !== stableJson(v140pkg[key])) {
      failures.push(`(b2) package.json "${key}" changed vs v1.4.0 — the distribution surface is FROZEN`);
    }
  }
  // files = v1.4.0's array + the 2.2.0→2.9.0 negations, exactly, in order.
  const expectedFiles = [...(v140pkg.files ?? []), ...FILES_NEGATIONS];
  if (stableJson(pkg.files) !== stableJson(expectedFiles)) {
    failures.push(
      "(b2) package.json files must be the v1.4.0 array EXACTLY plus the negations !react/surface.tsx + !react/data.tsx + !react/editorial.tsx + !react/cards.tsx + !react/graph.tsx + !react/timeline-manager.tsx + !react/command.tsx + !react/skeleton.tsx — the packing contract evolves documented steps",
    );
  }
}

// ---- (b3) npm pack stays EXACTLY 58 files (2.9.1: zero new shipped
// files — the contrast gate + the CLS probe live in playground/, which
// the files array excludes wholesale; css/tokens.css evolves in place).
// 2.9.0 history: 52 → 58 (css/command.css + css/skeleton.css +
// react/command.{js,d.ts} + react/skeleton.{js,d.ts}); playground/ and
// tools/ stay excluded by the files array. ----
let packOutput = "";
try {
  // npm notice lines (incl. "total files:") go to STDERR — capture both streams.
  const packed = spawnSync("npm", ["pack", "--dry-run"], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  packOutput = `${packed.stdout ?? ""}${packed.stderr ?? ""}`;
  if (packed.status !== 0) {
    failures.push("(b3) npm pack --dry-run exited non-zero");
  }
} catch (error) {
  failures.push(`(b3) npm pack --dry-run failed — ${(error instanceof Error ? error.message : String(error)).split("\n")[0]}`);
}
const totalFiles = packOutput.match(/total files:\s*(\d+)/);
if (totalFiles === null) {
  if (packOutput !== "") failures.push("(b3) could not parse npm pack total files output");
} else if (totalFiles[1] !== "58") {
  failures.push(
    `(b3) npm pack must stay at exactly 58 files (2.9.1 adds ZERO shipped files — the gates live in playground/, files-array excluded), found ${totalFiles[1]}`,
  );
}

// ---- (b4) styles.css zero hex ----------------------------------------------------
// 2.2.0: the 15% elevation-border needle MOVED to (s1) — the card border is
// package-owned now (css/surface.css carries the promoted anatomy).
const stylesCss = readFileSync(join(playground, "styles.css"), "utf8");
const styleHexes = stylesCss.match(/#[0-9a-f]{3,8}\b/gi);
if (styleHexes !== null) {
  failures.push(
    `(b4) playground/styles.css contains hex literal(s) ${[...new Set(styleHexes)].join(", ")} — 100% var()/color-mix only`,
  );
}
if (!stylesCss.includes("max-width: 768px")) {
  failures.push("(b4) styles.css must collapse the hub grid at max-width: 768px");
}

// ---- (b5) App shape: provider nesting + PageHero + 4 SurfaceCards ----------------
// 2.2.0 RETARGET: the cards ARE the package's <SurfaceCard> and the hero is
// <PageHero> — the playground composes the official primitives. The b5
// needles pin the composition surface, not the DOM spelling.
const appSrc = readFileSync(join(playground, "App.tsx"), "utf8");
const APP_REQUIREMENTS = [
  ['from "@edwyn/signature-style/react"', "App imports the package through the exports map"],
  ["<ThemeProvider>", "the ThemeProvider wraps the tree"],
  ["<ToastProvider>", "the ToastProvider wraps the dashboard"],
  ["useToast()", "the toast hook drives the feedback card"],
  ["useModal<", "the modal hook drives the timeline card"],
  ['<GlobalNav items={NAV_ITEMS} as={navLink} activeHref={VIEW_HREFS[view]} />', "the global nav tops the page (2.1.0: rendered through the HubLink factory)"],
  ["SurfaceCard,", "the surface primitive is imported from the package (2.2.0)"],
  ["PageHero,", "the page hero primitive is imported from the package (2.2.0)"],
  ["<PageHero title={hero.title} subtitle={hero.sub} />", "the announcing hero renders through the package primitive (n-hub2, 2.2.0)"],
  ['title: "THE ENGINE"', "the hero announces THE ENGINE (n-hub2, per-view HERO_COPY)"],
  ["every primitive, one dashboard · live showcase", "the dashboard hero subtitle string (n-hub2)"],
  ['className="sig-shell"', "THE SHELL (2.5.0 sh1) — every view's content renders inside it (defect #1)"],
  ['<main className="bento12">', "the core dashboard IS the 12-column bento (2.5.0 b12)"],
  ['eyebrow="Forms"', "the check-in card — the teal eyebrow (n-hub3 anatomy, package-owned)"],
  ['eyebrow="Timeline"', "the chronology card — the teal eyebrow"],
  ['eyebrow="Telemetry"', "the telemetry card — the teal eyebrow"],
  ['eyebrow="Palette"', "the palette card — the teal eyebrow"],
  ['eyebrow="Deck"', "the deck card — the teal eyebrow (2.5.0 archetypes)"],
  ['eyebrow="Data"', "the live ledger card — the teal eyebrow"],
  ['eyebrow="Games"', "the matchup card — the teal eyebrow"],
  ['meta="components/forms.tsx"', "the forms card declares its source path"],
  ['meta="components/timeline.tsx"', "the timeline card declares its source path"],
  ['meta="components/viz.tsx"', "the telemetry card declares its source path"],
  ['meta="components/primitives.tsx"', "the palette card declares its source path"],
  ['meta="components/cards.tsx"', "the cards declare their source path (2.5.0)"],
  ['title="Quick Guest Check-In"', "the live-validation form card (2.5.0 defect #5)"],
  ['title="The Chronology"', "the chronology card's ruled title"],
  ['className="sig-span-4 sig-row-2 hub__card--timeline"', "the chronology: span 4 + ROW-SPAN 2 + the timeline modifier (sp1 overrides ride it)"],
  ['title="Budget & RSVP Telemetry"', "the telemetry card's ruled title"],
  ['title="Interactive Deck & Rules"', "the archetypes card's ruled title (2.5.0)"],
  ['title="1v1 Game Matchup & Editorial"', "the matchup card's ruled title (2.5.0)"],
  ['title="The Party Palette"', "the palette card's ruled title"],
  ['title="The Input Matrix"', "the forms-module matrix card's ruled title"],
  ["PartyBadge", "the palette + ledger render party badges"],
  ["StatRing", "the telemetry card renders the live ring"],
  ["onEventSelect={modal.open}", "timeline nodes open the modal"],
  ["SEED_GUESTS", "the live ledger's typed seed (2.5.0 live state)"],
  ["const derived = useMemo(", "the DERIVED layer — every live read is a useMemo of guests"],
];
for (const [needle, label] of APP_REQUIREMENTS) {
  if (!appSrc.includes(needle)) {
    failures.push(`(b5) App.tsx must contain ${needle} — ${label}`);
  }
}
// 2.2.0: the 4-card audit counted SurfaceCards INSIDE the dashboard
// branch. 2.5.0: the bento renders SEVEN — check-in, chronology,
// telemetry, deck, palette, ledger, matchup — all interactive.
const dashStart = appSrc.indexOf("function DashboardView");
const dashEnd = appSrc.indexOf("function IndexView");
if (dashStart === -1 || dashEnd === -1 || dashEnd < dashStart) {
  failures.push("(b5) DashboardView…IndexView functions missing — the dashboard branch cannot be audited");
} else {
  const dashSlice = appSrc.slice(dashStart, dashEnd);
  const surfaceCount = (dashSlice.match(/<SurfaceCard/g) ?? []).length;
  if (surfaceCount !== 7) {
    failures.push(`(b5) the dashboard branch must render exactly 7 SurfaceCards (the bento assembly), found ${surfaceCount}`);
  }
  const interactiveCount = (dashSlice.match(/interactive\s*(\/?>|className)/g) ?? []).length;
  if (interactiveCount !== 7) {
    failures.push(`(b5) all seven bento cards must be interactive hover modules, found interactive on ${interactiveCount}`);
  }
  const liveNeedles = [
    ["useState<Guest[]>(SEED_GUESTS)", "the guests state seeds from SEED_GUESTS"],
    ["const checkIn = useCallback(", "the append handler flows to the form"],
    ["derived.ledgerRows", "the ledger rows derive from state"],
    ["derived.ringValue", "the ring value derives from state"],
    ["derived.spentPct", "the budget bars derive from state"],
    ["RSVP_TO_STATE", "the radio value maps to the ledger RSVP"],
  ];
  for (const [needle, label] of liveNeedles) {
    if (!dashSlice.includes(needle)) {
      failures.push(`(b5) the live-state wiring is missing ${needle} — ${label}`);
    }
  }
}

// ---- (b6) every icon name used in App.tsx exists in lucide's icons map ----------
const iconNames = [...appSrc.matchAll(/icon(?:Name)?: "(\w+)"/g)].map((m) => m[1]);
if (iconNames.length === 0) {
  failures.push("(b6) App.tsx declares no event icons — the timeline nodes would be blank");
} else {
  try {
    const { icons } = await import("lucide-react");
    for (const name of new Set(iconNames)) {
      if (!(name in icons)) {
        failures.push(`(b6) icon "${name}" does not exist in the lucide-react icons map`);
      }
    }
  } catch (error) {
    failures.push(`(b6) could not load lucide-react — ${(error instanceof Error ? error.message : String(error)).split("\n")[0]}`);
  }
}

// ---- (h1) staggered load-in + reduced-motion escape + ruled headers --------------
// 2.2.0 RETARGET: the stagger animates the package's .sig-surface-card
// primitives. 2.5.0 RETARGET: the stagger animates the BENTO CELLS
// (.bento12 > *, 11 cells at 50ms steps) — the 12-column grid's direct
// children (banner, KPI cells, cards); the ruled headers are
// package-owned now (css/surface.css .sig-surface-card__title).
if (!stylesCss.includes("@keyframes slideUpFade")) {
  failures.push("(h1) styles.css must declare @keyframes slideUpFade");
}
if (!stylesCss.includes("animation: slideUpFade 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards")) {
  failures.push(
    "(h1) the bento cells must animate slideUpFade 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
  );
}
if (!/\.bento12 > \*\s*\{[^}]*opacity: 0;/s.test(stylesCss)) {
  failures.push("(h1) .bento12 > * needs the opacity: 0 animation base");
}
for (const [child, delay] of [[1, "0.05s"], [2, "0.1s"], [5, "0.25s"], [11, "0.55s"]]) {
  const stagger = new RegExp(
    `\\.bento12 > \\*:nth-child\\(${child}\\)\\s*\\{[^}]*animation-delay: ${delay.replace(".", "\\.")};`,
    "s",
  );
  if (!stagger.test(stylesCss)) {
    failures.push(`(h1) .bento12 > *:nth-child(${child}) must stagger at animation-delay: ${delay}`);
  }
}
const reduceEscape = /@media \(prefers-reduced-motion: reduce\)\s*\{[^}]*\.bento12 > \*\s*\{[^}]*animation: none;[^}]*opacity: 1;/s;
if (!reduceEscape.test(stylesCss)) {
  failures.push(
    "(h1) MANDATORY prefers-reduced-motion: reduce escape missing — without animation: none + opacity: 1, reduced-motion users get permanently invisible bento cells",
  );
}
// The ruled headers live in the package (css/surface.css) since 2.2.0 —
// the class-on-the-h2 upgrade of the old `.hub__card > h2` child combinator.
const surfaceCssH1 = readFileSync(resolve(root, "css/surface.css"), "utf8");
if (!surfaceCssH1.includes(".sig-surface-card__title")) {
  failures.push("(h1) ruled headers expected on .sig-surface-card__title (package-owned anatomy since 2.2.0)");
}
if (!surfaceCssH1.includes("padding-bottom: var(--space-tight)")) {
  failures.push("(h1) ruled headers need padding-bottom: var(--space-tight)");
}
if (!surfaceCssH1.includes("border-bottom: 1px solid color-mix(in srgb, var(--text-muted) 10%, transparent)")) {
  failures.push("(h1) ruled headers need the 10% color-mix hairline");
}

// ---- (h2) owner-shaped mockEvents + the ONE mapping layer ------------------------
const mockSlice = appSrc.match(/const mockEvents: MockEvent\[\] = \[([\s\S]*?)\n\];/);
if (mockSlice === null) {
  failures.push("(h2) App.tsx must declare `const mockEvents: MockEvent[]`");
} else {
  const entries = mockSlice[1].match(/\{[^{}]+\}/g) ?? [];
  if (entries.length < 4) {
    failures.push(`(h2) mockEvents needs ≥4 entries, found ${entries.length}`);
  }
  for (const entry of entries) {
    const id = entry.match(/id: "([^"]+)"/)?.[1] ?? "?";
    for (const field of ["id", "month", "title", "time", "colorToken", "iconName"]) {
      if (!new RegExp(`${field}: "`).test(entry)) {
        failures.push(`(h2) mockEvents entry ${id} is missing field ${field}`);
      }
    }
    if (!entry.includes('colorToken: "--party-')) {
      failures.push(`(h2) mockEvents entry ${id} colorToken must be a --party-* token`);
    }
  }
  const buckets = new Set([...mockSlice[1].matchAll(/month: "([^"]+)"/g)].map((m) => m[1]));
  if (buckets.size < 2) {
    failures.push(`(h2) mockEvents must span ≥2 month buckets, found ${buckets.size}`);
  }
}
for (const [mapping, label] of [
  ["date: e.month", "month → date"],
  ["category: e.colorToken", "colorToken → category"],
  ["categoryLabel: CATEGORY_LABELS[e.colorToken]", "colorToken → categoryLabel"],
  ["icon: e.iconName", "iconName → icon"],
]) {
  if (!appSrc.includes(mapping)) {
    failures.push(`(h2) the mapping layer is missing ${mapping} — ${label}`);
  }
}

// ---- (h3) every mockEvents iconName probes against the LIVE lucide icons map ------
const mockIconNames = [...appSrc.matchAll(/iconName: "(\w+)"/g)].map((m) => m[1]);
if (mockIconNames.length === 0) {
  failures.push("(h3) mockEvents declares no iconName fields — nodes would be blank");
} else {
  try {
    const { icons } = await import("lucide-react");
    for (const name of new Set(mockIconNames)) {
      if (!(name in icons)) {
        failures.push(`(h3) iconName "${name}" does not exist in the LIVE lucide-react icons map`);
      }
    }
  } catch (error) {
    failures.push(`(h3) could not load lucide-react — ${(error instanceof Error ? error.message : String(error)).split("\n")[0]}`);
  }
}

// ---- (e1) AMBIENT ELEVATION markers + the surface-scoped shadow contract -------
// OWNER OVERRIDE (1.6.0, reaffirmed 1.8.0 + 2.0.0): elevation lives in THE
// COMPOSITION LAYER — and, since 2.2.0, in css/surface.css, where the ambient
// elevation contract ships WITH the promoted .sig-surface-card primitive.
// 2.2.0 RESCOPE: every css/ file stays ABSOLUTE ZERO on box-shadow EXCEPT
// css/surface.css. 2.6.0 AMENDMENT (chromatic elevation): inside surface.css,
// shadow declarations are permitted ONLY under (a) selectors containing
// `.sig-surface-card` (the primitive + its modifiers), (b) the three BARE
// elevation-tier blocks `[data-elevation="flat"|"raised"|"floating"]` (the
// shared ladder — the featured TierCard rides it from css/cards.css which
// itself stays absolute zero), (c) selectors containing `[data-accent]` (the
// chromatic glow contract). Hex literals stay banned EVERYWHERE —
// surface.css's sanctioned literals are rgba only. styles.css keeps the
// composition elevations it still owns: the button pop, the node shadow.
const ELEVATION_REQUIREMENTS = [
  ["font-weight: 600", "the button hierarchy pop (was 500)"],
  ["0 4px 16px rgba(0, 0, 0, 0.3)", "the button's own elevation"],
];
for (const [needle, label] of ELEVATION_REQUIREMENTS) {
  if (!stylesCss.includes(needle)) {
    failures.push(`(e1) styles.css must contain ${needle} — ${label}`);
  }
}
const ELEVATION_TIER_SELECTORS = [
  '[data-elevation="flat"]',
  '[data-elevation="raised"]',
  '[data-elevation="floating"]',
];
for (const rel of readdirSync(resolve(root, "css")).map((f) => join("css", f))) {
  const text = readFileSync(resolve(root, rel), "utf8");
  const isSurface = rel === join("css", "surface.css");
  const shadowDecls = text.match(/box-shadow\s*:\s*[^;]+;/g);
  const nonNoneShadows = (shadowDecls ?? []).filter((d) => !/^box-shadow\s*:\s*none\s*;$/i.test(d));
  if (isSurface) {
    // THE OWNER SANCTION, scoped (2.6.0 amendment): strip comments, then
    // audit each rule block — a shadow may only appear under a
    // .sig-surface-card selector, one of the three bare elevation-tier
    // blocks, or a [data-accent] chromatic-glow rule.
    if (nonNoneShadows.length > 0) {
      const noComments = text.replace(/\/\*[\s\S]*?\*\//g, "");
      for (const block of noComments.split("}")) {
        if (!/box-shadow\s*:\s*[^;]+;/.test(block)) continue;
        const braceIdx = block.indexOf("{");
        const selector = braceIdx === -1 ? "" : block.slice(0, braceIdx).trim();
        const sanctioned =
          selector.includes(".sig-surface-card") ||
          ELEVATION_TIER_SELECTORS.some((tier) => selector === tier) ||
          selector.includes("[data-accent]");
        if (!sanctioned) {
          failures.push(
            `(e1) css/surface.css declares a box-shadow OUTSIDE a sanctioned rule (selector: ${selector || "?"}) — the 2.6.0 amendment covers .sig-surface-card rules, the three [data-elevation] tier blocks, and [data-accent] glow rules ONLY`,
          );
        }
      }
    }
    // Hex-ban holds in the sanctioned file too: rgba literals are the
    // documented exception, hex is not.
    const surfaceHexes = text.match(/#[0-9a-f]{3,8}\b/gi);
    if (surfaceHexes !== null) {
      failures.push(
        `(e1) css/surface.css contains hex literal(s) ${[...new Set(surfaceHexes)].join(", ")} — the owner sanction covers the rgba elevation literals ONLY, hex stays banned`,
      );
    }
  } else if (nonNoneShadows.length > 0) {
    failures.push(
      `(e1) ${rel} declares a box-shadow (${nonNoneShadows.join(" ")}) — ambient elevation is composition-layer/surface.css ONLY; this file stays flat`,
    );
  }
}

// ---- (e2) TIMELINE RESURRECTION needles + v1.8.0-baseline deletion guard ----------
// The probe-proven fixes must be present, and the timeline diff vs the NEW
// baseline (v1.8.0, rebased for 2.0.0) must delete NO CSS code — only comment
// prose may be rewritten. The allowlist is RESET for v2.0.0: the v1.8.0
// single-use entry ("background: var(--bg-base);") was consumed by THAT
// release. v2.0.0 sanctions nothing — timeline.css was untouched this
// release, so the diff is empty and (e2) passes trivially.
const timelineCss16 = readFileSync(resolve(root, "css/timeline.css"), "utf8");
const RESURRECTION_NEEDLES = [
  ["align-self: start", "the spanning sticky header must not stretch into a cover slab"],
  ["position: relative", "the node must paint over the ::before center line"],
  ["TIMELINE RESURRECTION", "the documented WHY comment for the fix"],
];
for (const [needle, label] of RESURRECTION_NEEDLES) {
  if (!timelineCss16.includes(needle)) {
    failures.push(`(e2) css/timeline.css must contain ${needle} — ${label}`);
  }
}
let timelineDiffLines = [];
try {
  timelineDiffLines = execFileSync(
    "git",
    ["diff", "v1.8.0", "--", "css/timeline.css"],
    { cwd: root, encoding: "utf8" },
  ).split("\n");
} catch (error) {
  failures.push(`(e2) could not diff css/timeline.css vs v1.8.0 — ${(error instanceof Error ? error.message : String(error)).split("\n")[0]}`);
}
const deletions = timelineDiffLines.filter((l) => l.startsWith("-") && !l.startsWith("---"));
// Precise check: map each deleted line back to its position in the v1.8.0
// file (via `git diff -U0` hunk headers) and fail if any deleted line sat
// OUTSIDE a /* */ comment — unless it is explicitly allowlisted, and the
// v2.0.0 allowlist is deliberately EMPTY (see the header).
const E2_DELETED_ALLOWLIST = [];
let allowlist = [...E2_DELETED_ALLOWLIST];
let oldTimeline = null;
try {
  oldTimeline = execFileSync("git", ["show", "v1.8.0:css/timeline.css"], { cwd: root, encoding: "utf8" }).split("\n");
} catch (error) {
  failures.push(`(e2) could not read v1.8.0:css/timeline.css — ${(error instanceof Error ? error.message : String(error)).split("\n")[0]}`);
}
/** Per-line "inside a block comment" flags for the old file. */
function commentMask(lines) {
  const mask = lines.map(() => false);
  let inside = false;
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const startedInside = inside;
    // A bare closer with no opener while outside a comment is the legacy
    // parse-bug prose itself (e.g. the tail of the poisoned node comment):
    // such a line can never be valid code — classify it as comment.
    const danglingCloser = !startedInside && line.includes("*/") && !line.includes("/*");
    let commented = startedInside || danglingCloser;
    while (line.length > 0) {
      if (!inside) {
        const open = line.indexOf("/*");
        if (open === -1) break;
        line = line.slice(open + 2);
        inside = true;
      } else {
        const close = line.indexOf("*/");
        if (close === -1) break;
        line = line.slice(close + 2);
        inside = false;
      }
    }
    mask[i] = commented || inside || lines[i].includes("/*");
  }
  return mask;
}
if (oldTimeline !== null) {
  const mask = commentMask(oldTimeline);
  let codeDeleted = false;
  let oldLine = 0;
  for (const l of timelineDiffLines) {
    const hunk = l.match(/^@@\s*-(\d+)/);
    if (hunk !== null) {
      oldLine = Number(hunk[1]) - 1; // 0-based
      continue;
    }
    if (l.startsWith("-") && !l.startsWith("---")) {
      if (mask[oldLine] !== true) {
        const deletedCode = l.slice(1).trim();
        const allowIdx = allowlist.indexOf(deletedCode);
        if (allowIdx === -1) {
          failures.push(`(e2) css/timeline.css diff vs v1.8.0 DELETES CSS code (old line ${oldLine + 1}): ${l} — only comment prose may be rewritten (the v2.0.0 allowlist is EMPTY: the v1.8.0 single-use entry was consumed by that release)`);
          codeDeleted = true;
        } else {
          // sanctioned — consume the single-use allowance
          allowlist.splice(allowIdx, 1);
        }
      }
      oldLine += 1;
    } else if (!l.startsWith("+")) {
      // context line exists in old file
      oldLine += 1;
    }
  }
  if (codeDeleted) {
    // already reported per line
  }
} else {
  failures.push("(e2) cannot run the code-deletion check — v1.8.0:css/timeline.css unavailable");
}

// ---- (b7) SAFETY PROOF: core deltas vs v2.9.0 are owner-authorized ----------
// 2.9.1 REBASE (the floor moves v2.8.0 → v2.9.0): the contrast patch. The
// owner-authorized 2.9.1 deltas, and NOTHING else:
//   css/tokens.css           — the TWO party token values + fix comments
//                              (--party-mauve-bright → #9e5ff2,
//                              --party-blue → #89b4fa; zero contrast debt)
//   tokens.json              — the same two values + their documented
//                              descriptions + meta.version → 2.9.1
//                              (deep-equal guarded below)
//   scripts/verify.mjs       — the two (p) pin re-targets. OWNER-SANCTIONED
//                              this release: the frozen gate pinned the exact
//                              old hexes against BOTH css/tokens.css and
//                              tokens.json, and a legitimate value change
//                              makes that unsatisfiable (the manifest must
//                              carry the real value — the duplicate-
//                              declaration CSS escape still fails the
//                              manifest check). The floor rebases with the
//                              release — the same discipline the (b7) gate
//                              itself carries ("each release that
//                              legitimately touches core rebases the floor").
// react/, demo/, SYSTEM_PROMPT.md, tools/ stay byte-identical to v2.9.0.
const B7_LOCKED_291 = ["css/", "react/", "SYSTEM_PROMPT.md", "demo/", "scripts/"];
const AUTHORIZED_291 = new Set([
  "css/tokens.css",
  "tokens.json",
  "scripts/verify.mjs",
]);
let b7Changed = [];
try {
  b7Changed = execFileSync(
    "git",
    ["diff", "v2.9.0", "--name-only", "--", ...B7_LOCKED_291],
    { cwd: root, encoding: "utf8" },
  )
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
} catch (error) {
  failures.push(`(b7) could not diff against v2.9.0 — ${(error instanceof Error ? error.message : String(error)).split("\n")[0]}`);
}
for (const file of b7Changed) {
  if (!AUTHORIZED_291.has(file)) {
    failures.push(
      `(b7) SAFETY: ${file} changed since v2.9.0 — outside the owner-authorized 2.9.1 delta set (css/tokens.css two party values, tokens.json values+descriptions+meta, scripts/verify.mjs the two (p) pins)`,
    );
  }
}
if (b7Changed.includes("demo/") || b7Changed.some((f) => f.startsWith("demo/"))) {
  failures.push("(b7) SAFETY: demo/ is LOCKED in 2.9.1");
}
if (b7Changed.some((f) => f.startsWith("scripts/") && f !== "scripts/verify.mjs")) {
  failures.push("(b7) SAFETY: scripts/ is LOCKED in 2.9.1 beyond the sanctioned verify.mjs pin re-targets");
}

// tokens.json guard (baseline v2.9.0): identical after neutralizing
// meta.version AND the two authorized party deltas (value + description —
// the descriptions carry the fix provenance). Everything else — the
// 34-token whitelist, themes, shared tokens, the doctrines — is LOCKED.
try {
  const v290tokens = JSON.parse(execFileSync("git", ["show", "v2.9.0:tokens.json"], { cwd: root, encoding: "utf8" }));
  const currentTokens = JSON.parse(readFileSync(resolve(root, "tokens.json"), "utf8"));
  const AUTHORIZED_PARTY_291 = new Set(["--party-mauve-bright", "--party-blue"]);
  const neutralize = (manifest) => {
    const clone = structuredClone(manifest);
    delete clone.meta.version;
    for (const [name, entry] of Object.entries(clone.partyPalette?.tokens ?? {})) {
      if (AUTHORIZED_PARTY_291.has(name)) {
        delete entry.value;
        delete entry.description;
      }
    }
    return JSON.stringify(clone);
  };
  if (neutralize(v290tokens) !== neutralize(currentTokens)) {
    failures.push(
      "(b7) SAFETY: tokens.json changed beyond meta.version + the two authorized party deltas (value + description of --party-mauve-bright/--party-blue) — the whitelist, themes, shared tokens and doctrines are LOCKED in 2.9.1",
    );
  }
} catch (error) {
  failures.push(`(b7) could not verify the tokens.json 2.9.1 delta — ${(error instanceof Error ? error.message : String(error)).split("\n")[0]}`);
}

// ---- (n-hub4) THE V2.9.1 FROZEN PROOF — v2.9.0 baseline, tools/ included ----
// tools/ takes ZERO deltas this release (the probes ride the playground's
// own playwright scripts + custom selectors; server.ts is untouched). The
// authorized set is the 2.9.1 trio from (b7).
const N_HUB4_LOCKED_291 = ["css/", "react/", "demo/", "SYSTEM_PROMPT.md", "scripts/", "tools/"];
try {
  const v2SafetyDiff = execFileSync(
    "git",
    ["diff", "v2.9.0", "--name-only", "--", ...N_HUB4_LOCKED_291],
    { cwd: root, encoding: "utf8" },
  )
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "" && !AUTHORIZED_291.has(line));
  if (v2SafetyDiff.length > 0) {
    failures.push(
      `(n-hub4) SAFETY: files changed since v2.9.0 beyond the 2.9.1 authorization — ${v2SafetyDiff.join(", ")} (tools/, demo/ and scripts/-beyond-verify.mjs are LOCKED; css/react deltas must be in the authorized set)`,
    );
  }
} catch (error) {
  failures.push(`(n-hub4) could not diff against v2.9.0 — ${(error instanceof Error ? error.message : String(error)).split("\n")[0]}`);
}

// ---- (m1) the compiled MCP server exists -----------------------------------------
// The Visual Cortex is source-of-truth tools/mcp-viz/server.ts → tsc →
// dist/server.js. tools/ is never packed (files array + gate b3 prove it);
// this gate only asks that the build artifact is present.
const mcpDistServer = resolve(root, "tools/mcp-viz/dist/server.js");
if (!existsSync(mcpDistServer)) {
  failures.push(
    "(m1) tools/mcp-viz/dist/server.js is missing — build it: cd tools/mcp-viz && npm run build",
  );
}

// ---- (m2) smoke-proof artifact wired ---------------------------------------------
// The release-blocker proof lives in tools/mcp-viz/smoke.mjs (raw JSON-RPC
// over stdio); root package.json must expose it as verify:mcp. The actual
// run is the separate `npm run verify:mcp` gate — needs the dev server.
const mcpPkgPath = resolve(root, "tools/mcp-viz/package.json");
const mcpSmokePath = resolve(root, "tools/mcp-viz/smoke.mjs");
if (!existsSync(mcpSmokePath)) {
  failures.push("(m2) tools/mcp-viz/smoke.mjs is missing — no smoke proof artifact");
}
try {
  const mcpPkg = JSON.parse(readFileSync(mcpPkgPath, "utf8"));
  if (mcpPkg.name !== "@edwyn/visual-cortex-mcp" || mcpPkg.private !== true) {
    failures.push('(m2) tools/mcp-viz/package.json must be private "@edwyn/visual-cortex-mcp"');
  }
} catch (error) {
  failures.push(`(m2) cannot read tools/mcp-viz/package.json — ${(error instanceof Error ? error.message : String(error)).split("\n")[0]}`);
}
if (typeof pkg.scripts?.["verify:mcp"] !== "string") {
  failures.push('(m2) root package.json scripts["verify:mcp"] is missing — the smoke must be runnable');
}

// ---- (m3) data-testid wiring for the visual cortex -------------------------------
// 2.2.0 EVOLUTION: the four CARD hooks retired with the .hub__card section —
// the cards are the package's .sig-surface-card primitives now, and the
// cortex's stable card hook is the CLASS selector itself (the default sweep
// carries ".sig-surface-card"; pinned by the server.ts needles in (s2)'s
// compiled-dist check and the verify:mcp smoke's surface hits). What stays:
// the metric hooks (plus the 2.2.0 guests row) and the primary toast button.
const TESTID_NEEDLES = [
  ['data-testid="metric-budget-remaining"', "the budget-remaining metric hook"],
  ['data-testid="metric-budget-spent"', "the budget-spent metric hook"],
  ['data-testid="metric-guests"', "the guests-confirmed metric hook (2.2.0)"],
  ['data-testid="metric-rsvp"', "the rsvp metric hook"],
  ['data-testid="btn-toast"', "the primary toast button hook"],
  ['data-testid="tabs-module"', "the 2.3.0 module-switcher hook"],
  ['data-testid="data-table-ledger"', "the 2.3.0 data-module ledger hook"],
  ['data-testid="kpi-trio"', "the 2.4.0 StatCard KPI trio hook"],
  ['data-testid="banner-release"', "the 2.4.0 announcement banner hook"],
  ['data-testid="carousel-clippings"', "the 2.4.0 palette clippings carousel hook"],
  ['data-testid="guest-form"', "the 2.5.0 live check-in form hook (defect #5)"],
  ['data-testid="ledger-table"', "the 2.5.0 LIVE ledger hook (the bento's span-7 card)"],
  ['data-testid="ring-rsvp"', "the 2.5.0 live RSVP ring hook"],
];
for (const [needle, label] of TESTID_NEEDLES) {
  if (!appSrc.includes(needle)) {
    failures.push(`(m3) App.tsx must carry ${needle} — ${label}`);
  }
}
// The retired-hub era must be gone from the DOM CONTRACT — classes and
// testids. ("bento12"/"sig-span-*" are the OWNER's 2.5.0 vocabulary, not
// the retired hub-era bento__* classes; the scan targets those.)
if (/(className|data-testid)="[^"]*(bento__|bento-card)/.test(appSrc)) {
  failures.push("(m3) App.tsx still wires retired hub-era classes/testids — the migration must be complete");
}

// ---- (n-hub1) THE CONSTRAINED COLUMN — 2.0.0 hub grid, 2.5.0 rebased ------
// The SHELL (.sig-shell, gate sh1) owns the 1400px column now; .hub is
// ONLY the auto-fit packing grid for the master index and the workshop
// placeholders. The 768px collapse and the stagger stay pinned by
// (b4)/(h1).
const hubContainer = /^\.hub \{[^}]*grid-template-columns: repeat\(auto-fit, minmax\(400px, 1fr\)\);/sm;
if (!hubContainer.test(stylesCss)) {
  failures.push(
    "(n-hub1) styles.css must declare the auto-fit hub packing grid — .hub { … grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); } (the column constraint moved to .sig-shell in 2.5.0)",
  );
}
const hubSpan = /\.hub__card--timeline\s*\{[^}]*grid-row: span 2;/s;
if (!hubSpan.test(stylesCss)) {
  failures.push(
    "(n-hub1) .hub__card--timeline must span two rows (grid-row: span 2) — the bento's .sig-row-2 mirrors it; the modifier keeps the breathing-room overrides attached",
  );
}

// ---- (n-hub2) THE ANNOUNCED HEADER — checked in (b5) App needles -----------------
// (the hero strings live in APP_REQUIREMENTS; 2.2.0: the hero renders through
// the package <PageHero> primitive. This comment anchors the suite numbering —
// n-hub2 has no styles.css side; the .sig-page-hero css is package-owned and
// pinned by (s1)/(n-hub3) style needles in css/surface.css.)

// ---- (n-hub3) THE SHED CARD ANATOMY + TACTILE HOVER — package-owned (2.2.0) ------
// The anatomy (meta row / teal eyebrow / mono path / ruled title / hover lift)
// is css/surface.css's now; the METRIC AIR mandate stays playground-local.
const surfaceCssMeta = readFileSync(resolve(root, "css/surface.css"), "utf8");
const metaRow = /\.sig-surface-card__meta\s*\{[^}]*justify-content: space-between;[^}]*align-items: baseline;/s;
if (!metaRow.test(surfaceCssMeta)) {
  failures.push(
    "(n-hub3) .sig-surface-card__meta must be space-between + baseline (teal eyebrow left, mono path right)",
  );
}
const tealLabel = /\.sig-surface-card__eyebrow\s*\{[^}]*color: var\(--color-cake-secondary\);[^}]*text-transform: uppercase;/s;
if (!tealLabel.test(surfaceCssMeta)) {
  failures.push(
    "(n-hub3) .sig-surface-card__eyebrow must be the signature teal (var(--color-cake-secondary)) with text-transform: uppercase (content stays capitalized words)",
  );
}
const monoPath = /\.sig-surface-card__path\s*\{[^}]*font-family: var\(--font-mono, ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace\);[^}]*color: var\(--text-muted\);/s;
if (!monoPath.test(surfaceCssMeta)) {
  failures.push(
    '(n-hub3) .sig-surface-card__path must be muted mono — font-family: var(--font-mono, ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace) + var(--text-muted)',
  );
}
const hoverLift = /\.sig-surface-card--interactive:hover\s*\{[^}]*transform: translateY\(-2px\);[^}]*0 16px 40px rgba\(0, 0, 0, 0\.5\);/s;
if (!hoverLift.test(surfaceCssMeta)) {
  failures.push(
    "(n-hub3) .sig-surface-card--interactive:hover must lift translateY(-2px) with the deepened 0 16px 40px rgba(0, 0, 0, 0.5) ambient shadow — the tactile half of the owner elevation override",
  );
}
const metricAir = /\.hub__metric\s*\{[^}]*margin-bottom: var\(--space-standard\);/s;
if (!metricAir.test(stylesCss)) {
  failures.push(
    "(n-hub3) .hub__metric must carry margin-bottom: var(--space-standard) — the owner mandate of ≥16px air under every metric label row",
  );
}

// ---- (g2) GLASS HEADER + NODE ELEVATION — the doctrine boundary ------------------
// css/timeline.css: the 1.8.0 glass header needles (translucent 80% surface
// + blur). playground/styles.css: the node-shadow needle — and ONLY there.
const timelineCss18 = readFileSync(resolve(root, "css/timeline.css"), "utf8");
const GLASS_NEEDLES = [
  ["color-mix(in srgb, var(--bg-surface) 80%, transparent)", "the 80% translucent glass surface on .ptp-timeline__header"],
  ["-webkit-backdrop-filter: blur(8px)", "the webkit-prefixed glass blur"],
  ["backdrop-filter: blur(8px)", "the glass blur behind the sticky header"],
];
for (const [needle, label] of GLASS_NEEDLES) {
  if (!timelineCss18.includes(needle)) {
    failures.push(`(g2) css/timeline.css must contain ${needle} — ${label}`);
  }
}
const nodeShadow = /\.sig-surface-card \.ptp-timeline__node\s*\{[^}]*box-shadow: 0 4px 12px rgba\(0, 0, 0, 0\.2\);/s;
if (!nodeShadow.test(stylesCss)) {
  failures.push(
    "(g2) styles.css must carry the composition-layer node elevation — .sig-surface-card .ptp-timeline__node { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); } (2.2.0: the ancestor is the package primitive)",
  );
}
// THE DOCTRINE BOUNDARY, enforced twice: the package file itself must still
// declare ZERO box-shadow (belt-and-braces with the (e1) css/-wide scan —
// this one names the boundary: elevation is composition-layer ONLY).
const tlShadowDecls = timelineCss18.match(/box-shadow\s*:\s*[^;]+;/g) ?? [];
const tlNonNone = tlShadowDecls.filter((d) => !/^box-shadow\s*:\s*none\s*;$/i.test(d));
if (tlNonNone.length > 0) {
  failures.push(
    `(g2) css/timeline.css declares a box-shadow (${tlNonNone.join(" ")}) — node elevation is composition-layer ONLY; the package keeps its zero-shadow law`,
  );
}

// ---- (g3) TELEMETRY — space-between metrics + breathing bars ---------------------
const metricRow = /\.hub__metric\s*\{[^}]*justify-content: space-between;[^}]*align-items: flex-end;/s;
if (!metricRow.test(stylesCss)) {
  failures.push(
    "(g3) .hub__metric must be space-between + flex-end (caption left, value flush right, shared bottom floor)",
  );
}
const breathingBars = /\.hub__metric \.ptp-progress,\s*\.hub__metric \+ \.ptp-progress\s*\{[^}]*margin-top: var\(--space-tight\);/s;
if (!breathingBars.test(stylesCss)) {
  failures.push(
    "(g3) the composition-scoped breathing-bars rule is missing — .hub__metric .ptp-progress, .hub__metric + .ptp-progress { margin-top: var(--space-tight); } (package viz.css untouched)",
  );
}

// ---- (s1) SURFACE PRIMITIVES — the promoted Shed anatomy (2.2.0) -----------------
// css/surface.css is the OFFICIAL home of the card anatomy (moved out of the
// playground layer): 15% token-mix border, inset top-highlight, ambient
// shadow, tactile hover, teal eyebrow. Plus the 2.2.0 telemetry-limits
// caption needle in css/viz.css (tabular-nums — digits never jitter).
const surfaceCssPath = resolve(root, "css/surface.css");
if (!existsSync(surfaceCssPath)) {
  failures.push("(s1) css/surface.css is missing — the surface primitives ship their own stylesheet");
} else {
  const surfaceCss = readFileSync(surfaceCssPath, "utf8");
  const SURFACE_REQUIREMENTS = [
    ["color-mix(in srgb, var(--text-muted) 15%, transparent)", "the 15% elevation card border"],
    // 2.6.0 AMENDMENT: the raised tier re-tunes — the base card default is
    // inset 0.06 + ambient 0.42; the hover deepen 0.5 stands.
    ["inset 0 1px 0 rgba(255, 255, 255, 0.06)", "the glass inset top-highlight on .sig-surface-card"],
    ["0 12px 32px rgba(0, 0, 0, 0.42)", "the soft ambient shadow on .sig-surface-card"],
    ["transform: translateY(-2px)", "the tactile hover lift on the --interactive modifier"],
    ["0 16px 40px rgba(0, 0, 0, 0.5)", "the deepened hover ambient shadow"],
    ["color: var(--color-cake-secondary)", "the signature teal eyebrow"],
    ["text-transform: uppercase", "the all-caps eyebrow (content stays capitalized words)"],
    ["border-bottom: 1px solid color-mix(in srgb, var(--text-muted) 10%, transparent)", "the ruled title hairline"],
  ];
  for (const [needle, label] of SURFACE_REQUIREMENTS) {
    if (!surfaceCss.includes(needle)) {
      failures.push(`(s1) css/surface.css must contain ${needle} — ${label}`);
    }
  }
}
const vizCss22 = readFileSync(resolve(root, "css/viz.css"), "utf8");
const captionRule = /\.ptp-progress__caption\s*\{[^}]*font-variant-numeric: tabular-nums;[^}]*color: var\(--text-muted\);[^}]*font-size: 0\.75rem;/s;
if (!captionRule.test(vizCss22)) {
  failures.push(
    "(s1) css/viz.css must carry the limit caption — .ptp-progress__caption { font-variant-numeric: tabular-nums; color: var(--text-muted); font-size: 0.75rem; } (digits never jitter)",
  );
}

// ---- (s2) UMBRELLA RE-EXPORTS — SurfaceCard + PageHero (2.2.0) -------------------
// Types live in index.d.ts, values additionally in index.js (same surface
// split as every other export), and the compiled react/surface.{js,d.ts}
// must exist on disk — the build artifact contract.
const umbrellaDts = readFileSync(resolve(root, "react/index.d.ts"), "utf8");
const umbrellaJs = readFileSync(resolve(root, "react/index.js"), "utf8");
const surfaceJsPath = resolve(root, "react/surface.js");
const surfaceDtsPath = resolve(root, "react/surface.d.ts");
if (!existsSync(surfaceJsPath)) {
  failures.push("(s2) react/surface.js is missing — build it: npx tsc -p tsconfig.json");
}
if (!existsSync(surfaceDtsPath)) {
  failures.push("(s2) react/surface.d.ts is missing — build it: npx tsc -p tsconfig.json");
}
for (const surfaceExport of ["SurfaceCard", "SurfaceCardProps", "PageHero", "PageHeroProps"]) {
  if (!new RegExp(`\\b${surfaceExport}\\b`).test(umbrellaDts)) {
    failures.push(
      `react/index.d.ts must re-export ${surfaceExport} from the umbrella entry point`,
    );
  }
}
for (const surfaceValueExport of ["SurfaceCard", "PageHero"]) {
  if (!new RegExp(`\\b${surfaceValueExport}\\b`).test(umbrellaJs)) {
    failures.push(
      `react/index.js must re-export ${surfaceValueExport} from the umbrella entry point`,
    );
  }
}

// ---- (v22) TELEMETRY LIMITS — the LIVING v1 evolution (2.2.0) --------------------
// scripts/verify.mjs is byte-frozen; its v1 floor reads the viz.css migration
// marker. THIS gate carries the 2.2.0 contract: the inset track + 20% hairline
// boundary in css/viz.css, and the react/viz.tsx surface (limitText caption,
// ring boundary hairline circle, centered tabular-nums readout).
const vizSrc22 = readFileSync(resolve(root, "react/viz.tsx"), "utf8");
const vizTrack = /\.ptp-progress\s*\{[^}]*background: var\(--bg-inset\);[^}]*border: 1px solid color-mix\(in srgb, var\(--text-muted\) 20%, transparent\);/s;
if (!vizTrack.test(vizCss22)) {
  failures.push(
    "(v22) css/viz.css must retarget the track — .ptp-progress { background: var(--bg-inset); border: 1px solid color-mix(in srgb, var(--text-muted) 20%, transparent); } (the surface-on-surface fix; the 100% boundary reads on any card)",
  );
}
const VIZ_TSX_REQUIREMENTS = [
  ["limitText", "the limit caption prop (ProgressBar)"],
  ["ptp-progress__caption", "the caption class the third element wears"],
  ["r={47.5}", "the ring boundary hairline circle (SVG-native border)"],
  ['stroke="color-mix(in srgb, var(--text-muted) 20%, transparent)"', "the 20% hairline boundary stroke"],
  ["showValue", "the optional centered ring readout (default true)"],
  ['textAnchor="middle"', "the centered readout anchoring"],
  ["dominantBaseline=\"central\"", "the centered readout vertical alignment"],
  ["fontVariantNumeric: \"tabular-nums\"", "the readout's tabular digits"],
];
for (const [needle, label] of VIZ_TSX_REQUIREMENTS) {
  if (!vizSrc22.includes(needle)) {
    failures.push(`react/viz.tsx must contain ${JSON.stringify(needle)} — ${label}`);
  }
}

// ---- (sp1) TIMELINE HEADER BREATHING ROOM — the MEASURED override ------------
// The package reserves --tl-header-clearance (68px) under each sticky
// header, but its own slab renders 69px — every group-first node started
// 1px UNDER the glass (BEFORE probe: −1px on all three groups). The
// composition layer grows the slab one --space-tight step AND mirrors the
// growth into the group-first clearance; both group-first siblings (item
// padding + node margin) must move TOGETHER or the title drifts off the
// node. AFTER probe: 100px offset − 77px slab = 23px air (≥16px), all on
// the 4px grid (24 / 100). Package css/timeline.css stays untouched.
const headerAir = /\.hub__card--timeline \.ptp-timeline__header\s*\{[^}]*padding-bottom: calc\(var\(--space-standard\) \+ var\(--space-tight\)\);/s;
if (!headerAir.test(stylesCss)) {
  failures.push(
    "(sp1) styles.css must grow the sticky slab — .hub__card--timeline .ptp-timeline__header { padding-bottom: calc(var(--space-standard) + var(--space-tight)); }",
  );
}
const itemClearance = /\.hub__card--timeline \.ptp-timeline__item--group-first\s*\{[^}]*padding-top: calc\(var\(--tl-header-clearance\) \+ var\(--space-standard\) \* 2\);/s;
if (!itemClearance.test(stylesCss)) {
  failures.push(
    "(sp1) styles.css must mirror the clearance into group-first ITEMS — padding-top: calc(var(--tl-header-clearance) + var(--space-standard) * 2) = 100px",
  );
}
const nodeClearance = /\.hub__card--timeline \.ptp-timeline__node--group-first\s*\{[^}]*margin-top: calc\(var\(--tl-header-clearance\) \+ var\(--space-standard\) \* 2\);/s;
if (!nodeClearance.test(stylesCss)) {
  failures.push(
    "(sp1) styles.css must mirror the clearance into group-first NODES — margin-top: calc(var(--tl-header-clearance) + var(--space-standard) * 2) = 100px (siblings move together)",
  );
}

// ---- (ix1) THE VIEW SWITCHER — View type, HubLink, the 5-view nav map ----
// 2.8.0 AMENDMENT: the workshop placeholders (events/guests/budget) died —
// the nav map is FIVE REAL views (dashboard/studio/index/chronicle/codex).
// The EmptyState dogfood needles retired with PlaceholderView (EmptyState
// still lives: the package TimelineManager edge + the Set 06 studio frame).
const INDEX_REQUIREMENTS = [
  ['type View = "dashboard" | "studio" | "index" | "chronicle" | "codex"', "the 2.8.0 five-real-view union"],
  ['useState<View>("dashboard")', 'the default view stays "dashboard" — the cortex smoke must find the timeline on load'],
  ["function HubLink(", "the playground's link renderer for GlobalNav's as prop"],
  ["onNavigate: (href: string) => void", "the navigation callback contract"],
  ["event.preventDefault()", "no full-reload anchor navigation (negative-test target)"],
  ["function createHubLink(", "the factory closure feeding onNavigate/activeHref through GlobalNav's as contract"],
  ["as={navLink}", "the nav renders through the HubLink factory"],
  ['{ href: VIEW_HREFS.studio, label: "Pattern Studio" }', "the Pattern Studio nav destination (2.8.0)"],
  ['{ href: VIEW_HREFS.index, label: "Index" }', "the Index nav destination"],
  ['{ href: VIEW_HREFS.chronicle, label: "Chronicle" }', "the Chronicle nav destination (2.8.0)"],
  ['{ href: VIEW_HREFS.codex, label: "AI Codex" }', "the AI Codex nav destination (2.8.0)"],
  ['"#/index": "index"', "the index routing entry"],
  ['"#/chronicle": "chronicle"', "the chronicle routing entry (2.8.0)"],
  ['"#/codex": "codex"', "the codex routing entry (2.8.0)"],
  ['title: "THE MASTER INDEX"', "the index hero title"],
  ["every archetype · one catalog · zero dead ends", "the index hero subtitle (2.6.0: the catalog)"],
];
for (const [needle, label] of INDEX_REQUIREMENTS) {
  if (!appSrc.includes(needle)) {
    failures.push(`(ix1) App.tsx must contain ${JSON.stringify(needle)} — ${label}`);
  }
}

// ---- (ix2) THE THREE GATEWAYS — 2.6.0: chromatic doors in the balanced row ----
// Titles renamed per the 2.6.0 spec (Event & Party Planner / Study &
// Flashcard Engine / Party Game Arena); eyebrows PLANNER/STUDY/ARENA;
// accents flamingo/lavender/peach through data-accent + --sig-accent.
const GATEWAYS = [
  ["PLANNER", "views/planner.tsx", "Event & Party Planner", "--color-cake-primary"],
  ["STUDY", "modules/study.tsx", "Study & Flashcard Engine", "--party-lavender"],
  ["ARENA", "modules/games.tsx", "Party Game Arena", "--party-peach"],
];
for (const [label, path, title, accent] of GATEWAYS) {
  for (const [needle, what] of [
    [`label: "${label}"`, `label ${label}`],
    [`path: "${path}"`, `path ${path}`],
    [`title: "${title}"`, `title ${title}`],
    [`accent: "${accent}"`, `accent ${accent}`],
  ]) {
    if (!appSrc.includes(needle)) {
      failures.push(`(ix2) App.tsx must declare the gateway ${what} — ${JSON.stringify(needle)}`);
    }
  }
}
// The chromatic mechanism on the gateway buttons: data-accent + the
// inline --sig-accent variable (the package css paints underline +
// eyebrow + glow — the (acc1) contract exercised).
if (!appSrc.includes('data-accent\n              data-elevation="raised"')) {
  failures.push(
    '(ix2) the gateway buttons must wear data-accent + data-elevation="raised" — the chromatic elevation contract on the doors',
  );
}
if (!appSrc.includes('"--sig-accent": `var(${gateway.accent})`')) {
  failures.push(
    "(ix2) the gateway buttons must set the inline --sig-accent variable from gateway.accent",
  );
}
// The three cards come from ONE mapped wiring; the per-card count lives in
// the runtime probe — here we pin the wiring + the gateways array shape.
if (!appSrc.includes("const gateways: Gateway[] = [")) {
  failures.push("(ix2) App.tsx must declare `const gateways: Gateway[]` — the master index card list");
}
if (!appSrc.includes('data-testid={`gateway-${gateway.label.toLowerCase()}`}') && !appSrc.includes('data-testid={`gateway-${')) {
  failures.push("(ix2) App.tsx must wire data-testid={`gateway-<label> hooks on the gateway cards");
}
// 2.6.0: the 900px door column retired — the index is a flex column of
// balanced ROW grids (.hub__row--3 / .hub__row--4, both collapsing at 768px).
const indexColumn = /\.hub--index\s*\{[^}]*display: flex;[^}]*flex-direction: column;/s;
if (!indexColumn.test(stylesCss)) {
  failures.push(
    "(ix2) styles.css must declare .hub--index as the flex column — .hub--index { display: flex; flex-direction: column; … } (2.6.0: the catalog rows stack, the shell owns the width)",
  );
}
const row3Grid = /\.hub__row--3\s*\{[^}]*display: grid;[^}]*grid-template-columns: repeat\(3, 1fr\);[^}]*gap: 2rem;/s;
if (!row3Grid.test(stylesCss)) {
  failures.push(
    "(ix2) styles.css must declare .hub__row--3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; } — the THREE BALANCED gateway row (equal width, no lopsided orphans)",
  );
}
const row4Grid = /\.hub__row--4\s*\{[^}]*grid-template-columns: repeat\(4, 1fr\);/s;
if (!row4Grid.test(stylesCss)) {
  failures.push(
    "(ix2) styles.css must declare .hub__row--4 { … grid-template-columns: repeat(4, 1fr); } — the 4-up profile row",
  );
}
const rowCollapse = /@media \(max-width: 768px\)\s*\{[^@]*\.hub__row--3,[^}]*\.hub__row--4\s*\{[^}]*grid-template-columns: 1fr;/s;
if (!rowCollapse.test(stylesCss)) {
  failures.push(
    "(ix2) both row grids must collapse to one column at max-width: 768px (Pillar 2)",
  );
}

// ---- (dd1) DATA CSS — the ledger/tab/callout anatomy (2.3.0) ---------------------
// css/data.css is the NEW data stylesheet: scroll-containment wrapper (the
// mobile strategy — the file must NOT declare a 768px media query), the
// uppercase ledger header, tabular numeric cells, the 8% Flamingo hover
// wash, the attribute-driven tab contract, the var(--status) callout strip,
// reduced-motion, zero hex — and the bundle imports it layer(cascade)
// AFTER ./surface.css.
const dataCssPath = resolve(root, "css/data.css");
if (!existsSync(dataCssPath)) {
  failures.push("(dd1) css/data.css is missing — the data primitives ship their own stylesheet");
} else {
  const dataCss = readFileSync(dataCssPath, "utf8");
  const DATA_REQUIREMENTS = [
    [".ptp-table-scroll", "the scroll-containment wrapper (the mobile strategy)"],
    ["overflow-x: auto", "the horizontal scroll containment"],
    ["text-transform: uppercase", "the uppercase ledger header"],
    ["letter-spacing: 0.1em", "the letter-spaced header"],
    ["font-variant-numeric: tabular-nums", "the tabular numeric cells (digits never jitter)"],
    ["color-mix(in srgb, var(--color-cake-primary) 8%, transparent)", "the subtle 8% Flamingo row hover wash"],
    ['[aria-selected="true"]', "THE tab active mechanism — the attribute IS the state (no .is-active class)"],
    ["border-bottom-color: var(--color-cake-primary)", "the Flamingo underline on the selected tab (THE nav visual contract)"],
    ["border-left: 4px solid var(--status)", "the callout status strip (the toast mechanism, persistent)"],
    ["caption-side: bottom", "the table caption sits UNDER the table"],
    ["scale(0.97)", "the tab press physics"],
    ["prefers-reduced-motion", "the reduced-motion guard on tab transitions"],
    ["var(--bg-inset)", "the callout body token"],
  ];
  for (const [needle, label] of DATA_REQUIREMENTS) {
    if (!dataCss.includes(needle)) {
      failures.push(`(dd1) css/data.css must contain ${needle} — ${label}`);
    }
  }
  if (dataCss.includes("max-width: 768px")) {
    failures.push(
      "(dd1) css/data.css must NOT declare a 768px media query — scroll containment IS the mobile strategy for tables (the wrapper pans; tabs/callouts are single-column)",
    );
  }
  // The class-usage scan runs on comment-stripped text: prose may EXPLAIN
  // the doctrine ("no .is-active class"), only rule selectors may use it.
  if (/\.is-active/.test(dataCss.replace(/\/\*[\s\S]*?\*\//g, ""))) {
    failures.push(
      '(dd1) css/data.css uses .is-active — the tab state is [aria-selected="true"] ONLY (attribute-driven, the nav contract)',
    );
  }
  const dataHexes = dataCss.match(/#[0-9a-f]{3,8}\b/gi);
  if (dataHexes !== null) {
    failures.push(
      `(dd1) css/data.css contains hex literal(s) ${[...new Set(dataHexes)].join(", ")} — the data layer is token-driven, zero hex`,
    );
  }
  const dataShadowDecls = dataCss.match(/box-shadow\s*:\s*[^;]+;/g);
  if (dataShadowDecls !== null) {
    failures.push(
      `(dd1) css/data.css declares a box-shadow (${dataShadowDecls.join(" ")}) — the border doctrine bans drop shadows everywhere`,
    );
  }
}
const bundleCss = readFileSync(resolve(root, "css/signature-style.css"), "utf8");
const dataImportIndex = bundleCss.indexOf('@import "./data.css" layer(cascade);');
if (dataImportIndex === -1) {
  failures.push(
    'css/signature-style.css must import "./data.css" layer(cascade) — cascade membership is the layered-import doctrine',
  );
} else {
  const surfaceImportIndex = bundleCss.indexOf('@import "./surface.css" layer(cascade);');
  if (surfaceImportIndex !== -1 && dataImportIndex < surfaceImportIndex) {
    failures.push(
      "css/signature-style.css must import ./data.css AFTER ./surface.css (surface styles load first)",
    );
  }
}

// ---- (dd2) UMBRELLA RE-EXPORTS — all six new names, .d.ts AND .js (2.3.0) --------
// DataTable, Tabs, Callout, Select, Checkbox, Avatar — types live in
// index.d.ts, the value exports additionally in index.js; the prop types
// ride the .d.ts. The compiled react/data.{js,d.ts} must exist on disk.
const dataJsPath = resolve(root, "react/data.js");
const dataDtsPath = resolve(root, "react/data.d.ts");
if (!existsSync(dataJsPath)) {
  failures.push("(dd2) react/data.js is missing — build it: npx tsc -p tsconfig.json");
}
if (!existsSync(dataDtsPath)) {
  failures.push("(dd2) react/data.d.ts is missing — build it: npx tsc -p tsconfig.json");
}
const DD2_TYPES = ["DataTableColumn", "DataTableProps", "TabsProps", "CalloutProps", "CalloutStatus"];
for (const dataExport of ["DataTable", "Tabs", "Callout", "Select", "Checkbox", "Avatar"]) {
  if (!new RegExp(`\\b${dataExport}\\b`).test(umbrellaDts)) {
    failures.push(
      `react/index.d.ts must re-export ${dataExport} from the umbrella entry point`,
    );
  }
  if (!new RegExp(`\\b${dataExport}\\b`).test(umbrellaJs)) {
    failures.push(
      `react/index.js must re-export ${dataExport} from the umbrella entry point`,
    );
  }
}
for (const dataType of DD2_TYPES) {
  if (!new RegExp(`\\b${dataType}\\b`).test(umbrellaDts)) {
    failures.push(
      `react/index.d.ts must re-export the ${dataType} type from the umbrella entry point`,
    );
  }
}

// ---- (dd3) FORMS ADDITIONS — Select / Checkbox / Avatar needles (2.3.0) ----------
// css/forms.css: appearance-none select + checkbox, :checked Teal fill, the
// ::after on-cake checkmark, the positioned chevron, the avatar disc;
// react/forms.tsx: the live-map-probed ChevronDown, the ring as an inline
// BORDER (never box-shadow), the runtime --party-* ring guard.
const formsCss23 = readFileSync(resolve(root, "css/forms.css"), "utf8");
const FORMS_23_REQUIREMENTS = [
  [".ptp-select", "the justified chevron-anchor wrapper"],
  [".ptp-select__native", "the native select wearing the token skin"],
  ["appearance: none", "the UA chrome stripped (select + checkbox)"],
  [".ptp-select__chevron", "the token chevron"],
  ["pointer-events: none", "the chevron lets clicks fall through to the select"],
  [".ptp-checkbox__input:checked", "the checked state machine"],
  [".ptp-checkbox__input::after", "the checkmark as a pseudo-element (appearance-none inputs support pseudo-elements)"],
  ["border-right: 2px solid var(--color-on-cake)", "the checkmark ink — dark on-cake on the Teal fill"],
  [".ptp-avatar", "the initials disc"],
  ["border-radius: 50%", "the avatar is a circle"],
];
for (const [needle, label] of FORMS_23_REQUIREMENTS) {
  if (!formsCss23.includes(needle)) {
    failures.push(`(dd3) css/forms.css must contain ${needle} — ${label}`);
  }
}
const checkedTeal = /\.ptp-checkbox__input:checked\s*\{[^}]*background: var\(--color-cake-secondary\);/s;
if (!checkedTeal.test(formsCss23)) {
  failures.push(
    "(dd3) .ptp-checkbox__input:checked must paint the Teal fill — background: var(--color-cake-secondary) (the aria-checked answer, echoed)",
  );
}
const formsSrc23 = readFileSync(resolve(root, "react/forms.tsx"), "utf8");
const FORMS_TSX_23_REQUIREMENTS = [
  ['name="ChevronDown"', 'the lucide chevron (gate-probed: "ChevronDown" exists in the installed icons map)'],
  ["ringStyle.border = `2px solid var(${ringToken})`", "the avatar ring drawn as an inline BORDER — never box-shadow (e1 doctrine)"],
  ['startsWith("--party-")', "the runtime ring guard — structural tokens warn and render WITHOUT the ring"],
];
for (const [needle, label] of FORMS_TSX_23_REQUIREMENTS) {
  if (!formsSrc23.includes(needle)) {
    failures.push(`react/forms.tsx must contain ${JSON.stringify(needle)} — ${label}`);
  }
}
// Shadow ban on DECLARATIONS only (React inline style key boxShadow:) —
// comment prose explaining the border-not-shadow doctrine is legitimate.
if (/boxShadow\s*:/.test(formsSrc23)) {
  failures.push(
    "react/forms.tsx declares a boxShadow — the avatar ring is a border, never a shadow",
  );
}

// ---- (dd4) THE CODEX — the Universal AI Replication Contract (2.3.0) -------------
const systemPrompt = readFileSync(resolve(root, "SYSTEM_PROMPT.md"), "utf8");
if (!systemPrompt.includes("Universal AI Replication Contract")) {
  failures.push(
    'SYSTEM_PROMPT.md must contain the "Universal AI Replication Contract" section — the codex ships with the package',
  );
}
const snippetHeadings = (systemPrompt.match(/^### .*</gm) ?? []).length;
if (snippetHeadings < 15) {
  failures.push(
    `SYSTEM_PROMPT.md must carry ≥15 component snippet headings (### …<Component>), found ${snippetHeadings}`,
  );
}
if (!/never invent tokens; never hardcode hex/i.test(systemPrompt)) {
  failures.push(
    'SYSTEM_PROMPT.md must end the contract with the law: "never invent tokens; never hardcode hex"',
  );
}
if (!systemPrompt.startsWith("# System Instruction: The Dynamic Signature Engine v3.2")) {
  failures.push(
    "SYSTEM_PROMPT.md title must move to The Dynamic Signature Engine v3.2 (the 2.9.0 codex: CommandPalette, Skeletons, Breadcrumbs, the .sig-cell container-query pattern, the transparent self-audit log)",
  );
}

// ---- (sm3) THE V3.0 CODEX — the 2.7.0 recipes + the persistence pattern ----------
const SM3_REQUIREMENTS = [
  ["### <KnowledgeGraph>", "the KnowledgeGraph recipe exists"],
  ["layoutGraph", "the codex documents the deterministic layout helper"],
  ["cubicBezierEdge", "the codex documents the bezier edge helper"],
  ["Add & Link", "the codex documents the add-and-link toolbar"],
  ["### <BarChart>", "the BarChart recipe exists"],
  ['strokeDasharray "4 4"', "the codex documents the dashed reference lines"],
  ["orientation", "the codex shows the orientation prop"],
  ["### <AreaChart>", "the AreaChart recipe exists"],
  ["useId", "the codex documents the collision-free gradient id"],
  ["smoothPath", "the codex documents the Catmull-Rom helper"],
  ["### <TimelineManager>", "the TimelineManager recipe exists"],
  ["settled?: boolean", "the codex shows the settle state"],
  ["onToggleSettled", "the codex shows the controlled callbacks"],
  ["Trash", "the codex names the live-map-valid delete icon"],
  ["Funnel", "the codex names the live-map-valid filter icon"],
  ["### The Local Persistence & JSON Snapshot Pattern (2.7.0)", "the persistence subsection exists"],
  ["usePersistentState", "the codex shows the persistence hook"],
  ["sig.v27.graph", "the codex pins the graph storage key"],
  ["sig.v27.timeline", "the codex pins the timeline storage key"],
  ["sig.v28.*", "the codex documents the key-bump migration contract"],
  ["signature-snapshot.json", "the codex shows the snapshot filename"],
  ["URL.createObjectURL", "the codex shows the export dance"],
  ["URL.revokeObjectURL", "the codex shows the revoke"],
  ["Array.isArray(data.graph)", "the codex shows the import shape gate"],
  ["Excalidraw", "the codex credits the pattern"],
];
for (const [needle, label] of SM3_REQUIREMENTS) {
  if (!systemPrompt.includes(needle)) {
    failures.push(`SYSTEM_PROMPT.md must contain ${JSON.stringify(needle)} — (sm3) the v3.0 codex ${label}`);
  }
}

// ---- (car3) CAROUSEL MODES (3.0.0) ------------------------------------------------
// css/editorial.css: the docked control bar (prev · dots · indicator · next),
// the full-width track, the paged-3 snap slide (repeat(3, 1fr) + 16px gap),
// the zero-gap paged track, the container collapse. react/editorial.tsx side
// is needled by (af3)'s amended list above; the showcase toggle pill is
// needled here against App.tsx.
{
  const editorialCss30 = readFileSync(resolve(root, "css/editorial.css"), "utf8");
  const CAR3_CSS = [
    [".ptp-carousel__controls", "the docked control bar"],
    [".ptp-carousel--paged .ptp-carousel__track", "the paged track (zero inter-page gap)"],
    [".ptp-carousel__page", "the page slide"],
    ["grid-template-columns: repeat(3, 1fr)", "the 3-up page grid"],
    ["gap: var(--space-standard)", "the page's 16px internal gap"],
    ["scroll-snap-align: start", "each page is a snap unit"],
    ["@container (max-width: 640px)", "the narrow-cell page collapse"],
    [".ptp-carousel__indicator", "the bar-docked readout"],
    [".ptp-carousel__dots", "the dots (docked in the bar)"],
  ];
  for (const [needle, label] of CAR3_CSS) {
    if (!editorialCss30.includes(needle)) {
      failures.push(`(car3) css/editorial.css must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  const controlsRow = /\.ptp-carousel__controls\s*\{[^}]*display: flex;[^}]*align-items: center;/s;
  if (!controlsRow.test(editorialCss30)) {
    failures.push(
      "(car3) .ptp-carousel__controls must be the flex control bar (prev · dots · indicator · next)",
    );
  }
  const pageGrid = /\.ptp-carousel__page\s*\{[^}]*flex: 0 0 100%;[^}]*grid-template-columns: repeat\(3, 1fr\);/s;
  if (!pageGrid.test(editorialCss30)) {
    failures.push(
      "(car3) .ptp-carousel__page must be flex: 0 0 100% + repeat(3, 1fr) — ONE snap unit per page of three",
    );
  }
  const pagedGap = /\.ptp-carousel--paged \.ptp-carousel__track\s*\{[^}]*gap: 0;/s;
  if (!pagedGap.test(editorialCss30)) {
    failures.push(
      "(car3) the paged track must zero its own gap (the page owns the 16px internal gap) — scroll math depends on width-only strides",
    );
  }
  for (const [needle, label] of [
    ['data-testid="carousel-mode-toggle"', "the showcase toggle pill hook"],
    ['aria-pressed={carouselMode === "paged-3"}', "the paged-3 pill state"],
    ['aria-pressed={carouselMode === "free-scroll"}', "the free-scroll pill state"],
    ['useState<"paged-3" | "free-scroll">("free-scroll")', "the toggle's state (default free-scroll)"],
    ['mode={carouselMode}', "the mode flows into <Carousel>"],
  ]) {
    if (!appSrc.includes(needle)) {
      failures.push(`(car3) App.tsx must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
}

// ---- (dd5) THE TABS SHOWCASE — the playground data/forms modules (2.3.0) ---------
const TABS_REQUIREMENTS = [
  ['label="Dashboard modules"', 'the tablist accessible name'],
  ['id: "core", label: "Core Dashboard"', "the core module tab"],
  ['id: "data", label: "Data & Tables"', "the data module tab"],
  ['id: "forms", label: "Form & Input Matrix"', "the forms module tab"],
  ["function DataModule", "the data branch component"],
  ["function FormsModule", "the forms branch component"],
  ["<DataTable", "the ledger table"],
  ['title="Guest & Budget Ledger"', "the ledger card title"],
  ['title="The Input Matrix"', "the matrix card title"],
  ['guest: "Ana Souza"', "ledger row 1"],
  ['guest: "Leo Martins"', "ledger row 2"],
  ['guest: "Priya Nair"', "ledger row 3"],
  ['guest: "Tom Weller"', "ledger row 4"],
  ['guest: "Ana + 1"', "ledger row 5"],
  ['colorToken="--party-green" label="Confirmed"', "the composed PartyBadge status cell"],
  ['<Callout status="info">', "the info callout"],
  ['<Callout status="success">', "the success callout"],
  ['<Callout status="warning">', "the warning callout"],
  ["<Avatar name={person.name}", "the avatar crew (rendered from AVATAR_CREW)"],
  ['ringToken: "--party-mauve-soft"', "crew ring 1 (party token)"],
  ['ringToken: "--party-sky"', "crew ring 2 (party token)"],
  ["<Select", "the native dropdown in the matrix"],
  ['value="none"', "select option 1"],
  ['value="vegetarian"', "select option 2"],
  ['value="vegan"', "select option 3"],
  ["<Checkbox", "the native check in the matrix"],
  ["<ToggleSwitch", "the switch in the matrix"],
];
for (const [needle, label] of TABS_REQUIREMENTS) {
  if (!appSrc.includes(needle)) {
    failures.push(`(dd5) App.tsx must contain ${JSON.stringify(needle)} — ${label}`);
  }
}

// ---- (dd6) CORTEX SWEEP — the data-module selectors + version (2.3.0) ------------
// tools/ is owner-editable tooling (noted in the changelog); the sweep grows
// the data-module contract and the server version moves to 2.3.0.
// 2.5.0 AMENDMENT: the sweep grows .ptp-btn / .ptp-stat-card / .sig-shell
// and the server version moves to 2.5.0.
const mcpServerSrc = readFileSync(resolve(root, "tools/mcp-viz/server.ts"), "utf8");
for (const selector of [".ptp-data-table", ".ptp-tabs__tab", ".ptp-callout", ".sig-surface-card", ".ptp-btn", ".ptp-stat-card", ".sig-shell", ".ptp-carousel__dot", ".ptp-chronicle__item", ".ptp-graph__node", ".ptp-bars__bar", ".ptp-tmanager__count"]) {
  if (!mcpServerSrc.includes(`"${selector}"`)) {
    failures.push(
      `tools/mcp-viz/server.ts DEFAULT_SELECTORS must carry "${selector}" — the cortex sweep measures the data module + the bento + the master index + the Graphs & Planner module (2.7.0: graph nodes, bar ink, milestone counter)`,
    );
  }
}
if (!mcpServerSrc.includes('version: "2.7.0"')) {
  failures.push(
    'tools/mcp-viz/server.ts server version string must be 2.7.0 (tooling-only bump)',
  );
}

// ---- (ed1) EDITORIAL CSS — the carousel/prose/banner anatomy (2.4.0) --------------
// css/editorial.css is the NEW editorial stylesheet: the carousel snap contract
// (track + thin scrollbar + snap-start items), the prose blockquote (inset well
// + 4px Flamingo rule + italic bright ink + mono muted attribution), the
// banner var(--status) strip (the toast/callout mechanism) with the ghost
// Teal-hover close — reduced-motion respected, ZERO hex, ZERO box-shadow
// (the e1 scope extends to every css/ file; surface.css's .sig-surface-card
// sanction is the ONLY exception, editorial included). The bundle imports it
// layer(cascade) AFTER ./data.css.
const editorialCssPath = resolve(root, "css/editorial.css");
if (!existsSync(editorialCssPath)) {
  failures.push("(ed1) css/editorial.css is missing — the editorial primitives ship their own stylesheet");
} else {
  const editorialCss = readFileSync(editorialCssPath, "utf8");
  const EDITORIAL_REQUIREMENTS = [
    ["scroll-snap-type: x mandatory", "the carousel snap contract"],
    ["scroll-snap-align: start", "the snap-start items"],
    // 2.6.0 AMENDMENT: the track's native scrollbar is GONE (the dots are
    // the position affordance now) — both engine spellings.
    ["scrollbar-width: none", "the scrollbar-free track (2.6.0 owner mandate)"],
    [".ptp-carousel__track::-webkit-scrollbar", "the webkit scrollbar kill"],
    [".ptp-carousel__item", "the item slot (flex 0 0 auto)"],
    ["flex: 0 0 auto", "items keep content width"],
    // 2.6.0: the dot indicators.
    [".ptp-carousel__dots", "the dots row (one button per child)"],
    [".ptp-carousel__dot[data-active=\"true\"]", "the attribute IS the active-dot state"],
    ["width: 1.5rem", "the active Flamingo pill"],
    ["width: 0.375rem", "the resting dot circle"],
    [".ptp-prose blockquote", "the prose blockquote anatomy"],
    ["border-left: 4px solid var(--party-mauve)", "the MAUVE quote rule (2.4.1 owner override — the quote is editorial content, the content voice; was v2.4.0's Flamingo)"],
    ["font-style: italic", "the quote voice"],
    ["border-left: 4px solid var(--status)", "the banner status strip (the toast/callout mechanism)"],
    ["var(--bg-inset)", "the inset-well bodies (quote + banner)"],
    ["var(--color-cake-secondary)", "the Teal hover accent (ghost buttons, structural)"],
    ["prefers-reduced-motion", "the reduced-motion guard on transitions"],
  ];
  for (const [needle, label] of EDITORIAL_REQUIREMENTS) {
    if (!editorialCss.includes(needle)) {
      failures.push(`(ed1) css/editorial.css must contain ${needle} — ${label}`);
    }
  }
  const editorialHexes = editorialCss.match(/#[0-9a-f]{3,8}\b/gi);
  if (editorialHexes !== null) {
    failures.push(
      `(ed1) css/editorial.css contains hex literal(s) ${[...new Set(editorialHexes)].join(", ")} — the editorial layer is token-driven, zero hex`,
    );
  }
  const editorialShadowDecls = editorialCss.match(/box-shadow\s*:\s*[^;]+;/g);
  const editorialNonNone = (editorialShadowDecls ?? []).filter(
    (d) => !/^box-shadow\s*:\s*none\s*;$/i.test(d),
  );
  if (editorialNonNone.length > 0) {
    failures.push(
      `(ed1) css/editorial.css declares a box-shadow (${editorialNonNone.join(" ")}) — the border doctrine bans drop shadows everywhere (the e1 scope extends: editorial included)`,
    );
  }
}
const editorialImportIndex = bundleCss.indexOf('@import "./editorial.css" layer(cascade);');
if (editorialImportIndex === -1) {
  failures.push(
    'css/signature-style.css must import "./editorial.css" layer(cascade) — cascade membership is the layered-import doctrine',
  );
} else {
  const dataImportIndexForEditorial = bundleCss.indexOf('@import "./data.css" layer(cascade);');
  if (dataImportIndexForEditorial !== -1 && editorialImportIndex < dataImportIndexForEditorial) {
    failures.push(
      "css/signature-style.css must import ./editorial.css AFTER ./data.css (data styles load first)",
    );
  }
}

// ---- (ed2) UMBRELLA RE-EXPORTS — the 2.4.0 names, .d.ts AND .js -------------------
// The six new primitives + the Sparkline engine + the CarouselItem helper.
// Types live in index.d.ts, the value exports additionally in index.js; the
// compiled react/editorial.{js,d.ts} must exist on disk.
const editorialJsPath = resolve(root, "react/editorial.js");
const editorialDtsPath = resolve(root, "react/editorial.d.ts");
if (!existsSync(editorialJsPath)) {
  failures.push("(ed2) react/editorial.js is missing — build it: npx tsc -p tsconfig.json");
}
if (!existsSync(editorialDtsPath)) {
  failures.push("(ed2) react/editorial.d.ts is missing — build it: npx tsc -p tsconfig.json");
}
const ED2_VALUES = [
  "FormField",
  "RadioCardGroup",
  "Carousel",
  "CarouselItem",
  "ProseBlock",
  "AnnouncementBanner",
  "StatCard",
  "Sparkline",
];
const ED2_TYPES = [
  "FormFieldProps",
  "RadioCardGroupProps",
  "RadioCardOption",
  "CarouselProps",
  "CarouselItemProps",
  "ProseBlockProps",
  "AnnouncementBannerProps",
  "AnnouncementVariant",
  "AnnouncementBannerAction",
  "SparklineProps",
  "StatCardProps",
];
for (const name of ED2_VALUES) {
  if (!new RegExp(`\\b${name}\\b`).test(umbrellaDts)) {
    failures.push(`react/index.d.ts must re-export ${name} from the umbrella entry point`);
  }
  if (!new RegExp(`\\b${name}\\b`).test(umbrellaJs)) {
    failures.push(`react/index.js must re-export ${name} from the umbrella entry point`);
  }
}
for (const name of ED2_TYPES) {
  if (!new RegExp(`\\b${name}\\b`).test(umbrellaDts)) {
    failures.push(
      `react/index.d.ts must re-export the ${name} type from the umbrella entry point`,
    );
  }
}

// ---- (ed3) FORMS ADDITIONS — FormField / RadioCardGroup needles (2.4.0) -----------
// css/forms.css: the :has() focus ring (with the documented no-:has degrade),
// the radio selected contract (class + :has(input:checked)), the visually
// hidden input, the auto-fit card grid, the field label/hint/error anatomy.
// react/forms.tsx: the hint-XOR-error slot and the radiogroup contract.
const formsCss24 = readFileSync(resolve(root, "css/forms.css"), "utf8");
const FORMS_24_REQUIREMENTS = [
  [".ptp-form-field", "the accessible wrapper root (the __field contract: flex column + tight gap)"],
  [".ptp-form-field__label", "the label element"],
  [".ptp-form-field__hint", "the muted hint slot"],
  [".ptp-form-field__error", "the error slot"],
  [".ptp-radio-cards", "the radiogroup container"],
  ["repeat(auto-fit, minmax(140px, 1fr))", "the responsive card grid"],
  [".ptp-radio-card__input", "the visually hidden native radio"],
  ["position: absolute", "the input's hiding mechanism (with opacity: 0)"],
  [".ptp-radio-card:has(input:focus-visible)", "THE :has() focus ring — the keyboard focus lands on the hidden input, the CARD rings"],
  [".ptp-radio-card:has(input:checked)", "the selected state machine — the attribute IS the state"],
  [".ptp-radio-card.ptp-radio-card--selected", "the selected class mirror (consumer convenience, specificity-safe vs :hover)"],
  ["background: var(--bg-surface)", "the selected card LIFTS to --bg-surface (2.4.1 owner override of the 10% cake tint — a surface read over the inset siblings)"],
  ["var(--party-peach)", "the error message token (the v1.4.0 doctrine, message slot)"],
];
for (const [needle, label] of FORMS_24_REQUIREMENTS) {
  if (!formsCss24.includes(needle)) {
    failures.push(`(ed3) css/forms.css must contain ${needle} — ${label}`);
  }
}
if (!formsCss24.includes(":has(")) {
  failures.push("(ed3) css/forms.css must use :has() — the modern focus/checked lifting selector");
}
// The degrade must be DOCUMENTED (the fallback note is part of the contract).
if (!/Firefox 121/.test(formsCss24)) {
  failures.push(
    "(ed3) css/forms.css must document the no-:has() fallback note (browsers without :has() lose only the card focus ring — the degrade is a documented contract)",
  );
}
const selectedFlamingo = /\.ptp-radio-card\.ptp-radio-card--selected,\s*\.ptp-radio-card:has\(input:checked\)\s*\{[^}]*border-color: var\(--color-cake-primary\);[^}]*border-width: 2px;/s;
if (!selectedFlamingo.test(formsCss24)) {
  failures.push(
    "(ed3) the radio selected contract must paint the 2px Flamingo border — .ptp-radio-card--selected / :has(input:checked) → border-color: var(--color-cake-primary) + border-width: 2px",
  );
}
const focusRing = /\.ptp-radio-card:has\(input:focus-visible\)\s*\{[^}]*outline: 2px solid var\(--color-cake-primary\);/s;
if (!focusRing.test(formsCss24)) {
  failures.push(
    "(ed3) the :has() focus ring must be the doctrine ring — .ptp-radio-card:has(input:focus-visible) → outline: 2px solid var(--color-cake-primary)",
  );
}
const formsSrc24 = readFileSync(resolve(root, "react/forms.tsx"), "utf8");
const FORMS_TSX_24_REQUIREMENTS = [
  ['role="radiogroup"', "the radiogroup role"],
  ["aria-label={label}", "the radiogroup accessible name"],
  ['className="ptp-form-field__error" role="alert"', 'the error slot announces itself (role="alert")'],
  ["ptp-radio-card--selected", "the selected class mirror on the card label"],
  ['type="radio"', "the native radio (keyboard + forms for free)"],
];
for (const [needle, label] of FORMS_TSX_24_REQUIREMENTS) {
  if (!formsSrc24.includes(needle)) {
    failures.push(`react/forms.tsx must contain ${JSON.stringify(needle)} — ${label}`);
  }
}

// ---- (ed4) VIZ ADDITIONS — Sparkline two-element svg + StatCard flatness (2.4.0) --
const vizSrc24 = readFileSync(resolve(root, "react/viz.tsx"), "utf8");
const VIZ_TSX_24_REQUIREMENTS = [
  ['role="img"', "the sparkline svg's role"],
  ["aria-label={label ?? \"trend\"}", "the sparkline accessible name (defaults to \"trend\")"],
  ["preserveAspectRatio=\"none\"", "the stretch-to-box viewBox contract"],
  ["<polygon", "sparkline element 1 of 2 — the area ghost"],
  ["<polyline", "sparkline element 2 of 2 — the line"],
  ["strokeWidth={2}", "the 2px line ink"],
  ["color-mix(in srgb, var(${colorToken}) 15%, transparent)", "the 15% area fill"],
  ["data.length < 2", "the ≥2-point guard (no trend, no ink)"],
  ["sparkPoints", "the PURE geometry helper (data in, viewBox points out)"],
];
for (const [needle, label] of VIZ_TSX_24_REQUIREMENTS) {
  if (!vizSrc24.includes(needle)) {
    failures.push(`react/viz.tsx must contain ${JSON.stringify(needle)} — ${label}`);
  }
}
const vizCss24 = readFileSync(resolve(root, "css/viz.css"), "utf8");
const VIZ_CSS_24_REQUIREMENTS = [
  [".ptp-stat-card", "the KPI card"],
  ["font-variant-numeric: tabular-nums", "the value's tabular digits (never jitter)"],
  ["text-transform: uppercase", "the label's uppercase caption"],
  ["letter-spacing: 0.1em", "the label's tracking"],
  ["font-size: 1.5rem", "the value's headline size"],
  [".ptp-stat-card__delta--up", "the up delta (party-green via the modifier)"],
  [".ptp-stat-card__delta--down", "the down delta (party-peach via the modifier)"],
];
for (const [needle, label] of VIZ_CSS_24_REQUIREMENTS) {
  if (!vizCss24.includes(needle)) {
    failures.push(`(ed4) css/viz.css must contain ${needle} — ${label}`);
  }
}
// StatCard FLATNESS: the stat-card rule block must carry NO box-shadow
// (belt-and-braces with the (e1) css/-wide scan — this one names the class).
const statCardBlock = vizCss24.match(/\.ptp-stat-card\s*\{[^}]*\}/s);
if (statCardBlock === null) {
  failures.push("(ed4) css/viz.css has no parseable .ptp-stat-card rule block");
} else if (/box-shadow/.test(statCardBlock[0])) {
  failures.push(
    "(ed4) .ptp-stat-card mentions box-shadow — the KPI card is FLAT (surface + hairline, the e1 doctrine)",
  );
}

// ---- (icons) SDK-LUCIDE PROBE — the editorial icon names exist (2.4.0, 2.4.1) ------
// Megaphone, ChevronLeft, ChevronRight, X (2.4.0) + the 2.4.1 banner default
// icons Info / TriangleExclamationPoint (+ the announcement default Megaphone,
// already probed): a name that is not a key in the installed icons map renders
// a blank square (the "Music" lesson), so the probe runs against the LIVE map
// at gate time. NOTE (2.4.1, probe-verified): the installed lucide-react
// 1.72.0 map has NO "TriangleAlert" — this future-major spells the warning
// triangle "TriangleExclamationPoint"; the owner-spec'd name is mapped to the
// live-map-valid equivalent in react/editorial.tsx (the AudioLines precedent).
try {
  const { icons } = await import("lucide-react");
  for (const name of [
    "Megaphone",
    "ChevronLeft",
    "ChevronRight",
    "X",
    "Info",
    "TriangleExclamationPoint",
    // 2.5.0: the password toggle, the accordion chevron, the deck tiles.
    "Eye",
    "EyeOff",
    "SquarePen",
    "Shuffle",
    // 2.7.0: the manager's live-map-probed icons (Trash2/Filter are NOT
    // lucide-react 1.72.0 keys — the AudioLines/Music precedent again).
    "Trash",
    "Funnel",
    // 2.7.0: the snapshot toolbar icons (Download/Upload ARE keys — probed).
    "Download",
    "Upload",
    // 2.6.0: the ReferenceCard copy/link icons + the TierCard Check bullet.
    "Copy",
    "Check",
    "ArrowUpRight",
  ]) {
    if (!(name in icons)) {
      failures.push(`(icons) icon "${name}" does not exist in the lucide-react icons map — a package source would render a blank square`);
    }
  }
  if ("TriangleAlert" in icons === false) {
    // Documented decision, not a failure — kept as a deliberate probe so the
    // next release that flips the map sees it in the gate output.
    console.log(
      "(icons) note: \"TriangleAlert\" is NOT a key in the installed lucide-react map — the 2.4.1 warning default uses \"TriangleExclamationPoint\" (the AudioLines/Music precedent)",
    );
  }
} catch (error) {
  failures.push(`(icons) could not load lucide-react — ${(error instanceof Error ? error.message : String(error)).split("\n")[0]}`);
}

// ---- (showcase) THE EDITORIAL SHOWCASE — the playground wiring (2.4.0) ------------
// 2.5.0 AMENDMENT: the needles re-aim at the bento — Postal Code +
// descriptions-above + validMessage + PasswordInput + the archetypes +
// the v2.5.0 banner copy; every RSVP card carries a description.
const SHOWCASE_REQUIREMENTS = [
  ["<FormField", "the accessible wrapper in the matrix"],
  ['label="Name"', "the Name field"],
  ['label="Contribution"', "the Contribution field (2.4.1 — the dollar sign moved OUT of the label)"],
  ['prefix="$"', "the 2.4.1 prefix adornment on the money field"],
  ['label="Postal Code"', "the 2.5.0 Postal Code field (both modules)"],
  ['description="5 numbers only · e.g., 79901"', "the format rule ABOVE the input (defect #2)"],
  ['description="Numbers only · e.g., 120"', "the money field's format rule"],
  ["validMessage={postalValid", "the live-validation success slot"],
  ['htmlFor="matrix-name"', "the consumer-wired label association (field 1)"],
  ['htmlFor="matrix-share"', "the consumer-wired label association (field 2)"],
  ["hint=\"As it appears on the invite\"", "the hint slot demoed"],
  ["<PasswordInput", "the 2.5.0 password well (meter + pills)"],
  ["<RadioCardGroup", "the card radios in the matrix"],
  ['name="rsvp"', "the radio group name"],
  ['{ value: "attending", label: "Attending", description: "See you there" }', "RSVP option 1 (with description)"],
  ['{ value: "maybe", label: "Maybe", description: "Leaning yes — will confirm" }', "RSVP option 2 — descriptions ENFORCED (2.5.0)"],
  ['{ value: "declined", label: "Can\'t make it", description: "Sorry — next time" }', "RSVP option 3 — descriptions ENFORCED (2.5.0)"],
  ["<AnnouncementBanner", "the banner at the top of the bento"],
  ['variant="announcement"', "the 2.4.1 variant API (Flamingo banner default)"],
  ['label: "See what shipped"', "the 2.4.1 action slot demoed"],
  ["live state mode: check in a guest and watch", "the v2.5.0 banner copy"],
  ["<StatCard", "the KPI trio"],
  ['label="Total Budget"', "KPI 1"],
  ['label="Confirmed Guests"', "KPI 2"],
  ['label="Active Game Rooms"', "KPI 3"],
  ['colorToken="--party-green"', "KPI 1 sparkline token"],
  ["<ProseBlock", "the Field Notes prose container"],
  ["<blockquote>", "the prose quote"],
  ["<Carousel", "the palette clippings strip"],
  ["<CarouselItem", "the snap slots"],
  ["className=\"hub__clipping\"", "the composed min-width clipping modifier"],
  ["<Button", "the Button family migrated (2.5.0 defect #5)"],
  ['variant="primary" size="md" type="submit" loading={submitting}', "the check-in submit rides the package Button (loading demoed)"],
  ["<FlipCard", "the flip archetype"],
  ["<AccordionCard", "the accordion archetype"],
  ["<MatchupCard", "the matchup archetype"],
  ["<ActionTile", "the action-tile archetype"],
  ['kbdShortcut="D"', "the shortcut chip demoed"],
  ['label="Add to game rotation"', "the visible switch label exercised (defect #3)"],
  ["ToggleSwitch", "the switch renders in the matrix + the check-in"],
];
for (const [needle, label] of SHOWCASE_REQUIREMENTS) {
  if (!appSrc.includes(needle)) {
    failures.push(`(showcase) App.tsx must contain ${JSON.stringify(needle)} — ${label}`);
  }
}

// ---- (af1) INTUITIVE ANATOMY I — the DataTable align fix (2.4.1) -------------------
// The bug: `numeric` right-aligned the CELLS but the HEADER stayed left —
// `.ptp-data-table thead th` (specificity 0,1,2) outranks the bare
// .ptp-data-table__num class (0,1,0). The fix: DataTableColumn.align flows to
// BOTH th and td through ancestor-scoped .ptp-data-table__align-* utilities
// (0,2,0 — back on top), composing with __num (align = geometry, numeric =
// tabular digits). css/data.css owns the paint (class-based, gate-able);
// react/data.tsx applies per column; the compiled .d.ts carries the prop.
const dataCssAf = readFileSync(resolve(root, "css/data.css"), "utf8");
const dataSrcAf = readFileSync(resolve(root, "react/data.tsx"), "utf8");
const dataDtsAf = readFileSync(resolve(root, "react/data.d.ts"), "utf8");
for (const [needle, label] of [
  [".ptp-data-table__align-left", "the left alignment utility"],
  [".ptp-data-table__align-center", "the center alignment utility"],
  [".ptp-data-table__align-right", "the right alignment utility"],
]) {
  if (!dataCssAf.includes(needle)) {
    failures.push(`(af1) css/data.css must contain ${needle} — ${label}`);
  }
}
for (const [side, value] of [["left", "left"], ["center", "center"], ["right", "right"]]) {
  const rule = new RegExp(
    `\\.ptp-data-table \\.ptp-data-table__align-${side}\\s*\\{[^}]*text-align: ${value};`,
    "s",
  );
  if (!rule.test(dataCssAf)) {
    failures.push(
      `(af1) css/data.css must scope .ptp-data-table__align-${side} under .ptp-data-table with text-align: ${value} — the ancestor prefix (0,2,0) is the specificity fix that beats .ptp-data-table thead th (0,1,2); a bare class would LOSE and the header would stay left (the bug itself)`,
    );
  }
}
if (!dataSrcAf.includes('align?: "left" | "right" | "center"')) {
  failures.push(
    '(af1) react/data.tsx must declare align?: "left" | "right" | "center" on DataTableColumn',
  );
}
if (!dataSrcAf.includes("`ptp-data-table__align-${column.align}`")) {
  failures.push(
    "(af1) react/data.tsx must derive the .ptp-data-table__align-* class from column.align",
  );
}
const cellClassUses = (dataSrcAf.match(/className=\{dataTableCellClass\(column\)\}/g) ?? []).length;
if (cellClassUses !== 2) {
  failures.push(
    `(af1) react/data.tsx must apply dataTableCellClass to BOTH the th and the td (2 sites), found ${cellClassUses} — align flows to header AND cells`,
  );
}
if (!/align\?:\s*"left" \| "right" \| "center"/.test(dataDtsAf)) {
  failures.push(
    "(af1) the compiled react/data.d.ts must carry align?: \"left\" | \"right\" | \"center\" (the consumer-facing contract is the .d.ts)",
  );
}
if (!appSrc.includes('numeric: true, align: "right"')) {
  failures.push(
    '(af1) App.tsx ledger must set the Contribution column numeric: true + align: "right" — the header flushes over the $120 values',
  );
}

// ---- (af2) INTUITIVE ANATOMY II — FormField required/prefix + the visible
// switch label + the radio lift (2.4.1). The required asterisk is VISUAL
// (aria-hidden; the CONTROL's aria-required is consumer wiring), the prefix
// rides the justified __row flex composition, the switch migrates every pill
// selector .ptp-switch → .ptp-switch__pill with the label as visible text,
// and the selected radio card lifts to var(--bg-surface).
const formsCssAf = readFileSync(resolve(root, "css/forms.css"), "utf8");
const formsSrcAf = readFileSync(resolve(root, "react/forms.tsx"), "utf8");
const formsDtsAf = readFileSync(resolve(root, "react/forms.d.ts"), "utf8");
// 2.5.0 AMENDMENT: the 2.4.1 __row/__prefix needles RETIRED — the
// adornment composition is the __well/__chip now (the contract lives in
// gate ff1 below). __required, the switch migration and the radio lift
// stay pinned here.
for (const [needle, label] of [
  [".ptp-form-field__required", "the peach required asterisk slot"],
  [".ptp-switch", "the switch wrapper (pill + visible text composition)"],
  [".ptp-switch__pill", "the migrated pill (every pill selector renamed)"],
  [".ptp-switch__text", "the visible label text"],
]) {
  if (!formsCssAf.includes(needle)) {
    failures.push(`(af2) css/forms.css must contain ${needle} — ${label}`);
  }
}
const rowRule = /\.ptp-form-field__well\s*\{[^}]*display: flex;[^}]*align-items: center;/s;
if (!rowRule.test(formsCssAf)) {
  failures.push(
    "(af2) .ptp-form-field__well must be flex + align-items: center (the 2.5.0 successor of the justified adornment wrapper)",
  );
}
const prefixRule = /\.ptp-form-field__chip\s*\{[^}]*var\(--font-mono,[^}]*font-weight: 600;/s;
if (!prefixRule.test(formsCssAf)) {
  failures.push(
    "(af2) .ptp-form-field__chip must be mono + weight 600 (the adornment voice)",
  );
}
const requiredRule = /\.ptp-form-field__required\s*\{[^}]*color: var\(--party-peach\);/s;
if (!requiredRule.test(formsCssAf)) {
  failures.push(
    "(af2) .ptp-form-field__required must paint the peach asterisk — color: var(--party-peach) (the v1.4.0 attention token)",
  );
}
const switchWrapper = /\.ptp-switch\s*\{[^}]*display: inline-flex;[^}]*align-items: center;/s;
if (!switchWrapper.test(formsCssAf)) {
  failures.push(
    "(af2) .ptp-switch must now be the inline-flex wrapper (pill + visible text) — the JUSTIFIED composition, commented in css",
  );
}
const switchText = /\.ptp-switch__text\s*\{[^}]*color: var\(--text-main\);[^}]*font-size: 0\.875rem;[^}]*font-weight: 500;/s;
if (!switchText.test(formsCssAf)) {
  failures.push(
    "(af2) .ptp-switch__text must be text-main 0.875rem weight 500 (the visible label contract)",
  );
}
const wrapperBlock = formsCssAf.match(/(?:^|\n)\s*\.ptp-switch\s*\{([^}]*)\}/s);
if (wrapperBlock === null || wrapperBlock[1].includes("border-radius: 999px")) {
  failures.push(
    "(af2) the bare .ptp-switch block must NOT be the pill anymore (no 999px radius) — every pill property migrated to .ptp-switch__pill",
  );
}
// The attribute scan runs on comment-stripped text: prose may EXPLAIN the
// state machine (the header's geometry comment quotes the selector), only
// rule selectors may carry it.
if (/\[aria-checked="true"\]/.test(formsCssAf.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\.ptp-switch__pill\[aria-checked="true"\]/g, ""))) {
  failures.push(
    '(af2) an [aria-checked="true"] selector remains OUTSIDE .ptp-switch__pill — the state machine must live on the migrated pill only',
  );
}
if (!formsCssAf.includes(".ptp-switch__pill,\n    .ptp-switch__pill::before,")) {
  failures.push(
    "(af2) the reduced-motion guard must follow the migration — .ptp-switch__pill / .ptp-switch__pill::before in the prefers-reduced-motion list",
  );
}
const radioLift = /\.ptp-radio-card\.ptp-radio-card--selected,\s*\.ptp-radio-card:has\(input:checked\)\s*\{[^}]*border-color: var\(--color-cake-primary\);[^}]*border-width: 2px;[^}]*background: var\(--bg-surface\);/s;
if (!radioLift.test(formsCssAf)) {
  failures.push(
    "(af2) the selected radio card must KEEP the 2px Flamingo border AND lift to background: var(--bg-surface) (2.4.1 owner override of the cake tint)",
  );
}
for (const [needle, label] of [
  ["required?: boolean", "the FormField required prop"],
  ["prefix?: string", "the FormField prefix prop"],
  ['className="ptp-form-field__well"', "the well wraps children ONLY when prefix/suffix is present"],
  ['className="ptp-form-field__chip"', "the chip renders as the adornment (prefix before, suffix after)"],
  ['className="ptp-form-field__required"', "the asterisk span on the label"],
  ['aria-hidden="true"', "the asterisk is VISUAL — screen readers get aria-required from the control, never from the wrapper"],
  ['className="ptp-switch"', "the justified switch wrapper"],
  ['className="ptp-switch__pill"', "the pill class (migrated)"],
  ['className="ptp-switch__text"', "the visible label span (NOT aria-hidden — visible text)"],
  ["if (label === undefined)", "no label → the bare pill, exactly ONE element (peak pruning preserved)"],
  ['role="switch"', "the pill keeps the switch role"],
]) {
  if (!formsSrcAf.includes(needle)) {
    failures.push(`react/forms.tsx must contain ${JSON.stringify(needle)} — (af2) ${label}`);
  }
}
if (!/required\?:\s*boolean/.test(formsDtsAf) || !/prefix\?:\s*string/.test(formsDtsAf)) {
  failures.push(
    "(af2) the compiled react/forms.d.ts must carry FormField required?: boolean + prefix?: string (the consumer-facing contract)",
  );
}

// ---- (af3) INTUITIVE ANATOMY III — editorial deltas + the v2.7 codex (2.4.1) --------
// The banner API evolves to variant (info/warning/announcement, default
// announcement) + icon (default Info / TriangleExclamationPoint / Megaphone)
// + action (ghost button after the text), the prose quote bar goes MAUVE
// (owner override — a quote is content), prose gains h3 + kbd/code, and the
// carousel grows the rAF-throttled page indicator. Plus the codex needles:
// SYSTEM_PROMPT.md must title v2.7 and carry the refreshed snippets, factual
// against the new .d.ts.
const editorialCssAf = readFileSync(resolve(root, "css/editorial.css"), "utf8");
const editorialSrcAf = readFileSync(resolve(root, "react/editorial.tsx"), "utf8");
const editorialDtsAf = readFileSync(resolve(root, "react/editorial.d.ts"), "utf8");
for (const [needle, label] of [
  [".ptp-carousel__indicator", "the page indicator class"],
  [".ptp-prose h3", "the h3 sub-section voice"],
  [".ptp-prose kbd", "kbd joins the inline-code chip"],
  [".ptp-announcement__action", "the ghost action button"],
]) {
  if (!editorialCssAf.includes(needle)) {
    failures.push(`(af3) css/editorial.css must contain ${needle} — ${label}`);
  }
}
const indicatorRule = /\.ptp-carousel__indicator\s*\{[^}]*font-variant-numeric: tabular-nums;[^}]*color: var\(--text-muted\);/s;
if (!indicatorRule.test(editorialCssAf)) {
  failures.push(
    "(af3) .ptp-carousel__indicator must be tabular-nums muted (the position readout is metadata, not a headline)",
  );
}
const kbdRule = /\.ptp-prose code,\s*\n\.ptp-prose kbd\s*\{[^}]*background: var\(--bg-inset\);[^}]*border-radius: 0\.25rem;[^}]*padding: 0\.125rem 0\.375rem;[^}]*font-size: 0\.8125rem;[^}]*color: var\(--text-bright\);/s;
if (!kbdRule.test(editorialCssAf)) {
  failures.push(
    "(af3) .ptp-prose code/kbd must carry the inline chip contract — inset body, 0.25rem radius, 0.125rem × 0.375rem padding, 0.8125rem, --text-bright",
  );
}
const proseH3Block = editorialCssAf.match(/\.ptp-prose h3\s*\{([^}]*)\}/s);
if (
  proseH3Block === null ||
  !/\bfont-size: 0\.9375rem;/.test(proseH3Block[1]) ||
  !/\bfont-weight: 600;/.test(proseH3Block[1]) ||
  !/\bcolor: var\(--text-main\);/.test(proseH3Block[1])
) {
  failures.push(
    "(af3) .ptp-prose h3 must be 0.9375rem weight 600 text-main (the ensured sub-section styles)",
  );
}
const actionHover = /\.ptp-announcement__action:hover\s*\{[^}]*border-color: var\(--color-cake-secondary\);/s;
if (!actionHover.test(editorialCssAf)) {
  failures.push(
    "(af3) .ptp-announcement__action:hover must answer with the Teal border (token-driven ghost button)",
  );
}
for (const [needle, label] of [
  ["variant?: AnnouncementVariant", "the evolved variant prop"],
  ['variant = "announcement"', "the announcement default (the Flamingo banner)"],
  ["ANNOUNCEMENT_ICONS", "the variant → default icon map"],
  ['warning: "TriangleExclamationPoint"', "the warning default icon — PROBED: lucide 1.72.0 has NO TriangleAlert key (the AudioLines/Music lesson)"],
  ['announcement: "Megaphone"', "the announcement default icon"],
  ['info: "Info"', "the info default icon"],
  ["announcement: \"var(--color-cake-primary)\"", "the Flamingo banner strip — the variant map"],
  ["action?: AnnouncementBannerAction", "the call-to-action slot"],
  ['className="ptp-announcement__action"', "the ghost action button render"],
  ["aria-live=\"polite\"", "the indicator announces page turns politely"],
  // 3.0.0 (car3) AMENDMENT: the owner-spec'd scrollLeft/itemWidth formula is
  // REPLACED by the IntersectionObserver sync (free-scroll) + the page math
  // (paged-3). The rAF throttle + onScroll needles survive (the paged mode's
  // page sync still rides one state write per frame).
  ["mode?: \"paged-3\" | \"free-scroll\"", "the 3.0.0 mode prop (default free-scroll)"],
  ["IntersectionObserver", "the free-scroll active-index sync (majority-visible wins)"],
  ["intersectionRatio >= 0.5", "the majority-visible threshold"],
  ["observer.disconnect()", "the IO cleanup on unmount"],
  ["Math.round(track.scrollLeft / track.clientWidth) + 1", "the paged-3 page formula (scrollLeft / track width)"],
  ["onScroll={handleScroll}", "the paged page-sync rides the native scroll event"],
  ["requestAnimationFrame", "the rAF throttle — one state write per frame"],
  ["cancelAnimationFrame", "the pending frame is cleaned up on unmount"],
  ['"ptp-carousel__controls"', "the docked control bar (prev · dots · indicator · next)"],
  ['"ptp-carousel__page"', "the paged-3 snap slide"],
  ["Math.ceil(items.length / stride)", "the pure page-count math"],
]) {
  if (!editorialSrcAf.includes(needle)) {
    failures.push(`react/editorial.tsx must contain ${JSON.stringify(needle)} — (af3) ${label}`);
  }
}
for (const [needle, label] of [
  [/variant\?:\s*AnnouncementVariant/, "the compiled variant prop"],
  [/action\?:\s*AnnouncementBannerAction/, "the compiled action slot"],
  [/icon\?:\s*IconName/, "the compiled icon override (a real lucide key, typed)"],
]) {
  if (!needle.test(editorialDtsAf)) {
    failures.push(`(af3) the compiled react/editorial.d.ts must carry ${label}`);
  }
}
// THE V2.7 CODEX NEEDLES — SYSTEM_PROMPT.md recipes must be factual against
// the new surface (title checked in (dd4)).
for (const [needle, label] of [
  ["### <FormField>", "the FormField recipe exists"],
  ["prefix=\"$\"", "the codex shows the prefix adornment"],
  ["required", "the codex mentions the required marker"],
  ['align: "right"', "the codex DataTable shows the align fix"],
  ["### <RadioCardGroup>", "the RadioCardGroup recipe exists"],
  ["--bg-surface", "the codex carries the selected-card lift note"],
  ["### <ToggleSwitch>", "the ToggleSwitch recipe exists"],
  [/visible text/i, "the codex documents the label as visible text"],
  ["### <AnnouncementBanner>", "the AnnouncementBanner recipe exists"],
  ['variant="announcement"', "the codex shows the variant API"],
  ["TriangleExclamationPoint", "the codex names the live-map-valid warning icon"],
  ["### <ProseBlock>", "the ProseBlock recipe exists"],
  ["--party-mauve", "the codex documents the mauve quote bar"],
  ["### <Carousel>", "the Carousel recipe exists"],
  ["indicator", "the codex documents the page indicator"],
  // 2.5.0 — the v2.8 codex recipes.
  ["### <Button>", "the Button recipe exists (2.5.0)"],
  ["--party-yellow", "the codex documents the meter's Fair stage token"],
  ["### <PasswordInput>", "the PasswordInput recipe exists (2.5.0)"],
  ["### <ActionTile>", "the ActionTile recipe exists (2.5.0)"],
  ["### <FlipCard>", "the FlipCard recipe exists (2.5.0)"],
  ["### <AccordionCard>", "the AccordionCard recipe exists (2.5.0)"],
  ["### <MatchupCard>", "the MatchupCard recipe exists (2.5.0)"],
  ["### <StatCard> + <Sparkline>", "the KPI recipe exists (2.5.0)"],
  ["### The sig-shell layout (2.5.0)", "the sig-shell layout snippet exists"],
  ["description", "the codex documents the description-above contract"],
  ["validMessage", "the codex shows the live-validation success slot"],
  // 2.6.0 — the v2.9 codex recipes (fact-checked against the compiled .d.ts).
  ["accentToken", "the codex shows the SurfaceCard chromatic accent"],
  ["elevation", "the codex shows the SurfaceCard elevation tiers"],
  ["### <ContentCard>", "the ContentCard recipe exists (2.6.0)"],
  ["categoryToken", "the codex shows the category badge token"],
  ["### <ReferenceCard>", "the ReferenceCard recipe exists (2.6.0)"],
  ["onCopied", "the codex documents the toast contract (wrap in ToastProvider)"],
  ["### <TierCard>", "the TierCard recipe exists (2.6.0)"],
  ["featured", "the codex shows the featured hierarchy"],
  ["### <ProfileCard>", "the ProfileCard recipe exists (2.6.0)"],
  ["### <ChronicleTimeline>", "the ChronicleTimeline recipe exists (2.6.0)"],
  ["Night of Versions", "the codex credits the memorial"],
  ["data-elevation", "the codex documents the shared elevation ladder"],
]) {
  const found = needle instanceof RegExp ? needle.test(systemPrompt) : systemPrompt.includes(needle);
  if (!found) {
    failures.push(`SYSTEM_PROMPT.md must contain ${String(needle)} — (af3) the v2.7 codex ${label}`);
  }
}

// ---- (b12) THE 12-COLUMN BENTO (2.5.0, defect #5) --------------------------------
// styles.css declares the 12-col grid + the span utilities + the 768px
// collapse with ALL spans reset; App.tsx renders the bento and uses every
// span class (the assembly: banner 12 / StatCards 4×3 / check-in 5 /
// chronology 4×2rows / telemetry 3 / deck 5 / palette 3 / ledger 7 /
// matchup 5).
const bentoGrid = /\.bento12\s*\{[^}]*grid-template-columns: repeat\(12, 1fr\);[^}]*gap: var\(--space-section\);/s;
if (!bentoGrid.test(stylesCss)) {
  failures.push(
    "(b12) styles.css must declare .bento12 { grid-template-columns: repeat(12, 1fr); gap: var(--space-section); }",
  );
}
for (const span of ["12", "7", "5", "4", "3"]) {
  const spanRule = new RegExp(`\\.bento12 > \\.sig-span-${span}\\s*\\{[^}]*grid-column: span ${span};`, "s");
  if (!spanRule.test(stylesCss)) {
    failures.push(`(b12) styles.css must declare the span utility — .bento12 > .sig-span-${span} { grid-column: span ${span}; }`);
  }
}
if (!/\.bento12 > \.sig-row-2\s*\{[^}]*grid-row: span 2;/s.test(stylesCss)) {
  failures.push("(b12) styles.css must declare .bento12 > .sig-row-2 { grid-row: span 2; } (the chronology's double row)");
}
if (!/@media \(max-width: 768px\)\s*\{[^@]*\.bento12\s*\{[^}]*grid-template-columns: 1fr;/s.test(stylesCss)) {
  failures.push(
    "(b12) the bento must collapse to ONE column at max-width: 768px (Pillar 2 + the 768px proof)",
  );
}
const bentoReset = /@media \(max-width: 768px\)\s*\{[^@]*\.bento12 > \.sig-span-12,[^}]*grid-column: auto;[^}]*grid-row: auto;/s;
if (!bentoReset.test(stylesCss)) {
  failures.push(
    "(b12) the 768px collapse must reset EVERY span — .sig-span-12/7/5/4/3 + .sig-row-2 → grid-column: auto; grid-row: auto;",
  );
}
for (const usage of ["sig-span-12", "sig-span-7", "sig-span-5", "sig-span-4", "sig-span-3", "sig-row-2"]) {
  if (!appSrc.includes(usage)) {
    failures.push(`(b12) App.tsx must USE the span class ${usage} in the bento assembly`);
  }
}

// ---- (sh1) THE SHELL (2.5.0, defect #1; 2.6.0 WIDENED) ---------------------------
// .sig-shell: max-width 1520px (the catalog needs the room), centered,
// clamp(24px, 4vw, 56px) side padding (≥24px viewport margins at every
// width), 64px bottom air. App.tsx wraps every view's content in it.
const shellRule = /\.sig-shell\s*\{[^}]*max-width: 1520px;[^}]*padding-inline: clamp\(24px, 4vw, 56px\);[^}]*padding-bottom: 64px;/s;
if (!shellRule.test(stylesCss)) {
  failures.push(
    "(sh1) styles.css must declare .sig-shell { max-width: 1520px; margin-inline: auto; padding-inline: clamp(24px, 4vw, 56px); padding-bottom: 64px; } (2.6.0: widened for the master catalog)",
  );
}
if (!appSrc.includes('<div className="sig-shell">')) {
  failures.push("(sh1) App.tsx must wrap every view's content in <div className=\"sig-shell\"> — GlobalNav stays outside");
}

// ---- (ff1) FORMFIELD TOP-DOWN ANATOMY (2.5.0, defect #2) -------------------------
// DOM ORDER IS THE LAW: label → description → control (well when
// prefix/suffix) → validation. The proof greps FormField's OWN function
// body: the __desc span renders BEFORE `{control}` (the well rides
// inside it), and the validation zone renders AFTER the control.
const formFieldSrc = formsSrcAf.slice(
  formsSrcAf.indexOf("export function FormField"),
  formsSrcAf.indexOf("export function PasswordInput"),
);
// 3.0.0 (ff2) AMENDMENT of the 2.5.0 (ff1) DOM-order law: the owner
// REVERSED the helpers position — description + hint now render BELOW
// the control in the .ptp-form-field__helpers slot (the a11y survival
// is programmatic: aria-describedby). The validation zone still renders
// after everything.
const descIdx = formFieldSrc.indexOf('className="ptp-form-field__desc"');
const controlRenderIdx = formFieldSrc.indexOf("{control}");
const wellDefIdx = formFieldSrc.indexOf('className="ptp-form-field__well"');
const alertIdx = formFieldSrc.indexOf('className="ptp-form-field__error" role="alert"');
const validIdx = formFieldSrc.indexOf('className="ptp-form-field__valid"');
if (descIdx === -1 || controlRenderIdx === -1 || descIdx < controlRenderIdx) {
  failures.push(
    "(ff1, 3.0.0 amendment) FormField must render .ptp-form-field__desc in the HELPERS slot AFTER the control zone — the owner's v3.0.0 reversal of the 2.5.0 desc-above anatomy (helpers below the well)",
  );
}
if (wellDefIdx === -1 || alertIdx === -1 || controlRenderIdx > alertIdx) {
  failures.push(
    "(ff1) FormField must render the validation zone AFTER the control zone — label row → control → helpers → error/valid",
  );
}
if (validIdx === -1) {
  failures.push('(ff1) FormField must render the .ptp-form-field__valid slot (the validMessage line)');
}
for (const [needle, label] of [
  ["description?: string", "the description prop (format rules ABOVE the input)"],
  ["validMessage?: string", "the validMessage prop (the live-validation success line)"],
  ["suffix?: string", "the suffix prop (the right chip)"],
  ['data-invalid={!!error || undefined}', "the well's error attribute drives the shake + peach border"],
  ['className="ptp-form-field__chip ptp-form-field__chip--right"', "the suffix chip carries the right modifier"],
]) {
  if (!formsSrcAf.includes(needle)) {
    failures.push(`react/forms.tsx must contain ${JSON.stringify(needle)} — (ff1) ${label}`);
  }
}
for (const [needle, label] of [
  [".ptp-form-field__desc", "the format-line slot (muted 0.75rem, ABOVE the control)"],
  [".ptp-form-field__valid", "the success line slot (party-green)"],
  [".ptp-form-field__well:focus-within", "the well OWNS the focus treatment"],
  [".ptp-form-field__well > .ptp-input,\n  .ptp-form-field__well > input", "the scoped kill — prefix/suffix children must be BARE inputs"],
  [".ptp-form-field__chip:first-child", "the LEFT chip's cursor-side hairline (border-right)"],
  ["@keyframes ptp-shake", "the error shake keyframes"],
  ["animation: ptp-shake 0.3s ease-out", "the shake rides [data-invalid]"],
]) {
  if (!formsCssAf.includes(needle)) {
    failures.push(`css/forms.css must contain ${JSON.stringify(needle)} — (ff1) ${label}`);
  }
}
const promotedLabel = /\.ptp-form-field__label\s*\{[^}]*color: var\(--text-main\);[^}]*font-size: 0\.875rem;[^}]*font-weight: 500;/s;
if (!promotedLabel.test(formsCssAf)) {
  failures.push(
    "(ff1) the field label is PROMOTED — .ptp-form-field__label { color: var(--text-main); font-size: 0.875rem; font-weight: 500; } (the title is the headline, not a caption)",
  );
}
const wellFocus = /\.ptp-form-field__well:focus-within\s*\{[^}]*border-color: var\(--color-cake-primary\);[^}]*outline: 3px solid color-mix\(in srgb, var\(--color-cake-primary\) 25%, transparent\);/s;
if (!wellFocus.test(formsCssAf)) {
  failures.push(
    "(ff1) the well focus halo — border-color Flamingo + the 3px translucent Flamingo OUTLINE (the box-shadow spelling is banned by the frozen (f1) gate; documented decision)",
  );
}
const shakeKill = /@media \(prefers-reduced-motion: reduce\)\s*\{[^@]*\.ptp-form-field__well\[data-invalid\]\s*\{[^}]*animation: none;/s;
if (!shakeKill.test(formsCssAf)) {
  failures.push(
    "(ff1) the reduced-motion guard must kill the shake — .ptp-form-field__well[data-invalid] { animation: none; } inside prefers-reduced-motion",
  );
}

// ---- (ff2) SYMMETRICAL FORMS (3.0.0) ----------------------------------------------
// The label rail (fixed 20px), the helpers-below slot (20px), the pure-CSS
// info tooltip (hover + focus-visible), and the aria-describedby preservation.
{
  const formsCss30 = formsCssAf;
  const FF2_CSS = [
    [".ptp-form-field__label-row", "the label alignment row"],
    [".ptp-form-field__info", "the tooltip trigger button"],
    ["content: attr(data-tooltip)", "the pure-CSS bubble text"],
    [".ptp-form-field__info:hover::after,\n  .ptp-form-field__info:focus-visible::after", "hover AND keyboard focus reveal the tooltip"],
    [".ptp-form-field__helpers", "the helpers slot (description + hint below the well)"],
  ];
  for (const [needle, label] of FF2_CSS) {
    if (!formsCss30.includes(needle)) {
      failures.push(`(ff2) css/forms.css must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  const labelRail = /\.ptp-form-field__label-row\s*\{[^}]*min-height: 1\.25rem;/s;
  if (!labelRail.test(formsCss30)) {
    failures.push(
      "(ff2) the label row must carry the fixed 1.25rem (20px) min-height — every side-by-side field's label aligns on the same baseline",
    );
  }
  const helpersRail = /\.ptp-form-field__helpers\s*\{[^}]*min-height: 1\.25rem;[^}]*display: flex;[^}]*flex-wrap: wrap;[^}]*gap: var\(--space-tight\);/s;
  if (!helpersRail.test(formsCss30)) {
    failures.push(
      "(ff2) .ptp-form-field__helpers must be min-height 20px + flex wrap + the tight gap — the bottom rail of the symmetrical field",
    );
  }
  if (!/bottom: calc\(100% \+ 4px\);/.test(formsCss30)) {
    failures.push(
      "(ff2) the tooltip bubble must park ABOVE the trigger — bottom: calc(100% + 4px) (position absolute, pure CSS, no deps)",
    );
  }
  const formsDts30 = formsDtsAf;
  for (const [needle, label] of [
    ["infoTooltip?: string", "the infoTooltip prop (compiled contract)"],
    ['className="ptp-form-field__label-row"', "the label row renders"],
    ['className="ptp-form-field__helpers"', "the helpers slot renders"],
    ['name="Info"', "the tooltip icon (live-map-probed key)"],
    ['title={infoTooltip}', "the native title fallback"],
    ["aria-describedby", "the describedby preservation — the format rule stays announced"],
    ["cloneElement", "the describedby merge mechanism (consumer values preserved)"],
    ['data-tooltip={infoTooltip}', "the ::after text source"],
  ]) {
    const target = needle === "infoTooltip?: string" ? formsDts30 : formsSrcAf;
    if (!target.includes(needle)) {
      failures.push(`(ff2) must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  if (!appSrc.includes('infoTooltip=')) {
    failures.push("(ff2) App.tsx must demo the infoTooltip (a live tooltip call site)");
  }
}

// ---- (pw1) PASSWORDINPUT (2.5.0) ---------------------------------------------------
for (const [needle, label] of [
  ['name={show ? "EyeOff" : "Eye"}', "the eye toggle (both names live-map-probed by (icons))"],
  ['aria-label={show ? "Hide password" : "Show password"}', "the toggle's accessible name flips"],
  ["aria-pressed={show}", "the toggle's state attribute"],
  ['role="progressbar"', "the meter is a progressbar"],
  ["aria-valuemin={0}", "the meter floor"],
  ["aria-valuemax={4}", "the meter ceiling (4 rules)"],
  ["aria-valuenow={score}", "the meter's live value"],
  ["data-score={score}", "the css state hook (the segment fill prefix)"],
  ["data-satisfied", "the pill state attribute"],
  ['label: "8+ chars"', "rule 1"],
  ['label: "Uppercase"', "rule 2"],
  ['label: "Number"', "rule 3"],
  ['label: "Symbol"', "rule 4"],
  ['["Weak", "Fair", "Good", "Strong"]', "the four stages"],
  ['description="8+ chars · mix cases, numbers, symbols"', "the format description rides FormField (the 2.5.0 anatomy)"],
]) {
  if (!formsSrcAf.includes(needle)) {
    failures.push(`react/forms.tsx must contain ${JSON.stringify(needle)} — (pw1) ${label}`);
  }
}
for (const [needle, label] of [
  [".ptp-password__meter", "the meter"],
  [".ptp-password__meter span", "the four segments"],
  ['[data-score="1"] span:nth-child(1)', "stage 1 — peach"],
  ['[data-score="2"] span:nth-child(-n + 2)', "stage 2 — the --party-yellow release token"],
  ['[data-score="3"] span:nth-child(-n + 3)', "stage 3 — sky"],
  ['[data-score="4"] span:nth-child(-n + 4)', "stage 4 — green"],
  [".ptp-password__stage", "the stage label"],
  [".ptp-password__pill", "the condition pills"],
  [".ptp-password__pill[data-satisfied]", "the satisfied pill fill"],
  [".ptp-password__toggle", "the eye button"],
  ["color-mix(in srgb, var(--party-green) 20%, transparent)", "the satisfied pill's wash"],
]) {
  if (!formsCssAf.includes(needle)) {
    failures.push(`css/forms.css must contain ${JSON.stringify(needle)} — (pw1) ${label}`);
  }
}
const yellowStage = /\[data-score="2"\] span:nth-child\(-n \+ 2\)\s*\{[^}]*background: var\(--party-yellow\);/s;
if (!yellowStage.test(formsCssAf)) {
  failures.push(
    '(pw1) the meter\'s stage 2 must fill with the release token — [data-score="2"] span:nth-child(-n + 2) { background: var(--party-yellow); }',
  );
}
for (const check of [["PasswordInput", "value"], ["PasswordInputProps", "type"]]) {
  // Type-only names elide from the compiled JS — the .d.ts is their surface.
  if (!new RegExp(`\\b${check[0]}\\b`).test(umbrellaDts)) {
    failures.push(`react/index.d.ts must re-export ${check[0]} — (pw1) ${check[1]}`);
  }
  if (check[1] === "value" && !new RegExp(`\\b${check[0]}\\b`).test(umbrellaJs)) {
    failures.push(`react/index.js must re-export ${check[0]} — (pw1) ${check[1]}`);
  }
}

// ---- (bt1) THE BUTTON FAMILY (2.5.0) ----------------------------------------------
const primitivesSrc = readFileSync(resolve(root, "react/primitives.tsx"), "utf8");
const primitivesCssPath = resolve(root, "css/primitives.css");
if (!existsSync(primitivesCssPath)) {
  failures.push("(bt1) css/primitives.css is missing — the Button family ships its own stylesheet");
} else {
  const primitivesCss = readFileSync(primitivesCssPath, "utf8");
  const BT1_CSS = [
    [".ptp-btn--primary", "the Flamingo fill variant"],
    [".ptp-btn--secondary", "the surface + hairline variant"],
    [".ptp-btn--ghost", "the transparent variant"],
    [".ptp-btn--danger", "the peach attention variant"],
    [".ptp-btn--sm", "the small size"],
    [".ptp-btn--lg", "the large size"],
    [".ptp-btn__spinner", "the loading spinner"],
    ["@keyframes ptp-spin", "the spin physics"],
    ["scale(0.97)", "the doctrine press"],
    ["outline: 2px solid var(--color-cake-primary)", "the Flamingo focus ring"],
    ["prefers-reduced-motion", "the reduced-motion guard"],
    ["border-top-color: transparent", "the spinner's arc"],
    ["font-weight: 600", "the primary's hierarchy pop (typographic — the flat primary is package law)"],
  ];
  for (const [needle, label] of BT1_CSS) {
    if (!primitivesCss.includes(needle)) {
      failures.push(`css/primitives.css must contain ${JSON.stringify(needle)} — (bt1) ${label}`);
    }
  }
  // The package law: primitives.css is ZERO-shadow and ZERO-hex.
  const primShadows = primitivesCss.match(/box-shadow\s*:\s*[^;]+;/g);
  if (primShadows !== null) {
    failures.push(
      `(bt1) css/primitives.css declares a box-shadow (${primShadows.join(" ")}) — the flat primary is package law; elevation is a composition-layer decision`,
    );
  }
  const primHexes = primitivesCss.match(/#[0-9a-f]{3,8}\b/gi);
  if (primHexes !== null) {
    failures.push(
      `(bt1) css/primitives.css contains hex literal(s) ${[...new Set(primHexes)].join(", ")} — token-driven only`,
    );
  }
  const primImportIndex = bundleCss.indexOf('@import "./primitives.css" layer(cascade);');
  if (primImportIndex === -1) {
    failures.push(
      'css/signature-style.css must import "./primitives.css" layer(cascade) — cascade membership is the layered-import doctrine',
    );
  } else {
    const dataImportForPrim = bundleCss.indexOf('@import "./data.css" layer(cascade);');
    if (dataImportForPrim !== -1 && primImportIndex < dataImportForPrim) {
      failures.push("css/signature-style.css must import ./primitives.css AFTER ./data.css (data styles load first)");
    }
  }
}
for (const [needle, label] of [
  ['variant?: "primary" | "secondary" | "ghost" | "danger"', "the 4-variant union"],
  ['size?: "sm" | "md" | "lg"', "the 3-size union"],
  ["leftIcon?: IconName", "the leading icon (strict IconName)"],
  ["rightIcon?: IconName", "the trailing icon"],
  ["loading?: boolean", "the busy state"],
  ['className="ptp-btn__spinner"', "the spinner replaces the icons"],
  ["aria-busy={loading || undefined}", "the busy attribute"],
  ["disabled={loading || disabled}", "a loading button cannot be re-submitted"],
  ['className={`ptp-btn ptp-btn--${variant}${sizeClass}', "ONE button with the composed classes"],
]) {
  if (!primitivesSrc.includes(needle)) {
    failures.push(`react/primitives.tsx must contain ${JSON.stringify(needle)} — (bt1) ${label}`);
  }
}
for (const check of [["Button", "value"], ["ButtonProps", "type"]]) {
  // Type-only names elide from the compiled JS — the .d.ts is their surface.
  if (!new RegExp(`\\b${check[0]}\\b`).test(umbrellaDts)) {
    failures.push(`react/index.d.ts must re-export ${check[0]} — (bt1)`);
  }
  if (check[1] === "value" && !new RegExp(`\\b${check[0]}\\b`).test(umbrellaJs)) {
    failures.push(`react/index.js must re-export ${check[0]} — (bt1)`);
  }
}
if (!/export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>/.test(primitivesSrc)) {
  failures.push("(bt1) ButtonProps must extend ButtonHTMLAttributes<HTMLButtonElement> — native attrs flow through");
}

// ---- (cd1) THE CARD ARCHETYPES (2.5.0) --------------------------------------------
const cardsSrcPath = resolve(root, "react/cards.tsx");
if (!existsSync(cardsSrcPath)) {
  failures.push("(cd1) react/cards.tsx is missing — the archetypes are a new module");
}
const cardsJsPath = resolve(root, "react/cards.js");
const cardsDtsPath = resolve(root, "react/cards.d.ts");
if (!existsSync(cardsJsPath)) {
  failures.push("(cd1) react/cards.js is missing — build it: npx tsc -p tsconfig.json");
}
if (!existsSync(cardsDtsPath)) {
  failures.push("(cd1) react/cards.d.ts is missing — build it: npx tsc -p tsconfig.json");
}
const cardsCssPath = resolve(root, "css/cards.css");
if (!existsSync(cardsCssPath)) {
  failures.push("(cd1) css/cards.css is missing — the archetypes ship their own stylesheet");
} else {
  const cardsCss = readFileSync(cardsCssPath, "utf8");
  const CD1_CSS = [
    ["transform-style: preserve-3d", "the flip's 3d stage"],
    ["backface-visibility: hidden", "the faces hide their backs"],
    ["rotateY(180deg)", "the flip mechanics (inner + pre-rotated back)"],
    [".ptp-accordion[open] .ptp-accordion__chevron", "the attribute IS the state — details[open] rotates the chevron"],
    ["grid-template-columns: 1fr auto 1fr", "the matchup grid"],
    [".ptp-action-tile__kbd", "the standalone shortcut chip"],
    [".ptp-flip-card[aria-pressed=\"true\"]", "the flip state rides aria-pressed"],
    ["::-webkit-details-marker", "the UA marker stripped (plus list-style: none)"],
    ["prefers-reduced-motion", "the reduced-motion guard (the opacity swap)"],
    ["min-height: 220px", "the flip card's parity floor (3.0.0: cards never collapse — the faces are absolute)"],
  ];
  for (const [needle, label] of CD1_CSS) {
    if (!cardsCss.includes(needle)) {
      failures.push(`css/cards.css must contain ${JSON.stringify(needle)} — (cd1) ${label}`);
    }
  }
  const cardsShadows = cardsCss.match(/box-shadow\s*:\s*[^;]+;/g);
  if (cardsShadows !== null) {
    failures.push(
      `(cd1) css/cards.css declares a box-shadow (${cardsShadows.join(" ")}) — cards are structure: hairlines, never shadows`,
    );
  }
  const cardsHexes = cardsCss.match(/#[0-9a-f]{3,8}\b/gi);
  if (cardsHexes !== null) {
    failures.push(
      `(cd1) css/cards.css contains hex literal(s) ${[...new Set(cardsHexes)].join(", ")} — token-driven only`,
    );
  }
  const cardsImportIndex = bundleCss.indexOf('@import "./cards.css" layer(cascade);');
  if (cardsImportIndex === -1) {
    failures.push(
      'css/signature-style.css must import "./cards.css" layer(cascade) — cascade membership is the layered-import doctrine',
    );
  } else {
    const primImportForCards = bundleCss.indexOf('@import "./primitives.css" layer(cascade);');
    if (primImportForCards !== -1 && cardsImportIndex < primImportForCards) {
      failures.push("css/signature-style.css must import ./cards.css AFTER ./primitives.css (primitives load first)");
    }
  }
}
for (const [needle, label] of [
  ["aria-pressed={flipped}", "the flip state is aria-pressed (button semantics carry Space/Enter)"],
  ['className="ptp-flip-card"', "the flip root"],
  ['<details className="ptp-accordion">', "the ZERO-JS accordion"],
  ['className="ptp-accordion__summary"', "the summary line"],
  ['<Icon name="ChevronDown" className="ptp-accordion__chevron"', "the token chevron"],
  ["size={40}", "the matchup avatars ride the grid-perfect diameter"],
  ['className="ptp-matchup__vs"', "the VS pill"],
  ['className="ptp-matchup__stakes"', "the stakes footer"],
  ["useState(false)", "the flip's INTERNAL state (uncontrolled default)"],
]) {
  const cardsSrc = readFileSync(cardsSrcPath, "utf8");
  if (!cardsSrc.includes(needle)) {
    failures.push(`react/cards.tsx must contain ${JSON.stringify(needle)} — (cd1) ${label}`);
  }
}
for (const name of ["ActionTile", "FlipCard", "AccordionCard", "MatchupCard"]) {
  if (!new RegExp(`\\b${name}\\b`).test(umbrellaDts)) {
    failures.push(`react/index.d.ts must re-export ${name} — (cd1)`);
  }
  if (!new RegExp(`\\b${name}\\b`).test(umbrellaJs)) {
    failures.push(`react/index.js must re-export ${name} — (cd1)`);
  }
}

// ---- (par) CARD PARITY + CHROMATIC ENRICHMENT (3.0.0) ----------------------------
// The three hand-rolled archetypes become self-contained surfaces (never
// transparent/collapsed in grid rows) and gain the chromatic enrichment:
// bg-surface + the 15% glass-inset border + var(--radius-card) + the 220px
// floor on .ptp-flip-card / .ptp-accordion / .ptp-matchup; the ActionTile
// well tints 12% from --sig-accent (Teal fallback); [data-accent] cards wear
// the 45% translucent chromatic border-top. Shadow policy unchanged:
// cards.css stays ABSOLUTE ZERO (belt-and-braces with (cd1)/(e1)).
{
  const cardsCss30 = readFileSync(resolve(root, "css/cards.css"), "utf8");
  for (const archetype of [".ptp-flip-card", ".ptp-accordion", ".ptp-matchup"]) {
    const block = cardsCss30.match(
      new RegExp(`${archetype.replace(/-/g, "\\-")}\\s*\\{([^}]*)\\}`, "s"),
    );
    if (block === null) {
      failures.push(`(par) css/cards.css has no parseable ${archetype} rule block`);
      continue;
    }
    const body = block[1];
    if (!body.includes("background: var(--bg-surface)")) {
      failures.push(`(par) ${archetype} must carry background: var(--bg-surface) — the self-contained surface (3.0.0 parity)`);
    }
    if (!body.includes("border: 1px solid color-mix(in srgb, var(--text-muted) 15%, transparent)")) {
      failures.push(`(par) ${archetype} must carry the 15% glass-inset border (3.0.0 parity)`);
    }
    if (!body.includes("border-radius: var(--radius-card)")) {
      failures.push(`(par) ${archetype} must carry border-radius: var(--radius-card) — cards earn rounder corners than 6px controls`);
    }
    if (!body.includes("min-height: 220px")) {
      failures.push(`(par) ${archetype} must carry min-height: 220px — never transparent/collapsed in grid rows`);
    }
  }
  const wellTint = /\.ptp-action-tile__well\s*\{[^}]*background: color-mix\(in srgb, var\(--sig-accent, var\(--color-cake-secondary\)\) 12%, transparent\);/s;
  if (!wellTint.test(cardsCss30)) {
    failures.push(
      "(par) .ptp-action-tile__well must tint 12% — background: color-mix(in srgb, var(--sig-accent, var(--color-cake-secondary)) 12%, transparent)",
    );
  }
  if (!cardsCss30.includes("[data-accent] .ptp-flip-card,\n  [data-accent] .ptp-accordion,\n  [data-accent] .ptp-matchup")) {
    failures.push(
      "(par) the [data-accent] chromatic top-accent rule must cover all three archetypes",
    );
  }
  const topAccent = /\[data-accent\] \.ptp-flip-card,\s*\n\s*\[data-accent\] \.ptp-accordion,\s*\n\s*\[data-accent\] \.ptp-matchup\s*\{[^}]*border-top: 2px solid color-mix\(in srgb, var\(--sig-accent\) 45%, transparent\);/s;
  if (!topAccent.test(cardsCss30)) {
    failures.push(
      "(par) the chromatic top accent must be border-top: 2px solid color-mix(in srgb, var(--sig-accent) 45%, transparent) — the card's identity mark, distinct from the title underline",
    );
  }
  const cardsShadows30 = cardsCss30.match(/box-shadow\s*:\s*[^;]+;/g);
  if (cardsShadows30 !== null) {
    failures.push(
      `(par) css/cards.css declares a box-shadow (${cardsShadows30.join(" ")}) — the 3.0.0 enrichment keeps the e1 treaty: cards.css stays ABSOLUTE ZERO`,
    );
  }
}

// ---- (al1) THE LIVE LEDGER ALIGNMENT (2.5.0, defect #4) ---------------------------
// The bento's span-7 ledger derives from state; its Contribution column
// carries numeric + align right (the (af1) package contract, exercised
// LIVE). The probe measures th/td right edges within ±2px.
const bentoLedgerCols = appSrc.indexOf("BENTO_LEDGER_COLUMNS");
if (bentoLedgerCols === -1) {
  failures.push("(al1) App.tsx must declare BENTO_LEDGER_COLUMNS — the live ledger's contract");
} else {
  const colSlice = appSrc.slice(bentoLedgerCols, bentoLedgerCols + 400);
  if (!colSlice.includes('{ key: "share", header: "Contribution", numeric: true, align: "right" }')) {
    failures.push(
      '(al1) BENTO_LEDGER_COLUMNS must set { key: "share", header: "Contribution", numeric: true, align: "right" } — the header flushes over the live $ values',
    );
  }
}
if (!appSrc.includes('data-testid="ledger-table"')) {
  failures.push('(al1) the live ledger must carry data-testid="ledger-table" — the probe hooks it');
}
if (!appSrc.includes("rows={derived.ledgerRows}")) {
  failures.push("(al1) the live ledger must render rows={derived.ledgerRows} — LIVE from state, not a const");
}

// ---- (acc1) THE ACCENT CONTRACT (2.6.0) --------------------------------------------
// The chromatic mechanism: [data-accent] + the inline --sig-accent variable,
// painted entirely in css (eyebrow color, 2px title underline, glow). The
// types: PartyColorToken (the 11 --party-* tokens) + AccentToken (party +
// the two structural signatures) exported from the surface module; the
// compiled .d.ts is the consumer-facing contract.
const surfaceSrc26 = readFileSync(resolve(root, "react/surface.tsx"), "utf8");
const surfaceDts26 = readFileSync(resolve(root, "react/surface.d.ts"), "utf8");
for (const [needle, label] of [
  ["[data-accent] .sig-surface-card__eyebrow", "the accent eyebrow rule"],
  ["[data-accent] .sig-surface-card__title", "the accent title rule"],
  ["border-bottom: 2px solid var(--sig-accent)", "the 2px accent underline (the GlobalNav/Tabs contract)"],
  ["color: var(--sig-accent)", "the accent eyebrow ink"],
  ["--sig-accent", "the inline accent variable"],
]) {
  if (!surfaceCssH1.includes(needle)) {
    failures.push(`css/surface.css must contain ${JSON.stringify(needle)} — (acc1) ${label}`);
  }
}
for (const [needle, label] of [
  ["export type PartyColorToken = PartyTokenName", "the 11-token content accent alias"],
  ['export type StructuralAccentToken = "--color-cake-primary" | "--color-cake-secondary"', "the two structural accents"],
  ["export type AccentToken = PartyColorToken | StructuralAccentToken", "the full accent union"],
  ['accentToken?: AccentToken', "the SurfaceCard chromatic prop"],
  ['elevation?: SurfaceElevation', "the SurfaceCard elevation prop"],
  ['elevation = "raised"', "the raised default"],
  ["data-accent={accentToken !== undefined || undefined}", "the attribute IS the accent state"],
  ["data-elevation={elevation}", "the attribute IS the tier state"],
]) {
  if (!surfaceSrc26.includes(needle)) {
    failures.push(`react/surface.tsx must contain ${JSON.stringify(needle)} — (acc1) ${label}`);
  }
}
for (const typeName of ["PartyColorToken", "StructuralAccentToken", "AccentToken", "SurfaceElevation"]) {
  if (!new RegExp(`\\b${typeName}\\b`).test(surfaceDts26)) {
    failures.push(`react/surface.d.ts must export ${typeName} — (acc1) the compiled contract`);
  }
  if (!new RegExp(`\\b${typeName}\\b`).test(umbrellaDts)) {
    failures.push(`react/index.d.ts must re-export ${typeName} — (acc1)`);
  }
}
if (!/PartyColorToken/.test(cardsDtsPath ? readFileSync(cardsDtsPath, "utf8") : "")) {
  failures.push("(acc1) react/cards.d.ts must consume PartyColorToken — the archetypes are accent-typed");
}

// ---- (elev) THE ELEVATION LADDER (2.6.0) -------------------------------------------
// The three bare tier blocks in css/surface.css (the shared ladder — the
// featured TierCard rides it); the shadow policies asserted EXPLICITLY for
// both files: surface.css sanctions are the (e1) scopes; cards.css is
// ABSOLUTE ZERO (the chromatic glow lives in surface.css's [data-accent]
// rules, the floating shadow in the shared tier blocks).
for (const tier of ELEVATION_TIER_SELECTORS) {
  const tierBlock = new RegExp(`${tier.replace(/"/g, '\\"')}\\s*\\{[^}]*box-shadow:`, "s");
  if (!tierBlock.test(surfaceCssH1.replace(/\/\*[\s\S]*?\*\//g, ""))) {
    failures.push(
      `css/surface.css must declare the ${tier} tier block with a box-shadow — (elev) the shared elevation ladder`,
    );
  }
}
const floatingBlock = surfaceCssH1.match(/\[data-elevation="floating"\]\s*\{([^}]*)\}/s);
if (floatingBlock === null || !floatingBlock[1].includes("0 22px 52px rgba(0, 0, 0, 0.60)")) {
  failures.push(
    '(elev) the floating tier must carry the deep display shadow — 0 22px 52px rgba(0, 0, 0, 0.60)',
  );
}
const raisedBlock = surfaceCssH1.match(/\[data-elevation="raised"\]\s*\{([^}]*)\}/s);
if (raisedBlock === null || !raisedBlock[1].includes("0 12px 32px rgba(0, 0, 0, 0.42)")) {
  failures.push(
    '(elev) the raised tier must carry the tuned ambient — 0 12px 32px rgba(0, 0, 0, 0.42)',
  );
}
if (!/\.sig-surface-card--interactive\[data-elevation="floating"\]:hover\s*\{[^}]*transform: translateY\(-4px\);/s.test(surfaceCssH1)) {
  failures.push(
    '(elev) interactive+floating must lift translateY(-4px) on hover (interactive alone stays -2px — the reconciliation, documented)',
  );
}
// css/cards.css: the archetypes stay ABSOLUTE ZERO on box-shadow (also
// asserted by (cd1); restated here as the 2.6.0 policy statement).
const cardsCss26 = readFileSync(cardsCssPath, "utf8");
const cardsShadows26 = cardsCss26.match(/box-shadow\s*:\s*[^;]+;/g);
if (cardsShadows26 !== null) {
  failures.push(
    `(elev) css/cards.css declares a box-shadow (${cardsShadows26.join(" ")}) — the 2.6.0 policy: the archetypes stay FLAT; featured TierCard elevation rides the shared [data-elevation] ladder in css/surface.css and the chromatic glow lives in the [data-accent] rules there`,
  );
}

// ---- (pt11) THE 11-TOKEN SWEEP (2.6.0) ----------------------------------------------
// PartyColorToken's union resolves through Extract<KnownToken,
// `--party-${string}`> — the ThemeProvider whitelist IS the union, so the
// sweep pins the whitelist to EXACTLY the 11 names and checks the alias
// exists in the compiled surface.d.ts. (verify-playground has no running
// whitelist parse of its own — the TOKEN_KEYS array is parsed here, the
// same way the frozen scripts/verify.mjs reads it.)
const EXPECTED_PARTY_11 = [
  "--party-pink-bright",
  "--party-pink-soft",
  "--party-pink-alt",
  "--party-mauve-bright",
  "--party-mauve-soft",
  "--party-lavender",
  "--party-sky",
  "--party-blue",
  "--party-peach",
  "--party-green",
  "--party-yellow",
];
const themeProviderSrc26 = readFileSync(resolve(root, "react/ThemeProvider.tsx"), "utf8");
const tokenKeysMatch26 = themeProviderSrc26.match(/const\s+TOKEN_KEYS\s*=\s*\[([\s\S]*?)\]\s*as\s+const;/);
if (tokenKeysMatch26 === null) {
  failures.push("(pt11) cannot sweep — react/ThemeProvider.tsx has no parseable TOKEN_KEYS array");
} else {
  const whitelist26 = [...tokenKeysMatch26[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  const partyNames = whitelist26.filter((name) => name.startsWith("--party-"));
  if (partyNames.length !== 11) {
    failures.push(
      `(pt11) the whitelist carries ${partyNames.length} --party-* tokens, expected EXACTLY 11 — the PartyColorToken union is the whitelist`,
    );
  }
  for (const name of EXPECTED_PARTY_11) {
    if (!partyNames.includes(name)) {
      failures.push(`(pt11) the 11-token sweep is missing ${name}`);
    }
  }
}
if (!/export type PartyColorToken = PartyTokenName/.test(surfaceDts26)) {
  failures.push(
    "(pt11) react/surface.d.ts must carry `export type PartyColorToken = PartyTokenName` — the alias resolves through Extract<KnownToken, `--party-${string}`>",
  );
}

// ---- (cc1) CONTENTCARD (2.6.0) --------------------------------------------------------
const cardsSrc26 = readFileSync(cardsSrcPath, "utf8");
const CC1_CSS = [
  ["aspect-ratio: 16 / 9", "the 16/9 visual header"],
  [".sig-content-card__pill", "the mono meta pill"],
  ["font-size: 0.6875rem", "the 11px pill voice"],
  [".sig-content-card__footer", "the action footer"],
  ["[data-accent] .sig-content-card__title", "the accent underline contract"],
];
for (const [needle, label] of CC1_CSS) {
  if (!cardsCss26.includes(needle)) {
    failures.push(`css/cards.css must contain ${JSON.stringify(needle)} — (cc1) ${label}`);
  }
}
const contentFooterRule = /\.sig-content-card__footer\s*\{[^}]*margin-top: auto;/s;
if (!contentFooterRule.test(cardsCss26)) {
  failures.push("(cc1) .sig-content-card__footer must pin to the card floor — margin-top: auto");
}
for (const [needle, label] of [
  ["export interface ContentCardProps", "the props contract"],
  ["image?: string", "the optional cover image URL"],
  ["categoryToken?: PartyColorToken", "the party-typed category badge"],
  ["meta?: string[]", "the mono meta pills"],
  ['className="sig-content-card__visual"', "the 16/9 visual element"],
  ['className="sig-content-card__pill"', "the meta pill render"],
  ["linear-gradient(135deg, color-mix(in srgb, var(--sig-accent, var(--color-cake-primary)) 30%, var(--bg-inset)), var(--bg-inset))", "the token-driven gradient art fallback (zero hex)"],
  ['<Button variant="secondary" size="sm" onClick={action.onClick}>', "the footer rides the PACKAGE Button"],
]) {
  if (!cardsSrc26.includes(needle)) {
    failures.push(`react/cards.tsx must contain ${JSON.stringify(needle)} — (cc1) ${label}`);
  }
}
const cardsSrcHexes26 = cardsSrc26.match(/#[0-9a-f]{6}/gi);
if (cardsSrcHexes26 !== null) {
  failures.push(
    `react/cards.tsx contains hardcoded hex literal(s) ${[...new Set(cardsSrcHexes26)].join(", ")} — the archetypes consume var(--token) only (r4 doctrine)`,
  );
}

// ---- (cc2) REFERENCECARD (2.6.0) --------------------------------------------------------
for (const [needle, label] of [
  ["navigator.clipboard\n      .writeText(code)", "the async clipboard write"],
  ["onCopied?.()", "fires AFTER a successful copy (the toast contract — decoupled by design)"],
  ["copied ? \"Copied!\" : \"Copy Snippet\"", "the copied flash"],
  ["}, 2000);", "the copied state resets after 2s"],
  ["window.clearTimeout(resetTimer.current)", "the timer is cleaned up"],
  [".catch(() => {", "the clipboard failure stays silent (the label never lies)"],
  ['<Button variant="ghost" size="sm" leftIcon="Copy" onClick={copy}>', "the ghost Copy button (the package Button)"],
  ['className="sig-reference-card__tag"', "the mono tag chip"],
  ['className="sig-reference-card__code"', "the code well"],
  ["Reference ↗", "the optional footer anchor"],
]) {
  if (!cardsSrc26.includes(needle)) {
    failures.push(`react/cards.tsx must contain ${JSON.stringify(needle)} — (cc2) ${label}`);
  }
}
const refTagRule = /\.sig-reference-card__tag\s*\{[^}]*text-transform: uppercase;[^}]*background: var\(--bg-inset\);/s;
if (!refTagRule.test(cardsCss26)) {
  failures.push(
    "(cc2) .sig-reference-card__tag must be the uppercase inset chip (mono, hairline)",
  );
}
const refCodeRule = /\.sig-reference-card__code\s*\{[^}]*background: var\(--bg-inset\);[^}]*overflow-x: auto;[^}]*font-size: 0\.8125rem;/s;
if (!refCodeRule.test(cardsCss26)) {
  failures.push(
    "(cc2) .sig-reference-card__code must be the mono 0.8125rem inset well with overflow-x: auto",
  );
}

// ---- (cc3) TIERCARD (2.6.0) --------------------------------------------------------------
for (const [needle, label] of [
  ['data-elevation={featured ? "floating" : "raised"}', "featured rides the shared ladder's floating rung"],
  ['<Icon name="Check" aria-hidden />', "the Check feature bullets"],
  ["sig-tier-card--featured", "the featured modifier"],
  ["variant={featured ? \"primary\" : \"secondary\"}", "the CTA variant flips with featured"],
]) {
  if (!cardsSrc26.includes(needle)) {
    failures.push(`react/cards.tsx must contain ${JSON.stringify(needle)} — (cc3) ${label}`);
  }
}
const tierFeaturedRule = /\.sig-tier-card--featured\s*\{[^}]*border: 2px solid var\(--sig-accent, var\(--color-cake-primary\)\);/s;
if (!tierFeaturedRule.test(cardsCss26)) {
  failures.push(
    "(cc3) .sig-tier-card--featured must carry the 2px accent border — border: 2px solid var(--sig-accent, var(--color-cake-primary)) (no scale transform)",
  );
}
const tierCheckRule = /\.sig-tier-card__features li svg\s*\{[^}]*color: var\(--party-green\);/s;
if (!tierCheckRule.test(cardsCss26)) {
  failures.push(
    "(cc3) the TierCard Check bullets must wear party green — .sig-tier-card__features li svg { color: var(--party-green); }",
  );
}
const tierPriceRule = /\.sig-tier-card__price\s*\{[^}]*font-size: 2rem;[^}]*font-weight: 600;[^}]*font-variant-numeric: tabular-nums;/s;
if (!tierPriceRule.test(cardsCss26)) {
  failures.push(
    "(cc3) .sig-tier-card__price must be 2rem tabular-nums weight 600 (digits never jitter)",
  );
}

// ---- (cc4) PROFILECARD (2.6.0) -------------------------------------------------------------
for (const [needle, label] of [
  ["<Avatar name={name} size={avatarSize} ringToken={accentToken} />", "the avatar wears the party ring (typed PartyColorToken)"],
  ["accentToken?: PartyColorToken", "the profile accent is party-only (the avatar-ring rule)"],
  ["avatarSize?: 32 | 40", "the grid-perfect diameters"],
  ["stats.length < 2 || stats.length > 3", "the 2–3 stats band (dev-warned outside)"],
  ["font-variant-numeric: tabular-nums", "css-side: the stat digits"],
]) {
  const target = needle.startsWith("font-variant") ? cardsCss26 : cardsSrc26;
  if (!target.includes(needle)) {
    failures.push(
      `${needle.startsWith("font-variant") ? "css/cards.css" : "react/cards.tsx"} must contain ${JSON.stringify(needle)} — (cc4) ${label}`,
    );
  }
}
const statValueRule = /\.sig-profile-card__stat-value\s*\{[^}]*font-weight: 600;[^}]*font-variant-numeric: tabular-nums;[^}]*color: var\(--text-main\);/s;
if (!statValueRule.test(cardsCss26)) {
  failures.push(
    "(cc4) .sig-profile-card__stat-value must be tabular-nums weight 600 text-main",
  );
}

// ---- (cc5) CHRONICLETIMELINE (2.6.0) ---------------------------------------------------------
for (const [needle, label] of [
  ['<ol className={classes} aria-label={label ?? "Version chronicle"}>', "the <ol> root with the accessible name"],
  ['className="ptp-chronicle__item"', "the release item"],
  ['"--accent": `var(${release.accentToken ?? "--party-lavender"})`', "the inline accent variable (lavender fallback)"],
  ['className="ptp-chronicle__node"', "the milestone dot"],
  ['className="ptp-chronicle__tag"', "the mono accent tag"],
  ['className="ptp-chronicle__stat"', "the optional mono stat"],
  ["export interface ChronicleRelease", "the release contract"],
]) {
  if (!cardsSrc26.includes(needle)) {
    failures.push(`react/cards.tsx must contain ${JSON.stringify(needle)} — (cc5) ${label}`);
  }
}
const chronicleSpine = /\.ptp-chronicle::before\s*\{[^}]*width: 2px;[^}]*background: color-mix\(in srgb, var\(--text-muted\) 20%, transparent\);/s;
if (!chronicleSpine.test(cardsCss26)) {
  failures.push(
    "(cc5) .ptp-chronicle::before must be the 2px 20% color-mix hairline spine",
  );
}
const chronicleNode = /\.ptp-chronicle__node\s*\{[^}]*width: 12px;[^}]*border: 2px solid var\(--accent\);[^}]*background: var\(--bg-surface\);/s;
if (!chronicleNode.test(cardsCss26)) {
  failures.push(
    "(cc5) .ptp-chronicle__node must be the 12px accent-ringed, surface-filled dot",
  );
}

// ---- (ring2) STATRING ZOOM + DETAIL (3.0.0) ----------------------------------------
// css/viz.css: the square dial (aspect-ratio 1/1, 120px default), the
// scale(1.07) zoom on hover + [data-expanded], the 0fr→1fr detail strip,
// the reduced-motion kill. react/viz.tsx: total?/unit? props + the internal
// expand state (the owner-authorized MINIMAL growth — core dash logic
// untouched: the three circles + the dash math needles stay via (v22)).
{
  const vizCss30 = vizCss24;
  const vizSrc30 = readFileSync(resolve(root, "react/viz.tsx"), "utf8");
  const RING2_CSS = [
    [".ptp-ring__dial", "the square dial wrapper"],
    ["aspect-ratio: 1 / 1", "the 1/1 square"],
    ["width: 120px", "the 120px default box"],
    ["transform: scale(1.07)", "the zoom"],
    [".ptp-ring[data-expanded=\"true\"] .ptp-ring__dial", "the expanded zoom state"],
    [".ptp-ring__detail", "the detail strip"],
    ["grid-template-rows: 0fr", "the collapsed strip (the 0fr→1fr trick)"],
    ["grid-template-rows: 1fr", "the open strip"],
    ["font-variant-numeric: tabular-nums", "the strip's tabular digits"],
  ];
  for (const [needle, label] of RING2_CSS) {
    if (!vizCss30.includes(needle)) {
      failures.push(`(ring2) css/viz.css must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  const dialSquare = /\.ptp-ring__dial\s*\{[^}]*aspect-ratio: 1 \/ 1;[^}]*width: 120px;/s;
  if (!dialSquare.test(vizCss30)) {
    failures.push(
      "(ring2) .ptp-ring__dial must be the aspect-ratio 1/1 square with the 120px default",
    );
  }
  const reducedRing = /@media \(prefers-reduced-motion: reduce\)\s*\{[^@]*\.ptp-ring__dial,\s*\n\s*\.ptp-ring__detail\s*\{[^}]*transition: none;/s;
  if (!reducedRing.test(vizCss30)) {
    failures.push(
      "(ring2) the reduced-motion guard must kill the zoom + the slide (dial + detail, transition: none)",
    );
  }
  for (const [needle, label] of [
    ["total?: number", "the detail denominator prop"],
    ["unit?: string", "the detail unit label prop"],
    ["useState(false)", "the internal detail expand state"],
    ['"ptp-ring"', "the wrapper renders"],
    ['"ptp-ring__dial"', "the square dial renders"],
    ['"ptp-ring__detail"', "the strip renders"],
    ["{clamped}% · {numerator} / {total} {unit", "the detail readout format"],
  ]) {
    if (!vizSrc30.includes(needle)) {
      failures.push(`(ring2) react/viz.tsx must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  if (!appSrc.includes('total={GUEST_CAPACITY}')) {
    failures.push("(ring2) App.tsx must wire the live ring's total (the RSVP denominator)");
  }
  if (!appSrc.includes('unit="Guests"')) {
    failures.push('(ring2) App.tsx must wire the live ring\'s unit="Guests"');
  }
}

// ---- (mi1) THE MASTER INDEX (2.6.0) -----------------------------------------------------------
for (const [needle, label] of [
  ['label="Catalog categories"', "the filter tablist name"],
  ['type CatalogCategory = "all" | "gateways" | "food" | "commerce" | "docs"', "the five category ids"],
  ['{ id: "all", label: "All" }', "filter tab 1"],
  ['{ id: "gateways", label: "App Gateways" }', "filter tab 2"],
  ['{ id: "food", label: "Food & Carousels" }', "filter tab 3"],
  ['{ id: "commerce", label: "Commerce & Profiles" }', "filter tab 4"],
  ['{ id: "docs", label: "Docs & Chronicles" }', "filter tab 5"],
  ['data-testid="index-gateways"', "the gateway row hook (the filter probe hides it)"],
  ['data-testid="index-catalog"', "the commerce row hook"],
  ['data-testid="index-food"', "the food slab hook"],
  ['data-testid="index-chronicle"', "the chronicle slab hook"],
  ['title: "Event & Party Planner"', "gateway door 1"],
  ['title: "Study & Flashcard Engine"', "gateway door 2"],
  ['title: "Party Game Arena"', "gateway door 3"],
  ['accent: "--color-cake-primary"', "STRUCTURAL accent decision: the planner door wears Flamingo (the AccentToken union)"],
  ['title="Birria & Street Taco Catering"', "the commerce ContentCard"],
  ['meta={["25 MIN", "SPICY", "$14"]}', "the mono meta pills"],
  ['tag="JSX"', "the ReferenceCard chip"],
  ['title="The Signature Surface"', "the ReferenceCard title"],
  ['name="Arena Pass"', "the featured TierCard"],
  ['cta="Claim the pass"', "the TierCard CTA"],
  ['title="Field Notes & Carousel"', "the food slab"],
  ['label="Developer & lifestyle cards"', "the lifestyle carousel"],
  ["The Design of Everyday Things", "carousel mini-card 1 (Books)"],
  ["Smoked Old Fashioned", "carousel mini-card 2 (Cocktails)"],
  ["Empty States That Sell", "carousel mini-card 3 (UI Patterns)"],
  ["Keychron Q1 HE", "carousel mini-card 4 (Hardware)"],
  ["Ribbon of Shame", "carousel mini-card 5 (Party Games)"],
  ['data-testid="index-profiles"', "the 4-up profile row hook"],
  ['name="Ana Souza"\n              role="Head of Catering"', "the ProfileCard person (2.9.0: rides a .sig-cell container)"],
  ['{ label: "Rating", value: "4.9" }', "the third stat"],
  ['data-testid="index-chronicle"', "the chronicle slab hook (wrapper div — the SurfaceCard slot stays flat-DOM)"],
  ['title="The Chronicle"', "the chronicle slab"],
  ['elevation="flat"', "the chronicle is the FLAT-tier probe (the archive slab)"],
  ["<ChronicleTimeline releases={RELEASE_HISTORY} />", "the live chronicle"],
  ["function IndexView({ onNavigate }: { onNavigate: (href: string) => void })", "the view keeps its navigation contract"],
]) {
  if (!appSrc.includes(needle)) {
    failures.push(`App.tsx must contain ${JSON.stringify(needle)} — (mi1) ${label}`);
  }
}
// THE MEMORIAL PORT — exactly 23 releases, v0.1.0 first, v2.6.0 last.
const releaseHistoryMatch = appSrc.match(/const RELEASE_HISTORY: ChronicleRelease\[\] = \[([\s\S]*?)\n\];/);
if (releaseHistoryMatch === null) {
  failures.push("(mi1) App.tsx must declare `const RELEASE_HISTORY: ChronicleRelease[]` — the memorial port");
} else {
  const tags = [...releaseHistoryMatch[1].matchAll(/tag: "(v[^"]+)"/g)].map((m) => m[1]);
  if (tags.length !== 23) {
    failures.push(
      `(mi1) RELEASE_HISTORY must carry EXACTLY 23 entries (v0.1.0 → v2.6.0; the patch releases fold into their minors), found ${tags.length}`,
    );
  }
  if (tags[0] !== "v0.1.0" || tags[tags.length - 1] !== "v2.6.0") {
    failures.push(
      `(mi1) RELEASE_HISTORY must run v0.1.0 → v2.6.0, found ${tags[0]} → ${tags[tags.length - 1]}`,
    );
  }
  const memorialNeedles = [
    ["Universal Developer Card Suite", "the v2.6.0 title"],
    ["5 archetypes · 3 tiers · 11 accents", "the v2.6.0 stat"],
    ["Ergonomic Form Rules", "the ported v2.5.0 release name"],
    ["The Visual Cortex", "a ported release name"],
  ];
  for (const [needle, label] of memorialNeedles) {
    if (!releaseHistoryMatch[1].includes(needle)) {
      failures.push(`RELEASE_HISTORY must contain ${JSON.stringify(needle)} — (mi1) ${label}`);
    }
  }
}
// Filtering is CONDITIONAL RENDERING per row (documented decision): the
// visibility booleans derive straight off the category state.
for (const [needle, label] of [
  ['const showGateways = category === "all" || category === "gateways";', "gateway row switch"],
  ['const showChronicle = category === "all" || category === "docs";', "chronicle row switch"],
  ["{showGateways && (", "conditional render: gateways"],
  ["{showCatalog && (", "conditional render: commerce"],
  ["{showFood && (", "conditional render: food"],
  ["{showProfiles && (", "conditional render: profiles"],
  ["{showChronicle && (", "conditional render: chronicle"],
]) {
  if (!appSrc.includes(needle)) {
    failures.push(`App.tsx must contain ${JSON.stringify(needle)} — (mi1) ${label}`);
  }
}

// ---- (kg1) THE KNOWLEDGE GRAPH (2.7.0) ---------------------------------------------
// css/graph.css: the inset canvas + 15% hairline + the 0.25 dim answer +
// footer/toolbar anatomy + focus ring + reduced-motion + ZERO hex/shadow
// (the e1 css/-wide scan already covers the shadow ban — restated here).
// react/graph.tsx: the exported PURE helpers (layoutGraph + cubicBezierEdge),
// the role="application" svg, per-parent bezier edges with data-parent/
// data-child, the class-driven --focused dim, the footer strip, the
// Add & Link toolbar. Bundle membership AFTER ./cards.css; umbrella
// re-exports for the component, its types AND the pure helpers.
const graphCssPath = resolve(root, "css/graph.css");
if (!existsSync(graphCssPath)) {
  failures.push("(kg1) css/graph.css is missing — the KnowledgeGraph ships its own stylesheet");
} else {
  const graphCss = readFileSync(graphCssPath, "utf8");
  const GRAPH_REQUIREMENTS = [
    ["background: var(--bg-inset)", "the inset chart interior (data-ink doctrine)"],
    ["border: 1px solid color-mix(in srgb, var(--text-muted) 15%, transparent)", "the 15% hairline frame"],
    ["border-radius: var(--radius-ui)", "the minimalist corners"],
    ["width: 100%", "the canvas fills its card"],
    [".ptp-graph--focused .ptp-graph__edge[data-dim=\"true\"],", "the class-driven dim selector (edge half)"],
    [".ptp-graph--focused .ptp-graph__node[data-dim=\"true\"]", "the class-driven dim selector (node half)"],
    ["opacity: 0.25", "THE DIM — non-adjacent ink fades to a quarter"],
    [".ptp-graph__footer", "the inspect strip"],
    ["padding: var(--space-tight) var(--space-standard)", "the footer's 8px-grid padding"],
    [".ptp-graph__toolbar", "the add-and-link toolbar row"],
    ["cursor: pointer", "the node pointer affordance"],
    [".ptp-graph__node:focus-visible", "the keyboard ring on the node group"],
    ["outline: 2px solid var(--color-cake-primary)", "the doctrine focus ring"],
    ["prefers-reduced-motion", "the reduced-motion guard on transitions"],
  ];
  for (const [needle, label] of GRAPH_REQUIREMENTS) {
    if (!graphCss.includes(needle)) {
      failures.push(`(kg1) css/graph.css must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  const graphHexes = graphCss.match(/#[0-9a-f]{3,8}\b/gi);
  if (graphHexes !== null) {
    failures.push(
      `(kg1) css/graph.css contains hex literal(s) ${[...new Set(graphHexes)].join(", ")} — the graph is token-driven, zero hex`,
    );
  }
  const graphShadows = graphCss.match(/box-shadow\s*:\s*[^;]+;/g);
  if (graphShadows !== null) {
    failures.push(
      `(kg1) css/graph.css declares a box-shadow (${graphShadows.join(" ")}) — chart interiors stay FLAT (the e1 treaty; shadows live only in css/surface.css sanctioned blocks)`,
    );
  }
  const graphImportIndex = bundleCss.indexOf('@import "./graph.css" layer(cascade);');
  if (graphImportIndex === -1) {
    failures.push(
      'css/signature-style.css must import "./graph.css" layer(cascade) — cascade membership is the layered-import doctrine',
    );
  } else {
    const cardsImportIndexForGraph = bundleCss.indexOf('@import "./cards.css" layer(cascade);');
    if (cardsImportIndexForGraph !== -1 && graphImportIndex < cardsImportIndexForGraph) {
      failures.push("css/signature-style.css must import ./graph.css AFTER ./cards.css (cards styles load first)");
    }
  }
}
const graphSrcPath = resolve(root, "react/graph.tsx");
if (!existsSync(graphSrcPath)) {
  failures.push("(kg1) react/graph.tsx is missing — the KnowledgeGraph is a new module");
} else {
  const graphSrc = readFileSync(graphSrcPath, "utf8");
  const GRAPH_TSX_REQUIREMENTS = [
    ["export function layoutGraph(", "the exported PURE layout helper (gate-testable determinism)"],
    ["export function cubicBezierEdge(", "the exported PURE edge helper (control points 60% along the radial)"],
    ["export interface GraphNode", "the node contract"],
    ["categoryToken: PartyColorToken", "party-typed node category (Rule of Engagement)"],
    ["parentId?: string", "parentId undefined = root"],
    ['role="application"', "the svg's application role"],
    ["ptp-graph ptp-graph--focused", "the focused class driven by selection state"],
    ['"ptp-graph"', "the bare canvas class"],
    ['className="ptp-graph__edge"', "one path per node-with-parent"],
    ["data-parent={node.parentId}", "the edge's parent hook"],
    ["data-child={node.id}", "the edge's child hook"],
    ['className="ptp-graph__node"', "the interactive node group"],
    ['role="button"', "nodes are buttons (aria contract)"],
    ["tabIndex={0}", "keyboard focus lands on the node"],
    ['data-dim={dim || undefined}', "the attribute IS the dim state"],
    ['stroke={isSelected ? "var(--color-cake-primary)" : strokeFor(node)}', "selection flips the stroke to structural Flamingo"],
    ["strokeWidth={isSelected ? 3 : 2}", "the selected ring thickens to 3"],
    ['className="ptp-graph__footer"', "the inspect strip render"],
    ["Select a node to inspect its note.", "the resting footer copy"],
    ["Add &amp; Link", "the toolbar button label"],
    ['variant="secondary"', "the toolbar rides the package Button"],
    ['categoryToken: "--party-lavender"', "Add & Link seeds the lavender content token"],
    ['onAddNode({', "the toolbar fires the controlled callback"],
    ["parentId: selectedId ?? rootId", "new nodes parent to the selection, else the root (no nodes → root)"],
  ];
  for (const [needle, label] of GRAPH_TSX_REQUIREMENTS) {
    if (!graphSrc.includes(needle)) {
      failures.push(`(kg1) react/graph.tsx must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  const graphSrcHexes = graphSrc.match(/#[0-9a-f]{6}/gi);
  if (graphSrcHexes !== null) {
    failures.push(
      `(kg1) react/graph.tsx contains hardcoded hex literal(s) ${[...new Set(graphSrcHexes)].join(", ")} — the graph consumes var(--token) only (r4 doctrine)`,
    );
  }
}
for (const name of ["KnowledgeGraph", "KnowledgeGraphProps", "GraphNode", "GraphPosition", "layoutGraph", "cubicBezierEdge"]) {
  if (!new RegExp(`\\b${name}\\b`).test(umbrellaDts)) {
    failures.push(`react/index.d.ts must re-export ${name} — (kg1)`);
  }
}
for (const name of ["KnowledgeGraph", "layoutGraph", "cubicBezierEdge"]) {
  if (!new RegExp(`\\b${name}\\b`).test(umbrellaJs)) {
    failures.push(`react/index.js must re-export ${name} — (kg1)`);
  }
}
const graphJsPath = resolve(root, "react/graph.js");
const graphDtsPath = resolve(root, "react/graph.d.ts");
if (!existsSync(graphJsPath)) {
  failures.push("(kg1) react/graph.js is missing — build it: npx tsc -p tsconfig.json");
}
if (!existsSync(graphDtsPath)) {
  failures.push("(kg1) react/graph.d.ts is missing — build it: npx tsc -p tsconfig.json");
}

// ---- (vz1) ANALYTICAL CHARTS — BarChart + AreaChart (2.7.0) -------------------------
// react/viz.tsx: the pure smoothPath export, dasharray reference lines, inset
// track class, hover readout classes, the useId-gradient, point circles.
// css/viz.css: .ptp-bars/.ptp-area anatomy + hover opacity rules + reduced-
// motion guards (the e1 css/-wide scan already covers shadow/hex bans).
const vizSrc27 = readFileSync(resolve(root, "react/viz.tsx"), "utf8");
const VIZ_TSX_27_REQUIREMENTS = [
  ["export interface BarChartProps", "the BarChart contract"],
  ["export interface BarDatum", "the datum contract (label/value/max/colorToken)"],
  ['orientation = "vertical"', "the vertical default"],
  ["export interface AreaChartProps", "the AreaChart contract"],
  ["export interface AreaPoint", "the point contract (label/value)"],
  ["export function smoothPath(", "the exported PURE Catmull-Rom helper (gate-testable)"],
  ['strokeDasharray="4 4"', "the dashed reference lines"],
  ['className="ptp-bars__track"', "the inset capacity track element"],
  ['className="ptp-bars__bar"', "the party value bar element"],
  ['className="ptp-bars__value"', "the hover value readout element"],
  ['className="ptp-bars__refline"', "the 25/50/75% reference line element"],
  ['className="ptp-bars__label"', "the mono axis label element"],
  ["useId()", "the gradient id source (no collisions)"],
  ["<linearGradient", "the svg gradient"],
  ["color-mix(in srgb, var(${colorToken}) 30%, transparent)", "the gradient's 30% top stop"],
  ['className="ptp-area__fill"', "the gradient area path"],
  ['className="ptp-area__line"', "the smoothed line path"],
  ['className="ptp-area__point"', "the data-point circles"],
  ["r={4}", "the resting point radius"],
  ['className="ptp-area__readout"', "the hover tabular readout"],
  ["colorToken = \"--party-sky\"", "the sky default token (AreaChart)"],
  ["height = 200", "the default svg height (AreaChart)"],
  ["points.length < 2", "the ≥2-point guard (no trend, no ink)"],
  ["data.length === 0", "the empty-data guard (no data, no ink)"],
];
for (const [needle, label] of VIZ_TSX_27_REQUIREMENTS) {
  if (!vizSrc27.includes(needle)) {
    failures.push(`(vz1) react/viz.tsx must contain ${JSON.stringify(needle)} — ${label}`);
  }
}
const vizCss27 = readFileSync(resolve(root, "css/viz.css"), "utf8");
const VIZ_CSS_27_REQUIREMENTS = [
  [".ptp-bars", "the bar chart svg"],
  [".ptp-bars__track", "the capacity track rule"],
  ["fill: var(--bg-inset)", "the track's inset fill (the 2.2.0 track doctrine)"],
  [".ptp-bars__value", "the hover readout rule"],
  [".ptp-bars__group:hover .ptp-bars__value", "the hover reveal (class-driven)"],
  ["font-variant-numeric: tabular-nums", "the readout's tabular digits"],
  [".ptp-bars__label", "the axis label rule"],
  ["font-size: 0.6875rem", "the mono muted axis voice"],
  [".ptp-bars__refline", "the dashed reference line rule"],
  ["color-mix(in srgb, var(--text-muted) 25%, transparent)", "the 25% muted refline stroke"],
  [".ptp-area", "the area chart svg"],
  [".ptp-area__fill", "the gradient area rule"],
  ["opacity: 0.5", "the area's half opacity"],
  [".ptp-area__point", "the point circle rule"],
  [".ptp-area__spot:hover .ptp-area__point", "the hover enlarge (r: 6px)"],
  [".ptp-area__readout", "the area readout rule"],
  [".ptp-area__xlabel", "the axis label rule"],
  ["prefers-reduced-motion", "the reduced-motion guard on the hover transitions"],
];
for (const [needle, label] of VIZ_CSS_27_REQUIREMENTS) {
  if (!vizCss27.includes(needle)) {
    failures.push(`(vz1) css/viz.css must contain ${JSON.stringify(needle)} — ${label}`);
  }
}
for (const name of ["BarChart", "BarChartProps", "BarDatum", "AreaChart", "AreaChartProps", "AreaPoint", "smoothPath"]) {
  if (!new RegExp(`\\b${name}\\b`).test(umbrellaDts)) {
    failures.push(`react/index.d.ts must re-export ${name} — (vz1)`);
  }
}
for (const name of ["BarChart", "AreaChart", "smoothPath"]) {
  if (!new RegExp(`\\b${name}\\b`).test(umbrellaJs)) {
    failures.push(`react/index.js must re-export ${name} — (vz1)`);
  }
}

// ---- (tm1) THE TIMELINE MANAGER (2.7.0) --------------------------------------------
// react/timeline-manager.tsx: the CONTROLLED contract (items + the three
// mutation callbacks + optional inspect), the composer (package Input +
// two package Selects + the primary sm Button), the aria-pressed filter
// pills, the tabular counter, the aria-pressed settle toggles, the
// Funnel EmptyState edge, the Trash delete buttons. css/timeline.css: the
// APPEND-only .ptp-tmanager block (EventTimeline rules untouched — the
// e2 deletion guard proves it) with the tabular counter, the Flamingo
// pill underline, the party-green settle fill, reduced-motion.
// LIVE-MAP PROBE NOTE (the "Music" lesson): the owner-spec'd "Trash2" and
// "Filter" are NOT keys of the installed lucide-react 1.72.0 icons map —
// the live-map-valid equivalents "Trash" and "Funnel" render instead.
const tmSrcPath = resolve(root, "react/timeline-manager.tsx");
if (!existsSync(tmSrcPath)) {
  failures.push("(tm1) react/timeline-manager.tsx is missing — the TimelineManager is a new module");
} else {
  const tmSrc = readFileSync(tmSrcPath, "utf8");
  const TM_REQUIREMENTS = [
    ["export interface TimelineItem extends PtpEvent", "the EXTENSION contract (EventTimeline untouched)"],
    ["settled?: boolean", "the settle state"],
    ["export interface TimelineManagerProps", "the props contract"],
    ["items: TimelineItem[]", "CONTROLLED — the items come in"],
    ["onAdd: (item: Omit<TimelineItem, \"id\">) => void", "the controlled add callback"],
    ["onToggleSettled: (id: string) => void", "the controlled toggle callback"],
    ["onDelete: (id: string) => void", "the controlled delete callback"],
    ["onInspect?: (item: TimelineItem) => void", "the optional inspect callback"],
    ['className="ptp-tmanager"', "the section root"],
    ['className="ptp-tmanager__composer"', "the composer row"],
    ['placeholder="Milestone title"', "the composer title field"],
    ['label="Month"', "the month select's accessible name"],
    ['label="Category"', "the category select's accessible name"],
    ['variant="primary" size="sm"', "the composer's primary sm Button"],
    ["Settle Item", "the composer submit label"],
    ["trimmed === \"\"", "the empty-title guard (warn + ignore)"],
    ['className="ptp-tmanager__pill"', "the filter pill"],
    ["aria-pressed={filter === entry.id}", "THE pill state — the attribute IS the state"],
    ['className="ptp-tmanager__count"', "the live counter"],
    ["{settledCount} / {items.length} Settled", "the counter's N / M Settled readout"],
    ['className="ptp-tmanager__settle"', "the settle toggle"],
    ['aria-pressed={item.settled === true}', "the settle state attribute"],
    ['aria-label="Toggle settled"', "the toggle's accessible name"],
    ['name="Check"', "the toggle's icon (live-map-probed key)"],
    ['className="ptp-tmanager__body"', "the row body button"],
    ["onInspect?.(item)", "the inspect fires with the item"],
    ["PartyBadge", "the category chip (the official primitive)"],
    ['className="ptp-tmanager__done"', "the settled chip"],
    ["Settled", "the settled chip text"],
    ['className="ptp-tmanager__delete"', "the delete button"],
    ["`Delete ${item.title}`", "the delete's per-item accessible name"],
    ['name="Trash"', "the delete icon — LIVE-MAP PROBE: \"Trash2\" is NOT a lucide-react 1.72.0 key; \"Trash\" is (the AudioLines/Music precedent)"],
    ['icon="Funnel"', "the EmptyState icon — LIVE-MAP PROBE: \"Filter\" is NOT a lucide-react 1.72.0 key; \"Funnel\" is (the AudioLines/Music precedent)"],
    ['title="Nothing here"', "the EmptyState title"],
    ['message="No milestones match this filter."', "the EmptyState edge fires on the CURRENT filter"],
  ];
  for (const [needle, label] of TM_REQUIREMENTS) {
    if (!tmSrc.includes(needle)) {
      failures.push(`(tm1) react/timeline-manager.tsx must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  const tmHexes = tmSrc.match(/#[0-9a-f]{6}/gi);
  if (tmHexes !== null) {
    failures.push(
      `(tm1) react/timeline-manager.tsx contains hardcoded hex literal(s) ${[...new Set(tmHexes)].join(", ")} — the manager consumes var(--token) only (r4 doctrine)`,
    );
  }
}
const timelineCss27 = readFileSync(resolve(root, "css/timeline.css"), "utf8");
const TM_CSS_REQUIREMENTS = [
  [".ptp-tmanager", "the manager section root"],
  [".ptp-tmanager__composer", "the composer row"],
  ["gap: var(--space-tight)", "the 8px-grid gap"],
  [".ptp-tmanager__pill[aria-pressed=\"true\"]", "THE pill state selector"],
  ["border-bottom-color: var(--color-cake-primary)", "the Flamingo active underline (the Tabs/GlobalNav contract)"],
  [".ptp-tmanager__count", "the live counter rule"],
  ["font-variant-numeric: tabular-nums", "the counter's tabular digits"],
  [".ptp-tmanager__settle[aria-pressed=\"true\"]", "the settled toggle selector"],
  ["color: var(--party-green)", "the settled toggle's party-green fill"],
  [".ptp-tmanager__row--settled .ptp-tmanager__body", "the settled body"],
  ["opacity: 0.6", "the settled fade"],
  ["text-decoration: line-through", "the settled strike-through"],
  [".ptp-tmanager__done", "the settled chip"],
  [".ptp-tmanager__delete:hover", "the delete hover"],
  ["color: var(--party-peach)", "the delete attention ink"],
  [".ptp-tmanager__body:focus-visible", "the body's keyboard ring"],
  ["prefers-reduced-motion", "the reduced-motion guard on the manager transitions"],
];
for (const [needle, label] of TM_CSS_REQUIREMENTS) {
  if (!timelineCss27.includes(needle)) {
    failures.push(`(tm1) css/timeline.css must contain ${needle} — ${label}`);
  }
}
for (const name of ["TimelineManager", "TimelineManagerProps", "TimelineItem"]) {
  if (!new RegExp(`\\b${name}\\b`).test(umbrellaDts)) {
    failures.push(`react/index.d.ts must re-export ${name} — (tm1)`);
  }
}
for (const name of ["TimelineManager"]) {
  if (!new RegExp(`\\b${name}\\b`).test(umbrellaJs)) {
    failures.push(`react/index.js must re-export ${name} — (tm1)`);
  }
}
const tmJsPath = resolve(root, "react/timeline-manager.js");
const tmDtsPath = resolve(root, "react/timeline-manager.d.ts");
if (!existsSync(tmJsPath)) {
  failures.push("(tm1) react/timeline-manager.js is missing — build it: npx tsc -p tsconfig.json");
}
if (!existsSync(tmDtsPath)) {
  failures.push("(tm1) react/timeline-manager.d.ts is missing — build it: npx tsc -p tsconfig.json");
}

// ---- (ps1) THE PERSISTENCE ADDENDUM (2.7.0) ----------------------------------------
// playground/persistence.ts: the zero-dependency usePersistentState hook with
// the try/catch localStorage posture + reset. App.tsx: the versioned keys, the
// two seeded arrays, the snapshot toolbar (Export/Import/Reset) with the
// Blob → objectURL → revoke dance, the FileReader validation, and the
// signature-snapshot.json filename.
const persistencePath = resolve(root, "playground", "persistence.ts");
if (!existsSync(persistencePath)) {
  failures.push("(ps1) playground/persistence.ts is missing — the persistence hook");
} else {
  const persistenceSrc = readFileSync(persistencePath, "utf8");
  const PS_REQUIREMENTS = [
    ["export function usePersistentState<T>", "the generic hook"],
    ["key: string", "the storage key parameter"],
    ["fallback: T", "the fallback parameter"],
    ['[T, (value: T | ((previous: T) => T)) => void, () => void]', "the [value, setValue, reset] triple"],
    ["localStorage.getItem", "the lazy read"],
    ["JSON.parse", "the stored-JSON parse"],
    ["localStorage.setItem", "the mirror write"],
    ["JSON.stringify", "the serialize"],
    ["localStorage.removeItem", "the reset's key removal"],
    ["try {", "the try/catch posture (corrupt JSON → fallback; quota → memory)"],
  ];
  for (const [needle, label] of PS_REQUIREMENTS) {
    if (!persistenceSrc.includes(needle)) {
      failures.push(`(ps1) playground/persistence.ts must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
}
const PS_APP_REQUIREMENTS = [
  ['usePersistentState<GraphNode[]>(\n    "sig.v27.graph",', "the graph array under its versioned key"],
  ['usePersistentState<TimelineItem[]>(\n    "sig.v27.timeline",', "the timeline array under its versioned key"],
  ["SEED_GRAPH", "the graph's seed fallback"],
  ["SEED_TIMELINE", "the timeline's seed fallback"],
  ['{ version: "sig.v27", graph, timeline }', "the snapshot payload"],
  ["signature-snapshot.json", "the download filename"],
  ["URL.createObjectURL", "the download dance, step 1"],
  ["URL.revokeObjectURL", "the download dance, step 3 — revoke immediately"],
  ["FileReader", "the import's reader"],
  ["Array.isArray(data.graph)", "the import's graph shape gate"],
  ["Array.isArray(data.timeline)", "the import's timeline shape gate"],
  ['toast("error", "Invalid snapshot structure")', "the invalid-snapshot refusal"],
  ['toast("error", "Local state reset")', "the reset toast (peach attention strip — ToastStatus is success|error, the documented mapping)"],
  ['leftIcon="Download"', "the Export button icon (live-map-probed)"],
  ['leftIcon="Upload"', "the Import button icon (live-map-probed)"],
  ['variant="danger"', "the Reset button's attention variant"],
  ["Export JSON", "the export label"],
  ["Import JSON", "the import label"],
  ["Reset\n          </Button>", "the reset label"],
  ['accept=".json"', "the hidden file input's filter"],
  ["type=\"file\"", "the hidden import input"],
];
for (const [needle, label] of PS_APP_REQUIREMENTS) {
  if (!appSrc.includes(needle)) {
    failures.push(`(ps1) App.tsx must contain ${JSON.stringify(needle)} — ${label}`);
  }
}

// ---- (gp1) THE GRAPHS & PLANNER MODULE (2.7.0) -------------------------------------
// The fourth module tab + the four-card assembly + the probe hooks + the
// playground-local 2-up chart row.
const GP_REQUIREMENTS = [
  ['type ModuleId = "core" | "data" | "forms" | "graph"', "the fourth module id"],
  ['{ id: "graph", label: "Graphs & Planner" }', "the tab entry"],
  ['moduleId === "graph"', "the tab's render branch"],
  ["function GraphPlannerModule", "the module component (defined AFTER IndexView — the b5 audit slice stays 7 cards)"],
  ["usePersistentState", "the persistence hook drives the module state"],
  ['title="The Knowledge Graph"', "card 1"],
  ["<KnowledgeGraph", "the graph primitive"],
  ["addOn", "the graph's Add & Link toolbar"],
  ['title="Spending by Category"', "card 2"],
  ["<BarChart", "the bar chart primitive"],
  ['{ label: "Venue", value: 800, max: 1000, colorToken: "--party-mauve-soft" }', "a per-bar capacity max"],
  ['title="RSVP Momentum"', "card 3"],
  ["<AreaChart", "the area chart primitive"],
  ['colorToken="--party-sky"', "the sky series token"],
  ['title="Milestone Manager"', "card 4"],
  ["<TimelineManager", "the manager primitive"],
  ["onInspect={modal.open}", "inspect composes the EventModal"],
  ['label="Milestone manager"', "the manager's accessible name"],
  ['data-testid="module-graph"', "the module probe hook"],
  ['data-testid="knowledge-graph"', "the graph probe hook"],
  ['data-testid="spending-bars"', "the bars probe hook"],
  ['data-testid="rsvp-area"', "the area probe hook"],
  ['data-testid="milestone-manager"', "the manager probe hook"],
  ['data-testid="snapshot-export"', "the export probe hook"],
  ['data-testid="snapshot-import"', "the import probe hook"],
  ['data-testid="snapshot-reset"', "the reset probe hook"],
];
for (const [needle, label] of GP_REQUIREMENTS) {
  if (!appSrc.includes(needle)) {
    failures.push(`(gp1) App.tsx must contain ${JSON.stringify(needle)} — ${label}`);
  }
}
const GP_STYLES_REQUIREMENTS = [
  [".hub__row--2", "the 2-up charts row"],
  ["grid-template-columns: repeat(2, 1fr)", "the balanced columns"],
  [".hub__snapshot", "the snapshot toolbar row"],
];
for (const [needle, label] of GP_STYLES_REQUIREMENTS) {
  if (!stylesCss.includes(needle)) {
    failures.push(`(gp1) styles.css must contain ${needle} — ${label}`);
  }
}
const row2Collapse = /@media \(max-width: 768px\)\s*\{[^@]*\.hub__row--2\s*\{[^}]*grid-template-columns: 1fr;/s;
if (!row2Collapse.test(stylesCss)) {
  failures.push(
    "(gp1) .hub__row--2 must collapse to one column at max-width: 768px (Pillar 2)",
  );
}

// ---- (nav5) THE FIVE REAL VIEWS (2.8.0) --------------------------------------------
// The nav map is 5 REAL views; the placeholder machinery is GONE (negative
// needles: PlaceholderView/WorkshopView/PLACEHOLDERS must not exist).
const NAV5_REQUIREMENTS = [
  ['{ href: VIEW_HREFS.dashboard, label: "Dashboard" }', "view 1: the live bento"],
  ['{ href: VIEW_HREFS.studio, label: "Pattern Studio" }', "view 2: the primary catalog"],
  ['{ href: VIEW_HREFS.index, label: "Index" }', "view 3: the master index"],
  ['{ href: VIEW_HREFS.chronicle, label: "Chronicle" }', "view 4: the Night of Versions"],
  ['{ href: VIEW_HREFS.codex, label: "AI Codex" }', "view 5: the codex"],
  ['view === "studio" ? (', "the studio branch renders"],
  ['view === "chronicle" ? (', "the chronicle branch renders"],
  ["function ChronicleView", "the chronicle view component"],
  ["title: \"THE PATTERN STUDIO\"", "the studio hero"],
  ["six sets · fifty patterns · one-click copy", "the studio hero subtitle"],
];
for (const [needle, label] of NAV5_REQUIREMENTS) {
  if (!appSrc.includes(needle)) {
    failures.push(`(nav5) App.tsx must contain ${JSON.stringify(needle)} — ${label}`);
  }
}
for (const dead of ["function PlaceholderView", "type WorkshopView", "const PLACEHOLDERS", '"#/events"', '"#/guests"', '"#/budget"']) {
  if (appSrc.includes(dead)) {
    failures.push(`(nav5) App.tsx must NOT contain ${JSON.stringify(dead)} — the placeholder trio died in 2.8.0`);
  }
}

// ---- (ps-studio) THE PATTERN STUDIO (2.8.0) ----------------------------------------
// PatternFrame: data-sig-* article + the segmented view tabs + the copy card.
// PatternStudio: the 6-set taxonomy (sidebar counts, SET_FRAMES covering EVERY
// SNIPPETS key) + the live previews. Codex: 22 honest swatches + z-ladder.
const framePath = resolve(root, "playground/components/PatternFrame.tsx");
if (!existsSync(framePath)) {
  failures.push("(ps-studio) playground/components/PatternFrame.tsx is missing");
} else {
  const frameSrc = readFileSync(framePath, "utf8");
  const FRAME_REQUIREMENTS = [
    ["data-sig-set={setId}", "the set attribute — the AI-readable page"],
    ["data-sig-component={componentName}", "the component attribute"],
    ['className="pattern-frame"', "the article root"],
    ['"preview" | "jsx" | "html"', "the three view tabs"],
    ['data-testid={`pf-tab-${entry.id}`}', "the tab probe hooks"],
    ["aria-pressed={tab === entry.id}", "THE tab state — the attribute IS the state"],
    ['"Copy Card"', "the copy button label"],
    ['copied ? "Check" : "Copy"', "the Copy → Check icon swap"],
    ["COPIED_RESET_MS = 2000", "the 2s copied confirmation"],
    ["window.clearTimeout", "the timer cleanup"],
    ["navigator.clipboard", "the clipboard API"],
    [".writeText(text)", "the clipboard write"],
    ["toast(\"success\", `Copied ${componentName} snippet`)", "the copy toast"],
    ["useToast()", "the app-level ToastProvider is consumed via the hook"],
    ["snippet.html ?? htmlFallback", "the HTML variant resolution"],
    ["HTML variant not documented — use the JSX form.", "the muted HTML fallback note"],
    ["snippet.jsx", "the JSX tab renders the registry entry"],
  ];
  for (const [needle, label] of FRAME_REQUIREMENTS) {
    if (!frameSrc.includes(needle)) {
      failures.push(`(ps-studio) PatternFrame.tsx must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
}

const studioPath = resolve(root, "playground/components/PatternStudio.tsx");
const codexPath = resolve(root, "playground/components/CodexView.tsx");
if (!existsSync(studioPath)) {
  failures.push("(ps-studio) playground/components/PatternStudio.tsx is missing");
}
if (!existsSync(codexPath)) {
  failures.push("(ps-studio) playground/components/CodexView.tsx is missing");
}
let snippetsSrc = "";
let snippetKeys = [];
if (existsSync(studioPath)) {
  const studioSrc = readFileSync(studioPath, "utf8");
  snippetsSrc = readFileSync(resolve(root, "playground/snippets.ts"), "utf8");

  // Every SNIPPETS key (regex-extracted: two-space-indented `Key: {`) must
  // appear in the studio's SET_FRAMES map AND have a PREVIEWS entry.
  snippetKeys = [...snippetsSrc.matchAll(/^  ([A-Za-z]\w*): \{$/gm)].map((m) => m[1]);
  if (snippetKeys.length < 40) {
    failures.push(`(ps-studio) snippets.ts registry looks truncated — only ${String(snippetKeys.length)} keys extracted`);
  }
  for (const key of snippetKeys) {
    if (!studioSrc.includes(`"${key}"`) && !studioSrc.includes(`${key}: <`)) {
      failures.push(`(ps-studio) studio must mount a frame for SNIPPETS key "${key}" (SET_FRAMES + PREVIEWS)`);
    }
  }

  const STUDIO_REQUIREMENTS = [
    ['from "../snippets.js"', "the registry import"],
    ["SET_NAMES", "the 6 set names"],
    ["SET_BLURBS", "the human explanations"],
    ["data-sig-set-section={id}", "the per-set section attribute"],
    ['data-testid="studio-sidebar"', "the sidebar probe hook"],
    ['data-testid={`studio-set-${id}`}', "the per-set filter probe hooks"],
    ['aria-label="Pattern sets"', "the sidebar's accessible name"],
    ["studio__set-count", "the tabular-nums counts"],
    ["setCount(id)", "counts derive from the registry — never hand-typed"],
    ["aria-pressed={activeSet === id}", "the sidebar filter state attribute"],
    ["<PatternFrame", "the studio renders PatternFrames"],
    ['data-testid="pattern-studio"', "the view probe hook"],
  ];
  for (const [needle, label] of STUDIO_REQUIREMENTS) {
    if (!studioSrc.includes(needle)) {
      failures.push(`(ps-studio) PatternStudio.tsx must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
}
if (existsSync(codexPath)) {
  const codexSrc = readFileSync(codexPath, "utf8");
  const CODEX_REQUIREMENTS = [
    ["COLOR_TOKENS", "the color census (22 entries)"],
    ['data-testid="codex-swatch"', "the swatch probe hook"],
    ["data-sig-token={token}", "the swatch's token attribute"],
    ["navigator.clipboard", "the clipboard API"],
    [".writeText(token)", "click-to-copy the var name"],
    ["toast(\"success\", `Copied ${token}`)", "the swatch toast"],
    ['data-testid="codex-swatches"', "the swatch grid probe hook"],
  ];
  for (const [needle, label] of CODEX_REQUIREMENTS) {
    if (!codexSrc.includes(needle)) {
      failures.push(`(ps-studio) CodexView.tsx must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  // The honest census: exactly 22 color tokens declared INSIDE the
  // COLOR_TOKENS array (the z-ladder's --z-* entries don't count).
  const censusSlice = codexSrc.slice(codexSrc.indexOf("const COLOR_TOKENS"), codexSrc.indexOf("];"));
  const declaredSwatches = censusSlice.match(/token: "--/g);
  if (declaredSwatches === null || declaredSwatches.length !== 22) {
    failures.push(
      `(ps-studio) CodexView COLOR_TOKENS must declare exactly 22 color tokens (11 core/keeper + 11 party — the honest count out of whitelist 34), found ${String(declaredSwatches?.length ?? 0)}`,
    );
  }
  if (!codexSrc.includes("the whitelist is 34")) {
    failures.push('(ps-studio) CodexView must state the honest census — "the whitelist is 34" stated');
  }
  if (!codexSrc.includes("<DataTable") || !codexSrc.includes("--z-toast")) {
    failures.push("(ps-studio) CodexView must render the 5-rung z-ladder as a DataTable (through --z-toast)");
  }
  if (!codexSrc.includes('style={{ width: `${String(step.px)}px` }}')) {
    failures.push("(ps-studio) CodexView must render the 8px scale bars (4/8/16/24/32/64)");
  }
}
// The studio/codex css anatomy: sticky sidebar + 768px collapse + FLAT (e1).
const STUDIO_CSS_REQUIREMENTS = [
  [".studio {", "the two-column doc layout"],
  ["grid-template-columns: 240px 1fr", "the 240px sidebar column"],
  [".studio__sidebar {\n  position: sticky;", "the sticky sidebar"],
  [".studio__set-count {\n  font-variant-numeric: tabular-nums;", "the tabular counts"],
  [".studio__set-link[aria-pressed=\"true\"]", "the filter state selector"],
  [".codex__swatch", "the swatch cards"],
  [".codex__grid-bar", "the grid scale bars"],
];
for (const [needle, label] of STUDIO_CSS_REQUIREMENTS) {
  if (!stylesCss.includes(needle)) {
    failures.push(`(ps-studio) styles.css must contain ${JSON.stringify(needle)} — ${label}`);
  }
}
const studioCollapse = /@media \(max-width: 768px\)\s*\{[^@]*\.studio\s*\{[^}]*grid-template-columns: 1fr;/s;
if (!studioCollapse.test(stylesCss)) {
  failures.push("(ps-studio) .studio must stack to one column at max-width: 768px (Pillar 2)");
}
// e1 treaty: the new 2.8.0 anatomy is FLAT — no box-shadow in the new blocks.
const newBlocks = stylesCss.slice(stylesCss.indexOf("2.8.0 THE PATTERN FRAME"));
for (const match of newBlocks.matchAll(/([^{}]+)\{[^}]*box-shadow:[^}]*\}/g)) {
  const selector = match[1].trim().split("\n").pop()?.trim() ?? "?";
  if (!selector.includes("ptp-btn--primary")) {
    failures.push(`(ps-studio) e1 treaty: the 2.8.0 css declares box-shadow on ${selector} — the new anatomy stays FLAT`);
  }
}

// ---- (ps-copy) THE COPY STUDIO PATH (2.8.0) ----------------------------------------
// The clipboard → copied-state → toast chain, frame-level and codex-level.
if (existsSync(framePath)) {
  const copySrc = readFileSync(framePath, "utf8");
  const PS_COPY_REQUIREMENTS = [
    ["navigator.clipboard", "the clipboard API"],
    [".writeText(text)", "the clipboard write"],
    ["COPIED_RESET_MS = 2000", "the 2s Check confirmation"],
    ["copied ? \"Check\" : \"Copy\"", "the icon swap"],
    ["toast(\"success\", `Copied ${componentName} snippet`)", "the frame toast contract"],
    ["toast(\"error\", \"Clipboard unavailable", "the failure toast"],
    ["window.clearTimeout(timerRef.current)", "the timer cleanup (unmount + re-copy)"],
  ];
  for (const [needle, label] of PS_COPY_REQUIREMENTS) {
    if (!copySrc.includes(needle)) {
      failures.push(`(ps-copy) PatternFrame.tsx must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
}

// ---- (ps-llms) THE MACHINE-READABLE MANIFESTS (2.8.0) ------------------------------
const llmsPath = resolve(root, "playground/public/llms.txt");
const llmsFullPath = resolve(root, "playground/public/llms-full.txt");
if (typeof pkg.scripts?.llms !== "string") {
  failures.push('(ps-llms) package.json scripts["llms"] is missing — `npm run llms` must regenerate both manifests');
}
if (!existsSync(resolve(root, "playground/generate-llms.mjs"))) {
  failures.push("(ps-llms) playground/generate-llms.mjs is missing — the generator IS the drift-proofing");
}
if (!existsSync(llmsPath)) {
  failures.push("(ps-llms) playground/public/llms.txt is missing — run `npm run llms`");
} else {
  const llmsTxt = readFileSync(llmsPath, "utf8");
  if (!llmsTxt.startsWith("# @edwyn/signature-style — The Signature Style")) {
    failures.push("(ps-llms) llms.txt must open with the H1");
  }
  if (!llmsTxt.includes("> Catppuccin Mocha-based design system: Token Cascade, Override Protocol, Party Palette content colors, mechanical physics.")) {
    failures.push("(ps-llms) llms.txt must carry the blockquote tagline");
  }
  for (const section of ["## Tokens", "## Rules", "## Component Sets", "## Recipes"]) {
    if (!llmsTxt.includes(section)) {
      failures.push(`(ps-llms) llms.txt must carry the ${section} section`);
    }
  }
}
if (!existsSync(llmsFullPath)) {
  failures.push("(ps-llms) playground/public/llms-full.txt is missing — run `npm run llms`");
} else {
  const llmsFull = readFileSync(llmsFullPath, "utf8");
  for (const key of snippetKeys) {
    if (!llmsFull.includes(key)) {
      failures.push(`(ps-llms) llms-full.txt must contain every SNIPPETS key — missing "${key}"`);
    }
  }
  const whitelistNames = Object.keys(JSON.parse(readFileSync(resolve(root, "tokens.json"), "utf8")).themes.mocha.tokens)
    .concat(Object.keys(JSON.parse(readFileSync(resolve(root, "tokens.json"), "utf8")).shared.tokens))
    .concat(Object.keys(JSON.parse(readFileSync(resolve(root, "tokens.json"), "utf8")).partyPalette.tokens));
  for (const tokenName of whitelistNames) {
    if (!llmsFull.includes(tokenName)) {
      failures.push(`(ps-llms) llms-full.txt must contain all 34 whitelist token names — missing "${tokenName}"`);
    }
  }
  if (!llmsFull.includes("Rule of Engagement")) {
    failures.push("(ps-llms) llms-full.txt must carry the doctrines (Rule of Engagement)");
  }
}
// public/ must NOT ship: the files array excludes playground/ wholesale (b2 pins
// it); this gate documents the pack proof — 58 files since 2.9.0, zero public/
// entries.

// ---- (cq1) THE CONTAINER-QUERY REFLOWS (2.9.0, Phase 1) ----------------------
// The portability layer: playground/styles.css declares `.sig-cell`
// (container-type: inline-size on OUTER cells only) and the package css
// answers with @container reflows — cards.css (matchup stack < 380px;
// content/profile media-object ≥ 440px), viz.css (stat-card dock ≥ 360px),
// forms.css (radio-row collapse < 480px). The composition layer adds its
// own form-matrix collapse + the [data-motion="reduced"] preview override.
// Container queries, never media queries; zero new shadows anywhere (the
// (e1) scan above keeps enforcing that on the new blocks).
{
  const cardsCss29 = readFileSync(resolve(root, "css/cards.css"), "utf8");
  const vizCss29 = readFileSync(resolve(root, "css/viz.css"), "utf8");
  const formsCss29 = readFileSync(resolve(root, "css/forms.css"), "utf8");
  const stylesCss29 = stylesCss;
  const CQ_REQUIREMENTS = [
    [cardsCss29, "@container (max-width: 380px)", "css/cards.css: the matchup stacks below a 380px container"],
    [cardsCss29, ".ptp-matchup__vs::before", "css/cards.css: the VS pill grows hairline dividers when stacked"],
    [cardsCss29, "@container (min-width: 440px)", "css/cards.css: the content/profile media-object reflow at 440px"],
    [cardsCss29, ".sig-content-card__visual {\n      grid-column: 1;", "css/cards.css: the 16/9 visual docks in the 40% column"],
    [cardsCss29, ".sig-profile-card > .ptp-avatar {\n      grid-column: 1;", "css/cards.css: the avatar docks beside the name block"],
    [vizCss29, "@container (min-width: 360px)", "css/viz.css: the stat-card dock at 360px"],
    [vizCss29, ".ptp-stat-card > svg {\n    grid-column: 2;", "css/viz.css: the sparkline docks in column 2"],
    [formsCss29, "@container (max-width: 480px)", "css/forms.css: the radio-card row collapses below 480px"],
    [stylesCss29, ".sig-cell {\n  container-type: inline-size;\n}", "styles.css: the .sig-cell container wrapper (OUTER cells only)"],
    [stylesCss29, "@container (max-width: 480px) {\n  .hub__form-grid {\n    grid-template-columns: 1fr;\n  }\n}", "styles.css: the form-matrix row stacks in narrow containers"],
    [stylesCss29, '[data-motion="reduced"] * {', "styles.css: the reduced-motion PREVIEW override (the command palette's toggle)"],
    [appSrc, '"sig-span-4 sig-cell"', "App.tsx: the bento KPI cells are containers"],
    [appSrc, '"sig-span-5 sig-cell"', "App.tsx: the check-in/deck/games cells are containers"],
    [readFileSync(resolve(root, "playground/components/PatternFrame.tsx"), "utf8"), 'className="pattern-frame__preview sig-cell"', "PatternFrame.tsx: the preview stage is a container"],
    [appSrc, 'data-testid="cq-probe"', "App.tsx: the container-query proof fixture exists"],
  ];
  for (const [source, needle, label] of CQ_REQUIREMENTS) {
    if (!source.includes(needle)) {
      failures.push(`(cq1) must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  // Containment NEVER lands on the queried element (circular sizing):
  // the package css must not set container-type on .ptp-matchup,
  // .ptp-stat-card, .sig-content-card or .sig-profile-card themselves.
  for (const [source, queried] of [
    [cardsCss29, ".ptp-matchup"],
    [cardsCss29, ".sig-content-card"],
    [cardsCss29, ".sig-profile-card"],
    [vizCss29, ".ptp-stat-card"],
  ]) {
    if (new RegExp(`${queried.replace(/-/g, "\\-")}\\s*\\{[^}]*container-type:`, "s").test(source)) {
      failures.push(`(cq1) container-type must NOT land on ${queried} itself (circular sizing) — containment goes on the OUTER .sig-cell only`);
    }
  }
}

// ---- (cmd1) THE COMMAND PALETTE (2.9.0, Phase 2) -----------------------------
// react/command.tsx: the CONTROLLED launcher (open lives in the parent),
// the global Ctrl/Cmd+K listener (ignored while typing in fields), the
// combobox/listbox aria contract with aria-activedescendant, Enter runs +
// closes, Escape closes, the trigger-capture focus restore, type-to-filter
// over label + keywords, the createPortal to document.body.
// css/command.css: the modal scrim + blur(8px), the --z-modal rung, the
// FLAT panel (zero box-shadow — the e1 treaty), the reused kbd chip.
{
  const commandSrc = readFileSync(resolve(root, "react/command.tsx"), "utf8");
  const commandJsPath = resolve(root, "react/command.js");
  const commandDtsPath = resolve(root, "react/command.d.ts");
  if (!existsSync(commandJsPath)) failures.push("(cmd1) react/command.js is missing — build it: npx tsc -p tsconfig.json");
  if (!existsSync(commandDtsPath)) failures.push("(cmd1) react/command.d.ts is missing — build it: npx tsc -p tsconfig.json");
  const CMD_TSX = [
    ["export interface CommandEntry", "the command contract"],
    ["keywords?: string", "the type-to-filter keywords"],
    ["hint?: string", "the mono hint chip"],
    ["icon?: IconName", "the strict lucide key"],
    ["run: () => void", "the action"],
    ["export interface CommandPaletteProps", "the controlled props contract"],
    ["onOpen?: () => void", "the launcher callback — the palette never owns open state"],
    ['key.toLowerCase() === "k"', "the Ctrl/Cmd+K launcher"],
    ["isTypingTarget", "the typing-fields guard for the launcher"],
    ['role="combobox"', "the filter input's combobox role"],
    ['aria-activedescendant={activeId}', "the selection mirrors to the listbox"],
    ['role="listbox"', "the rows listbox"],
    ['role="option"', "each row is an option"],
    ['aria-selected={index === activeIndex}', "THE selection attribute (the aria-selected IS the state)"],
    ["ArrowDown", "the next-row key"],
    ["ArrowUp", "the previous-row key"],
    ["selected.run();\n          onClose();", "Enter runs the selection AND closes"],
    ["triggerRef.current.focus()", "the focus restore to the pre-open trigger"],
    ["toLowerCase().includes(needle)", "the case-insensitive substring filter"],
    ["createPortal(", "the portal architecture"],
    ["document.body", "the portal host"],
    ['aria-label="Command palette"', "the dialog's accessible name"],
    ["useState(0)", "the selection starts at the top"],
  ];
  for (const [needle, label] of CMD_TSX) {
    if (!commandSrc.includes(needle)) {
      failures.push(`(cmd1) react/command.tsx must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  const commandCss = readFileSync(resolve(root, "css/command.css"), "utf8");
  const CMD_CSS = [
    ["rgba(0, 0, 0, 0.6)", "the documented neutral scrim (the modal.css exception)"],
    ["backdrop-filter: blur(8px)", "the glass blur"],
    ["-webkit-backdrop-filter: blur(8px)", "the webkit-prefixed blur"],
    ["var(--z-modal, 50)", "the modal rung (Pillar 3)"],
    ['[aria-selected="true"]', "the selection selector"],
    ["border-left-color: var(--color-cake-primary)", "the Flamingo selection rail"],
    ["max-width: 768px", "the Pillar 2 collapse"],
    ["prefers-reduced-motion", "the reduced-motion guard"],
    ["outline: 2px solid var(--color-cake-primary)", "the doctrine focus ring"],
  ];
  for (const [needle, label] of CMD_CSS) {
    if (!commandCss.includes(needle)) {
      failures.push(`(cmd1) css/command.css must contain ${needle} — ${label}`);
    }
  }
  const commandShadows = commandCss.match(/box-shadow\s*:\s*[^;]+;/g);
  if (commandShadows !== null) {
    failures.push(
      `(cmd1) css/command.css declares a box-shadow (${commandShadows.join(" ")}) — glass is scrim + border, NEVER shadow (the e1 treaty)`,
    );
  }
  const commandHexes = commandCss.replaceAll("rgba(0, 0, 0, 0.6)", "").match(/#[0-9a-f]{3,8}\b/gi);
  if (commandHexes !== null) {
    failures.push(
      `(cmd1) css/command.css contains hex literal(s) ${[...new Set(commandHexes)].join(", ")} — only the documented rgba scrim may bypass the token doctrine`,
    );
  }
  const bundleCommandIndex = bundleCss.indexOf('@import "./command.css" layer(cascade);');
  if (bundleCommandIndex === -1) {
    failures.push(
      'css/signature-style.css must import "./command.css" layer(cascade) — cascade membership is the layered-import doctrine',
    );
  } else {
    const graphImportForCommand = bundleCss.indexOf('@import "./graph.css" layer(cascade);');
    if (graphImportForCommand !== -1 && bundleCommandIndex < graphImportForCommand) {
      failures.push("css/signature-style.css must import ./command.css AFTER ./graph.css (graph styles load first)");
    }
  }
  for (const name of ["CommandPalette", "CommandEntry", "CommandPaletteProps"]) {
    if (!new RegExp(`\\b${name}\\b`).test(umbrellaDts)) {
      failures.push(`react/index.d.ts must re-export ${name} — (cmd1)`);
    }
  }
  if (!new RegExp("\\bCommandPalette\\b").test(umbrellaJs)) {
    failures.push("react/index.js must re-export CommandPalette — (cmd1)");
  }
  // The playground wiring: the controlled palette, the trigger, the
  // full command list (5 views + 6 sets + 4 utilities).
  const APP_CMD = [
    ["<CommandPalette", "the palette renders"],
    ['open={paletteOpen}', "the controlled open"],
    ['onClose={() => setPaletteOpen(false)}', "the close wiring"],
    ['onOpen={() => setPaletteOpen(true)}', "the launcher wiring"],
    ['data-testid="palette-trigger"', "the header trigger probe hook"],
    ['className="hub__cmdbar-trigger"', "the trigger button anatomy"],
    ['label: "Go to Dashboard"', "command: dashboard view"],
    ['label: "Go to Pattern Studio"', "command: studio view"],
    ['label: "Go to Master Index"', "command: index view"],
    ['label: "Go to Chronicle"', "command: chronicle view"],
    ['label: "Go to AI Codex"', "command: codex view"],
    ["label: `Studio: Set ${id} · ${SET_NAMES[id]}`", "command: the six studio sets"],
    ['label: "Export Workspace JSON"', "command: the workspace export"],
    ['label: "Toggle Reduced Motion Preview"', "command: the motion preview"],
    ['label: "Open Keyboard Shortcuts"', "command: the shortcuts dialog"],
    ['label: "Copy Codex llms.txt URL"', "command: the codex manifest URL"],
    ['rootEl.dataset.motion === "reduced"', "the preview toggle reads the attribute"],
    ['rootEl.dataset.motion = "reduced"', "the preview toggle sets the attribute"],
    ["buildStoredWorkspaceSnapshot()", "the export command reads the persisted mirror"],
    ["downloadJson(", "the shared download dance"],
    ["ShortcutsDialog", "the shortcuts dialog exists"],
    ['aria-label="Keyboard shortcuts"', "the dialog's accessible name"],
    ["<Breadcrumbs", "the breadcrumbs render in the shell"],
  ];
  for (const [needle, label] of APP_CMD) {
    if (!appSrc.includes(needle)) {
      failures.push(`(cmd1) App.tsx must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
}

// ---- (sk1) THE SKELETONS (2.9.0, Phase 2) -------------------------------------
// react/skeleton.tsx: SkeletonLine (width?), SkeletonCard, SkeletonTableRow
// (columns?) — aria-hidden decorative pulse, 8px-grid heights. css/
// skeleton.css: the ONE shimmer sweep between the 60% bg-inset mix and
// var(--bg-surface), the mandatory reduced-motion static ground, FLAT.
{
  const skeletonSrc = readFileSync(resolve(root, "react/skeleton.tsx"), "utf8");
  const skeletonJsPath = resolve(root, "react/skeleton.js");
  const skeletonDtsPath = resolve(root, "react/skeleton.d.ts");
  if (!existsSync(skeletonJsPath)) failures.push("(sk1) react/skeleton.js is missing — build it: npx tsc -p tsconfig.json");
  if (!existsSync(skeletonDtsPath)) failures.push("(sk1) react/skeleton.d.ts is missing — build it: npx tsc -p tsconfig.json");
  const SK_TSX = [
    ["export function SkeletonLine", "the line skeleton"],
    ["width?: string | number", "the optional width prop"],
    ["export function SkeletonCard", "the card stub"],
    ["export function SkeletonTableRow", "the table-row skeleton"],
    ["columns = 3", "the column default"],
    ['aria-hidden="true"', "the decorative contract (the consumer announces loading)"],
    ['className="ptp-skeleton ptp-skeleton--line"', "the line anatomy"],
    ['className="ptp-skeleton ptp-skeleton--row"', "the row anatomy"],
    ['className="ptp-skeleton-tr"', "the native <tr> root"],
  ];
  for (const [needle, label] of SK_TSX) {
    if (!skeletonSrc.includes(needle)) {
      failures.push(`(sk1) react/skeleton.tsx must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  const skeletonCss = readFileSync(resolve(root, "css/skeleton.css"), "utf8");
  const SK_CSS = [
    ["color-mix(in srgb, var(--bg-inset) 60%, transparent)", "the shimmer's translucent end"],
    ["var(--bg-surface)", "the shimmer's surface end (and the static ground)"],
    ["@keyframes ptp-skeleton-sweep", "the ONE sweep"],
    ["background-position", "the sweep mechanism (no transforms)"],
    ["height: 16px", "the line height (two 8px steps)"],
    ["height: 8px", "the row height (the tight step)"],
    ["animation: none;\n    background: var(--bg-surface);", "the MANDATORY static ground (animation none + the surface fill)"],
    ["@media (prefers-reduced-motion: reduce)", "the reduced-motion guard block"],
  ];
  for (const [needle, label] of SK_CSS) {
    if (!skeletonCss.includes(needle)) {
      failures.push(`(sk1) css/skeleton.css must contain ${needle} — ${label}`);
    }
  }
  const skeletonShadows = skeletonCss.match(/box-shadow\s*:\s*[^;]+;/g);
  if (skeletonShadows !== null) {
    failures.push(
      `(sk1) css/skeleton.css declares a box-shadow (${skeletonShadows.join(" ")}) — the e1 treaty holds in every new file`,
    );
  }
  const skeletonHexes = skeletonCss.match(/#[0-9a-f]{3,8}\b/gi);
  if (skeletonHexes !== null) {
    failures.push(
      `(sk1) css/skeleton.css contains hex literal(s) ${[...new Set(skeletonHexes)].join(", ")} — token-driven only`,
    );
  }
  const bundleSkeletonIndex = bundleCss.indexOf('@import "./skeleton.css" layer(cascade);');
  if (bundleSkeletonIndex === -1) {
    failures.push(
      'css/signature-style.css must import "./skeleton.css" layer(cascade) — cascade membership is the layered-import doctrine',
    );
  } else {
    const commandImportForSkeleton = bundleCss.indexOf('@import "./command.css" layer(cascade);');
    if (commandImportForSkeleton !== -1 && bundleSkeletonIndex < commandImportForSkeleton) {
      failures.push("css/signature-style.css must import ./skeleton.css AFTER ./command.css (command styles load first)");
    }
  }
  for (const name of ["SkeletonLine", "SkeletonLineProps", "SkeletonCard", "SkeletonTableRow", "SkeletonTableRowProps"]) {
    if (!new RegExp(`\\b${name}\\b`).test(umbrellaDts)) {
      failures.push(`react/index.d.ts must re-export ${name} — (sk1)`);
    }
  }
  for (const name of ["SkeletonLine", "SkeletonCard", "SkeletonTableRow"]) {
    if (!new RegExp(`\\b${name}\\b`).test(umbrellaJs)) {
      failures.push(`react/index.js must re-export ${name} — (sk1)`);
    }
  }
  // 2.9.1 AMENDMENT — THE LIVE TRIGGER: the skeletons are not just
  // shippable, they are runnable. The palette command + the Input Matrix
  // button land on ONE registered runner; SimSlot height-locks the swap
  // so the CLS probe can hold the line.
  const SK_APP_291 = [
    ['label: "Simulate Async Load (800ms)"', "the palette command"],
    ['keywords: "skeleton loading async cls placeholder simulate"', "the command's type-to-filter keywords"],
    ['id: "simulate-async-load"', "the command's stable id"],
    ['icon: "Hourglass"', "the command icon (live-map-probed by (b6))"],
    ['data-testid="btn-simulate-load"', "the Input Matrix button hook (the documented manual door)"],
    ["leftIcon=\"Hourglass\"", "the button's icon"],
    ["const SIM_LOADING_MS = 800", "the 800ms window constant"],
    ["function SimSlot(", "the height-lock slot wrapper"],
    ['data-sim-slot={id}', "the slot's probe attribute"],
    ["startAsyncSim", "the measuring runner"],
    ["registerSimRunner", "the Shell-side registry wiring"],
    ["getBoundingClientRect().height", "the BEFORE-swap footprint measurement"],
    ["<SkeletonTableRow key={guest.id} columns={3} />", "the ledger swap — skeleton rows × current-rows"],
    ["{simLoading ? (\n            <SkeletonCard />\n          ) : (", "the card-body swap ternary"],
  ];
  for (const [needle, label] of SK_APP_291) {
    if (!appSrc.includes(needle)) {
      failures.push(`(sk1) App.tsx must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  // The swap count: SIX card-body ternaries (checkin/chronology/telemetry/
  // deck/palette/matchup — all seven bento SurfaceCards swap except the
  // ledger, which swaps to skeleton ROWS instead of a SkeletonCard). The
  // check-in slot is the one-liner form; the rest are multi-line.
  const swapCount = (appSrc.match(/simLoading \? (?:\(\s*)?<SkeletonCard \/>/g) ?? []).length;
  if (swapCount !== 6) {
    failures.push(`(sk1) exactly 6 bento cards must swap their bodies to <SkeletonCard />, found ${swapCount} (the ledger swaps to SkeletonTableRow rows instead)`);
  }
  if (!existsSync(resolve(root, "playground", "probe-skeleton-cls.mjs"))) {
    failures.push("(sk1) playground/probe-skeleton-cls.mjs is missing — the CLS proof (release blocker) is not wired");
  }
}

// ---- (ct1) THE CONTRAST GATE (2.9.1) ------------------------------------------
// Zero contrast debt, enforced: the gate script must exist, be wired, the
// two fixed hexes must sit in css/tokens.css, and the gate itself must run
// green (all 11 party tokens ≥3.0:1 on surface AND base; the fixed pair
// ≥3.1:1). Negative test documented in the header: revert the blue hex →
// FAIL with the measured ratio → restore → PASS.
{
  const contrastScriptPath = resolve(root, "playground", "verify-contrast.mjs");
  if (!existsSync(contrastScriptPath)) {
    failures.push("(ct1) playground/verify-contrast.mjs is missing — the zero-contrast-debt gate");
  }
  if (pkg.scripts?.["verify:contrast"] !== "node playground/verify-contrast.mjs") {
    failures.push(
      '(ct1) package.json scripts["verify:contrast"] must be "node playground/verify-contrast.mjs" — the gate must be runnable',
    );
  }
  const tokensCss291 = readFileSync(resolve(root, "css/tokens.css"), "utf8");
  if (!/--party-mauve-bright:\s*#9e5ff2/i.test(tokensCss291)) {
    failures.push(
      "(ct1) css/tokens.css must carry --party-mauve-bright: #9e5ff2 — the minimal in-family lightness step (H266°/S85% L58→66%), measured 3.22:1 on surface (was #8839ef @ 2.32:1)",
    );
  }
  if (!/--party-blue:\s*#89b4fa/i.test(tokensCss291)) {
    failures.push(
      "(ct1) css/tokens.css must carry --party-blue: #89b4fa — the official Catppuccin Mocha Blue, the v3.0.0 --party-cobalt convergence value (was #1e66f5 @ 2.56:1)",
    );
  }
  if (existsSync(contrastScriptPath)) {
    const ran = spawnSync("node", [contrastScriptPath], { cwd: root, encoding: "utf8" });
    if (ran.status !== 0) {
      const output = `${ran.stdout ?? ""}${ran.stderr ?? ""}`;
      failures.push(`(ct1) verify:contrast FAILED — ${output.split("\n").filter((l) => l.includes("- (ct")).join(" | ") || output.slice(0, 200)}`);
    }
  }
}

// ---- (bc1) THE BREADCRUMBS (2.9.0, Phase 2) ------------------------------------
// react/nav.tsx: <Breadcrumbs items={[{label, href?}]} /> — nav[aria-label]
// > ol > li, links muted + hover main, the LAST crumb is a span with
// aria-current="page", separators are explicit aria-hidden "/" spans.
// css/nav.css: the mono Shed path anatomy. Playground: the topbar speaks
// per view + every PatternFrame carries its own path.
{
  const navSrc = readFileSync(resolve(root, "react/nav.tsx"), "utf8");
  const navDtsPath = resolve(root, "react/nav.d.ts");
  const BC_TSX = [
    ["export interface BreadcrumbItem", "the crumb contract"],
    ["href?: string", "navigable crumbs carry an href"],
    ["export interface BreadcrumbsProps", "the props contract"],
    ['aria-label={label ?? "Breadcrumb"}', "the nav's accessible name"],
    ['aria-current={isLast ? "page" : undefined}', "THE current-page attribute on the last crumb"],
    ['className="ptp-breadcrumbs__sep"', "the separator span"],
    ['aria-hidden="true"', "the separator is silent to screen readers"],
  ];
  for (const [needle, label] of BC_TSX) {
    if (!navSrc.includes(needle)) {
      failures.push(`(bc1) react/nav.tsx must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  if (!/BreadcrumbsProps/.test(readFileSync(navDtsPath, "utf8"))) {
    failures.push("(bc1) the compiled react/nav.d.ts must carry BreadcrumbsProps");
  }
  const navCss = readFileSync(resolve(root, "css/nav.css"), "utf8");
  const BC_CSS = [
    ['.ptp-breadcrumbs [aria-current="page"]', "THE current-page selector"],
    ["font-weight: 700", "the bold current crumb"],
    [".ptp-breadcrumbs__sep", "the separator anatomy"],
    ["var(--font-mono, ui-monospace, \"SFMono-Regular\", Menlo, Consolas, monospace)", "the mono path voice"],
    ["prefers-reduced-motion", "the reduced-motion guard follows"],
  ];
  for (const [needle, label] of BC_CSS) {
    if (!navCss.includes(needle)) {
      failures.push(`(bc1) css/nav.css must contain ${needle} — ${label}`);
    }
  }
  for (const name of ["Breadcrumbs", "BreadcrumbItem", "BreadcrumbsProps"]) {
    if (!new RegExp(`\\b${name}\\b`).test(umbrellaDts)) {
      failures.push(`react/index.d.ts must re-export ${name} — (bc1)`);
    }
  }
  if (!new RegExp("\\bBreadcrumbs\\b").test(umbrellaJs)) {
    failures.push("react/index.js must re-export Breadcrumbs — (bc1)");
  }
  const frameSrcBc = readFileSync(resolve(root, "playground/components/PatternFrame.tsx"), "utf8");
  const BC_APP = [
    [appSrc, 'label="You are here"', "the topbar breadcrumbs' accessible name"],
    [appSrc, '{ label: "engine", href: VIEW_HREFS.dashboard }', "the path's engine root"],
    [appSrc, '{ label: "live-bento" }', "the dashboard's path tip"],
    [appSrc, "`set-${studioSet}`", "the studio path tracks the active set"],
    [frameSrcBc, 'label: "engine", href: "#/dashboard"', "the in-frame path's engine root"],
    [frameSrcBc, "label: `set-${setId}`", "the in-frame path's set segment"],
    [frameSrcBc, "{ label: componentName }", "the in-frame path names the component"],
  ];
  for (const [source, needle, label] of BC_APP) {
    if (!source.includes(needle)) {
      failures.push(`(bc1) must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
}

// ---- verdict ----------------------------------------------------------------------
if (failures.length > 0) {
  console.error("FAIL");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("PASS — playground gates (b1)-(b7) + (h1)-(h3) + (e1)-(e2) + (m1)-(m3) + (g2)-(g3) + (n-hub1)-(n-hub4) + (sp1) + (ix1)-(ix2) + (s1)-(s2) + (v22) + (dd1)-(dd6) + (ed1)-(ed4) + (icons) + (showcase) + (af1)-(af3) + (b12)/(sh1)/(ff1)/(pw1)/(bt1)/(cd1)/(al1) + 2.6.0 (acc1)/(elev)/(pt11)/(cc1)-(cc5)/(mi1) + 2.8.0 (nav5)/(ps-studio)/(ps-copy)/(ps-llms) + 2.9.0 (cq1)/(cmd1)/(sk1)/(bc1): scaffold, wiring, pack stays EXACTLY 58 (2.9.1 adds zero shipped files — playground/tools files-array excluded), zero hex + 768px collapse, bento shape + hero + shed anatomy (7 cards audited INSIDE the dashboard branch), icons probe, v2.9.0-baseline safety diff (b7/n-hub4: css/tokens.css two party values + tokens.json values/descriptions/meta + the owner-sanctioned verify.mjs (p) pin re-targets ONLY; react/ demo/ SYSTEM_PROMPT.md tools/ byte-identical) with the tokens.json 2.9.1 guard (deep-equal after neutralizing meta.version + the two authorized party deltas), bento-cell stagger + reduced-motion escape, mockEvents hydration + mapping, ambient-elevation markers + the surface.css sanction, timeline resurrection needles, cortex dist + smoke wiring + live-state hooks, shell column + auto-fit packing + announced hero + teal/mono anatomy + hover lift + metric air + glass header boundary + telemetry spacing, MEASURED breathing room; 2.2.0-2.5.0 gates intact (surface anatomy, data/editorial css, bento, shell, FormField anatomy, PasswordInput, Button family, archetypes, ledger align); 2.6.0 gates intact (accent contract, elevation ladder, 11-token sweep, five archetypes, master index); 2.8.0 five REAL views + studio/copy/llms gates; 2.9.0 container queries + CommandPalette + skeletons + Breadcrumbs; 2.9.1: (ct1) the contrast gate exists, wired, hexes pinned #9e5ff2/#89b4fa and RUNNING green (all 11 party tokens ≥3.0:1 on surface AND base — zero contrast debt), (sk1) the live trigger wiring (palette command + Input Matrix button + SimSlot height locks + 6 body swaps + the SkeletonTableRow ledger swap + the CLS probe on disk); negative test: reverting --party-blue to #1e66f5 flips verify:contrast FAIL (measured 2.559:1 + the ct3 pin refusal), restore → PASS (git-verified byte-identical)");
