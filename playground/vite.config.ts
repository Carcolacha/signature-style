/**
 * Vite config for the Bento Box Showcase playground (1.5.0).
 *
 * The playground is a TRUE consumer of the published exports map: it
 * imports "@carcolacha/signature-style/css" and "@carcolacha/signature-style/react"
 * through package.json `exports`, exactly like a downstream app would.
 * Root is this directory, so `vite --config playground/vite.config.ts`
 * (run from the repo root) serves playground/index.html.
 */
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  root: fileURLToPath(new URL("./", import.meta.url)),
  base: "./",
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    // 3.6.0 (ops): polling file watching — this repo lives on a WSL
    // /mnt/c mount where inotify events never fire, so the dev server
    // would serve stale modules after edits (HMR silently dead). Polling
    // restores hot reload on drvfs; harmless on native filesystems.
    watch: { usePolling: true, interval: 300 },
  },
});
