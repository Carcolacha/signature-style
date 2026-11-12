/**
 * primitives — the official React primitives for Signature Style (0.5.0).
 *
 * Pruning Protocol compliance: every component here renders the flattest
 * possible DOM (no decorative wrappers), consumes CSS variables dynamically
 * (`var(--token)` — never hardcoded hexes), and leans on the cascade classes
 * already shipped in css/cascade.css.
 */

import { icons, type LucideProps } from "lucide-react";
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
