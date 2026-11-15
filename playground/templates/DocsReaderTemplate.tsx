/**
 * DocsReaderTemplate — FULL-PAGE TEMPLATE 02 of 3 (3.8.0 "Full-Page
 * Layout Templates, Interactive Viewport Previewer & CLI Template
 * Expansion").
 *
 * THE DOCS READER BLUEPRINT — one self-contained default-export page.
 * Block by block, top to bottom:
 *
 *   1. Breadcrumbs          — the Shed mono path: engine / docs /
 *      getting-started.
 *   2. THE 3-COLUMN GRID    — 220px chapter tree | minmax(0,1fr)
 *      reading column | 200px "On This Page" outline. The collapse is
 *      CONTAINER-QUERY driven (@container max-width 1023px → one
 *      column): the studio's viewport emulator reflows the page
 *      WITHOUT touching the window viewport. (Container preferred per
 *      spec — a media query would only answer the real viewport; the
 *      wrapper here is the template root itself, container-type:
 *      inline-size.)
 *   3. Chapter tree (nav)   — the chapter list with a simple
 *      state-driven active chapter (useState; the links are real
 *      anchors to the reading column's section ids).
 *   4. Reading column       — ProseBlock sections (h3 + paragraphs,
 *      one blockquote — v3.4.0 gave blockquotes the --sig-violet-glow
 *      bar), the info Callout ("This page is a live template."), the
 *      ReferenceCard (tag "TSX", a copyable setup snippet, onCopied
 *      wired to the toast), and the configuration-reference DataTable
 *      (5 rows).
 *   5. On This Page         — a STATIC outline built from the section
 *      headings. Kept honest and simple per spec: no scroll-spy, no
 *      IntersectionObserver — the outline is the page's own table of
 *      contents and says so in its caption.
 *   6. Prev / Next          — two ActionTile cards at the bottom.
 *
 * STANDALONE PURITY: own ToastProvider (the ReferenceCard's copy
 * confirmation pushes a toast without assuming a host provider),
 * embedded token-driven <style> (zero hex, 8px grid, reduced-motion
 * guard), zero external dependencies.
 */
import { useState } from "react";
import type { ReactNode } from "react";
import {
  ActionTile,
  Breadcrumbs,
  Callout,
  DataTable,
  ProseBlock,
  ReferenceCard,
  ToastProvider,
  useToast,
} from "@edwyn/signature-style/react";
import type { DataTableColumn } from "@edwyn/signature-style/react";

/* ------------------------------------------------------------------ */
/* The template's own stylesheet — embedded for standalone purity.     */
/* ------------------------------------------------------------------ */
const DOCS_TEMPLATE_CSS = `
.sig-tpl-docs {
  container-type: inline-size;
  container-name: tpl-docs;
  max-width: 1240px;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-section);
  padding-bottom: var(--space-section);
  font-family: var(--font-sans);
}
.sig-tpl-docs__grid {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr) 200px;
  gap: var(--space-section);
  align-items: start;
}
.sig-tpl-docs__rail {
  display: flex;
  flex-direction: column;
  gap: var(--space-standard);
  position: sticky;
  top: var(--space-standard);
}
.sig-tpl-docs__rail h4 {
  margin: 0;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
}
.sig-tpl-docs__chapters,
.sig-tpl-docs__outline {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-tight);
  font-size: 0.875rem;
}
.sig-tpl-docs__chapters a,
.sig-tpl-docs__outline a {
  color: var(--text-main);
  text-decoration: none;
  border-left: 2px solid transparent;
  padding-left: var(--space-tight);
}
.sig-tpl-docs__chapters a:hover,
.sig-tpl-docs__outline a:hover { color: var(--text-bright); }
.sig-tpl-docs__chapters a[aria-current="true"] {
  border-left-color: var(--color-cake-primary);
  color: var(--text-bright);
  font-weight: 600;
}
.sig-tpl-docs__outline a { color: var(--text-muted); font-size: 0.8125rem; }
.sig-tpl-docs__outline a:hover { color: var(--text-main); }
.sig-tpl-docs__reading {
  display: flex;
  flex-direction: column;
  gap: var(--space-section);
  min-width: 0;
}
.sig-tpl-docs__section h3 {
  margin: 0 0 var(--space-standard);
  color: var(--text-bright);
  font-size: 1.25rem;
}
.sig-tpl-docs__section p {
  margin: 0 0 var(--space-standard);
  color: var(--text-main);
  line-height: 1.7;
  max-width: 72ch;
}
.sig-tpl-docs__pager {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-standard);
}
.sig-tpl-docs__caption {
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-muted-soft);
}
@container tpl-docs (max-width: 1023px) {
  .sig-tpl-docs__grid { grid-template-columns: 1fr; }
  .sig-tpl-docs__rail { position: static; }
  .sig-tpl-docs__pager { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .sig-tpl-docs * { transition-duration: 1ms !important; animation-duration: 1ms !important; }
}
`;

/* ------------------------------------------------------------------ */
/* Data — the sample documentation set (domain-neutral).               */
/* ------------------------------------------------------------------ */

interface Chapter {
  id: string;
  label: string;
}

const CHAPTERS: Chapter[] = [
  { id: "docs-install", label: "Installation" },
  { id: "docs-tokens", label: "Tokens & themes" },
  { id: "docs-components", label: "Components" },
  { id: "docs-config", label: "Configuration" },
];

/** The "On This Page" outline — STATIC per spec (documented above). */
const OUTLINE: Chapter[] = [
  { id: "docs-install", label: "Installation" },
  { id: "docs-tokens", label: "Tokens & themes" },
  { id: "docs-components", label: "Components" },
  { id: "docs-config", label: "Configuration reference" },
];

const SETUP_SNIPPET = `npm i @edwyn/signature-style

// entry.tsx — once, before your own styles
import "@edwyn/signature-style/css";
import { ThemeProvider } from "@edwyn/signature-style/react";`;

interface ConfigRow {
  setting: string;
  type: string;
  def: string;
  description: string;
}

const CONFIG_COLUMNS: DataTableColumn[] = [
  { key: "setting", header: "Setting" },
  { key: "type", header: "Type" },
  { key: "def", header: "Default" },
  { key: "description", header: "Description" },
];

const CONFIG_ROWS: ConfigRow[] = [
  { setting: "data-sig-theme", type: "attribute", def: "mocha", description: "Surface triad: mocha | oled | daylight" },
  { setting: "data-sig-radius", type: "attribute", def: "—", description: "Geometry preset: standard (8px) | sharp (0px)" },
  { setting: "data-sig-motion", type: "attribute", def: "—", description: "Set \"reduced\" to collapse all kinetic durations to 1ms" },
  { setting: "--sig-motion-scale", type: "custom property", def: "1", description: "Time-dilation master dial (0.25 = Slow-Mo)" },
  { setting: "data-accent", type: "attribute", def: "off", description: "Wear --sig-accent on card archetypes (content accents)" },
];

/* ------------------------------------------------------------------ */
/* Blocks.                                                             */
/* ------------------------------------------------------------------ */

function DocsBreadcrumbs(): ReactNode {
  return (
    <Breadcrumbs
      label="Docs path"
      items={[
        { label: "engine", href: "#/dashboard" },
        { label: "docs", href: "#/templates" },
        { label: "getting-started" },
      ]}
    />
  );
}

function ChapterTree({
  active,
  onNavigate,
}: {
  active: string;
  onNavigate: (id: string) => void;
}): ReactNode {
  return (
    <nav className="sig-tpl-docs__rail" aria-label="Chapters" data-testid="tpl-docs-tree">
      <h4>Chapters</h4>
      <ul className="sig-tpl-docs__chapters">
        {CHAPTERS.map((chapter) => (
          <li key={chapter.id}>
            <a
              href={`#${chapter.id}`}
              aria-current={active === chapter.id ? "true" : undefined}
              onClick={() => onNavigate(chapter.id)}
            >
              {chapter.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function ReadingColumn(): ReactNode {
  const toast = useToast();
  return (
    <div className="sig-tpl-docs__reading" data-testid="tpl-docs-reading">
      <section id="docs-install" className="sig-tpl-docs__section">
        <h3>Installation</h3>
        <ProseBlock>
          <p>
            The engine installs as one package and mounts as one import.
            Link the CSS bundle once — every theme, token and component
            stylesheet is layered inside it — then wrap your app in the
            ThemeProvider and the whole surface engine is live.
          </p>
          <blockquote>
            <p>
              “A stylesheet you never have to fight is the one that
              ships.”
            </p>
            <footer>— the field notes, introduction</footer>
          </blockquote>
        </ProseBlock>
        <ReferenceCard
          tag="TSX"
          title="The setup snippet"
          accentToken="--sig-violet-glow"
          code={SETUP_SNIPPET}
          onCopied={() => toast("success", "Setup snippet copied — paste it into your entry.")}
        />
      </section>

      <section id="docs-tokens" className="sig-tpl-docs__section">
        <h3>Tokens &amp; themes</h3>
        <ProseBlock>
          <p>
            Sixty custom properties carry the whole signature: the
            structural core, the shared geometry and motion tokens, and
            the twenty-six content-only chromatic accents. Themes swap
            the structural values through the data-sig-theme attribute —
            the chromatic family inherits untouched on dark, and is
            re-inked per token on the light theme.
          </p>
          <p>
            The Rule of Engagement keeps the families honest: Flamingo
            and Teal are structural-only; the --sig-* tokens are
            content-only — badges, tags, data-viz, tinted wells. Never
            crossed.
          </p>
        </ProseBlock>
        <Callout status="info">
          This page is a live template — the studio above can resize,
          retheme and copy it.
        </Callout>
      </section>

      <section id="docs-components" className="sig-tpl-docs__section">
        <h3>Components</h3>
        <ProseBlock>
          <p>
            Every export is a flat, typed primitive: no wrapper divs,
            no injected markup. Cards, forms, tables, timelines and the
            kinetic motion family compose into pages exactly the way
            this template does — one import, props on, done.
          </p>
        </ProseBlock>
      </section>

      <section id="docs-config" className="sig-tpl-docs__section">
        <h3>Configuration reference</h3>
        <div data-testid="tpl-docs-table">
          <DataTable
            columns={CONFIG_COLUMNS}
            rows={CONFIG_ROWS.map((row) => ({
              setting: row.setting,
              type: row.type,
              def: row.def,
              description: row.description,
            }))}
            caption="Configuration reference · the attributes and dials this template answers to"
          />
        </div>
        <p className="sig-tpl-docs__caption">
          The full manifest (with descriptions and per-theme values)
          ships as tokens.json and renders machine-readable at
          /llms.txt.
        </p>
      </section>
    </div>
  );
}

function PageOutline(): ReactNode {
  return (
    <nav className="sig-tpl-docs__rail" aria-label="On this page" data-testid="tpl-docs-outline">
      <h4>On this page</h4>
      <ul className="sig-tpl-docs__outline">
        {OUTLINE.map((entry) => (
          <li key={entry.id}>
            <a href={`#${entry.id}`}>{entry.label}</a>
          </li>
        ))}
      </ul>
      <p className="sig-tpl-docs__caption">
        Static outline — this blueprint keeps its table of contents
        honest and simple (no scroll-spy).
      </p>
    </nav>
  );
}

function PagerRow(): ReactNode {
  return (
    <div className="sig-tpl-docs__pager" data-testid="tpl-docs-pager">
      <ActionTile
        title="Previous"
        subtitle="Architecture overview"
        icon="ArrowLeft"
        onClick={() => undefined}
      />
      <ActionTile
        title="Next"
        subtitle="The component catalog"
        icon="ArrowRight"
        onClick={() => undefined}
      />
    </div>
  );
}

function DocsReaderPage(): ReactNode {
  const [activeChapter, setActiveChapter] = useState<string>(CHAPTERS[0]?.id ?? "docs-install");
  return (
    <main className="sig-tpl-docs" data-testid="tpl-docs">
      <style>{DOCS_TEMPLATE_CSS}</style>
      <DocsBreadcrumbs />
      <div className="sig-tpl-docs__grid">
        <ChapterTree active={activeChapter} onNavigate={setActiveChapter} />
        <ReadingColumn />
        <PageOutline />
      </div>
      <PagerRow />
    </main>
  );
}

/**
 * The Docs Reader full-page template — breadcrumbs, the 3-column
 * chapter/reading/outline grid (container-query collapse), ProseBlock
 * sections with the violet-glow quote bar, the live ReferenceCard, the
 * configuration DataTable and the Prev/Next pager. See the file header
 * for the block-by-block outline.
 */
export default function DocsReaderTemplate() {
  return (
    <ToastProvider>
      <DocsReaderPage />
    </ToastProvider>
  );
}
