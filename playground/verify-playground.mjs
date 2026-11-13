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

// exports/files/main/peerDependencies must be deep-equal to v1.4.0.
const FROZEN_KEYS = ["exports", "files", "main", "peerDependencies", "peerDependenciesMeta"];
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
}

// ---- (b3) npm pack still exactly 34 files ---------------------------------------
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
} else if (totalFiles[1] !== "34") {
  failures.push(
    `(b3) npm pack must yield exactly 34 files (playground/tools excluded by the files array), found ${totalFiles[1]}`,
  );
}

// ---- (b4) styles.css zero hex ----------------------------------------------------
const stylesCss = readFileSync(join(playground, "styles.css"), "utf8");
const styleHexes = stylesCss.match(/#[0-9a-f]{3,8}\b/gi);
if (styleHexes !== null) {
  failures.push(
    `(b4) playground/styles.css contains hex literal(s) ${[...new Set(styleHexes)].join(", ")} — 100% var()/color-mix only`,
  );
}
if (!stylesCss.includes("color-mix(in srgb, var(--text-muted) 15%, transparent)")) {
  failures.push("(b4) styles.css must draw the elevation card border with the 15% color-mix token blend");
}
if (!stylesCss.includes("max-width: 768px")) {
  failures.push("(b4) styles.css must collapse the hub grid at max-width: 768px");
}

// ---- (b5) App shape: provider nesting + hero + 4 hub cards -----------------------
const appSrc = readFileSync(join(playground, "App.tsx"), "utf8");
const APP_REQUIREMENTS = [
  ['from "@edwyn/signature-style/react"', "App imports the package through the exports map"],
  ["<ThemeProvider>", "the ThemeProvider wraps the tree"],
  ["<ToastProvider>", "the ToastProvider wraps the dashboard"],
  ["useToast()", "the toast hook drives the feedback card"],
  ["useModal<", "the modal hook drives the timeline card"],
  ['<GlobalNav items={NAV_ITEMS} as={navLink} activeHref={VIEW_HREFS[view]} />', "the global nav tops the page (2.1.0: rendered through the HubLink factory)"],
  ['<header className="hub__hero">', "the announcing hero header (n-hub2)"],
  ['title: "THE ENGINE"', "the hero announces THE ENGINE (n-hub2, per-view HERO_COPY)"],
  ['<p className="hub__hero-sub">', "the hero subtitle element (n-hub2)"],
  ["every primitive, one dashboard · live showcase", "the dashboard hero subtitle string (n-hub2)"],
  ['className="hub"', "the single hub grid container"],
  ['<div className="hub__meta">', "the shed meta row on every card (n-hub3)"],
  ['<span className="hub__label">', "the teal all-caps label (n-hub3)"],
  ['<span className="hub__path">', "the muted mono source path (n-hub3)"],
  ["hub__card--forms", "card 1 — form controls"],
  ["hub__card--timeline", "card 2 — timeline + modal"],
  ["hub__card--telemetry", "card 3 — telemetry"],
  ["hub__card--palette", "card 4 — party palette"],
  ["components/forms.tsx", "card 1 declares its source path"],
  ["components/timeline.tsx", "card 2 declares its source path"],
  ["components/viz.tsx", "card 3 declares its source path"],
  ["components/primitives.tsx", "card 4 declares its source path"],
  ['className="hub__btn"', "the primary action echoes btn-primary"],
  ["PartyBadge", "the palette card renders party badges"],
  ["StatRing", "the telemetry card renders the ring"],
  ["onEventSelect={modal.open}", "timeline nodes open the modal"],
];
for (const [needle, label] of APP_REQUIREMENTS) {
  if (!appSrc.includes(needle)) {
    failures.push(`(b5) App.tsx must contain ${needle} — ${label}`);
  }
}
// 2.1.0: the 4-card audit counts INSIDE the dashboard branch only — the
// view switcher added placeholder/gateway cards elsewhere in the file.
const dashStart = appSrc.indexOf("function DashboardView");
const dashEnd = appSrc.indexOf("function IndexView");
if (dashStart === -1 || dashEnd === -1 || dashEnd < dashStart) {
  failures.push("(b5) DashboardView…IndexView functions missing — the dashboard branch cannot be audited");
} else {
  const dashSlice = appSrc.slice(dashStart, dashEnd);
  const sectionCount = (dashSlice.match(/<section className="hub__card /g) ?? []).length;
  if (sectionCount !== 4) {
    failures.push(`(b5) the dashboard branch must have exactly 4 card sections, found ${sectionCount}`);
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
if (!stylesCss.includes("@keyframes slideUpFade")) {
  failures.push("(h1) styles.css must declare @keyframes slideUpFade");
}
if (!stylesCss.includes("animation: slideUpFade 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards")) {
  failures.push(
    "(h1) .hub__card must animate slideUpFade 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
  );
}
if (!/\.hub__card\s*\{[^}]*opacity: 0;/s.test(stylesCss)) {
  failures.push("(h1) .hub__card needs the opacity: 0 animation base");
}
for (const [child, delay] of [[1, "0.1s"], [2, "0.2s"], [3, "0.3s"], [4, "0.4s"]]) {
  const stagger = new RegExp(
    `\\.hub__card:nth-child\\(${child}\\)\\s*\\{[^}]*animation-delay: ${delay.replace(".", "\\.")};`,
    "s",
  );
  if (!stagger.test(stylesCss)) {
    failures.push(`(h1) .hub__card:nth-child(${child}) must stagger at animation-delay: ${delay}`);
  }
}
const reduceEscape = /@media \(prefers-reduced-motion: reduce\)\s*\{[^}]*\.hub__card\s*\{[^}]*animation: none;[^}]*opacity: 1;/s;
if (!reduceEscape.test(stylesCss)) {
  failures.push(
    "(h1) MANDATORY prefers-reduced-motion: reduce escape missing — without animation: none + opacity: 1, reduced-motion users get permanently invisible cards",
  );
}
if (!stylesCss.includes(".hub__card > h2")) {
  failures.push("(h1) ruled headers expected on .hub__card > h2 (child combinator — package timeline h2s stay untouched)");
}
if (!stylesCss.includes("padding-bottom: var(--space-tight)")) {
  failures.push("(h1) ruled headers need padding-bottom: var(--space-tight)");
}
if (!stylesCss.includes("border-bottom: 1px solid color-mix(in srgb, var(--text-muted) 10%, transparent)")) {
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

// ---- (e1) AMBIENT ELEVATION markers + package css/ ZERO-box-shadow scan ----------
// OWNER OVERRIDE (1.6.0, reaffirmed 1.8.0 + 2.0.0): the elevation styles below
// are REQUIRED in the composition layer (playground/styles.css) — and REQUIRED
// TO STAY OUT of the package (css/), where the zero-box-shadow doctrine holds.
const ELEVATION_REQUIREMENTS = [
  ["inset 0 1px 0 rgba(255, 255, 255, 0.05)", "the glass inset top-highlight on .hub__card"],
  ["0 12px 32px rgba(0, 0, 0, 0.4)", "the soft ambient shadow on .hub__card"],
  ["color-mix(in srgb, var(--text-muted) 15%, transparent)", "the 15% elevation card border"],
  ["font-weight: 600", "the button hierarchy pop (was 500)"],
  ["0 4px 16px rgba(0, 0, 0, 0.3)", "the button's own elevation"],
];
for (const [needle, label] of ELEVATION_REQUIREMENTS) {
  if (!stylesCss.includes(needle)) {
    failures.push(`(e1) styles.css must contain ${needle} — ${label}`);
  }
}
// The doctrine boundary, enforced: EVERY package css file stays flat.
for (const rel of readdirSync(resolve(root, "css")).map((f) => join("css", f))) {
  const text = readFileSync(resolve(root, rel), "utf8");
  const shadowDecls = text.match(/box-shadow\s*:\s*[^;]+;/g);
  const nonNoneShadows = (shadowDecls ?? []).filter((d) => !/^box-shadow\s*:\s*none\s*;$/i.test(d));
  if (nonNoneShadows.length > 0) {
    failures.push(
      `(e1) ${rel} declares a box-shadow (${nonNoneShadows.join(" ")}) — ambient elevation is composition-layer ONLY; the package stays flat`,
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

// ---- (b7) SAFETY PROOF: core files untouched since v1.4.0 ------------------------
// 1.6.0 exception: css/timeline.css is governed by (e2) — additions-only,
// whitelisted properties — so the blanket freeze excludes it.
const LOCKED_PATHS = ["css/", "react/", "tokens.json", "SYSTEM_PROMPT.md", "demo/", "scripts/"];
let safetyDiff = "";
try {
  safetyDiff = execFileSync(
    "git",
    ["diff", "v1.4.0", "--", ...LOCKED_PATHS, ":(exclude)css/timeline.css"],
    { cwd: root, encoding: "utf8" },
  );
} catch (error) {
  failures.push(`(b7) could not diff against v1.4.0 — ${(error instanceof Error ? error.message : String(error)).split("\n")[0]}`);
}
if (safetyDiff.trim() !== "") {
  failures.push(
    "(b7) SAFETY: core package files changed since v1.4.0 — css/ (except timeline.css per e2) react/ tokens.json SYSTEM_PROMPT.md demo/ scripts/ are LOCKED",
  );
}

// ---- (n-hub4) THE V2.0.0 FROZEN PROOF — v1.8.0 baseline, tools/ included ---------
// The hub migration is a PLAYGROUND-ONLY release: every package file plus
// tools/ must be byte-identical to v1.8.0. (e2) governs timeline.css's
// additions-only rule within that freeze; the blanket scan here must stay
// empty — and it is, because nothing under these paths changed.
const V2_LOCKED_PATHS = ["css/", "react/", "tokens.json", "demo/", "SYSTEM_PROMPT.md", "scripts/", "tools/"];
let v2SafetyDiff = "";
try {
  v2SafetyDiff = execFileSync(
    "git",
    ["diff", "v1.8.0", "--", ...V2_LOCKED_PATHS],
    { cwd: root, encoding: "utf8" },
  );
} catch (error) {
  failures.push(`(n-hub4) could not diff against v1.8.0 — ${(error instanceof Error ? error.message : String(error)).split("\n")[0]}`);
}
if (v2SafetyDiff.trim() !== "") {
  failures.push(
    "(n-hub4) SAFETY: files changed since v1.8.0 — css/ react/ tokens.json demo/ SYSTEM_PROMPT.md scripts/ AND tools/ are LOCKED for the hub migration (playground presentation layer only)",
  );
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
// 2.0.0 RENAME: card hooks that contained "bento" become hub-card-*; the
// metric and button hooks never referenced the grid name and stay.
const TESTID_NEEDLES = [
  ['data-testid="hub-card-forms"', "the forms card hook"],
  ['data-testid="hub-card-timeline"', "the timeline card hook"],
  ['data-testid="hub-card-telemetry"', "the telemetry card hook"],
  ['data-testid="hub-card-palette"', "the palette card hook"],
  ['data-testid="metric-budget-remaining"', "the budget-remaining metric hook"],
  ['data-testid="metric-budget-spent"', "the budget-spent metric hook"],
  ['data-testid="metric-rsvp"', "the rsvp metric hook"],
  ['data-testid="btn-toast"', "the primary toast button hook"],
];
for (const [needle, label] of TESTID_NEEDLES) {
  if (!appSrc.includes(needle)) {
    failures.push(`(m3) App.tsx must carry ${needle} — ${label}`);
  }
}
// The bento era must be gone from the DOM CONTRACT — classes and testids.
// Comments may still tell the migration story (App.tsx's header does).
if (/(className|data-testid)="[^"]*bento/.test(appSrc)) {
  failures.push("(m3) App.tsx still wires bento-era classes/testids — the hub migration must be complete");
}

// ---- (n-hub1) THE CONSTRAINED COLUMN — the 2.0.0 hub grid ------------------------
// max-width 1400px, centered; auto-fit minmax(400px, 1fr) packs the cards —
// the 1.8.0 hand-placed asymmetric stage is retired. The 768px collapse and
// the stagger stay pinned by (b4)/(h1).
const hubContainer = /^\.hub \{[^}]*max-width: 1400px;[^}]*grid-template-columns: repeat\(auto-fit, minmax\(400px, 1fr\)\);/sm;
if (!hubContainer.test(stylesCss)) {
  failures.push(
    "(n-hub1) styles.css must declare the constrained hub column — .hub { max-width: 1400px; … grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); }",
  );
}
const hubSpan = /\.hub__card--timeline\s*\{[^}]*grid-row: span 2;/s;
if (!hubSpan.test(stylesCss)) {
  failures.push(
    "(n-hub1) .hub__card--timeline must span two rows (grid-row: span 2) — cortex-probed: the single auto-fit void equals one card's area, so the owner fallback does NOT trigger",
  );
}

// ---- (n-hub2) THE ANNOUNCED HEADER — checked in (b5) App needles -----------------
// (the hero strings live in APP_REQUIREMENTS; this comment anchors the
// suite numbering — n-hub2 has no styles.css side)

// ---- (n-hub3) THE SHED CARD ANATOMY + TACTILE HOVER ------------------------------
const metaRow = /\.hub__meta\s*\{[^}]*justify-content: space-between;[^}]*align-items: baseline;/s;
if (!metaRow.test(stylesCss)) {
  failures.push(
    "(n-hub3) .hub__meta must be space-between + baseline (teal label left, mono path right)",
  );
}
const tealLabel = /\.hub__label\s*\{[^}]*color: var\(--color-cake-secondary\);[^}]*text-transform: uppercase;/s;
if (!tealLabel.test(stylesCss)) {
  failures.push(
    "(n-hub3) .hub__label must be the signature teal (var(--color-cake-secondary)) with text-transform: uppercase (content stays capitalized words)",
  );
}
const monoPath = /\.hub__path\s*\{[^}]*font-family: var\(--font-mono, ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace\);[^}]*color: var\(--text-muted\);/s;
if (!monoPath.test(stylesCss)) {
  failures.push(
    '(n-hub3) .hub__path must be muted mono — font-family: var(--font-mono, ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace) + var(--text-muted)',
  );
}
const hoverLift = /\.hub__card:hover\s*\{[^}]*transform: translateY\(-2px\);[^}]*0 16px 40px rgba\(0, 0, 0, 0\.5\);/s;
if (!hoverLift.test(stylesCss)) {
  failures.push(
    "(n-hub3) .hub__card:hover must lift translateY(-2px) with the deepened 0 16px 40px rgba(0, 0, 0, 0.5) ambient shadow — the tactile half of the owner elevation override",
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
const nodeShadow = /\.hub__card \.ptp-timeline__node\s*\{[^}]*box-shadow: 0 4px 12px rgba\(0, 0, 0, 0\.2\);/s;
if (!nodeShadow.test(stylesCss)) {
  failures.push(
    "(g2) styles.css must carry the composition-layer node elevation — .hub__card .ptp-timeline__node { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); }",
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

// ---- (ix1) THE VIEW SWITCHER — View type, HubLink, EmptyState dogfood --------
const INDEX_REQUIREMENTS = [
  ['type View = "dashboard" | "index" | "events" | "guests" | "budget"', "the view union type"],
  ['useState<View>("dashboard")', 'the default view stays "dashboard" — the cortex smoke must find the timeline on load'],
  ["function HubLink(", "the playground's link renderer for GlobalNav's as prop"],
  ["onNavigate: (href: string) => void", "the navigation callback contract"],
  ["event.preventDefault()", "no full-reload anchor navigation (negative-test target)"],
  ["function createHubLink(", "the factory closure feeding onNavigate/activeHref through GlobalNav's as contract"],
  ["as={navLink}", "the nav renders through the HubLink factory"],
  ['{ href: VIEW_HREFS.index, label: "Index" }', "the Index nav destination"],
  ['"#/index": "index"', "the index routing entry"],
  ["<EmptyState", "the workshop placeholders dogfood the package EmptyState primitive"],
  ['icon="Hammer"', "the workshop icon"],
  ['title: "THE MASTER INDEX"', "the index hero title"],
  ["three doors · one engine · zero dead ends", "the index hero subtitle"],
];
for (const [needle, label] of INDEX_REQUIREMENTS) {
  if (!appSrc.includes(needle)) {
    failures.push(`(ix1) App.tsx must contain ${JSON.stringify(needle)} — ${label}`);
  }
}

// ---- (ix2) THE THREE GATEWAYS — exact Shed anatomy strings -------------------
const GATEWAYS = [
  ["PLANNER", "views/planner.tsx", "Event Planner Bento"],
  ["STUDY", "modules/study.tsx", "Study & Flashcard Generator"],
  ["GAMES", "modules/games.tsx", "Party Game Modules"],
];
for (const [label, path, title] of GATEWAYS) {
  for (const [needle, what] of [
    [`label: "${label}"`, `label ${label}`],
    [`path: "${path}"`, `path ${path}`],
    [`title: "${title}"`, `title ${title}`],
  ]) {
    if (!appSrc.includes(needle)) {
      failures.push(`(ix2) App.tsx must declare the gateway ${what} — ${JSON.stringify(needle)}`);
    }
  }
}
// The three cards come from ONE mapped wiring; the per-card count lives in
// the runtime probe — here we pin the wiring + the gateways array shape.
if (!appSrc.includes("const gateways: Gateway[] = [")) {
  failures.push("(ix2) App.tsx must declare `const gateways: Gateway[]` — the master index card list");
}
if (!appSrc.includes('data-testid={`gateway-${gateway.label.toLowerCase()}`}') && !appSrc.includes('data-testid={`gateway-${')) {
  failures.push("(ix2) App.tsx must wire data-testid={`gateway-<label> hooks on the gateway cards");
}
const indexColumn = /\.hub--index\s*\{[^}]*max-width: 900px;/s;
if (!indexColumn.test(stylesCss)) {
  failures.push(
    "(ix2) styles.css must constrain the index column — .hub--index { max-width: 900px; } (three doors read better narrow, owner call)",
  );
}

// ---- verdict ----------------------------------------------------------------------
if (failures.length > 0) {
  console.error("FAIL");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("PASS — playground gates (b1)-(b7) + (h1)-(h3) + (e1)-(e2) + (m1)-(m3) + (g2)-(g3) + (n-hub1)-(n-hub4) + (sp1) + (ix1)-(ix2): scaffold, wiring, pack=34, zero hex + elevation border, hub shape + hero + shed anatomy (4 cards audited INSIDE the dashboard branch), icons, v1.4.0 safety diff empty (timeline.css additions-only per e2) AND v1.8.0 frozen proof incl. tools/ (n-hub4), stagger + reduced-motion escape, mockEvents hydration + mapping, live-map icon probes, ambient-elevation markers + package css/ zero-box-shadow scan, timeline resurrection needles + EMPTY v2.0.0 allowlist vs v1.8.0, visual cortex dist + smoke wiring + hub testid hooks (bento era fully retired), constrained hub column + timeline span + announced hero + teal/mono anatomy + hover lift + metric air mandate + glass header/node-elevation doctrine boundary + telemetry spacing, MEASURED header breathing room (slab + mirrored group-first clearance, ≥16px contract) and the Master Index (View switcher + HubLink factory + preventDefault + EmptyState dogfood + three exact gateways in the 900px column)");
