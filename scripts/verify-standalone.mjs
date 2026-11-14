#!/usr/bin/env node
/**
 * verify-standalone.mjs — THE PURITY GATE (3.1.0 "Pure Engine", the
 * owner's centerpiece).
 *
 * Repo-wide case-insensitive scan of the WORKING TREE for the banned
 * domain vocabulary:
 *
 *     planthenparty · plan-then-party · ptp · wedding · guest · rsvp · party
 *
 * ANY match outside the documented allowlist = FAIL (file:line listed).
 * Pattern notes (the FALSE-POSITIVE contract): the generic words
 * (guest/rsvp/party/wedding) scan as plain substrings — nothing
 * legitimate should embed them; "ptp" scans WORD-BOUNDED (\bptp\b) so
 * identifiers like "contrastScriptPath" (which merely CONTAINS the
 * letters) never trip the gate, while ".ptp-" class mentions still do.
 * Scope notes:
 *   - node_modules/, .git/ and every dist/ build-output directory are
 *     excluded (generated artifacts);
 *   - binary/locked extensions are skipped (images, fonts, lockfiles);
 *   - THIS file is excluded from its own scan (the pattern literal and
 *     the allowlist below necessarily name the banned words);
 *   - git HISTORY still carries the old names — the purge applies to
 *     the working tree at HEAD, by owner mandate.
 *
 * ALLOWLIST (documented, count-pinned — the ONLY sanctioned residue):
 *   - playground/verify-playground.mjs: EXACTLY 3 matches, all inside
 *     the (e2) baseline-normalization machinery (E2_RENAME_MAP must
 *     carry the literal ".ptp-" prefix to rename the v1.8.0 baseline
 *     before diffing — a rename is not a deletion) plus its two
 *     documenting comments.
 * If a future legitimate need arises (e.g. a doc says "formerly
 * PlanThenParty"), add a file + count pin here, documented.
 *
 * Exit 0 = pure. Exit 1 = residue (with the file:line list).
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { resolve, dirname, relative, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const PATTERN = /planthenparty|plan-then-party|\bptp\b|wedding|guest|rsvp|party/i;

/** Directory names never scanned (deps + build output + VCS). */
const SKIP_DIRS = new Set(["node_modules", ".git", "dist"]);

/** Extensions never scanned (binary/locked). */
const SKIP_EXTS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".woff", ".woff2",
  ".ttf", ".eot", ".otf", ".pdf", ".zip", ".gz", ".mp4", ".webm",
]);

/**
 * The allowlist: file (repo-relative, forward slashes) → the EXACT
 * number of banned-vocabulary matches sanctioned there. A file in this
 * map with a DIFFERENT count fails; a file NOT in this map with ANY
 * match fails.
 *
 * README.md is pinned to 9: the BREAKING CHANGES table EXISTS to name
 * the old API surface so consumers can migrate (v3.0.0 → v3.1.0) —
 * the owner-sanctioned "formerly" case. Old names anywhere else are
 * residue.
 */
const ALLOWLIST = new Map([
  ["playground/verify-playground.mjs", 3],
  ["README.md", 9],
]);
/** This gate excludes itself (its source names the banned words). */
const SELF = relative(root, resolve(here, "verify-standalone.mjs")).split(sep).join("/");

const failures = [];
const violations = [];
const allowHits = new Map();

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry);
    const rel = relative(root, full).split(sep).join("/");
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (SKIP_DIRS.has(entry)) continue;
      walk(full);
      continue;
    }
    if (rel === SELF) continue;
    if (SKIP_EXTS.has(extname(entry).toLowerCase())) continue;
    let text;
    try {
      text = readFileSync(full, "utf8");
    } catch {
      continue; // unreadable (binary) — the extension filter is the contract
    }
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (PATTERN.test(lines[i])) {
        violations.push(`${rel}:${i + 1}: ${lines[i].trim().slice(0, 160)}`);
        allowHits.set(rel, (allowHits.get(rel) ?? 0) + 1);
      }
    }
  }
}

walk(root);

// The allowlist enforcement: pinned files must match their EXACT count.
for (const [file, pinned] of ALLOWLIST) {
  const got = allowHits.get(file) ?? 0;
  if (got !== pinned) {
    failures.push(
      `(allowlist) ${file} is pinned to EXACTLY ${pinned} sanctioned matches (the (e2) rename-map machinery), found ${got} — adjust the gate machinery or the pin, never the vocabulary`,
    );
  }
}

// Every violation outside the allowlist is residue.
const unallowed = violations.filter((v) => {
  const file = v.slice(0, v.indexOf(":"));
  return !ALLOWLIST.has(file);
});
for (const v of unallowed) {
  failures.push(`(purity) banned vocabulary at ${v}`);
}

if (failures.length > 0) {
  console.error("");
  console.error("FAIL — verify:standalone (the purity gate)");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
const pinned = [...ALLOWLIST.entries()].map(([f, n]) => `${f}=${n}`).join(", ");
console.log(
  `PASS — verify:standalone: zero unallowed banned-vocabulary matches in the working tree (pinned allowlist: ${pinned})`,
);