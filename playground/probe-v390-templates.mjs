#!/usr/bin/env node
/**
 * probe-v390-templates.mjs — THE CONTAINER-QUERY REFLOW PROBE (3.9.0,
 * the owner's defect #1).
 *
 * The v3.8.0 defect: the three full-page templates declared their
 * container ON THE TEMPLATE ROOT (container queries cannot restyle the
 * container element itself — only descendants), so the Telemetry
 * Center's root-level grid rewrites inside @container were DEAD CSS:
 * at a 375px stage the 12-column grid never collapsed and the KPI
 * tiles rendered as twelfths, colliding. The studio emulator lied.
 *
 * The 3.9.0 fix: ONE shared container-name — `template-stage` —
 * declared by the STAGE wrapper (styles.css .tpl-studio__stage) AND by
 * each template root (standalone purity: a scaffolded template still
 * answers its own width), with the telemetry grid moved to an INNER
 * wrapper the queries can legally restyle.
 *
 * This probe sets the studio stage to 375 / 768 / 1440 and asserts
 * the reflow per template:
 *   (tq1) telemetry __grid: THREE distinct computed
 *         grid-template-columns states (1-col / 6-col / 12-col);
 *   (tq2) KPI tiles: pairwise DISJOINT bounding rects at every width;
 *   (tq3) saas features + tiers: 3-col → 2-col → 1-col;
 *   (tq4) docs grid: 3-track (220px/1fr/200px) → 1-col;
 *   (tq5) zero horizontal overflow in the stage at every width.
 *
 * Usage:
 *   node playground/probe-v390-templates.mjs            (assert AFTER)
 *   node playground/probe-v390-templates.mjs --before   (measure only —
 *               the v3.8.0 baseline documentation run)
 *
 * Requires the dev server on http://localhost:5173.
 * Exit 0 = ALL PASS (or --before documentation run).
 */
import { chromium } from "playwright";

const URL_BASE = "http://localhost:5173";
const BEFORE_MODE = process.argv.includes("--before");

const WIDTHS = [
  { id: "mobile", label: "375", px: 375 },
  { id: "tablet", label: "768", px: 768 },
  { id: "desktop", label: "1440 (100% of a 1440 viewport)", px: 1440 },
];

/** The computed grid-template-columns of one selector, or "(missing)". */
async function gridOf(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el === null) return "(missing)";
    return getComputedStyle(el).gridTemplateColumns;
  }, selector);
}

/** Pairwise intersection of the matched elements' bounding rects. */
async function overlapReport(page, selector) {
  return page.evaluate((sel) => {
    const els = [...document.querySelectorAll(sel)];
    const rects = els.map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    });
    const overlaps = [];
    for (let i = 0; i < rects.length; i += 1) {
      for (let j = i + 1; j < rects.length; j += 1) {
        const a = rects[i];
        const b = rects[j];
        const intersects =
          a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
        if (intersects) overlaps.push([i, j]);
      }
    }
    return { count: rects.length, widths: rects.map((r) => Math.round(r.w)), overlaps };
  }, selector);
}

async function stageOverflow(page) {
  return page.evaluate(() => {
    const stage = document.querySelector('[data-testid="tpl-stage"]');
    if (stage === null) return "(missing)";
    return { scrollW: stage.scrollWidth, clientW: stage.clientWidth };
  });
}

/** Select one studio template tab by its visible label text. */
async function selectTemplate(page, labelPart) {
  await page.evaluate((part) => {
    const tabs = [...document.querySelectorAll('[role="tab"], .tpl-studio__seg-btn, button')];
    const tab = tabs.find((el) => el.textContent?.includes(part));
    if (tab === null || tab === undefined) throw new Error(`template tab not found: ${part}`);
    tab.click();
  }, labelPart);
  await page.waitForTimeout(250);
}

/** Set the emulator width and let the glide transition settle. */
async function setViewportWidth(page, id) {
  await page.click(`[data-testid="tpl-viewport-${id}"]`);
  await page.waitForTimeout(600);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`${URL_BASE}/#/templates`, { waitUntil: "networkidle" });
await page.waitForSelector('[data-testid="tpl-studio"]', { timeout: 30000 });

const report = {};
const failures = [];

for (const width of WIDTHS) {
  await setViewportWidth(page, width.id);
  const row = {};

  // -- TELEMETRY --
  await selectTemplate(page, "Telemetry");
  await page.waitForSelector('[data-testid="tpl-telemetry"]', { timeout: 15000 });
  row.telemetryRootGrid = await gridOf(page, ".sig-tpl-telemetry");
  row.telemetryGrid = await gridOf(page, ".sig-tpl-telemetry__grid");
  row.kpis = await overlapReport(page, '[data-testid^="tpl-tele-kpi"]');
  row.tiles = await overlapReport(page, ".sig-tpl-telemetry__grid > *");

  // -- SAAS --
  await selectTemplate(page, "SaaS");
  await page.waitForSelector('[data-testid="tpl-saas-features"]', { timeout: 15000 });
  row.saasFeatures = await gridOf(page, ".sig-tpl-saas__features");
  row.saasTiers = await gridOf(page, ".sig-tpl-saas__tiers");

  // -- DOCS --
  await selectTemplate(page, "Docs");
  await page.waitForSelector('[data-testid="tpl-docs-tree"]', { timeout: 15000 });
  row.docsGrid = await gridOf(page, ".sig-tpl-docs__grid");

  row.stageOverflow = await stageOverflow(page);
  report[width.label] = row;
}

await browser.close();

// ---- documentation output (both modes) ----
for (const [width, row] of Object.entries(report)) {
  console.log(`\n== stage ${width} ==`);
  console.log(`  telemetry root grid : ${row.telemetryRootGrid}`);
  console.log(`  telemetry __grid    : ${row.telemetryGrid}`);
  console.log(`  KPI tiles           : ${row.kpis.count} testid tiles, widths [${row.kpis.widths.join(", ")}], overlaps ${JSON.stringify(row.kpis.overlaps)}`);
  console.log(`  all grid tiles      : ${row.tiles.count} children, overlaps ${JSON.stringify(row.tiles.overlaps)}`);
  console.log(`  saas features       : ${row.saasFeatures}`);
  console.log(`  saas tiers          : ${row.saasTiers}`);
  console.log(`  docs grid           : ${row.docsGrid}`);
  console.log(`  stage overflow      : scrollW ${row.stageOverflow.scrollW} vs clientW ${row.stageOverflow.clientW}`);
}

if (BEFORE_MODE) {
  console.log("\n--before mode: measured, NOT asserted (the v3.8.0 baseline documentation run).");
  process.exit(0);
}

// ---- the AFTER assertions ----
const cols = (v) => (v.match(/px/g) ?? []).length; // "220px 496px 200px" → 3 tracks

for (const [width, row] of Object.entries(report)) {
  const n = parseInt(width, 10);

  // (tq1) telemetry: the INNER grid answers with three distinct states.
  if (row.telemetryGrid === "(missing)") {
    failures.push(`(tq1) telemetry __grid missing at stage ${width}`);
  } else {
    const tracks = cols(row.telemetryGrid);
    const expect = n <= 375 ? 1 : n <= 768 ? 6 : 12;
    if (tracks !== expect) {
      failures.push(`(tq1) telemetry __grid at stage ${width}: expected ${expect} tracks, computed ${tracks} (${row.telemetryGrid})`);
    }
  }

  // (tq2) the tiles never collide — asserted over EVERY direct grid
  // child (the 4 KPI tiles + gauges + charts + schedule + ledger);
  // the two testid'd rolling KPIs additionally must be present.
  if (row.kpis.count !== 2) failures.push(`(tq2) expected 2 testid'd KPI tiles at ${width}, found ${row.kpis.count}`);
  if (row.tiles.count !== 10) failures.push(`(tq2) expected 10 telemetry grid children at ${width}, found ${row.tiles.count}`);
  if (row.tiles.overlaps.length > 0) {
    failures.push(`(tq2) telemetry tiles OVERLAP at stage ${width}: ${JSON.stringify(row.tiles.overlaps)}`);
  }
  if (row.kpis.overlaps.length > 0) {
    failures.push(`(tq2) KPI tiles OVERLAP at stage ${width}: ${JSON.stringify(row.kpis.overlaps)} widths [${row.kpis.widths.join(", ")}]`);
  }

  // (tq3) saas: 3-col → 2-col → 1-col.
  const saasTracks = cols(row.saasFeatures);
  const saasExpect = n <= 375 ? 1 : n <= 768 ? 2 : 3;
  if (saasTracks !== saasExpect) {
    failures.push(`(tq3) saas features at stage ${width}: expected ${saasExpect} tracks, computed ${saasTracks} (${row.saasFeatures})`);
  }
  const tiersTracks = cols(row.saasTiers);
  const tiersExpect = n <= 375 ? 1 : n <= 768 ? 2 : 3;
  if (tiersTracks !== tiersExpect) {
    failures.push(`(tq3) saas tiers at stage ${width}: expected ${tiersExpect} tracks, computed ${tiersTracks} (${row.saasTiers})`);
  }

  // (tq4) docs: the 3-track reading grid collapses ≤1023 (the docs
  // template's own container contract, carried over unchanged).
  const docsTracks = cols(row.docsGrid);
  const docsExpect = n < 1024 ? 1 : 3;
  if (docsTracks !== docsExpect) {
    failures.push(`(tq4) docs grid at stage ${width}: expected ${docsExpect} tracks, computed ${docsTracks} (${row.docsGrid})`);
  }

  // (tq5) the stage never overflows horizontally.
  if (row.stageOverflow.scrollW > row.stageOverflow.clientW) {
    failures.push(`(tq5) horizontal overflow at stage ${width}: scrollW ${row.stageOverflow.scrollW} > clientW ${row.stageOverflow.clientW}`);
  }
}

if (failures.length > 0) {
  console.error("\nFAIL — probe-v390-templates");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("\nPASS — probe-v390-templates: the stage reflows at 375/768/1440, tiles disjoint, zero overflow.");
