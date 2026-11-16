/**
 * MotionLab — THE MOTION LAB view (3.7.0 "The Intelligent Kinetic
 * Engine, Motion Lab & Live Data Choreography").
 *
 * The kinetic engine's proving ground: a sticky glass control bar
 * (time dilation, replay, the reduced-motion preview) over SIX
 * showcases, each mounted in a <PatternFrame> with its Copy Card
 * payload from the MOTION_SNIPPETS registry (Set 08 · Motion &
 * Kinetics — the studio stream stays the 7 canon sets).
 *
 * THE CONTROL BAR (z-sticky, below the navbar's --z-nav):
 *   · Speed Multiplier — segmented 1.0× / 0.25× (Slow-Mo). Slow-Mo sets
 *     --sig-motion-scale: 0.25 on the LAB ROOT only — every kinetic
 *     duration inside is calc(scale × Nms), so the springs visibly
 *     overshoot. Outside the lab, the world runs at 1.
 *   · Replay Choreography — bumps a remount key: every MotionReveal
 *     re-arms its IntersectionObserver entrance and every sparkline
 *     re-sweeps (remount = the replay contract).
 *   · Reduced Motion Preview — the [data-sig-motion="reduced"] root
 *     override: css/tokens.css collapses the four duration tokens to
 *     1ms and css/motion.css stands the primitives down. A PREVIEW
 *     switch (aria-pressed, state-labeled) — the visitor's OS setting
 *     is honored independently and always wins where it applies.
 *
 * THE SIX SHOWCASES:
 *   01 Staggered Bento Cascade — six tiles, MotionReveal fade-up,
 *      staggerIndex 0-5 (the diagonal 45ms wave). Replay replays.
 *   02 Tactile Spring Detents — Snappy vs Gentle panels; the LAB-ONLY
 *      scoped overrides retune the SAME Button/ToggleSwitch/
 *      RadioCardGroup transitions to the two spring tokens so the
 *      detents are A/B comparable (a comparison instrument, not a
 *      consumer pattern — production components keep --transition-*).
 *   03 Cursor-Tracking Kinetic Sheen — three KineticSurface cards
 *      (cyan / violet-glow / rose-glow) with the live pointer sheen.
 *   04 FLIP Gliding Navigation — a standalone 5-tab Tabs showing the
 *      shared gliding indicator.
 *   05 Rolling Telemetry — controls drive AnimatedNumber (budget),
 *      StatRing (%) and a push-fed Sparkline; every value rolls on the
 *      spring tokens.
 *   06 Live Zero-Key API Choreography (Open-Meteo) — the FALLBACK-FIRST
 *      pattern: deterministic offline sample data renders FIRST
 *      (labeled as a sample, never fake-live), the zero-auth
 *      api.open-meteo.com stream fetches on mount and swaps in on
 *      success ("Refetch Live Stream" retries), SkeletonCard marks the
 *      loading window, failure keeps the fallback (a toast names the
 *      failure on MANUAL refetches only — the auto-mount failure is
 *      quiet: the sample IS the state). AbortController on unmount and
 *      on every re-fetch.
 *
 * Domain-neutral by the purity doctrine: the telemetry numbers speak
 * budgets, seats and samples — the banned legacy domain never appears,
 * no hardcoded LIVE values (the sample is labeled as a sample).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  Button,
  StatCard,
  StatRing,
  Sparkline,
  AreaChart,
  SkeletonCard,
  Tabs,
  ToggleSwitch,
  RadioCardGroup,
  useToast,
} from "@edwyn/signature-style/react";
import {
  AnimatedNumber,
  MotionReveal,
  KineticSurface,
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

/** The four live-stream states (the chip + the skeleton window). */
type LiveStatus = "fallback" | "loading" | "live" | "error";

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

/** The lab's local detent states (showcase 02). */
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

const DETENT_OPTIONS = [
  { value: "detent-a", label: "Detent A", description: "The first stop" },
  { value: "detent-b", label: "Detent B", description: "The second stop" },
  { value: "detent-c", label: "Detent C", description: "The third stop" },
];

/** The stagger cascade's six tiles — token-tinted, content-labeled. */
const STAGGER_TILES: Array<{ label: string; token: string }> = [
  { label: "Tile 01", token: "--sig-cyan" },
  { label: "Tile 02", token: "--sig-violet-glow" },
  { label: "Tile 03", token: "--sig-rose-glow" },
  { label: "Tile 04", token: "--sig-mint" },
  { label: "Tile 05", token: "--sig-citron" },
  { label: "Tile 06", token: "--sig-lavender" },
];

/** The sheen trio — accent token + caption (showcase 03). */
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

  // Showcase 02 — the detents.
  const [detents, setDetents] = useState<DetentState>({
    snappySwitch: true,
    gentleSwitch: true,
    snappyPick: "detent-a",
    gentlePick: "detent-a",
  });

  // Showcase 04 — the standalone FLIP tabs.
  const [flipTab, setFlipTab] = useState("overview");
  const FLIP_TABS = [
    { id: "overview", label: "Overview" },
    { id: "motion", label: "Motion" },
    { id: "tokens", label: "Tokens" },
    { id: "primitives", label: "Primitives" },
    { id: "lab", label: "Lab" },
  ];

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
            controller.signal.aborted ||
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
        Set 08 · the kinetic engine on stage — every entrance, roll, glide
        and sheen below rides the motion tokens, honors the dial above,
        and stands down under reduced motion.
      </p>

      {/* THE REPLAY SCOPE — everything inside remounts on Replay. */}
      <div key={replayKey} className="motion-lab__stream" data-testid="motion-stream">
        {/* 01 — STAGGERED BENTO CASCADE */}
        <PatternFrame
          setId="08"
          setName={SET_NAMES["08"]}
          componentName="Staggered Bento Cascade"
          snippet={MOTION_SNIPPETS.MotionReveal}
        >
          <div className="motion-lab__stagger" data-testid="motion-stagger">
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
                    style={{ background: `color-mix(in srgb, var(${tile.token}) 18%, transparent)` }}
                  />
                  {tile.label}
                </div>
              </MotionReveal>
            ))}
          </div>
        </PatternFrame>

        {/* 02 — TACTILE SPRING DETENTS */}
        <PatternFrame
          setId="08"
          setName={SET_NAMES["08"]}
          componentName="Tactile Spring Detents"
          snippet={MOTION_SNIPPETS.KineticTokens}
        >
          <div className="motion-lab__detents" data-testid="motion-detents">
            <div className="motion-lab__detent" data-detent="snappy">
              <h4>Snappy — --ease-spring-snappy</h4>
              <Button
                variant="primary"
                size="sm"
                onClick={() => undefined}
              >
                Press me
              </Button>
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
              <Button
                variant="secondary"
                size="sm"
                onClick={() => undefined}
              >
                Press me
              </Button>
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
        </PatternFrame>

        {/* 03 — CURSOR-TRACKING KINETIC SHEEN */}
        <PatternFrame
          setId="08"
          setName={SET_NAMES["08"]}
          componentName="Cursor-Tracking Kinetic Sheen"
          snippet={MOTION_SNIPPETS.KineticSurface}
        >
          <div className="motion-lab__sheen-grid" data-testid="motion-sheen">
            {SHEEN_CARDS.map((card) => (
              <KineticSurface key={card.title} accentToken={card.token} className="motion-lab__sheen-card">
                <h4>{card.title}</h4>
                <p>{card.copy}</p>
              </KineticSurface>
            ))}
          </div>
        </PatternFrame>

        {/* 04 — FLIP GLIDING NAVIGATION */}
        <PatternFrame
          setId="08"
          setName={SET_NAMES["08"]}
          componentName="FLIP Gliding Navigation"
          snippet={MOTION_SNIPPETS.MotionLabTimeDilation}
        >
          <div data-testid="motion-flip">
            <Tabs
              label="FLIP gliding indicator demo"
              tabs={FLIP_TABS}
              activeId={flipTab}
              onChange={setFlipTab}
            />
            <p className="motion-lab__flip-copy">
              The underline is ONE shared element — watch it glide
              (measure → invert → play) instead of teleporting between
              tabs. Current: <strong>{flipTab}</strong>.
            </p>
          </div>
        </PatternFrame>

        {/* 05 — ROLLING TELEMETRY */}
        <PatternFrame
          setId="08"
          setName={SET_NAMES["08"]}
          componentName="Rolling Telemetry"
          snippet={MOTION_SNIPPETS.AnimatedNumber}
        >
          <div className="motion-lab__telemetry" data-testid="motion-telemetry">
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
              <Sparkline data={series} colorToken="--sig-cyan" label="Sample stream trend" width={160} height={36} />
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
        </PatternFrame>

        {/* 06 — LIVE ZERO-KEY API CHOREOGRAPHY (OPEN-METEO) */}
        <PatternFrame
          setId="08"
          setName={SET_NAMES["08"]}
          componentName="Live Zero-Key API Choreography"
          snippet={MOTION_SNIPPETS.FallbackFirstData}
        >
          <div data-testid="motion-weather">
            <div className="motion-lab__weather-status">
              <span
                className="motion-lab__chip"
                data-status={liveStatus}
                data-testid="motion-weather-chip"
              >
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
              height={180}
            />
          </div>
        </PatternFrame>
      </div>
    </div>
  );
}
