/**
 * CodexView — THE AI CODEX view (2.8.0). The machine-readable face of
 * the system, rendered for humans AND agents:
 *
 *   1. THE COLOR SWATCHES — every COLOR token as a click-to-copy card
 *      (click → clipboard the var name → toast). THE HONEST COUNT: the
 *      whitelist is 34 tokens, of which exactly 22 are colors (11
 *      core/keeper + the 11-token Party Palette); the remaining 12 are
 *      spatial, z-index, type and motion tokens — they get their own
 *      displays below instead of being mislabeled "colors".
 *   2. THE 8PX SPATIAL GRID — visual bars at 4/8/16/24/32/64px (8/16/24
 *      are the token tiers --space-tight/standard/section).
 *   3. THE Z-LADDER — the 5 rungs as a DataTable (rung/token/value/
 *      used-by), CommandPalette included on the modal rung.
 *   4. THE DOCTRINES — Cascade, Override, Rule of Engagement, Pruning,
 *      8px grid, physics, the e1 shadow treaty, as ProseBlocks.
 */
import type { ReactNode } from "react";
import { SurfaceCard, DataTable, ProseBlock, useToast } from "@edwyn/signature-style/react";
import type { DataTableColumn } from "@edwyn/signature-style/react";

/** Every COLOR token (22): the 11 core/keeper + the 11 party tokens.
    Values are the Mocha defaults (the dark default theme); Latte swaps
    the theme tokens by attribute — the party palette never moves. */
const COLOR_TOKENS: ReadonlyArray<{ token: string; label: string; family: "core" | "party" }> = [
  { token: "--bg-base", label: "Base", family: "core" },
  { token: "--bg-surface", label: "Surface", family: "core" },
  { token: "--bg-inset", label: "Inset", family: "core" },
  { token: "--color-cake-primary", label: "Flamingo (primary)", family: "core" },
  { token: "--color-cake-secondary", label: "Teal (secondary)", family: "core" },
  { token: "--color-on-cake", label: "On-cake ink", family: "core" },
  { token: "--color-success", label: "Success", family: "core" },
  { token: "--text-main", label: "Text", family: "core" },
  { token: "--text-bright", label: "Bright text", family: "core" },
  { token: "--text-muted", label: "Muted text", family: "core" },
  { token: "--text-muted-soft", label: "Soft muted", family: "core" },
  { token: "--party-pink-bright", label: "Pink bright", family: "party" },
  { token: "--party-pink-soft", label: "Pink soft", family: "party" },
  { token: "--party-pink-alt", label: "Pink alt", family: "party" },
  { token: "--party-mauve-bright", label: "Mauve bright", family: "party" },
  { token: "--party-mauve-soft", label: "Mauve soft", family: "party" },
  { token: "--party-lavender", label: "Lavender", family: "party" },
  { token: "--party-sky", label: "Sky", family: "party" },
  { token: "--party-cobalt", label: "Cobalt", family: "party" },
  { token: "--party-peach", label: "Peach", family: "party" },
  { token: "--party-green", label: "Green", family: "party" },
  { token: "--party-yellow", label: "Yellow", family: "party" },
];

/** The visual 8px scale — 4/8/16/24/32/64, the white-space vocabulary. */
const GRID_STEPS: ReadonlyArray<{ px: number; token?: string }> = [
  { px: 4 },
  { px: 8, token: "--space-tight" },
  { px: 16, token: "--space-standard" },
  { px: 24, token: "--space-section" },
  { px: 32 },
  { px: 64 },
];

/** The 5-rung z-ladder (Pillar 3) — same values in both themes. */
const Z_LADDER: Array<{ rung: string; token: string; value: string; usedBy: string }> = [
  { rung: "sticky", token: "--z-sticky", value: "10", usedBy: "timeline month headers" },
  { rung: "nav", token: "--z-nav", value: "30", usedBy: "GlobalNav bar + notch" },
  { rung: "overlay", token: "--z-overlay", value: "40", usedBy: "modal backdrop scrim" },
  { rung: "modal", token: "--z-modal", value: "50", usedBy: "EventModal · CommandPalette rung" },
  { rung: "toast", token: "--z-toast", value: "60", usedBy: "toast region (the zenith)" },
];

const Z_COLUMNS: DataTableColumn[] = [
  { key: "rung", header: "Rung" },
  { key: "token", header: "Token" },
  { key: "value", header: "Value", numeric: true, align: "right" },
  { key: "usedBy", header: "Used by" },
];

/** One click-to-copy swatch card — flat, hairline, no shadow (e1). */
function Swatch({ token, label, family }: { token: string; label: string; family: "core" | "party" }) {
  const toast = useToast();
  const handleCopy = () => {
    navigator.clipboard
      .writeText(token)
      .then(() => toast("success", `Copied ${token}`))
      .catch(() => toast("error", "Clipboard unavailable"));
  };
  return (
    <button
      type="button"
      className="codex__swatch"
      onClick={handleCopy}
      title={`Copy ${token}`}
      data-testid="codex-swatch"
      data-sig-token={token}
    >
      <span className="codex__swatch-chip" style={{ background: `var(${token})` }} aria-hidden="true" />
      <span className="codex__swatch-name">{token}</span>
      <span className="codex__swatch-label">{label}</span>
      <span className="codex__swatch-family" data-family={family}>
        {family}
      </span>
    </button>
  );
}

/** One doctrine card — ProseBlock carries the prose. */
function Doctrine({ title, children }: { title: string; children: ReactNode }) {
  return (
    <SurfaceCard eyebrow="Doctrine" meta="SYSTEM_PROMPT.md" title={title}>
      <ProseBlock>{children}</ProseBlock>
    </SurfaceCard>
  );
}

export function CodexView() {
  return (
    <div className="codex" data-testid="ai-codex">
      <SurfaceCard eyebrow="Codex" meta="css/tokens.css" title="The Color Tokens">
        <p className="codex__note">
          22 color tokens render here — the whitelist is 34; the other 12 are spatial,
          z-index, type and motion tokens (their displays follow). Click any swatch to copy
          its var name.
        </p>
        <div className="codex__swatches" data-testid="codex-swatches">
          {COLOR_TOKENS.map((entry) => (
            <Swatch key={entry.token} {...entry} />
          ))}
        </div>
      </SurfaceCard>

      <SurfaceCard eyebrow="Codex" meta="tokens.json · shared" title="The 8px Spatial Grid">
        <div className="codex__grid-scale" data-testid="codex-grid">
          {GRID_STEPS.map((step) => (
            <div key={step.px} className="codex__grid-row">
              <span className="codex__grid-bar" style={{ width: `${String(step.px)}px` }} />
              <span className="codex__grid-label">
                {String(step.px)}px{step.token !== undefined ? ` · ${step.token}` : ""}
              </span>
            </div>
          ))}
        </div>
      </SurfaceCard>

      <SurfaceCard eyebrow="Codex" meta="css/tokens.css · Pillar 3" title="The Z-Ladder">
        <DataTable columns={Z_COLUMNS} rows={Z_LADDER} caption="The 5-rung z-index scale · same in both themes" />
      </SurfaceCard>

      <Doctrine title="The Token Cascade">
        <p>
          Every hover, active, disabled and focus-visible state is <em>derived</em> from the
          core tokens with <code>color-mix()</code> and transforms — hover lightens, active
          darkens and presses with <code>scale(0.97)</code>, disabled greys to the surface
          token. Never hand-author a state; never invent a token; never hardcode a hex.
        </p>
      </Doctrine>

      <Doctrine title="The Override Protocol">
        <p>
          Scoped utility classes alter ONE element; the global variables never move. When a
          consumer needs a different look, it overrides at the composition layer with
          attribute or class selectors — the package css stays sovereign inside its layers
          (<code>tokens → base → cascade → overrides</code>).
        </p>
      </Doctrine>

      <Doctrine title="The Rule of Engagement">
        <p>
          <code>--party-*</code> tokens are reserved EXCLUSIVELY for content — badges, tags,
          avatars, event themes, calendar blocks, data visualization. Flamingo and Teal (the
          cake colors) drive ALL structural UI — buttons, inputs, focus rings. The two
          families never cross.
        </p>
      </Doctrine>

      <Doctrine title="The Pruning Protocol">
        <p>
          Subtract by default. Every component renders the flattest possible DOM — no
          decorative wrappers, no div soup. If an element carries no semantics and no
          behavior, it does not ship. The CommandPalette, when it comes, sits on the z-50
          modal rung with a portal, not a nested overlay div.
        </p>
      </Doctrine>

      <Doctrine title="The 8px Grid">
        <p>
          All padding and gaps use <code>--space-tight</code> (0.5rem),{" "}
          <code>--space-standard</code> (1rem) or <code>--space-section</code> (1.5rem);
          button padding is <code>var(--space-tight) var(--space-standard)</code>. Maximize
          negative space — whitespace is the cheapest luxury.
        </p>
      </Doctrine>

      <Doctrine title="Mechanical Physics">
        <p>
          Colors and opacity move with <code>--transition-standard</code> (0.15s ease-out,
          snappy); transforms move with <code>--transition-transform</code> (0.3s{" "}
          <code>cubic-bezier(0.2, 0.8, 0.2, 1)</code>, smooth arrival). No bounce, no
          overshoot, no elastic easing — and <code>prefers-reduced-motion</code> always
          wins.
        </p>
      </Doctrine>

      <Doctrine title="The e1 Shadow Treaty">
        <p>
          Separation is drawn with hairlines, never shadows. The ONE sanctioned shadow home
          is the surface elevation: <code>css/surface.css</code>&rsquo;s{" "}
          <code>.sig-surface-card</code> rules, the three{" "}
          <code>[data-elevation]</code> tier blocks, and the <code>[data-accent]</code>{" "}
          chromatic glow. Everywhere else: zero drop shadows — the composition layer may
          re-add ambient elevation only where the owner sanctioned it.
        </p>
      </Doctrine>
    </div>
  );
}
