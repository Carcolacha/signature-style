#!/usr/bin/env node
/**
 * verify.mjs — release gate for @edwyn/signature-style (v0.2.0).
 *
 * Asserts:
 *   (a) every token in tokens.json themes.mocha exists in the tokens.css
 *       `:root` block, and every token in themes.latte exists in the
 *       `[data-theme="latte"]` block;
 *   (b) all four keeper hexes (#282A36 #6272A4 #F8F8F2 #A8E6CF) appear
 *       in css/tokens.css;
 *   (c) the first three lines of signature-style.css are exactly:
 *       the @layer statement, the Inter font @import, the tokens @import
 *       (so the font @import is the first @import, per CSS spec);
 *   (d) every package.json export target (and `main`) exists on disk;
 *   (e) the react/ tree is byte-identical to git tag v0.1.0
 *       (`git diff v0.1.0 -- react/` must be empty).
 *
 * Prints PASS and exits 0 on success; prints FAIL + reasons and exits 1
 * otherwise.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

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
} else {
  const rootDeclarations = section(layerTokensBlock, /:root\s*\{([^}]*)\}/);
  const latteDeclarations = section(
    layerTokensBlock,
    /\[data-theme="latte"\]\s*\{([^}]*)\}/,
  );

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

// ---- (b) keeper hexes present in tokens.css ---------------------------------
const KEEPER_HEXES = ["#282A36", "#6272A4", "#F8F8F2", "#A8E6CF"];
for (const hex of KEEPER_HEXES) {
  if (!css.toUpperCase().includes(hex)) {
    failures.push(`keeper hex ${hex} missing from css/tokens.css`);
  }
}

// ---- (c) bundle head: @layer statement, font @import, tokens @import --------
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

// ---- (d) export targets exist on disk ---------------------------------------
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

// ---- (e) react/ is byte-identical to v0.1.0 ----------------------------------
const gitDiff = spawnSync("git", ["diff", "v0.1.0", "--", "react/"], {
  cwd: root,
  encoding: "utf8",
});
if (gitDiff.error !== undefined) {
  failures.push(`could not run git diff v0.1.0 -- react/: ${gitDiff.error.message}`);
} else if (gitDiff.status !== 0) {
  failures.push(`git diff v0.1.0 -- react/ exited ${gitDiff.status}: ${gitDiff.stderr.trim()}`);
} else if (gitDiff.stdout.trim() !== "") {
  failures.push(
    "react/ differs from v0.1.0 — ThemeProvider files must stay byte-identical (invariant 4)",
  );
}

// ---- verdict ------------------------------------------------------------------
if (failures.length > 0) {
  console.error("FAIL");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("PASS");
