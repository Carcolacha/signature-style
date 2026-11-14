/**
 * primitives — the official React primitives for Signature Style (0.5.0).
 *
 * Pruning Protocol compliance: every component here renders the flattest
 * possible DOM (no decorative wrappers), consumes CSS variables dynamically
 * (`var(--token)` — never hardcoded hexes), and leans on the cascade classes
 * already shipped in css/cascade.css.
 */

import { icons, type LucideProps } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import type { KnownToken } from "./ThemeProvider.js";

/** The strict, exhaustive set of installable lucide icon names. */
export type IconName = keyof typeof icons;

/**
 * `<Icon>` — the Pillar 1 icon, strictly typed.
 *
 * A lucide-react wrapper that only accepts real lucide icon names, so a
 * typo (`name="Wrenchh"`) is a compile error, not a blank square at runtime.
 * Color is inherited — lucide renders `stroke="currentColor"`, so an Icon
 * picks up whatever `color` the cascade gives it. `strokeWidth` is locked
 * to 2 by default (Pillar 1: the 2px stroke matches Inter weight 500
 * exactly) but stays overridable per instance.
 *
 * Note: importing via the `icons` map trades lucide's per-icon
 * tree-shaking for this strict, name-checked API — a deliberate
 * Pillar 1 trade: correctness over bundle bytes.
 *
 * @example
 * ```tsx
 * <Icon name="PartyPopper" size={16} />
 * ```
 */
export interface IconProps extends Omit<LucideProps, "ref"> {
  /** The exact lucide icon name (kebab aliases resolved; e.g. "PartyPopper"). */
  name: IconName;
}

export function Icon({ name, strokeWidth = 2, ...rest }: IconProps) {
  const Cmp = icons[name];
  return <Cmp strokeWidth={strokeWidth} {...rest} />;
}

/**
 * `<EmptyState>` — the Pillar 4 empty state, as a primitive.
 *
 * Renders ONE `div.empty-state` (the cascade class: centered flex column,
 * surface background, hairline border) containing an `aria-hidden` icon,
 * an optional title, and a muted message. No wrappers beyond that single
 * div — DOM Flattening is the law.
 *
 * @example
 * ```tsx
 * <EmptyState icon="PackageOpen" title="Nothing here" message="Add your first event." />
 * ```
 */
export interface EmptyStateProps {
  /** The lucide icon to show above the message. */
  icon: IconName;
  /** Optional short title — rendered as a high-contrast `<strong>`. */
  title?: string;
  /** The muted explanatory message. */
  message: string;
}

export function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <Icon name={icon} aria-hidden />
      {title !== undefined && (
        <strong style={{ color: "var(--text-main)", fontWeight: 600 }}>{title}</strong>
      )}
      <p style={{ margin: 0 }}>{message}</p>
    </div>
  );
}

/**
 * `<PartyBadge>` — the Rule of Engagement, enforced in the type system.
 *
 * A party-colored content badge: subtle tinted background + guaranteed
 * high-contrast text on both themes. `colorToken` only accepts `--party-*`
 * tokens (`Extract` on `KnownToken`); passing `--color-cake-primary` or any
 * structural token is a compile error. A runtime guard keeps JS consumers
 * honest with the same warn-and-drop philosophy as ThemeProvider.
 *
 * @example
 * ```tsx
 * <PartyBadge colorToken="--party-peach" label="Birthday" />
 * ```
 */
export interface PartyBadgeProps {
  /** A `--party-*` content token — the ONLY tokens allowed here. */
  colorToken: PartyTokenName;
  /** The badge label text. */
  label: string;
}

/** The content-only subset of KnownToken: `--party-*` tokens exclusively. */
export type PartyTokenName = Extract<KnownToken, `--party-${string}`>;

export function PartyBadge({ colorToken, label }: PartyBadgeProps) {
  if (!colorToken.startsWith("--party-")) {
    console.warn(
      `[signature-style] dropped "${colorToken}" — PartyBadge accepts --party-* tokens only (Rule of Engagement: structural chrome keeps Flamingo/Teal).`,
    );
    return null;
  }
  return (
    <span
      style={{
        background: `color-mix(in srgb, var(${colorToken}) 18%, transparent)`,
        border: `1px solid color-mix(in srgb, var(${colorToken}) 45%, transparent)`,
        color: "var(--text-main)",
        fontWeight: 500,
        padding: "var(--space-tight) var(--space-standard)",
        borderRadius: "var(--radius-ui)",
      }}
    >
      {label}
    </span>
  );
}

/**
 * Props for `<Button>` — the ONE button of the package (2.5.0 "Button &
 * Card Archetypes"). Every native button attribute flows through
 * (`onClick`, `type`, `disabled`, …).
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The visual variant (default "primary"):
   *  - primary — Flamingo fill, on-cake ink, weight 600. FLAT by
   *    package law: css/primitives.css carries ZERO box-shadow (the e1
   *    doctrine — elevation is a composition-layer decision; the
   *    playground shadows its own primary buttons there).
   *  - secondary — surface fill + hairline, text-main.
   *  - ghost — transparent; hover paints the inset well.
   *  - danger — the party-peach attention wash (the error-border
   *    precedent: danger is attention, party territory by owner spec).
   */
  variant?: "primary" | "secondary" | "ghost" | "danger";
  /**
   * Size tier (default "md"): sm → tight padding + 0.8125rem, md → the
   * doctrine button padding (tight vertical / standard horizontal) +
   * 0.875rem, lg → standard padding + 1rem.
   */
  size?: "sm" | "md" | "lg";
  /** A lucide icon rendered BEFORE the children. */
  leftIcon?: IconName;
  /** A lucide icon rendered AFTER the children. */
  rightIcon?: IconName;
  /**
   * The busy state: the icons are REPLACED by the
   * `.sig-btn__spinner` (aria-hidden), the button gains
   * `aria-busy="true"` and `disabled` — a loading button cannot be
   * re-submitted.
   */
  loading?: boolean;
}

/**
 * `<Button>` — the ONE button (2.5.0).
 *
 * Renders ONE `<button class="sig-btn sig-btn--{variant} [-sm/-lg]">` —
 * the flat, token-driven action the composition layer has been
 * hand-rolling since 1.6.0, now official. Press physics: `:active
 * scale(0.97)` (the doctrine press), focus-visible: the Flamingo ring,
 * loading: the css spinner (2px currentColor ring with a transparent
 * top arc, `sig-spin` 0.8s linear infinite) REPLACING the icons —
 * never spinning beside them. Icons are strict `IconName`s (the same
 * live-map contract as `<Icon>`), constrained to 1rem via
 * css/primitives.css so they sit inside the text line.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" leftIcon="Check" loading={submitting}>
 *   Check In
 * </Button>
 * ```
 */
export function Button({
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  loading = false,
  className,
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const sizeClass = size === "sm" ? " sig-btn--sm" : size === "lg" ? " sig-btn--lg" : "";
  return (
    <button
      className={`sig-btn sig-btn--${variant}${sizeClass}${className !== undefined ? ` ${className}` : ""}`}
      aria-busy={loading || undefined}
      disabled={loading || disabled}
      {...rest}
    >
      {loading ? (
        <span className="sig-btn__spinner" aria-hidden="true" />
      ) : (
        <>
          {leftIcon !== undefined && (
            <Icon name={leftIcon} className="sig-btn__icon" aria-hidden />
          )}
          {children}
          {rightIcon !== undefined && (
            <Icon name={rightIcon} className="sig-btn__icon" aria-hidden />
          )}
        </>
      )}
    </button>
  );
}
