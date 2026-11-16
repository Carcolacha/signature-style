/**
 * TEMPLATE-REGISTRY — the full-page templates' ONE registry (3.8.0
 * "Full-Page Layout Templates, Interactive Viewport Previewer & CLI
 * Template Expansion").
 *
 * PAGE_TEMPLATES is to the Templates Studio what SNIPPETS is to the
 * Pattern Studio: one typed array, one entry per full-page blueprint —
 * the LIVE Component (default export of playground/templates/*.tsx)
 * beside its SNIPPET string (the formatted standalone source from
 * playground/template-sources.ts, mechanically derived from the same
 * file). The studio renders Component inside the stage (Preview) and
 * copies source (Full TSX Code / Copy Full Page); the llms generator
 * reads the same strings into the blueprints section — the payloads
 * cannot drift.
 *
 * Consumers:
 *   - playground/components/TemplatesStudio.tsx (the stage + controls)
 *   - playground/App.tsx (the per-template palette jumps)
 *   - playground/generate-llms.mjs (via template-sources.ts — the
 *     registry's Component leg is React .tsx, which Node cannot
 *     import; the generator reads the DATA layer and (tpl1) pins the
 *     parity between the two).
 */
import type { ComponentType } from "react";
import { TEMPLATE_META, TEMPLATE_SOURCES } from "./template-sources.js";
import type { TemplateId } from "./template-sources.js";
import SaasLandingTemplate from "./templates/SaasLandingTemplate.js";
import DocsReaderTemplate from "./templates/DocsReaderTemplate.js";
import TelemetryCenterTemplate from "./templates/TelemetryCenterTemplate.js";

/** One full-page blueprint: the live page + its copyable source. */
export interface PageTemplate {
  /** The stable id — the studio Tabs, the palette jumps, the CLI. */
  id: TemplateId;
  /** The display name ("SaaS Landing"). */
  name: string;
  /** The one-line description (registry + llms blueprints). */
  description: string;
  /** The LIVE default-export page component. */
  Component: ComponentType;
  /** The formatted standalone source (the Copy Full Page payload). */
  source: string;
}

/** The display order — the studio Tabs number them 01 · 02 · 03. */
export const PAGE_TEMPLATES: Array<{
  id: TemplateId;
  name: string;
  description: string;
  Component: ComponentType;
  source: string;
}> = [
  {
    id: "saas",
    name: TEMPLATE_META.saas.name,
    description: TEMPLATE_META.saas.description,
    Component: SaasLandingTemplate,
    source: TEMPLATE_SOURCES.saas,
  },
  {
    id: "docs",
    name: TEMPLATE_META.docs.name,
    description: TEMPLATE_META.docs.description,
    Component: DocsReaderTemplate,
    source: TEMPLATE_SOURCES.docs,
  },
  {
    id: "telemetry",
    name: TEMPLATE_META.telemetry.name,
    description: TEMPLATE_META.telemetry.description,
    Component: TelemetryCenterTemplate,
    source: TEMPLATE_SOURCES.telemetry,
  },
];

/** id → registry entry (the studio + palette lookups). */
export const PAGE_TEMPLATE_BY_ID: Record<TemplateId, PageTemplate> =
  Object.fromEntries(PAGE_TEMPLATES.map((template) => [template.id, template])) as Record<
    TemplateId,
    PageTemplate
  >;

/** id → the breadcrumb slug ("engine / templates / saas-landing"). */
export const TEMPLATE_SLUGS: Record<TemplateId, string> = {
  saas: "saas-landing",
  docs: "docs-reader",
  telemetry: "telemetry-center",
};
