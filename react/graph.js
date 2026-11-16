import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
 * 3.9.0 THE LAYOUT ENGINE — `layoutMode?: "free" | "tree" | "radial"`
 * (default "free" = the untouched pre-3.9.0 contract). TWO new pure,
 * exported, gate-testable layout helpers join `layoutGraph`:
 *   · `layoutRadial` — the historical ring engine under its mode name
 *     (layoutGraph delegates to it; free layers drag positions over
 *     the same base).
 *   · `layoutTree` — the deterministic top-down tidy layout: hash-
 *     sorted structure, iterative post-order leaf slots, parents
 *     centered over children, one row per depth (root top-center).
 *     Deterministic: same nodes = same coordinates, gate-asserted.
 * `treeEdge` draws the mode's vertical cubic Beziers (control points
 * at the row midpoint — smooth, tangle-free by row separation). In
 * tree/radial modes dragging/nudging is DISABLED (the layout is the
 * law; the persisted positions cannot override it) — pan/zoom, tether,
 * dbl-click spawn and edge unlink all stay live. Nodes stamp
 * data-kind (see GraphNode.nodeKind); the svg stamps
 * data-layout-mode for probes.
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
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, } from "react";
import { Button } from "./primitives.js";
import { Input } from "./forms.js";
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
function idHash(id) {
    let hash = 0;
    for (let i = 0; i < id.length; i += 1) {
        hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
    }
    return hash;
}
/** The ring radius for a depth level: 90 + depth·110 viewBox units. */
function ringRadius(depth) {
    return RING_BASE + depth * RING_STEP;
}
/** Project + clamp one polar point into the viewBox (inside NODE_PAD). */
function project(angle, radius, maxRadius) {
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
export function layoutGraph(nodes) {
    const sorted = [...nodes].sort((a, b) => idHash(a.id) - idHash(b.id) || (a.id < b.id ? -1 : 1));
    const knownIds = new Set(sorted.map((node) => node.id));
    const roots = [];
    const childrenOf = new Map();
    for (const node of sorted) {
        const isRoot = node.parentId === undefined || !knownIds.has(node.parentId);
        if (isRoot) {
            roots.push(node);
            continue;
        }
        const siblings = childrenOf.get(node.parentId);
        if (siblings === undefined)
            childrenOf.set(node.parentId, [node]);
        else
            siblings.push(node);
    }
    // BFS depth assignment (the graph may not be a tree — first visitor wins).
    const depthOf = new Map();
    const queue = [...roots];
    for (const root of roots)
        depthOf.set(root.id, 0);
    let head = 0;
    while (head < queue.length) {
        const current = queue[head];
        if (current === undefined)
            break;
        head += 1;
        const depth = depthOf.get(current.id) ?? 0;
        for (const child of childrenOf.get(current.id) ?? []) {
            if (!depthOf.has(child.id)) {
                depthOf.set(child.id, depth + 1);
                queue.push(child);
            }
        }
    }
    const maxDepth = queue.reduce((max, node) => Math.max(max, depthOf.get(node.id) ?? 0), 0);
    const maxRadius = ringRadius(maxDepth);
    const positions = {};
    assignRoots(roots, positions);
    walkChildren(queue, childrenOf, depthOf, maxRadius, positions);
    return positions;
}
/** Place the roots — one dead center; several evenly on a small center circle. */
function assignRoots(roots, positions) {
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
function walkChildren(queue, childrenOf, depthOf, maxRadius, positions) {
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
function childAngle(parentAngle, index, count, parentDepth) {
    if (parentDepth === 0) {
        return -Math.PI / 2 + (index / count) * Math.PI * 2;
    }
    const span = Math.min(Math.PI, (count - 1) * (Math.PI / 5));
    const step = count > 1 ? span / (count - 1) : 0;
    return parentAngle - span / 2 + index * step;
}
/**
 * The PURE radial layout — nodes in, coordinates out, deterministically.
 * THE RING ENGINE: roots at the viewBox center, every BFS depth level on
 * a ring (90 + depth·110 units), children fanned across an angular span
 * around their parent. 3.9.0: this IS the historical layoutGraph body,
 * named for the mode that runs it (the free mode layers persisted drag
 * positions OVER this base).
 */
export function layoutRadial(nodes) {
    return layoutGraph(nodes);
}
/**
 * The PURE tree layout (3.9.0) — a deterministic top-down tidy layout.
 * THE ALGORITHM: the same hash-sorted, BFS-depthed structure walk as the
 * radial engine; then a classic tidy pass — an iterative post-order DFS
 * assigns every LEAF a sequential horizontal slot (children in sibling
 * hash order), each internal node centers over its children, and every
 * depth level rides its own row (root top-center, deepest row pinned
 * above the bottom pad). Same nodes in, same coordinates out, EVERY
 * time — input order cannot move a node (the id-hash sort), and the
 * gate asserts exact coordinates. Orphans (parentId pointing at a
 * missing id) are treated as roots — defensive and still deterministic.
 */
export function layoutTree(nodes) {
    const sorted = [...nodes].sort((a, b) => idHash(a.id) - idHash(b.id) || (a.id < b.id ? -1 : 1));
    const knownIds = new Set(sorted.map((node) => node.id));
    const childrenOf = new Map();
    const roots = [];
    for (const node of sorted) {
        const isRoot = node.parentId === undefined || !knownIds.has(node.parentId);
        if (isRoot) {
            roots.push(node);
            continue;
        }
        const siblings = childrenOf.get(node.parentId);
        if (siblings === undefined)
            childrenOf.set(node.parentId, [node]);
        else
            siblings.push(node);
    }
    // BFS depth assignment (shared contract with the radial engine).
    const depthOf = new Map();
    const queue = [...roots];
    for (const root of roots)
        depthOf.set(root.id, 0);
    let head = 0;
    while (head < queue.length) {
        const current = queue[head];
        if (current === undefined)
            break;
        head += 1;
        const depth = depthOf.get(current.id) ?? 0;
        for (const child of childrenOf.get(current.id) ?? []) {
            if (!depthOf.has(child.id)) {
                depthOf.set(child.id, depth + 1);
                queue.push(child);
            }
        }
    }
    let maxDepth = 0;
    for (const node of sorted) {
        maxDepth = Math.max(maxDepth, depthOf.get(node.id) ?? 0);
    }
    // THE ROWS: root top-center, deepest row pinned above the bottom pad.
    const rowTop = 72;
    const rowBottom = VIEW_HEIGHT - 72;
    const rowY = (depth) => maxDepth === 0
        ? (rowTop + rowBottom) / 2
        : rowTop + (depth / maxDepth) * (rowBottom - rowTop);
    // THE SLOTS: iterative post-order DFS (robust at any depth). Leaves
    // take sequential slots left→right; parents center over their
    // children; roots with no children take one slot themselves.
    const positions = {};
    let leafSlot = 0;
    let leafCount = 0;
    for (const root of roots) {
        const stack = [
            { node: root, phase: "enter" },
        ];
        while (stack.length > 0) {
            const frame = stack.pop();
            if (frame === undefined)
                break;
            const kids = childrenOf.get(frame.node.id) ?? [];
            if (frame.phase === "enter") {
                stack.push({ node: frame.node, phase: "exit" });
                for (let i = kids.length - 1; i >= 0; i -= 1) {
                    stack.push({ node: kids[i], phase: "enter" });
                }
                continue;
            }
            const depth = depthOf.get(frame.node.id) ?? 0;
            if (kids.length === 0) {
                leafCount += 1;
                const x = NODE_PAD + (leafSlot + 0.5) * slotWidthOf(1);
                positions[frame.node.id] = {
                    x: clampX(x),
                    y: round2(rowY(depth)),
                    depth,
                    angle: 0,
                };
                leafSlot += 1;
                continue;
            }
            let sum = 0;
            for (const kid of kids)
                sum += positions[kid.id]?.x ?? CENTER_X;
            const x = sum / kids.length;
            positions[frame.node.id] = {
                x: clampX(x),
                y: round2(rowY(depth)),
                depth,
                angle: 0,
            };
        }
    }
    // SECOND PASS — the slot width needs the leaf total; leaf positions
    // were provisionally spaced at one-slot width, so re-project them
    // across the FULL span now that leafCount is known.
    if (leafCount > 0) {
        const width = slotWidthOf(leafCount);
        let index = 0;
        for (const root of roots) {
            const stack = [root];
            while (stack.length > 0) {
                const node = stack.pop();
                if (node === undefined || node === null)
                    continue;
                const kids = childrenOf.get(node.id) ?? [];
                if (kids.length === 0) {
                    const depth = depthOf.get(node.id) ?? 0;
                    const position = positions[node.id];
                    if (position !== undefined) {
                        positions[node.id] = {
                            ...position,
                            x: clampX(NODE_PAD + (index + 0.5) * width),
                        };
                    }
                    index += 1;
                    continue;
                }
                for (let i = kids.length - 1; i >= 0; i -= 1) {
                    stack.push(kids[i]);
                }
            }
        }
        // THE CENTERING PASS — parents re-center over their (now final)
        // children, bottom-up (deepest first, the BFS reverse order).
        for (let depth = maxDepth - 1; depth >= 0; depth -= 1) {
            for (const node of sorted) {
                if ((depthOf.get(node.id) ?? -1) !== depth)
                    continue;
                const kids = childrenOf.get(node.id) ?? [];
                if (kids.length === 0)
                    continue;
                let sum = 0;
                for (const kid of kids)
                    sum += positions[kid.id]?.x ?? CENTER_X;
                const position = positions[node.id];
                if (position !== undefined) {
                    positions[node.id] = { ...position, x: clampX(sum / kids.length) };
                }
            }
        }
    }
    return positions;
}
/** One tidy-slot width: the usable span divided by the leaf count. */
function slotWidthOf(leafCount) {
    return (VIEW_WIDTH - 2 * NODE_PAD) / Math.max(leafCount, 1);
}
/** Clamp a tree x into the viewBox (inside NODE_PAD), rounded to 2dp. */
function clampX(x) {
    const clamped = Math.min(VIEW_WIDTH - NODE_PAD, Math.max(NODE_PAD, x));
    return Math.round(clamped * 100) / 100;
}
/** Round to 2 decimal places (the shared coordinate contract). */
function round2(value) {
    return Math.round(value * 100) / 100;
}
/**
 * The PURE tree-edge helper (3.9.0) — one vertical cubic-Bezier path
 * whose control points sit at the row midpoint, so every edge leaves its
 * parent downward and enters its child from above: smooth, and tangle-
 * free by construction (tree rows are strictly depth-separated).
 */
export function treeEdge(parent, child) {
    const midY = round2((parent.y + child.y) / 2);
    return `M ${parent.x} ${parent.y} C ${parent.x} ${midY} ${child.x} ${midY} ${child.x} ${child.y}`;
}
/**
 * The PURE edge helper — one cubic-Bezier path string whose control
 * points sit 60% along the parent→child radial (from both ends), so
 * the curve sags toward the line between the rings.
 */
export function cubicBezierEdge(parent, child) {
    const dx = child.x - parent.x;
    const dy = child.y - parent.y;
    const c1x = parent.x + dx * 0.6;
    const c1y = parent.y + dy * 0.6;
    const c2x = child.x - dx * 0.6;
    const c2y = child.y - dy * 0.6;
    return `M ${parent.x} ${parent.y} C ${c1x} ${c1y} ${c2x} ${c2y} ${child.x} ${child.y}`;
}
/** The node ring's stroke: its chromatic token, or structural Flamingo fallback. */
function strokeFor(node) {
    if (!node.categoryToken.startsWith("--sig-")) {
        return "var(--color-cake-primary)";
    }
    return `var(${node.categoryToken})`;
}
/** The ≤16-char canvas label (15 glyphs + ellipsis when truncating). */
function canvasLabel(label) {
    return label.length > LABEL_MAX ? `${label.slice(0, LABEL_MAX - 1)}…` : label;
}
/**
 * True when a KeyboardEvent's target is a text-entry surface (the v2.9.0
 * contract): inputs, textareas, selects and contentEditable hosts. The
 * global Delete/Backspace unlink (3.6.0) and the playground's "?" key
 * both gate on this — a shortcut must never fire while the user types.
 */
export function isTypingTarget(target) {
    const el = target;
    if (el === null || typeof el.tagName !== "string")
        return false;
    const tag = el.tagName.toLowerCase();
    return (tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable === true);
}
/* The zoom clamp (3.0.0): 0.5×–2.5× around the cursor. */
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2.5;
/* The zoom step the HUD buttons take (center-anchored). */
const ZOOM_BUTTON_STEP = 1.2;
/* The keyboard nudge step — the 8px grid (a11y parity with mouse drag). */
const NUDGE_PX = 8;
/** A client (pointer) point in graph-space coordinates (viewBox-aware). */
function clientToGraph(svg, clientX, clientY, view) {
    const rect = svg.getBoundingClientRect();
    const width = VIEW_WIDTH / view.zoom;
    const height = VIEW_HEIGHT / view.zoom;
    return {
        x: view.x + ((clientX - rect.left) / Math.max(rect.width, 1)) * width,
        y: view.y + ((clientY - rect.top) / Math.max(rect.height, 1)) * height,
    };
}
/**
 * THE GRAPH STUDIO CANVAS (3.6.0) — memo(forwardRef) so the HUD owns a
 * KnowledgeGraphHandle. Everything below the fold is the 3.0.0
 * interaction model with the 3.6.0 edge model grafted in.
 */
export const KnowledgeGraph = memo(forwardRef(function KnowledgeGraph({ nodes, onAddNode, onAddNodeAt, onSelectNode, onSelectEdge, onMoveNode, onLinkNodes, onUnlinkEdge, onAutoArrange, onViewChange, positions: draggedPositions, links = [], searchQuery = "", layoutMode = "free", height = 320, label, addOn = false, }, ref) {
    const [selectedId, setSelectedId] = useState(null);
    const [selectedEdgeId, setSelectedEdgeId] = useState(null);
    const [draftLabel, setDraftLabel] = useState("");
    const [view, setView] = useState({ x: 0, y: 0, zoom: 1 });
    // The live tether — source id + current cursor point (graph space).
    const [tether, setTether] = useState(null);
    // 3.9.0 — THE LAYOUT ENGINE: tree → the pure tidy layout; radial →
    // the ring engine; free → the radial base with persisted drag
    // positions winning (the pre-3.9.0 contract, unchanged).
    const layout = useMemo(() => (layoutMode === "tree" ? layoutTree(nodes) : layoutGraph(nodes)), [nodes, layoutMode]);
    // User-dragged positions WIN over the deterministic layout — in
    // "free" ONLY (the tidy/radial layouts are deterministic by
    // definition; dragging there is disabled, see handleNodePointerDown).
    const positions = useMemo(() => layoutMode === "free"
        ? { ...layout, ...draggedPositions }
        : layout, [layout, draggedPositions, layoutMode]);
    const selected = nodes.find((node) => node.id === selectedId) ?? null;
    const rootId = nodes.find((node) => node.parentId === undefined)?.id;
    const svgRef = useRef(null);
    const tetherPathRef = useRef(null);
    /** Per-node <g> refs — the 60fps drag mutates transforms DIRECTLY. */
    const nodeRefs = useRef(new Map());
    const frameRef = useRef(null);
    const dragRef = useRef(null);
    const panRef = useRef(null);
    const viewRef = useRef(view);
    viewRef.current = view;
    const [interacting, setInteracting] = useState(false);
    /* -- THE EDGE MODEL (3.6.0): derived parent edges + explicit links;
       3.9.0 — the path fn follows the layout mode: tree edges are the
       VERTICAL beziers (smooth, tangle-free by row separation), free
       and radial keep the radial sag beziers. -- */
    const edgeFor = layoutMode === "tree" ? treeEdge : cubicBezierEdge;
    const edgeRows = useMemo(() => {
        const parentEdges = [];
        for (const node of nodes) {
            const parentPos = node.parentId === undefined ? undefined : positions[node.parentId];
            const childPos = positions[node.id];
            if (parentPos === undefined || childPos === undefined)
                continue;
            parentEdges.push({
                id: `parent:${node.id}`,
                kind: "parent",
                fromId: node.parentId,
                toId: node.id,
                d: edgeFor(parentPos, childPos),
            });
        }
        const linkEdges = [];
        for (const link of links) {
            const fromPos = positions[link.fromId];
            const toPos = positions[link.toId];
            if (fromPos === undefined || toPos === undefined)
                continue;
            linkEdges.push({
                id: link.id,
                kind: "link",
                fromId: link.fromId,
                toId: link.toId,
                d: edgeFor(fromPos, toPos),
            });
        }
        return [...parentEdges, ...linkEdges];
    }, [nodes, links, positions, edgeFor]);
    const edgeRowsRef = useRef(edgeRows);
    edgeRowsRef.current = edgeRows;
    const selectedEdge = edgeRows.find((edge) => edge.id === selectedEdgeId) ?? null;
    // THE DIM BOOKKEEPING (3.6.0): the union of focus-dimming (non-
    // adjacent to the selection) and search-dimming (label does not
    // substring-match the query). Edges dim when either endpoint dims.
    const query = searchQuery.trim().toLowerCase();
    const dimmedIds = useMemo(() => {
        const dim = new Set();
        if (selected !== null) {
            const adjacent = new Set([selected.id]);
            if (selected.parentId !== undefined)
                adjacent.add(selected.parentId);
            for (const node of nodes) {
                if (node.parentId === selected.id)
                    adjacent.add(node.id);
            }
            for (const node of nodes) {
                if (!adjacent.has(node.id))
                    dim.add(node.id);
            }
            for (const edge of edgeRows) {
                if (!(adjacent.has(edge.fromId) && adjacent.has(edge.toId)))
                    dim.add(edge.id);
            }
        }
        if (query !== "") {
            const hit = (id) => {
                const node = nodes.find((candidate) => candidate.id === id);
                if (node === undefined)
                    return false;
                return node.label.toLowerCase().includes(query);
            };
            for (const node of nodes) {
                if (!hit(node.id))
                    dim.add(node.id);
            }
            for (const edge of edgeRows) {
                if (!hit(edge.fromId) && !hit(edge.toId))
                    dim.add(edge.id);
            }
        }
        return dim;
    }, [nodes, edgeRows, selected, query]);
    const isDim = (id) => dimmedIds.has(id);
    // The imperative handle — the HUD's zoom/arrange/select API.
    useImperativeHandle(ref, () => ({
        zoomIn: () => zoomAtCenter(ZOOM_BUTTON_STEP),
        zoomOut: () => zoomAtCenter(1 / ZOOM_BUTTON_STEP),
        getZoom: () => viewRef.current.zoom,
        autoArrange: () => onAutoArrange?.(),
        selectNode: (id) => {
            const node = nodes.find((candidate) => candidate.id === id);
            if (node === undefined)
                return;
            setSelectedEdgeId(null);
            handleSelect(node);
        },
    }), 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodes, onAutoArrange]);
    // THE VIEW REPORTER — every pan/zoom lands in the HUD's readout.
    useEffect(() => {
        onViewChange?.(view);
    }, [view, onViewChange]);
    // ESCAPE CANCELS — an in-flight drag (restore the committed transform)
    // or tether (drop the live path) dies here, keyboard first. Escape
    // ALSO deselects a selected edge (3.6.0), typing-target guarded.
    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key !== "Escape")
                return;
            if (isTypingTarget(event.target))
                return;
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
        if (selectedEdgeId === null || onUnlinkEdge === undefined)
            return;
        const onKeyDown = (event) => {
            if (event.key !== "Delete" && event.key !== "Backspace")
                return;
            if (isTypingTarget(event.target))
                return;
            event.preventDefault();
            const edge = edgeRowsRef.current.find((candidate) => candidate.id === selectedEdgeId);
            if (edge === undefined)
                return;
            onUnlinkEdge(edge.id);
            setSelectedEdgeId(null);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [selectedEdgeId, onUnlinkEdge]);
    useEffect(() => {
        return () => {
            if (frameRef.current !== null)
                cancelAnimationFrame(frameRef.current);
        };
    }, []);
    const handleSelect = (node) => {
        setSelectedId(node.id);
        setSelectedEdgeId(null);
        onSelectNode?.(node);
    };
    const handleEdgeSelect = (edge) => {
        setSelectedId(null);
        setSelectedEdgeId(edge.id);
        onSelectEdge?.({ id: edge.id, kind: edge.kind, fromId: edge.fromId, toId: edge.toId });
    };
    const handleAdd = () => {
        const trimmed = draftLabel.trim();
        if (trimmed === "" || onAddNode === undefined)
            return;
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
    const zoomAtCenter = useCallback((factor) => {
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
    /* -- DRAG (60fps): capture → rAF mutate the g transform → commit once.
       3.9.0 — free mode ONLY: tree/radial are deterministic layouts, the
       positions prop cannot override them, so a drag there would snap
       back on the next commit. The canvas tells the truth: nodes keep
       the pointer cursor ONLY in free mode (css/graph.css). -- */
    const handleNodePointerDown = (node, event) => {
        if (event.button !== 0 || onMoveNode === undefined)
            return;
        if (layoutMode !== "free")
            return;
        const position = positions[node.id];
        if (position === undefined)
            return;
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
    const handleNodePointerMove = (event) => {
        const drag = dragRef.current;
        const svg = svgRef.current;
        if (drag === null || svg === null || event.pointerId !== drag.pointerId)
            return;
        if (frameRef.current !== null)
            cancelAnimationFrame(frameRef.current);
        frameRef.current = requestAnimationFrame(() => {
            frameRef.current = null;
            const current = dragRef.current;
            if (current === null)
                return;
            const rect = svg.getBoundingClientRect();
            const scale = VIEW_WIDTH / viewRef.current.zoom / Math.max(rect.width, 1);
            const x = current.startPos.x + (event.clientX - current.startClient.x) * scale;
            const y = current.startPos.y + (event.clientY - current.startClient.y) * scale;
            current.last = { x, y };
            // THE 60fps PATH: mutate the <g> transform DIRECTLY — no setState
            // per move, React never re-renders during the drag.
            const g = nodeRefs.current.get(current.id);
            if (g !== undefined)
                g.setAttribute("transform", `translate(${x} ${y})`);
        });
    };
    const handleNodePointerUp = (node, event) => {
        const drag = dragRef.current;
        if (drag === null || event.pointerId !== drag.pointerId)
            return;
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
    const handleNodeContextMenu = (node, event) => {
        if (onLinkNodes === undefined)
            return;
        event.preventDefault();
        event.stopPropagation();
        const svg = svgRef.current;
        if (svg === null)
            return;
        const point = clientToGraph(svg, event.clientX, event.clientY, viewRef.current);
        setTether({ fromId: node.id, to: point });
        setInteracting(true);
        handleSelect(node);
    };
    const handleTetherMove = (event) => {
        if (tether === null)
            return;
        const svg = svgRef.current;
        if (svg === null)
            return;
        const from = positions[tether.fromId];
        if (from === undefined)
            return;
        const point = clientToGraph(svg, event.clientX, event.clientY, viewRef.current);
        setTether({ fromId: tether.fromId, to: point });
        if (tetherPathRef.current !== null) {
            tetherPathRef.current.setAttribute("d", `M ${from.x} ${from.y} L ${point.x} ${point.y}`);
        }
    };
    const handleTetherUp = (event) => {
        if (tether === null || onLinkNodes === undefined)
            return;
        const svg = svgRef.current;
        if (svg === null)
            return;
        // THE HIT TEST: elementFromPoint → the nearest node under the cursor.
        const target = document.elementFromPoint(event.clientX, event.clientY);
        const nodeG = target?.closest?.("g.sig-graph__node");
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
    /* -- PAN (empty canvas) + ZOOM (wheel) — viewBox math, rAF-throttled.
       3.9.0 FIX: the pan capture must NOT swallow edge clicks. Capturing
       on an edge hit path retargets the follow-up click to the svg (the
       capture target), so the path's onClick never fired — edge
       selection was dead to real pointer clicks since 3.6.0 (the gates
       only ever dispatched synthetic events). Edge hit paths now opt
       OUT of the pan capture; panning still owns empty canvas. -- */
    const handleCanvasPointerDown = (event) => {
        if (event.button !== 0)
            return;
        const target = event.target;
        if (target.closest("g.sig-graph__node") !== null)
            return; // nodes drag, not pan
        if (target.closest("path.sig-graph__edge-hit") !== null)
            return; // edges select, not pan
        const svg = svgRef.current;
        if (svg === null)
            return;
        svg.setPointerCapture(event.pointerId);
        panRef.current = {
            pointerId: event.pointerId,
            startClient: { x: event.clientX, y: event.clientY },
            startView: viewRef.current,
        };
        setInteracting(true);
    };
    const handleCanvasPointerMove = (event) => {
        if (tether !== null) {
            handleTetherMove(event);
            return;
        }
        const pan = panRef.current;
        if (pan === null || event.pointerId !== pan.pointerId)
            return;
        if (frameRef.current !== null)
            cancelAnimationFrame(frameRef.current);
        frameRef.current = requestAnimationFrame(() => {
            frameRef.current = null;
            const active = panRef.current;
            const svg = svgRef.current;
            if (active === null || svg === null)
                return;
            const rect = svg.getBoundingClientRect();
            const scale = VIEW_WIDTH / active.startView.zoom / Math.max(rect.width, 1);
            setView({
                x: active.startView.x - (event.clientX - active.startClient.x) * scale,
                y: active.startView.y - (event.clientY - active.startClient.y) * scale,
                zoom: active.startView.zoom,
            });
        });
    };
    const handleCanvasPointerUp = (event) => {
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
        if (svg === null)
            return;
        const onWheelNative = (event) => {
            event.preventDefault();
            applyWheelZoom(event.clientX, event.clientY, event.deltaY);
        };
        svg.addEventListener("wheel", onWheelNative, { passive: false });
        return () => svg.removeEventListener("wheel", onWheelNative);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    /* -- ZOOM (wheel) — viewBox math, cursor-anchored ---------------------- */
    const applyWheelZoom = (clientX, clientY, deltaY) => {
        const svg = svgRef.current;
        if (svg === null)
            return;
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
    const handleDoubleClick = (event) => {
        if (onAddNodeAt === undefined)
            return;
        const target = event.target;
        if (target.closest("g.sig-graph__node") !== null)
            return;
        const svg = svgRef.current;
        if (svg === null)
            return;
        const point = clientToGraph(svg, event.clientX, event.clientY, viewRef.current);
        // The nearest node within reach parents the newcomer; else the root.
        let nearest = rootId;
        let best = Number.POSITIVE_INFINITY;
        for (const node of nodes) {
            const position = positions[node.id];
            if (position === undefined)
                continue;
            const distance = Math.hypot(position.x - point.x, position.y - point.y);
            if (distance < best) {
                best = distance;
                nearest = node.id;
            }
        }
        onAddNodeAt({ x: Math.round(point.x), y: Math.round(point.y) }, nearest);
    };
    const handleNodeKeyDown = (node, event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleSelect(node);
            return;
        }
        // 3.0.0 KEYBOARD PARITY: arrows nudge the selected node 8px — the
        // same onMoveNode commit the mouse drag uses.
        const deltas = {
            ArrowUp: { x: 0, y: -NUDGE_PX },
            ArrowDown: { x: 0, y: NUDGE_PX },
            ArrowLeft: { x: -NUDGE_PX, y: 0 },
            ArrowRight: { x: NUDGE_PX, y: 0 },
        };
        const delta = deltas[event.key];
        if (delta === undefined || onMoveNode === undefined)
            return;
        if (layoutMode !== "free")
            return; // the tidy/radial layout is the law
        event.preventDefault();
        event.stopPropagation();
        const position = positions[node.id];
        if (position === undefined)
            return;
        onMoveNode(node.id, {
            x: Math.round((position.x + delta.x) * 100) / 100,
            y: Math.round((position.y + delta.y) * 100) / 100,
        });
    };
    const tetherSource = tether !== null ? positions[tether.fromId] : undefined;
    return (_jsxs(_Fragment, { children: [addOn && (_jsxs("div", { className: "sig-graph__toolbar", children: [_jsx(Input, { placeholder: "New node label", "aria-label": "New node label", value: draftLabel, onChange: (event) => setDraftLabel(event.target.value) }), _jsx(Button, { variant: "secondary", size: "sm", onClick: handleAdd, disabled: selectedId === null && rootId !== undefined, children: "Add & Link" })] })), _jsxs("svg", { ref: svgRef, role: "application", "aria-label": label ?? "Knowledge graph", className: selected !== null
                    ? tether !== null
                        ? "sig-graph sig-graph--focused sig-graph--tethering"
                        : "sig-graph sig-graph--focused"
                    : tether !== null
                        ? "sig-graph sig-graph--tethering"
                        : "sig-graph", "data-layout-mode": layoutMode, viewBox: `${view.x} ${view.y} ${VIEW_WIDTH / view.zoom} ${VIEW_HEIGHT / view.zoom}`, style: { height, touchAction: "none" }, onPointerDown: handleCanvasPointerDown, onPointerMove: handleCanvasPointerMove, onPointerUp: handleCanvasPointerUp, onDoubleClick: handleDoubleClick, children: [edgeRows.map((edge) => {
                        const dim = isDim(edge.id);
                        const isSelected = edge.id === selectedEdgeId;
                        return (_jsxs("g", { className: "sig-graph__edge-group", children: [_jsx("path", { className: "sig-graph__edge-hit", "data-edge-id": edge.id, d: edge.d, onClick: () => handleEdgeSelect(edge) }), _jsx("path", { className: "sig-graph__edge", "data-parent": edge.fromId, "data-child": edge.toId, "data-link": edge.kind === "link" || undefined, "data-selected": isSelected || undefined, "data-dim": dim || undefined, d: edge.d })] }, edge.id));
                    }), tether !== null && tetherSource !== undefined && (_jsx("path", { ref: tetherPathRef, className: "sig-graph__tether", d: `M ${tetherSource.x} ${tetherSource.y} L ${tether.to.x} ${tether.to.y}` })), nodes.map((node) => {
                        const position = positions[node.id];
                        if (position === undefined)
                            return null;
                        const isSelected = node.id === selectedId;
                        const dim = isDim(node.id);
                        return (_jsxs("g", { ref: (el) => {
                                if (el === null)
                                    nodeRefs.current.delete(node.id);
                                else
                                    nodeRefs.current.set(node.id, el);
                            }, className: "sig-graph__node", "data-id": node.id, "data-kind": node.nodeKind, "data-dim": dim || undefined, transform: `translate(${position.x} ${position.y})`, onClick: () => handleSelect(node), onPointerDown: (event) => handleNodePointerDown(node, event), onPointerMove: handleNodePointerMove, onPointerUp: (event) => handleNodePointerUp(node, event), onContextMenu: (event) => handleNodeContextMenu(node, event), onKeyDown: (event) => handleNodeKeyDown(node, event), tabIndex: 0, role: "button", "aria-label": `${canvasLabel(node.label)} — ${node.label}`, children: [_jsx("title", { children: node.label }), _jsx("circle", { r: NODE_RADIUS, fill: "var(--bg-surface)", stroke: isSelected ? "var(--color-cake-primary)" : strokeFor(node), strokeWidth: isSelected ? 3 : 2 }), _jsx("text", { textAnchor: "middle", y: 4, fontSize: 13, fill: "var(--text-main)", style: { fontVariantNumeric: "tabular-nums" }, children: canvasLabel(node.label) })] }, node.id));
                    })] }), _jsx("div", { className: "sig-graph__footer", children: selectedEdge !== null
                    ? `Edge selected — ${selectedEdge.kind === "parent" ? "parent" : "linked"}: ${selectedEdge.fromId} → ${selectedEdge.toId}. Delete/Backspace unlinks.`
                    : selected === null
                        ? "Select a node to inspect its note."
                        : `${selected.label}${selected.note !== undefined ? ` — ${selected.note}` : ""}` })] }));
}));
