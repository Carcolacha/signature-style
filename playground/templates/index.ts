/**
 * playground/templates — the three full-page blueprints (3.8.0).
 *
 * One default-export page per file, each composed exclusively from
 * @edwyn/signature-style exports + the v3.7.0 kinetic primitives, each
 * carrying its own embedded token-driven <style> block (standalone
 * purity: scaffold it and it renders complete). This barrel re-exports
 * the three pages; the SNIPPET strings + metadata live in
 * ../template-sources.ts and the assembly in ../template-registry.ts.
 */
export { default as SaasLandingTemplate } from "./SaasLandingTemplate.js";
export { default as DocsReaderTemplate } from "./DocsReaderTemplate.js";
export { default as TelemetryCenterTemplate } from "./TelemetryCenterTemplate.js";
