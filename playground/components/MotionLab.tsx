/**
 * MotionLab — THE MOTION LAB view (3.7.0 "The Intelligent Kinetic
 * Engine"; 3.9.0 the per-card Play redesign; 4.0.0 THE WIPE & REBUILD
 * — "every Play/Trigger button produces an immediate vivid animation").
 *
 * THE 4.0.0 CONTRACT — six PatternFrames, every one of them answering
 * its Play/Trigger control with motion you can SEE from the cheap
 * seats:
 *
 *   01 · Aurora Border Beam & 3D Tilt   — the @property conic beam +
 *       the cursor-tracked 3D tilt + the KineticSurface sheen trio.
 *       Play = force the "always" beam state for a beat (no hover
 *       needed) and pulse the sheen grid.
 *   02 · Staggered Bento Wave           — Play bumps a React KEY on a
 *       six-card colorful --sig-* grid; the remount re-runs a CSS
 *       @keyframes cascade from opacity 0 / translate3d(0,24px,0) /
 *       scale(0.94) with 60ms stagger delays (key-remount per owner).
 *   03 · Tactile Spring Detents         — Trigger Spring launches TWO
 *       weighted pucks (labeled chips) across a track, left → right,
 *       the left on --ease-spring-snappy, the right on
 *       --ease-spring-gentle — the overshoot difference crystal-clear.
 *       The key bump resets both pucks to start, then animates.
 *   04 · FLIP Gliding Pill & Morphing Drawer — the package Tabs'
 *       FLIP indicator (re-inked --sig-cyan in the lab) glides between
 *       tabs; the drawer opens/closes on the TASK 1 grid-rows
 *       technique (0fr → 1fr, 320ms × --ease-spring-gentle).
 *   05 · Kinetic Equalizer & Pulse Beacons — the toggle starts/stops
 *       three multi-color WaveformBars rows + a concentric sonar set
 *       (rings scaling + fading in sequence, one --sig-* per ring).
 *   06 · Live Telemetry Sweep & Rolling Numbers — "Simulate Spike"
 *       simultaneously rolls an <AnimatedNumber>, jumps a 128px
 *       <StatRing> (the "md" enum diameter), and re-mounts an
 *       <AreaChart> so the SVG path sweep (pathLength dash) replays.
 *
 * THE CONTROL BAR (kept): the sticky glass strip — Speed (1.0× /
 * 0.25× Slow-Mo on the --sig-motion-scale dial, scoped to this root),
 * Replay All (the global remount key), Reduced Motion Preview
 * ([data-sig-motion="reduced"] root override), the live readout.
 * Every showcase rides --dur-*/--ease-* tokens, so Slow-Mo dilates
 * the whole lab and the reduced preview collapses it.
 *
 * Domain-neutral by the purity doctrine: the telemetry numbers speak
 * ratings and samples — no network, no keys, fully deterministic
 * sequences (the spike roster is a fixed array).
 */
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  AnimatedNumber,
  AreaChart,
  Button,
  StatRing,
  Tabs,
  StatusBeacon,
  WaveformBars,
  useToast,
} from "@edwyn/signature-style/react";
import {
  AuroraBorderCard,
  KineticSurface,
  TiltSurface,
} from "@edwyn/signature-style/react";
import { PatternFrame } from "./PatternFrame.js";
import { MOTION_SNIPPETS } from "../motion-snippets.js";
import { SET_NAMES } from "../snippets.js";

/** The six frame ids — the Play registry + the testids key on these. */
const FRAME_IDS = ["01", "02", "03", "04", "05", "06"] as const;
type FrameId = (typeof FRAME_IDS)[number];

/** One per-frame Play button — bumps THAT frame's remount key. */
function PlayEffectButton({ frame, label, onPlay }: { frame: FrameId; label: string; onPlay: (frame: FrameId) => void }): ReactNode {
  return (
    <Button
      size="sm"
      variant="secondary"
      leftIcon="Play"
      data-testid={`motion-play-${frame}`}
      onClick={() => onPlay(frame)}
    >
      {label}
    </Button>
  );
}

/** The stagger wave's six tiles — token-tinted, content-labeled. */
const WAVE_TILES: Array<{ label: string; token: string; glyph: string }> = [
  { label: "Signal", token: "--sig-cyan", glyph: "◆" },
  { label: "Flux", token: "--sig-violet-glow", glyph: "▲" },
  { label: "Pulse", token: "--sig-rose-glow", glyph: "●" },
  { label: "Grow", token: "--sig-mint", glyph: "■" },
  { label: "Sunny", token: "--sig-citron", glyph: "★" },
  { label: "Dream", token: "--sig-lavender", glyph: "✦" },
];

/** The sheen trio — accent token + caption (inside the aurora frame). */
const SHEEN_CARDS: Array<{ title: string; copy: string; token: string }> = [
  {
    title: "Cyan sheen",
    copy: "Move the cursor across the card — the 240px sheen tracks it live.",
    token: "--sig-cyan",
  },
  {
    title: "Violet sheen",
    copy: "The position repaints per frame; only the fade is a transition.",
    token: "--sig-violet-glow",
  },
  {
    title: "Rose sheen",
    copy: "Paint stays local to the pseudo-element — layout never reflows.",
    token: "--sig-rose-glow",
  },
];

/** The FLIP tabs' five stops. */
const FLIP_TABS = [
  { id: "overview", label: "Overview" },
  { id: "motion", label: "Motion" },
  { id: "tokens", label: "Tokens" },
  { id: "primitives", label: "Primitives" },
  { id: "lab", label: "Lab" },
];

/** The equalizer's three rows — one --sig-* voice per row. */
const EQ_ROWS: Array<{ label: string; token: string; bars: number }> = [
  { label: "Bass", token: "--sig-cyan", bars: 14 },
  { label: "Mid", token: "--sig-mint", bars: 12 },
  { label: "Air", token: "--sig-orchid", bars: 10 },
];

/** The sonar's ring roster — one --sig-* per ring, firing in sequence. */
const SONAR_RINGS: Array<{ token: string; index: number }> = [
  { token: "--sig-cyan", index: 0 },
  { token: "--sig-orchid", index: 1 },
  { token: "--sig-mint", index: 2 },
];

/** The spike roster — fixed, deterministic (no Math.random: the same
    button presses produce the same choreography, the purity doctrine). */
const SPIKE_VALUES = [1840, 2210, 1975, 2560, 2130] as const;
const RATING_SEED = 1280;
const RING_SEED = 24;
const SERIES_SEED: number[] = [128, 132, 129, 136, 141, 138, 145, 149, 144, 152, 158, 154];

/**
 * THE MOTION LAB VIEW.
 */
export function MotionLabView() {
  const toast = useToast();
  // THE TIME DILATION — 1 = real time, 0.25 = Slow-Mo (the springs
  // overshoot visibly). Scoped to THIS root only.
  const [slowMo, setSlowMo] = useState(false);
  // THE PREVIEW MERCY — [data-sig-motion="reduced"] on the root.
  const [reducedPreview, setReducedPreview] = useState(false);
  // THE REPLAY — remount key: every showcase re-arms at once.
  const [replayKey, setReplayKey] = useState(0);
  // THE PER-CARD PLAY registry: each frame remounts alone.
  const [playKeys, setPlayKeys] = useState<Record<FrameId, number>>({
    "01": 0, "02": 0, "03": 0, "04": 0, "05": 0, "06": 0,
  });
  const play = useCallback((frame: FrameId) => {
    setPlayKeys((current) => ({ ...current, [frame]: current[frame] + 1 }));
  }, []);

  // Showcase 01 — the Play-pushed "always" beam (a 3.2s beat, then the
  // hover trigger returns). The timer never outlives the view.
  const [beamForced, setBeamForced] = useState(false);
  const beamTimer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (beamTimer.current !== null) window.clearTimeout(beamTimer.current);
    },
    [],
  );
  const playBeam = useCallback(() => {
    play("01");
    setBeamForced(true);
    if (beamTimer.current !== null) window.clearTimeout(beamTimer.current);
    beamTimer.current = window.setTimeout(() => {
      setBeamForced(false);
      beamTimer.current = null;
    }, 3200);
  }, [play]);

  // Showcase 04 — the FLIP tabs + the morphing drawer (grid-rows).
  const [flipTab, setFlipTab] = useState("overview");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Showcase 05 — the equalizer + sonar toggle.
  const [eqActive, setEqActive] = useState(true);

  // Showcase 06 — the telemetry sweep state (deterministic roster).
  const [rating, setRating] = useState(RATING_SEED);
  const [ringPct, setRingPct] = useState(RING_SEED);
  const [series, setSeries] = useState<number[]>(SERIES_SEED);
  const [spikeIndex, setSpikeIndex] = useState(-1);
  const simulateSpike = useCallback(() => {
    const nextIndex = (spikeIndex + 1) % SPIKE_VALUES.length;
    const value = SPIKE_VALUES[nextIndex];
    setSpikeIndex(nextIndex);
    setRating(value);
    setRingPct(Math.min(100, RING_SEED + (nextIndex + 1) * 16));
    setSeries((current) => [...current.slice(1), Math.round(value / 12)]);
    // The chart wrapper's key bump re-mounts the AreaChart — its
    // mount sweep (pathLength dash draw) replays from zero.
    play("06");
  }, [spikeIndex, play]);

  return (
    <div
      className="motion-lab"
      data-testid="motion-lab"
      style={{ "--sig-motion-scale": slowMo ? 0.25 : 1 } as CSSProperties}
      {...(reducedPreview ? { "data-sig-motion": "reduced" } : {})}
    >
      {/* THE STICKY GLASS CONTROL BAR — z-sticky, below the navbar. */}
      <div className="motion-lab__bar" role="group" aria-label="Motion Lab controls" data-testid="motion-bar">
        <div className="motion-lab__seg" role="group" aria-label="Speed multiplier">
          <span className="motion-lab__seg-label">Speed</span>
          <button
            type="button"
            className="motion-lab__seg-btn"
            aria-pressed={!slowMo}
            data-testid="motion-speed-normal"
            onClick={() => setSlowMo(false)}
          >
            1.0×
          </button>
          <button
            type="button"
            className="motion-lab__seg-btn"
            aria-pressed={slowMo}
            data-testid="motion-speed-slow"
            onClick={() => setSlowMo(true)}
          >
            0.25× Slow-Mo
          </button>
        </div>
        <Button
          size="sm"
          variant="secondary"
          leftIcon="RotateCcw"
          data-testid="motion-replay"
          onClick={() => setReplayKey((key) => key + 1)}
        >
          Replay All
        </Button>
        <button
          type="button"
          className="motion-lab__seg-btn"
          aria-pressed={reducedPreview}
          data-testid="motion-reduced"
          onClick={() => setReducedPreview((current) => !current)}
        >
          Reduced Motion Preview {reducedPreview ? "· ON" : "· OFF"}
        </button>
        <span className="motion-lab__bar-readout" data-testid="motion-readout" aria-live="polite">
          scale {slowMo ? "0.25" : "1"} · {reducedPreview ? "reduced" : "full"} motion
        </span>
      </div>

      <p className="motion-lab__note">
        Set 08 · the kinetic engine on stage — six showcases, every
        Play/Trigger button fires an immediate vivid animation, and the
        control bar dilates or collapses ALL of it.
      </p>

      {/* THE REPLAY SCOPE — everything inside remounts on Replay All. */}
      <div key={replayKey} className="motion-lab__stream" data-testid="motion-stream">
        {/* 01 — AURORA BORDER BEAM & 3D TILT (kept, Play pushes the beam) */}
        <PatternFrame
          setId="08"
          setName={SET_NAMES["08"]}
          componentName="Aurora Border Beam & 3D Tilt"
          snippet={MOTION_SNIPPETS.AuroraBorderCard}
          note="A conic light beam (cyan → orchid → mint → cobalt) rotates around the card's 2px border — a registered CSS angle, never a box-shadow — while the right card tilts in 3D under the cursor. Press Play to force the always-on beam beat."
        >
          <div className="motion-lab__frame-tools" data-testid="motion-tools-01">
            <PlayEffectButton frame="01" label="Play Beam" onPlay={playBeam} />
          </div>
          <div key={playKeys["01"]} data-testid="motion-aurora">
            <div className="motion-lab__aurora-grid">
              <AuroraBorderCard trigger={beamForced ? "always" : "hover"}>
                <div className="motion-lab__aurora-inner" data-testid="motion-aurora-card">
                  <StatusBeacon status="beam-live" colorToken="--sig-cyan" label="Aurora beam demo" />
                  <h4>Aurora beam</h4>
                  <p>{beamForced ? "PLAY pushed the always-on state — the beam spins without hover for one beat." : "Hover me — or press Play Beam to force the spin."}</p>
                </div>
              </AuroraBorderCard>
              <TiltSurface tilt={6} accentToken="--sig-rose-glow" className="motion-lab__tilt">
                <div className="motion-lab__aurora-inner" data-testid="motion-tilt-card">
                  <h4>3D tilt</h4>
                  <p>±6° of perspective tilt tracking the pointer, plus the chromatic sheen. Reduced motion pins it flat.</p>
                </div>
              </TiltSurface>
              <div className="motion-lab__sheen-grid" data-testid="motion-sheen">
                {SHEEN_CARDS.map((card) => (
                  <KineticSurface key={card.title} accentToken={card.token} className="motion-lab__sheen-card">
                    <h4>{card.title}</h4>
                    <p>{card.copy}</p>
                  </KineticSurface>
                ))}
              </div>
            </div>
          </div>
        </PatternFrame>

        {/* 02 — STAGGERED BENTO WAVE (key-remounted CSS cascade) */}
        <PatternFrame
          setId="08"
          setName={SET_NAMES["08"]}
          componentName="Staggered Bento Wave"
          snippet={MOTION_SNIPPETS.StaggerWave}
          note="Six colorful cards cascade in from below with a 60ms diagonal stagger — Play bumps a React key, the remount re-runs the @keyframes wave from opacity 0 · translate3d(0,24px,0) · scale(0.94). Pure CSS animation, zero dependencies."
        >
          <div className="motion-lab__frame-tools" data-testid="motion-tools-02">
            <PlayEffectButton frame="02" label="Play Wave" onPlay={play} />
          </div>
          <div key={playKeys["02"]} data-testid="motion-stagger">
            <div className="motion-lab__wave-grid">
              {WAVE_TILES.map((tile, index) => (
                <div
                  key={tile.label}
                  className="sig-lab-wave"
                  style={{
                    "--wave-i": String(index),
                    "--wave-tint": `var(${tile.token})`,
                  } as CSSProperties}
                >
                  <span className="motion-lab__tile-chip" style={{ background: `color-mix(in srgb, var(${tile.token}) 18%, transparent)`, color: `var(${tile.token})` }}>
                    {tile.glyph}
                  </span>
                  {tile.label}
                </div>
              ))}
            </div>
          </div>
        </PatternFrame>

        {/* 03 — TACTILE SPRING DETENTS (the two-puck race) */}
        <PatternFrame
          setId="08"
          setName={SET_NAMES["08"]}
          componentName="Tactile Spring Detents"
          snippet={MOTION_SNIPPETS.SpringPucks}
          note="Two weighted pucks race left → right on the SAME duration: the cyan puck rides --ease-spring-snappy (fast, hard overshoot), the orchid puck rides --ease-spring-gentle (slow, harmonic). Trigger Spring resets both to start, then launches them — watch the finishes differ."
        >
          <div className="motion-lab__frame-tools" data-testid="motion-tools-03">
            <PlayEffectButton frame="03" label="Trigger Spring" onPlay={play} />
          </div>
          <div key={playKeys["03"]} data-testid="motion-detents">
            <div className="sig-lab-track" data-testid="motion-pucks">
              <div className="sig-lab-track__lane">
                <span
                  className="sig-lab-puck"
                  style={{
                    "--puck-ease": "var(--ease-spring-snappy, cubic-bezier(0.34, 1.56, 0.64, 1))",
                    "--puck-ink": "var(--sig-cyan)",
                  } as CSSProperties}
                >
                  Snappy
                </span>
              </div>
              <div className="sig-lab-track__lane">
                <span
                  className="sig-lab-puck"
                  style={{
                    "--puck-ease": "var(--ease-spring-gentle, cubic-bezier(0.25, 1.25, 0.45, 1))",
                    "--puck-ink": "var(--sig-orchid)",
                  } as CSSProperties}
                >
                  Gentle
                </span>
              </div>
            </div>
            <p className="motion-lab__flip-copy">
              Same 900ms, two springs — the overshoot IS the personality.
            </p>
          </div>
        </PatternFrame>

        {/* 04 — FLIP GLIDING PILL & MORPHING DRAWER */}
        <PatternFrame
          setId="08"
          setName={SET_NAMES["08"]}
          componentName="FLIP Gliding Pill & Morphing Drawer"
          snippet={MOTION_SNIPPETS.MorphDrawer}
          note="The cyan highlight pill is ONE shared element gliding between tabs (the FLIP measure → invert → play technique, re-inked --sig-cyan in the lab). Below, the drawer opens on the grid-rows technique — grid-template-rows 0fr → 1fr on the gentle spring, no max-height hack."
        >
          <div className="motion-lab__frame-tools" data-testid="motion-tools-04">
            <PlayEffectButton frame="04" label="Replay Frame" onPlay={play} />
          </div>
          <div key={playKeys["04"]} data-testid="motion-flip">
            <div className="motion-lab__flip">
              <Tabs
                label="FLIP gliding pill demo"
                tabs={FLIP_TABS}
                activeId={flipTab}
                onChange={setFlipTab}
              />
              <p className="motion-lab__flip-copy">
                Watch the cyan pill glide to <strong>{flipTab}</strong>.
              </p>
              <div className="motion-lab__drawer-row">
                <Button
                  size="sm"
                  variant={drawerOpen ? "secondary" : "primary"}
                  aria-expanded={drawerOpen}
                  data-testid="motion-drawer-toggle"
                  onClick={() => setDrawerOpen((open) => !open)}
                >
                  {drawerOpen ? "Close the drawer" : "Open the drawer"}
                </Button>
                <div
                  className={drawerOpen ? "sig-lab-morph is-open" : "sig-lab-morph"}
                  data-testid="motion-drawer"
                >
                  <div className="sig-lab-morph__inner">
                    <p>
                      The morphing drawer — grid-template-rows 0fr → 1fr on
                      --ease-spring-gentle (320ms). The TRUE height
                      expansion: the content clips through overflow-hidden
                      while the row glides — filter rows, hint panels,
                      anything that unfolds.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PatternFrame>

        {/* 05 — KINETIC EQUALIZER & PULSE BEACONS */}
        <PatternFrame
          setId="08"
          setName={SET_NAMES["08"]}
          componentName="Kinetic Equalizer & Pulse Beacons"
          snippet={MOTION_SNIPPETS.WaveformBars}
          note="The toggle drives two choreographies at once: three WaveformBars rows (cyan / mint / orchid — the per-bar 90ms spring dance) and a concentric sonar set whose rings scale + fade in sequence, one --sig-* voice per ring. Transform + opacity only — the e1 treaty."
        >
          <div className="motion-lab__frame-tools" data-testid="motion-tools-05">
            <Button
              size="sm"
              variant={eqActive ? "secondary" : "primary"}
              leftIcon={eqActive ? "Pause" : "Play"}
              data-testid="motion-eq-toggle"
              onClick={() => setEqActive((active) => !active)}
            >
              {eqActive ? "Stop the equalizer" : "Start the equalizer"}
            </Button>
          </div>
          <div key={playKeys["05"]} data-testid="motion-equalizer">
            <div className="motion-lab__eq-grid">
              <div className="motion-lab__eq-rows">
                {EQ_ROWS.map((row) => (
                  <div key={row.label} className="motion-lab__eq-row">
                    <span className="motion-lab__metric-label">{row.label}</span>
                    <WaveformBars
                      bars={row.bars}
                      active={eqActive}
                      colorToken={row.token}
                      label={`${row.label} band level`}
                    />
                  </div>
                ))}
              </div>
              <div className="motion-lab__sonar-stage">
                <div
                  className={eqActive ? "sig-lab-sonar is-live" : "sig-lab-sonar"}
                  data-testid="motion-sonar"
                  role="img"
                  aria-label={eqActive ? "Sonar pulse rings active" : "Sonar pulse rings stopped"}
                >
                  {SONAR_RINGS.map((ring) => (
                    <span
                      key={ring.token}
                      className="sig-lab-sonar__ring"
                      style={{
                        "--sonar-color": `var(${ring.token})`,
                        "--sonar-i": String(ring.index),
                      } as CSSProperties}
                    />
                  ))}
                  <span className="sig-lab-sonar__core" />
                </div>
                <span className="motion-lab__metric-label">
                  {eqActive ? "pulsing" : "stopped"}
                </span>
              </div>
            </div>
          </div>
        </PatternFrame>

        {/* 06 — LIVE TELEMETRY SWEEP & ROLLING NUMBERS */}
        <PatternFrame
          setId="08"
          setName={SET_NAMES["08"]}
          componentName="Live Telemetry Sweep & Rolling Numbers"
          snippet={MOTION_SNIPPETS.TelemetrySweep}
          note="One button, three instruments at once: the tabular number ROLLS to the spiked rating (rAF spring), the 128px ring's arc jumps to the new ratio (stroke-dashoffset), and the SVG chart RE-DRAWS its path sweep (the key remount replays the pathLength dash draw). The spike roster is fixed and deterministic."
        >
          <div className="motion-lab__frame-tools" data-testid="motion-tools-06">
            <Button
              size="sm"
              variant="primary"
              leftIcon="Zap"
              data-testid="motion-spike"
              onClick={simulateSpike}
            >
              Simulate Spike
            </Button>
          </div>
          <div key={playKeys["06"]} data-testid="motion-telemetry">
            <div className="motion-lab__sweep-grid" data-testid="motion-sweep">
              <div className="motion-lab__metric">
                <span className="motion-lab__metric-label">Rating</span>
                <span className="motion-lab__metric-value motion-lab__metric-value--xl">
                  <AnimatedNumber value={rating} />
                </span>
                <span className="motion-lab__metric-note">
                  {spikeIndex === -1 ? "baseline — press Simulate Spike" : `spike #${spikeIndex + 1} of ${SPIKE_VALUES.length}`}
                </span>
              </div>
              <div className="motion-lab__metric">
                <span className="motion-lab__metric-label">Momentum</span>
                <StatRing
                  value={ringPct}
                  colorToken="--sig-mint"
                  label="Momentum ratio"
                  size="md"
                  strokeWidth={8}
                />
              </div>
              <div className="motion-lab__metric motion-lab__metric--wide">
                <span className="motion-lab__metric-label">Rating stream — the sweep re-draws on every spike</span>
                {/* THE KEY-REMOUNT SWEEP: the AreaChart's polyline draws
                    once on mount (pathLength dash); bumping the key
                    replays the draw. */}
                <div key={spikeIndex} className="motion-lab__sweep-chart">
                  <AreaChart
                    points={series.map((value, index) => ({ label: String(index), value }))}
                    colorToken="--sig-cyan"
                    label="Rating stream"
                    height={160}
                  />
                </div>
              </div>
            </div>
          </div>
        </PatternFrame>
      </div>
    </div>
  );
}
