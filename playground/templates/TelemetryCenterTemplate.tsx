/**
 * TelemetryCenterTemplate — FULL-PAGE BLUEPRINT "Match & Telemetry
 * Analytics Hub" (4.0.0 "Motion Lab Rebuild, Flip/Accordion Geometry
 * Fix, Destructive Confirm Norm & Human-Crafted Blueprints"; replaces
 * the 3.8.0 observability blueprint under the SAME registry id
 * "telemetry" — the CLI's SignatureTelemetryCenter.tsx keeps its name
 * and marker).
 *
 * THE HIGH-DENSITY COMPETITIVE ANALYTICS BLUEPRINT — one self-
 * contained default-export page, ORIGINAL content throughout (the
 * style is inspired by the competitive-stats genre; every player
 * call sign, map, and number here is invented, deterministic mock
 * data — zero copyrighted titles, zero real handles). Block by block,
 * top to bottom:
 *
 *   1. Player Summary header — the rank badge (SigBadge), the player
 *      call sign, the live rating (AnimatedNumber, tabular-nums) and
 *      the 128px win-rate StatRing (the "md" enum diameter — exactly
 *      128×128 forever).
 *   2. Role/Class Mastery — a BarChart breakdown per role (capacity
 *      tracks + chromatic value bars) beside ProgressBar rows (the
 *      same four roles as horizontal meters with limit captions).
 *   3. Rating Momentum — an AreaChart of the last 12 sessions (the
 *      sparkline-fed points; the mount sweep draws the line).
 *   4. Match History Ledger — a DataTable: Match (map + mode), Score /
 *      KDA (tabular-nums), Duration, and the Result column wearing
 *      --sig-mint Win / --sig-crimson Loss badges.
 *
 * STANDALONE PURITY: embedded token-driven <style> (zero hex, 8px
 * grid, the 12-col grid collapses via container queries so the
 * studio's viewport emulator reflows it: >1024px container = the full
 * 12-col bento; 640–1024px = the 2-col tier; <640px = single column).
 * 3.9.0 lesson kept: the container name is the SHARED `template-stage`
 * and the grid lives on an INNER wrapper — a container query can never
 * restyle its own container. Reduced-motion guard, zero external
 * dependencies, no ToastProvider needed (no toasts — the widgets own
 * their feedback).
 */
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  AnimatedNumber,
  AreaChart,
  BarChart,
  DataTable,
  Icon,
  Input,
  ProgressBar,
  SigBadge,
  StatRing,
  SurfaceCard,
} from "@carcolacha/signature-style/react";
import type { DataTableColumn } from "@carcolacha/signature-style/react";

/* ------------------------------------------------------------------ */
/* The template's own stylesheet — embedded for standalone purity.     */
/* ------------------------------------------------------------------ */
const TELEMETRY_TEMPLATE_CSS = `
.sig-tpl-telemetry {
  container-type: inline-size;
  container-name: template-stage;
  max-width: 1240px;
  margin-inline: auto;
  padding-bottom: var(--space-section);
  font-family: var(--font-sans);
}
/* THE INNER GRID — a DESCENDANT of the container, so every container
   breakpoint legally lands (a query cannot restyle its own container).
   minmax(0, 1fr) tracks: no child can force the grid wider than its
   container. */
.sig-tpl-telemetry__grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--space-section);
}
.sig-tpl-telemetry__grid > .span-3 { grid-column: span 3; }
.sig-tpl-telemetry__grid > .span-4 { grid-column: span 4; }
.sig-tpl-telemetry__grid > .span-5 { grid-column: span 5; }
.sig-tpl-telemetry__grid > .span-6 { grid-column: span 6; }
.sig-tpl-telemetry__grid > .span-7 { grid-column: span 7; }
.sig-tpl-telemetry__grid > .span-12 { grid-column: span 12; }
/* The hero strip: identity left, the 128px ring right. */
.sig-tpl-telemetry__hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-section);
  flex-wrap: wrap;
}
.sig-tpl-telemetry__id {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-tight);
  min-width: 0;
}
.sig-tpl-telemetry__callsign {
  font-size: 2rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--text-bright);
  font-variant-numeric: tabular-nums;
}
.sig-tpl-telemetry__rating {
  font-size: 0.9375rem;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
.sig-tpl-telemetry__rating strong { color: var(--text-main); font-weight: 600; }
.sig-tpl-telemetry__ring-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-tight);
}
.sig-tpl-telemetry__ring-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
}
/* Role meters under the bar chart. */
.sig-tpl-telemetry__meters {
  display: flex;
  flex-direction: column;
  gap: var(--space-standard);
}
.sig-tpl-telemetry__meter-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--space-tight);
  margin-bottom: var(--space-tight);
}
.sig-tpl-telemetry__meter-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-main);
}
/* The ledger filter row. */
.sig-tpl-telemetry__filter {
  display: flex;
  align-items: center;
  gap: var(--space-tight);
}
.sig-tpl-telemetry__filter input { max-width: 240px; }
.sig-tpl-telemetry__filter-count {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
/* KDA cells render tabular so the digits never jitter between rows. */
.sig-tpl-telemetry__num {
  font-variant-numeric: tabular-nums;
}
/* THE DOCTRINE FOCUS RING — every interactive element in the template
   rings Flamingo (2px + offset); the browser default never shows. */
.sig-tpl-telemetry input:focus-visible,
.sig-tpl-telemetry button:focus-visible {
  outline: 2px solid var(--color-cake-primary);
  outline-offset: 2px;
  border-radius: var(--radius-ui);
}
@container template-stage (max-width: 1024px) {
  /* 640–1024px container: the 2-col tier — the grid halves to 6
     columns and every span doubles; the hero + ring pair up. */
  .sig-tpl-telemetry__grid { grid-template-columns: repeat(6, minmax(0, 1fr)); }
  .sig-tpl-telemetry__grid > .span-3 { grid-column: span 3; }
  .sig-tpl-telemetry__grid > .span-4,
  .sig-tpl-telemetry__grid > .span-5,
  .sig-tpl-telemetry__grid > .span-6,
  .sig-tpl-telemetry__grid > .span-7 { grid-column: span 6; }
}
@container template-stage (max-width: 639px) {
  /* <640px container: the single-column tier — one minmax(0, 1fr)
     track, every span reset. */
  .sig-tpl-telemetry__grid { grid-template-columns: minmax(0, 1fr); }
  .sig-tpl-telemetry__grid > .span-3,
  .sig-tpl-telemetry__grid > .span-4,
  .sig-tpl-telemetry__grid > .span-5,
  .sig-tpl-telemetry__grid > .span-6,
  .sig-tpl-telemetry__grid > .span-7,
  .sig-tpl-telemetry__grid > .span-12 { grid-column: auto; }
}
@media (prefers-reduced-motion: reduce) {
  .sig-tpl-telemetry * { transition-duration: 1ms !important; animation-duration: 1ms !important; }
}
`;

/* ------------------------------------------------------------------ */
/* Data — the deterministic mock roster (ORIGINAL call signs, maps     */
/* and modes; invented numbers, stable across renders).                */
/* ------------------------------------------------------------------ */

/** The player identity block (Block 1). */
const PLAYER = {
  callsign: "VEKTOR-9",
  rank: "Diamond II",
  rankToken: "--sig-azure",
  rating: 2418,
  ratingDelta: "+86 this week",
  winRate: 58,
};

/** Block 2 — the per-role mastery bars + meters. */
const ROLE_MASTERY = [
  { label: "Vanguard", value: 820, max: 1000, meter: 82, colorToken: "--sig-tangerine" },
  { label: "Skirmisher", value: 690, max: 1000, meter: 69, colorToken: "--sig-cyan" },
  { label: "Sentinel", value: 540, max: 1000, meter: 54, colorToken: "--sig-mint" },
  { label: "Medic", value: 310, max: 1000, meter: 31, colorToken: "--sig-lavender" },
] as const;

/** Block 3 — the rating momentum series (last 12 sessions). */
const RATING_SERIES: number[] = [2240, 2268, 2255, 2302, 2320, 2296, 2341, 2360, 2348, 2387, 2402, 2418];
const MOMENTUM_POINTS = RATING_SERIES.map((value, index) => ({
  label: `S${String(index + 1).padStart(2, "0")}`,
  value,
}));

/** Block 4 — the match history ledger. */
interface MatchRow {
  match: string;
  map: string;
  kda: string;
  duration: string;
  result: "Win" | "Loss";
}

const MATCH_ROWS: MatchRow[] = [
  { match: "Ranked · Skyline Circuit", map: "Skyline Circuit", kda: "24 / 8 / 16", duration: "34:12", result: "Win" },
  { match: "Ranked · Delta Basin", map: "Delta Basin", kda: "11 / 9 / 21", duration: "41:03", result: "Win" },
  { match: "Ranked · Foundry Row", map: "Foundry Row", kda: "9 / 14 / 7", duration: "22:48", result: "Loss" },
  { match: "Ranked · Meridian Gardens", map: "Meridian Gardens", kda: "18 / 6 / 24", duration: "29:37", result: "Win" },
  { match: "Ranked · Skyline Circuit", map: "Skyline Circuit", kda: "7 / 12 / 11", duration: "26:20", result: "Loss" },
  { match: "Ranked · Ion Refinery", map: "Ion Refinery", kda: "21 / 7 / 13", duration: "31:55", result: "Win" },
  { match: "Ranked · Delta Basin", map: "Delta Basin", kda: "15 / 10 / 18", duration: "36:44", result: "Win" },
  { match: "Ranked · Foundry Row", map: "Foundry Row", kda: "12 / 11 / 9", duration: "24:02", result: "Loss" },
];

const MATCH_COLUMNS: DataTableColumn[] = [
  { key: "match", header: "Match" },
  { key: "kda", header: "Score / KDA", numeric: true, align: "right" },
  { key: "duration", header: "Duration", numeric: true, align: "right" },
  { key: "result", header: "Result" },
];

/** The result → chromatic badge ink (content accents, per the RoE). */
const RESULT_TOKENS: Record<MatchRow["result"], "--sig-mint" | "--sig-crimson"> = {
  Win: "--sig-mint",
  Loss: "--sig-crimson",
};

/* ------------------------------------------------------------------ */
/* Blocks.                                                             */
/* ------------------------------------------------------------------ */

/** Block 1 — the Player Summary header: rank badge + call sign + the
 *  live rating + the 128px win-rate ring (the "md" enum diameter). */
function PlayerSummary(): ReactNode {
  return (
    <div className="span-12">
      <SurfaceCard eyebrow="Player Summary" meta="competitive/analytics" title="Season standings" interactive>
        <div className="sig-tpl-telemetry__hero">
          <div className="sig-tpl-telemetry__id" data-testid="tpl-tele-player">
            <SigBadge colorToken={PLAYER.rankToken} label={PLAYER.rank} />
            <span className="sig-tpl-telemetry__callsign">{PLAYER.callsign}</span>
            <span className="sig-tpl-telemetry__rating">
              Rating <strong><AnimatedNumber value={PLAYER.rating} /></strong> · {PLAYER.ratingDelta}
            </span>
          </div>
          <div className="sig-tpl-telemetry__ring-cell" data-testid="tpl-tele-winrate">
            <StatRing
              value={PLAYER.winRate}
              colorToken="--sig-mint"
              label="Win rate"
              size="md"
              strokeWidth={8}
            />
            <span className="sig-tpl-telemetry__ring-label">Win rate · 128px</span>
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}

/** Block 2 — Role/Class Mastery: the BarChart breakdown beside the
 *  ProgressBar meters (the same four roles, two readings). */
function RoleMastery(): ReactNode {
  return (
    <>
      <div className="span-7">
        <SurfaceCard eyebrow="Mastery" meta="charts/roles" title="Role performance" interactive>
          <BarChart
            data={ROLE_MASTERY.map((role) => ({
              label: role.label,
              value: role.value,
              max: role.max,
              colorToken: role.colorToken,
            }))}
            label="Mastery score by role"
          />
        </SurfaceCard>
      </div>
      <div className="span-5">
        <SurfaceCard eyebrow="Meters" meta="charts/roles" title="Role fill" interactive>
          <div className="sig-tpl-telemetry__meters" data-testid="tpl-tele-roles">
            {ROLE_MASTERY.map((role) => (
              <ProgressBar
                key={role.label}
                value={role.meter}
                colorToken={role.colorToken}
                label={`${role.label} mastery`}
                limitText={`${role.value} / ${role.max}`}
              />
            ))}
          </div>
        </SurfaceCard>
      </div>
    </>
  );
}

/** Block 3 — Rating Momentum: the 12-session AreaChart. */
function RatingMomentum(): ReactNode {
  return (
    <div className="span-12">
      <SurfaceCard eyebrow="Momentum" meta="charts/rating" title="Rating — last 12 sessions" interactive>
        <AreaChart
          points={MOMENTUM_POINTS}
          colorToken="--sig-azure"
          label="Rating momentum"
          height={180}
        />
      </SurfaceCard>
    </div>
  );
}

/** Block 4 — the Match History Ledger: a filterable DataTable with
 *  mint Win / crimson Loss result badges. */
function MatchLedger(): ReactNode {
  const [query, setQuery] = useState("");
  const filteredRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = needle === ""
      ? MATCH_ROWS
      : MATCH_ROWS.filter(
          (row) =>
            row.match.toLowerCase().includes(needle) ||
            row.map.toLowerCase().includes(needle) ||
            row.result.toLowerCase().includes(needle),
        );
    return rows.map((row) => ({
      match: row.match,
      kda: <span className="sig-tpl-telemetry__num">{row.kda}</span>,
      duration: <span className="sig-tpl-telemetry__num">{row.duration}</span>,
      result: <SigBadge colorToken={RESULT_TOKENS[row.result]} label={row.result} />,
    }));
  }, [query]);

  return (
    <div className="span-12">
      <SurfaceCard eyebrow="Ledger" meta="data/matches" title="Match history" interactive>
        <div className="sig-tpl-telemetry__filter">
          <Input
            type="search"
            placeholder="Filter matches…"
            aria-label="Filter match history"
            data-testid="tpl-tele-filter"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <span className="sig-tpl-telemetry__filter-count" aria-live="polite">
            <Icon name="ListTree" size={14} aria-hidden /> {filteredRows.length} / {MATCH_ROWS.length} matches
          </span>
        </div>
        <DataTable
          columns={MATCH_COLUMNS}
          rows={filteredRows}
          caption="Match history ledger · filtered live by the input above"
        />
      </SurfaceCard>
    </div>
  );
}

function TelemetryCenterPage(): ReactNode {
  return (
    <main className="sig-tpl-telemetry" data-testid="tpl-telemetry">
      <style>{TELEMETRY_TEMPLATE_CSS}</style>
      {/* The INNER grid wrapper: the container queries answer the
          root's width and restyle THIS element (a container can never
          restyle itself). */}
      <div className="sig-tpl-telemetry__grid">
        <PlayerSummary />
        <RoleMastery />
        <RatingMomentum />
        <MatchLedger />
      </div>
    </main>
  );
}

/**
 * The Match & Telemetry Analytics Hub full-page template — the
 * high-density competitive analytics blueprint: Player Summary (rank
 * badge + call sign + live rating + the 128px win-rate ring), Role
 * Mastery (BarChart + ProgressBar), Rating Momentum (AreaChart), and
 * the filterable Match History DataTable with mint/crimson result
 * badges. See the file header for the block-by-block outline.
 */
export default function TelemetryCenterTemplate() {
  return <TelemetryCenterPage />;
}
