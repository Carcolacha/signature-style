/**
 * graph — <KnowledgeGraph>, the interactive node-link graph (2.7.0
 * "Interactive Knowledge Graph, Analytical SVG Charts & Manageable
 * Timeline"; 3.0.0 the obsidian interaction model; 3.6.0 THE GRAPH
 * STUDIO ENGINE: explicit edge model + edge selection/unlink + the
 * imperative canvas handle + search dimming).
 *
 * ONE `<svg role="application">` (viewBox 0 0 640 320) of pure SVG —
 * ZERO external charting packages (the Pruning Protocol: Chart.js /
 * D3 / Recharts stay out; the data-ink doctrine extends to graphs).
 * The canvas stays FLAT per the e1 shadow treaty: css/graph.css
 * declares ZERO box-shadow and ZERO hex — separation is drawn with
 * hairlines and the inset background, never elevation.
 *
 * DETERMINISTIC LAYOUT — the whole point. Same nodes in, same
 * coordinates out, EVERY time: `layoutGraph` (a pure, exported,
 * gate-testable helper) sorts every node by an id hash before BFS, so
 * the input array's ORDER cannot move a node — only the SET matters.
 * Roots (parentId undefined) sit at the viewBox center; each BFS depth
 * level rides a ring (radius 90 + depth·110 viewBox units, projected
 * elliptically + hard-clamped so every node stays inside the 640×320
 * box); children fan across an angular span around their parent's
 * angle (depth-1 spreads the full circle; deeper levels span
 * ±min(π, (n−1)·π/5)), ties broken by the same id hash.
 *
 * THE EDGE MODEL (3.6.0) — two edge kinds, one render path:
 *   · PARENT edges are DERIVED from `node.parentId` (the 2.7.0 tree
 *     contract — never stored). Their id is `parent:${childId}`.
 *   · LINK edges are the EXPLICIT array — `GraphEdge { id, fromId,
 *     toId }` — persisted by the consumer (the playground stores them
 *     under sig.workspace.v3.links). Right-click tether and the
 *     inspector's "Spawn linked child" append here.
 * BOTH kinds render as a cubic-Bezier pair: an invisible 14px hit path
 * (keyboard/mouse target) under the visible hairline. Clicking an edge
 * selects it (crimson highlight class, `data-selected="true"`),
 * `onSelectEdge` reports it, and Delete/Backspace (when focus is not in
 * a typing target — `isTypingTarget`) fires `onUnlinkEdge(edgeId)`;
 * the CONSUMER resolves what unlink means for that id (a parent edge
 * unlinks by clearing the child's parentId; a link edge is removed
 * from its array).
 *
 * FOCUS + SEARCH DIMMING is class-driven, not style-driven: selecting
 * a node adds `.sig-graph--focused` to the svg and `data-dim="true"`
 * to every node/edge NOT adjacent to the selection; a non-empty
 * `searchQuery` dims every node/edge whose label does not substring-
 * match (case-insensitive) — the HUD search's mechanism. css/graph.css
 * answers with opacity 0.25. The selected node's stroke flips to the
 * structural Flamingo at width 3; the selected edge's stroke flips to
 * --sig-crimson at width 2.5 (3.6.0).
 *
 * THE IMPERATIVE HANDLE (3.6.0) — the Graph Studio HUD drives the
 * canvas through `ref`: { zoomIn, zoomOut, getZoom, autoArrange,
 * selectNode }. Zoom buttons are CENTER-anchored (the wheel stays
 * cursor-anchored); autoArrange delegates to `onAutoArrange` (the
 * consumer clears its persisted custom positions and re-persists the
 * deterministic layout — the component owns no storage); selectNode
 * lets "Jump-to-target" buttons move the selection. Every view change
 * reports through `onViewChange` (the HUD's live zoom readout).
 *
 * @example
 * ```tsx
 * const graphRef = useRef<KnowledgeGraphHandle>(null);
 * <KnowledgeGraph
 *   ref={graphRef}
 *   nodes={[{ id: "root", label: "Product Launch", categoryToken: "--sig-lavender" }]}
 *   links={[{ id: "l1", fromId: "root", toId: "venue" }]}
 *   onUnlinkEdge={(edgeId) => unlink(edgeId)}
 *   searchQuery={hudQuery}
 *   addOn
 *   onAddNode={(node) => addNode(node)}
 *   label="Product launch graph"
 * />
 * graphRef.current?.zoomIn();
 * ```
 */

import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import type { SigColorToken } from "./surface.js";
import { Button } from "./primitives.js";
import { Input } from "./forms.js";

/** One node on the knowledge graph. `parentId` undefined = root. */
export interface GraphNode {
  /** Stable unique identifier. */
  id: string;
  /** The node's display label — truncated to 16 characters on the canvas. */
  label: string;
  /** A `--sig-*` content token — the node's ring color (Rule of Engagement). */
  categoryToken: SigColorToken;
  /** Optional longer copy shown in the footer strip when selected. */
  note?: string;
  /** The parent node's id; undefined renders this node as a root. */
  parentId?: string;
  /**
   * 3.6.0 — the Graph Studio inspector's tags (comma-separated in the
   * HUD field, chips in the inspector). FREE-FORM (not an enum): the
   * wire contract (shared/schema.ts GraphNodeRecord.tags) is an
   * enumerated string[] with per-item non-emptiness, nothing stricter.
   */
  tags?: string[];
}

/** One laid-out node: final viewBox coordinates plus its ring/angle math. */
export interface GraphPosition {
  x: number;
  y: number;
  depth: number;
  angle: number;
}

/* The layout constants — all viewBox units, all documented above. */
const VIEW_WIDTH = 640;
const VIEW_HEIGHT = 320;
const CENTER_X = VIEW_WIDTH / 2;
const CENTER_Y = VIEW_HEIGHT / 2;
const NODE_RADIUS = 34; /* 3.0.0 obsidian: generous nodes (was 26) */
const NODE_PAD = NODE_RADIUS + 2;
const RING_BASE = 90;
const RING_STEP = 110;
const ROOT_SPREAD_RADIUS = 40;
const LABEL_MAX = 16; /* 3.0.0 obsidian: longer labels before the ellipsis (was 12) */

/** Deterministic, order-independent tie-break hash (FNV-style, 32-bit). */
function idHash(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** The ring radius for a depth level: 90 + depth·110 viewBox units. */
function ringRadius(depth: number): number {
  return RING_BASE + depth * RING_STEP;
}

/** Project + clamp one polar point into the viewBox (inside NODE_PAD). */
function project(
  angle: number,
  radius: number,
  maxRadius: number,
): { x: number; y: number } {
  const xScale = maxRadius > 0 ? (CENTER_X - NODE_PAD) / maxRadius : 1;
  const yScale = maxRadius > 0 ? (CENTER_Y - NODE_PAD) / maxRadius : 1;
  const x = CENTER_X + Math.cos(angle) * radius * xScale;
  const y = CENTER_Y + Math.sin(angle) * radius * yScale;
  const clampX = Math.min(VIEW_WIDTH - NODE_PAD, Math.max(NODE_PAD, x));
  const clampY = Math.min(VIEW_HEIGHT - NODE_PAD, Math.max(NODE_PAD, y));
  return {
    x: Math.round(clampX * 100) / 100,
    y: Math.round(clampY * 100) / 100,
  };
}

/**
 * The PURE layout helper — nodes in, coordinates out, deterministically.
 * Sorts by id hash first (input ORDER can never move a node), BFS-depths
 * from the roots, rings per level, angular fans per parent. Orphans
 * (parentId pointing at a missing id) are treated as roots — defensive
 * and still deterministic.
 */
export function layoutGraph(
  nodes: readonly GraphNode[],
): Record<string, GraphPosition> {
  const sorted = [...nodes].sort(
    (a, b) => idHash(a.id) - idHash(b.id) || (a.id < b.id ? -1 : 1),
  );
  const knownIds = new Set(sorted.map((node) => node.id));
  const roots: GraphNode[] = [];
  const childrenOf = new Map<string, GraphNode[]>();
  for (const node of sorted) {
    const isRoot =
      node.parentId === undefined || !knownIds.has(node.parentId);
    if (isRoot) {
      roots.push(node);
      continue;
    }
    const siblings = childrenOf.get(node.parentId as string);
    if (siblings === undefined) childrenOf.set(node.parentId as string, [node]);
    else siblings.push(node);
  }

  // BFS depth assignment (the graph may not be a tree — first visitor wins).
  const depthOf = new Map<string, number>();
  const queue: GraphNode[] = [...roots];
  for (const root of roots) depthOf.set(root.id, 0);
  let head = 0;
  while (head < queue.length) {
    const current = queue[head];
    if (current === undefined) break;
    head += 1;
    const depth = depthOf.get(current.id) ?? 0;
    for (const child of childrenOf.get(current.id) ?? []) {
      if (!depthOf.has(child.id)) {
        depthOf.set(child.id, depth + 1);
        queue.push(child);
      }
    }
  }

  const maxDepth = queue.reduce(
    (max, node) => Math.max(max, depthOf.get(node.id) ?? 0),
    0,
  );
  const maxRadius = ringRadius(maxDepth);

  const positions: Record<string, GraphPosition> = {};
  assignRoots(roots, positions);
  walkChildren(queue, childrenOf, depthOf, maxRadius, positions);
  return positions;
}

/** Place the roots — one dead center; several evenly on a small center circle. */
function assignRoots(
  roots: readonly GraphNode[],
  positions: Record<string, GraphPosition>,
): void {
  roots.forEach((root, index) => {
    if (roots.length === 1) {
      positions[root.id] = { x: CENTER_X, y: CENTER_Y, depth: 0, angle: -Math.PI / 2 };
      return;
    }
    const angle = -Math.PI / 2 + (index / roots.length) * Math.PI * 2;
    const { x, y } = project(angle, ROOT_SPREAD_RADIUS, ROOT_SPREAD_RADIUS);
    positions[root.id] = { x, y, depth: 0, angle };
  });
}

/** BFS walk: fan each parent's children across an angular span around its angle. */
function walkChildren(
  queue: readonly GraphNode[],
  childrenOf: Map<string, GraphNode[]>,
  depthOf: Map<string, number>,
  maxRadius: number,
  positions: Record<string, GraphPosition>,
): void {
  for (const parent of queue) {
    const kids = childrenOf.get(parent.id) ?? [];
    const parentAngle = positions[parent.id]?.angle ?? -Math.PI / 2;
    const depth = depthOf.get(parent.id) ?? 0;
    kids.forEach((child, index) => {
      const childDepth = depthOf.get(child.id) ?? depth + 1;
      const angle = childAngle(parentAngle, index, kids.length, depth);
      const { x, y } = project(angle, ringRadius(childDepth), maxRadius);
      positions[child.id] = { x, y, depth: childDepth, angle };
    });
  }
}

/** Depth-1 spreads the full circle; deeper levels fan ±min(π, (n−1)·π/5). */
function childAngle(
  parentAngle: number,
  index: number,
  count: number,
  parentDepth: number,
): number {
  if (parentDepth === 0) {
    return -Math.PI / 2 + (index / count) * Math.PI * 2;
  }
  const span = Math.min(Math.PI, (count - 1) * (Math.PI / 5));
  const step = count > 1 ? span / (count - 1) : 0;
  return parentAngle - span / 2 + index * step;
}

/**
 * The PURE edge helper — one cubic-Bezier path string whose control
 * points sit 60% along the parent→child radial (from both ends), so
 * the curve sags toward the line between the rings.
 */
export function cubicBezierEdge(
  parent: { x: number; y: number },
  child: { x: number; y: number },
): string {
  const dx = child.x - parent.x;
  const dy = child.y - parent.y;
  const c1x = parent.x + dx * 0.6;
  const c1y = parent.y + dy * 0.6;
  const c2x = child.x - dx * 0.6;
  const c2y = child.y - dy * 0.6;
  return `M ${parent.x} ${parent.y} C ${c1x} ${c1y} ${c2x} ${c2y} ${child.x} ${child.y}`;
}

/** The node ring's stroke: its chromatic token, or structural Flamingo fallback. */
function strokeFor(node: GraphNode): string {
  if (!node.categoryToken.startsWith("--sig-")) {
    return "var(--color-cake-primary)";
  }
  return `var(${node.categoryToken})`;
}

/** The ≤16-char canvas label (15 glyphs + ellipsis when truncating). */
function canvasLabel(label: string): string {
  return label.length > LABEL_MAX ? `${label.slice(0, LABEL_MAX - 1)}…` : label;
}

/**
 * True when a KeyboardEvent's target is a text-entry surface (the v2.9.0
 * contract): inputs, textareas, selects and contentEditable hosts. The
 * global Delete/Backspace unlink (3.6.0) and the playground's "?" key
 * both gate on this — a shortcut must never fire while the user types.
 */
export function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (el === null || typeof el.tagName !== "string") return false;
  const tag = el.tagName.toLowerCase();
  return (
    tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable === true
  );
}

/* ==========================================================================
   3.0.0 OBSIDIAN GRAPH — the interaction model (owner spec):
     · GENEROUS NODES — r 34, labels 13px, truncation 16 chars, full
       label in a <title> tooltip child.
     · DRAG (60fps) — pointerdown on a node → setPointerCapture →
       pointermove mutates the <g> transform DIRECTLY through a ref map
       (requestAnimationFrame-throttled, ZERO setState per move) →
       pointerup commits once via onMoveNode(id, position) — the
       playground persists positions through its workspace state.
     · PAN/ZOOM — implemented in VIEWBOX MATH (documented choice): the
       view is a {x, y, zoom} state projected into the viewBox string,
       so node coordinates stay in GRAPH SPACE — dragging a node while
       zoomed needs no inverse transforms, and the tether math shares
       the same client→svg helper. Zoom clamps 0.5–2.5, anchored at the
       cursor (wheel) or the canvas center (the HUD buttons, 3.6.0).
     · DBL-CLICK SPAWN — double-click on empty canvas converts the point
       to graph space and fires onAddNodeAt(point, nearest-or-root).
     · RIGHT-CLICK TETHER — contextmenu on a node captures the pointer
       and draws the live dashed .sig-graph__tether (azure, 6 4, 1.5px)
       to the cursor; release over another node fires
       onLinkNodes(fromId, toId) — the EXPLICIT-LINKS model: the
       playground stores GraphEdge records in its persisted state and
       hands them back through the links prop.
     · Escape cancels an in-flight drag or tether, deselects a selected
       edge; keyboard arrows nudge the selected node 8px (a11y parity,
       the grid step); Delete/Backspace unlinks the selected edge.
   ========================================================================== */

/** The pan/zoom view — projected into the viewBox string (graph space stays stable). */
export interface GraphView {
  x: number;
  y: number;
  zoom: number;
}

/**
 * One EXPLICIT edge (3.6.0) — the GraphEdge model. The id is
 * consumer-assigned (the playground mints `lnk-${Date.now().toString(36)}`);
 * parent edges are NOT in this array — they derive from parentId and
 * carry the deterministic id `parent:${childId}`.
 */
export interface GraphEdge {
  id: string;
  fromId: string;
  toId: string;
}

/** One selectable edge as reported to the consumer. */
export interface GraphEdgeSelection {
  id: string;
  /** "parent" = derived from parentId (unlink → clear the child's parent). */
  kind: "parent" | "link";
  fromId: string;
  toId: string;
}

/** The imperative canvas handle (3.6.0) — the Graph Studio HUD's API. */
export interface KnowledgeGraphHandle {
  /** Zoom one step IN, anchored at the canvas center. */
  zoomIn(): void;
  /** Zoom one step OUT, anchored at the canvas center. */
  zoomOut(): void;
  /** The current zoom factor (1 = the default viewBox fit). */
  getZoom(): number;
  /**
   * Re-run the deterministic layout: delegates to `onAutoArrange` — the
   * CONSUMER clears its persisted custom positions (the component owns
   * no storage), the pure layoutGraph re-places every node, the empty
   * positions map persists.
   */
  autoArrange(): void;
  /** Move the node selection (the inspector's Jump-to-target). */
  selectNode(id: string): void;
}

export interface KnowledgeGraphProps {
  /** The nodes — order is irrelevant; the layout is id-hash deterministic. */
  nodes: GraphNode[];
  /** Called by the "Add & Link" toolbar with the new node (minus its id). */
  onAddNode?: (node: Omit<GraphNode, "id">) => void;
  /**
   * 3.0.0 — called by double-click on empty canvas with the graph-space
   * point and the parent hint (the nearest node, or the root).
   */
  onAddNodeAt?: (point: { x: number; y: number }, parentId?: string) => void;
  /** Fired when a node is clicked/keyboard-activated (selection stays internal). */
  onSelectNode?: (node: GraphNode) => void;
  /**
   * 3.6.0 — fired when an edge is clicked (the hit path). The consumer
   * mirrors the selection into the inspector's edge card.
   */
  onSelectEdge?: (edge: GraphEdgeSelection) => void;
  /**
   * 3.0.0 — the drag commit: fires ONCE per drag (pointerup) with the
   * node id and its final graph-space position. Persist it and feed it
   * back through `positions`.
   */
  onMoveNode?: (id: string, position: { x: number; y: number }) => void;
  /**
   * 3.0.0 — the right-click tether commit: source → target. The
   * consumer mints the GraphEdge id and appends it to its persisted
   * links array.
   */
  onLinkNodes?: (fromId: string, toId: string) => void;
  /**
   * 3.6.0 — Delete/Backspace on the selected edge (typing-target
   * guarded). The id is `parent:${childId}` for derived edges, or the
   * GraphEdge.id for explicit links — the consumer resolves the kind.
   */
  onUnlinkEdge?: (edgeId: string) => void;
  /**
   * 3.6.0 — the auto-arrange delegate (see KnowledgeGraphHandle).
   * Omit it and the handle's autoArrange is a no-op.
   */
  onAutoArrange?: () => void;
  /**
   * 3.6.0 — every view change (pan/zoom) reports here so the HUD can
   * render the live zoom readout.
   */
  onViewChange?: (view: GraphView) => void;
  /**
   * 3.0.0 — user-dragged positions, merged OVER the deterministic
   * layout (the persistence round-trip: onMoveNode writes here).
   */
  positions?: Record<string, { x: number; y: number }>;
  /**
   * 3.6.0 — the EXPLICIT links (GraphEdge[]), rendered as bezier edges
   * alongside the parent-derived edges. (3.0.0-3.5.0 shipped the
   * shapeless {from, to} pair; the id-ed GraphEdge replaced it.)
   */
  links?: GraphEdge[];
  /**
   * 3.6.0 — the HUD search: nodes (and edges) whose labels do NOT
   * substring-match (case-insensitive) take data-dim="true". Empty or
   * whitespace = no search dimming.
   */
  searchQuery?: string;
  /** The svg's rendered height in px. Default 320. */
  height?: number;
  /** The accessible name for the graph application. Default "Knowledge graph". */
  label?: string;
  /** Renders the compact add-and-link toolbar. Default false. */
  addOn?: boolean;
}

/* The zoom clamp (3.0.0): 0.5×–2.5× around the cursor. */
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2.5;
/* The zoom step the HUD buttons take (center-anchored). */
const ZOOM_BUTTON_STEP = 1.2;
/* The keyboard nudge step — the 8px grid (a11y parity with mouse drag). */
const NUDGE_PX = 8;

/** A client (pointer) point in graph-space coordinates (viewBox-aware). */
function clientToGraph(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
  view: GraphView,
): { x: number; y: number } {
  const rect = svg.getBoundingClientRect();
  const width = VIEW_WIDTH / view.zoom;
  const height = VIEW_HEIGHT / view.zoom;
  return {
    x: view.x + ((clientX - rect.left) / Math.max(rect.width, 1)) * width,
    y: view.y + ((clientY - rect.top) / Math.max(rect.height, 1)) * height,
  };
}

interface EdgeRow {
  id: string;
  kind: "parent" | "link";
  fromId: string;
  toId: string;
  d: string;
}

/**
 * THE GRAPH STUDIO CANVAS (3.6.0) — memo(forwardRef) so the HUD owns a
 * KnowledgeGraphHandle. Everything below the fold is the 3.0.0
 * interaction model with the 3.6.0 edge model grafted in.
 */
export const KnowledgeGraph = memo(
  forwardRef<KnowledgeGraphHandle, KnowledgeGraphProps>(function KnowledgeGraph(
    {
      nodes,
      onAddNode,
      onAddNodeAt,
      onSelectNode,
      onSelectEdge,
      onMoveNode,
      onLinkNodes,
      onUnlinkEdge,
      onAutoArrange,
      onViewChange,
      positions: draggedPositions,
      links = [],
      searchQuery = "",
      height = 320,
      label,
      addOn = false,
    },
    ref,
  ) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
    const [draftLabel, setDraftLabel] = useState("");
    const [view, setView] = useState<GraphView>({ x: 0, y: 0, zoom: 1 });
    // The live tether — source id + current cursor point (graph space).
    const [tether, setTether] = useState<{ fromId: string; to: { x: number; y: number } } | null>(null);
    const layout = useMemo(() => layoutGraph(nodes), [nodes]);
    // User-dragged positions WIN over the deterministic layout (the
    // persistence round-trip: onMoveNode → parent state → this prop).
    const positions = useMemo(() => ({ ...layout, ...draggedPositions }), [layout, draggedPositions]);
    const selected = nodes.find((node) => node.id === selectedId) ?? null;
    const rootId = nodes.find((node) => node.parentId === undefined)?.id;

    const svgRef = useRef<SVGSVGElement | null>(null);
    const tetherPathRef = useRef<SVGPathElement | null>(null);
    /** Per-node <g> refs — the 60fps drag mutates transforms DIRECTLY. */
    const nodeRefs = useRef(new Map<string, SVGGElement>());
    const frameRef = useRef<number | null>(null);
    const dragRef = useRef<{
      id: string;
      pointerId: number;
      startClient: { x: number; y: number };
      startPos: { x: number; y: number };
      last: { x: number; y: number };
    } | null>(null);
    const panRef = useRef<{
      pointerId: number;
      startClient: { x: number; y: number };
      startView: GraphView;
    } | null>(null);
    const viewRef = useRef(view);
    viewRef.current = view;
    const [interacting, setInteracting] = useState(false);

    /* -- THE EDGE MODEL (3.6.0): derived parent edges + explicit links -- */
    const edgeRows = useMemo<EdgeRow[]>(() => {
      const parentEdges: EdgeRow[] = [];
      for (const node of nodes) {
        const parentPos = node.parentId === undefined ? undefined : positions[node.parentId];
        const childPos = positions[node.id];
        if (parentPos === undefined || childPos === undefined) continue;
        parentEdges.push({
          id: `parent:${node.id}`,
          kind: "parent",
          fromId: node.parentId as string,
          toId: node.id,
          d: cubicBezierEdge(parentPos, childPos),
        });
      }
      const linkEdges: EdgeRow[] = [];
      for (const link of links) {
        const fromPos = positions[link.fromId];
        const toPos = positions[link.toId];
        if (fromPos === undefined || toPos === undefined) continue;
        linkEdges.push({
          id: link.id,
          kind: "link",
          fromId: link.fromId,
          toId: link.toId,
          d: cubicBezierEdge(fromPos, toPos),
        });
      }
      return [...parentEdges, ...linkEdges];
    }, [nodes, links, positions]);
    const edgeRowsRef = useRef(edgeRows);
    edgeRowsRef.current = edgeRows;
    const selectedEdge = edgeRows.find((edge) => edge.id === selectedEdgeId) ?? null;

    // THE DIM BOOKKEEPING (3.6.0): the union of focus-dimming (non-
    // adjacent to the selection) and search-dimming (label does not
    // substring-match the query). Edges dim when either endpoint dims.
    const query = searchQuery.trim().toLowerCase();
    const dimmedIds = useMemo(() => {
      const dim = new Set<string>();
      if (selected !== null) {
        const adjacent = new Set<string>([selected.id]);
        if (selected.parentId !== undefined) adjacent.add(selected.parentId);
        for (const node of nodes) {
          if (node.parentId === selected.id) adjacent.add(node.id);
        }
        for (const node of nodes) {
          if (!adjacent.has(node.id)) dim.add(node.id);
        }
        for (const edge of edgeRows) {
          if (!(adjacent.has(edge.fromId) && adjacent.has(edge.toId))) dim.add(edge.id);
        }
      }
      if (query !== "") {
        const hit = (id: string): boolean => {
          const node = nodes.find((candidate) => candidate.id === id);
          if (node === undefined) return false;
          return node.label.toLowerCase().includes(query);
        };
        for (const node of nodes) {
          if (!hit(node.id)) dim.add(node.id);
        }
        for (const edge of edgeRows) {
          if (!hit(edge.fromId) && !hit(edge.toId)) dim.add(edge.id);
        }
      }
      return dim;
    }, [nodes, edgeRows, selected, query]);
    const isDim = (id: string): boolean => dimmedIds.has(id);

    // The imperative handle — the HUD's zoom/arrange/select API.
    useImperativeHandle(
      ref,
      () => ({
        zoomIn: () => zoomAtCenter(ZOOM_BUTTON_STEP),
        zoomOut: () => zoomAtCenter(1 / ZOOM_BUTTON_STEP),
        getZoom: () => viewRef.current.zoom,
        autoArrange: () => onAutoArrange?.(),
        selectNode: (id: string) => {
          const node = nodes.find((candidate) => candidate.id === id);
          if (node === undefined) return;
          setSelectedEdgeId(null);
          handleSelect(node);
        },
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [nodes, onAutoArrange],
    );

    // THE VIEW REPORTER — every pan/zoom lands in the HUD's readout.
    useEffect(() => {
      onViewChange?.(view);
    }, [view, onViewChange]);

    // ESCAPE CANCELS — an in-flight drag (restore the committed transform)
    // or tether (drop the live path) dies here, keyboard first. Escape
    // ALSO deselects a selected edge (3.6.0), typing-target guarded.
    useEffect(() => {
      const onKeyDown = (event: KeyboardEvent): void => {
        if (event.key !== "Escape") return;
        if (isTypingTarget(event.target)) return;
        if (dragRef.current !== null) {
          const drag = dragRef.current;
          const g = nodeRefs.current.get(drag.id);
          if (g !== undefined) {
            g.setAttribute("transform", `translate(${drag.startPos.x} ${drag.startPos.y})`);
          }
          dragRef.current = null;
        }
        if (tetherPathRef.current !== null) {
          tetherPathRef.current.setAttribute("d", "");
          tetherPathRef.current = null;
        }
        setTether(null);
        panRef.current = null;
        setInteracting(false);
        setSelectedEdgeId((current) => (current !== null ? null : current));
      };
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    // THE EDGE UNLINK (3.6.0) — Delete/Backspace with an edge selected,
    // never while typing. The CONSUMER resolves the unlink semantics.
    useEffect(() => {
      if (selectedEdgeId === null || onUnlinkEdge === undefined) return;
      const onKeyDown = (event: KeyboardEvent): void => {
        if (event.key !== "Delete" && event.key !== "Backspace") return;
        if (isTypingTarget(event.target)) return;
        event.preventDefault();
        const edge = edgeRowsRef.current.find((candidate) => candidate.id === selectedEdgeId);
        if (edge === undefined) return;
        onUnlinkEdge(edge.id);
        setSelectedEdgeId(null);
      };
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }, [selectedEdgeId, onUnlinkEdge]);

    useEffect(() => {
      return () => {
        if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      };
    }, []);

    const handleSelect = (node: GraphNode): void => {
      setSelectedId(node.id);
      setSelectedEdgeId(null);
      onSelectNode?.(node);
    };

    const handleEdgeSelect = (edge: EdgeRow): void => {
      setSelectedId(null);
      setSelectedEdgeId(edge.id);
      onSelectEdge?.({ id: edge.id, kind: edge.kind, fromId: edge.fromId, toId: edge.toId });
    };

    const handleAdd = (): void => {
      const trimmed = draftLabel.trim();
      if (trimmed === "" || onAddNode === undefined) return;
      // Parents to the SELECTION; else the root; with no nodes at all the
      // parentId stays undefined and the newcomer BECOMES the root.
      onAddNode({
        label: trimmed,
        categoryToken: "--sig-lavender",
        parentId: selectedId ?? rootId,
      });
      setDraftLabel("");
    };

    /* -- CENTERED ZOOM (3.6.0, the HUD buttons): the canvas center is
       the anchor — the graph point at the center stays put. ---------- */
    const zoomAtCenter = useCallback((factor: number): void => {
      const current = viewRef.current;
      const zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, current.zoom * factor));
      const centerX = current.x + VIEW_WIDTH / current.zoom / 2;
      const centerY = current.y + VIEW_HEIGHT / current.zoom / 2;
      setView({
        x: centerX - VIEW_WIDTH / zoom / 2,
        y: centerY - VIEW_HEIGHT / zoom / 2,
        zoom,
      });
    }, []);

    /* -- DRAG (60fps): capture → rAF mutate the g transform → commit once -- */
    const handleNodePointerDown = (node: GraphNode, event: ReactPointerEvent<SVGGElement>): void => {
      if (event.button !== 0 || onMoveNode === undefined) return;
      const position = positions[node.id];
      if (position === undefined) return;
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      dragRef.current = {
        id: node.id,
        pointerId: event.pointerId,
        startClient: { x: event.clientX, y: event.clientY },
        startPos: { x: position.x, y: position.y },
        last: { x: position.x, y: position.y },
      };
      setInteracting(true);
    };

    const handleNodePointerMove = (event: ReactPointerEvent<SVGGElement>): void => {
      const drag = dragRef.current;
      const svg = svgRef.current;
      if (drag === null || svg === null || event.pointerId !== drag.pointerId) return;
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        const current = dragRef.current;
        if (current === null) return;
        const rect = svg.getBoundingClientRect();
        const scale = VIEW_WIDTH / viewRef.current.zoom / Math.max(rect.width, 1);
        const x = current.startPos.x + (event.clientX - current.startClient.x) * scale;
        const y = current.startPos.y + (event.clientY - current.startClient.y) * scale;
        current.last = { x, y };
        // THE 60fps PATH: mutate the <g> transform DIRECTLY — no setState
        // per move, React never re-renders during the drag.
        const g = nodeRefs.current.get(current.id);
        if (g !== undefined) g.setAttribute("transform", `translate(${x} ${y})`);
      });
    };

    const handleNodePointerUp = (node: GraphNode, event: ReactPointerEvent<SVGGElement>): void => {
      const drag = dragRef.current;
      if (drag === null || event.pointerId !== drag.pointerId) return;
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      dragRef.current = null;
      setInteracting(false);
      // ONE commit per drag — the playground persists through state.
      if (onMoveNode !== undefined) {
        onMoveNode(node.id, { x: Math.round(drag.last.x * 100) / 100, y: Math.round(drag.last.y * 100) / 100 });
      }
    };

    /* -- TETHER (right-click): capture on the svg, live dashed path ----- */
    const handleNodeContextMenu = (node: GraphNode, event: ReactMouseEvent<SVGGElement>): void => {
      if (onLinkNodes === undefined) return;
      event.preventDefault();
      event.stopPropagation();
      const svg = svgRef.current;
      if (svg === null) return;
      const point = clientToGraph(svg, event.clientX, event.clientY, viewRef.current);
      setTether({ fromId: node.id, to: point });
      setInteracting(true);
      handleSelect(node);
    };

    const handleTetherMove = (event: ReactPointerEvent<SVGSVGElement>): void => {
      if (tether === null) return;
      const svg = svgRef.current;
      if (svg === null) return;
      const from = positions[tether.fromId];
      if (from === undefined) return;
      const point = clientToGraph(svg, event.clientX, event.clientY, viewRef.current);
      setTether({ fromId: tether.fromId, to: point });
      if (tetherPathRef.current !== null) {
        tetherPathRef.current.setAttribute("d", `M ${from.x} ${from.y} L ${point.x} ${point.y}`);
      }
    };

    const handleTetherUp = (event: ReactPointerEvent<SVGSVGElement>): void => {
      if (tether === null || onLinkNodes === undefined) return;
      const svg = svgRef.current;
      if (svg === null) return;
      // THE HIT TEST: elementFromPoint → the nearest node under the cursor.
      const target = document.elementFromPoint(event.clientX, event.clientY);
      const nodeG = target?.closest?.("g.sig-graph__node") as SVGGElement | null;
      const targetId = nodeG?.dataset?.id;
      const sourceId = tether.fromId;
      setTether(null);
      setInteracting(false);
      if (tetherPathRef.current !== null) {
        tetherPathRef.current.setAttribute("d", "");
        tetherPathRef.current = null;
      }
      if (targetId !== undefined && targetId !== sourceId) {
        onLinkNodes(sourceId, targetId);
      }
    };

    /* -- PAN (empty canvas) + ZOOM (wheel) — viewBox math, rAF-throttled -- */
    const handleCanvasPointerDown = (event: ReactPointerEvent<SVGSVGElement>): void => {
      if (event.button !== 0) return;
      const target = event.target as Element;
      if (target.closest("g.sig-graph__node") !== null) return; // nodes drag, not pan
      const svg = svgRef.current;
      if (svg === null) return;
      svg.setPointerCapture(event.pointerId);
      panRef.current = {
        pointerId: event.pointerId,
        startClient: { x: event.clientX, y: event.clientY },
        startView: viewRef.current,
      };
      setInteracting(true);
    };

    const handleCanvasPointerMove = (event: ReactPointerEvent<SVGSVGElement>): void => {
      if (tether !== null) {
        handleTetherMove(event);
        return;
      }
      const pan = panRef.current;
      if (pan === null || event.pointerId !== pan.pointerId) return;
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        const active = panRef.current;
        const svg = svgRef.current;
        if (active === null || svg === null) return;
        const rect = svg.getBoundingClientRect();
        const scale = VIEW_WIDTH / active.startView.zoom / Math.max(rect.width, 1);
        setView({
          x: active.startView.x - (event.clientX - active.startClient.x) * scale,
          y: active.startView.y - (event.clientY - active.startClient.y) * scale,
          zoom: active.startView.zoom,
        });
      });
    };

    const handleCanvasPointerUp = (event: ReactPointerEvent<SVGSVGElement>): void => {
      if (tether !== null) {
        handleTetherUp(event);
        return;
      }
      if (panRef.current !== null && event.pointerId === panRef.current.pointerId) {
        panRef.current = null;
        setInteracting(false);
      }
    };

    /* 3.0.0 — the wheel is attached NATIVELY (non-passive): React's
       synthetic onWheel registers passive at the root, and a passive
       listener cannot preventDefault (the page would scroll while
       zooming). The effect owns subscribe/unsubscribe; the handler reads
       the live view through viewRef. */
    useEffect(() => {
      const svg = svgRef.current;
      if (svg === null) return;
      const onWheelNative = (event: WheelEvent): void => {
        event.preventDefault();
        applyWheelZoom(event.clientX, event.clientY, event.deltaY);
      };
      svg.addEventListener("wheel", onWheelNative, { passive: false });
      return () => svg.removeEventListener("wheel", onWheelNative);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* -- ZOOM (wheel) — viewBox math, cursor-anchored ---------------------- */
    const applyWheelZoom = (clientX: number, clientY: number, deltaY: number): void => {
      const svg = svgRef.current;
      if (svg === null) return;
      const before = clientToGraph(svg, clientX, clientY, viewRef.current);
      const factor = deltaY < 0 ? 1.1 : 0.9;
      const zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, viewRef.current.zoom * factor));
      const rect = svg.getBoundingClientRect();
      const fx = (clientX - rect.left) / Math.max(rect.width, 1);
      const fy = (clientY - rect.top) / Math.max(rect.height, 1);
      // Anchor the zoom at the cursor: the graph point under it must stay put.
      setView({
        x: before.x - fx * (VIEW_WIDTH / zoom),
        y: before.y - fy * (VIEW_HEIGHT / zoom),
        zoom,
      });
    };

    /* -- DBL-CLICK SPAWN — empty canvas → a node at that graph point ----- */
    const handleDoubleClick = (event: ReactMouseEvent<SVGSVGElement>): void => {
      if (onAddNodeAt === undefined) return;
      const target = event.target as Element;
      if (target.closest("g.sig-graph__node") !== null) return;
      const svg = svgRef.current;
      if (svg === null) return;
      const point = clientToGraph(svg, event.clientX, event.clientY, viewRef.current);
      // The nearest node within reach parents the newcomer; else the root.
      let nearest: string | undefined = rootId;
      let best = Number.POSITIVE_INFINITY;
      for (const node of nodes) {
        const position = positions[node.id];
        if (position === undefined) continue;
        const distance = Math.hypot(position.x - point.x, position.y - point.y);
        if (distance < best) {
          best = distance;
          nearest = node.id;
        }
      }
      onAddNodeAt({ x: Math.round(point.x), y: Math.round(point.y) }, nearest);
    };

    const handleNodeKeyDown = (node: GraphNode, event: ReactKeyboardEvent<SVGGElement>): void => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleSelect(node);
        return;
      }
      // 3.0.0 KEYBOARD PARITY: arrows nudge the selected node 8px — the
      // same onMoveNode commit the mouse drag uses.
      const deltas: Record<string, { x: number; y: number }> = {
        ArrowUp: { x: 0, y: -NUDGE_PX },
        ArrowDown: { x: 0, y: NUDGE_PX },
        ArrowLeft: { x: -NUDGE_PX, y: 0 },
        ArrowRight: { x: NUDGE_PX, y: 0 },
      };
      const delta = deltas[event.key];
      if (delta === undefined || onMoveNode === undefined) return;
      event.preventDefault();
      event.stopPropagation();
      const position = positions[node.id];
      if (position === undefined) return;
      onMoveNode(node.id, {
        x: Math.round((position.x + delta.x) * 100) / 100,
        y: Math.round((position.y + delta.y) * 100) / 100,
      });
    };

    const tetherSource = tether !== null ? positions[tether.fromId] : undefined;

    return (
      <>
        {addOn && (
          <div className="sig-graph__toolbar">
            <Input
              placeholder="New node label"
              aria-label="New node label"
              value={draftLabel}
              onChange={(event) => setDraftLabel(event.target.value)}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={handleAdd}
              disabled={selectedId === null && rootId !== undefined}
            >
              Add &amp; Link
            </Button>
          </div>
        )}
        <svg
          ref={svgRef}
          role="application"
          aria-label={label ?? "Knowledge graph"}
          className={
            selected !== null
              ? tether !== null
                ? "sig-graph sig-graph--focused sig-graph--tethering"
                : "sig-graph sig-graph--focused"
              : tether !== null
                ? "sig-graph sig-graph--tethering"
                : "sig-graph"
          }
          viewBox={`${view.x} ${view.y} ${VIEW_WIDTH / view.zoom} ${VIEW_HEIGHT / view.zoom}`}
          style={{ height, touchAction: "none" }}
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handleCanvasPointerMove}
          onPointerUp={handleCanvasPointerUp}
          onDoubleClick={handleDoubleClick}
        >
          {/* 3.6.0 — THE EDGES, one render path for BOTH kinds. Each edge
              draws an invisible 14px hit path (the click/keyboard target;
              hairlines are too thin to hit) UNDER the visible hairline.
              data-selected drives the crimson highlight (css/graph.css);
              data-parent/data-child/data-link survive for probes. */}
          {edgeRows.map((edge) => {
            const dim = isDim(edge.id);
            const isSelected = edge.id === selectedEdgeId;
            return (
              <g key={edge.id} className="sig-graph__edge-group">
                <path
                  className="sig-graph__edge-hit"
                  data-edge-id={edge.id}
                  d={edge.d}
                  onClick={() => handleEdgeSelect(edge)}
                />
                <path
                  className="sig-graph__edge"
                  data-parent={edge.fromId}
                  data-child={edge.toId}
                  data-link={edge.kind === "link" || undefined}
                  data-selected={isSelected || undefined}
                  data-dim={dim || undefined}
                  d={edge.d}
                />
              </g>
            );
          })}
          {/* THE LIVE TETHER — the azure dashed line chasing the cursor. */}
          {tether !== null && tetherSource !== undefined && (
            <path
              ref={tetherPathRef}
              className="sig-graph__tether"
              d={`M ${tetherSource.x} ${tetherSource.y} L ${tether.to.x} ${tether.to.y}`}
            />
          )}
          {nodes.map((node) => {
            const position = positions[node.id];
            if (position === undefined) return null;
            const isSelected = node.id === selectedId;
            const dim = isDim(node.id);
            return (
              <g
                key={node.id}
                ref={(el) => {
                  if (el === null) nodeRefs.current.delete(node.id);
                  else nodeRefs.current.set(node.id, el);
                }}
                className="sig-graph__node"
                data-id={node.id}
                data-dim={dim || undefined}
                transform={`translate(${position.x} ${position.y})`}
                onClick={() => handleSelect(node)}
                onPointerDown={(event) => handleNodePointerDown(node, event)}
                onPointerMove={handleNodePointerMove}
                onPointerUp={(event) => handleNodePointerUp(node, event)}
                onContextMenu={(event) => handleNodeContextMenu(node, event)}
                onKeyDown={(event) => handleNodeKeyDown(node, event)}
                tabIndex={0}
                role="button"
                /* WCAG 2.5.3: the accessible name must CONTAIN the
                   VISIBLE text — the canvas renders the truncated
                   label, so the name leads with it and carries the
                   full label after (screen readers get both). */
                aria-label={`${canvasLabel(node.label)} — ${node.label}`}
              >
                {/* Full label tooltip — the truncation escape hatch. */}
                <title>{node.label}</title>
                <circle
                  r={NODE_RADIUS}
                  fill="var(--bg-surface)"
                  stroke={isSelected ? "var(--color-cake-primary)" : strokeFor(node)}
                  strokeWidth={isSelected ? 3 : 2}
                />
                <text
                  textAnchor="middle"
                  y={4}
                  fontSize={13}
                  fill="var(--text-main)"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {canvasLabel(node.label)}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="sig-graph__footer">
          {selectedEdge !== null
            ? `Edge selected — ${selectedEdge.kind === "parent" ? "parent" : "linked"}: ${selectedEdge.fromId} → ${selectedEdge.toId}. Delete/Backspace unlinks.`
            : selected === null
              ? "Select a node to inspect its note."
              : `${selected.label}${selected.note !== undefined ? ` — ${selected.note}` : ""}`}
        </div>
      </>
    );
  }),
);