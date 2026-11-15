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
 * Pruning Protocol: AnimatedNumber renders exactly one element;
 * MotionReveal exactly one wrapper; KineticSurface one div + one
 * ::after (css-owned). Zero hex, zero shadows, tokens only.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

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
}

/**
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
