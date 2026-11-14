/**
 * graph — <KnowledgeGraph>, the interactive node-link graph (2.7.0
 * "Interactive Knowledge Graph, Analytical SVG Charts & Manageable
 * Timeline").
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
 * EDGES are one cubic-Bezier `<path>` per node-with-parent
 * (`cubicBezierEdge`, also exported + pure): both control points sit
 * 60% along the parent→child radial, so the curve sags toward the
 * line between the rings. Stroke is the 40% muted mix, 1.5 wide,
 * fill none.
 *
 * FOCUS DIMMING is class-driven, not style-driven: selecting a node
 * adds `.sig-graph--focused` to the svg and `data-dim="true"` to every
 * node/edge NOT adjacent to the selection; css/graph.css answers with
 * opacity 0.25. The selected circle's stroke flips to the structural
 * Flamingo at width 3 (selection is STRUCTURE, not content — Rule of
 * Engagement).
 *
 * The footer strip and the optional add-and-link toolbar are siblings
 * of the svg inside a fragment (no wrapper div): the footer inspects
 * the selected node's label + note; the toolbar ("Add & Link")
 * parents a new lavender node to the SELECTION (or the root; with no
 * nodes at all it becomes the root — documented contract).
 *
 * @example
 * ```tsx
 * <KnowledgeGraph
 *   nodes={[
 *     { id: "root", label: "Product Launch", categoryToken: "--sig-lavender", note: "One engine, many views." },
 *     { id: "venue", label: "Venue", parentId: "root", categoryToken: "--sig-mauve-soft" },
 *   ]}
 *   addOn
 *   onAddNode={(node) => addNode(node)}
 *   label="Product launch graph"
 * />
 * ```
 */
import type { SigColorToken } from "./surface.js";
/** One node on the knowledge graph. `parentId` undefined = root. */
export interface GraphNode {
    /** Stable unique identifier. */
    id: string;
    /** The node's display label — truncated to 12 characters on the canvas. */
    label: string;
    /** A `--sig-*` content token — the node's ring color (Rule of Engagement). */
    categoryToken: SigColorToken;
    /** Optional longer copy shown in the footer strip when selected. */
    note?: string;
    /** The parent node's id; undefined renders this node as a root. */
    parentId?: string;
}
/** The full node contract — see KnowledgeGraphProps (3.0.0, below) for the
 *  interaction surface; this interface is the DATA shape (unchanged 2.7.0 →
 *  3.0.0: id/label/categoryToken/note/parentId). */
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
/** The pan/zoom view — projected into the viewBox string (graph space stays stable). */
export interface GraphView {
    x: number;
    y: number;
    zoom: number;
}
/** One extra (non-parent) edge — the 3.0.0 links model extension. */
export interface GraphLink {
    from: string;
    to: string;
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
     * 3.0.0 — the drag commit: fires ONCE per drag (pointerup) with the
     * node id and its final graph-space position. Persist it and feed it
     * back through `positions`.
     */
    onMoveNode?: (id: string, position: {
        x: number;
        y: number;
    }) => void;
    /**
     * 3.0.0 — the right-click tether commit: source → target. Non-parent
     * links live in the consumer's persisted state (the links prop).
     */
    onLinkNodes?: (fromId: string, toId: string) => void;
    /**
     * 3.0.0 — user-dragged positions, merged OVER the deterministic
     * layout (the persistence round-trip: onMoveNode writes here).
     */
    positions?: Record<string, {
        x: number;
        y: number;
    }>;
    /** 3.0.0 — the extra (non-parent) links, rendered as bezier edges. */
    links?: GraphLink[];
    /** The svg's rendered height in px. Default 320. */
    height?: number;
    /** The accessible name for the graph application. Default "Knowledge graph". */
    label?: string;
    /** Renders the compact add-and-link toolbar. Default false. */
    addOn?: boolean;
}
export declare const KnowledgeGraph: import("react").NamedExoticComponent<KnowledgeGraphProps>;
