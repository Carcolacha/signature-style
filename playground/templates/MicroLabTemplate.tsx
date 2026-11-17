/**
 * MicroLabTemplate — FULL-PAGE BLUEPRINT "Interactive Micro-Lab &
 * Discovery Deck" (4.0.0 "…& Human-Crafted Blueprints"; registry id
 * "microlab" — NEW).
 *
 * THE FAST TACTILE ZERO-FLUFF UTILITY GRID — one self-contained
 * default-export page, ORIGINAL content throughout (the style is
 * inspired by the tiny-interactive-toys genre; every prompt, call sign
 * and number here is invented — zero copyrighted titles, zero real
 * handles). Block by block, top to bottom:
 *
 *   1. Millisecond Reaction-Time Test — a full-width surface that
 *      turns --sig-neon-green after a random 1–3s delay; the click
 *      measures the exact elapsed ms in tabular-nums. THE STATE
 *      MACHINE: idle → waiting → green → result; a too-early click
 *      reads "Too soon!" and resets (the timer dies with the click).
 *      Best-of-5 is tracked: attempts, best and average render
 *      tabular under the surface.
 *   2. Deterministic Idea/Prompt Deck — a grid of rich FlipCards with
 *      a FIXED seeded deck (front prompts, back reveals — ordered,
 *      no shuffle): the same deal every visit, the purity doctrine.
 *   3. Focus Rhythm & Waveform Toy — WaveformBars + StatusBeacon
 *      wired to a running toggle and a three-stop tempo/band control
 *      (Calm / Focus / Peak set the bar count and the beacon voice).
 *
 * STANDALONE PURITY: embedded token-driven <style> (zero hex, 8px
 * grid, container queries on the SHARED `template-stage` name with an
 * INNER grid wrapper — a container query can never restyle its own
 * container), reduced-motion guard, zero external dependencies, no
 * ToastProvider needed (the widgets own their feedback).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import {
  FlipCard,
  SigBadge,
  StatusBeacon,
  ToggleSwitch,
  WaveformBars,
} from "@edwyn/signature-style/react";

/* ------------------------------------------------------------------ */
/* The template's own stylesheet — embedded for standalone purity.     */
/* ------------------------------------------------------------------ */
const MICROLAB_TEMPLATE_CSS = `
.sig-tpl-microlab {
  container-type: inline-size;
  container-name: template-stage;
  max-width: 1160px;
  margin-inline: auto;
  padding-bottom: var(--space-section);
  font-family: var(--font-sans);
}
.sig-tpl-microlab__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-section);
}
.sig-tpl-microlab__grid > .cell-full { grid-column: 1 / -1; }
.sig-tpl-microlab__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-standard);
  background: var(--bg-surface);
  border: 1px solid color-mix(in srgb, var(--text-muted) 15%, transparent);
  border-radius: var(--radius-card);
  padding: var(--space-section);
  min-width: 0;
}
.sig-tpl-microlab__eyebrow {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
}
/* 1 — THE REACTION SURFACE: the state machine paints the ground.
   idle = the inset hairline card; waiting = the azure "hold" wash;
   green = the neon-green GO ground with dark ink; early = the peach
   "too soon" wash. The chromatic ground is CONTENT state (the RoE). */
.sig-tpl-microlab__rt {
  min-height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-tight);
  border: 1px solid color-mix(in srgb, var(--text-muted) 20%, transparent);
  border-radius: var(--radius-card);
  background: var(--bg-inset);
  color: var(--text-main);
  padding: var(--space-section);
  cursor: pointer;
  font: inherit;
  text-align: center;
  width: 100%;
}
.sig-tpl-microlab__rt[data-phase="waiting"] {
  background: color-mix(in srgb, var(--sig-azure) 16%, var(--bg-inset));
  border-color: color-mix(in srgb, var(--sig-azure) 45%, transparent);
}
.sig-tpl-microlab__rt[data-phase="green"] {
  background: var(--sig-neon-green);
  border-color: var(--sig-neon-green);
  color: var(--bg-base);
}
.sig-tpl-microlab__rt[data-phase="early"] {
  background: color-mix(in srgb, var(--sig-peach) 16%, var(--bg-inset));
  border-color: color-mix(in srgb, var(--sig-peach) 45%, transparent);
}
.sig-tpl-microlab__rt:focus-visible {
  outline: 2px solid var(--color-cake-primary);
  outline-offset: 2px;
}
.sig-tpl-microlab__rt-word {
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}
.sig-tpl-microlab__rt-ms {
  font-size: 2rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--text-bright);
}
.sig-tpl-microlab__rt[data-phase="green"] .sig-tpl-microlab__rt-ms {
  color: var(--bg-base);
}
.sig-tpl-microlab__rt-hint {
  font-size: 0.8125rem;
  color: var(--text-muted);
}
.sig-tpl-microlab__rt[data-phase="green"] .sig-tpl-microlab__rt-hint {
  color: var(--bg-base);
}
.sig-tpl-microlab__scoreboard {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-standard);
  font-variant-numeric: tabular-nums;
  font-size: 0.8125rem;
  color: var(--text-muted);
}
.sig-tpl-microlab__scoreboard strong { color: var(--text-main); font-weight: 600; }
/* 2 — THE DECK: an ordered grid of rich FlipCards. */
.sig-tpl-microlab__deck {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-standard);
  align-items: start;
}
/* 3 — THE WAVE TOY: beacon row + bars + controls. */
.sig-tpl-microlab__wave-head {
  display: flex;
  align-items: center;
  gap: var(--space-tight);
}
.sig-tpl-microlab__wave {
  display: flex;
  flex-direction: column;
  gap: var(--space-standard);
}
.sig-tpl-microlab__tempo {
  display: flex;
  gap: var(--space-tight);
  flex-wrap: wrap;
}
.sig-tpl-microlab__tempo button {
  padding: var(--space-tight) var(--space-standard);
  font: inherit;
  font-size: 0.8125rem;
  color: var(--text-muted);
  background: var(--bg-inset);
  border: 1px solid color-mix(in srgb, var(--text-muted) 20%, transparent);
  border-radius: var(--radius-ui);
  cursor: pointer;
}
.sig-tpl-microlab__tempo button[aria-pressed="true"] {
  color: var(--text-main);
  font-weight: 600;
  border-color: var(--color-cake-primary);
  background: color-mix(in srgb, var(--color-cake-primary) 10%, var(--bg-surface));
}
.sig-tpl-microlab__tempo button:focus-visible {
  outline: 2px solid var(--color-cake-primary);
  outline-offset: 2px;
}
/* THE DOCTRINE FOCUS RING for the deck's flip buttons (cards.css owns
   its own ring; this catches any stray interactive in the section). */
.sig-tpl-microlab button:focus-visible {
  outline: 2px solid var(--color-cake-primary);
  outline-offset: 2px;
}
@container template-stage (max-width: 900px) {
  /* ≤900px container: one-column tier — the utility grid stacks. */
  .sig-tpl-microlab__grid { grid-template-columns: minmax(0, 1fr); }
  .sig-tpl-microlab__grid > .cell-full { grid-column: auto; }
}
@container template-stage (max-width: 560px) {
  /* ≤560px container: the deck grid stacks too (one card per row). */
  .sig-tpl-microlab__deck { grid-template-columns: minmax(0, 1fr); }
}
@media (prefers-reduced-motion: reduce) {
  .sig-tpl-microlab * { transition-duration: 1ms !important; animation-duration: 1ms !important; }
}
`;

/* ------------------------------------------------------------------ */
/* Data — the deterministic deck (fixed seed, ordered deal).           */
/* ------------------------------------------------------------------ */

const PROMPT_DECK: Array<{
  eyebrow: string;
  title: string;
  body: string;
  reveal: string;
  revealBody: string;
  token: "--sig-cyan" | "--sig-orchid" | "--sig-mint" | "--sig-tangerine";
}> = [
  {
    eyebrow: "Prompt 01",
    title: "Name the ritual that starts your best focus block",
    body: "Thirty seconds of setup beats an hour of resolve.",
    reveal: "The two-minute sweep",
    revealBody: "Clear the desk, one tab, one note — then the timer. The ritual IS the ramp.",
    token: "--sig-cyan",
  },
  {
    eyebrow: "Prompt 02",
    title: "Which tab would you close and never miss?",
    body: "Digital pruning counts double: focus and bandwidth.",
    reveal: "The dashboard you re-check hourly",
    revealBody: "Pin the number once a day instead — the tab dies, the signal stays.",
    token: "--sig-orchid",
  },
  {
    eyebrow: "Prompt 03",
    title: "What is the smallest shippable slice of today's idea?",
    body: "Slice until it fits in one sitting.",
    reveal: "The one-screen version",
    revealBody: "One screen, one action, one save button. Everything else is version two.",
    token: "--sig-mint",
  },
  {
    eyebrow: "Prompt 04",
    title: "Which recurring meeting could be a three-line note?",
    body: "Async first — the calendar is the last resort.",
    reveal: "The status sync",
    revealBody: "Bullets travel better than voices; exceptions earn a live call.",
    token: "--sig-tangerine",
  },
];

/** The tempo stops — bar count + the beacon's chromatic voice. */
const TEMPO_STOPS = [
  { id: "calm", label: "Calm", bars: 8, token: "--sig-mint" },
  { id: "focus", label: "Focus", bars: 16, token: "--sig-cyan" },
  { id: "peak", label: "Peak", bars: 24, token: "--sig-orchid" },
] as const;

/* ------------------------------------------------------------------ */
/* Block 1 — the Millisecond Reaction-Time Test.                       */
/* ------------------------------------------------------------------ */

/** The state machine: idle → waiting → green → result (early = the
 *  too-soon reset). The attempt ledger keeps the last five. */
type ReactionPhase = "idle" | "waiting" | "green" | "result" | "early";

function ReactionTest(): ReactNode {
  const [phase, setPhase] = useState<ReactionPhase>("idle");
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number[]>([]);
  const timerRef = useRef<number | null>(null);
  const startRef = useRef(0);

  // The pending green timer never outlives the test.
  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const armRound = (): void => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    setPhase("waiting");
    // The 1–3s random hold — the toy's whole point is that you cannot
    // predict it; the measured RESULT is exact to the millisecond.
    const delay = 1000 + Math.random() * 2000;
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      startRef.current = performance.now();
      setPhase("green");
    }, delay);
  };

  const handleSurface = (): void => {
    if (phase === "idle" || phase === "early") {
      armRound();
      return;
    }
    if (phase === "waiting") {
      // TOO SOON — kill the pending timer, reset with the peach wash.
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = null;
      setElapsedMs(null);
      setPhase("early");
      return;
    }
    if (phase === "green") {
      const delta = performance.now() - startRef.current;
      const ms = Math.max(1, Math.round(delta));
      setElapsedMs(ms);
      setAttempts((current) => [...current.slice(-4), ms]);
      setPhase("result");
      return;
    }
    // result → next round
    armRound();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>): void => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSurface();
    }
  };

  const best = attempts.length > 0 ? Math.min(...attempts) : null;
  const average =
    attempts.length > 0
      ? Math.round(attempts.reduce((sum, value) => sum + value, 0) / attempts.length)
      : null;

  const word =
    phase === "idle" ? "Click to start"
    : phase === "waiting" ? "Hold…"
    : phase === "green" ? "NOW"
    : phase === "early" ? "Too soon!"
    : "Click for the next round";
  const hint =
    phase === "idle" ? "The surface turns green after a 1–3 second hold — click the instant it flips."
    : phase === "waiting" ? "Wait for green. Clicking now resets the round."
    : phase === "green" ? "Click!"
    : phase === "early" ? "You clicked before the green — the round resets."
    : "Your time is on the board — click to arm the next round.";

  return (
    <section className="sig-tpl-microlab__section cell-full" data-testid="tpl-micro-rt-section">
      <span className="sig-tpl-microlab__eyebrow">Reaction Lab · Millisecond Test</span>
      <button
        type="button"
        className="sig-tpl-microlab__rt"
        data-phase={phase}
        data-testid="tpl-micro-rt"
        aria-live="polite"
        aria-label={`Reaction-time test surface — ${word}`}
        onClick={handleSurface}
        onKeyDown={handleKeyDown}
      >
        {phase === "result" && elapsedMs !== null ? (
          <span className="sig-tpl-microlab__rt-ms">{elapsedMs} ms</span>
        ) : (
          <span className="sig-tpl-microlab__rt-word">{word}</span>
        )}
        <span className="sig-tpl-microlab__rt-hint">{hint}</span>
      </button>
      <div className="sig-tpl-microlab__scoreboard" data-testid="tpl-micro-rt-score">
        <span>Round <strong>{Math.min(attempts.length + (phase === "result" ? 0 : 1), 5)}</strong> / 5</span>
        <span>Last <strong>{elapsedMs !== null ? `${elapsedMs} ms` : "—"}</strong></span>
        <span>Best <strong>{best !== null ? `${best} ms` : "—"}</strong></span>
        <span>Average <strong>{average !== null ? `${average} ms` : "—"}</strong></span>
        <span>Attempts <strong>{attempts.length}</strong></span>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Block 2 — the Deterministic Idea/Prompt Deck.                       */
/* ------------------------------------------------------------------ */

function PromptDeck(): ReactNode {
  return (
    <section className="sig-tpl-microlab__section cell-full" data-testid="tpl-micro-deck">
      <span className="sig-tpl-microlab__eyebrow">Discovery Deck · the fixed seed</span>
      <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-muted)" }}>
        Four cards, dealt in order — the same prompts every visit (the
        deterministic contract). Click a card to flip it.
      </p>
      <div className="sig-tpl-microlab__deck">
        {PROMPT_DECK.map((card) => (
          <FlipCard
            key={card.eyebrow}
            frontEyebrow={card.eyebrow}
            frontTitle={card.title}
            frontBody={card.body}
            backEyebrow="Reveal"
            backTitle={card.reveal}
            backBody={card.revealBody}
            accentToken={card.token}
            front="Click to flip"
            back="Click to flip back"
          />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Block 3 — the Focus Rhythm & Waveform Toy.                          */
/* ------------------------------------------------------------------ */

function WaveToy(): ReactNode {
  const [running, setRunning] = useState(true);
  const [tempo, setTempo] = useState<(typeof TEMPO_STOPS)[number]["id"]>("focus");
  const stop = useMemo(
    () => TEMPO_STOPS.find((entry) => entry.id === tempo) ?? TEMPO_STOPS[1],
    [tempo],
  );
  return (
    <section className="sig-tpl-microlab__section" data-testid="tpl-micro-wave">
      <span className="sig-tpl-microlab__eyebrow">Focus Rhythm · Waveform Toy</span>
      <div className="sig-tpl-microlab__wave-head">
        <StatusBeacon
          status={running ? tempo : "paused"}
          colorToken={running ? stop.token : "--sig-peach"}
          label={running ? `Focus rhythm running — ${stop.label}` : "Focus rhythm paused"}
        />
        <span style={{ fontSize: "0.875rem", color: "var(--text-main)" }}>
          {running ? `${stop.label} rhythm — ${stop.bars} bands` : "Paused — the bands hold their heights"}
        </span>
      </div>
      <div className="sig-tpl-microlab__wave">
        <WaveformBars
          bars={stop.bars}
          active={running}
          colorToken={stop.token}
          label={`Focus rhythm waveform — ${stop.label}`}
        />
      </div>
      <ToggleSwitch
        checked={running}
        onToggle={setRunning}
        label="Focus rhythm running"
      />
      <div className="sig-tpl-microlab__tempo" role="group" aria-label="Tempo stop" data-testid="tpl-micro-tempo">
        {TEMPO_STOPS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            aria-pressed={tempo === entry.id}
            onClick={() => setTempo(entry.id)}
          >
            {entry.label} · {entry.bars}
          </button>
        ))}
      </div>
    </section>
  );
}

/** A small extra utility tile — the deck section's sibling so the
    right column of the utility grid carries two widgets. */
function TempoBadge(): ReactNode {
  const [tempo, setTempo] = useState<(typeof TEMPO_STOPS)[number]["id"]>("focus");
  const stop = useMemo(
    () => TEMPO_STOPS.find((entry) => entry.id === tempo) ?? TEMPO_STOPS[1],
    [tempo],
  );
  return (
    <section className="sig-tpl-microlab__section" data-testid="tpl-micro-badge">
      <span className="sig-tpl-microlab__eyebrow">Session Tag · click to cycle</span>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-standard)", flexWrap: "wrap" }}>
        <SigBadge colorToken={stop.token} label={stop.label} />
        <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
          the beacon and the wave above share this stop
        </span>
      </div>
      <div className="sig-tpl-microlab__tempo" role="group" aria-label="Session tag stop">
        {TEMPO_STOPS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            aria-pressed={tempo === entry.id}
            onClick={() => setTempo(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </div>
    </section>
  );
}

function MicroLabPage(): ReactNode {
  return (
    <main className="sig-tpl-microlab" data-testid="tpl-microlab">
      <style>{MICROLAB_TEMPLATE_CSS}</style>
      {/* The INNER grid wrapper: the container queries answer the
          root's width and restyle THIS element. */}
      <div className="sig-tpl-microlab__grid">
        <ReactionTest />
        <PromptDeck />
        <WaveToy />
        <TempoBadge />
      </div>
    </main>
  );
}

/**
 * The Interactive Micro-Lab & Discovery Deck full-page template — the
 * fast tactile zero-fluff utility grid: the millisecond reaction-time
 * test (idle → waiting → green → result, best-of-5), the fixed-seed
 * FlipCard prompt deck, and the focus-rhythm waveform toy. See the
 * file header for the block-by-block outline.
 */
export default function MicroLabTemplate() {
  return <MicroLabPage />;
}
