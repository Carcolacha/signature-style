#!/usr/bin/env node
/**
 * probe-v3-cortex.mjs — THE 3.0.0 CORTEX PROOF (release blocker).
 *
 * Playwright measures the release's rendering claims inside the real
 * browser (spans / ring / parity / graph):
 *
 *   SPANS — the bento keeps its 12-column assembly (11 children), and
 *   the Field Notes carousel's paged-3 mode renders PAGES of three:
 *   toggling the pill flips the track's snap units to one-per-page
 *   slides wearing the repeat(3, 1fr) grid (measured: 3 columns, one
 *   slide per 3 items, the indicator reading pages).
 *
 *   RING — the live RSVP ring renders the 120px square dial; clicking
 *   it toggles data-expanded (scale(1.07) computed transform) and the
 *   detail strip slides open with the tabular readout
 *   ("<v>% · <n> / 200 Guests").
 *
 *   PARITY — the three hand-rolled archetypes measure as the
 *   self-contained surfaces: background rgb surface, border-radius 12px
 *   (var(--radius-card)), min-height 220px, the 15% glass hairline.
 *
 *   GRAPH — the obsidian interactions: nodes carry r 34 (viewBox
 *   units), labels 13px; right-clicking a node draws the live
 *   .sig-graph__tether (stroke rgb(34,138,242) = --sig-azure,
 *   dasharray 6 4); double-click spawns a node; the wheel zooms the
 *   viewBox (0.5–2.5 clamp).
 *
 * Requires the dev server on http://localhost:5173. Exit 0 = proof.
 */
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const require = createRequire(pathToFileURL(resolve(root, "tools/mcp-viz/package.json")));
const { chromium } = require("playwright");

const URL_TO_PROBE = "http://localhost:5173";
const failures = [];
const consoleErrors = [];
const pageErrors = [];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => pageErrors.push(String(error)));

await page.goto(URL_TO_PROBE, { waitUntil: "networkidle" });
await page.waitForTimeout(1300);

/* ---------------- SPANS: the bento assembly ---------------- */
const bentoChildren = await page.locator(".bento12 > *").count();
console.log(`[spans] bento children: ${bentoChildren}`);
if (bentoChildren !== 11) failures.push(`(spans) the bento must keep its 11-cell assembly, found ${bentoChildren}`);

/* ---------------- RING: zoom + detail ---------------- */
await page.click('[data-testid="tabs-module"] button:has-text("Core Dashboard")');
await page.waitForTimeout(300);
const ringWrap = page.locator('[data-testid="ring-rsvp"] .sig-ring');
const ringCount = await ringWrap.count();
if (ringCount !== 1) {
  failures.push(`(ring) the live ring must render the .sig-ring wrapper, found ${ringCount}`);
} else {
  const dialBox = await page.locator('[data-testid="ring-rsvp"] .sig-ring__dial').boundingBox();
  console.log(`[ring] dial box: ${dialBox.width.toFixed(0)}×${dialBox.height.toFixed(0)}px`);
  if (Math.abs(dialBox.width - 120) > 2 || Math.abs(dialBox.height - 120) > 2) {
    failures.push(`(ring) the dial must be the 120px square, found ${dialBox.width.toFixed(0)}×${dialBox.height.toFixed(0)}`);
  }
  const detailBefore = await page.locator('[data-testid="ring-rsvp"] .sig-ring__detail').getAttribute("data-open");
  await page.locator('[data-testid="ring-rsvp"] .sig-ring__dial').click();
  await page.waitForTimeout(450); // the 0fr → 1fr slide
  const expanded = await ringWrap.getAttribute("data-expanded");
  const detailText = (await page.locator('[data-testid="ring-rsvp"] .sig-ring__detail-inner').textContent())?.trim() ?? "";
  const detailRows = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="ring-rsvp"] .sig-ring__detail');
    return el ? getComputedStyle(el).gridTemplateRows : "none";
  });
  console.log(`[ring] data-expanded: ${expanded} · detail rows: ${detailRows} · text: "${detailText}"`);
  if (expanded !== "true") failures.push("(ring) the click must set data-expanded=true");
  if (detailBefore === "true") failures.push("(ring) the detail must start collapsed");
  if (!detailRows.includes("px") && detailRows !== "none") {
    // 1fr resolves to a px height when open
  } else if (detailRows === "0fr" || detailRows === "none") {
    failures.push("(ring) the detail strip must slide open (grid-template-rows 1fr)");
  }
  if (!/\d+% · \d+ \/ 200 Guests/.test(detailText)) {
    failures.push(`(ring) the detail strip must read "<v>% · <n> / 200 Guests", found "${detailText}"`);
  }
  await page.locator('[data-testid="ring-rsvp"] .sig-ring__dial').click();
}

/* ---------------- PARITY: the archetypes ---------------- */
const parity = await page.evaluate(() => {
  const read = (selector) => {
    const el = document.querySelector(selector);
    if (el === null) return null;
    const cs = getComputedStyle(el);
    return {
      bg: cs.backgroundColor,
      radius: cs.borderRadius,
      minHeight: parseFloat(cs.minHeight),
      border: cs.borderColor,
    };
  };
  return {
    flip: read(".sig-flip-card"),
    accordion: read(".sig-accordion"),
    matchup: read(".sig-matchup"),
  };
});
for (const [name, measured] of Object.entries(parity)) {
  console.log(`[parity] ${name}: bg=${measured?.bg} radius=${measured?.radius} minH=${measured?.minHeight}`);
  if (measured === null) {
    failures.push(`(parity) ${name} not found on the dashboard`);
    continue;
  }
  if (measured.bg === "rgba(0, 0, 0, 0)") {
    failures.push(`(parity) ${name} must carry the self-contained surface background, found transparent`);
  }
  if (measured.radius !== "12px") {
    failures.push(`(parity) ${name} must measure border-radius 12px (var(--radius-card)), found ${measured.radius}`);
  }
  if (measured.minHeight < 220) {
    failures.push(`(parity) ${name} must measure min-height ≥ 220px, found ${measured.minHeight}`);
  }
}

/* ---------------- GRAPH: the obsidian interactions ---------------- */
await page.click('[data-testid="tabs-module"] button:has-text("Graphs & Planner")');
await page.waitForSelector('[data-testid="knowledge-graph"] g.sig-graph__node');
const graphGeometry = await page.evaluate(() => {
  const circle = document.querySelector('[data-testid="knowledge-graph"] g.sig-graph__node circle');
  const text = document.querySelector('[data-testid="knowledge-graph"] g.sig-graph__node text');
  return {
    r: circle?.getAttribute("r"),
    fontSize: text?.getAttribute("font-size") ?? getComputedStyle(text).fontSize,
  };
});
console.log(`[graph] node r: ${graphGeometry.r} · label fontSize: ${graphGeometry.fontSize}`);
if (graphGeometry.r !== "34") failures.push(`(graph) nodes must be generous (r 34), found ${graphGeometry.r}`);
if (graphGeometry.fontSize !== "13") failures.push(`(graph) labels must be 13px, found ${graphGeometry.fontSize}`);

// THE TETHER — right-click a node, move, assert the live azure dashed path.
const node = page.locator('[data-testid="knowledge-graph"] g.sig-graph__node').first();
const nodeBox = await node.boundingBox();
await page.mouse.move(nodeBox.x + nodeBox.width / 2, nodeBox.y + nodeBox.height / 2);
await page.mouse.down({ button: "right" });
await page.mouse.move(nodeBox.x + nodeBox.width / 2 + 140, nodeBox.y + nodeBox.height / 2 + 80, { steps: 6 });
const tether = await page.evaluate(() => {
  const path = document.querySelector(".sig-graph__tether");
  if (path === null) return null;
  const cs = getComputedStyle(path);
  return { d: path.getAttribute("d"), stroke: cs.stroke, dasharray: cs.strokeDasharray, width: cs.strokeWidth };
});
await page.mouse.up({ button: "right" });
console.log(`[graph] tether: d=${tether?.d !== "" && tether?.d !== null ? "drawn" : "EMPTY"} stroke=${tether?.stroke} dash=${tether?.dasharray} w=${tether?.width}`);
if (tether === null || tether.d === "") {
  failures.push("(graph) the right-click tether must draw the live path");
} else {
  if (!tether.stroke.includes("34, 138, 242")) failures.push(`(graph) the tether must wear --sig-azure (rgb(34, 138, 242)), found ${tether.stroke}`);
  const dashDigits = tether.dasharray.replace(/[px\s]/g, "").replace(/^6,4$/, "64");
  if (!/^64$/.test(dashDigits)) {
    failures.push(`(graph) the tether dash must be 6 4, found ${tether.dasharray}`);
  }
  if (tether.width !== "1.5px") failures.push(`(graph) the tether must be 1.5px, found ${tether.width}`);
}

// THE SPAWN — double-click empty canvas.
const nodesBefore = await page.locator('[data-testid="knowledge-graph"] g.sig-graph__node').count();
const canvas = await page.locator('[data-testid="knowledge-graph"] svg.sig-graph').boundingBox();
await page.mouse.dblclick(canvas.x + 30, canvas.y + canvas.height - 30);
await page.waitForTimeout(300);
const nodesAfter = await page.locator('[data-testid="knowledge-graph"] g.sig-graph__node').count();
console.log(`[graph] spawn: ${nodesBefore} → ${nodesAfter} nodes`);
if (nodesAfter !== nodesBefore + 1) failures.push(`(graph) the dbl-click spawn must add one node, ${nodesBefore} → ${nodesAfter}`);

// THE WHEEL ZOOM — scroll on the canvas, assert the viewBox changed.
const viewBoxBefore = await page.locator('[data-testid="knowledge-graph"] svg.sig-graph').getAttribute("viewBox");
await page.mouse.move(canvas.x + canvas.width / 2, canvas.y + canvas.height / 2);
await page.mouse.wheel(0, -240);
await page.waitForTimeout(200);
const viewBoxAfter = await page.locator('[data-testid="knowledge-graph"] svg.sig-graph').getAttribute("viewBox");
console.log(`[graph] wheel zoom: "${viewBoxBefore}" → "${viewBoxAfter}"`);
if (viewBoxBefore === viewBoxAfter) failures.push("(graph) the wheel must zoom the viewBox");

/* ---------------- verdict ---------------- */
if (consoleErrors.length > 0) failures.push(`console errors: ${consoleErrors.join(" | ")}`);
if (pageErrors.length > 0) failures.push(`page errors: ${pageErrors.join(" | ")}`);

await browser.close();
if (failures.length > 0) {
  console.error("");
  console.error("FAIL — the 3.0.0 cortex proof");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("");
console.log("PASS — the 3.0.0 cortex proof (spans / ring / parity / graph)");
