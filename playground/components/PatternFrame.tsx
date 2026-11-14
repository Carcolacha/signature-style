/**
 * PatternFrame — the Copy Studio card (2.8.0 "The Signature Pattern
 * Website, 6-Set Taxonomy & One-Click Copy Studio").
 *
 * ONE <article data-sig-set data-sig-component> per pattern: a header
 * bar (component name weight 600 + the Set PartyBadge + the Preview |
 * JSX | HTML segmented mini-tabs + the Copy Card button) over a body
 * that renders the LIVE interactive preview, the formatted JSX snippet,
 * or the documented HTML variant.
 *
 * THE COPY PATH: Copy Card writes the active tab's text to the
 * clipboard (Preview/JSX → snippet.jsx; HTML → snippet.html ??
 * htmlFallback ?? snippet.jsx), flashes Copy → Check for 2s (timer
 * cleaned on unmount and re-copy), and pushes the success toast
 * "Copied <ComponentName> snippet" through the app-level ToastProvider
 * (the hook is consumed HERE; the provider wraps the whole playground
 * in App.tsx). A clipboard failure pushes the error toast instead of
 * dying silently.
 *
 * Zero shadows — the e1 treaty holds: the frame is surface bg + glass
 * hairline + radius, nothing else (styles.css keeps the new anatomy
 * flat).
 */
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Button, PartyBadge, useToast } from "@edwyn/signature-style/react";
import type { SnippetEntry, SetId } from "../snippets.js";

/** The three body views. */
type FrameTab = "preview" | "jsx" | "html";

const TABS: ReadonlyArray<{ id: FrameTab; label: string }> = [
  { id: "preview", label: "Preview" },
  { id: "jsx", label: "JSX" },
  { id: "html", label: "HTML" },
];

/** How long the Check confirmation icon stays before flipping back. */
const COPIED_RESET_MS = 2000;

interface PatternFrameProps {
  /** Taxonomy set id — stamped on data-sig-set (zero-padded, "01".."06"). */
  setId: SetId;
  /** The set's display name — the PartyBadge label. */
  setName: string;
  /** The component name — data-sig-component + the header title. */
  componentName: string;
  /** The registry entry: the copy payloads + documentation strings. */
  snippet: SnippetEntry;
  /** The LIVE interactive preview (Preview tab). */
  children: ReactNode;
  /** Optional HTML override when the entry itself documents none. */
  htmlFallback?: string;
}

/**
 * The Copy Card button — owns the clipboard write, the copied state and
 * its 2s timer, and the outcome toast. Extracted so PatternFrame stays
 * a thin assembly.
 */
function CopyCard({
  text,
  componentName,
}: {
  text: string;
  componentName: string;
}) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Clean the pending reset timer on unmount — no stray setState.
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        toast("success", `Copied ${componentName} snippet`);
        timerRef.current = window.setTimeout(() => setCopied(false), COPIED_RESET_MS);
      })
      .catch(() => {
        toast("error", "Clipboard unavailable — select the code manually");
      });
  };

  return (
    <Button
      size="sm"
      variant="secondary"
      leftIcon={copied ? "Check" : "Copy"}
      onClick={handleCopy}
      aria-label={`Copy the ${componentName} snippet`}
      data-testid="pf-copy"
    >
      {copied ? "Copied!" : "Copy Card"}
    </Button>
  );
}

export function PatternFrame({
  setId,
  setName,
  componentName,
  snippet,
  children,
  htmlFallback,
}: PatternFrameProps) {
  const [tab, setTab] = useState<FrameTab>("preview");
  const html = snippet.html ?? htmlFallback;
  // Preview/JSX copy the canonical JSX; the HTML tab copies the HTML
  // variant when one exists, else falls back to the JSX form.
  const copyText = tab === "html" && html !== undefined ? html : snippet.jsx;

  return (
    <article className="pattern-frame" data-sig-set={setId} data-sig-component={componentName}>
      <header className="pattern-frame__head">
        <div className="pattern-frame__title">
          <h3>{componentName}</h3>
          <PartyBadge
            colorToken={SET_ACCENTS[setId]}
            label={setName}
          />
        </div>
        <div className="pattern-frame__tools">
          <div className="pattern-frame__tabs" role="group" aria-label={`${componentName} view`}>
            {TABS.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className="pattern-frame__tab"
                aria-pressed={tab === entry.id}
                onClick={() => setTab(entry.id)}
                data-testid={`pf-tab-${entry.id}`}
              >
                {entry.label}
              </button>
            ))}
          </div>
          <CopyCard text={copyText} componentName={componentName} />
        </div>
      </header>
      <div className="pattern-frame__body">
        {tab === "preview" && <div className="pattern-frame__preview">{children}</div>}
        {tab === "jsx" && (
          <pre className="pattern-frame__code">
            <code>{snippet.jsx}</code>
          </pre>
        )}
        {tab === "html" &&
          (html !== undefined ? (
            <pre className="pattern-frame__code">
              <code>{html}</code>
            </pre>
          ) : (
            <p className="pattern-frame__note">
              HTML variant not documented — use the JSX form.
            </p>
          ))}
      </div>
    </article>
  );
}

/** The set accent riding the header badge — party tokens only (RoE:
    the PartyBadge runtime guard DROPS structural tokens, so every set
    wears a content color; Set 01 takes lavender, the calm structural-
    adjacent). */
const SET_ACCENTS: Record<SetId, Parameters<typeof PartyBadge>[0]["colorToken"]> = {
  "01": "--party-lavender",
  "02": "--party-pink-bright",
  "03": "--party-green",
  "04": "--party-sky",
  "05": "--party-mauve-soft",
  "06": "--party-yellow",
};
