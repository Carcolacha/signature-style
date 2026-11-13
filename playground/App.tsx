/**
 * App — THE ENGINE + THE MASTER INDEX (2.3.0 "Universal Web Components
 * & AI Signature Codex").
 *
 * 2.3.0 — THE DASHBOARD GROWS MODULE TABS. The dashboard view gains the
 * package's <Tabs> (attribute-driven: aria-selected, ZERO .is-active
 * classes — the nav contract) switching three modules: "core" (the
 * unchanged 4-SurfaceCard board), "data" (the Guest & Budget Ledger —
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
import { useCallback, useMemo, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
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
  type NavItem,
  type PtpEvent,
  type DataTableColumn,
  type PartyTokenName,
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
    sub: "three doors · one engine · zero dead ends",
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
      <PageHero title={hero.title} subtitle={hero.sub} />
      {view === "dashboard" ? (
        <DashboardView />
      ) : view === "index" ? (
        <IndexView onNavigate={navigate} />
      ) : (
        <PlaceholderView view={view} />
      )}
    </>
  );
}

/**
 * The hub dashboard — the 2.0.0 board, now rendered through the PACKAGE's
 * own <SurfaceCard> (the Shed anatomy it inherited from this playground).
 * All four cards are `interactive` — they are hover modules, timeline
 * included. The chronology keeps the `hub__card--timeline` modifier via
 * className: the grid span + the measured breathing-room overrides stay
 * playground-scoped (styles.css), composed ON the primitive.
 */
function DashboardView() {
  const toast = useToast();
  const modal = useModal<PtpEvent>();
  const [isPublic, setIsPublic] = useState(true);
  const [moduleId, setModuleId] = useState<ModuleId>("core");

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
          <main className="hub">
            <SurfaceCard
              eyebrow="Forms"
              meta="components/forms.tsx"
              title="Form Controls"
              interactive
            >
              <Input placeholder="Guest name" />
              <TextArea placeholder="Notes for the host…" rows={3} />
              <ToggleSwitch
                checked={isPublic}
                onToggle={setIsPublic}
                label="Make event public"
              />
              <button
                type="button"
                className="hub__btn"
                data-testid="btn-toast"
                onClick={() => toast("success", "RSVP sent — see you there 🎉")}
              >
                Send test toast
              </button>
            </SurfaceCard>

            <SurfaceCard
              eyebrow="Timeline"
              meta="components/timeline.tsx"
              title="The Chronology"
              interactive
              className="hub__card--timeline"
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

            <SurfaceCard
              eyebrow="Telemetry"
              meta="components/viz.tsx"
              title="Budget & RSVP"
              interactive
            >
              <div className="hub__metric" data-testid="metric-budget-remaining">
                <span className="hub__metric-label">Budget remaining</span>
                <span className="hub__metric-value">72%</span>
              </div>
              <ProgressBar
                value={72}
                colorToken="--party-green"
                label="Budget remaining"
                limitText="$1,440 / $2,000"
              />
              <div className="hub__metric" data-testid="metric-budget-spent">
                <span className="hub__metric-label">Budget spent</span>
                <span className="hub__metric-value">45%</span>
              </div>
              <ProgressBar
                value={45}
                colorToken="--party-peach"
                label="Budget spent"
                limitText="$1,325 / $2,000"
              />
              <div className="hub__metric" data-testid="metric-guests">
                <span className="hub__metric-label">Guests confirmed</span>
                <span className="hub__metric-value">170 / 200</span>
              </div>
              <ProgressBar
                value={85}
                colorToken="--party-sky"
                label="Guests confirmed"
                limitText="170 / 200 Guests"
              />
              <div className="hub__metric" data-testid="metric-rsvp">
                <span className="hub__metric-label">RSVP ratio</span>
                <span className="hub__metric-value">85%</span>
              </div>
              <StatRing value={85} colorToken="--party-sky" label="RSVP ratio" />
            </SurfaceCard>

            <SurfaceCard
              eyebrow="Palette"
              meta="components/primitives.tsx"
              title="The Party Palette"
              interactive
            >
              <div className="hub__palette">
                {PALETTE.map(({ token, label }) => (
                  <PartyBadge key={token} colorToken={token} label={label} />
                ))}
              </div>
            </SurfaceCard>
          </main>
        </div>
      )}
    </>
  );
}

/** One gateway card in THE MASTER INDEX — a door to a module. */
interface Gateway {
  label: string;
  path: string;
  title: string;
  description: string;
  action: () => void;
}

/**
 * THE MASTER INDEX — three gateway cards. The v2.1.0 decision stands:
 * the cards ARE <button>s (free keyboard/press semantics), kept LOCAL —
 * a <button> cannot be the package's <section>-rendering SurfaceCard.
 * So the buttons WEAR the package's own surface classes instead
 * (.sig-surface-card + the --interactive modifier): the surface look,
 * the elevation and the hover lift ride the package css, and this layer
 * keeps only the button neutralization (cursor/text/font/color) + the
 * description paragraph. The PLANNER door is a REAL gateway (it
 * navigates); STUDY and GAMES are roadmap doors — DECISION (documented,
 * 2.1.0): clicking fires a success toast ("on the roadmap") instead of
 * routing to an EmptyState view. The meta row / ruled title inside each
 * button are the package's OWN classes (sig-surface-card__*), styled by
 * css/surface.css — the anatomy renders identically on a button.
 */
function IndexView({ onNavigate }: { onNavigate: (href: string) => void }) {
  const toast = useToast();
  const gateways: Gateway[] = [
    {
      label: "PLANNER",
      path: "views/planner.tsx",
      title: "Event Planner Bento",
      description:
        "The live dashboard — timeline, telemetry, forms, palette. Click to return.",
      action: () => onNavigate(VIEW_HREFS.dashboard),
    },
    {
      label: "STUDY",
      path: "modules/study.tsx",
      title: "Study & Flashcard Generator",
      description: "Deck generation and spaced-repetition flashcards for study groups.",
      action: () => toast("success", "The study module is on the roadmap."),
    },
    {
      label: "GAMES",
      path: "modules/games.tsx",
      title: "Party Game Modules",
      description:
        "40 curated party & shot games with 1v1 / 2v2 spectator betting frameworks.",
      action: () => toast("success", "The party games module is on the roadmap."),
    },
  ];

  return (
    <main className="hub hub--index">
      {gateways.map((gateway) => (
        <button
          key={gateway.path}
          type="button"
          className="sig-surface-card sig-surface-card--interactive hub__card--gateway"
          data-testid={`gateway-${gateway.label.toLowerCase()}`}
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
    </main>
  );
}

/**
 * THE LEDGER — the data module's table contract (2.3.0). Status cells
 * are ReactNode: one row composes a <PartyBadge> to show a badge living
 * inside the table, the rest stay plain text (keep td text simple —
 * composition is demonstrated once, not everywhere).
 */
const LEDGER_COLUMNS: DataTableColumn[] = [
  { key: "guest", header: "Guest" },
  { key: "status", header: "Status" },
  { key: "share", header: "Contribution", numeric: true },
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
 * THE DATA & TABLES MODULE (2.3.0) — the package's <DataTable>, <Callout>
 * and <Avatar> dogfooded in one card: the ledger (with the composed
 * PartyBadge), the three persistent callout moods, and the crew discs.
 */
function DataModule() {
  return (
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
  );
}

/**
 * THE FORM & INPUT MATRIX MODULE (2.3.0) — every input control on ONE
 * card, stacked in the v2.1.0 spacing pattern (the SurfaceCard's own
 * --space-standard flex gap IS the rhythm; no extra wrappers).
 */
function FormsModule() {
  const [diet, setDiet] = useState("none");
  const [invited, setInvited] = useState(true);
  const [isPublic, setIsPublic] = useState(false);

  return (
    <SurfaceCard
      eyebrow="Forms"
      meta="components/forms.tsx"
      title="The Input Matrix"
      interactive
    >
      <Input placeholder="Guest name" aria-label="Guest name" />
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
