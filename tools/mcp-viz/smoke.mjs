/**
 * smoke.mjs — the release-blocker proof for the Visual Cortex MCP server.
 *
 * Spawns `node dist/server.js` and speaks RAW JSON-RPC over stdio
 * (newline-delimited, exactly what the SDK's StdioServerTransport reads):
 *
 *   initialize → tools/list → tools/call inspect_layout
 *   → tools/call capture_screenshot (path /tmp/opencode/mcp-smoke.png)
 *
 * Asserts:
 *   (s1) tools/list contains EXACTLY the two tools;
 *   (s2) inspect_layout returns rect hits including at least one
 *        .sig-timeline__node with width > 0 AND height > 0;
 *   (s3) capture_screenshot returns non-empty base64 image data.
 *
 * Prerequisite: playground dev server on http://localhost:5173
 * (`npm run playground`). Exit 0 = ALL PASS.
 */
import { spawn } from "node:child_process";

const SERVER = new URL("./dist/server.js", import.meta.url).pathname;
const URL_TO_INSPECT = "http://localhost:5173";
const SHOT_PATH = "/tmp/opencode/mcp-smoke.png";

/** Fail fast with a labeled assertion error. */
function assert(cond, label) {
  if (!cond) throw new Error(`SMOKE FAIL: ${label}`);
}

/** Minimal newline-delimited JSON-RPC client over a child process' stdio. */
class Rpc {
  constructor(child) {
    this.child = child;
    this.nextId = 1;
    this.buffer = "";
    this.pending = new Map();
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk) => this.#ingest(chunk));
  }

  /** Parse buffered lines; resolve pending requests by id. */
  #ingest(chunk) {
    this.buffer += chunk;
    let idx;
    while ((idx = this.buffer.indexOf("\n")) !== -1) {
      const line = this.buffer.slice(0, idx).trim();
      this.buffer = this.buffer.slice(idx + 1);
      if (!line) continue;
      let msg;
      try {
        msg = JSON.parse(line);
      } catch {
        continue;
      }
      if (msg.id !== undefined && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    }
  }

  /** Send a request; returns a promise for its result. */
  call(method, params) {
    const id = this.nextId++;
    const line = JSON.stringify({ jsonrpc: "2.0", id, method, params });
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.child.stdin.write(line + "\n");
    });
  }

  /** Fire-and-forget notification. */
  notify(method, params) {
    this.child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method, params }) + "\n");
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const devServerUp = await fetch(URL_TO_INSPECT)
  .then((r) => r.ok)
  .catch(() => false);
assert(devServerUp, `dev server dead at ${URL_TO_INSPECT} — run \`npm run playground\``);

const child = spawn("node", [SERVER], { stdio: ["pipe", "pipe", "pipe"] });
child.stderr.setEncoding("utf8");
child.stderr.on("data", (d) => process.stderr.write(`[server] ${d}`));
const rpc = new Rpc(child);

try {
  const init = await Promise.race([
    rpc.call("initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "mcp-viz-smoke", version: "1.7.0" },
    }),
    sleep(15000).then(() => { throw new Error("initialize timed out"); }),
  ]);
  assert(init.serverInfo?.name === "visual-cortex", "initialize: unexpected serverInfo");
  rpc.notify("notifications/initialized", {});

  // (s1) tools/list — exactly the two tools.
  const tools = await rpc.call("tools/list", {});
  const names = tools.tools.map((t) => t.name).sort();
  assert(
    JSON.stringify(names) === JSON.stringify(["capture_screenshot", "inspect_layout"]),
    `tools/list expected exactly [capture_screenshot, inspect_layout], got ${JSON.stringify(names)}`,
  );

  // (s2) inspect_layout — timeline node rects with real area.
  const layout = await rpc.call("tools/call", {
    name: "inspect_layout",
    arguments: { url: URL_TO_INSPECT },
  });
  assert(layout.isError !== true, `inspect_layout errored: ${JSON.stringify(layout.content)}`);
  const layoutPayload = JSON.parse(layout.content[0].text);
  const nodeHits = layoutPayload.hits.filter((h) => h.selector === ".sig-timeline__node");
  const aliveNodes = nodeHits.filter((h) => h.rect.width > 0 && h.rect.height > 0);
  assert(nodeHits.length > 0, "no .sig-timeline__node hits at all");
  assert(aliveNodes.length > 0, "no .sig-timeline__node with width>0 && height>0");

  // (s2b) 3.4.0 — THE ZERO-REACT STUDIO PROOF: the Pattern Studio mounts
  // the six sig-* custom elements; inspecting #/studio must return REAL
  // hits (alive rects) for every wc selector — the studio wc integration
  // measured by the cortex itself (the selector sweep grew in 3.4.0).
  const studioLayout = await rpc.call("tools/call", {
    name: "inspect_layout",
    arguments: { url: `${URL_TO_INSPECT}/#/studio` },
  });
  assert(studioLayout.isError !== true, `studio inspect_layout errored: ${JSON.stringify(studioLayout.content)}`);
  const studioPayload = JSON.parse(studioLayout.content[0].text);
  const WC_SELECTORS = ["sig-surface-card", "sig-badge", "sig-progress-bar", "sig-stat-ring", "sig-callout", "sig-carousel"];
  const wcReport = {};
  for (const selector of WC_SELECTORS) {
    const hits = studioPayload.hits.filter((h) => h.selector === selector);
    const alive = hits.filter((h) => h.rect.width > 0 && h.rect.height > 0);
    wcReport[selector] = { hits: hits.length, alive: alive.length };
    assert(hits.length > 0, `studio wc proof: no ${selector} hits — the studio Set 07 frames are not mounting the custom elements`);
    assert(alive.length > 0, `studio wc proof: no ${selector} with a real (width>0 && height>0) rect`);
  }
  const wcAliveTotal = WC_SELECTORS.reduce((sum, s) => sum + wcReport[s].alive, 0);
  console.log(`studio wc hits: ${WC_SELECTORS.map((s) => `${s}=${wcReport[s].alive} alive`).join(" · ")} (total ${wcAliveTotal})`);

  // (s3) capture_screenshot — non-empty base64.
  const shot = await rpc.call("tools/call", {
    name: "capture_screenshot",
    arguments: { url: URL_TO_INSPECT, path: SHOT_PATH },
  });
  assert(shot.isError !== true, `capture_screenshot errored: ${JSON.stringify(shot.content)}`);
  const image = shot.content.find((c) => c.type === "image");
  assert(!!image && image.mimeType === "image/png", "no PNG image content returned");
  assert(typeof image.data === "string" && image.data.length > 0, "empty base64 payload");

  // Stat the EFFECTIVE written path (graceful EACCES fallback may relocate it).
  const writtenPath = shot.content.find((c) => c.type === "text")?.text
    ?.match(/written to (\S+)/)?.[1];
  assert(!!writtenPath, "response text names no written path");
  const bytesOnDisk = (await import("node:fs")).statSync(writtenPath).size;
  assert(bytesOnDisk > 0, `written file ${writtenPath} is empty`);

  const sample = aliveNodes[0];
  console.log("SMOKE ALL PASS");
  console.log(`  tools/list:      ${names.join(", ")}`);
  console.log(`  layout hitCount: ${layoutPayload.hitCount}`);
  console.log(`  timeline nodes:  ${nodeHits.length} hits, ${aliveNodes.length} with area`);
  console.log(`  sample rect:     ${JSON.stringify(sample.rect)} classes=${JSON.stringify(sample.classes)}`);
  console.log(`  base64 length:   ${image.data.length} (bytes on disk: ${bytesOnDisk} at ${writtenPath})`);
} finally {
  child.kill("SIGTERM");
  await sleep(300);
  if (!child.killed) child.kill("SIGKILL");
}
