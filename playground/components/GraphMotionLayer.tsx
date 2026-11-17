/**
 * GraphMotionLayer — THE GRAPH STUDIO CHOREOGRAPHY ORCHESTRATOR (4.1.0
 * "Graph Motion Layer").
 *
 * The canvas nodes/edges are rendered by the package's <KnowledgeGraph>
 * (SVG, the outer translate(x, y) rAF drag wrapper — untouched). This
 * layer is the playground-owned MOTION STRATUM that sits over the
 * stage and animates the TRANSIENTS: node spawns, edge draw-ons, and
 * the delete/reset exits. It never re-renders the static canvas — at
 * rest the layer renders NULL (zero DOM), so screenshots, goldens and
 * the drag performance are unaffected when nothing is choreographing.
 *
 * ONE ENGINE PER FILE (gate own1): this file imports motion/react
 * ONLY (AnimatePresence + useReducedMotion) and composes the two
 * engine halves — AnimatedGraphEdge (animejs, GraphEdgeDraw.tsx) and
 * AnimatedGraphNode (motion/react, GraphNodeSpring.tsx). No playground
 * file ever imports both engines.
 *
 * THE THREE STRATA (the release doctrine):
 *   1. OUTER WRAPPER — the package's rAF drag <g>: translate(x, y)
 *      ONLY, untouched this release.
 *   2. INNER CARD — motion.div: scale + opacity ONLY, spring 440/28.
 *   3. SVG EDGES — animejs: strokeDashoffset ONLY (draw-on).
 *
 * THE SEAMLESS-SWAP CONTRACT: while a transient animates, the
 * IDENTICAL static canvas element underneath is masked (a generated
 * opacity-0 rule, keyed by the canvas's own data attributes). When the
 * animation settles, the overlay element and the mask rule leave in
 * the SAME commit — the static element takes over invisibly. Geometry
 * is replicated exactly: the overlay svg mirrors the canvas viewBox
 * (the pan/zoom view reported through onViewChange) and derives
 * positions and edge paths from the same pure package helpers
 * (layoutGraph / layoutTree + cubicBezierEdge / treeEdge) with the
 * same merge rules. The diff runs IN RENDER (the React
 * adjust-state-when-props-change pattern, StrictMode-idempotent by a
 * memory-identity guard) so masks/ghosts land in the SAME commit as
 * the canvas change — one frame, no flash.
 *
 * THE EXPANSION → CHOREOGRAPHY MAPPING: one workspace commit = one
 * batch. The layer diffs node/link ids against the previous commit;
 * every added id takes spawnIndex 0, 1, 2… in array order:
 *   · AI Expand (3-4 ideas, one op)  → child i springs at i·0.07s,
 *     its parent edge draws at i·70ms — the child pops in as its wire
 *     lands.
 *   · Add Node / Spawn Branch (1)    → spawnIndex 0.
 *   · Tether link                    → one draw-on edge, index 0.
 *   · Delete Node                    → one exit ghost (0.72 collapse).
 *   · Reset Canvas (post-Confirm)    → every removed node ghosts out.
 *
 * REDUCED MOTION: useReducedMotion() is THE single source — when true
 * the layer choreographs nothing at all (no overlay, no masks): edges
 * are fully drawn, nodes render their final state. The hand-off rides
 * the reducedMotion prop into both engine halves (gm3).
 *
 * CLEANUP CONTRACT: every transient unmounts after its settle; animejs
 * animations revert, timers clear, masks disappear with the last rule.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, useReducedMotion } from "motion/react";
import {
  cubicBezierEdge,
  layoutGraph,
  layoutTree,
  treeEdge,
} from "@edwyn/signature-style/react";
import type {
  GraphEdge,
  GraphLayoutMode,
  GraphNode,
  GraphPosition,
  GraphView,
} from "@edwyn/signature-style/react";
import { AnimatedGraphEdge } from "./GraphEdgeDraw.js";
import { AnimatedGraphNode } from "./GraphNodeSpring.js";

/** The canvas viewBox constants (react/graph.tsx — 640×320, r 34). */
const VIEW_WIDTH = 640;
const VIEW_HEIGHT = 320;
const NODE_RADIUS = 34;
const CHIP = NODE_RADIUS * 2;
/** The foreignObject slack — canvas labels OVERFLOW the ring (SVG text
    never clips), so the transient's viewport is wider than the chip;
    the chip itself stays exactly 68×68 centered in it. */
const FO_PAD = 40;
const FO_SIZE = CHIP + FO_PAD * 2;
const LABEL_MAX = 16;
/** How long a ghost rests before its exit spring fires (ms). */
const GHOST_REST_MS = 60;

export interface GraphMotionLayerProps {
  readonly graph: GraphNode[];
  readonly links: GraphEdge[];
  /** User-dragged positions (free mode wins over the deterministic layout). */
  readonly positions: Record<string, { x: number; y: number }>;
  readonly layoutMode: GraphLayoutMode;
  /** The live pan/zoom view (the layer mirrors the canvas viewBox). */
  readonly view: GraphView;
}

/** One spawning node — the overlay chip while the spring runs. */
interface SpawnNode {
  key: string;
  id: string;
  x: number;
  y: number;
  label: string;
  token: string;
  spawnIndex: number;
}

/** One drawing edge — the overlay path while the sweep runs. */
interface SpawnEdge {
  key: string;
  d: string;
  spawnIndex: number;
  isLink: boolean;
  fromId: string;
  toId: string;
}

/** One exiting node — mounts at rest, collapses via the exit spring. */
interface GhostNode {
  key: string;
  x: number;
  y: number;
  label: string;
  token: string;
  leaving: boolean;
}

/** Snapshot the diff needs: ghosted nodes take their LAST geometry. */
interface LayerMemory {
  graph: GraphNode[];
  links: GraphEdge[];
  positions: Record<string, GraphPosition>;
}

/**
 * THE POSITION MERGE — the exact rules the canvas applies: tree runs
 * the tidy layout (the layout is the law), radial/free run the ring
 * engine, and free ALONE lets the persisted drag positions win.
 * Exported pure for the gates.
 */
export function effectivePositions(
  graph: readonly GraphNode[],
  dragged: Record<string, { x: number; y: number }>,
  layoutMode: GraphLayoutMode,
): Record<string, GraphPosition> {
  const layout = layoutMode === "tree" ? layoutTree(graph) : layoutGraph(graph);
  return layoutMode === "free" ? { ...layout, ...dragged } : layout;
}

/**
 * THE EDGE GEOMETRY — parent edges first, then explicit links, path
 * fn per mode (vertical beziers in tree, radial sag elsewhere): the
 * same rows the canvas derives, so a settled overlay swap is seamless.
 */
function edgeRowsOf(
  graph: readonly GraphNode[],
  links: readonly GraphEdge[],
  positions: Record<string, GraphPosition>,
  layoutMode: GraphLayoutMode,
): Array<{ key: string; d: string; isLink: boolean; fromId: string; toId: string }> {
  const edgeFor = layoutMode === "tree" ? treeEdge : cubicBezierEdge;
  const rows: Array<{ key: string; d: string; isLink: boolean; fromId: string; toId: string }> = [];
  for (const node of graph) {
    const parentPos = node.parentId === undefined ? undefined : positions[node.parentId];
    const childPos = positions[node.id];
    if (parentPos === undefined || childPos === undefined) continue;
    rows.push({
      key: `parent:${node.id}`,
      d: edgeFor(parentPos, childPos),
      isLink: false,
      fromId: node.parentId as string,
      toId: node.id,
    });
  }
  for (const link of links) {
    const fromPos = positions[link.fromId];
    const toPos = positions[link.toId];
    if (fromPos === undefined || toPos === undefined) continue;
    rows.push({ key: link.id, d: edgeFor(fromPos, toPos), isLink: true, fromId: link.fromId, toId: link.toId });
  }
  return rows;
}

/** The ≤16-char canvas label (the chip truncates like the canvas). */
function canvasLabel(label: string): string {
  return label.length > LABEL_MAX ? `${label.slice(0, LABEL_MAX - 1)}…` : label;
}

/** CSS-selector-safe id fragment (node/link ids are minted, never hostile). */
function selFragment(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]/g, "");
}

export function GraphMotionLayer({
  graph,
  links,
  positions,
  layoutMode,
  view,
}: GraphMotionLayerProps) {
  // gm3 — THE REDUCED-MOTION SOURCE: when true, choreograph nothing.
  const prefersReduced = useReducedMotion();
  const reducedMotion = prefersReduced === true;

  const [spawnNodes, setSpawnNodes] = useState<SpawnNode[]>([]);
  const [spawnEdges, setSpawnEdges] = useState<SpawnEdge[]>([]);
  const [ghosts, setGhosts] = useState<GhostNode[]>([]);
  // THE DIFF MEMORY — the render-phase guard: the first commit records
  // the baseline (loading the persisted canvas choreographs nothing);
  // every identity change diffs exactly once.
  const [memory, setMemory] = useState<LayerMemory | null>(null);
  const prunedRef = useRef(false);

  // THE GEOMETRY — the same derivation the canvas performs.
  const effPositions = useMemo(
    () => effectivePositions(graph, positions, layoutMode),
    [graph, positions, layoutMode],
  );

  // THE DIFF — IN RENDER (no flash: masks/ghosts commit with the canvas
  // change). Guarded by identity, so StrictMode's double render and
  // ordinary re-renders diff nothing twice.
  if (memory === null || memory.graph !== graph || memory.links !== links || memory.positions !== effPositions) {
    const previous = memory;
    setMemory({ graph, links, positions: effPositions });
    if (previous !== null && !reducedMotion) {
      const prevIds = new Set(previous.graph.map((node) => node.id));
      const addedNodes = graph.filter((node) => !prevIds.has(node.id));
      const nextIds = new Set(graph.map((node) => node.id));
      const removedNodes = previous.graph.filter((node) => !nextIds.has(node.id));
      const prevLinkIds = new Set(previous.links.map((link) => link.id));
      const addedLinks = links.filter((link) => !prevLinkIds.has(link.id));

      // ENTER — the new ids take spawnIndex 0..n-1 in array order.
      if (addedNodes.length > 0 || addedLinks.length > 0) {
        const nodeRows: SpawnNode[] = addedNodes.flatMap((node) => {
          const position = effPositions[node.id];
          if (position === undefined) return [];
          return [{
            key: `spawn-node-${node.id}`,
            id: node.id,
            x: position.x,
            y: position.y,
            label: node.label,
            token: node.categoryToken,
            spawnIndex: addedNodes.indexOf(node),
          }];
        });
        // The new links draw themselves; the new NODES' derived parent
        // edges draw with the same index cadence (the wire lands as its
        // child pops). Both cannot ride one batch in practice (a
        // tether adds only a link; an expand adds only nodes) — take
        // whichever applies.
        const rows = edgeRowsOf(graph, links, effPositions, layoutMode);
        const drawnRows = addedLinks.length > 0
          ? rows.filter((row) => row.isLink && addedLinks.some((link) => link.id === row.key))
          : rows.filter((row) => !row.isLink && addedNodes.some((node) => row.toId === node.id));
        const edgeRows: SpawnEdge[] = drawnRows.map((row, index) => ({
          key: `spawn-edge-${row.key}`,
          d: row.d,
          spawnIndex: index,
          isLink: row.isLink,
          fromId: row.fromId,
          toId: row.toId,
        }));
        if (nodeRows.length > 0 || edgeRows.length > 0) {
          setSpawnNodes((current) => {
            const keys = new Set(current.map((row) => row.key));
            return [...current, ...nodeRows.filter((row) => !keys.has(row.key))];
          });
          setSpawnEdges((current) => {
            const keys = new Set(current.map((row) => row.key));
            return [...current, ...edgeRows.filter((row) => !keys.has(row.key))];
          });
        }
      }

      // EXIT — removed nodes ghost out at their last known spot.
      if (removedNodes.length > 0) {
        const ghostRows: GhostNode[] = removedNodes.flatMap((node) => {
          const position = previous.positions[node.id];
          if (position === undefined) return [];
          return [{
            key: `ghost-${node.id}`,
            x: position.x,
            y: position.y,
            label: node.label,
            token: node.categoryToken,
            leaving: false,
          }];
        });
        if (ghostRows.length > 0) setGhosts((current) => [...current, ...ghostRows]);
      }
    }
  }

  // THE GHOST WAVE — rest one beat at the death spot, then leave.
  useEffect(() => {
    if (ghosts.length === 0) return undefined;
    const timers: number[] = [];
    for (const ghost of ghosts) {
      if (ghost.leaving) continue;
      timers.push(
        window.setTimeout(() => {
          setGhosts((current) =>
            current.map((row) => (row.key === ghost.key ? { ...row, leaving: true } : row)),
          );
        }, GHOST_REST_MS),
      );
    }
    return () => {
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, [ghosts]);

  // THE UNMOUNT CLEANUP — timers ride the effects; the overlay itself
  // unmounts with the component (animejs animations die with their
  // path nodes; motion springs die with their divs).
  useEffect(() => {
    prunedRef.current = false;
    return () => {
      prunedRef.current = true;
    };
  }, []);

  if (reducedMotion) return null;
  if (spawnNodes.length === 0 && spawnEdges.length === 0 && ghosts.length === 0) return null;

  const pruneSpawnNode = (key: string): void => {
    if (prunedRef.current) return;
    setSpawnNodes((current) => current.filter((row) => row.key !== key));
  };
  const pruneSpawnEdge = (key: string): void => {
    if (prunedRef.current) return;
    setSpawnEdges((current) => current.filter((row) => row.key !== key));
  };
  const pruneGhost = (key: string): void => {
    if (prunedRef.current) return;
    setGhosts((current) => current.filter((row) => row.key !== key));
  };

  // THE MASKS — hide the identical static elements while their overlay
  // transient runs. Parent edges and link edges are distinguishable on
  // the canvas ([data-link] rides the explicit links only).
  const maskRules: string[] = [];
  for (const node of spawnNodes) {
    const id = selFragment(node.id);
    if (id !== "") maskRules.push(`.sig-graph .sig-graph__node[data-id="${id}"]{opacity:0 !important}`);
  }
  for (const edge of spawnEdges) {
    const from = selFragment(edge.fromId);
    const to = selFragment(edge.toId);
    if (from === "" || to === "") continue;
    const linkSelector = edge.isLink ? "[data-link]" : ":not([data-link])";
    maskRules.push(
      `.sig-graph .sig-graph__edge[data-parent="${from}"][data-child="${to}"]${linkSelector}{opacity:0 !important}`,
    );
  }

  const viewBox = `${view.x} ${view.y} ${VIEW_WIDTH / view.zoom} ${VIEW_HEIGHT / view.zoom}`;

  return (
    <>
      {maskRules.length > 0 && (
        <style data-testid="graph-motion-masks">{maskRules.join("\n")}</style>
      )}
      <svg
        className="graph-motion-layer"
        viewBox={viewBox}
        aria-hidden="true"
        focusable="false"
        data-testid="graph-motion-layer"
      >
        {/* STRATUM 3 — the animejs edge draws. */}
        {spawnEdges.map((edge) => (
          <AnimatedGraphEdge
            key={edge.key}
            settleKey={edge.key}
            d={edge.d}
            delayMs={edge.spawnIndex * 70}
            onSettled={pruneSpawnEdge}
          />
        ))}
        {/* STRATUM 2 — the motion node springs. Each transient lives in
            its own slack foreignObject at the node's graph-space spot
            (it pans/zooms with the canvas); the chip box itself is
            exactly 68×68 centered inside, so the spring scales around
            the node center. */}
        {spawnNodes.map((node) => (
          <foreignObject
            key={node.key}
            x={node.x - CHIP / 2 - FO_PAD}
            y={node.y - CHIP / 2 - FO_PAD}
            width={FO_SIZE}
            height={FO_SIZE}
          >
            <AnimatedGraphNode
              settleKey={node.key}
              spawnIndex={node.spawnIndex}
              style={{ position: "absolute", inset: FO_PAD }}
              onSettled={pruneSpawnNode}
            >
              <div className="sig-motion-node__chip" style={{ borderColor: `var(${node.token})` }}>
                <span className="sig-motion-node__label">{canvasLabel(node.label)}</span>
              </div>
            </AnimatedGraphNode>
          </foreignObject>
        ))}
        {ghosts.map((ghost) => (
          <foreignObject
            key={ghost.key}
            x={ghost.x - CHIP / 2 - FO_PAD}
            y={ghost.y - CHIP / 2 - FO_PAD}
            width={FO_SIZE}
            height={FO_SIZE}
          >
            {/* THE EXIT PRESENCE — the child is PRESENT while the ghost
                rests and REMOVED when it is marked leaving; AnimatePresence
                plays the 0.72 collapse on that removal inside the
                persistent foreignObject, and only a COMPLETED exit
                prunes the wrapper. */}
            <AnimatePresence onExitComplete={() => pruneGhost(ghost.key)}>
              {!ghost.leaving && (
                <AnimatedGraphNode
                  key={ghost.key}
                  settleKey={ghost.key}
                  ghost
                  style={{ position: "absolute", inset: FO_PAD }}
                >
                  <div className="sig-motion-node__chip" style={{ borderColor: `var(${ghost.token})` }}>
                    <span className="sig-motion-node__label">{canvasLabel(ghost.label)}</span>
                  </div>
                </AnimatedGraphNode>
              )}
            </AnimatePresence>
          </foreignObject>
        ))}
      </svg>
    </>
  );
}
