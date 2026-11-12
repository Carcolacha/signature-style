#!/usr/bin/env node
/**
 * verify.mjs — release gate for @edwyn/signature-style (v0.4.0 "Party Palette").
 *
 * Asserts:
 *   (a) every token in tokens.json themes.mocha exists in the tokens.css
 *       `:root` block, and every token in themes.latte exists in the
 *       `[data-theme="latte"]` block;
 *   (b) HARMONIZED: per-theme official signatures — `--color-cake-primary`
 *       is #F2CDCD (Mocha Flamingo) and `--color-cake-secondary` is
 *       #94E2D5 (Mocha Teal) in the `:root` (mocha) block, while the latte
 *       block wears its OWN counterparts #DD7878 (Latte Flamingo) and
 *       #179299 (Latte Teal). No cross-theme imports;
 *   (c) RETIRED HEXES: the retired Catppuccin accent hexes #F5C2E7 and
 *       #A6E3A1, AND the retired custom cake hexes #FFB7B2 and #E2F0CB,
 *       appear NOWHERE in css/ or tokens.json;
 *   (d) WHITELIST PARITY: every custom property name declared in
 *       css/tokens.css appears in react/ThemeProvider.tsx's TOKEN_KEYS —
 *       explicitly including the z-scale tokens --z-sticky, --z-overlay,
 *       --z-modal;
 *   (d2) Z-SCALE VALUES: --z-sticky / --z-overlay / --z-modal are declared
 *       in the tokens.css `:root` block with the exact values 10 / 40 / 50;
 *   (p) PARTY PALETTE (0.4.0): all ten --party-* content tokens exist in
 *       the tokens.css `:root` block with their exact reserved hexes, and
 *       tokens.json's partyPalette section lists all ten with matching
 *       values, the content-only role and "reserved": true;
 *   (p2) PARTY WHITELIST PARITY: all ten --party-* names are present in
 *       the ThemeProvider TOKEN_KEYS whitelist;
 *   (s) STRUCTURAL FREEZE: `git diff v0.3.0 -- css/cascade.css
 *       css/overrides.css` is EMPTY, and tokens.css still declares the
 *       exact v0.3.0 structural values — the 4 structural hexes (bg-base,
 *       bg-surface, text-main, text-muted) and the Flamingo/Teal signature
 *       pairs in both the Mocha `:root` and Latte blocks. The v0.3.0
 *       structural UI is LOCKED; 0.4.0 may only ADD content tokens.
 *   (e) all four keeper hexes (#282A36 #6272A4 #F8F8F2 #A8E6CF) appear in
 *       css/tokens.css; the first line of signature-style.css is the
 *       @layer statement with the Inter font @import as the first @import
 *       and ./tokens.css as the second (so the font @import precedes all
 *       other rules, per CSS spec); every package.json export target
 *       (and `main`) exists on disk;
 *   (f) HARDENING: react/ThemeProvider.tsx still contains the guard
 *       strings — the CSSLayerBlockRule support check (VULN-2), the
 *       value-injection warn (VULN-3), and the canonical layer-order
 *       declaration — i.e. hardening survives every edit.
 *
 * Prints PASS and exits 0 on success; prints FAIL + reasons and exits 1
 * otherwise.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

// ---- (a) theme parity: tokens.json themes <-> css/tokens.css blocks --------
const css = readFileSync(resolve(root, "css/tokens.css"), "utf8");

/** Extract the declarations of a `selector { ... }` section inside a block. */
function section(cssText, selectorPattern) {
  const match = cssText.match(selectorPattern);
  return match === null ? null : match[1];
}

/** Custom property names declared in a CSS declarations string. */
function declaredVars(declarations) {
  return [...new Set([...declarations.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]))];
}

const layerTokensBlock = section(css, /@layer\s+tokens\s*\{([\s\S]*)\}\s*$/);
if (layerTokensBlock === null) {
  failures.push("css/tokens.css has no @layer tokens block");
}
const rootDeclarations =
  layerTokensBlock === null ? null : section(layerTokensBlock, /:root\s*\{([^}]*)\}/);
const latteDeclarations =
  layerTokensBlock === null
    ? null
    : section(layerTokensBlock, /\[data-theme="latte"\]\s*\{([^}]*)\}/);

if (layerTokensBlock !== null) {
  if (rootDeclarations === null) {
    failures.push("css/tokens.css has no :root block inside @layer tokens");
  }
  if (latteDeclarations === null) {
    failures.push(
      'css/tokens.css has no [data-theme="latte"] block inside @layer tokens',
    );
  }

  const manifest = JSON.parse(readFileSync(resolve(root, "tokens.json"), "utf8"));

  if (rootDeclarations !== null) {
    const rootVars = declaredVars(rootDeclarations);
    const mocha = manifest.themes?.mocha?.tokens ?? {};
    const missingInRoot = Object.keys(mocha).filter((k) => !rootVars.includes(k));
    if (missingInRoot.length > 0) {
      failures.push(
        `themes.mocha tokens missing from tokens.css :root: ${missingInRoot.join(", ")}`,
      );
    }
  }
  if (latteDeclarations !== null) {
    const latteVars = declaredVars(latteDeclarations);
    const latte = manifest.themes?.latte?.tokens ?? {};
    const missingInLatte = Object.keys(latte).filter((k) => !latteVars.includes(k));
    if (missingInLatte.length > 0) {
      failures.push(
        `themes.latte tokens missing from tokens.css [data-theme="latte"]: ${missingInLatte.join(", ")}`,
      );
    }
  }
}

// ---- (b) HARMONIZED: per-theme official signature hexes ----------------------
const SIGNATURE_HEXES = {
  ":root (mocha)": [
    ["--color-cake-primary", "#F2CDCD"],
    ["--color-cake-secondary", "#94E2D5"],
  ],
  '[data-theme="latte"]': [
    ["--color-cake-primary", "#DD7878"],
    ["--color-cake-secondary", "#179299"],
  ],
};
for (const [blockName, declarations] of [
  [":root (mocha)", rootDeclarations],
  ['[data-theme="latte"]', latteDeclarations],
]) {
  if (declarations === null) continue; // already reported missing in (a)
  for (const [name, hex] of SIGNATURE_HEXES[blockName]) {
    const pattern = new RegExp(`${name}\\s*:\\s*${hex}`, "i");
    if (!pattern.test(declarations)) {
      failures.push(
        `${name} must be ${hex} in the ${blockName} block of css/tokens.css — harmonized per-theme doctrine (100% official Catppuccin, no cross-theme imports)`,
      );
    }
  }
}

// ---- (c) retired hexes appear nowhere -----------------------------------------
// #F5C2E7 / #A6E3A1: the retired Catppuccin Pink/Green accents (banned since
// 0.2.1). #FFB7B2 / #E2F0CB: the retired custom cake hexes (banned since
// 0.3.0) — even in comments, nowhere in css/ or tokens.json.
const RETIRED_HEXES = ["#F5C2E7", "#A6E3A1", "#FFB7B2", "#E2F0CB"];
const scannedPaths = [
  ...readdirSync(resolve(root, "css")).map((f) => join("css", f)),
  "tokens.json",
];
for (const rel of scannedPaths) {
  const text = readFileSync(resolve(root, rel), "utf8").toUpperCase();
  for (const hex of RETIRED_HEXES) {
    if (text.includes(hex)) {
      failures.push(
        `retired hex ${hex} found in ${rel} — the harmonized doctrine bans retired accents everywhere in css/ + tokens.json`,
      );
    }
  }
}

// ---- (d) whitelist parity: tokens.css <-> ThemeProvider TOKEN_KEYS -----------
const Z_TOKENS = ["--z-sticky", "--z-overlay", "--z-modal"];
const tsx = readFileSync(resolve(root, "react/ThemeProvider.tsx"), "utf8");
/** @type {string[] | null} */
let whitelist = null;
const whitelistMatch = tsx.match(/const\s+TOKEN_KEYS\s*=\s*\[([\s\S]*?)\]\s*as\s+const;/);
if (whitelistMatch === null) {
  failures.push("react/ThemeProvider.tsx has no parseable TOKEN_KEYS whitelist");
} else {
  whitelist = [...whitelistMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  const cssVarNames = declaredVars(css);
  const missingFromWhitelist = cssVarNames.filter((name) => !whitelist.includes(name));
  if (missingFromWhitelist.length > 0) {
    failures.push(
      `tokens.css custom properties missing from the ThemeProvider TOKEN_KEYS whitelist: ${missingFromWhitelist.join(", ")}`,
    );
  }
  // Explicit z-scale membership (Pillar 3) — the whitelist must cover the
  // z-tokens, not merely not-yet-failed generic parity.
  const missingZ = Z_TOKENS.filter((name) => !whitelist.includes(name));
  if (missingZ.length > 0) {
    failures.push(
      `z-scale tokens missing from the ThemeProvider TOKEN_KEYS whitelist (Pillar 3): ${missingZ.join(", ")}`,
    );
  }
}

// ---- (d2) z-scale tokens exist with exact values 10 / 40 / 50 ----------------
const Z_VALUES = { "--z-sticky": "10", "--z-overlay": "40", "--z-modal": "50" };
if (rootDeclarations === null) {
  failures.push("cannot check z-scale values — no :root block found");
} else {
  for (const [name, value] of Object.entries(Z_VALUES)) {
    const pattern = new RegExp(`${name}\\s*:\\s*${value}\\s*;`);
    if (!pattern.test(rootDeclarations)) {
      failures.push(
        `${name} must be declared as ${value} in the css/tokens.css :root block (Pillar 3 z-index scale)`,
      );
    }
  }
}

// ---- (p) party palette: exact tokens.css hexes + tokens.json reserved entries
// RULE OF ENGAGEMENT: --party-* tokens are reserved EXCLUSIVELY for content
// (badges, tags, avatars, event theme overrides, calendar blocks, data-viz).
// The Engine keeps Flamingo/Teal for ALL structural UI. Never crossed.
const PARTY_TOKENS = [
  ["--party-pink-bright", "#ea76cb"],
  ["--party-pink-soft", "#f5bde6"],
  ["--party-pink-alt", "#f4b8e4"],
  ["--party-mauve-bright", "#8839ef"],
  ["--party-mauve-soft", "#cba6f7"],
  ["--party-lavender", "#7287fd"],
  ["--party-sky", "#04a5e5"],
  ["--party-blue", "#1e66f5"],
  ["--party-peach", "#fe640b"],
  ["--party-green", "#a6d189"],
];
if (rootDeclarations === null) {
  failures.push("cannot check party palette — no :root block found");
} else {
  for (const [name, hex] of PARTY_TOKENS) {
    const pattern = new RegExp(`${name}\\s*:\\s*${hex}`, "i");
    if (!pattern.test(rootDeclarations)) {
      failures.push(
        `party token ${name} must be ${hex} in the css/tokens.css :root block — the Party Palette is exact and content-reserved (0.4.0)`,
      );
    }
  }
}

const partyManifest = JSON.parse(readFileSync(resolve(root, "tokens.json"), "utf8"));
const partyJson = partyManifest.partyPalette?.tokens ?? {};
for (const [name, hex] of PARTY_TOKENS) {
  const entry = partyJson[name];
  if (entry === undefined) {
    failures.push(`tokens.json partyPalette is missing ${name}`);
    continue;
  }
  const value = String(entry.value ?? "").toLowerCase();
  if (value !== hex.toLowerCase()) {
    failures.push(
      `tokens.json partyPalette.${name} must be ${hex}, found ${entry.value}`,
    );
  }
  if (entry.role !== "content only: tags/avatars/calendar/data-viz") {
    failures.push(
      `tokens.json partyPalette.${name} role must be the content-only role, found ${JSON.stringify(entry.role)}`,
    );
  }
  if (entry.reserved !== true) {
    failures.push(`tokens.json partyPalette.${name} must carry "reserved": true`);
  }
}

// ---- (p2) party whitelist parity: all 10 party names in TOKEN_KEYS -----------
if (whitelist !== null) {
  const missingParty = PARTY_TOKENS.map(([name]) => name).filter(
    (name) => !whitelist.includes(name),
  );
  if (missingParty.length > 0) {
    failures.push(
      `party palette tokens missing from the ThemeProvider TOKEN_KEYS whitelist: ${missingParty.join(", ")}`,
    );
  }
}

// ---- (s) structural freeze: v0.3.0 structural UI is LOCKED -------------------
// (s1) cascade.css and overrides.css are byte-identical to v0.3.0.
let freezeDiff = "";
try {
  freezeDiff = execFileSync(
    "git",
    ["diff", "v0.3.0", "--", "css/cascade.css", "css/overrides.css"],
    { cwd: root, encoding: "utf8" },
  );
} catch (error) {
  failures.push(
    `structural freeze: could not diff against v0.3.0 — ${(error instanceof Error ? error.message : String(error)).split("\n")[0]}`,
  );
}
if (freezeDiff.trim() !== "") {
  failures.push(
    "structural freeze: css/cascade.css or css/overrides.css changed since v0.3.0 — the structural UI is LOCKED",
  );
}

// (s2) tokens.css still declares the exact v0.3.0 structural values:
// the 4 structural hexes per theme plus the Flamingo/Teal signature pairs.
const STRUCTURAL_FREEZE = {
  ":root (mocha)": [
    ["--bg-base", "#1E1E2E"],
    ["--bg-surface", "#313244"],
    ["--text-main", "#CDD6F4"],
    ["--text-muted", "#7F849C"],
    ["--color-cake-primary", "#F2CDCD"],
    ["--color-cake-secondary", "#94E2D5"],
  ],
  '[data-theme="latte"]': [
    ["--bg-base", "#EFF1F5"],
    ["--bg-surface", "#CCD0DA"],
    ["--text-main", "#4C4F69"],
    ["--text-muted", "#6272A4"],
    ["--color-cake-primary", "#DD7878"],
    ["--color-cake-secondary", "#179299"],
  ],
};
for (const [blockName, declarations] of [
  [":root (mocha)", rootDeclarations],
  ['[data-theme="latte"]', latteDeclarations],
]) {
  if (declarations === null) continue; // already reported missing in (a)
  for (const [name, hex] of STRUCTURAL_FREEZE[blockName]) {
    const pattern = new RegExp(`${name}\\s*:\\s*${hex}`, "i");
    if (!pattern.test(declarations)) {
      failures.push(
        `structural freeze: ${name} must remain ${hex} in the ${blockName} block of css/tokens.css — v0.3.0 structural values are LOCKED`,
      );
    }
  }
}

// ---- (e) keepers, bundle head order, export targets --------------------------
const KEEPER_HEXES = ["#282A36", "#6272A4", "#F8F8F2", "#A8E6CF"];
for (const hex of KEEPER_HEXES) {
  if (!css.toUpperCase().includes(hex)) {
    failures.push(`keeper hex ${hex} missing from css/tokens.css`);
  }
}

const bundle = readFileSync(resolve(root, "css/signature-style.css"), "utf8");
const bundleLines = bundle.split("\n");
const LAYER_STATEMENT = "@layer tokens, base, cascade, overrides;";
if (bundleLines[0]?.trim() !== LAYER_STATEMENT) {
  failures.push(
    `css/signature-style.css line 1 must be the @layer statement, found: ${JSON.stringify(bundleLines[0])}`,
  );
}
const importLines = bundleLines
  .map((line, index) => ({ line: line.trim(), index }))
  .filter(({ line }) => line.startsWith("@import"));
const firstImport = importLines[0];
if (firstImport === undefined) {
  failures.push("css/signature-style.css has no @import rules");
} else if (!/fonts\.googleapis\.com/.test(firstImport.line) || !/Inter/.test(firstImport.line)) {
  failures.push(
    `the first @import in css/signature-style.css must be the Inter font import, found line ${firstImport.index + 1}: ${firstImport.line}`,
  );
}
const secondImport = importLines[1];
if (secondImport === undefined || !secondImport.line.includes("./tokens.css")) {
  failures.push(
    "the second @import in css/signature-style.css must be ./tokens.css (layer files load tokens first)",
  );
}

const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));

/** @type {Array<[string, string]>} */
const targets = [];
function collect(value, via) {
  if (typeof value === "string") {
    targets.push([via, value]);
  } else if (Array.isArray(value)) {
    value.forEach((v) => collect(v, via));
  } else if (value !== null && typeof value === "object") {
    Object.entries(value).forEach(([condition, v]) => collect(v, `${via} [${condition}]`));
  }
}

if (pkg.exports === undefined) {
  failures.push("package.json has no exports map");
} else {
  collect(pkg.exports, "exports");
}
if (typeof pkg.main === "string") collect(pkg.main, "main");

if (targets.length === 0) {
  failures.push("no export targets found to check");
}
for (const missing of targets.filter(([, p]) => !existsSync(resolve(root, p)))) {
  failures.push(`export target missing on disk: ${missing[0]} -> ${missing[1]}`);
}

// ---- (f) hardening strings survive in ThemeProvider.tsx -----------------------
const HARDENING_STRINGS = [
  ["CSSLayerBlockRule", "VULN-2 @layer support check"],
  ["CSS injection guard", "VULN-3 value-injection warn"],
  [LAYER_STATEMENT, "canonical layer-order declaration"],
];
for (const [needle, label] of HARDENING_STRINGS) {
  if (!tsx.includes(needle)) {
    failures.push(`react/ThemeProvider.tsx lost the ${label} — hardening must survive every edit`);
  }
}

// ---- verdict ------------------------------------------------------------------
if (failures.length > 0) {
  console.error("FAIL");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("PASS");
