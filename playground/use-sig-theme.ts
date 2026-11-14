/**
 * useSigTheme — THE LIVE THEME HOOK (3.2.0, the Live Studio Theme Customizer).
 *
 * ONE owner of the surface-theme + geometry state for the whole playground:
 * the Shell calls this hook, the customizer panel and the command palette
 * receive its state/callbacks — there is never a second instance fighting
 * over documentElement.
 *
 * Persistence: usePersistentState under the versioned v3 keys
 *   sig.workspace.v3.theme   (default "mocha")
 *   sig.workspace.v3.radius  (default "standard")
 *
 * THE ABSENT-DEFAULT CONTRACT (documented): until the user PICKS (or a
 * previous pick is stored), the hook leaves BOTH attributes ABSENT on
 * <html> — absent means mocha + the :root 6px/12px defaults, so the
 * untouched playground renders byte-identically to v3.1.0. A stored pick
 * re-applies on load; picking "mocha"/"standard" explicitly sets the
 * attribute (data-sig-theme="mocha" renders identically to absent — no
 * mocha block exists — and data-sig-radius="standard" is the intentional
 * 8px/12px retune).
 *
 * DOM writes: one effect mirrors state → documentElement.dataset
 * (sig-theme / sig-radius). The DOM operations (download blob, clipboard)
 * also live here so the panel and the palette commands share ONE dance.
 */
import { useCallback, useEffect, useMemo, useRef } from "react";
import { usePersistentState } from "./persistence.js";
import {
  buildTokensCss,
  contrastBadges,
  RADIUS_STORAGE_KEY,
  THEME_STORAGE_KEY,
} from "./theme-utils.js";
import type { SigRadiusName, SigThemeName } from "./theme-utils.js";

/** True when the key has a stored pick (quota/private mode → absent). */
function hasStored(key: string): boolean {
  try {
    return window.localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
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
}

export function useSigTheme(): UseSigTheme {
  const [theme, setThemeState] = usePersistentState<SigThemeName>(THEME_STORAGE_KEY, "mocha");
  const [radius, setRadiusState] = usePersistentState<SigRadiusName>(RADIUS_STORAGE_KEY, "standard");
  // Per-key pick flags: a persisted pick re-applies on load; the defaults
  // leave the attributes ABSENT (the byte-stable legacy look) until a pick.
  const appliedTheme = useRef<boolean>(hasStored(THEME_STORAGE_KEY));
  const appliedRadius = useRef<boolean>(hasStored(RADIUS_STORAGE_KEY));

  // THE MIRROR — state → documentElement (one writer for the whole app).
  useEffect(() => {
    if (appliedTheme.current) document.documentElement.dataset.sigTheme = theme;
  }, [theme]);
  useEffect(() => {
    if (appliedRadius.current) document.documentElement.dataset.sigRadius = radius;
  }, [radius]);

  const setTheme = useCallback(
    (next: SigThemeName): void => {
      appliedTheme.current = true;
      // IMMEDIATE mirror (not effect-only): picking a value that equals the
      // current state (mocha default → "mocha") bails out of the state
      // update, so the effect would never re-fire — the pick must still
      // land in the DOM.
      document.documentElement.dataset.sigTheme = next;
      setThemeState(next);
    },
    [setThemeState],
  );
  const setRadius = useCallback(
    (next: SigRadiusName): void => {
      appliedRadius.current = true;
      document.documentElement.dataset.sigRadius = next;
      setRadiusState(next);
    },
    [setRadiusState],
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

  return { theme, radius, setTheme, setRadius, badges, downloadTokensCss, copyTokensCss };
}
