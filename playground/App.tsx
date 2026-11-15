/**
 * App — THE ENGINE + THE MASTER INDEX (2.6.0 "Universal Developer Card
 * Suite, Chromatic Elevation & The Master Index Overhaul").
 *
 * 2.9.1 — ZERO CONTRAST DEBT & THE LIVE SKELETON TRIGGER. Two moves:
 *
 *   1. (css/tokens.css — not here) the two sub-3.0 chromatic tokens are
 *      lightened at the source; this file's BENTO still reads them
 *      through var(--sig-*) and inherits the fix.
 *
 *   2. THE ASYNC-LOAD SIMULATION — the skeletons (2.9.0's SkeletonCard /
 *      SkeletonTableRow) get a LIVE trigger: the command-palette entry
 *      "Simulate Async Load (800ms)" (keywords skeleton/loading/async/
 *      cls) and a Button on the Form & Input Matrix module card
 *      (data-testid="btn-simulate-load" — the documented most-natural
 *      spot: the skeletons land on THIS view's Core Dashboard, so the
 *      manual toggle sits one module-tab away; the palette command covers
 *      cross-view runs by navigating home + deferring one frame).
 *      DashboardView owns `simLoading` + the measured height locks ABOVE
 *      the module switch (the members pattern — tab flips survive);
 *      BentoCore's SimSlot measures each card body's exact footprint
 *      BEFORE the swap and renders the skeleton inside an explicit
 *      height during the 800ms window — the card containers' bounding
 *      rects are identical BEFORE / DURING / AFTER: CLS 0 by
 *      construction, proven by playground/probe-skeleton-cls.mjs. No
 *      toast on purpose: the skeleton IS the feedback.
 *
 * 2.8.0 — THE SIGNATURE PATTERN WEBSITE. The playground stops being a
 * dashboard-with-catalog and becomes the public-ready Pattern Studio:
 * the nav map grows from 2 real + 3 placeholder views (dashboard/index +
 * events/members/budget) to FIVE REAL views — Dashboard (the live bento,
 * untouched), Pattern Studio (THE primary catalog: the 6-Set Taxonomy
 * rendered as <PatternFrame> cards with live previews, Preview ↔ JSX ↔
 * HTML toggles and one-click Copy Card — components/PatternStudio.tsx),
 * Master Index (unchanged), Chronicle (the Night of Versions full-width,
 * below), and AI Codex (the 22 color tokens as click-to-copy swatches —
 * honestly counted out of the 34-token whitelist — the 8px scale, the
 * 5-rung z-ladder and the doctrines as ProseBlocks —
 * components/CodexView.tsx). The HubLink/hash mechanism is untouched;
 * every frame stamps data-sig-set / data-sig-component so AI agents can
 * read the page, and public/llms.txt + llms-full.txt carry the same
 * knowledge machine-readably (playground/generate-llms.mjs generates
 * them from the SNIPPETS registry — they cannot drift).
 *
 * 2.7.0 — THE GRAPHS & PLANNER MODULE + THE PERSISTENCE ADDENDUM. The
 * dashboard's module Tabs grow a fourth door: "Graphs & Planner"
 * (GraphPlannerModule, defined below FormsModule like every other
 * module — the b5 audit slice stays 7 cards). Four cards: The Knowledge
 * Graph (<KnowledgeGraph addOn> — deterministic radial SVG, focus
 * dimming, Add & Link), Spending by Category (<BarChart>, four bars
 * with per-bar capacity maxes), Attendance Momentum (<AreaChart>, 8 weekly
 * points, sky), and the Milestone Manager (<TimelineManager> fully
 * wired — composer, filter pills, settle toggles, deletes, inspect →
 * EventModal). THE PERSISTENCE STORY (the Excalidraw/tldraw pattern):
 * the graph and the milestones mirror into localStorage through
 * usePersistentState (playground/persistence.ts, versioned keys
 * sig.v27.graph / sig.v27.timeline), so a reload restores your work;
 * the Milestone Manager card's toolbar exports/imports both arrays as
 * signature-workspace.json and the danger Reset button wipes the keys
 * back to the seeds. THE PROOF (release blocker): playwright adds a
 * "Persistence proof" node, RELOADS the page, and asserts the node is
 * still there; Export fires a download; Reset restores the seeds.
 *
 * 2.6.0 — THE MASTER INDEX OVERHAUL. The index stops being three doors
 * and becomes THE CATALOG: a filter <Tabs> bar (all / gateways / food /
 * commerce / docs), Row 1 the three BALANCED chromatic gateways
 * (.hub__row--3, equal width, accent-underlined — Flamingo/lavender/
 * peach through the package's data-accent contract), Row 2 the
 * commerce trio (ContentCard · ReferenceCard · TierCard — the new
 * universal archetypes, dogfooded), Row 3 the food slab (a dot-
 * indicator Carousel of five mini-cards + the 4-up profile row), and
 * Row 4 the live chronicle — <ChronicleTimeline> rendering all 23
 * releases of the engine's life (v0.1.0 → v2.6.0; the patch releases
 * fold into their minors). Filtering is CONDITIONAL RENDERING per row:
 * `category` state switches whole rows in and out (all → everything;
 * gateways → row 1; commerce → row 2 + the profile row; food → the
 * food slab; docs → the reference card + the chronicle). The
 * dashboard view (BentoCore) is UNTOUCHED — the 12-column board stays.
 *
 * 2.5.0 — LIVE STATE MODE + THE 12-COLUMN BENTO. The core dashboard
 * stops being a static board: `SEED_MEMBERS` seeds a `Member[]` state,
 * every check-in appends a row, and the bento REACTS — the ledger
 * table, the Confirmed Seats StatCard, the Attendance StatRing (its
 * stroke-dashoffset glides through a playground-scoped css rule,
 * viz.tsx byte-frozen), the budget bars and their limit captions are
 * all `useMemo` derivatives of the one array. The five owner defects
 * this release buries:
 *
 *   1. edge-to-edge tab modules   → everything renders inside
 *                                    `.sig-shell` (styles.css);
 *   2. format rules below inputs  → FormField description-above +
 *                                    prefix/suffix well (package);
 *   3. orphan switches            → ToggleSwitch visible label
 *                                    (2.4.1, exercised here);
 *   4. ledger header misalignment → DataTable align: "right" on the
 *                                    live Contribution column;
 *   5. the rigid dashboard        → the 12-column bento: Button
 *                                    variants, card archetypes, live
 *                                    validation (member-form).
 *
 * 2.3.0 — THE DASHBOARD GROWS MODULE TABS. The dashboard view gains the
 * package's <Tabs> (attribute-driven: aria-selected, ZERO .is-active
 * classes — the nav contract) switching three modules: "core" (the
 * live bento), "data" (the Member & Budget Ledger —
 * <DataTable> with a composed <SigBadge> status cell, the three
 * persistent <Callout> moods, five <Avatar> discs, two wearing chromatic
 * rings), and "forms" (the Input Matrix — Input/TextArea/Select/
 * Checkbox/ToggleSwitch stacked in the v2.1.0 spacing pattern). The
 * tab bar lives in .hub__module ABOVE the .hub grid so the four core
 * cards stay direct grid children — the nth-child stagger choreography
 * is untouched (styles.css h1 gate). Testid hooks: tabs-module,
 * data-table-ledger (the cortex probe clicks the Data tab; the default
 * sweep is core — the table only exists after that click).
 *
 * 2.2.0 — THE PLAYGROUND BECOMES A CONSUMER OF ITS OWN PACKAGE. The Shed
 * anatomy it invented in 2.0.0 is now the official <SurfaceCard> /
 * <PageHero> exports (owner-mandated .sig-* classes), and the four
 * dashboard cards + the placeholders + the shared hero render through
 * them. styles.css DELETES the card/hero anatomy it used to own — the
 * package owns it; the composition layer keeps only what is genuinely
 * playground-local (the grid container, metric rows, buttons, stagger,
 * node elevation, the gateway <button>s). Telemetry wears its limits:
 * every ProgressBar carries a limitText caption, and the new members row
 * (170 / 200 on --sig-sky, 85% — the attendance ring's own ratio, coherent)
 * is the limit caption's third live use. The ring shows its value now
 * (showValue default true).
 *
 * 2.1.0 — TWO playground-layer moves, package frozen (safety diff vs
 * v2.0.0 is a release gate, tools/ frozen too):
 *
 *   1. TIMELINE BREATHING ROOM (styles.css, MEASURED): the sticky month
 *      headers crowded the first event node (probe-proven −1px overlap —
 *      the package's --tl-header-clearance reserves 68px while its own
 *      header slab renders 69px tall). The composition layer now grows
 *      the slab one --space-tight step and mirrors the growth into the
 *      group-first clearance; every group measures ≥16px clear.
 *
 *   2. THE MASTER INDEX — the hub becomes the "dashboard" VIEW of a
 *      state-based switcher: `type View` + a small HubLink renderer
 *      handed to <GlobalNav as={...}>. (The package's `as` contract is
 *      untouched — the details below are still load-bearing:)
 *
 *        · aria-current: GlobalNav only sets it on SELF-rendered plain
 *          anchors (plainAnchor = as === undefined). With a custom
 *          renderer the ROUTER owns active state — so HubLink owns it
 *          here: the factory closure (createHubLink) captures the
 *          activeHref and stamps aria-current="page" on the matching
 *          link.
 *        · onClick: the drawer hands its close callback to the renderer;
 *          HubLink composes it AFTER its own preventDefault — a custom
 *          renderer that swallowed onClick would strand the drawer open.
 *        · preventDefault: hash hrefs would otherwise trigger native
 *          fragment jumps/full reloads; the SPA switch is state-only.
 *
 *      Views: "dashboard", "index" (THE MASTER INDEX — three gateway
 *      cards), and "events"/"members"/"budget" placeholder modules that
 *      dogfood the package's <EmptyState> primitive inside a
 *      <SurfaceCard>. Default view stays "dashboard" so the cortex
 *      smoke finds the timeline on load.
 *
 * TIMELINE HYDRATION (1.5.1, still load-bearing): the dashboard mirrors
 * the owner's real integration — source data lives in HIS shape
 * (`mockEvents`: id, month, title, time, colorToken, iconName) and is
 * mapped to the package contract (`TimelineEvent`: date, category, icon) in
 * ONE explicit layer at the render boundary. ROOT CAUSE (SSR-probe
 * verified against the package): owner-shaped records passed straight
 * as TimelineEvent[] render an empty timeline (undefined `date` buckets
 * everything under one key with a textless header; undefined
 * `category` throws in SigBadge's token guard and unmounts the
 * timeline). The mapping layer below is why the nodes are alive.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, FormEvent, MouseEvent, ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  ThemeProvider,
  ToastProvider,
  GlobalNav,
  useToast,
  Input,
  TextArea,
  ToggleSwitch,
  Select,
  Checkbox,
  FormField,
  RadioCardGroup,
  PasswordInput,
  Button,
  EventTimeline,
  EventModal,
  useModal,
  ProgressBar,
  StatRing,
  SigBadge,
  SurfaceCard,
  PageHero,
  Tabs,
  DataTable,
  Callout,
  Avatar,
  AnnouncementBanner,
  Carousel,
  CarouselItem,
  ProseBlock,
  StatCard,
  ActionTile,
  AccordionCard,
  FlipCard,
  MatchupCard,
  ContentCard,
  ReferenceCard,
  TierCard,
  ProfileCard,
  ChronicleTimeline,
  BarChart,
  AreaChart,
  TimelineManager,
  CommandPalette,
  Breadcrumbs,
  Icon,
  isTypingTarget,
  SkeletonLine,
  SkeletonCard,
  SkeletonTableRow,
  type NavItem,
  type TimelineEvent,
  type DataTableColumn,
  type SigTokenName,
  type AccentToken,
  type ChronicleRelease,
  type GraphNode,
  type GraphEdge,
  type GraphEdgeSelection,
  type GraphPosition,
  type TimelineItem,
  type CommandEntry,
  type BreadcrumbItem,
} from "@edwyn/signature-style/react";
import { usePersistentState } from "./persistence.js";
import { buildStoredWorkspaceSnapshot } from "./snapshot.js";
import { SET_NAMES } from "./snippets.js";
import type { SetId } from "./snippets.js";
import { PALETTE } from "./palette.js";
import { useSigTheme } from "./use-sig-theme.js";
import { createLocalStorageRepository } from "./workspace-repository.js";
import type { WorkspaceRepository } from "./workspace-repository.js";
import { ShortcutModal } from "./components/ShortcutModal.js";
import { PatternStudioView } from "./components/PatternStudio.js";
import { ThemeCustomizer } from "./components/ThemeCustomizer.js";
import { CodexView } from "./components/CodexView.js";
import { GraphStudioView } from "./components/GraphStudio.js";
import type { NodePatch } from "./components/GraphStudio.js";

/** Every view the switcher knows. Default is "dashboard" (cortex contract).
 *  3.6.0 — THE 6-VIEW NAV MAP: the Workbench (the 12-column bento — the
 *  "Dashboard" nav label retires), the GRAPH STUDIO (the dedicated
 *  canvas/HUD/inspector view — the KnowledgeGraph leaves the planner
 *  tab), ANALYTICS & PLANNER (the charts + the Milestone Manager — the
 *  old "Graphs & Planner" tab, retitled and promoted), Pattern Studio,
 *  Master Index and AI Codex. Chronicle stays a REAL view (the memorial
 *  keeps its hash + palette command) but hands its nav slot to the
 *  Studio. The HubLink/hash mechanism is unchanged; only the map grows.
 */
type View =
  | "dashboard"
  | "graph"
  | "planner"
  | "studio"
  | "index"
  | "chronicle"
  | "codex";

/** The dashboard's Tabs modules (2.3.0) — id union + the Tabs contract.
 *  3.6.0: the "Graphs & Planner" module tab is RETIRED — its graph moved
 *  to the Graph Studio view, its charts + milestones to Analytics &
 *  Planner. */
type ModuleId = "core" | "data" | "forms";

const MODULE_TABS: Array<{ id: ModuleId; label: string }> = [
  { id: "core", label: "Core Dashboard" },
  { id: "data", label: "Data & Tables" },
  { id: "forms", label: "Form & Input Matrix" },
];

/** The workshop modules — nav destinations without a view yet (2.1.0).
 *  RETIRED 2.8.0: the five-view map replaced them with REAL views —
 *  the WorkshopView union and PLACEHOLDERS table died with them. */

const VIEW_HREFS: Record<View, string> = {
  dashboard: "#/dashboard",
  graph: "#/graph",
  planner: "#/planner",
  studio: "#/studio",
  index: "#/index",
  chronicle: "#/chronicle",
  codex: "#/codex",
};

/** href → view, the SPA routing table (kept explicit, no derivation). */
const HREF_TO_VIEW: Record<string, View> = {
  "#/dashboard": "dashboard",
  "#/graph": "graph",
  "#/planner": "planner",
  "#/studio": "studio",
  "#/index": "index",
  "#/chronicle": "chronicle",
  "#/codex": "codex",
};

/** Nav order per owner (3.6.0): the SIX views — Workbench, Graph Studio,
 *  Analytics & Planner, Pattern Studio, Master Index, AI Codex.
 *  Chronicle remains reachable (hash + palette command) but yields its
 *  nav slot to the Studio. */
const NAV_ITEMS: NavItem[] = [
  { href: VIEW_HREFS.dashboard, label: "Workbench" },
  { href: VIEW_HREFS.graph, label: "Graph Studio" },
  { href: VIEW_HREFS.planner, label: "Analytics & Planner" },
  { href: VIEW_HREFS.studio, label: "Pattern Studio" },
  { href: VIEW_HREFS.index, label: "Index" },
  { href: VIEW_HREFS.codex, label: "AI Codex" },
];

/**
 * The shared hero speaks per view: THE ENGINE on the workbench, THE
 * GRAPH STUDIO in the canvas, ANALYTICS & PLANNER on the planning deck,
 * THE PATTERN STUDIO in the studio, THE MASTER INDEX at the index, THE
 * CHRONICLE on the memorial, THE AI CODEX in the codex.
 */
const HERO_COPY: Record<View, { title: string; sub: string }> = {
  dashboard: {
    title: "THE ENGINE",
    sub: "the workbench — every primitive, one live bento",
  },
  graph: {
    title: "THE GRAPH STUDIO",
    sub: "nodes, links & the inspector · one canvas",
  },
  planner: {
    title: "ANALYTICS & PLANNER",
    sub: "charts and milestones · the planning deck",
  },
  studio: {
    title: "THE PATTERN STUDIO",
    sub: "seven sets · fifty-six patterns · one-click copy",
  },
  index: {
    title: "THE MASTER INDEX",
    sub: "every archetype · one catalog · zero dead ends",
  },
  chronicle: {
    title: "THE CHRONICLE",
    sub: "twenty-three releases · one signature",
  },
  codex: {
    title: "THE AI CODEX",
    sub: "tokens, rules & recipes · machine-readable",
  },
};

/**
 * HubLink — the playground's link renderer for <GlobalNav as={...}>.
 * Plain-anchor semantics with SPA behavior: preventDefault kills the
 * native fragment navigation, GlobalNav's own onClick (drawer close)
 * still fires, onNavigate drives the state switch, and aria-current is
 * stamped HERE because GlobalNav only self-annotates plain anchors.
 */
interface HubLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  onNavigate: (href: string) => void;
  activeHref: string;
}

function HubLink({ href, className, children, onClick, onNavigate, activeHref }: HubLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onClick?.(event);
    onNavigate(href);
  };
  return (
    <a
      href={href}
      className={className}
      onClick={handleClick}
      aria-current={href === activeHref ? "page" : undefined}
    >
      {children}
    </a>
  );
}

/** The props GlobalNav actually spreads onto a custom renderer (nav.tsx). */
interface BridgeLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * THE FACTORY — GlobalNav's `as` receives only { href, className,
 * children, onClick? }, so onNavigate/activeHref reach HubLink through
 * this closure (the adapter lives in the playground; the package's
 * ElementType contract stays untouched). Rebuilt per view via useMemo —
 * the active stamp must track the current view.
 */
function createHubLink(onNavigate: (href: string) => void, activeHref: string) {
  return function HubLinkBridge({ href, className, children, onClick }: BridgeLinkProps) {
    return (
      <HubLink
        href={href}
        className={className}
        onClick={onClick}
        onNavigate={onNavigate}
        activeHref={activeHref}
      >
        {children}
      </HubLink>
    );
  };
}

/**
 * The taxonomy display order (2.9.0) — the command palette's studio
 * jump commands map over it; PatternStudio keeps its own copy
 * for the sidebar (same ids, same order). 3.4.0: Set 07 joins — the
 * Web Components (zero-react) mini-set.
 */
const SET_ORDER: ReadonlyArray<SetId> = ["01", "02", "03", "04", "05", "06", "07"];

/**
 * downloadJson — the workspace-snapshot download dance (the v2.7.0
 * contract, one shared helper): Blob → object URL → anchor click →
 * revoke immediately. The command palette AND the Milestone Manager
 * toolbar both land here.
 */
function downloadJson(text: string, filename: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/**
 * ShortcutsDialog (2.9.0) — RETIRED in 3.6.0: the map grew into
 * playground/components/ShortcutModal.tsx (the "?" key, the full
 * shortcut table with kbd chips, the same scrim conventions).
 */

/**
 * The OWNER's source-data contract — the shape his records actually
 * arrive in (month/colorToken/iconName), kept byte-honest: mockEvents is
 * NOT a TimelineEvent array. Every entry carries all six required fields;
 * optional `description` feeds the <EventModal> About row. Icon names are
 * strict lucide keys (gate-verified against the live icons map — a typo
 * fails `verify:playground` (h3), not a blank node at runtime).
 */
interface MockEvent {
  id: string;
  month: string;
  title: string;
  time: string;
  colorToken: TimelineEvent["category"];
  iconName: NonNullable<TimelineEvent["icon"]>;
  description?: string;
}

export const mockEvents: MockEvent[] = [
  {
    id: "evt-001",
    month: "December 2026",
    title: "Design walkthrough",
    time: "18:00",
    colorToken: "--sig-mauve-bright",
    iconName: "MapPin",
    description:
      "Walk the component gallery with the team: the stage, the build lane, and the demo corner. Bring the layout sketch.",
  },
  {
    id: "evt-002",
    month: "December 2026",
    title: "CI dry run",
    time: "19:30",
    colorToken: "--sig-sky",
    // NOT "Music" — that key does not exist in the installed lucide-react
    // 1.72.0 icons map (gate-probed); "AudioLines" is the live-map-valid
    // equivalent, verified by the (h3) icon gate.
    iconName: "AudioLines",
  },
  {
    id: "evt-003",
    month: "December 2026",
    title: "Design review",
    time: "13:00",
    colorToken: "--sig-peach",
    iconName: "Utensils",
    description:
      "Three theme candidates. Confirm the dark palette travels well and lock the accent choice.",
  },
  {
    id: "evt-004",
    month: "January 2027",
    title: "Beta announcements",
    time: "09:00",
    colorToken: "--sig-pink-bright",
    iconName: "MailOpen",
    description:
      "Paper docs for the archive, digital for everyone else. Feedback window closes January 24.",
  },
  {
    id: "evt-005",
    month: "January 2027",
    title: "Final QA pass",
    time: "17:00",
    colorToken: "--sig-green",
    iconName: "ClipboardCheck",
  },
  {
    id: "evt-006",
    month: "February 2027",
    title: "Public Release v3.1",
    time: "16:00",
    colorToken: "--sig-lavender",
    iconName: "Rocket",
    description:
      "Code freeze at four, deploy at six. The timeline ends where the launch begins.",
  },
];

/**
 * Short category words for the badge, derived from the owner's
 * colorToken so his records stay untouched by presentation concerns.
 */
const CATEGORY_LABELS: Record<TimelineEvent["category"], string> = {
  "--sig-pink-bright": "Docs",
  "--sig-pink-soft": "Members",
  "--sig-pink-alt": "Theme",
  "--sig-mauve-bright": "Infra",
  "--sig-mauve-soft": "Admin",
  "--sig-lavender": "Release",
  "--sig-sky": "Telemetry",
  "--sig-cobalt": "Tooling", /* 3.0.0: blue retired — cobalt carries the value */
  "--sig-peach": "Reviews",
  "--sig-green": "Attendance",
  "--sig-yellow": "Meter",
};

/**
 * THE MAPPING LAYER — the one place where the owner's source contract
 * meets the package contract. `month → date`, `colorToken → category`,
 * `iconName → icon`. 1.5.0's root cause was this layer not existing:
 * `date`/`category`/`icon` came through undefined and the timeline
 * rendered empty headers with no events.
 */
export const events: TimelineEvent[] = mockEvents.map((e) => ({
  id: e.id,
  date: e.month,
  time: e.time,
  title: e.title,
  category: e.colorToken,
  categoryLabel: CATEGORY_LABELS[e.colorToken],
  icon: e.iconName,
  ...(e.description !== undefined && { description: e.description }),
}));

/* ==========================================================================
   LIVE STATE (2.5.0) — the one array the bento reacts to.
   SEED_MEMBERS is the ledger's opening state; every allocation APPENDS to
   it, and every live read (ledger rows, Confirmed Seats StatCard, the
   attendance ring, the budget bars) is a useMemo derivative. STATE → DERIVED
   → WIRING lives in DashboardView → BentoCore below.

   2.7.0 PERSISTENCE SEEDS — the Graphs & Planner module's two
   usePersistentState arrays (the Excalidraw/tldraw pattern: the seed
   is the FIRST state; localStorage mirrors it; reload restores it;
   Reset removes the keys and the seeds return).
   ========================================================================== */

/** One member in the live ledger. Attendance is the three-word contract. */
interface Member {
  id: string;
  name: string;
  attendance: "confirmed" | "pending" | "declined";
  allocation: number;
}

/** The ledger's opening five — the v2.3.0 crew, now typed and live. */
const SEED_MEMBERS: Member[] = [
  { id: "g-001", name: "Ana Souza", attendance: "confirmed", allocation: 120 },
  { id: "g-002", name: "Leo Martins", attendance: "pending", allocation: 0 },
  { id: "g-003", name: "Priya Nair", attendance: "confirmed", allocation: 200 },
  { id: "g-004", name: "Tom Weller", attendance: "declined", allocation: 0 },
  { id: "g-005", name: "Nina Almeida", attendance: "pending", allocation: 120 },
];

/** The workbench's two fixed denominators (the metrics' limit captions). */
const TOTAL_BUDGET = 2000;
const SEAT_CAPACITY = 200;

/**
 * SEED_GRAPH (2.7.0; 3.0.0 chromatic categories) — the knowledge
 * graph's opening shape: the root plus three connected workstream
 * notes wearing VARIED CHROMATIC tokens (azure/tangerine/pink — the
 * 3.0.0 fill/series accents on the node rings). Every node carries a
 * note so the footer inspect strip has something to say.
 */
const SEED_GRAPH: GraphNode[] = [
  {
    id: "kg-root",
    label: "Core Engine",
    categoryToken: "--sig-lavender",
    note: "The engine root — every branch is one layer.",
  },
  {
    id: "kg-tokens",
    label: "Token Layer",
    parentId: "kg-root",
    categoryToken: "--sig-azure",
    note: "Every color maps to the official palette — nothing invented.",
  },
  {
    id: "kg-layout",
    label: "Layout Grid",
    parentId: "kg-root",
    categoryToken: "--sig-tangerine",
    note: "The 12-column bento and the 8px rhythm hold every view.",
  },
  {
    id: "kg-state",
    label: "State Persistence",
    parentId: "kg-root",
    categoryToken: "--sig-pink-bright",
    note: "Reload survives, Reset restores — the workspace contract.",
  },
];

/**
 * SEED_TIMELINE (2.7.0) — the milestone manager's opening five, two of
 * them settled (the counter reads "2 / 5 Settled" on first paint).
 */
const SEED_TIMELINE: TimelineItem[] = [
  {
    id: "tm-001",
    date: "November 2026",
    title: "Architecture Freeze",
    category: "--sig-mauve-bright",
    categoryLabel: "Infra",
    settled: true,
  },
  {
    id: "tm-002",
    date: "November 2026",
    title: "Accessibility Audit",
    category: "--sig-peach",
    categoryLabel: "Reviews",
    settled: true,
  },
  {
    id: "tm-003",
    date: "December 2026",
    title: "Security Review",
    category: "--sig-pink-bright",
    categoryLabel: "Docs",
  },
  {
    id: "tm-004",
    date: "December 2026",
    title: "Public Release v3.1",
    category: "--sig-lavender",
    categoryLabel: "Release",
  },
  {
    id: "tm-005",
    date: "January 2027",
    title: "Token Sweep",
    category: "--sig-green",
    categoryLabel: "Attendance",
  },
];

/** The Spending by Department bars — four bars, four DIFFERENT chromatic
 *  tokens (3.0.0: cobalt/cyan/mint/tangerine — the multi-token series). */
const SPENDING_BARS = [
  { label: "Engineering", value: 800, max: 1000, colorToken: "--sig-cobalt" },
  { label: "Infrastructure", value: 620, max: 900, colorToken: "--sig-tangerine" },
  { label: "Design", value: 240, max: 400, colorToken: "--sig-cyan" },
  { label: "Tooling", value: 450, max: 600, colorToken: "--sig-mint" },
] as const;

/** The Attendance Momentum series — eight weekly samples, sky. */
const ATTENDANCE_MOMENTUM = [
  { label: "W1", value: 12 },
  { label: "W2", value: 18 },
  { label: "W3", value: 26 },
  { label: "W4", value: 41 },
  { label: "W5", value: 55 },
  { label: "W6", value: 82 },
  { label: "W7", value: 104 },
  { label: "W8", value: 128 },
] as const;

/** Radio choice → ledger word (the RadioCardGroup submits the left key). */
const ATTENDANCE_TO_STATE: Record<string, Member["attendance"]> = {
  confirmed: "confirmed",
  pending: "pending",
  declined: "declined",
};

const ATTENDANCE_LABELS: Record<Member["attendance"], string> = {
  confirmed: "Confirmed",
  pending: "Pending",
  declined: "Declined",
};

/** The live ledger's columns — Contribution numeric + align right. */
const BENTO_LEDGER_COLUMNS: DataTableColumn[] = [
  { key: "member", header: "Member" },
  { key: "attendance", header: "Attendance" },
  { key: "share", header: "Allocation", numeric: true, align: "right" },
];

/** The async-load simulation window (2.9.1) — 800ms of skeleton, then restore. */
const SIM_LOADING_MS = 800;

/**
 * SimSlot (2.9.1) — the CLS lock around one bento card's body. Swapping
 * real content for <SkeletonCard /> changes the card's natural height,
 * and one moved card moves the whole 12-column grid (every row
 * reflows). The lock: BentoCore measures each slot's exact footprint
 * BEFORE the swap; during the window the slot renders the skeleton
 * inside an explicit height equal to the measured footprint (overflow
 * hidden), so every card container's bounding rect is identical BEFORE,
 * DURING and AFTER — CLS 0 by construction. The probe that proves it
 * lives in playground/probe-skeleton-cls.mjs (release blocker).
 */
function SimSlot({
  id,
  loading,
  height,
  bindRef,
  children,
}: {
  id: string;
  loading: boolean;
  height: number | undefined;
  bindRef: (slotId: string, el: HTMLDivElement | null) => void;
  children: ReactNode;
}) {
  return (
    <div
      ref={(el) => bindRef(id, el)}
      data-sim-slot={id}
      style={loading && height !== undefined ? { height: `${height}px`, overflow: "hidden" } : undefined}
    >
      {children}
    </div>
  );
}

/**
 * THE FULL CHROMATIC PALETTE moved to playground/palette.ts (3.6.0) —
 * the Graph Studio inspector and the bento share ONE table without an
 * App ↔ GraphStudio import cycle.
 */

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Shell />
      </ToastProvider>
    </ThemeProvider>
  );
}

/**
 * THE SHELL — view state + the always-visible chrome (nav + topbar +
 * hero), then the per-view body. The default view stays "dashboard" so
 * the cortex smoke finds the timeline on load.
 *
 * 2.9.0 POWER-USER CHROME: the hub__topbar renders the view's
 * Breadcrumbs (Shed-style mono path) beside the command-palette
 * trigger (⌘K kbd badge); <CommandPalette> (controlled — this Shell
 * owns `open`) portals over everything with the full command list:
 * the five views, the six Pattern Studio sets (studioSet is LIFTED
 * here so commands can jump straight into a set), Export Workspace
 * JSON, the reduced-motion preview toggle, the keyboard-shortcuts
 * dialog, and the llms.txt URL copy.
 */
function Shell() {
  const toast = useToast();
  // 3.4.0 — DEEP-LINK BOOTSTRAP: a cold load HONORS the location hash, so
  // the cortex (and any consumer) can land straight on a view — #/studio
  // mounts the Pattern Studio with the zero-react Set 07 frames. The
  // in-app switch stays STATE-ONLY (the HubLink preventDefault contract
  // is untouched) — only this INITIAL state reads the hash.
  const [view, setView] = useState<View>(
    () => HREF_TO_VIEW[window.location.hash] ?? "dashboard",
  );
  // 3.6.0 — THE WORKSPACE + THE REPOSITORY REHEARSAL: one hook owns the
  // persisted sig.workspace.v3.* arrays; writes ALSO ride the
  // WorkspaceRepository adapter (the latency toggle simulates the async
  // backend — skeletons in the affected cards, error toasts on invalid
  // payloads; swap the adapter for FastAPI when the backend ships).
  const [latencySim, setLatencySim] = useState(false);
  const workspaceRepo = useMemo<WorkspaceRepository>(
    () => createLocalStorageRepository({ latencyMs: latencySim ? 600 : 0 }),
    [latencySim],
  );
  // 3.2.0 — THE LIVE THEME STATE: one useSigTheme owns the surface theme +
  // radius (documentElement mirror + persistence + the contrast badges).
  // The customizer panel (Pattern Studio) and the palette commands below
  // share this instance — there is never a second writer.
  const sig = useSigTheme(workspaceRepo);
  const workspace = useWorkspaceState(workspaceRepo);
  // The studio's set filter, LIFTED — the command palette jumps into a
  // set directly (the studio renders controlled).
  const [studioSet, setStudioSet] = useState<SetId | "all">("all");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  // 3.6.0 — THE "?" KEY: the keyboard map opens from anywhere (the
  // v2.9.0 typing-target guard applies — a "?" typed into an input is a
  // character, not a command; the palette's own input included).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "?") return;
      if (isTypingTarget(event.target)) return;
      setShortcutsOpen((current) => !current);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  const navigate = useCallback((href: string) => setView(HREF_TO_VIEW[href] ?? "dashboard"), []);
  // 2.9.1 THE SIM RUNNER REGISTRY — BentoCore registers its measuring
  // runner HERE (imperative by design: the refs live where the slots
  // render, the triggers live in the Shell). The palette command and the
  // Input Matrix button both land on the same runner; a cross-view run
  // navigates home and defers one frame so the freshly mounted BentoCore
  // has registered by the time the rAF callback fires.
  const simRunnerRef = useRef<(() => void) | null>(null);
  const registerSimRunner = useCallback((runner: (() => void) | null) => {
    simRunnerRef.current = runner;
  }, []);
  const triggerAsyncSim = useCallback(() => {
    navigate(VIEW_HREFS.dashboard);
    requestAnimationFrame(() => simRunnerRef.current?.());
  }, [navigate]);
  // Rebuilt per view — the closure stamps aria-current on the ACTIVE link.
  const navLink = useMemo(() => createHubLink(navigate, VIEW_HREFS[view]), [navigate, view]);
  const hero = HERO_COPY[view];

  // THE PATH — the topbar breadcrumbs speak per view (Shed mono style).
  const topbarCrumbs = useMemo<BreadcrumbItem[]>(() => {
    const engine: BreadcrumbItem = { label: "engine", href: VIEW_HREFS.dashboard };
    if (view === "studio") {
      const crumbs: BreadcrumbItem[] = [
        engine,
        { label: "pattern-studio", href: VIEW_HREFS.studio },
      ];
      return studioSet === "all"
        ? [engine, { label: "pattern-studio" }]
        : [...crumbs, { label: `set-${studioSet}` }];
    }
    if (view === "graph") return [engine, { label: "graph-studio" }];
    if (view === "planner") return [engine, { label: "analytics-planner" }];
    if (view === "index") return [engine, { label: "master-index" }];
    if (view === "chronicle") return [engine, { label: "chronicle" }];
    if (view === "codex") return [engine, { label: "ai-codex" }];
    return [engine, { label: "workbench" }];
  }, [view, studioSet]);

  // The reduced-motion PREVIEW override — data-motion="reduced" on
  // documentElement (styles.css collapses every transition/animation to
  // the 0.01ms floor). A preview switch, distinct from the user's OS
  // prefers-reduced-motion setting, which is never touched.
  const toggleReducedMotionPreview = useCallback(() => {
    const rootEl = document.documentElement;
    const wasOn = rootEl.dataset.motion === "reduced";
    if (wasOn) delete rootEl.dataset.motion;
    else rootEl.dataset.motion = "reduced";
    toast(
      "success",
      wasOn
        ? "Reduced-motion preview off — full motion restored."
        : "Reduced-motion preview on — motion collapsed to the floor.",
    );
  }, [toast]);

  // The codex manifest URL — copy, never navigate (the palette runs it).
  const copyLlmsUrl = useCallback(() => {
    const url = new URL("llms.txt", window.location.href);
    navigator.clipboard
      .writeText(url.toString())
      .then(() => toast("success", "llms.txt URL copied — feed it to your agent."))
      .catch(() => toast("error", "Clipboard unavailable — the manifest lives at /llms.txt"));
  }, [toast]);

  // 3.2.0 — the theme runtime's download/copy dances, with toast feedback.
  const downloadThemeCss = useCallback(() => {
    sig.downloadTokensCss();
    toast("success", "tokens.css downloaded — the active theme's resolved :root block.");
  }, [sig, toast]);
  const copyThemeCss = useCallback(() => {
    sig
      .copyTokensCss()
      .then((ok) =>
        toast(
          ok ? "success" : "error",
          ok
            ? "CSS variables copied — the active theme's :root block is on your clipboard."
            : "Clipboard unavailable — run Download tokens.css instead.",
        ),
      );
  }, [sig, toast]);

  // THE COMMAND LIST — views, studio sets, workspace, motion, help, codex.
  const commands = useMemo<CommandEntry[]>(() => [
    { id: "view-dashboard", label: "Go to Workbench", keywords: "view engine bento workbench live dashboard", icon: "Gauge", hint: "view", run: () => navigate(VIEW_HREFS.dashboard) },
    { id: "view-graph", label: "Go to Graph Studio", keywords: "view graph studio canvas nodes links inspector", icon: "Waypoints", hint: "view", run: () => navigate(VIEW_HREFS.graph) },
    { id: "view-planner", label: "Go to Analytics & Planner", keywords: "view analytics planner charts milestones timeline", icon: "ChartColumn", hint: "view", run: () => navigate(VIEW_HREFS.planner) },
    { id: "view-studio", label: "Go to Pattern Studio", keywords: "view catalog patterns sets copy", icon: "Shapes", hint: "view", run: () => navigate(VIEW_HREFS.studio) },
    { id: "view-index", label: "Go to Master Index", keywords: "view catalog archetypes doors", icon: "LayoutGrid", hint: "view", run: () => navigate(VIEW_HREFS.index) },
    { id: "view-chronicle", label: "Go to Chronicle", keywords: "view versions memorial night releases", icon: "Map", hint: "view", run: () => navigate(VIEW_HREFS.chronicle) },
    { id: "view-codex", label: "Go to AI Codex", keywords: "view tokens rules recipes agents", icon: "Terminal", hint: "view", run: () => navigate(VIEW_HREFS.codex) },
    ...SET_ORDER.map((id) => ({
      id: `set-${id}`,
      label: `Studio: Set ${id} · ${SET_NAMES[id]}`,
      keywords: `pattern set ${id} jump studio ${SET_NAMES[id]}`,
      icon: "Shapes" as const,
      hint: `set ${id}`,
      run: () => {
        setStudioSet(id);
        navigate(VIEW_HREFS.studio);
      },
    })),
    {
      id: "export-workspace",
      label: "Export signature-workspace.json",
      keywords: "snapshot download save backup budget workspace json export links graph timeline",
      icon: "Download",
      run: () => {
        downloadJson(buildStoredWorkspaceSnapshot(), "signature-workspace.json");
        toast("success", "Workspace snapshot exported — signature-workspace.json (graph + timeline + links).");
      },
    },
    {
      id: "toggle-latency",
      label: "Toggle 600ms latency",
      keywords: "latency async slow network simulate repository skeleton workspace",
      icon: "Timer",
      hint: latencySim ? "on" : "dev",
      run: () => {
        setLatencySim((current) => !current);
        toast(
          "success",
          latencySim
            ? "Latency simulation off — workspace saves are instant again."
            : "Latency simulation on — workspace saves now take 600ms (watch the skeletons).",
        );
      },
    },
    {
      id: "toggle-reduced-motion",
      label: "Toggle Reduced Motion Preview",
      keywords: "motion accessibility animation preview reduce",
      icon: "Accessibility",
      run: toggleReducedMotionPreview,
    },
    {
      id: "open-shortcuts",
      label: "Open Keyboard Shortcuts",
      keywords: "keyboard help keys dialog shortcuts",
      icon: "Keyboard",
      run: () => setShortcutsOpen(true),
    },
    {
      id: "copy-llms-url",
      label: "Copy Codex llms.txt URL",
      keywords: "codex llms url copy manifest agents",
      icon: "Copy",
      run: copyLlmsUrl,
    },
    {
      id: "simulate-async-load",
      label: "Simulate Async Load (800ms)",
      keywords: "skeleton loading async cls placeholder simulate",
      icon: "Hourglass",
      hint: "dev",
      run: triggerAsyncSim,
    },
    // 3.2.0 — THE SURFACE ENGINE: themes, radius, tokens.css export.
    {
      id: "theme-mocha",
      label: "Theme: Mocha",
      keywords: "theme surface mocha dark default catppuccin",
      icon: "Palette",
      hint: sig.theme === "mocha" ? "active" : "theme",
      run: () => sig.setTheme("mocha"),
    },
    {
      id: "theme-oled",
      label: "Theme: OLED",
      keywords: "theme surface oled true black oled dark",
      icon: "Moon",
      hint: sig.theme === "oled" ? "active" : "theme",
      run: () => sig.setTheme("oled"),
    },
    {
      id: "theme-daylight",
      label: "Theme: Daylight",
      keywords: "theme surface daylight light high contrast",
      icon: "Sun",
      hint: sig.theme === "daylight" ? "active" : "theme",
      run: () => sig.setTheme("daylight"),
    },
    {
      id: "radius-standard",
      label: "Radius: Standard",
      keywords: "radius geometry standard 8px 12px rounded",
      icon: "Frame",
      hint: sig.radius === "standard" ? "active" : "radius",
      run: () => sig.setRadius("standard"),
    },
    {
      id: "radius-sharp",
      label: "Radius: Sharp",
      keywords: "radius geometry sharp brutalist 0px square",
      icon: "Square",
      hint: sig.radius === "sharp" ? "active" : "radius",
      run: () => sig.setRadius("sharp"),
    },
    {
      id: "download-tokens-css",
      label: "Download tokens.css",
      keywords: "theme tokens css download export customizer variables",
      icon: "Download",
      run: downloadThemeCss,
    },
    {
      id: "copy-css-variables",
      label: "Copy CSS Variables",
      keywords: "theme tokens css copy clipboard customizer variables",
      icon: "Copy",
      run: copyThemeCss,
    },
  ], [navigate, toast, toggleReducedMotionPreview, copyLlmsUrl, triggerAsyncSim, sig, downloadThemeCss, copyThemeCss, latencySim]);

  return (
    <>
      <GlobalNav items={NAV_ITEMS} as={navLink} activeHref={VIEW_HREFS[view]} />
      {/* 2.5.0 — THE SHELL: every view's content lives inside this
          column (hero + dashboard + index + placeholders + ALL tab
          modules). GlobalNav stays outside — it is its own bar. This
          wrapper is defect #1's tombstone. */}
      <div className="sig-shell">
        {/* 2.9.0 — THE TOPBAR: breadcrumbs + the ⌘K trigger. */}
        <div className="hub__topbar">
          <Breadcrumbs items={topbarCrumbs} label="You are here" />
          <button
            type="button"
            className="hub__cmdbar-trigger"
            data-testid="palette-trigger"
            onClick={() => setPaletteOpen(true)}
          >
            Commands
            <kbd className="sig-action-tile__kbd">⌘K</kbd>
          </button>
        </div>
        <PageHero title={hero.title} subtitle={hero.sub} />
        {view === "dashboard" ? (
          <DashboardView registerSimRunner={registerSimRunner} triggerSim={triggerAsyncSim} />
        ) : view === "graph" ? (
          <GraphStudioView
            graph={workspace.graph}
            links={workspace.links}
            positions={workspace.positions}
            saving={workspace.saving.graph === true}
            onUpdateNode={workspace.updateNode}
            onUnlinkEdge={workspace.unlinkEdge}
            onSpawnLinkedChild={workspace.spawnLinkedChild}
            onAutoArrange={workspace.autoArrange}
            onMoveNode={workspace.moveNode}
            onLinkNodes={workspace.linkNodes}
            onAddNodeAt={workspace.addNodeAt}
            onOpenShortcuts={() => setShortcutsOpen(true)}
            hudSlot={
              <button
                type="button"
                className="graph-studio__latency"
                aria-pressed={latencySim}
                data-testid="studio-latency"
                onClick={() => {
                  setLatencySim((current) => !current);
                  toast(
                    "success",
                    latencySim
                      ? "Latency simulation off — workspace saves are instant again."
                      : "Latency simulation on — workspace saves now take 600ms (watch the skeletons).",
                  );
                }}
              >
                Simulate 600ms latency
              </button>
            }
          />
        ) : view === "planner" ? (
          <AnalyticsPlannerView workspace={workspace} />
        ) : view === "index" ? (
          <IndexView onNavigate={navigate} />
        ) : view === "studio" ? (
          <PatternStudioView
            activeSet={studioSet}
            onSetChange={setStudioSet}
            customizer={
              <ThemeCustomizer
                theme={sig.theme}
                radius={sig.radius}
                onThemeChange={sig.setTheme}
                onRadiusChange={sig.setRadius}
                badges={sig.badges}
                onDownload={sig.downloadTokensCss}
                onCopy={sig.copyTokensCss}
                onCopySnippet={sig.copyThemeSnippet}
              />
            }
          />
        ) : view === "chronicle" ? (
          <ChronicleView />
        ) : (
          <CodexView />
        )}
      </div>
      {/* 2.9.0 — THE COMMAND PALETTE (controlled: open lives HERE). */}
      <CommandPalette
        commands={commands}
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onOpen={() => setPaletteOpen(true)}
      />
      {shortcutsOpen && <ShortcutModal onClose={() => setShortcutsOpen(false)} />}
      {/* 2.9.0 — THE CONTAINER-QUERY PROOF FIXTURE (the release blocker's
          stage, off-screen but LAID OUT). The SAME MatchupCard, StatCard
          and ContentCard render inside a 280px .sig-cell and a 900px
          .sig-cell; the release probe asserts the computed layouts
          genuinely differ (matchup grid-template-columns, stat-card
          display, content-card column count). aria-hidden: it is a
          measuring instrument, not content. */}
      <div
        className="hub__cq-probe"
        aria-hidden="true"
        data-testid="cq-probe"
        /* 3.6.0 a11y: aria-hidden alone still left the probe's inner
           buttons/dots focusable (axe aria-hidden-focus, serious). The
           ref sets `inert` (React 18 has no inert prop — React 19
           would take inert={true}) so the fixture leaves BOTH the
           a11y tree AND the tab order. Inert does not affect layout —
           the container-query measurements are untouched. */
        ref={(el) => {
          if (el !== null) el.inert = true;
        }}
      >
        <div className="hub__cq-narrow sig-cell">
          <MatchupCard
            left={{ name: "Ana Souza", ringToken: "--sig-mauve-soft" }}
            right={{ name: "Leo Martins", ringToken: "--sig-sky" }}
          />
          <StatCard
            label="Confirmed Seats"
            value="170"
            sparklineData={[118, 126, 132, 141, 158, 170]}
            colorToken="--sig-sky"
          />
          <ContentCard
            category="Catering"
            categoryToken="--sig-peach"
            meta={["25 MIN", "SPICY", "$14"]}
            accentToken="--sig-yellow"
            title="Birria & Street Taco Catering"
            description="Slow-braised birria, consomé on the side."
            action={{ label: "Book the taco cart" }}
          />
          {/* The 2.9.0 skeletons ride the fixture too — the reduced-motion
              probe asserts their shimmer stands down on a live element. */}
          <SkeletonLine width="60%" />
          <SkeletonCard />
          <table>
            <tbody>
              <SkeletonTableRow columns={3} />
            </tbody>
          </table>
        </div>
        <div className="hub__cq-wide sig-cell">
          <MatchupCard
            left={{ name: "Ana Souza", ringToken: "--sig-mauve-soft" }}
            right={{ name: "Leo Martins", ringToken: "--sig-sky" }}
          />
          <StatCard
            label="Confirmed Seats"
            value="170"
            sparklineData={[118, 126, 132, 141, 158, 170]}
            colorToken="--sig-sky"
          />
          <ContentCard
            category="Catering"
            categoryToken="--sig-peach"
            meta={["25 MIN", "SPICY", "$14"]}
            accentToken="--sig-yellow"
            title="Birria & Street Taco Catering"
            description="Slow-braised birria, consomé on the side."
            action={{ label: "Book the taco cart" }}
          />
        </div>
      </div>
    </>
  );
}

/**
 * The dashboard — view state + THE LIVE LEDGER (2.5.0). The members
 * array lives HERE (above the module switch) so checking in survives
 * tab flips; the core module renders <BentoCore>, the data/forms
 * showcases render below it — ALL inside the shell (styles.css).
 */
function DashboardView({
  registerSimRunner,
  triggerSim,
}: {
  registerSimRunner: (runner: (() => void) | null) => void;
  triggerSim: () => void;
}) {
  const [moduleId, setModuleId] = useState<ModuleId>("core");
  // THE LIVE STATE — one array, every metric derives from it.
  const [members, setMembers] = useState<Member[]>(SEED_MEMBERS);
  const allocate = useCallback(
    (member: { name: string; attendance: Member["attendance"]; allocation: number }) => {
      setMembers((current) => [
        ...current,
        {
          id: `g-${String(current.length + 1).padStart(3, "0")}`,
          name: member.name,
          attendance: member.attendance,
          allocation: member.allocation,
        },
      ]);
    },
    [],
  );

  // 2.9.1 THE ASYNC-LOAD SIMULATION — state lives HERE, above the module
  // switch (the members pattern): a trigger fired from the Input Matrix
  // card survives the flip back to core. BentoCore measures its slot
  // footprints and hands the table up through onSimStart; the 800ms
  // window and its timer live here so they survive tab flips too.
  const [simLoading, setSimLoading] = useState(false);
  const [simLocked, setSimLocked] = useState<Record<string, number>>({});
  const simTimer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (simTimer.current !== null) window.clearTimeout(simTimer.current);
    },
    [],
  );
  const onSimStart = useCallback((measured: Record<string, number>) => {
    setSimLocked(measured);
    setSimLoading(true);
    if (simTimer.current !== null) window.clearTimeout(simTimer.current);
    simTimer.current = window.setTimeout(() => {
      setSimLoading(false);
      setSimLocked({});
    }, SIM_LOADING_MS);
  }, []);

  return (
    <>
      <div className="hub__module" data-testid="tabs-module">
        <Tabs
          label="Dashboard modules"
          tabs={MODULE_TABS}
          activeId={moduleId}
          // Tabs.onChange hands back the raw string id; the playground
          // owns the narrower ModuleId union and narrows here (the only
          // ids reachable are the ones MODULE_TABS declared).
          onChange={(id) => setModuleId(id as ModuleId)}
        />
      </div>
      {moduleId === "data" ? (
        <div className="hub__tabs-content">
          <DataModule />
        </div>
      ) : moduleId === "forms" ? (
        <div className="hub__tabs-content">
          <FormsModule onSimulate={triggerSim} />
        </div>
      ) : (
        <div className="hub__tabs-content">
          <BentoCore
            members={members}
            onAllocate={allocate}
            simLoading={simLoading}
            simLocked={simLocked}
            onSimStart={onSimStart}
            registerSimRunner={registerSimRunner}
          />
        </div>
      )}
    </>
  );
}

/**
 * BENTOCORE — the 12-column bento (2.5.0, defect #5). THE ASSEMBLY,
 * explicit spans (grid-column: span N):
 *
 *   span 12  the v2.5.0 announcement banner
 *   span 4   StatCard ×3 — Total Budget / Confirmed Seats (LIVE) /
 *            Active Game Rooms
 *   span 5   Workspace Member & Resource Allocation (the live-validation form)
 *   span 4   The Chronology, ROW-SPAN 2 (timeline + modal, unchanged)
 *   span 3   Budget & Attendance Telemetry (ring + bars, LIVE)
 *   span 5   Interactive Deck & Rules (FlipCard / AccordionCard /
 *            ActionTile row)
 *   span 3   The Chromatic Palette (unchanged badges)
 *   span 7   Member & Budget Ledger (DataTable, LIVE from state)
 *   span 5   1v1 Game Matchup & Editorial (MatchupCard + ProseBlock)
 *
 * DERIVED (useMemo over members): confirmedCount, potTotal (sum of
 * CONFIRMED contributions), ringValue = confirmed/200 %, spentPct =
 * potTotal/2000 %, ledgerRows (formatted for DataTable).
 */
function BentoCore({
  members,
  onAllocate,
  simLoading,
  simLocked,
  onSimStart,
  registerSimRunner,
}: {
  members: Member[];
  onAllocate: (member: { name: string; attendance: Member["attendance"]; allocation: number }) => void;
  simLoading: boolean;
  simLocked: Record<string, number>;
  onSimStart: (measured: Record<string, number>) => void;
  registerSimRunner: (runner: (() => void) | null) => void;
}) {
  const toast = useToast();
  const modal = useModal<TimelineEvent>();
  const [bannerVisible, setBannerVisible] = useState(true);

  // DERIVED — the single useMemo every live read consumes. Causal by
  // construction: it reads only the current members array.
  const derived = useMemo(() => {
    const confirmed = members.filter((member) => member.attendance === "confirmed");
    const confirmedCount = confirmed.length;
    const potTotal = confirmed.reduce((sum, member) => sum + member.allocation, 0);
    const ringValue = Math.min(100, Math.round((confirmedCount / SEAT_CAPACITY) * 100));
    const spentPct = Math.min(100, Math.round((potTotal / TOTAL_BUDGET) * 100));
    const ledgerRows = members.map((member) => ({
      member: member.name,
      attendance:
        member.attendance === "confirmed" ? (
          <SigBadge colorToken="--sig-green" label="Confirmed" />
        ) : (
          ATTENDANCE_LABELS[member.attendance]
        ),
      share: `$${member.allocation.toLocaleString("en-US")}`,
    }));
    return { confirmedCount, potTotal, ringValue, spentPct, ledgerRows };
  }, [members]);

  // 2.9.1 — the sim slot registry + the MEASURING runner. startAsyncSim
  // reads every SimSlot's CURRENT footprint (the real content is still
  // rendered at that instant — measurement always precedes the swap),
  // hands the table up to DashboardView's onSimStart, and the 800ms
  // window begins. One window at a time: a re-trigger mid-window is a
  // no-op. The runner registers through the Shell's registry so the
  // palette command and the Input Matrix button can fire it from
  // anywhere; cleanup deregisters (unmount while the Shell lives).
  const slotRefs = useRef(new Map<string, HTMLDivElement>());
  const bindSlotRef = useCallback((slotId: string, el: HTMLDivElement | null) => {
    if (el === null) slotRefs.current.delete(slotId);
    else slotRefs.current.set(slotId, el);
  }, []);
  const startAsyncSim = useCallback(() => {
    if (simLoading) return;
    const measured: Record<string, number> = {};
    slotRefs.current.forEach((el, slotId) => {
      measured[slotId] = el.getBoundingClientRect().height;
    });
    onSimStart(measured);
  }, [simLoading, onSimStart]);
  useEffect(() => {
    registerSimRunner(startAsyncSim);
    return () => registerSimRunner(null);
  }, [registerSimRunner, startAsyncSim]);

  return (
    <main className="bento12">
      {/* span 12 — the announcement banner */}
      {bannerVisible && (
        <div className="sig-span-12">
          <AnnouncementBanner
            variant="announcement"
            dismissible
            onDismiss={() => setBannerVisible(false)}
          >
            <span data-testid="banner-release">
              v2.7.0 — live state mode: allocate a seat and watch the
              ledger, ring, and toast react.
            </span>
          </AnnouncementBanner>
        </div>
      )}

      {/* span 4 ×3 — the KPI trio (the middle cell carries the trio's
          cortex hook; its value is LIVE). 2.9.0: every bento cell is a
          .sig-cell container — the StatCards dock their sparklines
          beside the metrics when the cell is ≥ 360px wide. */}
      <div className="sig-span-4 sig-cell">
        <StatCard
          label="Total Budget"
          value={`$${TOTAL_BUDGET.toLocaleString("en-US")}`}
          delta="+$440"
          deltaDirection="up"
          sparklineData={[1200, 1450, 1380, 1600, 1780, TOTAL_BUDGET]}
          colorToken="--sig-green"
        />
      </div>
      <div className="sig-span-4 sig-cell" data-testid="kpi-trio">
        <StatCard
          label="Confirmed Seats"
          value={String(derived.confirmedCount)}
          delta="live"
          sparklineData={[2, 3, 3, 4, 4, derived.confirmedCount]}
          colorToken="--sig-sky"
        />
      </div>
      <div className="sig-span-4 sig-cell">
        <StatCard
          label="Active Game Rooms"
          value="6"
          delta="+2"
          deltaDirection="up"
          sparklineData={[2, 3, 3, 4, 4, 6]}
          colorToken="--sig-mauve-soft"
        />
      </div>

      {/* span 5 — Workspace Member & Resource Allocation (live validation + Button) */}
      <SurfaceCard
        eyebrow="Forms"
        meta="components/forms.tsx"
        title="Workspace Member & Resource Allocation"
        interactive
        className="sig-span-5 sig-cell"
      >
        <SimSlot id="checkin" loading={simLoading} height={simLocked.checkin} bindRef={bindSlotRef}>
          {simLoading ? <SkeletonCard /> : <AllocationForm onAllocate={onAllocate} />}
        </SimSlot>
      </SurfaceCard>

      {/* span 4, ROW-SPAN 2 — The Chronology (timeline + modal) */}
      <SurfaceCard
        eyebrow="Timeline"
        meta="components/timeline.tsx"
        title="The Chronology"
        interactive
        className="sig-span-4 sig-row-2 hub__card--timeline"
      >
        <SimSlot id="chronology" loading={simLoading} height={simLocked.chronology} bindRef={bindSlotRef}>
          {simLoading ? (
            <SkeletonCard />
          ) : (
            <>
              <EventTimeline events={events} onEventSelect={modal.open} />
              {modal.selectedEvent !== null && (
                <EventModal
                  event={modal.selectedEvent}
                  open={modal.isOpen}
                  onClose={modal.close}
                />
              )}
            </>
          )}
        </SimSlot>
      </SurfaceCard>

      {/* span 3 — Budget & Attendance Telemetry (LIVE) */}
      <SurfaceCard
        eyebrow="Telemetry"
        meta="components/viz.tsx"
        title="Budget & Attendance Telemetry"
        interactive
        className="sig-span-3 sig-cell"
      >
        <SimSlot id="telemetry" loading={simLoading} height={simLocked.telemetry} bindRef={bindSlotRef}>
          {simLoading ? (
            <SkeletonCard />
          ) : (
            <>
          <div className="hub__metric" data-testid="metric-seats">
          <span className="hub__metric-label">Seats confirmed</span>
          <span className="hub__metric-value">
            {derived.confirmedCount} / {SEAT_CAPACITY}
          </span>
        </div>
        <ProgressBar
          value={derived.ringValue}
          colorToken="--sig-sky"
          label="Seats confirmed"
          limitText={`${derived.confirmedCount} / ${SEAT_CAPACITY} Seats`}
        />
        <div className="hub__metric" data-testid="metric-attendance">
          <span className="hub__metric-label">Attendance ratio</span>
          <span className="hub__metric-value">{derived.ringValue}%</span>
        </div>
        {/* LIVE RING — the stroke-dashoffset glides via the
            playground-scoped rule (styles.css); 3.0.0: the ring is
            zoomable (total + unit → the expandable detail strip:
            "85% · 170 / 200 Seats" on click). */}
        <div data-testid="ring-attendance">
          <StatRing
            value={derived.ringValue}
            colorToken="--sig-sky"
            label="Attendance ratio"
            total={SEAT_CAPACITY}
            unit="Seats"
          />
        </div>
        <div className="hub__metric" data-testid="metric-budget-spent">
          <span className="hub__metric-label">Budget spent</span>
          <span className="hub__metric-value">{derived.spentPct}%</span>
        </div>
        <ProgressBar
          value={derived.spentPct}
          colorToken="--sig-peach"
          label="Budget spent"
          limitText={`$${derived.potTotal.toLocaleString("en-US")} / $${TOTAL_BUDGET.toLocaleString("en-US")}`}
        />
        <div className="hub__metric" data-testid="metric-budget-remaining">
          <span className="hub__metric-label">Budget remaining</span>
          <span className="hub__metric-value">{100 - derived.spentPct}%</span>
        </div>
        <ProgressBar
          value={100 - derived.spentPct}
          colorToken="--sig-green"
          label="Budget remaining"
          limitText={`$${(TOTAL_BUDGET - derived.potTotal).toLocaleString("en-US")} / $${TOTAL_BUDGET.toLocaleString("en-US")}`}
        />
            </>
          )}
        </SimSlot>
      </SurfaceCard>

      {/* span 5 — Interactive Deck & Rules (the archetypes) */}
      <SurfaceCard
        eyebrow="Deck"
        meta="components/cards.tsx"
        title="Interactive Deck & Rules"
        interactive
        className="sig-span-5 sig-cell"
      >
        <SimSlot id="deck" loading={simLoading} height={simLocked.deck} bindRef={bindSlotRef}>
          {simLoading ? (
            <SkeletonCard />
          ) : (
            <>
        <FlipCard front="Dare: sing the chorus" back="…or forfeit 10 points" />
        <AccordionCard title="House Rules">
          <p>
            Best of one decides every matchup. Ties resolve to
            rock-paper-scissors; the loser of THAT brings ice for the
            next round. No take-backs after the ring sounds.
          </p>
        </AccordionCard>
        <div className="hub__tiles">
          <ActionTile
            title="Open Deck Editor"
            subtitle="42 prompts · draft mode"
            icon="SquarePen"
            kbdShortcut="D"
            onClick={() => toast("success", "The deck editor is on the roadmap.")}
          />
          <ActionTile
            title="Shuffle Prompts"
            subtitle="Fresh dare, zero repeats"
            icon="Shuffle"
            kbdShortcut="S"
            onClick={() => toast("success", "Prompts shuffled — the deck is fresh.")}
          />
        </div>
        {/* The ghost variant + the cortex's toast hook (m3): the deck
            card is the feedback playground. */}
        <Button
          variant="secondary"
          size="sm"
          data-testid="btn-toast"
          onClick={() => toast("success", "Attendance saved — see you there 🎉")}
        >
          Preview the attendance toast
        </Button>
            </>
          )}
        </SimSlot>
      </SurfaceCard>

      {/* span 3 — The Chromatic Palette (ALL 26 — click-to-copy swatches) */}
      <SurfaceCard
        eyebrow="Palette"
        meta="components/primitives.tsx"
        title="The Chromatic Palette"
        interactive
        className="sig-span-3 sig-cell"
      >
        <SimSlot id="palette" loading={simLoading} height={simLocked.palette} bindRef={bindSlotRef}>
          {simLoading ? (
            <SkeletonCard />
          ) : (
            <>
        <p className="hub__sim-note">
          26 tokens · click a swatch to copy its var name — ink badges are
          body-text-safe; fill chips are series accents (bars, rings,
          wells).
        </p>
        <div className="hub__palette-grid">
          {PALETTE.map(({ token, label, role, isNew }) => (
            <button
              key={token}
              type="button"
              className="hub__palette-swatch"
              title={`Copy ${token}`}
              onClick={() => {
                navigator.clipboard
                  .writeText(token)
                  .then(() => toast("success", `Copied ${token}`))
                  .catch(() => toast("error", "Clipboard unavailable"));
              }}
            >
              <SigBadge colorToken={token} label={label} />
              <span className="hub__palette-swatch-meta">
                <span className="hub__palette-role">{role}</span>
                {isNew === true && <span className="hub__palette-new">new 3.0</span>}
              </span>
            </button>
          ))}
        </div>
            </>
          )}
        </SimSlot>
      </SurfaceCard>

      {/* span 7 — Member & Budget Ledger (LIVE) */}
      <SurfaceCard
        eyebrow="Data"
        meta="components/data.tsx"
        title="Member & Budget Ledger"
        interactive
        className="sig-span-7 sig-cell"
      >
        {/* 2.9.1 — the ledger's slot swaps the DataTable for
            SkeletonTableRow × current-rows (columns={3}, the ledger's
            own width). Heights stay CLS-locked by SimSlot. */}
        <SimSlot id="ledger" loading={simLoading} height={simLocked.ledger} bindRef={bindSlotRef}>
          <div data-testid="ledger-table">
            {simLoading ? (
              <table className="sig-data-table" aria-hidden="true">
                <tbody>
                  {members.map((member) => (
                    <SkeletonTableRow key={member.id} columns={3} />
                  ))}
                </tbody>
              </table>
            ) : (
              <DataTable
                columns={BENTO_LEDGER_COLUMNS}
                rows={derived.ledgerRows}
                caption="Shared pot ledger · live — every check-in lands here"
              />
            )}
          </div>
          <Callout status="info">
            Payments settle via the shared pot — no cash at the door.
          </Callout>
        </SimSlot>
      </SurfaceCard>

      {/* span 5 — 1v1 Game Matchup & Editorial */}
      <SurfaceCard
        eyebrow="Games"
        meta="components/cards.tsx"
        title="1v1 Game Matchup & Editorial"
        interactive
        className="sig-span-5 sig-cell"
      >
        <SimSlot id="matchup" loading={simLoading} height={simLocked.matchup} bindRef={bindSlotRef}>
          {simLoading ? (
            <SkeletonCard />
          ) : (
            <>
        <MatchupCard
          left={{ name: "Architecture A", ringToken: "--sig-mauve-soft" }}
          right={{ name: "Architecture B", ringToken: "--sig-sky" }}
          stakes="Benchmark: A vs B — the latency comparison decides the default stack."
        />
        <ProseBlock>
          <p>
            The benchmark is a promise: two builds, one workload, a
            verdict everyone accepts. The ledger above feeds it — real
            traces seed the pairs, and every regression re-runs the
            suite.
          </p>
          <blockquote>
            <p>“A benchmark without a baseline is just a leaderboard with opinions.”</p>
            <footer>— the benchmark ledger, page one</footer>
          </blockquote>
          <cite>Signature Style Field Notes, vol. 3 — the benchmark chapters</cite>
        </ProseBlock>
            </>
          )}
        </SimSlot>
      </SurfaceCard>
    </main>
  );
}

/**
 * ALLOCATIONFORM — the Workspace Member & Resource Allocation surface
 * (2.5.0; 3.1.0 the standalone rename). Local field state + LIVE
 * validation:
 *
 *   Budget Allocation — /^\d+$/ → validMessage; non-empty and failing →
 *                       error (the well shakes; the border goes peach).
 *   Region Code       — /^\d{5}$/ → "Valid region code" / error else.
 *   Member Name       — required (submit-level: the toast refuses).
 *
 * SUBMIT (form onSubmit, preventDefault): invalid → an error toast;
 * valid → a short loading state on the <Button>, then the member rides
 * up to DashboardView's state, the success toast fires ("Allocated —
 * welcome aboard 🎉"), and the fields reset.
 */
function AllocationForm({
  onAllocate,
}: {
  onAllocate: (member: { name: string; attendance: Member["attendance"]; allocation: number }) => void;
}) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [allocation, setAllocation] = useState("");
  const [postal, setPostal] = useState("");
  const [attendance, setAttendance] = useState("confirmed");
  const [rotation, setRotation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submitTimer = useRef<number | null>(null);
  // The one-shot loading timer never outlives the form.
  useEffect(
    () => () => {
      if (submitTimer.current !== null) window.clearTimeout(submitTimer.current);
    },
    [],
  );

  // LIVE RULES — value passes → validMessage; non-empty and failing →
  // error. Empty stays quiet (an empty field is not yet wrong).
  const trimmedAllocation = allocation.trim();
  const allocationValid = /^\d+$/.test(trimmedAllocation);
  const allocationError =
    trimmedAllocation !== "" && !allocationValid
      ? "The allocation must be a number"
      : undefined;
  const postalValid = /^\d{5}$/.test(postal);
  const postalError =
    postal !== "" && !postalValid ? "Region codes are 5 digits" : undefined;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (name.trim() === "" || !allocationValid) {
      toast("error", "A name and a numeric allocation are required to allocate.");
      return;
    }
    setSubmitting(true);
    submitTimer.current = window.setTimeout(() => {
      onAllocate({
        name: name.trim(),
        attendance: ATTENDANCE_TO_STATE[attendance] ?? "pending",
        allocation: Number(trimmedAllocation),
      });
      toast("success", "Allocated — welcome aboard 🎉");
      setName("");
      setContribution("");
      setPostal("");
      setRotation(false);
      setSubmitting(false);
      submitTimer.current = null;
    }, 450);
  };

  return (
    <form className="hub__checkin" data-testid="member-form" onSubmit={handleSubmit}>
      {/* 2.6.0 form audit: the Name field carries its format rule as a
          description — rendered ABOVE the input (the defect-#2 anatomy;
          every FormField description in this playground greps desc-
          before-well). */}
      <FormField
        label="Member Name"
        htmlFor="checkin-name"
        required
        description="The member's full name — as it reads on the roster"
      >
        <Input
          id="checkin-name"
          required
          placeholder="Member name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </FormField>
      {/* The money field: "$" rides the chip (defect #2), the format
          rule rides the description ABOVE the input, and the value is
          live-validated. */}
      <FormField
        label="Budget Allocation"
        htmlFor="checkin-share"
        prefix="$"
        description="Numbers only · e.g., 120"
        validMessage={allocationValid ? "Valid amount" : undefined}
        error={allocationError}
      >
        <Input
          id="checkin-share"
          placeholder="120"
          inputMode="numeric"
          aria-invalid={!!allocationError || undefined}
          value={allocation}
          onChange={(event) => setAllocation(event.target.value)}
        />
      </FormField>
      <FormField
        label="Region Code"
        htmlFor="checkin-postal"
        infoTooltip="The region code drives capacity planning — we route by availability zone."
        description="5 numbers only · e.g., 79901"
        validMessage={postalValid ? "Valid region code" : undefined}
        error={postalError}
      >
        <Input
          id="checkin-postal"
          placeholder="79901"
          inputMode="numeric"
          aria-invalid={!!postalError || undefined}
          value={postal}
          onChange={(event) => setPostal(event.target.value)}
        />
      </FormField>
      <RadioCardGroup
        label="Access Level"
        name="checkin-attendance"
        value={attendance}
        onChange={setAttendance}
        options={[
          { value: "confirmed", label: "Confirmed", description: "Seat allocated this sprint" },
          { value: "pending", label: "Pending", description: "Awaiting capacity review" },
          { value: "declined", label: "Declined", description: "No seat this cycle" },
        ]}
      />
      {/* 2.4.1's visible switch label, exercised: "Add to game
          rotation" renders as text beside the pill. */}
      <ToggleSwitch
        checked={rotation}
        onToggle={setRotation}
        label="Add to build rotation"
      />
      <Button variant="primary" size="md" type="submit" loading={submitting}>
        Allocate Seat
      </Button>
    </form>
  );
}

/**
 * One gateway card in THE MASTER INDEX — a door to a module. 2.6.0: the
 * door gains its chromatic accent (Flamingo for the structural workbench
 * door, chromatic tokens for the content doors).
 */
interface Gateway {
  label: string;
  path: string;
  title: string;
  description: string;
  accent: AccentToken;
  action: () => void;
}

/**
 * THE CATALOG FILTER (2.6.0) — the category ids double as the row
 * visibility switches: `all` shows everything, `gateways` only row 1,
 * `food` the food slab, `commerce` row 2 + the profile row, `docs` the
 * reference card + the chronicle.
 */
type CatalogCategory = "all" | "gateways" | "food" | "commerce" | "docs";

const CATALOG_TABS: Array<{ id: CatalogCategory; label: string }> = [
  { id: "all", label: "All" },
  { id: "gateways", label: "App Gateways" },
  { id: "food", label: "Food & Carousels" },
  { id: "commerce", label: "Commerce & Profiles" },
  { id: "docs", label: "Docs & Chronicles" },
];

/**
 * RELEASE_HISTORY — the Night of Versions memorial, ported (2.6.0).
 * All 23 releases of the engine's life, oldest first; the patch
 * releases (v0.2.1, v1.5.1, v2.4.1) fold into their minors. Tags +
 * names from the README changelog; one story line and one stat each;
 * the milestone accents cycle the chromatic palette.
 */
const RELEASE_HISTORY: ChronicleRelease[] = [
  {
    tag: "v0.1.0",
    title: "The Token Foundation",
    story: "Linux-terminal palette, Token Cascade, Override Protocol, hardened ThemeProvider.",
    stat: "34 tokens · 1 demo",
    accentToken: "--sig-lavender",
  },
  {
    tag: "v0.2.0",
    title: "Catppuccin Edition",
    story: "The palette went 100% official Catppuccin — every color mapped, nothing invented.",
    stat: "mocha + latte",
    accentToken: "--sig-cobalt",
  },
  {
    tag: "v0.3.0",
    title: "Harmonized Catppuccin",
    story: "Per-theme Flamingo/Teal signatures; the retired accents banned everywhere.",
    stat: "structural UI locked",
    accentToken: "--sig-sky",
  },
  {
    tag: "v0.4.0",
    title: "Chromatic Palette",
    story: "Ten content-only tokens — the Rule of Engagement draws the chrome/content line.",
    stat: "10 tokens reserved",
    accentToken: "--sig-pink-bright",
  },
  {
    tag: "v0.5.0",
    title: "Pruning Protocol + React Primitives",
    story: "Icon, EmptyState, SigBadge — flat DOM, typed tokens, zero wrappers.",
    stat: "3 primitives",
    accentToken: "--sig-green",
  },
  {
    tag: "v0.6.0",
    title: "Event Timeline",
    story: "The chronology: grouped months, sticky glass headers, one line of nodes.",
    stat: "sticky headers",
    accentToken: "--sig-mauve-soft",
  },
  {
    tag: "v0.7.0",
    title: "Event Modal",
    story: "Portalled dialog, neutral scrim, Escape — the z-pillars earn their rungs.",
    stat: "z 40 / 50",
    accentToken: "--sig-peach",
  },
  {
    tag: "v1.0.0",
    title: "Publish Flow & Distribution",
    story: "npm-ready: exports map, tag-driven publish, tokens.json as the AI core.",
    stat: "3 export paths",
    accentToken: "--sig-yellow",
  },
  {
    tag: "v1.1.0",
    title: "Storybook — The Human Interface",
    story: "The philosophy, every token, every component — readable like a book.",
    stat: "docs only",
    accentToken: "--sig-pink-soft",
  },
  {
    tag: "v1.2.0",
    title: "GlobalNav",
    story: "Sticky navbar, drawer, aria-current — the attribute IS the state.",
    stat: "--z-nav 30",
    accentToken: "--sig-lavender",
  },
  {
    tag: "v1.3.0",
    title: "Telemetry Module",
    story: "ProgressBar + StatRing — data-ink doctrine, 8px tracks, surface fills.",
    stat: "8px grid",
    accentToken: "--sig-sky",
  },
  {
    tag: "v1.4.0",
    title: "Input & Feedback Layer",
    story: "Inputs, switches, selects, toasts at the zenith rung — the whitelist completes.",
    stat: "whitelist 33",
    accentToken: "--sig-green",
  },
  {
    tag: "v1.5.0",
    title: "Bento Box Showcase",
    story: "The playground dashboard: every primitive, one bento.",
    stat: "playground born",
    accentToken: "--sig-peach",
  },
  {
    tag: "v1.6.0",
    title: "Ambient Elevation & Timeline Resurrection",
    story: "The inset-highlight + ambient treaty; the sticky-header bug found, fixed.",
    stat: "(e1) born",
    accentToken: "--sig-mauve-bright",
  },
  {
    tag: "v1.7.0",
    title: "The Visual Cortex",
    story: "The MCP server: layout sweeps + screenshots as release-blocker proof.",
    stat: "2 tools",
    accentToken: "--sig-cobalt",
  },
  {
    tag: "v1.8.0",
    title: "Bento Refinement & Spatial Harmony",
    story: "Glass headers, metric air, breathing bars — the 8px grid everywhere.",
    stat: "spatial pass",
    accentToken: "--sig-pink-bright",
  },
  {
    tag: "v2.0.0",
    title: "The Hub Migration",
    story: "The Shed aesthetic: meta row → ruled title → content; gateway doors.",
    stat: "sig-* born",
    accentToken: "--sig-lavender",
  },
  {
    tag: "v2.1.0",
    title: "Timeline Breathing Room & The Master Index",
    story: "The −1px overlap measured and fixed; the index gets its three doors.",
    stat: "measured",
    accentToken: "--sig-sky",
  },
  {
    tag: "v2.2.0",
    title: "Telemetry Limits & Official Surface Primitives",
    story: "Limit captions on every bar; the Shed anatomy promoted into the package.",
    stat: "pack 37",
    accentToken: "--sig-peach",
  },
  {
    tag: "v2.3.0",
    title: "Universal Web Components & AI Signature Codex",
    story: "DataTable, Tabs, Callouts, Avatars — the codex ships with the package.",
    stat: "pack 40",
    accentToken: "--sig-green",
  },
  {
    tag: "v2.4.0",
    title: "Form Wrappers & Editorial Primitives",
    story: "FormFields, RadioCards, Carousel, Prose, Banners, StatCards, Sparklines.",
    stat: "pack 43",
    accentToken: "--sig-mauve-soft",
  },
  {
    tag: "v2.5.0",
    title: "Ergonomic Form Rules, Button & Card Archetypes, and the 12-Column Bento",
    story: "Five owner defects buried: shell, desc-above forms, labels, align, live bento.",
    stat: "whitelist 34",
    accentToken: "--sig-pink-bright",
  },
  {
    tag: "v2.6.0",
    title: "Universal Developer Card Suite",
    story: "The catalog became the product: chromatic elevation, the master index overhaul.",
    stat: "5 archetypes · 3 tiers · 11 accents",
    accentToken: "--sig-yellow",
  },
];

/**
 * THE MASTER INDEX — THE CATALOG (2.6.0). Structure, top to bottom:
 *
 *   Tabs      — the category filter (attribute-driven package Tabs).
 *   Row 1     — THREE BALANCED GATEWAY doors (.hub__row--3): equal
 *               width, same row, each wearing its chromatic accent
 *               (data-accent + --sig-accent on the button; the package
 *               css paints eyebrow + underline + glow). PLANNER is the
 *               real door (navigates to the dashboard); STUDY and
 *               ARENA toast the roadmap (the 2.1.0 decision stands).
 *   Row 2     — the commerce trio: ContentCard (catering) ·
 *               ReferenceCard (the SurfaceCard snippet, copy → toast)
 *               · TierCard (featured Arena Pass, floating).
 *   Row 3     — the food slab: a full-width SurfaceCard housing the
 *               Carousel (5 mini-cards, dot indicators) + the 4-up
 *               profile row (ProfileCard · FlipCard · AccordionCard ·
 *               MatchupCard).
 *   Row 4     — the chronicle slab: a full-width FLAT SurfaceCard (the
 *               archive is a record, not a floating toy — and the
 *               release's flat-tier probe) housing the 23-release
 *               ChronicleTimeline.
 *
 * The 2.1.0 button-not-section decision STANDS: the cards ARE
 * <button>s wearing the package's own surface classes (a <button>
 * cannot be the section-rendering surface primitive) — with data-accent,
 * --sig-accent and the data-elevation ladder riding the same package
 * css since 2.6.0. Filtering is conditional rendering per row (the
 * simplest honest mechanism — no display:none ghost grid).
 */
function IndexView({ onNavigate }: { onNavigate: (href: string) => void }) {
  const toast = useToast();
  const [category, setCategory] = useState<CatalogCategory>("all");
  // 3.0.0 — the Field Notes Carousel's mode (default free-scroll = the
  // historical behavior; the toggle pill flips it live).
  const [carouselMode, setCarouselMode] = useState<"paged-3" | "free-scroll">("free-scroll");
  const gateways: Gateway[] = [
    {
      label: "WORKBENCH",
      path: "views/workbench.tsx",
      title: "Bento Workbench",
      description:
        "The live dashboard — telemetry, allocation, palette. Click to return.",
      accent: "--color-cake-primary",
      action: () => onNavigate(VIEW_HREFS.dashboard),
    },
    {
      label: "GRAPH STUDIO",
      path: "views/graph-studio.tsx",
      title: "The Graph Studio",
      description: "The canvas — nodes, links, inspector. Click to enter.",
      accent: "--sig-lavender",
      action: () => onNavigate(VIEW_HREFS.graph),
    },
    {
      label: "STUDIO",
      path: "views/studio.tsx",
      title: "Pattern Studio",
      description: "Every archetype on one stage — compose before you commit.",
      accent: "--sig-peach",
      action: () => onNavigate(VIEW_HREFS.studio),
    },
  ];

  // The row visibility switches — one boolean per row, straight off the
  // category state (conditional rendering, documented in the header).
  const showGateways = category === "all" || category === "gateways";
  const showCatalog =
    category === "all" || category === "commerce" || category === "docs";
  const showFood = category === "all" || category === "food";
  const showProfiles =
    category === "all" || category === "food" || category === "commerce";
  const showChronicle = category === "all" || category === "docs";

  return (
    <main className="hub hub--index">
      <div data-testid="catalog-tabs">
        <Tabs
          label="Catalog categories"
          tabs={CATALOG_TABS}
          activeId={category}
          onChange={(id) => setCategory(id as CatalogCategory)}
        />
      </div>

      {showGateways && (
        <div className="hub__row--3" data-testid="index-gateways">
          {gateways.map((gateway) => (
            <button
              key={gateway.path}
              type="button"
              className="sig-surface-card sig-surface-card--interactive hub__card--gateway"
              data-accent
              data-elevation="raised"
              data-testid={`gateway-${gateway.label.toLowerCase()}`}
              style={{ "--sig-accent": `var(${gateway.accent})` } as CSSProperties}
              onClick={gateway.action}
            >
              <div className="sig-surface-card__meta">
                <span className="sig-surface-card__eyebrow">{gateway.label}</span>
                <span className="sig-surface-card__path">{gateway.path}</span>
              </div>
              <h2 className="sig-surface-card__title">{gateway.title}</h2>
              <p className="hub__gateway-desc">{gateway.description}</p>
            </button>
          ))}
        </div>
      )}

      {/* 2.9.0: the commerce trio rides .sig-cell containers — the
          ContentCard grows its media-object layout when its cell is
          ≥ 440px wide (per-card, not per-viewport). */}
      {showCatalog && (
        <div className="hub__row--3" data-testid="index-catalog">
          <div className="sig-cell">
            <ContentCard
              category="Platform"
              categoryToken="--sig-peach"
              meta={["25 MIN", "CANARY", "$14"]}
              accentToken="--sig-yellow"
              title="Managed Deploy Pipeline"
              description="Green builds, canary rolls on the side, the rollback button that silences the incident. The runner parks on your branch and feeds the pipeline until the last check signs off."
              action={{ label: "Book the pipeline" }}
            />
          </div>
          <div className="sig-cell">
            <ReferenceCard
              tag="JSX"
              title="The Signature Surface"
              accentToken="--sig-sky"
              code={SURFACE_SNIPPET}
              link="#/index"
              onCopied={() => toast("success", "Snippet copied — paste it anywhere.")}
            />
          </div>
          <div className="sig-cell">
            <TierCard
              name="Pro License"
              price="$49"
              featured
              accentToken="--sig-mauve-soft"
              features={[
                "All 26 chromatic tokens",
                "Container queries & a11y",
                "Zero-dependency core",
                "Priority support",
              ]}
              cta="Claim the license"
              onCta={() => toast("success", "The Pro License is on the roadmap.")}
            />
          </div>
        </div>
      )}

      {showFood && (
        <div data-testid="index-food">
          <SurfaceCard
            eyebrow="Food"
            meta="components/editorial.tsx"
            title="Field Notes & Carousel"
            interactive
            className="sig-cell"
          >
            {/* 3.0.0 — THE LIVE MODE TOGGLE PILL (two-button segmented,
                aria-pressed IS the state, the tabs/nav contract); 3.6.0
                relabels to the true-grid contract: paged-3 is a real
                3-per-page deck, free-scroll stays the snap strip. */}
            <div
              className="hub__mode-toggle"
              role="group"
              aria-label="Carousel mode"
              data-testid="carousel-mode-toggle"
            >
              <button
                type="button"
                aria-pressed={carouselMode === "paged-3"}
                onClick={() => setCarouselMode("paged-3")}
              >
                3-by-3 Paged
              </button>
              <button
                type="button"
                aria-pressed={carouselMode === "free-scroll"}
                onClick={() => setCarouselMode("free-scroll")}
              >
                Fluid Scroll
              </button>
            </div>
            <Carousel label="Developer & lifestyle cards" mode={carouselMode}>
              <CarouselItem className="hub__clipping">
                <div className="hub__mini-card">
                  <strong>Typography</strong>
                  <span>Inter var — the optical grid is a promise.</span>
                </div>
              </CarouselItem>
              <CarouselItem className="hub__clipping">
                <div className="hub__mini-card">
                  <strong>Telemetry</strong>
                  <span>Sparklines first — the trend is the headline.</span>
                </div>
              </CarouselItem>
              <CarouselItem className="hub__clipping">
                <div className="hub__mini-card">
                  <strong>Forms</strong>
                  <span>Validation that teaches — an error is copy.</span>
                </div>
              </CarouselItem>
              <CarouselItem className="hub__clipping">
                <div className="hub__mini-card">
                  <strong>Graphs</strong>
                  <span>Force-directed, drag-weighted — nodes are data.</span>
                </div>
              </CarouselItem>
              <CarouselItem className="hub__clipping">
                <div className="hub__mini-card">
                  <strong>Chronology</strong>
                  <span>Timelines that breathe — the past is a lane.</span>
                </div>
              </CarouselItem>
              <CarouselItem className="hub__clipping">
                <div className="hub__mini-card">
                  <strong>Graph Studio</strong>
                  <span>Nodes are data — tether, drag, inspect, unlink.</span>
                </div>
              </CarouselItem>
            </Carousel>
          </SurfaceCard>
        </div>
      )}

            {/* 2.9.0: the profile row rides .sig-cell containers — ProfileCard
          and MatchupCard reflow per cell (media-object / stacked VS). */}
      {showProfiles && (
        <div className="hub__row--4" data-testid="index-profiles">
          <div className="sig-cell">
            <ProfileCard
              name="Ana Souza"
              role="Head of Platform"
              accentToken="--sig-peach"
              stats={[
                { label: "Events", value: "24" },
                { label: "Members", value: "412" },
                { label: "Rating", value: "4.9" },
              ]}
              skills={[
                { colorToken: "--sig-peach", label: "Platform" },
                { colorToken: "--sig-green", label: "Infra" },
              ]}
            />
          </div>
          <div className="sig-cell">
            <FlipCard front="Dare: ship it on Friday" back="…or write the postmortem" />
          </div>
          <div className="sig-cell">
            <AccordionCard title="Bench Rules">
              <p>
                Best of one decides every benchmark; ties resolve to a
                tie-break suite and the loser of THAT writes the ADR.
              </p>
              <p>
                No take-backs after the merge — the baseline is a
                promise everyone accepts.
              </p>
            </AccordionCard>
          </div>
          <div className="sig-cell">
            <MatchupCard
              left={{ name: "SSR", ringToken: "--sig-mauve-soft" }}
              right={{ name: "ISR", ringToken: "--sig-sky" }}
              stakes="Winner picks the rendering default — loser writes the ADR."
            />
          </div>
        </div>
      )}

      {showChronicle && (
        <div data-testid="index-chronicle">
          <SurfaceCard
            eyebrow="Docs"
            meta="components/cards.tsx"
            title="The Chronicle"
            elevation="flat"
          >
            <ChronicleTimeline releases={RELEASE_HISTORY} />
          </SurfaceCard>
        </div>
      )}
    </main>
  );
}

/**
 * The ReferenceCard's live snippet — a REAL 6-line SurfaceCard JSX
 * invocation (the exact contract the card suite ships), rendered as
 * text inside the code well and copied verbatim by the Copy button.
 */
const SURFACE_SNIPPET = `<SurfaceCard
  eyebrow="Workbench"
  meta="views/workbench.tsx"
  title="Bento Workbench"
  interactive accentToken="--sig-lavender"
>
  <ProgressBar value={72} colorToken="--sig-sky" label="Attendance ratio" />
</SurfaceCard>`;

/**
 * THE LEDGER — the data module's table contract (2.3.0). Status cells
 * are ReactNode: one row composes a <SigBadge> to show a badge living
 * inside the table, the rest stay plain text (keep td text simple —
 * composition is demonstrated once, not everywhere).
 */
const LEDGER_COLUMNS: DataTableColumn[] = [
  { key: "member", header: "Member" },
  { key: "status", header: "Status" },
  // 2.4.1: align flows to BOTH th and td — the CONTRIBUTION header sits
  // flush over the $120 values (numeric alone left the header behind).
  { key: "share", header: "Contribution", numeric: true, align: "right" },
];

const LEDGER_ROWS: Array<Record<string, ReactNode>> = [
  {
    member: "Ana Souza",
    status: <SigBadge colorToken="--sig-green" label="Confirmed" />,
    share: "$120",
  },
  { member: "Leo Martins", status: "Pending", share: "$0" },
  { member: "Priya Nair", status: "Confirmed", share: "$200" },
  { member: "Tom Weller", status: "Declined", share: "$0" },
  { member: "Nina Almeida", status: "Pending", share: "$120" },
];

/** The data module's five crew discs — 32px ×3, 40px ×2, two chromatic rings. */
const AVATAR_CREW: Array<{
  name: string;
  size?: 32 | 40;
  ringToken?: SigTokenName;
}> = [
  { name: "Ana Souza", ringToken: "--sig-mauve-soft" },
  { name: "Leo Martins" },
  { name: "Priya Nair" },
  { name: "Tom Weller", size: 40, ringToken: "--sig-sky" },
  { name: "Nina Almeida", size: 40 },
];

/**
 * THE DATA & TABLES MODULE (2.3.0, grown 2.4.0) — the package's
 * <DataTable>, <Callout> and <Avatar> dogfooded in one card: the ledger
 * (with the composed SigBadge), the three persistent callout moods,
 * and the crew discs. 2.4.0 grows the view around the card: the
 * release <AnnouncementBanner> at the top, the <StatCard> KPI trio,
 * and the Field Notes editorial card (<ProseBlock> + a <Carousel> of
 * palette clippings).
 */
function DataModule() {
  const [bannerVisible, setBannerVisible] = useState(true);
  const toast = useToast();

  return (
    <>
      {bannerVisible && (
        <AnnouncementBanner
          variant="announcement"
          dismissible
          onDismiss={() => setBannerVisible(false)}
          action={{
            label: "See what shipped",
            onClick: () =>
              toast(
                "success",
                "v2.4.1 — DataTable align, FormField required/prefix, visible switch labels, banner variants + action, mauve quote bars, carousel indicator.",
              ),
          }}
        >
          <span data-testid="banner-release">
            v2.4.1 — intuitive form anatomy &amp; the alignment fix shipped.
          </span>
        </AnnouncementBanner>
      )}
      {/* 2.9.0: each KPI rides its own .sig-cell container — three cards
          in one row can answer three different cell widths. */}
      <div className="hub__kpis" data-testid="kpi-trio">
        <div className="sig-cell">
          <StatCard
            label="Total Budget"
            value="$2,000"
            delta="+$440"
            deltaDirection="up"
            sparklineData={[1200, 1450, 1380, 1600, 1780, 2000]}
            colorToken="--sig-green"
          />
        </div>
        <div className="sig-cell">
          <StatCard
            label="Confirmed Seats"
            value="170"
            delta="+12"
            deltaDirection="up"
            sparklineData={[118, 126, 132, 141, 158, 170]}
            colorToken="--sig-sky"
          />
        </div>
        <div className="sig-cell">
          <StatCard
            label="Active Workspaces"
            value="6"
            delta="+2"
            deltaDirection="up"
            sparklineData={[2, 3, 3, 4, 4, 6]}
            colorToken="--sig-mauve-soft"
          />
        </div>
      </div>
      <SurfaceCard
        eyebrow="Data"
        meta="components/data.tsx"
        title="Member & Budget Ledger"
        interactive
      >
        <div data-testid="data-table-ledger">
          <DataTable
            columns={LEDGER_COLUMNS}
            rows={LEDGER_ROWS}
            caption="Allocation ledger · updated after every response"
          />
        </div>
        <Callout status="info">
          Budgets settle via the shared pool — no shadow spend.
        </Callout>
        <Callout status="success">Final headcount locked for the launch.</Callout>
        <Callout status="warning">3 pending reviews close Friday.</Callout>
        <div className="hub__avatars">
          {AVATAR_CREW.map((person) => (
            <div key={person.name} className="hub__avatar-row">
              <Avatar name={person.name} size={person.size} ringToken={person.ringToken} />
              <span>{person.name}</span>
            </div>
          ))}
        </div>
      </SurfaceCard>
      <SurfaceCard
        eyebrow="Editorial"
        meta="components/editorial.tsx"
        title="Field Notes"
        interactive
      >
        <div data-testid="prose-notes">
          <ProseBlock>
            <p>
              Every allocation in this workbench starts as a row in the budget
              ledger and ends as a sprint nobody has to chase. The numbers stay
              boring on purpose — boring numbers are the ones that survive
              contact with a real org chart.
            </p>
            <p>
              When a figure changes, it changes here first: the budget card, the
              ring, the sparkline — and the story above stays honest. Design the
              ledger well and the sprint practically plans itself.
            </p>
            <blockquote>
              <p>
                “Weeks of coding can save you hours of planning.”
              </p>
              <footer>— every engineer who ever ran a launch, probably</footer>
            </blockquote>
            <cite>Signature Style Field Notes, vol. 2 — the ledger chapters</cite>
          </ProseBlock>
        </div>
        <div data-testid="carousel-clippings">
          <Carousel label="Palette clippings">
            {PALETTE.slice(0, 5).map(({ token, label }) => (
              <CarouselItem key={token} className="hub__clipping">
                <SigBadge colorToken={token} label={label} />
              </CarouselItem>
            ))}
          </Carousel>
        </div>
      </SurfaceCard>
    </>
  );
}

/**
 * THE FORM & INPUT MATRIX MODULE (2.3.0, grown 2.4.0) — every input
 * control on ONE card, stacked in the v2.1.0 spacing pattern (the
 * SurfaceCard's own --space-standard flex gap IS the rhythm; no extra
 * wrappers). 2.4.0: Name / $ Allocation preview the <FormField>
 * wrapper side-by-side (hint on the first, error-replaces-hint on the
 * second), and the attendance sample is a <RadioCardGroup>.
 */
function FormsModule({ onSimulate }: { onSimulate: () => void }) {
  const [diet, setDiet] = useState("none");
  const [invited, setInvited] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [allocation, setAllocation] = useState("");
  const [postal, setPostal] = useState("");
  const [password, setPassword] = useState("");
  const [attendance, setAttendance] = useState("confirmed");

  // Live validation rules (2.5.0, audited 2.6.0): the value passes →
  // validMessage; the value is non-empty and fails → error. Empty (or
  // a pristine pre-filled value like the placeholder's example "120")
  // stays quiet — a field the visitor never touched is not yet wrong.
  // THE 2.6.0 AUDIT: the matrix Allocation field used to boot in the
  // ERROR state (empty → "enter an amount" on first paint); it now
  // skips pristine exactly like the Region Code field and the allocation form.
  const allocationTrimmed = allocation.trim();
  const allocationValid = /^\d+$/.test(allocationTrimmed);
  const allocationError =
    allocationTrimmed !== "" && !allocationValid
      ? "Allocations are numbers only"
      : undefined;
  const postalValid = /^\d{5}$/.test(postal);
  const postalError = postal !== "" && !postalValid ? "Region codes are 5 digits" : undefined;

  return (
    <SurfaceCard
      eyebrow="Forms"
      meta="components/forms.tsx"
      title="The Input Matrix"
      interactive
    >
      {/* 2.9.1 — THE ASYNC-LOAD TRIGGER. The documented most-natural-spot
          call: the skeletons land on the Core Dashboard's bento cards,
          so the manual toggle lives HERE — one module-tab away, cause
          and effect on the same view (the palette command covers
          cross-view runs). Deliberately no toast: the skeleton swap IS
          the feedback, and the window is only 800ms. */}
      <div className="hub__sim-row">
        <Button
          variant="secondary"
          size="sm"
          leftIcon="Hourglass"
          data-testid="btn-simulate-load"
          onClick={onSimulate}
        >
          Simulate Async Load (800ms)
        </Button>
        <span className="hub__sim-note">
          swaps the Core Dashboard to skeletons for 800ms — zero layout shift
        </span>
      </div>
      {/* 2.9.0: the multi-column row is ONE .sig-cell container — the
          @container (max-width: 480px) collapse in styles.css stacks the
          2-3 column row when the row's own width runs out. */}
      <div className="sig-cell">
        <div className="hub__form-grid">
          <FormField
            label="Member Name"
            htmlFor="matrix-name"
            hint="As it appears on the roster"
          >
            <Input
              id="matrix-name"
              placeholder="Member name"
              value={memberName}
              onChange={(event) => setMemberName(event.target.value)}
            />
          </FormField>
          {/* 2.4.1: label="Allocation" + prefix="$" — the adornment
              composition demo (the dollar sign moved OUT of the label and
              INTO the mono chip, flush with the cursor in the well).
              2.5.0: the field rides the well — the Input is bare, the
              well owns the border. 2.6.0 audit: the field no longer BOOTS
              in the error state — empty stays pristine-quiet, valid values
              earn the validMessage, only non-empty invalid input shakes. */}
          <FormField
            label="Allocation"
            htmlFor="matrix-share"
            prefix="$"
            description="Numbers only · e.g., 120"
            validMessage={allocationValid ? "Valid amount" : undefined}
            error={allocationError}
          >
            <Input
              id="matrix-share"
              placeholder="120"
              inputMode="numeric"
              aria-invalid={!!allocationError || undefined}
              value={allocation}
              onChange={(event) => setAllocation(event.target.value)}
            />
          </FormField>
          {/* 2.5.0: the Region Code demo — description ABOVE the input
              (format rules live with the title), live validation with the
              validMessage/error priority in the bottom slot. */}
          <FormField
            label="Region Code"
            htmlFor="matrix-postal"
            description="5 numbers only · e.g., 79901"
            validMessage={postalValid ? "Valid ZIP" : undefined}
            error={postalError}
          >
            <Input
              id="matrix-postal"
              placeholder="79901"
              inputMode="numeric"
              aria-invalid={!!postalError || undefined}
              value={postal}
              onChange={(event) => setPostal(event.target.value)}
            />
          </FormField>
        </div>
      </div>
      <TextArea placeholder="Notes for the team…" rows={3} aria-label="Notes" />
      <Select
        label="Rollout preference"
        value={diet}
        onChange={(event) => setDiet(event.target.value)}
      >
        <option value="none">No preference</option>
        <option value="vegetarian">Canary</option>
        <option value="vegan">Blue-green</option>
      </Select>
      <Checkbox checked={invited} onToggle={setInvited} label="Send me the changelog" />
      <ToggleSwitch checked={isPublic} onToggle={setIsPublic} label="Make workspace public" />
      {/* 2.5.0: the new PasswordInput (eye toggle + 4-stage meter +
          condition pills), and the attendance cards ALL carry descriptions —
          the balanced grid contract, enforced in the package. */}
      <PasswordInput
        label="Password"
        value={password}
        onChange={setPassword}
      />
      <RadioCardGroup
        label="Attendance"
        name="attendance"
        value={attendance}
        onChange={setAttendance}
        options={[
          { value: "confirmed", label: "Confirmed", description: "Seat allocated this sprint" },
          { value: "pending", label: "Pending", description: "Awaiting capacity review" },
          { value: "declined", label: "Declined", description: "No seat this cycle" },
        ]}
      />
    </SurfaceCard>
  );
}

/* ==========================================================================
   THE WORKSPACE STATE + THE ANALYTICS & PLANNER VIEW (2.7.0; 3.6.0 the
   Studio split). THE ONE OWNER of the persisted sig.workspace.v3.*
   arrays: graph, timeline, graph-positions, and the 3.6.0 GraphEdge[]
   links. `useWorkspaceState` is called ONCE (the Shell); the Graph
   Studio view consumes the graph/links/positions + node ops, Analytics
   & Planner consumes the timeline + charts + the snapshot toolbar
   (Export JSON / Import JSON / Reset). Reload survives, Reset restores
   the seeds.

   THE 3.6.0 LINKS MODEL — sig.workspace.v3.links stores GraphEdge
   { id, fromId, toId } records (the 3.0.0 shapeless {from, to} pair is
   MIGRATED LAZILY by normalizeEdge: legacy entries read through a
   synthetic `legacy:from:to` id and re-persist as GraphEdges on the
   next write). Parent edges stay DERIVED from parentId and carry the
   deterministic id `parent:${childId}` — unlink resolves the kind by
   id prefix: a parent edge unlinks by clearing the child's parentId,
   a link edge is removed from the array.
   ========================================================================== */

/** Shallow shape guards for the snapshot import (trust, but verify). */
function isGraphNodeish(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const node = value as Partial<GraphNode>;
  return typeof node.id === "string" && typeof node.label === "string";
}

function isTimelineItemish(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Partial<TimelineItem>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.date === "string" &&
    typeof item.category === "string"
  );
}

/**
 * GraphEdge normalizer (3.6.0): accepts the CURRENT { id, fromId, toId }
 * shape and the LEGACY { from, to } pair (a synthetic
 * `legacy:from:to` id keeps unlink/dedupe honest), null for junk.
 */
function normalizeEdge(raw: unknown): GraphEdge | null {
  if (typeof raw !== "object" || raw === null) return null;
  const edge = raw as Partial<GraphEdge> & { from?: unknown; to?: unknown };
  if (
    typeof edge.id === "string" &&
    typeof edge.fromId === "string" &&
    typeof edge.toId === "string"
  ) {
    return { id: edge.id, fromId: edge.fromId, toId: edge.toId };
  }
  if (typeof edge.from === "string" && typeof edge.to === "string") {
    return { id: `legacy:${edge.from}:${edge.to}`, fromId: edge.from, toId: edge.to };
  }
  return null;
}

/**
 * useWorkspaceState — THE ONE HOOK (the Studio split, 3.6.0). Every
 * mutation the two views need, one toast voice, one persistence story.
 *
 * THE REPOSITORY LEG (3.6.0): pass a WorkspaceRepository and every
 * graph/timeline mutation ALSO rides repo.saveGraph/saveTimeline —
 * debounced 250ms trailing (one burst = one save), each save rendered
 * through `saving` (skeletons in the affected card) and validated by
 * the adapter (invalid payloads reject into an error toast — the
 * FastAPI rehearsal; see playground/workspace-repository.ts).
 */
const REPO_SAVE_DEBOUNCE_MS = 250;

function useWorkspaceState(repo?: WorkspaceRepository) {
  const toast = useToast();
  // THE PERSISTENCE CONTRACT — versioned keys, seeds as fallbacks.
  const [graph, setGraph, resetGraph] = usePersistentState<GraphNode[]>(
    "sig.workspace.v3.graph",
    SEED_GRAPH,
  );
  const [timeline, setTimeline, resetTimeline] = usePersistentState<TimelineItem[]>(
    "sig.workspace.v3.timeline",
    SEED_TIMELINE,
  );
  const [positions, setPositions, resetPositions] = usePersistentState<
    Record<string, { x: number; y: number }>
  >("sig.workspace.v3.graph-positions", {});
  const [links, setLinks, resetLinks] = usePersistentState<GraphEdge[]>(
    "sig.workspace.v3.links",
    [],
  );
  // The NORMALIZED view (legacy {from,to} entries read through).
  const normalizedLinks = useMemo<GraphEdge[]>(
    () => links.map(normalizeEdge).filter((edge): edge is GraphEdge => edge !== null),
    [links],
  );

  const moveNode = useCallback(
    (id: string, position: { x: number; y: number }) => {
      setPositions((current) => ({ ...current, [id]: position }));
    },
    [setPositions],
  );

  // THE TETHER COMMIT — a right-click drag from node to node lands here.
  // Extra links are APPENDED (deduped, both directions) as GraphEdges;
  // parent edges stay derived from parentId. The dedupe read goes
  // through normalizeEdge, so a legacy array migrates on first write.
  const linkNodes = useCallback(
    (fromId: string, toId: string) => {
      setLinks((current) => {
        const normalized = current
          .map(normalizeEdge)
          .filter((edge): edge is GraphEdge => edge !== null);
        const exists = normalized.some(
          (link) =>
            (link.fromId === fromId && link.toId === toId) ||
            (link.fromId === toId && link.toId === fromId),
        );
        if (exists) return normalized;
        return [
          ...normalized,
          { id: `lnk-${Date.now().toString(36)}`, fromId, toId },
        ];
      });
      toast("success", "Tethered — the graph keeps the link.");
    },
    [setLinks, toast],
  );

  // THE UNLINK (3.6.0) — kind-resolved by the id prefix: `parent:*`
  // clears the child's parentId (the tree edge), anything else is a
  // GraphEdge removed from the persisted array.
  const unlinkEdge = useCallback(
    (edgeId: string) => {
      if (edgeId.startsWith("parent:")) {
        const childId = edgeId.slice("parent:".length);
        setGraph((current) =>
          current.map((node) =>
            node.id === childId ? { ...node, parentId: undefined } : node,
          ),
        );
      } else {
        setLinks((current) =>
          current
            .map(normalizeEdge)
            .filter((edge): edge is GraphEdge => edge !== null && edge.id !== edgeId),
        );
      }
      toast("success", "Unlinked — the edge is gone from the workspace.");
    },
    [setGraph, setLinks, toast],
  );

  // THE INSPECTOR COMMIT (3.6.0) — one debounced patch per field burst.
  const updateNode = useCallback(
    (id: string, patch: NodePatch) => {
      setGraph((current) =>
        current.map((node) => (node.id === id ? { ...node, ...patch } : node)),
      );
    },
    [setGraph],
  );

  // THE AUTO-ARRANGE — clear the persisted custom positions; the pure
  // layoutGraph re-places every node and the EMPTY map persists.
  const autoArrange = useCallback(() => {
    resetPositions();
    toast("success", "Auto-arranged — the deterministic layout is restored and persisted.");
  }, [resetPositions, toast]);

  // THE DBL-CLICK SPAWN — a node at the clicked point, parented to the
  // nearest node (or the root), position persisted immediately.
  const addNodeAt = useCallback(
    (point: { x: number; y: number }, parentId?: string) => {
      const id = `kg-${Date.now().toString(36)}`;
      setGraph((current) => [
        ...current,
        { id, label: "New note", categoryToken: "--sig-lavender", parentId },
      ]);
      setPositions((current) => ({ ...current, [id]: point }));
      toast("success", "Node spawned — drag it, or tether it with a right-click.");
    },
    [setGraph, setPositions, toast],
  );

  // THE SPAWNED CHILD (3.6.0, the inspector button) — a node parented to
  // the selection, parked beside it.
  const spawnLinkedChild = useCallback(
    (parentId: string) => {
      const id = `kg-${Date.now().toString(36)}`;
      setGraph((current) => [
        ...current,
        { id, label: "New note", categoryToken: "--sig-lavender", parentId },
      ]);
      const parentPosition = positions[parentId];
      if (parentPosition !== undefined) {
        setPositions((current) => ({
          ...current,
          [id]: {
            x: Math.min(600, parentPosition.x + 70),
            y: Math.max(40, parentPosition.y - 50),
          },
        }));
      }
      toast("success", "Linked child spawned — drag it, tether it, inspect it.");
    },
    [positions, setGraph, setPositions, toast],
  );

  const addMilestone = useCallback(
    (item: Omit<TimelineItem, "id">) => {
      setTimeline((current) => [
        ...current,
        { ...item, id: `tm-${Date.now().toString(36)}` },
      ]);
    },
    [setTimeline],
  );

  const toggleSettled = useCallback(
    (id: string) => {
      setTimeline((current) =>
        current.map((item) =>
          item.id === id ? { ...item, settled: item.settled !== true } : item,
        ),
      );
    },
    [setTimeline],
  );

  const deleteMilestone = useCallback(
    (id: string) => {
      setTimeline((current) => current.filter((item) => item.id !== id));
      // ToastStatus is success | "error" — the peach strip IS the
      // attention voice; a destructive action earns it (the reset too).
      toast("error", "Milestone deleted.");
    },
    [setTimeline, toast],
  );

  const exportSnapshot = useCallback(() => {
    // 3.0.0: the links model joins the payload; 3.6.0: the GraphEdge
    // shape (the normalized view — legacy entries migrate on export).
    const payload = {
      version: "sig.workspace.v3",
      graph,
      timeline,
      links: normalizedLinks,
    };
    downloadJson(JSON.stringify(payload, null, 2), "signature-workspace.json");
    toast("success", "Snapshot exported — signature-workspace.json.");
  }, [graph, timeline, normalizedLinks, toast]);

  const importSnapshot = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(String(reader.result)) as {
            graph?: unknown;
            timeline?: unknown;
            links?: unknown;
          };
          const graphOk =
            Array.isArray(data.graph) && data.graph.every(isGraphNodeish);
          const timelineOk =
            Array.isArray(data.timeline) &&
            data.timeline.every(isTimelineItemish);
          if (!graphOk || !timelineOk) {
            toast("error", "Invalid snapshot structure");
            return;
          }
          setGraph(data.graph as GraphNode[]);
          setTimeline(data.timeline as TimelineItem[]);
          if (Array.isArray(data.links)) {
            setLinks(
              data.links
                .map(normalizeEdge)
                .filter((edge): edge is GraphEdge => edge !== null),
            );
          }
          toast("success", "Snapshot imported — graph + timeline restored.");
        } catch {
          toast("error", "Invalid snapshot structure");
        }
      };
      reader.readAsText(file);
    },
    [setGraph, setTimeline, setLinks, toast],
  );

  const resetAll = useCallback(() => {
    resetGraph();
    resetTimeline();
    resetPositions();
    resetLinks();
    toast("error", "Local state reset");
  }, [resetGraph, resetTimeline, resetPositions, resetLinks, toast]);

  /* -- THE REPOSITORY LEG (3.6.0): debounced async saves + skeletons -- */
  const [saving, setSaving] = useState<{ graph?: boolean; timeline?: boolean }>({});
  const saveTimers = useRef<{ graph?: number; timeline?: number }>({});
  const firstGraphRender = useRef(true);
  const firstTimelineRender = useRef(true);
  useEffect(
    () => () => {
      if (saveTimers.current.graph !== undefined) window.clearTimeout(saveTimers.current.graph);
      if (saveTimers.current.timeline !== undefined) window.clearTimeout(saveTimers.current.timeline);
    },
    [],
  );
  useEffect(() => {
    if (repo === undefined) return;
    if (firstGraphRender.current) {
      firstGraphRender.current = false;
      return;
    }
    if (saveTimers.current.graph !== undefined) window.clearTimeout(saveTimers.current.graph);
    setSaving((current) => ({ ...current, graph: true }));
    saveTimers.current.graph = window.setTimeout(() => {
      saveTimers.current.graph = undefined;
      repo
        .saveGraph(graph)
        .then(() => setSaving((current) => ({ ...current, graph: false })))
        .catch(() => {
          setSaving((current) => ({ ...current, graph: false }));
          toast("error", "Workspace save failed — the graph payload was rejected (invalid node id/label?).");
        });
    }, REPO_SAVE_DEBOUNCE_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph, repo]);
  useEffect(() => {
    if (repo === undefined) return;
    if (firstTimelineRender.current) {
      firstTimelineRender.current = false;
      return;
    }
    if (saveTimers.current.timeline !== undefined) window.clearTimeout(saveTimers.current.timeline);
    setSaving((current) => ({ ...current, timeline: true }));
    saveTimers.current.timeline = window.setTimeout(() => {
      saveTimers.current.timeline = undefined;
      repo
        .saveTimeline(timeline)
        .then(() => setSaving((current) => ({ ...current, timeline: false })))
        .catch(() => {
          setSaving((current) => ({ ...current, timeline: false }));
          toast("error", "Workspace save failed — the timeline payload was rejected.");
        });
    }, REPO_SAVE_DEBOUNCE_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeline, repo]);

  return {
    graph,
    timeline,
    links: normalizedLinks,
    positions,
    saving,
    setGraph,
    setLinks,
    resetPositions,
    moveNode,
    linkNodes,
    unlinkEdge,
    updateNode,
    autoArrange,
    addNodeAt,
    spawnLinkedChild,
    addMilestone,
    toggleSettled,
    deleteMilestone,
    exportSnapshot,
    importSnapshot,
    resetAll,
  };
}

/** The useWorkspaceState return type — the views share one contract. */
type WorkspaceState = ReturnType<typeof useWorkspaceState>;

/* ==========================================================================
   ANALYTICS & PLANNER (3.6.0) — the old "Graphs & Planner" module,
   RETITLED and promoted to its own view after the KnowledgeGraph moved
   to the Graph Studio. Three cards: Spending by Category (BarChart,
   per-bar maxes), Attendance Momentum (AreaChart, 8 points, sky), and
   the Milestone Manager (TimelineManager fully wired; inspect composes
   the EventModal) with the snapshot toolbar (Export / Import / Reset).
   ========================================================================== */

function AnalyticsPlannerView({ workspace }: { workspace: WorkspaceState }) {
  const modal = useModal<TimelineItem>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <div className="hub__row--2">
        <SurfaceCard
          eyebrow="Charts"
          meta="components/viz.tsx"
          title="Spending by Department"
          interactive
        >
          <div data-testid="spending-bars">
            <BarChart data={[...SPENDING_BARS]} label="Spending by department" />
          </div>
        </SurfaceCard>
        <SurfaceCard
          eyebrow="Charts"
          meta="components/viz.tsx"
          title="Attendance Momentum"
          interactive
        >
          <div data-testid="attendance-area">
            <AreaChart
              points={[...ATTENDANCE_MOMENTUM]}
              colorToken="--sig-sky"
              label="Attendance momentum"
            />
          </div>
        </SurfaceCard>
      </div>
      <SurfaceCard
        eyebrow="Planner"
        meta="components/timeline-manager.tsx"
        title="Milestone Manager"
        interactive
      >
        <div className="hub__snapshot" role="toolbar" aria-label="Snapshot tools">
          <Button
            size="sm"
            variant="secondary"
            leftIcon="Download"
            data-testid="snapshot-export"
            onClick={workspace.exportSnapshot}
          >
            Export JSON
          </Button>
          <Button
            size="sm"
            variant="secondary"
            leftIcon="Upload"
            data-testid="snapshot-import"
            onClick={() => fileInputRef.current?.click()}
          >
            Import JSON
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            hidden
            aria-hidden="true"
            tabIndex={-1}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file !== undefined) workspace.importSnapshot(file);
              event.target.value = "";
            }}
          />
          <Button
            size="sm"
            variant="danger"
            data-testid="snapshot-reset"
            onClick={workspace.resetAll}
          >
            Reset
          </Button>
          <span className="hub__sim-note">
            the workspace snapshot carries graph + timeline + links under sig.workspace.v3
          </span>
        </div>
        <div data-testid="milestone-manager">
          {/* 3.6.0 — THE REPOSITORY SKELETON: while a timeline save is in
              flight (the 600ms latency rehearsal), the affected card
              renders the skeleton row block; content returns on
              completion. */}
          {workspace.saving.timeline === true ? (
            <table className="sig-data-table" aria-hidden="true">
              <tbody>
                <SkeletonTableRow columns={3} />
                <SkeletonTableRow columns={3} />
                <SkeletonTableRow columns={3} />
              </tbody>
            </table>
          ) : (
            <TimelineManager
              items={workspace.timeline}
              onAdd={workspace.addMilestone}
              onToggleSettled={workspace.toggleSettled}
              onDelete={workspace.deleteMilestone}
              onInspect={modal.open}
              label="Milestone manager"
            />
          )}
        </div>
        {modal.selectedEvent !== null && (
          <EventModal
            event={modal.selectedEvent}
            open={modal.isOpen}
            onClose={modal.close}
          />
        )}
      </SurfaceCard>
    </>
  );
}

/**
 * THE CHRONICLE VIEW (2.8.0) — the Night of Versions, full-width: the
 * package's <ChronicleTimeline> rendering the complete 23-release
 * RELEASE_HISTORY inside the package's own <SurfaceCard>, with the
 * memorial nod beside it. The Index keeps its compact chronicle slab;
 * this view gives the memorial the whole stage.
 */
function ChronicleView() {
  return (
    <main className="hub hub--chronicle">
      <SurfaceCard eyebrow="Chronicle" meta="components/cards.tsx" title="The Night of Versions">
        <ChronicleTimeline releases={RELEASE_HISTORY} />
      </SurfaceCard>
      <SurfaceCard eyebrow="Memorial" meta="STORYBOOK.md" title="Twenty-three releases, one signature">
        <ProseBlock>
          <p>
            Every tag tells on the one before it — the token foundation grew a palette, the
            palette grew a conscience (the Rule of Engagement), the conscience grew
            primitives, archetypes, charts, a planner, and finally this studio. The engine
            never shipped a feature it could not copy-paste.
          </p>
          <blockquote>
            <p>“Twenty-three releases, one signature.”</p>
            <footer>— The Night of Versions</footer>
          </blockquote>
        </ProseBlock>
      </SurfaceCard>
    </main>
  );
}
