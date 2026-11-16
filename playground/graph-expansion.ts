/**
 * graph-expansion — THE LOCAL AI EXPAND GENERATOR (3.9.0).
 *
 * "AI Expand Node" on the Graph Studio Action Dock expands the selected
 * node into 3-4 sub-nodes with context-derived labels. THIS IS A LOCAL
 * HEURISTIC GENERATOR — no network, no model, no API key (the
 * zero-dependency doctrine holds): a curated template pool per token
 * bucket, selected through a deterministic id-hash seed. The SAME node
 * ALWAYS expands into the SAME sub-nodes — same labels, same tokens,
 * same order — which is what makes it gate-testable (the mm4 probe
 * expands, resets, expands again, and asserts byte-equality).
 *
 * THE MECHANICS:
 *   · bucket — every --sig-* token maps to ONE of four planning buckets
 *     (Considerations / Risks / Dependencies / Next steps) via the
 *     curated BUCKET_BY_TOKEN table (color-family semantics: reds and
 *     peaches plan as Risks, greens as Next steps, blues as
 *     Dependencies, pinks/purples/yellows as Considerations). An
 *     unknown token hashes into a bucket — every input lands somewhere.
 *   · seed — the node id rides the same 31-multiplier hash the canvas
 *     layout uses; it fixes the sub-node COUNT (3 or 4), the pool
 *     rotation start, and the accent rotation start.
 *   · dedupe — labels already present in the graph (case-insensitive)
 *     are skipped; the rotation walks the pool until it has enough
 *     fresh labels. A exhausted pool appends a deterministic Roman
 *     suffix rather than a random one.
 *   · accents — each sub-node wears a DISTINCT --sig-* accentToken from
 *     the fixed four-token rotation, starting at the seed offset.
 */
import type { GraphNode } from "@edwyn/signature-style/react";

/** One generated sub-node — label + its distinct chromatic accent. */
export interface ExpandedIdea {
  readonly label: string;
  readonly token: string;
}

/** The four planning buckets — the pool keys. */
export type ExpansionBucket = "Considerations" | "Risks" | "Dependencies" | "Next steps";

/** The curated template pools — plain-English, domain-neutral. */
const POOLS: Record<ExpansionBucket, readonly string[]> = {
  Considerations: [
    "Scope check",
    "Effort estimate",
    "Owner sign-off",
    "Success measure",
    "Constraints review",
    "Timeline reality",
  ],
  Risks: [
    "Failure mode",
    "Data loss risk",
    "Rollback plan",
    "Single point of failure",
    "Security review",
    "Load ceiling",
  ],
  Dependencies: [
    "Upstream API",
    "Schema migration",
    "Access credentials",
    "Vendor SLA",
    "Tooling upgrade",
    "Team availability",
  ],
  "Next steps": [
    "Draft the spec",
    "Prototype spike",
    "Schedule review",
    "Ship behind a flag",
    "Gather feedback",
    "Write the docs",
  ],
};

/** The curated token → bucket map (all 26 --sig-* tokens). */
const BUCKET_BY_TOKEN: Readonly<Record<string, ExpansionBucket>> = {
  "--sig-pink-bright": "Considerations",
  "--sig-pink-soft": "Considerations",
  "--sig-pink-alt": "Considerations",
  "--sig-mauve-bright": "Considerations",
  "--sig-mauve-soft": "Considerations",
  "--sig-lavender": "Considerations",
  "--sig-orchid": "Considerations",
  "--sig-violet-glow": "Considerations",
  "--sig-pink-glow": "Considerations",
  "--sig-rose-glow": "Considerations",
  "--sig-yellow": "Considerations",
  "--sig-citron": "Considerations",
  "--sig-peach": "Risks",
  "--sig-crimson": "Risks",
  "--sig-tangerine": "Risks",
  "--sig-magenta": "Risks",
  "--sig-green": "Next steps",
  "--sig-mint": "Next steps",
  "--sig-spring": "Next steps",
  "--sig-neon-green": "Next steps",
  "--sig-lime-glow": "Next steps",
  "--sig-mint-glow": "Next steps",
  "--sig-sky": "Dependencies",
  "--sig-cobalt": "Dependencies",
  "--sig-azure": "Dependencies",
  "--sig-cyan": "Dependencies",
};

/** The fixed four-accent rotation — distinct within every expansion. */
const ACCENTS: readonly string[] = [
  "--sig-cyan",
  "--sig-orchid",
  "--sig-mint",
  "--sig-cobalt",
];

/** The Roman suffixes for the (rare) exhausted-pool fallback. */
const ROMAN: readonly string[] = [" II", " III", " IV", " V", " VI"];

/** Deterministic, order-independent tie-break hash (the canvas's own). */
function idHash(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** The bucket for a token — curated table first, hash fallback second. */
export function bucketForToken(token: string): ExpansionBucket {
  const curated = BUCKET_BY_TOKEN[token];
  if (curated !== undefined) return curated;
  const hashed = Object.keys(POOLS)[idHash(token) % 4];
  return hashed as ExpansionBucket;
}

/**
 * THE PURE GENERATOR. `takenLabels` — every label already on the
 * canvas (the caller maps its graph); the generator never duplicates
 * one. Deterministic: (node.id, takenLabels) fully decide the output.
 */
export function expandNodeIdeas(
  node: Pick<GraphNode, "id" | "label" | "categoryToken">,
  takenLabels: readonly string[],
): ExpandedIdea[] {
  const seed = idHash(node.id);
  const count = 3 + (seed % 2); // 3 or 4 sub-nodes
  const bucket = bucketForToken(node.categoryToken);
  const pool = POOLS[bucket];
  const taken = new Set(takenLabels.map((label) => label.trim().toLowerCase()));
  const ideas: ExpandedIdea[] = [];
  let rotation = 0;
  let suffix = 0;
  while (ideas.length < count && rotation < pool.length * 3) {
    const candidate = pool[(seed + rotation) % pool.length] ?? "";
    rotation += 1;
    const key = candidate.toLowerCase();
    if (taken.has(key)) continue;
    taken.add(key);
    ideas.push({ label: candidate, token: "" });
    continue;
  }
  // The exhausted-pool fallback — deterministic Roman suffixes.
  while (ideas.length < count) {
    const base = pool[seed % pool.length] ?? "Consideration";
    const label = `${base}${ROMAN[suffix % ROMAN.length] ?? " VII"}`;
    suffix += 1;
    if (!taken.has(label.toLowerCase())) {
      taken.add(label.toLowerCase());
      ideas.push({ label, token: "" });
    }
  }
  // THE ACCENT ROTATION — distinct within the expansion, seeded start.
  return ideas.map((idea, index) => ({
    ...idea,
    token: ACCENTS[(seed + index) % ACCENTS.length] as string,
  }));
}
