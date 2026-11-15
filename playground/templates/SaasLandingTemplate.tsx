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
 *      THE STRING-CONTRACT NOTE: TierCard.price is typed `string`, so
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
const SAAS_TEMPLATE_CSS = `
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
`;

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
                background: `color-mix(in srgb, var(${feature.token}) 12%, transparent)`,
                color: `var(${feature.token})`,
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
              price={`$${priceOf(TIER_PRICES[tier.key])}/mo`}
              accentToken={tier.token}
              featured={tier.featured}
              features={tier.features}
              cta={`Choose ${tier.name}`}
              onCta={() => toast("success", `${tier.name} selected — the checkout flow is yours to wire.`)}
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
}
