#!/usr/bin/env node
/**
 * verify-visual-diff.mjs — THE PIXEL-DIFF CERTIFICATION (3.5.0).
 *
 * Golden-master screenshots of the 5 real views at a pinned 1440×900
 * full-page viewport (the 4-viewport responsive job belongs to the MCP
 * capture_viewport_matrix tool; THIS gate pins one deterministic
 * geometry so pixel comparison is meaningful):
 *
 *   dashboard       →  /            (Live Bento)
 *   pattern-studio  →  #/studio     (Pattern Studio, default set)
 *   master-index    →  #/index      (Master Index catalog)
 *   chronicle       →  #/chronicle  (release chronicle)
 *   codex           →  #/codex      (AI Codex)
 *
 * DETERMINISM HARDENING:
 *   - emulateMedia({ reducedMotion: "reduce" }) — the app honors the
 *     media query (the (h1)/(a3) doctrine), so shimmer/stagger FREEZE
 *     instead of racing the shutter;
 *   - screenshot({ animations: "disabled" }) — Playwright's own
 *     animation kill as a second belt;
 *   - no input is ever focused (no blinking caret in the goldens);
 *   - settle 800ms after networkidle before the shutter;
 *   - consistent system font stacks (same machine — see the font-risk
 *     note below).
 *
 * Goldens live at scripts/goldens/<view>.png and are COMMITTED to git
 * (the baselines). Compare mode uses pixelmatch with a maxDiffPixels
 * tolerance of 0.1% of total pixels (fonts/antialiasing headroom) and
 * reports the per-view diff %.
 *
 * FONT RISK (honest): pixel goldens are machine-dependent — a different
 * OS/font stack rasterizes text differently. The CI job therefore runs
 * this gate with continue-on-error: true until goldens are regenerated
 * ON the CI runner class; LOCAL runs are the strict gate.
 *
 * Usage:
 *   node scripts/verify-visual-diff.mjs                    (compare)
 *   node scripts/verify-visual-diff.mjs --update-snapshots (regenerate)
 *
 * FIRST RUN: with no goldens on disk the gate generates them, prints
 * "goldens created (baseline)" and PASSES (baseline mode) — the gate is
 * green on first adoption. Subsequent runs compare.
 *
 * Requires the dev server on http://localhost:5173 (`npm run playground`).
 * Exit 0 = ALL PASS (or baseline created); exit 1 = any view over tolerance.
 */
import { chromium } from "playwright";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const GOLDENS_DIR = resolve(root, "scripts", "goldens");
const URL_BASE = "http://localhost:5173";
const WIDTH = 1440;
const HEIGHT = 900;
const SETTLE_MS = 800;
/** Tolerance: 0.1% of total pixels (fonts/antialiasing headroom). */
const TOLERANCE = 0.001;

/** The 5 certified views: name → deep link (the hash bootstrap lands cold). */
const VIEWS = [
  { name: "dashboard", hash: "" },
  { name: "pattern-studio", hash: "#/studio" },
  { name: "master-index", hash: "#/index" },
  { name: "chronicle", hash: "#/chronicle" },
  { name: "codex", hash: "#/codex" },
];

const updateMode = process.argv.includes("--update-snapshots");

const devServerUp = await fetch(URL_BASE)
  .then((r) => r.ok)
  .catch(() => false);
if (!devServerUp) {
  console.error(`FAIL — dev server dead at ${URL_BASE} — run \`npm run playground\``);
  process.exit(1);
}

/**
 * Capture one view as a deterministic full-page PNG buffer.
 *
 * Args:
 *   browser: The launched Playwright browser.
 *   hash:    The view's deep-link hash ("" for the dashboard).
 *
 * Returns:
 *   { buffer, bytes } — the raw PNG.
 */
async function captureView(browser, hash) {
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    reducedMotion: "reduce",
  });
  try {
    await page.goto(`${URL_BASE}/${hash}`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(SETTLE_MS);
    const buffer = await page.screenshot({ fullPage: true, type: "png", animations: "disabled" });
    return buffer;
  } finally {
    await page.close();
  }
}

mkdirSync(GOLDENS_DIR, { recursive: true });
const missing = VIEWS.filter((v) => !existsSync(resolve(GOLDENS_DIR, `${v.name}.png`)));

const browser = await chromium.launch({ headless: true });
try {
  // ---- BASELINE MODE: any golden missing → generate the missing set, PASS ----
  if (missing.length > 0) {
    for (const view of missing) {
      const buffer = await captureView(browser, view.hash);
      writeFileSync(resolve(GOLDENS_DIR, `${view.name}.png`), buffer);
      console.log(`  created scripts/goldens/${view.name}.png (${buffer.length} bytes)`);
    }
    console.log(`goldens created (baseline) — ${missing.length} of ${VIEWS.length} views; commit scripts/goldens/ and re-run to compare`);
    process.exit(0);
  }

  // ---- COMPARE MODE ----
  if (updateMode) {
    for (const view of VIEWS) {
      const buffer = await captureView(browser, view.hash);
      writeFileSync(resolve(GOLDENS_DIR, `${view.name}.png`), buffer);
      console.log(`  regenerated scripts/goldens/${view.name}.png (${buffer.length} bytes)`);
    }
    console.log(`goldens regenerated (--update-snapshots) — commit the new baselines with an explicit intent message`);
    process.exit(0);
  }

  const failures = [];
  console.log(`VIEW            ${"DIFF %".padStart(8)}  ${"DIFF PX".padStart(9)}  tolerance  verdict`);
  console.log("-".repeat(58));
  for (const view of VIEWS) {
    const goldenPath = resolve(GOLDENS_DIR, `${view.name}.png`);
    const golden = PNG.sync.read(readFileSync(goldenPath));
    const current = PNG.sync.read(await captureView(browser, view.hash));
    if (golden.width !== current.width || golden.height !== current.height) {
      failures.push(`(${view.name}) dimensions changed — golden ${golden.width}x${golden.height} vs current ${current.width}x${current.height} (the view's structure changed; regenerate intentionally with --update-snapshots)`);
      console.log(`${view.name.padEnd(15)} ${"—".padStart(8)}  ${"—".padStart(9)}  —          DIMENSION MISMATCH`);
      continue;
    }
    const total = golden.width * golden.height;
    const maxDiffPixels = Math.ceil(total * TOLERANCE);
    const diff = new PNG({ width: golden.width, height: golden.height });
    // threshold 0.05 — HALF the pixelmatch default. The negative proof
    // (restore-verified) found the default 0.1's YIQ perceptual dead-zone
    // swallows a UNIFORM ~10%-luminance theme shift (#313244 → #4A4A66,
    // 66% of pixels at 0.05 → exactly 0 flagged pixels at 0.1). A token
    // certification must see a whole-theme shift; 0.05 still suppresses
    // sub-5% antialiasing jitter, and the 0.1% maxDiffPixels cap stays.
    const diffPixels = pixelmatch(golden.data, current.data, diff.data, golden.width, golden.height, {
      threshold: 0.05,
    });
    const diffPct = (diffPixels / total) * 100;
    const pass = diffPixels <= maxDiffPixels;
    console.log(`${view.name.padEnd(15)} ${diffPct.toFixed(4).padStart(8)}  ${String(diffPixels).padStart(9)}  ${String(maxDiffPixels).padEnd(9)}  ${pass ? "PASS" : "FAIL"}`);
    if (!pass) {
      failures.push(`(${view.name}) diff ${diffPixels}px > tolerance ${maxDiffPixels}px (${diffPct.toFixed(4)}% > 0.1%) — the render changed visually; if INTENTIONAL, re-run with --update-snapshots and commit the baselines`);
    }
  }

  console.log("");
  if (failures.length > 0) {
    console.error("FAIL — visual-diff certification");
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
  }
  console.log(`PASS — visual-diff certification: all ${VIEWS.length} golden masters within 0.1% (${WIDTH}x${HEIGHT} full-page, reduced-motion + animations-disabled + 800ms settle)`);
} finally {
  await browser.close();
}
