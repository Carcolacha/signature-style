import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function SurfaceCard({ eyebrow, meta, title, interactive = false, accentToken, elevation = "raised", className, children, }) {
    const classes = ["sig-surface-card"];
    if (interactive) {
        classes.push("sig-surface-card--interactive");
    }
    if (className !== undefined) {
        classes.push(className);
    }
    // The chromatic mechanism (2.6.0): attribute + inline variable, so the
    // css side ([data-accent] rules) does all the painting — the same
    // mechanism as the AnnouncementBanner's inline --status.
    const accentStyle = accentToken !== undefined
        ? { "--sig-accent": `var(${accentToken})` }
        : undefined;
    return (_jsxs("section", { className: classes.join(" "), "data-elevation": elevation, "data-accent": accentToken !== undefined || undefined, style: accentStyle, children: [(eyebrow !== undefined || meta !== undefined) && (_jsxs("div", { className: "sig-surface-card__meta", children: [eyebrow !== undefined && (_jsx("span", { className: "sig-surface-card__eyebrow", children: eyebrow })), meta !== undefined && (_jsx("span", { className: "sig-surface-card__path", children: meta }))] })), title !== undefined && (_jsx("h2", { className: "sig-surface-card__title", children: title })), children] }));
}
export function PageHero({ title, subtitle, children }) {
    return (_jsxs("header", { className: "sig-page-hero", children: [_jsx("h1", { children: title }), subtitle !== undefined && (_jsx("p", { className: "sig-page-hero__sub", children: subtitle })), children] }));
}
