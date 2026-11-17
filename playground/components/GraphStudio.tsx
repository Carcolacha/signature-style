/**
 * GraphStudio — THE GRAPH STUDIO VIEW (3.6.0 "Graph Studio"; 3.9.0
 * "Full-Viewport Tree & Mind-Map Graph Studio"). Props-driven: the
 * workspace STATE (graph/links/positions/layoutMode) lives in App.tsx
 * (the persisted sig.workspace.v3.* keys); this module is the STAGE.
 *
 * 3.9.0 THE FULL-VIEWPORT GEOMETRY (the owner's defect #4 fix, view
 * half): the view BYPASSES .sig-shell — App mounts it full-bleed under
 * the 56px nav (width 100%, height calc(100vh - 56px), position
 * relative, overflow hidden), and the stage paints the 24px dot-matrix
 * board edge to edge. The <KnowledgeGraph> svg fills the stage (its px
 * height measured through a ResizeObserver); the canvas footer strip
 * floats (absolute) instead of taking layout space.
 *
 * THE 3 FLOATING HUD CARDS (.graph-hud — each carries the package's
 * .sig-surface-card elevation, position absolute, z-index var(--z-nav)
 * = the 30 rung, the (bd1)-sanctioned backdrop blur):
 *
 *   1. TOP-LEFT TOOLBAR — the Search Nodes input (dims non-matches to
 *      0.25 via data-dim), the Layout Mode segmented switcher (Free /
 *      Tree / Radial — the 3.9.0 layout engine), Auto-Layout (clears
 *      the persisted custom positions → the active mode's layout
 *      re-runs), Zoom − / live tabular % / Zoom + (the imperative
 *      KnowledgeGraphHandle), the Nodes·Edges counter, the latency sim
 *      slot and the "?" shortcuts ghost button.
 *
 *   2. BOTTOM-CENTER ACTION DOCK — + Add Node (a child of the
 *      selection, or the root), + Spawn Branch (a child of the
 *      selection), AI Expand Node (the LOCAL heuristic generator —
 *      playground/graph-expansion.ts, deterministic seeds, NO
 *      network: expands the selection into 3-4 context-derived
 *      sub-nodes with distinct --sig-* accents), Reset Canvas (back to
 *      the seed graph), Export JSON (the graph+links+positions
 *      snapshot download).
 *
 *   3. RIGHT INSPECTOR (320px, floats over the right edge while a node
 *      or edge is selected; the ✕ button collapses it) — live-edit
 *      Title / Node Kind (the 3.9.0 nodeKind select) / the 16-swatch
 *      --sig-* fill picker (click sets categoryToken — the chromatic
 *      sixteen, fill/series accents per the Rule of Engagement) / Tags
 *      (comma chips) / Notes — every field debounced-committed to the
 *      persisted graph — plus the Connected Edges list (per-edge
 *      Unlink + Jump-to-target).
 *
 * Edge selection/unlink is PRESERVED from 3.6.0: click an edge →
 * crimson → Delete/Backspace unlinks (the consumer resolves parent:*
 * vs explicit links); the counter reports Nodes n · Edges e.
 *
 * 4.0.0 — THE DESTRUCTIVE CONFIRM NORM: every destructive action on
 * this stage routes through <ConfirmDialog> — the inspector's Delete
 * Node button AND the Delete/Backspace key (a node selected, focus
 * outside inputs — the isTypingTarget guard) open the same "Delete
 * Node?" dialog (children promote to roots on confirm), and the dock's
 * Reset Canvas opens "Reset Graph Canvas?". The commits fire only from
 * the dialogs' onConfirm; focus lands on "No" and returns to the
 * trigger on close.
 *
 * 4.1.0 — THE GRAPH MOTION LAYER: the canvas svg is UNCHANGED (the
 * outer translate-only drag wrapper stays rAF-quiet); a playground
 * choreography stratum (<GraphMotionLayer>, components/GraphMotionLayer
 * .tsx + the two engine halves GraphNodeSpring.tsx [motion/react] and
 * GraphEdgeDraw.tsx [animejs]) sits over the stage and animates the
 * transients — node spawn springs (opacity/scale, 440/28, staggered
 * spawnIndex·0.07s), edge draw-ons (strokeDashoffset, 420ms outCubic,
 * spawnIndex·70ms), and the delete/reset exit ghosts (scale 0.72).
 * One engine per file (gate own1); the layer renders NULL at rest.
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  Button,
  ConfirmDialog,
  Icon,
  Input,
  Select,
  SkeletonCard,
  TextArea,
  isTypingTarget,
  useToast,
} from "@carcolacha/signature-style/react";
import type {
  GraphEdge,
  GraphEdgeSelection,
  GraphLayoutMode,
  GraphNode,
  GraphNodeKind,
  GraphView,
  KnowledgeGraphHandle,
} from "@carcolacha/signature-style/react";
import { KnowledgeGraph } from "@carcolacha/signature-style/react";
import { PALETTE } from "../palette.js";
import { expandNodeIdeas } from "../graph-expansion.js";
import { GraphMotionLayer } from "./GraphMotionLayer.js";

/** The inspector's edit patch — the fields the HUD can commit. */
export type NodePatch = Partial<
  Pick<GraphNode, "label" | "categoryToken" | "note" | "tags" | "nodeKind">
>;

/** The 3.9.0 layout modes in display order (the segmented switcher). */
const LAYOUT_MODES: Array<{ id: GraphLayoutMode; label: string }> = [
  { id: "free", label: "Free" },
  { id: "tree", label: "Tree" },
  { id: "radial", label: "Radial" },
];

/** The node kinds the inspector's select offers. */
const NODE_KINDS: Array<{ id: GraphNodeKind; label: string }> = [
  { id: "root", label: "Root" },
  { id: "branch", label: "Branch" },
  { id: "leaf", label: "Leaf" },
  { id: "note", label: "Note" },
];

/** The 16-swatch picker roster — THE CHROMATIC SIXTEEN (the 3.0.0
    fill/series family: the fifteen `role: "fill"` accents + cobalt,
    which the palette roster files under "ink" but the 3.0.0 expansion
    counts as its sixteenth member). The Rule of Engagement reserves
    these for CONTENT ink, and a node ring IS content ink. */
const PICKER_SWATCHES = PALETTE.filter(
  (entry) => entry.role === "fill" || entry.token === "--sig-cobalt",
);

export interface GraphStudioViewProps {
  readonly graph: GraphNode[];
  readonly links: GraphEdge[];
  /** User-dragged positions, merged over the deterministic layout. */
  readonly positions?: Record<string, { x: number; y: number }>;
  /** Shows a SkeletonCard in the inspector while a save is in flight (3.6.0 repo). */
  readonly saving?: boolean;
  /** The ACTIVE layout mode (lifted — persisted in sig.workspace.v3.prefs). */
  readonly layoutMode: GraphLayoutMode;
  /** The layout switcher commit. */
  readonly onLayoutModeChange: (mode: GraphLayoutMode) => void;
  /** Commits one node's inspector patch (debounced upstream by the caller). */
  readonly onUpdateNode: (id: string, patch: NodePatch) => void;
  /** Removes one edge by id (parent:* clears the child's parentId). */
  readonly onUnlinkEdge: (edgeId: string) => void;
  /** Adds ONE plain node (the dock's + Add Node: child of `parentId`, or a root). */
  readonly onAddNode: (parentId?: string) => void;
  /** Adds a spawned branch — a child of the selection (the dock's + Spawn Branch). */
  readonly onSpawnLinkedChild: (parentId: string) => void;
  /** THE AI EXPAND commit — the generated ideas ride one workspace op. */
  readonly onExpandNode: (parentId: string, ideas: Array<{ label: string; token: string }>) => void;
  /**
   * THE NODE DELETE (4.0.0 — the destructive-confirm norm): removes the
   * node + every edge touching it; its direct children promote to
   * roots (parentId cleared — one generation wide, descendants keep
   * their parents). The commit fires ONLY from the ConfirmDialog's
   * onConfirm — never directly.
   */
  readonly onDeleteNode: (id: string) => void;
  /** Clears the persisted custom positions → the active layout re-runs. */
  readonly onAutoArrange: () => void;
  /** Resets the canvas to the seed graph (graph + links + positions). */
  readonly onResetCanvas: () => void;
  /** Downloads the graph+links+positions JSON snapshot. */
  readonly onExportGraph: () => void;
  /** HUD extras (the 3.6.0 latency toggle lives here). */
  readonly hudSlot?: ReactNode;
  /** Opens the keyboard-shortcut modal (the "?" ghost button). */
  readonly onOpenShortcuts?: () => void;
  /** The KnowledgeGraph's props-owned callbacks (move/tether/spawn). */
  readonly onMoveNode: (id: string, position: { x: number; y: number }) => void;
  readonly onLinkNodes: (fromId: string, toId: string) => void;
  readonly onAddNodeAt: (point: { x: number; y: number }, parentId?: string) => void;
}

/** The debounce window for inspector field commits (the persistence
 *  hook coalesces writes behind 300ms too — one keystroke burst = one
 *  disk write at each layer). */
const INSPECTOR_DEBOUNCE_MS = 300;

/** Node label by id — the edge list renders labels, not raw ids. */
function nodeLabel(graph: readonly GraphNode[], id: string): string {
  return graph.find((node) => node.id === id)?.label ?? id;
}

/**
 * One connected edge of the selected node, derived the same way the
 * canvas derives them: `parent:${childId}` for the tree edge, the
 * GraphEdge.id for explicit links.
 */
interface ConnectedEdge {
  id: string;
  kind: "parent" | "link";
  fromId: string;
  toId: string;
}

function connectedEdgesOf(node: GraphNode, links: readonly GraphEdge[]): ConnectedEdge[] {
  const edges: ConnectedEdge[] = [];
  if (node.parentId !== undefined) {
    edges.push({ id: `parent:${node.id}`, kind: "parent", fromId: node.parentId, toId: node.id });
  }
  for (const link of links) {
    if (link.fromId === node.id || link.toId === node.id) {
      edges.push({ id: link.id, kind: "link", fromId: link.fromId, toId: node.id === link.fromId ? link.toId : link.fromId });
    }
  }
  return edges;
}

/** One inspector field with a debounced commit (the draft/dirty dance). */
function useDebouncedNodeDraft(
  node: GraphNode | null,
  onCommit: (id: string, patch: NodePatch) => void,
) {
  const [draft, setDraft] = useState<NodePatch>(() => ({
    label: node?.label ?? "",
    note: node?.note ?? "",
    tags: node?.tags ?? [],
  }));
  const timer = useRef<number | null>(null);
  const commitRef = useRef(onCommit);
  commitRef.current = onCommit;
  const nodeId = node?.id ?? null;

  // Reset the draft whenever the SELECTION changes (not on every
  // upstream re-render — that would fight the typist).
  const lastNodeId = useRef<string | null>(nodeId);
  useEffect(() => {
    if (lastNodeId.current !== nodeId) {
      lastNodeId.current = nodeId;
      setDraft({ label: node?.label ?? "", note: node?.note ?? "", tags: node?.tags ?? [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeId]);

  // Flush + teardown.
  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const schedule = (patch: NodePatch): void => {
    if (nodeId === null) return;
    setDraft((current) => ({ ...current, ...patch }));
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      commitRef.current(nodeId, patch);
    }, INSPECTOR_DEBOUNCE_MS);
  };

  return { draft, schedule };
}

export function GraphStudioView({
  graph,
  links,
  positions,
  saving = false,
  layoutMode,
  onLayoutModeChange,
  onUpdateNode,
  onUnlinkEdge,
  onAddNode,
  onSpawnLinkedChild,
  onExpandNode,
  onDeleteNode,
  onAutoArrange,
  onResetCanvas,
  onExportGraph,
  hudSlot,
  onOpenShortcuts,
  onMoveNode,
  onLinkNodes,
  onAddNodeAt,
}: GraphStudioViewProps) {
  const toast = useToast();
  const graphRef = useRef<KnowledgeGraphHandle | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdgeSelection | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  // 4.1.0 — THE FULL VIEW (was zoom-only): the motion layer mirrors the
  // canvas viewBox, so every pan/zoom report is kept whole.
  const [view, setView] = useState<GraphView>({ x: 0, y: 0, zoom: 1 });
  // THE INSPECTOR COLLAPSE — the ✕ hides it until the next selection.
  const [inspectorOpen, setInspectorOpen] = useState(true);
  // THE 4.0.0 DESTRUCTIVE NORM — the two pending-confirm slots: the
  // node delete (the inspector button OR the Delete/Backspace key on a
  // selected node) and the canvas reset (the dock button). The commits
  // fire ONLY from the dialogs' onConfirm.
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  // THE FULL-VIEWPORT MEASURE — the svg fills the stage; the RO keeps
  // the px height honest through viewport resizes.
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [stageHeight, setStageHeight] = useState(620);
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (el === null || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setStageHeight(Math.max(320, Math.round(entry.contentRect.height)));
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const selectedNode = graph.find((node) => node.id === selectedNodeId) ?? null;
  const { draft, schedule } = useDebouncedNodeDraft(selectedNode, onUpdateNode);

  // THE DELETE/BACKSPACE ROUTE (4.0.0 — the destructive norm): a node
  // selected + focus outside inputs (the isTypingTarget guard, the
  // 3.6.0 edge-unlink precedent) opens the SAME ConfirmDialog as the
  // inspector's Delete Node button — the key never deletes directly.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Delete" && event.key !== "Backspace") return;
      if (isTypingTarget(event.target)) return;
      if (selectedNodeId === null || deleteTargetId !== null || resetConfirmOpen) return;
      event.preventDefault();
      setDeleteTargetId(selectedNodeId);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedNodeId, deleteTargetId, resetConfirmOpen]);

  const deleteTarget = deleteTargetId !== null
    ? graph.find((node) => node.id === deleteTargetId) ?? null
    : null;

  // THE EDGES COUNTER — parent-derived + explicit (the HUD readout).
  const edgeCount = useMemo(
    () =>
      graph.filter((node) => node.parentId !== undefined).length + links.length,
    [graph, links],
  );

  // THE CONNECTED EDGES of the selected node (the inspector list).
  const connected = useMemo(
    () => (selectedNode !== null ? connectedEdgesOf(selectedNode, links) : []),
    [selectedNode, links],
  );

  // THE AI EXPAND INPUT — every label on the canvas (the dedupe set).
  const allLabels = useMemo(() => graph.map((node) => node.label), [graph]);

  const tagsDraftText = Array.isArray(draft.tags) ? draft.tags.join(", ") : "";
  const tagsPreview = tagsDraftText
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag !== "");

  const handleSelectNode = (node: GraphNode): void => {
    setSelectedNodeId(node.id);
    setSelectedEdge(null);
    setInspectorOpen(true);
  };
  const handleSelectEdge = (edge: GraphEdgeSelection): void => {
    setSelectedNodeId(null);
    setSelectedEdge(edge);
    setInspectorOpen(true);
  };
  const handleViewChange = (next: GraphView): void => {
    setView(next);
  };
  const jumpTo = (id: string): void => {
    graphRef.current?.selectNode(id);
  };
  const unlink = (edgeId: string): void => {
    onUnlinkEdge(edgeId);
    setSelectedEdge(null);
    // The toast lives in useWorkspaceState (one feedback voice).
  };
  const expandSelection = (): void => {
    if (selectedNode === null) return;
    onExpandNode(
      selectedNode.id,
      expandNodeIdeas(selectedNode, allLabels).map((idea) => ({
        label: idea.label,
        token: idea.token,
      })),
    );
  };

  const inspectorBody = (() => {
    if (saving) {
      // The WorkspaceRepository's save-in-flight state (3.6.0): the
      // skeleton IS the latency feedback, zero layout promises.
      return <SkeletonCard />;
    }
    if (selectedEdge !== null) {
      return (
        <div className="graph-studio__edge-card" data-testid="studio-edge-card">
          <span className="graph-studio__edge-kind">
            {selectedEdge.kind === "parent" ? "parent edge" : "linked edge"}
          </span>
          <p className="graph-studio__edge-route">
            {nodeLabel(graph, selectedEdge.fromId)} → {nodeLabel(graph, selectedEdge.toId)}
          </p>
          <Button
            variant="danger"
            size="sm"
            leftIcon="Unlink"
            data-testid="studio-unlink-edge"
            onClick={() => unlink(selectedEdge.id)}
          >
            Unlink edge
          </Button>
        </div>
      );
    }
    if (selectedNode === null) {
      return (
        <p className="graph-studio__empty" data-testid="studio-empty">
          Select a node to inspect it.
        </p>
      );
    }
    return (
      <>
        <label className="graph-studio__field">
          <span className="graph-studio__field-label">Title</span>
          <Input
            value={draft.label ?? ""}
            data-testid="studio-title"
            onChange={(event) => schedule({ label: event.target.value })}
          />
        </label>
        <label className="graph-studio__field">
          <span className="graph-studio__field-label">Node Kind</span>
          <Select
            aria-label="Node kind"
            data-testid="studio-node-kind"
            value={draft.nodeKind ?? selectedNode.nodeKind ?? "branch"}
            onChange={(event) => schedule({ nodeKind: event.target.value as GraphNodeKind })}
          >
            {NODE_KINDS.map((kind) => (
              <option key={kind.id} value={kind.id}>
                {kind.label}
              </option>
            ))}
          </Select>
        </label>
        <div className="graph-studio__field">
          <span className="graph-studio__field-label">Color — the chromatic sixteen</span>
          <div className="graph-studio__swatches" role="group" aria-label="Node color" data-testid="studio-swatches">
            {PICKER_SWATCHES.map(({ token, label }) => (
              <button
                key={token}
                type="button"
                className={
                  (draft.categoryToken ?? selectedNode.categoryToken) === token
                    ? "graph-studio__swatch is-picked"
                    : "graph-studio__swatch"
                }
                style={{ "--swatch": `var(${token})` } as CSSProperties}
                title={`${label} — ${token}`}
                aria-label={`Set color ${label} (${token})`}
                aria-pressed={(draft.categoryToken ?? selectedNode.categoryToken) === token}
                data-token={token}
                onClick={() => schedule({ categoryToken: token as GraphNode["categoryToken"] })}
              />
            ))}
          </div>
        </div>
        <div className="graph-studio__field">
          <span className="graph-studio__field-label">Tags</span>
          <Input
            value={tagsDraftText}
            placeholder="comma, separated, tags"
            aria-label="Tags — comma separated"
            data-testid="studio-tags"
            onChange={(event) =>
              schedule({
                tags: event.target.value
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter((tag) => tag !== ""),
              })
            }
          />
          {tagsPreview.length > 0 && (
            <div className="graph-studio__chips" data-testid="studio-tags-preview">
              {tagsPreview.map((tag) => (
                <span key={tag} className="graph-studio__chip">{tag}</span>
              ))}
            </div>
          )}
        </div>
        <label className="graph-studio__field">
          <span className="graph-studio__field-label">Notes</span>
          <TextArea
            rows={3}
            aria-label="Notes"
            data-testid="studio-notes"
            value={draft.note ?? ""}
            placeholder="Longer copy for the inspect strip…"
            onChange={(event) => schedule({ note: event.target.value })}
          />
        </label>
        <div className="graph-studio__connected">
          <span className="graph-studio__field-label">Connected Edges</span>
          {connected.length === 0 ? (
            <p className="graph-studio__empty">No edges — right-click-tether a node to this one.</p>
          ) : (
            connected.map((edge) => {
              const otherId = edge.fromId === selectedNode.id ? edge.toId : edge.fromId;
              return (
                <div key={edge.id} className="graph-studio__edge-row">
                  <button
                    type="button"
                    className="graph-studio__edge-jump"
                    onClick={() => jumpTo(otherId)}
                    title={`Jump to ${nodeLabel(graph, otherId)}`}
                  >
                    {edge.kind === "parent" ? "↑ " : "↔ "}
                    {nodeLabel(graph, otherId)}
                  </button>
                  <button
                    type="button"
                    className="graph-studio__edge-unlink"
                    aria-label={`Unlink edge to ${nodeLabel(graph, otherId)}`}
                    onClick={() => unlink(edge.id)}
                  >
                    <Icon name="Unlink" size={12} aria-hidden />
                    Unlink
                  </button>
                </div>
              );
            })
          )}
        </div>
        <Button
          variant="secondary"
          size="sm"
          leftIcon="Plus"
          data-testid="studio-spawn-child"
          onClick={() => {
            onSpawnLinkedChild(selectedNode.id);
          }}
        >
          Spawn linked child
        </Button>
        {/* 4.0.0 — THE DESTRUCTIVE NORM, inspector leg: the danger
            button only OPENS the ConfirmDialog; the commit rides
            onConfirm. */}
        <Button
          variant="danger"
          size="sm"
          leftIcon="Trash"
          data-testid="studio-delete-node"
          onClick={() => setDeleteTargetId(selectedNode.id)}
        >
          Delete Node
        </Button>
      </>
    );
  })();

  return (
    <main
      className="graph-studio graph-studio--full"
      data-testid="graph-studio"
      data-layout-mode={layoutMode}
    >
      {/* THE FULL-VIEWPORT CANVAS — the dot-matrix board + the svg. */}
      <div className="graph-studio__stage" ref={stageRef} data-testid="studio-canvas">
        <KnowledgeGraph
          ref={graphRef}
          nodes={graph}
          links={links}
          searchQuery={searchQuery}
          positions={positions}
          layoutMode={layoutMode}
          onMoveNode={onMoveNode}
          onLinkNodes={onLinkNodes}
          onAddNodeAt={onAddNodeAt}
          onSelectNode={handleSelectNode}
          onSelectEdge={handleSelectEdge}
          onUnlinkEdge={onUnlinkEdge}
          onViewChange={handleViewChange}
          onAutoArrange={onAutoArrange}
          height={stageHeight}
          label="Graph Studio canvas"
        />
        {/* 4.1.0 THE GRAPH MOTION LAYER — the choreography stratum over
            the static canvas: node spawn springs (motion/react), edge
            draw-ons (animejs), and the delete/reset exit ghosts. Renders
            null at rest — the canvas is untouched when nothing moves. */}
        <GraphMotionLayer
          graph={graph}
          links={links}
          positions={positions ?? {}}
          layoutMode={layoutMode}
          view={view}
        />
      </div>

      {/* HUD 1 — THE TOP-LEFT TOOLBAR. */}
      <div
        className="graph-hud graph-hud--toolbar sig-surface-card"
        role="toolbar"
        aria-label="Graph canvas tools"
        data-testid="studio-toolbar"
      >
        <Input
          value={searchQuery}
          placeholder="Search nodes…"
          aria-label="Search nodes"
          data-testid="studio-search"
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        <div className="graph-studio__seg" role="group" aria-label="Layout mode" data-testid="studio-layout-seg">
          {LAYOUT_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              className="graph-studio__seg-btn"
              aria-pressed={layoutMode === mode.id}
              data-testid={`studio-layout-${mode.id}`}
              onClick={() => onLayoutModeChange(mode.id)}
            >
              {mode.label}
            </button>
          ))}
        </div>
        <Button
          variant="secondary"
          size="sm"
          leftIcon="LocateFixed"
          data-testid="studio-auto-arrange"
          onClick={() => {
            graphRef.current?.autoArrange();
            toast("success", "Auto-layout — the active mode's deterministic layout is restored and persisted.");
          }}
        >
          Auto-Layout
        </Button>
        <div className="graph-studio__zoom" role="group" aria-label="Canvas zoom">
          <button
            type="button"
            className="graph-studio__zoom-btn"
            aria-label="Zoom out"
            data-testid="studio-zoom-out"
            onClick={() => graphRef.current?.zoomOut()}
          >
            −
          </button>
          <span className="graph-studio__zoom-readout" aria-live="polite">
            {Math.round(view.zoom * 100)}%
          </span>
          <button
            type="button"
            className="graph-studio__zoom-btn"
            aria-label="Zoom in"
            data-testid="studio-zoom-in"
            onClick={() => graphRef.current?.zoomIn()}
          >
            +
          </button>
        </div>
        <span className="graph-studio__count" data-testid="studio-count">
          Nodes {graph.length} · Edges {edgeCount}
        </span>
        {hudSlot}
        {onOpenShortcuts !== undefined && (
          <button
            type="button"
            className="graph-studio__help"
            aria-label="Open keyboard shortcuts"
            data-testid="studio-help"
            onClick={onOpenShortcuts}
          >
            ?
          </button>
        )}
      </div>

      {/* HUD 2 — THE BOTTOM-CENTER ACTION DOCK. */}
      <div
        className="graph-hud graph-hud--dock sig-surface-card"
        role="toolbar"
        aria-label="Graph actions"
        data-testid="studio-dock"
      >
        <Button
          variant="secondary"
          size="sm"
          leftIcon="Plus"
          data-testid="studio-add-node"
          onClick={() => onAddNode(selectedNode?.id)}
        >
          + Add Node
        </Button>
        <Button
          variant="secondary"
          size="sm"
          leftIcon="GitBranch"
          data-testid="studio-spawn-branch"
          disabled={selectedNode === null}
          onClick={() => {
            if (selectedNode !== null) onSpawnLinkedChild(selectedNode.id);
          }}
        >
          + Spawn Branch
        </Button>
        <Button
          variant="primary"
          size="sm"
          leftIcon="Sparkles"
          data-testid="studio-ai-expand"
          disabled={selectedNode === null}
          onClick={expandSelection}
        >
          AI Expand Node
        </Button>
        {/* 4.0.0 — THE DESTRUCTIVE NORM, dock leg: Reset Canvas is a
            danger button that opens the ConfirmDialog (never a direct
            reset). */}
        <Button
          variant="danger"
          size="sm"
          leftIcon="RotateCcw"
          data-testid="studio-reset-canvas"
          onClick={() => setResetConfirmOpen(true)}
        >
          Reset Canvas
        </Button>
        <Button
          variant="secondary"
          size="sm"
          leftIcon="Download"
          data-testid="studio-export-json"
          onClick={onExportGraph}
        >
          Export JSON
        </Button>
      </div>

      {/* HUD 3 — THE FLOATING RIGHT INSPECTOR (320px, over the right
          edge while a selection lives; the ✕ collapses it). */}
      {inspectorOpen && (selectedNode !== null || selectedEdge !== null || saving) && (
        <div className="graph-hud graph-hud--inspector sig-surface-card" data-testid="studio-inspector">
          <div className="graph-hud__inspector-head">
            <span className="graph-hud__inspector-title">Node Inspector</span>
            <button
              type="button"
              className="graph-hud__close"
              aria-label="Collapse inspector"
              data-testid="studio-inspector-close"
              onClick={() => setInspectorOpen(false)}
            >
              ✕
            </button>
          </div>
          <div className="graph-hud__inspector-body">{inspectorBody}</div>
        </div>
      )}

      {/* THE 4.0.0 DESTRUCTIVE NORM — the two confirmation dialogs.
          Escape / scrim / "No" all cancel; only the explicit confirm
          commits. Focus lands on "No" on open and returns to the
          trigger (the button or the canvas node) on close. */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Node?"
        description={`This removes "${deleteTarget?.label ?? ""}" and all edges attached to it. Nodes connected through it are kept.`}
        cancelLabel="No"
        confirmLabel="Yes, Delete"
        onCancel={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId !== null) onDeleteNode(deleteTargetId);
          setDeleteTargetId(null);
          setSelectedNodeId(null);
          setSelectedEdge(null);
        }}
      />
      <ConfirmDialog
        open={resetConfirmOpen}
        title="Reset Graph Canvas?"
        description="This will permanently clear your current nodes and connections and restore the default tree."
        cancelLabel="No"
        confirmLabel="Yes, Reset"
        onCancel={() => setResetConfirmOpen(false)}
        onConfirm={() => {
          setResetConfirmOpen(false);
          setSelectedNodeId(null);
          setSelectedEdge(null);
          onResetCanvas();
        }}
      />
    </main>
  );
}
