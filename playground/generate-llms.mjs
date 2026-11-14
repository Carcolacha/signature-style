#!/usr/bin/env node
/**
 * generate-llms.mjs — the machine-readable signature (2.8.0).
 *
 * Generates BOTH manifests from source, so they can never drift:
 *
 *   playground/public/llms.txt       — the CONCISE index (standard
 *                                      llms.txt format: H1, blockquote,
 *                                      ## sections, bullet links);
 *   playground/public/llms-full.txt  — the COMPLETE self-contained
 *                                      markdown: every token
 *                                      (name/value/description), every
 *                                      rule, all 6 sets with every
 *                                      component's copy-paste JSX from
 *                                      the SNIPPETS registry + the prop
 *                                      tables extracted from
 *                                      react/*.d.ts.
 *
 * Sources (regeneration = one command — `npm run llms`):
 *   - playground/snippets.ts        (the copy-paste contracts)
 *   - tokens.json                   (the 50-token whitelist, verbatim)
 *   - SYSTEM_PROMPT.md v3.0         (the doctrines, verbatim-in-spirit)
 *   - react/*.d.ts                  (the shipped prop surfaces)
 *
 * Node ≥ 23.6 strips TS types natively, so the .ts registry is imported
 * directly — no compile step, no drift. vite serves playground/public/
 * at the server root: the files are reachable at /llms.txt.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { SNIPPETS, SET_NAMES, SET_BLURBS } from "./snippets.ts";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const publicDir = resolve(here, "public");
mkdirSync(publicDir, { recursive: true });

const SET_ORDER = ["01", "02", "03", "04", "05", "06"];

/** Registry key → the d.ts symbol carrying its prop/type surface. */
const PROP_SYMBOLS = {
  useModal: "UseModalReturn",
  useToast: "ToastFn",
  SigShell: null,
  ToastProvider: null,
};

/* ---- tokens.json — the 50-token whitelist, verbatim ------------------- */
const tokens = JSON.parse(readFileSync(resolve(root, "tokens.json"), "utf8"));
const mocha = Object.values(tokens.themes.mocha.tokens);
const latte = Object.values(tokens.themes.latte.tokens);
const shared = Object.values(tokens.shared.tokens);
const party = Object.values(tokens.sigPalette.tokens);
const whitelist = new Set([
  ...Object.keys(tokens.themes.mocha.tokens),
  ...Object.keys(tokens.shared.tokens),
  ...Object.keys(tokens.sigPalette.tokens),
]);
if (whitelist.size !== 50) {
  throw new Error(`generate-llms: expected the 50-token whitelist (3.0.0: 34 + cobalt + 15 chromatic + --radius-card), found ${String(whitelist.size)}`);
}

/* ---- SYSTEM_PROMPT.md — the doctrines ---------------------------------- */
const systemPrompt = readFileSync(resolve(root, "SYSTEM_PROMPT.md"), "utf8");
const doctrines = systemPrompt.slice(0, systemPrompt.indexOf("## Universal AI Replication Contract")).trimEnd();

/* ---- react/*.d.ts — prop surfaces (brace-matched blocks) --------------- */
const dtsDir = resolve(root, "react");
const dtsFiles = readdirSync(dtsDir).filter((f) => f.endsWith(".d.ts"));

/** Extract a complete `export interface|type NAME …` block (brace-balanced
    for interfaces; single statement for types). */
function extractSymbol(name) {
  for (const file of dtsFiles) {
    const src = readFileSync(resolve(dtsDir, file), "utf8");
    for (const kind of ["interface", "type"]) {
      const marker = `export ${kind} ${name} `;
      const start = src.indexOf(marker);
      if (start === -1) continue;
      const braceStart = src.indexOf("{", start);
      const parenStart = src.indexOf("(", start);
      if (kind === "interface" && braceStart !== -1 && (parenStart === -1 || braceStart < parenStart)) {
        let depth = 0;
        for (let i = braceStart; i < src.length; i++) {
          if (src[i] === "{") depth++;
          else if (src[i] === "}") {
            depth--;
            if (depth === 0) {
              return { file: `react/${file}`, block: src.slice(start, i + 1) };
            }
          }
        }
      }
      if (kind === "type") {
        const end = src.indexOf("\n\n", start);
        const stop = end === -1 ? src.length : end;
        return { file: `react/${file}`, block: src.slice(start, stop).trimEnd() };
      }
    }
  }
  return null;
}

function propsSection(key) {
  const symbol = PROP_SYMBOLS[key] !== undefined ? PROP_SYMBOLS[key] : `${key}Props`;
  if (symbol === null) return null;
  const found = extractSymbol(symbol);
  if (found === null) return null;
  return { symbol, ...found };
}

/* ---- llms-full.txt — the complete self-contained manifest -------------- */
const lines = [];
lines.push("# @edwyn/signature-style — The Signature Style (full)");
lines.push("");
lines.push(
  "> Catppuccin Mocha-based design system: Token Cascade, Override Protocol, Party Palette content colors, mechanical physics.",
);
lines.push("");
lines.push(`Version: ${tokens.meta.version} · Edition: ${tokens.meta.edition}`);
lines.push("");
lines.push(
  "GENERATED by playground/generate-llms.mjs (`npm run llms`) from snippets.ts + tokens.json + SYSTEM_PROMPT.md + react/*.d.ts. Regenerate after any source change — never hand-edit.",
);
lines.push("");

lines.push("## The 50-Token Whitelist");
lines.push("");
lines.push("### Mocha (dark default — theme tokens; Latte swaps the values by `[data-theme=\"latte\"]`, same names)");
lines.push("");
for (const t of mocha) {
  lines.push(`- \`${t.name}\` \`${t.value}\` — ${t.description}`);
}
lines.push("");
lines.push("### Latte (light opt-in — the same token names, official Latte values)");
lines.push("");
for (const t of latte) {
  lines.push(`- \`${t.name}\` \`${t.value}\``);
}
lines.push("");
lines.push("### Shared (theme-independent, defined once in :root)");
lines.push("");
for (const t of shared) {
  lines.push(`- \`${t.name}\` \`${t.value}\` — ${t.description}`);
}
lines.push("");
lines.push("### The Party Palette (content-ONLY — the Rule of Engagement)");
lines.push("");
for (const t of party) {
  lines.push(`- \`${t.name}\` \`${t.value}\` — ${t.description}`);
}
lines.push("");
lines.push("**Rule of Engagement (non-negotiable):** `--sig-*` is content-only; Flamingo/Teal (`--color-cake-primary` / `--color-cake-secondary`) is structural-only. The two families never cross.");
lines.push("");

lines.push("## The Rules (The Dynamic Signature Engine v3.2)");
lines.push("");
lines.push(doctrines);
lines.push("");

lines.push("## The 6-Set Taxonomy — every component, copy-paste");
lines.push("");
lines.push(`Registry: ${Object.keys(SNIPPETS).length} entries, one per value export of react/index.d.ts. Every snippet is compile-plausible documentation — one import, no invented props.`);
lines.push("");
for (const setId of SET_ORDER) {
  lines.push(`### Set ${setId} — ${SET_NAMES[setId]}`);
  lines.push("");
  lines.push(SET_BLURBS[setId]);
  lines.push("");
  for (const [key, entry] of Object.entries(SNIPPETS)) {
    if (entry.set !== setId) continue;
    lines.push(`#### ${entry.componentName} (${key})`);
    lines.push("");
    lines.push("Copy-paste JSX:");
    lines.push("");
    lines.push("```tsx");
    lines.push(entry.jsx);
    lines.push("```");
    if (entry.html !== undefined) {
      lines.push("");
      lines.push("HTML variant (no React — real package classes/inline styles):");
      lines.push("");
      lines.push("```html");
      lines.push(entry.html);
      lines.push("```");
    }
    const props = propsSection(key);
    if (props !== null) {
      lines.push("");
      lines.push(`Props surface — ${props.file} (\`${props.symbol}\`):`);
      lines.push("");
      lines.push("```ts");
      lines.push(props.block);
      lines.push("```");
    }
    lines.push("");
  }
}

lines.push("## The Universal AI Replication Contract (source of truth)");
lines.push("");
lines.push("The recipes above are ported from SYSTEM_PROMPT.md's Universal AI Replication Contract — read that section of SYSTEM_PROMPT.md for the narrative contracts. Any AI consuming `@edwyn/signature-style` reproduces the signature verbatim: read the snippet, copy the snippet.");
lines.push("");

const llmsFull = `${lines.join("\n")}\n`;
writeFileSync(resolve(publicDir, "llms-full.txt"), llmsFull);

/* ---- llms.txt — the concise index -------------------------------------- */
const setIndex = SET_ORDER.map((setId) => {
  const keys = Object.entries(SNIPPETS)
    .filter(([, entry]) => entry.set === setId)
    .map(([key]) => key);
  return `- [Set ${setId} — ${SET_NAMES[setId]}](llms-full.txt): ${keys.join(", ")} (live demos + copy-paste in the playground's Pattern Studio)`;
});

const llms = `# @edwyn/signature-style — The Signature Style

> Catppuccin Mocha-based design system: Token Cascade, Override Protocol, Party Palette content colors, mechanical physics.

The official machine-readable index for AI agents. Full self-contained version: [llms-full.txt](llms-full.txt) — every token, every rule, every copy-paste snippet + prop tables. Package source: [npm:@edwyn/signature-style](https://www.npmjs.com/package/@edwyn/signature-style).

## Tokens

- [tokens.json](https://unpkg.com/@edwyn/signature-style/tokens.json): the machine-readable token manifest — the 50-token whitelist, Mocha + Latte themes, shared tokens, the Party Palette, the doctrine objects
- [llms-full.txt — The 50-Token Whitelist](llms-full.txt): every token with value + description, rendered from tokens.json
- [css/tokens.css](https://unpkg.com/@edwyn/signature-style/css/tokens.css): the cascade source — 37 colors + 13 spatial/z/type/motion tokens in @layer tokens

## Rules

- [SYSTEM_PROMPT.md](https://unpkg.com/@edwyn/signature-style/SYSTEM_PROMPT.md): The Dynamic Signature Engine v3.0 — the Token Cascade, the Override Protocol, the Structural Pillars, the Pruning Protocol, the Rule of Engagement, and the Universal AI Replication Contract
- [llms-full.txt — The Rules](llms-full.txt): the doctrines rendered verbatim-in-spirit
- One-line doctrine: every state derives from the core tokens via color-mix()/transforms; --sig-* is content-only, Flamingo/Teal structural-only; separation is hairlines, never shadows (the ONE sanction: css/surface.css's elevation blocks).

## Component Sets

The 6-Set Taxonomy — ${Object.keys(SNIPPETS).length} documented exports, one copy-paste snippet each:

${setIndex.join("\n")}

## Recipes

- [llms-full.txt — copy-paste snippets](llms-full.txt): every component's JSX recipe (+ HTML variants where documented), each with its prop surface extracted from react/*.d.ts
- [The Universal AI Replication Contract](https://unpkg.com/@edwyn/signature-style/SYSTEM_PROMPT.md): "Any AI consuming @edwyn/signature-style can reproduce this signature verbatim — read the snippet, copy the snippet."
- [STORYBOOK.md](https://unpkg.com/@edwyn/signature-style/STORYBOOK.md): the human-readable manual — philosophy, every color token, every component API
`;

writeFileSync(resolve(publicDir, "llms.txt"), llms);

console.log(
  `llms: wrote public/llms.txt (${String(llms.length)} bytes) + public/llms-full.txt (${String(llmsFull.length)} bytes) — ${String(Object.keys(SNIPPETS).length)} snippets, ${String(whitelist.size)} tokens`,
);
