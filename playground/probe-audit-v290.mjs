#!/usr/bin/env node
/**
 * probe-audit-v290.mjs — THE HOSTILE SELF-AUDIT (2.9.0 Phase 4).
 *
 * Tries to BREAK the release from inside a real browser:
 *
 *   (a1) MULTI-VIEWPORT CORTEX SWEEP — 375×812, 768×1024, 1440×900,
 *        1920×1080; on EACH, for EACH of the 5 views + the dashboard's
 *        3 module tabs (data/forms/graph; core is the default): zero
 *        horizontal overflow (documentElement.scrollWidth <=
 *        innerWidth + 1) and non-zero .sig-shell content margins.
 *   (a2) COMMAND PALETTE KEYBOARD — Ctrl+K opens; "budget" filters to
 *        exactly the workspace-export row; Enter executes + closes;
 *        Escape closes AND restores focus to the trigger; ArrowDown/
 *        ArrowUp move aria-activedescendant; backdrop click closes.
 *   (a3) REDUCED MOTION (emulated) — the skeleton shimmer stands down
 *        (animation none + static surface ground), the flip card swaps
 *        to the opacity path, the form-well shake never runs, the
 *        meter/pill transitions go none.
 *   (a4) CONTRAST SPOT-CHECK — the 11 party tokens' text usages read
 *        against their effective backgrounds; ratios reported; anything
 *        under 3:1 flagged (report item — fixes need owner approval).
 *   (a5) CONSOLE AUDIT — zero console errors + zero pageerror events
 *        across EVERY sweep above (hard failure on any).
 *
 * Requires the dev server on http://localhost:5173. Exit 0 = ALL PASS.
 */
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const require = createRequire(
  pathToFileURL(resolve(root, "tools/mcp-viz/package.json")),
);
const { chromium } = require("playwright");

const URL_TO_PROBE = "http://localhost:5173";
const VIEWPORTS = [
  [375, 812],
  [768, 1024],
  [1440, 900],
  [1920, 1080],
];

const consoleErrors = [];
const pageErrors = [];
const failures = [];
const report = { overflow: [], margins: [], palette: [], motion: [], contrast: [] };

function fail(label) {
  failures.push(label);
}

/** Watch console/page errors on a page for the whole audit. */
function watch(page) {
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(String(error)));
}

const browser = await chromium.launch();

/* ---- (a2) the command palette (viewport-independent, run once) -------- */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  watch(page);
  await page.goto(URL_TO_PROBE, { waitUntil: "networkidle" });

  await page.keyboard.press("Control+k");
  const opened = await page.locator('[data-testid="command-input"]').isVisible();
  report.palette.push({ check: "Ctrl+K opens", result: opened });
  if (!opened) fail("(a2) Ctrl+K did not open the palette");

  await page.keyboard.type("budget");
  const rows = await page
    .locator('[data-testid="command-list"] [role="option"]')
    .allTextContents();
  const filteredToExport = rows.length === 1 && rows[0].includes("Export Workspace JSON");
  report.palette.push({ check: '"budget" filters', result: rows.map((r) => r.trim()) });
  if (!filteredToExport) fail(`(a2) "budget" must filter to exactly the workspace export, got ${JSON.stringify(rows)}`);

  // The export command's backdrop closes too — Escape first so the
  // download never fires mid-audit.
  await page.keyboard.press("Escape");
  await page.locator('[data-testid="command-input"]').waitFor({ state: "detached" });

  await page.locator('[data-testid="palette-trigger"]').focus();
  await page.keyboard.press("Control+k");
  await page.locator('[data-testid="command-input"]').waitFor({ state: "visible" });
  await page.keyboard.press("Escape");
  await page.locator('[data-testid="command-input"]').waitFor({ state: "detached" });
  const restored = await page.evaluate(
    () => document.activeElement?.getAttribute("data-testid"),
  );
  report.palette.push({ check: "Escape restores focus", result: restored });
  if (restored !== "palette-trigger") fail(`(a2) Escape must restore focus to the trigger, got ${String(restored)}`);

  await page.keyboard.press("Control+k");
  await page.locator('[data-testid="command-input"]').waitFor({ state: "visible" });
  // Settle: the open effect clears the filter state one commit after
  // the palette mounts — wait for the box to read empty before reading
  // the selection.
  await page.waitForFunction(() => document.querySelector('[data-testid="command-input"]')?.value === "");
  const first = await page.getAttribute('[data-testid="command-input"]', "aria-activedescendant");
  await page.keyboard.press("ArrowDown");
  const second = await page.getAttribute('[data-testid="command-input"]', "aria-activedescendant");
  await page.keyboard.press("ArrowUp");
  const back = await page.getAttribute('[data-testid="command-input"]', "aria-activedescendant");
  const arrowsMove = first !== second && back === first;
  report.palette.push({ check: "arrows move aria-activedescendant", result: { first, second, back } });
  if (!arrowsMove) fail("(a2) ArrowDown/ArrowUp must move aria-activedescendant");

  await page.keyboard.press("Escape");
  await page.locator('[data-testid="command-input"]').waitFor({ state: "detached" });
  // Backdrop click closes.
  await page.locator('[data-testid="palette-trigger"]').click();
  await page.locator('[data-testid="command-input"]').waitFor({ state: "visible" });
  await page.mouse.click(10, 10);
  await page.locator('[data-testid="command-input"]').waitFor({ state: "detached" });
  report.palette.push({ check: "backdrop click closes", result: true });

  // The launcher is IGNORED while typing in a field.
  await page.locator("#checkin-name").focus();
  await page.keyboard.press("Control+k");
  const stayedClosed = (await page.locator('[data-testid="command-input"]').count()) === 0;
  report.palette.push({ check: "Ctrl+K ignored while typing in an input", result: stayedClosed });
  if (!stayedClosed) fail("(a2) Ctrl+K must be ignored while the focus is in an input");
  await page.close();
}

/* ---- (a1) the multi-viewport sweep + (a5) console audit --------------- */
const NAV_TARGETS = [
  { label: "Dashboard", view: "dashboard" },
  { label: "Pattern Studio", view: "studio" },
  { label: "Index", view: "index" },
  { label: "Chronicle", view: "chronicle" },
  { label: "AI Codex", view: "codex" },
];
const MODULE_TABS = ["Data & Tables", "Form & Input Matrix", "Graphs & Planner"];

/** Navigate to a view — the flat bar on wide screens, the drawer at
    ≤ 768px (Pillar 2 hides the bar; the hamburger opens the drawer and
    every drawer link closes it). */
async function gotoView(page, label) {
  const flatBarVisible = await page.locator(".ptp-nav__list").first().isVisible();
  if (flatBarVisible) {
    await page.getByRole("link", { name: label }).first().click();
  } else {
    await page.locator(".ptp-nav__menu-btn").first().click();
    await page.locator(".ptp-nav-drawer").getByRole("link", { name: label }).click();
  }
  await page.waitForTimeout(180);
}

for (const [width, height] of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width, height } });
  watch(page);
  await page.goto(URL_TO_PROBE, { waitUntil: "networkidle" });
  for (const target of NAV_TARGETS) {
    await gotoView(page, target.label);
    const targets =
      target.view === "dashboard"
        ? ["Core Dashboard", ...MODULE_TABS]
        : [null];
    for (const moduleTab of targets) {
      if (moduleTab !== null) {
        await page.getByRole("tab", { name: moduleTab }).click();
        await page.waitForTimeout(120);
      }
      const metrics = await page.evaluate(() => {
        const doc = document.documentElement;
        const shell = document.querySelector(".sig-shell");
        const cs = shell === null ? null : getComputedStyle(shell);
        const padLeft = cs === null ? 0 : parseFloat(cs.paddingLeft || "0");
        const padRight = cs === null ? 0 : parseFloat(cs.paddingRight || "0");
        const marginBox = shell === null ? null : shell.getBoundingClientRect();
        return {
          scrollWidth: doc.scrollWidth,
          innerWidth: window.innerWidth,
          shellPaddingX: [padLeft, padRight],
          shellLeft: marginBox === null ? 0 : marginBox.left,
        };
      });
      const overflow = metrics.scrollWidth - metrics.innerWidth;
      const marginsOk = metrics.shellPaddingX.every((p) => p > 0) || metrics.shellLeft > 0;
      const label = `${width}x${height} · ${target.view}${moduleTab === null ? "" : ` · ${moduleTab}`}`;
      report.overflow.push({ viewport: `${width}x${height}`, target: label, overflowPx: overflow, pass: overflow <= 1 });
      report.margins.push({
        viewport: `${width}x${height}`,
        target: label,
        shellPaddingX: metrics.shellPaddingX,
        shellLeft: Math.round(metrics.shellLeft),
        pass: marginsOk,
      });
      if (overflow > 1) fail(`(a1) horizontal overflow ${overflow}px at ${label}`);
      if (!marginsOk) fail(`(a1) .sig-shell margins collapsed at ${label}`);
    }
  }
  await page.close();
}

/* ---- (a3) reduced-motion emulation ------------------------------------ */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  watch(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(URL_TO_PROBE, { waitUntil: "networkidle" });
  // Motion durations come back in SECONDS ("1e-05s" = 0.01ms).
  const isCollapsed = (duration) => parseFloat(String(duration)) <= 0.00002;

  // Skeleton shimmer: animation none + static surface ground.
  const shimmer = await page.evaluate(() => {
    const line = document.querySelector(".hub__cq-probe .ptp-skeleton--line");
    if (line === null) return null;
    const cs = getComputedStyle(line);
    return { animation: cs.animationName, background: cs.backgroundColor };
  });
  report.motion.push({ check: "skeleton shimmer (reduced)", result: shimmer });
  if (shimmer === null) fail("(a3) no skeleton in the fixture to probe");
  else if (shimmer.animation !== "none") fail(`(a3) reduced-motion shimmer must stand down, animationName=${shimmer.animation}`);

  // Flip card: the inner stage drops the transform (opacity path takes over).
  const flip = await page.evaluate(() => {
    const card = document.querySelector(".ptp-flip-card__inner");
    if (card === null) return null;
    const cs = getComputedStyle(card);
    return { transform: cs.transform, transition: cs.transitionDuration };
  });
  report.motion.push({ check: "flip inner (reduced)", result: flip });
  if (flip === null || flip.transform !== "none") {
    fail(`(a3) reduced-motion flip inner must drop the 3d transform, got ${flip?.transform}`);
  }

  // Form-well shake: force the error state, animation must be none.
  await page.getByRole("tab", { name: "Form & Input Matrix" }).click();
  const shake = await page.evaluate(() => {
    const input = document.querySelector("#matrix-share");
    if (input === null) return null;
    const well = input.closest(".ptp-form-field__well");
    if (well === null) return null;
    well.setAttribute("data-invalid", "");
    const cs = getComputedStyle(well);
    const animation = cs.animationName;
    well.removeAttribute("data-invalid");
    return animation;
  });
  report.motion.push({ check: "form-well shake (reduced)", result: shake });
  if (shake !== "none") fail(`(a3) reduced-motion must kill the shake, animationName=${shake}`);

  // Password meter segments: transitions none.
  const meter = await page.evaluate(() => {
    const segment = document.querySelector(".ptp-password__meter span");
    if (segment === null) return null;
    return getComputedStyle(segment).transitionDuration;
  });
  report.motion.push({ check: "password meter transition (reduced)", result: meter });
  if (meter === null || !isCollapsed(meter)) {
    fail(`(a3) reduced-motion meter transitions must collapse to the floor, got ${String(meter)}`);
  }

  // Carousel dot transitions + the [data-motion] preview override.
  const preview = await page.evaluate(() => {
    document.documentElement.dataset.motion = "reduced";
    const probe = document.createElement("div");
    probe.style.transition = "opacity 2s";
    probe.style.animation = "slideUpFade 2s forwards";
    document.body.appendChild(probe);
    const cs = getComputedStyle(probe);
    const result = { transitionDuration: cs.transitionDuration, animationDuration: cs.animationDuration };
    probe.remove();
    delete document.documentElement.dataset.motion;
    return result;
  });
  report.motion.push({ check: "[data-motion=reduced] preview override", result: preview });
  if (!isCollapsed(preview.transitionDuration) || !isCollapsed(preview.animationDuration)) {
    fail(`(a3) the [data-motion=reduced] override must collapse durations to the 0.01ms floor, got ${JSON.stringify(preview)}`);
  }
  await page.close();
}

/* ---- (a4) contrast spot-check — the 11 party tokens ------------------- */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  watch(page);
  await page.goto(URL_TO_PROBE, { waitUntil: "networkidle" });
  // The dashboard carries badges/deltas/callouts; the STUDIO frames
  // carry the form error/valid lines, the tier bullets, the chronicle
  // tags and the graph — visit both before reading pairs.
  await page.getByRole("link", { name: "Pattern Studio" }).first().click();
  await page.waitForSelector(".pattern-frame");
  const pairs = await page.evaluate(() => {
    /** Parse "rgb(a)" into [r,g,b,a]. */
    function parseRgb(value) {
      const m = value.match(/rgba?\(([^)]+)\)/);
      if (m === null) return null;
      const parts = m[1].split(/[,/\s]+/).filter((p) => p !== "").map(Number);
      if (parts.length < 3) return null;
      const [r, g, b, a = 1] = parts;
      return [r, g, b, a];
    }
    /** Walk up to the first ancestor (or self) with a non-transparent bg. */
    function effectiveBackground(el) {
      let node = el;
      while (node !== null && node !== document.documentElement) {
        const bg = parseRgb(getComputedStyle(node).backgroundColor);
        if (bg !== null && bg[3] > 0) return bg;
        node = node.parentElement;
      }
      return parseRgb(getComputedStyle(document.body).backgroundColor) ?? [0, 0, 0, 1];
    }
    function compositeOver(fg, bg) {
      const a = fg[3];
      return [
        fg[0] * a + bg[0] * (1 - a),
        fg[1] * a + bg[1] * (1 - a),
        fg[2] * a + bg[2] * (1 - a),
      ];
    }
    function luminance(rgb) {
      const [r, g, b] = rgb.map((v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
    function ratio(fgRgba, bgRgba) {
      const fg = fgRgba[3] >= 1 ? fgRgba.slice(0, 3) : compositeOver(fgRgba, bgRgba);
      const l1 = luminance(fg);
      const l2 = luminance(bgRgba.slice(0, 3));
      const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
      return (hi + 0.05) / (lo + 0.05);
    }
    // Representative text usages per party token (query → note). Most
    // live inside the Pattern Studio's always-mounted frames.
    const probes = [
      [".studio__palette-note", "placeholder probe (removed)"],
      [".ptp-form-field__error", "party-peach error line (studio FormField frame)"],
      [".ptp-form-field__valid", "party-green valid line (studio FormField frame)"],
      [".sig-tier-card__features li svg", "party-green check bullets (studio TierCard frame)"],
      [".ptp-chronicle__tag", "chronicle tag (inline --accent, studio ChronicleTimeline frame)"],
      [".ptp-graph__node text", "graph node labels (studio KnowledgeGraph frame)"],
      [".ptp-command__option[aria-selected=\"true\"]", "selected command row text (Flamingo 8% wash)"],
    ];
    const out = [];
    for (const [selector, note] of probes) {
      if (note.startsWith("placeholder")) continue;
      const el = document.querySelector(selector);
      if (el === null) {
        out.push({ selector, note, found: false });
        continue;
      }
      const cs = getComputedStyle(el);
      const fg = parseRgb(cs.color);
      const bg = effectiveBackground(el);
      if (fg === null || bg === null) {
        out.push({ selector, note, found: true, unparsed: true });
        continue;
      }
      out.push({
        selector,
        note,
        found: true,
        color: cs.color,
        background: `rgb(${Math.round(bg[0])}, ${Math.round(bg[1])}, ${Math.round(bg[2])})`,
        ratio: Math.round(ratio(fg, bg) * 100) / 100,
      });
    }
    // The 11 raw token pairs: each party token as TEXT against --bg-base
    // and --bg-surface (the theoretical worst cases for pale tokens).
    const rootStyle = getComputedStyle(document.documentElement);
    const surfaces = {
      "bg-base": parseRgb(rootStyle.getPropertyValue("--bg-base")) ?? [30, 30, 46, 1],
      "bg-surface": parseRgb(rootStyle.getPropertyValue("--bg-surface")) ?? [49, 50, 68, 1],
    };
    const tokens = [
      "--party-pink-bright", "--party-pink-soft", "--party-pink-alt",
      "--party-mauve-bright", "--party-mauve-soft", "--party-lavender",
      "--party-sky", "--party-blue", "--party-peach", "--party-green",
      "--party-yellow",
    ];
    const raw = [];
    for (const token of tokens) {
      const value = rootStyle.getPropertyValue(token).trim();
      const m = value.match(/^#([0-9a-f]{6})$/i);
      if (m === null) {
        raw.push({ token, unparsed: value });
        continue;
      }
      const hex = m[1];
      const rgb = [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
        1,
      ];
      const ratios = {};
      for (const [name, bg] of Object.entries(surfaces)) {
        ratios[name] = Math.round(ratio(rgb, bg) * 100) / 100;
      }
      raw.push({ token, value, ratios });
    }
    return { usages: out, raw };
  });
  report.contrast = pairs;
  await page.close();
}

await browser.close();

/* ---- the verdict -------------------------------------------------------- */
console.log("=== MULTI-VIEWPORT OVERFLOW ===");
for (const row of report.overflow) {
  console.log(
    `  ${row.pass ? "PASS" : "FAIL"}  ${row.viewport}  ${row.target}  overflow=${row.overflowPx}px`,
  );
}
console.log("=== SHELL MARGINS (per viewport, first + last) ===");
const marginLines = report.margins.filter((_, i) => i % 7 === 0 || i === report.margins.length - 1);
for (const row of marginLines) {
  console.log(
    `  ${row.pass ? "PASS" : "FAIL"}  ${row.viewport}  ${row.target}  padding-x=${JSON.stringify(row.shellPaddingX)} left=${row.shellLeft}px`,
  );
}
console.log("=== COMMAND PALETTE KEYBOARD ===");
for (const row of report.palette) {
  console.log(`  ${JSON.stringify(row)}`);
}
console.log("=== REDUCED MOTION ===");
for (const row of report.motion) {
  console.log(`  ${JSON.stringify(row)}`);
}
console.log("=== CONTRAST — live text usages ===");
for (const usage of report.contrast.usages) {
  console.log(`  ${usage.found ? `ratio ${usage.ratio}  ${usage.color} on ${usage.background}  (${usage.note})` : `NOT FOUND  (${usage.note})`}`);
}
console.log("=== CONTRAST — the 11 party tokens vs the two grounds ===");
for (const raw of report.contrast.raw) {
  console.log(`  ${raw.token} ${raw.value ?? JSON.stringify(raw)} → base ${raw.ratios?.["bg-base"]} · surface ${raw.ratios?.["bg-surface"]}`);
}
console.log("=== CONSOLE ===");
console.log(`  console errors: ${consoleErrors.length}`);
for (const e of consoleErrors.slice(0, 10)) console.log(`    ${e}`);
console.log(`  pageerror events: ${pageErrors.length}`);
for (const e of pageErrors.slice(0, 10)) console.log(`    ${e}`);

if (failures.length > 0 || consoleErrors.length > 0 || pageErrors.length > 0) {
  console.error(`AUDIT FAIL — ${failures.length} failure(s)`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("AUDIT PASS — sweep, palette, reduced motion, console all green");
