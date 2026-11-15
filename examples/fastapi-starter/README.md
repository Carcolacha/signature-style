# fastapi-starter — the runnable reference backend

The docs/SCHEMA_V3.md contract as a minimal, runnable FastAPI app.
**Zero python dependencies beyond `fastapi` + `uvicorn`**: the store is
the stdlib `sqlite3` module (in-memory, seeded with one user + one event
so the FK'd POSTs have a target on boot).

## Run

```bash
cd examples/fastapi-starter
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

- Interactive OpenAPI UI: <http://localhost:8000/docs>
- Health probe: <http://localhost:8000/health>

## Endpoints (the SCHEMA_V3 core)

| Method | Path | Notes |
|---|---|---|
| GET | `/events` | `?limit/offset` — the Paginated envelope |
| POST | `/events` | validates `color_token` is a `--sig-*` name |
| GET | `/events/{id}` | 404 → the ApiError shape |
| GET | `/events/{id}/attendees` | the live ledger's source |
| POST | `/events/{id}/attendees` | `attendance` enum via CHECK + Literal |
| GET | `/attendees/{id}/ledger-entries` | Money-in-Cents (integer `amount_cents`) |
| POST | `/attendees/{id}/ledger-entries` | `amount_cents != 0` |
| GET | `/events/{id}/milestones` | month grouping happens client-side |
| POST | `/events/{id}/milestones` | the TimelineManager composer |
| GET | `/graph?workspace_id=` | the sig.workspace.v3.graph normalization |
| POST | `/graph` | `parent_id: null` = root; `tags` = non-empty string[] (3.6.0) |
| GET / POST | `/decks`, `/decks/{id}/flashcards` | the FlipCard pair, persisted |
| GET / POST | `/events/{id}/matchups` | mode CHECK: 2v2 ⇒ partners present |

## CORS

`CORSMiddleware` allows exactly one origin — the playground dev server
`http://localhost:5173` (the WorkspaceRepository rehearsal rig in
`playground/workspace-repository.ts` swaps to an HTTP adapter speaking
this contract). Tighten or extend the origin list before exposing this
beyond localhost.

## Wire contract

- Request/response bodies are snake_case (the docs/SCHEMA_V3.md wire);
  the Pydantic models accept camelCase aliases too (`populate_by_name`)
  so the TS-shaped payloads POST cleanly.
- Every timestamp is an ISO-8601 UTC string; every monetary amount is an
  INTEGER of cents (`12000` = $120.00) — never a float.
- `POST` bodies omit `id`/`createdAt` — the server mints both.

This is a STARTER: in-memory SQLite, no auth, no migration tooling.
