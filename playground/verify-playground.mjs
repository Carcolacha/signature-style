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
 *         (id / month / title / time / colorToken --sig-* token /
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
 *   (m1)  packages/signature-mcp/dist/server.js EXISTS — the compiled
 *         MCP server is built (npm --prefix packages/signature-mcp run
 *         build); 3.5.0 retarget: tools/mcp-viz is DELETED, its logic
 *         lives on in the standalone package;
 *         the package is the private @edwyn/visual-cortex-mcp, and root
 *         package.json carries the "verify:mcp" script that actually
 *         runs the smoke (raw JSON-RPC: exactly two tools, a
 *         .sig-timeline__node with real area, non-empty screenshot);
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
 *         (`.hub__card .sig-timeline__node` → 0 4px 12px
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
 *         3.4.0 deep-link bootstrap (hash first, dashboard default —
 *         the cortex smoke still finds the timeline on the bare root
 *         URL), the HubLink renderer with
 *         `event.preventDefault()` (no full-reload anchor — the
 *         negative-test target), the `as={navLink}` factory wiring into
 *         GlobalNav, and the <EmptyState> placeholder dogfood
 *         (icon="Hammer"). Hero copy is per-view: THE ENGINE stays on
 *         the dashboard, THE MASTER INDEX announces the index.
 *   (ix2) THE THREE GATEWAYS — exact Shed anatomy strings: PLANNER /
 *         views/planner.tsx / Event Planner Bento (the real gateway),
 *         STUDIO / views/studio.tsx / Pattern Studio,
 *         STUDIO / views/studio.tsx / the Pattern Studio; the index
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
 *         .sig-progress__caption (mono, tabular-nums, muted, 0.75rem);
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
 *         box-shadow), the runtime --sig-* ring guard.
 *   (dd4) THE CODEX — SYSTEM_PROMPT.md contains the "Universal AI
 *         Replication Contract" section, ≥15 component snippet
 *         headings, and the closing law ("never invent tokens; never
 *         hardcode hex"); the engine title moves to v2.6.
 *   (dd5) THE TABS SHOWCASE — App.tsx: the Tabs module switcher
 *         (label "Dashboard modules", the three module ids), the Data
 *         branch (DataTable ledger with the five crew rows + the
 *         composed SigBadge, the three Callout moods, five Avatars,
 *         two chromatic rings), the Forms branch (Select with three
 *         options, Checkbox, the v2.1.0 matrix).
 *   (dd6) CORTEX SWEEP — tools/mcp-viz/server.ts DEFAULT_SELECTORS
 *         carries .sig-data-table / .sig-tabs__tab / .sig-callout
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
 *         are unchanged — sig- prefixes only), so no tools exclusion
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
 *         (.sig-radio-card:has(input:focus-visible) → the Flamingo
 *         outline; the no-:has degrade documented), the radio selected
 *         contract (--selected class + :has(input:checked) → 2px
 *         Flamingo border + the 10% cake-tint background), the visually
 *         hidden input, the auto-fit minmax(140px,1fr) grid, the form
 *         field label/hint/error anatomy (error = --sig-peach);
 *         react/forms.tsx: the FormField hint-XOR-error slot and the
 *         radiogroup/aria-label contract.
 *   (ed4) VIZ ADDITIONS — react/viz.tsx: Sparkline renders ONE svg
 *         (role="img", preserveAspectRatio="none") with EXACTLY two
 *         elements (polygon + polyline) plus the --sig-* runtime
 *         guard and the ≥2-point guard; css/viz.css: .sig-stat-card is
 *         FLAT (surface background + 20% hairline, zero shadow —
 *         e1-scanned) with tabular-nums value + uppercase label +
 *         up/down chromatic delta colors.
 *   (icons) SDK-LUCIDE PROBE — Megaphone, ChevronLeft, ChevronRight
 *         exist in the installed lucide-react icons map (the "Music"
 *         lesson: editorial.tsx renders three new icon names).
 *   (showcase) THE EDITORIAL SHOWCASE — App.tsx: the FormField
 *         side-by-side (Name + $ Contribution), the RadioCardGroup
 *         attendance sample (Confirmed/Pending/Declined), the Data view
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
 *         needed — every 2.4.1 class keeps the sig- prefix).
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
 *         .sig-data-table__align-{left,center,right} utilities (the
 *         (0,2,0) prefix beats .sig-data-table thead th (0,1,2) — the
 *         bare class would LOSE and re-create the bug); react/data.tsx
 *         declares align?: "left"|"right"|"center" and flows
 *         dataTableCellClass to BOTH th and td; react/data.d.ts is
 *         factual; App.tsx ledger sets numeric + align: "right".
 *   (af2) FORM ANATOMY — css/forms.css: __required (peach, visual
 *         only), __row/__prefix (the justified adornment composition),
 *         the switch wrapper .sig-switch (inline-flex) + migrated
 *         .sig-switch__pill (NO pill property left on the bare
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
 *         `.sig-data-table .sig-data-table__align-right` rule from
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
 *         deltas — css/tokens.css (+ --sig-yellow), tokens.json
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
 *         (owner-editable: DEFAULT_SELECTORS += .sig-btn,
 *         .sig-stat-card, .sig-shell; version 2.5.0).
 *   (m3)  the 2.5.0 hooks join: data-testid="member-form",
 *         "ledger-table", "ring-attendance" (the live-state probes); the
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
 *         @keyframes sig-shake + the reduced-motion kill.
 *   (pw1) PASSWORDINPUT — forms.tsx: the Eye/EyeOff toggle
 *         (live-map-probed), the role="progressbar" meter (0..4, now
 *         score), data-score, the four rules + Weak/Fair/Good/Strong,
 *         data-satisfied pills; css: the 4-segment meter with the
 *         --sig-yellow stage-2 fill and the green satisfied pills.
 *   (bt1) THE BUTTON FAMILY — primitives.tsx: 4 variants, 3 sizes,
 *         leftIcon/rightIcon, loading (spinner replaces icons, aria-busy
 *         + disabled); css/primitives.css: the 4 variant classes, 2
 *         size classes, @keyframes sig-spin, :active scale(0.97), the
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
 *   (dd6 AMENDMENT)  the cortex sweep grows .sig-btn / .sig-stat-card
 *         / .sig-shell; the server version moves to 2.5.0.
 *   (showcase AMENDMENT)  the bento needles: Region Code +
 *         descriptions + validMessage + PasswordInput + the archetypes
 *         + the v2.5.0 banner copy; attendance options ALL carry
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
 *         the SigColorToken alias (the 11 --sig-* tokens) and the
 *         AccentToken union (chromatic + the two structural signatures);
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
 *         EXACTLY the 11 --sig-* names, and the SigColorToken
 *         alias exists in the compiled react/surface.d.ts (the union
 *         resolves through Extract<KnownToken, `--sig-${string}`> —
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
 *         accent border on --featured, the sig-green Check ink, the
 *         2rem tabular price.
 *   (cc4)  PROFILECARD — react/cards.tsx: the Avatar with
 *         size={avatarSize} + ringToken, the 2–3 stats dev-warn;
 *         css/cards.css: the tabular stat values.
 *   (cc5)  CHRONICLETIMELINE — react/cards.tsx: the <ol
 *         class="sig-chronicle"> with the inline --accent variable;
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
 *         the webkit display:none; the .sig-carousel__dots /
 *         .sig-carousel__dot anatomy joins ([data-active="true"] →
 *         the Flamingo 1.5rem pill).
 *   (dd4 AMENDMENT)  the codex title needle moves to v2.9; the codex
 *         gains the six new recipes (SurfaceCard chromatic params,
 *         ContentCard, ReferenceCard, TierCard, ProfileCard,
 *         ChronicleTimeline) — fact-checked against the compiled
 *         .d.ts files.
 *   (dd6 AMENDMENT)  the cortex sweep grows .sig-carousel__dot /
 *         .sig-chronicle__item; the server version moves to 2.6.0.
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
 *         AreaChart classes), css/timeline.css (APPEND-only .sig-tmanager
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
 *         .sig-graph--focused dim, the footer inspect strip, the
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
 *         shared/sigPalette/doctrine must stay identical).
 *   (ix1 AMENDMENT)  the view union grows to the 5 real views; the
 *         EmptyState/Hammer placeholder needles retire with
 *         PlaceholderView (EmptyState lives in the Set 06 frame).
 *   (nav5)  THE FIVE REAL VIEWS — Dashboard / Pattern Studio / Index /
 *         Chronicle / AI Codex in NAV_ITEMS + the routing table + the
 *         render branches; negative needles: PlaceholderView,
 *         WorkshopView, PLACEHOLDERS, "#/events"/"#/members"/"#/budget"
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
 *         the two fixed hexes (--sig-mauve-bright #9e5ff2 — the
 *         minimal in-family lightness step H266°/S85% L58→66%, measured
 *         3.22:1 on surface / 4.20:1 on base, was #8839ef @ 2.32:1;
 *         --sig-blue #89b4fa — official Catppuccin Mocha Blue, the
 *         v3.0.0 --sig-cobalt convergence, 5.97:1 / 7.79:1, was
 *         #1e66f5 @ 2.56:1); and the gate itself RUNS green (all 11
 *         chromatic tokens ≥3.0:1 vs surface AND base, the fixed pair
 *         ≥3.1:1). Negative test (falsifiability, restore-verified):
 *         reverting --sig-blue to #1e66f5 flips verify:contrast to
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
 *         2.9.1 deltas, and NOTHING else: css/tokens.css (the two chromatic
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
 * 3.0.0 gates ("16-Color Chromatic System, Obsidian Graph, 3×3
 * Carousel, Symmetrical Forms & 60fps" — the major):
 *   (chrom)  the 16-color expansion: cobalt carries blue's value (the
 *            name BANNED from css/tokens.json/whitelist via the (p3)
 *            retirement scan + the (pt11) complement), 15 chromatic
 *            FILL/SERIES tokens, --radius-card 12px, whitelist 50;
 *   (sch)    shared/schema.ts (9 DTO interfaces + 10 guards) +
 *            docs/SCHEMA_V3.md (SQLite + Postgres + Pydantic + REST);
 *            shared/ is NOT packed (files-array excluded — the (b3)
 *            proof stays 58);
 *   (par)    card parity: bg-surface + 15% glass border + radius-card +
 *            220px floor on .sig-flip-card/.sig-accordion/.sig-matchup,
 *            the 12% tinted wells, the 45% [data-accent] top accent,
 *            cards.css STILL absolute zero;
 *   (car3)   carousel modes: paged-3 (repeat(3,1fr) snap pages, page
 *            dots, page-striding chevrons) + IO-synced free-scroll +
 *            the docked control bar + the live toggle pill;
 *   (ff2)    symmetrical fields: the 20px label rail, helpers-below
 *            (aria-describedby preservation via cloneElement), the
 *            pure-CSS info tooltip (hover + focus-visible);
 *   (ring2)  ring zoom: the aspect-ratio square dial, scale(1.07) on
 *            hover/[data-expanded], the 0fr→1fr detail strip;
 *   (ob1)    obsidian graph: 60fps drag (setPointerCapture + rAF direct
 *            transform mutation), right-click azure tethers, dbl-click
 *            spawn, wheel zoom 0.5–2.5, Escape cancel, 8px arrow nudge,
 *            the persisted positions/links model;
 *   (pf1)    React.memo x5 + the 300ms debounced persistence + contain
 *            on .sig-surface-card;
 *   (bd1)    the backdrop audit (command.css z-50 + timeline.css glass
 *            stay; modal stays blur-free; nav stays blur-free);
 *   (b7)/(n-hub4) REBASED to v2.9.1 with the enumerated 3.0.0
 *            authorized set; the tokens.json guard asserts themes +
 *            doctrine byte-equal, shared gaining EXACTLY --radius-card,
 *            the chromatic family losing EXACTLY --sig-blue, cobalt
 *            carrying blue's exact value.
 *   Negative tests (restore-verified): (ct4) a sub-2.0 chromatic value
 *            flips verify:contrast FAIL; re-declaring --sig-blue
 *            flips (p3)+(d) FAIL; a sub-220px parity floor flips (par)
 *            FAIL; a 2-col page grid flips (car3) FAIL; killing the
 *            helpers rail flips (ff2) FAIL; killing the zoom flips
 *            (ring2) FAIL; removing setPointerCapture flips (ob1) FAIL.
 *
 * 3.5.0 gates ("Standalone Visual Cortex MCP Server & CI Pixel-Diff
 * Certification" — the ecosystem closer; the MCP package is NEW, the
 * certifications are NEW scripts, ci.yml is NEW; ZERO component
 * changes — css/ react/ wc/ dist/wc stay byte-identical):
 *   (b2 AMENDMENT)  the frozen files array is UNCHANGED — zero new
 *         package files this release (the MCP package is a SEPARATE
 *         private package under packages/, auto-excluded by the files
 *         allowlist).
 *   (b3)  npm pack stays EXACTLY 64 — packages/ and scripts/goldens/
 *         are outside the files array (this gate's run proves it).
 *   (b7)/(n-hub4)  REBASED to the v3.3.0 baseline with the enumerated
 *         3.5.0 authorization: the tools/mcp-viz/ DELETIONS (all six
 *         tracked files — the inspector's logic is PROMOTED into the
 *         standalone packages/signature-mcp), the NEW certification
 *         scripts (verify-mcp.mjs, verify-visual-diff.mjs,
 *         verify-a11y.mjs, goldens/), and scripts/verify.mjs stays
 *         BYTE-FROZEN (it never referenced tools/ paths — grepped).
 *         css/, react/, wc/, dist/wc, demo/, shared/, docs/, bin/ stay
 *         byte-identical; tokens.json gains ONLY meta.version → 3.5.0
 *         (VALUES + the 50-token whitelist are byte-frozen).
 *   (m1)  packages/signature-mcp/dist/server.js EXISTS — the compiled
 *         MCP server is built (npm --prefix packages/signature-mcp
 *         run build);
 *   (m2)  SMOKE PROOF ARTIFACT wired — scripts/verify-mcp.mjs exists
 *         (the proven v2.7.0 JSON-RPC harness, ported), the package is
 *         the private @edwyn/signature-mcp, and root package.json
 *         carries the "verify:mcp" script that builds + runs the smoke;
 *   (dd6 AMENDMENT)  the cortex sweep needles retarget to
 *         packages/signature-mcp/src/server.ts (same selector sweep,
 *         verbatim port) and the server version string moves to 3.5.0;
 *   (v35) THE CERTIFICATION GATE — packages/signature-mcp exists with
 *         EXACTLY the 4-tool src/server.ts, private
 *         @edwyn/signature-mcp v1.0.0, playwright pinned EXACTLY
 *         1.65.0 (the shared Chromium — no second download), zero deps
 *         beyond sdk+zod+playwright; scripts/verify-visual-diff.mjs +
 *         scripts/verify-a11y.mjs exist and are wired
 *         (verify:visual-diff / update:snapshots / verify:a11y);
 *         .github/workflows/ci.yml exists and wires the suites;
 *         scripts/goldens/ carries the 5 committed golden masters.
 *
 * Prints PASS and exits 0; prints FAIL + reasons and exits 1.
 */

import { readFileSync, writeFileSync, unlinkSync, existsSync, readdirSync } from "node:fs";
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
// 3.3.0 AMENDMENT: the zero-dep CLI ships — the array gains "bin" at the
// front (bin/cli.mjs + bin/themes.mjs; the npx runtime needs both). The
// FROZEN_KEYS distribution surface (exports/main/peers) is untouched.
// 3.4.0 AMENDMENT: the WC umbrella joins — exports gains EXACTLY the
// "./wc" condition object (types/import/default → dist/wc, the react
// shape mirrored; every other export key deep-equal to v1.4.0), and the
// files array gains "dist/wc" (the compiled bundle + the tsc-honest
// declarations ship; the wc/src sources stay out of the tarball like the
// react .tsx sources do). main/peers stay untouched.
// 3.5.0 AMENDMENT: the array is UNCHANGED — the MCP package is a
// SEPARATE private package (packages/signature-mcp) outside the files
// allowlist, and scripts/goldens/ rides the repo, not the tarball; the
// (b3) proof stays EXACTLY 64.
// 3.7.0 AMENDMENT: the kinetic motion promotion adds the ninth negation
// ("!react/motion.tsx"), same precedent — the source never ships, its
// compiled motion.js/.d.ts do; the (b3) proof grows 64 → 67 (the motion
// trio: css/motion.css + react/motion.js + react/motion.d.ts).
const FROZEN_KEYS = ["exports", "main", "peerDependencies", "peerDependenciesMeta"];
const WC_EXPORT = {
  types: "./dist/wc/index.d.ts",
  import: "./dist/wc/signature-wc.es.js",
  default: "./dist/wc/signature-wc.es.js",
};
const FILES_NEGATIONS = ["!react/surface.tsx", "!react/data.tsx", "!react/editorial.tsx", "!react/cards.tsx", "!react/graph.tsx", "!react/timeline-manager.tsx", "!react/command.tsx", "!react/skeleton.tsx", "!react/motion.tsx"];
let v140pkg = null;
try {
  v140pkg = JSON.parse(execFileSync("git", ["show", "v1.4.0:package.json"], { cwd: root, encoding: "utf8" }));
} catch (error) {
  failures.push(`(b2) could not read v1.4.0:package.json — ${(error instanceof Error ? error.message : String(error)).split("\n")[0]}`);
}
if (v140pkg !== null) {
  const stableJson = (value) => JSON.stringify(value === undefined ? null : value);
  for (const key of FROZEN_KEYS) {
    // 3.4.0: exports is checked with the "./wc" key neutralized — the
    // new key is asserted EXACTLY below (the react umbrella shape,
    // mirrored); every OTHER export key must remain deep-equal to v1.4.0.
    const current =
      key === "exports"
        ? { ...pkg[key], "./wc": undefined }
        : pkg[key];
    const baseline =
      key === "exports"
        ? { ...v140pkg[key], "./wc": undefined }
        : v140pkg[key];
    if (stableJson(current) !== stableJson(baseline)) {
      failures.push(`(b2) package.json "${key}" changed vs v1.4.0 beyond the authorized 3.4.0 ./wc delta — the distribution surface is FROZEN`);
    }
  }
  // 3.4.0: the ./wc block must be EXACTLY the react shape, mirrored.
  if (stableJson(pkg.exports?.["./wc"]) !== stableJson(WC_EXPORT)) {
    failures.push(
      '(b2) package.json exports["./wc"] must be EXACTLY { types: "./dist/wc/index.d.ts", import: "./dist/wc/signature-wc.es.js", default: "./dist/wc/signature-wc.es.js" } — the react umbrella shape, mirrored',
    );
  }
  // files = "bin" (3.3.0) + v1.4.0's array + "dist/wc" (3.4.0) + the negations, exactly, in order.
  const expectedFiles = ["bin", ...(v140pkg.files ?? []), "dist/wc", ...FILES_NEGATIONS];
  if (stableJson(pkg.files) !== stableJson(expectedFiles)) {
    failures.push(
      "(b2) package.json files must be \"bin\" (3.3.0) + the v1.4.0 array + \"dist/wc\" (the 3.4.0 WC amendment) EXACTLY plus the negations !react/surface.tsx + !react/data.tsx + !react/editorial.tsx + !react/cards.tsx + !react/graph.tsx + !react/timeline-manager.tsx + !react/command.tsx + !react/skeleton.tsx + !react/motion.tsx (3.7.0) — the packing contract evolves documented steps",
    );
  }
}

// ---- (b3) npm pack grows to EXACTLY 67 files (3.7.0: 64 + the kinetic
// motion trio — css/motion.css + react/motion.js + react/motion.d.ts;
// the react/motion.tsx source stays OUT of the tarball like every react
// .tsx source). 3.4.0 was 64 (60 + the dist/wc quartet —
// signature-wc.es.js + index.d.ts + base.d.ts + elements.d.ts); 3.3.0
// was 60 (58 + bin/cli.mjs + bin/themes.mjs); 2.9.0 history:
// 52 → 58 (css/command.css + css/skeleton.css +
// react/command.{js,d.ts} + react/skeleton.{js,d.ts}); playground/ and
// packages/ and scripts/goldens/ stay excluded by the files array. ----
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
} else if (totalFiles[1] !== "68") {
  failures.push(
    `(b3) npm pack must pack EXACTLY 68 files (3.8.0: 67 + bin/templates.mjs — the full-page template map), found ${totalFiles[1]}`,
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
  ["the workbench — every primitive, one live bento", "the dashboard hero subtitle string (n-hub2; 3.6.0 the Workbench retitle)"],
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
  ['title="Workspace Member & Resource Allocation"', "the live-validation form card (2.5.0 defect #5; 3.1.0 the standalone rename)"],
  ['title="The Chronology"', "the chronology card's ruled title"],
  ['className="sig-span-4 sig-row-2 hub__card--timeline"', "the chronology: span 4 + ROW-SPAN 2 + the timeline modifier (sp1 overrides ride it)"],
  ['title="Budget & Attendance Telemetry"', "the telemetry card's ruled title"],
  ['title="Interactive Deck & Rules"', "the archetypes card's ruled title (2.5.0)"],
  ['title="1v1 Game Matchup & Editorial"', "the matchup card's ruled title (2.5.0)"],
  ['title="The Chromatic Palette"', "the palette card's ruled title"],
  ['title="The Input Matrix"', "the forms-module matrix card's ruled title"],
  ["SigBadge", "the palette + ledger render the chromatic badges"],
  ["StatRing", "the telemetry card renders the live ring"],
  ["onEventSelect={modal.open}", "timeline nodes open the modal"],
  ["SEED_MEMBERS", "the live ledger's typed seed (2.5.0 live state)"],
  ["const derived = useMemo(", "the DERIVED layer — every live read is a useMemo of members"],
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
    ["useState<Member[]>(SEED_MEMBERS)", "the members state seeds from SEED_MEMBERS"],
    ["const allocate = useCallback(", "the append handler flows to the allocation form"],
    ["derived.ledgerRows", "the ledger rows derive from state"],
    ["derived.ringValue", "the ring value derives from state"],
    ["derived.spentPct", "the budget bars derive from state"],
    ["ATTENDANCE_TO_STATE", "the radio value maps to the ledger attendance"],
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
    if (!entry.includes('colorToken: "--sig-')) {
      failures.push(`(h2) mockEvents entry ${id} colorToken must be a --sig-* token`);
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
// 3.1.0 AMENDMENT (the purge): the baseline is NORMALIZED through the
// owner-mandated rename map (.ptp- → .sig-) before diffing — a pure rename
// is not a code deletion, so the renamed baseline compares equal and REAL
// deletions still fail the gate. The map IS the 3.1.0 class-prefix purge
// (.ptp- → .sig-), kept here so the historical baseline keeps comparing
// equal — it never rewrites the CURRENT file.
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
const E2_RENAME_MAP = [{ from: /\.ptp-/g, to: ".sig-" }];
let timelineDiffLines = [];
let normalizedBaseline = null;
try {
  // Diff the CURRENT file against the RENAMED v1.8.0 baseline. spawnSync
  // (not execFileSync) because `git diff --no-index` exits 1 when the files
  // DIFFER — which for a touched file is the expected, non-throwing case.
  const v180raw = execFileSync("git", ["show", "v1.8.0:css/timeline.css"], { cwd: root, encoding: "utf8" });
  normalizedBaseline = v180raw;
  for (const { from, to } of E2_RENAME_MAP) normalizedBaseline = normalizedBaseline.replace(from, to);
  writeFileSync(resolve(root, ".git/e2-baseline-normalized.css"), normalizedBaseline);
  const diff = spawnSync("git", ["diff", "--no-index", "--", ".git/e2-baseline-normalized.css", "css/timeline.css"], {
    cwd: root,
    encoding: "utf8",
  });
  timelineDiffLines = String(diff.stdout ?? "").split("\n");
  unlinkSync(resolve(root, ".git/e2-baseline-normalized.css"));
} catch (error) {
  failures.push(`(e2) could not diff css/timeline.css vs the normalized v1.8.0 baseline — ${(error instanceof Error ? error.message : String(error)).split("\n")[0]}`);
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
  // The mask target is the NORMALIZED baseline (the diff's old side) so the
  // hunk-header line numbers align after the 3.1.0 rename normalization.
  if (normalizedBaseline !== null) {
    oldTimeline = normalizedBaseline.split("\n");
  } else {
    oldTimeline = execFileSync("git", ["show", "v1.8.0:css/timeline.css"], { cwd: root, encoding: "utf8" }).split("\n");
  }
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

// ---- (b7) SAFETY PROOF: core deltas vs v3.8.0 are owner-authorized ----------
// 3.4.0 REBASE (the floor moves v3.2.0 → v3.3.0): the ZERO-REACT NATIVE
// WEB COMPONENTS release. The owner-mandated 3.4.0 deltas, and NOTHING
// else — css/, react/, demo/, bin/ and the tokens.json VALUES stay
// byte-identical to v3.3.0:
//   scripts/verify.mjs       — the (e2) contract evolves one documented
//                              step: the exports map grows 3 → 4 paths
//                              ("./wc" joins; the tokens gates untouched)
//   scripts/verify-cli.mjs   — gatePack evolves 60 → 64 (the dist/wc
//                              quartet ships)
//   scripts/verify-wc.mjs    — NEW: the verify:wc gate (zero-react greps
//                              + the Playwright render proof)
//   SYSTEM_PROMPT.md         — title → v3.7 + the "The Visual Cortex as
//                              a Product" subsection (the four MCP tools,
//                              the attach configs, the CI certifications)
//   tools/mcp-viz/server.ts  — version string → 3.4.0 + the six sig-*
//                              element selectors join the sweep
//   tools/mcp-viz/smoke.mjs  — the (s2b) studio wc hits proof
// tokens.json meta.version → 3.4.0 is guarded by the SEPARATE tokens
// block below (mocha/latte/shared/sigPalette/doctrine stay byte-equal vs
// v3.1.0 — NO token changes this release). playground/ is NOT under the
// freeze (the composition layer); README/package.json/lock are release
// plumbing; wc/ + dist/wc are NEW paths outside the locked list.
// 3.6.0 REBASE (the floor moves v3.3.0 → v3.5.0): the Zero-Defect A11y +
// Graph Studio release. The owner-authorized 3.6.0 deltas, and NOTHING
// else — demo/ bin/ stay byte-identical; scripts/verify.mjs stays
// BYTE-FROZEN (untouched this release — the diff proves it). The
// AUTHORIZED set enumerates:
//   css/cards.css       — the .sig-action-tile scoped :focus kill + the
//                         reference-code halo (a11y Task 1)
//   css/editorial.css   — the true 3x3 page deck (Task 2)
//   css/graph.css       — the edge hit paths + the selected-edge crimson
//                         (Task 3)
//   css/timeline.css    — the settled dim scoped to the title (axe fix)
//   react/cards|editorial|graph|index(.ts/.js/.d.ts) — the package-side
//                         implementations of Tasks 1-3 (FlipCard inert,
//                         ReferenceCard focusable code well, the page
//                         deck, GraphEdge model + KnowledgeGraphHandle +
//                         the new exports)
//   scripts/verify-a11y.mjs / verify-visual-diff.mjs — the 7-view census
//                         + tier adjudication + inert sweep
//   scripts/verify-examples.mjs — NEW (Task 8)
//   scripts/goldens/    — the owner-mandated re-certification (NEW views)
//   SYSTEM_PROMPT.md    — title → v3.8 + the Graph Studio sections
// wc/src + dist/wc (outside the locked list) carry the sig-stat-ring
// label contract + the WC carousel 2.5.3 aria labels. tokens.json gains
// meta.version 3.6.0 + the TWO-TIER metadata (guarded below — VALUES
// byte-frozen).
// 3.8.0 REBASE (the floor moves v3.6.0 → v3.7.0): FULL-PAGE LAYOUT
// TEMPLATES, INTERACTIVE VIEWPORT PREVIEWER & CLI TEMPLATE EXPANSION.
// The owner-authorized 3.8.0 deltas, and NOTHING else — css/ react/
// wc/ demo/ tools/ stay byte-identical (0-line diff). The
// AUTHORIZED_380 set:
//   bin/cli.mjs            — the --template expansion (saas|docs|telemetry)
//   bin/templates.mjs      — NEW: the embedded full-page template map
//   scripts/verify-cli.mjs — scenarios E/F/G + gate tpl3 + (b3) 67 → 68
//   scripts/verify-mcp.mjs — the Templates navigation probe + matrix
//   scripts/verify-a11y.mjs / scripts/verify-visual-diff.mjs — the
//                          9-view census + the goldens re-cert
//   scripts/goldens/    — the owner-mandated re-certification
//   SYSTEM_PROMPT.md    — title → v4.0 + the Full-Page Layout Blueprints
// tokens.json gains meta.version 3.9.0 (guarded below — the COLOR
// VALUES stay byte-frozen; motionTokens carries EXACTLY the 9 kinetic
// tokens, unchanged). playground/ is NOT under the freeze (the
// composition layer); README/package.json/lock are release plumbing.
const B7_LOCKED_330 = ["css/", "react/", "SYSTEM_PROMPT.md", "demo/", "scripts/", "tools/", "bin/"];
const AUTHORIZED_330 = new Set([
  // 3.9.0 — THE FOUR-DEFECT RELEASE DELTAS (enumerated honestly):
  // StatRing enum (T1), templates container reflow (T2), workbench
  // proportions (T3), the graph studio engine (T4), the kinetic suite
  // (T5), the gates + cert probes + the template-sources regen (T6).
  "css/viz.css", // T1: the .sig-stat-ring box contract
  "css/motion.css", // T5: the kinetic suite (@property, beam, tilt, beacon, wave)
  "css/graph.css", // T4: nodeKind paint + non-free cursors
  "react/viz.tsx", "react/viz.js", "react/viz.d.ts", // T1: the enum
  "react/graph.tsx", "react/graph.js", "react/graph.d.ts", // T4: the layout engine
  "react/motion.tsx", "react/motion.js", "react/motion.d.ts", // T5: the suite
  "react/index.ts", "react/index.js", "react/index.d.ts", // T4+T5: the exports
  "SYSTEM_PROMPT.md", // T6: the title steps to v4.1 + the new recipes
  "scripts/verify.mjs", // T6: the (ring2)+(mm1)-(mm5) additive gates
  "scripts/gates-v390.mjs", // T6: the pure mm gates
  "scripts/verify-negative-v390.mjs", // T6: the negative tests
  "scripts/verify-mcp.mjs", // T6: the (s2f)/(s2g) probes
  "scripts/regen-template-sources.mjs", // T2: the (tpl1) parity regen tool
  "scripts/verify-cli.mjs", // (carried 3.8.0 — no edit this release)
  "scripts/verify-a11y.mjs", // (carried 3.8.0 — no edit this release)
  "scripts/verify-visual-diff.mjs", // (carried 3.8.0 — no edit this release)
  "bin/cli.mjs", "bin/templates.mjs", // (carried 3.8.0 — no edit this release)
]);
let b7Changed = [];
try {
  b7Changed = execFileSync(
    "git",
    ["diff", "v3.8.0", "--name-only", "--", ...B7_LOCKED_330],
    { cwd: root, encoding: "utf8" },
  )
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
} catch (error) {
  failures.push(`(b7) could not diff against v3.8.0 — ${(error instanceof Error ? error.message : String(error)).split("\n")[0]}`);
}
for (const file of b7Changed) {
  // scripts/goldens/ is the golden-master base (prefix exemption).
  if (!AUTHORIZED_330.has(file) && !file.startsWith("scripts/goldens/")) {
    failures.push(
      `(b7) SAFETY: ${file} changed since v3.8.0 — outside the owner-authorized 3.9.0 set (the four-defect release: ring enum, container reflow, workbench, graph studio, kinetic suite, gates)`,
    );
  }
}
// 3.9.0 rule: scripts/ beyond the authorized gates + the certification
// scripts is LOCKED. verify.mjs GROWS this release (the (ring2)+(mm1)-(mm5)
// additive block — enumerated); every existing gate logic is untouched.
const SCRIPTS_330_ALLOWED = new Set([
  "scripts/verify.mjs",
  "scripts/verify-cli.mjs",
  "scripts/verify-wc.mjs",
  "scripts/verify-mcp.mjs",
  "scripts/verify-visual-diff.mjs",
  "scripts/verify-a11y.mjs",
  "scripts/verify-examples.mjs",
  "scripts/gates-v390.mjs",
  "scripts/verify-negative-v390.mjs",
  "scripts/regen-template-sources.mjs",
]);
if (b7Changed.some((f) => f.startsWith("scripts/") && !SCRIPTS_330_ALLOWED.has(f) && !f.startsWith("scripts/goldens/"))) {
  failures.push("(b7) SAFETY: scripts/ beyond the authorized gates + the certification scripts is LOCKED (verify.mjs stays BYTE-FROZEN)");
}
if (b7Changed.some((f) => f.startsWith("tools/mcp-viz/node_modules/"))) {
  failures.push("(b7) SAFETY: tools/mcp-viz node_modules is LOCKED in 3.4.0");
}
// 3.7.0: the tokens.json meta bump is guarded — meta.version must be
// EXACTLY 3.7.0 and everything the guards don't explicitly neutralize
// stays byte-equal (VALUES + the 26-color family frozen). The NEW
// motionTokens section is the one authorized addition: EXACTLY the 9
// kinetic tokens, each with a name/value/description.
try {
  const tokensNow = JSON.parse(readFileSync(resolve(root, "tokens.json"), "utf8"));
  if (tokensNow.meta?.version !== "3.9.0") {
    failures.push(`(b7) SAFETY: tokens.json meta.version must be EXACTLY "3.9.0", found ${JSON.stringify(tokensNow.meta?.version)}`);
  }
  const MOTION_NAMES_370 = [
    "--ease-spring-snappy", "--ease-spring-gentle", "--ease-kinetic-out", "--ease-glide",
    "--dur-spring-snappy", "--dur-spring-gentle", "--dur-kinetic-out", "--dur-glide",
    "--sig-motion-scale",
  ];
  const motionNow = tokensNow.motionTokens?.tokens ?? {};
  const motionNames = Object.keys(motionNow).filter((k) => k !== "contract");
  for (const name of MOTION_NAMES_370) {
    if (!(name in motionNow)) {
      failures.push(`(b7) SAFETY: tokens.json motionTokens is missing ${name} (the 3.7.0 kinetic tokens)`);
    }
  }
  if (motionNames.length !== MOTION_NAMES_370.length) {
    failures.push(`(b7) SAFETY: tokens.json motionTokens must carry EXACTLY the 9 kinetic tokens, found ${motionNames.length}`);
  }
} catch (error) {
  failures.push(`(b7) cannot read tokens.json meta — ${(error instanceof Error ? error.message : String(error)).split("\n")[0]}`);
}

// tokens.json guard (baseline v3.1.0): the 3.2.0 SURFACE-ENGINE contract —
// themes.mocha gains EXACTLY the --bg-canvas alias (value var(--bg-base)),
// themes.latte / shared / sigPalette stay byte-equal (the mocha palette
// VALUES are untouched — the release retunes nothing), the NEW sigThemes
// section must exist with the triad + the 26-entry daylight inkVariants
// table, and doctrine.themes/grid_8px carry the engine sentences (exact
// strings; every other doctrine key byte-equal).
const DOCTRINE_THEMES_320 = "MULTI-THEME SURFACE ENGINE (3.2.0): the canonical surface themes ride the data-sig-theme attribute on <html> — absent or \"mocha\" = the :root default, \"oled\" = true-black (#000000 base / #0B0C10 surface / #12141C inset; every other token inherited), \"daylight\" = high-contrast light (#F8FAFC / #FFFFFF / #F1F5F9, dark slate ink, computed --sig-* ink variants ≥3.1:1 vs #FFFFFF). The legacy [data-theme=\"latte\"] light toggle stays working, outside the triad. ";
const DOCTRINE_GRID_320 = "The 8px grid: --space-tight (0.5rem) / --space-standard (1rem) / --space-section (1.5rem) for all padding and gaps. Maximize negative space. Borders are 1px solid color-mix(in srgb, var(--text-muted) 20%, transparent). Radius defaults to 6px in :root; the data-sig-radius presets retune it (standard 8px/12px — 8px-grid-pure; sharp 0px/0px). Zero drop shadows anywhere.";
const CANONICAL_16 = [
  "--sig-cobalt", "--sig-orchid", "--sig-cyan", "--sig-magenta", "--sig-mint",
  "--sig-spring", "--sig-citron", "--sig-violet-glow", "--sig-pink-glow",
  "--sig-rose-glow", "--sig-lime-glow", "--sig-mint-glow", "--sig-crimson",
  "--sig-azure", "--sig-tangerine", "--sig-neon-green",
];
try {
  const v310tokens = JSON.parse(execFileSync("git", ["show", "v3.1.0:tokens.json"], { cwd: root, encoding: "utf8" }));
  const currentTokens = JSON.parse(readFileSync(resolve(root, "tokens.json"), "utf8"));
  // themes.mocha: v3.1.0 + EXACTLY the --bg-canvas alias.
  const v310Mocha = v310tokens.themes?.mocha?.tokens ?? {};
  const curMocha = currentTokens.themes?.mocha?.tokens ?? {};
  const added = Object.keys(curMocha).filter((k) => !(k in v310Mocha));
  const removed = Object.keys(v310Mocha).filter((k) => !(k in curMocha));
  if (added.length !== 1 || added[0] !== "--bg-canvas" || removed.length !== 0) {
    failures.push(`(b7) SAFETY: themes.mocha must add EXACTLY --bg-canvas vs v3.1.0 (added: ${added.join(",") || "none"}; removed: ${removed.join(",") || "none"})`);
  }
  if (curMocha["--bg-canvas"]?.value !== "var(--bg-base)") {
    failures.push("(b7) SAFETY: themes.mocha --bg-canvas must be the alias var(--bg-base)");
  }
  for (const name of Object.keys(v310Mocha)) {
    const before = v310Mocha[name];
    const after = curMocha[name];
    // 3.6.0 AUTHORIZATION: --text-muted gains ONLY the contrastTier
    // metadata (the two-tier policy) — the VALUE stays byte-equal.
    if (name === "--text-muted") {
      if (before?.value !== after?.value) {
        failures.push("(b7) SAFETY: themes.mocha.--text-muted VALUE changed — the two-tier policy adds metadata, it never retunes ink");
      }
      continue;
    }
    if (JSON.stringify(after) !== JSON.stringify(before)) {
      failures.push(`(b7) SAFETY: themes.mocha.${name} changed — the mocha values are byte-identical in 3.2.0`);
    }
  }
  if (JSON.stringify(v310tokens.themes?.latte) !== JSON.stringify(currentTokens.themes?.latte)) {
    failures.push("(b7) SAFETY: tokens.json themes.latte changed — the legacy light theme is LOCKED in 3.2.0");
  }
  if (JSON.stringify(v310tokens.doctrine) !== JSON.stringify(currentTokens.doctrine)) {
    // doctrine.themes + doctrine.grid_8px carry the engine sentences (exact strings);
    // every other key is byte-equal.
    const vDoc = v310tokens.doctrine ?? {};
    const cDoc = currentTokens.doctrine ?? {};
    for (const key of Object.keys(vDoc)) {
      if (key === "themes" || key === "grid_8px") continue; // the 3.2.0 engine sentences (exact-string checks below)
      if (JSON.stringify(vDoc[key]) !== JSON.stringify(cDoc[key])) {
        failures.push(`(b7) SAFETY: doctrine.${key} changed — LOCKED in 3.2.0`);
      }
    }
    if (cDoc.themes !== DOCTRINE_THEMES_320 + vDoc.themes) {
      failures.push("(b7) SAFETY: doctrine.themes must be the 3.2.0 triad sentence PREFIXING the exact v3.1.0 string");
    }
    if (cDoc.grid_8px !== DOCTRINE_GRID_320) {
      failures.push("(b7) SAFETY: doctrine.grid_8px must be the exact 3.2.0 string (the radius presets documented)");
    }
  }
  if (JSON.stringify(v310tokens.shared) !== JSON.stringify(currentTokens.shared)) {
    failures.push("(b7) SAFETY: tokens.json shared changed — LOCKED in 3.2.0");
  }
  // 3.6.0 AUTHORIZATION: sigPalette entries gain ONLY the contrastTier
  // key (the two-tier policy — "ink" | "display" on the 11 ink-family
  // tokens); every other field (name/value/role/reserved/description/
  // isNew) stays byte-equal per token.
  {
    const before = v310tokens.sigPalette?.tokens ?? {};
    const after = currentTokens.sigPalette?.tokens ?? {};
    if (JSON.stringify(Object.keys(before)) !== JSON.stringify(Object.keys(after))) {
      failures.push("(b7) SAFETY: tokens.json sigPalette token SET changed — the 26-token family is frozen");
    }
    const INK_TIERS = { "--sig-pink-bright": "ink", "--sig-pink-soft": "ink", "--sig-pink-alt": "ink", "--sig-mauve-bright": "display", "--sig-mauve-soft": "ink", "--sig-lavender": "display", "--sig-sky": "ink", "--sig-cobalt": "ink", "--sig-peach": "display", "--sig-green": "ink", "--sig-yellow": "ink" };
    const TIER_DOC_TOKENS = new Set(["--sig-mauve-bright", "--sig-lavender", "--sig-peach"]);
    for (const [name, entry] of Object.entries(before)) {
      const now = after[name] ?? {};
      const { contrastTier: _tier, description: _desc, ...beforeCore } = entry;
      const { contrastTier: tierNow, description: descNow, ...afterCore } = now;
      if (JSON.stringify(beforeCore) !== JSON.stringify(afterCore)) {
        failures.push(`(b7) SAFETY: tokens.json sigPalette.${name} changed beyond contrastTier — values/roles are byte-identical in 3.6.0`);
      }
      // 3.6.0: the three display-tier tokens may extend their DESCRIPTION
      // with the two-tier usage note (the tier documentation mandate).
      if (TIER_DOC_TOKENS.has(name)) {
        const beforeDesc = entry.description ?? "";
        if (typeof descNow !== "string" || !descNow.startsWith(beforeDesc) || !descNow.includes("DISPLAY tier")) {
          failures.push(`(b7) SAFETY: sigPalette.${name}.description must EXTEND the v3.1.0 text with the DISPLAY-tier usage note`);
        }
      } else if (entry.description !== now.description) {
        failures.push(`(b7) SAFETY: sigPalette.${name}.description changed — only the display-tier trio may document the tier`);
      }
      if (name in INK_TIERS) {
        if (tierNow !== INK_TIERS[name]) {
          failures.push(`(b7) SAFETY: sigPalette.${name}.contrastTier must be ${JSON.stringify(INK_TIERS[name])}, found ${JSON.stringify(tierNow ?? null)}`);
        }
      } else if (tierNow !== undefined) {
        failures.push(`(b7) SAFETY: sigPalette.${name} must not carry contrastTier (only the 11 ink-family tokens are tiered)`);
      }
    }
  }
  // The NEW sigThemes section: the triad + the daylight inkVariants table.
  const sigThemes = currentTokens.sigThemes;
  if (sigThemes === undefined || typeof sigThemes !== "object") {
    failures.push("(b7) SAFETY: tokens.json sigThemes is missing — the 3.2.0 triad must be in the manifest");
  } else {
    if (sigThemes.mocha !== "default") {
      failures.push('(b7) SAFETY: sigThemes.mocha must be "default" (the :root identity)');
    }
    const oledTokens = sigThemes.oled?.tokens ?? {};
    if (oledTokens["--bg-base"] !== "#000000" || oledTokens["--bg-surface"] !== "#0B0C10" || oledTokens["--bg-inset"] !== "#12141C") {
      failures.push("(b7) SAFETY: sigThemes.oled.tokens must be exactly the true-black trio");
    }
    const dayTokens = sigThemes.daylight?.tokens ?? {};
    if (dayTokens["--bg-surface"] !== "#FFFFFF" || dayTokens["--bg-base"] !== "#F8FAFC" || dayTokens["--bg-inset"] !== "#F1F5F9") {
      failures.push("(b7) SAFETY: sigThemes.daylight.tokens must carry the slate structure trio");
    }
    const inkVariants = sigThemes.daylight?.inkVariants ?? {};
    for (const name of CANONICAL_16) {
      const entry = inkVariants[name];
      if (entry === undefined || typeof entry.ratio !== "number" || entry.ratio < 3.1) {
        failures.push(`(b7) SAFETY: sigThemes.daylight.inkVariants must document ${name} with a measured ratio >= 3.1`);
      } else if (entry.inherits === true) {
        if (entry.value !== currentTokens.sigPalette.tokens[name]?.value) {
          failures.push(`(b7) SAFETY: inkVariants.${name} claims inherits but its value is not the mocha value`);
        }
      } else if (typeof entry.value !== "string" || !/^#[0-9a-f]{6}$/i.test(entry.value)) {
        failures.push(`(b7) SAFETY: inkVariants.${name} must carry a 6-digit hex override`);
      }
    }
    // The ink-floor rung (3.0:1) documented for the non-canonical family too.
    for (const name of ["--sig-pink-bright", "--sig-pink-soft", "--sig-pink-alt", "--sig-mauve-bright", "--sig-mauve-soft", "--sig-lavender", "--sig-sky", "--sig-peach", "--sig-green", "--sig-yellow"]) {
      const entry = inkVariants[name];
      if (entry === undefined || typeof entry.ratio !== "number" || entry.ratio < 3.0) {
        failures.push(`(b7) SAFETY: sigThemes.daylight.inkVariants must document ink-floor token ${name} with a measured ratio >= 3.0`);
      }
    }
  }
  // The NEW geometryPresets section: the two presets, exact values.
  const geo = currentTokens.geometryPresets;
  if (geo === undefined || typeof geo !== "object") {
    failures.push("(b7) SAFETY: tokens.json geometryPresets is missing — the 3.2.0 radius presets must be in the manifest");
  } else {
    if (geo.standard?.radiusUi !== "8px" || geo.standard?.radiusCard !== "12px") {
      failures.push('(b7) SAFETY: geometryPresets.standard must be 8px/12px');
    }
    if (geo.sharp?.radiusUi !== "0px" || geo.sharp?.radiusCard !== "0px") {
      failures.push('(b7) SAFETY: geometryPresets.sharp must be 0px/0px');
    }
  }
} catch (error) {
  failures.push(`(b7) could not verify the tokens.json 3.2.0 delta — ${(error instanceof Error ? error.message : String(error)).split("\n")[0]}`);
}

// ---- (n-hub4) THE 3.9.0 FROZEN PROOF — v3.8.0 baseline ----
// Rebased 3.9.0 (the floor moves v3.7.0 → v3.8.0 with the b7 rebase):
// the watched surface is unchanged; the authorized set is the 3.9.0
// list from (b7).
const N_HUB4_LOCKED_330 = ["css/", "react/", "demo/", "SYSTEM_PROMPT.md", "scripts/", "tools/", "bin/"];
try {
  const v2SafetyDiff = execFileSync(
    "git",
    ["diff", "v3.8.0", "--name-only", "--", ...N_HUB4_LOCKED_330],
    { cwd: root, encoding: "utf8" },
  )
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "" && !AUTHORIZED_330.has(line) && !line.startsWith("scripts/goldens/"));
  if (v2SafetyDiff.length > 0) {
    failures.push(
      `(n-hub4) SAFETY: files changed since v3.8.0 beyond the 3.9.0 authorization — ${v2SafetyDiff.join(", ")} (deltas must be in the enumerated four-defect release set)`,
    );
  }
} catch (error) {
  failures.push(`(n-hub4) could not diff against v3.8.0 — ${(error instanceof Error ? error.message : String(error)).split("\n")[0]}`);
}

// ---- (m1) the compiled MCP server exists (3.5.0 RETARGET) -------------------------
// The Visual Cortex is source-of-truth packages/signature-mcp/src/server.ts →
// tsc → dist/server.js. 3.5.0: tools/mcp-viz is DELETED (logic promoted into
// the standalone package). tools/ was never packed (files array + gate b3
// prove it); packages/ is outside the allowlist too; this gate only asks
// that the build artifact is present.
const mcpDistServer = resolve(root, "packages/signature-mcp/dist/server.js");
if (!existsSync(mcpDistServer)) {
  failures.push(
    "(m1) packages/signature-mcp/dist/server.js is missing — build it: npm --prefix packages/signature-mcp run build",
  );
}

// ---- (m2) smoke-proof artifact wired (3.5.0 RETARGET) -----------------------------
// The release-blocker proof lives in scripts/verify-mcp.mjs (the proven
// v2.7.0 raw JSON-RPC harness, ported and grown to the four tools); root
// package.json must expose it as verify:mcp. The actual run is the separate
// `npm run verify:mcp` gate — needs the dev server.
const mcpPkgPath = resolve(root, "packages/signature-mcp/package.json");
const mcpSmokePath = resolve(root, "scripts/verify-mcp.mjs");
if (!existsSync(mcpSmokePath)) {
  failures.push("(m2) scripts/verify-mcp.mjs is missing — no smoke proof artifact");
}
try {
  const mcpPkg = JSON.parse(readFileSync(mcpPkgPath, "utf8"));
  if (mcpPkg.name !== "@edwyn/signature-mcp" || mcpPkg.private !== true) {
    failures.push('(m2) packages/signature-mcp/package.json must be private "@edwyn/signature-mcp"');
  }
  const mcpDeps = Object.keys(mcpPkg.dependencies ?? {});
  if (JSON.stringify(mcpDeps.sort()) !== JSON.stringify(["@modelcontextprotocol/sdk", "playwright", "zod"])) {
    failures.push("(m2) packages/signature-mcp dependencies must be EXACTLY @modelcontextprotocol/sdk + playwright + zod — zero other deps");
  }
  if (mcpPkg.dependencies?.playwright !== "1.65.0") {
    failures.push('(m2) packages/signature-mcp playwright must be pinned EXACTLY "1.65.0" (the repo\'s installed Chromium — no second download)');
  }
} catch (error) {
  failures.push(`(m2) cannot read packages/signature-mcp/package.json — ${(error instanceof Error ? error.message : String(error)).split("\n")[0]}`);
}
if (pkg.scripts?.["verify:mcp"] !== "npm --prefix packages/signature-mcp run build && node scripts/verify-mcp.mjs") {
  failures.push('(m2) root package.json scripts["verify:mcp"] must build the package + run scripts/verify-mcp.mjs — the smoke must be runnable');
}

// ---- (m3) data-testid wiring for the visual cortex -------------------------------
// 2.2.0 EVOLUTION: the four CARD hooks retired with the .hub__card section —
// the cards are the package's .sig-surface-card primitives now, and the
// cortex's stable card hook is the CLASS selector itself (the default sweep
// carries ".sig-surface-card"; pinned by the server.ts needles in (s2)'s
// compiled-dist check and the verify:mcp smoke's surface hits). What stays:
// the metric hooks (plus the 2.2.0 members row) and the primary toast button.
const TESTID_NEEDLES = [
  ['data-testid="metric-budget-remaining"', "the budget-remaining metric hook"],
  ['data-testid="metric-budget-spent"', "the budget-spent metric hook"],
  ['data-testid="metric-seats"', "the seats-confirmed metric hook (2.2.0)"],
  ['data-testid="metric-attendance"', "the attendance metric hook"],
  ['data-testid="btn-toast"', "the primary toast button hook"],
  ['data-testid="tabs-module"', "the 2.3.0 module-switcher hook"],
  ['data-testid="data-table-ledger"', "the 2.3.0 data-module ledger hook"],
  ['data-testid="kpi-trio"', "the 2.4.0 StatCard KPI trio hook"],
  ['data-testid="banner-release"', "the 2.4.0 announcement banner hook"],
  ['data-testid="carousel-clippings"', "the 2.4.0 palette clippings carousel hook"],
  ['data-testid="member-form"', "the 2.5.0 live allocation form hook (defect #5)"],
  ['data-testid="ledger-table"', "the 2.5.0 LIVE ledger hook (the bento's span-7 card)"],
  ['data-testid="ring-attendance"', "the 2.5.0 live attendance ring hook"],
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

// ---- (v35) THE CERTIFICATION GATE — 3.5.0 (NEW) -----------------------------------
// The ecosystem closer's own needles: the standalone MCP package (its
// manifest + the 4-tool source + the compiled dist), the certification
// scripts and their npm wiring, the CI workflow, and the 5 committed
// golden masters.
{
  const mcpSrcPath = resolve(root, "packages/signature-mcp/src/server.ts");
  if (!existsSync(mcpSrcPath)) {
    failures.push("(v35) packages/signature-mcp/src/server.ts is missing — the standalone Visual Cortex must live in the package");
  } else {
    const mcpSrc = readFileSync(mcpSrcPath, "utf8");
    for (const tool of ["inspect_layout", "audit_contrast", "audit_e1_shadows", "capture_viewport_matrix"]) {
      if (!mcpSrc.includes(`"${tool}"`)) {
        failures.push(`(v35) packages/signature-mcp/src/server.ts must register the "${tool}" tool — the 4-tool cortex`);
      }
    }
    for (const needle of ['name: "visual-cortex"', "StdioServerTransport", "npm run playground", "#1E1E2E", ".sig-surface-card, .sig-card, [data-elevation]"]) {
      if (!mcpSrc.includes(needle)) {
        failures.push(`(v35) packages/signature-mcp/src/server.ts must carry ${JSON.stringify(needle)} — the proven cortex anatomy (server name, stdio transport, the graceful hint, the documented bg assumption, the e1 sanction)`);
      }
    }
  }
  for (const script of ["scripts/verify-visual-diff.mjs", "scripts/verify-a11y.mjs"]) {
    if (!existsSync(resolve(root, script))) {
      failures.push(`(v35) ${script} is missing — the CI certification scripts must exist`);
    }
  }
  for (const wire of ["verify:visual-diff", "update:snapshots", "verify:a11y"]) {
    if (typeof pkg.scripts?.[wire] !== "string") {
      failures.push(`(v35) package.json scripts["${wire}"] is missing — the certification suite must be runnable`);
    }
  }
  if (typeof pkg.devDependencies?.pixelmatch !== "string" || typeof pkg.devDependencies?.pngjs !== "string") {
    failures.push("(v35) pixelmatch + pngjs must be devDependencies — the pixel-diff certification's compare engine");
  }
  const ciPath = resolve(root, ".github/workflows/ci.yml");
  if (!existsSync(ciPath)) {
    failures.push("(v35) .github/workflows/ci.yml is missing — the CI certification workflow must exist");
  } else {
    const ci = readFileSync(ciPath, "utf8");
    for (const needle of ["verify:mcp", "verify:a11y", "verify:visual-diff", "npx playwright install chromium", "continue-on-error: true"]) {
      if (!ci.includes(needle)) {
        failures.push(`(v35) ci.yml must wire ${JSON.stringify(needle)} — the browser-dependent suites need Chromium + the font-risk honesty`);
      }
    }
  }
  const goldensDir = resolve(root, "scripts/goldens");
  if (!existsSync(goldensDir)) {
    failures.push("(v35) scripts/goldens/ is missing — the committed golden masters must exist");
  } else {
    const goldens = readdirSync(goldensDir).filter((f) => f.endsWith(".png")).sort();
    // 3.6.0: the census grows 5 → 7 (graph-studio + analytics-planner join;
    // the owner-mandated re-certification regenerated all seven).
    // 3.7.0: motion-lab.png joins — the census is 8 (the Motion Lab view;
    // the nav gained an item, so ALL seven were re-certified too).
    const EXPECTED_GOLDENS = [
      "analytics-planner.png", "chronicle.png", "codex.png", "dashboard.png",
      "graph-studio.png", "master-index.png", "motion-lab.png", "pattern-studio.png",
      "templates.png", // joined 3.8.0 — the studio view's golden master
    ];
    if (JSON.stringify(goldens) !== JSON.stringify(EXPECTED_GOLDENS)) {
      failures.push(`(v35) scripts/goldens/ must carry EXACTLY the 8 golden masters (${EXPECTED_GOLDENS.join(", ")}), found ${goldens.length}: ${goldens.join(", ")}`);
    }
  }
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
  ["color-mix(in srgb, var(--bg-surface) 80%, transparent)", "the 80% translucent glass surface on .sig-timeline__header"],
  ["-webkit-backdrop-filter: blur(8px)", "the webkit-prefixed glass blur"],
  ["backdrop-filter: blur(8px)", "the glass blur behind the sticky header"],
];
for (const [needle, label] of GLASS_NEEDLES) {
  if (!timelineCss18.includes(needle)) {
    failures.push(`(g2) css/timeline.css must contain ${needle} — ${label}`);
  }
}
const nodeShadow = /\.sig-surface-card \.sig-timeline__node\s*\{[^}]*box-shadow: 0 4px 12px rgba\(0, 0, 0, 0\.2\);/s;
if (!nodeShadow.test(stylesCss)) {
  failures.push(
    "(g2) styles.css must carry the composition-layer node elevation — .sig-surface-card .sig-timeline__node { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); } (2.2.0: the ancestor is the package primitive)",
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
const breathingBars = /\.hub__metric \.sig-progress,\s*\.hub__metric \+ \.sig-progress\s*\{[^}]*margin-top: var\(--space-tight\);/s;
if (!breathingBars.test(stylesCss)) {
  failures.push(
    "(g3) the composition-scoped breathing-bars rule is missing — .hub__metric .sig-progress, .hub__metric + .sig-progress { margin-top: var(--space-tight); } (package viz.css untouched)",
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
const captionRule = /\.sig-progress__caption\s*\{[^}]*font-variant-numeric: tabular-nums;[^}]*color: var\(--text-muted\);[^}]*font-size: 0\.75rem;/s;
if (!captionRule.test(vizCss22)) {
  failures.push(
    "(s1) css/viz.css must carry the limit caption — .sig-progress__caption { font-variant-numeric: tabular-nums; color: var(--text-muted); font-size: 0.75rem; } (digits never jitter)",
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
const vizTrack = /\.sig-progress\s*\{[^}]*background: var\(--bg-inset\);[^}]*border: 1px solid color-mix\(in srgb, var\(--text-muted\) 20%, transparent\);/s;
if (!vizTrack.test(vizCss22)) {
  failures.push(
    "(v22) css/viz.css must retarget the track — .sig-progress { background: var(--bg-inset); border: 1px solid color-mix(in srgb, var(--text-muted) 20%, transparent); } (the surface-on-surface fix; the 100% boundary reads on any card)",
  );
}
const VIZ_TSX_REQUIREMENTS = [
  ["limitText", "the limit caption prop (ProgressBar)"],
  ["sig-progress__caption", "the caption class the third element wears"],
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
const headerAir = /\.hub__card--timeline \.sig-timeline__header\s*\{[^}]*padding-bottom: calc\(var\(--space-standard\) \+ var\(--space-tight\)\);/s;
if (!headerAir.test(stylesCss)) {
  failures.push(
    "(sp1) styles.css must grow the sticky slab — .hub__card--timeline .sig-timeline__header { padding-bottom: calc(var(--space-standard) + var(--space-tight)); }",
  );
}
const itemClearance = /\.hub__card--timeline \.sig-timeline__item--group-first\s*\{[^}]*padding-top: calc\(var\(--tl-header-clearance\) \+ var\(--space-standard\) \* 2\);/s;
if (!itemClearance.test(stylesCss)) {
  failures.push(
    "(sp1) styles.css must mirror the clearance into group-first ITEMS — padding-top: calc(var(--tl-header-clearance) + var(--space-standard) * 2) = 100px",
  );
}
const nodeClearance = /\.hub__card--timeline \.sig-timeline__node--group-first\s*\{[^}]*margin-top: calc\(var\(--tl-header-clearance\) \+ var\(--space-standard\) \* 2\);/s;
if (!nodeClearance.test(stylesCss)) {
  failures.push(
    "(sp1) styles.css must mirror the clearance into group-first NODES — margin-top: calc(var(--tl-header-clearance) + var(--space-standard) * 2) = 100px (siblings move together)",
  );
}

// ---- (ix1) THE VIEW SWITCHER — View type, HubLink, the 5-view nav map ----
// 2.8.0 AMENDMENT: the workshop placeholders (events/members/budget) died —
// the nav map is FIVE REAL views (dashboard/studio/index/chronicle/codex).
// The EmptyState dogfood needles retired with PlaceholderView (EmptyState
// still lives: the package TimelineManager edge + the Set 06 studio frame).
const INDEX_REQUIREMENTS = [
  [
    'type View =\n  | "dashboard"\n  | "graph"\n  | "planner"\n  | "motion"\n  | "studio"\n  | "templates"\n  | "index"\n  | "chronicle"\n  | "codex"',
    "the 3.8.0 nine-view union (the 8-view nav map + the memorial)",
  ],
  ['HREF_TO_VIEW[window.location.hash] ?? "dashboard"', 'the 3.4.0 deep-link bootstrap — hash first, dashboard default (the cortex smoke still finds the timeline on the bare root URL: empty hash → "dashboard")'],
  ["function HubLink(", "the playground's link renderer for GlobalNav's as prop"],
  ["onNavigate: (href: string) => void", "the navigation callback contract"],
  ["event.preventDefault()", "no full-reload anchor navigation (negative-test target)"],
  ["function createHubLink(", "the factory closure feeding onNavigate/activeHref through GlobalNav's as contract"],
  ["as={navLink}", "the nav renders through the HubLink factory"],
  ['{ href: VIEW_HREFS.dashboard, label: "Workbench" }', "the Workbench nav destination (3.6.0 — the 'Dashboard' label retires)"],
  ['{ href: VIEW_HREFS.graph, label: "Graph Studio" }', "the Graph Studio nav destination (3.6.0)"],
  ['{ href: VIEW_HREFS.planner, label: "Analytics & Planner" }', "the Analytics & Planner nav destination (3.6.0)"],
  ['{ href: VIEW_HREFS.motion, label: "Motion Lab" }', "the Motion Lab nav destination (3.7.0)"],
  ['{ href: VIEW_HREFS.studio, label: "Pattern Studio" }', "the Pattern Studio nav destination (2.8.0)"],
  ['{ href: VIEW_HREFS.index, label: "Index" }', "the Index nav destination"],
  ['{ href: VIEW_HREFS.codex, label: "AI Codex" }', "the AI Codex nav destination (2.8.0)"],
  ['"#/graph": "graph"', "the graph-studio routing entry (3.6.0)"],
  ['"#/planner": "planner"', "the analytics-planner routing entry (3.6.0)"],
  ['"#/index": "index"', "the index routing entry"],
  ['"#/chronicle": "chronicle"', "the chronicle routing entry (2.8.0 — hash + palette reachable, off the nav map since 3.6.0)"],
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
// 3.6.0 RETARGET: the doors are REAL now — WORKBENCH returns to the
// bento, GRAPH STUDIO enters the canvas (#/graph), STUDIO enters the
// catalog (#/studio); eyebrows WORKBENCH/GRAPH STUDIO/STUDIO; accents
// flamingo/lavender/peach through data-accent + --sig-accent.
const GATEWAYS = [
  ["WORKBENCH", "views/workbench.tsx", "Bento Workbench", "--color-cake-primary"],
  ["GRAPH STUDIO", "views/graph-studio.tsx", "The Graph Studio", "--sig-lavender"],
  ["STUDIO", "views/studio.tsx", "Pattern Studio", "--sig-peach"],
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
    [".sig-table-scroll", "the scroll-containment wrapper (the mobile strategy)"],
    ["overflow-x: auto", "the horizontal scroll containment"],
    ["text-transform: uppercase", "the uppercase ledger header"],
    ["letter-spacing: 0.1em", "the letter-spaced header"],
    ["font-variant-numeric: tabular-nums", "the tabular numeric cells (digits never jitter)"],
    ["color-mix(in srgb, var(--color-cake-primary) 8%, transparent)", "the subtle 8% Flamingo row hover wash"],
    ['[aria-selected="true"]', "THE tab active mechanism — the attribute IS the state (no .is-active class)"],
    ["background: var(--color-cake-primary)", "the Flamingo underline — the shared gliding indicator's ink (THE nav visual contract; 3.7.0 FLIP)"],
    [".sig-tabs-indicator", "the shared gliding tab indicator (3.7.0 — the per-tab border underline retired)"],
    ["transition: transform var(--dur-glide", "the indicator glides on transform ONLY (the e1 treaty; the FLIP play step)"],
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
  // 3.7.0 FLIP: the TELEPORTING per-tab underline must be GONE — no tab
  // rule may declare its own border-bottom underline (the shared
  // .sig-tabs-indicator is the only underline in the file; comment prose
  // may narrate the retirement, rule selectors may not resurrect it).
  const dataStripped = dataCss.replace(/\/\*[\s\S]*?\*\//g, "");
  if (/\.sig-tabs__tab[^{]*\{[^}]*border-bottom[^}]*\}/.test(dataStripped)) {
    failures.push(
      "(dd1) css/data.css declares a per-tab border-bottom underline — 3.7.0 retired it for the shared .sig-tabs-indicator (the FLIP glide)",
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
// BORDER (never box-shadow), the runtime --sig-* ring guard.
const formsCss23 = readFileSync(resolve(root, "css/forms.css"), "utf8");
const FORMS_23_REQUIREMENTS = [
  [".sig-select", "the justified chevron-anchor wrapper"],
  [".sig-select__native", "the native select wearing the token skin"],
  ["appearance: none", "the UA chrome stripped (select + checkbox)"],
  [".sig-select__chevron", "the token chevron"],
  ["pointer-events: none", "the chevron lets clicks fall through to the select"],
  [".sig-checkbox__input:checked", "the checked state machine"],
  [".sig-checkbox__input::after", "the checkmark as a pseudo-element (appearance-none inputs support pseudo-elements)"],
  ["border-right: 2px solid var(--color-on-cake)", "the checkmark ink — dark on-cake on the Teal fill"],
  [".sig-avatar", "the initials disc"],
  ["border-radius: 50%", "the avatar is a circle"],
];
for (const [needle, label] of FORMS_23_REQUIREMENTS) {
  if (!formsCss23.includes(needle)) {
    failures.push(`(dd3) css/forms.css must contain ${needle} — ${label}`);
  }
}
const checkedTeal = /\.sig-checkbox__input:checked\s*\{[^}]*background: var\(--color-cake-secondary\);/s;
if (!checkedTeal.test(formsCss23)) {
  failures.push(
    "(dd3) .sig-checkbox__input:checked must paint the Teal fill — background: var(--color-cake-secondary) (the aria-checked answer, echoed)",
  );
}
const formsSrc23 = readFileSync(resolve(root, "react/forms.tsx"), "utf8");
const FORMS_TSX_23_REQUIREMENTS = [
  ['name="ChevronDown"', 'the lucide chevron (gate-probed: "ChevronDown" exists in the installed icons map)'],
  ["ringStyle.border = `2px solid var(${ringToken})`", "the avatar ring drawn as an inline BORDER — never box-shadow (e1 doctrine)"],
  ['startsWith("--sig-")', "the runtime ring guard — structural tokens warn and render WITHOUT the ring"],
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
if (!systemPrompt.startsWith("# System Instruction: The Dynamic Signature Engine v4.1")) {
  failures.push(
    "SYSTEM_PROMPT.md title must move to The Dynamic Signature Engine v4.1 (3.9.0: the title steps to v4.1 with the kinetic-suite / graph-authoring / container-stage recipes — the 3.8.0 step to v4.0 carried the templates)",
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
  ["sig.workspace.v3.graph", "the codex pins the graph storage key"],
  ["sig.workspace.v3.timeline", "the codex pins the timeline storage key"],
  ["sig.workspace.v4.*", "the codex documents the key-bump migration contract"],
  ["signature-workspace.json", "the codex shows the snapshot filename"],
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
    [".sig-carousel__controls", "the docked control bar"],
    [".sig-carousel__stage", "the 3.6.0 page-deck host (paged mode has NO scroll track)"],
    [".sig-carousel__page", "the page grid"],
    ["grid-template-columns: repeat(3, minmax(0, 1fr))", "the 3-up page grid (minmax(0,1fr) — no overflow)"],
    ["align-items: stretch", "equal page-card heights (the owner grid contract)"],
    ["gap: var(--space-standard)", "the page's 16px internal gap"],
    [".sig-carousel__page[hidden]", "the hidden pages are display:none (display:grid would outrank the UA rule)"],
    ["@container (max-width: 640px)", "the narrow-cell page collapse"],
    [".sig-carousel__indicator", "the bar-docked readout"],
    [".sig-carousel__dots", "the dots (docked in the bar)"],
  ];
  for (const [needle, label] of CAR3_CSS) {
    if (!editorialCss30.includes(needle)) {
      failures.push(`(car3) css/editorial.css must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  const controlsRow = /\.sig-carousel__controls\s*\{[^}]*display: flex;[^}]*align-items: center;/s;
  if (!controlsRow.test(editorialCss30)) {
    failures.push(
      "(car3) .sig-carousel__controls must be the flex control bar (prev · dots · indicator · next)",
    );
  }
  const pageGrid = /\.sig-carousel__page\s*\{[^}]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);[^}]*align-items: stretch;/s;
  if (!pageGrid.test(editorialCss30)) {
    failures.push(
      "(car3) .sig-carousel__page must be the repeat(3, minmax(0,1fr)) + stretch grid — a TRUE 3-per-page grid (3.6.0)",
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
  ['title="Member & Budget Ledger"', "the ledger card title"],
  ['title="The Input Matrix"', "the matrix card title"],
  ['member: "Ana Souza"', "ledger row 1"],
  ['member: "Leo Martins"', "ledger row 2"],
  ['member: "Priya Nair"', "ledger row 3"],
  ['member: "Tom Weller"', "ledger row 4"],
  ['member: "Nina Almeida"', "ledger row 5"],
  ['colorToken="--sig-green" label="Confirmed"', "the composed SigBadge status cell"],
  ['<Callout status="info">', "the info callout"],
  ['<Callout status="success">', "the success callout"],
  ['<Callout status="warning">', "the warning callout"],
  ["<Avatar name={person.name}", "the avatar crew (rendered from AVATAR_CREW)"],
  ['ringToken: "--sig-mauve-soft"', "crew ring 1 (chromatic token)"],
  ['ringToken: "--sig-sky"', "crew ring 2 (chromatic token)"],
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
// 2.5.0 AMENDMENT: the sweep grows .sig-btn / .sig-stat-card / .sig-shell
// and the server version moves to 2.5.0.
// 3.4.0 AMENDMENT: the sweep grows the ZERO-REACT SURFACE — the six sig-*
// custom element tags join (the studio mounts them; the cortex must see
// them) and the server version moves to 3.4.0.
// 3.5.0 AMENDMENT: the needles RETARGET to the standalone package —
// packages/signature-mcp/src/server.ts carries the SAME sweep (verbatim
// port) and the server version string moves to 3.5.0.
const mcpServerSrc = readFileSync(resolve(root, "packages/signature-mcp/src/server.ts"), "utf8");
for (const selector of [".sig-data-table", ".sig-tabs__tab", ".sig-callout", ".sig-surface-card", ".sig-btn", ".sig-stat-card", ".sig-shell", ".sig-carousel__dot", ".sig-chronicle__item", ".sig-graph__node", ".sig-bars__bar", ".sig-tmanager__count", "sig-surface-card", "sig-badge", "sig-progress-bar", "sig-stat-ring", "sig-callout", "sig-carousel"]) {
  if (!mcpServerSrc.includes(`"${selector}"`)) {
    failures.push(
      `packages/signature-mcp/src/server.ts DEFAULT_SELECTORS must carry "${selector}" — the cortex sweep measures the data module + the bento + the master index + the Graphs & Planner module (2.7.0: graph nodes, bar ink, milestone counter; 3.4.0: the six zero-react custom elements; 3.5.0: the verbatim port)`,
    );
  }
}
if (!mcpServerSrc.includes('version: "3.5.0"')) {
  failures.push(
    'packages/signature-mcp/src/server.ts server version string must be 3.5.0 (the standalone-promotion bump; the sweep ports verbatim)',
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
    [".sig-carousel__track::-webkit-scrollbar", "the webkit scrollbar kill"],
    [".sig-carousel__item", "the item slot (flex 0 0 auto)"],
    ["flex: 0 0 auto", "items keep content width"],
    // 2.6.0: the dot indicators.
    [".sig-carousel__dots", "the dots row (one button per child)"],
    [".sig-carousel__dot[data-active=\"true\"]", "the attribute IS the active-dot state"],
    ["width: 1.5rem", "the active Flamingo pill"],
    ["width: 0.375rem", "the resting dot circle"],
    [".sig-prose blockquote", "the prose blockquote anatomy"],
    ["border-left: 4px solid var(--sig-mauve)", "the MAUVE quote rule (2.4.1 owner override — the quote is editorial content, the content voice; was v2.4.0's Flamingo)"],
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
  [".sig-form-field", "the accessible wrapper root (the __field contract: flex column + tight gap)"],
  [".sig-form-field__label", "the label element"],
  [".sig-form-field__hint", "the muted hint slot"],
  [".sig-form-field__error", "the error slot"],
  [".sig-radio-cards", "the radiogroup container"],
  ["repeat(auto-fit, minmax(140px, 1fr))", "the responsive card grid"],
  [".sig-radio-card__input", "the visually hidden native radio"],
  ["position: absolute", "the input's hiding mechanism (with opacity: 0)"],
  [".sig-radio-card:has(input:focus-visible)", "THE :has() focus ring — the keyboard focus lands on the hidden input, the CARD rings"],
  [".sig-radio-card:has(input:checked)", "the selected state machine — the attribute IS the state"],
  [".sig-radio-card.sig-radio-card--selected", "the selected class mirror (consumer convenience, specificity-safe vs :hover)"],
  ["background: var(--bg-surface)", "the selected card LIFTS to --bg-surface (2.4.1 owner override of the 10% cake tint — a surface read over the inset siblings)"],
  ["var(--sig-peach)", "the error message token (the v1.4.0 doctrine, message slot)"],
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
const selectedFlamingo = /\.sig-radio-card\.sig-radio-card--selected,\s*\.sig-radio-card:has\(input:checked\)\s*\{[^}]*border-color: var\(--color-cake-primary\);[^}]*border-width: 2px;/s;
if (!selectedFlamingo.test(formsCss24)) {
  failures.push(
    "(ed3) the radio selected contract must paint the 2px Flamingo border — .sig-radio-card--selected / :has(input:checked) → border-color: var(--color-cake-primary) + border-width: 2px",
  );
}
const focusRing = /\.sig-radio-card:has\(input:focus-visible\)\s*\{[^}]*outline: 2px solid var\(--color-cake-primary\);/s;
if (!focusRing.test(formsCss24)) {
  failures.push(
    "(ed3) the :has() focus ring must be the doctrine ring — .sig-radio-card:has(input:focus-visible) → outline: 2px solid var(--color-cake-primary)",
  );
}
const formsSrc24 = readFileSync(resolve(root, "react/forms.tsx"), "utf8");
const FORMS_TSX_24_REQUIREMENTS = [
  ['role="radiogroup"', "the radiogroup role"],
  ["aria-label={label}", "the radiogroup accessible name"],
  ['className="sig-form-field__error" role="alert"', 'the error slot announces itself (role="alert")'],
  ["sig-radio-card--selected", "the selected class mirror on the card label"],
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
  [".sig-stat-card", "the KPI card"],
  ["font-variant-numeric: tabular-nums", "the value's tabular digits (never jitter)"],
  ["text-transform: uppercase", "the label's uppercase caption"],
  ["letter-spacing: 0.1em", "the label's tracking"],
  ["font-size: 1.5rem", "the value's headline size"],
  [".sig-stat-card__delta--up", "the up delta (sig-green via the modifier)"],
  [".sig-stat-card__delta--down", "the down delta (sig-peach via the modifier)"],
];
for (const [needle, label] of VIZ_CSS_24_REQUIREMENTS) {
  if (!vizCss24.includes(needle)) {
    failures.push(`(ed4) css/viz.css must contain ${needle} — ${label}`);
  }
}
// StatCard FLATNESS: the stat-card rule block must carry NO box-shadow
// (belt-and-braces with the (e1) css/-wide scan — this one names the class).
const statCardBlock = vizCss24.match(/\.sig-stat-card\s*\{[^}]*\}/s);
if (statCardBlock === null) {
  failures.push("(ed4) css/viz.css has no parseable .sig-stat-card rule block");
} else if (/box-shadow/.test(statCardBlock[0])) {
  failures.push(
    "(ed4) .sig-stat-card mentions box-shadow — the KPI card is FLAT (surface + hairline, the e1 doctrine)",
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
// 2.5.0 AMENDMENT: the needles re-aim at the bento — Region Code +
// descriptions-above + validMessage + PasswordInput + the archetypes +
// the v2.5.0 banner copy; every attendance card carries a description.
const SHOWCASE_REQUIREMENTS = [
  ["<FormField", "the accessible wrapper in the matrix"],
  ['label="Member Name"', "the Member Name field"],
  ['label="Allocation"', "the Allocation field (2.4.1 — the dollar sign moved OUT of the label)"],
  ['prefix="$"', "the 2.4.1 prefix adornment on the money field"],
  ['label="Region Code"', "the 2.5.0 Region Code field (both modules)"],
  ['description="5 numbers only · e.g., 79901"', "the format rule ABOVE the input (defect #2)"],
  ['description="Numbers only · e.g., 120"', "the money field's format rule"],
  ["validMessage={postalValid", "the live-validation success slot"],
  ['htmlFor="matrix-name"', "the consumer-wired label association (field 1)"],
  ['htmlFor="matrix-share"', "the consumer-wired label association (field 2)"],
  ["hint=\"As it appears on the roster\"", "the hint slot demoed"],
  ["<PasswordInput", "the 2.5.0 password well (meter + pills)"],
  ["<RadioCardGroup", "the card radios in the matrix"],
  ['name="attendance"', "the radio group name"],
  ['{ value: "confirmed", label: "Confirmed", description: "Seat allocated this sprint" }', "attendance option 1 (with description)"],
  ['{ value: "pending", label: "Pending", description: "Awaiting capacity review" }', "attendance option 2 — descriptions ENFORCED (2.5.0)"],
  ['{ value: "declined", label: "Declined", description: "No seat this cycle" }', "attendance option 3 — descriptions ENFORCED (2.5.0)"],
  ["<AnnouncementBanner", "the banner at the top of the bento"],
  ['variant="announcement"', "the 2.4.1 variant API (Flamingo banner default)"],
  ['label: "See what shipped"', "the 2.4.1 action slot demoed"],
  ["live state mode: allocate a seat and watch", "the v2.5.0 banner copy"],
  ["<StatCard", "the KPI trio"],
  ['label="Total Budget"', "KPI 1"],
  ['label="Confirmed Seats"', "KPI 2"],
  ['label="Active Game Rooms"', "KPI 3"],
  ['colorToken="--sig-green"', "KPI 1 sparkline token"],
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
  ['label="Add to build rotation"', "the visible switch label exercised (defect #3)"],
  ["ToggleSwitch", "the switch renders in the matrix + the check-in"],
];
for (const [needle, label] of SHOWCASE_REQUIREMENTS) {
  if (!appSrc.includes(needle)) {
    failures.push(`(showcase) App.tsx must contain ${JSON.stringify(needle)} — ${label}`);
  }
}

// ---- (af1) INTUITIVE ANATOMY I — the DataTable align fix (2.4.1) -------------------
// The bug: `numeric` right-aligned the CELLS but the HEADER stayed left —
// `.sig-data-table thead th` (specificity 0,1,2) outranks the bare
// .sig-data-table__num class (0,1,0). The fix: DataTableColumn.align flows to
// BOTH th and td through ancestor-scoped .sig-data-table__align-* utilities
// (0,2,0 — back on top), composing with __num (align = geometry, numeric =
// tabular digits). css/data.css owns the paint (class-based, gate-able);
// react/data.tsx applies per column; the compiled .d.ts carries the prop.
const dataCssAf = readFileSync(resolve(root, "css/data.css"), "utf8");
const dataSrcAf = readFileSync(resolve(root, "react/data.tsx"), "utf8");
const dataDtsAf = readFileSync(resolve(root, "react/data.d.ts"), "utf8");
for (const [needle, label] of [
  [".sig-data-table__align-left", "the left alignment utility"],
  [".sig-data-table__align-center", "the center alignment utility"],
  [".sig-data-table__align-right", "the right alignment utility"],
]) {
  if (!dataCssAf.includes(needle)) {
    failures.push(`(af1) css/data.css must contain ${needle} — ${label}`);
  }
}
for (const [side, value] of [["left", "left"], ["center", "center"], ["right", "right"]]) {
  const rule = new RegExp(
    `\\.sig-data-table \\.sig-data-table__align-${side}\\s*\\{[^}]*text-align: ${value};`,
    "s",
  );
  if (!rule.test(dataCssAf)) {
    failures.push(
      `(af1) css/data.css must scope .sig-data-table__align-${side} under .sig-data-table with text-align: ${value} — the ancestor prefix (0,2,0) is the specificity fix that beats .sig-data-table thead th (0,1,2); a bare class would LOSE and the header would stay left (the bug itself)`,
    );
  }
}
if (!dataSrcAf.includes('align?: "left" | "right" | "center"')) {
  failures.push(
    '(af1) react/data.tsx must declare align?: "left" | "right" | "center" on DataTableColumn',
  );
}
if (!dataSrcAf.includes("`sig-data-table__align-${column.align}`")) {
  failures.push(
    "(af1) react/data.tsx must derive the .sig-data-table__align-* class from column.align",
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
// selector .sig-switch → .sig-switch__pill with the label as visible text,
// and the selected radio card lifts to var(--bg-surface).
const formsCssAf = readFileSync(resolve(root, "css/forms.css"), "utf8");
const formsSrcAf = readFileSync(resolve(root, "react/forms.tsx"), "utf8");
const formsDtsAf = readFileSync(resolve(root, "react/forms.d.ts"), "utf8");
// 2.5.0 AMENDMENT: the 2.4.1 __row/__prefix needles RETIRED — the
// adornment composition is the __well/__chip now (the contract lives in
// gate ff1 below). __required, the switch migration and the radio lift
// stay pinned here.
for (const [needle, label] of [
  [".sig-form-field__required", "the peach required asterisk slot"],
  [".sig-switch", "the switch wrapper (pill + visible text composition)"],
  [".sig-switch__pill", "the migrated pill (every pill selector renamed)"],
  [".sig-switch__text", "the visible label text"],
]) {
  if (!formsCssAf.includes(needle)) {
    failures.push(`(af2) css/forms.css must contain ${needle} — ${label}`);
  }
}
const rowRule = /\.sig-form-field__well\s*\{[^}]*display: flex;[^}]*align-items: center;/s;
if (!rowRule.test(formsCssAf)) {
  failures.push(
    "(af2) .sig-form-field__well must be flex + align-items: center (the 2.5.0 successor of the justified adornment wrapper)",
  );
}
const prefixRule = /\.sig-form-field__chip\s*\{[^}]*var\(--font-mono,[^}]*font-weight: 600;/s;
if (!prefixRule.test(formsCssAf)) {
  failures.push(
    "(af2) .sig-form-field__chip must be mono + weight 600 (the adornment voice)",
  );
}
const requiredRule = /\.sig-form-field__required\s*\{[^}]*color: var\(--sig-peach\);/s;
if (!requiredRule.test(formsCssAf)) {
  failures.push(
    "(af2) .sig-form-field__required must paint the peach asterisk — color: var(--sig-peach) (the v1.4.0 attention token)",
  );
}
const switchWrapper = /\.sig-switch\s*\{[^}]*display: inline-flex;[^}]*align-items: center;/s;
if (!switchWrapper.test(formsCssAf)) {
  failures.push(
    "(af2) .sig-switch must now be the inline-flex wrapper (pill + visible text) — the JUSTIFIED composition, commented in css",
  );
}
const switchText = /\.sig-switch__text\s*\{[^}]*color: var\(--text-main\);[^}]*font-size: 0\.875rem;[^}]*font-weight: 500;/s;
if (!switchText.test(formsCssAf)) {
  failures.push(
    "(af2) .sig-switch__text must be text-main 0.875rem weight 500 (the visible label contract)",
  );
}
const wrapperBlock = formsCssAf.match(/(?:^|\n)\s*\.sig-switch\s*\{([^}]*)\}/s);
if (wrapperBlock === null || wrapperBlock[1].includes("border-radius: 999px")) {
  failures.push(
    "(af2) the bare .sig-switch block must NOT be the pill anymore (no 999px radius) — every pill property migrated to .sig-switch__pill",
  );
}
// The attribute scan runs on comment-stripped text: prose may EXPLAIN the
// state machine (the header's geometry comment quotes the selector), only
// rule selectors may carry it.
if (/\[aria-checked="true"\]/.test(formsCssAf.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\.sig-switch__pill\[aria-checked="true"\]/g, ""))) {
  failures.push(
    '(af2) an [aria-checked="true"] selector remains OUTSIDE .sig-switch__pill — the state machine must live on the migrated pill only',
  );
}
if (!formsCssAf.includes(".sig-switch__pill,\n    .sig-switch__pill::before,")) {
  failures.push(
    "(af2) the reduced-motion guard must follow the migration — .sig-switch__pill / .sig-switch__pill::before in the prefers-reduced-motion list",
  );
}
const radioLift = /\.sig-radio-card\.sig-radio-card--selected,\s*\.sig-radio-card:has\(input:checked\)\s*\{[^}]*border-color: var\(--color-cake-primary\);[^}]*border-width: 2px;[^}]*background: var\(--bg-surface\);/s;
if (!radioLift.test(formsCssAf)) {
  failures.push(
    "(af2) the selected radio card must KEEP the 2px Flamingo border AND lift to background: var(--bg-surface) (2.4.1 owner override of the cake tint)",
  );
}
for (const [needle, label] of [
  ["required?: boolean", "the FormField required prop"],
  ["prefix?: string", "the FormField prefix prop"],
  ['className="sig-form-field__well"', "the well wraps children ONLY when prefix/suffix is present"],
  ['className="sig-form-field__chip"', "the chip renders as the adornment (prefix before, suffix after)"],
  ['className="sig-form-field__required"', "the asterisk span on the label"],
  ['aria-hidden="true"', "the asterisk is VISUAL — screen readers get aria-required from the control, never from the wrapper"],
  ['className="sig-switch"', "the justified switch wrapper"],
  ['className="sig-switch__pill"', "the pill class (migrated)"],
  ['className="sig-switch__text"', "the visible label span (NOT aria-hidden — visible text)"],
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
  [".sig-carousel__indicator", "the page indicator class"],
  [".sig-prose h3", "the h3 sub-section voice"],
  [".sig-prose kbd", "kbd joins the inline-code chip"],
  [".sig-announcement__action", "the ghost action button"],
]) {
  if (!editorialCssAf.includes(needle)) {
    failures.push(`(af3) css/editorial.css must contain ${needle} — ${label}`);
  }
}
const indicatorRule = /\.sig-carousel__indicator\s*\{[^}]*font-variant-numeric: tabular-nums;[^}]*color: var\(--text-muted\);/s;
if (!indicatorRule.test(editorialCssAf)) {
  failures.push(
    "(af3) .sig-carousel__indicator must be tabular-nums muted (the position readout is metadata, not a headline)",
  );
}
const kbdRule = /\.sig-prose code,\s*\n\.sig-prose kbd\s*\{[^}]*background: var\(--bg-inset\);[^}]*border-radius: 0\.25rem;[^}]*padding: 0\.125rem 0\.375rem;[^}]*font-size: 0\.8125rem;[^}]*color: var\(--text-bright\);/s;
if (!kbdRule.test(editorialCssAf)) {
  failures.push(
    "(af3) .sig-prose code/kbd must carry the inline chip contract — inset body, 0.25rem radius, 0.125rem × 0.375rem padding, 0.8125rem, --text-bright",
  );
}
const proseH3Block = editorialCssAf.match(/\.sig-prose h3\s*\{([^}]*)\}/s);
if (
  proseH3Block === null ||
  !/\bfont-size: 0\.9375rem;/.test(proseH3Block[1]) ||
  !/\bfont-weight: 600;/.test(proseH3Block[1]) ||
  !/\bcolor: var\(--text-main\);/.test(proseH3Block[1])
) {
  failures.push(
    "(af3) .sig-prose h3 must be 0.9375rem weight 600 text-main (the ensured sub-section styles)",
  );
}
const actionHover = /\.sig-announcement__action:hover\s*\{[^}]*border-color: var\(--color-cake-secondary\);/s;
if (!actionHover.test(editorialCssAf)) {
  failures.push(
    "(af3) .sig-announcement__action:hover must answer with the Teal border (token-driven ghost button)",
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
  ['className="sig-announcement__action"', "the ghost action button render"],
  ["aria-live=\"polite\"", "the indicator announces page turns politely"],
  // 3.0.0 (car3) AMENDMENT: the owner-spec'd scrollLeft/itemWidth formula is
  // REPLACED by the IntersectionObserver sync (free-scroll) + the page math
  // (paged-3). The rAF throttle + onScroll needles survive (the paged mode's
  // page sync still rides one state write per frame).
  ["mode?: \"paged-3\" | \"free-scroll\"", "the 3.0.0 mode prop (default free-scroll)"],
  ["IntersectionObserver", "the free-scroll active-index sync (majority-visible wins)"],
  ["ratio >= 0.5", "the majority-visible threshold"],
  ["observer.disconnect()", "the IO cleanup on unmount"],
  // 3.6.0 AMENDMENT: the paged mode is a STATEFUL PAGE DECK — the
  // scroll-track math retired with the scroll-based pages; the page
  // index state + the inert sweep replace them.
  ["Math.ceil(items.length / 3)", "the pure page-count math (pages of three)"],
  ["const current = Math.min(page, pageCount)", "the clamped current page (deck shrink-safe)"],
  ["el.inert = !isCurrent", "the inert sweep — off-screen pages leave the tab order (React-18 ref workaround)"],
  ["hidden={!isCurrent}", "exactly ONE page visible"],
  ['`Page ${current} of ${pageCount}`', "the paged indicator reads 'Page p of P'"],
  ["goToPage(current + 1)", "the bounded Next step"],
  ["ArrowRight", "the keyboard page flip"],
  ['"sig-carousel__controls"', "the docked control bar (prev · dots · indicator · next)"],
  ['"sig-carousel__page"', "the paged-3 page grid"],
  ['"sig-carousel__stage"', "the page-deck host"],
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
  ["--sig-mauve", "the codex documents the mauve quote bar"],
  ["### <Carousel>", "the Carousel recipe exists"],
  ["indicator", "the codex documents the page indicator"],
  // 2.5.0 — the v2.8 codex recipes.
  ["### <Button>", "the Button recipe exists (2.5.0)"],
  ["--sig-yellow", "the codex documents the meter's Fair stage token"],
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
// the control in the .sig-form-field__helpers slot (the a11y survival
// is programmatic: aria-describedby). The validation zone still renders
// after everything.
const descIdx = formFieldSrc.indexOf('className="sig-form-field__desc"');
const controlRenderIdx = formFieldSrc.indexOf("{control}");
const wellDefIdx = formFieldSrc.indexOf('className="sig-form-field__well"');
const alertIdx = formFieldSrc.indexOf('className="sig-form-field__error" role="alert"');
const validIdx = formFieldSrc.indexOf('className="sig-form-field__valid"');
if (descIdx === -1 || controlRenderIdx === -1 || descIdx < controlRenderIdx) {
  failures.push(
    "(ff1, 3.0.0 amendment) FormField must render .sig-form-field__desc in the HELPERS slot AFTER the control zone — the owner's v3.0.0 reversal of the 2.5.0 desc-above anatomy (helpers below the well)",
  );
}
if (wellDefIdx === -1 || alertIdx === -1 || controlRenderIdx > alertIdx) {
  failures.push(
    "(ff1) FormField must render the validation zone AFTER the control zone — label row → control → helpers → error/valid",
  );
}
if (validIdx === -1) {
  failures.push('(ff1) FormField must render the .sig-form-field__valid slot (the validMessage line)');
}
for (const [needle, label] of [
  ["description?: string", "the description prop (format rules ABOVE the input)"],
  ["validMessage?: string", "the validMessage prop (the live-validation success line)"],
  ["suffix?: string", "the suffix prop (the right chip)"],
  ['data-invalid={!!error || undefined}', "the well's error attribute drives the shake + peach border"],
  ['className="sig-form-field__chip sig-form-field__chip--right"', "the suffix chip carries the right modifier"],
]) {
  if (!formsSrcAf.includes(needle)) {
    failures.push(`react/forms.tsx must contain ${JSON.stringify(needle)} — (ff1) ${label}`);
  }
}
for (const [needle, label] of [
  [".sig-form-field__desc", "the format-line slot (muted 0.75rem, ABOVE the control)"],
  [".sig-form-field__valid", "the success line slot (sig-green)"],
  [".sig-form-field__well:focus-within", "the well OWNS the focus treatment"],
  [".sig-form-field__well > .sig-input,\n  .sig-form-field__well > input", "the scoped kill — prefix/suffix children must be BARE inputs"],
  [".sig-form-field__chip:first-child", "the LEFT chip's cursor-side hairline (border-right)"],
  ["@keyframes sig-shake", "the error shake keyframes"],
  ["animation: sig-shake 0.3s ease-out", "the shake rides [data-invalid]"],
]) {
  if (!formsCssAf.includes(needle)) {
    failures.push(`css/forms.css must contain ${JSON.stringify(needle)} — (ff1) ${label}`);
  }
}
const promotedLabel = /\.sig-form-field__label\s*\{[^}]*color: var\(--text-main\);[^}]*font-size: 0\.875rem;[^}]*font-weight: 500;/s;
if (!promotedLabel.test(formsCssAf)) {
  failures.push(
    "(ff1) the field label is PROMOTED — .sig-form-field__label { color: var(--text-main); font-size: 0.875rem; font-weight: 500; } (the title is the headline, not a caption)",
  );
}
const wellFocus = /\.sig-form-field__well:focus-within\s*\{[^}]*border-color: var\(--color-cake-primary\);[^}]*outline: 3px solid color-mix\(in srgb, var\(--color-cake-primary\) 25%, transparent\);/s;
if (!wellFocus.test(formsCssAf)) {
  failures.push(
    "(ff1) the well focus halo — border-color Flamingo + the 3px translucent Flamingo OUTLINE (the box-shadow spelling is banned by the frozen (f1) gate; documented decision)",
  );
}
const shakeKill = /@media \(prefers-reduced-motion: reduce\)\s*\{[^@]*\.sig-form-field__well\[data-invalid\]\s*\{[^}]*animation: none;/s;
if (!shakeKill.test(formsCssAf)) {
  failures.push(
    "(ff1) the reduced-motion guard must kill the shake — .sig-form-field__well[data-invalid] { animation: none; } inside prefers-reduced-motion",
  );
}

// ---- (ff2) SYMMETRICAL FORMS (3.0.0) ----------------------------------------------
// The label rail (fixed 20px), the helpers-below slot (20px), the pure-CSS
// info tooltip (hover + focus-visible), and the aria-describedby preservation.
{
  const formsCss30 = formsCssAf;
  const FF2_CSS = [
    [".sig-form-field__label-row", "the label alignment row"],
    [".sig-form-field__info", "the tooltip trigger button"],
    ["content: attr(data-tooltip)", "the pure-CSS bubble text"],
    [".sig-form-field__info:hover::after,\n  .sig-form-field__info:focus-visible::after", "hover AND keyboard focus reveal the tooltip"],
    [".sig-form-field__helpers", "the helpers slot (description + hint below the well)"],
  ];
  for (const [needle, label] of FF2_CSS) {
    if (!formsCss30.includes(needle)) {
      failures.push(`(ff2) css/forms.css must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  const labelRail = /\.sig-form-field__label-row\s*\{[^}]*min-height: 1\.25rem;/s;
  if (!labelRail.test(formsCss30)) {
    failures.push(
      "(ff2) the label row must carry the fixed 1.25rem (20px) min-height — every side-by-side field's label aligns on the same baseline",
    );
  }
  const helpersRail = /\.sig-form-field__helpers\s*\{[^}]*min-height: 1\.25rem;[^}]*display: flex;[^}]*flex-wrap: wrap;[^}]*gap: var\(--space-tight\);/s;
  if (!helpersRail.test(formsCss30)) {
    failures.push(
      "(ff2) .sig-form-field__helpers must be min-height 20px + flex wrap + the tight gap — the bottom rail of the symmetrical field",
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
    ['className="sig-form-field__label-row"', "the label row renders"],
    ['className="sig-form-field__helpers"', "the helpers slot renders"],
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
  [".sig-password__meter", "the meter"],
  [".sig-password__meter span", "the four segments"],
  ['[data-score="1"] span:nth-child(1)', "stage 1 — peach"],
  ['[data-score="2"] span:nth-child(-n + 2)', "stage 2 — the --sig-yellow release token"],
  ['[data-score="3"] span:nth-child(-n + 3)', "stage 3 — sky"],
  ['[data-score="4"] span:nth-child(-n + 4)', "stage 4 — green"],
  [".sig-password__stage", "the stage label"],
  [".sig-password__pill", "the condition pills"],
  [".sig-password__pill[data-satisfied]", "the satisfied pill fill"],
  [".sig-password__toggle", "the eye button"],
  ["color-mix(in srgb, var(--sig-green) 20%, transparent)", "the satisfied pill's wash"],
]) {
  if (!formsCssAf.includes(needle)) {
    failures.push(`css/forms.css must contain ${JSON.stringify(needle)} — (pw1) ${label}`);
  }
}
const yellowStage = /\[data-score="2"\] span:nth-child\(-n \+ 2\)\s*\{[^}]*background: var\(--sig-yellow\);/s;
if (!yellowStage.test(formsCssAf)) {
  failures.push(
    '(pw1) the meter\'s stage 2 must fill with the release token — [data-score="2"] span:nth-child(-n + 2) { background: var(--sig-yellow); }',
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
    [".sig-btn--primary", "the Flamingo fill variant"],
    [".sig-btn--secondary", "the surface + hairline variant"],
    [".sig-btn--ghost", "the transparent variant"],
    [".sig-btn--danger", "the peach attention variant"],
    [".sig-btn--sm", "the small size"],
    [".sig-btn--lg", "the large size"],
    [".sig-btn__spinner", "the loading spinner"],
    ["@keyframes sig-spin", "the spin physics"],
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
  ['className="sig-btn__spinner"', "the spinner replaces the icons"],
  ["aria-busy={loading || undefined}", "the busy attribute"],
  ["disabled={loading || disabled}", "a loading button cannot be re-submitted"],
  ['className={`sig-btn sig-btn--${variant}${sizeClass}', "ONE button with the composed classes"],
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
    [".sig-accordion[open] .sig-accordion__chevron", "the attribute IS the state — details[open] rotates the chevron"],
    ["grid-template-columns: 1fr auto 1fr", "the matchup grid"],
    [".sig-action-tile__kbd", "the standalone shortcut chip"],
    [".sig-flip-card[aria-pressed=\"true\"]", "the flip state rides aria-pressed"],
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
  ['className="sig-flip-card"', "the flip root"],
  ['<details className="sig-accordion">', "the ZERO-JS accordion"],
  ['className="sig-accordion__summary"', "the summary line"],
  ['<Icon name="ChevronDown" className="sig-accordion__chevron"', "the token chevron"],
  ["size={40}", "the matchup avatars ride the grid-perfect diameter"],
  ['className="sig-matchup__vs"', "the VS pill"],
  ['className="sig-matchup__stakes"', "the stakes footer"],
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
// floor on .sig-flip-card / .sig-accordion / .sig-matchup; the ActionTile
// well tints 12% from --sig-accent (Teal fallback); [data-accent] cards wear
// the 45% translucent chromatic border-top. Shadow policy unchanged:
// cards.css stays ABSOLUTE ZERO (belt-and-braces with (cd1)/(e1)).
{
  const cardsCss30 = readFileSync(resolve(root, "css/cards.css"), "utf8");
  for (const archetype of [".sig-flip-card", ".sig-accordion", ".sig-matchup"]) {
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
  const wellTint = /\.sig-action-tile__well\s*\{[^}]*background: color-mix\(in srgb, var\(--sig-accent, var\(--color-cake-secondary\)\) 12%, transparent\);/s;
  if (!wellTint.test(cardsCss30)) {
    failures.push(
      "(par) .sig-action-tile__well must tint 12% — background: color-mix(in srgb, var(--sig-accent, var(--color-cake-secondary)) 12%, transparent)",
    );
  }
  if (!cardsCss30.includes("[data-accent] .sig-flip-card,\n  [data-accent] .sig-accordion,\n  [data-accent] .sig-matchup")) {
    failures.push(
      "(par) the [data-accent] chromatic top-accent rule must cover all three archetypes",
    );
  }
  const topAccent = /\[data-accent\] \.sig-flip-card,\s*\n\s*\[data-accent\] \.sig-accordion,\s*\n\s*\[data-accent\] \.sig-matchup\s*\{[^}]*border-top: 2px solid color-mix\(in srgb, var\(--sig-accent\) 45%, transparent\);/s;
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
  if (!colSlice.includes('{ key: "share", header: "Allocation", numeric: true, align: "right" }')) {
    failures.push(
      '(al1) BENTO_LEDGER_COLUMNS must set { key: "share", header: "Allocation", numeric: true, align: "right" } — the header flushes over the live $ values',
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
// types: SigColorToken (the 26 --sig-* tokens) + AccentToken (chromatic +
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
  ["export type SigColorToken = SigTokenName", "the 11-token content accent alias"],
  ['export type StructuralAccentToken = "--color-cake-primary" | "--color-cake-secondary"', "the two structural accents"],
  ["export type AccentToken = SigColorToken | StructuralAccentToken", "the full accent union"],
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
for (const typeName of ["SigColorToken", "StructuralAccentToken", "AccentToken", "SurfaceElevation"]) {
  if (!new RegExp(`\\b${typeName}\\b`).test(surfaceDts26)) {
    failures.push(`react/surface.d.ts must export ${typeName} — (acc1) the compiled contract`);
  }
  if (!new RegExp(`\\b${typeName}\\b`).test(umbrellaDts)) {
    failures.push(`react/index.d.ts must re-export ${typeName} — (acc1)`);
  }
}
if (!/SigColorToken/.test(cardsDtsPath ? readFileSync(cardsDtsPath, "utf8") : "")) {
  failures.push("(acc1) react/cards.d.ts must consume SigColorToken — the archetypes are accent-typed");
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
// SigColorToken's union resolves through Extract<KnownToken,
// `--sig-${string}`> — the ThemeProvider whitelist IS the union, so the
// sweep pins the whitelist to EXACTLY the 11 names and checks the alias
// exists in the compiled surface.d.ts. (verify-playground has no running
// whitelist parse of its own — the TOKEN_KEYS array is parsed here, the
// same way the frozen scripts/verify.mjs reads it.)
// 3.0.0: the sweep pins the whitelist to EXACTLY the 26 --sig-* names
// (the 10 legacy + cobalt [blue retired, value carried] + the 15
// chromatic fills) and checks the alias exists in the compiled
// surface.d.ts.
const EXPECTED_SIG_26 = [
  "--sig-pink-bright",
  "--sig-pink-soft",
  "--sig-pink-alt",
  "--sig-mauve-bright",
  "--sig-mauve-soft",
  "--sig-lavender",
  "--sig-sky",
  "--sig-cobalt",
  "--sig-peach",
  "--sig-green",
  "--sig-yellow",
  "--sig-orchid",
  "--sig-cyan",
  "--sig-magenta",
  "--sig-mint",
  "--sig-spring",
  "--sig-citron",
  "--sig-violet-glow",
  "--sig-pink-glow",
  "--sig-rose-glow",
  "--sig-lime-glow",
  "--sig-mint-glow",
  "--sig-crimson",
  "--sig-azure",
  "--sig-tangerine",
  "--sig-neon-green",
];
const themeProviderSrc26 = readFileSync(resolve(root, "react/ThemeProvider.tsx"), "utf8");
const tokenKeysMatch26 = themeProviderSrc26.match(/const\s+TOKEN_KEYS\s*=\s*\[([\s\S]*?)\]\s*as\s+const;/);
if (tokenKeysMatch26 === null) {
  failures.push("(pt11) cannot sweep — react/ThemeProvider.tsx has no parseable TOKEN_KEYS array");
} else {
  const whitelist26 = [...tokenKeysMatch26[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  // 3.7.0: --sig-motion-scale carries a --sig-* NAME but is a MOTION
  // dial, not a content COLOR — the sweep is the color-family sweep, so
  // the dial is excluded from the count (and separately required below).
  const sigNames = whitelist26.filter((name) => name.startsWith("--sig-") && name !== "--sig-motion-scale");
  if (sigNames.length !== 26) {
    failures.push(
      `(pt11) the whitelist carries ${sigNames.length} --sig-* COLOR tokens, expected EXACTLY 26 (3.0.0: the chromatic expansion; --sig-motion-scale is the motion dial, swept separately) — the SigColorToken union is the whitelist`,
    );
  }
  if (!whitelist26.includes("--sig-motion-scale")) {
    failures.push("(pt11) the motion dial --sig-motion-scale is missing from the whitelist (3.7.0)");
  }
  for (const name of EXPECTED_SIG_26) {
    if (!sigNames.includes(name)) {
      failures.push(`(pt11) the 26-token sweep is missing ${name}`);
    }
  }
  if (whitelist26.includes("--sig-blue")) {
    failures.push("(pt11) --sig-blue is retired (3.0.0) — it must NOT be in the TOKEN_KEYS whitelist");
  }
  if (whitelist26.length !== 60) {
    failures.push(
      `(pt11) the whitelist is ${whitelist26.length} tokens, expected EXACTLY 60 (51 through 3.2.0 + the 9 kinetic motion tokens of 3.7.0)`,
    );
  }
}
if (!/export type SigColorToken = SigTokenName/.test(surfaceDts26)) {
  failures.push(
    "(pt11) react/surface.d.ts must carry `export type SigColorToken = SigTokenName` — the alias resolves through Extract<KnownToken, `--sig-${string}`>",
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
  ["categoryToken?: SigColorToken", "the chromatic-typed category badge"],
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
const tierCheckRule = /\.sig-tier-card__features li svg\s*\{[^}]*color: var\(--sig-green\);/s;
if (!tierCheckRule.test(cardsCss26)) {
  failures.push(
    "(cc3) the TierCard Check bullets must wear sig-green — .sig-tier-card__features li svg { color: var(--sig-green); }",
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
  ["<Avatar name={name} size={avatarSize} ringToken={accentToken} />", "the avatar wears the chromatic ring (typed SigColorToken)"],
  ["accentToken?: SigColorToken", "the profile accent is chromatic-only (the avatar-ring rule)"],
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
  ['className="sig-chronicle__item"', "the release item"],
  ['"--accent": `var(${release.accentToken ?? "--sig-lavender"})`', "the inline accent variable (lavender fallback)"],
  ['className="sig-chronicle__node"', "the milestone dot"],
  ['className="sig-chronicle__tag"', "the mono accent tag"],
  ['className="sig-chronicle__stat"', "the optional mono stat"],
  ["export interface ChronicleRelease", "the release contract"],
]) {
  if (!cardsSrc26.includes(needle)) {
    failures.push(`react/cards.tsx must contain ${JSON.stringify(needle)} — (cc5) ${label}`);
  }
}
const chronicleSpine = /\.sig-chronicle::before\s*\{[^}]*width: 2px;[^}]*background: color-mix\(in srgb, var\(--text-muted\) 20%, transparent\);/s;
if (!chronicleSpine.test(cardsCss26)) {
  failures.push(
    "(cc5) .sig-chronicle::before must be the 2px 20% color-mix hairline spine",
  );
}
const chronicleNode = /\.sig-chronicle__node\s*\{[^}]*width: 12px;[^}]*border: 2px solid var\(--accent\);[^}]*background: var\(--bg-surface\);/s;
if (!chronicleNode.test(cardsCss26)) {
  failures.push(
    "(cc5) .sig-chronicle__node must be the 12px accent-ringed, surface-filled dot",
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
    [".sig-ring__dial", "the square dial wrapper"],
    ["aspect-ratio: 1 / 1", "the 1/1 square"],
    ["width: var(--ring-size, 128px)", "the 3.9.0 enum-driven box (128px md default)"],
    ["transform: scale(1.07)", "the zoom"],
    [".sig-ring[data-expanded=\"true\"] .sig-ring__dial", "the expanded zoom state"],
    [".sig-ring__detail", "the detail strip"],
    ["grid-template-rows: 0fr", "the collapsed strip (the 0fr→1fr trick)"],
    ["grid-template-rows: 1fr", "the open strip"],
    ["font-variant-numeric: tabular-nums", "the strip's tabular digits"],
    // 3.9.0 THE SIZE ENUM — the owner's defect #2: the enum is the law
    // and the box can never stretch again.
    [".sig-stat-ring", "the bare svg's size-contract class"],
  ];
  for (const [needle, label] of RING2_CSS) {
    if (!vizCss30.includes(needle)) {
      failures.push(`(ring2) css/viz.css must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  const dialSquare = /\.sig-ring__dial\s*\{[^}]*aspect-ratio: 1 \/ 1;[^}]*width: var\(--ring-size, 128px\);/s;
  if (!dialSquare.test(vizCss30)) {
    failures.push(
      "(ring2) .sig-ring__dial must be the aspect-ratio 1/1 square driven by --ring-size (the 3.9.0 enum)",
    );
  }
  const ringBox = /\.sig-stat-ring\s*\{[^}]*aspect-ratio: 1 \/ 1;[^}]*flex-shrink: 0;/s;
  if (!ringBox.test(vizCss30)) {
    failures.push(
      "(ring2) .sig-stat-ring must pin width/height off --ring-size with aspect-ratio 1/1 + flex-shrink: 0 — the ring can never balloon in a flex row (the owner's defect #2)",
    );
  }
  const reducedRing = /@media \(prefers-reduced-motion: reduce\)\s*\{[^@]*\.sig-ring__dial,\s*\n\s*\.sig-ring__detail\s*\{[^}]*transition: none;/s;
  if (!reducedRing.test(vizCss30)) {
    failures.push(
      "(ring2) the reduced-motion guard must kill the zoom + the slide (dial + detail, transition: none)",
    );
  }
  for (const [needle, label] of [
    ["total?: number", "the detail denominator prop"],
    ["unit?: string", "the detail unit label prop"],
    ["useState(false)", "the internal detail expand state"],
    ['"sig-ring"', "the wrapper renders"],
    ['"sig-ring__dial"', "the square dial renders"],
    ['"sig-ring__detail"', "the strip renders"],
    ["{clamped}% · {numerator} / {total} {unit", "the detail readout format"],
  ]) {
    if (!vizSrc30.includes(needle)) {
      failures.push(`(ring2) react/viz.tsx must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  if (!appSrc.includes('total={SEAT_CAPACITY}')) {
    failures.push("(ring2) App.tsx must wire the live ring's total (the attendance denominator)");
  }
  if (!appSrc.includes('unit="Seats"')) {
    failures.push('(ring2) App.tsx must wire the live ring\'s unit="Seats"');
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
  ['title: "Bento Workbench"', "gateway door 1"],
  ['title: "The Graph Studio"', "gateway door 2 (3.6.0 retitle)"],
  ['title: "Pattern Studio"', "gateway door 3"],
  ['accent: "--color-cake-primary"', "STRUCTURAL accent decision: the planner door wears Flamingo (the AccentToken union)"],
  ['title="Birria & Street Taco Catering"', "the commerce ContentCard"],
  ['meta={["25 MIN", "SPICY", "$14"]}', "the mono meta pills"],
  ['tag="JSX"', "the ReferenceCard chip"],
  ['title="The Signature Surface"', "the ReferenceCard title"],
  ['name="Pro License"', "the featured TierCard"],
  ['cta="Claim the license"', "the TierCard CTA"],
  ['title="Field Notes & Carousel"', "the food slab"],
  ['label="Developer & lifestyle cards"', "the lifestyle carousel"],
  ["Inter var — the optical grid is a promise", "carousel mini-card 1 (Typography)"],
  ["Sparklines first — the trend is the headline", "carousel mini-card 2 (Telemetry)"],
  ["Validation that teaches — an error is copy", "carousel mini-card 3 (Forms)"],
  ["Force-directed, drag-weighted — nodes are data", "carousel mini-card 4 (Graphs)"],
  ["Timelines that breathe", "carousel mini-card 5 (Chronology)"],
  ['data-testid="index-profiles"', "the 4-up profile row hook"],
  ['name="Ana Souza"\n              role="Head of Platform"', "the ProfileCard person (2.9.0: rides a .sig-cell container)"],
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
    [".sig-graph--focused .sig-graph__edge[data-dim=\"true\"],", "the class-driven dim selector (edge half)"],
    [".sig-graph--focused .sig-graph__node[data-dim=\"true\"]", "the class-driven dim selector (node half)"],
    ["opacity: 0.25", "THE DIM — non-adjacent ink fades to a quarter"],
    [".sig-graph__footer", "the inspect strip"],
    ["padding: var(--space-tight) var(--space-standard)", "the footer's 8px-grid padding"],
    [".sig-graph__toolbar", "the add-and-link toolbar row"],
    ["cursor: pointer", "the node pointer affordance"],
    [".sig-graph__node:focus-visible", "the keyboard ring on the node group"],
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
    ["categoryToken: SigColorToken", "chromatic-typed node category (Rule of Engagement)"],
    ["parentId?: string", "parentId undefined = root"],
    ['role="application"', "the svg's application role"],
    ["sig-graph sig-graph--focused", "the focused class driven by selection state"],
    ['"sig-graph"', "the bare canvas class"],
    ['className="sig-graph__edge"', "one path per node-with-parent"],
    ["data-parent={edge.fromId}", "the edge's parent hook (3.6.0: the unified edge rows)"],
    ["data-child={edge.toId}", "the edge's child hook"],
    ['className="sig-graph__node"', "the interactive node group"],
    ['role="button"', "nodes are buttons (aria contract)"],
    ["tabIndex={0}", "keyboard focus lands on the node"],
    ['data-dim={dim || undefined}', "the attribute IS the dim state"],
    ['stroke={isSelected ? "var(--color-cake-primary)" : strokeFor(node)}', "selection flips the stroke to structural Flamingo"],
    ["strokeWidth={isSelected ? 3 : 2}", "the selected ring thickens to 3"],
    ['className="sig-graph__footer"', "the inspect strip render"],
    ["Select a node to inspect its note.", "the resting footer copy"],
    ["Add &amp; Link", "the toolbar button label"],
    ['variant="secondary"', "the toolbar rides the package Button"],
    ['categoryToken: "--sig-lavender"', "Add & Link seeds the lavender content token"],
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

// ---- (ob1) THE OBSIDIAN GRAPH (3.0.0) ----------------------------------------------
// react/graph.tsx needles: 60fps drag (setPointerCapture + rAF + direct
// transform mutation), right-click tether (contextmenu + azure dashed),
// dbl-click spawn, wheel zoom clamped, Escape cancel, arrow-key nudge,
// the onMoveNode/onLinkNodes/onAddNodeAt callbacks. css/graph.css: the
// azure dashed tether + the cursor states. Playground: the persisted
// positions/links model + the wiring.
{
  const graphSrc30 = readFileSync(resolve(root, "react/graph.tsx"), "utf8");
  const OB1_TSX = [
    ["setPointerCapture", "the pointer capture (drag + tether)"],
    ["requestAnimationFrame", "the rAF-throttled move loop"],
    ["cancelAnimationFrame", "the pending frame cleanup"],
    ["setAttribute(\"transform\"", "the DIRECT g-transform mutation — no setState per move"],
    ["onContextMenu", "the right-click tether entry"],
    ["--sig-azure", "the azure tether ink"],
    ["stroke-dasharray: 6 4", "the tether dash (css; the class rides graph.css)"],
    ["onDoubleClick", "the dbl-click spawn"],
    ["clientToGraph", "the shared client→svg space helper"],
    ["ZOOM_MIN = 0.5", "the zoom floor"],
    ["ZOOM_MAX = 2.5", "the zoom ceiling"],
    ['"Escape"', "the Escape cancel"],
    ["NUDGE_PX = 8", "the keyboard nudge step (the grid)"],
    ["ArrowUp", "the nudge keys"],
    ["onMoveNode", "the drag commit callback"],
    ["onLinkNodes", "the tether commit callback"],
    ["onAddNodeAt", "the dbl-click spawn callback"],
    ["<title>{node.label}</title>", "the full-label tooltip child"],
    ["fontSize={13}", "the generous label voice (was 11)"],
    ["NODE_RADIUS = 34", "the generous radius (was 26)"],
    ["LABEL_MAX = 16", "the longer truncation threshold (was 12)"],
    ["elementFromPoint", "the tether hit test"],
    // 3.6.0 AMENDMENT: the links model grows the id-ed GraphEdge
    // { id, fromId, toId }; the edge marker rides the kind.
    ["export interface GraphEdge", "the links model type (GraphEdge { id, fromId, toId })"],
    ["data-link={edge.kind === \"link\" || undefined}", "the explicit-link edge marker"],
    ["export interface KnowledgeGraphHandle", "the imperative canvas handle (zoom/auto-arrange/select)"],
    ["useImperativeHandle", "the handle wiring"],
    ["onUnlinkEdge", "the Delete/Backspace unlink commit"],
    ["isTypingTarget", "the typing-target guard on the global keys"],
    ["sig-graph__edge-hit", "the invisible 14px hit path (a 1.5px hairline is unhittable)"],
    ["parent:${node.id}", "the deterministic parent-edge id"],
    ["searchQuery", "the search-dim prop"],
    ["zoomAtCenter", "the center-anchored button zoom"],
  ];
  for (const [needle, label] of OB1_TSX) {
    const target = needle.includes("stroke-dasharray") || needle.includes("--sig-azure")
      ? readFileSync(resolve(root, "css/graph.css"), "utf8")
      : graphSrc30;
    if (!target.includes(needle)) {
      failures.push(`(ob1) must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  const tetherRule = /\.sig-graph__tether\s*\{[^}]*stroke: var\(--sig-azure\);[^}]*stroke-width: 1\.5;[^}]*stroke-dasharray: 6 4;/s;
  if (!tetherRule.test(readFileSync(resolve(root, "css/graph.css"), "utf8"))) {
    failures.push(
      "(ob1) .sig-graph__tether must be the azure dashed 6 4 1.5px line — the live right-click tether",
    );
  }
  for (const [needle, label] of [
    ['"sig.workspace.v3.graph-positions"', "the persisted dragged positions key"],
    ['"sig.workspace.v3.links"', "the persisted extra links key (3.6.0: GraphEdge records)"],
    ["function useWorkspaceState", "3.6.0: the ONE workspace-state hook"],
    ["onMoveNode={workspace.moveNode}", "the drag wiring (through the hook)"],
    ["onLinkNodes={workspace.linkNodes}", "the tether wiring"],
    ["onAddNodeAt={workspace.addNodeAt}", "the spawn wiring"],
    ["positions={workspace.positions}", "the positions round-trip"],
    ["links={workspace.links}", "the links round-trip"],
    ["onUnlinkEdge={workspace.unlinkEdge}", "the 3.6.0 unlink wiring"],
    ["resetPositions()", "the reset clears the positions"],
    ["resetLinks()", "the reset clears the links"],
    ["parent:", "the kind-resolved unlink prefix (parent:* clears the child's parentId)"],
  ]) {
    if (!appSrc.includes(needle)) {
      failures.push(`(ob1) App.tsx must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
}

// ---- (vz1) ANALYTICAL CHARTS — BarChart + AreaChart (2.7.0) -------------------------
// react/viz.tsx: the pure smoothPath export, dasharray reference lines, inset
// track class, hover readout classes, the useId-gradient, point circles.
// css/viz.css: .sig-bars/.sig-area anatomy + hover opacity rules + reduced-
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
  ['className="sig-bars__track"', "the inset capacity track element"],
  ['className="sig-bars__bar"', "the chromatic value bar element"],
  ['className="sig-bars__value"', "the hover value readout element"],
  ['className="sig-bars__refline"', "the 25/50/75% reference line element"],
  ['className="sig-bars__label"', "the mono axis label element"],
  ["useId()", "the gradient id source (no collisions)"],
  ["<linearGradient", "the svg gradient"],
  ["color-mix(in srgb, var(${colorToken}) 30%, transparent)", "the gradient's 30% top stop"],
  ['className="sig-area__fill"', "the gradient area path"],
  ['className="sig-area__line"', "the smoothed line path"],
  ['className="sig-area__point"', "the data-point circles"],
  ["r={4}", "the resting point radius"],
  ['className="sig-area__readout"', "the hover tabular readout"],
  ["colorToken = \"--sig-sky\"", "the sky default token (AreaChart)"],
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
  [".sig-bars", "the bar chart svg"],
  [".sig-bars__track", "the capacity track rule"],
  ["fill: var(--bg-inset)", "the track's inset fill (the 2.2.0 track doctrine)"],
  [".sig-bars__value", "the hover readout rule"],
  [".sig-bars__group:hover .sig-bars__value", "the hover reveal (class-driven)"],
  ["font-variant-numeric: tabular-nums", "the readout's tabular digits"],
  [".sig-bars__label", "the axis label rule"],
  ["font-size: 0.6875rem", "the mono muted axis voice"],
  [".sig-bars__refline", "the dashed reference line rule"],
  ["color-mix(in srgb, var(--text-muted) 25%, transparent)", "the 25% muted refline stroke"],
  [".sig-area", "the area chart svg"],
  [".sig-area__fill", "the gradient area rule"],
  ["opacity: 0.5", "the area's half opacity"],
  [".sig-area__point", "the point circle rule"],
  [".sig-area__spot:hover .sig-area__point", "the hover enlarge (r: 6px)"],
  [".sig-area__readout", "the area readout rule"],
  [".sig-area__xlabel", "the axis label rule"],
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
// APPEND-only .sig-tmanager block (EventTimeline rules untouched — the
// e2 deletion guard proves it) with the tabular counter, the Flamingo
// pill underline, the sig-green settle fill, reduced-motion.
// LIVE-MAP PROBE NOTE (the "Music" lesson): the owner-spec'd "Trash2" and
// "Filter" are NOT keys of the installed lucide-react 1.72.0 icons map —
// the live-map-valid equivalents "Trash" and "Funnel" render instead.
const tmSrcPath = resolve(root, "react/timeline-manager.tsx");
if (!existsSync(tmSrcPath)) {
  failures.push("(tm1) react/timeline-manager.tsx is missing — the TimelineManager is a new module");
} else {
  const tmSrc = readFileSync(tmSrcPath, "utf8");
  const TM_REQUIREMENTS = [
    ["export interface TimelineItem extends TimelineEvent", "the EXTENSION contract (EventTimeline untouched)"],
    ["settled?: boolean", "the settle state"],
    ["export interface TimelineManagerProps", "the props contract"],
    ["items: TimelineItem[]", "CONTROLLED — the items come in"],
    ["onAdd: (item: Omit<TimelineItem, \"id\">) => void", "the controlled add callback"],
    ["onToggleSettled: (id: string) => void", "the controlled toggle callback"],
    ["onDelete: (id: string) => void", "the controlled delete callback"],
    ["onInspect?: (item: TimelineItem) => void", "the optional inspect callback"],
    ['className="sig-tmanager"', "the section root"],
    ['className="sig-tmanager__composer"', "the composer row"],
    ['placeholder="Milestone title"', "the composer title field"],
    ['label="Month"', "the month select's accessible name"],
    ['label="Category"', "the category select's accessible name"],
    ['variant="primary" size="sm"', "the composer's primary sm Button"],
    ["Settle Item", "the composer submit label"],
    ["trimmed === \"\"", "the empty-title guard (warn + ignore)"],
    ['className="sig-tmanager__pill"', "the filter pill"],
    ["aria-pressed={filter === entry.id}", "THE pill state — the attribute IS the state"],
    ['className="sig-tmanager__count"', "the live counter"],
    ["{settledCount} / {items.length} Settled", "the counter's N / M Settled readout"],
    ['className="sig-tmanager__settle"', "the settle toggle"],
    ['aria-pressed={item.settled === true}', "the settle state attribute"],
    ['aria-label="Toggle settled"', "the toggle's accessible name"],
    ['name="Check"', "the toggle's icon (live-map-probed key)"],
    ['className="sig-tmanager__body"', "the row body button"],
    ["onInspect?.(item)", "the inspect fires with the item"],
    ["SigBadge", "the category chip (the official primitive)"],
    ['className="sig-tmanager__done"', "the settled chip"],
    ["Settled", "the settled chip text"],
    ['className="sig-tmanager__delete"', "the delete button"],
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
  [".sig-tmanager", "the manager section root"],
  [".sig-tmanager__composer", "the composer row"],
  ["gap: var(--space-tight)", "the 8px-grid gap"],
  [".sig-tmanager__pill[aria-pressed=\"true\"]", "THE pill state selector"],
  ["border-bottom-color: var(--color-cake-primary)", "the Flamingo active underline (the Tabs/GlobalNav contract)"],
  [".sig-tmanager__count", "the live counter rule"],
  ["font-variant-numeric: tabular-nums", "the counter's tabular digits"],
  [".sig-tmanager__settle[aria-pressed=\"true\"]", "the settled toggle selector"],
  ["color: var(--sig-green)", "the settled toggle's sig-green fill"],
  [".sig-tmanager__row--settled .sig-tmanager__title", "the settled dim (3.6.0: scoped to the TITLE — the body-wide 0.6 dim dragged the muted meta to 2.29:1, below the display floor)"],
  ["opacity: 0.6", "the settled fade"],
  ["text-decoration: line-through", "the settled strike-through"],
  [".sig-tmanager__done", "the settled chip"],
  [".sig-tmanager__delete:hover", "the delete hover"],
  ["color: var(--sig-peach)", "the delete attention ink"],
  [".sig-tmanager__body:focus-visible", "the body's keyboard ring"],
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
// signature-workspace.json filename.
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
  ['usePersistentState<GraphNode[]>(\n    "sig.workspace.v3.graph",', "the graph array under its versioned key"],
  ['usePersistentState<TimelineItem[]>(\n    "sig.workspace.v3.timeline",', "the timeline array under its versioned key"],
  ["SEED_GRAPH", "the graph's seed fallback"],
  ["SEED_TIMELINE", "the timeline's seed fallback"],
  ['version: "sig.workspace.v3"', "the snapshot payload version (the links model joins — 3.6.0 GraphEdge shape)"],
  ["links: normalizedLinks", "the links join the payload (normalized)"],
  ["signature-workspace.json", "the download filename"],
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

// ---- (gp1) THE ANALYTICS & PLANNER VIEW + THE GRAPH STUDIO (2.7.0; 3.6.0 the Studio split) ----
// The "Graphs & Planner" module tab is RETIRED: the graph moved to the
// dedicated Graph Studio view (canvas/HUD/inspector), the charts + the
// Milestone Manager + the snapshot toolbar became the Analytics &
// Planner view.
const GP_REQUIREMENTS = [
  ['type ModuleId = "core" | "data" | "forms"', "the module ids (3.6.0: the graph tab retired)"],
  ["function useWorkspaceState", "3.6.0: the ONE workspace-state hook (the persistence owner)"],
  ["function AnalyticsPlannerView", "the analytics view (charts + milestones + the snapshot toolbar)"],
  ['view === "graph" ? (', "the graph-studio branch renders"],
  ['view === "planner" ? (', "the analytics branch renders"],
  ["<GraphStudioView", "the studio composition"],
  ["<AnalyticsPlannerView workspace={workspace} />", "the analytics composition"],
  ["<KnowledgeGraph", "the graph primitive (inside the studio component)"],
  ["addOn", "the graph's Add & Link toolbar"],
  ['title="Spending by Department"', "card: the bars"],
  ["<BarChart", "the bar chart primitive"],
  ['{ label: "Engineering", value: 800, max: 1000, colorToken: "--sig-cobalt" }', "a per-bar capacity max (3.0.0: the chromatic series)"],
  ['title="Attendance Momentum"', "card: the area"],
  ["<AreaChart", "the area chart primitive"],
  ['colorToken="--sig-sky"', "the sky series token"],
  ['title="Milestone Manager"', "card: the manager"],
  ["<TimelineManager", "the manager primitive"],
  ["onInspect={modal.open}", "inspect composes the EventModal"],
  ['label="Milestone manager"', "the manager's accessible name"],
  ['data-testid="spending-bars"', "the bars probe hook"],
  ['data-testid="attendance-area"', "the area probe hook"],
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
// The STUDIO component's own needles (playground/components/GraphStudio.tsx).
{
  const studioPath = resolve(root, "playground/components/GraphStudio.tsx");
  if (!existsSync(studioPath)) {
    failures.push("(gp1) playground/components/GraphStudio.tsx is missing — the Graph Studio view");
  } else {
    const studioSrc = readFileSync(studioPath, "utf8");
    const GP_STUDIO = [
      ["function GraphStudioView", "the studio view component"],
      ["onUpdateNode", "the debounced inspector patch commit"],
      ["onUnlinkEdge", "the unlink wiring"],
      ["onSpawnLinkedChild", "the spawn-child wiring"],
      ["onAutoArrange", "the auto-arrange wiring"],
      ["useDebouncedNodeDraft", "the inspector's draft/debounce cell"],
      ['data-testid="graph-studio"', "the studio probe hook"],
      ['data-testid="studio-canvas"', "the canvas probe hook"],
      ['data-testid="studio-inspector"', "the inspector probe hook"],
      ['data-testid="studio-search"', "the HUD search probe hook"],
      ['data-testid="studio-auto-arrange"', "the auto-arrange probe hook"],
      ['data-testid="studio-count"', "the Nodes·Edges counter probe hook"],
      ['data-testid="studio-spawn-child"', "the spawn probe hook"],
      ['data-testid="studio-unlink-edge"', "the edge-card unlink probe hook"],
      ['data-testid="studio-empty"', "the empty-state probe hook"],
      ["<KnowledgeGraph", "the graph primitive"],
      ["searchQuery={searchQuery}", "the search dim feeds the canvas"],
      ["graphRef.current?.zoomIn()", "the imperative zoom"],
      ["graphRef.current?.autoArrange()", "the imperative auto-arrange"],
      ["graphRef.current?.selectNode(id)", "jump-to-target selects through the handle"],
      ["Select a node to inspect it.", "the muted empty state"],
    ];
    for (const [needle, label] of GP_STUDIO) {
      if (!studioSrc.includes(needle)) {
        failures.push(`(gp1) GraphStudio.tsx must contain ${JSON.stringify(needle)} — ${label}`);
      }
    }
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
  ['{ href: VIEW_HREFS.dashboard, label: "Workbench" }', "view 1: the live bento (3.6.0 the Workbench)"],
  ['{ href: VIEW_HREFS.graph, label: "Graph Studio" }', "view 2: the canvas (3.6.0)"],
  ['{ href: VIEW_HREFS.planner, label: "Analytics & Planner" }', "view 3: the planning deck (3.6.0)"],
  ['{ href: VIEW_HREFS.studio, label: "Pattern Studio" }', "view 4: the primary catalog"],
  ['{ href: VIEW_HREFS.index, label: "Index" }', "view 5: the master index"],
  ['{ href: VIEW_HREFS.codex, label: "AI Codex" }', "view 6: the codex"],
  ['view === "graph" ? (', "the graph-studio branch renders"],
  ['view === "planner" ? (', "the analytics branch renders"],
  ['view === "studio" ? (', "the studio branch renders"],
  ['view === "chronicle" ? (', "the chronicle branch renders (hash + palette reachable)"],
  ["function ChronicleView", "the chronicle view component"],
  ["title: \"THE PATTERN STUDIO\"", "the studio hero"],
  ["seven sets · fifty-six patterns · one-click copy", "the studio hero subtitle (3.4.0: Set 07 joins)"],
  ["title: \"THE GRAPH STUDIO\"", "the studio hero (3.6.0)"],
  ["nodes, links & the inspector · one canvas", "the graph-studio hero subtitle"],
  ["title: \"ANALYTICS & PLANNER\"", "the analytics hero"],
];
for (const [needle, label] of NAV5_REQUIREMENTS) {
  if (!appSrc.includes(needle)) {
    failures.push(`(nav5) App.tsx must contain ${JSON.stringify(needle)} — ${label}`);
  }
}
for (const dead of ["function PlaceholderView", "type WorkshopView", "const PLACEHOLDERS", '"#/events"', '"#/members"', '"#/budget"']) {
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
  // The honest census: exactly 37 color tokens declared INSIDE the
  // COLOR_TOKENS array (the z-ladder's --z-* entries don't count).
  // 3.0.0: 11 core/keeper + the 26-token Chromatic Palette.
  const censusSlice = codexSrc.slice(codexSrc.indexOf("const COLOR_TOKENS"), codexSrc.indexOf("];"));
  const declaredSwatches = censusSlice.match(/token: "--/g);
  if (declaredSwatches === null || declaredSwatches.length !== 37) {
    failures.push(
      `(ps-studio) CodexView COLOR_TOKENS must declare exactly 37 color tokens (11 core/keeper + 26 chromatic — the honest count out of whitelist 50), found ${String(declaredSwatches?.length ?? 0)}`,
    );
  }
  if (!codexSrc.includes("the whitelist is 50")) {
    failures.push('(ps-studio) CodexView must state the honest census — "the whitelist is 50" stated');
  }
  const newChipCount = (censusSlice.match(/isNew: true/g) ?? []).length;
  if (newChipCount !== 16) {
    failures.push(
      `(ps-studio) CodexView must mark exactly 16 chromatic newcomers (cobalt + 15), found ${String(newChipCount)}`,
    );
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
  if (!selector.includes("sig-btn--primary")) {
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

// ---- (wc-studio) THE ZERO-REACT STUDIO INTEGRATION (3.4.0) -------------------------
// The studio mounts the SIX REAL custom elements (Set 07): the module-level
// import "@edwyn/signature-style/wc" registers them INSIDE the vite app (the
// committed dist/wc bundle resolves through the exports map), and the frames
// are live previews — the in-app proof that the wc build works. The (ps-studio)
// coverage check above already forces every SNIPPETS key (the six SigWc* keys)
// into SET_FRAMES + PREVIEWS; THIS gate pins the integration plumbing:
{
  const studioWcSrc = readFileSync(resolve(root, "playground/components/PatternStudio.tsx"), "utf8");
  const WC_STUDIO_REQUIREMENTS = [
    ['import "@edwyn/signature-style/wc";', "the registration import — the package exports map resolves dist/wc"],
    ['"07": [', "Set 07 declared in SET_FRAMES (the sidebar counts derive from it)"],
    ["SigWcStatRingPreview", "the reactive ring preview (setAttribute drives the arc)"],
    ["setAttribute(", "the ring preview touches the ATTRIBUTE API — no props, the wc contract"],
  ];
  for (const [needle, label] of WC_STUDIO_REQUIREMENTS) {
    if (!studioWcSrc.includes(needle)) {
      failures.push(`(wc-studio) PatternStudio.tsx must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  const appWcSrc = appSrc;
  if (!appWcSrc.includes('"01", "02", "03", "04", "05", "06", "07"')) {
    failures.push('(wc-studio) App.tsx SET_ORDER must carry "07" — the command palette jumps into the WC set');
  }
  const snippetsWcSrc = readFileSync(resolve(root, "playground/snippets.ts"), "utf8");
  if (!snippetsWcSrc.includes('"01" | "02" | "03" | "04" | "05" | "06" | "07"')) {
    failures.push("(wc-studio) snippets.ts SetId must widen to \"07\" — the WC mini-set rides the 6-Set taxonomy machinery");
  }
  // The dist/wc quartet must be COMMITTED (the studio imports the bundle;
  // an ignored/untracked artifact would break a fresh clone).
  try {
    const tracked = execFileSync("git", ["ls-files", "dist/wc/"], { cwd: root, encoding: "utf8" })
      .split("\n").map((l) => l.trim()).filter((l) => l !== "");
    for (const required of ["dist/wc/signature-wc.es.js", "dist/wc/index.d.ts", "dist/wc/base.d.ts", "dist/wc/elements.d.ts"]) {
      if (!tracked.includes(required)) {
        failures.push(`(wc-studio) ${required} must be git-tracked — the studio imports the committed bundle`);
      }
    }
  } catch (error) {
    failures.push(`(wc-studio) cannot list tracked dist/wc files — ${error instanceof Error ? error.message : String(error)}`);
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
  if (!llmsTxt.includes("> Catppuccin Mocha-based design system: Token Cascade, Override Protocol, Chromatic Palette content colors, mechanical physics.")) {
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
    .concat(Object.keys(JSON.parse(readFileSync(resolve(root, "tokens.json"), "utf8")).sigPalette.tokens));
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
    [cardsCss29, ".sig-matchup__vs::before", "css/cards.css: the VS pill grows hairline dividers when stacked"],
    [cardsCss29, "@container (min-width: 440px)", "css/cards.css: the content/profile media-object reflow at 440px"],
    [cardsCss29, ".sig-content-card__visual {\n      grid-column: 1;", "css/cards.css: the 16/9 visual docks in the 40% column"],
    [cardsCss29, ".sig-profile-card > .sig-avatar {\n      grid-column: 1;", "css/cards.css: the avatar docks beside the name block"],
    [vizCss29, "@container (min-width: 360px)", "css/viz.css: the stat-card dock at 360px"],
    [vizCss29, ".sig-stat-card > svg {\n    grid-column: 2;", "css/viz.css: the sparkline docks in column 2"],
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
  // the package css must not set container-type on .sig-matchup,
  // .sig-stat-card, .sig-content-card or .sig-profile-card themselves.
  for (const [source, queried] of [
    [cardsCss29, ".sig-matchup"],
    [cardsCss29, ".sig-content-card"],
    [cardsCss29, ".sig-profile-card"],
    [vizCss29, ".sig-stat-card"],
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
    ['label: "Go to Workbench"', "command: the workbench view (3.6.0)"],
    ['label: "Go to Graph Studio"', "command: the graph studio view (3.6.0)"],
    ['label: "Go to Analytics & Planner"', "command: the analytics view (3.6.0)"],
    ['label: "Go to Pattern Studio"', "command: studio view"],
    ['label: "Go to Master Index"', "command: index view"],
    ['label: "Go to Chronicle"', "command: chronicle view"],
    ['label: "Go to AI Codex"', "command: codex view"],
    ["label: `Studio: Set ${id} · ${SET_NAMES[id]}`", "command: the six studio sets"],
    ['label: "Export signature-workspace.json"', "command: the workspace export (3.6.0: links join the payload)"],
    ['label: "Toggle 600ms latency"', "command: the repository rehearsal (3.6.0)"],
    ['label: "Toggle Reduced Motion Preview"', "command: the motion preview"],
    ['label: "Open Keyboard Shortcuts"', "command: the shortcuts dialog"],
    ['label: "Copy Codex llms.txt URL"', "command: the codex manifest URL"],
    ['rootEl.dataset.motion === "reduced"', "the preview toggle reads the attribute"],
    ['rootEl.dataset.motion = "reduced"', "the preview toggle sets the attribute"],
    ["buildStoredWorkspaceSnapshot()", "the export command reads the persisted mirror"],
    ["downloadJson(", "the shared download dance"],
    ["ShortcutModal", "the 3.6.0 shortcuts modal exists (components/ShortcutModal.tsx)"],
    ["<Breadcrumbs", "the breadcrumbs render in the shell"],
  ];
  for (const [needle, label] of APP_CMD) {
    if (!appSrc.includes(needle)) {
      failures.push(`(cmd1) App.tsx must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  // The ShortcutModal's own needles (3.6.0).
  {
    const modalPath = resolve(root, "playground/components/ShortcutModal.tsx");
    if (!existsSync(modalPath)) {
      failures.push("(cmd1) playground/components/ShortcutModal.tsx is missing — the keyboard map");
    } else {
      const modalSrc = readFileSync(modalPath, "utf8");
      const MODAL_NEEDLES = [
        ['aria-label="Keyboard shortcuts"', "the modal's accessible name"],
        ['"sig-modal-backdrop"', "the z-50 scrim (no second anatomy)"],
        ["createPortal", "the portal"],
        ["Open or close this keyboard map", "the ? entry"],
        ["Flip a FlipCard to its back face", "the Space/Enter flip entry"],
        ["Unlink the selected graph edge", "the Delete/Backspace entry"],
        ["Flip a 3-by-3 carousel page", "the arrows entry"],
        ["Nudge the selected graph node 8px", "the nudge entry"],
        ["8px", "the 8px note"],
      ];
      for (const [needle, label] of MODAL_NEEDLES) {
        if (!modalSrc.includes(needle)) {
          failures.push(`(cmd1) ShortcutModal.tsx must contain ${JSON.stringify(needle)} — ${label}`);
        }
      }
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
    ['className="sig-skeleton sig-skeleton--line"', "the line anatomy"],
    ['className="sig-skeleton sig-skeleton--row"', "the row anatomy"],
    ['className="sig-skeleton-tr"', "the native <tr> root"],
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
    ["@keyframes sig-skeleton-sweep", "the ONE sweep"],
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
    ["<SkeletonTableRow key={member.id} columns={3} />", "the ledger swap — skeleton rows × current-rows"],
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

// ---- (th3) THE THREE SURFACE THEMES (3.2.0) ----------------------------------
// The canonical triad lives in css/tokens.css: :root (mocha default) +
// [data-sig-theme="oled"] true-black + [data-sig-theme="daylight"] light.
// :root gains the --bg-canvas alias (the owner's name for --bg-base — the
// whitelist is 51, (pt11)); the manifest's sigThemes section mirrors the
// blocks (the b7 guard checks the JSON side; TH3 checks the CSS side and
// CROSS-CHECKS the two: every daylight ink override in css must equal the
// inkVariants hex, and the oled trio must match sigThemes.oled.tokens).
// The latte legacy block stays byte-untouched (back-compat, outside the
// triad). The mocha :root palette is proven byte-identical by (b)/(p)/(s2)
// in scripts/verify.mjs.
{
  const tokensCss32 = readFileSync(resolve(root, "css/tokens.css"), "utf8");
  const manifest32 = JSON.parse(readFileSync(resolve(root, "tokens.json"), "utf8"));
  const stripped32 = tokensCss32.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const [selector, label] of [
    ['[data-sig-theme="oled"]', "the oled true-black block"],
    ['[data-sig-theme="daylight"]', "the daylight high-contrast block"],
  ]) {
    if (!stripped32.includes(`${selector} {`)) {
      failures.push(`(th3) css/tokens.css must declare ${selector} — ${label}`);
    }
  }
  if (!/--bg-canvas\s*:\s*var\(--bg-base\)\s*;/.test(stripped32)) {
    failures.push("(th3) css/tokens.css :root must declare the --bg-canvas alias as var(--bg-base)");
  }
  const tsx32 = readFileSync(resolve(root, "react/ThemeProvider.tsx"), "utf8");
  if (!tsx32.includes('"--bg-canvas"')) {
    failures.push('(th3) react/ThemeProvider.tsx TOKEN_KEYS must carry "--bg-canvas" (whitelist 50 → 51)');
  }
  // Cross-check: the css daylight ink overrides == the manifest inkVariants.
  const dayBlock = stripped32.match(/\[data-sig-theme="daylight"\]\s*\{([^}]*)\}/);
  const inkVariants = manifest32.sigThemes?.daylight?.inkVariants ?? {};
  if (dayBlock === null) {
    failures.push("(th3) cannot parse the daylight block for the ink cross-check");
  } else {
    const cssInks = [...dayBlock[1].matchAll(/(--sig-[\w-]+)\s*:\s*(#[0-9a-f]{6})\s*;/gi)];
    if (cssInks.length < 19) {
      failures.push(`(th3) the daylight block must carry the ink overrides (19 css declarations: 16 canonical minus the 4 inherited + yellow + the ink-floor set), found ${cssInks.length}`);
    }
    for (const [, name, hex] of cssInks) {
      const entry = inkVariants[name];
      if (entry === undefined) {
        failures.push(`(th3) css daylight override ${name} is missing from tokens.json sigThemes.daylight.inkVariants`);
      } else if (String(entry.value).toLowerCase() !== hex.toLowerCase()) {
        failures.push(`(th3) ${name}: css override ${hex} != manifest inkVariants ${entry.value}`);
      } else if (typeof entry.ratio !== "number" || entry.ratio < 3.1) {
        failures.push(`(th3) ${name}: manifest ratio ${entry.ratio} missing or below the 3.1 ink bar`);
      }
    }
  }
  const oledBlock = stripped32.match(/\[data-sig-theme="oled"\]\s*\{([^}]*)\}/);
  const oledManifest = manifest32.sigThemes?.oled?.tokens ?? {};
  if (oledBlock === null) {
    failures.push("(th3) cannot parse the oled block");
  } else {
    const cssOled = Object.fromEntries([...oledBlock[1].matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-f]{6})\s*;/gi)].map((m) => [m[1], m[2]]));
    for (const [name, hex] of Object.entries(oledManifest)) {
      if ((cssOled[name] ?? "").toLowerCase() !== String(hex).toLowerCase()) {
        failures.push(`(th3) oled ${name}: css ${cssOled[name] ?? "MISSING"} != manifest ${hex}`);
      }
    }
    if (Object.keys(cssOled).length !== 3) {
      failures.push(`(th3) the oled block must declare ONLY the bg trio (everything inherits), found ${Object.keys(cssOled).length} declarations`);
    }
  }
  // The legacy latte block must still be present and untouched.
  if (!stripped32.includes('[data-theme="latte"]')) {
    failures.push('(th3) css/tokens.css must keep the legacy [data-theme="latte"] block (back-compat, outside the triad)');
  }
}

// ---- (rad2) THE GEOMETRY PRESETS (3.2.0) -------------------------------------
// The radius axis: [data-sig-radius="standard"] → 8px/12px (8px-grid-pure —
// 6px never was), [data-sig-radius="sharp"] → 0px/0px (brutalist). The :root
// defaults stay 6px/12px (the untouched consumer look is byte-stable; the
// 12px card half is pinned by the (p3) gates in scripts/verify.mjs).
// tokens.json geometryPresets mirrors both blocks exactly.
{
  const tokensCssRad = readFileSync(resolve(root, "css/tokens.css"), "utf8");
  const strippedRad = tokensCssRad.replace(/\/\*[\s\S]*?\*\//g, "");
  const manifestRad = JSON.parse(readFileSync(resolve(root, "tokens.json"), "utf8"));
  const geo = manifestRad.geometryPresets ?? {};
  for (const [preset, ui, card] of [
    ["standard", "8px", "12px"],
    ["sharp", "0px", "0px"],
  ]) {
    const block = strippedRad.match(
      new RegExp(`\\[data-sig-radius="${preset}"\\]\\s*\\{([^}]*)\\}`),
    );
    if (block === null) {
      failures.push(`(rad2) css/tokens.css must declare the [data-sig-radius="${preset}"] block`);
      continue;
    }
    const uiMatch = block[1].match(/--radius-ui\s*:\s*([0-9]+px)\s*;/);
    const cardMatch = block[1].match(/--radius-card\s*:\s*([0-9]+px)\s*;/);
    if (uiMatch === null || uiMatch[1] !== ui) {
      failures.push(`(rad2) [data-sig-radius="${preset}"] must set --radius-ui: ${ui}, found ${uiMatch?.[1] ?? "MISSING"}`);
    }
    if (cardMatch === null || cardMatch[1] !== card) {
      failures.push(`(rad2) [data-sig-radius="${preset}"] must set --radius-card: ${card}, found ${cardMatch?.[1] ?? "MISSING"}`);
    }
    if (geo[preset]?.radiusUi !== ui || geo[preset]?.radiusCard !== card) {
      failures.push(`(rad2) tokens.json geometryPresets.${preset} must mirror ${ui}/${card}`);
    }
  }
  // The :root defaults stay 6px/12px — presets RETUNE, the default is stable.
  if (!/--radius-ui\s*:\s*6px\s*;/.test(strippedRad) || !/--radius-card\s*:\s*12px\s*;/.test(strippedRad)) {
    failures.push("(rad2) the :root radius defaults must stay 6px/12px (presets retune; the default is byte-stable)");
  }
}

// ---- (ct1) THE CONTRAST GATE (2.9.1) ------------------------------------------
// Zero contrast debt, enforced: the gate script must exist, be wired, the
// two fixed hexes must sit in css/tokens.css, and the gate itself must run
// green (all chromatic tokens ≥3.0:1 on surface AND base; the fixed pair
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
  if (!/--sig-mauve-bright:\s*#9e5ff2/i.test(tokensCss291)) {
    failures.push(
      "(ct1) css/tokens.css must carry --sig-mauve-bright: #9e5ff2 — the minimal in-family lightness step (H266°/S85% L58→66%), measured 3.22:1 on surface (was #8839ef @ 2.32:1)",
    );
  }
  // 3.0.0 (chrom): the blue pin retires with the name — cobalt carries
  // the value, the old name is banned (scripts/verify.mjs (p3) enforces
  // the css+json side; this is the css pin + the whitespace complement).
  if (!/--sig-cobalt:\s*#89b4fa/i.test(tokensCss291)) {
    failures.push(
      "(ct1) css/tokens.css must carry --sig-cobalt: #89b4fa — the retired --sig-blue's value, carried under its own name in 3.0.0 (5.97:1 on surface)",
    );
  }
  if (/--sig-blue\s*:/.test(tokensCss291.replace(/\/\*[\s\S]*?\*\//g, ""))) {
    failures.push(
      "(ct1) --sig-blue must NOT be declared in css/tokens.css — the name retired in 3.0.0",
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
    ['className="sig-breadcrumbs__sep"', "the separator span"],
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
    ['.sig-breadcrumbs [aria-current="page"]', "THE current-page selector"],
    ["font-weight: 700", "the bold current crumb"],
    [".sig-breadcrumbs__sep", "the separator anatomy"],
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
    [appSrc, '{ label: "workbench" }', "the dashboard's path tip (3.6.0 the Workbench)"],
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

// ---- (pf1) 60FPS PERFORMANCE (3.0.0) -----------------------------------------------
// React.memo wraps the five hot exports (KnowledgeGraph, DataTable,
// AreaChart, BarChart, EventTimeline — memo + displayName via the named
// inner function); usePersistentState debounces its localStorage write
// 300ms trailing (sync read preserved; flush on unmount + beforeunload;
// reset() cancels + removes immediately); css/surface.css carries
// `contain: layout style paint` on .sig-surface-card.
{
  const memoTargets = [
    ["react/graph.tsx", "KnowledgeGraph"],
    ["react/data.tsx", "DataTable"],
    ["react/viz.tsx", "AreaChart"],
    ["react/viz.tsx", "BarChart"],
    ["react/timeline.tsx", "EventTimeline"],
  ];
  for (const [file, name] of memoTargets) {
    const src = readFileSync(resolve(root, file), "utf8");
    // 3.6.0: KnowledgeGraph is memo(forwardRef(function KnowledgeGraph(…
    // — the imperative handle); the others keep the bare memo shape.
    const ok =
      src.includes(`export const ${name} = memo(function ${name}(`) ||
      (name === "KnowledgeGraph" &&
        src.includes("export const KnowledgeGraph = memo(") &&
        src.includes("forwardRef<KnowledgeGraphHandle, KnowledgeGraphProps>(function KnowledgeGraph("));
    if (!ok) {
      failures.push(
        `(pf1) ${file} must wrap ${name} — export const ${name} = memo(function ${name}(…)); the named inner function IS the displayName`,
      );
    }
  }
  const persistenceSrc30 = readFileSync(resolve(root, "playground", "persistence.ts"), "utf8");
  const PF1_PERSIST = [
    ["PERSIST_DEBOUNCE_MS = 300", "the 300ms trailing debounce window"],
    ["window.setTimeout(", "the trailing timer"],
    ["window.clearTimeout(pending.timer)", "the pending write is cancelled (flush/reset)"],
    ["window.localStorage.getItem", "the SYNCHRONOUS read is preserved"],
    ['"beforeunload"', "the tab-close flush"],
    ["flush()", "the unmount + beforeunload flush"],
    ["localStorage.removeItem", "the reset's immediate key removal"],
  ];
  for (const [needle, label] of PF1_PERSIST) {
    if (!persistenceSrc30.includes(needle)) {
      failures.push(`(pf1) playground/persistence.ts must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  const surfaceCss30 = readFileSync(resolve(root, "css/surface.css"), "utf8");
  const containRule = /\.sig-surface-card\s*\{[^}]*contain: layout style paint;/s;
  if (!containRule.test(surfaceCss30)) {
    failures.push(
      "(pf1) .sig-surface-card must carry contain: layout style paint — the card is a self-painting layout island (the 60fps containment)",
    );
  }
}

// ---- (bd1) THE BACKDROP-FILTER AUDIT (3.0.0) ----------------------------------------
// Glass stays where the blur earns its cost. THE TASK-TEXT DEVIATIONS,
// DOCUMENTED (the audit asserts the MEASURED truth):
//   1. css/modal.css does NOT blur — its 0.7.0 scrim is the plain
//      rgba(0,0,0,0.6) (the frozen (m1) gate pins the scrim; a blur
//      was never shipped there). Asserted scrim-only.
//   2. css/timeline.css DOES blur — the 1.8.0 glass header, pinned by
//      the (g2) gate (in-content sticky chrome, not a scrim). It stays.
// The real contract: exactly TWO files may use backdrop-filter —
// css/command.css (the z-50 palette) and css/timeline.css (the 1.8.0
// glass header); nav (z-30) stays blur-free; no other css file picks
// the property up.
{
  const BD1_ALLOWED = new Set(["css/command.css", "css/timeline.css"]);
  const found = new Set();
  for (const f of readdirSync(resolve(root, "css")).map((name) => join("css", name))) {
    const text = readFileSync(resolve(root, f), "utf8");
    if (text.includes("backdrop-filter")) found.add(f.replaceAll("\\", "/"));
  }
  for (const file of found) {
    if (!BD1_ALLOWED.has(file)) {
      failures.push(
        `(bd1) ${file} uses backdrop-filter — glass blur is sanctioned ONLY in css/command.css (the z-50 palette) and css/timeline.css (the 1.8.0 glass header, (g2)-pinned)`,
      );
    }
  }
  for (const missing of [...BD1_ALLOWED].filter((f) => !found.has(f))) {
    failures.push(`(bd1) ${missing} lost its backdrop-filter — the sanctioned glass set must hold`);
  }
  const modalCss30 = readFileSync(resolve(root, "css/modal.css"), "utf8");
  if (modalCss30.includes("backdrop-filter")) {
    failures.push("(bd1) css/modal.css must stay blur-free — the 0.7.0 scrim is plain rgba(0, 0, 0, 0.6) (the (m1) pin)");
  }
  if (!/var\(--z-overlay/.test(modalCss30)) {
    failures.push("(bd1) the modal scrim must stay on the z-40 overlay rung (var(--z-overlay)");
  }
  const commandCss30 = readFileSync(resolve(root, "css/command.css"), "utf8");
  if (!/var\(--z-modal, 50\)/.test(commandCss30)) {
    failures.push("(bd1) the palette blur must stay on the z-50 modal rung (var(--z-modal, 50))");
  }
  const navCss30 = readFileSync(resolve(root, "css/nav.css"), "utf8");
  if (navCss30.includes("backdrop-filter")) {
    failures.push("(bd1) css/nav.css must stay blur-free — the z-30 navbar has NO glass");
  }
}

// ---- (cus) THE LIVE STUDIO THEME CUSTOMIZER (3.2.0) --------------------------
// The customizer: a useSigTheme hook (ONE owner of documentElement — the
// persisted keys, the absent-default contract, the badge data), the panel
// (SurfaceCard at the top of the studio stream, aria-pressed buttons, the
// 16 live contrast badges, download/copy), the 7 palette commands, and the
// shared WCAG math module (sig-contrast.ts — the SAME module the contrast
// gate imports, so a badge ratio IS a gate ratio).
{
  const customizerPath = resolve(root, "playground/components/ThemeCustomizer.tsx");
  if (!existsSync(customizerPath)) {
    failures.push("(cus) playground/components/ThemeCustomizer.tsx is missing — the customizer panel");
  } else {
    const customizerSrc = readFileSync(customizerPath, "utf8");
    const CUS_PANEL = [
      ['title="Theme & Surface Customizer"', "the ruled panel title"],
      ["aria-pressed={theme === name}", "the theme buttons — the attribute IS the state"],
      ["aria-pressed={radius === name}", "the radius buttons — same contract"],
      ["data-testid={`customizer-theme-${name}`}", "the theme button hooks"],
      ["data-testid={`customizer-radius-${name}`}", "the radius button hooks"],
      ["data-testid={`contrast${badge.token}`}", "the badge hooks (contrast---sig-<token>)"],
      ["data-tier={badge.tier}", "the badge verdict attribute (pass/amber/fail)"],
      ['data-testid="customizer-download"', "the download hook"],
      ['data-testid="customizer-copy"', "the copy hook"],
      ['label="Surface theme"', "the theme group label"],
      ["Download tokens.css", "the download button label"],
      ["Copy CSS Variables", "the copy button label"],
    ];
    for (const [needle, label] of CUS_PANEL) {
      if (!customizerSrc.includes(needle)) {
        failures.push(`(cus) ThemeCustomizer.tsx must contain ${JSON.stringify(needle)} — ${label}`);
      }
    }
  }
  const hookPath = resolve(root, "playground/use-sig-theme.ts");
  if (!existsSync(hookPath)) {
    failures.push("(cus) playground/use-sig-theme.ts is missing — the ONE theme-state owner");
  } else {
    const hookSrc = readFileSync(hookPath, "utf8");
    const CUS_HOOK = [
      ['usePersistentState<SigPrefs>(PREFS_STORAGE_KEY, {', "3.6.0: the MERGED prefs state (one object, one key)"],
      ['theme: "mocha"', "the merged prefs default theme"],
      ['radius: "standard"', "the merged prefs default radius"],
      ["PREFS_STORAGE_KEY", "the sig.workspace.v3.prefs key"],
      ["legacyPrefsSeed", "the one-time legacy migration read (the per-axis v3.2.0 picks are adopted)"],
      ["document.documentElement.dataset.sigTheme = theme", "the documentElement mirror (sig-theme)"],
      ["document.documentElement.dataset.sigRadius = radius", "the documentElement mirror (sig-radius)"],
      ["applied.current", "the pick flag gating the attribute mirrors"],
      ["URL.createObjectURL", "the download blob dance"],
      ['anchor.download = "tokens.css"', "the download filename"],
      ["URL.revokeObjectURL", "the revoke"],
      ["navigator.clipboard", "the clipboard write"],
      ["contrastBadges(theme)", "the badge data for the ACTIVE theme"],
    ];
    for (const [needle, label] of CUS_HOOK) {
      if (!hookSrc.includes(needle)) {
        failures.push(`(cus) use-sig-theme.ts must contain ${JSON.stringify(needle)} — ${label}`);
      }
    }
  }
  const utilsPath = resolve(root, "playground/theme-utils.ts");
  if (!existsSync(utilsPath)) {
    failures.push("(cus) playground/theme-utils.ts is missing — the theme runtime");
  } else {
    const utilsSrc = readFileSync(utilsPath, "utf8");
    for (const [needle, label] of [
      ['import manifest from "../tokens.json"', "the manifest import — the customizer cannot drift from tokens.json"],
      ['from "./sig-contrast.js"', "the SHARED WCAG math (the gate imports the same module)"],
      ["export const THEMES", "the resolved triad"],
      ["export const RADIUS_PRESETS", "the geometry presets"],
      ["export function contrastBadges", "the badge builder"],
      ["export function buildTokensCss", "the client-side :root generator"],
      ["CHROMATIC_16", "the 16-token badge contract"],
    ]) {
      if (!utilsSrc.includes(needle)) {
        failures.push(`(cus) theme-utils.ts must contain ${JSON.stringify(needle)} — ${label}`);
      }
    }
  }
  const mathPath = resolve(root, "playground/sig-contrast.ts");
  if (!existsSync(mathPath)) {
    failures.push("(cus) playground/sig-contrast.ts is missing — the shared WCAG math module");
  }
  const contrastGateSrc = readFileSync(resolve(root, "playground/verify-contrast.mjs"), "utf8");
  if (!contrastGateSrc.includes('from "./sig-contrast.ts"')) {
    failures.push('(cus) verify-contrast.mjs must import the shared math from "./sig-contrast.ts" (badge ratio == gate ratio)');
  }
  for (const [needle, label] of [
    ["const sig = useSigTheme(workspaceRepo);", "the Shell owns the ONE theme-state instance (3.6.0: with the repository leg)"],
    ["id: \"theme-mocha\"", "palette command: Theme: Mocha"],
    ["id: \"theme-oled\"", "palette command: Theme: OLED"],
    ["id: \"theme-daylight\"", "palette command: Theme: Daylight"],
    ["id: \"radius-standard\"", "palette command: Radius: Standard"],
    ["id: \"radius-sharp\"", "palette command: Radius: Sharp"],
    ["id: \"download-tokens-css\"", "palette command: Download tokens.css"],
    ["id: \"copy-css-variables\"", "palette command: Copy CSS Variables"],
    ['label: "Theme: Mocha"', "palette label: Theme: Mocha"],
    ['label: "Theme: OLED"', "palette label: Theme: OLED"],
    ['label: "Theme: Daylight"', "palette label: Theme: Daylight"],
    ['label: "Radius: Standard"', "palette label: Radius: Standard"],
    ['label: "Radius: Sharp"', "palette label: Radius: Sharp"],
    ['label: "Download tokens.css"', "palette label: Download tokens.css"],
    ['label: "Copy CSS Variables"', "palette label: Copy CSS Variables"],
    ["customizer={", "the panel slots into PatternStudioView"],
    ["sig.setTheme", "the commands drive the lifted state"],
  ]) {
    if (!appSrc.includes(needle)) {
      failures.push(`(cus) App.tsx must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  const studioSrc = readFileSync(resolve(root, "playground/components/PatternStudio.tsx"), "utf8");
  for (const [needle, label] of [
    ["customizer?: ReactNode", "the customizer slot prop"],
    ['data-testid="studio-customizer-slot"', "the slot hook at the top of the stream"],
  ]) {
    if (!studioSrc.includes(needle)) {
      failures.push(`(cus) PatternStudio.tsx must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  for (const [needle, label] of [
    [".studio__customizer-slot", "the slot layout rule"],
    [".studio__customizer-btn[aria-pressed=\"true\"]", "the pressed-state paint (attribute-driven)"],
    [".studio__contrast-badge[data-tier=\"pass\"]", "the green tier"],
    [".studio__contrast-badge[data-tier=\"amber\"]", "the amber tier"],
    [".studio__contrast-badge[data-tier=\"fail\"]", "the red tier"],
    ["var(--sig-green)", "the pass ink token"],
    ["var(--sig-yellow)", "the amber ink token"],
    ["var(--sig-peach)", "the fail ink token"],
  ]) {
    if (!stylesCss.includes(needle)) {
      failures.push(`(cus) styles.css must contain ${needle} — ${label}`);
    }
  }
}

// ---- (tpl1) THE FULL-PAGE TEMPLATE REGISTRY (3.8.0) ------------------------------
// The templates dir + the registry + the SNIPPET data layer: exactly three
// entries, each carrying id/name/description/Component/source, the source
// strings mechanically derived from the shipped .tsx files (registry parity),
// package-only imports, embedded <style>, reduced-motion guards, zero hex.
const registryPath = join(playground, "template-registry.ts");
const sourcesPath = join(playground, "template-sources.ts");
if (!existsSync(registryPath) || !existsSync(sourcesPath)) {
  failures.push("(tpl1) playground/template-registry.ts + playground/template-sources.ts must exist — the full-page template registry");
} else {
  const registrySrc = readFileSync(registryPath, "utf8");
  const sourcesSrc = readFileSync(sourcesPath, "utf8");
  const TPL1_REGISTRY_NEEDLES = [
    ["PAGE_TEMPLATES: Array<{", "the typed PAGE_TEMPLATES array"],
    ['id: "saas"', "entry: saas"],
    ['id: "docs"', "entry: docs"],
    ['id: "telemetry"', "entry: telemetry"],
    ["Component: SaasLandingTemplate", "saas carries the LIVE component"],
    ["Component: DocsReaderTemplate", "docs carries the LIVE component"],
    ["Component: TelemetryCenterTemplate", "telemetry carries the LIVE component"],
    ["source: TEMPLATE_SOURCES.saas", "saas carries its SNIPPET string"],
    ["source: TEMPLATE_SOURCES.docs", "docs carries its SNIPPET string"],
    ["source: TEMPLATE_SOURCES.telemetry", "telemetry carries its SNIPPET string"],
    ["TEMPLATE_SLUGS", "the breadcrumb slug map"],
  ];
  for (const [needle, label] of TPL1_REGISTRY_NEEDLES) {
    if (!registrySrc.includes(needle)) {
      failures.push(`(tpl1) template-registry.ts must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  // The three .tsx files: default export + package-only imports + embedded
  // style + reduced motion + zero hex.
  for (const [file, marker] of [
    ["SaasLandingTemplate.tsx", "SaasLanding"],
    ["DocsReaderTemplate.tsx", "DocsReader"],
    ["TelemetryCenterTemplate.tsx", "TelemetryCenter"],
  ]) {
    const tplSrc = readFileSync(join(playground, "templates", file), "utf8");
    if (!tplSrc.includes(`export default function ${marker}Template`)) {
      failures.push(`(tpl1) playground/templates/${file} must default-export ${marker}Template`);
    }
    if (!tplSrc.includes('from "@edwyn/signature-style/react"')) {
      failures.push(`(tpl1) playground/templates/${file} must import from @edwyn/signature-style/react (standalone purity)`);
    }
    if (!tplSrc.includes("<style>")) {
      failures.push(`(tpl1) playground/templates/${file} must carry its embedded <style> block (self-contained)`);
    }
    if (!tplSrc.includes("prefers-reduced-motion")) {
      failures.push(`(tpl1) playground/templates/${file} must carry the prefers-reduced-motion guard`);
    }
    const tplHexes = tplSrc.match(/#[0-9a-f]{3,8}\b/gi);
    if (tplHexes !== null) {
      failures.push(`(tpl1) playground/templates/${file} contains hex literal(s) ${[...new Set(tplHexes)].join(", ")} — tokens only (zero hex)`);
    }
    // The SNIPPET leg mirrors the component file (the registry source must
    // equal the data-layer string).
    const escaped = tplSrc.trimEnd().replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
    if (!sourcesSrc.includes(escaped)) {
      failures.push(`(tpl1) template-sources.ts must embed ${file}'s content verbatim (the SNIPPET strings are mechanically derived — drift between the live component and the copy payload is forbidden)`);
    }
  }
  if (!/export type TemplateId = "saas" \| "docs" \| "telemetry"/.test(sourcesSrc)) {
    failures.push('(tpl1) template-sources.ts must declare TemplateId = "saas" | "docs" | "telemetry"');
  }
}

// ---- (tpl2) THE TEMPLATES STUDIO (3.8.0) ------------------------------------------
// The #/templates view: nav item + palette jumps + breadcrumbs, the FLIP
// template tabs, the viewport emulator, the scoped theme switcher, the
// Preview/Code toggle and Copy Full Page — plus the studio chrome css.
{
  const studioSrc = readFileSync(join(playground, "components", "TemplatesStudio.tsx"), "utf8");
  const TPL2_APP_NEEDLES = [
    ['templates: "#/templates"', "the view href"],
    ['"#/templates": "templates"', "the routing table entry"],
    ['| "templates"', "the View union grows"],
    ['{ href: VIEW_HREFS.templates, label: "Templates" }', "the nav item"],
    ["view === \"templates\" ? (", "the render branch"],
    ["<TemplatesStudioView activeId={activeTemplate} onActiveChange={setActiveTemplate} />", "the controlled studio mount"],
    ["const [activeTemplate, setActiveTemplate] = useState<TemplateId>(\"saas\")", "the LIFTED active-template state"],
    ["TEMPLATE_SLUGS[activeTemplate]", "the breadcrumbs read the slug (engine / templates / saas-landing)"],
    ['id: "view-templates"', "the palette view jump"],
    ["Templates: ${template.name}", "the palette per-template jumps"],
    ['title: "THE TEMPLATES STUDIO"', "the hero"],
    ["three full-page blueprints · preview, theme & copy · one CLI command each", "the hero subtitle"],
  ];
  for (const [needle, label] of TPL2_APP_NEEDLES) {
    if (!appSrc.includes(needle)) {
      failures.push(`(tpl2) App.tsx must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  const TPL2_STUDIO_NEEDLES = [
    ["data-testid=\"tpl-studio-bar\"", "the sticky control bar"],
    ["data-testid={`tpl-viewport-${tab.id}`}", "the viewport emulator segmented control"],
    ["data-testid={`tpl-theme-${tab.id}`}", "the theme segmented control"],
    ['data-testid="tpl-copy-full"', "the Copy Full Page button"],
    ['data-testid="tpl-stage"', "the stage"],
    ['data-testid="tpl-preview"', "the live preview mount"],
    ['data-testid="tpl-code"', "the Full TSX Code pre/code"],
    ['data-testid="tpl-copied-chip"', "the mint confirmation chip"],
    ["STAGE_WIDTHS", "the Desktop/Tablet/Mobile width map"],
    ['tablet: "768px"', "the tablet width"],
    ['mobile: "375px"', "the mobile width"],
    ['"100%"', "the desktop width"],
    ['data-sig-theme={theme === "mocha" ? undefined : theme}', "the SCOPED theme switch (attribute on the stage wrapper; mocha = absent)"],
    ["onChange={(id) => onActiveChange(id as TemplateId)}", "the FLIP template tabs drive the lifted state"],
    ["{active?.source ?? \"\"}", "Code renders the registry source"],
    ["--sig-mint", "the mint accent (the copied chip; the owner note — not mint-glow)"],
    ["role=\"status\"", "the copied chip announces politely"],
  ];
  for (const [needle, label] of TPL2_STUDIO_NEEDLES) {
    if (!studioSrc.includes(needle)) {
      failures.push(`(tpl2) TemplatesStudio.tsx must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  const TPL2_CSS_NEEDLES = [
    [".tpl-studio__bar {", "the control bar rule"],
    ["position: sticky;", "the bar is sticky"],
    ["z-index: var(--z-sticky);", "the bar rides the sticky rung"],
    ["backdrop-filter: blur(8px)", "the glass"],
    ["transition: width var(--dur-glide) var(--ease-glide);", "the emulator's width transition (layout work IS the point)"],
    [".tpl-studio__copied[data-visible=\"true\"] {", "the mint chip's visible state"],
    ["color: var(--sig-mint);", "the mint ink"],
    [".tpl-studio__code {", "the code well"],
    ["@media (prefers-reduced-motion: reduce)", "the studio's reduced-motion guard"],
    [".tpl-studio__stage {", "the stage rule"],
  ];
  for (const [needle, label] of TPL2_CSS_NEEDLES) {
    if (!stylesCss.includes(needle)) {
      failures.push(`(tpl2) styles.css must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  // The theme-scope mechanism, documented in the css: the tokens.css theme
  // blocks are PLAIN attribute selectors, so a div wrapper re-themes its
  // subtree (the tokens.css file itself is FROZEN — the claim lives here).
  if (!stylesCss.includes("data-sig-theme for the SCOPED preview")) {
    failures.push("(tpl2) styles.css must document the scoped theme mechanism (the stage wrapper carries data-sig-theme; the theme blocks are plain attribute selectors)");
  }
  const studioHexes = studioSrc.match(/#[0-9a-f]{3,8}\b/gi);
  if (studioHexes !== null) {
    failures.push(`(tpl2) TemplatesStudio.tsx contains hex literal(s) ${[...new Set(studioHexes)].join(", ")} — tokens only (zero hex)`);
  }
}

// ---- verdict ----------------------------------------------------------------------
if (failures.length > 0) {
  console.error("FAIL");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("PASS — playground gates (b1)-(b7) + (h1)-(h3) + (e1)-(e2) + (m1)-(m3) + (g2)-(g3) + (n-hub1)-(n-hub4) + (sp1) + (ix1)-(ix2) + (s1)-(s2) + (v22) + (dd1)-(dd6) + ed1)-(ed4) + (icons) + (showcase) + (af1)-(af3) + (b12)/(sh1)/(ff1)/(pw1)/(bt1)/(cd1)/(al1) + 2.6.0 (acc1)/(elev)/(pt11)/(cc1)-(cc5)/(mi1) + 2.8.0 (nav5)/(ps-studio)/(ps-copy)/(ps-llms) + 2.9.0 (cq1)/(cmd1)/(sk1)/(bc1): scaffold, wiring, pack stays EXACTLY 58 (playground/tools files-array excluded), zero hex + 768px collapse, bento shape + hero + shed anatomy, icons probe, 3.1.0 PURE-RENAME RELEASE: (b7)/(n-hub4) rebased to v3.0.0 with the enumerated purge authorization, the (e2) baseline normalized through the rename map (a rename is not a deletion), the tokens.json guard proves sigPalette = the renamed 26 with VALUE identity per token (themes/doctrine/shared byte-equal), all copy needles ride the standalone vocabulary (Workspace Member & Resource Allocation, attendance, chromatic palette, benchmark matchups, the three gateways Bento Workbench / Interactive Graph & Planner / Pattern Studio), storage keys sig.workspace.v3.*, snapshot signature-workspace.json; 2.2.0-2.9.1 gates intact (surface anatomy, data/editorial css, bento, shell, FormField anatomy, PasswordInput, Button family, archetypes, ledger align, accent contract, elevation ladder, token sweep, master index, five REAL views, studio/copy/llms gates, container queries, CommandPalette, skeletons, Breadcrumbs, ct1/sk1); 3.0.0 intact: (chrom) the 26-token family (blue retired, cobalt carries #89b4fa), verify:contrast green at the 26-token table, (sch) shared/schema.ts (Attendee/attendance) + docs/SCHEMA_V3.md, (par) card parity, (car3) carousel modes, (ff2) symmetrical fields, (ring2) ring zoom, (ob1) obsidian graph, (pf1) memo/debounce/contain, (bd1) backdrop audit; purity (Task 4): the standalone gate greps the working tree for the banned domain words — zero matches, no allowlist needed outside this file's 4 pinned gate-machinery mentions; ; 3.6.0 GRAPH STUDIO RELEASE: (b7)/(n-hub4) REBASED to v3.5.0 with the enumerated a11y/carousel/studio authorization (css cards/editorial/graph/timeline + the react package quartet + the gates + goldens; demo/ bin/ verify.mjs byte-untouched), the tokens guard evolved for the TWO-TIER policy (--text-muted value-only; sigPalette contrastTier metadata on the 11 ink tokens + the three display-tier description extensions; VALUES byte-equal), the six-view map (Workbench/Graph Studio/Analytics & Planner/Pattern Studio/Master Index/AI Codex — Chronicle off the nav, hash+palette reachable), the (gp1) Studio split needles (the component block + the workspace hook + the edge model GraphEdge), the (af3)/(car3) true page-deck needles, the (cmd1) ShortcutModal block, the (cus) merged prefs needles, meta.version → 3.6.0; 3.2.0 SURFACE ENGINE intact: (th3) the canonical theme blocks cross-checked against the manifest ink variants, (rad2) the radius presets (standard 8/12 — 8px-grid-pure; sharp 0), (cus) the live customizer (one useSigTheme owner, aria-pressed panel, 16 badges on the shared sig-contrast math, download/copy/snippet), verify:contrast green on ALL THREE themes under the TWO-TIER policy (ct8); 3.6.0 SHIP.");