/**
 * motion — THE KINETIC PRIMITIVES (3.7.0 "The Intelligent Kinetic Engine,
 * Motion Lab & Live Data Choreography").
 *
 * Three zero-dependency motion primitives wired to the kinetic tokens of
 * css/tokens.css (the linear() springs) and the component styles of
 * css/motion.css. The e1 treaty holds throughout: ONLY transform,
 * opacity, clip-path and CSS custom properties are ever animated —
 * never box-shadow, never top/left geometry.
 *
 *   <AnimatedNumber> — rAF number interpolation. The previous value
 *     rolls to the new value over `duration` (default 480ms, the gentle
 *     spring's feel) with a SPRING-INTERPOLATED easing: an easeOutQuint
 *     arrival plus a damped 2% overshoot peaking at 70% of the timeline,
 *     settling exactly on the final value — the JS cousin of
 *     --ease-spring-gentle (a full spring integrator is needless weight
 *     for a number roll; this is two Math calls per frame). The DOM is
 *     ONE <span class="sig-animated-number"> with tabular-nums, so
 *     digits never jitter while rolling. ARIA: the live region is
 *     deliberately OFF (default) — the interpolation is decorative; the
 *     FINAL value always lands in the DOM, which is what assistive tech
 *     reads. Reduced motion ([data-sig-motion="reduced"] ancestor or
 *     prefers-reduced-motion) sets the value instantly, no rAF.
 *
 *   <MotionReveal> — the once-entrance wrapper. ONE IntersectionObserver
 *     fires a single time (unobserve after reveal — entrance, not
 *     scroll-jacking); the div wrapper is justified: it IS the reveal
 *     target. Variants ride the package tokens: fade-up (opacity +
 *     translateY(16px)), scale-in (opacity + scale(0.96)), clip-reveal
 *     (clip-path inset(0 0 100% 0) → inset(0)). Stagger: the optional
 *     `staggerIndex` becomes --stagger-index and the transition delay
 *     computes as calc(index × 45ms) — the diagonal wave. An optional
 *     `delay` (ms) adds on top. Reduced motion: revealed immediately on
 *     mount (visible before the first paint — no flash of hidden
 *     content, the 1.6.0 lesson), and css/motion.css collapses the
 *     transitions outright. If IntersectionObserver is unavailable the
 *     content reveals immediately (progressive enhancement doctrine).
 *
 *   <KineticSurface> — the cursor-tracking sheen. onPointerMove writes
 *     --ptr-x / --ptr-y (pixel coordinates within the element) through a
 *     rAF-THROTTLED handler (one write per frame — pointermove fires
 *     per-pixel); css/motion.css paints a radial-gradient sheen
 *     (::after) positioned at those coordinates, opacity 0 → 1 on
 *     hover. THE POSITION NEVER ANIMATES — the custom-property writes
 *     repaint the gradient directly; the only transition is opacity.
 *     The paint is localized to one pseudo-element (the GPU note: the
 *     gradient repaints inside the surface's own layer; surrounding
 *     layout never reflows — there is no layout to reflow, the sheen is
 *     position:absolute). accentToken selects the tint (any --sig-*
 *     token, default --sig-cyan); the component is self-contained by
 *     design — no exported tracking hook, the one consumer that needs
 *     raw tracking can read the same pointermove pattern.
 *
 * 3.9.0 THE COLORFUL KINETIC SUITE — four primitives join:
 *   <AuroraBorderCard> (the registered --sig-beam-angle conic border
 *     beam — @property in css/motion.css, mask-composited 2px ring,
 *     NEVER a box-shadow), <TiltSurface> (perspective(600px) pointer
 *     tilt ±tilt° + the shared sheen), <StatusBeacon> (the ping ring —
 *     transform/opacity only, static dot under reduced motion) and
 *     <WaveformBars> (the per-bar-delay equalizer, deterministic
 *     golden-angle heights). All four stand down under reduced motion
 *     — belt and suspenders, both the media query and the subtree
 *     override.
 *
 * Pruning Protocol: AnimatedNumber renders exactly one element;
 * MotionReveal exactly one wrapper; KineticSurface one div + one
 * ::after (css-owned). Zero hex, zero shadows, tokens only.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

/** Layout effect where a DOM exists, plain effect under SSR (the ThemeProvider pattern). */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * THE INSTANT-MOTION PROBE — shared by all three primitives. True when
 * the visitor asked the OS for reduced motion, or when any
 * [data-sig-motion="reduced"] ancestor opts the subtree out (the Motion
 * Lab's preview toggle). Read at effect-time, not render-time — the
 * attribute can be flipped live and the probe must see the CURRENT tree.
 */
function prefersInstantMotion(el: Element | null): boolean {
  if (typeof window === "undefined") return true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  return el?.closest('[data-sig-motion="reduced"]') !== null;
}

/**
 * SPRING PROGRESS — the AnimatedNumber easing, pure and gate-testable.
 * Input t is linear time 0→1; output is the spring-interpolated
 * progress 0→1 (overshooting to ≈1.02 near t=0.7, settling at exactly 1):
 * easeOutQuint arrival + a damped sine hump (2% amplitude, peak at 70%,
 * decayed to zero at t=1).
 */
export function springProgress(t: number): number {
  if (t >= 1) return 1;
  if (t <= 0) return 0;
  const base = 1 - Math.pow(1 - t, 5);
  const wobble = 0.02 * Math.sin((Math.PI * t) / 1.4) * ((1 - t) / 0.3);
  return base + wobble;
}

export interface AnimatedNumberProps {
  /** The target value — changes roll from the previously rendered value. */
  value: number;
  /** Static text before the digits (e.g. "$"). */
  prefix?: string;
  /** Static text after the digits (e.g. "%" or " km/h"). */
  suffix?: string;
  /** Fraction digits rendered (default 0 — whole numbers). */
  decimals?: number;
  /** Roll duration in ms (default 480 — the gentle spring's feel). */
  duration?: number;
  /** Passthrough for composing (e.g. a sizing class). */
  className?: string;
}

/**
 * `<AnimatedNumber>` — the spring-interpolated number roll.
 *
 * ONE `<span class="sig-animated-number">` (tabular-nums via
 * css/motion.css). On mount and on every `value` change the number
 * rolls from the previously DISPLAYED value to the new one over
 * `duration`, driven by one rAF loop (cleaned up on unmount and on
 * every re-roll — no leaked frames). Formatting is the runtime's
 * toLocaleString with `decimals` fraction digits, so 1250.5 renders
 * "1,250.5" with the prefix/suffix wrapped around it.
 *
 * @example
 * ```tsx
 * <AnimatedNumber value={1740} prefix="$" />
 * <AnimatedNumber value={63.4} suffix="%" decimals={1} />
 * ```
 */
export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 480,
  className,
}: AnimatedNumberProps) {
  // The value currently painted. Starts at the FIRST value — the first
  // render is already correct (no roll from zero; rolling from 0 is a
  // lie about the data).
  const [display, setDisplay] = useState(value);
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const from = display;
    const delta = value - from;
    // Same value (or the user asked for stillness): land instantly.
    // The SPAN is the probe root — a [data-sig-motion="reduced"] ancestor
    // anywhere above it opts THIS roll out.
    if (delta === 0 || duration <= 0 || prefersInstantMotion(spanRef.current)) {
      setDisplay(value);
      return undefined;
    }
    const startedAt = performance.now();
    const tick = (now: number): void => {
      const t = Math.min(1, (now - startedAt) / duration);
      setDisplay(from + delta * springProgress(t));
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        frameRef.current = null;
      }
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
    // `display` is deliberately NOT a dependency: the roll always starts
    // from the value painted when THIS effect ran (the closure captured
    // it), and re-running on every frame would restart the roll.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  const formatted = display.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return (
    <span
      ref={spanRef}
      className={className !== undefined ? `sig-animated-number ${className}` : "sig-animated-number"}
    >
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

/** The three entrance variants — css/motion.css owns the geometry. */
export type MotionRevealVariant = "fade-up" | "scale-in" | "clip-reveal";

export interface MotionRevealProps {
  /** The entrance choreography (default "fade-up"). */
  variant?: MotionRevealVariant;
  /**
   * Position in a stagger wave — the transition delay computes as
   * calc(var(--stagger-index) × 45ms). Omit (or pass 0) to reveal in
   * step with the group.
   */
  staggerIndex?: number;
  /** Extra delay in ms, added ON TOP of the stagger step. */
  delay?: number;
  /** Passthrough for composing on the wrapper. */
  className?: string;
  /** The content revealed. */
  children?: ReactNode;
}

/**
 * `<MotionReveal>` — the once-entrance wrapper.
 *
 * ONE `<div class="sig-motion-reveal sig-motion-reveal--{variant}">`
 * (the justified wrapper: it IS the reveal target). An
 * IntersectionObserver (threshold 0.15) flips data-in="true" the first
 * time the wrapper enters the viewport, then disconnects — the
 * entrance plays exactly once per mount; replay = remount (the Motion
 * Lab's Replay key). The stagger wave rides --stagger-index →
 * transition-delay: calc(index × 45ms), plus the optional `delay`.
 * Reduced motion / [data-sig-motion="reduced"] / no-IO environments
 * reveal immediately (visible on the first paint — content is never
 * stranded invisible, the 1.6.0 lesson).
 *
 * @example
 * ```tsx
 * {cards.map((card, index) => (
 *   <MotionReveal variant="fade-up" staggerIndex={index} key={card.id}>
 *     <StatCard {...card} />
 *   </MotionReveal>
 * ))}
 * ```
 */
export function MotionReveal({
  variant = "fade-up",
  staggerIndex,
  delay,
  className,
  children,
}: MotionRevealProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = hostRef.current;
    if (el === null) return undefined;
    // Stillness first: reduced motion reveals BEFORE the first paint.
    if (prefersInstantMotion(el) || typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stagger =
    staggerIndex !== undefined && staggerIndex !== 0
      ? `calc(var(--stagger-index, 0) * 45ms)`
      : "0ms";
  const totalDelay =
    delay !== undefined && delay > 0 ? `calc(${stagger} + ${delay}ms)` : stagger;
  const style = {
    ...(staggerIndex !== undefined
      ? ({ "--stagger-index": String(staggerIndex) } as CSSProperties)
      : {}),
    transitionDelay: totalDelay,
  };
  return (
    <div
      ref={hostRef}
      className={`sig-motion-reveal sig-motion-reveal--${variant}${className !== undefined ? ` ${className}` : ""}`}
      data-in={revealed ? "true" : undefined}
      style={style}
    >
      {children}
    </div>
  );
}

export interface KineticSurfaceProps {
  /**
   * The sheen's tint — any --sig-* token name (default "--sig-cyan").
   * Mapped inline to --sig-kinetic-accent; css/motion.css mixes it at
   * 12% into the radial gradient. A structural token would technically
   * paint, but the sheen is CONTENT decoration — pass chromatic tokens.
   */
  accentToken?: string;
  /** Passthrough for composing on the surface. */
  className?: string;
  /** The surface's content. */
  children?: ReactNode;
}/**
 * `<KineticSurface>` — the cursor-tracking kinetic sheen.
 *
 * ONE `<div class="sig-kinetic-surface">` carrying the kinetic
 * behavior: onPointerMove writes --ptr-x / --ptr-y (PIXEL coordinates
 * within the element) through a rAF-throttled setter — at most one
 * custom-property write per frame, the latest pointer position wins.
 * css/motion.css paints the sheen as a ::after radial gradient
 * anchored at those coordinates, fading in on hover (opacity is the
 * ONLY transition — the position updates are direct repaints, never
 * animations). The rAF is cancelled on unmount.
 *
 * @example
 * ```tsx
 * <KineticSurface accentToken="--sig-violet-glow">
 *   <p>Move the cursor across me.</p>
 * </KineticSurface>
 * ```
 */
export function KineticSurface({
  accentToken = "--sig-cyan",
  className,
  children,
}: KineticSurfaceProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const pointRef = useRef<{ x: number; y: number } | null>(null);

  // THE PAINT — one rAF callback applies the latest pointer position as
  // custom properties. Coalesced: pointermove fires per-pixel, the
  // paint runs per-frame.
  const paint = useCallback((): void => {
    frameRef.current = null;
    const el = hostRef.current;
    const point = pointRef.current;
    if (el === null || point === null) return;
    el.style.setProperty("--ptr-x", `${point.x}px`);
    el.style.setProperty("--ptr-y", `${point.y}px`);
  }, []);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>): void => {
      const el = hostRef.current;
      if (el === null) return;
      const rect = el.getBoundingClientRect();
      pointRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      if (frameRef.current === null) {
        frameRef.current = requestAnimationFrame(paint);
      }
    },
    [paint],
  );

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className={className !== undefined ? `sig-kinetic-surface ${className}` : "sig-kinetic-surface"}
      style={{ "--sig-kinetic-accent": `var(${accentToken})` } as CSSProperties}
      onPointerMove={handlePointerMove}
    >
      {children}
    </div>
  );
}

/* ==========================================================================
   3.9.0 THE COLORFUL KINETIC SUITE — four primitives join the engine,
   same treaty (ONLY transform/opacity/clip-path/registered custom
   properties animate — never box-shadow; the aurora beam is a conic
   ANGLE, not a shadow):

   <AuroraBorderCard> — the rotating conic border beam. css/motion.css
     REGISTERS --sig-beam-angle (CSS @property, syntax "<angle>") so
     the keyframe rotation interpolates; the card's ::before is a
     conic-gradient cycling the accent tokens, mask-composited to a 2px
     border ring (the standard border-beam technique). trigger "hover"
     (default) runs the spin on hover; "always" runs it constantly.
     Fallback: engines without @property keep a static 4-color conic
     border (unregistered angles cannot interpolate — the ring just
     doesn't rotate). Reduced motion: static ring.

   <TiltSurface> — the 3D pointer tilt. perspective(600px)
     rotateX/rotateY (± tilt deg, default 4) tracking the pointer via
     the SAME rAF-throttled --ptr-x/--ptr-y math as the KineticSurface
     sheen, extended with --tilt-x/--tilt-y; the sheen rides along.
     Reduced motion: the sheen stays (opacity-only), the tilt stands
     down — the JS probe skips the tilt writes and css pins
     transform: none.

   <StatusBeacon> — the pulsing ring beacon. One span (the dot) whose
     ::after ring scales 1 → 2.2 and fades in the status color —
     the classic ping, transform/opacity only. Reduced motion: a
     static dot (the ping ring never renders).

   <WaveformBars> — the spring-animated equalizer. N bars (default 12)
     with per-bar animation-delay (calc(--bar-i × 90ms)) riding
     --ease-spring-snappy; heights come from the data array
     (normalized) or a deterministic pseudo-random curve (golden-angle
     sine — same input, same bars, no Math.random). Reduced motion:
     static mid-height bars.

   Pruning: AuroraBorderCard is one div + one ::before (css-owned);
   TiltSurface one div + the shared sheen ::after; StatusBeacon one
   span + one ::after; WaveformBars one wrapper div + exactly bars
   spans. Zero hex, zero shadows, tokens only.
   ========================================================================== */

/** The aurora default — a four-token chromatic cycle (fill accents). */
const AURORA_DEFAULT_TOKENS: ReadonlyArray<string> = [
  "--sig-cyan",
  "--sig-orchid",
  "--sig-mint",
  "--sig-cobalt",
];

export interface AuroraBorderCardProps {
  /**
   * The beam's chromatic cycle — --sig-* tokens, in order (default
   * cyan → orchid → mint → cobalt). Four reads best; any count ≥ 2
   * works (the gradient repeats the first token to close the loop).
   */
  accentTokens?: string[];
  /** When the beam spins: "hover" (default) or "always". */
  trigger?: "hover" | "always";
  /** Passthrough for composing on the card. */
  className?: string;
  /** The card's content — the beam is a 2px ring around it. */
  children?: ReactNode;
}

/**
 * `<AuroraBorderCard>` — the rotating conic border beam.
 *
 * ONE `<div class="sig-aurora-card">` whose ::before (css/motion.css)
 * paints a conic-gradient cycling `accentTokens` around a registered
 * `--sig-beam-angle`, masked to a 2px border ring. NO box-shadow is
 * ever animated — the beam is a rotating ANGLE on a gradient, the e1
 * treaty's registered-custom-property clause in its purest form.
 *
 * @example
 * ```tsx
 * <AuroraBorderCard trigger="always" accentTokens={["--sig-cyan", "--sig-magenta"]}>
 *   <p>The beam never sleeps.</p>
 * </AuroraBorderCard>
 * ```
 */
export function AuroraBorderCard({
  accentTokens = AURORA_DEFAULT_TOKENS as string[],
  trigger = "hover",
  className,
  children,
}: AuroraBorderCardProps) {
  const tokens = accentTokens.length >= 2 ? accentTokens : (AURORA_DEFAULT_TOKENS as string[]);
  const vars: CSSProperties = {
    "--sig-aurora-1": `var(${tokens[0]})`,
    "--sig-aurora-2": `var(${tokens[1]})`,
    "--sig-aurora-3": `var(${tokens[Math.min(2, tokens.length - 1)]})`,
    "--sig-aurora-4": `var(${tokens[Math.min(3, tokens.length - 1)]})`,
  } as CSSProperties;
  return (
    <div
      className={
        className !== undefined ? `sig-aurora-card ${className}` : "sig-aurora-card"
      }
      data-trigger={trigger}
      style={vars}
    >
      {children}
    </div>
  );
}

export interface TiltSurfaceProps {
  /** The max tilt in degrees (default 4 — ±4° reads, ±10° clowns). */
  tilt?: number;
  /** The sheen's tint — any --sig-* token (default "--sig-cyan"). */
  accentToken?: string;
  /** Passthrough for composing on the surface. */
  className?: string;
  /** The surface's content. */
  children?: ReactNode;
}

/**
 * `<TiltSurface>` — the 3D pointer tilt + the chromatic sheen.
 *
 * ONE `<div class="sig-tilt-surface sig-kinetic-surface">` — the
 * KineticSurface class rides along so the sheen ::after and its
 * --ptr-x/--ptr-y plumbing are shared verbatim. The tilt writes
 * --tilt-x/--tilt-y (degrees, clamped to ±`tilt`) through the same
 * rAF-throttled setter; css/motion.css transforms
 * `perspective(600px) rotateX(var(--tilt-y)) rotateY(var(--tilt-x))`.
 * Reduced motion ([data-sig-motion="reduced"] ancestor or the OS
 * setting): the tilt writes stop AND css pins transform: none — the
 * sheen stays (opacity is its only animation).
 *
 * @example
 * ```tsx
 * <TiltSurface tilt={6} accentToken="--sig-rose-glow">
 *   <p>Tilt with the cursor.</p>
 * </TiltSurface>
 * ```
 */
export function TiltSurface({
  tilt = 4,
  accentToken = "--sig-cyan",
  className,
  children,
}: TiltSurfaceProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const pointRef = useRef<{ x: number; y: number } | null>(null);

  // THE PAINT — one rAF callback: the sheen coordinates + the tilt
  // angles, coalesced to one custom-property write set per frame.
  const paint = useCallback((): void => {
    frameRef.current = null;
    const el = hostRef.current;
    const point = pointRef.current;
    if (el === null || point === null) return;
    el.style.setProperty("--ptr-x", `${point.x}px`);
    el.style.setProperty("--ptr-y", `${point.y}px`);
    // THE STILLNESS PROBE runs at paint time: a reduced-motion flip
    // mid-hover stands the tilt down without a re-render.
    const still = prefersInstantMotion(el);
    const maxDeg = still ? 0 : tilt;
    const nx = point.x / Math.max(el.clientWidth, 1) - 0.5; // -0.5..0.5
    const ny = point.y / Math.max(el.clientHeight, 1) - 0.5;
    el.style.setProperty("--tilt-x", `${(nx * 2 * maxDeg).toFixed(2)}deg`);
    el.style.setProperty("--tilt-y", `${(-ny * 2 * maxDeg).toFixed(2)}deg`);
  }, [tilt]);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>): void => {
      const el = hostRef.current;
      if (el === null) return;
      const rect = el.getBoundingClientRect();
      pointRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      if (frameRef.current === null) {
        frameRef.current = requestAnimationFrame(paint);
      }
    },
    [paint],
  );

  const handlePointerLeave = useCallback((): void => {
    const el = hostRef.current;
    pointRef.current = null;
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    if (el === null) return;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
  }, []);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className={
        className !== undefined
          ? `sig-tilt-surface sig-kinetic-surface ${className}`
          : "sig-tilt-surface sig-kinetic-surface"
      }
      style={{ "--sig-kinetic-accent": `var(${accentToken})` } as CSSProperties}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {children}
    </div>
  );
}

export interface StatusBeaconProps {
  /** The status word — data-status for probes/styling + the aria label stem. */
  status: string;
  /** The beacon's chromatic color — a --sig-* content token. */
  colorToken: string;
  /** The dot's diameter in px (default 8 — one grid unit). */
  size?: number;
  /** The accessible name (default `Status: ${status}`). */
  label?: string;
}

/**
 * `<StatusBeacon>` — the pulsing ring beacon.
 *
 * ONE `<span class="sig-beacon" role="status">` — the dot in
 * `var(colorToken)`; the ::after ring (css/motion.css) scales 1 → 2.2
 * and fades — the classic ping, transform/opacity only (the e1
 * treaty). Reduced motion: the ping never renders — a static dot.
 *
 * @example
 * ```tsx
 * <StatusBeacon status="live" colorToken="--sig-green" />
 * <StatusBeacon status="syncing" colorToken="--sig-azure" size={12} label="Stream syncing" />
 * ```
 */
export function StatusBeacon({
  status,
  colorToken,
  size = 8,
  label,
}: StatusBeaconProps) {
  return (
    <span
      className="sig-beacon"
      role="status"
      data-status={status}
      aria-label={label ?? `Status: ${status}`}
      style={
        {
          "--sig-beacon-color": `var(${colorToken})`,
          "--sig-beacon-size": `${size}px`,
        } as CSSProperties
      }
    />
  );
}

export interface WaveformBarsProps {
  /**
   * The bar heights, any positive scale (normalized to the tallest).
   * Omit for the deterministic golden-angle curve — same count, same
   * shape, every render (no Math.random: determinism is the contract).
   */
  data?: number[];
  /** The bar count (default 12) — used when `data` is omitted. */
  bars?: number;
  /** When true (default) the bars dance; false freezes the heights. */
  active?: boolean;
  /** The bars' chromatic color (default "--sig-cyan"). */
  colorToken?: string;
  /** The accessible name (role="img"; default "Waveform"). */
  label?: string;
}

/**
 * `<WaveformBars>` — the spring-animated equalizer.
 *
 * ONE `<div class="sig-waveform" role="img">` holding EXACTLY `bars`
 * `<span class="sig-waveform__bar">`s. Each bar carries --bar-h (the
 * normalized height) and --bar-i (its index); css/motion.css bounces
 * them on --ease-spring-snappy with a per-bar delay
 * (calc(var(--bar-i) × 90ms)) when `active`. Deterministic heights:
 * the omitted-data curve is `0.3 + 0.7·|sin(i·2.399 + 1.2)|` — the
 * golden-angle spread, stable across renders.
 *
 * @example
 * ```tsx
 * <WaveformBars bars={16} colorToken="--sig-mint" label="Stream level" />
 * <WaveformBars data={[0.2, 0.9, 0.4, 0.7]} active={false} />
 * ```
 */
export function WaveformBars({
  data,
  bars = 12,
  active = true,
  colorToken = "--sig-cyan",
  label = "Waveform",
}: WaveformBarsProps) {
  const heights: number[] = waveHeights(data, bars);
  return (
    <div
      className={
        active ? "sig-waveform is-active" : "sig-waveform"
      }
      role="img"
      aria-label={label}
      style={{ "--sig-wave-color": `var(${colorToken})` } as CSSProperties}
    >
      {heights.map((height, index) => (
        <span
          key={index}
          className="sig-waveform__bar"
          style={{ "--bar-h": height.toFixed(2), "--bar-i": String(index) } as CSSProperties}
        />
      ))}
    </div>
  );
}

/** The deterministic heights — data normalized, or the golden-angle curve. */
function waveHeights(data: number[] | undefined, bars: number): number[] {
  if (data !== undefined && data.length > 0) {
    const max = Math.max(...data, 0.0001);
    return data.map((value) => Math.min(1, Math.max(0.08, value / max)));
  }
  const count = Math.max(1, bars);
  const heights: number[] = [];
  for (let i = 0; i < count; i += 1) {
    heights.push(0.3 + 0.7 * Math.abs(Math.sin(i * 2.399 + 1.2)));
  }
  return heights;
}

/* ==========================================================================
   THE FLIP INDICATOR — the shared gliding-underline mechanics
   (3.7.0). <Tabs> and <GlobalNav> both retire their per-tab border
   underline (it TELEPORTS — the old underline disappears on one tab and
   appears on another) for ONE shared indicator element that GLIDES.
   The motion is FLIP: First, measure the previous and the new active
   element's boxes (offsetLeft/offsetWidth — layout reads, one per
   change); Last, invert — paint the indicator at the PREVIOUS box
   (transition suppressed) with scaleX shaped so it renders exactly the
   old geometry over the new base width; Invert→Play — force one reflow
   to lock the inverted frame, re-enable the css glide transition
   (--dur-glide × --ease-glide), then transform to the new box. Only
   transform ever transitions (the e1 treaty); the width swap is
   instantaneous and invisible because the inverted scaleX covers it.
   First placement (mount) jumps without gliding — there is no previous
   box to glide FROM. A ResizeObserver recompute resizes/jumps without
   gliding (a media-query collapse is not navigation).
   ========================================================================== */

/** The refs a consumer attaches: the positioned container + the indicator. */
export interface FlipIndicatorRefs<L extends HTMLElement = HTMLElement> {
  /** Attach to the element that CONTAINS the active items (the tablist / the nav list). It must be the indicator's positioning context. */
  listRef: MutableRefObject<L | null>;
  /** Attach to the shared indicator span (css/motion.css .sig-tabs-indicator / .sig-nav-indicator). */
  indicatorRef: MutableRefObject<HTMLSpanElement | null>;
}

/** One measured box — offsetLeft/offsetWidth relative to the list. */
interface FlipBox {
  x: number;
  w: number;
}

/**
 * `useFlipIndicator(activeSelector)` — the FLIP gliding-underline hook.
 *
 * Runs placement on EVERY commit (no dependency array): it measures the
 * element matching `activeSelector` inside the list and no-ops when the
 * box did not move — which is exactly "glide when the active tab/view
 * changes, nothing otherwise". The first placement jumps (no previous
 * box); subsequent changes FLIP. A ResizeObserver on the list recomputes
 * WITHOUT the glide (resize is not navigation). Hidden lists (the 768px
 * bar collapse, w === 0) are skipped entirely.
 *
 * @example
 * ```tsx
 * const { listRef, indicatorRef } = useFlipIndicator('[aria-selected="true"]');
 * return (
 *   <div role="tablist" className="sig-tabs" ref={listRef}>
 *     {tabs.map(...)}
 *     <span aria-hidden="true" className="sig-tabs-indicator" ref={indicatorRef} />
 *   </div>
 * );
 * ```
 */
export function useFlipIndicator<L extends HTMLElement = HTMLElement>(
  activeSelector: string,
): FlipIndicatorRefs<L> {
  const listRef = useRef<L | null>(null);
  const indicatorRef = useRef<HTMLSpanElement | null>(null);
  const prevBoxRef = useRef<FlipBox | null>(null);

  // MEASURE + INVERT + PLAY, every commit. Placement is a layout read
  // per commit — cheap at nav/tablist scale, and the no-deps form means
  // the hook needs no cooperation from the consumer's state.
  useIsomorphicLayoutEffect(() => {
    const list = listRef.current;
    const el = indicatorRef.current;
    if (list === null || el === null) return;
    const active = list.querySelector(activeSelector);
    if (!(active instanceof HTMLElement)) return;
    const next: FlipBox = { x: active.offsetLeft, w: active.offsetWidth };
    if (next.w === 0) return; // collapsed (mobile bar) — nothing to place
    const prev = prevBoxRef.current;
    if (prev === null || (prev.x === next.x && prev.w === next.w)) {
      // FIRST placement (or nothing moved): jump straight to the box.
      el.style.transition = "none";
      el.style.width = `${next.w}px`;
      el.style.transform = `translate3d(${next.x}px, 0, 0)`;
      void el.offsetWidth; // lock before the css transition rule resumes
      el.style.transition = "";
    } else {
      // FLIP — invert to the previous box, then play to the new one.
      el.style.transition = "none";
      el.style.width = `${next.w}px`;
      el.style.transform = `translate3d(${prev.x}px, 0, 0) scaleX(${prev.w / next.w})`;
      void el.offsetWidth; // THE INVERT: lock the old-geometry frame
      el.style.transition = ""; // THE PLAY: the css glide takes over
      el.style.transform = `translate3d(${next.x}px, 0, 0)`;
    }
    prevBoxRef.current = next;
  });

  // Resize recompute — jump, never glide (a breakpoint collapse is not
  // a navigation the visitor should see fly).
  useEffect(() => {
    const list = listRef.current;
    const el = indicatorRef.current;
    if (list === null || el === null || typeof ResizeObserver === "undefined") {
      return undefined;
    }
    const observer = new ResizeObserver(() => {
      const active = list.querySelector(activeSelector);
      if (!(active instanceof HTMLElement)) return;
      const next: FlipBox = { x: active.offsetLeft, w: active.offsetWidth };
      if (next.w === 0) return;
      el.style.transition = "none";
      el.style.width = `${next.w}px`;
      el.style.transform = `translate3d(${next.x}px, 0, 0)`;
      void el.offsetWidth;
      el.style.transition = "";
      prevBoxRef.current = next;
    });
    observer.observe(list);
    return () => observer.disconnect();
  }, [activeSelector]);

  return { listRef, indicatorRef };
}
