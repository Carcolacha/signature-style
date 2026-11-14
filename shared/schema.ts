/**
 * shared/schema — THE DATA ARCHITECTURE BLUEPRINT (3.0.0 "16-Color
 * Chromatic System, Obsidian Graph, 3×3 Carousel, Symmetrical Forms &
 * 60fps").
 *
 * Zero-dependency TypeScript DTO interfaces shared by the playground
 * frontend AND the future FastAPI backend. This file is the 1:1 mirror
 * of the Pydantic v2 models in docs/SCHEMA_V3.md — change one, change
 * both (the docs carry the DDL + the API contract table).
 *
 * WHY integer cents for money (the Money-in-Cents rule): floats drift
 * (`0.1 + 0.2 !== 0.3`) and a shared-pot ledger sums REAL contributions
 * — a cent lost to float rounding in a sum is a wrong total nobody can
 * reconcile. Integer cents (12000 = $120.00) make every amount an
 * exact INTEGER in JS, SQLite (INTEGER) and PostgreSQL (BIGINT); all
 * arithmetic (sums, splits, percent buckets) stays in the integer
 * domain; the "$" formatting happens ONCE at the display boundary
 * (`amountCents / 100`). The frontend's in-memory `contribution` field
 * (playground/App.tsx `Guest`) stays in whole dollars for the demo's
 * ergonomics; the PERSISTED wire format is cents.
 *
 * EVERY field below traces to a real frontend usage — the citation is
 * in the per-field docs and consolidated in docs/SCHEMA_V3.md.
 */

/* ==========================================================================
   CORE ENTITIES
   ========================================================================== */

/**
 * The account holder. The playground is single-user (the owner), but a
 * backend needs the actor for auth + ownership FKs.
 * Traces to: the GlobalNav session context (react/nav.tsx renders the
 * signed-in chrome) and every owner-scoped entity below.
 */
export interface User {
  id: string;
  /** Display name — renders as the Avatar initials source. */
  name: string;
  email: string;
  /** ISO 8601 instant. */
  createdAt: string;
}

/**
 * One planned event (a party). Traces to:
 *   - `mockEvents` / `TimelineEvent` (playground/App.tsx: id, month, title,
 *     time, colorToken, iconName, description?) — the owner's real
 *     source-data contract;
 *   - `SEED_TIMELINE` month buckets (playground/App.tsx) — the
 *     TimelineManager groups by the month string.
 * `month` is the human bucket ("December 2026") the timeline renders;
 * `date` is the machine ISO date the backend sorts by.
 */
export interface Event {
  id: string;
  /** The owner (User.id) — every event belongs to exactly one user. */
  ownerId: string;
  title: string;
  /** The timeline's group bucket, verbatim from the UI ("December 2026"). */
  month: string;
  /** ISO 8601 date (the sortable truth behind `month`). */
  date: string;
  /** "18:00" — the EventModal About row (react/timeline.tsx renders it). */
  time?: string;
  /**
   * The event's theme token — a `--sig-*` content token (Rule of
   * Engagement). Traces to `MockEvent.colorToken` → `TimelineEvent.category`
   * (playground/App.tsx CATEGORY_LABELS).
   */
  colorToken: string;
  /** A lucide icon key ("MapPin", "AudioLines"). Traces to iconName. */
  iconName?: string;
  /** The EventModal description paragraph. Traces to `description?`. */
  description?: string;
  createdAt: string;
}

/** The RSVP contract — the three-word ledger state (playground/App.tsx Guest["rsvp"]). */
export type RsvpStatus = "confirmed" | "pending" | "declined";

/**
 * One invited person on one event. Traces to `Guest`
 * (playground/App.tsx: id, name, rsvp, contribution) — the live bento's
 * one reactive array (SEED_GUESTS → checkIn → derived.ledgerRows).
 * `contributionCents` is the PERSISTED twin of the demo's whole-dollar
 * `contribution` (120 → 12000).
 */
export interface Guest {
  id: string;
  /** FK → Event.id (a guest is invited to exactly one event). */
  eventId: string;
  name: string;
  rsvp: RsvpStatus;
  /** Integer cents — the Money-in-Cents rule (see the file header). */
  contributionCents: number;
  createdAt: string;
}

/**
 * One money movement on the shared pot. The playground DERIVES the
 * ledger from `Guest.contribution` (derived.ledgerRows,
 * playground/App.tsx); a backend normalizes it into rows so a guest's
 * pledge history is append-only and auditable.
 */
export interface LedgerEntry {
  id: string;
  /** FK → Event.id — the pot this movement lands in. */
  eventId: string;
  /** FK → Guest.id — who moved the money. */
  guestId: string;
  /** Integer cents (positive = in, negative = refund). */
  amountCents: number;
  /** The why — e.g. "deposit", "top-up", "refund". */
  memo?: string;
  createdAt: string;
}

/**
 * One planner milestone. Traces to `TimelineItem extends TimelineEvent`
 * (react/timeline-manager.d.ts: date, title, category, categoryLabel?,
 * settled?) — the Milestone Manager's controlled array
 * (sig.v27.timeline, playground/App.tsx SEED_TIMELINE).
 */
export interface Milestone {
  id: string;
  /** FK → Event.id. */
  eventId: string;
  title: string;
  /** The group bucket month ("November 2026"). */
  month: string;
  /** A `--sig-*` token — the SigBadge chip color. Traces to `category`. */
  categoryToken: string;
  /** The badge's short word ("Venue", "Catering"). Traces to `categoryLabel`. */
  categoryLabel?: string;
  /** The settle state (the aria-pressed toggle). Traces to `settled?`. */
  settled?: boolean;
  createdAt: string;
}

/* ==========================================================================
   WORKSPACE ENTITIES (the sig.v27.* persisted shapes, normalized)
   ========================================================================== */

/**
 * One node on the knowledge graph. Traces to `GraphNode`
 * (react/graph.d.ts: id, label, categoryToken, note?, parentId?) — the
 * persisted `sig.v27.graph` array (playground/App.tsx usePersistentState).
 * Workspace-scoped: graph nodes hang off the workspace (the owner's
 * planning board), optionally tagged to an event.
 */
export interface GraphNodeRecord {
  id: string;
  /** The owning workspace = the owner's User.id (single-user today). */
  workspaceId: string;
  /** FK → Event.id, nullable — a node MAY tag an event. */
  eventId?: string;
  label: string;
  /** A `--sig-*` content token — the node ring (Rule of Engagement). */
  categoryToken: string;
  /** The footer inspect strip copy. Traces to `note?`. */
  note?: string;
  /** FK → GraphNodeRecord.id, nullable — undefined/null renders a root. */
  parentId?: string;
}

/**
 * A deck of study flashcards. Traces to the `<FlipCard front back>`
 * usage (playground/App.tsx: "Dare: sing the chorus" / "…or forfeit 10
 * points") and the Study & Flashcard Engine gateway — the deck is the
 * persistable form of the flip-card pair.
 */
export interface FlashcardDeck {
  id: string;
  title: string;
  /** FK → User.id. */
  ownerId: string;
  /** FK → Event.id, nullable — a deck MAY be event-themed. */
  eventId?: string;
  createdAt: string;
}

/** One card in a deck: the FlipCard pair, persisted. */
export interface Flashcard {
  id: string;
  /** FK → FlashcardDeck.id. */
  deckId: string;
  /** The prompt side. Traces to FlipCardProps.front (react/cards.d.ts). */
  front: string;
  /** The reveal side. Traces to FlipCardProps.back (react/cards.d.ts). */
  back: string;
  position: number;
}

/**
 * One game matchup. Traces to `MatchupCardProps` (react/cards.d.ts:
 * title?, left/right { name, ringToken }, stakes?) — the 1v1 bracket
 * card the bento and the index render; `mode` extends the card's 1fr
 * auto 1fr grid to the 2v2 case.
 */
export interface GameMatchup {
  id: string;
  /** FK → Event.id — matchups happen at an event. */
  eventId: string;
  /** FK → Guest.id (player A). Traces to MatchupSide.name. */
  playerAId: string;
  /** FK → Guest.id (player B). Traces to MatchupSide.name. */
  playerBId?: string;
  /** 2v2 partner of A (mode "2v2" only). */
  partnerAId?: string;
  /** 2v2 partner of B (mode "2v2" only). */
  partnerBId?: string;
  /** The mono stakes footer. Traces to MatchupCardProps.stakes. */
  stakes?: string;
  mode: "1v1" | "2v2";
  createdAt: string;
}

/* ==========================================================================
   API ENVELOPE TYPES (the REST contract's error + paging shapes)
   ========================================================================== */

/** The every-error body — FastAPI returns this shape verbatim. */
export interface ApiError {
  /** Machine code ("not_found", "validation_error", "conflict"). */
  code: string;
  /** Human message, safe to render. */
  message: string;
  /** Field-level validation details, keyed by dotted path. */
  details?: Record<string, string[]>;
}

/** A successful list page. */
export interface Paginated<T> {
  data: T[];
  /** The page's item count (≤ limit). */
  total: number;
  limit: number;
  offset: number;
}

/* ==========================================================================
   RUNTIME GUARDS — import-validation reuse (the snapshot shape gate).
   The playground's isGraphNodeish/isTimelineItemish
   (playground/App.tsx) graduate into shared, exhaustive guards so the
   frontend and the backend validate the SAME wire contract.
   ========================================================================== */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isRsvpStatus(value: unknown): value is RsvpStatus {
  return (
    value === "confirmed" || value === "pending" || value === "declined"
  );
}

export function isGuest(value: unknown): value is Guest {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.eventId === "string" &&
    typeof value.name === "string" &&
    isRsvpStatus(value.rsvp) &&
    typeof value.contributionCents === "number" &&
    Number.isInteger(value.contributionCents) &&
    typeof value.createdAt === "string"
  );
}

export function isEvent(value: unknown): value is Event {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.ownerId === "string" &&
    typeof value.title === "string" &&
    typeof value.month === "string" &&
    typeof value.date === "string" &&
    typeof value.colorToken === "string" &&
    typeof value.createdAt === "string"
  );
}

export function isLedgerEntry(value: unknown): value is LedgerEntry {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.eventId === "string" &&
    typeof value.guestId === "string" &&
    typeof value.amountCents === "number" &&
    Number.isInteger(value.amountCents) &&
    typeof value.createdAt === "string"
  );
}

export function isMilestone(value: unknown): value is Milestone {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.eventId === "string" &&
    typeof value.title === "string" &&
    typeof value.month === "string" &&
    typeof value.categoryToken === "string" &&
    typeof value.createdAt === "string"
  );
}

export function isGraphNodeRecord(value: unknown): value is GraphNodeRecord {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.workspaceId === "string" &&
    typeof value.label === "string" &&
    typeof value.categoryToken === "string"
  );
}

export function isFlashcardDeck(value: unknown): value is FlashcardDeck {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.ownerId === "string" &&
    typeof value.createdAt === "string"
  );
}

export function isFlashcard(value: unknown): value is Flashcard {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.deckId === "string" &&
    typeof value.front === "string" &&
    typeof value.back === "string" &&
    typeof value.position === "number" &&
    Number.isInteger(value.position)
  );
}

export function isGameMatchup(value: unknown): value is GameMatchup {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.eventId === "string" &&
    typeof value.playerAId === "string" &&
    (value.mode === "1v1" || value.mode === "2v2") &&
    typeof value.createdAt === "string"
  );
}

export function isApiError(value: unknown): value is ApiError {
  return (
    isRecord(value) &&
    typeof value.code === "string" &&
    typeof value.message === "string"
  );
}

export function isPaginated<T>(
  value: unknown,
  isItem: (item: unknown) => item is T,
): value is Paginated<T> {
  return (
    isRecord(value) &&
    Array.isArray(value.data) &&
    value.data.every(isItem) &&
    typeof value.total === "number" &&
    typeof value.limit === "number" &&
    typeof value.offset === "number"
  );
}
