#!/usr/bin/env node
/**
 * gates-v400.mjs — THE v4.0.0 RELEASE GATES, as PURE FUNCTIONS.
 *
 * Same discipline as scripts/gates-v390.mjs: each gate takes a
 * { path: content } record and returns an array of failure strings —
 * EMPTY means the gate passes. Two consumers:
 *
 *   · scripts/verify.mjs (the release runner) calls runV400Gates with
 *     the real working-tree contents;
 *   · scripts/verify-negative-v400.mjs (the NEGATIVE TESTS) calls the
 *     SAME functions with MUTATED copies — mutating the exact line the
 *     gate exists to protect — and asserts the gate FAILS with the
 *     right message. A gate that cannot fail is decoration.
 *
 * THE GATES (the owner's task list, verbatim):
 *   (cd1) FlipCard geometry needles — grid-area 1/1, backface both
 *         spellings, rotateY on the inner, min-height 220, radius-card,
 *         perspective 1000, preserve-3d; the component renders the
 *         .sig-flip-inner/.sig-flip-front/.sig-flip-back anatomy; NO
 *         rotateX anywhere in the flip mechanics.
 *   (cd2) AccordionCard grid-rows — 0fr/1fr + the 320ms spring needle
 *         + the overflow-hidden inner + align-items: start on the
 *         containing grid; the component renders the body-inner.
 *   (ov1) overlays needles — react/overlays.tsx (createPortal, z-50
 *         rung via var(--z-modal), focus trap, Escape cancel,
 *         aria-modal/labelledby/describedby, useFocusReturn, the
 *         crimson + #FFFFFF confirm voice) + css/overlays.css (the
 *         scrim rgba, the blur glass, zero box-shadow) + the bundle
 *         import + the umbrella export.
 *   (gs1) Graph Studio destructive wiring — the inspector Delete Node
 *         (danger + Trash), the Delete/Backspace route through the
 *         dialog (isTypingTarget guard), the dock Reset Canvas + the
 *         workspace reset both dialog-wired, the delete semantics
 *         (children promote to roots).
 *   (ml1) Motion Lab needles — 6 showcases, the puck track
 *         (container + cqw finish), the wave grid key-remount, the
 *         equalizer/sonar toggle, the telemetry sweep (three
 *         instruments), the slow-mo bar; every mechanic carries its
 *         reduced-motion stand-down.
 *   (cli) template set needles — telemetry/microlab present
 *         (registry + bin + cli help), saas/docs ABSENT from the
 *         --template set (they may only appear in retirement notes).
 */

/* ---- (cd1) FLIPCARD GEOMETRY ------------------------------------------------ */
export function gateCd1({ cardsTsx, cardsCss, cardsDts }) {
  const failures = [];
  // css side — the true-3D anatomy.
  const flipBlock = cardsCss.slice(cardsCss.indexOf(".sig-flip-card {"), cardsCss.indexOf(".sig-flip-card:focus-visible"));
  for (const [needle, label] of [
    ["perspective: 1000px", "the 1000px perspective stage"],
    ["display: grid", "the card IS a grid (the faces dock, they don't float)"],
    ["min-height: 220px", "the parity floor"],
  ]) {
    if (!flipBlock.includes(needle)) {
      failures.push(`(cd1) css/cards.css .sig-flip-card must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  const innerStart = cardsCss.indexOf(".sig-flip-inner {");
  const innerBlock = cardsCss.slice(innerStart, cardsCss.indexOf("rotateY(180deg)", innerStart) === -1 ? cardsCss.indexOf(".sig-flip-front,") : cardsCss.indexOf(".sig-flip-front,"));
  for (const [needle, label] of [
    ["grid-area: 1 / 1", "the stage docks at grid-area 1/1"],
    ["transform-style: preserve-3d", "the 3d stage"],
    ["rotateY(180deg)", "THE ROTATION IS rotateY — never rotateX (the back face can never render upside-down)"],
  ]) {
    if (!innerBlock.includes(needle)) {
      failures.push(`(cd1) css/cards.css .sig-flip-inner must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  const facesStart = cardsCss.indexOf(".sig-flip-front,");
  const facesBlock = cardsCss.slice(facesStart, cardsCss.indexOf("}", facesStart));
  for (const [needle, label] of [
    ["grid-area: 1 / 1", "both faces dock at grid-area 1/1"],
    ["backface-visibility: hidden", "the standard spelling"],
    ["-webkit-backface-visibility: hidden", "the webkit spelling (BOTH must exist)"],
    ["border-radius: var(--radius-card)", "the faces follow the card radius"],
    ["padding: 20px", "the glyph-grid face padding"],
  ]) {
    if (!facesBlock.includes(needle)) {
      failures.push(`(cd1) css/cards.css .sig-flip-front/.sig-flip-back must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  // NO rotateX in the flip mechanics (the defect: rotateX flips the back
  // face upside-down). rotateY only.
  const mechanics = cardsCss.slice(cardsCss.indexOf(".sig-flip-inner {"), cardsCss.indexOf("/* -- AccordionCard"));
  if (/rotateX/.test(mechanics)) {
    failures.push("(cd1) css/cards.css flip mechanics must NEVER use rotateX — the rotation is rotateY(180deg) on the inner (the upside-down back-face defect)");
  }
  // component side — the anatomy renders.
  for (const [needle, label] of [
    ['className="sig-flip-card"', "the flip root"],
    ['className="sig-flip-inner"', "the preserve-3d stage element"],
    ['className="sig-flip-front"', "the front face"],
    ['className="sig-flip-back"', "the back face"],
    ["aria-pressed={flipped}", "the flip state rides aria-pressed"],
    ['"Click to flip"', "the mono flip hint on both faces"],
    ["frontEyebrow", "the rich face: the eyebrow badge slot"],
    ["frontTitle", "the rich face: the accent-underlined title slot"],
    ["backTitle", "the rich face: the back title slot"],
    ["accentProps(accentToken)", "the chromatic underline contract"],
  ]) {
    if (!cardsTsx.includes(needle)) {
      failures.push(`(cd1) react/cards.tsx must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  if (!cardsDts.includes("FlipCardProps")) {
    failures.push("(cd1) react/cards.d.ts must carry FlipCardProps — build the package (npm run build)");
  }
  return failures;
}

/* ---- (cd2) ACCORDIONCARD GRID-ROWS EXPANSION --------------------------------- */
export function gateCd2({ cardsCss, cardsTsx, styles }) {
  const failures = [];
  const bodyBlock = cardsCss.slice(cardsCss.indexOf(".sig-accordion__body {"), cardsCss.indexOf(".sig-accordion__body-inner"));
  for (const [needle, label] of [
    ["display: grid", "the body is the grid-rows technique"],
    ["grid-template-rows: 0fr", "closed — the row collapses to nothing"],
    ["transition: grid-template-rows 320ms var(--ease-spring-gentle", "the 320ms spring needle"],
  ]) {
    if (!bodyBlock.includes(needle)) {
      failures.push(`(cd2) css/cards.css .sig-accordion__body must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  if (!cardsCss.includes(".sig-accordion[open] .sig-accordion__body {\n    grid-template-rows: 1fr;")) {
    failures.push('(cd2) css/cards.css must expand .sig-accordion__body to grid-template-rows: 1fr on details[open] — the attribute IS the state');
  }
  const innerBlock = cardsCss.slice(cardsCss.indexOf(".sig-accordion__body-inner {"), cardsCss.indexOf(".sig-accordion__body-inner > :first-child"));
  for (const [needle, label] of [
    ["overflow: hidden", "the clipping leg of the 0fr/1fr technique"],
    ["min-height: 0", "the row may shrink to zero"],
  ]) {
    if (!innerBlock.includes(needle)) {
      failures.push(`(cd2) css/cards.css .sig-accordion__body-inner must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  if (!cardsTsx.includes('className="sig-accordion__body-inner"')) {
    failures.push('(cd2) react/cards.tsx must render the .sig-accordion__body-inner wrapper — the overflow-hidden clipping leg');
  }
  // THE CONTAINING GRIDS: a closed accordion hugs its header — the rows
  // that hold cards must not stretch it over dead space.
  const row4 = styles.slice(styles.indexOf(".hub__row--4 {"), styles.indexOf("@media (max-width: 768px) {\n  .hub__row--3"));
  if (!row4.includes("align-items: start")) {
    failures.push("(cd2) playground/styles.css .hub__row--4 must carry align-items: start — a closed accordion hugs its header, the row never stretches it");
  }
  // Reduced motion mercy on the expansion.
  if (!cardsCss.includes(".sig-accordion__body,\n    .sig-accordion__chevron,")) {
    failures.push("(cd2) css/cards.css prefers-reduced-motion block must stand down .sig-accordion__body (the transition: none mercy)");
  }
  return failures;
}

/* ---- (ov1) THE CONFIRMDIALOG NORM --------------------------------------------- */
export function gateOv1({ overlaysTsx, overlaysCss, overlaysDts, bundleCss, umbrellaDts, indexTsx }) {
  const failures = [];
  // component side — the trapped, escaped, crimson dialog.
  for (const [needle, label] of [
    ["createPortal(", "the portal to document.body"],
    ["document.body", "the portal target (breaks free of host stacking contexts)"],
    ['role="dialog"', "the dialog semantics"],
    ['aria-modal="true"', "the modal flag"],
    ["aria-labelledby={titleId}", "the title wiring"],
    ["aria-describedby={description !== undefined ? descriptionId : undefined}", "the description wiring"],
    ['event.key === "Escape"', "Escape cancels (never confirms)"],
    ["onCancel();", "Escape/scrim/cancel all land on the safe close"],
    ["function focusablesIn(", "the focus trap's focusable census"],
    ['event.key !== "Tab"', "the trap cycles on Tab"],
    ["event.shiftKey", "Shift+Tab wraps backward"],
    ["(focusables[0] as HTMLElement | undefined)?.focus();", "the CANCEL button takes focus on open (the safe default)"],
    ["export function useFocusReturn", "the focus return hook"],
    ["restore.focus();", "focus returns to the trigger on close"],
    ["variant?: \"danger\"", "the reserved variant"],
    ["#FFFFFF", "the confirm ink is #FFFFFF (the documented exception #2, in the header contract)"],
    ["confirmLabel = \"Yes\"", "the confirm label default"],
    ["cancelLabel = \"No\"", "the cancel label default (the safe focus target)"],
  ]) {
    if (!overlaysTsx.includes(needle)) {
      failures.push(`(ov1) react/overlays.tsx must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  // css side — the scrim + the crimson voice + the blur sanction.
  for (const [needle, label] of [
    ["background: rgba(0, 0, 0, 0.6);", "the documented scrim exception"],
    ["z-index: var(--z-overlay, 40);", "the scrim rides the 40 rung"],
    ["z-index: var(--z-modal, 50);", "the card rides the 50 rung"],
    ["backdrop-filter: blur(8px);", "the sanctioned blur glass (the bd1 amendment)"],
    ["-webkit-backdrop-filter: blur(8px);", "the webkit blur spelling"],
    ["background: var(--sig-crimson);", "the confirm voice is the solid crimson"],
    ["color: #ffffff;", "the #FFFFFF ink on crimson (4.18:1 ≥ the 3.1 floor)"],
    ["prefers-reduced-motion: no-preference", "the entrance animation rides no-preference"],
  ]) {
    if (!overlaysCss.includes(needle)) {
      failures.push(`(ov1) css/overlays.css must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  const shadowDecls = overlaysCss.match(/box-shadow\s*:/g);
  if (shadowDecls !== null) {
    failures.push(`(ov1) css/overlays.css declares box-shadow ${shadowDecls.length}× — the scrim + blur IS the elevation (the e1 treaty)`);
  }
  // THE CONTRAST ASSERTION — #FFFFFF on var(--sig-crimson) #F22222 must
  // compute ≥ 3.1:1 (the WCAG large-text/UI floor, the gate needle).
  const ratio = contrastRatio("#FFFFFF", "#F22222");
  if (ratio < 3.1) {
    failures.push(`(ov1) the confirm voice must compute ≥ 3.1:1 (#FFFFFF × #F22222), got ${ratio.toFixed(2)}:1`);
  }
  // bundle membership + umbrella export.
  if (!bundleCss.includes('@import "./overlays.css" layer(cascade);')) {
    failures.push('(ov1) css/signature-style.css must import "./overlays.css" layer(cascade) — the bundle membership');
  }
  if (!umbrellaDts.includes("ConfirmDialog")) {
    failures.push("(ov1) react/index.d.ts must re-export ConfirmDialog — build the package (npm run build)");
  }
  if (!indexTsx.includes('from "./overlays.js"')) {
    failures.push('(ov1) react/index.ts must re-export the overlays module (ConfirmDialog + useFocusReturn)');
  }
  if (!overlaysDts.includes("ConfirmDialogProps")) {
    failures.push("(ov1) react/overlays.d.ts must carry ConfirmDialogProps — build the package");
  }
  return failures;
}

/** The WCAG contrast ratio (the shared math, inlined — pure function gate). */
function luminance(hex) {
  const value = hex.replace("#", "");
  const channels = [0, 2, 4].map((start) => {
    const raw = parseInt(value.slice(start, start + 2), 16) / 255;
    return raw <= 0.03928 ? raw / 12.92 : Math.pow((raw + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}
function contrastRatio(fg, bg) {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const [lighter, darker] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (lighter + 0.05) / (darker + 0.05);
}

/* ---- (gs1) GRAPH STUDIO DESTRUCTIVE WIRING ------------------------------------- */
export function gateGs1({ studio, app }) {
  const failures = [];
  for (const [needle, label] of [
    ['data-testid="studio-delete-node"', "the inspector Delete Node button"],
    ['variant="danger"\n          size="sm"\n          leftIcon="Trash"', "the danger button wears the Trash icon"],
    ['title="Delete Node?"', "the delete dialog title"],
    ['This removes "', 'the delete description opener (This removes "{label}"…)'],
    ["Nodes connected through it are kept.", "the promotion semantics documented in the dialog"],
    ['data-testid="studio-reset-canvas"', "the dock Reset Canvas button"],
    ['title="Reset Graph Canvas?"', "the canvas reset dialog title"],
    ["This will permanently clear your current nodes and connections and restore the default tree.", "the canvas reset description (verbatim)"],
    ['cancelLabel="No"', "the cancel label is the safe default"],
    ['confirmLabel="Yes, Delete"', "the delete confirm label"],
    ['confirmLabel="Yes, Reset"', "the reset confirm label"],
    ["const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);", "the pending-delete state"],
    ["const [resetConfirmOpen, setResetConfirmOpen] = useState(false);", "the pending-reset state"],
    ["if (isTypingTarget(event.target)) return;", "the typing-target guard on the key route"],
    ['event.key !== "Delete" && event.key !== "Backspace"', "the Delete/Backspace route"],
    ["setDeleteTargetId(selectedNodeId)", "the key opens the SAME dialog as the button"],
    ["ConfirmDialog", "the dialog component mounts in the studio"],
  ]) {
    if (!studio.includes(needle)) {
      failures.push(`(gs1) playground/components/GraphStudio.tsx must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  for (const [needle, label] of [
    ["const deleteNode = useCallback(", "the workspace delete op"],
    ["parentId: undefined", "the promotion: direct children clear their parentId (promote to roots)"],
    ["edge.fromId !== id && edge.toId !== id", "every edge touching the node dies"],
    ["delete next[id];", "the node's persisted drag position dies with it"],
    ['title="Reset Workspace?"', "the workspace reset dialog (Analytics & Planner)"],
    ['data-testid="snapshot-reset"', "the reset probe hook stays"],
    ["onClick={() => setResetOpen(true)}", "the reset button OPENS the dialog (never a direct reset)"],
    ["ConfirmDialog", "the dialog mounts in App"],
  ]) {
    if (!app.includes(needle)) {
      failures.push(`(gs1) playground/App.tsx must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  return failures;
}

/* ---- (ml1) THE REBUILT MOTION LAB ------------------------------------------------ */
export function gateMl1({ motionLab, motionCss, motionSnippets }) {
  const failures = [];
  // The six showcases + their triggers.
  for (const [needle, label] of [
    ['componentName="Aurora Border Beam & 3D Tilt"', "showcase 01"],
    ['componentName="Staggered Bento Wave"', "showcase 02"],
    ['componentName="Tactile Spring Detents"', "showcase 03"],
    ['componentName="FLIP Gliding Pill & Morphing Drawer"', "showcase 04"],
    ['componentName="Kinetic Equalizer & Pulse Beacons"', "showcase 05"],
    ['componentName="Live Telemetry Sweep & Rolling Numbers"', "showcase 06"],
    ['data-testid={`motion-play-${frame}`}', "the per-frame Play registry"],
    ["Simulate Spike", "the 06 trigger fires all three instruments"],
    ["SPIKE_VALUES", "the deterministic spike roster"],
    ["setBeamForced", "01's Play forces the always-on beam beat"],
    ['key={playKeys["02"]}', "02's Play bumps the wave key (the key-remount)"],
    ['key={playKeys["03"]}', "03's Play resets + relaunches the pucks"],
    ["aria-expanded={drawerOpen}", "the 04 drawer toggle"],
    ["data-testid=\"motion-eq-toggle\"", "05's toggle drives bars + rings"],
    ['className={eqActive ? "sig-lab-sonar is-live" : "sig-lab-sonar"}', "the sonar honors the toggle"],
    ['key={spikeIndex}', "the sweep chart re-mounts on every spike"],
  ]) {
    if (!motionLab.includes(needle)) {
      failures.push(`(ml1) playground/components/MotionLab.tsx must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  // The lab mechanics in css/motion.css.
  for (const [needle, label] of [
    [".sig-lab-wave {", "02's cascade card"],
    ["translate3d(0, 24px, 0) scale(0.94)", "the wave's from-state (verbatim)"],
    ["calc(var(--wave-i, 0) * 60ms * var(--sig-motion-scale, 1))", "the 60ms stagger, dilated by the dial"],
    ["@keyframes sig-lab-wave-in", "the wave keyframes"],
    [".sig-lab-track {", "03's puck track"],
    ["container-type: inline-size", "the track IS the container (the cqw finish line)"],
    ["calc(100cqw - 100%)", "the transform-only finish line"],
    ["@keyframes sig-lab-puck-run", "the puck race keyframes"],
    ["--puck-ease", "the per-puck spring arrives inline"],
    [".sig-lab-morph {", "04's morphing drawer"],
    ["grid-template-rows: 0fr", "the drawer's closed row"],
    ["grid-template-rows: 1fr", "the drawer's open row"],
    ["320ms var(--ease-spring-gentle", "the drawer rides the gentle spring at 320ms"],
    [".sig-lab-sonar", "05's pulse rings"],
    ["@keyframes sig-lab-sonar", "the sonar keyframes"],
    ["calc(var(--sonar-i, 0) * 600ms", "the rings fire in sequence"],
  ]) {
    if (!motionCss.includes(needle)) {
      failures.push(`(ml1) css/motion.css must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  // REDUCED-MOTION MERCY on every new mechanic — both belts.
  const reducedBlocks = motionCss.match(/@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\n  \}\n/g) ?? [];
  const reducedText = reducedBlocks.join("\n");
  for (const [selector, label] of [
    [".sig-lab-wave", "the wave"],
    [".sig-lab-puck", "the pucks"],
    [".sig-lab-morph", "the drawer"],
    [".sig-lab-sonar.is-live .sig-lab-sonar__ring", "the sonar rings"],
  ]) {
    if (!reducedText.includes(selector)) {
      failures.push(`(ml1) the prefers-reduced-motion block must stand down ${label} (${selector})`);
    }
    if (!motionCss.includes(`[data-sig-motion="reduced"] ${selector}`)) {
      failures.push(`(ml1) the [data-sig-motion="reduced"] subtree override must stand down ${label} (${selector})`);
    }
  }
  // The cyan FLIP pill.
  if (!motionLab.includes('className="motion-lab__flip"') ) {
    failures.push('(ml1) MotionLab.tsx must mount the .motion-lab__flip frame (the cyan pill stage)');
  }
  // The snippets registry grows with the new recipes.
  for (const key of ["StaggerWave", "SpringPucks", "MorphDrawer", "TelemetrySweep"]) {
    if (!motionSnippets.includes(`${key}: {`)) {
      failures.push(`(ml1) playground/motion-snippets.ts must register ${key} — the rebuilt showcases carry their Copy Card payloads`);
    }
  }
  return failures;
}

/* ---- (cli) THE TEMPLATE SET NEEDLES ----------------------------------------------- */
export function gateCli({ registrySrc, sourcesSrc, cliSrc, templatesBinSrc, studioSrc, app }) {
  const failures = [];
  for (const [needle, label] of [
    ['id: "telemetry"', "the registry carries telemetry"],
    ['id: "microlab"', "the registry carries microlab"],
    ["Component: TelemetryCenterTemplate", "telemetry's LIVE component"],
    ["Component: MicroLabTemplate", "microlab's LIVE component"],
  ]) {
    if (!registrySrc.includes(needle)) {
      failures.push(`(cli) playground/template-registry.ts must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  if (!registrySrc.includes('id: "saas"') || !registrySrc.includes('id: "docs"')) {
    // saas/docs must be GONE from the registry (they may appear only in
    // comments narrating the retirement).
    const code = registrySrc.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    if (code.includes('"saas"') || code.includes('"docs"')) {
      failures.push("(cli) the RETIRED saas/docs ids must not appear in template-registry.ts code (comments narrating the retirement may)");
    }
  } else {
    failures.push("(cli) the RETIRED saas/docs ids must be GONE from template-registry.ts");
  }
  if (!/export type TemplateId = "telemetry" \| "microlab"/.test(sourcesSrc)) {
    failures.push('(cli) template-sources.ts must declare TemplateId = "telemetry" | "microlab"');
  }
  for (const [needle, label] of [
    ["PAGE_TEMPLATE_NAMES = Object.freeze([\"telemetry\", \"microlab\"])", "the bin map carries exactly the two ids"],
    ["SignatureTelemetryCenter.tsx", "the telemetry blueprint keeps its CLI filename"],
    ["SignatureMicroLab.tsx", "the microlab blueprint's CLI filename"],
    ["Match & Telemetry Analytics Hub", "the analytics hub label"],
    ["Interactive Micro-Lab & Discovery Deck", "the micro-lab label"],
    ["--template telemetry", "the CLI help carries telemetry"],
    ["--template microlab", "the CLI help carries microlab"],
    ["minimal|bento|telemetry|microlab", "the CLI usage line names the new set"],
  ]) {
    const haystack = needle.startsWith("PAGE_TEMPLATE_NAMES") || needle.startsWith("Signature") || needle.startsWith("Match") || needle.startsWith("Interactive") ? templatesBinSrc : cliSrc;
    if (!haystack.includes(needle)) {
      failures.push(`(cli) bin must contain ${JSON.stringify(needle)} — ${label}`);
    }
  }
  if (!studioSrc.includes('activeId={active?.id ?? "telemetry"}')) {
    failures.push('(cli) TemplatesStudio.tsx must fall back to "telemetry" (the saas default died with the set)');
  }
  if (!app.includes('useState<TemplateId>("telemetry")')) {
    failures.push('(cli) App.tsx must lift the active template as "telemetry"');
  }
  return failures;
}

/** Run the full v4.0.0 gate set over a files record. */
export function runV400Gates(files) {
  return [
    ...gateCd1(files),
    ...gateCd2(files),
    ...gateOv1(files),
    ...gateGs1(files),
    ...gateMl1(files),
    ...gateCli(files),
  ];
}
