#!/usr/bin/env node
/**
 * regen-template-sources.mjs — the (tpl1) parity leg's authoring tool
 * (3.9.0). Reads the three shipped template components
 * (playground/templates/*.tsx), applies the EXACT escape transform the
 * (tpl1) gate asserts (`trimEnd` + backslash/backtick/${ escapes) and
 * rebuilds the TEMPLATE_SOURCES block of playground/template-sources.ts
 * verbatim. The header comment + TEMPLATE_META above the block are
 * preserved byte-for-byte; only the `export const TEMPLATE_SOURCES …`
 * object is regenerated.
 *
 * Run after ANY edit to playground/templates/*.tsx:
 *   node scripts/regen-template-sources.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const sourcesPath = resolve(root, "playground", "template-sources.ts");

/** The exact (tpl1) transform — drift here is drift in the gate. */
function escapeTemplate(source) {
  return source
    .trimEnd()
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");
}

const TEMPLATES = [
  ["saas", "SaasLandingTemplate.tsx"],
  ["docs", "DocsReaderTemplate.tsx"],
  ["telemetry", "TelemetryCenterTemplate.tsx"],
];

const entries = TEMPLATES.map(([id, file]) => {
  const raw = readFileSync(resolve(root, "playground", "templates", file), "utf8");
  return `  ${id}: \`\n${escapeTemplate(raw)}\`,`;
});

const original = readFileSync(sourcesPath, "utf8");
const MARKER = "export const TEMPLATE_SOURCES: Record<TemplateId, string> = {";
const start = original.indexOf(MARKER);
if (start === -1) {
  console.error("FAIL — TEMPLATE_SOURCES marker not found");
  process.exit(1);
}
// The object ENDS at the file's LAST "\n};" — entries embed the
// templates' own source, which contains plenty of earlier "\n};"
// lines (function closers), so first-index would truncate mid-entry.
const end = original.lastIndexOf("\n};");
if (end === -1 || end < start) {
  console.error("FAIL — TEMPLATE_SOURCES closing brace not found");
  process.exit(1);
}
const rebuilt =
  original.slice(0, start) +
  MARKER +
  "\n" +
  entries.join("\n") +
  original.slice(end);
writeFileSync(sourcesPath, rebuilt);
console.log(
  `template-sources.ts regenerated — ${TEMPLATES.map(([id, f]) => `${id}←${f}`).join(", ")}`,
);
