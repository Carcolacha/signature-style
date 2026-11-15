/**
 * useSigTheme — THE LIVE THEME HOOK (3.2.0; 3.6.0 the merged prefs).
 *
 * ONE owner of the surface-theme + geometry state for the whole playground:
 * the Shell calls this hook, the customizer panel and the command palette
 * receive its state/callbacks — there is never a second instance fighting
 * over documentElement.
 *
 * Persistence (3.6.0): ONE merged object under the versioned key
 *   sig.workspace.v3.prefs   ({ theme, radius })
 * replacing the two v3.2.0 per-axis keys (sig.workspace.v3.theme /
 * .radius). THE ONE-TIME MIGRATION: when the prefs key has never been
 * written but a legacy axis key has, the stored legacy values are
 * adopted as the initial prefs (the user's pick survives the upgrade);
 * from then on ONLY the merged key is written. The absent-default
 * contract stands: until the user PICKS (now or in a pre-3.6.0
 * session), BOTH attributes stay ABSENT on <html> — absent means mocha
 * + the :root 6px/12px defaults, so the untouched playground renders
 * byte-identically to v3.1.0. A stored pick re-applies on load.
 *
 * DOM writes: one effect mirrors state → documentElement.dataset
 * (sig-theme / sig-radius). The DOM operations (download blob, clipboard
 * — including the 3.6.0 Copy Theme Snippet) live here so the panel and
 * the palette commands share ONE dance.
 */
import { useCallback, useEffect, useMemo, useRef } from "react";
import { usePersistentState } from "./persistence.js";
import {
  buildTokensCss,
  contrastBadges,
  PREFS_STORAGE_KEY,
  RADIUS_STORAGE_KEY,
  THEME_STORAGE_KEY,
} from "./theme-utils.js";
import type { SigPrefs, SigRadiusName, SigThemeName } from "./theme-utils.js";

/** True when the key has a stored value (quota/private mode → absent). */
function readStored<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as T);
  } catch {
    return null;
  }
}

/** The one-time legacy adoption: per-axis picks → the merged prefs seed. */
function legacyPrefsSeed(fallback: SigPrefs): { seed: SigPrefs; picked: boolean } {
  const stored = readStored<Partial<SigPrefs>>(PREFS_STORAGE_KEY);
  if (stored !== null) {
    return {
      seed: {
        theme: stored.theme ?? fallback.theme,
        radius: stored.radius ?? fallback.radius,
      },
      picked: true,
    };
  }
  const legacyTheme = readStored<SigThemeName>(THEME_STORAGE_KEY);
  const legacyRadius = readStored<SigRadiusName>(RADIUS_STORAGE_KEY);
  if (legacyTheme === null && legacyRadius === null) {
    return { seed: fallback, picked: false };
  }
  return {
    seed: {
      theme: legacyTheme ?? fallback.theme,
      radius: legacyRadius ?? fallback.radius,
    },
    picked: true,
  };
}

export interface UseSigTheme {
  readonly theme: SigThemeName;
  readonly radius: SigRadiusName;
  setTheme(theme: SigThemeName): void;
  setRadius(radius: SigRadiusName): void;
  /** The 16 chromatic contrast badges for the ACTIVE theme. */
  readonly badges: ReturnType<typeof contrastBadges>;
  /** The Blob download of the ACTIVE theme's resolved :root block. */
  downloadTokensCss(): void;
  /** The clipboard write of the ACTIVE theme's resolved :root block. */
  copyTokensCss(): Promise<boolean>;
  /**
   * 3.6.0 — the clipboard write of the CURRENT theme + radius as the
   * `<html data-sig-theme data-sig-radius>` snippet a consumer pastes
   * onto their own document root.
   */
  copyThemeSnippet(): Promise<boolean>;
}

export function useSigTheme(): UseSigTheme {
  // THE MERGED PREFS (3.6.0) — one object, one key, one writer.
  const [prefs, setPrefs] = usePersistentState<SigPrefs>(PREFS_STORAGE_KEY, {
    theme: "mocha",
    radius: "standard",
  });
  // The pick flag: a persisted prefs object (or an adopted legacy axis
  // pick) re-applies on load; otherwise the attributes stay ABSENT.
  const initial = useRef(legacyPrefsSeed({ theme: "mocha", radius: "standard" }));
  const theme = prefs.theme;
  const radius = prefs.radius;
  const applied = useRef<boolean>(initial.current.picked);
  // ADOPT the legacy seed into the merged key on first mount (one
  // write; afterwards only the merged key exists).
  useEffect(() => {
    if (initial.current.picked) setPrefs(initial.current.seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // THE MIRROR — state → documentElement (one writer for the whole app).
  useEffect(() => {
    if (applied.current) document.documentElement.dataset.sigTheme = theme;
  }, [theme]);
  useEffect(() => {
    if (applied.current) document.documentElement.dataset.sigRadius = radius;
  }, [radius]);

  const setTheme = useCallback(
    (next: SigThemeName): void => {
      applied.current = true;
      // IMMEDIATE mirror (not effect-only): picking a value that equals the
      // current state (mocha default → "mocha") bails out of the state
      // update, so the effect would never re-fire — the pick must still
      // land in the DOM.
      document.documentElement.dataset.sigTheme = next;
      setPrefs((current) => ({ ...current, theme: next }));
    },
    [setPrefs],
  );
  const setRadius = useCallback(
    (next: SigRadiusName): void => {
      applied.current = true;
      document.documentElement.dataset.sigRadius = next;
      setPrefs((current) => ({ ...current, radius: next }));
    },
    [setPrefs],
  );

  const badges = useMemo(() => contrastBadges(theme), [theme]);

  const downloadTokensCss = useCallback((): void => {
    // The documented export dance: object URL → anchor click → revoke.
    const blob = new Blob([buildTokensCss(theme)], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "tokens.css";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }, [theme]);

  const copyTokensCss = useCallback((): Promise<boolean> => {
    const css = buildTokensCss(theme);
    if (navigator.clipboard === undefined) {
      return Promise.resolve(false);
    }
    return navigator.clipboard
      .writeText(css)
      .then(() => true)
      .catch(() => false);
  }, [theme]);

  const copyThemeSnippet = useCallback((): Promise<boolean> => {
    // THE 3.6.0 SNIPPET: the canonical attribute pair a consumer pastes
    // onto their <html> — the current surface theme + geometry preset.
    const snippet = `<html data-sig-theme="${theme}" data-sig-radius="${radius}">`;
    if (navigator.clipboard === undefined) {
      return Promise.resolve(false);
    }
    return navigator.clipboard
      .writeText(snippet)
      .then(() => true)
      .catch(() => false);
  }, [theme, radius]);

  return {
    theme,
    radius,
    setTheme,
    setRadius,
    badges,
    downloadTokensCss,
    copyTokensCss,
    copyThemeSnippet,
  };
}
