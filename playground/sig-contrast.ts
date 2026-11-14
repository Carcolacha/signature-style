/**
 * sig-contrast — THE CANONICAL WCAG 2.x CONTRAST MATH (3.2.0).
 *
 * ONE pure module, two consumers:
 *   - playground/verify-contrast.mjs  (the release gate — imports this file;
 *     Node ≥ 23.6 strips the types natively, the generate-llms precedent);
 *   - playground/theme-utils.ts       (the live customizer's contrast badges).
 *
 * Sharing the module means the gate and the badges can never disagree about
 * what a ratio IS: the sRGB linearization, the 0.2126/0.7152/0.0722 weights,
 * the (L1 + 0.05) / (L2 + 0.05) quotient — verbatim WCAG 2.x. No DOM, no
 * React, no I/O: hex in, number out.
 */

/** WCAG 2.x relative luminance of a #rgb / #rrggbb hex string. */
export function luminance(hex: string): number {
  const raw = hex.replace("#", "");
  const full = raw.length === 3 ? [...raw].map((c) => c + c).join("") : raw;
  if (!/^[0-9a-f]{6}$/i.test(full)) throw new Error(`not a 6-digit hex: ${hex}`);
  const [r, g, b] = [0, 2, 4]
    .map((i) => parseInt(full.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio, order-independent. */
export function contrastRatio(fg: string, bg: string): number {
  const [l1, l2] = [luminance(fg), luminance(bg)].sort((a, z) => z - a);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** The customizer badge tier: green ≥3.1 · amber 2.0–3.1 · red <2.0. */
export function badgeTier(ratio: number): "pass" | "amber" | "fail" {
  if (ratio >= 3.1) return "pass";
  if (ratio >= 2.0) return "amber";
  return "fail";
}
