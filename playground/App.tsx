/**
 * App — THE ENGINE, the Hub dashboard (2.0.0 "The Hub Migration —
 * Shed Aesthetic").
 *
 * 2.0.0 DIAGNOSIS → STRATEGY. The 1.5.1–1.8.0 bento grid read as
 * scattered boxes: it had cards but no discipline. The Shed's language
 * — one constrained centered column, an ANNOUNCED header, strict card
 * anatomy (teal all-caps label / muted mono path / elegant serif title
 * / content), tactile hover — is now the dashboard's law. The bento
 * classes migrate 1:1 to hub classes (`bento* → hub*`); the asymmetric
 * 3-column stage yields to an auto-fit minmax(400px, 1fr) column grid
 * under a hero that announces what the page is. Anatomy per card:
 *
 *   .hub__meta   → header row: .hub__label (teal, all-caps via CSS
 *                  text-transform — content stays capitalized words)
 *                  + .hub__path (muted mono, the module's source path)
 *   h2           → the elegant title (serif-adjacent weight rules in
 *                  styles.css; child combinator keeps the timeline's
 *                  package-rendered h2s untouched)
 *   content      → the module itself
 *
 * DOM flatness kept: <header> + <main className="hub"> siblings under
 * #root; 4 <section> cards, each meta + h2 + module elements. All
 * imports come from "@edwyn/signature-style/react" — the playground is
 * a consumer, not a contributor. The PACKAGE IS UNTOUCHED this release
 * (safety diff vs v1.8.0 is a release gate, tools/ frozen too).
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
import { useState } from "react";
import {
  ThemeProvider,
  ToastProvider,
  GlobalNav,
  useToast,
  Input,
  TextArea,
  ToggleSwitch,
  EventTimeline,
  EventModal,
  useModal,
  ProgressBar,
  StatRing,
  PartyBadge,
  type NavItem,
  type PtpEvent,
} from "@edwyn/signature-style/react";

const NAV_ITEMS: NavItem[] = [
  { href: "#", label: "Dashboard" },
  { href: "#", label: "Events" },
  { href: "#", label: "Guests" },
  { href: "#", label: "Budget" },
];

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
        <HubDashboard />
      </ToastProvider>
    </ThemeProvider>
  );
}

/**
 * The hub body — rendered INSIDE the providers so useToast() and
 * useModal() resolve. The fragment adds no DOM: nav, the announcing
 * hero header, and the hub main stay siblings under #root.
 */
function HubDashboard() {
  const toast = useToast();
  const modal = useModal<PtpEvent>();
  const [isPublic, setIsPublic] = useState(true);

  return (
    <>
      <GlobalNav items={NAV_ITEMS} activeHref="#" />
      <header className="hub__hero">
        <h1>THE ENGINE</h1>
        <p className="hub__hero-sub">every primitive, one dashboard · live showcase</p>
      </header>
      <main className="hub">
        <section className="hub__card hub__card--forms" data-testid="hub-card-forms">
          <div className="hub__meta">
            <span className="hub__label">Forms</span>
            <span className="hub__path">components/forms.tsx</span>
          </div>
          <h2>Form Controls</h2>
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
        </section>

        <section className="hub__card hub__card--timeline" data-testid="hub-card-timeline">
          <div className="hub__meta">
            <span className="hub__label">Timeline</span>
            <span className="hub__path">components/timeline.tsx</span>
          </div>
          <h2>The Chronology</h2>
          <EventTimeline events={events} onEventSelect={modal.open} />
          {modal.selectedEvent !== null && (
            <EventModal
              event={modal.selectedEvent}
              open={modal.isOpen}
              onClose={modal.close}
            />
          )}
        </section>

        <section className="hub__card hub__card--telemetry" data-testid="hub-card-telemetry">
          <div className="hub__meta">
            <span className="hub__label">Telemetry</span>
            <span className="hub__path">components/viz.tsx</span>
          </div>
          <h2>Budget &amp; RSVP</h2>
          <div className="hub__metric" data-testid="metric-budget-remaining">
            <span className="hub__metric-label">Budget remaining</span>
            <span className="hub__metric-value">72%</span>
          </div>
          <ProgressBar value={72} colorToken="--party-green" label="Budget remaining" />
          <div className="hub__metric" data-testid="metric-budget-spent">
            <span className="hub__metric-label">Budget spent</span>
            <span className="hub__metric-value">45%</span>
          </div>
          <ProgressBar value={45} colorToken="--party-peach" label="Budget spent" />
          <div className="hub__metric" data-testid="metric-rsvp">
            <span className="hub__metric-label">RSVP ratio</span>
            <span className="hub__metric-value">85%</span>
          </div>
          <StatRing value={85} colorToken="--party-sky" label="RSVP ratio" />
        </section>

        <section className="hub__card hub__card--palette" data-testid="hub-card-palette">
          <div className="hub__meta">
            <span className="hub__label">Palette</span>
            <span className="hub__path">components/primitives.tsx</span>
          </div>
          <h2>The Party Palette</h2>
          <div className="hub__palette">
            {PALETTE.map(({ token, label }) => (
              <PartyBadge key={token} colorToken={token} label={label} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
