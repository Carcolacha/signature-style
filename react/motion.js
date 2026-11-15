import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
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
import { useCallback, useEffect, useLayoutEffect, useRef, useState, } from "react";
/** Layout effect where a DOM exists, plain effect under SSR (the ThemeProvider pattern). */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
/**
 * THE INSTANT-MOTION PROBE — shared by all three primitives. True when
 * the visitor asked the OS for reduced motion, or when any
 * [data-sig-motion="reduced"] ancestor opts the subtree out (the Motion
 * Lab's preview toggle). Read at effect-time, not render-time — the
 * attribute can be flipped live and the probe must see the CURRENT tree.
 */
function prefersInstantMotion(el) {
    if (typeof window === "undefined")
        return true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        return true;
    return el?.closest('[data-sig-motion="reduced"]') !== null;
}
/**
 * SPRING PROGRESS — the AnimatedNumber easing, pure and gate-testable.
 * Input t is linear time 0→1; output is the spring-interpolated
 * progress 0→1 (overshooting to ≈1.02 near t=0.7, settling at exactly 1):
 * easeOutQuint arrival + a damped sine hump (2% amplitude, peak at 70%,
 * decayed to zero at t=1).
 */
export function springProgress(t) {
    if (t >= 1)
        return 1;
    if (t <= 0)
        return 0;
    const base = 1 - Math.pow(1 - t, 5);
    const wobble = 0.02 * Math.sin((Math.PI * t) / 1.4) * ((1 - t) / 0.3);
    return base + wobble;
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
export function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 0, duration = 480, className, }) {
    // The value currently painted. Starts at the FIRST value — the first
    // render is already correct (no roll from zero; rolling from 0 is a
    // lie about the data).
    const [display, setDisplay] = useState(value);
    const spanRef = useRef(null);
    const frameRef = useRef(null);
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
        const tick = (now) => {
            const t = Math.min(1, (now - startedAt) / duration);
            setDisplay(from + delta * springProgress(t));
            if (t < 1) {
                frameRef.current = requestAnimationFrame(tick);
            }
            else {
                frameRef.current = null;
            }
        };
        frameRef.current = requestAnimationFrame(tick);
        return () => {
            if (frameRef.current !== null)
                cancelAnimationFrame(frameRef.current);
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
    return (_jsxs("span", { ref: spanRef, className: className !== undefined ? `sig-animated-number ${className}` : "sig-animated-number", children: [prefix, formatted, suffix] }));
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
export function MotionReveal({ variant = "fade-up", staggerIndex, delay, className, children, }) {
    const hostRef = useRef(null);
    const [revealed, setRevealed] = useState(false);
    useEffect(() => {
        const el = hostRef.current;
        if (el === null)
            return undefined;
        // Stillness first: reduced motion reveals BEFORE the first paint.
        if (prefersInstantMotion(el) || typeof IntersectionObserver === "undefined") {
            setRevealed(true);
            return undefined;
        }
        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    setRevealed(true);
                    observer.disconnect();
                }
            }
        }, { threshold: 0.15 });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);
    const stagger = staggerIndex !== undefined && staggerIndex !== 0
        ? `calc(var(--stagger-index, 0) * 45ms)`
        : "0ms";
    const totalDelay = delay !== undefined && delay > 0 ? `calc(${stagger} + ${delay}ms)` : stagger;
    const style = {
        ...(staggerIndex !== undefined
            ? { "--stagger-index": String(staggerIndex) }
            : {}),
        transitionDelay: totalDelay,
    };
    return (_jsx("div", { ref: hostRef, className: `sig-motion-reveal sig-motion-reveal--${variant}${className !== undefined ? ` ${className}` : ""}`, "data-in": revealed ? "true" : undefined, style: style, children: children }));
}
export function KineticSurface({ accentToken = "--sig-cyan", className, children, }) {
    const hostRef = useRef(null);
    const frameRef = useRef(null);
    const pointRef = useRef(null);
    // THE PAINT — one rAF callback applies the latest pointer position as
    // custom properties. Coalesced: pointermove fires per-pixel, the
    // paint runs per-frame.
    const paint = useCallback(() => {
        frameRef.current = null;
        const el = hostRef.current;
        const point = pointRef.current;
        if (el === null || point === null)
            return;
        el.style.setProperty("--ptr-x", `${point.x}px`);
        el.style.setProperty("--ptr-y", `${point.y}px`);
    }, []);
    const handlePointerMove = useCallback((event) => {
        const el = hostRef.current;
        if (el === null)
            return;
        const rect = el.getBoundingClientRect();
        pointRef.current = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };
        if (frameRef.current === null) {
            frameRef.current = requestAnimationFrame(paint);
        }
    }, [paint]);
    useEffect(() => {
        return () => {
            if (frameRef.current !== null)
                cancelAnimationFrame(frameRef.current);
            frameRef.current = null;
        };
    }, []);
    return (_jsx("div", { ref: hostRef, className: className !== undefined ? `sig-kinetic-surface ${className}` : "sig-kinetic-surface", style: { "--sig-kinetic-accent": `var(${accentToken})` }, onPointerMove: handlePointerMove, children: children }));
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
export function useFlipIndicator(activeSelector) {
    const listRef = useRef(null);
    const indicatorRef = useRef(null);
    const prevBoxRef = useRef(null);
    // MEASURE + INVERT + PLAY, every commit. Placement is a layout read
    // per commit — cheap at nav/tablist scale, and the no-deps form means
    // the hook needs no cooperation from the consumer's state.
    useIsomorphicLayoutEffect(() => {
        const list = listRef.current;
        const el = indicatorRef.current;
        if (list === null || el === null)
            return;
        const active = list.querySelector(activeSelector);
        if (!(active instanceof HTMLElement))
            return;
        const next = { x: active.offsetLeft, w: active.offsetWidth };
        if (next.w === 0)
            return; // collapsed (mobile bar) — nothing to place
        const prev = prevBoxRef.current;
        if (prev === null || (prev.x === next.x && prev.w === next.w)) {
            // FIRST placement (or nothing moved): jump straight to the box.
            el.style.transition = "none";
            el.style.width = `${next.w}px`;
            el.style.transform = `translate3d(${next.x}px, 0, 0)`;
            void el.offsetWidth; // lock before the css transition rule resumes
            el.style.transition = "";
        }
        else {
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
            if (!(active instanceof HTMLElement))
                return;
            const next = { x: active.offsetLeft, w: active.offsetWidth };
            if (next.w === 0)
                return;
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
