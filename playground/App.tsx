/**
 * App — the Bento Box Showcase dashboard (1.5.1).
 *
 * Every shipped module on ONE asymmetric grid: form controls, the event
 * timeline + modal composition, telemetry viz, and the full Party
 * Palette. DOM flatness: <main className="bento"> → 4 <section> cards;
 * each card is header (h2) + module elements. All imports come from
 * "@edwyn/signature-style/react" — the playground is a consumer, not a
 * contributor.
 *
 * 1.5.1 — timeline hydration fix. The dashboard now mirrors the owner's
 * real integration: source data lives in HIS shape (`mockEvents`: id,
 * month, title, time, colorToken, iconName) and is mapped to the package
 * contract (`PtpEvent`: date, category, icon) in ONE explicit layer at
 * the render boundary. ROOT CAUSE (SSR-probe verified against the
 * package): the 1.5.0-era integration passed owner-shaped records
 * (`month`/`colorToken`/`iconName`) straight as PtpEvent[] — with
 * `date` undefined, `groupEvents` buckets everything under the single
 * key `undefined` (react/timeline.js: `const key = event.dateKey ??
 * event.date`) and the sticky header prints NO text — the "empty
 * header"; with `category` undefined, PartyBadge's `!colorToken
 * .startsWith("--party-")` guard (react/primitives.js:25) throws on the
 * undefined dereference and React unmounts the timeline — "without
 * events".
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
        <BentoDashboard />
      </ToastProvider>
    </ThemeProvider>
  );
}

/**
 * The dashboard body — rendered INSIDE the providers so useToast() and
 * useModal() resolve. The fragment adds no DOM: nav and main stay
 * siblings under #root.
 */
function BentoDashboard() {
  const toast = useToast();
  const modal = useModal<PtpEvent>();
  const [isPublic, setIsPublic] = useState(true);

  return (
    <>
      <GlobalNav items={NAV_ITEMS} activeHref="#" />
      <main className="bento">
        <section className="bento__card bento__card--forms">
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
            className="bento__btn"
            onClick={() => toast("success", "RSVP sent — see you there 🎉")}
          >
            Send test toast
          </button>
        </section>

        <section className="bento__card bento__card--timeline">
          <h2>Timeline</h2>
          <EventTimeline events={events} onEventSelect={modal.open} />
          {modal.selectedEvent !== null && (
            <EventModal
              event={modal.selectedEvent}
              open={modal.isOpen}
              onClose={modal.close}
            />
          )}
        </section>

        <section className="bento__card bento__card--telemetry">
          <h2>Telemetry</h2>
          <div className="bento__metric">
            <span className="bento__metric-label">Budget remaining</span>
            <span className="bento__metric-value">72%</span>
          </div>
          <ProgressBar value={72} colorToken="--party-green" label="Budget remaining" />
          <div className="bento__metric">
            <span className="bento__metric-label">Budget spent</span>
            <span className="bento__metric-value">45%</span>
          </div>
          <ProgressBar value={45} colorToken="--party-peach" label="Budget spent" />
          <div className="bento__metric">
            <span className="bento__metric-label">RSVP ratio</span>
            <span className="bento__metric-value">85%</span>
          </div>
          <StatRing value={85} colorToken="--party-sky" label="RSVP ratio" />
        </section>

        <section className="bento__card bento__card--palette">
          <h2>Party Palette</h2>
          <div className="bento__palette">
            {PALETTE.map(({ token, label }) => (
              <PartyBadge key={token} colorToken={token} label={label} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
