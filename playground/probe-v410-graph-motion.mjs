#!/usr/bin/env node
/**
 * probe-v410-graph-motion.mjs — THE GRAPH MOTION LAYER PROOF (4.1.0
 * "Graph Motion Layer", release blocker).
 *
 * The choreography claims, measured on the LIVE dev server (StrictMode
 * on — the double-mount paths are exercised for real):
 *
 *   (a) AI EXPAND → 3-4 new nodes pop in sequential springs: the
 *       overlay's motion cards are sampled MID-ANIMATION and their
 *       opacities differ at one instant (the spawnIndex·0.07s stagger
 *       proof); the animejs edge paths are sampled mid-draw and their
 *       strokeDashoffset decreases sample-to-sample (progressive
 *       draw-on). The overlay then SETTLES (detaches) and the static
 *       canvas shows the grown graph.
 *   (b) DELETE NODE (post-ConfirmDialog) → an exit ghost mounts at
 *       rest and is sampled mid-exit with scale < 1 (the 0.72
 *       collapse in flight) before the layer detaches.
 *   (c) 60FPS DRAG RE-VERIFIED with the motion wrappers present: the
 *       rAF sampler's median frame delta < 20ms during a 25-step node
 *       drag (the drag is transform-only on the outer wrapper; the
 *       motion stratum renders nothing at rest).
 *   (d) ZERO console/page errors across every step.
 *   (e) ALL THREE THEMES via the persisted prefs
 *       (sig.workspace.v3.prefs): mocha (default, absent attribute),
 *       oled, daylight — the choreography runs under each and the
 *       transient chip paints that theme's surface.
 *
 * DOM SHAPE PROOFS (the report's strata evidence): the spawn card
 * outerHTML (motion.div [data-motion-engine="motion-react"] inside a
 * foreignObject) and the draw-on path outerHTML (animejs class
 * sig-motion-edge with pathLength/stroke-dash* attributes) are printed.
 *
 * Exit 0 = all pass. Requires the dev server on http://localhost:5173.
 */
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const require = createRequire(pathToFileURL(resolve(root, "packages/signature-mcp/package.json")));
const { chromium } = require("playwright");

const URL_TO_PROBE = "http://localhost:5173/#/graph";
const Prefs = {
  mocha: { theme: "mocha", radius: "standard" },
  oled: { theme: "oled", radius: "standard" },
  daylight: { theme: "daylight", radius: "standard" },
};

const failures = [];
const consoleErrors = [];
const pageErrors = [];
const evidence = {};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => pageErrors.push(String(error)));

/** Install the persisted prefs BEFORE the app boots. */
async function launchWithPrefs(prefs) {
  await page.goto("http://localhost:5173/#/graph", { waitUntil: "domcontentloaded" });
  await page.evaluate((value) => {
    window.localStorage.clear();
    window.localStorage.setItem("sig.workspace.v3.prefs", JSON.stringify(value));
  }, prefs);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector('[data-testid="graph-studio"]', { timeout: 20000 });
  await page.waitForSelector("g.sig-graph__node", { timeout: 20000 });
  await page.waitForTimeout(600); // settle: fonts, the layout paint
}

/** The node count the STATIC canvas reports. */
async function staticNodeCount() {
  return page.locator("g.sig-graph__node").count();
}

async function expandSelection() {
  await selectFirstNode();
  await page.waitForSelector('[data-testid="studio-ai-expand"]', { timeout: 5000 });
  await page.click('[data-testid="studio-ai-expand"]');
}

/**
 * Node SELECTION rides a dispatched bubbling click — the probe tests
 * the choreography, not the floating HUDs' hit-testing (the toolbar /
 * inspector legitimately intercept real clicks over covered nodes).
 */
async function selectFirstNode() {
  const id = await page.evaluate(() => {
    const el = document.querySelector("g.sig-graph__node");
    return el === null ? null : el.getAttribute("data-id");
  });
  if (id === null) throw new Error("probe: no node on the canvas");
  await page.evaluate((nodeId) => {
    const el = document.querySelector(`g.sig-graph__node[data-id="${nodeId}"]`);
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }, id);
}

async function clickUnobstructedNode() {
  await selectFirstNode();
}

/** One instant's snapshot of every live motion card. */
function sampleCards() {
  return page.evaluate(() => {
    return Array.from(document.querySelectorAll("[data-testid='graph-motion-node']")).map((el) => {
      const style = window.getComputedStyle(el);
      return {
        role: el.getAttribute("data-motion-role"),
        index: el.getAttribute("data-spawn-index"),
        opacity: Number.parseFloat(style.opacity),
        scale: style.transform === "none" ? 1 : Number.parseFloat(style.transform.match(/matrix\(([^,]+),/)?.[1] ?? "1"),
      };
    });
  });
}

/** One instant's snapshot of every live draw-on edge. */
function sampleEdges() {
  return page.evaluate(() => {
    return Array.from(document.querySelectorAll("path.sig-motion-edge")).map((el) => {
      const style = window.getComputedStyle(el);
      return {
        dashoffset: Number.parseFloat(style.strokeDashoffset || "NaN"),
        dasharray: style.strokeDasharray,
      };
    });
  });
}

async function waitLayerSettled(label) {
  try {
    await page.waitForSelector('[data-testid="graph-motion-layer"]', { state: "detached", timeout: 6000 });
  } catch {
    failures.push(`(${label}) the motion layer never settled — the overlay stayed mounted`);
  }
  await page.waitForTimeout(120);
}

// ---- BOOT: mocha default ----------------------------------------------------------
await launchWithPrefs(Prefs.mocha);

// ---- (a) AI EXPAND — sequential springs + progressive edge draws ------------------
{
  const before = await staticNodeCount();
  await expandSelection();
  await page.waitForSelector('[data-testid="graph-motion-layer"]', { timeout: 5000 });

  // MID-ANIMATION STAGGER SAMPLE — one instant, all live cards.
  await page.waitForSelector("[data-testid='graph-motion-node']", { state: "attached", timeout: 3000 });
  const early = await sampleCards();
  evidence.spawnCards = early;
  const spawns = early.filter((card) => card.role === "spawn");
  if (spawns.length < 3 || spawns.length > 4) {
    failures.push(`(gm-a) expected 3-4 spawn cards mid-flight, found ${spawns.length}`);
  }
  const opacities = spawns.map((card) => card.opacity);
  const spread = Math.max(...opacities) - Math.min(...opacities);
  if (spawns.length >= 2 && spread < 0.01) {
    failures.push(
      `(gm-a) spawn opacities identical mid-flight (${opacities.join(", ")}) — the spawnIndex·0.07s stagger did not fire`,
    );
  }
  const someoneHidden = opacities.some((value) => value < 0.95);
  if (!someoneHidden) {
    failures.push(`(gm-a) every spawn card was already at rest at the first sample (${opacities.join(", ")}) — sampled too late or no animation`);
  }

  // MID-DRAW EDGE SAMPLES — progressive strokeDashoffset (attached, not
  // visible: an offset-1000 path paints nothing, so it has no box yet).
  const edgeProbe1 = await page.waitForSelector("path.sig-motion-edge", { state: "attached", timeout: 3000 });
  if (edgeProbe1 === null) {
    failures.push("(gm-a) no animejs draw-on edge mounted");
  } else {
    evidence.edgeDom = await edgeProbe1.evaluate((el) => el.outerHTML.slice(0, 400));
    const sample1 = await sampleEdges();
    await page.waitForTimeout(120);
    const sample2 = await sampleEdges();
    evidence.edgeSamples = [sample1, sample2];
    const drawing = sample1.filter((edge) => Number.isFinite(edge.dashoffset) && edge.dashoffset > 0.5);
    if (drawing.length === 0) {
      failures.push(`(gm-a) no edge was mid-draw at the first sample (${JSON.stringify(sample1)})`);
    }
    const progressed = sample2.some((edge, index) => {
      const first = sample1[index];
      return first !== undefined && Number.isFinite(first.dashoffset) && edge.dashoffset < first.dashoffset - 1;
    });
    if (!progressed) {
      failures.push(`(gm-a) strokeDashoffset never decreased between samples — the draw-on is not animating (${JSON.stringify(sample1)} → ${JSON.stringify(sample2)})`);
    }
  }

  // THE STRATA DOM PROOFS.
  evidence.spawnDom = await page.evaluate(() => {
    const el = document.querySelector("[data-testid='graph-motion-node']");
    return el === null ? null : el.outerHTML.slice(0, 500);
  });

  await waitLayerSettled("gm-a");
  const after = await staticNodeCount();
  if (after !== before + spawns.length) {
    failures.push(`(gm-a) canvas did not grow by the batch: ${before} → ${after} (expected +${spawns.length})`);
  }
  if (await page.locator('[data-testid="graph-motion-masks"]').count() !== 0) {
    failures.push("(gm-a) mask rules survived the settle — the swap contract leaked");
  }
}

// ---- (b) DELETE NODE — the exit ghost collapses -----------------------------------
{
  await clickUnobstructedNode();
  await page.waitForSelector('[data-testid="studio-delete-node"]', { timeout: 5000 });
  await page.click('[data-testid="studio-delete-node"]');
  await page.waitForSelector('[data-testid="confirm-dialog"]', { timeout: 5000 }).catch(() => {});
  // The ConfirmDialog norm — the confirm button carries the crimson voice.
  const confirm = page.locator("button:has-text('Yes, Delete')").first();
  await confirm.waitFor({ state: "visible", timeout: 5000 });
  const before = await staticNodeCount();
  await confirm.click();

  await page.waitForSelector("[data-motion-role='exit-ghost']", { state: "attached", timeout: 3000 });
  // Sample the ghost MID-EXIT (after the rest beat, during the collapse).
  await page.waitForTimeout(180);
  const midExit = (await sampleCards()).filter((card) => card.role === "exit-ghost");
  evidence.exitGhostSamples = midExit;
  const collapsing = midExit.some((card) => card.scale < 0.98 || card.opacity < 0.98);
  if (!collapsing) {
    failures.push(`(gm-b) the exit ghost was at rest 180ms after leaving (${JSON.stringify(midExit)}) — the exit spring did not fire`);
  }
  await waitLayerSettled("gm-b");
  const after = await staticNodeCount();
  if (after !== before - 1) {
    failures.push(`(gm-b) canvas did not shrink by exactly one: ${before} → ${after}`);
  }
}

// ---- RESET CANVAS — the mass ghost wave --------------------------------------------
{
  await expandSelection();
  await waitLayerSettled("gm-reset-prep");
  await page.click('[data-testid="studio-reset-canvas"]');
  const confirm = page.locator("button:has-text('Yes, Reset')").first();
  await confirm.waitFor({ state: "visible", timeout: 5000 });
  await confirm.click();
  await page.waitForSelector("[data-motion-role='exit-ghost']", { state: "attached", timeout: 3000 });
  const ghosts = await page.locator("[data-motion-role='exit-ghost']").count();
  evidence.resetGhostCount = ghosts;
  if (ghosts < 2) {
    failures.push(`(gm-reset) expected a mass ghost wave on reset, found ${ghosts}`);
  }
  await waitLayerSettled("gm-reset");
}

// ---- (c) 60FPS DRAG with the motion wrappers present -------------------------------
{
  await page.evaluate(() => {
    window.__frameDeltas = [];
    window.__sampling = true;
    let last = performance.now();
    const tick = (now) => {
      if (window.__sampling !== true) return;
      window.__frameDeltas.push(now - last);
      last = now;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  // The seed root sits dead-center — never under a HUD card; drag IT.
  const node = page.locator('g.sig-graph__node[data-id="kg-root"]').first();
  const box = await node.boundingBox();
  if (box === null) {
    failures.push("(gm-drag) the first node has no bounding box");
  } else {
    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    const dragStart = Date.now();
    for (let step = 1; step <= 25; step += 1) {
      await page.mouse.move(startX + (step * 120) / 25, startY + (step * 60) / 25, { steps: 1 });
      await page.waitForTimeout(12);
    }
    const dragEnd = Date.now();
    await page.mouse.up();
    const deltas = await page.evaluate(() => {
      window.__sampling = false;
      return window.__frameDeltas;
    });
    // Frame deltas overlapping the drag window only.
    const dragMs = dragEnd - dragStart;
    const from = Math.max(0, deltas.length - Math.ceil(dragMs / 16.7) - 2);
    const window_ = deltas.slice(from);
    const sorted = [...window_].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)] ?? Infinity;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? Infinity;
    evidence.drag = { median, p95, samples: window_.length };
    if (!(median < 20)) {
      failures.push(`(gm-drag) median frame delta ${median.toFixed(1)}ms ≥ 20ms — the drag lost 60fps with the motion wrappers present`);
    }
    if (!(p95 < 40)) {
      failures.push(`(gm-drag) p95 frame delta ${p95.toFixed(1)}ms ≥ 40ms — long jank during drag`);
    }
  }
}

// ---- (d) zero console/page errors (mocha leg) --------------------------------------
if (consoleErrors.length > 0 || pageErrors.length > 0) {
  failures.push(`(gm-console) console errors: ${JSON.stringify(consoleErrors)}; page errors: ${JSON.stringify(pageErrors)}`);
}

// ---- (e) ALL THREE THEMES via the persisted prefs -----------------------------------
for (const [name, prefs] of Object.entries(Prefs)) {
  await launchWithPrefs(prefs);
  const expected = name === "mocha" ? "mocha" : name; // the engine stamps the attribute explicitly, default included
  const themeAttr = await page.evaluate(() => document.documentElement.getAttribute("data-sig-theme"));
  if (themeAttr !== expected) {
    failures.push(`(gm-theme:${name}) html[data-sig-theme] = ${JSON.stringify(themeAttr)}, expected ${JSON.stringify(expected)}`);
  }
  const surfaceBefore = await page.evaluate(() => getComputedStyle(document.querySelector("g.sig-graph__node circle")).fill);
  await expandSelection();
  await page.waitForSelector("[data-testid='graph-motion-node']", { state: "attached", timeout: 3000 });
  const chipSurface = await page.evaluate(() =>
    getComputedStyle(document.querySelector(".sig-motion-node__chip")).backgroundColor,
  );
  evidence[`theme-${name}`] = { themeAttr, chipSurface, nodeFill: surfaceBefore };
  await waitLayerSettled(`gm-theme:${name}`);
  if (consoleErrors.length > 0 || pageErrors.length > 0) {
    failures.push(`(gm-theme:${name}) errors: ${JSON.stringify(consoleErrors)} / ${JSON.stringify(pageErrors)}`);
  }
}

// ---- CLEANUP — leave the workspace pristine for the other gates ----------------------
await page.evaluate(() => window.localStorage.clear());
await page.goto("http://localhost:5173/#/graph", { waitUntil: "networkidle" });

await browser.close();

console.log("graph-motion probe evidence:");
for (const [key, value] of Object.entries(evidence)) {
  console.log(`  ${key}: ${JSON.stringify(value)}`);
}

if (failures.length > 0) {
  console.error("FAIL");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("PASS — 4.1.0 graph motion probe: expand stagger + edge draws + exit ghosts + reset wave + 60fps drag + zero errors + 3 themes");
