# Migration Guide — @edwyn/signature-style

Every breaking change and public rename lives HERE, so the README stays a
pure product page. If you are upgrading across an old boundary, find your
row below, re-aim mechanically, done.

> Consuming a version older than 3.1.0? Consult the README shipped in
> YOUR installed version (`node_modules/@edwyn/signature-style/README.md`)
> — each release's README documents that release's own contract.

## The Pure Engine rename (standalone identity)

The engine's public vocabulary is its own. A pure rename: every value,
layout metric and behavior is byte-stable — only the NAMES changed.

| Old name | New name |
|---|---|
| `.ptp-*` CSS classes (191 names, e.g. `.ptp-btn`, `.ptp-timeline__node`, `.ptp-stat-card`) | `.sig-*` (identity map: `.sig-btn`, `.sig-timeline__node`, `.sig-stat-card` — zero collisions with the pre-existing `.sig-shell`/`.sig-cell`/`.sig-span-*`/card-archetype classes) |
| `--party-*` tokens (26) | `--sig-*` (the 26 chromatic tokens: `--sig-cobalt`, `--sig-orchid`, `--sig-azure`, `--sig-neon-green`, … + the 10 legacy-suffix tokens `--sig-pink-bright`, `--sig-mauve-soft`, `--sig-lavender`, `--sig-sky`, `--sig-peach`, `--sig-green`, `--sig-yellow`, `--sig-pink-alt`, `--sig-pink-soft`, `--sig-mauve-bright`) — VALUES byte-identical |
| tokens.json `partyPalette` key | `sigPalette` |
| `PartyColorToken` type | `SigColorToken` |
| `PartyTokenName` type | `SigTokenName` |
| `PartyBadge` / `PartyBadgeProps` | `SigBadge` / `SigBadgeProps` |
| `PtpEvent` interface | `TimelineEvent` |
| `RsvpStatus` / `isRsvpStatus` (shared/schema.ts) | `AttendanceStatus` / `isAttendanceStatus` |
| `Guest` / `isGuest` (shared/schema.ts) | `Attendee` / `isAttendee` (`rsvp` → `attendance`, `contributionCents` → `allocationCents`, `guestId` → `attendeeId`) |
| localStorage keys `sig.v27.graph` / `sig.v27.timeline` (+ `-positions`/`links`) | `sig.workspace.v3.graph` / `sig.workspace.v3.timeline` (+ `-positions`/`links`) |
| snapshot version `"sig.v27"` | `"sig.workspace.v3"` |
| export filename `signature-snapshot.json` | `signature-workspace.json` |

Sample copy changed too (guest → member, RSVP → attendance,
gathering-neutral strings) — strings your tests may assert; the ledger
badge labels (`Confirmed / Pending / Declined`) are unchanged.

Theme/radius preferences were later merged into one object under
`sig.workspace.v3.prefs` — the older per-axis keys migrate on first load.

## Retired page-template ids

The blueprint registry and the CLI `--template` set are exactly
`minimal | bento | telemetry | microlab`. Two generic ids retired:

| Retired id | Replacement |
|---|---|
| `saas` | `telemetry` — Match & Telemetry Analytics Hub (`SignatureTelemetryCenter.tsx`, replaced in place) |
| `docs` | `microlab` — Interactive Micro-Lab & Discovery Deck (`SignatureMicroLab.tsx`, new) |

Passing a retired id is a clean exit-1 CLI error; template consumers must
re-aim. The React components' props surfaces only grow — `FlipCard` gained
optional rich-face fields, `AccordionCard`'s surface is untouched.
