/**
 * theme-utils — THE THEME RUNTIME (3.2.0, the Live Studio Theme Customizer).
 *
 * ONE derivation layer over tokens.json (imported DIRECTLY — vite bundles
 * the JSON, so the customizer can never drift from the manifest the gates
 * check):
 *
 *   - THEMES          the canonical triad resolved to concrete token maps
 *                     (mocha = :root; oled = :root + the true-black trio —
 *                     everything else inherited; daylight = :root + the
 *                     slate structure + the computed ink variants);
 *   - RADIUS_PRESETS  the data-sig-radius axis (standard 8/12 · sharp 0/0;
 *                     absent = the 6px/12px :root defaults);
 *   - contrastBadges  the 16 chromatic tokens scored for the ACTIVE theme
 *                     with the shared WCAG math (playground/sig-contrast.ts
 *                     — the SAME module verify-contrast.mjs gates with, so
 *                     a badge ratio and a gate ratio are the same number);
 *   - buildTokensCss  the client-side generator behind "Download tokens.css"
 *                     / "Copy CSS Variables": the ACTIVE theme's resolved
 *                     :root block, generated from this map (never fetched,
 *                     never hand-written).
 *
 * THE CSS FILE REMAINS THE SOURCE OF TRUTH for what ships: the blocks here
 * mirror tokens.css, and verify:contrast's (ct7) cross-check + the cortex
 * probe (computed styles vs these badges) keep the two honest.
 */
import { contrastRatio, badgeTier } from "./sig-contrast.js";
import manifest from "../tokens.json";

/** The canonical surface themes (tokens.json sigThemes). */
export type SigThemeName = "mocha" | "oled" | "daylight";
/** The geometry presets (tokens.json geometryPresets). */
export type SigRadiusName = "standard" | "sharp";

/** The 16 chromatic tokens (cobalt + the 15 fills) — the badge contract. */
export const CHROMATIC_16: readonly string[] = [
  "--sig-cobalt",
  "--sig-orchid",
  "--sig-cyan",
  "--sig-magenta",
  "--sig-mint",
  "--sig-spring",
  "--sig-citron",
  "--sig-violet-glow",
  "--sig-pink-glow",
  "--sig-rose-glow",
  "--sig-lime-glow",
  "--sig-mint-glow",
  "--sig-crimson",
  "--sig-azure",
  "--sig-tangerine",
  "--sig-neon-green",
];

interface InkVariantEntry {
  value?: string;
  ratio?: number;
  mocha?: string;
  inherits?: boolean;
}
interface ManifestShape {
  themes: {
    mocha: { tokens: Record<string, { value: string }> };
    latte: { tokens: Record<string, { value: string }> };
  };
  shared: { tokens: Record<string, { value: string }> };
  sigPalette: { tokens: Record<string, { value: string }> };
  sigThemes: {
    oled?: { tokens?: Record<string, string> };
    daylight?: {
      tokens?: Record<string, string>;
      inkVariants?: Record<string, InkVariantEntry>;
    };
  };
  geometryPresets?: Record<string, { radiusUi?: string; radiusCard?: string }>;
}
const doc = manifest as unknown as ManifestShape;

/** Persisted workspace keys (the v3 contract: versioned prefixes).
 *  3.6.0 — THEME + RADIUS MERGE INTO ONE PREFS OBJECT under
 *  sig.workspace.v3.prefs ({ theme, radius } — one key, one writer);
 *  the two v3.2.0 per-axis keys remain as the ONE-TIME migration read
 *  (useSigTheme adopts them on first load, then writes the merged
 *  object only). */
export const PREFS_STORAGE_KEY = "sig.workspace.v3.prefs";
export const THEME_STORAGE_KEY = "sig.workspace.v3.theme"; // legacy — migration read only
export const RADIUS_STORAGE_KEY = "sig.workspace.v3.radius"; // legacy — migration read only

/** 3.9.0 — the Graph Studio layout engine modes (the prefs field). */
export type SigGraphLayout = "free" | "tree" | "radial";

/** The merged prefs shape (3.6.0; 3.9.0 grows the optional graphLayout). */
export interface SigPrefs {
  readonly theme: SigThemeName;
  readonly radius: SigRadiusName;
  /**
   * 3.9.0 — the Graph Studio's active layout mode. OPTIONAL: older
   * stored prefs (and the absent-default first paint) mean "free", the
   * pre-3.9.0 behavior. One key, one writer (useSigTheme) still holds.
   */
  readonly graphLayout?: SigGraphLayout;
}

/** The resolved token map per theme: :root → theme overrides. */
function resolveTheme(overrides: Record<string, string>): Record<string, string> {
  const tokens: Record<string, string> = {};
  for (const [name, entry] of Object.entries(doc.themes.mocha.tokens)) {
    tokens[name] = entry.value;
  }
  for (const [name, entry] of Object.entries(doc.shared.tokens)) {
    tokens[name] = entry.value;
  }
  for (const [name, entry] of Object.entries(doc.sigPalette.tokens)) {
    tokens[name] = entry.value;
  }
  for (const [name, value] of Object.entries(overrides)) {
    tokens[name] = value;
  }
  return tokens;
}

export interface SigTheme {
  readonly name: SigThemeName;
  readonly label: string;
  readonly description: string;
  /** The surface the chromatic badges score against. */
  readonly surface: string;
  /** The full resolved token map (:root + overrides). */
  readonly tokens: Readonly<Record<string, string>>;
}

export const THEMES: Readonly<Record<SigThemeName, SigTheme>> = {
  mocha: {
    name: "mocha",
    label: "Mocha",
    description: "The default :root — official Catppuccin Mocha.",
    surface: doc.themes.mocha.tokens["--bg-surface"].value,
    tokens: resolveTheme({}),
  },
  oled: {
    name: "oled",
    label: "OLED",
    description: "True black — the --bg-canvas slot; every other token inherits.",
    surface: doc.sigThemes.oled?.tokens?.["--bg-surface"] ?? "#0B0C10",
    tokens: resolveTheme(doc.sigThemes.oled?.tokens ?? {}),
  },
  daylight: {
    name: "daylight",
    label: "Daylight",
    description: "High-contrast light — slate structure + computed ink variants.",
    surface: doc.sigThemes.daylight?.tokens?.["--bg-surface"] ?? "#FFFFFF",
    tokens: resolveTheme({
      ...(doc.sigThemes.daylight?.tokens ?? {}),
      ...Object.fromEntries(
        Object.entries(doc.sigThemes.daylight?.inkVariants ?? {})
          .filter(([, entry]) => entry.inherits !== true && typeof entry.value === "string")
          .map(([name, entry]) => [name, entry.value as string]),
      ),
    }),
  },
};

export const THEME_ORDER: readonly SigThemeName[] = ["mocha", "oled", "daylight"];

/** The radius presets — mirrors tokens.json geometryPresets. */
export const RADIUS_PRESETS: Readonly<Record<SigRadiusName, { label: string; radiusUi: string; radiusCard: string }>> = {
  standard: {
    label: "Standard",
    radiusUi: doc.geometryPresets?.standard?.radiusUi ?? "8px",
    radiusCard: doc.geometryPresets?.standard?.radiusCard ?? "12px",
  },
  sharp: {
    label: "Sharp",
    radiusUi: doc.geometryPresets?.sharp?.radiusUi ?? "0px",
    radiusCard: doc.geometryPresets?.sharp?.radiusCard ?? "0px",
  },
};
export const RADIUS_ORDER: readonly SigRadiusName[] = ["standard", "sharp"];

/** One chromatic token's live contrast read for the active theme. */
export interface ContrastBadge {
  readonly token: string;
  /** The resolved hex for the theme. */
  readonly value: string;
  /** WCAG ratio vs the theme surface (the same math the gate uses). */
  readonly ratio: number;
  readonly tier: "pass" | "amber" | "fail";
}

/** The 16 chromatic badges for the ACTIVE theme (green ≥3.1 · amber ≥2.0 · red <2.0). */
export function contrastBadges(themeName: SigThemeName): ContrastBadge[] {
  const theme = THEMES[themeName];
  return CHROMATIC_16.map((token) => {
    const value = theme.tokens[token] ?? "#000000";
    const ratio = contrastRatio(value, theme.surface);
    return { token, value, ratio, tier: badgeTier(ratio) };
  });
}

/**
 * The ACTIVE theme's resolved `:root` block — the Download/Copy artifact.
 * Generated client-side from the theme map (never fetched): a consumer can
 * paste it as their own :root and get the exact surface.
 */
export function buildTokensCss(themeName: SigThemeName): string {
  const theme = THEMES[themeName];
  const order: ReadonlyArray<string> = [
    ...Object.keys(doc.themes.mocha.tokens),
    ...Object.keys(doc.shared.tokens),
    ...Object.keys(doc.sigPalette.tokens),
  ];
  const lines = order.map((name) => `  ${name}: ${theme.tokens[name] ?? "#000000"};`);
  return [
    `/* Signature Style — resolved :root block · theme "${theme.name}" (${theme.label})`,
    `   Generated client-side by the Live Studio Theme Customizer (v3.2.0).`,
    `   Surface ${theme.surface} · paste as your :root to wear this surface. */`,
    ":root {",
    ...lines,
    "}",
    "",
  ].join("\n");
}
