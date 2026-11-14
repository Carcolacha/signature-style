#!/usr/bin/env node
/**
 * probe-perf-drag.mjs — THE 60FPS DRAG PROOF (3.0.0, Task 8).
 *
 * The obsidian graph claims 60fps drag: pointermove mutates the node's
 * <g> transform DIRECTLY through a ref (no setState per move,
 * rAF-throttled, one commit per drag), React.memo fences the five hot
 * exports, and .sig-surface-card carries contain: layout style paint.
 * This probe samples REAL frame deltas while dragging:
 *
 *   1. open the dashboard → the "Graphs & Planner" module tab;
 *   2. inject a rAF SAMPLER into the page (a before-fix that records
 *      consecutive frame timestamps into window.__frameDeltas);
 *   3. grab the FIRST graph node (g.ptp-graph__node) and drag it in 25
 *      pointer steps across the canvas (~600ms);
 *   4. compute the drag-window deltas (frames that overlapped the
 *      mouse moves), report median/p95/max;
 *   5. assert the MEDIAN frame delta < 20ms (60fps-ish ≈ 16.6ms; 20ms
 *      absorbs one dropped frame per three) and p95 < 40ms (no long
 *      janks). Also assert zero console/page errors and that the node
 *      actually moved (the drag committed).
 *
 * HONESTY NOTE (owner-report): the sampler measures the page's rAF
 * cadence — including Playwright's own CDP overhead on this (slower,
 * virtualized) host. The median bar is 20ms by design; a host that
 * cannot hold 16.6ms under CDP still passes if the median holds under
 * 20ms. The static guarantees (contain + memo + the rAF commit pattern,
 * gate (pf1)) are the structural half; this probe is the measured half.
 *
 * Requires the dev server on http://localhost:5173.
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
const DRAG_STEPS = 25;
const STEP_PAUSE_MS = 12;
const MEDIAN_BUDGET_MS = 20;
const P95_BUDGET_MS = 40;
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
await page.waitForTimeout(1300); // settle: fonts + the bento stagger

// Into the Graphs & Planner module.
await page.click('[data-testid="tabs-module"] button:has-text("Graphs & Planner")');
await page.waitForSelector('[data-testid="knowledge-graph"] g.ptp-graph__node');
await page.waitForTimeout(300);

// THE SAMPLER — record every rAF timestamp's delta.
await page.evaluate(() => {
  window.__frameDeltas = [];
  window.__sampling = true;
  let last = performance.now();
  const tick = (now) => {
    if (!window.__sampling) return;
    window.__frameDeltas.push(now - last);
    last = now;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});

// THE DRAG — first node, 25 steps across the canvas.
const node = page.locator('[data-testid="knowledge-graph"] g.ptp-graph__node').first();
const before = await node.boundingBox();
if (before === null) {
  failures.push("the first graph node has no bounding box — nothing to drag");
} else {
  const startX = before.x + before.width / 2;
  const startY = before.y + before.height / 2;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  const dragStart = Date.now();
  for (let step = 1; step <= DRAG_STEPS; step++) {
    await page.mouse.move(
      startX + (step * 320) / DRAG_STEPS,
      startY + (step * 160) / DRAG_STEPS,
      { steps: 1 },
    );
    await page.waitForTimeout(STEP_PAUSE_MS);
  }
  const dragEnd = Date.now();
  await page.mouse.up();

  // Stop sampling, slice the deltas to the drag window.
  const all = await page.evaluate(async () => {
    window.__sampling = false;
    await new Promise((resolve) => requestAnimationFrame(resolve));
    return window.__frameDeltas;
  });
  const windowMs = dragEnd - dragStart + 60; // include the commit frame
  // Slice by count: the sampler ran at rAF cadence; take the deltas that
  // cover the drag window from the END of the recording (the tail is the
  // drag + commit + one settle frame).
  const estimatedFrames = Math.max(5, Math.round(windowMs / 16.6));
  const dragDeltas = all.slice(-estimatedFrames);
  if (dragDeltas.length < 5) {
    failures.push(`the sampler recorded too few drag-window frames: ${dragDeltas.length}`);
  }
  const sorted = [...dragDeltas].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] ?? Infinity;
  const p95 = sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1)] ?? Infinity;
  const max = sorted[sorted.length - 1] ?? Infinity;

  console.log("");
  console.log("PERF PROBE — obsidian graph drag (25 steps, ~600ms)");
  console.log(`  drag-window frames sampled : ${dragDeltas.length}`);
  console.log(`  median frame delta         : ${median.toFixed(1)}ms  (budget ${MEDIAN_BUDGET_MS}ms)`);
  console.log(`  p95 frame delta            : ${p95.toFixed(1)}ms  (budget ${P95_BUDGET_MS}ms)`);
  console.log(`  max frame delta            : ${max.toFixed(1)}ms`);
  if (!(median < MEDIAN_BUDGET_MS)) {
    failures.push(`median frame delta ${median.toFixed(1)}ms >= ${MEDIAN_BUDGET_MS}ms budget — the drag janks`);
  }
  if (!(p95 < P95_BUDGET_MS)) {
    failures.push(`p95 frame delta ${p95.toFixed(1)}ms >= ${P95_BUDGET_MS}ms — long janks in the drag`);
  }

  // THE COMMIT PROOF — the node actually moved (pointerup → onMoveNode
  // → persisted positions → the transform re-rendered).
  const after = await node.boundingBox();
  if (after === null || Math.abs(after.x - before.x) < 100 || Math.abs(after.y - before.y) < 50) {
    failures.push("the node did not commit its dragged position (the transform did not persist)");
  } else {
    console.log(`  commit proof               : node moved (${(after.x - before.x).toFixed(0)}, ${(after.y - before.y).toFixed(0)})px — onMoveNode landed`);
  }
}

if (consoleErrors.length > 0) {
  failures.push(`console errors during the drag: ${consoleErrors.join(" | ")}`);
}
if (pageErrors.length > 0) {
  failures.push(`page errors during the drag: ${pageErrors.join(" | ")}`);
}

await browser.close();

if (failures.length > 0) {
  console.error("");
  console.error("FAIL — perf drag probe");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("");
console.log("PASS — the obsidian drag holds its frame budget (60fps-ish)");
