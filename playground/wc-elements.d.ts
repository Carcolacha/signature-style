/**
 * wc-elements.d.ts — the JSX intrinsic declarations for the six sig-*
 * custom elements (3.4.0 "Zero-React Native Web Components").
 *
 * The Pattern Studio mounts the REAL elements (registered by the
 * module-level `import "@carcolacha/signature-style/wc"` in
 * PatternStudio.tsx). Custom elements are valid JSX — attributes only —
 * but React's JSX.IntrinsicElements doesn't know the tag names, so this
 * module augments the namespace: the studio stays type-honest, and the
 * attribute spellings here mirror the wc/src contracts (kebab-case
 * attributes; no props, no events).
 *
 * The playground is the composition layer — this file documents the
 * bridge; the wc package itself ships its own tsc-honest .d.ts files
 * (dist/wc/index.d.ts) for non-JSX consumers.
 */
import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      /** <SurfaceCard> twin — eyebrow/meta/title/accent-token/elevation/interactive. */
      "sig-surface-card": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        eyebrow?: string;
        meta?: string;
        title?: string;
        /** A --sig-* token name or a structural signature (e.g. "--sig-peach"). */
        "accent-token"?: string;
        elevation?: "flat" | "raised" | "floating";
        interactive?: boolean | string;
      };
      /** <SigBadge> twin — the label pill (variant or accent-token). */
      "sig-badge": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        label?: string;
        variant?: "peach" | "sky" | "green" | "cobalt" | "lavender" | "mauve-soft" | "pink-bright" | "yellow" | "orchid";
        "accent-token"?: string;
      };
      /** <ProgressBar> twin — value/max drive the fill width + aria-valuenow. */
      "sig-progress-bar": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        value?: number | string;
        max?: number | string;
        label?: string;
        "limit-text"?: string;
        "accent-token"?: string;
      };
      /** <StatRing> twin — pure SVG dial; value changes animate stroke-dashoffset. */
      "sig-stat-ring": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        value?: number | string;
        total?: number | string;
        unit?: string;
        size?: number | string;
        "accent-token"?: string;
        "show-value"?: boolean | string;
      };
      /** <Callout> twin — info/success/warning strip + slotted body. */
      "sig-callout": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        status?: "info" | "success" | "warning";
      };
      /** <Carousel> twin — scroll-snap track + prev/next + dots + "1 / N". */
      "sig-carousel": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        mode?: "free" | "paged";
        label?: string;
      };
    }
  }
}

export {};
