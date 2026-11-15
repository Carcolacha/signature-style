/**
 * ThemeCustomizer — THE THEME & SURFACE CUSTOMIZER PANEL (3.2.0).
 *
 * A SurfaceCard at the top of the Pattern Studio stream (before Set 01),
 * ALSO reachable through the command palette ("Theme: …", "Radius: …",
 * "Download tokens.css", "Copy CSS Variables" — the same state, one owner:
 * the Shell's useSigTheme).
 *
 * Contents:
 *   - 3 theme buttons (aria-pressed IS the active-theme state, the
 *     attribute-driven contract — no .is-active classes);
 *   - 2 radius buttons (same contract);
 *   - the LIVE WCAG contrast badges: all 16 chromatic tokens scored for the
 *     ACTIVE theme by the shared sig-contrast math — green ≥3.1, amber
 *     2.0–3.1, red <2.0 (data-tier carries the verdict);
 *   - "Download tokens.css" (a Blob of the ACTIVE theme's resolved :root
 *     block, generated client-side from the theme map) + "Copy CSS
 *     Variables" (clipboard), each with toast feedback.
 *
 * Styling: playground/styles.css `.studio__customizer*` — token-driven,
 * flat (the e1 treaty: hairlines, never shadows), on the 8px grid.
 */
import { SurfaceCard, Icon, useToast } from "@edwyn/signature-style/react";
import { THEMES, THEME_ORDER, RADIUS_ORDER, RADIUS_PRESETS } from "../theme-utils.js";
import type { SigRadiusName, SigThemeName } from "../theme-utils.js";
import type { ContrastBadge } from "../theme-utils.js";

export interface ThemeCustomizerProps {
  readonly theme: SigThemeName;
  readonly radius: SigRadiusName;
  readonly onThemeChange: (theme: SigThemeName) => void;
  readonly onRadiusChange: (radius: SigRadiusName) => void;
  readonly badges: readonly ContrastBadge[];
  readonly onDownload: () => void;
  readonly onCopy: () => Promise<boolean>;
  /** 3.6.0 — the clipboard write of the <html data-sig-theme data-sig-radius> snippet. */
  readonly onCopySnippet: () => Promise<boolean>;
}

export function ThemeCustomizer({
  theme,
  radius,
  onThemeChange,
  onRadiusChange,
  badges,
  onDownload,
  onCopy,
  onCopySnippet,
}: ThemeCustomizerProps) {
  const toast = useToast();

  const pickTheme = (next: SigThemeName): void => {
    onThemeChange(next);
    toast("success", `Surface theme: ${THEMES[next].label} — ${THEMES[next].description}`);
  };
  const pickRadius = (next: SigRadiusName): void => {
    onRadiusChange(next);
    toast(
      "success",
      `Radius preset: ${RADIUS_PRESETS[next].label} — ${RADIUS_PRESETS[next].radiusUi} UI / ${RADIUS_PRESETS[next].radiusCard} cards.`,
    );
  };
  const download = (): void => {
    onDownload();
    toast("success", "tokens.css downloaded — the active theme's resolved :root block.");
  };
  const copy = (): void => {
    onCopy().then((ok) =>
      toast(
        ok ? "success" : "error",
        ok
          ? "CSS variables copied — the active theme's :root block is on your clipboard."
          : "Clipboard unavailable — use Download tokens.css instead.",
      ),
    );
  };
  const copySnippet = (): void => {
    onCopySnippet().then((ok) =>
      toast(
        ok ? "success" : "error",
        ok
          ? `Theme snippet copied — <html data-sig-theme="${theme}" data-sig-radius="${radius}"> is on your clipboard.`
          : "Clipboard unavailable — the attributes are data-sig-theme / data-sig-radius.",
      ),
    );
  };

  return (
    <SurfaceCard
      title="Theme & Surface Customizer"
      eyebrow="Customizer"
      meta="css/tokens.css · sigThemes"
      className="studio__customizer"
    >
      <div className="studio__customizer-section">
        <span className="studio__customizer-label">Surface theme</span>
        <div className="studio__customizer-row" role="group" aria-label="Surface theme" data-testid="customizer-themes">
          {THEME_ORDER.map((name) => (
            <button
              key={name}
              type="button"
              className="studio__customizer-btn"
              aria-pressed={theme === name}
              data-testid={`customizer-theme-${name}`}
              onClick={() => pickTheme(name)}
            >
              {THEMES[name].label}
            </button>
          ))}
        </div>
        <span className="studio__customizer-note">{THEMES[theme].description}</span>
      </div>
      <div className="studio__customizer-section">
        <span className="studio__customizer-label">Geometry</span>
        <div className="studio__customizer-row" role="group" aria-label="Radius preset" data-testid="customizer-radius">
          {RADIUS_ORDER.map((name) => (
            <button
              key={name}
              type="button"
              className="studio__customizer-btn"
              aria-pressed={radius === name}
              data-testid={`customizer-radius-${name}`}
              onClick={() => pickRadius(name)}
            >
              {RADIUS_PRESETS[name].label}
              <span className="studio__customizer-kbd">
                {RADIUS_PRESETS[name].radiusUi} / {RADIUS_PRESETS[name].radiusCard}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="studio__customizer-section">
        <span className="studio__customizer-label">
          Contrast — 16 chromatic tokens on {THEMES[theme].label} surface {THEMES[theme].surface}
        </span>
        <div className="studio__customizer-badges" data-testid="customizer-badges">
          {badges.map((badge) => (
            <span
              key={badge.token}
              className="studio__contrast-badge"
              data-tier={badge.tier}
              data-testid={`contrast${badge.token}`}
              title={`${badge.token} ${badge.value} — ${badge.ratio.toFixed(2)}:1 on ${THEMES[theme].surface}`}
            >
              <span
                className="studio__contrast-swatch"
                aria-hidden
                style={{ ["--swatch" as string]: `var(${badge.token})` }}
              />
              <span className="studio__contrast-name">{badge.token}</span>
              <span className="studio__contrast-ratio">{badge.ratio.toFixed(2)}</span>
            </span>
          ))}
        </div>
        <span className="studio__customizer-note">
          Green ≥ 3.1:1 · amber 2.0–3.1 · red &lt; 2.0 — the same WCAG math verify:contrast gates with.
        </span>
      </div>
      <div className="studio__customizer-row">
        <button type="button" className="studio__customizer-btn" data-testid="customizer-download" onClick={download}>
          <Icon name="Download" size={14} aria-hidden /> Download tokens.css
        </button>
        <button
          type="button"
          className="studio__customizer-btn"
          data-testid="customizer-copy"
          onClick={copy}
        >
          <Icon name="Copy" size={14} aria-hidden /> Copy CSS Variables
        </button>
        {/* 3.6.0 — THE THEME SNIPPET: the one-line attribute pair a
            consumer pastes onto their own <html> to wear this surface. */}
        <button
          type="button"
          className="studio__customizer-btn"
          data-testid="customizer-copy-snippet"
          onClick={copySnippet}
        >
          <Icon name="Code" size={14} aria-hidden /> Copy Theme Snippet
        </button>
      </div>
    </SurfaceCard>
  );
}
