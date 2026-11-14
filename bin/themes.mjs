/**
 * bin/themes.mjs — the CLI's EMBEDDED THEME MAP (3.3.0).
 * ----------------------------------------------------------------------------
 * SOURCE OF TRUTH + DRIFT PROTOCOL:
 *   Every value below was ported byte-identical from css/tokens.css :root
 *   (the v3.2.0 harmonized truth) and FROZEN here so the CLI can scaffold
 *   without reading the package. The gate needle lives in
 *   scripts/verify-cli.mjs (cli2): it re-parses css/tokens.css :root and
 *   cross-checks EVERY mocha token below — if tokens.css mocha values ever
 *   change, the gate FAILS and this map must be regenerated:
 *
 *     1. update css/tokens.css (the canonical source, never this file first)
 *     2. mirror the changed values into THEMES.mocha.tokens below
 *     3. `npm run verify:cli` → (cli2) PASS proves the re-sync
 *
 *   oled / daylight carry ONLY their override tokens — everything else
 *   inherits the mocha map exactly as the [data-sig-theme] blocks do in
 *   css/tokens.css (inheritance is the correctness argument there; the same
 *   merge runs here at scaffold time via resolveThemeTokens()).
 *
 * GEOMETRY: the presets mirror the [data-sig-radius] blocks. The scaffolded
 * signature-tokens.css resolves the "standard" preset INTO :root (8px UI /
 * 12px cards, 8px-grid-pure) — a scaffold starts on the grid, not on the
 * legacy 6px. The mocha map itself carries the css :root truth (6px/12px)
 * so the drift needle stays a raw byte-parity check.
 *
 * ZERO DEPENDENCIES: node: built-ins only. No imports at all — data module.
 */

/** The shared, theme-independent tokens (tokens.css :root "shared" block). */
const SHARED_TOKENS = Object.freeze({
  "--color-on-cake": "#1E1E2E",
  "--font-sans": `"Inter", system-ui, sans-serif`,
  "--radius-ui": "6px", // :root legacy default — GEOMETRY_PRESETS.standard retunes to 8px at scaffold time
  "--radius-card": "12px",
  "--transition-standard": "all 0.15s ease-out",
  "--transition-transform": "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
  "--space-tight": "0.5rem",
  "--space-standard": "1rem",
  "--space-section": "1.5rem",
});

/** The z-index scale (Pillar 3) — identical in every theme. */
const Z_TOKENS = Object.freeze({
  "--z-sticky": "10",
  "--z-nav": "30",
  "--z-overlay": "40",
  "--z-modal": "50",
  "--z-toast": "60",
});

/** The chromatic palette — 26 tokens, theme-independent in :root (mocha values). */
const CHROMATIC_MOCHA = Object.freeze({
  "--sig-pink-bright": "#ea76cb",
  "--sig-pink-soft": "#f5bde6",
  "--sig-pink-alt": "#f4b8e4",
  "--sig-mauve-bright": "#9e5ff2",
  "--sig-mauve-soft": "#cba6f7",
  "--sig-lavender": "#7287fd",
  "--sig-sky": "#04a5e5",
  "--sig-cobalt": "#89b4fa",
  "--sig-peach": "#fe640b",
  "--sig-green": "#a6d189",
  "--sig-yellow": "#F9E2AF",
  "--sig-orchid": "#F5C2E7",
  "--sig-cyan": "#64DFDF",
  "--sig-magenta": "#CF64DF",
  "--sig-mint": "#64DF99",
  "--sig-spring": "#6EDF64",
  "--sig-citron": "#DBDF64",
  "--sig-violet-glow": "#C29EFF",
  "--sig-pink-glow": "#F29EFF",
  "--sig-rose-glow": "#FF9EDB",
  "--sig-lime-glow": "#DBFF9E",
  "--sig-mint-glow": "#9EFFC2",
  "--sig-crimson": "#F22222",
  "--sig-azure": "#228AF2",
  "--sig-tangerine": "#F25622",
  "--sig-neon-green": "#56F222",
});

/** The geometry presets (3.2.0) — the scaffold bakes "standard" into :root. */
export const GEOMETRY_PRESETS = Object.freeze({
  standard: Object.freeze({ "--radius-ui": "8px", "--radius-card": "12px" }),
  sharp: Object.freeze({ "--radius-ui": "0px", "--radius-card": "0px" }),
});

/**
 * The canonical surface triad. mocha.tokens mirrors css/tokens.css :root
 * EXACTLY (the cli2 drift needle compares it declaration-for-declaration);
 * oled / daylight list only their overrides, in tokens.css block order.
 */
export const THEMES = Object.freeze({
  mocha: Object.freeze({
    label: "Mocha (dark default — Catppuccin Mocha structure + Mocha accents)",
    tokens: Object.freeze({
      // core 7 (incl. the --bg-canvas alias, 3.2.0)
      "--bg-base": "#1E1E2E",
      "--bg-surface": "#313244",
      "--bg-canvas": "var(--bg-base)",
      "--color-cake-primary": "#F2CDCD",
      "--color-cake-secondary": "#94E2D5",
      "--text-main": "#CDD6F4",
      "--text-muted": "#7F849C",
      // keeper tokens: legacy colors, semantic jobs
      "--bg-inset": "#282A36",
      "--text-bright": "#F8F8F2",
      "--color-success": "#A8E6CF",
      "--text-muted-soft": "#6272A4",
      ...SHARED_TOKENS,
      ...Z_TOKENS,
      ...CHROMATIC_MOCHA,
    }),
    overrides: Object.freeze({}),
  }),
  oled: Object.freeze({
    label: "OLED true-black (#000000 base / #0B0C10 surface — everything else inherits)",
    tokens: Object.freeze({ ...SHARED_TOKENS, ...Z_TOKENS }),
    overrides: Object.freeze({
      "--bg-base": "#000000",
      "--bg-surface": "#0B0C10",
      "--bg-inset": "#12141C",
    }),
  }),
  daylight: Object.freeze({
    label: "Daylight high-contrast light (slate structure, computed --sig-* ink variants)",
    tokens: Object.freeze({ ...SHARED_TOKENS, ...Z_TOKENS }),
    overrides: Object.freeze({
      // structure
      "--bg-base": "#F8FAFC",
      "--bg-surface": "#FFFFFF",
      "--bg-inset": "#F1F5F9",
      "--text-main": "#0F172A",
      "--text-bright": "#020617",
      "--text-muted": "#475569",
      "--text-muted-soft": "#64748B",
      // ink-floor re-inks (measured ≥3.1:1 vs #FFFFFF — ratios in tokens.css)
      "--sig-pink-bright": "#A21CAF",
      "--sig-pink-soft": "#9D174D",
      "--sig-pink-alt": "#86198F",
      "--sig-mauve-soft": "#7C3AED",
      "--sig-sky": "#0369A1",
      "--sig-peach": "#C2410C",
      "--sig-green": "#166534",
      "--sig-yellow": "#A16207",
      // the 16 chromatic ink variants that need them (magenta, crimson,
      // azure, tangerine, mauve-bright, lavender inherit — already ≥3.1 on white)
      "--sig-cobalt": "#2563EB",
      "--sig-orchid": "#DB2777",
      "--sig-cyan": "#0E7490",
      "--sig-mint": "#059669",
      "--sig-spring": "#16A34A",
      "--sig-citron": "#4D7C0F",
      "--sig-violet-glow": "#6D28D9",
      "--sig-pink-glow": "#C026D3",
      "--sig-rose-glow": "#BE185D",
      "--sig-lime-glow": "#3F6212",
      "--sig-mint-glow": "#047857",
      "--sig-neon-green": "#15803D",
    }),
  }),
});

export const THEME_NAMES = Object.freeze(Object.keys(THEMES));

/**
 * Merge a theme into its resolved flat token map: mocha base structure,
 * the theme's overrides on top, then the "standard" geometry preset baked
 * in (the scaffold starts 8px-grid-pure).
 *
 * @param {string} themeName - one of THEME_NAMES
 * @returns {Record<string, string>} the resolved :root declaration map
 */
export function resolveThemeTokens(themeName) {
  const theme = THEMES[themeName];
  if (!theme) {
    throw new Error(`unknown theme "${themeName}" — expected one of ${THEME_NAMES.join(", ")}`);
  }
  return Object.freeze({
    ...THEMES.mocha.tokens,
    ...theme.overrides,
    ...GEOMETRY_PRESETS.standard,
  });
}
