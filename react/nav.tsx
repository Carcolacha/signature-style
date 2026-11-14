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
 * `{ href, className: "sig-nav__link", children }`; with plain anchors
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

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Icon } from "./primitives.js";

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
 * The props spread onto every rendered link. `plainAnchor` gates
 * aria-current: only self-rendered <a> elements get it — a router
 * renderer owns its own active-state attribute.
 */
function linkProps(
  item: NavItem,
  active: boolean,
  plainAnchor: boolean,
  onClick?: () => void,
): Record<string, unknown> {
  return {
    href: item.href,
    className: "sig-nav__link",
    ...(onClick !== undefined ? { onClick } : {}),
    ...(active && plainAnchor ? { "aria-current": "page" } : {}),
  };
}

/** One <li> per destination — the flat list, bar and drawer alike. */
function renderItems(
  Link: ElementType,
  items: NavItem[],
  activeHref: string | undefined,
  plainAnchor: boolean,
  onClick?: () => void,
): ReactNode[] {
  return items.map((item) => (
    <li key={item.href}>
      <Link {...linkProps(item, item.href === activeHref, plainAnchor, onClick)}>
        {item.label}
      </Link>
    </li>
  ));
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
export function GlobalNav({ items, as, activeHref }: GlobalNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  // Stable callbacks (useCallback, empty deps) — the modal.tsx pattern,
  // safe to hand straight to any listener.
  const open = useCallback(() => setMenuOpen(true), []);
  const close = useCallback(() => setMenuOpen(false), []);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const Link: ElementType = as ?? "a";
  const plainAnchor = as === undefined;

  // Escape closes — a document-level listener, cleaned up on unmount and
  // whenever the drawer closes, so it never leaks across toggles.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (domEvent: KeyboardEvent): void => {
      if (domEvent.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, close]);

  // Focus follows the dialog: the drawer takes focus on open, the
  // hamburger gets it back on close. `openedOnceRef` keeps the initial
  // mount a no-op (focus must never be stolen by a closed navbar).
  const openedOnceRef = useRef(false);
  useEffect(() => {
    if (menuOpen) {
      openedOnceRef.current = true;
      drawerRef.current?.focus();
      return;
    }
    if (openedOnceRef.current) {
      openedOnceRef.current = false;
      menuBtnRef.current?.focus();
    }
  }, [menuOpen]);

  return (
    <>
      <nav className="sig-nav">
        <ul className="sig-nav__list">
          {renderItems(Link, items, activeHref, plainAnchor)}
        </ul>
        <button
          ref={menuBtnRef}
          className="sig-nav__menu-btn"
          type="button"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls="sig-nav-drawer"
          onClick={open}
        >
          <Icon name="Menu" aria-hidden />
        </button>
      </nav>
      {menuOpen &&
        createPortal(
          <div className="sig-modal-backdrop" onClick={close}>
            <aside
              id="sig-nav-drawer"
              ref={drawerRef}
              className="sig-nav-drawer"
              data-open="true"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              tabIndex={-1}
              onClick={(domEvent) => domEvent.stopPropagation()}
            >
              <ul className="sig-nav-drawer__list">
                {renderItems(Link, items, activeHref, plainAnchor, close)}
              </ul>
              <button
                className="sig-modal-close"
                type="button"
                aria-label="Close menu"
                onClick={close}
              >
                <Icon name="X" aria-hidden />
              </button>
            </aside>
          </div>,
          document.body,
        )}
    </>
  );
}

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
export function Breadcrumbs({ items, label, children }: BreadcrumbsProps) {
  if (items.length === 0) {
    return <>{children ?? null}</>;
  }
  return (
    <nav className="sig-breadcrumbs" aria-label={label ?? "Breadcrumb"}>
      <ol>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${String(index)}`}>
              {isLast || item.href === undefined ? (
                <span aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              ) : (
                <a href={item.href}>{item.label}</a>
              )}
              {!isLast && (
                <span className="sig-breadcrumbs__sep" aria-hidden="true">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
