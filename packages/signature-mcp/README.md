# @edwyn/signature-mcp — The Visual Cortex as a Product (v1.0.0)

A **standalone MCP stdio server** that gives AI sessions spatial awareness of
the rendered Signature Style app: the AI can *measure what it styles*. It
drives a headless Playwright Chromium against the running playground and
returns structured geometry, runtime WCAG contrast ratios, e1-treaty shadow
verdicts, or a viewport screenshot matrix through the Model Context Protocol.

This is the promoted, productized form of the retired repo-local
`tools/mcp-viz/` inspector (v1.7.0 → v3.4.0 proven in production use across
nine releases).

**Prerequisite:** the playground dev server must be running first — from the
repo root: `npm run playground` (default `http://localhost:5173`). Every tool
returns a graceful error pointing at that command if the URL is unreachable.

**Chromium prerequisite:** Playwright needs its browser once per machine:

```sh
npx playwright install chromium
```

(The repo pins Playwright to EXACTLY `1.65.0` — identical to the root
devDependency — so the shared `~/.cache/ms-playwright` download is reused,
never duplicated.)

**No npm token needed:** this is a `private: true` local package; nothing is
published. Build it in place:

```sh
cd packages/signature-mcp
npm install
npm run build      # tsc strict → dist/server.js + dist/server.d.ts
```

## The four tools

### `inspect_layout`

Measures the rendered app. For **every element matching ANY selector** it
returns `{ selector, tag, classes[], rect: {x, y, width, height}, text (first
40 chars, trimmed), visible (width>0 && height>0) }`, plus a per-unique-class
coverage summary (`total` / `visible` / `notVisible`).

| Param | Type | Default | Notes |
|---|---|---|---|
| `url` | string | `http://localhost:5173` | Any absolute URL |
| `selectors` | string[] | the app anatomy (28 selectors: testids, timeline, progress, surface primitives, data module, bento, master index, graphs, the six `sig-*` custom elements) | CSS selectors to sweep |

Navigation waits for `networkidle` **plus 600ms** so entry animations settle
before measurement — no mid-flight rects.

### `audit_contrast`

Runtime WCAG 2.x contrast audit. For every **text-bearing, visible** element
in the sweep it resolves the **effective background** (walks ancestors for
the first non-transparent `background-color`; if nothing paints anywhere up
the tree, the documented Mocha-base assumption `#1E1E2E` is the honest last
resort) and the **effective text color** (the computed `color` IS the
inherited value; sub-alpha ink is alpha-blended over the resolved
background), computes the WCAG ratio (same 0.2126/0.7152/0.0722 math as the
package's `sig-contrast.ts`), and returns per-element
`{ selector, tag, fg, bg, ratio, pass }` plus
`summary: { passCount, failCount, failures (worst-first) }`.

| Param | Type | Default | Notes |
|---|---|---|---|
| `url` | string | `http://localhost:5173` | Any absolute URL |
| `selectors` | string[] | the app anatomy | CSS selectors to sweep |
| `minRatio` | number | `3.0` | WCAG floor (the doctrine graphical-objects floor) |

### `audit_e1_shadows`

Operationalizes the **e1 treaty at runtime**: sweeps EVERY element and
reports each computed `box-shadow` ≠ `none` as
`{ selectorChain, shadow, allowed }` — `allowed` = the element (or an
ancestor) matches the sanctioned surface/card hooks (`.sig-surface-card`,
`.sig-card`, the `[data-elevation]` ladder per the (e1)/(elev) amendments).
Returns `violations` (shadows OUTSIDE sanction) + `sanctionedCount`.

| Param | Type | Default | Notes |
|---|---|---|---|
| `url` | string | `http://localhost:5173` | Any absolute URL |

### `capture_viewport_matrix`

Screenshots the app at each viewport of a matrix — default
**375×812 / 768×1024 / 1440×900 / 1920×1080** (the doctrine matrix) — and
writes one PNG per viewport to a flat directory. Returns the flat matrix
`[{ viewport, path, bytes }, …]` (4 paths).

| Param | Type | Default | Notes |
|---|---|---|---|
| `url` | string | `http://localhost:5173` | Any absolute URL |
| `viewports` | `[width, height][]` | the 4-view doctrine matrix | Viewport matrix |
| `fullPage` | boolean | `false` | Full scrollable page per viewport (default viewport-exact) |
| `path` | string | `/tmp/opencode/viewport-matrix` | Output **directory** (dirs are created). If unwritable, degrades gracefully to `/tmp/visual-cortex/<name>` and says so in the row's `note`. |

## Attach configs

All configs point at the compiled server:

```
node <abs>/packages/signature-mcp/dist/server.js
```

(`<abs>` = the absolute path of this repo on your machine.)

### VS Code (`.vscode/mcp.json`)

Workspace-level MCP config — `.vscode/mcp.json` in the repo (or any
workspace folder):

```json
{
  "servers": {
    "visual-cortex": {
      "type": "stdio",
      "command": "node",
      "args": ["<abs>/packages/signature-mcp/dist/server.js"]
    }
  }
}
```

### Claude Code (CLI + JSON)

CLI (one shot):

```sh
claude mcp add signature-mcp -- node <abs>/packages/signature-mcp/dist/server.js
```

Equivalent JSON (project-scoped `.mcp.json`, or `~/.claude.json`):

```json
{
  "mcpServers": {
    "signature-mcp": {
      "command": "node",
      "args": ["<abs>/packages/signature-mcp/dist/server.js"]
    }
  }
}
```

### OpenCode (V2 — `opencode.json`)

Verified against the V2 configuration docs
(<https://opencode.ai/docs/mcp-servers>, the v2.7.0 citation). Server names
live under `mcp.servers`, *not* directly under `mcp`. Use an **absolute**
path:

```jsonc title="opencode.json"
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "servers": {
      "visual-cortex": {
        "type": "local",
        "command": ["node", "<abs>/packages/signature-mcp/dist/server.js"]
      }
    }
  }
}
```

CLI equivalent: `opencode mcp add visual-cortex -- node <abs>/packages/signature-mcp/dist/server.js`

## Smoke proof

The repo-root gate `npm run verify:mcp` builds this package, spawns
`dist/server.js`, and speaks raw JSON-RPC over stdio
(initialize → tools/list → tools/call × 4), asserting: exactly the FOUR
tools are listed; `inspect_layout` returns ≥ 20 real hits;
`audit_contrast` returns a pass/fail summary; `audit_e1_shadows` returns
sanctioned + violations arrays; `capture_viewport_matrix` returns 4 written
PNG paths with bytes on disk. ALL PASS or the release is blocked.
