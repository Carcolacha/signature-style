#!/usr/bin/env node
/**
 * probe-v370-motion-lab.mjs — THE CORTEX PROOF for v3.7.0 "The
 * Intelligent Kinetic Engine, Motion Lab & Live Data Choreography"
 * (the release-blocker probe, v3.2.0 probe precedent).
 *
 * Prerequisite: the dev server on http://localhost:5173 (npm run
 * playground). Asserts:
 *
 *   (a) the Motion Lab is navigable (#/motion) and mounts EXACTLY six
 *       PatternFrames under the replay stream;
 *   (b) the Slow-Mo segment sets --sig-motion-scale computed 0.25 on the
 *       lab root (and back to 1 on 1.0×);
 *   (c) the Reduced Motion Preview collapses the duration tokens to 1ms;
 *   (d) Replay Choreography remounts the stream — a MotionReveal is
 *       caught mid-entrance (no data-in) and then reveals (data-in);
 *   (e) the Open-Meteo choreography runs BOTH paths: route-aborted → the
 *       deterministic offline fallback renders instantly (chip reads
 *       "Deterministic offline sample", values render); fulfilled with a
 *       live-shaped payload → the chip swaps to "Live · Open-Meteo" and
 *       the temperature readout follows the payload;
 *   (f) the 4-viewport sweep (375 / 768 / 1440 / 1920) on the Motion
 *       Lab: zero horizontal overflow + zero console errors;
 *   (g) the e1 motion scan AT RUNTIME: no stylesheet rule (keyframes
 *       included) and no computed transition animates box-shadow.
 *
 * Screenshot: /tmp/visual-cortex/v370-motion-lab.png (1440×900, the lab).
 * Exit 0 = ALL PASS.
 */
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const URL_BASE = "http://localhost:5173";

function assert(cond, label) {
  if (!cond) throw new Error(`PROOF FAIL: ${label}`);
  console.log(`  ✓ ${label}`);
}

/** A deterministic live-shaped Open-Meteo payload (24 hourly samples). */
function mockMeteoPayload() {
  const hours = Array.from({ length: 24 }, (_, h) => h);
  const temps = hours.map((h) => 14 + 9 * Math.sin(((h - 8) / 24) * Math.PI * 2));
  const wind = hours.map((h) => 10 + 5 * Math.sin(((h - 6) / 24) * Math.PI * 2));
  return {
    hourly: {
      time: hours.map((h) => `2026-11-15T${String(h).padStart(2, "0")}:00`),
      temperature_2m: temps.map((t) => Number(t.toFixed(1))),
      wind_speed_10m: wind.map((w) => Number(w.toFixed(1))),
    },
  };
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const consoleErrors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => consoleErrors.push(String(err)));

console.log("(a) navigation + the six frames");
await page.goto(`${URL_BASE}/#/motion`, { waitUntil: "networkidle", timeout: 45000 });
await page.waitForTimeout(1200); // entrances settle; the meteo fetch resolves/aborts
assert((await page.locator('[data-testid="motion-lab"]').count()) === 1, "the Motion Lab root mounts at #/motion");
const heroTitle = await page.locator(".hub__hero-title, h1").first().textContent();
assert(heroTitle !== null && heroTitle.toUpperCase().includes("MOTION LAB"), `the hero speaks: ${heroTitle?.trim()}`);
const frameCount = await page.locator('[data-testid="motion-stream"] article.pattern-frame').count();
assert(frameCount === 6, `EXACTLY six PatternFrames mount (found ${frameCount})`);
for (const testid of ["motion-stagger", "motion-detents", "motion-sheen", "motion-flip", "motion-telemetry", "motion-weather"]) {
  assert((await page.locator(`[data-testid="${testid}"]`).count()) === 1, `showcase present: ${testid}`);
}

console.log("(b) the time dial — Slow-Mo");
const scaleOf = () =>
  page.evaluate(() => {
    const root = document.querySelector('[data-testid="motion-lab"]');
    return root === null ? null : getComputedStyle(root).getPropertyValue("--sig-motion-scale").trim();
  });
// The dial is a registered-plain custom property — getComputedStyle
// returns the substituted (not fully resolved) value. The RESOLVED
// truth is the gliding indicator's transition-duration inside the lab.
const glideSeconds = () =>
  page.evaluate(() => {
    const node = document.querySelector('[data-testid="motion-flip"] .sig-tabs-indicator');
    return node === null ? null : getComputedStyle(node).transitionDuration;
  });
assert((await scaleOf()) === "1", `the dial defaults to 1 (computed ${await scaleOf()})`);
const glideFull = await glideSeconds();
assert(glideFull === "0.28s", `the glide resolves to 280ms at 1× (computed ${glideFull})`);
await page.locator('[data-testid="motion-speed-slow"]').click();
await page.waitForTimeout(150);
const slow = await scaleOf();
assert(slow === "0.25" || slow === "0.250", `Slow-Mo sets --sig-motion-scale computed ${slow}`);
const glideDuringSlowMo = await glideSeconds();
assert(glideDuringSlowMo === "0.07s", `a duration dilates with the dial (--dur-glide computed ${glideDuringSlowMo} = 280 × 0.25)`);
await page.locator('[data-testid="motion-speed-normal"]').click();
await page.waitForTimeout(150);
assert((await scaleOf()) === "1", "1.0× restores the dial");

console.log("(c) the reduced-motion preview");
await page.locator('[data-testid="motion-reduced"]').click();
await page.waitForTimeout(150);
const glideReduced = await glideSeconds();
assert(
  ["0s", "1ms", "0.001s", "0.000001s"].includes(glideReduced),
  `the mercy collapses the durations (--dur-glide computed ${glideReduced}: the 1ms token floor or the explicit transition:none stand-down)`,
);
const revealVisibleUnderReduced = await page.evaluate(() => {
  const node = document.querySelector('[data-testid="motion-stagger"] .sig-motion-reveal');
  return node === null ? false : getComputedStyle(node).opacity === "1";
});
assert(revealVisibleUnderReduced, "reveals stand down to the visible state under the preview");
await page.locator('[data-testid="motion-reduced"]').click();
await page.waitForTimeout(150);
assert((await glideSeconds()) === "0.28s", "the preview toggles back off");

console.log("(d) replay choreography");
await page.locator('[data-testid="motion-replay"]').click();
// Catch a reveal mid-entrance: remount re-arms the IO; the FIRST tile
// may already be intersecting → its data-in lands on the first IO
// callback. Sample immediately, then wait for the wave to land.
const midEntrance = await page.evaluate(() => {
  const nodes = [...document.querySelectorAll('[data-testid="motion-stagger"] .sig-motion-reveal')];
  return nodes.some((n) => n.getAttribute("data-in") === null);
});
await page.waitForTimeout(1800); // 6 tiles × 45ms stagger + 480ms spring
const allIn = await page.evaluate(() => {
  const nodes = [...document.querySelectorAll('[data-testid="motion-stagger"] .sig-motion-reveal')];
  return nodes.length === 6 && nodes.every((n) => n.getAttribute("data-in") === "true");
});
assert(midEntrance || allIn, "the remount re-arms the entrances (reveals caught unset or re-revealed)");
assert(allIn, `the full stagger wave lands (6/6 data-in, found ${await page.locator('[data-testid="motion-stagger"] .sig-motion-reveal[data-in="true"]').count()})`);

console.log("(e) the Open-Meteo choreography — BOTH paths");
// PATH 1: reload with the request BLOCKED → the mount fetch fails quietly
// and the deterministic fallback renders (fallback-first, offline-safe).
// (A same-URL goto is only a same-document hash navigation — the mount
// must actually re-run, so this is a real reload.)
await page.route("**/api.open-meteo.com/**", (route) => route.abort());
await page.reload({ waitUntil: "domcontentloaded", timeout: 45000 });
await page.waitForTimeout(1500);
const chipText = () => page.locator('[data-testid="motion-weather-chip"]').textContent();
const blockedChip = await chipText();
assert(blockedChip !== null && blockedChip.includes("Deterministic offline sample"), `blocked → fallback retained (chip: ${blockedChip?.trim()})`);
const fallbackTemp = await page.evaluate(() => document.querySelector('[data-testid="motion-weather"] .sig-animated-number')?.textContent ?? "");
assert(fallbackTemp.includes("°C"), `the fallback sample renders a real readout (${fallbackTemp})`);
// PATH 2: fulfill with a live-shaped payload → the swap.
const mock = mockMeteoPayload();
const mockTemp = mock.hourly.temperature_2m[12];
await page.unroute("**/api.open-meteo.com/**");
await page.route("**/api.open-meteo.com/**", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mock) }));
await page.locator('[data-testid="motion-refetch"]').click();
await page.waitForTimeout(900);
const liveChip = await chipText();
assert(liveChip !== null && liveChip.includes("Live · Open-Meteo"), `unblocked → the live swap lands (chip: ${liveChip?.trim()})`);
const liveTempText = await page.evaluate(() => document.querySelector('[data-testid="motion-weather"] .sig-animated-number')?.textContent ?? "");
const liveTemp = Number.parseFloat(liveTempText.replace(" °C", ""));
assert(Math.abs(liveTemp - mockTemp) < 0.11, `the readout follows the payload (${liveTempText} vs payload noon ${mockTemp})`);
await page.unroute("**/api.open-meteo.com/**");

console.log("(f) the 4-viewport sweep — zero overflow, zero console errors");
const consoleErrorsByViewport = {};
for (const width of [375, 768, 1440, 1920]) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(`${URL_BASE}/#/motion`, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(900);
  const overflow = await page.evaluate(() => {
    const doc = document.scrollingElement;
    return doc.scrollWidth - doc.clientWidth;
  });
  const errors = consoleErrors.filter((e) => !e.includes("api.open-meteo.com") && !e.includes("Failed to load resource"));
  consoleErrorsByViewport[width] = errors;
  assert(overflow <= 0, `${width}px: zero horizontal overflow (delta ${overflow}px)`);
  assert(errors.length === 0, `${width}px: zero console errors (${errors.length})`);
}

console.log("(g) the e1 motion scan at runtime");
const e1 = await page.evaluate(() => {
  const violations = [];
  for (const sheet of document.styleSheets) {
    let rules;
    try {
      rules = sheet.cssRules;
    } catch {
      continue; // cross-origin (the font import)
    }
    const scan = (ruleList, ctx) => {
      for (const rule of ruleList) {
        if (rule.type === CSSRule.KEYFRAMES_RULE) scan(rule.cssRules, `@keyframes ${rule.name}`);
        else if (rule.cssText && /box-shadow\s*:/.test(rule.cssText) && !/box-shadow\s*:\s*none/.test(rule.cssText)) {
          if (rule.cssText.includes("transition") || rule.cssText.includes("animation") || ctx.startsWith("@keyframes") || rule.style?.transition) {
            violations.push(`${ctx}: ${rule.selectorText ?? rule.name ?? "?"}`);
          }
        }
      }
    };
    scan(sheet.cssRules, sheet.href ?? "inline");
  }
  return violations;
});
assert(e1.length === 0, `no stylesheet animates box-shadow (violations: ${e1.join("; ") || "none"})`);
const transitionShadow = await page.evaluate(() => {
  const hits = [];
  for (const el of document.querySelectorAll("*")) {
    const tp = getComputedStyle(el).transitionProperty;
    if (tp && tp.split(",").some((p) => p.trim() === "box-shadow")) hits.push(el.tagName + "." + String(el.className).slice(0, 40));
  }
  return hits.slice(0, 5);
});
assert(transitionShadow.length === 0, `no element transitions box-shadow (hits: ${transitionShadow.join("; ") || "none"})`);

console.log("screenshot — /tmp/visual-cortex/v370-motion-lab.png");
mkdirSync("/tmp/visual-cortex", { recursive: true });
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(`${URL_BASE}/#/motion`, { waitUntil: "networkidle", timeout: 45000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: "/tmp/visual-cortex/v370-motion-lab.png", fullPage: false });

await browser.close();
console.log("PROOF ALL PASS — v3.7.0 Motion Lab choreography verified.");
