# Publishing — the v1.0.0 release runbook

Releases are fully automated: **a tag is the release button.** Pushing a
`vX.Y.Z` tag triggers `.github/workflows/publish.yml`, which typechecks,
runs the parity gates (`node scripts/verify.mjs` — a release blocker), and
publishes to npm with `--access public`.

## One-time setup

1. **npm token** — create an *Access Token* (publish type) on npmjs.com
   (`npmjs.com → your avatar → Access Tokens → Generate new token`), then
   add it to this repo: **Settings → Secrets and variables → Actions →
   New repository secret**, name `NPM_TOKEN`. The workflow reads it as
   `secrets.NPM_TOKEN` for `npm publish`.
2. **Template repository flag** — this repo is intended to be a GitHub
   Template: enable it in **Settings → check "Template repository"**.
   That is a GitHub setting, not a file — nothing in this repo can set it.
   After "Use this template", the new repo starts with the package, the
   gates and this publish workflow already in place.

## Release checklist (every release)

1. **Bump the version in three places:**
   - `package.json` → `"version": "X.Y.Z"`
   - `tokens.json` → `meta.version`: `"X.Y.Z"`
   - `package-lock.json` → regenerate with `npm install --package-lock-only`
     (updates both root `version` fields)
2. **Update the README changelog** (a section for the new version).
3. **Verify locally before tagging** — the exact commands CI will run:

   ```sh
   npm ci                # or npm install
   npx tsc --noEmit      # typecheck gate
   node scripts/verify.mjs   # parity gates (release blocker)
   npm pack --dry-run    # inspect the tarball (expect 21 files)
   ```

4. **Commit:** `chore: vX.Y.Z release gate`
5. **Tag and push the tag:**

   ```sh
   git tag vX.Y.Z
   git push origin vX.Y.Z        # push the branch too
   ```

6. **CI takes over** — on the `v*` tag push:
   - `typecheck` job: `npm ci` → `npx tsc --noEmit`
   - `publish` job (runs only if typecheck passed): `npm ci` →
     `node scripts/verify.mjs` → `npm publish --access public`
   - Watch it under the repo's **Actions** tab. If a gate fails, nothing
     is published; fix, delete the tag
     (`git tag -d vX.Y.Z && git push origin :refs/tags/vX.Y.Z`), re-tag
     after the fix commit, and push the tag again.

## Import surface (what consumers get)

| Path | Resolves to | Needs peers? |
|---|---|---|
| `@edwyn/signature-style` | `tokens.json` (AI tooling core) | never |
| `@edwyn/signature-style/css` | `css/signature-style.css` (compiled bundle: tokens + base + cascade (timeline, modal) + overrides layers) | never |
| `@edwyn/signature-style/react` | umbrella `react/index.js` + `.d.ts` | `react`, `react-dom`; `lucide-react` optional |

Peers are **strictly peers, never bundled**: `react >=18` and
`react-dom >=18` are required peers; `lucide-react >=0.400.0` is an
*optional* peer (`peerDependenciesMeta.optional: true`) because only
`./react` importers need icons — CSS-only consumers never install them.

The granular stylesheets (`tokens.css`, `cascade.css`, `overrides.css`,
`timeline.css`, `modal.css`) and `SYSTEM_PROMPT.md` ship inside the
tarball but have no export-map entries anymore — the bundle covers
everything. Consumers who truly need a granular file import it via the
node_modules path (`node_modules/@edwyn/signature-style/css/tokens.css`)
or a deep path, at their own risk.
