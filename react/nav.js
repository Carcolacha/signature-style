import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
import { useCallback, useEffect, useRef, useState, } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./primitives.js";
/**
 * The props spread onto every rendered link. `plainAnchor` gates
 * aria-current: only self-rendered <a> elements get it — a router
 * renderer owns its own active-state attribute.
 */
function linkProps(item, active, plainAnchor, onClick) {
    return {
        href: item.href,
        className: "sig-nav__link",
        ...(onClick !== undefined ? { onClick } : {}),
        ...(active && plainAnchor ? { "aria-current": "page" } : {}),
    };
}
/** One <li> per destination — the flat list, bar and drawer alike. */
function renderItems(Link, items, activeHref, plainAnchor, onClick) {
    return items.map((item) => (_jsx("li", { children: _jsx(Link, { ...linkProps(item, item.href === activeHref, plainAnchor, onClick), children: item.label }) }, item.href)));
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
export function GlobalNav({ items, as, activeHref }) {
    const [menuOpen, setMenuOpen] = useState(false);
    // Stable callbacks (useCallback, empty deps) — the modal.tsx pattern,
    // safe to hand straight to any listener.
    const open = useCallback(() => setMenuOpen(true), []);
    const close = useCallback(() => setMenuOpen(false), []);
    const menuBtnRef = useRef(null);
    const drawerRef = useRef(null);
    const Link = as ?? "a";
    const plainAnchor = as === undefined;
    // Escape closes — a document-level listener, cleaned up on unmount and
    // whenever the drawer closes, so it never leaks across toggles.
    useEffect(() => {
        if (!menuOpen)
            return undefined;
        const onKeyDown = (domEvent) => {
            if (domEvent.key === "Escape")
                close();
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
    return (_jsxs(_Fragment, { children: [_jsxs("nav", { className: "sig-nav", children: [_jsx("ul", { className: "sig-nav__list", children: renderItems(Link, items, activeHref, plainAnchor) }), _jsx("button", { ref: menuBtnRef, className: "sig-nav__menu-btn", type: "button", "aria-label": "Open menu", "aria-expanded": menuOpen, "aria-controls": "sig-nav-drawer", onClick: open, children: _jsx(Icon, { name: "Menu", "aria-hidden": true }) })] }), menuOpen &&
                createPortal(_jsx("div", { className: "sig-modal-backdrop", onClick: close, children: _jsxs("aside", { id: "sig-nav-drawer", ref: drawerRef, className: "sig-nav-drawer", "data-open": "true", role: "dialog", "aria-modal": "true", "aria-label": "Menu", tabIndex: -1, onClick: (domEvent) => domEvent.stopPropagation(), children: [_jsx("ul", { className: "sig-nav-drawer__list", children: renderItems(Link, items, activeHref, plainAnchor, close) }), _jsx("button", { className: "sig-modal-close", type: "button", "aria-label": "Close menu", onClick: close, children: _jsx(Icon, { name: "X", "aria-hidden": true }) })] }) }), document.body)] }));
}
export default GlobalNav;
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
export function Breadcrumbs({ items, label, children }) {
    if (items.length === 0) {
        return _jsx(_Fragment, { children: children ?? null });
    }
    return (_jsx("nav", { className: "sig-breadcrumbs", "aria-label": label ?? "Breadcrumb", children: _jsx("ol", { children: items.map((item, index) => {
                const isLast = index === items.length - 1;
                return (_jsxs("li", { children: [isLast || item.href === undefined ? (_jsx("span", { "aria-current": isLast ? "page" : undefined, children: item.label })) : (_jsx("a", { href: item.href, children: item.label })), !isLast && (_jsx("span", { className: "sig-breadcrumbs__sep", "aria-hidden": "true", children: "/" }))] }, `${item.label}-${String(index)}`));
            }) }) }));
}
