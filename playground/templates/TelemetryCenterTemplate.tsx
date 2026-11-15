/**
 * TelemetryCenterTemplate — FULL-PAGE TEMPLATE 03 of 3 (3.8.0
 * "Full-Page Layout Templates, Interactive Viewport Previewer & CLI
 * Template Expansion").
 *
 * THE TELEMETRY CENTER BLUEPRINT — one self-contained default-export
 * page on an asymmetric 12-column bento. Block by block, top to
 * bottom:
 *
 *   1. KPI row              — 4 tiles (span 3 each): two LIVE tiles
 *      composed from AnimatedNumber (rolling readouts, tabular-nums)
 *      + Sparkline, and two package StatCards (string-value
 *      archetypes). THE STRING-CONTRACT NOTE: StatCard.value is typed
 *      `string`, so the rolling tiles compose the package's own
 *      AnimatedNumber + Sparkline primitives into the StatCard
 *      anatomy; the two string tiles keep the archetype on the row.
 *   2. Capacity gauges      — 2 StatRing tiles (span 3 each) with
 *      total + unit (the zoom/detail strip), flanking the charts row.
 *   3. Charts row           — AreaChart + BarChart in SurfaceCard
 *      panels, side by side (span 6 each).
 *   4. Deployment schedule  — the package TimelineManager fully
 *      wired to LOCAL state (composer, settle toggles, deletes).
 *   5. Node status ledger   — a filterable DataTable: the Input
 *      state filters the rows live (case-insensitive substring over
 *      node + status).
 *
 * STANDALONE PURITY: embedded token-driven <style> (zero hex, 8px
 * grid, 12-col grid collapses via container queries so the studio's
 * viewport emulator reflows it), reduced-motion guard, zero external
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
  Sparkline,
  StatCard,
  StatRing,
  SurfaceCard,
  TimelineManager,
} from "@edwyn/signature-style/react";
import type { DataTableColumn, TimelineItem } from "@edwyn/signature-style/react";

/* ------------------------------------------------------------------ */
/* The template's own stylesheet — embedded for standalone purity.     */
/* ------------------------------------------------------------------ */
const TELEMETRY_TEMPLATE_CSS = `
.sig-tpl-telemetry {
  container-type: inline-size;
  container-name: tpl-telemetry;
  max-width: 1240px;
  margin-inline: auto;
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--space-section);
  padding-bottom: var(--space-section);
  font-family: var(--font-sans);
}
.sig-tpl-telemetry > .span-3 { grid-column: span 3; }
.sig-tpl-telemetry > .span-4 { grid-column: span 4; }
.sig-tpl-telemetry > .span-5 { grid-column: span 5; }
.sig-tpl-telemetry > .span-6 { grid-column: span 6; }
.sig-tpl-telemetry > .span-7 { grid-column: span 7; }
.sig-tpl-telemetry > .span-12 { grid-column: span 12; }
.sig-tpl-telemetry > .sig-tpl-telemetry__kpi { grid-column: span 3; }
.sig-tpl-telemetry__kpi {
  background: var(--bg-surface);
  border: 1px solid color-mix(in srgb, var(--text-muted) 18%, transparent);
  border-radius: var(--radius-card);
  padding: var(--space-section);
  display: flex;
  flex-direction: column;
  gap: var(--space-tight);
}
.sig-tpl-telemetry__kpi-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
}
.sig-tpl-telemetry__kpi-value {
  font-size: 1.5rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--text-bright);
}
.sig-tpl-telemetry__kpi-delta {
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
}
.sig-tpl-telemetry__kpi-delta[data-direction="up"] { color: var(--sig-green); }
.sig-tpl-telemetry__kpi-delta[data-direction="flat"] { color: var(--text-muted); }
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
@container tpl-telemetry (max-width: 1023px) {
  .sig-tpl-telemetry { grid-template-columns: repeat(6, minmax(0, 1fr)); }
  .sig-tpl-telemetry > .span-3 { grid-column: span 3; }
  .sig-tpl-telemetry > .sig-tpl-telemetry__kpi { grid-column: span 3; }
  .sig-tpl-telemetry > .span-4,
  .sig-tpl-telemetry > .span-5,
  .sig-tpl-telemetry > .span-6,
  .sig-tpl-telemetry > .span-7 { grid-column: span 6; }
}
@container tpl-telemetry (max-width: 560px) {
  .sig-tpl-telemetry { grid-template-columns: 1fr; }
  .sig-tpl-telemetry > .span-3,
  .sig-tpl-telemetry > .sig-tpl-telemetry__kpi,
  .sig-tpl-telemetry > .span-4,
  .sig-tpl-telemetry > .span-5,
  .sig-tpl-telemetry > .span-6,
  .sig-tpl-telemetry > .span-7,
  .sig-tpl-telemetry > .span-12 { grid-column: auto; }
}
@media (prefers-reduced-motion: reduce) {
  .sig-tpl-telemetry * { transition-duration: 1ms !important; animation-duration: 1ms !important; }
}
`;

/* ------------------------------------------------------------------ */
/* Data — the deterministic sample telemetry (domain-neutral).         */
/* ------------------------------------------------------------------ */

const THROUGHPUT_SERIES: number[] = [42, 48, 45, 58, 61, 57, 72, 78, 74, 88, 92, 96];
const LATENCY_SERIES: number[] = [180, 172, 176, 158, 149, 152, 141, 138, 133, 129, 124, 118];

const AREA_POINTS = THROUGHPUT_SERIES.map((value, index) => ({
  label: `T${String(index + 1).padStart(2, "0")}`,
  value,
}));

const BAR_DATA = [
  { label: "Ingest", value: 640, max: 800, colorToken: "--sig-cobalt" },
  { label: "Transform", value: 520, max: 800, colorToken: "--sig-cyan" },
  { label: "Index", value: 380, max: 800, colorToken: "--sig-mint" },
  { label: "Serve", value: 700, max: 800, colorToken: "--sig-tangerine" },
] as const;

interface NodeRow {
  node: string;
  status: "healthy" | "degraded" | "draining";
  region: string;
  load: string;
}

const NODE_ROWS: NodeRow[] = [
  { node: "ingest-01", status: "healthy", region: "zone-a", load: "38%" },
  { node: "ingest-02", status: "healthy", region: "zone-a", load: "41%" },
  { node: "transform-01", status: "degraded", region: "zone-b", load: "87%" },
  { node: "transform-02", status: "healthy", region: "zone-b", load: "44%" },
  { node: "index-01", status: "healthy", region: "zone-c", load: "52%" },
  { node: "serve-01", status: "draining", region: "zone-c", load: "9%" },
  { node: "serve-02", status: "healthy", region: "zone-d", load: "47%" },
];

const NODE_COLUMNS: DataTableColumn[] = [
  { key: "node", header: "Node" },
  { key: "status", header: "Status" },
  { key: "region", header: "Region" },
  { key: "load", header: "Load", numeric: true, align: "right" },
];

const DEPLOYMENTS: TimelineItem[] = [
  {
    id: "dp-001",
    date: "November 2026",
    title: "Canary rollout — stage B",
    category: "--sig-cobalt",
    categoryLabel: "Deploy",
    time: "09:00",
    settled: true,
  },
  {
    id: "dp-002",
    date: "November 2026",
    title: "Index rebuild — zone C",
    category: "--sig-cyan",
    categoryLabel: "Maint",
    time: "13:30",
    settled: true,
  },
  {
    id: "dp-003",
    date: "December 2026",
    title: "Serve fleet rotation",
    category: "--sig-mint",
    categoryLabel: "Deploy",
    time: "10:00",
  },
  {
    id: "dp-004",
    date: "December 2026",
    title: "Quarterly capacity review",
    category: "--sig-tangerine",
    categoryLabel: "Review",
    time: "15:00",
  },
];

/** The status → chromatic badge ink (content accents, per the RoE). */
const STATUS_TOKENS: Record<NodeRow["status"], "--sig-green" | "--sig-yellow" | "--sig-mauve-soft"> = {
  healthy: "--sig-green",
  degraded: "--sig-yellow",
  draining: "--sig-mauve-soft",
};

/* ------------------------------------------------------------------ */
/* Blocks.                                                             */
/* ------------------------------------------------------------------ */

/** One LIVE KPI tile — the StatCard anatomy composed from the
 *  package primitives (AnimatedNumber + Sparkline). */
function LiveKpiTile({
  label,
  value,
  delta,
  direction,
  series,
  token,
}: {
  label: string;
  value: number;
  delta: string;
  direction: "up" | "flat";
  series: number[];
  token: "--sig-cobalt" | "--sig-tangerine";
}): ReactNode {
  return (
    <div className="sig-tpl-telemetry__kpi" data-testid={`tpl-tele-kpi-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <span className="sig-tpl-telemetry__kpi-label">{label}</span>
      <span className="sig-tpl-telemetry__kpi-value">
        <AnimatedNumber value={value} />
      </span>
      <span className="sig-tpl-telemetry__kpi-delta" data-direction={direction}>
        {delta}
      </span>
      <Sparkline data={series} colorToken={token} label={`${label} trend`} width={160} height={32} />
    </div>
  );
}

function KpiRow(): ReactNode {
  return (
    <>
      <LiveKpiTile
        label="Throughput"
        value={THROUGHPUT_SERIES[THROUGHPUT_SERIES.length - 1] ?? 0}
        delta="+14.3% vs last window"
        direction="up"
        series={THROUGHPUT_SERIES}
        token="--sig-cobalt"
      />
      <LiveKpiTile
        label="Latency p95"
        value={LATENCY_SERIES[LATENCY_SERIES.length - 1] ?? 0}
        delta="−34.4% vs last window"
        direction="up"
        series={LATENCY_SERIES}
        token="--sig-tangerine"
      />
      <StatCard
        label="Error budget"
        value="99.98%"
        delta="within SLO"
        sparklineData={[99.91, 99.95, 99.97, 99.96, 99.98, 99.98]}
        colorToken="--sig-green"
      />
      <StatCard
        label="Active streams"
        value="24"
        delta="+2"
        deltaDirection="up"
        sparklineData={[16, 18, 18, 21, 22, 24]}
        colorToken="--sig-mauve-soft"
      />
    </>
  );
}

function GaugeRow(): ReactNode {
  return (
    <>
      <div className="span-3" data-testid="tpl-tele-gauge-1">
        <StatRing
          value={68}
          colorToken="--sig-cobalt"
          label="Cluster capacity used"
          total={100}
          unit="% capacity"
        />
      </div>
      <div className="span-3" data-testid="tpl-tele-gauge-2">
        <StatRing
          value={42}
          colorToken="--sig-mint"
          label="Storage pool used"
          total={100}
          unit="% storage"
        />
      </div>
    </>
  );
}

function ChartsRow(): ReactNode {
  return (
    <>
      <div className="span-6">
        <SurfaceCard eyebrow="Trends" meta="viz/area" title="Throughput, last 12 windows" interactive>
          <AreaChart points={AREA_POINTS} colorToken="--sig-cobalt" label="Throughput trend" height={180} />
        </SurfaceCard>
      </div>
      <div className="span-6">
        <SurfaceCard eyebrow="Capacity" meta="viz/bars" title="Pipeline stage load vs capacity" interactive>
          <BarChart data={[...BAR_DATA]} label="Stage load vs capacity" />
        </SurfaceCard>
      </div>
    </>
  );
}

function ScheduleSection(): ReactNode {
  const [deployments, setDeployments] = useState<TimelineItem[]>(DEPLOYMENTS);
  const addDeployment = (item: Omit<TimelineItem, "id">): void => {
    setDeployments((current) => [...current, { ...item, id: `dp-${String(current.length + 1).padStart(3, "0")}` }]);
  };
  const toggleSettled = (id: string): void => {
    setDeployments((current) =>
      current.map((item) => (item.id === id ? { ...item, settled: item.settled !== true } : item)),
    );
  };
  const deleteDeployment = (id: string): void => {
    setDeployments((current) => current.filter((item) => item.id !== id));
  };
  return (
    <div className="span-7">
      <SurfaceCard eyebrow="Schedule" meta="planner/timeline" title="Deployment schedule" interactive>
        <TimelineManager
          items={deployments}
          onAdd={addDeployment}
          onToggleSettled={toggleSettled}
          onDelete={deleteDeployment}
          label="Deployment schedule"
        />
      </SurfaceCard>
    </div>
  );
}

function LedgerSection(): ReactNode {
  const [query, setQuery] = useState("");
  // THE ONE DERIVATION — case-insensitive substring over node + status.
  const filteredRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = needle === ""
      ? NODE_ROWS
      : NODE_ROWS.filter(
          (row) =>
            row.node.toLowerCase().includes(needle) ||
            row.status.toLowerCase().includes(needle) ||
            row.region.toLowerCase().includes(needle),
        );
    return rows.map((row) => ({
      node: row.node,
      status: (
        <span style={{ color: `var(${STATUS_TOKENS[row.status]})`, fontWeight: 600 }}>
          {row.status}
        </span>
      ),
      region: row.region,
      load: row.load,
    }));
  }, [query]);

  return (
    <div className="span-5">
      <SurfaceCard eyebrow="Ledger" meta="data/table" title="Node status" interactive>
        <div className="sig-tpl-telemetry__filter">
          <Input
            type="search"
            placeholder="Filter nodes…"
            aria-label="Filter node status ledger"
            data-testid="tpl-tele-filter"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <span className="sig-tpl-telemetry__filter-count" aria-live="polite">
            <Icon name="ListTree" size={14} aria-hidden /> {filteredRows.length} / {NODE_ROWS.length} nodes
          </span>
        </div>
        <DataTable
          columns={NODE_COLUMNS}
          rows={filteredRows}
          caption="Node status ledger · filtered live by the input above"
        />
      </SurfaceCard>
    </div>
  );
}

function TelemetryCenterPage(): ReactNode {
  return (
    <main className="sig-tpl-telemetry" data-testid="tpl-telemetry">
      <style>{TELEMETRY_TEMPLATE_CSS}</style>
      <KpiRow />
      <GaugeRow />
      <ChartsRow />
      <ScheduleSection />
      <LedgerSection />
    </main>
  );
}

/**
 * The Telemetry Center full-page template — the 12-column asymmetric
 * bento: four KPI tiles (rolling AnimatedNumber tiles + package
 * StatCards), two StatRing capacity gauges, the AreaChart/BarChart
 * panel pair, the state-wired TimelineManager deployment schedule and
 * the filterable node-status DataTable. See the file header for the
 * block-by-block outline.
 */
export default function TelemetryCenterTemplate() {
  return <TelemetryCenterPage />;
}
