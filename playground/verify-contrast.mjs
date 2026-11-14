#!/usr/bin/env node
/**
 * verify-contrast.mjs — THE ZERO CONTRAST DEBT GATE (2.9.1).
 *
 * The 2.9.0 hostile audit's (a4) contrast spot-check flagged two party
 * tokens under WCAG 3:1 (the "graphical objects / large text" floor) on
 * the Mocha surface. 2.9.1 fixed them at the SOURCE (css/tokens.css +
 * tokens.json); THIS gate makes the debt forever impossible to re-borrow:
 *
 *   (ct1) every one of the 11 --party-* tokens measures ≥ 3.0:1 against
 *         BOTH --bg-surface (#313244) and --bg-base (#1E1E2E);
 *   (ct2) the two 2.9.1-fixed tokens measure ≥ 3.1:1 against BOTH
 *         backgrounds (the release's stricter bar, headroom included);
 *   (ct3) the fixed hexes are exactly the release's chosen values —
 *         --party-mauve-bright #9e5ff2 (the minimal in-family lightness
 *         step: H266°/S85% kept, L 58%→66%) and --party-blue #89b4fa
 *         (official Catppuccin Mocha Blue, the v3.0.0 --party-cobalt
 *         convergence target).
 *
 * The ratios are computed per WCAG 2.x relative luminance (the sRGB
 * linearization + the 0.2126/0.7152/0.0722 weights), hex → L* →
 * (L1+0.05)/(L2+0.05). Tokens are read from the FIRST :root block of
 * css/tokens.css (comments stripped) — the single source of truth the
 * browser actually paints. Prints the full ratio table; prints FAIL +
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

/** The 11-token whitelist (the (pt11) sweep's set) with the 2.9.1 pins. */
const PARTY = [
  ["--party-pink-bright", null],
  ["--party-pink-soft", null],
  ["--party-pink-alt", null],
  ["--party-mauve-bright", "#9e5ff2"], // 2.9.1: was #8839ef (2.32:1 surface)
  ["--party-mauve-soft", null],
  ["--party-lavender", null],
  ["--party-sky", null],
  ["--party-blue", "#89b4fa"], // 2.9.1: was #1e66f5 (2.56:1 surface)
  ["--party-peach", null],
  ["--party-green", null],
  ["--party-yellow", null],
];

// ---- (ct3) the fixed hexes are exactly the release's chosen values ----------
for (const [name, pinned] of PARTY) {
  if (pinned !== null && tokens[name] !== pinned) {
    failures.push(`(ct3) ${name} must be ${pinned} in css/tokens.css — the 2.9.1 contrast fix, found ${tokens[name] ?? "MISSING"}`);
  }
}
if (!PARTY.every(([name]) => tokens[name] !== undefined)) {
  const missing = PARTY.map(([name]) => name).filter((name) => tokens[name] === undefined);
  failures.push(`(ct1) the :root block is missing party token(s): ${missing.join(", ")}`);
}

// ---- the ratio table ---------------------------------------------------------
const pad = (text, width) => (text.length >= width ? text : text + " ".repeat(width - text.length));
console.log("");
console.log("PARTY PALETTE CONTRAST TABLE — WCAG 2.x relative luminance");
console.log(`  surface ${SURFACE} · base ${BASE} · floor 3.0:1 · the 2.9.1-fixed pair 3.1:1`);
console.log("");
console.log(`  ${pad("token", 22)} ${pad("hex", 9)} ${pad("vs surface", 12)} ${pad("vs base", 9)} verdict`);
console.log(`  ${"-".repeat(60)}`);
for (const [name, pinned] of PARTY) {
  const hex = tokens[name];
  if (hex === undefined) continue;
  const vsSurface = contrast(hex, SURFACE);
  const vsBase = contrast(hex, BASE);
  const floor = pinned !== null ? 3.1 : 3.0; // (ct2) the fixed pair carries the stricter bar
  const ok = vsSurface >= floor && vsBase >= floor;
  const fixed = pinned !== null ? "  ← 2.9.1 fix" : "";
  console.log(
    `  ${pad(name, 22)} ${pad(hex, 9)} ${pad(vsSurface.toFixed(2) + ":1", 12)} ${pad(vsBase.toFixed(2) + ":1", 9)} ${ok ? "PASS" : "FAIL"}${fixed}`,
  );
  if (vsSurface < floor) {
    failures.push(`(ct${pinned !== null ? "2" : "1"}) ${name} measures ${vsSurface.toFixed(3)}:1 on --bg-surface ${SURFACE} — floor ${floor}:1 (hex ${hex})`);
  }
  if (vsBase < floor) {
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
console.log("PASS — every party token clears its contrast floor on surface AND base (zero contrast debt)");
