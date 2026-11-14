#!/usr/bin/env node
/**
 * probe-container-queries.mjs — the v2.9.0 container-query PROOF (the
 * Phase 1 release blocker).
 *
 * Loads the playground and inspects the hidden `.hub__cq-probe`
 * fixture: the SAME MatchupCard / StatCard / ContentCard rendered
 * inside a 280px `.sig-cell` and a 900px `.sig-cell`. Asserts the
 * computed layouts genuinely DIFFER between the two containers:
 *
 *   (cq1) .ptp-matchup      — narrow (< 380px): grid-template-columns
 *                             collapses to one track + the VS pill
 *                             grows hairline ::before/::after dividers;
 *                             wide: the 1fr auto 1fr side-by-side.
 *   (cq2) .ptp-stat-card    — narrow (< 360px): display flex (stacked);
 *                             wide (≥ 360px): display grid, sparkline
 *                             docked in the second column.
 *   (cq3) .sig-content-card — narrow: flex-direction column; wide
 *                             (≥ 440px): display grid media-object
 *                             (visual in a ~40% column).
 *
 * Requires the dev server on http://localhost:5173. Exit 0 = proof PASS.
 */
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
// playwright lives in tools/mcp-viz (the cortex's dependency).
const require = createRequire(
  pathToFileURL(resolve(root, "tools/mcp-viz/package.json")),
);
const { chromium } = require("playwright");

const URL_TO_PROBE = "http://localhost:5173";

function fail(label) {
  console.error(`CQ PROOF FAIL: ${label}`);
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(URL_TO_PROBE, { waitUntil: "networkidle" });
await page.waitForSelector('[data-testid="cq-probe"] .ptp-matchup');

/** Computed style of a selector scoped inside one probe cell. */
async function style(cell, selector, prop) {
  return page.evaluate(
    ([cellSel, sel, cssProp]) => {
      const el = document.querySelector(`${cellSel} ${sel}`);
      return el === null ? null : getComputedStyle(el).getPropertyValue(cssProp);
    },
    [cell, selector, prop],
  );
}

const results = [];

/* (cq1) MatchupCard — stacked in 280px, side-by-side in 900px. */
const matchupNarrowCols = await style(".hub__cq-narrow", ".ptp-matchup", "grid-template-columns");
const matchupWideCols = await style(".hub__cq-wide", ".ptp-matchup", "grid-template-columns");
const vsNarrowBefore = await page.evaluate(() => {
  const el = document.querySelector(".hub__cq-narrow .ptp-matchup__vs");
  return el === null ? null : getComputedStyle(el, "::before").width;
});
const vsWideBefore = await page.evaluate(() => {
  const el = document.querySelector(".hub__cq-wide .ptp-matchup__vs");
  return el === null ? null : getComputedStyle(el, "::before").width;
});
if (matchupNarrowCols === null || matchupWideCols === null) fail("(cq1) matchup not found");
results.push({
  probe: "(cq1) matchup grid-template-columns",
  narrow280: matchupNarrowCols,
  wide900: matchupWideCols,
});
if (matchupNarrowCols.split(" ").length !== 1) {
  fail(`(cq1) expected the 280px matchup to stack to ONE track, got "${matchupNarrowCols}"`);
}
if (matchupWideCols.split(" ").length !== 3) {
  fail(`(cq1) expected the 900px matchup side-by-side (3 tracks), got "${matchupWideCols}"`);
}
results.push({
  probe: "(cq1) VS divider ::before width",
  narrow280: vsNarrowBefore,
  wide900: vsWideBefore,
});
if (parseFloat(String(vsNarrowBefore)) <= 0) fail("(cq1) the narrow VS divider hairline did not render");
if (String(vsWideBefore) !== "0px" && String(vsWideBefore) !== "" && String(vsWideBefore) !== "auto") {
  fail(`(cq1) the wide VS pill must have no divider hairline, got ::before width "${vsWideBefore}"`);
}

/* (cq2) StatCard — stacked flex in 280px, docked grid in 900px. */
const statNarrowDisplay = await style(".hub__cq-narrow", ".ptp-stat-card", "display");
const statWideDisplay = await style(".hub__cq-wide", ".ptp-stat-card", "display");
const statWideCols = await style(".hub__cq-wide", ".ptp-stat-card", "grid-template-columns");
const statWideValueSize = await style(".hub__cq-wide", ".ptp-stat-card__value", "font-size");
const statNarrowValueSize = await style(".hub__cq-narrow", ".ptp-stat-card__value", "font-size");
const sparkWideCol = await style(".hub__cq-wide", ".ptp-stat-card > svg", "grid-column");
const sparkNarrowCol = await style(".hub__cq-narrow", ".ptp-stat-card > svg", "grid-column");
if (statNarrowDisplay !== "flex") {
  fail(`(cq2) expected the 280px stat-card stacked (display: flex), got "${statNarrowDisplay}"`);
}
if (statWideDisplay !== "grid") {
  fail(`(cq2) expected the 900px stat-card docked (display: grid), got "${statWideDisplay}"`);
}
const wideTracks = statWideCols === null ? [] : statWideCols.split(" ").filter((t) => t !== "none");
if (wideTracks.length !== 2) {
  fail(`(cq2) expected the 900px stat-card two tracks, got "${statWideCols}"`);
}
if (parseFloat(String(sparkWideCol)) !== 2) {
  fail(`(cq2) expected the 900px sparkline docked in column 2, got grid-column "${sparkWideCol}"`);
}
if (parseFloat(String(sparkNarrowCol)) === 2) {
  fail("(cq2) the 280px sparkline must NOT be docked in column 2 (stacked flow)");
}
results.push({
  probe: "(cq2) stat-card display",
  narrow280: statNarrowDisplay,
  wide900: statWideDisplay,
});
results.push({
  probe: "(cq2) stat-card KPI value font-size",
  narrow280: statNarrowValueSize,
  wide900: statWideValueSize,
});
results.push({
  probe: "(cq2) sparkline grid-column",
  narrow280: sparkNarrowCol,
  wide900: sparkWideCol,
});

/* (cq3) ContentCard — vertical stack in 280px, media-object in 900px. */
const contentNarrowDisplay = await style(".hub__cq-narrow", ".sig-content-card", "display");
const contentWideDisplay = await style(".hub__cq-wide", ".sig-content-card", "display");
const contentNarrowCols = await style(".hub__cq-narrow", ".sig-content-card", "grid-template-columns");
const contentWideCols = await style(".hub__cq-wide", ".sig-content-card", "grid-template-columns");
const contentWidePad = await style(".hub__cq-wide", ".sig-content-card", "padding-top");
const contentNarrowPad = await style(".hub__cq-narrow", ".sig-content-card", "padding-top");
if (contentNarrowDisplay !== "flex" || contentNarrowCols.includes(" ")) {
  fail(
    `(cq3) expected the 280px content-card stacked (display flex, single column), got display "${contentNarrowDisplay}", columns "${contentNarrowCols}"`,
  );
}
if (contentWideDisplay !== "grid") {
  fail(`(cq3) expected the 900px content-card media-object (display grid), got "${contentWideDisplay}"`);
}
const contentTracks = contentWideCols === null ? [] : contentWideCols.split(" ").filter((t) => t !== "none");
if (contentTracks.length !== 2) {
  fail(`(cq3) expected the 900px content-card two tracks, got "${contentWideCols}"`);
}
if (parseFloat(String(contentWidePad)) !== 24) {
  fail(`(cq3) expected the 900px content-card roomier 24px padding, got "${contentWidePad}"`);
}
if (parseFloat(String(contentNarrowPad)) !== 16) {
  fail(`(cq3) expected the 280px content-card base 16px padding, got "${contentNarrowPad}"`);
}
results.push({
  probe: "(cq3) content-card display",
  narrow280: contentNarrowDisplay,
  wide900: contentWideDisplay,
});
results.push({
  probe: "(cq3) content-card padding-top",
  narrow280: contentNarrowPad,
  wide900: contentWidePad,
});

await browser.close();

console.log("CQ PROOF PASS — the same cards, two containers, different layouts:");
for (const row of results) {
  console.log(`  ${row.probe}\n    280px: ${row.narrow280}\n    900px: ${row.wide900}`);
}
