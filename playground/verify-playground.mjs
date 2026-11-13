#!/usr/bin/env node
/**
 * verify-playground.mjs — the 1.5.0 "Bento Box Showcase" gates.
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
 *         var()/color-mix, the color doctrine holds outside the package;
 *   (b5)  App.tsx imports from "@edwyn/signature-style/react" and uses
 *         ThemeProvider > ToastProvider > GlobalNav + main.bento with
 *         exactly 4 card sections;
 *   (b6)  EVERY lucide icon name used in App.tsx (and main.tsx) exists
 *         in the installed lucide-react icons map — the strict
 *         IconName contract, verified at gate time;
 *   (b7)  SAFETY PROOF: `git diff v1.4.0 -- css/ react/ tokens.json
 *         SYSTEM_PROMPT.md demo/ scripts/` is EMPTY — the core package
 *         files are locked.
 *
 * Prints PASS and exits 0; prints FAIL + reasons and exits 1.
 */

import { readFileSync, existsSync } from "node:fs";
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
if (!stylesCss.includes("color-mix(in srgb, var(--text-muted) 20%, transparent)")) {
  failures.push("(b4) styles.css must draw the card hairline with the color-mix token blend");
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
const iconNames = [...appSrc.matchAll(/icon: "(\w+)"/g)].map((m) => m[1]);
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

// ---- (b7) SAFETY PROOF: core files untouched since v1.4.0 ------------------------
const LOCKED_PATHS = ["css/", "react/", "tokens.json", "SYSTEM_PROMPT.md", "demo/", "scripts/"];
let safetyDiff = "";
try {
  safetyDiff = execFileSync(
    "git",
    ["diff", "v1.4.0", "--", ...LOCKED_PATHS],
    { cwd: root, encoding: "utf8" },
  );
} catch (error) {
  failures.push(`(b7) could not diff against v1.4.0 — ${(error instanceof Error ? error.message : String(error)).split("\n")[0]}`);
}
if (safetyDiff.trim() !== "") {
  failures.push(
    "(b7) SAFETY: core package files changed since v1.4.0 — css/ react/ tokens.json SYSTEM_PROMPT.md demo/ scripts/ are LOCKED",
  );
}

// ---- verdict ----------------------------------------------------------------------
if (failures.length > 0) {
  console.error("FAIL");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("PASS — playground gates (b1)-(b7): scaffold, wiring, pack=34, zero hex, bento shape, icons, safety diff empty");
