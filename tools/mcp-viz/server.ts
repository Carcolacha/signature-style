/**
 * server.ts — The Visual Cortex (MCP Integration), v1.7.0.
 *
 * 2.2.0: the default sweep retargets the retired .bento__* classes to
 * the live dashboard contract — .sig-surface-card (the package's
 * official surface primitive, consumed by the playground since the
 * 2.2.0 promotion), .hub__metric, .hub__btn — and the server version
 * string moves to 2.2.0 (tooling only; the package's tokens.json stays
 * 1.4.0). tools/ is our tooling: owner-editable, noted in the release
 * changelog.
 *
 * An MCP stdio server giving AI sessions spatial awareness of the rendered
 * Signature Style dashboard. Two tools:
 *
 *   inspect_layout    → structured JSON of every element matching the
 *                       dashboard's known selectors: tag, classes, bounding
 *                       rect, text, visibility — plus a per-class coverage
 *                       summary. "The AI can now measure what it styles."
 *
 *   capture_screenshot → a PNG of the dashboard (full-page by default) as
 *                       MCP image content, optionally also written to disk.
 *
 * One headless Chromium is launched lazily and shared for the server's
 * lifetime; it is closed on process shutdown signals.
 *
 * Prerequisite: the playground dev server must be running (`npm run
 * playground` from the repo root, default http://localhost:5173).
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

/**
 * Default selector sweep — everything the dashboard's CSS contract knows
 * about: testid hooks, timeline anatomy, progress bars, the official
 * surface primitives + the hub-local metric/button classes (2.2.0 —
 * the bento era is long retired, the hub classes are playground-local).
 */
const DEFAULT_SELECTORS: readonly string[] = [
  "[data-testid]",
  ".ptp-timeline__node",
  ".ptp-timeline__item",
  ".ptp-timeline__header",
  ".ptp-progress",
  ".ptp-progress__fill",
  ".sig-surface-card",
  ".hub__metric",
  ".hub__btn",
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

/** The shared McpServer instance advertising the visual cortex tools. */
const server = new McpServer({ name: "visual-cortex", version: "2.2.0" });

server.registerTool(
  "inspect_layout",
  {
    title: "Inspect Dashboard Layout",
    description:
      "Measure the rendered Signature Style dashboard: every element matching the given selectors with tag, classes, bounding rect, text and visibility, plus per-class coverage. Requires the playground dev server (`npm run playground`).",
    inputSchema: {
      url: z.string().url().optional().describe("Dashboard URL (default http://localhost:5173)"),
      selectors: z.array(z.string()).optional().describe(
        "CSS selectors to sweep (default: dashboard anatomy)",
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
      const reason = err instanceof Error ? err.message : String(err);
      return {
        isError: true,
        content: [{
          type: "text",
          text:
            `Cannot reach ${target} (${reason}).\n` +
            "The Visual Cortex needs the playground running: start it with " +
            "`npm run playground` from the signature-style repo root, then retry.",
        }],
      };
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
  "capture_screenshot",
  {
    title: "Capture Dashboard Screenshot",
    description:
      "Screenshot the rendered Signature Style dashboard and return it as MCP image content (PNG, base64). Optionally also writes the PNG to `path` (default /tmp/opencode/dashboard-mcp.png). Requires the playground dev server (`npm run playground`).",
    inputSchema: {
      url: z.string().url().optional().describe("Dashboard URL (default http://localhost:5173)"),
      fullPage: z.boolean().optional().describe("Capture the full scrollable page (default true)"),
      path: z.string().optional().describe(
        "Also write the PNG here (default /tmp/opencode/dashboard-mcp.png)",
      ),
    },
  },
  async ({ url, fullPage, path }) => {
    const target = url ?? DEFAULT_URL;
    const outPath = path ?? "/tmp/opencode/dashboard-mcp.png";
    let page: Page;
    try {
      page = await openSettledPage(target);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      return {
        isError: true,
        content: [{
          type: "text",
          text:
            `Cannot reach ${target} (${reason}).\n` +
            "The Visual Cortex needs the playground running: start it with " +
            "`npm run playground` from the signature-style repo root, then retry.",
        }],
      };
    }
    try {
      const buffer = await page.screenshot({ fullPage: fullPage ?? true, type: "png" });
      const { writtenPath, note } = await persistPng(buffer, outPath);
      const text = note !== undefined
        ? `Screenshot (${buffer.length} bytes) written to ${writtenPath} — ${note}`
        : `Screenshot (${buffer.length} bytes) written to ${writtenPath}`;
      return {
        content: [
          { type: "image", data: buffer.toString("base64"), mimeType: "image/png" },
          { type: "text", text },
        ],
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
  console.error("visual-cortex fatal:", err);
  process.exit(1);
});
