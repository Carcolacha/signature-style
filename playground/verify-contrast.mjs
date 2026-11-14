#!/usr/bin/env node
/**
 * verify-contrast.mjs — THE ZERO CONTRAST DEBT GATE (2.9.1; grown 3.0.0).
 *
 * The 2.9.0 hostile audit's (a4) contrast spot-check flagged two party
 * tokens under WCAG 3:1 (the "graphical objects / large text" floor) on
 * the Mocha surface. 2.9.1 fixed them at the SOURCE (css/tokens.css +
 * tokens.json); THIS gate makes the debt forever impossible to re-borrow.
 * 3.0.0 grows the table 11 → 26 (the 16-color chromatic expansion) and
 * declares the contract in two tiers:
 *
 *   (ct1) every INK-FLOOR token — the original 11 (cobalt now carries
 *         blue's value) — measures ≥ 3.0:1 against BOTH --bg-surface
 *         (#313244) and --bg-base (#1E1E2E);
 *   (ct2) the 2.9.1-fixed token --sig-mauve-bright carries the
 *         stricter 3.1:1 bar on BOTH backgrounds (headroom included);
 *   (ct3) the fixed/pinned hexes are exactly the release's chosen
 *         values — mauve-bright #9e5ff2 (the minimal in-family step)
 *         and cobalt #89b4fa (the retired blue's value, carried);
 *   (ct4) 3.0.0 — the 15 CHROMATIC tokens are DECLARED FILL/SERIES
 *         accents (bars, node rings, borders, tinted wells — never
 *         body-text ink; roles documented in tokens.json) and assert
 *         the ≥ 2.0:1 VISIBILITY floor vs surface. Computed 3.0.0
 *         values: every token clears it — the lowest is crimson at
 *         3.01:1; NO token needed a minimally-adjusted value.
 *
 * The ratios are computed per WCAG 2.x relative luminance (the sRGB
 * linearization + the 0.2126/0.7152/0.0722 weights), hex → L* →
 * (L1+0.05)/(L2+0.05). Tokens are read from the FIRST :root block of
 * css/tokens.css (comments stripped) — the single source of truth the
 * browser actually paints. Prints the full 26-token table; prints FAIL +
 * the offending ratios and exits 1 on any violation.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

/** WCAG 2.x relative luminance of a #rrggbb hex. */
function luminance(hex) {
  const raw = hex.replace("#", "");
  const full = raw.length === 3 ? [...raw].map((c) => c + c).join("") : raw;
  if (!/^[0-9a-f]{6}$/i.test(full)) throw new Error(`not a 6-digit hex: ${hex}`);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255).map(
    (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)),
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio, order-independent. */
function contrast(fg, bg) {
  const [l1, l2] = [luminance(fg), luminance(bg)].sort((a, z) => z - a);
  return (l1 + 0.05) / (l2 + 0.05);
}

// ---- read the live :root block (comments stripped, first = mocha default) ----
const css = readFileSync(resolve(root, "css", "tokens.css"), "utf8");
const rootBlock = css
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .match(/:root\s*\{([^}]*)\}/);
if (rootBlock === null) {
  console.error("FAIL — cannot find the :root block in css/tokens.css");
  process.exit(1);
}
const tokens = {};
for (const match of rootBlock[1].matchAll(/(--[a-z0-9-]+)\s*:\s*(#[0-9a-f]{6})\s*;/gi)) {
  tokens[match[1].toLowerCase()] = match[2].toLowerCase();
}

const SURFACE = tokens["--bg-surface"];
const BASE = tokens["--bg-base"];
if (SURFACE === undefined || BASE === undefined) {
  console.error("FAIL — --bg-surface / --bg-base missing from the :root block");
  process.exit(1);
}

/** The 26-token table: ink-floor tokens (3.0 bar; the 2.9.1 fix at 3.1)
 *  + the 3.0.0 chromatic fills (2.0 visibility bar, surface only). */
const INK_FLOOR = [
  ["--sig-pink-bright", null],
  ["--sig-pink-soft", null],
  ["--sig-pink-alt", null],
  ["--sig-mauve-bright", "#9e5ff2"], // 2.9.1: was #8839ef (2.32:1 surface) — 3.1 bar
  ["--sig-mauve-soft", null],
  ["--sig-lavender", null],
  ["--sig-sky", null],
  ["--sig-cobalt", "#89b4fa"], // 3.0.0: the retired blue's value, carried
  ["--sig-peach", null],
  ["--sig-green", null],
  ["--sig-yellow", null],
];
const CHROMATIC_FILLS = [
  ["--sig-orchid", "#F5C2E7"],
  ["--sig-cyan", "#64DFDF"],
  ["--sig-magenta", "#CF64DF"],
  ["--sig-mint", "#64DF99"],
  ["--sig-spring", "#6EDF64"],
  ["--sig-citron", "#DBDF64"],
  ["--sig-violet-glow", "#C29EFF"],
  ["--sig-pink-glow", "#F29EFF"],
  ["--sig-rose-glow", "#FF9EDB"],
  ["--sig-lime-glow", "#DBFF9E"],
  ["--sig-mint-glow", "#9EFFC2"],
  ["--sig-crimson", "#F22222"],
  ["--sig-azure", "#228AF2"],
  ["--sig-tangerine", "#F25622"],
  ["--sig-neon-green", "#56F222"],
];
const PARTY = [...INK_FLOOR, ...CHROMATIC_FILLS];

// ---- (ct3)/(ct4) the pinned hexes are exactly the release's values ----------
for (const [name, pinned] of PARTY) {
  if (pinned !== null && tokens[name] !== pinned.toLowerCase()) {
    failures.push(`(ct3) ${name} must be ${pinned} in css/tokens.css — the pinned value, found ${tokens[name] ?? "MISSING"}`);
  }
}
if (!PARTY.every(([name]) => tokens[name] !== undefined)) {
  const missing = PARTY.map(([name]) => name).filter((name) => tokens[name] === undefined);
  failures.push(`(ct1) the :root block is missing party token(s): ${missing.join(", ")}`);
}
// (chrom companion) the RETIRED name must be gone from the :root block.
if (tokens["--sig-blue"] !== undefined) {
  failures.push("(ct1) --sig-blue is retired (3.0.0) — its value lives on as --sig-cobalt");
}

// ---- the 26-token ratio table -------------------------------------------------
const pad = (text, width) => (text.length >= width ? text : text + " ".repeat(width - text.length));
console.log("");
console.log("PARTY PALETTE CONTRAST TABLE — WCAG 2.x relative luminance (3.0.0: 26 tokens)");
console.log(`  surface ${SURFACE} · base ${BASE} · ink floor 3.0:1 · 2.9.1 fix 3.1:1 · chromatic fills 2.0:1 (surface)`);
console.log("");
console.log(`  ${pad("token", 24)} ${pad("hex", 9)} ${pad("vs surface", 12)} ${pad("vs base", 9)} floor  verdict`);
console.log(`  ${"-".repeat(70)}`);
for (const [name, pinned] of PARTY) {
  const hex = tokens[name];
  if (hex === undefined) continue;
  const vsSurface = contrast(hex, SURFACE);
  const vsBase = contrast(hex, BASE);
  const chromatic = !INK_FLOOR.some(([inkName]) => inkName === name);
  // Ink-floor tokens: 3.0 on BOTH backgrounds (the 2.9.1 mauve fix: 3.1).
  // Chromatic fills: 2.0 visibility floor vs SURFACE (declared fill/series,
  // never body-text ink — base is informational here).
  const floor = chromatic ? 2.0 : pinned !== null ? 3.1 : 3.0;
  const ok = chromatic ? vsSurface >= floor : vsSurface >= floor && vsBase >= floor;
  const tag = chromatic
    ? "  ← 3.0.0 fill/series"
    : name === "--sig-cobalt"
      ? "  ← blue's value carried"
      : pinned !== null
        ? "  ← 2.9.1 fix"
        : "";
  console.log(
    `  ${pad(name, 24)} ${pad(hex, 9)} ${pad(vsSurface.toFixed(2) + ":1", 12)} ${pad(vsBase.toFixed(2) + ":1", 9)} ${String(floor.toFixed(1)).padEnd(5)}  ${ok ? "PASS" : "FAIL"}${tag}`,
  );
  if (vsSurface < floor) {
    failures.push(`(ct${chromatic ? "4" : pinned !== null ? "2" : "1"}) ${name} measures ${vsSurface.toFixed(3)}:1 on --bg-surface ${SURFACE} — floor ${floor}:1 (hex ${hex})`);
  }
  if (!chromatic && vsBase < floor) {
    failures.push(`(ct${pinned !== null ? "2" : "1"}) ${name} measures ${vsBase.toFixed(3)}:1 on --bg-base ${BASE} — floor ${floor}:1 (hex ${hex})`);
  }
}

// ---- verdict -------------------------------------------------------------------
if (failures.length > 0) {
  console.error("");
  console.error("FAIL — contrast gate");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("");
console.log("PASS — all 26 party tokens clear their floors (ink ≥3.0 on surface AND base; chromatic fills ≥2.0 on surface — zero contrast debt)");
