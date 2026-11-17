/**
 * playground/templates — the full-page blueprints.
 *
 * 4.0.0 — THE BLUEPRINT SET CHANGE (BREAKING): the generic SaaS
 * Landing + Docs Reader templates RETIRE; the set is the two
 * authentic, human-crafted blueprints — the Match & Telemetry
 * Analytics Hub (id "telemetry", replacing the old observability
 * center under the same id) and the Interactive Micro-Lab & Discovery
 * Deck (id "microlab", new). One default-export page per file, each
 * composed exclusively from @edwyn/signature-style exports + the
 * kinetic primitives, each carrying its own embedded token-driven
 * <style> block (standalone purity: scaffold it and it renders
 * complete). This barrel re-exports the pages; the SNIPPET strings +
 * metadata live in ../template-sources.ts and the assembly in
 * ../template-registry.ts.
 */
export { default as TelemetryCenterTemplate } from "./TelemetryCenterTemplate.js";
export { default as MicroLabTemplate } from "./MicroLabTemplate.js";
