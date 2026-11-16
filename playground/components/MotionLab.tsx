/**
 * MotionLab — THE MOTION LAB view (3.7.0 "The Intelligent Kinetic
 * Engine, Motion Lab & Live Data Choreography"; 3.9.0 the REDESIGN —
 * the owner's defect #4: "static/cryptic — entrances fire on load
 * before scroll; no explanations; no per-card trigger").
 *
 * THE 3.9.0 CONTRACT — every one of the SIX PatternFrames carries:
 *   (a) a plain-English explanation line (the PatternFrame `note` —
 *       WHAT the pattern does and WHEN to reach for it);
 *   (b) a per-card "Play Effect" button (data-testid motion-play-NN)
 *       that bumps that frame's local remount key — the entrance
 *       re-arms and replays IN PLACE, without touching the others;
 *   (c) an IntersectionObserver auto-trigger — the demo subtree rides
 *       MotionReveal, so entrances fire when the frame SCROLLS into
 *       view (threshold 0.15), never all-at-once on load. Off-screen
 *       frames hold their hidden half until visited.
 *
 * THE CONTROL BAR (kept from 3.7.0): the sticky glass strip — Speed
 * (1.0× / 0.25× Slow-Mo, the --sig-motion-scale dial on this root),
 * Replay Choreography (the global remount key), Reduced Motion Preview
 * ([data-sig-motion="reduced"] root override), the live readout.
 *
 * THE SIX FRAMES (all colorful — multi-token chromatic accents):
 *   01 Chromatic Stagger Wave — six token-tinted tiles cascade on the
 *      45ms diagonal wave (MotionReveal staggerIndex). Play replays.
 *   02 Aurora Border Beam & 3D Tilt — the 3.9.0 suite pair: hover the
 *      rotating conic beam (registered --sig-beam-angle, never a
 *      shadow), tilt the 3D surface.
 *   03 Tactile Spring Detents — Snappy vs Gentle (kept from 3.7.0,
 *      rebalanced: the detent cards ride the LAB-ONLY scoped overrides
 *      so Button/ToggleSwitch/RadioCardGroup detents are A/B
 *      comparable; production components keep --transition-*).
 *   04 FLIP Gliding Tabs & Elastic Drawer — the shared gliding
 *      indicator + a small drawer panel opening on --ease-spring-gentle
 *      (transform-only, the e1 treaty).
 *   05 Proportional Rolling Telemetry — the 128px "md" StatRing (the
 *      3.9.0 size enum — the defect #2 fix live), AnimatedNumber and
 *      the 3.9.0 WaveformBars rolling from the slider/buttons.
 *   06 Live Zero-Key Open-Meteo Stream — the FALLBACK-FIRST pattern
 *      kept, restyled colorful: the status beacon, cyan/violet chart
 *      pair, the SkeletonCard loading window.
 *
 * Domain-neutral by the purity doctrine: the telemetry numbers speak
 * budgets, seats and samples — the banned legacy domain never appears,
 * no hardcoded LIVE values (the sample is labeled as a sample).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  Button,
  StatCard,
  StatRing,
  AreaChart,
  SkeletonCard,
  Tabs,
  ToggleSwitch,
  RadioCardGroup,
  useToast,
} from "@edwyn/signature-style/react";
import type { SigTokenName } from "@edwyn/signature-style/react";
import {
  AnimatedNumber,
  MotionReveal,
  KineticSurface,
  AuroraBorderCard,
  TiltSurface,
  StatusBeacon,
  WaveformBars,
} from "@edwyn/signature-style/react";
import { PatternFrame } from "./PatternFrame.js";
import { MOTION_SNIPPETS } from "../motion-snippets.js";
import { SET_NAMES } from "../snippets.js";

/** The zero-auth live stream — El Paso grid coordinates, today, hourly. */
const OPEN_METEO_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=31.76&longitude=-106.48&hourly=temperature_2m,wind_speed_10m&forecast_days=1";

/**
 * THE DETERMINISTIC OFFLINE SAMPLE — the fallback-first contract's
 * opening state. Diurnal-shaped, hand-authored, labeled as a sample in
 * the UI: it exists so the choreography (StatCards, ring, chart) is
 * alive BEFORE any network round-trip and stays alive when the network
 * is not. These are NOT live values and are never presented as such.
 */
const SAMPLE_TEMPS: number[] = [
  8, 7.5, 7, 6.5, 6, 6.5, 7, 9, 11, 13, 15, 16.5,
  18, 18.5, 18, 17, 15.5, 14, 12.5, 11, 10, 9.5, 9, 8.5,
];
const SAMPLE_WIND: number[] = [
  12.4, 11.8, 11.2, 10.6, 10, 9.4, 9, 9.8, 11, 12.6, 14, 15.2,
  16, 16.4, 15.8, 15, 14.2, 13.6, 13, 12.4, 12, 12.2, 12.4, 12.4,
];

/** The four live-stream states (the beacon + the skeleton window). */
type LiveStatus = "fallback" | "loading" | "live" | "error";

/** The beacon's chromatic voice per stream state (content outcomes). */
const STATUS_BEACON_TOKEN: Record<LiveStatus, string> = {
  fallback: "--sig-yellow",
  loading: "--sig-azure",
  live: "--sig-green",
  error: "--sig-crimson",
};

/** What the weather stage renders from — sample or live. */
interface WeatherSeries {
  temps: number[];
  wind: number[];
  /** The "now" slot — 12 (noon) for the deterministic sample, the fetch
   *  hour for the live stream. */
  hourIndex: number;
  label: string;
}

/** The Open-Meteo hourly payload — the two fields the URL requests. */
interface OpenMeteoResponse {
  hourly?: {
    temperature_2m?: Array<number | null>;
    wind_speed_10m?: Array<number | null>;
  };
}

/** Null-safe numeric extraction — a null sample simply drops out. */
function numbers(values: Array<number | null> | undefined): number[] {
  return (values ?? []).filter((v): v is number => typeof v === "number");
}

/** Every 3rd hour, relabeled 00/03/06… — the chart's 8-sample stride. */
function stride(series: number[]): Array<{ label: string; value: number }> {
  const out: Array<{ label: string; value: number }> = [];
  for (let hour = 0; hour < series.length; hour += 3) {
    const value = series[hour];
    if (value !== undefined) {
      out.push({ label: String(hour).padStart(2, "0"), value });
    }
  }
  return out;
}

/** The lab's local detent states (showcase 03). */
interface DetentState {
  snappySwitch: boolean;
  gentleSwitch: boolean;
  snappyPick: string;
  gentlePick: string;
}

/** The rolling telemetry state (showcase 05). */
const TELEMETRY_BUDGET_SEED = 1740;
const TELEMETRY_RATIO_SEED = 63;
const TELEMETRY_SERIES_SEED: number[] = [12, 18, 15, 24, 21, 30, 28, 36];

/** Balanced per-option copy — every detent card explains its stop. */
const DETENT_OPTIONS = [
  { value: "detent-a", label: "Detent A", description: "The first stop — quick and shallow" },
  { value: "detent-b", label: "Detent B", description: "The middle stop — the balanced default" },
  { value: "detent-c", label: "Detent C", description: "The deep stop — the slowest, weightiest" },
];

/** The stagger wave's six tiles — token-tinted, content-labeled. */
const STAGGER_TILES: Array<{ label: string; token: string; glyph: string }> = [
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

/** The six frame ids — the Play registry + the testids key on these. */
const FRAME_IDS = ["01", "02", "03", "04", "05", "06"] as const;
type FrameId = (typeof FRAME_IDS)[number];

/** One per-frame Play button — bumps THAT frame's remount key. */
function PlayEffectButton({ frame, onPlay }: { frame: FrameId; onPlay: (frame: FrameId) => void }): ReactNode {
  return (
    <Button
      size="sm"
      variant="secondary"
      leftIcon="Play"
      data-testid={`motion-play-${frame}`}
      onClick={() => onPlay(frame)}
    >
      Play Effect
    </Button>
  );
}

/**
 * THE MOTION LAB VIEW.
 */
export function MotionLabView() {
  const toast = useToast();
  // THE TIME DIALATION — 1 = real time, 0.25 = Slow-Mo (the springs
  // overshoot visibly). Scoped to THIS root only.
  const [slowMo, setSlowMo] = useState(false);
  // THE PREVIEW MERCY — [data-sig-motion="reduced"] on the root.
  const [reducedPreview, setReducedPreview] = useState(false);
  // THE REPLAY — remount key: every entrance re-arms.
  const [replayKey, setReplayKey] = useState(0);
  // 3.9.0 — THE PER-CARD PLAY registry: each frame remounts alone.
  const [playKeys, setPlayKeys] = useState<Record<FrameId, number>>({
    "01": 0, "02": 0, "03": 0, "04": 0, "05": 0, "06": 0,
  });
  const play = useCallback((frame: FrameId) => {
    setPlayKeys((current) => ({ ...current, [frame]: current[frame] + 1 }));
  }, []);

  // Showcase 03 — the detents.
  const [detents, setDetents] = useState<DetentState>({
    snappySwitch: true,
    gentleSwitch: true,
    snappyPick: "detent-a",
    gentlePick: "detent-a",
  });

  // Showcase 04 — the FLIP tabs + the elastic drawer.
  const [flipTab, setFlipTab] = useState("overview");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Showcase 05 — the rolling telemetry.
  const [budget, setBudget] = useState(TELEMETRY_BUDGET_SEED);
  const [ratio, setRatio] = useState(TELEMETRY_RATIO_SEED);
  const [series, setSeries] = useState<number[]>(TELEMETRY_SERIES_SEED);

  // Showcase 06 — the live stream (fallback-first).
  const [weather, setWeather] = useState<WeatherSeries>({
    temps: SAMPLE_TEMPS,
    wind: SAMPLE_WIND,
    hourIndex: 12,
    label: "Deterministic offline sample",
  });
  const [liveStatus, setLiveStatus] = useState<LiveStatus>("fallback");
  const controllerRef = useRef<AbortController | null>(null);

  const loadLive = useCallback(
    (manual: boolean) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setLiveStatus("loading");
      fetch(OPEN_METEO_URL, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json() as Promise<OpenMeteoResponse>;
        })
        .then((json) => {
          if (controller.signal.aborted) return;
          const temps = numbers(json.hourly?.temperature_2m);
          const wind = numbers(json.hourly?.wind_speed_10m);
          if (temps.length < 2 || wind.length < 2) {
            throw new Error("payload missing hourly series");
          }
          setWeather({
            temps,
            wind,
            hourIndex: Math.min(new Date().getHours(), temps.length - 1),
            label: "Live · Open-Meteo",
          });
          setLiveStatus("live");
          if (manual) {
            toast("success", "Live stream connected — the sample stepped aside.");
          }
        })
        .catch((err: unknown) => {
          const aborted =
            (err instanceof DOMException && err.name === "AbortError") ||
            (err instanceof Error && err.name === "AbortError");
          if (aborted) return;
          // THE FALLBACK RETAINED — the sample stays on stage.
          setLiveStatus("error");
          if (manual) {
            toast("error", "Open-Meteo unreachable — the offline sample keeps the stage.");
          }
        });
    },
    [toast],
  );

  // The auto-mount fetch; the AbortController fires on unmount.
  useEffect(() => {
    loadLive(false);
    return () => controllerRef.current?.abort();
  }, [loadLive]);

  const currentTemp = weather.temps[weather.hourIndex] ?? weather.temps[0] ?? 0;
  const currentWind = weather.wind[weather.hourIndex] ?? weather.wind[0] ?? 0;

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
          Replay Choreography
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
        Set 08 · the kinetic engine on stage — every frame explains
        itself, carries its own Play Effect button, and its entrance
        fires when YOU scroll it into view.
      </p>

      {/* THE REPLAY SCOPE — everything inside remounts on Replay. */}
      <div key={replayKey} className="motion-lab__stream" data-testid="motion-stream">
        {/* 01 — CHROMATIC STAGGER WAVE */}
        <PatternFrame
          setId="08"
          setName={SET_NAMES["08"]}
          componentName="Chromatic Stagger Wave"
          snippet={MOTION_SNIPPETS.MotionReveal}
          note="Six token-tinted tiles cascade in with the 45ms diagonal wave — reach for MotionReveal staggerIndex whenever a group should land as a wave, and scroll this frame into view to see the entrance fire."
        >
          <div className="motion-lab__frame-tools" data-testid="motion-tools-01">
            <PlayEffectButton frame="01" onPlay={play} />
          </div>
          <div key={playKeys["01"]} data-testid="motion-stagger">
            <MotionReveal variant="fade-up">
              <div className="motion-lab__stagger">
                {STAGGER_TILES.map((tile, index) => (
                  <MotionReveal key={tile.label} variant="fade-up" staggerIndex={index}>
                    <div
                      className="motion-lab__tile"
                      style={{
                        borderColor: `color-mix(in srgb, var(${tile.token}) 45%, transparent)`,
                      }}
                    >
                      <span
                        className="motion-lab__tile-chip"
                        style={{ background: `color-mix(in srgb, var(${tile.token}) 18%, transparent)`, color: `var(${tile.token})` }}
                      >
                        {tile.glyph}
                      </span>
                      {tile.label}
                    </div>
                  </MotionReveal>
                ))}
              </div>
            </MotionReveal>
          </div>
        </PatternFrame>

        {/* 02 — AURORA BORDER BEAM & 3D TILT */}
        <PatternFrame
          setId="08"
          setName={SET_NAMES["08"]}
          componentName="Aurora Border Beam & 3D Tilt"
          snippet={MOTION_SNIPPETS.AuroraBorderCard}
          note="Hover the left card: a conic light beam (cyan → orchid → mint → cobalt) rotates around its 2px border — a registered CSS angle, never a box-shadow. Hover the right card: it tilts in 3D with the cursor. Use them to make a hero card feel alive."
        >
          <div className="motion-lab__frame-tools" data-testid="motion-tools-02">
            <PlayEffectButton frame="02" onPlay={play} />
          </div>
          <div key={playKeys["02"]} data-testid="motion-aurora">
            <MotionReveal variant="scale-in">
              <div className="motion-lab__aurora-grid">
                <AuroraBorderCard trigger="hover">
                  <div className="motion-lab__aurora-inner" data-testid="motion-aurora-card">
                    <StatusBeacon status="beam-live" colorToken="--sig-cyan" label="Aurora beam hovering demo" />
                    <h4>Aurora beam</h4>
                    <p>Hover me — the four-token light cycles the border. Reduced motion holds it as a static ring.</p>
                  </div>
                </AuroraBorderCard>
                <TiltSurface tilt={6} accentToken="--sig-rose-glow" className="motion-lab__tilt">
                  <div className="motion-lab__aurora-inner" data-testid="motion-tilt-card">
                    <h4>3D tilt</h4>
                    <p>±6° of perspective tilt tracking the pointer, plus the chromatic sheen. Reduced motion pins it flat.</p>
                  </div>
                </TiltSurface>
                <AuroraBorderCard trigger="always" accentTokens={["--sig-magenta", "--sig-tangerine", "--sig-neon-green", "--sig-azure"]}>
                  <div className="motion-lab__aurora-inner">
                    <h4>Always-on beam</h4>
                    <p>A different four-token cycle, spinning without hover — for exactly one hero card, not ten.</p>
                  </div>
                </AuroraBorderCard>
                <div className="motion-lab__sheen-grid" data-testid="motion-sheen">
                  {SHEEN_CARDS.map((card) => (
                    <KineticSurface key={card.title} accentToken={card.token} className="motion-lab__sheen-card">
                      <h4>{card.title}</h4>
                      <p>{card.copy}</p>
                    </KineticSurface>
                  ))}
                </div>
              </div>
            </MotionReveal>
          </div>
        </PatternFrame>

        {/* 03 — TACTILE SPRING DETENTS */}
        <PatternFrame
          setId="08"
          setName={SET_NAMES["08"]}
          componentName="Tactile Spring Detents"
          snippet={MOTION_SNIPPETS.KineticTokens}
          note="The SAME controls ride two springs: Snappy (fast, overshooting) vs Gentle (slow, harmonic). Press the buttons, flip the switches, pick the detents — use Snappy for small controls, Gentle for larger surfaces. (The retune is lab-only; production keeps --transition-*.)"
        >
          <div className="motion-lab__frame-tools" data-testid="motion-tools-03">
            <PlayEffectButton frame="03" onPlay={play} />
          </div>
          <div key={playKeys["03"]} data-testid="motion-detents">
            <MotionReveal variant="fade-up">
              <div className="motion-lab__detents">
                <div className="motion-lab__detent" data-detent="snappy">
                  <h4>Snappy — --ease-spring-snappy</h4>
                  <ToggleSwitch
                    checked={detents.snappySwitch}
                    onToggle={(next) => setDetents((d) => ({ ...d, snappySwitch: next }))}
                    label="Snappy switch"
                  />
                  <RadioCardGroup
                    name="snappy-detent"
                    label="Snappy radio cards"
                    value={detents.snappyPick}
                    onChange={(pick) => setDetents((d) => ({ ...d, snappyPick: pick }))}
                    options={DETENT_OPTIONS}
                  />
                </div>
                <div className="motion-lab__detent" data-detent="gentle">
                  <h4>Gentle — --ease-spring-gentle</h4>
                  <ToggleSwitch
                    checked={detents.gentleSwitch}
                    onToggle={(next) => setDetents((d) => ({ ...d, gentleSwitch: next }))}
                    label="Gentle switch"
                  />
                  <RadioCardGroup
                    name="gentle-detent"
                    label="Gentle radio cards"
                    value={detents.gentlePick}
                    onChange={(pick) => setDetents((d) => ({ ...d, gentlePick: pick }))}
                    options={DETENT_OPTIONS}
                  />
                </div>
              </div>
            </MotionReveal>
          </div>
        </PatternFrame>

        {/* 04 — FLIP GLIDING TABS & ELASTIC DRAWER */}
        <PatternFrame
          setId="08"
          setName={SET_NAMES["08"]}
          componentName="FLIP Gliding Tabs & Elastic Drawer"
          snippet={MOTION_SNIPPETS.MotionLabTimeDilation}
          note="The underline is ONE shared element gliding between tabs (measure → invert → play) — never teleporting. Below, the drawer opens on --ease-spring-gentle: one scaleY transform, elastic and honest. Use the FLIP indicator on any tab bar; the drawer for filters and small panels."
        >
          <div className="motion-lab__frame-tools" data-testid="motion-tools-04">
            <PlayEffectButton frame="04" onPlay={play} />
          </div>
          <div key={playKeys["04"]} data-testid="motion-flip">
            <MotionReveal variant="fade-up">
              <Tabs
                label="FLIP gliding indicator demo"
                tabs={FLIP_TABS}
                activeId={flipTab}
                onChange={setFlipTab}
              />
              <p className="motion-lab__flip-copy">
                Watch the underline glide to <strong>{flipTab}</strong>.
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
                  className={drawerOpen ? "motion-lab__drawer is-open" : "motion-lab__drawer"}
                  data-testid="motion-drawer"
                  aria-hidden={!drawerOpen}
                >
                  <p>
                    The elastic drawer — ONE scaleY transform on
                    --ease-spring-gentle. Filter rows, legacy panels,
                    anything that unfolds from its top edge.
                  </p>
                </div>
              </div>
            </MotionReveal>
          </div>
        </PatternFrame>

        {/* 05 — PROPORTIONAL ROLLING TELEMETRY */}
        <PatternFrame
          setId="08"
          setName={SET_NAMES["08"]}
          componentName="Proportional Rolling Telemetry"
          snippet={MOTION_SNIPPETS.AnimatedNumber}
          note="Every value here ROLLS on the spring tokens: the 128px ring (size md — the 3.9.0 enum, exactly 128×128 forever), the tabular AnimatedNumber, and the WaveformBars equalizer. Drag the slider and press the buttons — numbers travel, they never jump."
        >
          <div className="motion-lab__frame-tools" data-testid="motion-tools-05">
            <PlayEffectButton frame="05" onPlay={play} />
          </div>
          <div key={playKeys["05"]} data-testid="motion-telemetry">
            <MotionReveal variant="fade-up">
              <div className="motion-lab__telemetry">
                <div className="motion-lab__telemetry-row">
                  <div className="motion-lab__metric">
                    <span className="motion-lab__metric-label">Deployed budget</span>
                    <span className="motion-lab__metric-value motion-lab__metric-value--xl">
                      <AnimatedNumber value={budget} prefix="$" />
                    </span>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => setBudget((b) => b + 120)}>
                    + $120
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setBudget((b) => Math.max(0, b - 120))}>
                    − $120
                  </Button>
                </div>
                <div className="motion-lab__telemetry-row">
                  <label className="motion-lab__range">
                    Fill ratio
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={ratio}
                      aria-label="Fill ratio percent"
                      data-testid="motion-range"
                      onChange={(event) => setRatio(Number(event.target.value))}
                    />
                  </label>
                  <span className="motion-lab__metric-value">
                    <AnimatedNumber value={ratio} suffix="%" />
                  </span>
                  <StatRing
                    value={ratio}
                    colorToken="--sig-cyan"
                    label="Fill ratio"
                    size="md"
                    strokeWidth={8}
                  />
                </div>
                <div className="motion-lab__telemetry-row">
                  <span className="motion-lab__metric-label">Sample stream</span>
                  <WaveformBars
                    data={series}
                    colorToken="--sig-mint"
                    label="Sample stream level"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      setSeries((current) => {
                        const last = current[current.length - 1] ?? 0;
                        const next = Math.max(0, Math.round(last + (Math.random() * 16 - 8)));
                        return [...current.slice(-11), next];
                      })
                    }
                  >
                    Push sample
                  </Button>
                </div>
              </div>
            </MotionReveal>
          </div>
        </PatternFrame>

        {/* 06 — LIVE ZERO-KEY API CHOREOGRAPHY (OPEN-METEO) */}
        <PatternFrame
          setId="08"
          setName={SET_NAMES["08"]}
          componentName="Live Zero-Key API Choreography"
          snippet={MOTION_SNIPPETS.FallbackFirstData}
          note="Fallback-first: the labeled offline sample renders FIRST, the zero-key Open-Meteo stream fetches on mount and swaps in on success — the skeleton marks the loading window and the beacon speaks the state. Failure keeps the sample (quiet on auto, loud on manual refetch)."
        >
          <div className="motion-lab__frame-tools" data-testid="motion-tools-06">
            <PlayEffectButton frame="06" onPlay={play} />
          </div>
          <div key={playKeys["06"]} data-testid="motion-weather">
            {/* scale-in, NOT clip-reveal: Chrome's IntersectionObserver
                applies the element's own clip-path to the intersection,
                and clip-reveal's inset(0 0 100% 0) is a ZERO-AREA clip —
                the observer would never fire. The suite's lesson: IO
                triggers ride opacity+transform variants only. */}
            <MotionReveal variant="scale-in">
              <div className="motion-lab__weather-status">
                <span className="motion-lab__chip" data-status={liveStatus} data-testid="motion-weather-chip">
                  <StatusBeacon
                    status={liveStatus}
                    colorToken={STATUS_BEACON_TOKEN[liveStatus]}
                    label={`Stream status: ${weather.label}`}
                  />
                  {weather.label}
                </span>
                {liveStatus === "loading" ? (
                  <SkeletonCard />
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    leftIcon="RefreshCw"
                    data-testid="motion-refetch"
                    onClick={() => loadLive(true)}
                  >
                    Refetch Live Stream
                  </Button>
                )}
              </div>
              <div className="motion-lab__weather-cards">
                <div className="motion-lab__metric">
                  <span className="motion-lab__metric-label">Temperature now</span>
                  <span className="motion-lab__metric-value motion-lab__metric-value--xl">
                    <AnimatedNumber value={currentTemp} suffix=" °C" decimals={1} />
                  </span>
                </div>
                <StatCard
                  label="Wind speed now"
                  value={`${currentWind.toFixed(1)} km/h`}
                  delta={liveStatus === "live" ? "live" : "sample"}
                  sparklineData={weather.wind.slice(0, 12)}
                  colorToken="--sig-violet-glow"
                />
              </div>
              <AreaChart
                points={stride(weather.temps)}
                colorToken="--sig-cyan"
                label="Today's hourly temperature"
                height={160}
              />
              <AreaChart
                points={stride(weather.wind)}
                colorToken="--sig-violet-glow"
                label="Today's hourly wind speed"
                height={160}
              />
            </MotionReveal>
          </div>
        </PatternFrame>
      </div>
    </div>
  );
}
