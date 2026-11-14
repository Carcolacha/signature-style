import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
 * adds `.ptp-graph--focused` to the svg and `data-dim="true"` to every
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
 *     { id: "root", label: "Party Planning", categoryToken: "--party-lavender", note: "One plan, many branches." },
 *     { id: "venue", label: "Venue", parentId: "root", categoryToken: "--party-mauve-soft" },
 *   ]}
 *   addOn
 *   onAddNode={(node) => addNode(node)}
 *   label="Party planning graph"
 * />
 * ```
 */
import { useMemo, useState } from "react";
import { Button } from "./primitives.js";
import { Input } from "./forms.js";
/* The layout constants — all viewBox units, all documented above. */
const VIEW_WIDTH = 640;
const VIEW_HEIGHT = 320;
const CENTER_X = VIEW_WIDTH / 2;
const CENTER_Y = VIEW_HEIGHT / 2;
const NODE_RADIUS = 26;
const NODE_PAD = NODE_RADIUS + 2;
const RING_BASE = 90;
const RING_STEP = 110;
const ROOT_SPREAD_RADIUS = 40;
const LABEL_MAX = 12;
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
/** The node ring's stroke: its party token, or structural Flamingo fallback. */
function strokeFor(node) {
    if (!node.categoryToken.startsWith("--party-")) {
        return "var(--color-cake-primary)";
    }
    return `var(${node.categoryToken})`;
}
/** The ≤12-char canvas label (11 glyphs + ellipsis when truncating). */
function canvasLabel(label) {
    return label.length > LABEL_MAX ? `${label.slice(0, LABEL_MAX - 1)}…` : label;
}
export function KnowledgeGraph({ nodes, onAddNode, onSelectNode, height = 320, label, addOn = false, }) {
    const [selectedId, setSelectedId] = useState(null);
    const [draftLabel, setDraftLabel] = useState("");
    const positions = useMemo(() => layoutGraph(nodes), [nodes]);
    const selected = nodes.find((node) => node.id === selectedId) ?? null;
    const rootId = nodes.find((node) => node.parentId === undefined)?.id;
    // Focus-dimming bookkeeping: everything NOT adjacent to the selection dims.
    const connectedIds = useMemo(() => {
        if (selected === null)
            return null;
        const ids = new Set([selected.id]);
        if (selected.parentId !== undefined)
            ids.add(selected.parentId);
        for (const node of nodes) {
            if (node.parentId === selected.id)
                ids.add(node.id);
        }
        return ids;
    }, [nodes, selected]);
    const handleSelect = (node) => {
        setSelectedId(node.id);
        onSelectNode?.(node);
    };
    const handleAdd = () => {
        const trimmed = draftLabel.trim();
        if (trimmed === "" || onAddNode === undefined)
            return;
        // Parents to the SELECTION; else the root; with no nodes at all the
        // parentId stays undefined and the newcomer BECOMES the root.
        onAddNode({
            label: trimmed,
            categoryToken: "--party-lavender",
            parentId: selectedId ?? rootId,
        });
        setDraftLabel("");
    };
    return (_jsxs(_Fragment, { children: [addOn && (_jsxs("div", { className: "ptp-graph__toolbar", children: [_jsx(Input, { placeholder: "New node label", "aria-label": "New node label", value: draftLabel, onChange: (event) => setDraftLabel(event.target.value) }), _jsx(Button, { variant: "secondary", size: "sm", onClick: handleAdd, disabled: selectedId === null && rootId !== undefined, children: "Add & Link" })] })), _jsxs("svg", { role: "application", "aria-label": label ?? "Knowledge graph", className: selected !== null ? "ptp-graph ptp-graph--focused" : "ptp-graph", viewBox: `0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`, style: { height }, children: [nodes
                        .filter((node) => node.parentId !== undefined && positions[node.parentId] !== undefined)
                        .map((node) => {
                        const parentPos = positions[node.parentId];
                        const childPos = positions[node.id];
                        if (parentPos === undefined || childPos === undefined)
                            return null;
                        const dim = connectedIds !== null &&
                            !(connectedIds.has(node.parentId) && connectedIds.has(node.id));
                        return (_jsx("path", { className: "ptp-graph__edge", "data-parent": node.parentId, "data-child": node.id, "data-dim": dim || undefined, d: cubicBezierEdge(parentPos, childPos) }, `edge-${node.id}`));
                    }), nodes.map((node) => {
                        const position = positions[node.id];
                        if (position === undefined)
                            return null;
                        const isSelected = node.id === selectedId;
                        const dim = connectedIds !== null && !connectedIds.has(node.id);
                        return (_jsxs("g", { className: "ptp-graph__node", "data-id": node.id, "data-dim": dim || undefined, transform: `translate(${position.x} ${position.y})`, onClick: () => handleSelect(node), onKeyDown: (event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    handleSelect(node);
                                }
                            }, tabIndex: 0, role: "button", "aria-label": node.label, children: [_jsx("circle", { r: NODE_RADIUS, fill: "var(--bg-surface)", stroke: isSelected ? "var(--color-cake-primary)" : strokeFor(node), strokeWidth: isSelected ? 3 : 2 }), _jsx("text", { textAnchor: "middle", y: 4, fontSize: 11, fill: "var(--text-main)", style: { fontVariantNumeric: "tabular-nums" }, children: canvasLabel(node.label) })] }, node.id));
                    })] }), _jsx("div", { className: "ptp-graph__footer", children: selected === null
                    ? "Select a node to inspect its note."
                    : `${selected.label}${selected.note !== undefined ? ` — ${selected.note}` : ""}` })] }));
}
