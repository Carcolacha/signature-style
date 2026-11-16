/**
 * TEMPLATE-SOURCES — the full-page templates'"'"' DATA layer (3.8.0).
 *
 * The registry'"'"'s Component leg lives in the React .tsx files; THIS
 * module is the SNIPPET leg: every template'"'"'s formatted standalone
 * source, mechanically derived from its shipped component file by the
 * authoring transform (the .tsx file content verbatim — same imports
 * from "@edwyn/signature-style/react", the embedded <style> CSS, the
 * same default export). PURE STRINGS on purpose: the llms generator
 * (Node ≥ 23.6 strips .ts types but cannot import .tsx), the studio'"'"'s
 * Full TSX Code view and the Copy Full Page button all read from here,
 * so the copy payloads can never drift from the live components.
 *
 * (tpl1) (playground/verify-playground.mjs) cross-checks this module
 * against template-registry.ts (which imports both halves).
 */

/** The three template ids — the registry, the studio Tabs, the CLI
 *  --template values and the llms blueprints section all key on this
 *  union. */
export type TemplateId = "saas" | "docs" | "telemetry";

/** The registry metadata (id → name + one-line description). */
export const TEMPLATE_META: Record<TemplateId, { name: string; description: string }> = {
  "saas": {
    name: "SaaS Landing",
    description: "The marketing page blueprint: release banner, staggered kinetic hero, sheen feature grid, live billing switcher over the TierCard row, FAQ and structured footer.",
  },
  "docs": {
    name: "Docs Reader",
    description: "The documentation blueprint: breadcrumbs, the 220px/reading/200px outline grid (container-query collapse), ProseBlock chapters, the copyable ReferenceCard, the config DataTable and the Prev/Next pager.",
  },
  "telemetry": {
    name: "Telemetry Center",
    description: "The observability blueprint: a 12-column bento of rolling KPI tiles, StatRing capacity gauges, AreaChart/BarChart panels, the state-wired deployment TimelineManager and the filterable node-status DataTable.",
  },
};

/** id → the template'"'"'s full standalone TSX source. */
export const TEMPLATE_SOURCES: Record<TemplateId, string> = {
  saas: `
/**
 * SaasLandingTemplate — FULL-PAGE TEMPLATE 01 of 3 (3.8.0 "Full-Page
 * Layout Templates, Interactive Viewport Previewer & CLI Template
 * Expansion").
 *
 * THE SAAS LANDING BLUEPRINT — one self-contained default-export page
 * composed EXCLUSIVELY from @edwyn/signature-style exports + the v3.7.0
 * kinetic primitives. Block by block, top to bottom:
 *
 *   1. AnnouncementBanner  — the Flamingo release rail (release-badge
 *      copy + the action button), dismissible.
 *   2. Centered PageHero   — staggered MotionReveal entrance: the hero
 *      block (h1 + subcopy) lands, then the dual CTA row (primary +
 *      secondary Button) follows on the 45ms stagger wave.
 *   3. Feature grid        — 3 columns of KineticSurface cards
 *      (cursor-tracking sheen), each with a tinted icon well
 *      (color-mix 12% of a --sig token) + h3 + copy. Collapses to one
 *      column in a ≤ 880px container.
 *   4. Billing switcher    — package Tabs (Monthly | Annual — Save
 *      20%) with the FLIP gliding indicator driving ONE billing
 *      state; a live AnimatedNumber price strip recomputes (annual =
 *      20% off, computed) above the 3-column TierCard row (Starter
 *      $19, Pro $49 featured elevation, Enterprise $199).
 *      THE STRING-CONTRACT NOTE: TierCard.price is typed \`string\`, so
 *      the animated roll lives in the section's live price strip; the
 *      TierCard price lines re-render with the current cycle's value.
 *   5. FAQ                 — three AccordionCard entries.
 *   6. Structured footer   — brand column + three nav columns + the
 *      fineprint rule.
 *
 * STANDALONE PURITY: the page mounts its OWN ToastProvider (CTA +
 * banner clicks push toasts without assuming the host app provides
 * one), carries its CSS in an embedded <style> block (token-driven —
 * zero hex, 8px grid, container queries so the studio's viewport
 * emulator reflows the page, and the inherited motion-token mercy
 * covers reduced motion), and uses zero external dependencies.
 */
import { useState } from "react";
import type { ReactNode } from "react";
import {
  AnimatedNumber,
  AnnouncementBanner,
  AccordionCard,
  Button,
  Icon,
  KineticSurface,
  MotionReveal,
  PageHero,
  Tabs,
  TierCard,
  ToastProvider,
  useToast,
} from "@edwyn/signature-style/react";

/* ------------------------------------------------------------------ */
/* The template's own stylesheet — embedded for standalone purity.     */
/* Token-driven only (zero hex), 8px-grid spacing, container queries   */
/* answer the STAGE width (the studio emulator), and every transition  */
/* rides the motion tokens (the reduced-motion mercy collapses them).  */
/* ------------------------------------------------------------------ */
const SAAS_TEMPLATE_CSS = \`
.sig-tpl-saas {
  container-type: inline-size;
  container-name: tpl-saas;
  max-width: 1160px;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-section);
  padding-bottom: var(--space-section);
  font-family: var(--font-sans);
}
.sig-tpl-saas__features,
.sig-tpl-saas__tiers,
.sig-tpl-saas__footer-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-section);
}
.sig-tpl-saas__hero {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-standard);
}
.sig-tpl-saas__cta-row {
  display: flex;
  gap: var(--space-standard);
  flex-wrap: wrap;
  justify-content: center;
}
.sig-tpl-saas__feature {
  display: flex;
  flex-direction: column;
  gap: var(--space-tight);
  padding: var(--space-section);
  color: var(--text-main);
}
.sig-tpl-saas__feature h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--text-bright);
}
.sig-tpl-saas__feature p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-muted);
  line-height: 1.6;
}
.sig-tpl-saas__well {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: var(--radius-ui);
}
.sig-tpl-saas__billing {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-standard);
}
.sig-tpl-saas__price-strip {
  display: flex;
  align-items: baseline;
  gap: var(--space-tight);
  font-variant-numeric: tabular-nums;
}
.sig-tpl-saas__price-strip strong {
  font-size: 1.125rem;
  color: var(--text-bright);
}
.sig-tpl-saas__price-strip span {
  font-size: 0.8125rem;
  color: var(--text-muted);
}
.sig-tpl-saas__tier {
  display: flex;
  flex-direction: column;
}
.sig-tpl-saas__faq {
  display: flex;
  flex-direction: column;
  gap: var(--space-tight);
  max-width: 720px;
  margin-inline: auto;
  width: 100%;
}
.sig-tpl-saas__footer {
  border-top: 1px solid color-mix(in srgb, var(--text-muted) 20%, transparent);
  padding-top: var(--space-section);
  display: flex;
  flex-direction: column;
  gap: var(--space-standard);
}
.sig-tpl-saas__footer-grid { gap: var(--space-standard); }
.sig-tpl-saas__footer h4 {
  margin: 0 0 var(--space-tight);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
}
.sig-tpl-saas__footer ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-tight);
  font-size: 0.875rem;
}
.sig-tpl-saas__footer a {
  color: var(--text-main);
  text-decoration: none;
}
.sig-tpl-saas__footer a:hover { color: var(--text-bright); text-decoration: underline; }
/* THE DOCTRINE FOCUS RING — every interactive element in the template
   rings Flamingo (2px + offset); the browser default never shows. */
.sig-tpl-saas a:focus-visible,
.sig-tpl-saas button:focus-visible,
.sig-tpl-saas summary:focus-visible {
  outline: 2px solid var(--color-cake-primary);
  outline-offset: 2px;
  border-radius: var(--radius-ui);
}
.sig-tpl-saas__fineprint {
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-muted-soft);
}
@container tpl-saas (max-width: 880px) {
  .sig-tpl-saas__features,
  .sig-tpl-saas__tiers { grid-template-columns: 1fr; }
  .sig-tpl-saas__footer-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@container tpl-saas (max-width: 480px) {
  .sig-tpl-saas__footer-grid { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .sig-tpl-saas * { transition-duration: 1ms !important; animation-duration: 1ms !important; }
}
\`;

/* ------------------------------------------------------------------ */
/* Data — domain-neutral sample content (the standalone-purity voice). */
/* ------------------------------------------------------------------ */

type BillingCycle = "monthly" | "annual";

/** Monthly base prices — annual renders 20% off, computed. */
const TIER_PRICES = {
  starter: 19,
  pro: 49,
  enterprise: 199,
} as const;

/** Annual discount — the owner spec: "annual = 20% off computed". */
const ANNUAL_DISCOUNT = 0.8;

interface Feature {
  icon: "Layers" | "Boxes" | "BadgeCheck";
  title: string;
  copy: string;
  token: "--sig-lavender" | "--sig-cyan" | "--sig-mint";
}

const FEATURES: Feature[] = [
  {
    icon: "Layers",
    title: "Token Cascade",
    copy: "Every hover, focus and disabled state derives from the core tokens — no hand-authored hex anywhere on the page.",
    token: "--sig-lavender",
  },
  {
    icon: "Boxes",
    title: "Zero-dependency core",
    copy: "One CSS bundle and typed React primitives. No runtime, no build step, no vendor lock — copy-paste and ship.",
    token: "--sig-cyan",
  },
  {
    icon: "BadgeCheck",
    title: "WCAG-gated themes",
    copy: "Three verified surface themes with measured contrast per token — the light variant re-inks every accent.",
    token: "--sig-mint",
  },
];

interface Tier {
  key: keyof typeof TIER_PRICES;
  name: string;
  token: "--sig-sky" | "--sig-mauve-soft" | "--sig-peach";
  featured: boolean;
  features: string[];
}

const TIERS: Tier[] = [
  {
    key: "starter",
    name: "Starter",
    token: "--sig-sky",
    featured: false,
    features: ["One project", "Core component set", "Community support"],
  },
  {
    key: "pro",
    name: "Pro",
    token: "--sig-mauve-soft",
    featured: true,
    features: ["Unlimited projects", "All 26 content tokens", "Full-page templates", "Priority support"],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    token: "--sig-peach",
    featured: false,
    features: ["Everything in Pro", "On-prem tokens.css", "Design review sessions", "Dedicated channel"],
  },
];

const FAQ_ENTRIES: Array<{ title: string; body: ReactNode }> = [
  {
    title: "Can I use the templates commercially?",
    body: (
      <p>
        Yes — the MIT license covers every template and the whole engine.
        Scaffold one, retheme it with your tokens, ship it.
      </p>
    ),
  },
  {
    title: "Do the templates need React?",
    body: (
      <p>
        The React blueprints do; the CLI also emits a static HTML mirror
        for every template — the same blocks as plain HTML plus the
        tokens stylesheet, zero JavaScript.
      </p>
    ),
  },
  {
    title: "How do the three themes apply?",
    body: (
      <p>
        The data-sig-theme attribute swaps the surface triad at runtime —
        every template is theme-agnostic because it paints only with
        tokens. Try the studio's theme switcher above.
      </p>
    ),
  },
];

/* ------------------------------------------------------------------ */
/* Blocks — small, single-purpose components (one per blueprint block). */
/* ------------------------------------------------------------------ */

function ReleaseBanner(): ReactNode {
  const toast = useToast();
  return (
    <AnnouncementBanner
      variant="announcement"
      dismissible
      action={{
        label: "Read the release notes",
        onClick: () => toast("success", "The full changelog lives in the package README."),
      }}
    >
      <span data-testid="tpl-saas-banner">
        v1.0 — full-page templates are here: three blueprints, one CLI
        command each.
      </span>
    </AnnouncementBanner>
  );
}

function HeroBlock(): ReactNode {
  const toast = useToast();
  return (
    <header className="sig-tpl-saas__hero">
      <MotionReveal variant="fade-up" staggerIndex={0}>
        <PageHero
          title="Ship your signature"
          subtitle="one import · three themes · zero dependencies"
        />
      </MotionReveal>
      <MotionReveal variant="fade-up" staggerIndex={2}>
        <div className="sig-tpl-saas__cta-row" data-testid="tpl-saas-cta">
          <Button
            variant="primary"
            size="md"
            leftIcon="Rocket"
            onClick={() => toast("success", "The workspace wizard lives in the full app — this is the blueprint.")}
          >
            Start building
          </Button>
          <Button
            variant="secondary"
            size="md"
            leftIcon="BookOpen"
            onClick={() => toast("success", "The docs blueprint is tab 02 in this studio.")}
          >
            Read the docs
          </Button>
        </div>
      </MotionReveal>
    </header>
  );
}

function FeatureGrid(): ReactNode {
  return (
    <div className="sig-tpl-saas__features" data-testid="tpl-saas-features">
      {FEATURES.map((feature, index) => (
        <MotionReveal key={feature.title} variant="fade-up" staggerIndex={index}>
          <KineticSurface accentToken={feature.token} className="sig-tpl-saas__feature">
            <span
              className="sig-tpl-saas__well"
              style={{
                background: \`color-mix(in srgb, var(\${feature.token}) 12%, transparent)\`,
                color: \`var(\${feature.token})\`,
              }}
            >
              <Icon name={feature.icon} size={20} aria-hidden />
            </span>
            <h3>{feature.title}</h3>
            <p>{feature.copy}</p>
          </KineticSurface>
        </MotionReveal>
      ))}
    </div>
  );
}

function BillingSection(): ReactNode {
  const toast = useToast();
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  // THE ONE DERIVATION — annual = 20% off, computed from the base.
  const priceOf = (base: number): number =>
    billing === "monthly" ? base : Math.round(base * ANNUAL_DISCOUNT);
  const proPrice = priceOf(TIER_PRICES.pro);

  const billingTabs = [
    { id: "monthly", label: "Monthly" },
    { id: "annual", label: "Annual — Save 20%" },
  ];

  return (
    <section
      className="sig-tpl-saas__billing"
      aria-label="Pricing"
      data-testid="tpl-saas-billing"
    >
      <Tabs
        label="Billing cycle"
        tabs={billingTabs}
        activeId={billing}
        onChange={(id) => setBilling(id as BillingCycle)}
      />
      {/* THE LIVE PRICE STRIP — the AnimatedNumber recomputes with the
          billing state (TierCard.price is a string contract; the roll
          lives here, the tier lines re-render with the same values). */}
      <p className="sig-tpl-saas__price-strip" data-testid="tpl-saas-price">
        <strong>
          <AnimatedNumber value={proPrice} prefix="$" suffix="/mo" />
        </strong>
        <span>
          Pro, per seat · {billing === "annual" ? "billed annually (20% off)" : "billed monthly"}
        </span>
      </p>
      <div className="sig-tpl-saas__tiers" data-testid="tpl-saas-tiers">
        {TIERS.map((tier) => (
          <div key={tier.key} className="sig-tpl-saas__tier">
            <TierCard
              name={tier.name}
              price={\`$\${priceOf(TIER_PRICES[tier.key])}/mo\`}
              accentToken={tier.token}
              featured={tier.featured}
              features={tier.features}
              cta={\`Choose \${tier.name}\`}
              onCta={() => toast("success", \`\${tier.name} selected — the checkout flow is yours to wire.\`)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function FaqSection(): ReactNode {
  return (
    <section
      className="sig-tpl-saas__faq"
      aria-label="Frequently asked questions"
      data-testid="tpl-saas-faq"
    >
      {FAQ_ENTRIES.map((entry) => (
        <AccordionCard key={entry.title} title={entry.title}>
          {entry.body}
        </AccordionCard>
      ))}
    </section>
  );
}

const FOOTER_COLUMNS: Array<{ heading: string; links: string[] }> = [
  { heading: "Product", links: ["Templates", "Components", "Tokens", "Changelog"] },
  { heading: "Resources", links: ["Documentation", "Storybook", "llms.txt", "CLI reference"] },
  { heading: "Project", links: ["GitHub", "Releases", "License (MIT)", "Contributing"] },
];

function FooterBlock(): ReactNode {
  return (
    <footer className="sig-tpl-saas__footer" data-testid="tpl-saas-footer">
      <div className="sig-tpl-saas__footer-grid">
        <div>
          <h4>Signature Style</h4>
          <p className="sig-tpl-saas__fineprint">
            The signature you already have — one import away from every
            page you ship.
          </p>
        </div>
        {FOOTER_COLUMNS.map((column) => (
          <nav key={column.heading} aria-label={column.heading}>
            <h4>{column.heading}</h4>
            <ul>
              {column.links.map((link) => (
                <li key={link}>
                  <a href="#/templates" onClick={(event) => event.preventDefault()}>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <p className="sig-tpl-saas__fineprint">
        Built with the Signature Style engine — every color on this page
        resolves from tokens.
      </p>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* The page assembly.                                                  */
/* ------------------------------------------------------------------ */

function SaasLandingPage(): ReactNode {
  return (
    <main className="sig-tpl-saas" data-testid="tpl-saas">
      <style>{SAAS_TEMPLATE_CSS}</style>
      <ReleaseBanner />
      <HeroBlock />
      <FeatureGrid />
      <BillingSection />
      <FaqSection />
      <FooterBlock />
    </main>
  );
}

/**
 * The SaaS Landing full-page template — announcement rail, staggered
 * hero, kinetic feature grid, live billing switcher with the TierCard
 * row, FAQ and structured footer. See the file header for the
 * block-by-block outline.
 */
export default function SaasLandingTemplate() {
  return (
    <ToastProvider>
      <SaasLandingPage />
    </ToastProvider>
  );
}`,
  docs: `
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
const DOCS_TEMPLATE_CSS = \`
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
/* THE DOCTRINE FOCUS RING — every interactive element in the template
   rings Flamingo (2px + offset); the browser default never shows. */
.sig-tpl-docs a:focus-visible,
.sig-tpl-docs button:focus-visible {
  outline: 2px solid var(--color-cake-primary);
  outline-offset: 2px;
  border-radius: var(--radius-ui);
}
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
\`;

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

const SETUP_SNIPPET = \`npm i @edwyn/signature-style

// entry.tsx — once, before your own styles
import "@edwyn/signature-style/css";
import { ThemeProvider } from "@edwyn/signature-style/react";\`;

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
  { setting: "data-sig-motion", type: "attribute", def: "—", description: "Set \\"reduced\\" to collapse all kinetic durations to 1ms" },
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
              href={\`#\${chapter.id}\`}
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
            <a href={\`#\${entry.id}\`}>{entry.label}</a>
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
}`,
  telemetry: `
/**
 * TelemetryCenterTemplate — FULL-PAGE TEMPLATE 03 of 3 (3.8.0
 * "Full-Page Layout Templates, Interactive Viewport Previewer & CLI
 * Template Expansion").
 *
 * THE TELEMETRY CENTER BLUEPRINT — one self-contained default-export
 * page on an asymmetric 12-column bento. Block by block, top to
 * bottom:
 *
 *   1. KPI row              — 4 tiles (span 3 each): two LIVE tiles
 *      composed from AnimatedNumber (rolling readouts, tabular-nums)
 *      + Sparkline, and two package StatCards (string-value
 *      archetypes). THE STRING-CONTRACT NOTE: StatCard.value is typed
 *      \`string\`, so the rolling tiles compose the package's own
 *      AnimatedNumber + Sparkline primitives into the StatCard
 *      anatomy; the two string tiles keep the archetype on the row.
 *   2. Capacity gauges      — 2 StatRing tiles (span 3 each) with
 *      total + unit (the zoom/detail strip), flanking the charts row.
 *   3. Charts row           — AreaChart + BarChart in SurfaceCard
 *      panels, side by side (span 6 each).
 *   4. Deployment schedule  — the package TimelineManager fully
 *      wired to LOCAL state (composer, settle toggles, deletes).
 *   5. Node status ledger   — a filterable DataTable: the Input
 *      state filters the rows live (case-insensitive substring over
 *      node + status).
 *
 * STANDALONE PURITY: embedded token-driven <style> (zero hex, 8px
 * grid, 12-col grid collapses via container queries so the studio's
 * viewport emulator reflows it), reduced-motion guard, zero external
 * dependencies, no ToastProvider needed (no toasts — the widgets own
 * their feedback).
 */
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  AnimatedNumber,
  AreaChart,
  BarChart,
  DataTable,
  Icon,
  Input,
  Sparkline,
  StatCard,
  StatRing,
  SurfaceCard,
  TimelineManager,
} from "@edwyn/signature-style/react";
import type { DataTableColumn, TimelineItem } from "@edwyn/signature-style/react";

/* ------------------------------------------------------------------ */
/* The template's own stylesheet — embedded for standalone purity.     */
/* ------------------------------------------------------------------ */
const TELEMETRY_TEMPLATE_CSS = \`
.sig-tpl-telemetry {
  container-type: inline-size;
  container-name: tpl-telemetry;
  max-width: 1240px;
  margin-inline: auto;
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--space-section);
  padding-bottom: var(--space-section);
  font-family: var(--font-sans);
}
.sig-tpl-telemetry > .span-3 { grid-column: span 3; }
.sig-tpl-telemetry > .span-4 { grid-column: span 4; }
.sig-tpl-telemetry > .span-5 { grid-column: span 5; }
.sig-tpl-telemetry > .span-6 { grid-column: span 6; }
.sig-tpl-telemetry > .span-7 { grid-column: span 7; }
.sig-tpl-telemetry > .span-12 { grid-column: span 12; }
.sig-tpl-telemetry > .sig-tpl-telemetry__kpi { grid-column: span 3; }
.sig-tpl-telemetry__kpi {
  background: var(--bg-surface);
  border: 1px solid color-mix(in srgb, var(--text-muted) 18%, transparent);
  border-radius: var(--radius-card);
  padding: var(--space-section);
  display: flex;
  flex-direction: column;
  gap: var(--space-tight);
}
.sig-tpl-telemetry__kpi-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
}
.sig-tpl-telemetry__kpi-value {
  font-size: 1.5rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--text-bright);
}
.sig-tpl-telemetry__kpi-delta {
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
}
.sig-tpl-telemetry__kpi-delta[data-direction="up"] { color: var(--sig-green); }
.sig-tpl-telemetry__kpi-delta[data-direction="flat"] { color: var(--text-muted); }
.sig-tpl-telemetry__filter {
  display: flex;
  align-items: center;
  gap: var(--space-tight);
}
.sig-tpl-telemetry__filter input { max-width: 240px; }
.sig-tpl-telemetry__filter-count {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
/* THE DOCTRINE FOCUS RING — every interactive element in the template
   rings Flamingo (2px + offset); the browser default never shows. */
.sig-tpl-telemetry input:focus-visible,
.sig-tpl-telemetry button:focus-visible {
  outline: 2px solid var(--color-cake-primary);
  outline-offset: 2px;
  border-radius: var(--radius-ui);
}
@container tpl-telemetry (max-width: 1023px) {
  .sig-tpl-telemetry { grid-template-columns: repeat(6, minmax(0, 1fr)); }
  .sig-tpl-telemetry > .span-3 { grid-column: span 3; }
  .sig-tpl-telemetry > .sig-tpl-telemetry__kpi { grid-column: span 3; }
  .sig-tpl-telemetry > .span-4,
  .sig-tpl-telemetry > .span-5,
  .sig-tpl-telemetry > .span-6,
  .sig-tpl-telemetry > .span-7 { grid-column: span 6; }
}
@container tpl-telemetry (max-width: 560px) {
  .sig-tpl-telemetry { grid-template-columns: 1fr; }
  .sig-tpl-telemetry > .span-3,
  .sig-tpl-telemetry > .sig-tpl-telemetry__kpi,
  .sig-tpl-telemetry > .span-4,
  .sig-tpl-telemetry > .span-5,
  .sig-tpl-telemetry > .span-6,
  .sig-tpl-telemetry > .span-7,
  .sig-tpl-telemetry > .span-12 { grid-column: auto; }
}
@media (prefers-reduced-motion: reduce) {
  .sig-tpl-telemetry * { transition-duration: 1ms !important; animation-duration: 1ms !important; }
}
\`;

/* ------------------------------------------------------------------ */
/* Data — the deterministic sample telemetry (domain-neutral).         */
/* ------------------------------------------------------------------ */

const THROUGHPUT_SERIES: number[] = [42, 48, 45, 58, 61, 57, 72, 78, 74, 88, 92, 96];
const LATENCY_SERIES: number[] = [180, 172, 176, 158, 149, 152, 141, 138, 133, 129, 124, 118];

const AREA_POINTS = THROUGHPUT_SERIES.map((value, index) => ({
  label: \`T\${String(index + 1).padStart(2, "0")}\`,
  value,
}));

const BAR_DATA = [
  { label: "Ingest", value: 640, max: 800, colorToken: "--sig-cobalt" },
  { label: "Transform", value: 520, max: 800, colorToken: "--sig-cyan" },
  { label: "Index", value: 380, max: 800, colorToken: "--sig-mint" },
  { label: "Serve", value: 700, max: 800, colorToken: "--sig-tangerine" },
] as const;

interface NodeRow {
  node: string;
  status: "healthy" | "degraded" | "draining";
  region: string;
  load: string;
}

const NODE_ROWS: NodeRow[] = [
  { node: "ingest-01", status: "healthy", region: "zone-a", load: "38%" },
  { node: "ingest-02", status: "healthy", region: "zone-a", load: "41%" },
  { node: "transform-01", status: "degraded", region: "zone-b", load: "87%" },
  { node: "transform-02", status: "healthy", region: "zone-b", load: "44%" },
  { node: "index-01", status: "healthy", region: "zone-c", load: "52%" },
  { node: "serve-01", status: "draining", region: "zone-c", load: "9%" },
  { node: "serve-02", status: "healthy", region: "zone-d", load: "47%" },
];

const NODE_COLUMNS: DataTableColumn[] = [
  { key: "node", header: "Node" },
  { key: "status", header: "Status" },
  { key: "region", header: "Region" },
  { key: "load", header: "Load", numeric: true, align: "right" },
];

const DEPLOYMENTS: TimelineItem[] = [
  {
    id: "dp-001",
    date: "November 2026",
    title: "Canary rollout — stage B",
    category: "--sig-cobalt",
    categoryLabel: "Deploy",
    time: "09:00",
    settled: true,
  },
  {
    id: "dp-002",
    date: "November 2026",
    title: "Index rebuild — zone C",
    category: "--sig-cyan",
    categoryLabel: "Maint",
    time: "13:30",
    settled: true,
  },
  {
    id: "dp-003",
    date: "December 2026",
    title: "Serve fleet rotation",
    category: "--sig-mint",
    categoryLabel: "Deploy",
    time: "10:00",
  },
  {
    id: "dp-004",
    date: "December 2026",
    title: "Quarterly capacity review",
    category: "--sig-tangerine",
    categoryLabel: "Review",
    time: "15:00",
  },
];

/** The status → chromatic badge ink (content accents, per the RoE). */
const STATUS_TOKENS: Record<NodeRow["status"], "--sig-green" | "--sig-yellow" | "--sig-mauve-soft"> = {
  healthy: "--sig-green",
  degraded: "--sig-yellow",
  draining: "--sig-mauve-soft",
};

/* ------------------------------------------------------------------ */
/* Blocks.                                                             */
/* ------------------------------------------------------------------ */

/** One LIVE KPI tile — the StatCard anatomy composed from the
 *  package primitives (AnimatedNumber + Sparkline). */
function LiveKpiTile({
  label,
  value,
  delta,
  direction,
  series,
  token,
}: {
  label: string;
  value: number;
  delta: string;
  direction: "up" | "flat";
  series: number[];
  token: "--sig-cobalt" | "--sig-tangerine";
}): ReactNode {
  return (
    <div className="sig-tpl-telemetry__kpi" data-testid={\`tpl-tele-kpi-\${label.toLowerCase().replace(/\\s+/g, "-")}\`}>
      <span className="sig-tpl-telemetry__kpi-label">{label}</span>
      <span className="sig-tpl-telemetry__kpi-value">
        <AnimatedNumber value={value} />
      </span>
      <span className="sig-tpl-telemetry__kpi-delta" data-direction={direction}>
        {delta}
      </span>
      <Sparkline data={series} colorToken={token} label={\`\${label} trend\`} width={160} height={32} />
    </div>
  );
}

function KpiRow(): ReactNode {
  return (
    <>
      <LiveKpiTile
        label="Throughput"
        value={THROUGHPUT_SERIES[THROUGHPUT_SERIES.length - 1] ?? 0}
        delta="+14.3% vs last window"
        direction="up"
        series={THROUGHPUT_SERIES}
        token="--sig-cobalt"
      />
      <LiveKpiTile
        label="Latency p95"
        value={LATENCY_SERIES[LATENCY_SERIES.length - 1] ?? 0}
        delta="−34.4% vs last window"
        direction="up"
        series={LATENCY_SERIES}
        token="--sig-tangerine"
      />
      <StatCard
        label="Error budget"
        value="99.98%"
        delta="within SLO"
        sparklineData={[99.91, 99.95, 99.97, 99.96, 99.98, 99.98]}
        colorToken="--sig-green"
      />
      <StatCard
        label="Active streams"
        value="24"
        delta="+2"
        deltaDirection="up"
        sparklineData={[16, 18, 18, 21, 22, 24]}
        colorToken="--sig-mauve-soft"
      />
    </>
  );
}

function GaugeRow(): ReactNode {
  return (
    <>
      <div className="span-3" data-testid="tpl-tele-gauge-1">
        <StatRing
          value={68}
          colorToken="--sig-cobalt"
          label="Cluster capacity used"
          total={100}
          unit="% capacity"
          size="md"
        />
      </div>
      <div className="span-3" data-testid="tpl-tele-gauge-2">
        <StatRing
          value={42}
          colorToken="--sig-mint"
          label="Storage pool used"
          total={100}
          unit="% storage"
          size="md"
        />
      </div>
    </>
  );
}

function ChartsRow(): ReactNode {
  return (
    <>
      <div className="span-6">
        <SurfaceCard eyebrow="Trends" meta="viz/area" title="Throughput, last 12 windows" interactive>
          <AreaChart points={AREA_POINTS} colorToken="--sig-cobalt" label="Throughput trend" height={180} />
        </SurfaceCard>
      </div>
      <div className="span-6">
        <SurfaceCard eyebrow="Capacity" meta="viz/bars" title="Pipeline stage load vs capacity" interactive>
          <BarChart data={[...BAR_DATA]} label="Stage load vs capacity" />
        </SurfaceCard>
      </div>
    </>
  );
}

function ScheduleSection(): ReactNode {
  const [deployments, setDeployments] = useState<TimelineItem[]>(DEPLOYMENTS);
  const addDeployment = (item: Omit<TimelineItem, "id">): void => {
    setDeployments((current) => [...current, { ...item, id: \`dp-\${String(current.length + 1).padStart(3, "0")}\` }]);
  };
  const toggleSettled = (id: string): void => {
    setDeployments((current) =>
      current.map((item) => (item.id === id ? { ...item, settled: item.settled !== true } : item)),
    );
  };
  const deleteDeployment = (id: string): void => {
    setDeployments((current) => current.filter((item) => item.id !== id));
  };
  return (
    <div className="span-7">
      <SurfaceCard eyebrow="Schedule" meta="planner/timeline" title="Deployment schedule" interactive>
        <TimelineManager
          items={deployments}
          onAdd={addDeployment}
          onToggleSettled={toggleSettled}
          onDelete={deleteDeployment}
          label="Deployment schedule"
        />
      </SurfaceCard>
    </div>
  );
}

function LedgerSection(): ReactNode {
  const [query, setQuery] = useState("");
  // THE ONE DERIVATION — case-insensitive substring over node + status.
  const filteredRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = needle === ""
      ? NODE_ROWS
      : NODE_ROWS.filter(
          (row) =>
            row.node.toLowerCase().includes(needle) ||
            row.status.toLowerCase().includes(needle) ||
            row.region.toLowerCase().includes(needle),
        );
    return rows.map((row) => ({
      node: row.node,
      status: (
        <span style={{ color: \`var(\${STATUS_TOKENS[row.status]})\`, fontWeight: 600 }}>
          {row.status}
        </span>
      ),
      region: row.region,
      load: row.load,
    }));
  }, [query]);

  return (
    <div className="span-5">
      <SurfaceCard eyebrow="Ledger" meta="data/table" title="Node status" interactive>
        <div className="sig-tpl-telemetry__filter">
          <Input
            type="search"
            placeholder="Filter nodes…"
            aria-label="Filter node status ledger"
            data-testid="tpl-tele-filter"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <span className="sig-tpl-telemetry__filter-count" aria-live="polite">
            <Icon name="ListTree" size={14} aria-hidden /> {filteredRows.length} / {NODE_ROWS.length} nodes
          </span>
        </div>
        <DataTable
          columns={NODE_COLUMNS}
          rows={filteredRows}
          caption="Node status ledger · filtered live by the input above"
        />
      </SurfaceCard>
    </div>
  );
}

function TelemetryCenterPage(): ReactNode {
  return (
    <main className="sig-tpl-telemetry" data-testid="tpl-telemetry">
      <style>{TELEMETRY_TEMPLATE_CSS}</style>
      <KpiRow />
      <GaugeRow />
      <ChartsRow />
      <ScheduleSection />
      <LedgerSection />
    </main>
  );
}

/**
 * The Telemetry Center full-page template — the 12-column asymmetric
 * bento: four KPI tiles (rolling AnimatedNumber tiles + package
 * StatCards), two StatRing capacity gauges, the AreaChart/BarChart
 * panel pair, the state-wired TimelineManager deployment schedule and
 * the filterable node-status DataTable. See the file header for the
 * block-by-block outline.
 */
export default function TelemetryCenterTemplate() {
  return <TelemetryCenterPage />;
}`,
};
