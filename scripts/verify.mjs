#!/usr/bin/env node
/**
 * verify.mjs — release gate for @edwyn/signature-style (since v1.0.0
 * "Publish Flow & Distribution"; gates accumulated through 0.7.0).
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
 *       explicitly including the z-scale tokens --z-sticky, --z-nav,
 *       --z-overlay, --z-modal, --z-toast;
 *   (d2) Z-SCALE VALUES: --z-sticky / --z-nav / --z-overlay / --z-modal /
 *       --z-toast are declared in the tokens.css `:root` block with the
 *       exact values 10 / 30 / 40 / 50 / 60 (1.4.0 adds the zenith rung);
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
 *   (e2) DISTRIBUTION CONTRACT (1.0.0): the exports map is EXACTLY the
 *       3-path public surface — "." -> ./tokens.json (AI tooling core),
 *       "./css" -> ./css/signature-style.css (the compiled bundle), and
 *       "./react" -> the umbrella react/index.js + react/index.d.ts
 *       (types/import/default); `main` is ./tokens.json. No granular
 *       export entries (./tokens.css, ./cascade.css, ./overrides.css,
 *       ./system-prompt.md were removed in 1.0.0 — the bundle covers
 *       everything);
 *   (f) HARDENING: react/ThemeProvider.tsx still contains the guard
 *       strings — the CSSLayerBlockRule support check (VULN-2), the
 *       value-injection warn (VULN-3), and the canonical layer-order
 *       declaration — i.e. hardening survives every edit.
 *   (r1) REACT PRIMITIVES (0.5.0) + EVENT TIMELINE (0.6.0) + EVENT MODAL
 *       (0.7.0): react/index.js exists and the umbrella re-exports Icon,
 *       EmptyState, PartyBadge, EventTimeline, EventModal and useModal
 *       (checked in index.d.ts);
 *   (r2) lucide-react is declared in package.json peerDependenciesMeta as
 *       optional — CSS-only consumers never need it;
 *   (r3) the exports["./react"] umbrella resolves to files that exist on
 *       disk (types + import/default);
 *   (r4) PRUNING PROTOCOL COLOR HYGIENE: react/primitives.tsx contains
 *       ZERO hardcoded hex literals — primitives consume var(--token)
 *       only.
 *   (t1) EVENT TIMELINE CSS (0.6.0): css/timeline.css exists, collapses
 *       at `max-width: 768px`, pins headers with `var(--z-sticky`,
 *       draws the line with a `.ptp-timeline::before` pseudo-element,
 *       respects prefers-reduced-motion, and contains NO hex literals;
 *   (t2) BUNDLE MEMBERSHIP: css/signature-style.css imports
 *       ./timeline.css into the `cascade` layer, AFTER ./tokens.css —
 *       the layer-order statement stays line 1;
 *   (t3) the umbrella re-exports EventTimeline from react/index.js too.
 *   (m1) EVENT MODAL CSS (0.7.0): css/modal.css exists, pins the backdrop
 *       with `var(--z-overlay` and the card with `var(--z-modal`, uses the
 *       user-mandated neutral scrim `rgba(0, 0, 0, 0.6)` (the ONLY allowed
 *       non-token color — after stripping it, the file must contain ZERO
 *       hex literals), respects prefers-reduced-motion, collapses at
 *       max-width: 768px, and has zero box-shadow;
 *   (m2) BUNDLE MEMBERSHIP: css/signature-style.css imports ./modal.css
 *       into the `cascade` layer, AFTER ./timeline.css;
 *   (m3) MODAL SOURCE HYGIENE: react/modal.tsx portals via createPortal to
 *       document.body, carries the dialog a11y contract (role="dialog",
 *       aria-modal, event-title aria-label, Close label), closes on Escape
 *       with a cleaned-up keydown listener, stops clicks inside the card,
 *       and contains ZERO hex literals;
 *   (m4) TIMELINE INTEGRATION: react/timeline.tsx renders nodes as
 *       `<button … ptp-timeline__node>` (was span) and EventTimelineProps
 *       declares the optional onEventSelect callback that fires with the
 *       clicked event;
 *   (m5) the umbrella re-exports EventModal + useModal from react/index.js
 *       too (companion to r1/r5).
 *   (n1) GLOBAL NAV CSS (1.2.0): css/nav.css exists, pins the navbar with
 *       `var(--z-nav, 30)` (the z-gap between sticky 10 and overlay 40),
 *       shifts at `max-width: 768px`, drives the active state via the
 *       `[aria-current="page"]` selector, slides the drawer with
 *       translateX, respects prefers-reduced-motion, and contains ZERO
 *       hex literals (the rgba scrim lives only in modal.css);
 *   (n1b) BUNDLE MEMBERSHIP: css/signature-style.css imports ./nav.css
 *       into the `cascade` layer, AFTER ./modal.css;
 *   (n2) the umbrella re-exports GlobalNav + NavItem + GlobalNavProps
 *       (types in index.d.ts; the value export also in index.js);
 *   (n3) --z-nav PARITY (1.2.0): the token is declared in tokens.css
 *       :root with value 30 (via the extended d2 gate), in tokens.json
 *       themes.shared with value 30, and in the ThemeProvider TOKEN_KEYS
 *       whitelist (via the extended d gate).
 *   (v1) VIZ CSS (1.3.0): css/viz.css exists, builds the 8px-grid track
 *       (`height: 8px`), animates the fill with the owner-mandated
 *       physics (`width 0.3s ease-out`), respects prefers-reduced-motion,
 *       tracks on `var(--bg-surface)` (data-ink doctrine: track =
 *       surface, fill = party), and contains ZERO hex literals and zero
 *       box-shadow (the StatRing has NO css at all — pure SVG attributes);
 *   (v1b) BUNDLE MEMBERSHIP: css/signature-style.css imports
 *       ./viz.css into the `cascade` layer, AFTER ./nav.css;
 *   (v2) the umbrella re-exports ProgressBar + StatRing (+ prop types)
 *       — types in index.d.ts, the value exports also in index.js;
 *   (v3) PARTY GUARD: react/viz.tsx contains the runtime party-guard
 *       string (`startsWith("--party-")`) — the Rule of Engagement is
 *       enforced in the source, not just the types.
 *   (f1) FORMS CSS (1.4.0): css/forms.css exists, builds the inset wells
 *       on var(--bg-inset), drives the error state via the
 *       `[aria-invalid="true"]` selector answered by var(--party-peach),
 *       rings focus with the doctrine outline (2px var(--color-cake-primary)),
 *       travels the switch knob translateX(1.25rem) on
 *       [aria-checked="true"], respects prefers-reduced-motion, and
 *       contains ZERO hex literals and zero box-shadow;
 *   (fb1) TOAST CSS (1.4.0; the t1 label was taken by the timeline):
 *       css/toast.css exists, pins the region at the zenith rung
 *       var(--z-toast, 60), declares the toast-life keyframes, maps the
 *       status strips through var(--status) to var(--party-green) /
 *       var(--party-peach), rides the owner's mechanical cubic-bezier,
 *       respects prefers-reduced-motion, and contains ZERO hex literals
 *       and zero box-shadow;
 *   (fb2) BUNDLE MEMBERSHIP (1.4.0): css/signature-style.css imports
 *       ./forms.css into the `cascade` layer AFTER ./viz.css and
 *       ./toast.css AFTER ./forms.css;
 *   (n4) FEEDBACK UMBRELLA (1.4.0): the umbrella re-exports Input,
 *       TextArea, ToggleSwitch, ToastProvider and useToast — all five
 *       names in index.d.ts, the five value exports also in index.js.
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
const Z_TOKENS = ["--z-sticky", "--z-nav", "--z-overlay", "--z-modal", "--z-toast"];
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

// ---- (d2) z-scale tokens exist with exact values 10 / 30 / 40 / 50 / 60 -----
// 1.2.0 extension: --z-nav is the navbar rung between sticky and overlay.
// 1.4.0 extension: --z-toast is the zenith rung above modals.
const Z_VALUES = {
  "--z-sticky": "10",
  "--z-nav": "30",
  "--z-overlay": "40",
  "--z-modal": "50",
  "--z-toast": "60",
};
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
  ["--party-mauve-bright", "#9e5ff2"], /* 2.9.1 ZERO CONTRAST DEBT — re-pinned from
     #8839ef: the contrast mandate lightened the token in-family to 3.22:1 on
     surface (owner-sanctioned amendment of the frozen (p) pins — the manifest
     must carry the real value). Measured by playground/verify-contrast.mjs. */
  ["--party-mauve-soft", "#cba6f7"],
  ["--party-lavender", "#7287fd"],
  ["--party-sky", "#04a5e5"],
  ["--party-blue", "#89b4fa"], /* 2.9.1 ZERO CONTRAST DEBT — re-pinned from #1e66f5:
     now the official Catppuccin Mocha Blue (5.97:1 on surface), the exact value
     v3.0.0's planned --party-cobalt retires it into (owner-sanctioned). */
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

// (e2) DISTRIBUTION CONTRACT (1.0.0): the exports map is exactly the
// 3-path public surface; `main` is the tokens manifest.
const DISTRIBUTION_CONTRACT = {
  ".": "./tokens.json",
  "./css": "./css/signature-style.css",
};
const reactConditions = {
  types: "./react/index.d.ts",
  import: "./react/index.js",
  default: "./react/index.js",
};
const FORBIDDEN_EXPORT_KEYS = [
  "./tokens.css",
  "./cascade.css",
  "./overrides.css",
  "./tokens.json",
  "./system-prompt.md",
];

if (pkg.main !== DISTRIBUTION_CONTRACT["."]) {
  failures.push(
    `package.json main must be ${DISTRIBUTION_CONTRACT["."]} (the AI tooling core), found ${JSON.stringify(pkg.main)}`,
  );
}
if (pkg.exports === undefined || typeof pkg.exports !== "object") {
  failures.push("package.json has no parseable exports map for the distribution contract");
} else {
  const exportKeys = Object.keys(pkg.exports);
  const expectedKeys = [...Object.keys(DISTRIBUTION_CONTRACT), "./react"];
  const unexpected = exportKeys.filter((k) => !expectedKeys.includes(k));
  if (unexpected.length > 0) {
    failures.push(
      `exports map has entries outside the 3-path v1.0.0 contract: ${unexpected.join(", ")} (granular entries were removed — the bundle covers everything)`,
    );
  }
  const missingKeys = expectedKeys.filter((k) => !exportKeys.includes(k));
  if (missingKeys.length > 0) {
    failures.push(`exports map is missing contract keys: ${missingKeys.join(", ")}`);
  }
  for (const [key, expectedTarget] of Object.entries(DISTRIBUTION_CONTRACT)) {
    const actual = pkg.exports[key];
    if (actual !== expectedTarget && exportKeys.includes(key)) {
      failures.push(
        `exports["${key}"] must be exactly "${expectedTarget}", found ${JSON.stringify(actual)}`,
      );
    } else if (typeof actual === "string" && !existsSync(resolve(root, actual))) {
      failures.push(`exports["${key}"] resolves to a missing file: ${actual}`);
    }
  }
  const reactEntry = pkg.exports["./react"];
  if (exportKeys.includes("./react")) {
    if (reactEntry === null || typeof reactEntry !== "object" || Array.isArray(reactEntry)) {
      failures.push('exports["./react"] must be the umbrella condition object');
    } else {
      for (const [condition, expectedTarget] of Object.entries(reactConditions)) {
        const actual = reactEntry[condition];
        if (actual !== expectedTarget) {
          failures.push(
            `exports["./react"].${condition} must be exactly "${expectedTarget}", found ${JSON.stringify(actual)}`,
          );
        } else if (!existsSync(resolve(root, actual))) {
          failures.push(`exports["./react"].${condition} resolves to a missing file: ${actual}`);
        }
      }
    }
  }
  const bannedPresent = FORBIDDEN_EXPORT_KEYS.filter((k) => exportKeys.includes(k));
  if (bannedPresent.length > 0) {
    failures.push(
      `granular export entries must not return: ${bannedPresent.join(", ")} (deep node_modules imports are the consumer's own risk)`,
    );
  }
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

// ---- (r) react primitives + event timeline -------------------------------------
// (r1) the umbrella exists and re-exports the primitives + EventTimeline.
const indexDts = readFileSync(resolve(root, "react/index.d.ts"), "utf8");
for (const primitive of [
  "Icon",
  "EmptyState",
  "PartyBadge",
  "EventTimeline",
  "EventModal",
  "useModal",
  "EventModalProps",
  "UseModalReturn",
]) {
  const exportPattern = new RegExp(`\\b${primitive}\\b`);
  if (!exportPattern.test(indexDts)) {
    failures.push(`react/index.d.ts must re-export ${primitive} from the umbrella entry point`);
  }
}

// (r2) lucide-react peer is declared OPTIONAL — CSS-only consumers never need it.
const peerMeta = pkg.peerDependenciesMeta ?? {};
if (peerMeta["lucide-react"]?.optional !== true) {
  failures.push(
    'package.json must declare lucide-react in peerDependenciesMeta with "optional": true — CSS-only consumers never install icons',
  );
}

// (r3) exports["./react"] resolves to existing files (types + import/default).
const reactExport = pkg.exports?.["./react"];
if (reactExport === undefined || typeof reactExport !== "object" || reactExport === null) {
  failures.push('package.json exports["./react"] must be a condition object');
} else {
  for (const condition of ["types", "import", "default"]) {
    const target = reactExport[condition];
    if (typeof target !== "string") {
      failures.push(`exports["./react"].${condition} must be a string path`);
    } else if (!existsSync(resolve(root, target))) {
      failures.push(`exports["./react"].${condition} resolves to a missing file: ${target}`);
    }
  }
}

// (r4) PRUNING PROTOCOL: zero hardcoded hexes in the primitives source —
// they consume CSS variables (var(--token)) or nothing at all.
const primitivesSrc = readFileSync(resolve(root, "react/primitives.tsx"), "utf8");
const hexMatches = primitivesSrc.match(/#[0-9a-f]{6}/gi);
if (hexMatches !== null) {
  failures.push(
    `react/primitives.tsx contains hardcoded hex literal(s) ${[...new Set(hexMatches)].join(", ")} — primitives must consume var(--token) only`,
  );
}

// (r5) EventTimeline / EventModal / useModal are exported from the compiled
// umbrella entry too.
const indexJs = readFileSync(resolve(root, "react/index.js"), "utf8");
for (const compiledExport of ["EventTimeline", "EventModal", "useModal"]) {
  if (!new RegExp(`\\b${compiledExport}\\b`).test(indexJs)) {
    failures.push(
      `react/index.js must re-export ${compiledExport} from the umbrella entry point`,
    );
  }
}

// ---- (t) event timeline (0.6.0) -------------------------------------------------
// (t1) TIMELINE CSS: exists, 768px collapse, sticky z-scale token, pseudo-element
// line, reduced-motion respected, and ZERO hex literals (token-driven only).
const timelineCssPath = resolve(root, "css/timeline.css");
if (!existsSync(timelineCssPath)) {
  failures.push("css/timeline.css is missing — the Event Timeline ships its own stylesheet");
} else {
  const timelineCss = readFileSync(timelineCssPath, "utf8");
  const TIMELINE_REQUIREMENTS = [
    ["max-width: 768px", "the 768px mobile collapse"],
    ["var(--z-sticky", "the Pillar 3 sticky z-scale token on date headers"],
    [".ptp-timeline::before", "the pseudo-element vertical line (never a div)"],
    ["prefers-reduced-motion", "the reduced-motion guard on node transitions"],
  ];
  for (const [needle, label] of TIMELINE_REQUIREMENTS) {
    if (!timelineCss.includes(needle)) {
      failures.push(`css/timeline.css must contain ${needle} — ${label}`);
    }
  }
  const timelineHexes = timelineCss.match(/#[0-9a-f]{3,8}\b/gi);
  if (timelineHexes !== null) {
    failures.push(
      `css/timeline.css contains hex literal(s) ${[...new Set(timelineHexes)].join(", ")} — the timeline is token-driven, zero hex`,
    );
  }
}

// (t2) BUNDLE MEMBERSHIP: timeline.css is layered into `cascade`, after tokens.
const timelineImportIndex = bundle.indexOf('@import "./timeline.css" layer(cascade);');
if (timelineImportIndex === -1) {
  failures.push(
    'css/signature-style.css must import "./timeline.css" layer(cascade) — cascade membership is the layered-import doctrine',
  );
} else {
  const tokensImportIndex = bundle.indexOf('@import "./tokens.css";');
  if (tokensImportIndex !== -1 && timelineImportIndex < tokensImportIndex) {
    failures.push(
      "css/signature-style.css must import ./timeline.css AFTER ./tokens.css (tokens load first)",
    );
  }
}

// (t3) EventTimeline re-export from the compiled umbrella — covered by (r1)
// (index.d.ts) and (r5) (index.js) above.

// ---- (m) event modal (0.7.0) -----------------------------------------------------
// (m1) MODAL CSS: exists, z-pillars on backdrop + card, the documented neutral
// scrim is the ONLY non-token color (zero hex beyond it), reduced-motion
// respected, transition token, 768px collapse, zero box-shadow.
const SCRIM = "rgba(0, 0, 0, 0.6)";
const modalCssPath = resolve(root, "css/modal.css");
if (!existsSync(modalCssPath)) {
  failures.push("css/modal.css is missing — the Event Modal ships its own stylesheet");
} else {
  const modalCss = readFileSync(modalCssPath, "utf8");
  const MODAL_REQUIREMENTS = [
    ["var(--z-overlay", "the Pillar 3 backdrop z-scale token"],
    ["var(--z-modal", "the Pillar 3 card z-scale token"],
    ["ptp-modal-backdrop", "the backdrop class"],
    ["ptp-modal-card", "the dialog card class"],
    [`background: ${SCRIM}`, "the user-mandated neutral scrim on the backdrop"],
    ["prefers-reduced-motion", "the reduced-motion guard on close-button transitions"],
    ["var(--transition-standard)", "the mechanical-physics transition token"],
    ["max-width: 768px", "the Pillar 2 mobile collapse"],
    [":hover", "the Teal close-button hover"],
    ["var(--color-cake-secondary)", "the Teal hover accent (Rule of Engagement: structural)"],
  ];
  for (const [needle, label] of MODAL_REQUIREMENTS) {
    if (!modalCss.includes(needle)) {
      failures.push(`css/modal.css must contain ${needle} — ${label}`);
    }
  }
  // Border doctrine: zero box-shadow DECLARATIONS (a `box-shadow: none`
  // reset is allowed; comment mentions of the word are not declarations).
  const shadowDecls = modalCss.match(/box-shadow\s*:\s*[^;]+;/g);
  const nonNoneShadows = (shadowDecls ?? []).filter((d) => !/^box-shadow\s*:\s*none\s*;$/i.test(d));
  if (nonNoneShadows.length > 0) {
    failures.push(
      `css/modal.css declares a box-shadow (${nonNoneShadows.join(" ")}) — the border doctrine bans drop shadows everywhere`,
    );
  }
  // COLOR DOCTRINE EXCEPTION: the neutral scrim may appear, nothing else.
  // Strip every (documented) scrim occurrence, then demand zero hex.
  const modalHexes = modalCss.replaceAll(SCRIM, "").match(/#[0-9a-f]{3,8}\b/gi);
  if (modalHexes !== null) {
    failures.push(
      `css/modal.css contains hex literal(s) ${[...new Set(modalHexes)].join(", ")} — only the documented rgba(0, 0, 0, 0.6) scrim may bypass the token doctrine`,
    );
  }
}

// (m2) BUNDLE MEMBERSHIP: modal.css is layered into `cascade`, after timeline.
const modalImportIndex = bundle.indexOf('@import "./modal.css" layer(cascade);');
if (modalImportIndex === -1) {
  failures.push(
    'css/signature-style.css must import "./modal.css" layer(cascade) — cascade membership is the layered-import doctrine',
  );
} else {
  const timelineImportIndex = bundle.indexOf('@import "./timeline.css" layer(cascade);');
  if (timelineImportIndex !== -1 && modalImportIndex < timelineImportIndex) {
    failures.push(
      "css/signature-style.css must import ./modal.css AFTER ./timeline.css (timeline styles load first)",
    );
  }
}

// (m3) MODAL SOURCE HYGIENE: portal + a11y contract + Escape cleanup +
// stopPropagation, and zero hardcoded hexes (same rule as primitives, r4).
const modalSrc = readFileSync(resolve(root, "react/modal.tsx"), "utf8");
const MODAL_SRC_REQUIREMENTS = [
  ["createPortal", "the portal architecture"],
  ["document.body", "the portal host — breaks free of the timeline grid stacking context"],
  ['role="dialog"', "the dialog role"],
  ['aria-modal="true"', "the aria-modal flag"],
  ["aria-label={event.title}", "the event-title dialog label"],
  ['aria-label="Close"', "the close button accessible name"],
  ['"Escape"', "the Escape key close"],
  ["removeEventListener", "the keydown listener must be cleaned up"],
  ["stopPropagation", "clicks inside the card must NOT close the modal"],
  ["useCallback", "the useModal stable callbacks"],
];
for (const [needle, label] of MODAL_SRC_REQUIREMENTS) {
  if (!modalSrc.includes(needle)) {
    failures.push(`react/modal.tsx must contain ${needle} — ${label}`);
  }
}
const modalSrcHexes = modalSrc.match(/#[0-9a-f]{6}/gi);
if (modalSrcHexes !== null) {
  failures.push(
    `react/modal.tsx contains hardcoded hex literal(s) ${[...new Set(modalSrcHexes)].join(", ")} — the modal consumes var(--token) only`,
  );
}

// (m4) TIMELINE INTEGRATION: nodes are <button>s firing the optional
// onEventSelect callback with the clicked event (flat DOM preserved).
const timelineSrc = readFileSync(resolve(root, "react/timeline.tsx"), "utf8");
if (!/<button[^>]*className=\{`ptp-timeline__node/.test(timelineSrc)) {
  failures.push(
    "react/timeline.tsx must render timeline nodes as <button className={`ptp-timeline__node…`}> (0.7.0 interactive nodes; was span)",
  );
}
if (!/onEventSelect\?\s*:\s*\(event:\s*PtpEvent\)\s*=>\s*void/.test(timelineSrc)) {
  failures.push(
    "EventTimelineProps must declare the optional onEventSelect?: (event: PtpEvent) => void callback",
  );
}
if (!/=>\s*onEventSelect\(event\)/.test(timelineSrc)) {
  failures.push(
    "react/timeline.tsx must fire onEventSelect(event) from the node button's onClick",
  );
}

// (m5) EventModal + useModal re-export from the compiled umbrella — covered
// by the extended (r1)/(r5) loops above.

// ---- (n) global nav (1.2.0) ------------------------------------------------------
// (n1) NAV CSS: exists, wears the new --z-nav rung (sticky 10 < nav 30 <
// overlay 40), shifts at the strict 768px breakpoint, drives the active
// state via the aria-current attribute selector, slides the drawer with
// translateX, respects reduced motion — and contains ZERO hex literals
// (the rgba scrim lives only in modal.css; nav borrows the backdrop
// element instead of shipping a second scrim).
const navCssPath = resolve(root, "css/nav.css");
if (!existsSync(navCssPath)) {
  failures.push("css/nav.css is missing — the GlobalNav ships its own stylesheet");
} else {
  const navCss = readFileSync(navCssPath, "utf8");
  const NAV_REQUIREMENTS = [
    ["var(--z-nav, 30)", "the navbar z-gap token (Pillar 3 rung between sticky and overlay)"],
    ["position: sticky", "the sticky navbar bar"],
    ["max-width: 768px", "the Pillar 2 mobile shift (list hides, hamburger appears)"],
    ['[aria-current="page"]', "THE active mechanism — the attribute is the state"],
    ["translateX(100%)", "the off-canvas drawer rest state"],
    ["translateX(0)", "the drawer open state"],
    ["prefers-reduced-motion", "the reduced-motion guard on nav transitions"],
    ["var(--color-cake-primary)", "the Flamingo aria-current underline / doctrine focus ring"],
    ["scale(0.97)", "the press physics on links and the hamburger"],
  ];
  for (const [needle, label] of NAV_REQUIREMENTS) {
    if (!navCss.includes(needle)) {
      failures.push(`css/nav.css must contain ${needle} — ${label}`);
    }
  }
  // Border doctrine: zero box-shadow DECLARATIONS (a `box-shadow: none`
  // reset is allowed; comment mentions of the word are not declarations).
  const navShadowDecls = navCss.match(/box-shadow\s*:\s*[^;]+;/g);
  const navNonNoneShadows = (navShadowDecls ?? []).filter(
    (d) => !/^box-shadow\s*:\s*none\s*;$/i.test(d),
  );
  if (navNonNoneShadows.length > 0) {
    failures.push(
      `css/nav.css declares a box-shadow (${navNonNoneShadows.join(" ")}) — the border doctrine bans drop shadows everywhere`,
    );
  }
  // COLOR DOCTRINE: nav has NO exception — the scrim is not here. Zero hex.
  const navHexes = navCss.match(/#[0-9a-f]{3,8}\b/gi);
  if (navHexes !== null) {
    failures.push(
      `css/nav.css contains hex literal(s) ${[...new Set(navHexes)].join(", ")} — the nav is token-driven, zero hex (the rgba scrim lives only in modal.css)`,
    );
  }
}

// (n1b) BUNDLE MEMBERSHIP: nav.css is layered into `cascade`, after modal.
const navImportIndex = bundle.indexOf('@import "./nav.css" layer(cascade);');
if (navImportIndex === -1) {
  failures.push(
    'css/signature-style.css must import "./nav.css" layer(cascade) — cascade membership is the layered-import doctrine',
  );
} else {
  const modalImportIndexForNav = bundle.indexOf('@import "./modal.css" layer(cascade);');
  if (modalImportIndexForNav !== -1 && navImportIndex < modalImportIndexForNav) {
    failures.push(
      "css/signature-style.css must import ./nav.css AFTER ./modal.css (modal styles load first)",
    );
  }
}

// (n2) UMBRELLA RE-EXPORTS: GlobalNav (value) + NavItem + GlobalNavProps
// (types). Type-only names are elided from the compiled JS by design —
// the .d.ts is their surface, so all three are checked there and the
// value export additionally in index.js.
for (const navExport of ["GlobalNav", "NavItem", "GlobalNavProps"]) {
  if (!new RegExp(`\\b${navExport}\\b`).test(indexDts)) {
    failures.push(
      `react/index.d.ts must re-export ${navExport} from the umbrella entry point`,
    );
  }
}
if (!new RegExp("\\bGlobalNav\\b").test(indexJs)) {
  failures.push("react/index.js must re-export GlobalNav from the umbrella entry point");
}

// (n3) --z-nav PARITY: the new rung must exist in tokens.json's shared
// section with the exact value 30. (tokens.css :root value + TOKEN_KEYS
// membership are asserted by the extended (d)/(d2) gates above.)
const navManifest = JSON.parse(readFileSync(resolve(root, "tokens.json"), "utf8"));
const navJsonEntry = navManifest.shared?.tokens?.["--z-nav"];
if (navJsonEntry === undefined) {
  failures.push("tokens.json shared.tokens is missing --z-nav (1.2.0 z-gap rung)");
} else {
  if (String(navJsonEntry.value) !== "30") {
    failures.push(
      `tokens.json shared.tokens["--z-nav"] must be "30", found ${JSON.stringify(navJsonEntry.value)}`,
    );
  }
  if (!/navbar/i.test(String(navJsonEntry.description ?? ""))) {
    failures.push(
      "tokens.json shared.tokens[\"--z-nav\"] must carry the navbar description (floats above sticky headers, below overlays)",
    );
  }
}

// ---- (v) telemetry viz (1.3.0) ---------------------------------------------------
// (v1) VIZ CSS: exists, 8px-grid track, owner-mandated fill physics, surface
// track token, reduced-motion respected — and ZERO hex literals, zero
// box-shadow (data-ink doctrine: no grid lines, no shadows, no 3D; the
// StatRing needs NO css at all — it is pure SVG attributes).
const vizCssPath = resolve(root, "css/viz.css");
if (!existsSync(vizCssPath)) {
  failures.push("css/viz.css is missing — the telemetry primitives ship their own stylesheet");
} else {
  const vizCss = readFileSync(vizCssPath, "utf8");
  const VIZ_REQUIREMENTS = [
    ["height: 8px", "the 8px-grid track height"],
    ["width 0.3s ease-out", "the owner-mandated fill physics"],
    ["prefers-reduced-motion", "the reduced-motion guard on the fill transition"],
    ["var(--bg-surface)", "the surface track (data-ink doctrine: track = surface, fill = party)"],
  ];
  for (const [needle, label] of VIZ_REQUIREMENTS) {
    if (!vizCss.includes(needle)) {
      failures.push(`css/viz.css must contain ${needle} — ${label}`);
    }
  }
  // Border doctrine: zero box-shadow DECLARATIONS (a `box-shadow: none`
  // reset is allowed; comment mentions of the word are not declarations).
  const vizShadowDecls = vizCss.match(/box-shadow\s*:\s*[^;]+;/g);
  const vizNonNoneShadows = (vizShadowDecls ?? []).filter(
    (d) => !/^box-shadow\s*:\s*none\s*;$/i.test(d),
  );
  if (vizNonNoneShadows.length > 0) {
    failures.push(
      `css/viz.css declares a box-shadow (${vizNonNoneShadows.join(" ")}) — the data-ink doctrine bans drop shadows everywhere`,
    );
  }
  // COLOR DOCTRINE: viz has NO exception — zero hex.
  const vizHexes = vizCss.match(/#[0-9a-f]{3,8}\b/gi);
  if (vizHexes !== null) {
    failures.push(
      `css/viz.css contains hex literal(s) ${[...new Set(vizHexes)].join(", ")} — the viz is token-driven, zero hex`,
    );
  }
}

// (v1b) BUNDLE MEMBERSHIP: viz.css is layered into `cascade`, after nav.
const vizImportIndex = bundle.indexOf('@import "./viz.css" layer(cascade);');
if (vizImportIndex === -1) {
  failures.push(
    'css/signature-style.css must import "./viz.css" layer(cascade) — cascade membership is the layered-import doctrine',
  );
} else {
  const navImportIndexForViz = bundle.indexOf('@import "./nav.css" layer(cascade);');
  if (navImportIndexForViz !== -1 && vizImportIndex < navImportIndexForViz) {
    failures.push(
      "css/signature-style.css must import ./viz.css AFTER ./nav.css (nav styles load first)",
    );
  }
}

// (v2) UMBRELLA RE-EXPORTS: ProgressBar + StatRing (values) and their prop
// types — same surface split as (n2): type-only names live in the .d.ts,
// the value exports are additionally checked in the compiled index.js.
for (const vizExport of ["ProgressBar", "StatRing", "ProgressBarProps", "StatRingProps"]) {
  if (!new RegExp(`\\b${vizExport}\\b`).test(indexDts)) {
    failures.push(
      `react/index.d.ts must re-export ${vizExport} from the umbrella entry point`,
    );
  }
}
for (const vizValueExport of ["ProgressBar", "StatRing"]) {
  if (!new RegExp(`\\b${vizValueExport}\\b`).test(indexJs)) {
    failures.push(
      `react/index.js must re-export ${vizValueExport} from the umbrella entry point`,
    );
  }
}

// (v3) PARTY GUARD: the runtime Rule-of-Engagement guard survives in the
// viz source — a structural token slipped past the types (JS consumers)
// must warn and render null, never paint structural chrome as data.
const vizSrc = readFileSync(resolve(root, "react/viz.tsx"), "utf8");
if (!vizSrc.includes('startsWith("--party-")')) {
  failures.push(
    'react/viz.tsx must contain the runtime party guard startsWith("--party-") — the Rule of Engagement is enforced at runtime, not just in the types',
  );
}

// ---- (f) forms (1.4.0) -----------------------------------------------------------
// (f1) FORMS CSS: exists, inset wells on the keeper token, attribute-driven
// error state (aria-invalid → party-peach, the ONE sanctioned party use on
// structural chrome), the doctrine focus outline, the switch knob travel
// (translateX(1.25rem) on aria-checked), reduced-motion respected — and
// ZERO hex literals, zero box-shadow.
const formsCssPath = resolve(root, "css/forms.css");
if (!existsSync(formsCssPath)) {
  failures.push("css/forms.css is missing — the input primitives ship their own stylesheet");
} else {
  const formsCss = readFileSync(formsCssPath, "utf8");
  const FORMS_REQUIREMENTS = [
    ["var(--bg-inset)", "the inset-well field background (the keeper's semantic job)"],
    ['[aria-invalid="true"]', "the attribute-driven error state (like nav's aria-current)"],
    ["var(--party-peach)", "the error border token (owner spec: error = party-peach)"],
    ["outline: 2px solid var(--color-cake-primary)", "the doctrine focus ring"],
    ["translateX(1.25rem)", "the switch knob travel (44 − 16 − 8 = 20px = 1.25rem)"],
    ['[aria-checked="true"]', "the switch state machine — the attribute IS the state"],
    ["::before", "the switch knob as a pseudo-element (peak pruning: ONE element)"],
    ["var(--transition-standard)", "the mechanical physics on fields and knob"],
    ["prefers-reduced-motion", "the reduced-motion guard on transitions"],
  ];
  for (const [needle, label] of FORMS_REQUIREMENTS) {
    if (!formsCss.includes(needle)) {
      failures.push(`css/forms.css must contain ${needle} — ${label}`);
    }
  }
  // Border doctrine: zero box-shadow DECLARATIONS (a `box-shadow: none`
  // reset is allowed; comment mentions of the word are not declarations).
  const formsShadowDecls = formsCss.match(/box-shadow\s*:\s*[^;]+;/g);
  const formsNonNoneShadows = (formsShadowDecls ?? []).filter(
    (d) => !/^box-shadow\s*:\s*none\s*;$/i.test(d),
  );
  if (formsNonNoneShadows.length > 0) {
    failures.push(
      `css/forms.css declares a box-shadow (${formsNonNoneShadows.join(" ")}) — the border doctrine bans drop shadows everywhere`,
    );
  }
  // COLOR DOCTRINE: forms have NO exception — zero hex (even in comments).
  const formsHexes = formsCss.match(/#[0-9a-f]{3,8}\b/gi);
  if (formsHexes !== null) {
    failures.push(
      `css/forms.css contains hex literal(s) ${[...new Set(formsHexes)].join(", ")} — the forms are token-driven, zero hex`,
    );
  }
}

// ---- (fb) toasts (1.4.0) ----------------------------------------------------------
// (fb1) TOAST CSS: exists, the region wears the zenith rung var(--z-toast, 60),
// the toast-life keyframes exist, status strips map through var(--status) to
// party-green / party-peach, the owner's mechanical cubic-bezier shapes the
// slide-hold-fade, reduced-motion respected — ZERO hex, zero box-shadow.
const toastCssPath = resolve(root, "css/toast.css");
if (!existsSync(toastCssPath)) {
  failures.push("css/toast.css is missing — the feedback layer ships its own stylesheet");
} else {
  const toastCss = readFileSync(toastCssPath, "utf8");
  const TOAST_REQUIREMENTS = [
    ["var(--z-toast, 60)", "the zenith rung — toasts float ABOVE modals (--z-modal 50)"],
    ["@keyframes toast-life", "the slide-in / hold / slide-out animation"],
    ["translateX(100%)", "the off-canvas right rest position"],
    ["var(--status)", "the inline status custom property on the status strip"],
    ["var(--party-green)", "the success strip token"],
    ["var(--party-peach)", "the error strip token"],
    ["cubic-bezier(0.2, 0.8, 0.2, 1)", "the owner's mechanical physics on the slide"],
    ["prefers-reduced-motion", "the reduced-motion guard (animation: none, opacity 1)"],
  ];
  for (const [needle, label] of TOAST_REQUIREMENTS) {
    if (!toastCss.includes(needle)) {
      failures.push(`css/toast.css must contain ${needle} — ${label}`);
    }
  }
  // Border doctrine: zero box-shadow DECLARATIONS (a `box-shadow: none`
  // reset is allowed; comment mentions of the word are not declarations).
  const toastShadowDecls = toastCss.match(/box-shadow\s*:\s*[^;]+;/g);
  const toastNonNoneShadows = (toastShadowDecls ?? []).filter(
    (d) => !/^box-shadow\s*:\s*none\s*;$/i.test(d),
  );
  if (toastNonNoneShadows.length > 0) {
    failures.push(
      `css/toast.css declares a box-shadow (${toastNonNoneShadows.join(" ")}) — the border doctrine bans drop shadows everywhere`,
    );
  }
  // COLOR DOCTRINE: toasts have NO exception — zero hex (even in comments).
  const toastHexes = toastCss.match(/#[0-9a-f]{3,8}\b/gi);
  if (toastHexes !== null) {
    failures.push(
      `css/toast.css contains hex literal(s) ${[...new Set(toastHexes)].join(", ")} — the toasts are token-driven, zero hex`,
    );
  }
}

// (fb2) BUNDLE MEMBERSHIP: forms.css layered after viz.css, toast.css after
// forms.css — the cascade-import order doctrine.
const formsImportIndex = bundle.indexOf('@import "./forms.css" layer(cascade);');
if (formsImportIndex === -1) {
  failures.push(
    'css/signature-style.css must import "./forms.css" layer(cascade) — cascade membership is the layered-import doctrine',
  );
} else {
  const vizImportIndexForForms = bundle.indexOf('@import "./viz.css" layer(cascade);');
  if (vizImportIndexForForms !== -1 && formsImportIndex < vizImportIndexForForms) {
    failures.push(
      "css/signature-style.css must import ./forms.css AFTER ./viz.css (viz styles load first)",
    );
  }
}
const toastImportIndex = bundle.indexOf('@import "./toast.css" layer(cascade);');
if (toastImportIndex === -1) {
  failures.push(
    'css/signature-style.css must import "./toast.css" layer(cascade) — cascade membership is the layered-import doctrine',
  );
} else {
  const formsImportIndexForToast = bundle.indexOf('@import "./forms.css" layer(cascade);');
  if (formsImportIndexForToast !== -1 && toastImportIndex < formsImportIndexForToast) {
    failures.push(
      "css/signature-style.css must import ./toast.css AFTER ./forms.css (form styles load first)",
    );
  }
}

// ---- (n4) FEEDBACK UMBRELLA (1.4.0) ------------------------------------------------
// Input, TextArea, ToggleSwitch, ToastProvider, useToast — all five names in
// index.d.ts (types elide from the compiled JS) and the five VALUE exports
// additionally in index.js.
for (const feedbackExport of [
  "Input",
  "TextArea",
  "ToggleSwitch",
  "ToastProvider",
  "useToast",
]) {
  if (!new RegExp(`\\b${feedbackExport}\\b`).test(indexDts)) {
    failures.push(
      `react/index.d.ts must re-export ${feedbackExport} from the umbrella entry point`,
    );
  }
  if (!new RegExp(`\\b${feedbackExport}\\b`).test(indexJs)) {
    failures.push(
      `react/index.js must re-export ${feedbackExport} from the umbrella entry point`,
    );
  }
}

// ---- verdict ------------------------------------------------------------------
if (failures.length > 0) {
  console.error("FAIL");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("PASS");
