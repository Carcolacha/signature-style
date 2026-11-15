"""models.py — the Pydantic v2 wire contract, mirroring shared/schema.ts 1:1.

The TypeScript side is the source of truth (camelCase); the REST wire is
snake_case per docs/SCHEMA_V3.md. Every model therefore declares
snake_case python attributes with camelCase populate aliases
(`populate_by_name`) — a client may POST either spelling, responses
serialize snake_case (model_dump(by_alias=True)).

The Money-in-Cents rule (see shared/schema.ts): every amount is an
INTEGER of cents (12000 = $120.00) — never a float. The `$` formatting
happens ONCE at the display boundary.

The `tags` field (3.6.0): an enumerated array of non-empty strings
(mirrors shared/schema.ts GraphNodeRecord.tags — the Graph Studio
inspector's comma-separated field → chips).
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator

AttendanceStatus = Literal["confirmed", "pending", "declined"]


def utc_now_iso() -> str:
    """ISO-8601 UTC instant — the createdAt the server mints on insert."""
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def new_id(prefix: str) -> str:
    """A sortable, collision-safe-enough id for the demo store."""
    import uuid

    return f"{prefix}-{uuid.uuid4().hex[:12]}"


# ---------------------------------------------------------------------------
# CORE ENTITIES (shared/schema.ts 1:1)
# ---------------------------------------------------------------------------


class User(BaseModel):
    """The account holder (single-user demo — the owner)."""

    model_config = {"populate_by_name": True}

    id: str
    name: str
    email: str
    created_at: str = Field(alias="createdAt")


class EventIn(BaseModel):
    """POST /events body — Event minus the server-minted id/createdAt."""

    model_config = {"populate_by_name": True}

    owner_id: str = Field(alias="ownerId")
    title: str
    month: str
    date: str
    time: Optional[str] = None
    color_token: str = Field(alias="colorToken")
    icon_name: Optional[str] = Field(default=None, alias="iconName")
    description: Optional[str] = None

    @field_validator("color_token")
    @classmethod
    def token_is_sig(cls, value: str) -> str:
        """The SCHEMA_V3 contract: color_token must be a --sig-* name."""
        if not value.startswith("--sig-"):
            raise ValueError("color_token must be a --sig-* token name")
        return value


class Event(EventIn):
    """One planned event — the wire record."""

    id: str
    created_at: str = Field(alias="createdAt", default_factory=utc_now_iso)


class AttendeeIn(BaseModel):
    """POST /events/{id}/attendees body — Attendee minus id/createdAt."""

    model_config = {"populate_by_name": True}

    event_id: str = Field(alias="eventId")
    name: str
    attendance: AttendanceStatus = "pending"
    allocation_cents: int = Field(default=0, alias="allocationCents")

    @field_validator("allocation_cents")
    @classmethod
    def cents_are_integer(cls, value: int) -> int:
        if value < 0:
            raise ValueError("allocation_cents must be >= 0")
        return value


class Attendee(AttendeeIn):
    """One enrolled person on one event."""

    id: str
    created_at: str = Field(alias="createdAt", default_factory=utc_now_iso)


class LedgerEntryIn(BaseModel):
    """POST /attendees/{id}/ledger-entries body."""

    model_config = {"populate_by_name": True}

    event_id: str = Field(alias="eventId")
    attendee_id: str = Field(alias="attendeeId")
    amount_cents: int = Field(alias="amountCents")
    memo: Optional[str] = None

    @field_validator("amount_cents")
    @classmethod
    def nonzero_cents(cls, value: int) -> int:
        """The SCHEMA_V3 contract: amount_cents != 0 (positive = in, negative = refund)."""
        if value == 0:
            raise ValueError("amount_cents must be non-zero")
        return value


class LedgerEntry(LedgerEntryIn):
    """One money movement on the shared pot."""

    id: str
    created_at: str = Field(alias="createdAt", default_factory=utc_now_iso)


class MilestoneIn(BaseModel):
    """POST /events/{id}/milestones body."""

    model_config = {"populate_by_name": True}

    event_id: str = Field(alias="eventId")
    title: str
    month: str
    category_token: str = Field(alias="categoryToken")
    category_label: Optional[str] = Field(default=None, alias="categoryLabel")
    settled: bool = False

    @field_validator("category_token")
    @classmethod
    def token_is_sig(cls, value: str) -> str:
        if not value.startswith("--sig-"):
            raise ValueError("category_token must be a --sig-* token name")
        return value


class Milestone(MilestoneIn):
    """One planner milestone (the TimelineManager record)."""

    id: str
    created_at: str = Field(alias="createdAt", default_factory=utc_now_iso)


# ---------------------------------------------------------------------------
# WORKSPACE ENTITIES
# ---------------------------------------------------------------------------


class GraphNodeRecordIn(BaseModel):
    """POST /graph body — GraphNodeRecord minus id/createdAt."""

    model_config = {"populate_by_name": True}

    workspace_id: str = Field(alias="workspaceId")
    label: str
    category_token: str = Field(alias="categoryToken")
    note: Optional[str] = None
    parent_id: Optional[str] = Field(default=None, alias="parentId")
    event_id: Optional[str] = Field(default=None, alias="eventId")
    tags: Optional[list[str]] = None

    @field_validator("tags")
    @classmethod
    def tags_enumerated(cls, value: Optional[list[str]]) -> Optional[list[str]]:
        """The 3.6.0 contract: a list of non-empty strings (or absent)."""
        if value is None:
            return None
        for tag in value:
            if not isinstance(tag, str) or not tag:
                raise ValueError("tags must be an array of non-empty strings")
        return value


class GraphNodeRecord(GraphNodeRecordIn):
    """One node on the knowledge graph (the sig.workspace.v3.graph shape)."""

    id: str
    created_at: str = Field(alias="createdAt", default_factory=utc_now_iso)


class FlashcardDeckIn(BaseModel):
    """POST /decks body."""

    model_config = {"populate_by_name": True}

    title: str
    owner_id: str = Field(alias="ownerId")
    event_id: Optional[str] = Field(default=None, alias="eventId")


class FlashcardDeck(FlashcardDeckIn):
    """A deck of study flashcards (the FlipCard pairs)."""

    id: str
    created_at: str = Field(alias="createdAt", default_factory=utc_now_iso)


class FlashcardIn(BaseModel):
    """POST /decks/{id}/flashcards body."""

    deck_id: str = Field(alias="deckId")
    front: str
    back: str
    position: int


class Flashcard(FlashcardIn):
    """One card: the FlipCard pair, persisted."""

    id: str


class GameMatchupIn(BaseModel):
    """POST /events/{id}/matchups body."""

    model_config = {"populate_by_name": True}

    event_id: str = Field(alias="eventId")
    player_a_id: str = Field(alias="playerAId")
    player_b_id: Optional[str] = Field(default=None, alias="playerBId")
    partner_a_id: Optional[str] = Field(default=None, alias="partnerAId")
    partner_b_id: Optional[str] = Field(default=None, alias="partnerBId")
    stakes: Optional[str] = None
    mode: Literal["1v1", "2v2"] = "1v1"


class GameMatchup(GameMatchupIn):
    """One benchmark matchup."""

    id: str
    created_at: str = Field(alias="createdAt", default_factory=utc_now_iso)

    @field_validator("mode")
    @classmethod
    def mode_needs_partners(cls, value: str, info) -> str:  # type: ignore[no-untyped-def]
        """The SCHEMA_V3 CHECK: 2v2 requires both partners."""
        data = info.data
        if value == "2v2" and (data.get("partner_a_id") is None or data.get("partner_b_id") is None):
            raise ValueError("mode 2v2 requires partnerAId and partnerBId")
        return value


# ---------------------------------------------------------------------------
# API ENVELOPES (the REST contract's error + paging shapes)
# ---------------------------------------------------------------------------


class ApiError(BaseModel):
    """The every-error body — FastAPI raises this shape via app.error_shape."""

    code: str
    message: str
    details: Optional[dict[str, list[str]]] = None


class Paginated(BaseModel):
    """A successful list page (generic in spirit — endpoints hand it a typed items list)."""

    data: list[dict]
    total: int
    limit: int
    offset: int
