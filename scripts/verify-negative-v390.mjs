#!/usr/bin/env node
/**
 * verify-negative-v390.mjs — THE NEGATIVE TESTS (3.9.0).
 *
 * A gate that cannot fail is decoration. This runner takes the PURE
 * gate functions of scripts/gates-v390.mjs and executes them against
 * MUTATED copies of the real files — each mutation deletes exactly the
 * line the gate exists to protect — and asserts the gate FAILS with
 * the expected message. Then it runs the gates UNMUTATED and asserts
 * they PASS (the positive control).
 *
 * THE TWO MANDATED NEGATIVES:
 *   (n1) delete the @property --sig-beam-angle block from css/motion.css
 *        → (mm5) must FAIL with the aurora registered-angle message;
 *   (n2) delete the container-type line from the stage block in
 *        playground/styles.css → (mm1) must FAIL with the stage
 *        container message.
 * Plus the belt: (n3) strip flex-shrink: 0 from css/viz.css → (mm2)
 * must FAIL; (n4) strip the FlipCard 220px floor from css/cards.css →
 * (mm3) must FAIL; (n5) inject Math.random into graph-expansion.ts →
 * (mm4) must FAIL.
 *
 * NO dev server, NO browser — pure file transforms + the pure gates.
 * Exit 0 = every negative trips AND the positive control passes.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gateMm1, gateMm2, gateMm3, gateMm4, gateMm5, runV390Gates } from "./gates-v390.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const failures = [];

const read = (rel) => readFileSync(resolve(root, rel), "utf8");

/** Run one gate against mutated content; assert it fails with a message fragment. */
function expectFailure(name, gateFn, files, fragment) {
  const results = gateFn(files);
  const tripped = results.some((message) => message.includes(fragment));
  if (!tripped) {
    failures.push(
      `(n) ${name}: the gate did NOT trip on the mutation — expected a failure containing ${JSON.stringify(fragment)}; got ${results.length === 0 ? "PASS (the gate is decoration)" : JSON.stringify(results)}`,
    );
  } else {
    console.log(`  (n) ${name}: FAILS as required — ${results.find((m) => m.includes(fragment)).slice(0, 88)}…`);
  }
}

// -- the pristine record (the positive control's input) --
const pristine = {
  styles: read("playground/styles.css"),
  saas: read("playground/templates/SaasLandingTemplate.tsx"),
  docs: read("playground/templates/DocsReaderTemplate.tsx"),
  telemetry: read("playground/templates/TelemetryCenterTemplate.tsx"),
  viz: read("react/viz.tsx"),
  vizCss: read("css/viz.css"),
  app: read("playground/App.tsx"),
  cards: read("css/cards.css"),
  graph: read("react/graph.tsx"),
  expansion: read("playground/graph-expansion.ts"),
  studio: read("playground/components/GraphStudio.tsx"),
  motionCss: read("css/motion.css"),
  motion: read("react/motion.tsx"),
};

console.log("== verify-negative-v390 ==");

// (n1) THE AURORA NEGATIVE — delete the @property block.
{
  const motionCss = pristine.motionCss;
  const start = motionCss.indexOf("@property --sig-beam-angle {");
  if (start === -1) {
    failures.push("(n1) could not find the @property --sig-beam-angle block to delete");
  } else {
    const end = motionCss.indexOf("}", motionCss.indexOf("initial-value: 0deg;", start));
    const mutated = motionCss.slice(0, start) + motionCss.slice(end + 1);
    expectFailure(
      "n1 delete @property --sig-beam-angle → mm5",
      gateMm5,
      { ...pristine, motionCss: mutated },
      "AURORA beam's registered angle",
    );
  }
}

// (n2) THE STAGE CONTAINER NEGATIVE — delete the container-type line
// WITHIN the stage block (styles.css carries other container-type
// declarations — .sig-cell et al — which must not mask the mutation).
{
  const stageStart = pristine.styles.indexOf(".tpl-studio__stage {");
  if (stageStart === -1) {
    failures.push("(n2) could not find the .tpl-studio__stage block");
  } else {
    const blockEnd = pristine.styles.indexOf("}", pristine.styles.indexOf("container-name: template-stage;", stageStart));
    const mutatedBlock = pristine.styles
      .slice(stageStart, blockEnd)
      .replace("  container-type: inline-size;\n", "");
    if (mutatedBlock.length === blockEnd - stageStart) {
      failures.push("(n2) could not find the stage container-type line to delete");
    } else {
      const styles = pristine.styles.slice(0, stageStart) + mutatedBlock + pristine.styles.slice(blockEnd);
      expectFailure(
        "n2 delete stage container-type → mm1",
        gateMm1,
        { ...pristine, styles },
        "container-type: inline-size",
      );
    }
  }
}

// (n3) THE RING NEGATIVE — strip flex-shrink: 0 from the ring box.
{
  const vizCss = pristine.vizCss.replace("  flex-shrink: 0;\n", "");
  if (vizCss === pristine.vizCss) {
    failures.push("(n3) could not find flex-shrink: 0 in css/viz.css to delete");
  } else {
    expectFailure("n3 delete ring flex-shrink → mm2", gateMm2, { ...pristine, vizCss }, "flex-shrink: 0");
  }
}

// (n4) THE FLIP NEGATIVE — strip the 220px floor.
{
  const cards = pristine.cards.replace("    min-height: 220px; /* the parity floor — never a collapsed sliver */\n", "");
  if (cards === pristine.cards) {
    failures.push("(n4) could not find the FlipCard 220px floor to delete");
  } else {
    expectFailure("n4 delete FlipCard floor → mm3", gateMm3, { ...pristine, cards }, "min-height: 220px");
  }
}

// (n5) THE AI-EXPAND NEGATIVE — inject Math.random into the generator.
{
  const expansion = pristine.expansion.replace(
    "export function expandNodeIdeas(",
    "function expandNodeIdeas(\n  _seedShuffle = Math.random(),\n)\n{ return _seedShuffle > 2 ? [] : [] }\nfunction expandNodeIdeasReal(",
  );
  expectFailure("n5 inject Math.random → mm4", gateMm4, { ...pristine, expansion }, "Math.random is banned");
}

// THE POSITIVE CONTROL — the pristine record must pass every gate.
const positives = runV390Gates(pristine);
if (positives.length > 0) {
  failures.push("(positive control) the UNMUTATED tree must pass all five gates");
  for (const message of positives) failures.push(`  (control) ${message}`);
} else {
  console.log("  (control) the unmutated tree passes mm1-mm5");
}

if (failures.length > 0) {
  console.error("FAIL — verify-negative-v390");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("PASS — every negative trips, the positive control passes.");
