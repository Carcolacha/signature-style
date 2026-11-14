#!/usr/bin/env node
/**
 * verify-wc.mjs — the verify:wc gate (3.4.0 "Zero-React Native Web
 * Components"). The WC release blocker.
 *
 * Asserts:
 *   (w1) dist/wc/signature-wc.es.js EXISTS and contains ZERO react /
 *        react-dom imports (grep counts of the import/require spellings
 *        are exactly 0) — the ZERO-REACT contract on the shipped bundle;
 *   (w2) package.json exports["./wc"] resolves: every condition
 *        (types/import/default) names a file that exists on disk;
 *   (w3) the wc/src SOURCES carry no react imports either (the sources
 *        are the audit surface; the bundle is the proof);
 *   (w4) all six customElements.define names appear in the dist bundle:
 *        sig-surface-card, sig-badge, sig-progress-bar, sig-stat-ring,
 *        sig-callout, sig-carousel;
 *   (w5) the packed tarball carries the dist/wc quartet
 *        (signature-wc.es.js + index.d.ts + base.d.ts + elements.d.ts);
 *   (wc-proof) THE PLAYWRIGHT RENDER PROOF: a vanilla fixture page
 *        generated in /tmp (NO build step: <link> to css/tokens.css +
 *        <script type="module" src="dist/wc/signature-wc.es.js"> +
 *        instances of all six elements with attributes) must render —
 *          · every element upgrades (customElements.get + shadowRoot
 *            populated);
 *          · sig-progress-bar fill width ≈ value/max and aria-valuenow
 *            matches;
 *          · sig-stat-ring readout reads "85%" and CHANGES to "40%"
 *            after setAttribute("value", "40") — the stroke-dashoffset
 *            transition is present (computed style) and the arc settles
 *            at the new geometry (smooth reactive value change);
 *          · sig-surface-card shadow carries the title + the 2px accent
 *            underline (peach #fe640b) + the floating-tier shadow;
 *          · sig-carousel grows 3 dots from the slotchange count and the
 *            indicator reads "1 / 3";
 *          · sig-callout paints the warning peach strip; sig-badge
 *            renders its label pill;
 *          · a full-page screenshot is written to
 *            /tmp/visual-cortex/wc-proof.png.
 *
 * The fixture loads the module from file:// — Chromium blocks cross-
 * origin module fetches from an opaque file origin, so the launch adds
 * --allow-file-access-from-files (sandbox still on; local files only).
 *
 * Exit 0 = ALL PASS (release gate). Exit 1 = failures listed.
 */
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync, mkdtempSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const failures = [];
/** Record a failure under a gate label. */
function fail(label, message) {
  failures.push(`(${label}) ${message}`);
}

/* ---- (w1) the shipped bundle is zero-react --------------------------------- */
const bundlePath = resolve(root, "dist/wc/signature-wc.es.js");
if (!existsSync(bundlePath)) {
  fail("w1", "dist/wc/signature-wc.es.js is missing — run `npm run build:wc`");
}
let bundle = "";
if (bundle !== "") {
  // already handled below
}
try {
  bundle = readFileSync(bundlePath, "utf8");
} catch (error) {
  fail("w1", `cannot read dist/wc/signature-wc.es.js — ${error instanceof Error ? error.message : String(error)}`);
}
if (bundle !== "") {
  const reactPatterns = [
    /from\s+["']react["']/g,
    /from\s+["']react-dom[/"']/g,
    /require\(\s*["']react["']\s*\)/g,
    /require\(\s*["']react-dom/g,
  ];
  const names = ["react import", "react-dom import", "react require", "react-dom require"];
  reactPatterns.forEach((pattern, index) => {
    const count = (bundle.match(pattern) ?? []).length;
    if (count !== 0) fail("w1", `dist/wc/signature-wc.es.js carries ${count} ${names[index]} — the WC bundle must be ZERO-REACT`);
  });
}

/* ---- (w2) the exports map resolves ----------------------------------------- */
let pkg = null;
try {
  pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
} catch (error) {
  fail("w2", `cannot read package.json — ${error instanceof Error ? error.message : String(error)}`);
}
if (pkg !== null) {
  const wcExport = pkg.exports?.["./wc"];
  if (wcExport === undefined || wcExport === null || typeof wcExport !== "object" || Array.isArray(wcExport)) {
    fail("w2", 'package.json exports["./wc"] must be the condition object (types/import/default)');
  } else {
    for (const [condition, target] of Object.entries(wcExport)) {
      if (typeof target !== "string" || !existsSync(resolve(root, target))) {
        fail("w2", `exports["./wc"].${condition} does not resolve: ${JSON.stringify(target)}`);
      }
    }
  }
}

/* ---- (w3) the sources are zero-react --------------------------------------- */
const wcFiles = ["wc/src/base.ts", "wc/src/elements.ts", "wc/src/index.ts"];
for (const file of wcFiles) {
  const srcPath = resolve(root, file);
  if (!existsSync(srcPath)) {
    fail("w3", `${file} is missing`);
    continue;
  }
  const src = readFileSync(srcPath, "utf8");
  if (/from\s+["']react|require\(\s*["']react/.test(src)) {
    fail("w3", `${file} carries a react import — wc/ imports NOTHING from react`);
  }
  if (/from\s+["']lit|from\s+["']@lit/.test(src)) {
    fail("w3", `${file} carries a lit import — zero deps: plain HTMLElement + the settled shadow API`);
  }
}

/* ---- (w4) the six define names ship in the bundle --------------------------- */
const ELEMENT_NAMES = ["sig-surface-card", "sig-badge", "sig-progress-bar", "sig-stat-ring", "sig-callout", "sig-carousel"];
if (bundle !== "") {
  for (const name of ELEMENT_NAMES) {
    if (!bundle.includes(`"${name}"`)) {
      fail("w4", `dist/wc/signature-wc.es.js does not define "${name}"`);
    }
  }
  if (!bundle.includes("customElements.define")) {
    fail("w4", "dist/wc/signature-wc.es.js carries no customElements.define call");
  }
}

/* ---- (w5) the tarball carries the dist/wc quartet --------------------------- */
if (failures.length === 0) {
  const packDir = mkdtempSync(join(tmpdir(), "sig-wc-pack-"));
  try {
    const packed = spawnSync("npm", ["pack", "--pack-destination", packDir], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    if (packed.status !== 0) {
      fail("w5", `npm pack exited ${packed.status}: ${(packed.stderr ?? "").slice(0, 200)}`);
    } else {
      const tgz = (packed.stdout ?? "").trim().split("\n").pop() ?? "";
      const tgzPath = join(packDir, tgz);
      const listed = spawnSync("tar", ["-tzf", tgzPath], { encoding: "utf8" });
      const entries = (listed.stdout ?? "").split("\n");
      for (const required of [
        "package/dist/wc/signature-wc.es.js",
        "package/dist/wc/index.d.ts",
        "package/dist/wc/base.d.ts",
        "package/dist/wc/elements.d.ts",
      ]) {
        if (!entries.includes(required)) fail("w5", `tarball is missing ${required}`);
      }
      // The wc/src SOURCES must NOT ship (the react .tsx precedent).
      const sourceShipped = entries.filter((entry) => entry.startsWith("package/wc/"));
      if (sourceShipped.length > 0) {
        fail("w5", `tarball must exclude wc/src (the compiled artifacts ship): ${sourceShipped.join(", ")}`);
      }
    }
  } finally {
    rmSync(packDir, { recursive: true, force: true });
  }
}

/* ---- (wc-proof) the Playwright render proof --------------------------------- */
/** The assertions evaluated INSIDE the page (must stay dependency-free). */
function pageAssertions() {
  const $ = (selector) => {
    const el = document.querySelector(selector);
    if (el === null) throw new Error(`fixture element missing: ${selector}`);
    return el;
  };
  const results = {};
  const names = ["sig-surface-card", "sig-badge", "sig-progress-bar", "sig-stat-ring", "sig-callout", "sig-carousel"];
  results.defined = names.map((name) => (customElements.get(name) ? true : false));
  results.shadows = names.map((name) => {
    const el = $(name);
    return el.shadowRoot !== null && el.shadowRoot.childElementCount > 0;
  });

  // (a) progress: fill width ratio + aria.
  const progress = $("sig-progress-bar");
  const track = progress.shadowRoot.querySelector(".track");
  const fill = progress.shadowRoot.querySelector(".fill");
  const trackWidth = track.getBoundingClientRect().width;
  const fillWidth = fill.getBoundingClientRect().width;
  results.progressRatio = trackWidth > 0 ? fillWidth / trackWidth : -1;
  results.progressAriaNow = progress.getAttribute("aria-valuenow");

  // (b) ring: readout, transition presence. (The REACTIVE value change
  // is asserted in a second evaluate below — the re-render is a
  // debounced microtask, so it must be awaited, not read inline.)
  const ring = $("sig-stat-ring");
  const ringShadow = ring.shadowRoot;
  results.ringText = ringShadow.querySelector("text")?.textContent ?? "";
  results.ringAriaNow = ring.getAttribute("aria-valuenow");
  const arc = ringShadow.querySelector(".arc");
  results.ringTransition = arc === null ? "" : getComputedStyle(arc).transitionProperty;
  results.ringOffsetBefore = arc === null ? -1 : Number(arc.getAttribute("stroke-dashoffset"));

  // (c) surface card: title, accent underline, floating shadow.
  const card = $("sig-surface-card");
  const cardShadow = card.shadowRoot;
  const title = cardShadow.querySelector(".title");
  results.cardTitle = title?.textContent ?? "";
  results.cardUnderline = title === null ? "" : getComputedStyle(title).borderBottomColor;
  results.cardUnderlineWidth = title === null ? "" : getComputedStyle(title).borderBottomWidth;
  const cardBox = cardShadow.querySelector(".card");
  results.cardShadowTier = cardBox === null ? "" : getComputedStyle(cardBox).boxShadow.slice(0, 40);
  results.cardElevationAttr = cardBox?.getAttribute("data-elevation-equivalent") ?? "";
  results.cardSlotAssigned = cardShadow.querySelector("slot")?.assignedNodes().length ?? -1;

  // (d) carousel: dots from slotchange + indicator.
  const carousel = $("sig-carousel");
  const carouselShadow = carousel.shadowRoot;
  results.carouselDots = carouselShadow.querySelectorAll(".dot").length;
  results.carouselIndicator = carouselShadow.querySelector(".indicator")?.textContent ?? "";
  results.carouselTrackTabbable = carouselShadow.querySelector(".track")?.getAttribute("tabindex");

  // (e) callout: warning strip.
  const callout = $("sig-callout");
  const note = callout.shadowRoot.querySelector(".callout");
  results.calloutStrip = note === null ? "" : getComputedStyle(note).borderLeftColor;

  // (f) badge: label pill.
  const badge = $("sig-badge");
  results.badgeText = badge.shadowRoot.querySelector(".pill")?.textContent ?? "";

  return results;
}

if (failures.length === 0) {
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    ({ chromium } = await import("playwright-core"));
  }
  const fixtureDir = "/tmp/sig-wc-fixture";
  mkdirSync(fixtureDir, { recursive: true });
  const bundleUrl = `file://${bundlePath}`;
  const tokensUrl = `file://${resolve(root, "css/tokens.css")}`;
  writeFileSync(
    join(fixtureDir, "index.html"),
    `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>signature-wc render proof</title>
  <link rel="stylesheet" href="${tokensUrl}" />
  <style>
    body { background: var(--bg-base); color: var(--text-main); padding: 32px; display: grid; gap: 24px; max-width: 720px; margin: 0 auto; font-family: system-ui, sans-serif; }
    .row { display: flex; gap: 16px; align-items: center; }
    sig-carousel > div { min-width: 200px; padding: 16px; background: var(--bg-surface); border: 1px solid color-mix(in srgb, var(--text-muted) 15%, transparent); }
  </style>
  <script type="module" src="${bundleUrl}"></script>
</head>
<body>
  <sig-surface-card eyebrow="Telemetry" meta="wc/elements.ts" title="WC Proof" accent-token="--sig-peach" elevation="floating" interactive>
    <p style="margin:0">Shadow-DOM body content rides the default slot.</p>
  </sig-surface-card>
  <div class="row">
    <sig-badge label="Live" variant="green"></sig-badge>
    <sig-badge label="Info" accent-token="--sig-sky"></sig-badge>
  </div>
  <sig-progress-bar value="70" max="100" label="Render proof" limit-text="70 / 100" accent-token="--sig-cobalt"></sig-progress-bar>
  <sig-stat-ring value="85" size="120" accent-token="--sig-cobalt" show-value="true"></sig-stat-ring>
  <sig-callout status="warning">3 pending responses close Friday.</sig-callout>
  <sig-carousel mode="free">
    <div>Item one</div>
    <div>Item two</div>
    <div>Item three</div>
  </sig-carousel>
</body>
</html>
`,
  );

  let browser = null;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--allow-file-access-from-files"],
    });
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`file://${join(fixtureDir, "index.html")}`);
    await page.waitForFunction(
      () => document.querySelector("sig-surface-card")?.shadowRoot?.childElementCount > 0,
      undefined,
      { timeout: 10000 },
    );
    const r = await page.evaluate(pageAssertions);

    // THE REACTIVE VALUE CHANGE — fire the attribute, AWAIT the debounced
    // microtask render, then read the settled geometry.
    await page.evaluate(() => document.querySelector("sig-stat-ring").setAttribute("value", "40"));
    await page.waitForFunction(
      () => document.querySelector("sig-stat-ring")?.shadowRoot?.querySelector("text")?.textContent === "40%",
      undefined,
      { timeout: 3000 },
    ).catch(() => {});
    const ringAfter = await page.evaluate(() => {
      const shadow = document.querySelector("sig-stat-ring")?.shadowRoot;
      return {
        text: shadow?.querySelector("text")?.textContent ?? "",
        ariaNow: document.querySelector("sig-stat-ring")?.getAttribute("aria-valuenow") ?? "",
        offset: Number(shadow?.querySelector(".arc")?.getAttribute("stroke-dashoffset") ?? -1),
      };
    });
    r.ringTextAfter = ringAfter.text;
    r.ringAriaNowAfter = ringAfter.ariaNow;
    r.ringOffsetAfter = ringAfter.offset;

    const expectDefined = true;
    if (r.defined.some((registered) => registered !== expectDefined)) {
      fail("wc-proof", `not all six elements are registered: ${JSON.stringify(r.defined)}`);
    }
    if (r.shadows.some((up) => up !== true)) {
      fail("wc-proof", `not every element has a populated shadowRoot: ${JSON.stringify(r.shadows)}`);
    }
    if (Math.abs(r.progressRatio - 0.7) > 0.01) {
      fail("wc-proof", `progress fill ratio must be ≈0.70 for value=70/max=100, got ${r.progressRatio.toFixed(3)}`);
    }
    if (r.progressAriaNow !== "70") {
      fail("wc-proof", `progress aria-valuenow must be "70", got ${JSON.stringify(r.progressAriaNow)}`);
    }
    if (r.ringText !== "85%") {
      fail("wc-proof", `stat ring readout must read "85%", got ${JSON.stringify(r.ringText)}`);
    }
    if (r.ringAriaNow !== "85") {
      fail("wc-proof", `stat ring aria-valuenow must be "85", got ${JSON.stringify(r.ringAriaNow)}`);
    }
    if (!String(r.ringTransition).includes("stroke-dashoffset")) {
      fail("wc-proof", `stat ring arc must transition stroke-dashoffset, computed: ${JSON.stringify(r.ringTransition)}`);
    }
    const C = 2 * Math.PI * 44;
    if (Math.abs(r.ringOffsetBefore - C * 0.15) > 1) {
      fail("wc-proof", `ring dashoffset at 85% must be ≈${(C * 0.15).toFixed(2)}, got ${r.ringOffsetBefore}`);
    }
    if (r.ringTextAfter !== "40%") {
      fail("wc-proof", `stat ring readout must CHANGE to "40%" after setAttribute("value","40"), got ${JSON.stringify(r.ringTextAfter)}`);
    }
    if (r.ringAriaNowAfter !== "40") {
      fail("wc-proof", `stat ring aria-valuenow must follow to "40", got ${JSON.stringify(r.ringAriaNowAfter)}`);
    }
    // The arc settles at the new geometry (the smooth transition ran).
    await page.waitForFunction(
      () => {
        const arc = document.querySelector("sig-stat-ring")?.shadowRoot?.querySelector(".arc");
        if (arc === null) return false;
        const offset = Number(arc.getAttribute("stroke-dashoffset"));
        return Math.abs(offset - 2 * Math.PI * 44 * 0.6) < 1;
      },
      undefined,
      { timeout: 3000 },
    ).catch(() => {
      fail("wc-proof", `ring arc did not settle at the 40% geometry (offset ${r.ringOffsetAfter})`);
    });

    if (r.cardTitle !== "WC Proof") {
      fail("wc-proof", `surface card shadow title must be "WC Proof", got ${JSON.stringify(r.cardTitle)}`);
    }
    // --sig-peach in mocha = #fe640b → rgb(254, 100, 11).
    if (r.cardUnderline !== "rgb(254, 100, 11)") {
      fail("wc-proof", `surface card accent underline must be peach rgb(254, 100, 11), got ${JSON.stringify(r.cardUnderline)}`);
    }
    if (r.cardUnderlineWidth !== "2px") {
      fail("wc-proof", `surface card accent underline must be the 2px rule, got ${JSON.stringify(r.cardUnderlineWidth)}`);
    }
    if (r.cardShadowTier === "" || r.cardShadowTier === "none") {
      fail("wc-proof", `surface card must wear the sanctioned elevation shadow, got ${JSON.stringify(r.cardShadowTier)}`);
    }
    if (r.cardElevationAttr !== "floating") {
      fail("wc-proof", `surface card data-elevation-equivalent must be "floating", got ${JSON.stringify(r.cardElevationAttr)}`);
    }
    if (r.cardSlotAssigned < 1) {
      fail("wc-proof", `surface card slot must carry the light-DOM body, assigned ${r.cardSlotAssigned}`);
    }
    if (r.carouselDots !== 3) {
      fail("wc-proof", `carousel must grow 3 dots from the slotchange count, got ${r.carouselDots}`);
    }
    if (r.carouselIndicator !== "1 / 3") {
      fail("wc-proof", `carousel indicator must read "1 / 3", got ${JSON.stringify(r.carouselIndicator)}`);
    }
    if (r.carouselTrackTabbable !== "0") {
      fail("wc-proof", `carousel track must be keyboard-reachable (tabindex 0), got ${JSON.stringify(r.carouselTrackTabbable)}`);
    }
    if (r.calloutStrip !== "rgb(254, 100, 11)") {
      fail("wc-proof", `warning callout strip must be peach rgb(254, 100, 11), got ${JSON.stringify(r.calloutStrip)}`);
    }
    if (r.badgeText !== "Live") {
      fail("wc-proof", `badge pill must render the label "Live", got ${JSON.stringify(r.badgeText)}`);
    }

    mkdirSync("/tmp/visual-cortex", { recursive: true });
    const shotPath = "/tmp/visual-cortex/wc-proof.png";
    await page.screenshot({ path: shotPath, fullPage: true });
    if (statSync(shotPath).size === 0) {
      fail("wc-proof", `screenshot written empty: ${shotPath}`);
    }
  } catch (error) {
    fail("wc-proof", `render proof crashed — ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    if (browser !== null) await browser.close().catch(() => {});
  }
}

/* ---- verdict ---------------------------------------------------------------- */
if (failures.length > 0) {
  console.error("");
  console.error("FAIL — verify:wc (the zero-react WC gate)");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log(
  "PASS — verify:wc: (w1) zero-react bundle · (w2) ./wc exports resolve · (w3) sources zero-react · (w4) six defines in dist · (w5) tarball ships the dist/wc quartet (sources excluded) · (wc-proof) six elements render in vanilla HTML — reactive 85%→40% ring transition, 70% fill, accent underline, slot dots, screenshot /tmp/visual-cortex/wc-proof.png",
);
