/**
 * GraphStudio — THE GRAPH STUDIO VIEW (3.6.0 "Graph Studio", the release's
 * centerpiece). Props-driven: the workspace STATE (graph/links/positions)
 * lives in App.tsx's useWorkspaceState (the persisted sig.workspace.v3.*
 * keys); this module is the STAGE — canvas, HUD, inspector.
 *
 * ANATOMY (the `.graph-studio` grid: canvas minmax(0,1fr) + a 340px
 * inspector column, stacking below 960px):
 *
 *   CANVAS PANE — the dot-matrix board (24px radial-gradient matrix on
 *   --bg-inset, min-height 620px) hosting <KnowledgeGraph> with every
 *   interaction (drag rAF, right-click tether, dbl-click spawn, wheel
 *   pan/zoom) PLUS the 3.6.0 edge model: click an edge → crimson
 *   selection → Delete/Backspace unlinks.
 *
 *   FLOATING HUD — glass strip pinned over the canvas top: the Search
 *   Nodes input (dims non-matching nodes to 0.25 via data-dim), Auto-
 *   Arrange (clears persisted custom positions → the deterministic
 *   layout re-runs), Zoom − / live readout / Zoom + (the imperative
 *   KnowledgeGraphHandle), the `Nodes n · Edges e` tabular counter, and
 *   the "?" shortcuts ghost button.
 *
 *   INSPECTOR (340px SurfaceCard) — with a NODE selected: live-edit
 *   Title / Color Token (the 26-token Select) / Tags (comma-separated →
 *   chips) / Notes, each debounced-committed to the persisted graph;
 *   the Connected Edges list (per-edge Unlink + Jump-to-target); and
 *   Spawn Linked Child. With an EDGE selected: the crimson edge card
 *   (endpoints + Unlink). With nothing selected: the muted empty state.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Button,
  Icon,
  Input,
  Select,
  SkeletonCard,
  SurfaceCard,
  TextArea,
  useToast,
} from "@edwyn/signature-style/react";
import type {
  GraphEdge,
  GraphEdgeSelection,
  GraphNode,
  GraphView,
  KnowledgeGraphHandle,
} from "@edwyn/signature-style/react";
import { KnowledgeGraph } from "@edwyn/signature-style/react";
import { PALETTE } from "../palette.js";

/** The inspector's edit patch — the fields the HUD can commit. */
export type NodePatch = Partial<Pick<GraphNode, "label" | "categoryToken" | "note" | "tags">>;

export interface GraphStudioViewProps {
  readonly graph: GraphNode[];
  readonly links: GraphEdge[];
  /** User-dragged positions, merged over the deterministic layout. */
  readonly positions?: Record<string, { x: number; y: number }>;
  /** Shows a SkeletonCard in the inspector while a save is in flight (3.6.0 repo). */
  readonly saving?: boolean;
  /** Commits one node's inspector patch (debounced upstream by the caller). */
  readonly onUpdateNode: (id: string, patch: NodePatch) => void;
  /** Removes one edge by id (parent:* clears the child's parentId). */
  readonly onUnlinkEdge: (edgeId: string) => void;
  /** Adds a child node connected to `parentId`. */
  readonly onSpawnLinkedChild: (parentId: string) => void;
  /** Clears the persisted custom positions → the deterministic layout re-runs. */
  readonly onAutoArrange: () => void;
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
      edges.push({ id: link.id, kind: "link", fromId: link.fromId, toId: link.toId });
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
  onUpdateNode,
  onUnlinkEdge,
  onSpawnLinkedChild,
  onAutoArrange,
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
  const [zoom, setZoom] = useState(1);

  const selectedNode = graph.find((node) => node.id === selectedNodeId) ?? null;
  const { draft, schedule } = useDebouncedNodeDraft(selectedNode, onUpdateNode);

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

  const tagsDraftText = Array.isArray(draft.tags) ? draft.tags.join(", ") : "";
  const tagsPreview = tagsDraftText
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag !== "");

  const handleSelectNode = (node: GraphNode): void => {
    setSelectedNodeId(node.id);
    setSelectedEdge(null);
  };
  const handleSelectEdge = (edge: GraphEdgeSelection): void => {
    setSelectedNodeId(null);
    setSelectedEdge(edge);
  };
  const handleViewChange = (view: GraphView): void => {
    setZoom(view.zoom);
  };
  const jumpTo = (id: string): void => {
    graphRef.current?.selectNode(id);
  };
  const unlink = (edgeId: string): void => {
    onUnlinkEdge(edgeId);
    setSelectedEdge(null);
    // The toast lives in useWorkspaceState (one feedback voice).
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
          <span className="graph-studio__field-label">Color Token</span>
          <Select
            aria-label="Color token"
            data-testid="studio-token"
            value={draft.categoryToken ?? selectedNode.categoryToken}
            onChange={(event) => schedule({ categoryToken: event.target.value as GraphNode["categoryToken"] })}
          >
            {PALETTE.map(({ token, label }) => (
              <option key={token} value={token}>
                {label} — {token}
              </option>
            ))}
          </Select>
        </label>
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
      </>
    );
  })();

  return (
    <main className="graph-studio" data-testid="graph-studio">
      {/* THE CANVAS PANE — the dot-matrix board + the floating HUD. */}
      <div className="graph-studio__canvas" data-testid="studio-canvas">
        <div className="graph-studio__hud" role="toolbar" aria-label="Graph canvas tools">
          <Input
            value={searchQuery}
            placeholder="Search nodes…"
            aria-label="Search nodes"
            data-testid="studio-search"
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <Button
            variant="secondary"
            size="sm"
            leftIcon="LocateFixed"
            data-testid="studio-auto-arrange"
            onClick={() => {
              graphRef.current?.autoArrange();
              toast("success", "Auto-arranged — the deterministic layout is restored and persisted.");
            }}
          >
            Auto-Arrange
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
              {Math.round(zoom * 100)}%
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
        <div data-testid="knowledge-graph">
          <KnowledgeGraph
            ref={graphRef}
            nodes={graph}
            links={links}
            searchQuery={searchQuery}
            positions={positions}
            onMoveNode={onMoveNode}
            onLinkNodes={onLinkNodes}
            onAddNodeAt={onAddNodeAt}
            onSelectNode={handleSelectNode}
            onSelectEdge={handleSelectEdge}
            onUnlinkEdge={onUnlinkEdge}
            onViewChange={handleViewChange}
            onAutoArrange={onAutoArrange}
            addOn
            height={520}
            label="Graph Studio canvas"
          />
        </div>
      </div>
      {/* THE INSPECTOR PANE — a 340px SurfaceCard, stacks below the
          canvas under 960px (the .graph-studio grid). */}
      <div className="graph-studio__inspector" data-testid="studio-inspector">
        <SurfaceCard eyebrow="Inspector" meta="sig.workspace.v3.graph" title="Node Inspector" interactive>
          {inspectorBody}
        </SurfaceCard>
      </div>
    </main>
  );
}
