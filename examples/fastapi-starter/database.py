"""database.py — the SQLite store (sqlite3 STDLIB ONLY).

ZERO new python dependencies beyond fastapi/uvicorn (the release
constraint): the store is the stdlib `sqlite3` module talking to an
in-memory database guarded by one lock (uvicorn's threadpool calls
synchronously into these helpers from multiple worker threads).

The schema mirrors docs/SCHEMA_V3.md's DDL (snake_case, integer cents,
CHECK constraints on the attendance enum + the 2v2 mode rule). The
in-memory DB seeds ONE event so the FK'd POSTs have a target out of the
box; swap SQLITE_PATH to a file path for a persistent store.
"""

from __future__ import annotations

import sqlite3
import threading
from datetime import datetime, timezone
from typing import Any, Optional

SQLITE_PATH = ":memory:"
_lock = threading.Lock()
_conn: Optional[sqlite3.Connection] = None


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def get_connection() -> sqlite3.Connection:
    """The process-wide connection (created once, seeded once)."""
    global _conn
    if _conn is None:
        _conn = sqlite3.connect(SQLITE_PATH, check_same_thread=False)
        _conn.row_factory = sqlite3.Row
        _conn.execute("PRAGMA foreign_keys = ON")
        _migrate(_conn)
        _seed(_conn)
    return _conn


def _migrate(conn: sqlite3.Connection) -> None:
    """The SCHEMA_V3 DDL — snake_case columns, integer cents, CHECKs."""
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS events (
            id TEXT PRIMARY KEY,
            owner_id TEXT NOT NULL REFERENCES users(id),
            title TEXT NOT NULL,
            month TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT,
            color_token TEXT NOT NULL CHECK (color_token LIKE '--sig-%'),
            icon_name TEXT,
            description TEXT,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS attendees (
            id TEXT PRIMARY KEY,
            event_id TEXT NOT NULL REFERENCES events(id),
            name TEXT NOT NULL,
            attendance TEXT NOT NULL
                CHECK (attendance IN ('confirmed', 'pending', 'declined')),
            allocation_cents INTEGER NOT NULL CHECK (allocation_cents >= 0),
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS ledger_entries (
            id TEXT PRIMARY KEY,
            event_id TEXT NOT NULL REFERENCES events(id),
            attendee_id TEXT NOT NULL REFERENCES attendees(id),
            amount_cents INTEGER NOT NULL CHECK (amount_cents != 0),
            memo TEXT,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS milestones (
            id TEXT PRIMARY KEY,
            event_id TEXT NOT NULL REFERENCES events(id),
            title TEXT NOT NULL,
            month TEXT NOT NULL,
            category_token TEXT NOT NULL CHECK (category_token LIKE '--sig-%'),
            category_label TEXT,
            settled INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS graph_nodes (
            id TEXT PRIMARY KEY,
            workspace_id TEXT NOT NULL,
            event_id TEXT REFERENCES events(id),
            label TEXT NOT NULL,
            category_token TEXT NOT NULL,
            note TEXT,
            parent_id TEXT REFERENCES graph_nodes(id),
            tags TEXT,  -- JSON array of non-empty strings (the 3.6.0 field)
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS flashcard_decks (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            owner_id TEXT NOT NULL REFERENCES users(id),
            event_id TEXT REFERENCES events(id),
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS flashcards (
            id TEXT PRIMARY KEY,
            deck_id TEXT NOT NULL REFERENCES flashcard_decks(id),
            front TEXT NOT NULL,
            back TEXT NOT NULL,
            position INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS game_matchups (
            id TEXT PRIMARY KEY,
            event_id TEXT NOT NULL REFERENCES events(id),
            player_a_id TEXT NOT NULL REFERENCES attendees(id),
            player_b_id TEXT REFERENCES attendees(id),
            partner_a_id TEXT REFERENCES attendees(id),
            partner_b_id TEXT REFERENCES attendees(id),
            stakes TEXT,
            mode TEXT NOT NULL CHECK (
                mode IN ('1v1', '2v2')
                AND (mode = '1v1' OR (
                    partner_a_id IS NOT NULL AND partner_b_id IS NOT NULL))
            ),
            created_at TEXT NOT NULL
        );
        """
    )


def _seed(conn: sqlite3.Connection) -> None:
    """One user + one event — the FK targets the demo needs on boot."""
    now = _now()
    conn.execute(
        "INSERT OR IGNORE INTO users (id, name, email, created_at) VALUES (?, ?, ?, ?)",
        ("usr-owner", "edwyn", "edwyn@example.com", now),
    )
    conn.execute(
        """
        INSERT OR IGNORE INTO events
            (id, owner_id, title, month, date, time, color_token, description, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            "evt-001",
            "usr-owner",
            "Design walkthrough",
            "December 2026",
            "2026-12-01",
            "18:00",
            "--sig-mauve-bright",
            "Walk the component gallery with the team.",
            now,
        ),
    )
    conn.commit()


def query(sql: str, params: tuple = ()) -> list[dict[str, Any]]:
    """SELECT helper — rows as dicts (the Paginated payload's items)."""
    conn = get_connection()
    with _lock:
        rows = conn.execute(sql, params).fetchall()
    return [dict(row) for row in rows]


def query_one(sql: str, params: tuple = ()) -> Optional[dict[str, Any]]:
    rows = query(sql, params)
    return rows[0] if rows else None


def execute(sql: str, params: tuple = ()) -> str:
    """INSERT/UPDATE helper — commits and returns the row id (caller-minted)."""
    conn = get_connection()
    with _lock:
        conn.execute(sql, params)
        conn.commit()
    return str(params[0]) if params else ""
