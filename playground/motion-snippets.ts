/**
 * MOTION-SNIPPETS — SET 08 · Motion & Kinetics (3.7.0).
 *
 * The Motion Lab's Copy Card payloads, in their OWN registry file by
 * contract: the (ps-studio)/(ps-llms) gates regex-extract SNIPPETS keys
 * from snippets.ts and force each one to mount a Pattern Studio frame —
 * and Set 08 does NOT mount in the studio stream (it mounts in the
 * MOTION LAB view, #/motion). Same SnippetEntry shape, same Copy Card
 * machinery, a separate registry. Task 5's (mo-gates) pin: every
 * MOTION_SNIPPETS key mounts a Motion Lab frame AND lands in
 * llms-full.txt.
 */
import type { SetId, SnippetEntry } from "./snippets.js";

export const MOTION_SNIPPETS: Record<string, SnippetEntry> = {

  KineticTokens: {
    set: "08",
    componentName: "The kinetic tokens",
    jsx: `/* 3.7.0 — the Motion section of css/tokens.css (:root, theme-independent).
   Four NATIVE linear() spring curves (zero animation libraries) + four
   scale-derived durations + ONE time-dilation master dial.

   Browser support: linear() is Chrome 113+ / Safari 17.2 / Firefox 112+.
   tokens.css carries a @supports fallback re-declaring all four as
   cubic-bezier approximations (snappy 0.34,1.56,0.64,1 · gentle
   0.25,1.25,0.45,1 · kinetic-out 0.16,1,0.3,1 · glide 0.4,0,0.2,1). */

--ease-spring-snappy: linear(0, 0.44 6.4%, 0.83 12.9%, 1.02 18.6%, 1.08 24.2%,
  1.09 28.9%, 1.05 34.9%, 0.98 42.4%, 0.97 48.5%, 1.01 58.6%, 1 69.1%, 1);
--ease-spring-gentle: linear(0, 0.36 8.9%, 0.68 17.9%, 0.9 26.1%, 1.01 34.9%,
  1.06 44.4%, 1.05 55.4%, 0.99 69.1%, 1);
--ease-kinetic-out:   linear(0, 0.61 10.8%, 0.91 22.7%, 1.02 34.3%, 1.05 45.5%,
  1.01 61.4%, 1);
--ease-glide:         linear(0, 0.63 14.5%, 0.95 30.2%, 1.02 42.5%, 0.99 57.1%, 1);

--dur-spring-snappy: calc(var(--sig-motion-scale, 1) * 320ms);
--dur-spring-gentle: calc(var(--sig-motion-scale, 1) * 480ms);
--dur-kinetic-out:   calc(var(--sig-motion-scale, 1) * 380ms);
--dur-glide:         calc(var(--sig-motion-scale, 1) * 280ms);
--sig-motion-scale: 1; /* the dial — Slow-Mo sets 0.25 */

/* REDUCED-MOTION MERCY: under prefers-reduced-motion: reduce AND the
   [data-sig-motion="reduced"] root override, all four durations
   collapse to 1ms — every kinetic transition becomes instant. */`,
  },
  AnimatedNumber: {
    set: "08",
    componentName: "AnimatedNumber",
    jsx: `import { AnimatedNumber } from "@carcolacha/signature-style/react";

<AnimatedNumber value={1740} prefix="$" />
<AnimatedNumber value={63.4} suffix="%" decimals={1} />
<AnimatedNumber value={12} suffix=" km/h" duration={480} />

/* rAF roll from the previous value, spring-interpolated (easeOutQuint
   + a damped 2% overshoot peaking at 70%). One <span class=
   "sig-animated-number">, tabular-nums — digits never jitter. No
   aria-live: the interpolation is decorative; the final value lands. */`,
  },
  MotionReveal: {
    set: "08",
    componentName: "MotionReveal",
    jsx: `import { MotionReveal } from "@carcolacha/signature-style/react";

{cards.map((card, index) => (
  <MotionReveal
    key={card.id}
    variant="fade-up"   /* or "scale-in" | "clip-reveal" */
    staggerIndex={index} /* delay = calc(index × 45ms) */
  >
    <StatCard {...card} />
  </MotionReveal>
))}

/* IntersectionObserver once-entrance (disconnects after revealing).
   Replay = remount (bump a React key). Reduced motion and
   [data-sig-motion="reduced"] ancestors reveal instantly. */`,
  },
  KineticSurface: {
    set: "08",
    componentName: "KineticSurface",
    jsx: `import { KineticSurface } from "@carcolacha/signature-style/react";

<KineticSurface accentToken="--sig-cyan">
  <p>Move the cursor across me — the sheen tracks it.</p>
</KineticSurface>
<KineticSurface accentToken="--sig-violet-glow">…</KineticSurface>

/* onPointerMove writes --ptr-x / --ptr-y (pixel coords) through a
   rAF-throttled setter; css/motion.css paints a 240px radial-gradient
   sheen at those coords (::after), fading in on hover. The POSITION
   repaints — it never animates; opacity is the only transition. */`,
  },
  MotionLabTimeDilation: {
    set: "08",
    componentName: "The time-dilation pattern",
    jsx: `/* Slow-Mo: one custom property dilates EVERY kinetic duration on the
   subtree — set --sig-motion-scale on any container (the Motion Lab's
   control bar sets it on its root; 0.25 = quarter speed, springs
   visibly overshoot). */

<section style={{ "--sig-motion-scale": 0.25 }}>
  <MotionReveal variant="fade-up">…</MotionReveal>
  <AnimatedNumber value={63} suffix="%" />
</section>

/* The preview mercy: data-sig-motion="reduced" on the same container
   collapses the four duration tokens to 1ms — every spring inside
   lands instantly (the OS-level prefers-reduced-motion is honored
   automatically by css/tokens.css). */`,
  },
  FallbackFirstData: {
    set: "08",
    componentName: "The fallback-first data pattern",
    jsx: `/* LIVE DATA CHOREOGRAPHY, zero keys: render deterministic offline
   sample data FIRST (labeled as a sample — never fake "live"), fetch
   the real stream on mount, swap in on success, keep the fallback on
   failure. AbortController cleans up on unmount. */

const [data, setData] = useState(SAMPLE_SERIES); // deterministic, labeled
const [status, setStatus] = useState("fallback"); // fallback|loading|live|error

useEffect(() => {
  const controller = new AbortController();
  setStatus("loading");
  fetch(OPEN_METEO_URL, { signal: controller.signal })
    .then((res) => {
      if (!res.ok) throw new Error(String(res.status));
      return res.json();
    })
    .then((json) => {
      setData(toSeries(json));
      setStatus("live");
    })
    .catch((err) => {
      if (err.name !== "AbortError") setStatus("error"); // fallback retained
    });
  return () => controller.abort();
}, []);

/* Failure is quiet on the auto-mount run (the sample IS the state) and
   loud on manual refetches (a toast names the failure). */`,
  },

  AuroraBorderCard: {
    set: "08",
    componentName: "AuroraBorderCard",
    jsx: `import { AuroraBorderCard } from "@carcolacha/signature-style/react";

<AuroraBorderCard accentTokens={["--sig-cyan", "--sig-orchid", "--sig-mint", "--sig-cobalt"]} trigger="hover">
  <p>The beam spins on hover.</p>
</AuroraBorderCard>
<AuroraBorderCard trigger="always">
  <p>The beam never sleeps.</p>
</AuroraBorderCard>

/* css/motion.css REGISTERS the angle (CSS @property, syntax "<angle>"),
   so the keyframe rotation interpolates per frame; the ::before is a
   conic-gradient cycling the accent tokens, mask-composited to a 2px
   ring (the border-beam technique). NO box-shadow is animated — the
   e1 treaty's registered-custom-property clause. Engines without
   @property keep a static 4-color ring; reduced motion holds it. */`,
  },
  TiltSurface: {
    set: "08",
    componentName: "TiltSurface",
    jsx: `import { TiltSurface } from "@carcolacha/signature-style/react";

<TiltSurface tilt={6} accentToken="--sig-rose-glow">
  <p>Tilt with the cursor — the sheen rides along.</p>
</TiltSurface>

/* perspective(600px) rotateX/rotateY tracking the pointer, rAF-throttled
   (the KineticSurface --ptr-x/--ptr-y math extended with --tilt-x/
   --tilt-y). Reduced motion: the tilt pins flat, the opacity-only
   sheen stays. */`,
  },
  StatusBeacon: {
    set: "08",
    componentName: "StatusBeacon",
    jsx: `import { StatusBeacon } from "@carcolacha/signature-style/react";

<StatusBeacon status="live" colorToken="--sig-green" />
<StatusBeacon status="syncing" colorToken="--sig-azure" size={12} label="Stream syncing" />

/* One span (the dot); ::after scales 1 → 2.2 and fades — the classic
   ping, transform/opacity only (the e1 treaty). role="status" carries
   the accessible name. Reduced motion: a static dot. */`,
  },
  WaveformBars: {
    set: "08",
    componentName: "WaveformBars",
    jsx: `import { WaveformBars } from "@carcolacha/signature-style/react";

<WaveformBars bars={16} colorToken="--sig-mint" label="Stream level" />
<WaveformBars data={[0.2, 0.9, 0.4, 0.7]} active={false} />

/* N bars, per-bar animation-delay (calc(--bar-i × 90ms)) on the snappy
   spring — the diagonal dance. Heights from your data (normalized) or
   the deterministic golden-angle curve (0.3 + 0.7·|sin(i·2.399 + 1.2)| —
   same input, same bars, NO Math.random). Reduced motion: static bars. */`,
  },
  StaggerWave: {
    set: "08",
    componentName: "The staggered wave (key-remount pattern)",
    jsx: `import { useState } from "react";

// 4.0.0 — Play = bump a React key; the REMOUNT re-runs a pure CSS
// @keyframes cascade. Every card carries --wave-i (its index).
const [waveKey, setWaveKey] = useState(0);
<div key={waveKey} className="wave-grid">
  {tiles.map((tile, index) => (
    <div key={tile.label} className="wave-card" style={{ "--wave-i": index }}>
      {tile.label}
    </div>
  ))}
</div>
<Button onClick={() => setWaveKey((k) => k + 1)}>Play Wave</Button>

/* css: .wave-card { opacity: 0; animation: wave-in 560ms
   var(--ease-spring-gentle) calc(var(--wave-i) * 60ms) forwards; }
   @keyframes wave-in { from { opacity: 0; transform: translate3d(0, 24px, 0)
   scale(0.94); } to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); } }
   Reduced motion: animation none, opacity 1. */`,
  },
  SpringPucks: {
    set: "08",
    componentName: "The spring puck race",
    jsx: `// 4.0.0 — TWO weighted pucks, SAME duration, two springs: the
// overshoot difference IS the lesson. Trigger = bump the key (reset
// to start, then animate).
<div key={raceKey} className="puck-track">   {/* container-type: inline-size */}
  <div className="puck-lane">
    <span className="puck" style={{ "--puck-ease": "var(--ease-spring-snappy)" }}>Snappy</span>
  </div>
  <div className="puck-lane">
    <span className="puck" style={{ "--puck-ease": "var(--ease-spring-gentle)" }}>Gentle</span>
  </div>
</div>

/* css: .puck { position: absolute; left: 0; top: 50%; animation:
   puck-run 900ms var(--puck-ease) both; }
   @keyframes puck-run { from { transform: translate3d(0, -50%, 0); }
   to { transform: translate3d(calc(100cqw - 100%), -50%, 0); } }
   Transform-only (the e1 treaty) — the container-query length unit
   cqw measures the track, the % measures the puck. */`,
  },
  MorphDrawer: {
    set: "08",
    componentName: "The morphing drawer (grid-rows)",
    jsx: `// 4.0.0 — the TRUE height expansion: grid-template-rows 0fr → 1fr
// on the gentle spring. No max-height hack, no JS measurement — the
// inner clips through overflow: hidden while the row glides.
const [open, setOpen] = useState(false);
<button aria-expanded={open} onClick={() => setOpen(!open)}>…</button>
<div className={open ? "morph is-open" : "morph"}>
  <div className="morph__inner">…</div>
</div>

/* css: .morph { display: grid; grid-template-rows: 0fr; transition:
   grid-template-rows 320ms var(--ease-spring-gentle); }
   .morph.is-open { grid-template-rows: 1fr; }
   .morph__inner { overflow: hidden; min-height: 0; }
   Reduced motion: transition none (the state still flips). */`,
  },
  TelemetrySweep: {
    set: "08",
    componentName: "The telemetry sweep (three instruments, one trigger)",
    jsx: `import { useState } from "react";
import { AnimatedNumber, AreaChart, StatRing } from "@carcolacha/signature-style/react";

// 4.0.0 — ONE trigger, THREE instruments: the number ROLLS (rAF
// spring), the ring's arc JUMPS (stroke-dashoffset transition), and
// the chart RE-DRAWS its path sweep (the key remount replays the
// pathLength dash draw from zero).
const [value, setValue] = useState(1280);
const [spike, setSpike] = useState(0);
<button onClick={() => { setValue(1840); setSpike((s) => s + 1); }}>
  Simulate Spike
</button>
<AnimatedNumber value={value} />
<StatRing value={64} size="md" colorToken="--sig-mint" label="Momentum" />
<div key={spike}>
  <AreaChart points={series} colorToken="--sig-cyan" label="Stream" />
</div>

/* Deterministic roster: keep the spike values in a fixed array — the
   same presses produce the same choreography (no Math.random). */`,
  },
};
