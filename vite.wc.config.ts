/**
 * Vite config for the WC bundle (3.4.0 "Zero-React Native Web Components").
 *
 * LIB MODE, single entry wc/src/index.ts → dist/wc/signature-wc.es.js:
 * an ESM bundle with ZERO imports (no react, no lit, no runtime deps —
 * the verify:wc (w1) gate greps the artifact for react/react-dom and
 * must find zero). MINIFY FALSE on purpose: the artifact is committed
 * and audited like the react/ compiled pair — readability IS the
 * audit. emptyOutDir FALSE so the tsc declaration pass (index.d.ts,
 * base.d.ts, elements.d.ts) emitted into the same directory survives
 * the vite step's output.
 */
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: fileURLToPath(new URL("./wc/src/index.ts", import.meta.url)),
      name: "signature-wc",
      formats: ["es"],
      // The function form — the static string would drop the ".es"
      // suffix (single-format lib builds use fileName verbatim).
      fileName: (format: string) => `signature-wc.${format}.js`,
    },
    outDir: fileURLToPath(new URL("./dist/wc", import.meta.url)),
    emptyOutDir: false,
    minify: false,
    sourcemap: false,
  },
});
