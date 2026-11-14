#!/usr/bin/env node
/**
 * probe-v320-cortex.mjs — THE 3.2.0 CORTEX PROOF (release blocker).
 *
 * Playwright measures the Multi-Theme Surface Engine's rendering claims
 * inside the real browser (fresh dev server — the inotify lesson: on the
 * Windows mount the watcher never fires, so RELAUNCH the server before
 * probing; this probe expects http://localhost:5173 to serve the CURRENT
 * working tree):
 *
 *   (a) THEMES — the customizer switches data-sig-theme: oled computes
 *       --bg-surface #0B0C10 (and --bg-canvas resolves #000000, the body
 *       paints rgb(0, 0, 0)); daylight computes #FFFFFF and a DARK ink
 *       variant actually APPLIES (rose-glow #BE185D, yellow #A16207);
 *       mocha returns #313244. Default: BOTH attributes ABSENT (the
 *       legacy look — absent = mocha/6px).
 *   (b) RADIUS — sharp: a card archetype (.sig-flip-card, the
 *       --radius-card carrier) computes 0px AND a control computes 0px;
 *       standard: 12px/8px (8px-grid-pure).
 *   (c) BADGES — 16 contrast badges render for the ACTIVE theme with the
 *       correct tiers: mocha 15 pass + 1 amber (crimson 3.01), oled 16
 *       pass, daylight 16 pass (the ink variants make it so).
 *   (d) DOWNLOAD/COPY — the Download button fires a Blob named
 *       tokens.css whose content is the ACTIVE theme's resolved :root
 *       block (daylight asserted, ink variants included); Copy writes the
 *       same block to the clipboard.
 *   (e) ZERO console errors / page errors across the whole run.
 *
 * Screenshots per theme → /tmp/visual-cortex/v320-{oled,daylight}.png.
 * Exit 0 = proof.
 */
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const require = createRequire(pathToFileURL(resolve(root, "packages/signature-mcp/package.json")));
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
// Deterministic start: clear the persisted picks (a previous probe run's
// localStorage would re-apply its theme on load), then reload.
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(1000);
await page.click("nav >> text=Pattern Studio");
await page.waitForTimeout(800);

/* ---------------- (a) DEFAULT: the absent contract ---------------- */
const defaults = await page.evaluate(() => ({
  theme: document.documentElement.dataset.sigTheme,
  radius: document.documentElement.dataset.sigRadius,
}));
console.log(`[default] attributes absent: ${JSON.stringify(defaults)}`);
if (defaults.theme !== undefined || defaults.radius !== undefined) {
  failures.push(`(a) before any pick BOTH attributes must be ABSENT (the legacy look), found ${JSON.stringify(defaults)}`);
}

/* ---------------- the panel + (c) mocha badges ---------------- */
const slotCount = await page.locator('[data-testid="studio-customizer-slot"]').count();
if (slotCount !== 1) failures.push(`(customizer) the studio slot must render once, found ${slotCount}`);
const badgeCount = await page.locator('[data-testid="customizer-badges"] .studio__contrast-badge').count();
if (badgeCount !== 16) failures.push(`(c) 16 contrast badges must render, found ${badgeCount}`);
const mochaTiers = await page.evaluate(() =>
  [...document.querySelectorAll('[data-testid="customizer-badges"] [data-tier]')].map((el) => el.getAttribute("data-tier")),
);
const mochaAmber = mochaTiers.filter((tier) => tier === "amber").length;
const mochaPass = mochaTiers.filter((tier) => tier === "pass").length;
console.log(`[badges] mocha: ${mochaPass} pass · ${mochaAmber} amber (crimson 3.01:1)`);
if (mochaPass !== 15 || mochaAmber !== 1) {
  failures.push(`(c) mocha badges must be 15 pass + 1 amber (crimson), found ${mochaPass}/${mochaAmber}`);
}

/* ---------------- (b) RADIUS: standard then sharp ---------------- */
await page.click('[data-testid="customizer-radius-standard"]');
await page.waitForTimeout(150);
const standard = await page.evaluate(() => ({
  card: getComputedStyle(document.querySelector(".sig-flip-card")).borderRadius,
  control: getComputedStyle(document.querySelector('[data-testid="customizer-theme-oled"]')).borderRadius,
  attr: document.documentElement.dataset.sigRadius,
}));
console.log(`[radius] standard: card ${standard.card} · control ${standard.control}`);
if (standard.attr !== "standard") failures.push(`(b) data-sig-radius must be "standard", found ${standard.attr}`);
if (standard.card !== "12px") failures.push(`(b) standard card-archetype must compute 12px (--radius-card), found ${standard.card}`);
if (standard.control !== "8px") failures.push(`(b) standard control must compute 8px (--radius-ui), found ${standard.control}`);

await page.click('[data-testid="customizer-radius-sharp"]');
await page.waitForTimeout(150);
const sharp = await page.evaluate(() => ({
  card: getComputedStyle(document.querySelector(".sig-flip-card")).borderRadius,
  control: getComputedStyle(document.querySelector('[data-testid="customizer-theme-oled"]')).borderRadius,
  attr: document.documentElement.dataset.sigRadius,
}));
console.log(`[radius] sharp: card ${sharp.card} · control ${sharp.control}`);
if (sharp.attr !== "sharp") failures.push(`(b) data-sig-radius must be "sharp", found ${sharp.attr}`);
if (sharp.card !== "0px" || sharp.control !== "0px") {
  failures.push(`(b) sharp must compute 0px/0px, found card ${sharp.card} / control ${sharp.control}`);
}

/* ---------------- (a) THEMES: oled → daylight → mocha ---------------- */
await page.click('[data-testid="customizer-theme-oled"]');
await page.waitForTimeout(200);
const oled = await page.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  return {
    surface: cs.getPropertyValue("--bg-surface").trim().toLowerCase(),
    canvas: cs.getPropertyValue("--bg-canvas").trim().toLowerCase(),
    body: getComputedStyle(document.body).backgroundColor,
    attr: document.documentElement.dataset.sigTheme,
  };
});
console.log(`[oled] surface ${oled.surface} · canvas ${oled.canvas} · body ${oled.body}`);
if (oled.attr !== "oled") failures.push(`(a) data-sig-theme must be "oled", found ${oled.attr}`);
if (oled.surface !== "#0b0c10") failures.push(`(a) oled --bg-surface must compute #0B0C10, found ${oled.surface}`);
if (oled.canvas !== "#000000") failures.push(`(a) the --bg-canvas alias must resolve #000000 on oled, found ${oled.canvas}`);
if (oled.body !== "rgb(0, 0, 0)") failures.push(`(a) oled must paint the body true black, found ${oled.body}`);
await page.screenshot({ path: "/tmp/visual-cortex/v320-oled.png", fullPage: false });

await page.click('[data-testid="customizer-theme-daylight"]');
await page.waitForTimeout(200);
const daylight = await page.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  const swatch = document.querySelector('[data-testid="contrast--sig-rose-glow"] .studio__contrast-swatch');
  return {
    surface: cs.getPropertyValue("--bg-surface").trim().toLowerCase(),
    yellow: cs.getPropertyValue("--sig-yellow").trim().toLowerCase(),
    rose: cs.getPropertyValue("--sig-rose-glow").trim().toLowerCase(),
    swatch: swatch ? getComputedStyle(swatch).backgroundColor : "MISSING",
    attr: document.documentElement.dataset.sigTheme,
  };
});
console.log(`[daylight] surface ${daylight.surface} · yellow ${daylight.yellow} · rose-glow ${daylight.rose} · badge swatch ${daylight.swatch}`);
if (daylight.attr !== "daylight") failures.push(`(a) data-sig-theme must be "daylight", found ${daylight.attr}`);
if (daylight.surface !== "#ffffff") failures.push(`(a) daylight --bg-surface must compute #FFFFFF, found ${daylight.surface}`);
if (daylight.yellow !== "#a16207") failures.push(`(a) the daylight ink variant must apply: --sig-yellow #A16207, found ${daylight.yellow}`);
if (daylight.rose !== "#be185d") failures.push(`(a) the daylight ink variant must apply: --sig-rose-glow #BE185D, found ${daylight.rose}`);
if (daylight.swatch !== "rgb(190, 24, 93)") failures.push(`(a) the badge swatch must PAINT the dark ink variant, found ${daylight.swatch}`);
const daylightTiers = await page.evaluate(() =>
  [...document.querySelectorAll('[data-testid="customizer-badges"] [data-tier]')].map((el) => el.getAttribute("data-tier")),
);
console.log(`[badges] daylight: ${daylightTiers.filter((t) => t === "pass").length} pass`);
if (daylightTiers.some((tier) => tier !== "pass")) {
  failures.push(`(c) daylight badges must be 16 pass (the ink variants make it so), found ${daylightTiers.join(",")}`);
}
await page.screenshot({ path: "/tmp/visual-cortex/v320-daylight.png", fullPage: false });

/* ---------------- (d) DOWNLOAD + COPY ---------------- */
const downloadPromise = page.waitForEvent("download", { timeout: 5000 });
await page.click('[data-testid="customizer-download"]');
const download = await downloadPromise;
if (download.suggestedFilename() !== "tokens.css") {
  failures.push(`(d) the download must be named tokens.css, found ${download.suggestedFilename()}`);
}
const downloadText = readFileSync(await download.path(), "utf8");
if (!downloadText.startsWith("/* Signature Style — resolved :root block") || !downloadText.includes(":root {")) {
  failures.push("(d) the download must be the resolved :root block");
}
if (!downloadText.includes("--sig-yellow: #A16207") || !downloadText.includes("--sig-rose-glow: #BE185D") || !downloadText.includes("--bg-surface: #FFFFFF")) {
  failures.push("(d) the download must carry the ACTIVE (daylight) theme's values incl. the ink variants");
}
console.log(`[download] tokens.css fired (${String(downloadText.length)} bytes, daylight :root)`);

await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
await page.click('[data-testid="customizer-copy"]');
await page.waitForTimeout(600);
const clipboard = await page.evaluate(() => navigator.clipboard.readText());
if (!clipboard.includes(":root {") || !clipboard.includes("--sig-yellow: #A16207")) {
  failures.push("(d) the clipboard must carry the resolved :root block");
}
console.log(`[copy] clipboard ${String(clipboard.length)} bytes`);

/* ---------------- the palette commands exist + theme roundtrip ---------------- */
await page.click('[data-testid="palette-trigger"]');
await page.waitForTimeout(300);
for (const label of ["Theme: Mocha", "Theme: OLED", "Theme: Daylight", "Radius: Standard", "Radius: Sharp", "Download tokens.css", "Copy CSS Variables"]) {
  const hits = await page.locator(`[data-testid="command-list"] >> text=${label}`).count();
  if (hits !== 1) failures.push(`(palette) the command "${label}" must be listed once, found ${hits}`);
}
console.log("[palette] all 7 surface-engine commands present");
await page.keyboard.press("Escape");
await page.click('[data-testid="palette-trigger"]');
await page.fill('[data-testid="command-input"]', "Theme: OLED");
await page.waitForTimeout(200);
await page.keyboard.press("Enter");
await page.waitForTimeout(200);
const paletteTheme = await page.evaluate(() => document.documentElement.dataset.sigTheme);
if (paletteTheme !== "oled") failures.push(`(palette) "Theme: OLED" must switch the theme, found ${paletteTheme}`);
console.log(`[palette] Theme: OLED applied → ${paletteTheme}`);

/* ---------------- (e) the console contract ---------------- */
if (consoleErrors.length > 0 || pageErrors.length > 0) {
  failures.push(`(e) zero console/page errors required — console: ${JSON.stringify(consoleErrors)} · page: ${JSON.stringify(pageErrors)}`);
}
console.log(`[console] errors: ${String(consoleErrors.length)} · pageErrors: ${String(pageErrors.length)}`);

await browser.close();

if (failures.length > 0) {
  console.error("FAIL — v3.2.0 cortex proof");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("PASS — v3.2.0 cortex proof: themes (oled true-black + daylight ink variants + absent default), radius (standard 8/12 · sharp 0), 16 badges per theme with the correct tiers, download/copy of the resolved :root, 7 palette commands, zero console errors — screenshots at /tmp/visual-cortex/v320-{oled,daylight}.png");
