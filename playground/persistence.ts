/**
 * persistence — the v2.7.0 persistence addendum: ONE zero-dependency
 * hook that makes playground state survive a reload (the Excalidraw /
 * tldraw pattern — localStorage under the canvas, JSON in/out as the
 * portability hatch).
 *
 * 3.0.0 — THE WRITE IS DEBOUNCED (300ms trailing): the obsidian graph
 * fires onMoveNode once per drag and the milestones fire per keystroke
 * batch; the localStorage write coalesces behind a 300ms trailing
 * timer, so a drag run or an import burst costs ONE disk write, not
 * one per state change. THE SYNC READ IS PRESERVED: the lazy
 * initializer still reads localStorage synchronously on first mount —
 * the reload-restore contract is untouched. Flush discipline:
 *   - unmount → flush (the pending write lands);
 *   - beforeunload → flush (a tab close never loses the last change);
 *   - reset() → flush is IRRELEVANT by design — it CANCELS the pending
 *     write and removes the key immediately (a reset never resurrects
 *     the stale value it just killed).
 *
 * THE STORAGE-KEY CONTRACT: every key is versioned with the release
 * that introduced its shape — `sig.workspace.v3.graph`,
 * `sig.workspace.v3.timeline`. When a stored SHAPE breaks in a future
 * release, bump the prefix (sig.workspace.v4.*) and migrate by reading
 * the old key once; never store new shapes under an old prefix.
 *
 * Safety posture (all THREE failure modes handled):
 *   - corrupt JSON   → try/catch on parse, fall back to the seed;
 *   - quota/private  → try/catch on write, in-memory state keeps working;
 *   - missing key    → the fallback IS the first state.
 */

import { useEffect, useRef, useState } from "react";

/** The trailing-debounce window (3.0.0) — one write per 300ms burst. */
const PERSIST_DEBOUNCE_MS = 300;

/**
 * `usePersistentState` — useState that mirrors into localStorage
 * (3.0.0: debounced 300ms trailing, flushed on unmount + beforeunload;
 * `reset()` cancels the pending write and removes the key at once).
 *
 * Lazy init reads + parses the stored JSON inside try/catch (corrupt →
 * fallback) — SYNCHRONOUS, unchanged. The setter accepts a value OR an
 * updater (the useState signature) and SCHEDULES the JSON.stringify
 * write on the trailing timer (quota / private-mode safe — the write
 * failure never breaks the UI state). `reset()` removes the key and
 * restores the fallback.
 */
export function usePersistentState<T>(
  key: string,
  fallback: T,
): [T, (value: T | ((previous: T) => T)) => void, () => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      // Corrupt JSON (or storage unavailable) — the seed wins.
      return fallback;
    }
  });

  // THE DEBOUNCE CELL — the pending write, cancelled or flushed by the
  // three discipline points above.
  const pendingWrite = useRef<{ timer: number; json: string } | null>(null);

  const flush = (): void => {
    const pending = pendingWrite.current;
    if (pending === null) return;
    window.clearTimeout(pending.timer);
    pendingWrite.current = null;
    try {
      window.localStorage.setItem(key, pending.json);
    } catch {
      // Quota exceeded / private mode — memory state keeps working.
    }
  };

  // Unmount + beforeunload flush — the last change always lands.
  useEffect(() => {
    const onBeforeUnload = (): void => flush();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      flush();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = (value: T | ((previous: T) => T)): void => {
    setState((previous) => {
      const next =
        typeof value === "function" ? (value as (p: T) => T)(previous) : value;
      // Cancel any in-flight write, schedule the trailing one.
      if (pendingWrite.current !== null) window.clearTimeout(pendingWrite.current.timer);
      pendingWrite.current = {
        json: JSON.stringify(next),
        timer: window.setTimeout(() => {
          pendingWrite.current = null;
          try {
            window.localStorage.setItem(key, JSON.stringify(next));
          } catch {
            // Quota exceeded / private mode — memory state keeps working.
          }
        }, PERSIST_DEBOUNCE_MS),
      };
      return next;
    });
  };

  const reset = (): void => {
    // A reset NEVER resurrects the value it just killed: cancel the
    // pending write, remove the key immediately, restore the fallback.
    if (pendingWrite.current !== null) {
      window.clearTimeout(pendingWrite.current.timer);
      pendingWrite.current = null;
    }
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Storage unavailable — the in-memory reset below still lands.
    }
    setState(fallback);
  };

  return [state, setValue, reset];
}
