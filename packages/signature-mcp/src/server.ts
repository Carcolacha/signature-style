/**
 * server.ts — @edwyn/signature-mcp, THE VISUAL CORTEX AS A PRODUCT (3.5.0).
 *
 * This is the standalone promotion of the proven tools/mcp-viz inspector
 * (v1.7.0 server, hardened across v2.2.0 → v3.4.0). The repo-local
 * tools/mcp-viz/ is retired; its logic lives on here, verbatim where it
 * was proven (the bounding-rect mapper, the settled-page helper, the
 * graceful unreachable-URL error with the `npm run playground` hint),
 * plus THREE new tools:
 *
 *   inspect_layout          → structured JSON of every element matching
 *                             the app's known selectors: tag, classes,
 *                             bounding rect, text, visibility — plus a
 *                             per-class coverage summary. (PORTED
 *                             VERBATIM from tools/mcp-viz/server.ts.)
 *
 *   audit_contrast          → NEW. Runtime WCAG 2.x contrast audit: for
 *                             every text-bearing element in the sweep,
 *                             resolve the EFFECTIVE background (walk
 *                             ancestors for the first non-transparent
 *                             background-color; if none, body/html;
 *                             last resort the documented #1E1E2E
 *                             assumption) and the EFFECTIVE text color
 *                             (computed color IS the inherited value),
 *                             then report {selector, fg, bg, ratio,
 *                             pass} per element plus a worst-first
 *                             failure summary against minRatio (3.0:1,
 *                             the doctrine graphical-objects floor).
 *
 *   audit_e1_shadows        → NEW. The e1 treaty OPERATIONALIZED AT
 *                             RUNTIME: sweep every element; any computed
 *                             box-shadow ≠ "none" is reported with its
 *                             selector chain and an `allowed` verdict —
 *                             allowed = the element (or an ancestor)
 *                             matches the sanctioned surface/card
 *                             hooks (.sig-surface-card, .sig-card, the
 *                             [data-elevation] ladder per the (e1)/(elev)
 *                             amendments). Returns the violations list
 *                             (shadows OUTSIDE sanction) + the
 *                             sanctioned count.
 *
 *   capture_viewport_matrix → NEW. For each viewport in the matrix
 *                             (default 375×812 / 768×1024 / 1440×900 /
 *                             1920×1080): set size, load + settle,
 *                             screenshot to disk (PNG). Returns the flat
 *                             matrix of {viewport, path, bytes}.
 *
 * One headless Chromium is launched lazily and shared for the server's
 * lifetime; it is closed on process shutdown signals.
 *
 * Prerequisite: the playground dev server must be running (`npm run
 * playground` from the repo root, default http://localhost:5173). Every
 * tool returns a graceful error pointing at that command if the URL is
 * unreachable.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { chromium, type Browser, type Page } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

/** Fallback dir when the requested path is not writable (e.g. EACCES). */
const FALLBACK_SCREENSHOT_DIR = "/tmp/visual-cortex";

/** Dashboard URL the tools navigate to when `url` is omitted. */
const DEFAULT_URL = "http://localhost:5173";

/** Default output dir for the viewport matrix (flat — one PNG per viewport). */
const DEFAULT_MATRIX_DIR = "/tmp/opencode/viewport-matrix";

/** Last-resort background for audit_contrast, documented: the Mocha base. */
const ASSUMED_BG = "#1E1E2E";

/**
 * Default selector sweep — everything the app's CSS contract knows about:
 * testid hooks, timeline anatomy, progress bars, the official surface
 * primitives + the hub-local metric/button classes, the data-module
 * contract, the bento + master-index + graphs contracts, and the six
 * zero-react custom elements (the sweep is PORTED VERBATIM from the
 * proven 3.4.0 inspector).
 */
const DEFAULT_SELECTORS: readonly string[] = [
  "[data-testid]",
  ".sig-timeline__node",
  ".sig-timeline__item",
  ".sig-timeline__header",
  ".sig-progress",
  ".sig-progress__fill",
  ".sig-surface-card",
  ".sig-shell",
  ".sig-btn",
  ".sig-stat-card",
  ".hub__metric",
  ".hub__btn",
  ".sig-data-table",
  ".sig-tabs__tab",
  ".sig-callout",
  ".sig-carousel__dot",
  ".sig-chronicle__item",
  ".sig-graph__node",
  ".sig-bars__bar",
  ".sig-tmanager__count",
  // THE ZERO-REACT SURFACE: the six sig-* custom elements (the studio's
  // Set 07 mounts them; the cortex must see the shadow hosts).
  "sig-surface-card",
  "sig-badge",
  "sig-progress-bar",
  "sig-stat-ring",
  "sig-callout",
  "sig-carousel",
];

/** The e1-treaty sanctioned surface/card hooks (element OR ancestor). */
const SANCTIONED_SURFACES = ".sig-surface-card, .sig-card, [data-elevation]";

/** Default viewport matrix for capture_viewport_matrix. */
const DEFAULT_VIEWPORTS: ReadonlyArray<readonly [number, number]> = [
  [375, 812],
  [768, 1024],
  [1440, 900],
  [1920, 1080],
];

/** Settle time after networkidle, letting entry animations finish. */
const SETTLE_MS = 600;

/** One matched element, as reported to the AI session. */
interface LayoutHit {
  selector: string;
  tag: string;
  classes: string[];
  rect: { x: number; y: number; width: number; height: number };
  text: string;
  visible: boolean;
}

/** Per-class visibility accounting across all matched elements. */
interface ClassCoverage {
  [className: string]: { total: number; visible: number; notVisible: number };
}

/** One element verdict from audit_contrast. */
interface ContrastRow {
  selector: string;
  tag: string;
  fg: string;
  bg: string;
  ratio: number;
  pass: boolean;
}

/** One shadow finding from audit_e1_shadows. */
interface ShadowRow {
  selectorChain: string;
  shadow: string;
  allowed: boolean;
}

/** Shared browser instance — launched on first use, closed on shutdown. */
let browser: Browser | null = null;

/**
 * Get or lazily launch the shared headless Chromium.
 *
 * Returns:
 *   The live Playwright Browser instance for this server process.
 */
async function getBrowser(): Promise<Browser> {
  if (browser === null || !browser.isConnected()) {
    browser = await chromium.launch({ headless: true });
  }
  return browser;
}

/**
 * Open a fresh page on `url`, waiting for network idle plus a settle
 * period so entry animations complete before measurement.
 *
 * Args:
 *   url: Absolute URL to navigate to.
 *
 * Returns:
 *   The loaded, settled page. Caller owns closing it.
 */
async function openSettledPage(url: string): Promise<Page> {
  const context = await (await getBrowser()).newContext();
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(SETTLE_MS);
  return page;
}

/**
 * Uniform graceful failure for an unreachable `url` — the tool degrades
 * into a helpful message instead of an SDK stack trace.
 *
 * Args:
 *   target: The URL that could not be reached.
 *   reason: The underlying error message.
 *
 * Returns:
 *   An MCP isError response pointing at `npm run playground`.
 */
function unreachable(target: string, reason: string) {
  return {
    isError: true,
    content: [{
      type: "text" as const,
      text:
        `Cannot reach ${target} (${reason}).\n` +
        "The Visual Cortex needs the playground running: start it with " +
        "`npm run playground` from the signature-style repo root, then retry.",
    }],
  };
}

/**
 * In-page mapper: every element matching ANY of the selectors becomes one
 * layout hit with selector identity, tag, classes, rect, text, visibility.
 *
 * Args:
 *   selectors: CSS selectors to sweep with.
 *
 * Returns:
 *   Flat array of LayoutHit records, one per (element, selector) match.
 */
function mapLayout(selectors: readonly string[]): LayoutHit[] {
  const hits: LayoutHit[] = [];
  for (const selector of selectors) {
    for (const el of document.querySelectorAll(selector)) {
      const rect = el.getBoundingClientRect();
      hits.push({
        selector,
        tag: el.tagName.toLowerCase(),
        classes: Array.from(el.classList),
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        text: (el.textContent ?? "").trim().slice(0, 40),
        visible: rect.width > 0 && rect.height > 0,
      });
    }
  }
  return hits;
}

/**
 * Summarize per-unique-class visibility across all hits.
 *
 * Args:
 *   hits: The mapped layout hits.
 *
 * Returns:
 *   ClassCoverage: per class name, total/visible/notVisible counts.
 */
function coverage(hits: readonly LayoutHit[]): ClassCoverage {
  const summary: ClassCoverage = {};
  for (const hit of hits) {
    for (const cls of hit.classes) {
      const entry = (summary[cls] ??= { total: 0, visible: 0, notVisible: 0 });
      entry.total += 1;
      if (hit.visible) {
        entry.visible += 1;
      } else {
        entry.notVisible += 1;
      }
    }
  }
  return summary;
}

/**
 * Write the PNG to `outPath`, creating parent dirs. If `outPath` is not
 * writable (EACCES/EPERM/ENOENT on a locked dir), retry under
 * /tmp/visual-cortex/ so the tool degrades instead of dying.
 *
 * Args:
 *   buffer:  PNG bytes to persist.
 *   outPath: Requested absolute file path.
 *
 * Returns:
 *   The path actually written, plus a note when a fallback was used.
 */
async function persistPng(
  buffer: Buffer,
  outPath: string,
): Promise<{ writtenPath: string; note?: string }> {
  try {
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, buffer);
    return { writtenPath: outPath };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    const fallbackPath = `${FALLBACK_SCREENSHOT_DIR}/${outPath.split("/").pop() ?? "dashboard-mcp.png"}`;
    await mkdir(dirname(fallbackPath), { recursive: true });
    await writeFile(fallbackPath, buffer);
    return {
      writtenPath: fallbackPath,
      note: `requested path ${outPath} unwritable (${reason}); wrote fallback instead`,
    };
  }
}

/**
 * URL → filesystem slug for matrix screenshot filenames.
 *
 * Args:
 *   url: The absolute URL being captured.
 *
 * Returns:
 *   A lowercase [a-z0-9-] slug, e.g. "localhost-5173" or
 *   "localhost-5173-studio".
 */
function urlSlug(url: string): string {
  const slug = url
    .replace(/^https?:\/\//, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return slug === "" ? "page" : slug;
}

/** The shared McpServer instance advertising the visual cortex tools. */
const server = new McpServer({ name: "visual-cortex", version: "3.5.0" });

server.registerTool(
  "inspect_layout",
  {
    title: "Inspect App Layout",
    description:
      "Measure the rendered Signature Style app: every element matching the given selectors with tag, classes, bounding rect, text and visibility, plus per-class coverage. Requires the playground dev server (`npm run playground`).",
    inputSchema: {
      url: z.string().url().optional().describe("App URL (default http://localhost:5173)"),
      selectors: z.array(z.string()).optional().describe(
        "CSS selectors to sweep (default: app anatomy)",
      ),
    },
  },
  async ({ url, selectors }) => {
    const target = url ?? DEFAULT_URL;
    const sweep = selectors ?? DEFAULT_SELECTORS;
    let page: Page;
    try {
      page = await openSettledPage(target);
    } catch (err) {
      return unreachable(target, err instanceof Error ? err.message : String(err));
    }
    try {
      const hits = await page.evaluate(mapLayout, sweep);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ url: target, hitCount: hits.length, hits, coverage: coverage(hits) }),
        }],
      };
    } finally {
      await page.context().close();
    }
  },
);

server.registerTool(
  "audit_contrast",
  {
    title: "Audit Text Contrast (Runtime WCAG)",
    description:
      "Runtime WCAG 2.x contrast audit of the rendered Signature Style app: for every text-bearing element in the sweep, resolves the effective background (first non-transparent ancestor background-color; else body/html; else the documented #1E1E2E assumption) and the effective text color, computes the ratio, and reports per-element {selector, fg, bg, ratio, pass} plus a worst-first failure summary. Floor defaults to 3.0:1 (the doctrine graphical-objects floor). Requires the playground dev server (`npm run playground`).",
    inputSchema: {
      url: z.string().url().optional().describe("App URL (default http://localhost:5173)"),
      selectors: z.array(z.string()).optional().describe(
        "CSS selectors to sweep (default: app anatomy)",
      ),
      minRatio: z.number().optional().describe(
        "WCAG ratio floor (default 3.0)",
      ),
    },
  },
  async ({ url, selectors, minRatio }) => {
    const target = url ?? DEFAULT_URL;
    const sweep = selectors ?? DEFAULT_SELECTORS;
    const floor = minRatio ?? 3.0;
    let page: Page;
    try {
      page = await openSettledPage(target);
    } catch (err) {
      return unreachable(target, err instanceof Error ? err.message : String(err));
    }
    try {
      const rows = await page.evaluate(
        (cfg) => {
          const { sweepSelectors, ratioFloor, assumedBg } = cfg;
          /** Parse "rgb(r, g, b)" / "rgba(r, g, b, a)" into channels. */
          function parseRgb(color: string): { r: number; g: number; b: number; a: number } | null {
            const m = color.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i);
            if (m === null) return null;
            return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
          }
          /** WCAG 2.x relative luminance of 0-255 sRGB channels. */
          function relLuminance(r: number, g: number, b: number): number {
            const lin = (c: number): number => {
              const v = c / 255;
              return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
            };
            return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
          }
          /** WCAG contrast ratio, order-independent. */
          function ratioOf(fg: string, bg: string): number {
            const f = parseRgb(fg);
            const b = parseRgb(bg);
            if (f === null || b === null) return -1;
            const l1 = relLuminance(f.r, f.g, f.b) + 0.05;
            const l2 = relLuminance(b.r, b.g, b.b) + 0.05;
            return (Math.max(l1, l2)) / (Math.min(l1, l2));
          }
          /** Alpha-blend fg over bg (per-channel, 0-255). */
          function blend(fg: string, bg: string): string {
            const f = parseRgb(fg);
            const b = parseRgb(bg);
            if (f === null || b === null || f.a >= 1) return fg;
            const out = (x: number, y: number): number => Math.round(x * f.a + y * (1 - f.a));
            return `rgb(${out(f.r, b.r)}, ${out(f.g, b.g)}, ${out(f.b, b.b)})`;
          }
          /** Effective background: walk ancestors for the first painted bg. */
          function effectiveBg(el: Element): string {
            let node: Element | null = el;
            while (node !== null) {
              const bg = getComputedStyle(node).backgroundColor;
              const parsed = parseRgb(bg);
              if (parsed !== null && parsed.a > 0) return bg;
              node = node.parentElement;
            }
            // No painted background anywhere up the tree: body/html were
            // part of the walk, so the documented Mocha-base assumption is
            // the honest last resort.
            return assumedBg;
          }
          const rows: Array<{ selector: string; tag: string; fg: string; bg: string; ratio: number; pass: boolean }> = [];
          for (const selector of sweepSelectors) {
            for (const el of document.querySelectorAll(selector)) {
              const text = (el.textContent ?? "").trim();
              if (text === "") continue; // text nodes only
              const rect = el.getBoundingClientRect();
              if (!(rect.width > 0 && rect.height > 0)) continue; // visible only
              const rawFg = getComputedStyle(el).color;
              const bg = effectiveBg(el);
              const fg = blend(rawFg, bg);
              const ratio = ratioOf(fg, bg);
              rows.push({ selector, tag: el.tagName.toLowerCase(), fg, bg, ratio: Math.round(ratio * 1000) / 1000, pass: ratio >= ratioFloor });
            }
          }
          return rows;
        },
        { sweepSelectors: sweep, ratioFloor: floor, assumedBg: ASSUMED_BG },
      );
      const passCount = rows.filter((r) => r.pass).length;
      const failures = rows.filter((r) => !r.pass).sort((a, b) => a.ratio - b.ratio);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            url: target,
            minRatio: floor,
            elements: rows,
            summary: { passCount, failCount: failures.length, failures },
          }),
        }],
      };
    } finally {
      await page.context().close();
    }
  },
);

server.registerTool(
  "audit_e1_shadows",
  {
    title: "Audit E1 Shadow Treaty (Runtime)",
    description:
      "Operationalizes the e1 treaty at runtime: sweeps EVERY element of the rendered Signature Style app and reports each computed box-shadow with an `allowed` verdict — allowed = the element (or an ancestor) matches the sanctioned surface/card hooks (.sig-surface-card / .sig-card / the [data-elevation] ladder). Returns the violations list (shadows OUTSIDE sanction) plus the sanctioned count. Requires the playground dev server (`npm run playground`).",
    inputSchema: {
      url: z.string().url().optional().describe("App URL (default http://localhost:5173)"),
    },
  },
  async ({ url }) => {
    const target = url ?? DEFAULT_URL;
    let page: Page;
    try {
      page = await openSettledPage(target);
    } catch (err) {
      return unreachable(target, err instanceof Error ? err.message : String(err));
    }
    try {
      const report = await page.evaluate(
        (sanctionedSelector) => {
          /** Human-readable chain for a found element (trimmed to depth 4). */
          function chainOf(el: Element): string {
            const parts: string[] = [];
            let node: Element | null = el;
            while (node !== null && parts.length < 4) {
              let part = node.tagName.toLowerCase();
              if (node.id !== "") part += `#${node.id}`;
              for (const cls of Array.from(node.classList)) part += `.${cls}`;
              parts.unshift(part);
              node = node.parentElement;
            }
            return parts.join(" < ");
          }
          const shadows: Array<{ selectorChain: string; shadow: string; allowed: boolean }> = [];
          for (const el of document.querySelectorAll("*")) {
            const shadow = getComputedStyle(el).boxShadow;
            if (shadow === "" || shadow === "none") continue;
            shadows.push({
              selectorChain: chainOf(el),
              shadow,
              allowed: el.closest(sanctionedSelector) !== null,
            });
          }
          return {
            swept: document.querySelectorAll("*").length,
            sanctionedCount: shadows.filter((s) => s.allowed).length,
            violations: shadows.filter((s) => !s.allowed),
            shadows,
          };
        },
        SANCTIONED_SURFACES,
      );
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ url: target, ...report }),
        }],
      };
    } finally {
      await page.context().close();
    }
  },
);

server.registerTool(
  "capture_viewport_matrix",
  {
    title: "Capture Viewport Matrix",
    description:
      "Screenshots the rendered Signature Style app at each viewport of a matrix (default 375x812, 768x1024, 1440x900, 1920x1080) and writes one PNG per viewport to a flat directory. Returns the flat matrix of {viewport, path, bytes}. Requires the playground dev server (`npm run playground`).",
    inputSchema: {
      url: z.string().url().optional().describe("App URL (default http://localhost:5173)"),
      viewports: z.array(z.tuple([z.number(), z.number()])).optional().describe(
        "Viewport matrix as [width, height] pairs (default the 4-view doctrine matrix)",
      ),
      fullPage: z.boolean().optional().describe(
        "Capture the full scrollable page per viewport (default false — viewport-exact)",
      ),
      path: z.string().optional().describe(
        "Output directory (default /tmp/opencode/viewport-matrix)",
      ),
    },
  },
  async ({ url, viewports, fullPage, path }) => {
    const target = url ?? DEFAULT_URL;
    const matrix = viewports ?? DEFAULT_VIEWPORTS;
    const outDir = path ?? DEFAULT_MATRIX_DIR;
    let page: Page;
    try {
      page = await openSettledPage(target);
    } catch (err) {
      return unreachable(target, err instanceof Error ? err.message : String(err));
    }
    try {
      const slug = urlSlug(target);
      const shots: Array<{ viewport: string; path: string; bytes: number; note?: string }> = [];
      for (const [width, height] of matrix) {
        await page.setViewportSize({ width, height });
        await page.waitForTimeout(SETTLE_MS);
        const buffer = await page.screenshot({
          fullPage: fullPage ?? false,
          type: "png",
        });
        const requested = `${outDir}/${slug}-${width}x${height}.png`;
        const { writtenPath, note } = await persistPng(buffer, requested);
        shots.push(note === undefined
          ? { viewport: `${width}x${height}`, path: writtenPath, bytes: buffer.length }
          : { viewport: `${width}x${height}`, path: writtenPath, bytes: buffer.length, note });
      }
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ url: target, matrix: shots }),
        }],
      };
    } finally {
      await page.context().close();
    }
  },
);

/**
 * Entrypoint: connect the stdio transport and arm shutdown handlers so the
 * shared Chromium never outlives the server process.
 */
async function main(): Promise<void> {
  await server.connect(new StdioServerTransport());
  const shutdown = async (): Promise<void> => {
    if (browser !== null) {
      await browser.close().catch(() => undefined);
    }
    process.exit(0);
  };
  process.on("SIGINT", () => void shutdown());
  process.on("SIGTERM", () => void shutdown());
  process.on("exit", () => void browser?.close().catch(() => undefined));
}

main().catch((err: unknown) => {
  console.error("signature-mcp fatal:", err);
  process.exit(1);
});
