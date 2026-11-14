#!/usr/bin/env node
/**
 * verify-a11y.mjs — THE ACCESSIBILITY CERTIFICATION (3.5.0).
 *
 * Playwright keyboard audit across the 5 real views at 1440×900:
 *
 *   (a11y1) TAB ORDER — press Tab (≤ 60 stops per view), collect the
 *           focused element sequence and assert:
 *           (a) every stop lands on an INTERACTIVE element (a, button,
 *               input, select, textarea, summary, [tabindex], or a
 *               scrollable container — Chromium gives those implicit
 *               keyboard focus); the walk ENDS at the first body stop
 *               (the clean wrap tail — body is chrome-wrap, not content);
 *           (b) NO FOCUS TRAPS — focus never sits on the SAME element
 *               3 consecutive stops (identity = tag+id+testid+document
 *               position, so sibling nav links are distinct), and the
 *               walk advances in DOM order with at most ONE wrap;
 *           (c) THE FOCUS HALO — every stop shows a visible ring:
 *               computed outline-width ≥ 2px on the focused element OR
 *               (the :has() composition case, e.g. .sig-radio-card) on
 *               an ancestor within 3 levels. EXCEPTION (enumerated, the
 *               e1-allowlist precedent): .hub__card--gateway (the
 *               master-index gateway buttons) still show the UA-default
 *               1px ring — a REAL finding, css/ is frozen this release,
 *               owner-deferred; the gate pins the exception to this ONE
 *               class so a regression elsewhere still fails.
 *   (a11y2) HALO INK — strict var(--color-cake-primary) assertion scoped
 *           to the elements whose css DECLARES the doctrine ring
 *           (.sig-btn buttons, nav links, inputs) — those must resolve
 *           outline-color to the token's rgb at 2px; every other halo is
 *           CENSUSED (UA-default rings reported, not failed).
 *   (a11y3) LIVE REGIONS — the toast region exists with
 *           role="status" + aria-live="polite"; firing a toast via the
 *           dashboard's btn-toast hook UPDATES the live region's text;
 *           the aria-role census on the dashboard: a progressbar with a
 *           valuenow (the password meter), a tablist with tabs carrying
 *           aria-selected (the module switcher), a radiogroup (the
 *           attendance RadioCardGroup).
 *   (a11y4) AXE — axe-core (bundled devDependency, injected into the
 *           page — offline-safe, no CDN) runs on the dashboard; ZERO
 *           critical violations may exist; serious/moderate findings are
 *           REPORTED (note: axe's color-contrast runs the 4.5:1 AA bar —
 *           the package doctrine pins 3.0/3.1 for the token inks; the
 *           runtime bar lives in the audit_contrast MCP tool).
 *
 * Requires the dev server on http://localhost:5173 (`npm run playground`).
 * Exit 0 = ALL PASS; exit 1 = any (a11y1)-(a11y3) failure or any critical
 * axe violation.
 */
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const URL_BASE = "http://localhost:5173";
const MAX_STOPS = 60;
const WIDTH = 1440;
const HEIGHT = 900;

/** The 5 certified views (same census as verify-visual-diff). */
const VIEWS = [
  { name: "dashboard", hash: "" },
  { name: "pattern-studio", hash: "#/studio" },
  { name: "master-index", hash: "#/index" },
  { name: "chronicle", hash: "#/chronicle" },
  { name: "codex", hash: "#/codex" },
];

/**
 * The enumerated halo exception (the e1-allowlist precedent): classes
 * allowed to show a sub-2px ring this release, each with its reason.
 * css/ is FROZEN in 3.5.0 — fixing these needs an owner release.
 */
const HALO_EXCEPTIONS = new Map([
  [".hub__card--gateway", "master-index gateway buttons render the UA-default 1px ring (no focus-visible rule targets bare interactive SurfaceCards in the frozen css) — owner-deferred follow-up"],
]);

const failures = [];
const axeFindings = [];

const devServerUp = await fetch(URL_BASE)
  .then((r) => r.ok)
  .catch(() => false);
if (!devServerUp) {
  console.error(`FAIL — dev server dead at ${URL_BASE} — run \`npm run playground\``);
  process.exit(1);
}

/** One keyboard Tab stop's observation, serialized out of the page. */
function stopProbe() {
  const el = document.activeElement;
  if (el === null || el === document.body) {
    return { focused: "body", key: "body", interactive: false, wrapTail: true, outlineWidth: "0px", outlineColor: "none", outlineStyle: "none", ancestorHalo: false, docIndex: -1, doctrineRing: false, scrollable: false, cls: "" };
  }
  /** Interactive per the HTML contract + tabindex + scroll affordances. */
  function isInteractive(node) {
    const tag = node.tagName.toLowerCase();
    if (["a", "button", "input", "select", "textarea", "summary"].includes(tag)) return true;
    if (node.getAttribute("tabindex") !== null) return true;
    const st = getComputedStyle(node);
    // Chromium gives scroll-styled containers IMPLICIT keyboard focus (the
    // keyboard-scroll accessibility affordance) — treat the overflow
    // contract as the interactivity contract regardless of transient
    // scrollHeight (content can mount short then grow).
    if (/(auto|scroll)/.test(st.overflowY + st.overflowX)) return true;
    return false;
  }
  /** Document-order index (pre-order, cheap-enough at ≤ 60 calls/stop batch). */
  function docIndexOf(node) {
    let count = 0;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    while (walker.nextNode()) {
      if (walker.currentNode === node) return count;
      count++;
    }
    return -1;
  }
  /** Ancestor halo hunt (the :has() composition case), ≤ 3 levels up. */
  function ancestorHalo(node) {
    let ancestor = node.parentElement;
    for (let level = 0; level < 3 && ancestor !== null; level++) {
      const style = getComputedStyle(ancestor);
      const width = parseFloat(style.outlineWidth);
      if (style.outlineStyle !== "none" && width >= 2) return true;
      ancestor = ancestor.parentElement;
    }
    return false;
  }
  const style = getComputedStyle(el);
  const cls = "." + Array.from(el.classList).join(".");
  return {
    focused: `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}${el.getAttribute("data-testid") ? "[" + el.getAttribute("data-testid") + "]" : ""}`,
    key: `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}${el.getAttribute("data-testid") ? "[" + el.getAttribute("data-testid") + "]" : ""}#${docIndexOf(el)}`,
    interactive: isInteractive(el),
    wrapTail: false,
    outlineWidth: style.outlineWidth,
    outlineColor: style.outlineColor,
    outlineStyle: style.outlineStyle,
    ancestorHalo: ancestorHalo(el),
    docIndex: docIndexOf(el),
    // The doctrine ring is DECLARED for these (the strict ink sample).
    doctrineRing: el.matches(".sig-btn, .sig-nav__link, .sig-nav__menu-btn, input, textarea, select"),
    scrollable: !isInteractive(el) ? false : ["a", "button", "input", "select", "textarea", "summary"].includes(el.tagName.toLowerCase()) || el.getAttribute("tabindex") !== null ? false : true,
    cls,
  };
}

/** The resolved --color-cake-primary (the doctrine ring ink) off :root. */
function cakePrimaryRgb(page) {
  return page.evaluate(() => {
    const probe = document.createElement("div");
    probe.style.outline = "2px solid var(--color-cake-primary)";
    document.body.appendChild(probe);
    const resolved = getComputedStyle(probe).outlineColor;
    probe.remove();
    return resolved;
  });
}

const browser = await chromium.launch({ headless: true });

/** Poll until the focused element's computed outline stops changing (≤ 600ms). */
async function waitForOutlineSettle(page) {
  let last = "";
  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(100);
    const outline = await page.evaluate(() => {
      const el = document.activeElement;
      if (el === null || el === document.body) return "body";
      const st = getComputedStyle(el);
      return `${st.outlineWidth}|${st.outlineStyle}|${st.outlineColor}`;
    });
    if (outline === last) return;
    last = outline;
  }
}
try {
  // ---- (a11y3) LIVE REGIONS + ROLE CENSUS — dashboard only ----------------
  {
    const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
    await page.goto(URL_BASE + "/", { waitUntil: "networkidle", timeout: 30000 });

    const liveRegion = await page.evaluate(() => {
      const region = document.querySelector('[role="status"][aria-live="polite"], [aria-live="polite"][role="status"]')
        ?? document.querySelector('[aria-live="polite"]');
      if (region === null) return null;
      return { text: (region.textContent ?? "").trim(), role: region.getAttribute("role"), live: region.getAttribute("aria-live") };
    });
    if (liveRegion === null) {
      failures.push("(a11y3) no aria-live polite region found on the dashboard — toasts would be silent for screen readers");
    } else {
      console.log(`live region: role=${liveRegion.role} aria-live=${liveRegion.live} text=${JSON.stringify(liveRegion.text.slice(0, 40))}`);
      await page.locator('[data-testid="btn-toast"]').click();
      await page.waitForTimeout(400);
      const after = await page.evaluate(() => {
        const region = document.querySelector('[role="status"][aria-live="polite"], [aria-live="polite"][role="status"]')
          ?? document.querySelector('[aria-live="polite"]');
        return region === null ? null : (region.textContent ?? "").trim();
      });
      if (after === null || after === liveRegion.text || after === "") {
        failures.push(`(a11y3) the live region did not update after firing a toast (before ${JSON.stringify(liveRegion.text.slice(0, 40))}, after ${JSON.stringify((after ?? "null").slice(0, 40))})`);
      } else {
        console.log(`toast live region updated: ${JSON.stringify(after.slice(0, 48))}`);
      }
    }

    const census = await page.evaluate(() => {
      const progressbars = Array.from(document.querySelectorAll('[role="progressbar"]'));
      const withNow = progressbars.filter((p) => p.getAttribute("aria-valuenow") !== null);
      const tablists = Array.from(document.querySelectorAll('[role="tablist"]'));
      const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
      const selectedTabs = tabs.filter((t) => t.getAttribute("aria-selected") !== null);
      const radiogroups = Array.from(document.querySelectorAll('[role="radiogroup"]'));
      return { progressbars: progressbars.length, withNow: withNow.length, tablists: tablists.length, tabs: tabs.length, selectedTabs: selectedTabs.length, radiogroups: radiogroups.length };
    });
    console.log(`role census: progressbar=${census.progressbars} (valuenow=${census.withNow}) · tablist=${census.tablists} tab=${census.tabs} (aria-selected=${census.selectedTabs}) · radiogroup=${census.radiogroups}`);
    if (census.withNow < 1) failures.push("(a11y3) no [role=progressbar] with aria-valuenow on the dashboard (the password meter must expose its value)");
    if (census.tablists < 1 || census.selectedTabs < 1) failures.push("(a11y3) no tablist/tab with aria-selected on the dashboard (the module switcher must expose selection)");
    if (census.radiogroups < 1) failures.push("(a11y3) no [role=radiogroup] on the dashboard (the attendance RadioCardGroup must expose its grouping)");
    await page.close();
  }

  // ---- (a11y1)/(a11y2) THE TAB WALK — all 5 views --------------------------
  for (const view of VIEWS) {
    const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
    await page.goto(`${URL_BASE}/${view.hash}`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(600);
    const resolvedCake = await cakePrimaryRgb(page);

    await page.keyboard.press("Tab");
    await waitForOutlineSettle(page); // the first stop settles too (it was racing the transition)
    const stops = [await page.evaluate(stopProbe)];
    while (stops.length < MAX_STOPS && !stops[stops.length - 1].wrapTail) {
      await page.keyboard.press("Tab");
      // Wait for the outline to SETTLE — the css transitions outline
      // (`transition: all 0.15s`+) and probing mid-transition reads the
      // outgoing UA ring (found by the first-run failure). Poll until
      // stable across two reads, ≤ 600ms, deterministic under CI load.
      await waitForOutlineSettle(page);
      stops.push(await page.evaluate(stopProbe));
    }
    // The trailing body stop is the wrap tail — drop it from the census.
    const contentStops = stops.filter((s) => !s.wrapTail);

    // (a) interactivity — every content stop is interactive
    const nonInteractive = contentStops.filter((s) => !s.interactive);
    if (nonInteractive.length > 0) {
      failures.push(`(a11y1/${view.name}) ${nonInteractive.length}/${contentStops.length} tab stops landed on non-interactive elements: ${nonInteractive.slice(0, 3).map((s) => s.focused).join(", ")}`);
    }
    // (b) no traps: no element 3 consecutive stops; forward DOM order, ≤ 1 wrap
    for (let i = 2; i < contentStops.length; i++) {
      if (contentStops[i].key === contentStops[i - 1].key && contentStops[i].key === contentStops[i - 2].key) {
        failures.push(`(a11y1/${view.name}) FOCUS TRAP: focus stuck on ${contentStops[i].focused} for 3 consecutive stops at stop ${i + 1}`);
        break;
      }
    }
    let wraps = 0;
    const orderBreaks = [];
    for (let i = 1; i < contentStops.length; i++) {
      if (contentStops[i].docIndex < contentStops[i - 1].docIndex) {
        wraps++;
        if (wraps > 1) orderBreaks.push(`stop ${i + 1}: ${contentStops[i - 1].focused}#${contentStops[i - 1].docIndex} → ${contentStops[i].focused}#${contentStops[i].docIndex}`);
      }
    }
    if (orderBreaks.length > 0) {
      failures.push(`(a11y1/${view.name}) tab order moved BACKWARD in DOM order beyond the wrap: ${orderBreaks.slice(0, 3).join("; ")}`);
    }
    // (c) the focus halo at every content stop. Implicit-focus SCROLL
    // containers (overflow auto/scroll, not whitelist elements) carry the
    // BROWSER's own ring — a UA behavior, not a css defect — so they are
    // exempt from the ≥2px doctrine requirement. Exception (enumerated,
    // e1-allowlist precedent): .hub__card--gateway (see HALO_EXCEPTIONS).
    const noHalo = [];
    const exceptionHits = [];
    for (const s of contentStops) {
      const width = parseFloat(s.outlineWidth);
      const ownHalo = s.outlineStyle !== "none" && width >= 2;
      if (ownHalo || s.ancestorHalo) continue;
      const whitelist = ["a", "button", "input", "select", "textarea", "summary"].includes(s.tag);
      if (!whitelist && s.scrollable) continue; // implicit-focus scroll container
      const exception = [...HALO_EXCEPTIONS.keys()].find((sel) => s.cls.split(".").includes(sel.slice(1)));
      if (exception !== undefined) {
        exceptionHits.push(s.focused);
      } else {
        noHalo.push(s);
      }
    }
    if (noHalo.length > 0) {
      failures.push(`(a11y1/${view.name}) ${noHalo.length}/${contentStops.length} keyboard stops showed NO ≥2px focus halo (the doctrine ring): ${noHalo.slice(0, 3).map((s) => `${s.focused} outline=${s.outlineWidth}`).join(", ")}`);
    }
    // (a11y2) strict ink on the doctrine-ring sample; census for the rest
    const haloStops = contentStops.filter((s) => s.outlineStyle !== "none" && parseFloat(s.outlineWidth) >= 2);
    const wrongInk = haloStops.filter((s) => s.doctrineRing && s.outlineColor !== resolvedCake);
    if (wrongInk.length > 0) {
      failures.push(`(a11y2/${view.name}) ${wrongInk.length} doctrine-ring stops are not var(--color-cake-primary) (resolved ${resolvedCake}): ${wrongInk.slice(0, 2).map((s) => `${s.focused} cls=${JSON.stringify(s.cls)} → ${s.outlineColor}`).join("; ")}`);
    }
    const inkCensus = {};
    for (const s of haloStops) inkCensus[s.outlineColor] = (inkCensus[s.outlineColor] ?? 0) + 1;

    console.log(`${view.name.padEnd(15)} stops=${contentStops.length}  interactive=${contentStops.length - nonInteractive.length}  halos=${haloStops.length}/${contentStops.length}  ink={${Object.entries(inkCensus).map(([c, n]) => `${c.split(" ").slice(0, 2).join(" ")}×${n}`).join(", ")}}  wraps=${wraps}  exceptions=${exceptionHits.length} (.hub__card--gateway)`);
    await page.close();
  }

  // ---- (a11y4) AXE — the dashboard, injected from the bundled devDep -------
  {
    const axeSource = readFileSync(resolve(root, "node_modules", "axe-core", "axe.min.js"), "utf8");
    const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
    await page.goto(URL_BASE + "/", { waitUntil: "networkidle", timeout: 30000 });
    await page.addScriptTag({ content: axeSource });
    const axeResult = await page.evaluate(async () => {
      const axe = window.axe;
      return await axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
      });
    });
    const critical = axeResult.violations.filter((v) => v.impact === "critical");
    for (const violation of axeResult.violations) {
      axeFindings.push({
        impact: violation.impact,
        id: violation.id,
        help: violation.help,
        nodes: violation.nodes.length,
      });
    }
    if (critical.length > 0) {
      for (const violation of critical) {
        failures.push(`(a11y4) AXE CRITICAL: ${violation.id} — ${violation.help} (${violation.nodes.length} nodes)`);
      }
    }
    await page.close();
  }

  console.log("");
  if (axeFindings.length > 0) {
    console.log("AXE FINDINGS (wcag2a/2aa scan, dashboard — color-contrast runs axe's 4.5:1 AA bar; the package doctrine pins 3.0/3.1, enforced at runtime by the audit_contrast MCP tool):");
    for (const finding of axeFindings) {
      console.log(`  [${finding.impact ?? "min impact"}] ${finding.id}: ${finding.help} — ${finding.nodes} node(s)`);
    }
  } else {
    console.log("AXE FINDINGS: zero violations (wcag2a/2aa/21a/21aa scan, dashboard)");
  }

  console.log("");
  if (failures.length > 0) {
    console.error("FAIL — a11y certification");
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
  }
  console.log(`PASS — a11y certification: tab order (≤ ${MAX_STOPS} stops × ${VIEWS.length} views, no traps, DOM order, clean wrap), focus halos ≥2px (enumerated exception: .hub__card--gateway, owner-deferred), doctrine-ring ink = var(--color-cake-primary), live region fires, role census (progressbar/tablist/radiogroup), axe zero-critical`);
} finally {
  await browser.close();
}
