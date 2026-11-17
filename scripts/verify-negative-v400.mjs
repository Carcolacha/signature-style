#!/usr/bin/env node
/**
 * verify-negative-v400.mjs — THE NEGATIVE TESTS (4.0.0).
 *
 * A gate that cannot fail is decoration. This runner takes the PURE
 * gate functions of scripts/gates-v400.mjs and executes them against
 * MUTATED copies of the real files — each mutation corrupts exactly
 * the line the gate exists to protect — and asserts the gate FAILS
 * with the expected message. Then it runs the gates UNMUTATED and
 * asserts they PASS (the positive control).
 *
 * THE TWO MANDATED NEGATIVES:
 *   (n1) rotate the FlipCard's inner to rotateX(180deg) in css/cards.css
 *        → (cd1) must FAIL with the rotateY/never-rotateX message (the
 *        upside-down back-face defect, restored as a mutant);
 *   (n2) strip the focus trap from react/overlays.tsx (delete the Tab
 *        cycling + the focusablesIn census) → (ov1) must FAIL with the
 *        trap needles.
 * Plus the belt:
 *   (n3) collapse the AccordionCard open row to 0fr→0fr (delete the
 *        [open] 1fr expansion) → (cd2) must FAIL;
 *   (n4) swap the confirm voice off crimson → (ov1) must FAIL with the
 *        crimson needle;
 *   (n5) reintroduce saas into the bin template set → (cli) must FAIL.
 *
 * NO dev server, NO browser — pure file transforms + the pure gates.
 * Exit 0 = every negative trips AND the positive control passes.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  gateCd1,
  gateCd2,
  gateOv1,
  gateGs1,
  gateMl1,
  gateCli,
  runV400Gates,
} from "./gates-v400.mjs";

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
      `(n) ${name}: the gate did NOT trip on the mutation — expected a failure containing ${JSON.stringify(fragment)}; got ${results.length === 0 ? "PASS (the gate is decoration)" : JSON.stringify(results.slice(0, 4))}`,
    );
  } else {
    console.log(`  (n) ${name}: FAILS as required — ${results.find((m) => m.includes(fragment)).slice(0, 88)}…`);
  }
}

// -- the pristine record (the positive control's input) --
const pristine = {
  cardsTsx: read("react/cards.tsx"),
  cardsCss: read("css/cards.css"),
  cardsDts: read("react/cards.d.ts"),
  styles: read("playground/styles.css"),
  overlaysTsx: read("react/overlays.tsx"),
  overlaysCss: read("css/overlays.css"),
  overlaysDts: read("react/overlays.d.ts"),
  bundleCss: read("css/signature-style.css"),
  umbrellaDts: read("react/index.d.ts"),
  indexTsx: read("react/index.ts"),
  studio: read("playground/components/GraphStudio.tsx"),
  app: read("playground/App.tsx"),
  motionLab: read("playground/components/MotionLab.tsx"),
  motionCss: read("css/motion.css"),
  motionSnippets: read("playground/motion-snippets.ts"),
  registrySrc: read("playground/template-registry.ts"),
  sourcesSrc: read("playground/template-sources.ts"),
  cliSrc: read("bin/cli.mjs"),
  templatesBinSrc: read("bin/templates.mjs"),
  studioSrc: read("playground/components/TemplatesStudio.tsx"),
};

console.log("== verify-negative-v400 ==");

// (n1) THE ROTATEX NEGATIVE (mandated) — the inner flips on rotateX:
//      the exact upside-down back-face defect the 4.0.0 geometry fix
//      buried, restored as a mutant. cd1 must catch it.
{
  const cardsCss = pristine.cardsCss.replace(
    `.sig-flip-card[aria-pressed="true"] .sig-flip-inner {
    transform: rotateY(180deg);
  }`,
    `.sig-flip-card[aria-pressed="true"] .sig-flip-inner {
    transform: rotateX(180deg);
  }`,
  );
  if (cardsCss === pristine.cardsCss) {
    failures.push("(n1) could not find the flip inner rotateY line to mutate");
  } else {
    expectFailure(
      "n1 rotateY → rotateX on the flip inner → cd1",
      gateCd1,
      { ...pristine, cardsCss },
      "NEVER use rotateX",
    );
  }
}

// (n2) THE FOCUS-TRAP NEGATIVE (mandated) — sever the trap machinery:
//      every focusablesIn call is voided (the census AND the Tab cycling
//      die together). ov1 must fail with both trap needles.
{
  const overlaysTsx = pristine.overlaysTsx.split("focusablesIn(").join("voidFocusables(");
  if (overlaysTsx.includes("focusablesIn")) {
    failures.push("(n2) the focus-trap mutation was partial — focusablesIn still referenced");
  } else {
    expectFailure(
      "n2 strip the focus trap → ov1",
      gateOv1,
      { ...pristine, overlaysTsx },
      "the focus trap's focusable census",
    );
  }
}

// (n3) THE EXPANSION NEGATIVE — the [open] row stays 0fr: the accordion
//      never expands, cd2 must catch the missing 1fr.
{
  const cardsCss = pristine.cardsCss.replace(
    `.sig-accordion[open] .sig-accordion__body {
    grid-template-rows: 1fr; /* open — the row takes the content's height */
  }`,
    `.sig-accordion[open] .sig-accordion__body {
    grid-template-rows: 0fr; /* MUTANT: the expansion is dead */
  }`,
  );
  if (cardsCss === pristine.cardsCss) {
    failures.push("(n3) could not find the [open] 1fr expansion to mutate");
  } else {
    expectFailure(
      "n3 collapse the [open] expansion → cd2",
      gateCd2,
      { ...pristine, cardsCss },
      "grid-template-rows: 1fr on details[open]",
    );
  }
}

// (n4) THE CRIMSON NEGATIVE — the confirm voice drifts off the token.
{
  const overlaysCss = pristine.overlaysCss.replace(
    "    background: var(--sig-crimson);\n    color: #ffffff;",
    "    background: var(--color-cake-primary);\n    color: var(--text-main);",
  );
  if (overlaysCss === pristine.overlaysCss) {
    failures.push("(n4) could not find the crimson confirm voice to mutate");
  } else {
    expectFailure(
      "n4 crimson → structural flamingo → ov1",
      gateOv1,
      { ...pristine, overlaysCss },
      "background: var(--sig-crimson);",
    );
  }
}

// (n5) THE TEMPLATE-SET NEGATIVE — saas sneaks back into the bin map.
{
  const templatesBinSrc = pristine.templatesBinSrc.replace(
    'export const PAGE_TEMPLATE_NAMES = Object.freeze(["telemetry", "microlab"]);',
    'export const PAGE_TEMPLATE_NAMES = Object.freeze(["telemetry", "microlab", "saas"]);',
  );
  if (templatesBinSrc === pristine.templatesBinSrc) {
    failures.push("(n5) could not find the PAGE_TEMPLATE_NAMES line to mutate");
  } else {
    expectFailure(
      "n5 reintroduce saas → cli",
      gateCli,
      { ...pristine, templatesBinSrc },
      "the bin map carries exactly the two ids",
    );
  }
}

// THE POSITIVE CONTROL — the pristine record must pass every gate.
const positives = runV400Gates(pristine);
if (positives.length > 0) {
  failures.push("(positive control) the UNMUTATED tree must pass all six gates");
  for (const message of positives) failures.push(`  (control) ${message}`);
} else {
  console.log("  (control) the unmutated tree passes cd1/cd2/ov1/gs1/ml1/cli");
}

if (failures.length > 0) {
  console.error("FAIL — verify-negative-v400");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("PASS — every negative trips, the positive control passes.");
