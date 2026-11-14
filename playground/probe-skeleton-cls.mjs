#!/usr/bin/env node
/**
 * probe-skeleton-cls.mjs — THE CLS PROOF (2.9.1, release blocker).
 *
 * The "Simulate Async Load (800ms)" trigger swaps the Core Dashboard's
 * seven bento card bodies for <SkeletonCard /> (and the ledger DataTable
 * for <SkeletonTableRow columns={3} /> × current-rows) for 800ms. A
 * layout shift here would move the whole 12-column grid — so the swap
 * is height-locked by construction (SimSlot measures each card body's
 * exact footprint BEFORE the swap and renders the skeleton inside that
 * explicit height during the window). This probe proves the claim
 * inside a real browser:
 *
 *   1. park the pointer (hover lift = transform = rect motion), let the
 *      stagger/fonts settle;
 *   2. measure EVERY .bento12 child's bounding rect — BEFORE;
 *   3. fire the trigger through the COMMAND PALETTE (Ctrl+K → type
 *      "skeleton" → Enter) and at ~400ms into the 800ms window measure
 *      again — DURING, asserting the skeletons are actually live (6
 *      .sig-skeleton-card + 5 .sig-skeleton-tr rows);
 *   4. wait for the restore, measure a third time — AFTER, asserting
 *      the real content is back (the DataTable re-rendered);
 *   5. assert all three rect sets are identical ±1px (x/y/width/height
 *      on all 11 grid children), and zero console/page errors.
 *
 * Requires the dev server on http://localhost:5173. Exit 0 = CLS 0.
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
const TOLERANCE_PX = 1;
const failures = [];
const consoleErrors = [];
const pageErrors = [];

/** Collect the bento children's rects, indexed by DOM order. */
const COLLECT = () =>
  [...document.querySelectorAll(".bento12 > *")].map((el) => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => pageErrors.push(String(error)));

await page.goto(URL_TO_PROBE, { waitUntil: "networkidle" });
// Settle: fonts painted, the bento stagger (≤0.55s + 0.4s) done.
await page.waitForTimeout(1300);
await page.mouse.move(0, 0);
await page.waitForTimeout(450); // hover-transform settle after parking

const before = await page.evaluate(COLLECT);
if (before.length !== 11) failures.push(`expected 11 bento children (banner + 3 KPIs + 7 cards), found ${before.length}`);
const idleSkeletons = await page.locator(".bento12 .sig-skeleton, .bento12 .sig-skeleton-tr").count();
if (idleSkeletons !== 0) failures.push(`bento should hold zero skeletons at rest, found ${idleSkeletons}`);

// Fire through the palette (keyboard path — the pointer stays parked).
await page.keyboard.press("Control+k");
await page.locator('[data-testid="command-input"]').waitFor({ state: "visible" });
await page.waitForFunction(() => document.querySelector('[data-testid="command-input"]')?.value === "");
await page.keyboard.type("skeleton");
const rows = await page.locator('[data-testid="command-list"] [role="option"]').allTextContents();
if (!(rows.length === 1 && rows[0].includes("Simulate Async Load (800ms)"))) {
  failures.push(`"skeleton" must filter to exactly the simulate command, got ${JSON.stringify(rows)}`);
}
await page.keyboard.press("Enter"); // runs + closes
await page.locator('[data-testid="command-input"]').waitFor({ state: "detached" });

// DURING — ~400ms into the 800ms window the skeletons must be live.
await page.waitForTimeout(400);
const during = await page.evaluate(COLLECT);
const cardSkeletons = await page.locator(".bento12 .sig-skeleton-card").count();
const rowSkeletons = await page.locator(".bento12 .sig-skeleton-tr").count();
if (cardSkeletons !== 6) failures.push(`expected 6 live .sig-skeleton-card in the bento mid-window, found ${cardSkeletons}`);
if (rowSkeletons !== 5) failures.push(`expected 5 live .sig-skeleton-tr ledger rows (the SEED_MEMBERS count), found ${rowSkeletons}`);

// AFTER — the window closes and the real content returns.
await page.waitForFunction(() => document.querySelectorAll(".bento12 .sig-skeleton, .bento12 .sig-skeleton-tr").length === 0, { timeout: 3000 });
await page.mouse.move(0, 0);
await page.waitForTimeout(450);
const ledgerTable = await page.locator('[data-testid="ledger-table"] .sig-data-table').count();
if (ledgerTable !== 1) failures.push(`the ledger DataTable must render again after the window, found ${ledgerTable}`);
const after = await page.evaluate(COLLECT);

// THE PROOF — identical rects ±1px on every child, every phase.
const diff = (a, b) => Math.max(
  Math.abs(a.x - b.x), Math.abs(a.y - b.y),
  Math.abs(a.width - b.width), Math.abs(a.height - b.height),
);
const report = before.map((rect, i) => ({
  child: i,
  before: rect,
  during: during[i],
  after: after[i],
  maxDelta: Math.max(diff(rect, during[i]), diff(rect, after[i])),
}));
console.log("\nCLS PROBE — .bento12 children, bounding rects BEFORE / DURING (mid-skeleton) / AFTER");
for (const row of report) {
  console.log(
    `  #${String(row.child).padStart(2)} ` +
    `before ${row.before.width.toFixed(1)}x${row.before.height.toFixed(1)} @(${row.before.x.toFixed(1)}, ${row.before.y.toFixed(1)}) · ` +
    `during Δ ${diff(row.before, row.during).toFixed(2)}px · ` +
    `after Δ ${diff(row.before, row.after).toFixed(2)}px`,
  );
}
for (const row of report) {
  if (row.maxDelta > TOLERANCE_PX) {
    failures.push(`bento child #${row.child} moved ${row.maxDelta.toFixed(2)}px across the window (tolerance ±${TOLERANCE_PX}px) — CLS NOT 0`);
  }
}
if (consoleErrors.length > 0) failures.push(`console errors: ${consoleErrors.join(" | ")}`);
if (pageErrors.length > 0) failures.push(`page errors: ${pageErrors.join(" | ")}`);

await browser.close();

if (failures.length > 0) {
  console.error("\nFAIL — CLS probe");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("\nPASS — CLS 0: every card container rect identical ±1px BEFORE/DURING/AFTER the skeleton window");
