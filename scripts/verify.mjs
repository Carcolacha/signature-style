#!/usr/bin/env node
/**
 * verify.mjs — release gate for @edwyn/signature-style (v0.2.1 "Hybrid Theme").
 *
 * Asserts:
 *   (a) every token in tokens.json themes.mocha exists in the tokens.css
 *       `:root` block, and every token in themes.latte exists in the
 *       `[data-theme="latte"]` block;
 *   (b) HYBRID: `--color-cake-primary` is #FFB7B2 and `--color-cake-secondary`
 *       is #E2F0CB in BOTH the `:root` (mocha) and latte blocks — the owner's
 *       exact signature pair, identical on both sides of the toggle;
 *   (c) HYBRID: the retired Catppuccin accent hexes #F5C2E7 and #A6E3A1
 *       appear NOWHERE in css/ or tokens.json;
 *   (d) WHITELIST PARITY: every custom property name declared in
 *       css/tokens.css appears in react/ThemeProvider.tsx's TOKEN_KEYS;
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

// ---- (b) HYBRID: signature cake hexes in BOTH theme blocks -------------------
const SIGNATURE_HEXES = [
  ["--color-cake-primary", "#FFB7B2"],
  ["--color-cake-secondary", "#E2F0CB"],
];
for (const [blockName, declarations] of [
  [":root (mocha)", rootDeclarations],
  ['[data-theme="latte"]', latteDeclarations],
]) {
  if (declarations === null) continue; // already reported missing in (a)
  for (const [name, hex] of SIGNATURE_HEXES) {
    const pattern = new RegExp(`${name}\\s*:\\s*${hex}`, "i");
    if (!pattern.test(declarations)) {
      failures.push(
        `${name} must be ${hex} in the ${blockName} block of css/tokens.css — hybrid doctrine`,
      );
    }
  }
}

// ---- (c) HYBRID: retired Catppuccin accent hexes appear nowhere --------------
const RETIRED_HEXES = ["#F5C2E7", "#A6E3A1"];
const scannedPaths = [
  ...readdirSync(resolve(root, "css")).map((f) => join("css", f)),
  "tokens.json",
];
for (const rel of scannedPaths) {
  const text = readFileSync(resolve(root, rel), "utf8").toUpperCase();
  for (const hex of RETIRED_HEXES) {
    if (text.includes(hex)) {
      failures.push(
        `retired Catppuccin accent ${hex} found in ${rel} — the hybrid doctrine bans it everywhere`,
      );
    }
  }
}

// ---- (d) whitelist parity: tokens.css <-> ThemeProvider TOKEN_KEYS -----------
const tsx = readFileSync(resolve(root, "react/ThemeProvider.tsx"), "utf8");
const whitelistMatch = tsx.match(/const\s+TOKEN_KEYS\s*=\s*\[([\s\S]*?)\]\s*as\s+const;/);
if (whitelistMatch === null) {
  failures.push("react/ThemeProvider.tsx has no parseable TOKEN_KEYS whitelist");
} else {
  const whitelist = [...whitelistMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  const cssVarNames = declaredVars(css);
  const missingFromWhitelist = cssVarNames.filter((name) => !whitelist.includes(name));
  if (missingFromWhitelist.length > 0) {
    failures.push(
      `tokens.css custom properties missing from the ThemeProvider TOKEN_KEYS whitelist: ${missingFromWhitelist.join(", ")}`,
    );
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
