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
import type { SigColorToken } from "./surface.js";
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
/**
 * The PURE layout helper — nodes in, coordinates out, deterministically.
 * Sorts by id hash first (input ORDER can never move a node), BFS-depths
 * from the roots, rings per level, angular fans per parent. Orphans
 * (parentId pointing at a missing id) are treated as roots — defensive
 * and still deterministic.
 */
export declare function layoutGraph(nodes: readonly GraphNode[]): Record<string, GraphPosition>;
/**
 * The PURE edge helper — one cubic-Bezier path string whose control
 * points sit 60% along the parent→child radial (from both ends), so
 * the curve sags toward the line between the rings.
 */
export declare function cubicBezierEdge(parent: {
    x: number;
    y: number;
}, child: {
    x: number;
    y: number;
}): string;
/**
 * True when a KeyboardEvent's target is a text-entry surface (the v2.9.0
 * contract): inputs, textareas, selects and contentEditable hosts. The
 * global Delete/Backspace unlink (3.6.0) and the playground's "?" key
 * both gate on this — a shortcut must never fire while the user types.
 */
export declare function isTypingTarget(target: EventTarget | null): boolean;
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
    onAddNodeAt?: (point: {
        x: number;
        y: number;
    }, parentId?: string) => void;
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
    onMoveNode?: (id: string, position: {
        x: number;
        y: number;
    }) => void;
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
    positions?: Record<string, {
        x: number;
        y: number;
    }>;
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
/**
 * THE GRAPH STUDIO CANVAS (3.6.0) — memo(forwardRef) so the HUD owns a
 * KnowledgeGraphHandle. Everything below the fold is the 3.0.0
 * interaction model with the 3.6.0 edge model grafted in.
 */
export declare const KnowledgeGraph: import("react").MemoExoticComponent<import("react").ForwardRefExoticComponent<KnowledgeGraphProps & import("react").RefAttributes<KnowledgeGraphHandle>>>;
