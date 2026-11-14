/**
 * App — THE ENGINE + THE MASTER INDEX (2.6.0 "Universal Developer Card
 * Suite, Chromatic Elevation & The Master Index Overhaul").
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
 * stops being a static board: `SEED_GUESTS` seeds a `Guest[]` state,
 * every check-in appends a row, and the bento REACTS — the ledger
 * table, the Confirmed Guests StatCard, the RSVP StatRing (its
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
 *                                    validation (guest-form).
 *
 * 2.3.0 — THE DASHBOARD GROWS MODULE TABS. The dashboard view gains the
 * package's <Tabs> (attribute-driven: aria-selected, ZERO .is-active
 * classes — the nav contract) switching three modules: "core" (the
 * live bento), "data" (the Guest & Budget Ledger —
 * <DataTable> with a composed <PartyBadge> status cell, the three
 * persistent <Callout> moods, five <Avatar> discs, two wearing party
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
 * every ProgressBar carries a limitText caption, and the new guests row
 * (170 / 200 on --party-sky, 85% — the RSVP ring's own ratio, coherent)
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
 *      cards), and "events"/"guests"/"budget" placeholder modules that
 *      dogfood the package's <EmptyState> primitive inside a
 *      <SurfaceCard>. Default view stays "dashboard" so the cortex
 *      smoke finds the timeline on load.
 *
 * TIMELINE HYDRATION (1.5.1, still load-bearing): the dashboard mirrors
 * the owner's real integration — source data lives in HIS shape
 * (`mockEvents`: id, month, title, time, colorToken, iconName) and is
 * mapped to the package contract (`PtpEvent`: date, category, icon) in
 * ONE explicit layer at the render boundary. ROOT CAUSE (SSR-probe
 * verified against the package): owner-shaped records passed straight
 * as PtpEvent[] render an empty timeline (undefined `date` buckets
 * everything under one key with a textless header; undefined
 * `category` throws in PartyBadge's token guard and unmounts the
 * timeline). The mapping layer below is why the nodes are alive.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, FormEvent, MouseEvent, ReactNode } from "react";
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
  PartyBadge,
  EmptyState,
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
  type NavItem,
  type PtpEvent,
  type DataTableColumn,
  type PartyTokenName,
  type AccentToken,
  type ChronicleRelease,
} from "@edwyn/signature-style/react";

/** Every view the switcher knows. Default is "dashboard" (cortex contract). */
type View = "dashboard" | "index" | "events" | "guests" | "budget";

/** The dashboard's Tabs modules (2.3.0) — id union + the Tabs contract. */
type ModuleId = "core" | "data" | "forms";

const MODULE_TABS: Array<{ id: ModuleId; label: string }> = [
  { id: "core", label: "Core Dashboard" },
  { id: "data", label: "Data & Tables" },
  { id: "forms", label: "Form & Input Matrix" },
];

/** The workshop modules — nav destinations without a view yet (2.1.0). */
type WorkshopView = Exclude<View, "dashboard" | "index">;

const VIEW_HREFS: Record<View, string> = {
  dashboard: "#/dashboard",
  events: "#/events",
  guests: "#/guests",
  budget: "#/budget",
  index: "#/index",
};

/** href → view, the SPA routing table (kept explicit, no derivation). */
const HREF_TO_VIEW: Record<string, View> = {
  "#/dashboard": "dashboard",
  "#/events": "events",
  "#/guests": "guests",
  "#/budget": "budget",
  "#/index": "index",
};

/** Nav order per owner: Dashboard, Events, Guests, Budget, Index. */
const NAV_ITEMS: NavItem[] = [
  { href: VIEW_HREFS.dashboard, label: "Dashboard" },
  { href: VIEW_HREFS.events, label: "Events" },
  { href: VIEW_HREFS.guests, label: "Guests" },
  { href: VIEW_HREFS.budget, label: "Budget" },
  { href: VIEW_HREFS.index, label: "Index" },
];

/**
 * The shared hero speaks per view: THE ENGINE on the dashboard, THE
 * MASTER INDEX at the index, THE WORKSHOP on placeholder modules.
 */
const HERO_COPY: Record<View, { title: string; sub: string }> = {
  dashboard: {
    title: "THE ENGINE",
    sub: "every primitive, one dashboard · live showcase",
  },
  index: {
    title: "THE MASTER INDEX",
    sub: "every archetype · one catalog · zero dead ends",
  },
  events: {
    title: "THE WORKSHOP",
    sub: "event manager under construction · shipping soon",
  },
  guests: {
    title: "THE WORKSHOP",
    sub: "guest manager under construction · shipping soon",
  },
  budget: {
    title: "THE WORKSHOP",
    sub: "budget tracker under construction · shipping soon",
  },
};

/** The placeholder modules' Shed anatomy (label / path / title). */
const PLACEHOLDERS: Record<WorkshopView, { label: string; path: string; title: string }> = {
  events: { label: "Events", path: "modules/events.tsx", title: "Event Manager" },
  guests: { label: "Guests", path: "modules/guests.tsx", title: "Guest Manager" },
  budget: { label: "Budget", path: "modules/budget.tsx", title: "Budget Tracker" },
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
 * The OWNER's source-data contract — the shape his records actually
 * arrive in (month/colorToken/iconName), kept byte-honest: mockEvents is
 * NOT a PtpEvent array. Every entry carries all six required fields;
 * optional `description` feeds the <EventModal> About row. Icon names are
 * strict lucide keys (gate-verified against the live icons map — a typo
 * fails `verify:playground` (h3), not a blank node at runtime).
 */
interface MockEvent {
  id: string;
  month: string;
  title: string;
  time: string;
  colorToken: PtpEvent["category"];
  iconName: NonNullable<PtpEvent["icon"]>;
  description?: string;
}

export const mockEvents: MockEvent[] = [
  {
    id: "evt-001",
    month: "December 2026",
    title: "Venue walkthrough",
    time: "18:00",
    colorToken: "--party-mauve-bright",
    iconName: "MapPin",
    description:
      "Walk the floor plan with the coordinator: staging, catering lane, and the photo corner. Bring the seating sketch.",
  },
  {
    id: "evt-002",
    month: "December 2026",
    title: "Band sound check",
    time: "19:30",
    colorToken: "--party-sky",
    // NOT "Music" — that key does not exist in the installed lucide-react
    // 1.72.0 icons map (gate-probed); "AudioLines" is the live-map-valid
    // equivalent, verified by the (h3) icon gate.
    iconName: "AudioLines",
  },
  {
    id: "evt-003",
    month: "December 2026",
    title: "Catering tasting",
    time: "13:00",
    colorToken: "--party-peach",
    iconName: "Utensils",
    description:
      "Three menu candidates. Confirm the vegan plate travels well and lock the dessert choice.",
  },
  {
    id: "evt-004",
    month: "January 2027",
    title: "Send invitations",
    time: "09:00",
    colorToken: "--party-pink-bright",
    iconName: "MailOpen",
    description:
      "Paper invites for family, digital for everyone else. RSVP window closes January 24.",
  },
  {
    id: "evt-005",
    month: "January 2027",
    title: "Final headcount",
    time: "17:00",
    colorToken: "--party-green",
    iconName: "ClipboardCheck",
  },
  {
    id: "evt-006",
    month: "February 2027",
    title: "The wedding day",
    time: "16:00",
    colorToken: "--party-lavender",
    iconName: "PartyPopper",
    description:
      "Ceremony at four, dinner at six. The timeline ends where the party begins.",
  },
];

/**
 * Short category words for the badge, derived from the owner's
 * colorToken so his records stay untouched by presentation concerns.
 */
const CATEGORY_LABELS: Record<PtpEvent["category"], string> = {
  "--party-pink-bright": "Invites",
  "--party-pink-soft": "Guests",
  "--party-pink-alt": "Decor",
  "--party-mauve-bright": "Venue",
  "--party-mauve-soft": "Admin",
  "--party-lavender": "Ceremony",
  "--party-sky": "Music",
  "--party-blue": "Logistics",
  "--party-peach": "Catering",
  "--party-green": "RSVP",
  "--party-yellow": "Meter",
};

/**
 * THE MAPPING LAYER — the one place where the owner's source contract
 * meets the package contract. `month → date`, `colorToken → category`,
 * `iconName → icon`. 1.5.0's root cause was this layer not existing:
 * `date`/`category`/`icon` came through undefined and the timeline
 * rendered empty headers with no events.
 */
export const events: PtpEvent[] = mockEvents.map((e) => ({
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
   SEED_GUESTS is the ledger's opening state; every check-in APPENDS to
   it, and every live read (ledger rows, Confirmed Guests StatCard, the
   RSVP ring, the budget bars) is a useMemo derivative. STATE → DERIVED
   → WIRING lives in DashboardView → BentoCore below.
   ========================================================================== */

/** One guest in the live ledger. RSVP is the three-word contract. */
interface Guest {
  id: string;
  name: string;
  rsvp: "confirmed" | "pending" | "declined";
  contribution: number;
}

/** The ledger's opening five — the v2.3.0 crew, now typed and live. */
const SEED_GUESTS: Guest[] = [
  { id: "g-001", name: "Ana Souza", rsvp: "confirmed", contribution: 120 },
  { id: "g-002", name: "Leo Martins", rsvp: "pending", contribution: 0 },
  { id: "g-003", name: "Priya Nair", rsvp: "confirmed", contribution: 200 },
  { id: "g-004", name: "Tom Weller", rsvp: "declined", contribution: 0 },
  { id: "g-005", name: "Ana + 1", rsvp: "pending", contribution: 120 },
];

/** The party's two fixed denominators (the metrics' limit captions). */
const TOTAL_BUDGET = 2000;
const GUEST_CAPACITY = 200;

/** RSVP value → ledger word (the RadioCardGroup submits the left key). */
const RSVP_TO_STATE: Record<string, Guest["rsvp"]> = {
  attending: "confirmed",
  maybe: "pending",
  declined: "declined",
};

const RSVP_LABELS: Record<Guest["rsvp"], string> = {
  confirmed: "Confirmed",
  pending: "Pending",
  declined: "Declined",
};

/** The live ledger's columns — Contribution numeric + align right. */
const BENTO_LEDGER_COLUMNS: DataTableColumn[] = [
  { key: "guest", header: "Guest" },
  { key: "rsvp", header: "RSVP" },
  { key: "share", header: "Contribution", numeric: true, align: "right" },
];

/** All ten Party Palette tokens with their human names (content-only rule). */
const PALETTE: ReadonlyArray<{ token: PtpEvent["category"]; label: string }> = [
  { token: "--party-pink-bright", label: "Pink" },
  { token: "--party-pink-soft", label: "Soft pink" },
  { token: "--party-pink-alt", label: "Alt pink" },
  { token: "--party-mauve-bright", label: "Mauve" },
  { token: "--party-mauve-soft", label: "Soft mauve" },
  { token: "--party-lavender", label: "Lavender" },
  { token: "--party-sky", label: "Sky" },
  { token: "--party-blue", label: "Blue" },
  { token: "--party-peach", label: "Peach" },
  { token: "--party-green", label: "Green" },
];

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
 * THE SHELL — view state + the always-visible chrome (nav + hero), then
 * the per-view body. The default view stays "dashboard" so the cortex
 * smoke finds the timeline on load.
 */
function Shell() {
  const [view, setView] = useState<View>("dashboard");
  const navigate = useCallback((href: string) => setView(HREF_TO_VIEW[href] ?? "dashboard"), []);
  // Rebuilt per view — the closure stamps aria-current on the ACTIVE link.
  const navLink = useMemo(() => createHubLink(navigate, VIEW_HREFS[view]), [navigate, view]);
  const hero = HERO_COPY[view];

  return (
    <>
      <GlobalNav items={NAV_ITEMS} as={navLink} activeHref={VIEW_HREFS[view]} />
      {/* 2.5.0 — THE SHELL: every view's content lives inside this
          column (hero + dashboard + index + placeholders + ALL tab
          modules). GlobalNav stays outside — it is its own bar. This
          wrapper is defect #1's tombstone. */}
      <div className="sig-shell">
        <PageHero title={hero.title} subtitle={hero.sub} />
        {view === "dashboard" ? (
          <DashboardView />
        ) : view === "index" ? (
          <IndexView onNavigate={navigate} />
        ) : (
          <PlaceholderView view={view} />
        )}
      </div>
    </>
  );
}

/**
 * The dashboard — view state + THE LIVE LEDGER (2.5.0). The guests
 * array lives HERE (above the module switch) so checking in survives
 * tab flips; the core module renders <BentoCore>, the data/forms
 * showcases render below it — ALL inside the shell (styles.css).
 */
function DashboardView() {
  const [moduleId, setModuleId] = useState<ModuleId>("core");
  // THE LIVE STATE — one array, every metric derives from it.
  const [guests, setGuests] = useState<Guest[]>(SEED_GUESTS);
  const checkIn = useCallback(
    (guest: { name: string; rsvp: Guest["rsvp"]; contribution: number }) => {
      setGuests((current) => [
        ...current,
        {
          id: `g-${String(current.length + 1).padStart(3, "0")}`,
          name: guest.name,
          rsvp: guest.rsvp,
          contribution: guest.contribution,
        },
      ]);
    },
    [],
  );

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
          <FormsModule />
        </div>
      ) : (
        <div className="hub__tabs-content">
          <BentoCore guests={guests} onCheckIn={checkIn} />
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
 *   span 4   StatCard ×3 — Total Budget / Confirmed Guests (LIVE) /
 *            Active Game Rooms
 *   span 5   Quick Guest Check-In (the live-validation form)
 *   span 4   The Chronology, ROW-SPAN 2 (timeline + modal, unchanged)
 *   span 3   Budget & RSVP Telemetry (ring + bars, LIVE)
 *   span 5   Interactive Deck & Rules (FlipCard / AccordionCard /
 *            ActionTile row)
 *   span 3   The Party Palette (unchanged badges)
 *   span 7   Guest & Budget Ledger (DataTable, LIVE from state)
 *   span 5   1v1 Game Matchup & Editorial (MatchupCard + ProseBlock)
 *
 * DERIVED (useMemo over guests): confirmedCount, potTotal (sum of
 * CONFIRMED contributions), ringValue = confirmed/200 %, spentPct =
 * potTotal/2000 %, ledgerRows (formatted for DataTable).
 */
function BentoCore({
  guests,
  onCheckIn,
}: {
  guests: Guest[];
  onCheckIn: (guest: { name: string; rsvp: Guest["rsvp"]; contribution: number }) => void;
}) {
  const toast = useToast();
  const modal = useModal<PtpEvent>();
  const [bannerVisible, setBannerVisible] = useState(true);

  // DERIVED — the single useMemo every live read consumes. Causal by
  // construction: it reads only the current guests array.
  const derived = useMemo(() => {
    const confirmed = guests.filter((guest) => guest.rsvp === "confirmed");
    const confirmedCount = confirmed.length;
    const potTotal = confirmed.reduce((sum, guest) => sum + guest.contribution, 0);
    const ringValue = Math.min(100, Math.round((confirmedCount / GUEST_CAPACITY) * 100));
    const spentPct = Math.min(100, Math.round((potTotal / TOTAL_BUDGET) * 100));
    const ledgerRows = guests.map((guest) => ({
      guest: guest.name,
      rsvp:
        guest.rsvp === "confirmed" ? (
          <PartyBadge colorToken="--party-green" label="Confirmed" />
        ) : (
          RSVP_LABELS[guest.rsvp]
        ),
      share: `$${guest.contribution.toLocaleString("en-US")}`,
    }));
    return { confirmedCount, potTotal, ringValue, spentPct, ledgerRows };
  }, [guests]);

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
              v2.6.0 — live state mode: check in a guest and watch the
              ledger, ring, and toast react.
            </span>
          </AnnouncementBanner>
        </div>
      )}

      {/* span 4 ×3 — the KPI trio (the middle cell carries the trio's
          cortex hook; its value is LIVE) */}
      <div className="sig-span-4">
        <StatCard
          label="Total Budget"
          value={`$${TOTAL_BUDGET.toLocaleString("en-US")}`}
          delta="+$440"
          deltaDirection="up"
          sparklineData={[1200, 1450, 1380, 1600, 1780, TOTAL_BUDGET]}
          colorToken="--party-green"
        />
      </div>
      <div className="sig-span-4" data-testid="kpi-trio">
        <StatCard
          label="Confirmed Guests"
          value={String(derived.confirmedCount)}
          delta="live"
          sparklineData={[2, 3, 3, 4, 4, derived.confirmedCount]}
          colorToken="--party-sky"
        />
      </div>
      <div className="sig-span-4">
        <StatCard
          label="Active Game Rooms"
          value="6"
          delta="+2"
          deltaDirection="up"
          sparklineData={[2, 3, 3, 4, 4, 6]}
          colorToken="--party-mauve-soft"
        />
      </div>

      {/* span 5 — Quick Guest Check-In (live validation + Button) */}
      <SurfaceCard
        eyebrow="Forms"
        meta="components/forms.tsx"
        title="Quick Guest Check-In"
        interactive
        className="sig-span-5"
      >
        <CheckInForm onCheckIn={onCheckIn} />
      </SurfaceCard>

      {/* span 4, ROW-SPAN 2 — The Chronology (timeline + modal) */}
      <SurfaceCard
        eyebrow="Timeline"
        meta="components/timeline.tsx"
        title="The Chronology"
        interactive
        className="sig-span-4 sig-row-2 hub__card--timeline"
      >
        <EventTimeline events={events} onEventSelect={modal.open} />
        {modal.selectedEvent !== null && (
          <EventModal
            event={modal.selectedEvent}
            open={modal.isOpen}
            onClose={modal.close}
          />
        )}
      </SurfaceCard>

      {/* span 3 — Budget & RSVP Telemetry (LIVE) */}
      <SurfaceCard
        eyebrow="Telemetry"
        meta="components/viz.tsx"
        title="Budget & RSVP Telemetry"
        interactive
        className="sig-span-3"
      >
        <div className="hub__metric" data-testid="metric-guests">
          <span className="hub__metric-label">Guests confirmed</span>
          <span className="hub__metric-value">
            {derived.confirmedCount} / {GUEST_CAPACITY}
          </span>
        </div>
        <ProgressBar
          value={derived.ringValue}
          colorToken="--party-sky"
          label="Guests confirmed"
          limitText={`${derived.confirmedCount} / ${GUEST_CAPACITY} Guests`}
        />
        <div className="hub__metric" data-testid="metric-rsvp">
          <span className="hub__metric-label">RSVP ratio</span>
          <span className="hub__metric-value">{derived.ringValue}%</span>
        </div>
        {/* LIVE RING — the stroke-dashoffset glides via the
            playground-scoped rule (styles.css); viz.tsx byte-frozen. */}
        <div data-testid="ring-rsvp">
          <StatRing value={derived.ringValue} colorToken="--party-sky" label="RSVP ratio" />
        </div>
        <div className="hub__metric" data-testid="metric-budget-spent">
          <span className="hub__metric-label">Budget spent</span>
          <span className="hub__metric-value">{derived.spentPct}%</span>
        </div>
        <ProgressBar
          value={derived.spentPct}
          colorToken="--party-peach"
          label="Budget spent"
          limitText={`$${derived.potTotal.toLocaleString("en-US")} / $${TOTAL_BUDGET.toLocaleString("en-US")}`}
        />
        <div className="hub__metric" data-testid="metric-budget-remaining">
          <span className="hub__metric-label">Budget remaining</span>
          <span className="hub__metric-value">{100 - derived.spentPct}%</span>
        </div>
        <ProgressBar
          value={100 - derived.spentPct}
          colorToken="--party-green"
          label="Budget remaining"
          limitText={`$${(TOTAL_BUDGET - derived.potTotal).toLocaleString("en-US")} / $${TOTAL_BUDGET.toLocaleString("en-US")}`}
        />
      </SurfaceCard>

      {/* span 5 — Interactive Deck & Rules (the archetypes) */}
      <SurfaceCard
        eyebrow="Deck"
        meta="components/cards.tsx"
        title="Interactive Deck & Rules"
        interactive
        className="sig-span-5"
      >
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
          onClick={() => toast("success", "RSVP sent — see you there 🎉")}
        >
          Send test toast
        </Button>
      </SurfaceCard>

      {/* span 3 — The Party Palette (unchanged badges) */}
      <SurfaceCard
        eyebrow="Palette"
        meta="components/primitives.tsx"
        title="The Party Palette"
        interactive
        className="sig-span-3"
      >
        <div className="hub__palette">
          {PALETTE.map(({ token, label }) => (
            <PartyBadge key={token} colorToken={token} label={label} />
          ))}
        </div>
      </SurfaceCard>

      {/* span 7 — Guest & Budget Ledger (LIVE) */}
      <SurfaceCard
        eyebrow="Data"
        meta="components/data.tsx"
        title="Guest & Budget Ledger"
        interactive
        className="sig-span-7"
      >
        <div data-testid="ledger-table">
          <DataTable
            columns={BENTO_LEDGER_COLUMNS}
            rows={derived.ledgerRows}
            caption="Shared pot ledger · live — every check-in lands here"
          />
        </div>
        <Callout status="info">
          Payments settle via the shared pot — no cash at the door.
        </Callout>
      </SurfaceCard>

      {/* span 5 — 1v1 Game Matchup & Editorial */}
      <SurfaceCard
        eyebrow="Games"
        meta="components/cards.tsx"
        title="1v1 Game Matchup & Editorial"
        interactive
        className="sig-span-5"
      >
        <MatchupCard
          left={{ name: "Ana Souza", ringToken: "--party-mauve-soft" }}
          right={{ name: "Leo Martins", ringToken: "--party-sky" }}
          stakes="Winner picks the next venue — loser brings the ice."
        />
        <ProseBlock>
          <p>
            The bracket is a promise: two names, one round, a verdict
            everyone accepts. The ledger above feeds it — confirmed
            guests seed the pairs, and every forfeit re-shuffles the
            deck.
          </p>
          <blockquote>
            <p>“A party without a bracket is just a crowd with snacks.”</p>
            <footer>— the tournament ledger, page one</footer>
          </blockquote>
          <cite>PlanThenParty Field Notes, vol. 3 — the matchup chapters</cite>
        </ProseBlock>
      </SurfaceCard>
    </main>
  );
}

/**
 * CHECKINFORM — the Quick Guest Check-In surface (2.5.0). Local field
 * state + LIVE validation:
 *
 *   Contribution — /^\d+$/ → validMessage; non-empty and failing →
 *                  error (the well shakes; the border goes peach).
 *   Postal Code  — /^\d{5}$/ → "Valid ZIP" / error otherwise.
 *   Name         — required (submit-level: the toast refuses).
 *
 * SUBMIT (form onSubmit, preventDefault): invalid → an error toast;
 * valid → a short loading state on the <Button>, then the guest rides
 * up to DashboardView's state, the success toast fires ("Checked in —
 * see you there 🎉"), and the fields reset.
 */
function CheckInForm({
  onCheckIn,
}: {
  onCheckIn: (guest: { name: string; rsvp: Guest["rsvp"]; contribution: number }) => void;
}) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [contribution, setContribution] = useState("");
  const [postal, setPostal] = useState("");
  const [rsvp, setRsvp] = useState("attending");
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
  const trimmedContribution = contribution.trim();
  const contributionValid = /^\d+$/.test(trimmedContribution);
  const contributionError =
    trimmedContribution !== "" && !contributionValid
      ? "The contribution must be a number"
      : undefined;
  const postalValid = /^\d{5}$/.test(postal);
  const postalError =
    postal !== "" && !postalValid ? "Postal codes are 5 digits" : undefined;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (name.trim() === "" || !contributionValid) {
      toast("error", "A name and a numeric contribution are required to check in.");
      return;
    }
    setSubmitting(true);
    submitTimer.current = window.setTimeout(() => {
      onCheckIn({
        name: name.trim(),
        rsvp: RSVP_TO_STATE[rsvp] ?? "pending",
        contribution: Number(trimmedContribution),
      });
      toast("success", "Checked in — see you there 🎉");
      setName("");
      setContribution("");
      setPostal("");
      setRotation(false);
      setSubmitting(false);
      submitTimer.current = null;
    }, 450);
  };

  return (
    <form className="hub__checkin" data-testid="guest-form" onSubmit={handleSubmit}>
      {/* 2.6.0 form audit: the Name field carries its format rule as a
          description — rendered ABOVE the input (the defect-#2 anatomy;
          every FormField description in this playground greps desc-
          before-well). */}
      <FormField
        label="Name"
        htmlFor="checkin-name"
        required
        description="The guest's full name — as it reads on the invite"
      >
        <Input
          id="checkin-name"
          required
          placeholder="Guest name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </FormField>
      {/* The money field: "$" rides the chip (defect #2), the format
          rule rides the description ABOVE the input, and the value is
          live-validated. */}
      <FormField
        label="Contribution"
        htmlFor="checkin-share"
        prefix="$"
        description="Numbers only · e.g., 120"
        validMessage={contributionValid ? "Valid amount" : undefined}
        error={contributionError}
      >
        <Input
          id="checkin-share"
          placeholder="120"
          inputMode="numeric"
          aria-invalid={!!contributionError || undefined}
          value={contribution}
          onChange={(event) => setContribution(event.target.value)}
        />
      </FormField>
      <FormField
        label="Postal Code"
        htmlFor="checkin-postal"
        description="5 numbers only · e.g., 79901"
        validMessage={postalValid ? "Valid ZIP" : undefined}
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
        label="RSVP"
        name="checkin-rsvp"
        value={rsvp}
        onChange={setRsvp}
        options={[
          { value: "attending", label: "Attending", description: "See you there" },
          { value: "maybe", label: "Maybe", description: "Leaning yes — will confirm" },
          { value: "declined", label: "Can't make it", description: "Sorry — next time" },
        ]}
      />
      {/* 2.4.1's visible switch label, exercised: "Add to game
          rotation" renders as text beside the pill. */}
      <ToggleSwitch
        checked={rotation}
        onToggle={setRotation}
        label="Add to game rotation"
      />
      <Button variant="primary" size="md" type="submit" loading={submitting}>
        Check In
      </Button>
    </form>
  );
}

/**
 * One gateway card in THE MASTER INDEX — a door to a module. 2.6.0: the
 * door gains its chromatic accent (Flamingo for the structural planner
 * door, party tokens for the content doors).
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
 * the milestone accents cycle the party palette.
 */
const RELEASE_HISTORY: ChronicleRelease[] = [
  {
    tag: "v0.1.0",
    title: "The Token Foundation",
    story: "Linux-terminal palette, Token Cascade, Override Protocol, hardened ThemeProvider.",
    stat: "34 tokens · 1 demo",
    accentToken: "--party-lavender",
  },
  {
    tag: "v0.2.0",
    title: "Catppuccin Edition",
    story: "The palette went 100% official Catppuccin — every color mapped, nothing invented.",
    stat: "mocha + latte",
    accentToken: "--party-blue",
  },
  {
    tag: "v0.3.0",
    title: "Harmonized Catppuccin",
    story: "Per-theme Flamingo/Teal signatures; the retired accents banned everywhere.",
    stat: "structural UI locked",
    accentToken: "--party-sky",
  },
  {
    tag: "v0.4.0",
    title: "Party Palette",
    story: "Ten content-only tokens — the Rule of Engagement draws the chrome/content line.",
    stat: "10 tokens reserved",
    accentToken: "--party-pink-bright",
  },
  {
    tag: "v0.5.0",
    title: "Pruning Protocol + React Primitives",
    story: "Icon, EmptyState, PartyBadge — flat DOM, typed tokens, zero wrappers.",
    stat: "3 primitives",
    accentToken: "--party-green",
  },
  {
    tag: "v0.6.0",
    title: "Event Timeline",
    story: "The chronology: grouped months, sticky glass headers, one line of nodes.",
    stat: "sticky headers",
    accentToken: "--party-mauve-soft",
  },
  {
    tag: "v0.7.0",
    title: "Event Modal",
    story: "Portalled dialog, neutral scrim, Escape — the z-pillars earn their rungs.",
    stat: "z 40 / 50",
    accentToken: "--party-peach",
  },
  {
    tag: "v1.0.0",
    title: "Publish Flow & Distribution",
    story: "npm-ready: exports map, tag-driven publish, tokens.json as the AI core.",
    stat: "3 export paths",
    accentToken: "--party-yellow",
  },
  {
    tag: "v1.1.0",
    title: "Storybook — The Human Interface",
    story: "The philosophy, every token, every component — readable like a book.",
    stat: "docs only",
    accentToken: "--party-pink-soft",
  },
  {
    tag: "v1.2.0",
    title: "GlobalNav",
    story: "Sticky navbar, drawer, aria-current — the attribute IS the state.",
    stat: "--z-nav 30",
    accentToken: "--party-lavender",
  },
  {
    tag: "v1.3.0",
    title: "Telemetry Module",
    story: "ProgressBar + StatRing — data-ink doctrine, 8px tracks, surface fills.",
    stat: "8px grid",
    accentToken: "--party-sky",
  },
  {
    tag: "v1.4.0",
    title: "Input & Feedback Layer",
    story: "Inputs, switches, selects, toasts at the zenith rung — the whitelist completes.",
    stat: "whitelist 33",
    accentToken: "--party-green",
  },
  {
    tag: "v1.5.0",
    title: "Bento Box Showcase",
    story: "The playground dashboard: every primitive, one bento.",
    stat: "playground born",
    accentToken: "--party-peach",
  },
  {
    tag: "v1.6.0",
    title: "Ambient Elevation & Timeline Resurrection",
    story: "The inset-highlight + ambient treaty; the sticky-header bug found, fixed.",
    stat: "(e1) born",
    accentToken: "--party-mauve-bright",
  },
  {
    tag: "v1.7.0",
    title: "The Visual Cortex",
    story: "The MCP server: layout sweeps + screenshots as release-blocker proof.",
    stat: "2 tools",
    accentToken: "--party-blue",
  },
  {
    tag: "v1.8.0",
    title: "Bento Refinement & Spatial Harmony",
    story: "Glass headers, metric air, breathing bars — the 8px grid everywhere.",
    stat: "spatial pass",
    accentToken: "--party-pink-bright",
  },
  {
    tag: "v2.0.0",
    title: "The Hub Migration",
    story: "The Shed aesthetic: meta row → ruled title → content; gateway doors.",
    stat: "sig-* born",
    accentToken: "--party-lavender",
  },
  {
    tag: "v2.1.0",
    title: "Timeline Breathing Room & The Master Index",
    story: "The −1px overlap measured and fixed; the index gets its three doors.",
    stat: "measured",
    accentToken: "--party-sky",
  },
  {
    tag: "v2.2.0",
    title: "Telemetry Limits & Official Surface Primitives",
    story: "Limit captions on every bar; the Shed anatomy promoted into the package.",
    stat: "pack 37",
    accentToken: "--party-peach",
  },
  {
    tag: "v2.3.0",
    title: "Universal Web Components & AI Signature Codex",
    story: "DataTable, Tabs, Callouts, Avatars — the codex ships with the package.",
    stat: "pack 40",
    accentToken: "--party-green",
  },
  {
    tag: "v2.4.0",
    title: "Form Wrappers & Editorial Primitives",
    story: "FormFields, RadioCards, Carousel, Prose, Banners, StatCards, Sparklines.",
    stat: "pack 43",
    accentToken: "--party-mauve-soft",
  },
  {
    tag: "v2.5.0",
    title: "Ergonomic Form Rules, Button & Card Archetypes, and the 12-Column Bento",
    story: "Five owner defects buried: shell, desc-above forms, labels, align, live bento.",
    stat: "whitelist 34",
    accentToken: "--party-pink-bright",
  },
  {
    tag: "v2.6.0",
    title: "Universal Developer Card Suite",
    story: "The catalog became the product: chromatic elevation, the master index overhaul.",
    stat: "5 archetypes · 3 tiers · 11 accents",
    accentToken: "--party-yellow",
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
  const gateways: Gateway[] = [
    {
      label: "PLANNER",
      path: "views/planner.tsx",
      title: "Event & Party Planner",
      description:
        "The live dashboard — timeline, telemetry, forms, palette. Click to return.",
      accent: "--color-cake-primary",
      action: () => onNavigate(VIEW_HREFS.dashboard),
    },
    {
      label: "STUDY",
      path: "modules/study.tsx",
      title: "Study & Flashcard Engine",
      description: "Deck generation and spaced-repetition flashcards for study groups.",
      accent: "--party-lavender",
      action: () => toast("success", "The study module is on the roadmap."),
    },
    {
      label: "ARENA",
      path: "modules/games.tsx",
      title: "Party Game Arena",
      description:
        "40 curated party & shot games with 1v1 / 2v2 spectator betting frameworks.",
      accent: "--party-peach",
      action: () => toast("success", "The party games module is on the roadmap."),
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

      {showCatalog && (
        <div className="hub__row--3" data-testid="index-catalog">
          <ContentCard
            category="Catering"
            categoryToken="--party-peach"
            meta={["25 MIN", "SPICY", "$14"]}
            accentToken="--party-yellow"
            title="Birria & Street Taco Catering"
            description="Slow-braised birria, consomé on the side, the salsa roja that silences the table. The taco cart parks at your gate and feeds the line until the last guest waves the white flag."
            action={{ label: "Book the taco cart" }}
          />
          <ReferenceCard
            tag="JSX"
            title="The Signature Surface"
            accentToken="--party-sky"
            code={SURFACE_SNIPPET}
            link="#/index"
            onCopied={() => toast("success", "Snippet copied — paste it anywhere.")}
          />
          <TierCard
            name="Arena Pass"
            price="$49"
            featured
            accentToken="--party-mauve-soft"
            features={[
              "All 40 game modules",
              "1v1 & 2v2 brackets",
              "Spectator betting pot",
              "Priority seating",
            ]}
            cta="Claim the pass"
            onCta={() => toast("success", "The Arena Pass is on the roadmap.")}
          />
        </div>
      )}

      {showFood && (
        <div data-testid="index-food">
          <SurfaceCard
            eyebrow="Food"
            meta="components/editorial.tsx"
            title="Field Notes & Carousel"
            interactive
          >
            <Carousel label="Developer & lifestyle cards">
              <CarouselItem className="hub__clipping">
                <div className="hub__mini-card">
                  <strong>Books</strong>
                  <span>The Design of Everyday Things — affordances are promises.</span>
                </div>
              </CarouselItem>
              <CarouselItem className="hub__clipping">
                <div className="hub__mini-card">
                  <strong>Cocktails</strong>
                  <span>Smoked Old Fashioned — the cherry is not optional.</span>
                </div>
              </CarouselItem>
              <CarouselItem className="hub__clipping">
                <div className="hub__mini-card">
                  <strong>UI Patterns</strong>
                  <span>Empty States That Sell — a blank card is a sales pitch.</span>
                </div>
              </CarouselItem>
              <CarouselItem className="hub__clipping">
                <div className="hub__mini-card">
                  <strong>Hardware</strong>
                  <span>Keychron Q1 HE — the hall-effect keyboard of the shed.</span>
                </div>
              </CarouselItem>
              <CarouselItem className="hub__clipping">
                <div className="hub__mini-card">
                  <strong>Party Games</strong>
                  <span>Ribbon of Shame — the loser wears it until the next round.</span>
                </div>
              </CarouselItem>
            </Carousel>
          </SurfaceCard>
        </div>
      )}

            {showProfiles && (
        <div className="hub__row--4" data-testid="index-profiles">
          <ProfileCard
            name="Ana Souza"
            role="Head of Catering"
            accentToken="--party-peach"
            stats={[
              { label: "Events", value: "24" },
              { label: "Guests", value: "412" },
              { label: "Rating", value: "4.9" },
            ]}
            skills={[
              { colorToken: "--party-peach", label: "Catering" },
              { colorToken: "--party-green", label: "Logistics" },
            ]}
          />
          <FlipCard front="Dare: karaoke the chorus" back="…or forfeit 10 points" />
          <AccordionCard title="House Rules">
            <p>
              Best of one decides every matchup; ties resolve to
              rock-paper-scissors and the loser of THAT brings ice.
            </p>
            <p>
              No take-backs after the ring sounds — the bracket is a
              promise everyone accepts.
            </p>
          </AccordionCard>
          <MatchupCard
            left={{ name: "Ana Souza", ringToken: "--party-mauve-soft" }}
            right={{ name: "Leo Martins", ringToken: "--party-sky" }}
            stakes="Winner picks the venue — loser brings ice."
          />
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
  eyebrow="Planner"
  meta="views/planner.tsx"
  title="Event & Party Planner"
  interactive accentToken="--party-lavender"
>
  <ProgressBar value={72} colorToken="--party-sky" label="RSVP ratio" />
</SurfaceCard>`;

/**
 * THE LEDGER — the data module's table contract (2.3.0). Status cells
 * are ReactNode: one row composes a <PartyBadge> to show a badge living
 * inside the table, the rest stay plain text (keep td text simple —
 * composition is demonstrated once, not everywhere).
 */
const LEDGER_COLUMNS: DataTableColumn[] = [
  { key: "guest", header: "Guest" },
  { key: "status", header: "Status" },
  // 2.4.1: align flows to BOTH th and td — the CONTRIBUTION header sits
  // flush over the $120 values (numeric alone left the header behind).
  { key: "share", header: "Contribution", numeric: true, align: "right" },
];

const LEDGER_ROWS: Array<Record<string, ReactNode>> = [
  {
    guest: "Ana Souza",
    status: <PartyBadge colorToken="--party-green" label="Confirmed" />,
    share: "$120",
  },
  { guest: "Leo Martins", status: "Pending", share: "$0" },
  { guest: "Priya Nair", status: "Confirmed", share: "$200" },
  { guest: "Tom Weller", status: "Declined", share: "$0" },
  { guest: "Ana + 1", status: "Pending", share: "$120" },
];

/** The data module's five crew discs — 32px ×3, 40px ×2, two party rings. */
const AVATAR_CREW: Array<{
  name: string;
  size?: 32 | 40;
  ringToken?: PartyTokenName;
}> = [
  { name: "Ana Souza", ringToken: "--party-mauve-soft" },
  { name: "Leo Martins" },
  { name: "Priya Nair" },
  { name: "Tom Weller", size: 40, ringToken: "--party-sky" },
  { name: "Ana + 1", size: 40 },
];

/**
 * THE DATA & TABLES MODULE (2.3.0, grown 2.4.0) — the package's
 * <DataTable>, <Callout> and <Avatar> dogfooded in one card: the ledger
 * (with the composed PartyBadge), the three persistent callout moods,
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
      <div className="hub__kpis" data-testid="kpi-trio">
        <StatCard
          label="Total Budget"
          value="$2,000"
          delta="+$440"
          deltaDirection="up"
          sparklineData={[1200, 1450, 1380, 1600, 1780, 2000]}
          colorToken="--party-green"
        />
        <StatCard
          label="Confirmed Guests"
          value="170"
          delta="+12"
          deltaDirection="up"
          sparklineData={[118, 126, 132, 141, 158, 170]}
          colorToken="--party-sky"
        />
        <StatCard
          label="Active Game Rooms"
          value="6"
          delta="+2"
          deltaDirection="up"
          sparklineData={[2, 3, 3, 4, 4, 6]}
          colorToken="--party-mauve-soft"
        />
      </div>
      <SurfaceCard
        eyebrow="Data"
        meta="components/data.tsx"
        title="Guest & Budget Ledger"
        interactive
      >
        <div data-testid="data-table-ledger">
          <DataTable
            columns={LEDGER_COLUMNS}
            rows={LEDGER_ROWS}
            caption="Shared pot ledger · updated after every RSVP"
          />
        </div>
        <Callout status="info">
          Payments settle via the shared pot — no cash at the door.
        </Callout>
        <Callout status="success">Final headcount locked for catering.</Callout>
        <Callout status="warning">3 pending RSVPs close Friday.</Callout>
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
              Every invitation in this planner starts as a row in the shared pot
              ledger and ends as a night nobody has to Venmo-chase. The numbers
              stay boring on purpose — boring numbers are the ones that survive
              contact with a real guest list.
            </p>
            <p>
              When a figure changes, it changes here first: the budget card, the
              ring, the sparkline — and the story above stays honest. Design the
              ledger well and the party practically plans itself.
            </p>
            <blockquote>
              <p>
                “Weeks of coding can save you hours of planning.”
              </p>
              <footer>— every developer who ever planned a wedding, probably</footer>
            </blockquote>
            <cite>PlanThenParty Field Notes, vol. 2 — the ledger chapters</cite>
          </ProseBlock>
        </div>
        <div data-testid="carousel-clippings">
          <Carousel label="Palette clippings">
            {PALETTE.slice(0, 5).map(({ token, label }) => (
              <CarouselItem key={token} className="hub__clipping">
                <PartyBadge colorToken={token} label={label} />
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
 * wrappers). 2.4.0: Name / $ Contribution preview the <FormField>
 * wrapper side-by-side (hint on the first, error-replaces-hint on the
 * second), and the RSVP sample is a <RadioCardGroup>.
 */
function FormsModule() {
  const [diet, setDiet] = useState("none");
  const [invited, setInvited] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [contribution, setContribution] = useState("");
  const [postal, setPostal] = useState("");
  const [password, setPassword] = useState("");
  const [rsvp, setRsvp] = useState("attending");

  // Live validation rules (2.5.0, audited 2.6.0): the value passes →
  // validMessage; the value is non-empty and fails → error. Empty (or
  // a pristine pre-filled value like the placeholder's example "120")
  // stays quiet — a field the visitor never touched is not yet wrong.
  // THE 2.6.0 AUDIT: the matrix Contribution field used to boot in the
  // ERROR state (empty → "enter an amount" on first paint); it now
  // skips pristine exactly like the Postal field and the check-in form.
  const contributionTrimmed = contribution.trim();
  const contributionValid = /^\d+$/.test(contributionTrimmed);
  const contributionError =
    contributionTrimmed !== "" && !contributionValid
      ? "Contributions are numbers only"
      : undefined;
  const postalValid = /^\d{5}$/.test(postal);
  const postalError = postal !== "" && !postalValid ? "Postal codes are 5 digits" : undefined;

  return (
    <SurfaceCard
      eyebrow="Forms"
      meta="components/forms.tsx"
      title="The Input Matrix"
      interactive
    >
      <div className="hub__form-grid">
        <FormField
          label="Name"
          htmlFor="matrix-name"
          hint="As it appears on the invite"
        >
          <Input
            id="matrix-name"
            placeholder="Guest name"
            value={guestName}
            onChange={(event) => setGuestName(event.target.value)}
          />
        </FormField>
        {/* 2.4.1: label="Contribution" + prefix="$" — the adornment
            composition demo (the dollar sign moved OUT of the label and
            INTO the mono chip, flush with the cursor in the well).
            2.5.0: the field rides the well — the Input is bare, the
            well owns the border. 2.6.0 audit: the field no longer BOOTS
            in the error state — empty stays pristine-quiet, valid values
            earn the validMessage, only non-empty invalid input shakes. */}
        <FormField
          label="Contribution"
          htmlFor="matrix-share"
          prefix="$"
          description="Numbers only · e.g., 120"
          validMessage={contributionValid ? "Valid amount" : undefined}
          error={contributionError}
        >
          <Input
            id="matrix-share"
            placeholder="120"
            inputMode="numeric"
            aria-invalid={!!contributionError || undefined}
            value={contribution}
            onChange={(event) => setContribution(event.target.value)}
          />
        </FormField>
        {/* 2.5.0: the Postal Code demo — description ABOVE the input
            (format rules live with the title), live validation with the
            validMessage/error priority in the bottom slot. */}
        <FormField
          label="Postal Code"
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
      <TextArea placeholder="Notes for the host…" rows={3} aria-label="Notes" />
      <Select
        label="Dietary preference"
        value={diet}
        onChange={(event) => setDiet(event.target.value)}
      >
        <option value="none">No preference</option>
        <option value="vegetarian">Vegetarian</option>
        <option value="vegan">Vegan</option>
      </Select>
      <Checkbox checked={invited} onToggle={setInvited} label="Send me the invite" />
      <ToggleSwitch checked={isPublic} onToggle={setIsPublic} label="Make event public" />
      {/* 2.5.0: the new PasswordInput (eye toggle + 4-stage meter +
          condition pills), and the RSVP cards ALL carry descriptions —
          the balanced grid contract, enforced in the package. */}
      <PasswordInput
        label="Password"
        value={password}
        onChange={setPassword}
      />
      <RadioCardGroup
        label="RSVP"
        name="rsvp"
        value={rsvp}
        onChange={setRsvp}
        options={[
          { value: "attending", label: "Attending", description: "See you there" },
          { value: "maybe", label: "Maybe", description: "Leaning yes — will confirm" },
          { value: "declined", label: "Can't make it", description: "Sorry — next time" },
        ]}
      />
    </SurfaceCard>
  );
}

/**
 * Placeholder modules (events / guests / budget) — the workshop dogfood:
 * the package's <EmptyState> primitive inside the package's OWN
 * <SurfaceCard> (2.2.0: the Shed anatomy is an official export now), so
 * the doctrine shows even where the feature isn't yet.
 */
function PlaceholderView({ view }: { view: WorkshopView }) {
  const mod = PLACEHOLDERS[view];
  return (
    <main className="hub">
      <SurfaceCard eyebrow={mod.label} meta={mod.path} title={mod.title}>
        <EmptyState
          icon="Hammer"
          title="In the workshop"
          message="This module ships in a future release."
        />
      </SurfaceCard>
    </main>
  );
}
