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
import { type MutableRefObject, type ReactNode } from "react";
/**
 * SPRING PROGRESS — the AnimatedNumber easing, pure and gate-testable.
 * Input t is linear time 0→1; output is the spring-interpolated
 * progress 0→1 (overshooting to ≈1.02 near t=0.7, settling at exactly 1):
 * easeOutQuint arrival + a damped sine hump (2% amplitude, peak at 70%,
 * decayed to zero at t=1).
 */
export declare function springProgress(t: number): number;
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
export declare function AnimatedNumber({ value, prefix, suffix, decimals, duration, className, }: AnimatedNumberProps): import("react").JSX.Element;
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
export declare function MotionReveal({ variant, staggerIndex, delay, className, children, }: MotionRevealProps): import("react").JSX.Element;
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
} /**
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
export declare function KineticSurface({ accentToken, className, children, }: KineticSurfaceProps): import("react").JSX.Element;
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
export declare function AuroraBorderCard({ accentTokens, trigger, className, children, }: AuroraBorderCardProps): import("react").JSX.Element;
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
export declare function TiltSurface({ tilt, accentToken, className, children, }: TiltSurfaceProps): import("react").JSX.Element;
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
export declare function StatusBeacon({ status, colorToken, size, label, }: StatusBeaconProps): import("react").JSX.Element;
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
export declare function WaveformBars({ data, bars, active, colorToken, label, }: WaveformBarsProps): import("react").JSX.Element;
/** The refs a consumer attaches: the positioned container + the indicator. */
export interface FlipIndicatorRefs<L extends HTMLElement = HTMLElement> {
    /** Attach to the element that CONTAINS the active items (the tablist / the nav list). It must be the indicator's positioning context. */
    listRef: MutableRefObject<L | null>;
    /** Attach to the shared indicator span (css/motion.css .sig-tabs-indicator / .sig-nav-indicator). */
    indicatorRef: MutableRefObject<HTMLSpanElement | null>;
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
export declare function useFlipIndicator<L extends HTMLElement = HTMLElement>(activeSelector: string): FlipIndicatorRefs<L>;
