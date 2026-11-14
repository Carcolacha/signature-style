/**
 * SNIPPETS — the Copy Studio registry (2.8.0 "The Signature Pattern
 * Website, 6-Set Taxonomy & One-Click Copy Studio").
 *
 * ONE typed map from EVERY value export of @edwyn/signature-style to its
 * clean, formatted, copy-paste snippet. SOURCE OF TRUTH: the recipes of
 * SYSTEM_PROMPT.md v3.0's "Universal AI Replication Contract" — ported
 * verbatim-in-spirit and fact-checked against the shipped react/*.d.ts
 * prop contracts (one import, no invented props). These are DOCUMENTATION
 * strings, not executed code: they must be compile-plausible, nothing
 * more.
 *
 * Consumers:
 *   - <PatternFrame> (playground/components/PatternFrame.tsx) — the
 *     Copy Card button writes `snippet.jsx` (or `snippet.html` on the
 *     HTML tab) to the clipboard;
 *   - the Pattern Studio's JSX/HTML toggle renders the same strings;
 *   - playground/generate-llms.mjs — llms-full.txt embeds every entry,
 *     so the manifest can never drift from the registry (one command
 *     regenerates both files).
 *
 * Coverage contract: every VALUE export (components, hooks, pure
 * helpers) of react/index.d.ts owns exactly one key. Type-only exports
 * (KnownToken, ThemeOverrides, TimelineEvent, …) ride their component's
 * entry. `set` places the entry in the 6-Set Taxonomy; the two
 * non-export layout notes (sig-shell) ride Set 01 as documentation.
 */

/** The 6-Set Taxonomy id — zero-padded for the SET 0N ruled headers.
 *
 * 3.4.0: the taxonomy grows one MINI-SET — "07" is the Web Components
 * (zero-react) group: the six custom elements, each entry's "jsx" being
 * the plain HTML usage (a custom element IS valid JSX — no import, no
 * props, attributes only). */
export type SetId = "01" | "02" | "03" | "04" | "05" | "06" | "07";

/** One registry entry — the Copy Card's payload. */
export interface SnippetEntry {
  /** The canonical JSX recipe (compile-plausible documentation). */
  jsx: string;
  /** The optional no-React HTML rendering (real package classes). */
  html?: string;
  /** The taxonomy set this entry belongs to. */
  set: SetId;
  /** The human component name shown in the PatternFrame header. */
  componentName: string;
}

/** The set names, in display order — the Pattern Studio's sidebar. */
export const SET_NAMES: Record<SetId, string> = {
  "01": "Shell & Navigation",
  "02": "Surface & Card Archetypes",
  "03": "Ergonomic Forms & Inputs",
  "04": "Analytical Telemetry & Graphs",
  "05": "Chronology & Planners",
  "06": "Data, Editorial & Feedback",
  "07": "Web Components (zero-react)",
};

/** Set order + the one-to-two-sentence human explanation per set. */
export const SET_BLURBS: Record<SetId, string> = {
  "01":
    "The frame every view hangs in: one centered column, one announcing hero, one sticky nav. Reach for this set first — layout is the doctrine everything else composes into.",
  "02":
    "The surfaces people actually read: heroes, cards, badges and the five universal archetypes. Content colors live here — chromatic tokens paint the categories, Flamingo/Teal never do.",
  "03":
    "Format rules sit above the input so people read the constraint before typing — announced by screen readers in the same breath as the label. Errors are states, not popups; every control keeps its native semantics.",
  "04":
    "The dashboards' math made visible: bars that admit their limits, rings that read at a glance, charts drawn as pure SVG with hover readouts. Reach for this set whenever a number deserves eyes — the colors stay content-only and the digits never jitter.",
  "05":
    "Time made visible: the alternating chronology for reading, the controlled manager for working, the flat release chronicle for remembering.",
  "06":
    "The working set: ledgers that scroll instead of breaking, notes that persist, toasts that resolve, prose that reads, and the honest empty state. When an outcome lands it pushes a toast; when the context matters it stays in a callout.",
  "07":
    "The same Signature Style as six framework-free custom elements — no React, no runtime deps, plain HTMLElement + shadow DOM. Prerequisite: link @edwyn/signature-style/css once (the --sig-* custom properties INHERIT through shadow-DOM boundaries, so one stylesheet themes every element, data-sig-theme included). Import @edwyn/signature-style/wc, then write the tags below in any stack — HTML, Vue, Svelte, or JSX.",
};

export const SNIPPETS: Record<string, SnippetEntry> = {
  // ---------------------------------------------------------------- Set 01
  ThemeProvider: {
    set: "01",
    componentName: "ThemeProvider",
    jsx: `import { ThemeProvider } from "@edwyn/signature-style/react";

<ThemeProvider theme={{ "--color-cake-primary": "#F2CDCD" }}>
  <App />
</ThemeProvider>`,
  },
  GlobalNav: {
    set: "01",
    componentName: "GlobalNav",
    jsx: `import { GlobalNav } from "@edwyn/signature-style/react";

const items = [{ href: "#/dashboard", label: "Dashboard" }];
<GlobalNav items={items} activeHref="#/dashboard" />`,
  },
  Tabs: {
    set: "01",
    componentName: "Tabs",
    jsx: `import { Tabs } from "@edwyn/signature-style/react";

const [moduleId, setModuleId] = useState("core");
<Tabs
  label="Dashboard modules"
  tabs={[{ id: "core", label: "Core" }, { id: "data", label: "Data" }]}
  activeId={moduleId}
  onChange={setModuleId}
/>`,
  },
  SigShell: {
    set: "01",
    componentName: "The sig-shell layout",
    jsx: `/* Every view's content renders inside ONE centered column —
   max-width 1400px, centered, breathing side padding (≥20px of
   viewport margin at every width). GlobalNav stays OUTSIDE the
   shell (it is its own bar). Never render tab modules or card
   grids edge-to-edge: */
.sig-shell {
  max-width: 1400px;
  margin-inline: auto;
  padding-inline: clamp(20px, 4vw, 48px);
  padding-bottom: 64px;
}`,
  },

  // ---------------------------------------------------------------- Set 02
  SurfaceCard: {
    set: "02",
    componentName: "SurfaceCard",
    jsx: `import { SurfaceCard } from "@edwyn/signature-style/react";

<SurfaceCard eyebrow="Forms" meta="components/forms.tsx" title="Form Controls" interactive>
  <Input placeholder="Member name" />
</SurfaceCard>
<SurfaceCard
  eyebrow="Workbench" meta="views/workbench.tsx" title="Bento Workbench"
  interactive accentToken="--color-cake-primary" elevation="floating"
>
  <ProgressBar value={72} colorToken="--sig-sky" label="Attendance ratio" />
</SurfaceCard>`,
  },
  PageHero: {
    set: "02",
    componentName: "PageHero",
    jsx: `import { PageHero } from "@edwyn/signature-style/react";

<PageHero title="THE ENGINE" subtitle="every primitive, one dashboard · live showcase" />`,
  },
  Icon: {
    set: "02",
    componentName: "Icon",
    jsx: `import { Icon } from "@edwyn/signature-style/react";

<Icon name="Rocket" size={16} />`,
  },
  Avatar: {
    set: "02",
    componentName: "Avatar",
    jsx: `import { Avatar } from "@edwyn/signature-style/react";

<Avatar name="Ana Souza" />
<Avatar name="Priya Nair" size={40} ringToken="--sig-mauve-soft" />`,
  },
  SigBadge: {
    set: "02",
    componentName: "SigBadge",
    jsx: `import { SigBadge } from "@edwyn/signature-style/react";

<SigBadge colorToken="--sig-peach" label="Birthday" />`,
    html: `<span
  style="background: color-mix(in srgb, var(--sig-peach) 18%, transparent);
         border: 1px solid color-mix(in srgb, var(--sig-peach) 45%, transparent);
         color: var(--text-main); font-weight: 500;
         padding: var(--space-tight) var(--space-standard);
         border-radius: var(--radius-ui);"
>Birthday</span>`,
  },
  ContentCard: {
    set: "02",
    componentName: "ContentCard",
    jsx: `import { ContentCard } from "@edwyn/signature-style/react";

<ContentCard
  category="Catering" categoryToken="--sig-peach"
  meta={["25 MIN", "SPICY", "$14"]}
  accentToken="--sig-yellow"
  title="Birria & Street Taco Catering"
  description="Slow-braised birria, consomé on the side."
  action={{ label: "Book the taco cart", onClick: book }}
/>`,
  },
  ReferenceCard: {
    set: "02",
    componentName: "ReferenceCard",
    jsx: `import { ReferenceCard } from "@edwyn/signature-style/react";

<ReferenceCard
  tag="JSX" title="The Signature Surface" accentToken="--sig-sky"
  code={'<SurfaceCard eyebrow="Hi" title="Hello" interactive />'}
  link="https://example.com/docs"
  onCopied={() => toast("success", "Snippet copied")}
/>`,
  },
  TierCard: {
    set: "02",
    componentName: "TierCard",
    jsx: `import { TierCard } from "@edwyn/signature-style/react";

<TierCard
  name="Arena Pass" price="$49" featured accentToken="--sig-mauve-soft"
  features={["All 40 game modules", "1v1 & 2v2 brackets", "Spectator betting pot", "Priority seating"]}
  cta="Claim the pass" onCta={claim}
/>`,
  },
  ProfileCard: {
    set: "02",
    componentName: "ProfileCard",
    jsx: `import { ProfileCard } from "@edwyn/signature-style/react";

<ProfileCard
  name="Ana Souza" role="Head of Catering" accentToken="--sig-peach"
  stats={[
    { label: "Events", value: "24" },
    { label: "Members", value: "412" },
    { label: "Rating", value: "4.9" },
  ]}
  skills={[
    { colorToken: "--sig-peach", label: "Catering" },
    { colorToken: "--sig-green", label: "Logistics" },
  ]}
/>`,
  },
  ActionTile: {
    set: "02",
    componentName: "ActionTile",
    jsx: `import { ActionTile } from "@edwyn/signature-style/react";

<ActionTile
  title="Open Deck Editor"
  subtitle="42 prompts · draft mode"
  icon="SquarePen"
  kbdShortcut="D"
  onClick={openEditor}
/>`,
  },
  FlipCard: {
    set: "02",
    componentName: "FlipCard",
    jsx: `import { FlipCard } from "@edwyn/signature-style/react";

<FlipCard front="Dare: sing the chorus" back="…or forfeit 10 points" />`,
  },
  AccordionCard: {
    set: "02",
    componentName: "AccordionCard",
    jsx: `import { AccordionCard } from "@edwyn/signature-style/react";

<AccordionCard title="House Rules">
  <p>Ties resolve to rock-paper-scissors; the loser brings the ice.</p>
</AccordionCard>`,
  },
  MatchupCard: {
    set: "02",
    componentName: "MatchupCard",
    jsx: `import { MatchupCard } from "@edwyn/signature-style/react";

<MatchupCard
  left={{ name: "Ana Souza", ringToken: "--sig-mauve-soft" }}
  right={{ name: "Leo Martins", ringToken: "--sig-sky" }}
  stakes="Winner picks the next venue — loser brings the ice."
/>`,
  },

  // ---------------------------------------------------------------- Set 03
  FormField: {
    set: "03",
    componentName: "FormField",
    jsx: `import { FormField, Input } from "@edwyn/signature-style/react";

<FormField
  label="Postal Code"
  htmlFor="zip"
  description="5 numbers only · e.g., 79901"
  validMessage={/^\\d{5}$/.test(zip) ? "Valid ZIP" : undefined}
  error={zip !== "" && !/^\\d{5}$/.test(zip) ? "Postal codes are 5 digits" : undefined}
>
  <Input id="zip" inputMode="numeric" value={zip} onChange={(e) => setZip(e.target.value)} />
</FormField>
<FormField label="Contribution" htmlFor="share" prefix="$" required hint="Suggested $50">
  <Input id="share" required inputMode="numeric" value={share} onChange={(e) => setShare(e.target.value)} />
</FormField>`,
  },
  Input: {
    set: "03",
    componentName: "Input",
    jsx: `import { Input } from "@edwyn/signature-style/react";

<Input
  value={name}
  onChange={(e) => setName(e.target.value)}
  error={name.length === 0 && "Name is required"}
  aria-describedby="name-error"
/>`,
    html: `<input class="sig-input" type="text" placeholder="Member name" />`,
  },
  TextArea: {
    set: "03",
    componentName: "TextArea",
    jsx: `import { TextArea } from "@edwyn/signature-style/react";

<TextArea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />`,
  },
  Select: {
    set: "03",
    componentName: "Select",
    jsx: `import { Select } from "@edwyn/signature-style/react";

<Select label="Dietary preference" value={diet} onChange={(e) => setDiet(e.target.value)}>
  <option value="none">No preference</option>
  <option value="vegetarian">Vegetarian</option>
  <option value="vegan">Vegan</option>
</Select>`,
  },
  Checkbox: {
    set: "03",
    componentName: "Checkbox",
    jsx: `import { Checkbox } from "@edwyn/signature-style/react";

const [agreed, setAgreed] = useState(false);
<Checkbox checked={agreed} onToggle={setAgreed} label="Send me the invite" />`,
  },
  RadioCardGroup: {
    set: "03",
    componentName: "RadioCardGroup",
    jsx: `import { RadioCardGroup } from "@edwyn/signature-style/react";

const [attendance, setAttendance] = useState("confirmed");
<RadioCardGroup
  label="Attendance"
  name="attendance"
  value={attendance}
  onChange={setAttendance}
  options={[
    { value: "attending", label: "Attending", description: "See you there" },
    { value: "maybe", label: "Maybe", description: "Leaning yes — will confirm" },
  ]}
/>`,
  },
  ToggleSwitch: {
    set: "03",
    componentName: "ToggleSwitch",
    jsx: `import { ToggleSwitch } from "@edwyn/signature-style/react";

const [on, setOn] = useState(false);
<ToggleSwitch checked={on} onToggle={setOn} label="Make event public" />`,
  },
  PasswordInput: {
    set: "03",
    componentName: "PasswordInput",
    jsx: `import { PasswordInput } from "@edwyn/signature-style/react";

const [pw, setPw] = useState("");
<PasswordInput label="Password" value={pw} onChange={setPw} />`,
  },
  Button: {
    set: "03",
    componentName: "Button",
    jsx: `import { Button } from "@edwyn/signature-style/react";

<Button variant="primary" size="md" leftIcon="Check" loading={submitting} type="submit">
  Check In
</Button>
<Button variant="danger" size="sm" onClick={remove}>Remove member</Button>`,
    html: `<button class="sig-btn sig-btn--primary" type="submit">Check In</button>
<button class="sig-btn sig-btn--secondary" type="button">Maybe</button>
<button class="sig-btn sig-btn--ghost sig-btn--sm" type="button">Skip</button>`,
  },

  // ---------------------------------------------------------------- Set 04
  ProgressBar: {
    set: "04",
    componentName: "ProgressBar",
    jsx: `import { ProgressBar } from "@edwyn/signature-style/react";

<ProgressBar value={72} colorToken="--sig-green" label="Budget remaining" limitText="$720 / $1,000" />`,
  },
  StatRing: {
    set: "04",
    componentName: "StatRing",
    jsx: `import { StatRing } from "@edwyn/signature-style/react";

<StatRing value={85} colorToken="--sig-sky" label="Attendance ratio" />`,
  },
  StatCard: {
    set: "04",
    componentName: "StatCard",
    jsx: `import { StatCard } from "@edwyn/signature-style/react";

<StatCard
  label="Confirmed Seats"
  value="170"
  delta="+12"
  deltaDirection="up"
  sparklineData={[118, 126, 132, 141, 158, 170]}
  colorToken="--sig-sky"
/>`,
  },
  Sparkline: {
    set: "04",
    componentName: "Sparkline",
    jsx: `import { Sparkline } from "@edwyn/signature-style/react";

<Sparkline data={[2, 3, 3, 4, 4, 6]} colorToken="--sig-mauve-soft" label="Rooms trend" />`,
  },
  BarChart: {
    set: "04",
    componentName: "BarChart",
    jsx: `import { BarChart } from "@edwyn/signature-style/react";

<BarChart
  data={[
    { label: "Venue", value: 800, max: 1000, colorToken: "--sig-mauve-soft" },
    { label: "Catering", value: 620, max: 900, colorToken: "--sig-peach" },
    { label: "Invites", value: 240, max: 400, colorToken: "--sig-pink-bright" },
  ]}
  orientation="vertical"
  label="Spending by category"
/>`,
  },
  AreaChart: {
    set: "04",
    componentName: "AreaChart",
    jsx: `import { AreaChart } from "@edwyn/signature-style/react";

<AreaChart
  points={[
    { label: "W1", value: 12 }, { label: "W2", value: 18 },
    { label: "W3", value: 26 }, { label: "W4", value: 41 },
  ]}
  colorToken="--sig-sky"
  height={200}
  label="Attendance momentum"
/>`,
  },
  KnowledgeGraph: {
    set: "04",
    componentName: "KnowledgeGraph",
    jsx: `import { KnowledgeGraph, type GraphNode } from "@edwyn/signature-style/react";

const nodes: GraphNode[] = [
  { id: "root", label: "Core Engine", categoryToken: "--sig-lavender", note: "Every branch is one layer." },
  { id: "venue", label: "Venue", parentId: "root", categoryToken: "--sig-mauve-soft" },
];

<KnowledgeGraph
  nodes={nodes}
  addOn
  onAddNode={(node) => addNode(node)}
  onSelectNode={(node) => inspect(node)}
  label="Workbench knowledge graph"
  height={320}
/>`,
  },
  smoothPath: {
    set: "04",
    componentName: "smoothPath()",
    jsx: `import { smoothPath } from "@edwyn/signature-style/react";

// Catmull-Rom → bezier path string for N points { x, y } — the same
// smoothing AreaChart draws with, exported pure for your own SVGs.
const d = smoothPath([
  { x: 0, y: 180 }, { x: 60, y: 140 }, { x: 120, y: 90 }, { x: 180, y: 30 },
]);
// → "M 0 180 C …" (a ready-to-wear <path d={d} />)`,
  },
  layoutGraph: {
    set: "04",
    componentName: "layoutGraph()",
    jsx: `import { layoutGraph, type GraphNode } from "@edwyn/signature-style/react";

// Deterministic radial layout: roots centered, BFS depth rings at
// radius 90 + depth·110, children fanned around the parent's angle,
// ties broken by id hash. Same nodes → same coordinates, always.
const nodes: GraphNode[] = [
  { id: "root", label: "Core Engine", categoryToken: "--sig-lavender" },
  { id: "venue", label: "Venue", parentId: "root", categoryToken: "--sig-mauve-soft" },
];
const positions: Record<string, GraphPosition> = layoutGraph(nodes);`,
  },
  cubicBezierEdge: {
    set: "04",
    componentName: "cubicBezierEdge()",
    jsx: `import { cubicBezierEdge } from "@edwyn/signature-style/react";

// One cubic-Bezier edge path per node-with-parent — control points
// 60% along the radial. Feed it the layoutGraph output.
const d = cubicBezierEdge(
  { x: 320, y: 160 },
  { x: 210, y: 80 },
);
// → a ready-to-wear <path d={d} /> connecting parent → child`,
  },

  // ---------------------------------------------------------------- Set 05
  EventTimeline: {
    set: "05",
    componentName: "EventTimeline",
    jsx: `import { EventTimeline } from "@edwyn/signature-style/react";

<EventTimeline
  events={[{
    id: "cake",
    date: "October 2026",
    time: "15:00",
    title: "Cake cutting",
    category: "--sig-peach",
    categoryLabel: "Birthday",
    icon: "Cake",
  }]}
  onEventSelect={modal.open}
/>`,
  },
  useModal: {
    set: "05",
    componentName: "useModal()",
    jsx: `import { useModal } from "@edwyn/signature-style/react";

// The hook owns selection state; the component owns the overlay.
const modal = useModal<TimelineEvent>();
modal.open(event);   // select + open
modal.close();       // close + clear`,
  },
  EventModal: {
    set: "05",
    componentName: "EventModal + useModal()",
    jsx: `import { EventModal, useModal, type TimelineEvent } from "@edwyn/signature-style/react";

const modal = useModal<TimelineEvent>();
{modal.selectedEvent !== null && (
  <EventModal event={modal.selectedEvent} open={modal.isOpen} onClose={modal.close} />
)}`,
  },
  TimelineManager: {
    set: "05",
    componentName: "TimelineManager",
    jsx: `import { TimelineManager, type TimelineItem } from "@edwyn/signature-style/react";

<TimelineManager
  items={items}
  onAdd={(item) => setItems((cur) => [...cur, { ...item, id: nextId() }])}
  onToggleSettled={(id) => toggle(id)}
  onDelete={(id) => remove(id)}
  onInspect={(item) => modal.open(item)}
  label="Milestone manager"
/>`,
  },
  ChronicleTimeline: {
    set: "05",
    componentName: "ChronicleTimeline",
    jsx: `import { ChronicleTimeline } from "@edwyn/signature-style/react";

<ChronicleTimeline
  label="Version chronicle"
  releases={[
    { tag: "v2.5.0", title: "The 12-Column Bento", stat: "whitelist 34", accentToken: "--sig-pink-bright" },
    { tag: "v2.6.0", title: "Universal Developer Card Suite", stat: "5 archetypes · 3 tiers · 11 accents", accentToken: "--sig-yellow" },
  ]}
/>`,
  },

  // ---------------------------------------------------------------- Set 06
  DataTable: {
    set: "06",
    componentName: "DataTable",
    jsx: `import { DataTable } from "@edwyn/signature-style/react";

<DataTable
  columns={[
    { key: "member", header: "Member" },
    { key: "share", header: "Contribution", numeric: true, align: "right" },
  ]}
  rows={[
    { member: "Ana Souza", share: "$120" },
    { member: "Leo Martins", share: "$0" },
  ]}
  caption="Allocation ledger · updated after every response"
/>`,
  },
  Callout: {
    set: "06",
    componentName: "Callout",
    jsx: `import { Callout } from "@edwyn/signature-style/react";

<Callout status="warning">3 pending reviews close Friday.</Callout>`,
    html: `<div class="sig-callout" role="note" style="--status: var(--sig-peach);">
  3 pending reviews close Friday.
</div>`,
  },
  Carousel: {
    set: "06",
    componentName: "Carousel",
    jsx: `import { Carousel } from "@edwyn/signature-style/react";

<Carousel label="Palette clippings">
  <CarouselItem><SigBadge colorToken="--sig-sky" label="Sky" /></CarouselItem>
  <CarouselItem><SigBadge colorToken="--sig-peach" label="Peach" /></CarouselItem>
</Carousel>`,
  },
  CarouselItem: {
    set: "06",
    componentName: "CarouselItem",
    jsx: `import { CarouselItem } from "@edwyn/signature-style/react";

{/* Children of <Carousel> MUST be CarouselItem snap slots —
    one item per scroll-snap step, any content inside. */}
<CarouselItem>
  <img src="clipping.png" alt="A palette clipping" />
</CarouselItem>`,
  },
  ProseBlock: {
    set: "06",
    componentName: "ProseBlock",
    jsx: `import { ProseBlock } from "@edwyn/signature-style/react";

<ProseBlock>
  <p>First paragraph…</p>
  <h3>Chapter heading</h3>
  <blockquote><p>“The quote.”</p><footer>— someone</footer></blockquote>
  <p>Press <kbd>Ctrl</kbd> + <code>C</code> to copy.</p>
  <cite>Source, vol. 2</cite>
</ProseBlock>`,
  },
  AnnouncementBanner: {
    set: "06",
    componentName: "AnnouncementBanner",
    jsx: `import { AnnouncementBanner } from "@edwyn/signature-style/react";

<AnnouncementBanner
  variant="announcement"
  action={{ label: "See what shipped", onClick: announce }}
  dismissible
  onDismiss={hide}
>
  v2.5.0 — live state mode: allocate a seat and watch the ledger, ring, and toast react.
</AnnouncementBanner>`,
    html: `<div class="sig-announcement" role="status" style="--status: var(--color-cake-primary);">
  <span class="sig-announcement__icon">…</span>
  <span class="sig-announcement__text">v2.8.0 — the Pattern Studio ships.</span>
</div>`,
  },
  EmptyState: {
    set: "06",
    componentName: "EmptyState",
    jsx: `import { EmptyState } from "@edwyn/signature-style/react";

<EmptyState icon="PackageOpen" title="Nothing here" message="Add your first event." />`,
    html: `<div class="empty-state">
  <svg aria-hidden="true" …><!-- lucide PackageOpen, stroke-width 2 --></svg>
  <strong style="color: var(--text-main); font-weight: 600;">Nothing here</strong>
  <p style="margin: 0;">Add your first event.</p>
</div>`,
  },
  ToastProvider: {
    set: "06",
    componentName: "ToastProvider",
    jsx: `import { ToastProvider } from "@edwyn/signature-style/react";

<ToastProvider>
  <AttendanceForm />
</ToastProvider>`,
  },
  useToast: {
    set: "06",
    componentName: "useToast()",
    jsx: `import { useToast } from "@edwyn/signature-style/react";

// inside <AttendanceForm>, beneath the provider:
const toast = useToast();
toast("success", "Attendance saved — see you there 🎉");`,
  },

  // ---------------------------------------------------------------- Set 07
  // 3.4.0 — THE ZERO-REACT SURFACE: the six custom elements. The "jsx"
  // strings ARE the plain-HTML usage (a custom element is valid JSX —
  // attributes only, no imports, no props); "html" carries the same
  // usage with the tokens-prerequisite note for the HTML tab.
  SigWcSurfaceCard: {
    set: "07",
    componentName: "sig-surface-card",
    jsx: `<!-- Prerequisite: import "@edwyn/signature-style/wc" + link the css once -->
<sig-surface-card
  eyebrow="Telemetry"
  meta="wc/elements.ts"
  title="Attendance Pulse"
  accent-token="--sig-peach"
  elevation="floating"
  interactive
>
  <p>Shadow-DOM body content rides the default slot.</p>
</sig-surface-card>`,
    html: `<sig-surface-card
  eyebrow="Telemetry"
  meta="wc/elements.ts"
  title="Attendance Pulse"
  accent-token="--sig-peach"
  elevation="floating"
  interactive
>
  <p>Shadow-DOM body content rides the default slot.</p>
</sig-surface-card>`,
  },
  SigWcBadge: {
    set: "07",
    componentName: "sig-badge",
    jsx: `<sig-badge label="Confirmed" variant="green"></sig-badge>
<sig-badge label="Info" accent-token="--sig-sky"></sig-badge>`,
    html: `<sig-badge label="Confirmed" variant="green"></sig-badge>
<sig-badge label="Info" accent-token="--sig-sky"></sig-badge>`,
  },
  SigWcProgressBar: {
    set: "07",
    componentName: "sig-progress-bar",
    jsx: `<sig-progress-bar
  value="70"
  max="100"
  label="Budget remaining"
  limit-text="70 / 100"
  accent-token="--sig-cobalt"
></sig-progress-bar>`,
    html: `<sig-progress-bar
  value="70"
  max="100"
  label="Budget remaining"
  limit-text="70 / 100"
  accent-token="--sig-cobalt"
></sig-progress-bar>`,
  },
  SigWcStatRing: {
    set: "07",
    componentName: "sig-stat-ring",
    jsx: `<sig-stat-ring
  value="85"
  size="120"
  accent-token="--sig-cobalt"
  show-value="true"
></sig-stat-ring>

<!-- setAttribute("value", "40") animates stroke-dashoffset -->
<!-- total + unit: <sig-stat-ring value="170" total="200" unit="%"> -->`,
    html: `<sig-stat-ring
  value="85"
  size="120"
  accent-token="--sig-cobalt"
  show-value="true"
></sig-stat-ring>`,
  },
  SigWcCallout: {
    set: "07",
    componentName: "sig-callout",
    jsx: `<sig-callout status="warning">3 pending responses close Friday.</sig-callout>
<sig-callout status="success">All 200 seats confirmed.</sig-callout>`,
    html: `<sig-callout status="warning">3 pending responses close Friday.</sig-callout>
<sig-callout status="success">All 200 seats confirmed.</sig-callout>`,
  },
  SigWcCarousel: {
    set: "07",
    componentName: "sig-carousel",
    jsx: `<sig-carousel mode="paged">
  <div>Slide one</div>
  <div>Slide two</div>
  <div>Slide three</div>
</sig-carousel>

<!-- mode="free" (default): Prev/Next advance one item; paged: one track width -->
<!-- N grows from the slotchange count — dots + "1 / N" are automatic -->`,
    html: `<sig-carousel mode="paged">
  <div>Slide one</div>
  <div>Slide two</div>
  <div>Slide three</div>
</sig-carousel>`,
  },
};
