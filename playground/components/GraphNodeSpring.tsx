/**
 * GraphNodeSpring — THE MOTION/REACT HALF of the Graph Motion Layer
 * (4.1.0 "Graph Motion Layer").
 *
 * THE ONE-OWNER RULE (gate own1) — ONE ENGINE PER FILE: this module
 * imports ONLY motion/react. animejs lives in GraphEdgeDraw.tsx.
 *
 * THE STRATA LAW — the inner node card animates ONLY scale + opacity
 * on a spring (stiffness 440, damping 28). The OUTER node wrapper —
 * the package canvas's rAF drag <g> translate(x, y) — is UNTOUCHED
 * this release; this inner card never animates position, and no
 * shadow / width / height / top/left is ever animated anywhere.
 *
 * THE CHOREOGRAPHY (gm1): a spawn enters at opacity 0 / scale 0.68 and
 * springs to rest, its delay = spawnIndex · 0.07s (the layer's per-
 * batch sequential index — 0, 1, 2…). The exit spring collapses to
 * opacity 0 / scale 0.72 with NO delay (deletes must leave promptly);
 * the per-state transition overrides the shared enter transition.
 *
 * THE GHOST VARIANT: exit ghosts mount at REST (initial={false} — the
 * static canvas node vanished in the same commit, so the ghost must
 * take over seamlessly) and play the exit spring when the layer marks
 * them leaving. Enter nodes carry NO exit props — their settle
 * unmount is a silent swap to the identical static node.
 *
 * REDUCED MOTION (gm3): renders the FINAL STATE (opacity 1 / scale 1,
 * no spring) — the reduced-motion hand-off arrives via the
 * useReducedMotion prop the layer calls.
 */
import { useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";

/** The spawn stagger, seconds per batch index (pairs with the 70ms edge delay). */
export const SPAWN_STAGGER_S = 0.07;

/** The spring constants — THE 440/28 contract (gate gm1). */
export const SPRING_STIFFNESS = 440;
export const SPRING_DAMPING = 28;

/** The exit collapse scale (the plan's 0.72). */
export const EXIT_SCALE = 0.72;

/** The enter-from scale (the plan's 0.68). */
export const ENTER_SCALE = 0.68;

export interface AnimatedGraphNodeProps {
  /** Per-batch sequential index (0, 1, 2…) — delay = index · 0.07s. */
  readonly spawnIndex?: number;
  /** Exit ghost: mounts at rest, plays the exit spring on removal. */
  readonly ghost?: boolean;
  /** Reduced motion hand-off: final state, no spring. */
  readonly reducedMotion?: boolean;
  /** Wrapper styles (the layer positions the card absolutely). */
  readonly style?: CSSProperties;
  /** Stable identity (the AnimatePresence key). */
  readonly settleKey: string;
  /** The node card content (the chip: ring + truncated label). */
  readonly children: ReactNode;
  /** Fires when the enter spring lands (the layer swaps to the static node). */
  readonly onSettled?: (key: string) => void;
}

export function AnimatedGraphNode({
  spawnIndex = 0,
  ghost = false,
  reducedMotion = false,
  style,
  settleKey,
  children,
  onSettled,
}: AnimatedGraphNodeProps) {
  // Ref-stable settle callback — never a restart trigger (it is not in
  // any effect dependency; motion invokes it as a plain prop callback).
  const settledRef = useRef(onSettled);
  settledRef.current = onSettled;

  if (reducedMotion) {
    // gm3 — REDUCED MOTION: final state, no spring, settle immediately.
    return (
      <motion.div
        className="sig-motion-node"
        style={style}
        data-testid="graph-motion-node"
        data-motion-engine="motion-react"
        data-motion-role="reduced"
        initial={false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0 }}
        onAnimationComplete={() => settledRef.current?.(settleKey)}
      >
        {children}
      </motion.div>
    );
  }

  if (ghost) {
    // THE EXIT GHOST — mounts at rest (initial={false}), collapses via
    // the 0.72 exit spring the moment the layer marks it leaving.
    return (
      <motion.div
        className="sig-motion-node"
        style={style}
        data-testid="graph-motion-node"
        data-motion-engine="motion-react"
        data-motion-role="exit-ghost"
        initial={false}
        animate={{ opacity: 1, scale: 1 }}
        exit={{
          opacity: 0,
          scale: EXIT_SCALE,
          transition: { type: "spring", stiffness: SPRING_STIFFNESS, damping: SPRING_DAMPING, delay: 0 },
        }}
      >
        {children}
      </motion.div>
    );
  }

  // THE SPAWN — opacity 0 / scale 0.68 → rest, staggered per batch.
  return (
    <motion.div
      className="sig-motion-node"
      style={style}
      data-testid="graph-motion-node"
      data-motion-engine="motion-react"
      data-motion-role="spawn"
      data-spawn-index={spawnIndex}
      initial={{ opacity: 0, scale: ENTER_SCALE }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: SPRING_STIFFNESS,
        damping: SPRING_DAMPING,
        delay: spawnIndex * SPAWN_STAGGER_S,
      }}
      onAnimationComplete={() => settledRef.current?.(settleKey)}
    >
      {children}
    </motion.div>
  );
}
