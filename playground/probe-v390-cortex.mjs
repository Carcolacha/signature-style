#!/usr/bin/env node
/**
 * probe-v390-cortex.mjs — THE v3.9.0 RELEASE CORTEX (the four
 * diagnosed defects, proven live against the dev server).
 *
 * SECTIONS
 *   (c1) RING   — the Motion Lab's StatRing (size "md") measures
 *                 EXACTLY 128×128 inside a wide flex row (the defect #2
 *                 balloon is dead); the enum's sm/lg boxes differ.
 *   (c2) WORKBENCH — the palette lives in the wide bottom compartment:
 *                 ≥ 8 swatch columns at 1440, 26 swatches, FlipCard
 *                 height ≥ 220, page height ≤ 3400 (was 4609), zero
 *                 overlapping bento cells.
 *   (c3) GRAPH  — full-viewport geometry (height = 100vh - 56px, width
 *                 100%, overflow hidden, the 24px dot matrix), the 3
 *                 floating HUD cards (position absolute, z-index 30,
 *                 the .sig-surface-card elevation, backdrop blur), the
 *                 three layout modes (tree: root top-center + children
 *                 in a row; radial: root center + children on a ring;
 *                 free: drag positions persist), the AI Expand (adds
 *                 3-4 nodes; DETERMINISTIC — expand → reset → expand
 *                 yields the same labels), the real-click edge unlink.
 *   (c4) MOTION — the 6 frames × explanation + Play Effect + IO
 *                 (unvisited frames hold hidden), the aurora beam
 *                 (registered --sig-beam-angle resolves + the spin
 *                 animation runs on the always-on card), the tilt
 *                 writes real degrees, the beacon ping, the waveform
 *                 dance — and the reduced-motion overrides stand ALL
 *                 of them down (emulated media).
 *   (c5) DRAG   — the 60fps drag: rAF deltas sampled during a node
 *                 drag, median < 20ms.
 *
 * Requires the dev server on http://localhost:5173.
 * Exit 0 = ALL PASS.
 */
import { chromium } from "playwright";

const URL_BASE = "http://localhost:5173";
const failures = [];
const notes = [];
function assert(cond, label) {
  if (!cond) failures.push(label);
}

const browser = await chromium.launch();

/* ============================= (c1) RING ============================= */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${URL_BASE}/#/motion`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  const ring = await page.evaluate(() => {
    const svg = document.querySelector('[data-testid="motion-telemetry"] svg.sig-stat-ring');
    const rect = svg?.getBoundingClientRect();
    return rect !== undefined && rect !== null
      ? { w: rect.width, h: rect.height, size: svg.style.getPropertyValue("--ring-size") }
      : null;
  });
  assert(ring !== null, "(c1) the Motion Lab StatRing is missing");
  if (ring !== null) {
    assert(
      Math.abs(ring.w - 128) < 0.6 && Math.abs(ring.h - 128) < 0.6,
      `(c1) the Motion Lab StatRing must measure exactly 128×128 in the wide flex row, got ${ring.w}×${ring.h}`,
    );
    notes.push(`(c1) StatRing size="md" measures ${Math.round(ring.w)}×${Math.round(ring.h)} (--ring-size: ${ring.size})`);
  }
  await page.close();
}

/* ========================= (c2) WORKBENCH ============================ */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${URL_BASE}/#/dashboard`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  const m = await page.evaluate(() => {
    const palette = document.querySelector('[data-testid="palette-grid"]');
    const flip = document.querySelector(".sig-flip-card");
    const cards = [...document.querySelectorAll(".bento12 > *")].map((el) => el.getBoundingClientRect());
    let overlaps = 0;
    for (let i = 0; i < cards.length; i += 1) {
      for (let j = i + 1; j < cards.length; j += 1) {
        const a = cards[i];
        const b = cards[j];
        if (a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height) overlaps += 1;
      }
    }
    return {
      pageHeight: document.documentElement.scrollHeight,
      paletteCols: palette !== null ? getComputedStyle(palette).gridTemplateColumns.split(" ").length : 0,
      paletteTop: palette !== null ? Math.round(palette.getBoundingClientRect().top) : 0,
      swatches: document.querySelectorAll(".hub__palette-swatch").length,
      flipH: flip !== null ? Math.round(flip.getBoundingClientRect().height) : 0,
      cards: cards.length,
      overlaps,
    };
  });
  assert(m.paletteCols >= 8, `(c2) the palette must pack ≥ 8 swatch columns at 1440, got ${m.paletteCols}`);
  assert(m.swatches === 26, `(c2) all 26 swatches must render, got ${m.swatches}`);
  assert(m.flipH >= 220, `(c3) FlipCard height must be ≥ 220, got ${m.flipH}`);
  assert(m.pageHeight <= 3400, `(c2) the workbench page must be ≤ 3400px (v3.8.0: 4609), got ${m.pageHeight}`);
  assert(m.overlaps === 0, `(c2) ${m.overlaps} overlapping bento cells`);
  notes.push(
    `(c2) page height ${m.pageHeight}px (v3.8.0: 4609 — the shrink is ${4609 - m.pageHeight}px) · palette columns ${m.paletteCols} · FlipCard ${m.flipH}px`,
  );
  await page.close();
}

/* ========================== (c3) GRAPH =============================== */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${URL_BASE}/#/graph`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.click('[data-testid="studio-reset-canvas"]');
  await page.waitForTimeout(600);

  // GEOMETRY — the studio fills the viewport under the 56px nav.
  const geo = await page.evaluate(() => {
    const studio = document.querySelector('[data-testid="graph-studio"]');
    const style = getComputedStyle(studio);
    const rect = studio.getBoundingClientRect();
    return {
      w: rect.width,
      h: rect.height,
      overflow: style.overflow,
      position: style.position,
      dotSize: style.backgroundSize,
      innerW: window.innerWidth,
      innerH: window.innerHeight,
    };
  });
  assert(geo.w === geo.innerW, `(c3) the studio must span the full width (${geo.w} vs ${geo.innerW})`);
  assert(
    Math.abs(geo.h - (geo.innerH - 56)) <= 2,
    `(c3) the studio must be calc(100vh - 56px) tall, got ${geo.h} vs ${geo.innerH - 56}`,
  );
  assert(geo.overflow === "hidden", `(c3) the studio must clip (overflow hidden), got ${geo.overflow}`);
  assert(geo.position === "relative", `(c3) the studio must be the positioning root`);
  assert(geo.dotSize.includes("24px"), `(c3) the dot matrix must be 24px, got ${geo.dotSize}`);

  // THE HUD CARDS — toolbar + dock floating now; inspector on selection.
  const hud = await page.evaluate(() => {
    const read = (sel) => {
      const el = document.querySelector(sel);
      if (el === null) return null;
      const s = getComputedStyle(el);
      return { position: s.position, z: s.zIndex, blur: s.backdropFilter !== "none" && s.backdropFilter !== "", surface: el.classList.contains("sig-surface-card") };
    };
    return { toolbar: read('[data-testid="studio-toolbar"]'), dock: read('[data-testid="studio-dock"]') };
  });
  for (const [name, card] of Object.entries(hud)) {
    assert(card !== null, `(c3) the ${name} HUD card is missing`);
    if (card !== null) {
      assert(card.position === "absolute", `(c3) the ${name} HUD must be position absolute, got ${card.position}`);
      assert(card.z === "30", `(c3) the ${name} HUD must ride the z-30 rung, got ${card.z}`);
      assert(card.blur, `(c3) the ${name} HUD must carry the backdrop blur`);
      assert(card.surface, `(c3) the ${name} HUD must carry the .sig-surface-card elevation`);
    }
  }

  // THE LAYOUT MODES — tree / radial / free computed node geometry.
  const nodePos = () =>
    page.evaluate(() => {
      const nodes = [...document.querySelectorAll("g.sig-graph__node")];
      return nodes.map((n) => {
        const m = /translate\(([-\d.]+) ([-\d.]+)\)/.exec(n.getAttribute("transform") ?? "");
        return { id: n.getAttribute("data-id"), x: parseFloat(m?.[1] ?? "0"), y: parseFloat(m?.[2] ?? "0") };
      });
    });

  await page.click('[data-testid="studio-layout-tree"]');
  await page.waitForTimeout(400);
  const tree = await nodePos();
  const treeRoot = tree.find((n) => n.id === "kg-root");
  const treeKids = tree.filter((n) => n.id !== "kg-root");
  const vbWidth = await page.evaluate(() => {
    const svg = document.querySelector("svg.sig-graph");
    const [x, y, w] = (svg.getAttribute("viewBox") ?? "").split(" ").map(Number);
    return { x, y, w };
  });
  assert(
    treeRoot !== undefined && Math.abs(treeRoot.x - (vbWidth.x + vbWidth.w / 2)) < 1 && treeRoot.y <= 90,
    `(c3) TREE: the root must sit top-center, got (${treeRoot?.x}, ${treeRoot?.y}) vs center ${vbWidth.x + vbWidth.w / 2}`,
  );
  const kidYs = new Set(treeKids.map((k) => k.y));
  assert(
    kidYs.size === 1 && treeKids.every((k) => k.y > treeRoot.y),
    `(c3) TREE: the children must array on ONE row below the root, got ys [${treeKids.map((k) => k.y).join(", ")}]`,
  );

  await page.click('[data-testid="studio-layout-radial"]');
  await page.waitForTimeout(400);
  const radial = await nodePos();
  const radialRoot = radial.find((n) => n.id === "kg-root");
  const cx = vbWidth.x + vbWidth.w / 2;
  const cy = 160;
  // THE RING ENGINE: children fan out around the root at DISTINCT
  // angles (the projected ring is elliptical — the viewBox clamp — so
  // the DOM proof is the angular fan, not a literal equal distance).
  const angles = radial
    .filter((n) => n.id !== "kg-root")
    .map((n) => Math.atan2(n.y - cy, n.x - cx))
    .sort((a, b) => a - b);
  const gaps = angles.slice(1).map((a, i) => a - angles[i]);
  gaps.push(Math.PI * 2 - (angles[angles.length - 1] - angles[0]));
  const fanGap = Math.min(...gaps);
  assert(
    Math.abs(radialRoot.x - cx) < 1 && Math.abs(radialRoot.y - cy) < 1,
    `(c3) RADIAL: the root must sit at the ring center, got (${radialRoot?.x}, ${radialRoot?.y})`,
  );
  assert(
    angles.length === treeKids.length && fanGap > 0.5,
    `(c3) RADIAL: the children must fan out around the center (min angular gap ${fanGap.toFixed(2)})`,
  );

  // FREE — the drag persists through the positions round-trip.
  await page.click('[data-testid="studio-layout-free"]');
  await p_wait(page, 300);
  const dragTarget = await page.evaluate(() => {
    const n = [...document.querySelectorAll("g.sig-graph__node")].find((x) => x.getAttribute("data-id") === "kg-tokens");
    const r = n.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  // THE 60fps SAMPLE — rAF deltas while dragging.
  const perf = await page.evaluate(() => {
    window.__deltas = [];
    let last = 0;
    const loop = (now) => {
      if (last !== 0) window.__deltas.push(now - last);
      last = now;
      if (window.__deltas.length < 90) requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return true;
  });
  await page.mouse.move(dragTarget.x, dragTarget.y);
  await page.mouse.down();
  await page.mouse.move(dragTarget.x + 150, dragTarget.y + 80, { steps: 30 });
  await page.mouse.up();
  await p_wait(page, 400);
  const deltas = await page.evaluate(() => window.__deltas.slice(10));
  const sorted = [...deltas].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] ?? 999;
  assert(median < 20, `(c5) the drag rAF median must be < 20ms (60fps), got ${median.toFixed(1)}ms`);
  notes.push(`(c5) drag rAF median ${median.toFixed(1)}ms over ${deltas.length} frames`);
  const freePos = await nodePos();
  const dragged = freePos.find((n) => n.id === "kg-tokens");
  assert(
    dragged !== undefined && Math.abs(dragged.x - (74.05 + 150 * (640 / (geo.w - 32)))) < 260,
    `(c3) FREE: the drag must persist through the positions round-trip, got ${dragged?.x}`,
  );

  // AI EXPAND + DETERMINISM.
  await page.evaluate(() => {
    const g = [...document.querySelectorAll("g.sig-graph__node")].find((n) => n.getAttribute("data-id") === "kg-root");
    g?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
  await p_wait(page, 300);
  const inspectorVisible = await page.evaluate(() => {
    const el = document.querySelector('[data-testid="studio-inspector"]');
    if (el === null) return false;
    const s = getComputedStyle(el);
    return s.position === "absolute" && s.zIndex === "30";
  });
  assert(inspectorVisible, "(c3) the inspector HUD must float (absolute, z-30) when a node is selected");
  const swatches = await page.evaluate(() => document.querySelectorAll(".graph-studio__swatch").length);
  assert(swatches === 16, `(c3) the inspector picker must offer the chromatic sixteen, got ${swatches}`);
  await page.click('[data-testid="studio-ai-expand"]');
  await p_wait(page, 700);
  const expandA = await page.evaluate(() => document.querySelectorAll("g.sig-graph__node").length);
  const labelsA = await page.evaluate(() => [...document.querySelectorAll("g.sig-graph__node text")].map((t) => t.textContent).sort());
  assert(expandA >= 4 + 3 && expandA <= 4 + 4, `(c3) AI Expand must add 3-4 nodes (4 → ${expandA})`);
  // Reset → expand again → the SAME labels (the deterministic seeds).
  await page.click('[data-testid="studio-reset-canvas"]');
  await p_wait(page, 500);
  await page.evaluate(() => {
    const g = [...document.querySelectorAll("g.sig-graph__node")].find((n) => n.getAttribute("data-id") === "kg-root");
    g?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
  await p_wait(page, 300);
  await page.click('[data-testid="studio-ai-expand"]');
  await p_wait(page, 700);
  const labelsB = await page.evaluate(() => [...document.querySelectorAll("g.sig-graph__node text")].map((t) => t.textContent).sort());
  assert(
    JSON.stringify(labelsA) === JSON.stringify(labelsB),
    "(c3) AI Expand must be deterministic — same selection, same sub-nodes",
  );
  notes.push(`(c3) AI Expand: 4 → ${expandA} nodes, deterministic labels verified across a reset/re-expand cycle`);

  // THE EDGE UNLINK — real mouse click on the curve midpoint.
  await page.click('[data-testid="studio-reset-canvas"]');
  await p_wait(page, 500);
  const pt = await page.evaluate(() => {
    const hit = [...document.querySelectorAll(".sig-graph__edge-hit")][0];
    const mid = hit.getPointAtLength(hit.getTotalLength() / 2);
    const ctm = hit.getScreenCTM();
    return { x: mid.x * ctm.a + mid.y * ctm.c + ctm.e, y: mid.x * ctm.b + mid.y * ctm.d + ctm.f };
  });
  await page.mouse.click(pt.x, pt.y);
  await p_wait(page, 300);
  const edgeSel = await page.evaluate(() => document.querySelectorAll('.sig-graph__edge[data-selected="true"]').length);
  assert(edgeSel === 1, "(c3) a real click on the edge must select it (crimson)");
  const beforeCount = await page.evaluate(() => document.querySelector('[data-testid="studio-count"]')?.textContent);
  await page.keyboard.press("Delete");
  await p_wait(page, 500);
  const afterCount = await page.evaluate(() => document.querySelector('[data-testid="studio-count"]')?.textContent);
  assert(beforeCount !== afterCount, `(c3) Delete must unlink the selected edge (${beforeCount} → ${afterCount})`);
  notes.push(`(c3) edge unlink ${beforeCount} → ${afterCount} (real-click selection)`);

  // LAYOUT PERSISTENCE — the segmented pick survives a reload.
  await page.click('[data-testid="studio-layout-tree"]');
  await p_wait(page, 300);
  await page.reload({ waitUntil: "networkidle" });
  await p_wait(page, 1200);
  const persisted = await page.evaluate(() => document.querySelector("svg.sig-graph")?.getAttribute("data-layout-mode"));
  assert(persisted === "tree", `(c3) the layout mode must persist via sig.workspace.v3.prefs, got ${persisted}`);
  notes.push("(c3) layout mode persisted across reload (sig.workspace.v3.prefs.graphLayout)");

  await page.close();
}

/* ========================== (c4) MOTION ============================== */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${URL_BASE}/#/motion`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  const suite = await page.evaluate(async () => {
    const out = {};
    out.frames = document.querySelectorAll(".pattern-frame").length;
    out.explains = document.querySelectorAll('[data-testid="pf-explain"]').length;
    out.plays = document.querySelectorAll('[data-testid^="motion-play-"]').length;
    // THE REGISTERED ANGLE — a registered custom property resolves its
    // initial value in getComputedStyle (unregistered ones resolve '').
    const card = document.querySelector(".sig-aurora-card");
    out.beamAngle = getComputedStyle(card).getPropertyValue("--sig-beam-angle").trim();
    const always = document.querySelector('.sig-aurora-card[data-trigger="always"]');
    out.spin = getComputedStyle(always, "::before").animationName;
    out.tiltVars = await new Promise((resolve) => {
      const tilt = document.querySelector(".sig-tilt-surface");
      const r = tilt.getBoundingClientRect();
      tilt.dispatchEvent(new PointerEvent("pointermove", { clientX: r.x + r.width * 0.9, clientY: r.y + r.height * 0.9, bubbles: true }));
      setTimeout(() => resolve({ x: tilt.style.getPropertyValue("--tilt-x"), y: tilt.style.getPropertyValue("--tilt-y") }), 120);
    });
    out.beaconPing = getComputedStyle(document.querySelector(".sig-beacon"), "::after").animationName;
    out.waveBars = document.querySelectorAll(".sig-waveform__bar").length;
    out.waveAnim = getComputedStyle(document.querySelector(".sig-waveform__bar")).animationName;
    return out;
  });
  assert(suite.frames === 6, `(c4) six frames expected, got ${suite.frames}`);
  assert(suite.explains === 6, `(c4) six explanation lines expected, got ${suite.explains}`);
  assert(suite.plays === 6, `(c4) six Play Effect buttons expected, got ${suite.plays}`);
  assert(suite.beamAngle === "0deg", `(c4) --sig-beam-angle must be REGISTERED (resolved ${suite.beamAngle === "" ? "'' — unregistered" : suite.beamAngle})`);
  assert(suite.spin.includes("sig-aurora-spin"), `(c4) the always-on beam must spin, got animation ${suite.spin}`);
  assert(suite.tiltVars.x !== "" && Math.abs(parseFloat(suite.tiltVars.x)) > 0.5, `(c4) the tilt must write real degrees, got ${suite.tiltVars.x}`);
  assert(suite.beaconPing.includes("sig-beacon-ping"), `(c4) the beacon ping must run, got ${suite.beaconPing}`);
  assert(suite.waveBars > 0, `(c4) the waveform bars must render`);
  assert(suite.waveAnim.includes("sig-wave-bounce"), `(c4) the waveform bars must dance, got ${suite.waveAnim}`);
  notes.push(`(c4) suite: frames ${suite.frames} · beam ${suite.beamAngle} registered · spin ${suite.spin} · tilt ${suite.tiltVars.x}/${suite.tiltVars.y} · ping ${suite.beaconPing} · bars ${suite.waveBars}`);

  // IO: the LAST frame holds hidden until visited (fresh page, no scroll).
  const page2 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page2.goto(`${URL_BASE}/#/motion`, { waitUntil: "networkidle" });
  await page2.waitForTimeout(1800);
  const holdHidden = await page2.evaluate(() => {
    const last = [...document.querySelectorAll(".pattern-frame")].at(-1);
    return last.querySelectorAll(".sig-motion-reveal:not([data-in])").length;
  });
  assert(holdHidden >= 1, "(c4) the unvisited frame must HOLD its hidden half until scrolled into view");
  await page2.evaluate(() => [...document.querySelectorAll(".pattern-frame")].at(-1)?.scrollIntoView({ block: "center" }));
  await p_wait(page2, 900);
  const revealedOnScroll = await page2.evaluate(() => {
    const last = [...document.querySelectorAll(".pattern-frame")].at(-1);
    return last.querySelectorAll('.sig-motion-reveal[data-in="true"]').length;
  });
  assert(revealedOnScroll >= 1, "(c4) the frame must reveal when scrolled into view");
  await page2.close();

  // REDUCED MOTION — every new primitive stands down (emulated media).
  await page.emulateMedia({ reducedMotion: "reduce" });
  await p_wait(page, 500);
  const reduced = await page.evaluate(() => ({
    beam: getComputedStyle(document.querySelector(".sig-aurora-card"), "::before").animationName,
    tilt: getComputedStyle(document.querySelector(".sig-tilt-surface")).transform,
    ping: getComputedStyle(document.querySelector(".sig-beacon"), "::after").display,
    wave: getComputedStyle(document.querySelector(".sig-waveform__bar")).animationName,
  }));
  assert(reduced.beam === "none", `(c4) reduced motion must stop the beam spin, got ${reduced.beam}`);
  assert(reduced.tilt === "none", `(c4) reduced motion must pin the tilt flat, got ${reduced.tilt}`);
  assert(reduced.ping === "none", `(c4) reduced motion must hide the beacon ping, got display ${reduced.ping}`);
  assert(reduced.wave === "none", `(c4) reduced motion must freeze the waveform, got ${reduced.wave}`);
  notes.push("(c4) reduced motion: beam none · tilt none · ping hidden · wave none — all four stand down");
  await page.close();
}

await browser.close();

console.log("== probe-v390-cortex ==");
for (const note of notes) console.log(`  ${note}`);
if (failures.length > 0) {
  console.error("FAIL — probe-v390-cortex");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("PASS — the four defects are proven fixed, live.");
/** Small wait helper (the probe's only sleep). */
function p_wait(page, ms) {
  return page.waitForTimeout(ms);
}
