import { relativeLuminance } from "./contrast";
import { tryNormalizeHex } from "./hex";

/** Max Euclidean distance in RGB space (0–255) to treat two colours as “very similar” (warning only). */
export const RGB_DISTANCE_SIMILARITY_THRESHOLD = 32;

/** Both stops are extremely light — white text may struggle on the gradient. */
export const BOTH_VERY_LIGHT_LUMINANCE_MIN = 0.88;

/** Both stops are extremely dark — dark text may struggle on the gradient. */
export const BOTH_VERY_DARK_LUMINANCE_MAX = 0.14;

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const n = tryNormalizeHex(hex);
  if (!n) return null;
  return {
    r: parseInt(n.slice(1, 3), 16),
    g: parseInt(n.slice(3, 5), 16),
    b: parseInt(n.slice(5, 7), 16),
  };
}

/**
 * Euclidean distance in RGB space (0–~441).
 */
export function rgbDistance(a: string, b: string): number | null {
  const ra = hexToRgb(a);
  const rb = hexToRgb(b);
  if (!ra || !rb) return null;
  return Math.sqrt((ra.r - rb.r) ** 2 + (ra.g - rb.g) ** 2 + (ra.b - rb.b) ** 2);
}

/**
 * True when the two colours are distinct but visually very close (sandbox approximation).
 */
export function colorsAreTooSimilar(a: string, b: string): boolean {
  const d = rgbDistance(a, b);
  if (d === null) return false;
  return d > 0 && d < RGB_DISTANCE_SIMILARITY_THRESHOLD;
}

export function bothColorsVeryLight(a: string, b: string): boolean {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  if (la === null || lb === null) return false;
  return la >= BOTH_VERY_LIGHT_LUMINANCE_MIN && lb >= BOTH_VERY_LIGHT_LUMINANCE_MIN;
}

export function bothColorsVeryDark(a: string, b: string): boolean {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  if (la === null || lb === null) return false;
  return la <= BOTH_VERY_DARK_LUMINANCE_MAX && lb <= BOTH_VERY_DARK_LUMINANCE_MAX;
}
