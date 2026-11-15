/**
 * WorkspaceRepository — THE ASYNC PERSISTENCE ADAPTER (3.6.0).
 *
 * A clean seam between the playground's UI state and WHERE the workspace
 * actually lives. Today the backing store is localStorage (the same
 * sig.workspace.v3.* keys usePersistentState mirrors); the POINT of the
 * adapter is the CONTRACT: async writes with configurable latency,
 * skeleton-while-in-flight rendering, and error toasts — the FULL async
 * path rehearsed ahead of the real backend.
 *
 * >>> Swap this adapter for the FastAPI HTTP adapter when the backend
 * >>> ships (see docs/SCHEMA_V3.md). The interface below is the seam:
 * >>> getGraph / saveGraph etc. per aggregate + `latency`; an HTTP
 * >>> implementation replaces the localStorage body, every consumer
 * >>> stays untouched.
 *
 * LATENCY SIMULATION (the rehearsal): `createLocalStorageRepository({
 * latencyMs })` — 0ms is instant (production today), 600ms is the
 * studio HUD's "Simulate 600ms latency" toggle. During a save's
 * in-flight window the consumers render SkeletonCard/SkeletonTableRow
 * in the AFFECTED card (the inspector while the graph saves, the
 * Milestone Manager while the timeline saves); on completion the
 * content returns. THE ERROR PATH is validation, not a toggle:
 * saveGraph rejects when any node lacks a non-empty id/label (the wire
 * contract shared/schema.ts enforces the same shape) — clear a node's
 * Title in the inspector and watch the save reject into an error toast.
 *
 * WRITE DISCIPLINE: the repo write is the ASYNC leg only — the
 * reactive mirror (usePersistentState's debounced localStorage write)
 * stays the source of UI truth, so a reload never depends on a timer.
 * The adapter's own writes land on the SAME keys (idempotent with the
 * mirror), which is exactly what makes the FastAPI swap honest: when
 * the HTTP adapter arrives, the mirror's flush is replaced by the
 * server round-trip and nothing else moves.
 */
import type { GraphEdge, GraphNode, TimelineItem } from "@edwyn/signature-style/react";
import type { SigPrefs } from "./theme-utils.js";

/** The versioned storage keys — the sig.workspace.v3 contract. */
const KEYS = {
  graph: "sig.workspace.v3.graph",
  timeline: "sig.workspace.v3.timeline",
  prefs: "sig.workspace.v3.prefs",
  links: "sig.workspace.v3.links",
} as const;

/** The aggregate shapes the repository carries. */
export interface WorkspaceGraph extends Array<GraphNode> {}
export type WorkspaceTimeline = Array<TimelineItem>;

export interface WorkspaceRepository {
  /** The persisted graph — SYNC (localStorage reads are synchronous). */
  getGraph(): GraphNode[];
  /** The persisted milestones — SYNC. */
  getTimeline(): TimelineItem[];
  /** The persisted theme/radius prefs, or null when never picked — SYNC. */
  getPrefs(): SigPrefs | null;
  /** The persisted explicit links — SYNC (3.6.0 GraphEdge model). */
  getLinks(): GraphEdge[];
  /** Async graph save — the latency window + validation live here. */
  saveGraph(nodes: GraphNode[]): Promise<void>;
  /** Async timeline save. */
  saveTimeline(items: TimelineItem[]): Promise<void>;
  /** Async prefs save. */
  savePrefs(prefs: SigPrefs): Promise<void>;
  /** Async links save (GraphEdge[]). */
  saveLinks(links: GraphEdge[]): Promise<void>;
  /** The configured simulated latency in ms (0 = instant). */
  readonly latency: number;
}

/** One node must carry a non-empty id + label (the wire contract). */
function isValidGraph(nodes: GraphNode[]): boolean {
  return (
    Array.isArray(nodes) &&
    nodes.every(
      (node) =>
        typeof node.id === "string" &&
        node.id !== "" &&
        typeof node.label === "string" &&
        node.label !== "",
    )
  );
}

export interface RepositoryOptions {
  /** The simulated write latency in ms. Default 0 (instant). */
  latencyMs?: number;
}

/**
 * The localStorage-backed WorkspaceRepository — the 3.6.0 rehearsal
 * adapter. Swap for the FastAPI HTTP adapter when the backend ships.
 */
export function createLocalStorageRepository(
  options: RepositoryOptions = {},
): WorkspaceRepository {
  const latency = options.latencyMs ?? 0;

  function readJson<T>(key: string): T | null {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? null : (JSON.parse(raw) as T);
    } catch {
      return null;
    }
  }

  /** The async write leg: latency window → validate → persist. */
  function writeJson(key: string, value: unknown, validate?: () => boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      const commit = (): void => {
        if (validate !== undefined && !validate()) {
          reject(new Error(`Invalid ${key} payload — the save was rejected`));
          return;
        }
        try {
          window.localStorage.setItem(key, JSON.stringify(value));
          resolve();
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      };
      if (latency <= 0) {
        commit();
        return;
      }
      window.setTimeout(commit, latency);
    });
  }

  return {
    latency,
    getGraph(): GraphNode[] {
      return readJson<GraphNode[]>(KEYS.graph) ?? [];
    },
    getTimeline(): TimelineItem[] {
      return readJson<TimelineItem[]>(KEYS.timeline) ?? [];
    },
    getPrefs(): SigPrefs | null {
      return readJson<SigPrefs>(KEYS.prefs);
    },
    getLinks(): GraphEdge[] {
      return readJson<GraphEdge[]>(KEYS.links) ?? [];
    },
    saveGraph(nodes: GraphNode[]): Promise<void> {
      return writeJson(KEYS.graph, nodes, () => isValidGraph(nodes));
    },
    saveTimeline(items: TimelineItem[]): Promise<void> {
      return writeJson(KEYS.timeline, items, () => Array.isArray(items));
    },
    savePrefs(prefs: SigPrefs): Promise<void> {
      return writeJson(KEYS.prefs, prefs, () => prefs !== null && typeof prefs === "object");
    },
    saveLinks(links: GraphEdge[]): Promise<void> {
      return writeJson("sig.workspace.v3.links", links, () => Array.isArray(links));
    },
  };
}
