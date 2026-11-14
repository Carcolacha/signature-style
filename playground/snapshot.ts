/**
 * snapshot — the workspace snapshot helpers (2.9.0 "Power-User
 * Utilities").
 *
 * The v2.7.0 snapshot story, extracted so BOTH export paths share ONE
 * payload builder:
 *
 *   1. the Milestone Manager toolbar's "Export JSON" button (App.tsx —
 *      the DOM anchor dance lives THERE, in App.tsx, since the (ps1)
 *      contract pins it in the composition layer), and
 *   2. the command palette's "Export Workspace JSON" (this module
 *      reads the PERSISTED MIRROR — usePersistentState writes through
 *      to localStorage on every change, so the mirror is current —
 *      and hands the payload back to the same App-side download).
 *
 * The payload shape is the v2.7.0 contract, unchanged: `{ version:
 * "sig.workspace.v3", graph, timeline }` — the storage-key contract's shape
 * prefix and the download filename ride with it.
 */
import type { GraphNode, TimelineItem } from "@edwyn/signature-style/react";

/** The payload's shape prefix — matches the sig.workspace.v3.* storage keys. */
export const WORKSPACE_SNAPSHOT_VERSION = "sig.workspace.v3";

/** The canonical download filename (the v2.7.0 contract). */
export const WORKSPACE_SNAPSHOT_FILENAME = "signature-workspace.json";

export interface WorkspaceSnapshot {
  version: string;
  graph: GraphNode[];
  timeline: TimelineItem[];
}

/**
 * Build the pretty-printed snapshot JSON from in-memory state (the
 * toolbar path). One source of truth for the payload shape.
 */
export function buildWorkspaceSnapshot(
  graph: GraphNode[],
  timeline: TimelineItem[],
): string {
  const payload: WorkspaceSnapshot = {
    version: WORKSPACE_SNAPSHOT_VERSION,
    graph,
    timeline,
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Read the PERSISTED workspace mirror out of localStorage (the command
 * path — the palette lives outside the Graphs & Planner module, so it
 * reads the mirror that usePersistentState keeps current). Corrupt or
 * missing keys fall back to empty arrays; an export of an empty
 * workspace is an honest export.
 */
export function readStoredWorkspace(): { graph: GraphNode[]; timeline: TimelineItem[] } {
  const readArray = (key: string): unknown[] => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return [];
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };
  return {
    graph: readArray("sig.workspace.v3.graph") as GraphNode[],
    timeline: readArray("sig.workspace.v3.timeline") as TimelineItem[],
  };
}

/**
 * The command-path payload: the persisted mirror, built through the
 * SAME builder as the toolbar path (one payload shape, always).
 */
export function buildStoredWorkspaceSnapshot(): string {
  const { graph, timeline } = readStoredWorkspace();
  return buildWorkspaceSnapshot(graph, timeline);
}
