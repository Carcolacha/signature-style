"""main.py — the Signature Style reference backend (FastAPI + SQLite).

The runnable skeleton of the docs/SCHEMA_V3.md contract: the core
endpoints (events, attendees, ledger-entries, milestones, graph, decks,
flashcards, matchups) with GET/POST + the Paginated envelope, the
ApiError error shape, and the Money-in-Cents / --sig-* token rules
enforced at the model layer (models.py) and the storage layer
(database.py CHECK constraints).

RUN (from this directory):

    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000

    → http://localhost:8000/docs   (the interactive OpenAPI UI)

CORS is wired for the playground dev server (http://localhost:5173) —
the pattern-studio rehearsal rig talks to THIS app through the
WorkspaceRepository seam (playground/workspace-repository.ts documents
the swap).

This is a STARTER, not the production service: in-memory SQLite, no
auth, no migrations tooling. Each aggregate grows exactly the way
SCHEMA_V3.md's table describes.
"""

from __future__ import annotations

import json
from typing import Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

import database
from models import (
    ApiError,
    Attendee,
    AttendeeIn,
    Event,
    EventIn,
    Flashcard,
    FlashcardDeck,
    FlashcardDeckIn,
    FlashcardIn,
    GameMatchup,
    GameMatchupIn,
    GraphNodeRecord,
    GraphNodeRecordIn,
    LedgerEntry,
    LedgerEntryIn,
    Milestone,
    MilestoneIn,
    Paginated,
    new_id,
)

app = FastAPI(
    title="Signature Style — reference backend",
    version="3.6.0",
    description="The docs/SCHEMA_V3.md contract as a runnable FastAPI + SQLite starter.",
)

# CORS — the playground dev server is the only sanctioned origin (the
# rehearsal rig); tighten before ever exposing this beyond localhost.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# The 422 validation shape rides FastAPI's default; the ApiError envelope
# is the documented every-error BODY for the 404/conflict paths below.
_ERROR = ApiError(code="not_found", message="resource not found")


def _not_found() -> HTTPException:
    return HTTPException(status_code=404, detail=_ERROR.model_dump())


def _paginate(items: list[dict[str, Any]], limit: int, offset: int) -> Paginated:
    """The Paginated envelope: one page slice + the true total."""
    window = items[offset : offset + limit]
    return Paginated(data=window, total=len(items), limit=limit, offset=offset)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "version": "3.6.0"}


# ---------------------------------------------------------------------------
# EVENTS
# ---------------------------------------------------------------------------


@app.get("/events", response_model_exclude_none=True)
def list_events(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> Paginated:
    rows = database.query("SELECT * FROM events ORDER BY created_at")
    return _paginate(rows, limit, offset)


@app.post("/events", status_code=201)
def create_event(body: EventIn) -> Event:
    event_id = new_id("evt")
    created = Event(
        id=event_id,
        created_at=database._now(),
        **body.model_dump(by_alias=True),
    )
    database.execute(
        """
        INSERT INTO events
            (id, owner_id, title, month, date, time, color_token, icon_name, description, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            event_id,
            body.owner_id,
            body.title,
            body.month,
            body.date,
            body.time,
            body.color_token,
            body.icon_name,
            body.description,
            created.created_at,
        ),
    )
    return created


@app.get("/events/{event_id}")
def get_event(event_id: str) -> dict[str, Any]:
    row = database.query_one("SELECT * FROM events WHERE id = ?", (event_id,))
    if row is None:
        raise _not_found()
    return row


# ---------------------------------------------------------------------------
# ATTENDEES (the live ledger's source)
# ---------------------------------------------------------------------------


@app.get("/events/{event_id}/attendees")
def list_attendees(
    event_id: str,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> Paginated:
    if database.query_one("SELECT id FROM events WHERE id = ?", (event_id,)) is None:
        raise _not_found()
    rows = database.query(
        "SELECT * FROM attendees WHERE event_id = ? ORDER BY created_at",
        (event_id,),
    )
    return _paginate(rows, limit, offset)


@app.post("/events/{event_id}/attendees", status_code=201)
def create_attendee(event_id: str, body: AttendeeIn) -> Attendee:
    if database.query_one("SELECT id FROM events WHERE id = ?", (event_id,)) is None:
        raise _not_found()
    attendee_id = new_id("att")
    created = Attendee(
        id=attendee_id,
        created_at=database._now(),
        **{**body.model_dump(by_alias=True), "eventId": event_id},
    )
    database.execute(
        """
        INSERT INTO attendees
            (id, event_id, name, attendance, allocation_cents, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            attendee_id,
            event_id,
            body.name,
            body.attendance,
            body.allocation_cents,
            created.created_at,
        ),
    )
    return created


# ---------------------------------------------------------------------------
# LEDGER ENTRIES (Money-in-Cents — amount_cents != 0)
# ---------------------------------------------------------------------------


@app.get("/attendees/{attendee_id}/ledger-entries")
def list_ledger_entries(
    attendee_id: str,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> Paginated:
    if database.query_one("SELECT id FROM attendees WHERE id = ?", (attendee_id,)) is None:
        raise _not_found()
    rows = database.query(
        "SELECT * FROM ledger_entries WHERE attendee_id = ? ORDER BY created_at",
        (attendee_id,),
    )
    return _paginate(rows, limit, offset)


@app.post("/attendees/{attendee_id}/ledger-entries", status_code=201)
def create_ledger_entry(attendee_id: str, body: LedgerEntryIn) -> LedgerEntry:
    if database.query_one("SELECT id FROM attendees WHERE id = ?", (attendee_id,)) is None:
        raise _not_found()
    entry_id = new_id("led")
    created = LedgerEntry(
        id=entry_id,
        created_at=database._now(),
        **{**body.model_dump(by_alias=True), "attendeeId": attendee_id},
    )
    database.execute(
        """
        INSERT INTO ledger_entries
            (id, event_id, attendee_id, amount_cents, memo, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            entry_id,
            body.event_id,
            attendee_id,
            body.amount_cents,
            body.memo,
            created.created_at,
        ),
    )
    return created


# ---------------------------------------------------------------------------
# MILESTONES (the TimelineManager composer)
# ---------------------------------------------------------------------------


@app.get("/events/{event_id}/milestones")
def list_milestones(
    event_id: str,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> Paginated:
    if database.query_one("SELECT id FROM events WHERE id = ?", (event_id,)) is None:
        raise _not_found()
    rows = database.query(
        "SELECT * FROM milestones WHERE event_id = ? ORDER BY created_at",
        (event_id,),
    )
    # month grouping happens CLIENT-side (the SCHEMA_V3 note)
    return _paginate(rows, limit, offset)


@app.post("/events/{event_id}/milestones", status_code=201)
def create_milestone(event_id: str, body: MilestoneIn) -> Milestone:
    if database.query_one("SELECT id FROM events WHERE id = ?", (event_id,)) is None:
        raise _not_found()
    milestone_id = new_id("mil")
    created = Milestone(
        id=milestone_id,
        created_at=database._now(),
        **{**body.model_dump(by_alias=True), "eventId": event_id},
    )
    database.execute(
        """
        INSERT INTO milestones
            (id, event_id, title, month, category_token, category_label, settled, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            milestone_id,
            event_id,
            body.title,
            body.month,
            body.category_token,
            body.category_label,
            int(body.settled),
            created.created_at,
        ),
    )
    return created


# ---------------------------------------------------------------------------
# THE KNOWLEDGE GRAPH (the sig.workspace.v3.graph normalization;
# parent_id: null = root; tags rides the 3.6.0 field)
# ---------------------------------------------------------------------------


@app.get("/graph")
def list_graph_nodes(
    workspace_id: str = Query(default="usr-owner"),
    limit: int = Query(default=200, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> Paginated:
    rows = database.query(
        "SELECT * FROM graph_nodes WHERE workspace_id = ? ORDER BY created_at",
        (workspace_id,),
    )
    for row in rows:
        row["tags"] = json.loads(row["tags"]) if row["tags"] else None
    return _paginate(rows, limit, offset)


@app.post("/graph", status_code=201)
def create_graph_node(body: GraphNodeRecordIn) -> GraphNodeRecord:
    node_id = new_id("kg")
    created = GraphNodeRecord(
        id=node_id,
        created_at=database._now(),
        **body.model_dump(by_alias=True),
    )
    database.execute(
        """
        INSERT INTO graph_nodes
            (id, workspace_id, event_id, label, category_token, note, parent_id, tags, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            node_id,
            body.workspace_id,
            body.event_id,
            body.label,
            body.category_token,
            body.note,
            body.parent_id,
            json.dumps(body.tags) if body.tags else None,
            created.created_at,
        ),
    )
    return created


# ---------------------------------------------------------------------------
# FLASHCARD DECKS + CARDS (the FlipCard pair, persisted)
# ---------------------------------------------------------------------------


@app.get("/decks")
def list_decks(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> Paginated:
    rows = database.query("SELECT * FROM flashcard_decks ORDER BY created_at")
    return _paginate(rows, limit, offset)


@app.post("/decks", status_code=201)
def create_deck(body: FlashcardDeckIn) -> FlashcardDeck:
    deck_id = new_id("dek")
    created = FlashcardDeck(
        id=deck_id,
        created_at=database._now(),
        **body.model_dump(by_alias=True),
    )
    database.execute(
        "INSERT INTO flashcard_decks (id, title, owner_id, event_id, created_at) VALUES (?, ?, ?, ?, ?)",
        (deck_id, body.title, body.owner_id, body.event_id, created.created_at),
    )
    return created


@app.get("/decks/{deck_id}/flashcards")
def list_flashcards(
    deck_id: str,
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> Paginated:
    if database.query_one("SELECT id FROM flashcard_decks WHERE id = ?", (deck_id,)) is None:
        raise _not_found()
    rows = database.query(
        "SELECT * FROM flashcards WHERE deck_id = ? ORDER BY position",
        (deck_id,),
    )
    return _paginate(rows, limit, offset)


@app.post("/decks/{deck_id}/flashcards", status_code=201)
def create_flashcard(deck_id: str, body: FlashcardIn) -> Flashcard:
    if database.query_one("SELECT id FROM flashcard_decks WHERE id = ?", (deck_id,)) is None:
        raise _not_found()
    card_id = new_id("crd")
    created = Flashcard(id=card_id, deckId=deck_id, front=body.front, back=body.back, position=body.position)
    database.execute(
        "INSERT INTO flashcards (id, deck_id, front, back, position) VALUES (?, ?, ?, ?, ?)",
        (card_id, deck_id, body.front, body.back, body.position),
    )
    return created


# ---------------------------------------------------------------------------
# MATCHUPS (1v1 | 2v2 — the CHECK enforces the partners rule)
# ---------------------------------------------------------------------------


@app.get("/events/{event_id}/matchups")
def list_matchups(
    event_id: str,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> Paginated:
    if database.query_one("SELECT id FROM events WHERE id = ?", (event_id,)) is None:
        raise _not_found()
    rows = database.query(
        "SELECT * FROM game_matchups WHERE event_id = ? ORDER BY created_at",
        (event_id,),
    )
    return _paginate(rows, limit, offset)


@app.post("/events/{event_id}/matchups", status_code=201)
def create_matchup(event_id: str, body: GameMatchupIn) -> GameMatchup:
    if database.query_one("SELECT id FROM events WHERE id = ?", (event_id,)) is None:
        raise _not_found()
    matchup_id = new_id("mnt")
    created = GameMatchup(
        id=matchup_id,
        created_at=database._now(),
        **{**body.model_dump(by_alias=True), "eventId": event_id},
    )
    try:
        database.execute(
            """
            INSERT INTO game_matchups
                (id, event_id, player_a_id, player_b_id, partner_a_id, partner_b_id, stakes, mode, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                matchup_id,
                event_id,
                body.player_a_id,
                body.player_b_id,
                body.partner_a_id,
                body.partner_b_id,
                body.stakes,
                body.mode,
                created.created_at,
            ),
        )
    except Exception as error:  # the CHECK constraint speaks for the contract
        raise HTTPException(
            status_code=422,
            detail=ApiError(
                code="validation_error",
                message=str(error),
            ).model_dump(),
        ) from error
    return created
