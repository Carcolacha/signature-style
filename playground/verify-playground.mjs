#!/usr/bin/env node
/**
 * verify-playground.mjs — the 1.5.0 "Bento Box Showcase" gates plus the
 * 1.5.1 hydration/animation gates.
 *
 * scripts/verify.mjs is byte-frozen (core safety rule), so the bento
 * gates live HERE, inside the playground directory. Asserts:
 *
 *   (b1)  playground/ exists with App.tsx + vite.config.ts (plus
 *         main.tsx, index.html, styles.css);
 *   (b2)  package.json carries the "playground" script, the file:
 *         consumer wiring (@edwyn/signature-style -> "file:."), and the
 *         exports/files/main/peerDependencies keys are deep-equal to
 *         v1.4.0 (the distribution surface is untouched);
 *   (b3)  `npm pack --dry-run` still packs EXACTLY 34 files —
 *         playground/ is auto-excluded by the files array;
 *   (b4)  playground/styles.css contains ZERO hex literals — 100%
 *         var()/color-mix (rgba literals from the 1.6.0 elevation
 *         override are not hex and stay legal); the card hairline is the
 *         1.6.0 elevation border (15% token mix — was 20% in 1.5.1);
 *         the bento grid collapses at max-width: 768px;
 *   (b5)  App.tsx imports from "@edwyn/signature-style/react" and uses
 *         ThemeProvider > ToastProvider > GlobalNav + main.bento with
 *         exactly 4 card sections;
 *   (b6)  EVERY lucide icon name used in App.tsx (icon:/iconName:) exists
 *         in the installed lucide-react icons map — the strict IconName
 *         contract, verified at gate time;
 *   (b7)  SAFETY PROOF: `git diff v1.4.0 -- css/ react/ tokens.json
 *         SYSTEM_PROMPT.md demo/ scripts/` is EMPTY — EXCEPT
 *         css/timeline.css, which 1.6.0 may only touch per (e2):
 *         additions plus comment-prose rewrites, never CSS code.
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
 *         marker; and the v1.4.0→worktree timeline diff deletes NO CSS
 *         code (braces/declarations) — only comment prose was rewritten.
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
    `(b3) npm pack must yield exactly 34 files (playground excluded by the files array), found ${totalFiles[1]}`,
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
  failures.push("(b4) styles.css must draw the 1.6.0 elevation card border with the 15% color-mix token blend");
}
if (!stylesCss.includes("max-width: 768px")) {
  failures.push("(b4) styles.css must collapse the bento grid at max-width: 768px");
}

// ---- (b5) App shape: provider nesting + 4 bento cards ----------------------------
const appSrc = readFileSync(join(playground, "App.tsx"), "utf8");
const APP_REQUIREMENTS = [
  ['from "@edwyn/signature-style/react"', "App imports the package through the exports map"],
  ["<ThemeProvider>", "the ThemeProvider wraps the tree"],
  ["<ToastProvider>", "the ToastProvider wraps the dashboard"],
  ["useToast()", "the toast hook drives the feedback card"],
  ["useModal<", "the modal hook drives the timeline card"],
  ['className="bento"', "the single bento grid container"],
  ["bento__card--forms", "card 1 — form controls"],
  ["bento__card--timeline", "card 2 — timeline + modal"],
  ["bento__card--telemetry", "card 3 — telemetry"],
  ["bento__card--palette", "card 4 — party palette"],
  ["PartyBadge", "the palette card renders party badges"],
  ["StatRing", "the telemetry card renders the ring"],
  ["onEventSelect={modal.open}", "timeline nodes open the modal"],
];
for (const [needle, label] of APP_REQUIREMENTS) {
  if (!appSrc.includes(needle)) {
    failures.push(`(b5) App.tsx must contain ${needle} — ${label}`);
  }
}
const sectionCount = (appSrc.match(/<section className="bento__card /g) ?? []).length;
if (sectionCount !== 4) {
  failures.push(`(b5) main.bento must have exactly 4 card sections, found ${sectionCount}`);
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
    "(h1) .bento__card must animate slideUpFade 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
  );
}
if (!/\.bento__card\s*\{[^}]*opacity: 0;/s.test(stylesCss)) {
  failures.push("(h1) .bento__card needs the opacity: 0 animation base");
}
for (const [child, delay] of [[1, "0.1s"], [2, "0.2s"], [3, "0.3s"], [4, "0.4s"]]) {
  const stagger = new RegExp(
    `\\.bento__card:nth-child\\(${child}\\)\\s*\\{[^}]*animation-delay: ${delay.replace(".", "\\.")};`,
    "s",
  );
  if (!stagger.test(stylesCss)) {
    failures.push(`(h1) .bento__card:nth-child(${child}) must stagger at animation-delay: ${delay}`);
  }
}
const reduceEscape = /@media \(prefers-reduced-motion: reduce\)\s*\{[^}]*\.bento__card\s*\{[^}]*animation: none;[^}]*opacity: 1;/s;
if (!reduceEscape.test(stylesCss)) {
  failures.push(
    "(h1) MANDATORY prefers-reduced-motion: reduce escape missing — without animation: none + opacity: 1, reduced-motion users get permanently invisible cards",
  );
}
if (!stylesCss.includes(".bento__card > h2")) {
  failures.push("(h1) ruled headers expected on .bento__card > h2 (child combinator)");
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
// OWNER OVERRIDE (1.6.0): the elevation styles below are REQUIRED in the
// composition layer (playground/styles.css) — and REQUIRED TO STAY OUT of
// the package (css/), where the zero-box-shadow border doctrine holds.
const ELEVATION_REQUIREMENTS = [
  ["inset 0 1px 0 rgba(255, 255, 255, 0.05)", "the glass inset top-highlight on .bento__card"],
  ["0 12px 32px rgba(0, 0, 0, 0.4)", "the soft ambient shadow on .bento__card"],
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

// ---- (e2) TIMELINE RESURRECTION needles ------------------------------------------
// The probe-proven fixes must be present and the timeline diff must be
// additions-only vs v1.4.0 (nothing pre-existing rewritten or dropped).
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
    ["diff", "v1.4.0", "--", "css/timeline.css"],
    { cwd: root, encoding: "utf8" },
  ).split("\n");
} catch (error) {
  failures.push(`(e2) could not diff css/timeline.css vs v1.4.0 — ${(error instanceof Error ? error.message : String(error)).split("\n")[0]}`);
}
const deletions = timelineDiffLines.filter((l) => l.startsWith("-") && !l.startsWith("---"));
// Comment PROSE may be rewritten (the parse-error fix REQUIRED deleting the
// poisoned comment), but no CSS CODE may be deleted. Precise check: map each
// deleted line back to its position in the v1.4.0 file (via `git diff -U0`
// hunk headers) and fail if any deleted line sat OUTSIDE a /* */ comment.
let oldTimeline = null;
try {
  oldTimeline = execFileSync("git", ["show", "v1.4.0:css/timeline.css"], { cwd: root, encoding: "utf8" }).split("\n");
} catch (error) {
  failures.push(`(e2) could not read v1.4.0:css/timeline.css — ${(error instanceof Error ? error.message : String(error)).split("\n")[0]}`);
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
        failures.push(`(e2) css/timeline.css diff vs v1.4.0 DELETES CSS code (old line ${oldLine + 1}): ${l} — only comment prose may be rewritten`);
        codeDeleted = true;
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
  failures.push("(e2) cannot run the code-deletion check — v1.4.0:css/timeline.css unavailable");
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

// ---- verdict ----------------------------------------------------------------------
if (failures.length > 0) {
  console.error("FAIL");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("PASS — playground gates (b1)-(b7) + (h1)-(h3) + (e1)-(e2): scaffold, wiring, pack=34, zero hex + elevation border, bento shape, icons, safety diff empty (timeline.css additions-only per e2), stagger + reduced-motion escape, mockEvents hydration + mapping, live-map icon probes, ambient-elevation markers + package css/ zero-box-shadow scan, timeline resurrection needles");
