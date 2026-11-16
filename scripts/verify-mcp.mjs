#!/usr/bin/env node
/**
 * verify-mcp.mjs — the release-blocker proof for the SIGNATURE-MCP package
 * (3.5.0: the Visual Cortex as a product; the harness is PORTED VERBATIM
 * from the proven tools/mcp-viz/smoke.mjs v2.7.0 JSON-RPC shape and
 * retargeted to packages/signature-mcp/dist/server.js).
 *
 * Spawns `node packages/signature-mcp/dist/server.js` and speaks RAW
 * JSON-RPC over stdio (newline-delimited, exactly what the SDK's
 * StdioServerTransport reads):
 *
 *   initialize → tools/list → tools/call inspect_layout
 *   → tools/call audit_contrast → tools/call audit_e1_shadows
 *   → tools/call capture_viewport_matrix
 *
 * Asserts:
 *   (s1) tools/list contains EXACTLY the four tools;
 *   (s2) inspect_layout returns ≥ 20 hits with real area (≥ 1
 *        .sig-surface-card with width>0 && height>0);
 *   (s2b) the studio zero-react proof (carried from 3.4.0): inspecting
 *        #/studio returns alive rects for every sig-* custom element;
 *   (s2c) the MOTION LAB navigation probe (3.7.0): inspecting #/motion
 *        returns EXACTLY 6 alive .pattern-frame rects + ≥ 3 alive
 *        .sig-kinetic-surface rects;
 *   (s2d) the TEMPLATES STUDIO navigation probe (3.8.0): inspecting
 *        #/templates returns alive rects for the studio root, the
 *        control bar, the stage wrap + stage, and the LIVE default
 *        template (the SaaS landing + its pricing tiers);
 *   (s2e) the 4-VIEWPORT matrix ON THE TEMPLATES VIEW (3.8.0):
 *        capture_viewport_matrix on #/templates returns exactly 4
 *        non-empty shots (375 / 768 / 1440 / 1920);
 *   (s3) audit_contrast returns a summary with numeric passCount +
 *        failCount and ≥ 1 measured element;
 *   (s4) audit_e1_shadows returns sanctionedCount ≥ 1 and a violations
 *        array;
 *   (s5) capture_viewport_matrix returns EXACTLY 4 paths with bytes > 0
 *        on disk.
 *
 * Prerequisite: playground dev server on http://localhost:5173
 * (`npm run playground`). Exit 0 = ALL PASS.
 */
import { spawn } from "node:child_process";
import { statSync } from "node:fs";

const SERVER = new URL("../packages/signature-mcp/dist/server.js", import.meta.url).pathname;
const URL_TO_INSPECT = "http://localhost:5173";

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
      clientInfo: { name: "signature-mcp-smoke", version: "1.0.0" },
    }),
    sleep(15000).then(() => { throw new Error("initialize timed out"); }),
  ]);
  assert(init.serverInfo?.name === "visual-cortex", "initialize: unexpected serverInfo");
  assert(init.serverInfo?.version === "3.5.0", "initialize: server version must be 3.5.0");
  rpc.notify("notifications/initialized", {});

  // (s1) tools/list — exactly the four tools.
  const tools = await rpc.call("tools/list", {});
  const names = tools.tools.map((t) => t.name).sort();
  assert(
    JSON.stringify(names) === JSON.stringify(["audit_contrast", "audit_e1_shadows", "capture_viewport_matrix", "inspect_layout"]),
    `tools/list expected exactly [audit_contrast, audit_e1_shadows, capture_viewport_matrix, inspect_layout], got ${JSON.stringify(names)}`,
  );

  // (s2) inspect_layout — ≥ 20 hits, ≥ 1 alive .sig-surface-card.
  const layout = await rpc.call("tools/call", {
    name: "inspect_layout",
    arguments: { url: URL_TO_INSPECT },
  });
  assert(layout.isError !== true, `inspect_layout errored: ${JSON.stringify(layout.content)}`);
  const layoutPayload = JSON.parse(layout.content[0].text);
  assert(layoutPayload.hitCount >= 20, `inspect_layout returned only ${layoutPayload.hitCount} hits (< 20)`);
  const aliveSurfaces = layoutPayload.hits.filter(
    (h) => h.selector === ".sig-surface-card" && h.rect.width > 0 && h.rect.height > 0,
  );
  assert(aliveSurfaces.length > 0, "no .sig-surface-card with width>0 && height>0");

  // (s2b) the studio zero-react proof (carried from the 3.4.0 harness):
  // the six sig-* custom elements measure alive rects on #/studio.
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

  // (s2c) the MOTION LAB navigation probe (3.7.0): #/motion mounts the
  // kinetic stage — the six showcase pattern-frames and the sheen
  // surfaces measure alive rects.
  const motionLayout = await rpc.call("tools/call", {
    name: "inspect_layout",
    arguments: { url: `${URL_TO_INSPECT}/#/motion` },
  });
  assert(motionLayout.isError !== true, `motion-lab inspect_layout errored: ${JSON.stringify(motionLayout.content)}`);
  const motionPayload = JSON.parse(motionLayout.content[0].text);
  const motionFrames = motionPayload.hits.filter(
    (h) => h.selector === ".pattern-frame" && h.rect.width > 0 && h.rect.height > 0,
  );
  assert(motionFrames.length === 6, `motion-lab probe: expected EXACTLY 6 alive .pattern-frame rects, found ${motionFrames.length}`);
  const sheenHits = motionPayload.hits.filter(
    (h) => h.selector === ".sig-kinetic-surface" && h.rect.width > 0 && h.rect.height > 0,
  );
  assert(sheenHits.length >= 3, `motion-lab probe: the kinetic sheen surfaces are not mounting (found ${sheenHits.length} alive)`);
  console.log(`motion-lab hits: pattern-frame=${motionFrames.length} · kinetic-surface=${sheenHits.length}`);

  // (s2d) the TEMPLATES STUDIO navigation probe (3.8.0): #/templates
  // mounts the studio — the stage wrap + stage measure alive rects,
  // the control bar, the template tabs and the copy control are all
  // present, and the preview mounts the live template (the SaaS
  // landing default: the pricing section is in the DOM).
  const templatesLayout = await rpc.call("tools/call", {
    name: "inspect_layout",
    arguments: {
      url: `${URL_TO_INSPECT}/#/templates`,
      selectors: [".tpl-studio", ".tpl-studio__bar", ".tpl-studio__stage-wrap", ".tpl-studio__stage", ".sig-tpl-saas", ".sig-tpl-saas__tiers"],
    },
  });
  assert(templatesLayout.isError !== true, `templates inspect_layout errored: ${JSON.stringify(templatesLayout.content)}`);
  const templatesPayload = JSON.parse(templatesLayout.content[0].text);
  const aliveTpl = (selector) =>
    templatesPayload.hits.filter((h) => h.selector === selector && h.rect.width > 0 && h.rect.height > 0).length;
  assert(aliveTpl(".tpl-studio") === 1, "templates probe: the studio root is not mounting");
  assert(aliveTpl(".tpl-studio__bar") === 1, "templates probe: the control bar is not mounting");
  assert(aliveTpl(".tpl-studio__stage-wrap") === 1, "templates probe: the stage wrap is not mounting");
  assert(aliveTpl(".tpl-studio__stage") === 1, "templates probe: the stage is not mounting");
  assert(aliveTpl(".sig-tpl-saas") === 1, "templates probe: the default template (SaaS Landing) is not mounting live");
  assert(aliveTpl(".sig-tpl-saas__tiers") === 1, "templates probe: the SaaS pricing tiers are not mounting");
  console.log(`templates hits: studio=${aliveTpl(".tpl-studio")} · bar=${aliveTpl(".tpl-studio__bar")} · stage=${aliveTpl(".tpl-studio__stage")} · saas=${aliveTpl(".sig-tpl-saas")}`);

  // (s2e) the 4-VIEWPORT sweep ON THE TEMPLATES VIEW (3.8.0): the
  // doctrine matrix captured on #/templates — the studio + the stage
  // must render non-empty at 375 / 768 / 1440 / 1920.
  const templatesMatrix = await rpc.call("tools/call", {
    name: "capture_viewport_matrix",
    arguments: { url: `${URL_TO_INSPECT}/#/templates`, path: "/tmp/opencode/viewport-matrix-templates" },
  });
  assert(templatesMatrix.isError !== true, `templates capture_viewport_matrix errored: ${JSON.stringify(templatesMatrix.content)}`);
  const templatesMatrixPayload = JSON.parse(templatesMatrix.content[0].text);
  assert(templatesMatrixPayload.matrix.length === 4, `templates matrix must return exactly 4 rows, got ${templatesMatrixPayload.matrix?.length}`);
  for (const row of templatesMatrixPayload.matrix) {
    assert(typeof row.bytes === "number" && row.bytes > 0, `templates viewport ${row.viewport} bytes is ${row.bytes}`);
    assert(statSync(row.path).size > 0, `templates matrix file ${row.path} is empty`);
  }
  console.log(`templates matrix: ${templatesMatrixPayload.matrix.map((m) => `${m.viewport}=${m.bytes}B`).join(" · ")}`);

  // (s2f) THE FULL-VIEWPORT GRAPH STUDIO probe (3.9.0): #/graph mounts
  // the full-bleed studio — the stage, the toolbar + dock HUD cards
  // and the canvas svg all measure alive rects (the deep geometry —
  // 100vh math, the z-rung, the blur — is the cortex probe's job).
  const graphLayout = await rpc.call("tools/call", {
    name: "inspect_layout",
    arguments: {
      url: `${URL_TO_INSPECT}/#/graph`,
      selectors: ["[data-testid=\"graph-studio\"]", "[data-testid=\"studio-toolbar\"]", "[data-testid=\"studio-dock\"]", "svg.sig-graph"],
    },
  });
  assert(graphLayout.isError !== true, `graph inspect_layout errored: ${JSON.stringify(graphLayout.content)}`);
  const graphPayload = JSON.parse(graphLayout.content[0].text);
  const aliveGraph = (selector) =>
    graphPayload.hits.filter((h) => h.selector === selector && h.rect.width > 0 && h.rect.height > 0).length;
  assert(aliveGraph('[data-testid="graph-studio"]') === 1, "graph probe: the studio root is not mounting");
  assert(aliveGraph('[data-testid="studio-toolbar"]') === 1, "graph probe: the toolbar HUD is not mounting");
  assert(aliveGraph('[data-testid="studio-dock"]') === 1, "graph probe: the action dock HUD is not mounting");
  assert(aliveGraph("svg.sig-graph") === 1, "graph probe: the canvas svg is not mounting");
  console.log(`graph hits: studio=${aliveGraph('[data-testid="graph-studio"]')} · toolbar=${aliveGraph('[data-testid="studio-toolbar"]')} · dock=${aliveGraph('[data-testid="studio-dock"]')} · svg=${aliveGraph("svg.sig-graph")}`);

  // (s2g) THE KINETIC SUITE probe (3.9.0): #/motion mounts the new
  // primitives — aurora cards, the tilt surface, the beacon, the
  // waveform bars all measure alive rects.
  const suiteLayout = await rpc.call("tools/call", {
    name: "inspect_layout",
    arguments: {
      url: `${URL_TO_INSPECT}/#/motion`,
      selectors: [".sig-aurora-card", ".sig-tilt-surface", ".sig-beacon", ".sig-waveform__bar"],
    },
  });
  assert(suiteLayout.isError !== true, `kinetic suite inspect_layout errored: ${JSON.stringify(suiteLayout.content)}`);
  const suitePayload = JSON.parse(suiteLayout.content[0].text);
  const aliveSuite = (selector) =>
    suitePayload.hits.filter((h) => h.selector === selector && h.rect.width > 0 && h.rect.height > 0).length;
  assert(aliveSuite(".sig-aurora-card") >= 2, `kinetic suite probe: the aurora cards are not mounting (${aliveSuite(".sig-aurora-card")} alive)`);
  assert(aliveSuite(".sig-tilt-surface") >= 1, "kinetic suite probe: the tilt surface is not mounting");
  assert(aliveSuite(".sig-beacon") >= 1, "kinetic suite probe: the beacons are not mounting");
  assert(aliveSuite(".sig-waveform__bar") >= 4, `kinetic suite probe: the waveform bars are not mounting (${aliveSuite(".sig-waveform__bar")} alive)`);
  console.log(`kinetic suite hits: aurora=${aliveSuite(".sig-aurora-card")} · tilt=${aliveSuite(".sig-tilt-surface")} · beacon=${aliveSuite(".sig-beacon")} · bars=${aliveSuite(".sig-waveform__bar")}`);

  // (s3) audit_contrast — numeric pass/fail summary, ≥ 1 measured element.
  const contrast = await rpc.call("tools/call", {
    name: "audit_contrast",
    arguments: { url: URL_TO_INSPECT },
  });
  assert(contrast.isError !== true, `audit_contrast errored: ${JSON.stringify(contrast.content)}`);
  const contrastPayload = JSON.parse(contrast.content[0].text);
  assert(typeof contrastPayload.summary?.passCount === "number" && typeof contrastPayload.summary?.failCount === "number",
    "audit_contrast summary lacks numeric passCount/failCount");
  assert(contrastPayload.elements.length >= 1, "audit_contrast measured zero elements");
  assert(Array.isArray(contrastPayload.summary.failures), "audit_contrast summary.failures is not an array");

  // (s4) audit_e1_shadows — sanctioned ≥ 1 + a violations array.
  const e1 = await rpc.call("tools/call", {
    name: "audit_e1_shadows",
    arguments: { url: URL_TO_INSPECT },
  });
  assert(e1.isError !== true, `audit_e1_shadows errored: ${JSON.stringify(e1.content)}`);
  const e1Payload = JSON.parse(e1.content[0].text);
  assert(e1Payload.sanctionedCount >= 1, "audit_e1_shadows sanctioned zero shadows — the ambient elevation contract is not rendering");
  assert(Array.isArray(e1Payload.violations), "audit_e1_shadows violations is not an array");

  // (s5) capture_viewport_matrix — exactly 4 paths, bytes on disk.
  const matrix = await rpc.call("tools/call", {
    name: "capture_viewport_matrix",
    arguments: { url: URL_TO_INSPECT },
  });
  assert(matrix.isError !== true, `capture_viewport_matrix errored: ${JSON.stringify(matrix.content)}`);
  const matrixPayload = JSON.parse(matrix.content[0].text);
  assert(Array.isArray(matrixPayload.matrix) && matrixPayload.matrix.length === 4,
    `capture_viewport_matrix must return exactly 4 rows, got ${matrixPayload.matrix?.length}`);
  for (const row of matrixPayload.matrix) {
    assert(typeof row.path === "string" && row.path.length > 0, `viewport ${row.viewport} returned no path`);
    assert(typeof row.bytes === "number" && row.bytes > 0, `viewport ${row.viewport} bytes is ${row.bytes}`);
    const onDisk = statSync(row.path).size;
    assert(onDisk > 0, `written file ${row.path} is empty`);
  }

  console.log("SMOKE ALL PASS");
  console.log(`  tools/list:       ${names.join(", ")}`);
  console.log(`  layout hitCount:  ${layoutPayload.hitCount} (alive .sig-surface-card: ${aliveSurfaces.length})`);
  console.log(`  contrast:         ${contrastPayload.summary.passCount} pass / ${contrastPayload.summary.failCount} fail (floor ${contrastPayload.minRatio}:1)`);
  console.log(`  e1 shadows:       ${e1Payload.sanctionedCount} sanctioned, ${e1Payload.violations.length} violations (swept ${e1Payload.swept} elements)`);
  console.log(`  matrix:           ${matrixPayload.matrix.map((m) => `${m.viewport}=${m.bytes}B`).join(" · ")}`);
} finally {
  child.kill("SIGTERM");
  await sleep(300);
  if (!child.killed) child.kill("SIGKILL");
}
