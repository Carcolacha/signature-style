/**
 * TemplatesStudio — THE TEMPLATES STUDIO view (3.8.0 "Full-Page
 * Layout Templates, Interactive Viewport Previewer & CLI Template
 * Expansion"; 4.0.0 stages the two human-crafted blueprints — the
 * FLIP tabs read 01 · Analytics Hub | 02 · Micro-Lab).
 *
 * The full-page blueprints' proving ground: a sticky glass control
 * bar (the viewport emulator, the scoped theme switcher, the
 * Preview ↔ Code toggle, Copy Full Page) over ONE stage that renders
 * the active template live.
 *
 * THE CONTROL BAR (z-sticky, below the navbar's --z-nav):
 *   · Viewport Width Emulator — segmented Desktop (100%) | Tablet
 *     (768px) | Mobile (375px). The stage's width IS the control:
 *     `transition: width var(--dur-glide) var(--ease-glide)`. A width
 *     transition causes layout work — that is the POINT of a preview
 *     resize (the templates reflow via their own container queries,
 *     which answer the stage, not the window). Reduced motion is
 *     covered twice: the --dur-glide token collapses to 1ms under
 *     prefers-reduced-motion / [data-sig-motion="reduced"] (the
 *     tokens.css mercy), and styles.css adds an explicit
 *     transition:none guard.
 *   · Live Theme Switcher — segmented Mocha | OLED | Daylight. THE
 *     THEME-SCOPE MECHANISM (read from css/tokens.css, not assumed):
 *     the theme blocks are PLAIN ATTRIBUTE selectors —
 *     `[data-sig-theme="oled"]` / `[data-sig-theme="daylight"]`, no
 *     html- scoping — so a DIV wrapper carrying the attribute re-themes
 *     exactly its subtree. The switch therefore sets data-sig-theme on
 *     the STAGE WRAPPER ONLY: a scoped preview; the rest of the app
 *     keeps the user's theme (mocha = attribute absent, the :root
 *     inheritance).
 *   · Preview | Full TSX Code — Preview mounts the live Component;
 *     Code renders the registry's source string as
 *     <pre><code>{source}</code></pre>.
 *   · Copy Full Page — writes the registry source to the clipboard.
 *     THE MINT ACCENT: the package Toast paints success/error strips
 *     only (its palette is frozen css), so the mint confirmation lives
 *     in the studio's own aria-live chip, painted with --sig-mint (the
 *     mid mint — the owner note: mint-glow is a light token, use the
 *     mint token), while the standard success toast still fires.
 *
 * The templates' live state (billing, chapter, filter, deployments) is
 * INTERNAL to each template component — Preview is fully interactive;
 * switching templates remounts via key={activeId} (clean state).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Button, Tabs, useToast } from "@carcolacha/signature-style/react";
import { PAGE_TEMPLATES } from "../template-registry.js";
import type { TemplateId } from "../template-sources.js";

/** The three stage widths — Desktop fills the shell, the other two
 *  pin the classic preview widths and center on the stage. */
const STAGE_WIDTHS: Record<TemplateViewport, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

type TemplateViewport = "desktop" | "tablet" | "mobile";
type TemplateTheme = "mocha" | "oled" | "daylight";
type TemplateViewMode = "preview" | "code";

/** How long the mint "Copied" chip stays before flipping back. */
const COPIED_RESET_MS = 2000;

const THEME_TABS: Array<{ id: TemplateTheme; label: string }> = [
  { id: "mocha", label: "Mocha" },
  { id: "oled", label: "OLED" },
  { id: "daylight", label: "Daylight" },
];

const VIEWPORT_TABS: Array<{ id: TemplateViewport; label: string }> = [
  { id: "desktop", label: "Desktop · 100%" },
  { id: "tablet", label: "Tablet · 768px" },
  { id: "mobile", label: "Mobile · 375px" },
];

const MODE_TABS: Array<{ id: TemplateViewMode; label: string }> = [
  { id: "preview", label: "Preview" },
  { id: "code", label: "Full TSX Code" },
];

/** The numbered studio Tabs — 01 · 02 · 03, the FLIP indicator rides. */
const TEMPLATE_TABS = PAGE_TEMPLATES.map((template, index) => ({
  id: template.id,
  label: `0${index + 1} · ${template.name}`,
}));

export interface TemplatesStudioProps {
  /** The active template id (LIFTED to the Shell — the breadcrumbs
   *  and the palette's per-template jumps share it). */
  activeId: TemplateId;
  /** The change handler (the studio is controlled). */
  onActiveChange: (id: TemplateId) => void;
}

export function TemplatesStudioView({ activeId, onActiveChange }: TemplatesStudioProps): ReactNode {
  const toast = useToast();
  const [viewport, setViewport] = useState<TemplateViewport>("desktop");
  const [theme, setTheme] = useState<TemplateTheme>("mocha");
  const [mode, setMode] = useState<TemplateViewMode>("preview");
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<number | null>(null);

  const active = PAGE_TEMPLATES.find((template) => template.id === activeId) ?? PAGE_TEMPLATES[0];

  // The copied chip's reset timer never outlives the studio.
  useEffect(() => {
    return () => {
      if (copiedTimer.current !== null) window.clearTimeout(copiedTimer.current);
    };
  }, []);

  const handleCopy = useCallback(() => {
    if (copiedTimer.current !== null) window.clearTimeout(copiedTimer.current);
    navigator.clipboard
      .writeText(active?.source ?? "")
      .then(() => {
        setCopied(true);
        toast("success", `Copied the ${active?.name} full-page source`);
        copiedTimer.current = window.setTimeout(() => setCopied(false), COPIED_RESET_MS);
      })
      .catch(() => {
        toast("error", "Clipboard unavailable — use the Full TSX Code tab to select the source");
      });
  }, [active, toast]);

  return (
    <div className="tpl-studio" data-testid="tpl-studio">
      {/* THE STICKY GLASS CONTROL BAR */}
      <div className="tpl-studio__bar" role="group" aria-label="Templates Studio controls" data-testid="tpl-studio-bar">
        <div className="tpl-studio__seg" role="group" aria-label="Viewport width emulator">
          <span className="tpl-studio__seg-label">Viewport</span>
          {VIEWPORT_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className="tpl-studio__seg-btn"
              aria-pressed={viewport === tab.id}
              data-testid={`tpl-viewport-${tab.id}`}
              onClick={() => setViewport(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="tpl-studio__seg" role="group" aria-label="Stage theme (scoped preview)">
          <span className="tpl-studio__seg-label">Theme</span>
          {THEME_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className="tpl-studio__seg-btn"
              aria-pressed={theme === tab.id}
              data-testid={`tpl-theme-${tab.id}`}
              onClick={() => setTheme(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="tpl-studio__seg" role="group" aria-label="Stage view mode">
          <span className="tpl-studio__seg-label">View</span>
          {MODE_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className="tpl-studio__seg-btn"
              aria-pressed={mode === tab.id}
              data-testid={`tpl-mode-${tab.id}`}
              onClick={() => setMode(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <Button
          size="sm"
          variant="secondary"
          leftIcon={copied ? "Check" : "Copy"}
          data-testid="tpl-copy-full"
          onClick={handleCopy}
          aria-label={`Copy Full Page — the ${active?.name} template source`}
        >
          Copy Full Page
        </Button>
        <span
          className="tpl-studio__copied"
          role="status"
          aria-live="polite"
          data-testid="tpl-copied-chip"
          data-visible={copied ? "true" : "false"}
        >
          {copied ? "Copied — the full-page source is on your clipboard" : ""}
        </span>
      </div>

      {/* THE TEMPLATE SWITCHER — the package Tabs (FLIP indicator). */}
      <div data-testid="tpl-tabs">
        <Tabs
          label="Full-page templates"
          tabs={TEMPLATE_TABS}
          activeId={active?.id ?? "telemetry"}
          onChange={(id) => onActiveChange(id as TemplateId)}
        />
      </div>

      <p className="tpl-studio__note">{active?.description}</p>

      {/* THE STAGE — the theme wrapper carries data-sig-theme (the
          tokens.css theme blocks are plain attribute selectors, so the
          swap is scoped to this subtree), the stage owns the emulator
          width (container queries inside the templates answer it). */}
      <div
        className="tpl-studio__stage-wrap"
        data-sig-theme={theme === "mocha" ? undefined : theme}
        data-testid="tpl-stage-wrap"
      >
        <div className="tpl-studio__stage" style={{ width: STAGE_WIDTHS[viewport] }} data-testid="tpl-stage">
          {mode === "preview" ? (
            <div key={active?.id ?? "telemetry"} data-testid="tpl-preview">
              {active !== undefined ? <active.Component /> : null}
            </div>
          ) : (
            <pre className="tpl-studio__code" data-testid="tpl-code">
              <code>{active?.source ?? ""}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
