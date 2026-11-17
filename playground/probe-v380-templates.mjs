#!/usr/bin/env node
/**
 * probe-v380-templates.mjs — THE CORTEX PROOF for v3.8.0 "Full-Page
 * Layout Templates, Interactive Viewport Previewer & CLI Template
 * Expansion" (the release-blocker probe, the v3.2.0/v3.7.0 probe
 * precedent).
 *
 * Prerequisite: the dev server on http://localhost:5173 (npm run
 * playground). Asserts:
 *
 *   (a) the Templates Studio is navigable (#/templates), the hero
 *       speaks, and the studio mounts: control bar + FLIP template
 *       tabs + stage, with the SaaS Landing mounted live by default;
 *   (b) template switching — tab 02 mounts the Docs Reader, tab 03 the
 *       Telemetry Center, tab 01 back to the SaaS Landing;
 *   (c) the viewport emulator — Tablet pins the stage to 768px, Mobile
 *       to 375px, Desktop back to full width (the width transition is
 *       allowed to settle);
 *   (d) the emulator GENUINELY reflows the template: at Mobile the
 *       SaaS tier grid + feature grid collapse to ONE column (the
 *       container queries answer the stage, not the window);
 *   (e) the SCOPED theme switcher — OLED sets data-sig-theme="oled" on
 *       the stage wrapper and its computed --bg-base becomes #000000
 *       while the document root keeps #1E1E2E (the preview is scoped
 *       to the stage); Daylight → #F8FAFC; Mocha removes the attribute;
 *   (f) Preview ↔ Full TSX Code — Code renders the registry source
 *       (the SaasLanding marker present), Preview mounts the page;
 *   (g) Copy Full Page writes the registry source to the clipboard;
 *   (h) LIVE template state — the billing tabs recompute pricing
 *       (Annual → the Pro AnimatedNumber strip lands at $39 and the
 *       TierCard price reads $39/mo), and the Telemetry ledger filter
 *       narrows the rows;
 *   (i) the 4-viewport sweep (375 / 768 / 1440 / 1920) on #/templates:
 *       zero horizontal overflow + zero console errors.
 *
 * Screenshot: /tmp/visual-cortex/v380-templates.png (1440×900).
 * Exit 0 = ALL PASS.
 */
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const URL_BASE = "http://localhost:5173";

function assert(cond, label) {
  if (!cond) throw new Error(`PROOF FAIL: ${label}`);
  console.log(`  ✓ ${label}`);
}

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  permissions: ["clipboard-read", "clipboard-write"],
});
const page = await context.newPage();

const consoleErrors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => consoleErrors.push(String(err)));

console.log("(a) navigation + the studio mount");
await page.goto(`${URL_BASE}/#/templates`, { waitUntil: "networkidle", timeout: 45000 });
await page.waitForTimeout(1000);
assert((await page.locator('[data-testid="tpl-studio"]').count()) === 1, "the Templates Studio root mounts at #/templates");
const heroTitle = await page.locator(".hub__hero-title, h1").first().textContent();
assert(heroTitle !== null && heroTitle.toUpperCase().includes("TEMPLATES STUDIO"), `the hero speaks: ${heroTitle?.trim()}`);
assert((await page.locator('[data-testid="tpl-studio-bar"]').count()) === 1, "the sticky control bar mounts");
assert((await page.getByRole("tab", { name: /01 · SaaS Landing/ }).count()) >= 1, "tab 01 · SaaS Landing present");
assert((await page.getByRole("tab", { name: /02 · Docs Reader/ }).count()) >= 1, "tab 02 · Docs Reader present");
assert((await page.getByRole("tab", { name: /03 · Telemetry Center/ }).count()) >= 1, "tab 03 · Telemetry Center present");
assert((await page.locator('[data-testid="tpl-saas"]').count()) === 1, "the default template (SaaS Landing) mounts live");
const crumbs = await page.locator('[aria-label="You are here"]').first().textContent();
assert(crumbs !== null && crumbs.includes("templates") && crumbs.includes("saas-landing"), `the breadcrumbs read engine / templates / saas-landing: ${crumbs?.trim()}`);

console.log("(b) template switching");
await page.getByRole("tab", { name: /02 · Docs Reader/ }).click();
await page.waitForTimeout(300);
assert((await page.locator('[data-testid="tpl-docs"]').count()) === 1, "tab 02 mounts the Docs Reader");
await page.getByRole("tab", { name: /03 · Telemetry Center/ }).click();
await page.waitForTimeout(300);
assert((await page.locator('[data-testid="tpl-telemetry"]').count()) === 1, "tab 03 mounts the Telemetry Center");
await page.getByRole("tab", { name: /01 · SaaS Landing/ }).click();
await page.waitForTimeout(300);
assert((await page.locator('[data-testid="tpl-saas"]').count()) === 1, "tab 01 returns to the SaaS Landing");

console.log("(c) the viewport emulator");
const stageWidth = () => page.locator('[data-testid="tpl-stage"]').evaluate((el) => el.getBoundingClientRect().width);
await page.locator('[data-testid="tpl-viewport-tablet"]').click();
await page.waitForTimeout(500); // the width transition settles
assert(Math.abs((await stageWidth()) - 768) < 2, `Tablet pins the stage to 768px (got ${await stageWidth()})`);
await page.locator('[data-testid="tpl-viewport-mobile"]').click();
await page.waitForTimeout(500);
assert(Math.abs((await stageWidth()) - 375) < 2, `Mobile pins the stage to 375px (got ${await stageWidth()})`);
await page.locator('[data-testid="tpl-viewport-desktop"]').click();
await page.waitForTimeout(500);
const desktopWidth = await stageWidth();
assert(desktopWidth > 1000, `Desktop restores the full width (got ${desktopWidth})`);

console.log("(d) the emulator reflows the template (container queries)");
const tierTracks = () =>
  page.locator('[data-testid="tpl-saas-tiers"]').evaluate((el) => {
    const tracks = getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean);
    return tracks.length;
  });
assert((await tierTracks()) === 3, "Desktop: the TierCard row is 3 columns");
await page.locator('[data-testid="tpl-viewport-mobile"]').click();
await page.waitForTimeout(500);
assert((await tierTracks()) === 1, "Mobile: the TierCard row collapses to ONE column (the container query answers the stage)");
const featureTracks = () =>
  page.locator('[data-testid="tpl-saas-features"]').evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean).length);
assert((await featureTracks()) === 1, "Mobile: the feature grid collapses too");
await page.locator('[data-testid="tpl-viewport-desktop"]').click();
await page.waitForTimeout(500);

console.log("(e) the SCOPED theme switcher");
const wrapBg = () =>
  page.locator('[data-testid="tpl-stage-wrap"]').evaluate((el) => getComputedStyle(el).getPropertyValue("--bg-base").trim());
const rootBg = () =>
  page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--bg-base").trim());
await page.locator('[data-testid="tpl-theme-oled"]').click();
await page.waitForTimeout(200);
assert((await page.locator('[data-testid="tpl-stage-wrap"]').getAttribute("data-sig-theme")) === "oled", "OLED sets data-sig-theme on the STAGE WRAPPER");
assert((await wrapBg()) === "#000000", `the wrap's --bg-base resolves to #000000 (got ${await wrapBg()})`);
assert((await rootBg()) === "#1E1E2E", `the document root keeps #1E1E2E — the preview is SCOPED (got ${await rootBg()})`);
await page.locator('[data-testid="tpl-theme-daylight"]').click();
await page.waitForTimeout(200);
assert((await wrapBg()) === "#F8FAFC", `Daylight re-themes the wrap to #F8FAFC (got ${await wrapBg()})`);
await page.locator('[data-testid="tpl-theme-mocha"]').click();
await page.waitForTimeout(200);
assert((await page.locator('[data-testid="tpl-stage-wrap"]').getAttribute("data-sig-theme")) === null, "Mocha removes the attribute (the :root inheritance)");

console.log("(f) Preview ↔ Full TSX Code");
await page.locator('[data-testid="tpl-mode-code"]').click();
await page.waitForTimeout(200);
const codeText = await page.locator('[data-testid="tpl-code"] code').textContent();
assert(codeText !== null && codeText.includes("SaasLandingTemplate"), "Full TSX Code renders the registry source (the SaasLanding marker)");
await page.locator('[data-testid="tpl-mode-preview"]').click();
await page.waitForTimeout(200);
assert((await page.locator('[data-testid="tpl-saas"]').count()) === 1, "Preview mounts the live page again");

console.log("(g) Copy Full Page");
await page.locator('[data-testid="tpl-copy-full"]').click();
await page.waitForTimeout(400);
const clipboard = await page.evaluate(() => navigator.clipboard.readText());
assert(clipboard.includes("SaasLandingTemplate") && clipboard.includes("@carcolacha/signature-style/react"), "the clipboard carries the full-page source");
assert((await page.locator('[data-testid="tpl-copied-chip"]').getAttribute("data-visible")) === "true", "the mint confirmation chip lights up");

console.log("(h) LIVE template state — billing + filter");
await page.getByRole("tab", { name: "Annual — Save 20%" }).click();
await page.waitForTimeout(900); // the AnimatedNumber roll settles
const priceStrip = await page.locator('[data-testid="tpl-saas-price"]').textContent();
assert(priceStrip !== null && priceStrip.includes("$39"), `the AnimatedNumber strip recomputes to $39 (got ${priceStrip?.trim()})`);
assert(priceStrip !== null && priceStrip.includes("billed annually"), "the caption names the annual cycle");
const proCard = await page.locator('[data-testid="tpl-saas-tiers"] .sig-tier-card--featured .sig-tier-card__price').textContent();
assert(proCard !== null && proCard.includes("$39"), `the featured TierCard price reads $39/mo (got ${proCard?.trim()})`);
await page.getByRole("tab", { name: "Monthly", exact: true }).click();
await page.waitForTimeout(300);

await page.getByRole("tab", { name: /03 · Telemetry Center/ }).click();
await page.waitForTimeout(400);
await page.locator('[data-testid="tpl-tele-filter"]').fill("zone-c");
await page.waitForTimeout(300);
const ledgerRows = await page.locator(".sig-tpl-telemetry .sig-data-table tbody tr").count();
assert(ledgerRows === 2, `the ledger filter narrows to the 2 zone-c rows (got ${ledgerRows})`);
await page.locator('[data-testid="tpl-tele-filter"]').fill("");
await page.waitForTimeout(200);
await page.getByRole("tab", { name: /01 · SaaS Landing/ }).click();

console.log("(i) the 4-viewport sweep on #/templates");
for (const [width, height] of [[375, 812], [768, 1024], [1440, 900], [1920, 1080]]) {
  await page.setViewportSize({ width, height });
  await page.waitForTimeout(600);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(overflow <= 0, `${width}×${height}: zero horizontal overflow (delta ${overflow}px)`);
}
await page.setViewportSize({ width: 1440, height: 900 });

mkdirSync("/tmp/visual-cortex", { recursive: true });
await page.screenshot({ path: "/tmp/visual-cortex/v380-templates.png", fullPage: false });

const realErrors = consoleErrors.filter(
  (err) => !err.includes("Open-Meteo") && !err.includes("Failed to load resource") && !err.includes("ERR_ABORTED"),
);
assert(realErrors.length === 0, `zero console errors on the Templates Studio (got ${realErrors.length}: ${realErrors.slice(0, 3).join(" | ")})`);

await browser.close();
console.log("PROOF ALL PASS — v3.8.0 Templates Studio");
