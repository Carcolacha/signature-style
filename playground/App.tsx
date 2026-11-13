/**
 * App — the Bento Box Showcase dashboard (1.5.0).
 *
 * Every shipped module on ONE asymmetric grid: form controls, the event
 * timeline + modal composition, telemetry viz, and the full Party
 * Palette. DOM flatness: <main className="bento"> → 4 <section> cards;
 * each card is header (h2) + module elements. All imports come from
 * "@edwyn/signature-style/react" — the playground is a consumer, not a
 * contributor.
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
 * Six sample events across two date buckets. Icon names are the STRICT
 * IconName keys of lucide-react's icons map (verified at build time —
 * a typo is a compile error via `keyof typeof icons`).
 */
const SAMPLE_EVENTS: PtpEvent[] = [
  {
    id: "venue-walkthrough",
    date: "December 2026",
    time: "10:00",
    title: "Venue walkthrough",
    category: "--party-blue",
    categoryLabel: "Venue",
    icon: "MapPin",
    description:
      "Walk the floor plan with the coordinator: staging, catering lane, and the photo corner. Bring the seating sketch.",
  },
  {
    id: "catering-tasting",
    date: "December 2026",
    time: "13:30",
    title: "Catering tasting",
    category: "--party-peach",
    categoryLabel: "Catering",
    icon: "Utensils",
    description:
      "Three menu candidates. Confirm the vegan plate travels well and lock the dessert choice.",
  },
  {
    id: "dj-contract",
    date: "December 2026",
    title: "DJ contract signed",
    category: "--party-mauve-soft",
    categoryLabel: "Admin",
    icon: "Signature",
  },
  {
    id: "guest-list",
    date: "January 2027",
    title: "Assemble guest list",
    category: "--party-pink-bright",
    categoryLabel: "Guests",
    icon: "Users",
  },
  {
    id: "send-invitations",
    date: "January 2027",
    time: "09:00",
    title: "Send invitations",
    category: "--party-pink-bright",
    categoryLabel: "Guests",
    icon: "MailOpen",
    description:
      "Paper invites for family, digital for everyone else. RSVP window closes January 24.",
  },
  {
    id: "final-headcount",
    date: "January 2027",
    title: "Final headcount",
    category: "--party-green",
    categoryLabel: "RSVP",
    icon: "ClipboardCheck",
  },
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
          <EventTimeline events={SAMPLE_EVENTS} onEventSelect={modal.open} />
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
