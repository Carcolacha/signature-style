/**
 * PatternStudio — THE PATTERN STUDIO view (2.8.0 "The Signature Pattern
 * Website, 6-Set Taxonomy & One-Click Copy Studio").
 *
 * A two-column doc layout: a sticky 240px sidebar listing the 6 sets
 * with tabular-nums component counts (state filter — clicking a set
 * shows that set's section only; "All sets" shows the full stream), and
 * the RIGHT stream of ruled SET 0N sections, each with a one-to-two-
 * sentence HUMAN explanation and one <PatternFrame> per component.
 *
 * Every frame's Preview tab is the LIVE component — interactive where
 * it means something (check the checkbox, flip the card, add a graph
 * node, type a password, open the modal, settle a milestone). The
 * previews are compact studio-local compositions defined below; state
 * is frame-local so frames never leak into each other.
 */
import { useRef, useState } from "react";
import type { ReactNode } from "react";
// 3.4.0 — THE ZERO-REACT SURFACE: this side-effect import registers the
// six sig-* custom elements through the package exports map
// ("@edwyn/signature-style/wc" → the committed dist/wc bundle). The
// frames below mount the REAL elements — the studio is the in-vite
// proof that the wc build works inside the app too.
import "@edwyn/signature-style/wc";
import {
  ThemeProvider,
  GlobalNav,
  Tabs,
  SurfaceCard,
  PageHero,
  Icon,
  Avatar,
  SigBadge,
  ContentCard,
  ReferenceCard,
  TierCard,
  ProfileCard,
  ActionTile,
  FlipCard,
  AccordionCard,
  MatchupCard,
  FormField,
  Input,
  TextArea,
  Select,
  Checkbox,
  RadioCardGroup,
  ToggleSwitch,
  PasswordInput,
  Button,
  ProgressBar,
  StatRing,
  StatCard,
  Sparkline,
  BarChart,
  AreaChart,
  KnowledgeGraph,
  smoothPath,
  layoutGraph,
  cubicBezierEdge,
  EventTimeline,
  EventModal,
  useModal,
  TimelineManager,
  ChronicleTimeline,
  DataTable,
  Callout,
  Carousel,
  CarouselItem,
  ProseBlock,
  AnnouncementBanner,
  EmptyState,
  ToastProvider,
  useToast,
} from "@edwyn/signature-style/react";
import type {
  TimelineEvent,
  TimelineItem,
  GraphNode,
} from "@edwyn/signature-style/react";
import { PatternFrame } from "./PatternFrame.js";
import { SNIPPETS, SET_NAMES, SET_BLURBS } from "../snippets.js";
import type { SetId } from "../snippets.js";

/** The taxonomy display order — SET 01 → SET 06. */
const SET_ORDER: ReadonlyArray<SetId> = ["01", "02", "03", "04", "05", "06", "07"];

/* ------------------------------------------------------------------ */
/* Set 01 previews — Shell & Navigation                                */
/* ------------------------------------------------------------------ */

/** The provider overrides one token for a subtree — live: the button
    wears the override, everything else keeps the cascade. */
function ThemeProviderPreview() {
  return (
    <ThemeProvider theme={{ "--color-cake-primary": "#94E2D5" }}>
      <div className="studio__inline-row">
        <Button variant="primary" size="sm">Teal-overridden primary</Button>
        <span className="studio__note">nested ThemeProvider · one token override</span>
      </div>
    </ThemeProvider>
  );
}

/** The real navbar, live. The stage clips it (overflow + max-height)
    so position:sticky sticks INSIDE the stage, not to the page. */
function GlobalNavPreview() {
  return (
    <div className="studio__nav-stage">
      <GlobalNav
        items={[
          { href: "#/studio", label: "Studio" },
          { href: "#/index", label: "Index" },
          { href: "#/chronicle", label: "Chronicle" },
        ]}
        activeHref="#/studio"
      />
    </div>
  );
}

/** The controlled switcher — zero .is-active classes, panels are yours. */
function TabsPreview() {
  const [tab, setTab] = useState("core");
  return (
    <div className="studio__stack">
      <Tabs
        label="Studio demo modules"
        tabs={[
          { id: "core", label: "Core" },
          { id: "data", label: "Data" },
        ]}
        activeId={tab}
        onChange={setTab}
      />
      <p className="studio__note">
        {tab === "core"
          ? "You are reading the Core panel — the tabs above switched it."
          : "You are reading the Data panel — same switcher, different branch."}
      </p>
    </div>
  );
}

/** The layout note, visualized: one centered column, breathing sides. */
function SigShellPreview() {
  return (
    <div className="studio__shell-demo">
      <div className="studio__shell-column">
        <span className="studio__note">max-width 1400px · margin-inline auto · clamp(20px, 4vw, 48px)</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Set 02 previews — Surface & Card Archetypes                         */
/* ------------------------------------------------------------------ */

function SurfaceCardPreview() {
  return (
    <SurfaceCard eyebrow="Forms" meta="components/forms.tsx" title="Form Controls" interactive>
      <Input placeholder="Member name" aria-label="Member name" />
    </SurfaceCard>
  );
}

function PageHeroPreview() {
  return <PageHero title="THE SYSTEM BENCH" subtitle="a tiny hero, live" />;
}

function IconPreview() {
  return (
    <div className="studio__inline-row">
      <Icon name="Rocket" size={20} />
      <Icon name="Cake" size={20} />
      <Icon name="AudioLines" size={20} />
      <span className="studio__note">lucide exclusively · stroke 2 · color inherited</span>
    </div>
  );
}

function AvatarPreview() {
  return (
    <div className="studio__inline-row">
      <Avatar name="Ana Souza" />
      <Avatar name="Priya Nair" size={40} ringToken="--sig-mauve-soft" />
      <Avatar name="Leo Martins" size={40} ringToken="--sig-sky" />
    </div>
  );
}

function SigBadgePreview() {
  return (
    <div className="studio__inline-row">
      <SigBadge colorToken="--sig-peach" label="Birthday" />
      <SigBadge colorToken="--sig-sky" label="Info" />
      <SigBadge colorToken="--sig-green" label="Confirmed" />
    </div>
  );
}

function ContentCardPreview() {
  const toast = useToast();
  return (
    <ContentCard
      category="Catering"
      categoryToken="--sig-peach"
      meta={["25 MIN", "SPICY", "$14"]}
      accentToken="--sig-yellow"
      title="Birria & Street Taco Catering"
      description="Slow-braised birria, consomé on the side."
      action={{ label: "Book the taco cart", onClick: () => toast("success", "Taco cart booked") }}
    />
  );
}

function ReferenceCardPreview() {
  const toast = useToast();
  return (
    <ReferenceCard
      tag="JSX"
      title="The Signature Surface"
      accentToken="--sig-sky"
      code={'<SurfaceCard eyebrow="Hi" title="Hello" interactive />'}
      onCopied={() => toast("success", "Snippet copied")}
    />
  );
}

function TierCardPreview() {
  const toast = useToast();
  return (
    <TierCard
      name="Arena Pass"
      price="$49"
      accentToken="--sig-mauve-soft"
      features={["All 40 game modules", "1v1 & 2v2 brackets"]}
      cta="Claim the pass"
      onCta={() => toast("success", "Pass claimed")}
    />
  );
}

function ProfileCardPreview() {
  return (
    <ProfileCard
      name="Ana Souza"
      role="Head of Catering"
      accentToken="--sig-peach"
      stats={[
        { label: "Events", value: "24" },
        { label: "Members", value: "412" },
        { label: "Rating", value: "4.9" },
      ]}
      skills={[
        { colorToken: "--sig-peach", label: "Catering" },
        { colorToken: "--sig-green", label: "Logistics" },
      ]}
    />
  );
}

function ActionTilePreview() {
  const toast = useToast();
  return (
    <ActionTile
      title="Open Deck Editor"
      subtitle="42 prompts · draft mode"
      icon="SquarePen"
      kbdShortcut="D"
      onClick={() => toast("success", "Deck editor opened")}
    />
  );
}

/** Internal state — click, Space or Enter flips it. */
function FlipCardPreview() {
  return <FlipCard front="Dare: sing the chorus" back="…or forfeit 10 points" />;
}

/** Zero-JavaScript disclosure — details/summary. */
function AccordionCardPreview() {
  return (
    <AccordionCard title="House Rules">
      <p>Ties resolve to rock-paper-scissors; the loser brings the ice.</p>
    </AccordionCard>
  );
}

function MatchupCardPreview() {
  return (
    <MatchupCard
      left={{ name: "Ana Souza", ringToken: "--sig-mauve-soft" }}
      right={{ name: "Leo Martins", ringToken: "--sig-sky" }}
      stakes="Winner picks the next venue — loser brings the ice."
    />
  );
}

/* ------------------------------------------------------------------ */
/* Set 03 previews — Ergonomic Forms & Inputs                          */
/* ------------------------------------------------------------------ */

/** THE format-rule demo: description above, live validation below. */
function FormFieldPreview() {
  const [zip, setZip] = useState("");
  return (
    <FormField
      label="Postal Code"
      htmlFor="studio-zip"
      description="5 numbers only · e.g., 79901"
      validMessage={/^\d{5}$/.test(zip) ? "Valid ZIP" : undefined}
      error={zip !== "" && !/^\d{5}$/.test(zip) ? "Postal codes are 5 digits" : undefined}
    >
      <Input
        id="studio-zip"
        inputMode="numeric"
        value={zip}
        onChange={(e) => setZip(e.target.value)}
        placeholder="79901"
      />
    </FormField>
  );
}

function InputPreview() {
  const [name, setName] = useState("");
  return (
    <Input
      value={name}
      onChange={(e) => setName(e.target.value)}
      placeholder="Member name"
      aria-label="Member name"
    />
  );
}

function TextAreaPreview() {
  const [bio, setBio] = useState("");
  return (
    <TextArea
      rows={3}
      value={bio}
      onChange={(e) => setBio(e.target.value)}
      placeholder="Notes for the host…"
      aria-label="Notes"
    />
  );
}

function SelectPreview() {
  const [diet, setDiet] = useState("none");
  return (
    <Select label="Dietary preference" value={diet} onChange={(e) => setDiet(e.target.value)}>
      <option value="none">No preference</option>
      <option value="vegetarian">Vegetarian</option>
      <option value="vegan">Vegan</option>
    </Select>
  );
}

function CheckboxPreview() {
  const [agreed, setAgreed] = useState(false);
  return <Checkbox checked={agreed} onToggle={setAgreed} label="Send me the invite" />;
}

function RadioCardGroupPreview() {
  const [attendance, setAttendance] = useState("confirmed");
  return (
    <RadioCardGroup
      label="Attendance"
      name="studio-attendance"
      value={attendance}
      onChange={setAttendance}
      options={[
        { value: "attending", label: "Attending", description: "See you there" },
        { value: "maybe", label: "Maybe", description: "Leaning yes — will confirm" },
      ]}
    />
  );
}

function ToggleSwitchPreview() {
  const [on, setOn] = useState(false);
  return <ToggleSwitch checked={on} onToggle={setOn} label="Make event public" />;
}

/** Type to watch the 4-segment meter climb Weak → Fair → Good → Strong. */
function PasswordInputPreview() {
  const [pw, setPw] = useState("");
  return <PasswordInput label="Password" value={pw} onChange={setPw} />;
}

function ButtonPreview() {
  const toast = useToast();
  return (
    <div className="studio__stack">
      <div className="studio__inline-row">
        <Button variant="primary" size="md" onClick={() => toast("success", "Checked in")}>
          Check In
        </Button>
        <Button variant="secondary" size="md">Maybe</Button>
        <Button variant="ghost" size="md">Skip</Button>
        <Button variant="danger" size="sm">Remove member</Button>
      </div>
      <span className="studio__note">press one — primary pushes a toast</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Set 04 previews — Analytical Telemetry & Graphs                     */
/* ------------------------------------------------------------------ */

/** Live: +8 walks the bar; it loops back to 24 after 100. */
function ProgressBarPreview() {
  const [value, setValue] = useState(72);
  return (
    <div className="studio__stack">
      <ProgressBar
        value={value}
        colorToken="--sig-green"
        label="Budget remaining"
        limitText={`${value} / 100`}
      />
      <div>
        <Button size="sm" variant="secondary" onClick={() => setValue((v) => (v + 8 > 100 ? 24 : v + 8))}>
          +8
        </Button>
      </div>
    </div>
  );
}

function StatRingPreview() {
  return <StatRing value={85} colorToken="--sig-sky" label="Attendance ratio" size="md" />;
}

function StatCardPreview() {
  return (
    <StatCard
      label="Confirmed Seats"
      value="170"
      delta="+12"
      deltaDirection="up"
      sparklineData={[118, 126, 132, 141, 158, 170]}
      colorToken="--sig-sky"
    />
  );
}

function SparklinePreview() {
  return <Sparkline data={[2, 3, 3, 4, 4, 6]} colorToken="--sig-mauve-soft" label="Rooms trend" />;
}

/** Hover a bar — the tabular readout appears (css-driven). */
function BarChartPreview() {
  return (
    <BarChart
      data={[
        { label: "Venue", value: 800, max: 1000, colorToken: "--sig-mauve-soft" },
        { label: "Catering", value: 620, max: 900, colorToken: "--sig-peach" },
        { label: "Invites", value: 240, max: 400, colorToken: "--sig-pink-bright" },
      ]}
      orientation="vertical"
      label="Spending by category"
    />
  );
}

/** Hover a point — the circle grows r 4 → 6. */
function AreaChartPreview() {
  return (
    <AreaChart
      points={[
        { label: "W1", value: 12 },
        { label: "W2", value: 18 },
        { label: "W3", value: 26 },
        { label: "W4", value: 41 },
      ]}
      colorToken="--sig-sky"
      height={180}
      label="Attendance momentum"
    />
  );
}

/** Click a node to focus; Add & Link parents a new node to the selection. */
function KnowledgeGraphPreview() {
  const [nodes, setNodes] = useState<GraphNode[]>([
    { id: "root", label: "Core Engine", categoryToken: "--sig-lavender", note: "Every branch is one layer." },
    { id: "venue", label: "Venue", parentId: "root", categoryToken: "--sig-mauve-soft" },
    { id: "catering", label: "Catering", parentId: "root", categoryToken: "--sig-peach" },
  ]);
  return (
    <KnowledgeGraph
      nodes={nodes}
      addOn
      onAddNode={(node) =>
        setNodes((current) => [...current, { ...node, id: `studio-n-${String(current.length + 1)}` }])
      }
      label="Studio planning graph"
      height={280}
    />
  );
}

/** The exported pure smoother, drawing a real path right here. */
function SmoothPathPreview() {
  const points = [
    { x: 8, y: 70 }, { x: 56, y: 48 }, { x: 104, y: 52 }, { x: 152, y: 22 }, { x: 200, y: 12 },
  ];
  return (
    <svg viewBox="0 0 208 88" width="100%" height="88" role="img" aria-label="smoothPath demo line">
      <path d={smoothPath(points)} fill="none" stroke="var(--sig-sky)" strokeWidth="2" strokeLinecap="round" />
      {points.map((p) => (
        <circle key={`${p.x}-${p.y}`} cx={p.x} cy={p.y} r="3" fill="var(--sig-sky)" />
      ))}
    </svg>
  );
}

/** layoutGraph + cubicBezierEdge, the exported pure pair, rendering
    their own output — deterministic, no component required. */
function GraphHelpersPreview() {
  const nodes: GraphNode[] = [
    { id: "root", label: "Root", categoryToken: "--sig-lavender" },
    { id: "a", label: "Venue", parentId: "root", categoryToken: "--sig-mauve-soft" },
    { id: "b", label: "Catering", parentId: "root", categoryToken: "--sig-peach" },
  ];
  const positions = layoutGraph(nodes);
  const edges = nodes
    .filter((n) => n.parentId !== undefined)
    .map((n) => {
      const parent = positions[n.parentId as string];
      const child = positions[n.id];
      if (parent === undefined || child === undefined) return null;
      return { d: cubicBezierEdge(parent, child), key: n.id };
    })
    .filter((edge): edge is { d: string; key: string } => edge !== null);
  return (
    <svg viewBox="0 0 640 320" width="100%" height="160" role="img" aria-label="layoutGraph demo">
      {edges.map((edge) => (
        <path key={edge.key} d={edge.d} fill="none" stroke="var(--text-muted)" strokeWidth="1.5" />
      ))}
      {Object.entries(positions).map(([id, pos]) => (
        <g key={id}>
          <circle cx={pos.x} cy={pos.y} r="10" fill="var(--bg-surface)" stroke="var(--sig-lavender)" strokeWidth="2" />
          <text x={pos.x} y={pos.y + 24} textAnchor="middle" fill="var(--text-muted)" fontSize="11">{id}</text>
        </g>
      ))}
    </svg>
  );
}

function CubicBezierEdgePreview() {
  const from = { x: 40, y: 120 };
  const to = { x: 280, y: 40 };
  return (
    <svg viewBox="0 0 320 160" width="100%" height="140" role="img" aria-label="cubicBezierEdge demo">
      <path d={cubicBezierEdge(from, to)} fill="none" stroke="var(--sig-lavender)" strokeWidth="2" />
      <circle cx={from.x} cy={from.y} r="5" fill="var(--sig-lavender)" />
      <circle cx={to.x} cy={to.y} r="5" fill="var(--sig-lavender)" />
      <text x={from.x} y={from.y + 20} fill="var(--text-muted)" fontSize="11">parent</text>
      <text x={to.x - 30} y={to.y - 12} fill="var(--text-muted)" fontSize="11">child</text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Set 05 previews — Chronology & Planners                             */
/* ------------------------------------------------------------------ */

const STUDIO_EVENTS: TimelineEvent[] = [
  {
    id: "studio-cake",
    date: "October 2026",
    time: "15:00",
    title: "Cake cutting",
    category: "--sig-peach",
    categoryLabel: "Birthday",
    icon: "Cake",
  },
  {
    id: "studio-soundcheck",
    date: "October 2026",
    time: "13:30",
    title: "Sound check",
    category: "--sig-sky",
    categoryLabel: "Logistics",
    icon: "AudioLines",
  },
  {
    id: "studio-fireworks",
    date: "November 2026",
    time: "20:00",
    title: "Fireworks",
    category: "--sig-mauve-soft",
    categoryLabel: "Release",
    icon: "Sparkles",
  },
];

/** Click a node — the modal opens (the full composition, live). */
function EventTimelinePreview() {
  const modal = useModal<TimelineEvent>();
  return (
    <div className="studio__stack">
      <EventTimeline events={STUDIO_EVENTS} onEventSelect={modal.open} />
      {modal.selectedEvent !== null && (
        <EventModal event={modal.selectedEvent} open={modal.isOpen} onClose={modal.close} />
      )}
    </div>
  );
}

const STUDIO_SAMPLE_EVENT: TimelineEvent = {
  id: "studio-sample",
  date: "October 2026",
  time: "15:00",
  title: "Cake cutting",
  category: "--sig-peach",
  categoryLabel: "Birthday",
  icon: "Cake",
};

function UseModalPreview() {
  const modal = useModal<TimelineEvent>();
  return (
    <div className="studio__stack">
      <Button size="sm" variant="secondary" onClick={() => modal.open(STUDIO_SAMPLE_EVENT)}>
        Open the cake-cutting event
      </Button>
      {modal.selectedEvent !== null && (
        <EventModal event={modal.selectedEvent} open={modal.isOpen} onClose={modal.close} />
      )}
    </div>
  );
}

function EventModalPreview() {
  const modal = useModal<TimelineEvent>();
  return (
    <div className="studio__stack">
      <Button size="sm" variant="secondary" onClick={() => modal.open(STUDIO_SAMPLE_EVENT)}>
        Open the EventModal
      </Button>
      {modal.selectedEvent !== null && (
        <EventModal event={modal.selectedEvent} open={modal.isOpen} onClose={modal.close} />
      )}
    </div>
  );
}

const STUDIO_MILESTONES: TimelineItem[] = [
  { id: "m1", date: "October 2026", time: "09:00", title: "Book the venue", category: "--sig-mauve-soft", categoryLabel: "Planning", icon: "MapPin", settled: true },
  { id: "m2", date: "November 2026", time: "18:00", title: "Send the changelog", category: "--sig-sky", categoryLabel: "Members", icon: "Mail" },
  { id: "m3", date: "December 2026", time: "20:00", title: "The launch", category: "--sig-peach", categoryLabel: "Release", icon: "Rocket" },
];

/** The full controlled manager: add, settle, delete, inspect → modal. */
function TimelineManagerPreview() {
  const [items, setItems] = useState<TimelineItem[]>(STUDIO_MILESTONES);
  const modal = useModal<TimelineItem>();
  return (
    <div className="studio__stack">
      <TimelineManager
        items={items}
        onAdd={(item) =>
          setItems((current) => [
            ...current,
            { ...item, id: `studio-m-${String(current.length + 1)}` },
          ])
        }
        onToggleSettled={(id) =>
          setItems((current) =>
            current.map((item) => (item.id === id ? { ...item, settled: !item.settled } : item)),
          )
        }
        onDelete={(id) => setItems((current) => current.filter((item) => item.id !== id))}
        onInspect={modal.open}
        label="Studio milestone manager"
      />
      {modal.selectedEvent !== null && (
        <EventModal event={modal.selectedEvent} open={modal.isOpen} onClose={modal.close} />
      )}
    </div>
  );
}

function ChronicleTimelinePreview() {
  return (
    <ChronicleTimeline
      label="Studio chronicle"
      releases={[
        { tag: "v2.6.0", title: "Universal Developer Card Suite", stat: "5 archetypes · 11 accents", accentToken: "--sig-yellow" },
        { tag: "v2.7.0", title: "Graphs, Charts & the Timeline Manager", stat: "pack 52", accentToken: "--sig-mauve-soft" },
        { tag: "v2.8.0", title: "The Signature Pattern Website", stat: "6 sets · 50 patterns", accentToken: "--sig-pink-bright" },
      ]}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Set 06 previews — Data, Editorial & Feedback                        */
/* ------------------------------------------------------------------ */

function DataTablePreview() {
  return (
    <DataTable
      columns={[
        { key: "member", header: "Member" },
        { key: "share", header: "Contribution", numeric: true, align: "right" },
      ]}
      rows={[
        { member: "Ana Souza", share: "$120" },
        { member: "Leo Martins", share: "$0" },
      ]}
      caption="Studio ledger · a tiny honest table"
    />
  );
}

function CalloutPreview() {
  return (
    <div className="studio__stack">
      <Callout status="info">Doors open at 19:00 — the venue has one parking lot.</Callout>
      <Callout status="success">The caterer confirmed for October 12.</Callout>
      <Callout status="warning">3 pending reviews close Friday.</Callout>
    </div>
  );
}

function CarouselPreview() {
  return (
    <Carousel label="Studio clippings">
      <CarouselItem><SigBadge colorToken="--sig-sky" label="Sky" /></CarouselItem>
      <CarouselItem><SigBadge colorToken="--sig-peach" label="Peach" /></CarouselItem>
      <CarouselItem><SigBadge colorToken="--sig-green" label="Green" /></CarouselItem>
    </Carousel>
  );
}

function CarouselItemPreview() {
  return (
    <Carousel label="Studio single slot">
      <CarouselItem>
        <div className="studio__mini-tile">
          <Icon name="Camera" size={16} />
          <span>One snap slot — any content inside.</span>
        </div>
      </CarouselItem>
      <CarouselItem>
        <div className="studio__mini-tile">
          <Icon name="Image" size={16} />
          <span>Scroll the track — one item per step.</span>
        </div>
      </CarouselItem>
    </Carousel>
  );
}

function ProseBlockPreview() {
  return (
    <ProseBlock>
      <p>The chronicle remembers so the changelog does not have to.</p>
      <blockquote>
        <p>“Twenty-three releases, one signature.”</p>
        <footer>— The Night of Versions</footer>
      </blockquote>
      <p>
        Press <kbd>Ctrl</kbd> + <code>C</code> to copy any card in this studio.
      </p>
    </ProseBlock>
  );
}

function AnnouncementBannerPreview() {
  const [visible, setVisible] = useState(true);
  const toast = useToast();
  if (!visible) {
    return (
      <Button size="sm" variant="secondary" onClick={() => setVisible(true)}>
        Resurrect the banner
      </Button>
    );
  }
  return (
    <AnnouncementBanner
      variant="announcement"
      action={{ label: "See what shipped", onClick: () => toast("success", "v2.8.0 shipped") }}
      dismissible
      onDismiss={() => setVisible(false)}
    >
      v2.8.0 — the Pattern Studio ships: six sets, one-click copy.
    </AnnouncementBanner>
  );
}

function EmptyStatePreview() {
  return <EmptyState icon="PackageOpen" title="Nothing here" message="Add your first event." />;
}

function ToastProviderPreview() {
  const toast = useToast();
  return (
    <Button size="sm" variant="primary" onClick={() => toast("success", "Attendance saved — see you there 🎉")}>
      Push a success toast
    </Button>
  );
}

function UseToastPreview() {
  const toast = useToast();
  return (
    <div className="studio__inline-row">
      <Button
        size="sm"
        variant="secondary"
        onClick={() => toast("success", "Attendance recorded — the seat is theirs.")}
      >
        Record attendance
      </Button>
      <Button
        size="sm"
        variant="danger"
        onClick={() => toast("error", "Payment failed — the shared pot did not move.")}
      >
        Fail a payment
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Set 07 previews — Web Components (zero-react)                       */
/*                                                                    */
/* The REAL custom elements mounted live (registered by the module-    */
/* level `import "@edwyn/signature-style/wc"` above). Custom elements  */
/* are valid JSX: attributes only, no imports, no props. The ring      */
/* preview is REACTIVE — a button drives setAttribute("value", …) so   */
/* the stroke-dashoffset transition plays right in the studio.         */
/* ------------------------------------------------------------------ */

/** The surface-card twin: eyebrow + ruled title + accent + slot body. */
function SigWcSurfaceCardPreview() {
  return (
    <sig-surface-card
      eyebrow="Telemetry"
      meta="wc/elements.ts"
      title="Attendance Pulse"
      accent-token="--sig-peach"
      elevation="floating"
      interactive
    >
      <p style={{ margin: 0 }}>Shadow-DOM body content rides the default slot.</p>
    </sig-surface-card>
  );
}

/** The badge pill twins: variant + accent-token spellings. */
function SigWcBadgePreview() {
  return (
    <div className="studio__inline-row">
      <sig-badge label="Confirmed" variant="green"></sig-badge>
      <sig-badge label="Info" accent-token="--sig-sky"></sig-badge>
      <sig-badge label="Neutral"></sig-badge>
    </div>
  );
}

/** The progress track: 70% cobalt, tabular caption. */
function SigWcProgressBarPreview() {
  return (
    <sig-progress-bar
      value={70}
      max={100}
      label="Budget remaining"
      limit-text="70 / 100"
      accent-token="--sig-cobalt"
    ></sig-progress-bar>
  );
}

/** The ring twin, LIVE-REACTIVE: the button drives setAttribute and the
    arc animates (stroke-dashoffset transition in the shadow sheet). */
function SigWcStatRingPreview() {
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [ringValue, setRingValue] = useState(85);
  const crank = (): void => {
    const next = ringValue >= 85 ? 40 : 85;
    ringRef.current?.setAttribute("value", String(next));
    setRingValue(next);
  };
  return (
    <div className="studio__inline-row">
      {/* The cast is the honest bridge: sig-stat-ring is HTMLElement +
          setAttribute — the ref only ever touches the ATTRIBUTE API. */}
      <sig-stat-ring
        ref={ringRef as never}
        value={ringValue}
        size={120}
        accent-token="--sig-cobalt"
        show-value="true"
        /* 3.6.0 a11y: role=progressbar hosts REQUIRE an accessible name
           (axe aria-progressbar-name) — the element renders it from the
           `label` attribute. */
        label="Interactive progress ring"
      ></sig-stat-ring>
      <Button size="sm" variant="secondary" onClick={crank}>
        setAttribute(&quot;value&quot;, &quot;{ringValue >= 85 ? 40 : 85}&quot;)
      </Button>
    </div>
  );
}

/** The persistent note twins: all three statuses. */
function SigWcCalloutPreview() {
  return (
    <div className="studio__stack">
      <sig-callout status="info">The workspace snapshot syncs every 30s.</sig-callout>
      <sig-callout status="success">All 200 seats confirmed.</sig-callout>
      <sig-callout status="warning">3 pending responses close Friday.</sig-callout>
    </div>
  );
}

/** The scroll strip: paged mode, three slotted snap units. */
function SigWcCarouselPreview() {
  return (
    <sig-carousel mode="paged">
      {["Slide one", "Slide two", "Slide three"].map((label) => (
        <div
          key={label}
          style={{
            minWidth: 200,
            padding: "var(--space-standard)",
            background: "var(--bg-surface)",
            border: "1px solid color-mix(in srgb, var(--text-muted) 15%, transparent)",
          }}
        >
          {label}
        </div>
      ))}
    </sig-carousel>
  );
}

/* ------------------------------------------------------------------ */
/* The frame registry — SNIPPETS key → its live preview                */
/* ------------------------------------------------------------------ */

/** Every SNIPPETS key gets exactly one live preview. Keys missing a
    preview would break the studio contract, so the map is typed
    total-ish: a missing key renders the honest EmptyState fallback. */
const PREVIEWS: Record<string, ReactNode> = {
  // Set 01
  ThemeProvider: <ThemeProviderPreview />,
  GlobalNav: <GlobalNavPreview />,
  Tabs: <TabsPreview />,
  SigShell: <SigShellPreview />,
  // Set 02
  SurfaceCard: <SurfaceCardPreview />,
  PageHero: <PageHeroPreview />,
  Icon: <IconPreview />,
  Avatar: <AvatarPreview />,
  SigBadge: <SigBadgePreview />,
  ContentCard: <ContentCardPreview />,
  ReferenceCard: <ReferenceCardPreview />,
  TierCard: <TierCardPreview />,
  ProfileCard: <ProfileCardPreview />,
  ActionTile: <ActionTilePreview />,
  FlipCard: <FlipCardPreview />,
  AccordionCard: <AccordionCardPreview />,
  MatchupCard: <MatchupCardPreview />,
  // Set 03
  FormField: <FormFieldPreview />,
  Input: <InputPreview />,
  TextArea: <TextAreaPreview />,
  Select: <SelectPreview />,
  Checkbox: <CheckboxPreview />,
  RadioCardGroup: <RadioCardGroupPreview />,
  ToggleSwitch: <ToggleSwitchPreview />,
  PasswordInput: <PasswordInputPreview />,
  Button: <ButtonPreview />,
  // Set 04
  ProgressBar: <ProgressBarPreview />,
  StatRing: <StatRingPreview />,
  StatCard: <StatCardPreview />,
  Sparkline: <SparklinePreview />,
  BarChart: <BarChartPreview />,
  AreaChart: <AreaChartPreview />,
  KnowledgeGraph: <KnowledgeGraphPreview />,
  smoothPath: <SmoothPathPreview />,
  layoutGraph: <GraphHelpersPreview />,
  cubicBezierEdge: <CubicBezierEdgePreview />,
  // Set 05
  EventTimeline: <EventTimelinePreview />,
  useModal: <UseModalPreview />,
  EventModal: <EventModalPreview />,
  TimelineManager: <TimelineManagerPreview />,
  ChronicleTimeline: <ChronicleTimelinePreview />,
  // Set 06
  DataTable: <DataTablePreview />,
  Callout: <CalloutPreview />,
  Carousel: <CarouselPreview />,
  CarouselItem: <CarouselItemPreview />,
  ProseBlock: <ProseBlockPreview />,
  AnnouncementBanner: <AnnouncementBannerPreview />,
  EmptyState: <EmptyStatePreview />,
  ToastProvider: <ToastProviderPreview />,
  useToast: <UseToastPreview />,
  // Set 07 — the zero-react custom elements, mounted LIVE.
  SigWcSurfaceCard: <SigWcSurfaceCardPreview />,
  SigWcBadge: <SigWcBadgePreview />,
  SigWcProgressBar: <SigWcProgressBarPreview />,
  SigWcStatRing: <SigWcStatRingPreview />,
  SigWcCallout: <SigWcCalloutPreview />,
  SigWcCarousel: <SigWcCarouselPreview />,
};

/** The components of each set, in the documented taxonomy order. */
const SET_FRAMES: Record<SetId, ReadonlyArray<string>> = {
  "01": ["ThemeProvider", "GlobalNav", "Tabs", "SigShell"],
  "02": [
    "SurfaceCard", "PageHero", "Icon", "Avatar", "SigBadge", "ContentCard",
    "ReferenceCard", "TierCard", "ProfileCard", "ActionTile", "FlipCard",
    "AccordionCard", "MatchupCard",
  ],
  "03": [
    "FormField", "Input", "TextArea", "Select", "Checkbox", "RadioCardGroup",
    "ToggleSwitch", "PasswordInput", "Button",
  ],
  "04": [
    "ProgressBar", "StatRing", "StatCard", "Sparkline", "BarChart", "AreaChart",
    "KnowledgeGraph", "smoothPath", "layoutGraph", "cubicBezierEdge",
  ],
  "05": ["EventTimeline", "useModal", "EventModal", "TimelineManager", "ChronicleTimeline"],
  "06": [
    "DataTable", "Callout", "Carousel", "CarouselItem", "ProseBlock",
    "AnnouncementBanner", "EmptyState", "ToastProvider", "useToast",
  ],
  "07": [
    "SigWcSurfaceCard", "SigWcBadge", "SigWcProgressBar", "SigWcStatRing",
    "SigWcCallout", "SigWcCarousel",
  ],
  /* 3.7.0 — Set 08 (Motion & Kinetics) mounts in the MOTION LAB view, not
     here; the studio stream stays the 7 canon sets (SET_ORDER). The key
     exists because SET_FRAMES is Record<SetId, …> and SetId grew to
     include "08" for the Motion Lab's PatternFrames. */
  "08": [],
};

/** Component count per set — derived from the registry, never hand-typed. */
export function setCount(id: SetId): number {
  return SET_FRAMES[id].length;
}

/**
 * THE PATTERN STUDIO VIEW — sidebar filter + the per-set stream.
 *
 * 2.9.0: the set filter is CONTROLLED when a parent passes
 * activeSet/onSetChange (the command palette's six set-jump commands
 * drive it from App's lifted studioSet state); without props it keeps
 * its internal state (backward compatible).
 */
export function PatternStudioView({
  activeSet: controlledSet,
  onSetChange,
  customizer,
}: {
  activeSet?: SetId | "all";
  onSetChange?: (set: SetId | "all") => void;
  /** 3.2.0 — the Theme & Surface Customizer panel, rendered at the top of
      the stream BEFORE Set 01 (the Shell owns the state; this view only
      slots the node — one theme writer, ever). */
  customizer?: ReactNode;
} = {}) {
  const [fallbackSet, setFallbackSet] = useState<SetId | "all">("all");
  const activeSet = controlledSet ?? fallbackSet;
  const setActiveSet = (set: SetId | "all"): void => {
    if (onSetChange !== undefined) onSetChange(set);
    else setFallbackSet(set);
  };
  const visibleSets = activeSet === "all" ? SET_ORDER : [activeSet];

  return (
    <div className="studio" data-testid="pattern-studio">
      <nav className="studio__sidebar" aria-label="Pattern sets" data-testid="studio-sidebar">
        <button
          type="button"
          className="studio__set-link"
          aria-pressed={activeSet === "all"}
          onClick={() => setActiveSet("all")}
        >
          <span className="studio__set-num">All</span>
          <span className="studio__set-name">every set</span>
          <span className="studio__set-count">{SET_ORDER.reduce((sum, id) => sum + setCount(id), 0)}</span>
        </button>
        {SET_ORDER.map((id) => (
          <button
            key={id}
            type="button"
            className="studio__set-link"
            aria-pressed={activeSet === id}
            onClick={() => setActiveSet(id)}
            data-testid={`studio-set-${id}`}
          >
            <span className="studio__set-num">Set {id}</span>
            <span className="studio__set-name">{SET_NAMES[id]}</span>
            <span className="studio__set-count">{setCount(id)}</span>
          </button>
        ))}
      </nav>
      <div className="studio__stream">
        {customizer !== undefined && (
          <div className="studio__customizer-slot" data-testid="studio-customizer-slot">
            {customizer}
          </div>
        )}
        {visibleSets.map((id) => (
          <section key={id} className="studio__set" data-sig-set-section={id} aria-label={`Set ${id} · ${SET_NAMES[id]}`}>
            <header className="studio__set-head">
              <h2 className="studio__set-title">
                SET {id} · {SET_NAMES[id]}
              </h2>
              <span className="studio__set-badge">{setCount(id)} patterns</span>
            </header>
            <p className="studio__blurb">{SET_BLURBS[id]}</p>
            <div className="studio__frames">
              {SET_FRAMES[id].map((key) => {
                const snippet = SNIPPETS[key];
                const preview = PREVIEWS[key];
                if (snippet === undefined) {
                  return (
                    <EmptyState
                      key={key}
                      icon="Bug"
                      title="Registry gap"
                      message={`No snippet registered for ${key}.`}
                    />
                  );
                }
                return (
                  <PatternFrame
                    key={key}
                    setId={id}
                    setName={SET_NAMES[id]}
                    componentName={snippet.componentName}
                    snippet={snippet}
                  >
                    {preview === undefined ? (
                      <EmptyState icon="Hammer" title="Preview in the workshop" message="This pattern's live preview ships next." />
                    ) : (
                      preview
                    )}
                  </PatternFrame>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
