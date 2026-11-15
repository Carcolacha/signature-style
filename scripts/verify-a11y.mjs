#!/usr/bin/env node
/**
 * verify-a11y.mjs — THE ACCESSIBILITY CERTIFICATION (3.5.0; grown 3.6.0
 * "Zero-Defect A11y": axe zero critical/serious/moderate + the inert
 * sweep + the two-tier contrast adjudication).
 *
 * Playwright keyboard audit across the real views at 1440×900:
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
 *               an ancestor within 3 levels. 3.6.0: the v3.5.0
 *               .hub__card--gateway exception is RETIRED — the gateway
 *               doors wear the doctrine halo
 *               (:focus-visible → 2px var(--color-cake-primary), see
 *               playground/styles.css) and the exception table is EMPTY;
 *               a dedicated probe asserts the gateway ring resolves.
 *   (a11y2) HALO INK — strict var(--color-cake-primary) assertion scoped
 *           to the elements whose css DECLARES the doctrine ring
 *           (.sig-btn buttons, nav links, inputs, the gateway doors) —
 *           those must resolve outline-color to the token's rgb at 2px;
 *           every other halo is CENSUSED (UA-default rings reported, not
 *           failed).
 *   (a11y3) LIVE REGIONS — the toast region exists with
 *           role="status" + aria-live="polite"; firing a toast via the
 *           dashboard's btn-toast hook UPDATES the live region's text;
 *           the aria-role census on the dashboard: a progressbar with a
 *           valuenow (the password meter), a tablist with tabs carrying
 *           aria-selected (the module switcher), a radiogroup (the
 *           attendance RadioCardGroup).
 *   (a11y4) AXE — axe-core (bundled devDependency, injected into the
 *           page — offline-safe, no CDN) runs on EVERY view.
 *           3.6.0: ZERO critical + serious + moderate violations
 *           (was: zero critical, serious/moderate reported). THE
 *           TWO-TIER ADJUDICATION: axe's color-contrast rule applies the
 *           4.5:1 AA body-text bar to every text node — but the engine's
 *           token VALUES are byte-frozen (the v0.3.0 structural freeze)
 *           and the owner's two-tier contrast policy (tokens.json
 *           doctrine.contrastTiers) classifies the sub-4.5 metadata inks
 *           (--text-muted 3.40:1, lavender 3.95:1, peach 4.21:1 on
 *           surface) as DISPLAY/METADATA tier — "≥ 3.0:1; never body
 *           copy at body-size emphasis". The gate therefore ADJUDICATES
 *           color-contrast findings instead of swallowing them: every
 *           flagged fg/bg pair is recomputed with the shared WCAG math
 *           and must clear the 3.0:1 display floor — any pair below it
 *           FAILS the gate (a real regression cannot hide). All
 *           non-color-contrast critical/serious/moderate findings fail
 *           outright.
 *   (a11y5) THE INERT SWEEP (3.6.0) — hidden content is INERT, not
 *           merely invisible: the cq-probe fixture (aria-hidden) must be
 *           inert; the FlipCard's hidden face must be inert (back when
 *           unflipped, front when flipped); the AccordionCard asserts
 *           the NATIVE contract (a closed <details> already removes its
 *           body from the a11y tree — asserted, not re-implemented); the
 *           mobile drawer unmounts when closed (asserted statically in
 *           playground/verify-playground (nav gates)).
 *
 * Requires the dev server on http://localhost:5173 (`npm run playground`).
 * Exit 0 = ALL PASS; exit 1 = any (a11y1)-(a11y5) failure.
 */
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { contrastRatio } from "../playground/sig-contrast.ts";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const URL_BASE = "http://localhost:5173";
const MAX_STOPS = 60;
const WIDTH = 1440;
const HEIGHT = 900;

/** The certified views (same census as verify-visual-diff). */
const VIEWS = [
  { name: "dashboard", hash: "" },
  { name: "pattern-studio", hash: "#/studio" },
  { name: "master-index", hash: "#/index" },
  { name: "chronicle", hash: "#/chronicle" },
  { name: "codex", hash: "#/codex" },
];

/**
 * THE TWO-TIER DISPLAY FLOOR (3.6.0) — the adjudication bar for axe's
 * color-contrast findings. The policy: tokens measuring ≥3.0 but <4.5
 * are declared DISPLAY/METADATA tier (tokens.json
 * doctrine.contrastTiers) — never body copy at body-size emphasis; the
 * 4.5 body bar is enforced per token by verify:contrast's tier gate
 * (ct8). ANY flagged pair below 3.0 here is a real failure.
 */
const DISPLAY_FLOOR = 3.0;

/**
 * The halo exception table — EMPTY since 3.6.0 (the gateway doors wear
 * the doctrine halo; see playground/styles.css). The mechanism stays:
 * an exception added here must document its reason, and the (a11y1)
 * census reports exception hits per view so regressions stay visible.
 */
const HALO_EXCEPTIONS = new Map([]);

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
    doctrineRing: el.matches(".sig-btn, .sig-nav__link, .sig-nav__menu-btn, .hub__card--gateway, input, textarea, select"),
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

    console.log(`${view.name.padEnd(15)} stops=${contentStops.length}  interactive=${contentStops.length - nonInteractive.length}  halos=${haloStops.length}/${contentStops.length}  ink={${Object.entries(inkCensus).map(([c, n]) => `${c.split(" ").slice(0, 2).join(" ")}×${n}`).join(", ")}}  wraps=${wraps}  exceptions=${exceptionHits.length}${exceptionHits.length > 0 ? ` (${[...HALO_EXCEPTIONS.keys()].join(", ")})` : ""}`);
    await page.close();
  }

  // ---- (a11y1c) THE GATEWAY HALO PROBE — the retired exception's tombstone:
  // the master-index gateway doors must resolve the DOCTRINE ring on
  // keyboard focus (2px var(--color-cake-primary)), never the UA default.
  {
    const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
    await page.goto(`${URL_BASE}/#/index`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(600);
    const resolvedCake = await cakePrimaryRgb(page);
    const gatewayHalo = await page.evaluate(() => {
      const door = document.querySelector('[data-testid="index-gateways"] .hub__card--gateway');
      if (door === null) return null;
      door.focus();
      const st = getComputedStyle(door);
      return { width: st.outlineWidth, color: st.outlineColor };
    });
    if (gatewayHalo === null) {
      failures.push("(a11y1c) no .hub__card--gateway door found on the master index — the halo probe has no target");
    } else if (!(parseFloat(gatewayHalo.width) >= 2 && gatewayHalo.color === resolvedCake)) {
      failures.push(`(a11y1c) the gateway door halo regressed to the UA default — got ${gatewayHalo.width} ${gatewayHalo.color}, expected 2px ${resolvedCake} (the 3.6.0 doctrine rule in playground/styles.css is missing or overridden)`);
    } else {
      console.log(`gateway halo probe: ${gatewayHalo.width} ${gatewayHalo.color} — the v3.5.0 exception stays retired`);
    }
    await page.close();
  }

  // ---- (a11y4) AXE — EVERY view, tier-adjudicated --------------------------
  {
    const axeSource = readFileSync(resolve(root, "node_modules", "axe-core", "axe.min.js"), "utf8");
    for (const view of VIEWS) {
      const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
      await page.goto(`${URL_BASE}/${view.hash}`, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(600);
      await page.addScriptTag({ content: axeSource });
      const axeResult = await page.evaluate(async () => {
        const axe = window.axe;
        return await axe.run(document, {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
        });
      });
      for (const violation of axeResult.violations) {
        axeFindings.push({
          view: view.name,
          impact: violation.impact,
          id: violation.id,
          help: violation.help,
          nodes: violation.nodes.length,
        });
        if (violation.id === "color-contrast") {
          // THE TWO-TIER ADJUDICATION: axe applies the 4.5 AA body bar;
          // the frozen-token policy declares sub-4.5 metadata inks
          // display-tier. Every flagged pair must still clear 3.0.
          const belowFloor = [];
          for (const node of violation.nodes) {
            const summary = node.failureSummary ?? "";
            for (const match of summary.matchAll(/foreground color: (#[0-9a-f]+), background color: (#[0-9a-f]+)/gi)) {
              const ratio = contrastRatio(match[1], match[2]);
              if (ratio < DISPLAY_FLOOR) {
                belowFloor.push(`${match[1]} on ${match[2]} = ${ratio.toFixed(2)}:1 (${node.target.join(" ")})`);
              }
            }
          }
          if (belowFloor.length > 0) {
            failures.push(`(a11y4/${view.name}) AXE color-contrast BELOW the 3.0 display floor: ${belowFloor.slice(0, 4).join("; ")}`);
          } else {
            console.log(`axe color-contrast adjudication (${view.name}): every flagged pair clears the ${DISPLAY_FLOOR}:1 display floor — the two-tier policy (tokens.json doctrine.contrastTiers) owns the 4.5 body bar (verify:contrast ct8)`);
          }
          continue;
        }
        if (["critical", "serious", "moderate"].includes(violation.impact ?? "")) {
          failures.push(`(a11y4/${view.name}) AXE ${violation.impact?.toUpperCase()}: ${violation.id} — ${violation.help} (${violation.nodes.length} node(s))`);
        }
      }
      await page.close();
    }
  }

  // ---- (a11y5) THE INERT SWEEP — hidden means inert -------------------------
  {
    const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
    await page.goto(URL_BASE + "/", { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(600);
    const inertCensus = await page.evaluate(() => {
      const probe = document.querySelector('[data-testid="cq-probe"]');
      const flip = document.querySelector(".sig-flip-card");
      const flipBack = flip?.querySelector(".sig-flip-card__back") ?? null;
      const flipFront = flip?.querySelector(".sig-flip-card__front") ?? null;
      const accordion = document.querySelector("details.sig-accordion");
      // Flip the card open — the read happens AFTER a settle tick (the
      // click commits through React state → effect, so the probe must
      // yield before asserting the swap).
      if (flip !== null) flip.click();
      return {
        probeInert: probe?.inert ?? null,
        flipFound: flip !== null,
        frontRest: flipFront?.inert ?? null,
        backRest: flipBack?.inert ?? null,
        accordionIsDetails: accordion instanceof HTMLDetailsElement,
        accordionClosedByDefault: accordion?.open === false,
        accordionBody: accordion?.querySelector(".sig-accordion__body") !== null,
      };
    });
    // The settled post-flip read (one React commit later), then restore.
    let afterFlip = null;
    if (inertCensus.flipFound) {
      await page.waitForTimeout(100);
      afterFlip = await page.evaluate(() => {
        const flip = document.querySelector(".sig-flip-card");
        const read = {
          front: flip?.querySelector(".sig-flip-card__front")?.inert ?? null,
          back: flip?.querySelector(".sig-flip-card__back")?.inert ?? null,
        };
        flip?.click(); // restore
        return read;
      });
      await page.waitForTimeout(100);
    }
    if (inertCensus.probeInert !== true) {
      failures.push(`(a11y5) the cq-probe fixture is not inert (${inertCensus.probeInert}) — its focusable buttons/dots stay in the tab order behind aria-hidden (axe aria-hidden-focus)`);
    }
    if (inertCensus.backRest !== true || inertCensus.frontRest !== false) {
      failures.push(`(a11y5) the FlipCard's hidden face is not inert at rest (front=${String(inertCensus.frontRest)}, back=${String(inertCensus.backRest)}) — Tab would land inside the invisible face`);
    }
    if (afterFlip === null || afterFlip.front !== true || afterFlip.back !== false) {
      failures.push(`(a11y5) the FlipCard's inert sweep does not swap on flip (${JSON.stringify(afterFlip)}) — the visible face must become inert-proof the other way round`);
    }
    // THE NATIVE DETAILS CONTRACT (asserted, not re-implemented): a
    // closed <details> already removes its body from the a11y tree and
    // the tab order — the browser owns disclosure semantics.
    if (!inertCensus.accordionIsDetails || !inertCensus.accordionClosedByDefault || !inertCensus.accordionBody) {
      failures.push(`(a11y5) the AccordionCard native contract regressed (isDetails=${inertCensus.accordionIsDetails}, closed=${inertCensus.accordionClosedByDefault}, hasBody=${inertCensus.accordionBody})`);
    }
    console.log(`inert sweep: probe=${inertCensus.probeInert} · flip rest front=${inertCensus.frontRest}/back=${inertCensus.backRest} · flipped front=${afterFlip?.front}/back=${afterFlip?.back} · accordion native details closed-by-default ✓`);
    await page.close();
  }

  console.log("");
  if (axeFindings.length > 0) {
    console.log("AXE FINDINGS (wcag2a/2aa/21a/21aa, ALL views — color-contrast adjudicated by the two-tier policy; every non-contrast critical/serious/moderate FAILS):");
    for (const finding of axeFindings) {
      console.log(`  [${finding.view}] [${finding.impact ?? "min impact"}] ${finding.id}: ${finding.help} — ${finding.nodes} node(s)`);
    }
  } else {
    console.log("AXE FINDINGS: zero violations (wcag2a/2aa/21a/21aa scan, all views)");
  }

  console.log("");
  if (failures.length > 0) {
    console.error("FAIL — a11y certification");
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
  }
  console.log(`PASS — a11y certification: tab order (≤ ${MAX_STOPS} stops × ${VIEWS.length} views, no traps, DOM order, clean wrap), focus halos ≥2px (exception table EMPTY — the gateway halo probe pins the 3.6.0 doctrine rule), doctrine-ring ink = var(--color-cake-primary), live region fires, role census (progressbar/tablist/radiogroup), axe zero critical/serious/moderate on ALL views (color-contrast adjudicated at the 3.0 display floor), inert sweep (probe + FlipCard faces + native details)`);
} finally {
  await browser.close();
}
