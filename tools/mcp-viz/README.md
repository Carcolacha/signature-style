# @edwyn/visual-cortex-mcp — The Visual Cortex (v1.7.0)

An MCP stdio server that gives AI sessions **spatial awareness of the rendered
Signature Style dashboard**: the AI can now *measure what it styles*. It drives
a headless Playwright Chromium against the running playground and returns
structured geometry (or a screenshot) through the Model Context Protocol.

**Prerequisite:** the playground dev server must be running first —
from the repo root: `npm run playground` (default `http://localhost:5173`).
Both tools return a graceful error pointing at that command if the URL is
unreachable.

**No npm token needed:** this is a `private: true` local workspace package;
nothing is published, and its dependencies all resolve from the public npm
registry. Build it in place:

```sh
cd tools/mcp-viz
npm install        # playwright downloads Chromium on first install
npm run build      # tsc → dist/server.js
npm run smoke      # release-blocker proof (needs the dev server up)
```

## Tools

### `inspect_layout`

Measures the rendered dashboard. For **every element matching ANY selector**
it returns `{ selector, tag, classes[], rect: {x, y, width, height},
text (first 40 chars, trimmed), visible (width>0 && height>0) }`, plus a
per-unique-class coverage summary (`total` / `visible` / `notVisible`).

| Param | Type | Default | Notes |
|---|---|---|---|
| `url` | string | `http://localhost:5173` | Any absolute URL |
| `selectors` | string[] | `["[data-testid]", ".ptp-timeline__node", ".ptp-timeline__item", ".ptp-timeline__header", ".ptp-progress", ".ptp-progress__fill", ".bento__card", ".bento__metric", ".bento__btn"]` | The dashboard's anatomy |

Navigation waits for `networkidle` **plus 600ms** so entry animations settle
before measurement — no mid-flight rects.

### `capture_screenshot`

Screenshots the dashboard and returns MCP **image content**
(`{ type: "image", data: <base64>, mimeType: "image/png" }`).

| Param | Type | Default | Notes |
|---|---|---|---|
| `url` | string | `http://localhost:5173` | Any absolute URL |
| `fullPage` | boolean | `true` | Full scrollable page |
| `path` | string | `/tmp/opencode/dashboard-mcp.png` | **Also** writes the PNG to disk (dirs are created). If the path is unwritable (e.g. `/tmp/opencode` is root-owned), it degrades gracefully to `/tmp/visual-cortex/<name>` and says so in the text content. |

## Attach: OpenCode (V2)

Verified against the V2 configuration docs
(<https://opencode.ai/docs/mcp-servers>, fetched 2026-11-12) and the local
OpenCode skill (`skill://opencode`, which defers the `mcp` shape to that
page); cross-checked with the live config at
`~/.config/opencode/opencode.json` (`"$schema": "https://opencode.ai/config.json"`).

**V2 note:** server names live under `mcp.servers`, *not* directly under
`mcp` — the docs are explicit ("V2 does not place server names directly
under `mcp`"). Use an **absolute** path to `dist/server.js`:

```jsonc title="opencode.json"
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "servers": {
      "visual-cortex": {
        "type": "local",
        "command": ["node", "/absolute/path/to/signature-style/tools/mcp-viz/dist/server.js"]
      }
    }
  }
}
```

CLI equivalent: `opencode mcp add visual-cortex -- node /absolute/path/to/signature-style/tools/mcp-viz/dist/server.js`

## Attach: Claude Desktop (generic `mcpServers`)

The standard Claude-Desktop-style shape for any MCP host that reads
`mcpServers`:

```json
{
  "mcpServers": {
    "visual-cortex": {
      "command": "node",
      "args": ["/absolute/path/to/signature-style/tools/mcp-viz/dist/server.js"]
    }
  }
}
```

## Smoke proof

`npm run smoke` spawns `dist/server.js` and speaks raw JSON-RPC over stdio
(initialize → tools/list → tools/call × 2), asserting: exactly the two tools
are listed; at least one `.ptp-timeline__node` measures width>0 && height>0;
the screenshot returns non-empty base64. ALL PASS or the release is blocked.
