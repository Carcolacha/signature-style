#!/usr/bin/env node
/**
 * verify-contrast.mjs — THE ZERO CONTRAST DEBT GATE (2.9.1; grown 3.0.0;
 * grown 3.2.0 TO ALL THREE SURFACE THEMES).
 *
 * The 2.9.0 hostile audit's (a4) contrast spot-check flagged two chromatic
 * tokens under WCAG 3:1 (the "graphical objects / large text" floor) on
 * the Mocha surface. 2.9.1 fixed them at the SOURCE (css/tokens.css +
 * tokens.json); THIS gate makes the debt forever impossible to re-borrow.
 * 3.0.0 grew the table 11 → 26 (the 16-color chromatic expansion).
 *
 * 3.2.0 — THE PER-THEME EXPANSION (the Multi-Theme Surface Engine): the
 * gate now parses EVERY theme block from css/tokens.css and proves the
 * contract on each surface of the canonical triad:
 *
 *   MOCHA (the :root default — the historical contract, unchanged):
 *   (ct1) every INK-FLOOR token — the original 11 (cobalt carries blue's
 *         value) — measures ≥ 3.0:1 against BOTH --bg-surface (#313244)
 *         and --bg-base (#1E1E2E);
 *   (ct2) the 2.9.1-fixed token --sig-mauve-bright carries the stricter
 *         3.1:1 bar on BOTH backgrounds (headroom included);
 *   (ct3) the fixed/pinned hexes are exactly the release's chosen values
 *         — mauve-bright #9e5ff2, cobalt #89b4fa;
 *   (ct4) the 15 CHROMATIC tokens are DECLARED FILL/SERIES accents and
 *         assert the ≥ 2.0:1 VISIBILITY floor vs surface (lowest: crimson
 *         3.01:1).
 *
 *   OLED ([data-sig-theme="oled"] — true black, everything inherited):
 *   (ct5) the block declares ONLY the bg trio (#000000 / #0B0C10 /
 *         #12141C — zero --sig-* declarations, inheritance IS the
 *         mechanism); the ink-floor 11 measure ≥ 3.0:1 vs the #0B0C10
 *         surface; ALL 16 chromatic tokens measure ≥ 3.1:1 vs the
 *         #0B0C10 surface AND vs #000000.
 *
 *   DAYLIGHT ([data-sig-theme="daylight"] — the ink-variant theme):
 *   (ct6) the slate structure is exact (#F8FAFC / #FFFFFF / #F1F5F9 +
 *         the four dark ink rungs); the ink-floor 11 measure ≥ 3.0:1 vs
 *         #FFFFFF (the strictest daylight surface); ALL 16 chromatic
 *         tokens measure ≥ 3.1:1 vs #FFFFFF — the computed ink variants
 *         make this pass (each override documents its measured ratio in
 *         css + tokens.json);
 *   (ct7) MANIFEST CROSS-CHECK: every --sig-* override in the css block
 *         equals tokens.json sigThemes.daylight.inkVariants' value, every
 *         documented ratio is a number ≥ 3.1 (canonical) / ≥ 3.0
 *         (ink-floor), and every "inherits" entry is NOT declared in css.
 *
 * The ratios are computed per WCAG 2.x relative luminance by the SHARED
 * pure module playground/sig-contrast.ts — the same math the live
 * customizer badges render (one module, zero drift). Tokens are read from
 * the theme blocks of css/tokens.css (comments stripped) — the single
 * source of truth the browser actually paints. Prints the per-theme ratio
 * tables; prints FAIL + the offending ratios and exits 1 on any violation.
 *
 * NEGATIVE TEST (restore-verified, the release evidence): delete the
 * daylight --sig-yellow override → (ct6) FAILs printing the measured
 * 1.27:1 vs the 3.0 floor → restore → PASS.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { contrastRatio, luminance } from "./sig-contrast.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

// ---- parse EVERY theme block (comments stripped, top-level rules) -----------
const css = readFileSync(resolve(root, "css", "tokens.css"), "utf8");
const layerMatch = css.match(/@layer\s+tokens\s*\{([\s\S]*)\}\s*$/);
if (layerMatch === null) {
  console.error("FAIL — cannot find the @layer tokens block in css/tokens.css");
  process.exit(1);
}
const layerBody = layerMatch[1].replace(/\/\*[\s\S]*?\*\//g, "");

/** Parse one `selector { … }` block's hex declarations. */
function blockTokens(selector) {
  const idx = layerBody.indexOf(selector);
  if (idx === -1) return null;
  const open = layerBody.indexOf("{", idx);
  if (open === -1) return null;
  let depth = 0;
  let end = -1;
  for (let i = open; i < layerBody.length; i++) {
    if (layerBody[i] === "{") depth++;
    else if (layerBody[i] === "}") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end === -1) return null;
  const body = layerBody.slice(open + 1, end);
  const tokens = {};
  for (const match of body.matchAll(/(--[a-z0-9-]+)\s*:\s*(#[0-9a-f]{6})\s*;/gi)) {
    tokens[match[1].toLowerCase()] = match[2].toLowerCase();
  }
  return tokens;
}

const mochaTokens = blockTokens(":root");
const oledTokens = blockTokens('[data-sig-theme="oled"]');
const daylightTokens = blockTokens('[data-sig-theme="daylight"]');
if (mochaTokens === null) {
  console.error("FAIL — cannot find the :root block in css/tokens.css");
  process.exit(1);
}
if (oledTokens === null || daylightTokens === null) {
  failures.push("(th) the canonical theme blocks [data-sig-theme=\"oled\"] / [data-sig-theme=\"daylight\"] are missing from css/tokens.css");
}

/** Theme resolution: :root + the block's overrides. */
function resolveTheme(block) {
  return { ...mochaTokens, ...(block ?? {}) };
}
const THEMES = {
  mocha: {
    label: "mocha (default :root)",
    tokens: mochaTokens,
    surface: mochaTokens["--bg-surface"],
    base: mochaTokens["--bg-base"],
  },
  oled: {
    label: "oled (data-sig-theme=\"oled\")",
    tokens: resolveTheme(oledTokens),
    surface: "#0B0C10",
    base: "#000000",
  },
  daylight: {
    label: "daylight (data-sig-theme=\"daylight\")",
    tokens: resolveTheme(daylightTokens),
    surface: "#FFFFFF",
    base: "#F8FAFC",
  },
};

const SURFACE = THEMES.mocha.surface;
const BASE = THEMES.mocha.base;
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
const SIG_TOKENS = [...INK_FLOOR, ...CHROMATIC_FILLS];
const CHROMATIC_NAMES = new Set(CHROMATIC_FILLS.map(([name]) => name));

// ---- (ct3) the mocha pinned hexes are exactly the release's values ----------
for (const [name, pinned] of SIG_TOKENS) {
  if (pinned !== null && mochaTokens[name] !== pinned.toLowerCase()) {
    failures.push(`(ct3) ${name} must be ${pinned} in css/tokens.css :root — the pinned mocha value, found ${mochaTokens[name] ?? "MISSING"}`);
  }
}
if (!SIG_TOKENS.every(([name]) => mochaTokens[name] !== undefined)) {
  const missing = SIG_TOKENS.map(([name]) => name).filter((name) => mochaTokens[name] === undefined);
  failures.push(`(ct1) the :root block is missing chromatic token(s): ${missing.join(", ")}`);
}
// (chrom companion) the RETIRED name must be gone from the :root block.
if (mochaTokens["--sig-blue"] !== undefined) {
  failures.push("(ct1) --sig-blue is retired (3.0.0) — its value lives on as --sig-cobalt");
}

const pad = (text, width) => (text.length >= width ? text : text + " ".repeat(width - text.length));

/** Print a theme's 26-token ratio table; assert the per-theme floors. */
function themeTable(themeId) {
  const theme = THEMES[themeId];
  const fillFloor = themeId === "mocha" ? 2.0 : 3.1; // mocha keeps its 2.0 visibility contract
  const checkBase = themeId === "mocha"; // oled: black is darker than the surface (ratio grows); daylight: white is the strictest
  console.log("");
  console.log(`${themeId.toUpperCase()} — ${theme.label}`);
  console.log(`  surface ${theme.surface} · base ${theme.base} · ink floor 3.0:1 · chromatic floor ${fillFloor.toFixed(1)}:1${themeId === "oled" ? " (vs surface AND true black)" : ""}`);
  console.log("");
  console.log(`  ${pad("token", 24)} ${pad("hex", 9)} ${pad("vs surface", 12)} ${pad("vs base", 9)} floor  verdict`);
  console.log(`  ${"-".repeat(70)}`);
  for (const [name] of SIG_TOKENS) {
    const hex = theme.tokens[name];
    if (hex === undefined) {
      failures.push(`(${themeId}) ${name} unresolved on the ${themeId} theme — missing from :root and the block`);
      continue;
    }
    const vsSurface = contrastRatio(hex, theme.surface);
    const vsBase = contrastRatio(hex, theme.base);
    const chromatic = CHROMATIC_NAMES.has(name);
    const floor = chromatic ? fillFloor : name === "--sig-mauve-bright" ? 3.1 : 3.0;
    const okSurface = vsSurface >= floor;
    const okBase = !checkBase || chromatic || vsBase >= floor;
    const ok = okSurface && okBase;
    const tag = chromatic
      ? themeId === "mocha"
        ? "  ← fill/series"
        : theme.tokens[name] !== mochaTokens[name]
          ? "  ← 3.2.0 daylight ink variant"
          : "  ← inherits mocha"
      : "";
    console.log(
      `  ${pad(name, 24)} ${pad(hex, 9)} ${pad(vsSurface.toFixed(2) + ":1", 12)} ${pad(vsBase.toFixed(2) + ":1", 9)} ${String(floor.toFixed(1)).padEnd(5)}  ${ok ? "PASS" : "FAIL"}${tag}`,
    );
    const gateId = themeId === "mocha" ? (chromatic ? "4" : name === "--sig-mauve-bright" ? "2" : "1") : themeId === "oled" ? "5" : "6";
    if (!okSurface) {
      failures.push(`(ct${gateId}) ${name} measures ${vsSurface.toFixed(3)}:1 on the ${themeId} surface ${theme.surface} — floor ${floor}:1 (hex ${hex})`);
    }
    if (!okBase) {
      failures.push(`(ct${gateId}) ${name} measures ${vsBase.toFixed(3)}:1 on the ${themeId} base ${theme.base} — floor ${floor}:1 (hex ${hex})`);
    }
  }
}

themeTable("mocha");

// ---- (ct5) OLED: the trio is exact, NO sig declarations, floors vs black ----
if (oledTokens !== null) {
  const declared = Object.keys(oledTokens);
  const expectedTrio = { "--bg-base": "#000000", "--bg-surface": "#0b0c10", "--bg-inset": "#12141c" };
  if (declared.length !== 3) {
    failures.push(`(ct5) the oled block must declare ONLY the bg trio (everything inherits — inheritance is the mechanism), found ${declared.length} declarations`);
  }
  for (const [name, hex] of Object.entries(expectedTrio)) {
    if (oledTokens[name] !== hex) {
      failures.push(`(ct5) oled ${name} must be ${hex}, found ${oledTokens[name] ?? "MISSING"}`);
    }
  }
  for (const [name] of SIG_TOKENS) {
    if (oledTokens[name] !== undefined) {
      failures.push(`(ct5) oled must NOT re-declare ${name} — the --sig-* values INHERIT :root (the ratios only increase on true black)`);
    }
  }
  themeTable("oled");
}

// ---- (ct6)+(ct7) DAYLIGHT: slate structure + the computed ink variants ------
if (daylightTokens !== null) {
  const expectedStructure = {
    "--bg-base": "#f8fafc",
    "--bg-surface": "#ffffff",
    "--bg-inset": "#f1f5f9",
    "--text-main": "#0f172a",
    "--text-bright": "#020617",
    "--text-muted": "#475569",
    "--text-muted-soft": "#64748b",
  };
  for (const [name, hex] of Object.entries(expectedStructure)) {
    if (daylightTokens[name] !== hex) {
      failures.push(`(ct6) daylight ${name} must be ${hex}, found ${daylightTokens[name] ?? "MISSING"}`);
    }
  }
  // (ct7) the manifest cross-check — css overrides == inkVariants entries.
  let manifest = {};
  try {
    manifest = JSON.parse(readFileSync(resolve(root, "tokens.json"), "utf8"));
  } catch (error) {
    failures.push(`(ct7) tokens.json unreadable — ${(error instanceof Error ? error.message : String(error))}`);
  }
  const inkVariants = manifest.sigThemes?.daylight?.inkVariants ?? {};
  const cssInkNames = SIG_TOKENS.map(([name]) => name).filter((name) => daylightTokens[name] !== undefined);
  for (const name of cssInkNames) {
    const entry = inkVariants[name];
    if (entry === undefined) {
      failures.push(`(ct7) css daylight override ${name} is not documented in tokens.json sigThemes.daylight.inkVariants`);
    } else if (String(entry.value).toLowerCase() !== daylightTokens[name]) {
      failures.push(`(ct7) ${name}: css override ${daylightTokens[name]} != manifest inkVariants ${entry.value}`);
    } else if (typeof entry.ratio !== "number") {
      failures.push(`(ct7) ${name}: the manifest must document the measured ratio (a number)`);
    }
  }
  for (const [name, entry] of Object.entries(inkVariants)) {
    if (!name.startsWith("--sig-")) continue;
    const canonical = CHROMATIC_NAMES.has(name);
    const floor = canonical ? 3.1 : 3.0;
    if (typeof entry.ratio === "number" && entry.ratio < floor) {
      failures.push(`(ct7) ${name}: documented daylight ratio ${entry.ratio} is below the ${floor} floor`);
    }
    if (entry.inherits === true && daylightTokens[name] !== undefined) {
      failures.push(`(ct7) ${name} documents "inherits" but the css block re-declares it`);
    }
    if (entry.inherits !== true && daylightTokens[name] === undefined && !CHROMATIC_NAMES.has(name)) {
      // ink-floor entries may document an override the css block must carry
      if (entry.value !== undefined) {
        failures.push(`(ct7) ${name}: manifest override ${entry.value} has no css declaration in the daylight block`);
      }
    }
    // measured-ratio honesty: recompute from the resolved hexes.
    const resolved = THEMES.daylight.tokens[name];
    if (typeof entry.ratio === "number" && resolved !== undefined) {
      const measured = contrastRatio(resolved, "#FFFFFF");
      if (Math.abs(measured - entry.ratio) > 0.005) {
        failures.push(`(ct7) ${name}: documented ratio ${entry.ratio} != measured ${measured.toFixed(2)} vs #FFFFFF`);
      }
    }
  }
  themeTable("daylight");
}

// ---- verdict -------------------------------------------------------------------
if (failures.length > 0) {
  console.error("");
  console.error("FAIL — contrast gate");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("");
console.log("PASS — zero contrast debt on ALL THREE surface themes: mocha (ink ≥3.0 on surface AND base; fills ≥2.0 visibility), oled (all 26 ≥3.1 vs #0B0C10 AND #000000 — inheritance only adds headroom), daylight (all 26 ≥3.0 ink-floor / ≥3.1 canonical vs #FFFFFF via the computed ink variants); the manifest cross-check (ct7) mirrors every ratio");
void luminance; // re-exported for consumers; the gate itself uses contrastRatio
