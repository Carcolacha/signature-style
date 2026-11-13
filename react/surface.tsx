/**
 * surface — the OFFICIAL surface primitives (2.2.0 "Telemetry Limits &
 * Official Surface Primitives"). This is the Shed anatomy (the v2.0.0
 * playground layer: meta row → ruled title → content) promoted into the
 * package with the owner-mandated `.sig-*` class prefix; the css half
 * lives in css/surface.css (layered into `cascade` after toast.css).
 *
 * Pruning Protocol: <SurfaceCard> renders EXACTLY ONE <section> — the
 * meta row appears only when `eyebrow` or `meta` is provided, the ruled
 * h2 only when `title` is; no wrappers around the children slot.
 * <PageHero> renders EXACTLY ONE <header> — h1, optional subtitle p,
 * then the children slot for extras. No div soup, no context, no
 * portality: plain elements wearing the doctrine.
 *
 * The elevation (inset highlight + ambient shadow + the hover lift on
 * `interactive`) is OWNER-SANCTIONED in css/surface.css ONLY — the
 * ambient elevation contract ships with the surface primitive (see the
 * css file header for the doctrine boundary; gate (e1) scopes the
 * package's zero-shadow law around exactly that file).
 */

import type { ReactNode } from "react";

/**
 * `<SurfaceCard>` — the Shed surface: meta → ruled title → content.
 *
 * ONE `<section class="sig-surface-card [--interactive] [className]">`.
 * `eyebrow` (teal all-caps) and `meta` (muted mono path) share ONE
 * `.sig-surface-card__meta` baseline row; `title` renders the ruled
 * `.sig-surface-card__title` h2; everything else is the children slot.
 * `interactive` adds the tactile modifier — translateY(-2px) + the
 * deepened ambient shadow on hover (css/surface.css).
 *
 * The modifier classes of the world (grid spans like the playground's
 * `hub__card--timeline`) arrive through `className` — the composition
 * layer composes ON the primitive, never around it.
 *
 * @example
 * ```tsx
 * <SurfaceCard eyebrow="Forms" meta="components/forms.tsx" title="Form Controls" interactive>
 *   <Input placeholder="Guest name" />
 * </SurfaceCard>
 * ```
 */
export interface SurfaceCardProps {
  /** Teal all-caps eyebrow label (left half of the meta row). */
  eyebrow?: string;
  /** Muted mono source path (right half of the meta row). */
  meta?: string;
  /** The ruled card title (h2). */
  title?: string;
  /** The tactile hover: translateY(-2px) + deepened ambient shadow. */
  interactive?: boolean;
  /** Extra classes composed ON the primitive (e.g. grid placement). */
  className?: string;
  /** The card content — rendered directly inside the section. */
  children?: ReactNode;
}

export function SurfaceCard({
  eyebrow,
  meta,
  title,
  interactive = false,
  className,
  children,
}: SurfaceCardProps) {
  const classes = ["sig-surface-card"];
  if (interactive) {
    classes.push("sig-surface-card--interactive");
  }
  if (className !== undefined) {
    classes.push(className);
  }
  return (
    <section className={classes.join(" ")}>
      {(eyebrow !== undefined || meta !== undefined) && (
        <div className="sig-surface-card__meta">
          {eyebrow !== undefined && (
            <span className="sig-surface-card__eyebrow">{eyebrow}</span>
          )}
          {meta !== undefined && (
            <span className="sig-surface-card__path">{meta}</span>
          )}
        </div>
      )}
      {title !== undefined && (
        <h2 className="sig-surface-card__title">{title}</h2>
      )}
      {children}
    </section>
  );
}

/**
 * `<PageHero>` — the announcing page header.
 *
 * ONE `<header class="sig-page-hero">`: the serif display h1
 * (clamp 2.25rem → 4rem, 0.35em tracking), the optional muted mono
 * subtitle, then the children slot for extras (buttons, badges —
 * anything that belongs under the announcement).
 *
 * @example
 * ```tsx
 * <PageHero title="THE ENGINE" subtitle="every primitive, one dashboard · live showcase" />
 * ```
 */
export interface PageHeroProps {
  /** The serif display title (h1). */
  title: string;
  /** The muted mono subtitle line. */
  subtitle?: string;
  /** Extras rendered after the subtitle (the children slot). */
  children?: ReactNode;
}

export function PageHero({ title, subtitle, children }: PageHeroProps) {
  return (
    <header className="sig-page-hero">
      <h1>{title}</h1>
      {subtitle !== undefined && (
        <p className="sig-page-hero__sub">{subtitle}</p>
      )}
      {children}
    </header>
  );
}
