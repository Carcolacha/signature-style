/**
 * nav — <GlobalNav> (1.2.0) + <Breadcrumbs> (2.9.0 "Power-User
 * Utilities").
 *
 * GlobalNav architecture: two flat regions. The bar is a sticky <nav>
 * whose flat <ul> renders one link per item — there is no `.is-active`
 * class, the `[aria-current="page"]` attribute IS the active state and
 * css/nav.css styles it directly. The mobile drawer is portaled to
 * `document.body` with `createPortal` (same architecture as modal.tsx)
 * so it breaks free of the navbar's sticky stacking context: it reuses
 * the modal backdrop (z-40) as its scrim and wears `var(--z-modal, 50)`
 * itself — above the navbar, sibling to the modal card.
 *
 * Link-agnostic API: `as` accepts any component-agnostic link renderer
 * (React Router's NavLink). Links receive
 * `{ href, className: "ptp-nav__link", children }`; with plain anchors
 * (`as` undefined) `activeHref` sets `aria-current="page"`, while with a
 * router link the ROUTER owns aria-current — leave `activeHref` unset.
 * The drawer links go through the same renderer.
 *
 * GlobalNav a11y contract: the hamburger is `aria-expanded` +
 * `aria-controls`; the drawer is role="dialog" with aria-modal="true"
 * and aria-label="Menu". Escape closes (document keydown listener
 * installed in a useEffect and ALWAYS cleaned up — the modal.tsx
 * pattern), a backdrop click closes, clicks inside the drawer do NOT
 * (stopPropagation), and focus follows the dialog: the drawer takes
 * focus on open, the hamburger gets it back on close.
 *
 * 2.9.0 <Breadcrumbs> — the Shed-style mono path ("engine / set-02 /
 * matchup-card"): ONE <nav aria-label="Breadcrumb"> > <ol> of <li>s;
 * crumbed items with an href render <a>, the LAST item renders a
 * <span aria-current="page"> (bold text-main in css) — a crumb without
 * href is a plain span too. Separators are explicit "/" spans with
 * aria-hidden="true" parked after each non-last item's content, so
 * screen readers hear the labels, never the punctuation.
 *
 * Pruning Protocol: zero wrapper divs in the bar, zero hardcoded
 * hexes — every color comes from tokens via css/nav.css.
 */
import { type ElementType, type ReactNode } from "react";
/** One navigation destination. */
export interface NavItem {
    /** The link target — a hash, a path, whatever the renderer consumes. */
    href: string;
    /** The visible link text. */
    label: string;
}
export interface GlobalNavProps {
    /** The navigation destinations, rendered once in the bar and in the drawer. */
    items: NavItem[];
    /**
     * Component-agnostic link renderer: pass React Router's NavLink;
     * defaults to <a>. Receives { href, className, children, 'aria-current'? }.
     */
    as?: ElementType;
    /**
     * Which href is the current page (sets aria-current="page"). With
     * React Router + NavLink, the router sets it — leave undefined.
     */
    activeHref?: string;
}
/**
 * `<GlobalNav>` — the sticky navbar + mobile menu drawer.
 *
 * The bar renders at every width; at the 768px Pillar 2 breakpoint
 * css/nav.css hides the flat list and shows the hamburger. Opening the
 * hamburger portals the drawer (plus the reused modal backdrop) to
 * `document.body`. Closed renders nothing at all — no hidden chrome in
 * the DOM.
 *
 * @example
 * ```tsx
 * <GlobalNav
 *   items={[{ href: "#timeline", label: "Timeline" }]}
 *   activeHref="#timeline"
 * />
 * ```
 */
export declare function GlobalNav({ items, as, activeHref }: GlobalNavProps): import("react").JSX.Element;
export default GlobalNav;
/** One crumb: a label, and an href when the step is navigable. */
export interface BreadcrumbItem {
    /** The visible crumb text (mono, Shed-style path segment). */
    label: string;
    /** The link target; omit for the current page (rendered as span). */
    href?: string;
}
export interface BreadcrumbsProps {
    /** The path, root first. The LAST item always renders aria-current="page". */
    items: BreadcrumbItem[];
    /** The nav's accessible name (defaults to "Breadcrumb"). */
    label?: string;
    /** Rendered when the list is empty — defaults to nothing (honest void). */
    children?: ReactNode;
}
/**
 * `<Breadcrumbs>` — the mono path trail. The last item renders a
 * `<span aria-current="page">`; separators are explicit aria-hidden
 * "/" spans so assistive tech hears the path, not the punctuation.
 *
 * @example
 * ```tsx
 * <Breadcrumbs
 *   items={[
 *     { label: "engine", href: "#/dashboard" },
 *     { label: "set-02" },
 *     { label: "matchup-card" },
 *   ]}
 * />
 * ```
 */
export declare function Breadcrumbs({ items, label, children }: BreadcrumbsProps): import("react").JSX.Element;
