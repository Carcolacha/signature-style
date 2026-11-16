#!/usr/bin/env node
/**
 * gates-v390.mjs — THE v3.9.0 RELEASE GATES, as PURE FUNCTIONS.
 *
 * Each gate takes a { path: content } record and returns an array of
 * failure strings — EMPTY means the gate passes. Two consumers:
 *
 *   · scripts/verify.mjs (the release runner) calls runV390Gates with
 *     the real working-tree contents;
 *   · scripts/verify-negative-v390.mjs (the NEGATIVE TESTS) calls the
 *     SAME functions with MUTATED copies — deleting the exact line the
 *     gate exists to protect — and asserts the gate FAILS with the
 *     right message. A gate that cannot fail is decoration.
 *
 * THE GATES (the owner's task list, verbatim):
 *   (mm1) container-query reflow — the stage declares the
 *         template-stage container; all three templates answer it with
 *         @container queries; NO viewport @media width breakpoint
 *         remains in any template; the telemetry inner grid + tiers.
 *   (mm2) StatRing enum — the three frozen sizes, the enum union, the
 *         inline --ring-size, the css box (exact + flex-shrink 0).
 *   (mm3) workbench — the palette grid tracks (minmax(120px, 1fr)) in
 *         the wide bottom compartment; FlipCard's 220px floor.
 *   (mm4) graph studio — layoutMode + nodeKind types, the pure
 *         tree/radial/edge helpers, the full-viewport needles
 *         (calc(100vh - 56px), the 24px dot matrix), the 3 HUD card
 *         classes, the deterministic local AI-expand generator.
 *   (mm5) motion suite — the REGISTERED --sig-beam-angle + the conic
 *         4-token cycle + the mask ring; the tilt perspective; the
 *         beacon ping; the waveform bars; reduced-motion overrides on
 *         ALL of them.
 */

/* ---- (mm1) CONTAINER-QUERY REFLOW ----------------------------------------- */
export function gateMm1({ styles, saas, docs, telemetry }) {
  const failures = [];
  const stageBlock = styles.slice(styles.indexOf(".tpl-studio__stage {"));
  if (stageBlock.includes("container-type: inline-size;") === false) {
    failures.push(
      "(mm1) playground/styles.css .tpl-studio__stage must declare container-type: inline-size — the stage IS the container the emulator's width answers (deleting this line is the negative test)",
    );
  }
  if (stageBlock.includes("container-name: template-stage;") === false) {
    failures.push(
      "(mm1) playground/styles.css .tpl-studio__stage must declare container-name: template-stage — the ONE shared container name",
    );
  }
  for (const [name, src] of [
    ["SaasLandingTemplate", saas],
    ["DocsReaderTemplate", docs],
    ["TelemetryCenterTemplate", telemetry],
  ]) {
    if (src.includes("@container template-stage") === false) {
      failures.push(
        `(mm1) playground/templates/${name}.tsx must carry @container template-stage queries — the reflow answers the STAGE, never the window viewport`,
      );
    }
    // NO viewport-width @media may remain (prefers-reduced-motion is a
    // MOTION query, not a width breakpoint — allowed everywhere).
    const widthMedia = src.match(/@media \([^)]*(width)[^)]*\)/g);
    if (widthMedia !== null) {
      failures.push(
        `(mm1) playground/templates/${name}.tsx still carries viewport @media width breakpoint(s) ${JSON.stringify(widthMedia)} — the emulator lie (defect #1) lives in these lines`,
      );
    }
  }
  // The telemetry inner grid (a container may not restyle itself).
  for (const needle of [
    ".sig-tpl-telemetry__grid {",
    "@container template-stage (max-width: 1024px)",
    "@container template-stage (max-width: 639px)",
    "minmax(0, 1fr)",
  ]) {
    if (telemetry.includes(needle) === false) {
      failures.push(`(mm1) TelemetryCenterTemplate.tsx must contain ${JSON.stringify(needle)} — the inner-grid tier structure`);
    }
  }
  return failures;
}

/* ---- (mm2) STATRING SIZE ENUM ---------------------------------------------- */
export function gateMm2({ viz, vizCss }) {
  const failures = [];
  for (const needle of [
    'export type StatRingSize = "sm" | "md" | "lg"',
    "sm: 88,",
    "md: 128,",
    "lg: 168,",
    'size = "md"',
    'className="sig-stat-ring"',
    '"--ring-size"',
  ]) {
    if (viz.includes(needle) === false) {
      failures.push(`(mm2) react/viz.tsx must contain ${JSON.stringify(needle)} — the size enum contract`);
    }
  }
  const ringRule = vizCss.slice(vizCss.indexOf(".sig-stat-ring {"));
  for (const needle of [
    "width: var(--ring-size, 128px)",
    "height: var(--ring-size, 128px)",
    "aspect-ratio: 1 / 1",
    "flex-shrink: 0",
  ]) {
    if (ringRule.includes(needle) === false) {
      failures.push(`(mm2) css/viz.css .sig-stat-ring must contain ${JSON.stringify(needle)} — the box can never stretch (defect #2)`);
    }
  }
  return failures;
}

/* ---- (mm3) WORKBENCH PROPORTIONS -------------------------------------------- */
export function gateMm3({ styles, app, cards }) {
  const failures = [];
  const gridBlock = styles.slice(styles.indexOf(".hub__palette-grid {"), styles.indexOf(".hub__palette-swatch {"));
  if (gridBlock.includes("repeat(auto-fill, minmax(120px, 1fr))") === false) {
    failures.push(
      "(mm3) playground/styles.css .hub__palette-grid must pack repeat(auto-fill, minmax(120px, 1fr)) — the 26 swatches must tile horizontally",
    );
  }
  for (const needle of [
    'className="sig-span-12 sig-cell"',
    'data-testid="palette-grid"',
  ]) {
    if (app.includes(needle) === false) {
      failures.push(`(mm3) playground/App.tsx must contain ${JSON.stringify(needle)} — the palette's wide bottom compartment (span 12)`);
    }
  }
  const flipBlock = cards.slice(cards.indexOf(".sig-flip-card {"), cards.indexOf(".sig-flip-card:focus-visible"));
  if (flipBlock.includes("min-height: 220px") === false) {
    failures.push(
      "(mm3) css/cards.css .sig-flip-card must carry the min-height: 220px floor — the flip card never collapses to a thin bar",
    );
  }
  return failures;
}

/* ---- (mm4) FULL-VIEWPORT GRAPH STUDIO ---------------------------------------- */
export function gateMm4({ graph, styles, expansion, studio }) {
  const failures = [];
  for (const needle of [
    'nodeKind?: GraphNodeKind',
    'export type GraphNodeKind = "root" | "branch" | "leaf" | "note"',
    'export type GraphLayoutMode = "free" | "tree" | "radial"',
    "layoutMode = \"free\"",
    "export function layoutTree(",
    "export function layoutRadial(",
    "export function treeEdge(",
  ]) {
    if (graph.includes(needle) === false) {
      failures.push(`(mm4) react/graph.tsx must contain ${JSON.stringify(needle)} — the layout engine`);
    }
  }
  for (const needle of [
    "height: calc(100vh - 56px)",
    "background-size: 24px 24px",
    ".graph-hud--toolbar",
    ".graph-hud--dock",
    ".graph-hud--inspector",
    "z-index: var(--z-nav)",
  ]) {
    if (styles.includes(needle) === false) {
      failures.push(`(mm4) playground/styles.css must contain ${JSON.stringify(needle)} — the full-viewport studio geometry + the floating HUD cards`);
    }
  }
  for (const needle of [
    "export function expandNodeIdeas(",
    "export function bucketForToken(",
  ]) {
    if (expansion.includes(needle) === false) {
      failures.push(`(mm4) playground/graph-expansion.ts must export ${JSON.stringify(needle)} — the LOCAL heuristic generator`);
    }
  }
  // DETERMINISM: no randomness, no network in the generator.
  if (/\bMath\.random\b/.test(expansion)) {
    failures.push("(mm4) graph-expansion.ts must be deterministic — Math.random is banned (same selection = same sub-nodes)");
  }
  if (/\bfetch\s*\(/.test(expansion)) {
    failures.push("(mm4) graph-expansion.ts is a LOCAL heuristic — no network calls (no fetch) allowed");
  }
  for (const needle of [
    'data-testid="studio-toolbar"',
    'data-testid="studio-dock"',
    'data-testid="studio-inspector"',
    'data-testid="studio-ai-expand"',
    "data-testid={`studio-layout-${mode.id}`}", // the segmented switcher (Free/Tree/Radial)
  ]) {
    if (studio.includes(needle) === false) {
      failures.push(`(mm4) GraphStudio.tsx must contain ${JSON.stringify(needle)} — the floating HUD + layout switcher`);
    }
  }
  return failures;
}

/* ---- (mm5) THE COLORFUL KINETIC SUITE ---------------------------------------- */
export function gateMm5({ motionCss, motion }) {
  const failures = [];
  // THE REGISTERED ANGLE — the negative test deletes this block.
  for (const needle of [
    "@property --sig-beam-angle {",
    'syntax: "<angle>";',
    "initial-value: 0deg;",
  ]) {
    if (motionCss.includes(needle) === false) {
      failures.push(
        `(mm5) css/motion.css must contain ${JSON.stringify(needle)} — the AURORA beam's registered angle (without it the rotation cannot interpolate; deleting the block is the negative test)`,
      );
    }
  }
  for (const needle of [
    "conic-gradient(",
    "var(--sig-aurora-1, var(--sig-cyan))",
    "var(--sig-aurora-2, var(--sig-orchid))",
    "var(--sig-aurora-3, var(--sig-mint))",
    "var(--sig-aurora-4, var(--sig-cobalt))",
    "mask-composite: exclude",
    "@keyframes sig-aurora-spin",
  ]) {
    if (motionCss.includes(needle) === false) {
      failures.push(`(mm5) css/motion.css must contain ${JSON.stringify(needle)} — the conic 4-token border beam`);
    }
  }
  for (const needle of [
    "perspective(600px)",
    "@keyframes sig-beacon-ping",
    "@keyframes sig-wave-bounce",
    "calc(var(--bar-i, 0) * 90ms)",
  ]) {
    if (motionCss.includes(needle) === false) {
      failures.push(`(mm5) css/motion.css must contain ${JSON.stringify(needle)} — the tilt/beacon/waveform mechanics`);
    }
  }
  // REDUCED-MOTION OVERRIDES ON ALL FOUR — the belt-and-suspenders pair.
  for (const selector of [
    ".sig-aurora-card::before",
    ".sig-tilt-surface",
    ".sig-beacon::after",
    ".sig-waveform.is-active .sig-waveform__bar",
  ]) {
    if (motionCss.includes(selector) === false) {
      failures.push(`(mm5) css/motion.css must style ${selector} — the reduced-motion stand-down needs the target`);
    }
  }
  const reducedBlocks = motionCss.match(/@media \(prefers-reduced-motion: reduce\) \{[^@]*\}/g) ?? [];
  const reducedText = reducedBlocks.join("\n");
  for (const [selector, label] of [
    [".sig-aurora-card::before", "the aurora beam"],
    [".sig-tilt-surface", "the tilt"],
    [".sig-beacon::after", "the beacon ping"],
    [".sig-waveform.is-active .sig-waveform__bar", "the waveform"],
  ]) {
    if (reducedText.includes(selector) === false) {
      failures.push(`(mm5) the prefers-reduced-motion block must stand down ${label} (${selector})`);
    }
  }
  for (const needle of [
    "export function AuroraBorderCard(",
    "export function TiltSurface(",
    "export function StatusBeacon(",
    "export function WaveformBars(",
  ]) {
    if (motion.includes(needle) === false) {
      failures.push(`(mm5) react/motion.tsx must export ${JSON.stringify(needle)} — the kinetic suite`);
    }
  }
  return failures;
}

/** Run the full v3.9.0 gate set over a files record. */
export function runV390Gates(files) {
  return [
    ...gateMm1(files),
    ...gateMm2(files),
    ...gateMm3(files),
    ...gateMm4(files),
    ...gateMm5(files),
  ];
}
