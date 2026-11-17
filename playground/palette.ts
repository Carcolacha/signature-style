/**
 * palette — THE FULL CHROMATIC PALETTE (3.0.0; extracted from App.tsx in
 * 3.6.0 so the Graph Studio inspector and the bento share ONE table —
 * an import cycle (App → GraphStudio → App) is not worth one constant).
 *
 * All 26 tokens with their human names and the ink/fill ROLE tags
 * (the contrast contract: ink-floor tokens are cleared for high-emphasis
 * content; the chromatic sixteen are DECLARED fill/series accents —
 * bars, rings, borders, tinted wells, never body-text ink). The 3.0.0
 * newcomers carry isNew. The 3.6.0 contrastTier rides tokens.json —
 * this table is the UI roster, not the gate.
 */
import type { TimelineEvent } from "@carcolacha/signature-style/react";

export interface PaletteEntry {
  token: TimelineEvent["category"];
  label: string;
  role: "ink" | "fill";
  isNew?: boolean;
}

export const PALETTE: ReadonlyArray<PaletteEntry> = [
  { token: "--sig-pink-bright", label: "Pink", role: "ink" },
  { token: "--sig-pink-soft", label: "Soft pink", role: "ink" },
  { token: "--sig-pink-alt", label: "Alt pink", role: "ink" },
  { token: "--sig-mauve-bright", label: "Mauve", role: "ink" },
  { token: "--sig-mauve-soft", label: "Soft mauve", role: "ink" },
  { token: "--sig-lavender", label: "Lavender", role: "ink" },
  { token: "--sig-sky", label: "Sky", role: "ink" },
  { token: "--sig-cobalt", label: "Cobalt", role: "ink", isNew: true },
  { token: "--sig-peach", label: "Peach", role: "ink" },
  { token: "--sig-green", label: "Green", role: "ink" },
  { token: "--sig-yellow", label: "Yellow", role: "ink" },
  { token: "--sig-orchid", label: "Orchid", role: "fill", isNew: true },
  { token: "--sig-cyan", label: "Cyan", role: "fill", isNew: true },
  { token: "--sig-magenta", label: "Magenta", role: "fill", isNew: true },
  { token: "--sig-mint", label: "Mint", role: "fill", isNew: true },
  { token: "--sig-spring", label: "Spring", role: "fill", isNew: true },
  { token: "--sig-citron", label: "Citron", role: "fill", isNew: true },
  { token: "--sig-violet-glow", label: "Violet glow", role: "fill", isNew: true },
  { token: "--sig-pink-glow", label: "Pink glow", role: "fill", isNew: true },
  { token: "--sig-rose-glow", label: "Rose glow", role: "fill", isNew: true },
  { token: "--sig-lime-glow", label: "Lime glow", role: "fill", isNew: true },
  { token: "--sig-mint-glow", label: "Mint glow", role: "fill", isNew: true },
  { token: "--sig-crimson", label: "Crimson", role: "fill", isNew: true },
  { token: "--sig-azure", label: "Azure", role: "fill", isNew: true },
  { token: "--sig-tangerine", label: "Tangerine", role: "fill", isNew: true },
  { token: "--sig-neon-green", label: "Neon green", role: "fill", isNew: true },
];
