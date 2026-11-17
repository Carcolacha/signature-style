/**
 * GraphEdgeDraw — THE ANIMEJS HALF of the Graph Motion Layer (4.1.0
 * "Graph Motion Layer").
 *
 * THE ONE-OWNER RULE (gate own1) — ONE ENGINE PER FILE: this module
 * imports ONLY animejs (juliangarnier/anime v4). motion/react lives in
 * GraphNodeSpring.tsx; the orchestrator (GraphMotionLayer.tsx) renders
 * both halves but imports this COMPONENT — never a second engine into
 * an engine file. A playground file importing BOTH engines fails the
 * gate.
 *
 * THE STRATA LAW — SVG edges: animejs animates ONLY strokeDashoffset
 * (the draw-on sweep of the curved source → target path). NEVER a
 * shadow, width, height, top/left — the e1 treaty extends to the
 * motion stratum. The dash TRACK (strokeDasharray
 * = the pathLength normalization unit, twice) is set ONCE as a mount
 * attribute and is never animated.
 *
 * THE v4 DRAWABLE CONTRACT (animejs 4.5.0 — verified against the
 * installed dist): svg.createDrawable(path) normalizes the geometry
 * with pathLength="1000" (its K constant — we pre-set the same value
 * in JSX so the prep never stomps our hidden start state) and hands
 * back a drawable proxy. The animation then drives strokeDashoffset
 * 1000 → 0: duration 420ms, ease "outCubic", delayed by the spawn
 * choreography (delayMs = spawnIndex · 70 — each child pops in as its
 * wire lands).
 *
 * REDUCED MOTION (gm3): when the layer hands down reducedMotion, there
 * is no drawable, no animation — the path renders FULLY DRAWN (the
 * dash attributes are simply omitted).
 *
 * CLEANUP CONTRACT: the effect reverts the JSAnimation
 * (cancel + restore the touched value) and clears nothing else — the
 * settle signal rides animejs's own onComplete. StrictMode-safe: the
 * double mount → cleanup → mount cycle reverts and redraws from the
 * hidden state, and the settle callback is ref-stable so the restart
 * never re-triggers React churn.
 */
import { useEffect, useRef } from "react";
import { animate, svg } from "animejs";

/** The draw-on duration (ms) — the 4.1.0 plan's 420. */
export const EDGE_DRAW_MS = 420;

/** The v4 drawable normalization unit (createDrawable stamps pathLength="1000"). */
const DRAW_UNITS = 1000;

export interface AnimatedGraphEdgeProps {
  /** The cubic-Bezier path string — the exact geometry the canvas derives. */
  readonly d: string;
  /** Choreography delay (ms) = spawnIndex · 70. */
  readonly delayMs?: number;
  /** Reduced motion hand-off from the layer's useReducedMotion: fully drawn, no sweep. */
  readonly reducedMotion?: boolean;
  /** Stable identity for the layer's settle pruning. */
  readonly settleKey: string;
  /** Fires once the draw has fully landed (the layer swaps to the static edge). */
  readonly onSettled?: (key: string) => void;
}

export function AnimatedGraphEdge({
  d,
  delayMs = 0,
  reducedMotion = false,
  settleKey,
  onSettled,
}: AnimatedGraphEdgeProps) {
  const pathRef = useRef<SVGPathElement | null>(null);
  // Ref-stable settle callback — the animation effect must not restart
  // because the orchestrator re-rendered with a fresh arrow function.
  const settledRef = useRef(onSettled);
  settledRef.current = onSettled;

  useEffect(() => {
    // gm3 — REDUCED MOTION: the edge is born fully drawn; signal the
    // settle immediately so the layer never masks the static hairline.
    if (reducedMotion) {
      settledRef.current?.(settleKey);
      return undefined;
    }
    const path = pathRef.current;
    if (path === null) return undefined;
    // THE DRAWABLE PREP — pathLength already matches (JSX), so the
    // proxy returns with our hidden mount state untouched.
    const drawable = svg.createDrawable(path);
    const animation = animate(drawable, {
      // THE ONE PROPERTY — strokeDashoffset, hidden → drawn.
      strokeDashoffset: [DRAW_UNITS, 0],
      duration: EDGE_DRAW_MS,
      ease: "outCubic",
      delay: delayMs,
      onComplete: () => settledRef.current?.(settleKey),
    });
    return () => {
      animation.revert();
    };
  }, [d, delayMs, reducedMotion, settleKey]);

  return (
    <path
      ref={pathRef}
      /* The package's global edge class — same hairline stroke/width as
         the static canvas edge (css/graph.css selectors are global), so
         the settle swap is pixel-seamless. No data-parent/data-child
         here: the layer's mask selectors must never hit the overlay. */
      className="sig-graph__edge sig-motion-edge"
      d={d}
      fill="none"
      pathLength={DRAW_UNITS}
      strokeDasharray={reducedMotion ? undefined : `${DRAW_UNITS} ${DRAW_UNITS}`}
      strokeDashoffset={reducedMotion ? undefined : DRAW_UNITS}
    />
  );
}
