/**
 * index.ts — the WC registry (3.4.0 "Zero-React Native Web Components").
 *
 * IMPORTING THIS MODULE REGISTERS THE SIX ELEMENTS (side effect, guarded:
 * a name already defined — hot reload, double import, another bundle —
 * is SKIPPED, never a DuplicateDefinitionException) and exports the
 * classes + types for imperative use.
 *
 * Usage:
 *   import "@carcolacha/signature-style/wc";          // registers all six
 *   // or tree-shaken: import { SigStatRing } from "@carcolacha/signature-style/wc";
 *
 *   <sig-stat-ring value="85" accent-token="--sig-cobalt"></sig-stat-ring>
 *
 * TOKENS PREREQUISITE: link `@carcolacha/signature-style/css` (or any
 * stylesheet declaring the --sig-* custom properties) — custom
 * properties inherit through shadow-DOM boundaries, so one link themes
 * every element, `<html data-sig-theme>` included.
 */
import { SigElement } from "./base.js";
import {
  SigBadge,
  SigCallout,
  SigCarousel,
  SigProgressBar,
  SigStatRing,
  SigSurfaceCard,
} from "./elements.js";
import type { SigBadgeVariant, SigCalloutStatus, SigElevation } from "./elements.js";

export { SigElement };
export { SigBadge, SigCallout, SigCarousel, SigProgressBar, SigStatRing, SigSurfaceCard };
export type { SigBadgeVariant, SigCalloutStatus, SigElevation };

/** The registration pairs — name first so the guard reads cleanly. */
const REGISTRY: ReadonlyArray<readonly [string, CustomElementConstructor]> = [
  ["sig-surface-card", SigSurfaceCard],
  ["sig-badge", SigBadge],
  ["sig-progress-bar", SigProgressBar],
  ["sig-stat-ring", SigStatRing],
  ["sig-callout", SigCallout],
  ["sig-carousel", SigCarousel],
];

// Guarded define — hot-reload safety: never double-define.
for (const [name, ctor] of REGISTRY) {
  if (customElements.get(name) === undefined) customElements.define(name, ctor);
}
