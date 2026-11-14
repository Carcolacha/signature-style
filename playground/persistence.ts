/**
 * persistence — the v2.7.0 persistence addendum: ONE zero-dependency
 * hook that makes playground state survive a reload (the Excalidraw /
 * tldraw pattern — localStorage under the canvas, JSON in/out as the
 * portability hatch).
 *
 * THE STORAGE-KEY CONTRACT: every key is versioned with the release
 * that introduced its shape — `sig.v27.graph`, `sig.v27.timeline`.
 * When a stored SHAPE breaks in a future release, bump the prefix
 * (sig.v28.*) and migrate by reading the old key once; never store
 * new shapes under an old prefix.
 *
 * Safety posture (all THREE failure modes handled):
 *   - corrupt JSON   → try/catch on parse, fall back to the seed;
 *   - quota/private  → try/catch on write, in-memory state keeps working;
 *   - missing key    → the fallback IS the first state.
 *
 * `reset()` removes the key and restores the fallback — the "Restore
 * seed" escape hatch behind the toolbar's danger button.
 */

import { useState } from "react";

/**
 * `usePersistentState` — useState that mirrors into localStorage.
 *
 * Lazy init reads + parses the stored JSON inside try/catch (corrupt →
 * fallback). The setter accepts a value OR an updater (the useState
 * signature) and writes JSON.stringify inside try/catch (quota /
 * private-mode safe — the write failure never breaks the UI state).
 * `reset()` removes the key and restores the fallback.
 *
 * Note: the localStorage write happens inside the state updater, which
 * React StrictMode double-invokes in dev — the write is idempotent
 * (same JSON out), so the double-invoke is harmless, and keeping the
 * write here (instead of an effect) is what lets `reset()` leave the
 * key ABSENT instead of instantly rewriting the fallback.
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

  const setValue = (value: T | ((previous: T) => T)): void => {
    setState((previous) => {
      const next =
        typeof value === "function" ? (value as (p: T) => T)(previous) : value;
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Quota exceeded / private mode — memory state keeps working.
      }
      return next;
    });
  };

  const reset = (): void => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Storage unavailable — the in-memory reset below still lands.
    }
    setState(fallback);
  };

  return [state, setValue, reset];
}
