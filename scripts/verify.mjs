#!/usr/bin/env node
/**
 * verify.mjs — release gate for @edwyn/signature-style.
 *
 * Asserts:
 *   (a) tokens.json token keys exactly match the custom property names
 *       defined in css/tokens.css (expected: 8).
 *   (b) every package.json export target (and `main`) exists on disk.
 *
 * Prints PASS and exits 0 on success; prints FAIL + reasons and exits 1
 * otherwise.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

// ---- (a) token parity: tokens.json <-> css/tokens.css ----------------------
const css = readFileSync(resolve(root, "css/tokens.css"), "utf8");
const cssVars = [
  ...new Set([...css.matchAll(/(?:^|\s)(--[\w-]+)\s*:/gm)].map((m) => m[1])),
];

const manifest = JSON.parse(readFileSync(resolve(root, "tokens.json"), "utf8"));
const jsonKeys = Object.keys(manifest.tokens ?? {});

if (cssVars.length !== 8) {
  failures.push(
    `css/tokens.css defines ${cssVars.length} tokens, expected 8: ${cssVars.join(", ")}`,
  );
}
const onlyInCss = cssVars.filter((k) => !jsonKeys.includes(k));
const onlyInJson = jsonKeys.filter((k) => !cssVars.includes(k));
if (onlyInCss.length > 0) {
  failures.push(`in tokens.css but missing from tokens.json: ${onlyInCss.join(", ")}`);
}
if (onlyInJson.length > 0) {
  failures.push(`in tokens.json but missing from tokens.css: ${onlyInJson.join(", ")}`);
}

// ---- (b) export targets exist on disk ---------------------------------------
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

// ---- verdict ------------------------------------------------------------------
if (failures.length > 0) {
  console.error("FAIL");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("PASS");
