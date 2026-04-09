import { tryNormalizeHex } from "./hex";

/** WCAG 2.1 relative luminance for sRGB hex (6-digit). */
export function relativeLuminance(hex: string): number | null {
  const n = tryNormalizeHex(hex);
  if (!n) return null;
  const r = parseInt(n.slice(1, 3), 16) / 255;
  const g = parseInt(n.slice(3, 5), 16) / 255;
  const b = parseInt(n.slice(5, 7), 16) / 255;
  const linear = [r, g, b].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  );
  const R = linear[0] ?? 0;
  const G = linear[1] ?? 0;
  const B = linear[2] ?? 0;
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Contrast ratio of white (#FFFFFF) text on the given background colour.
 * Higher is more readable. WCAG AA body text typically targets >= 4.5:1.
 */
export function contrastWhiteOnBackground(hex: string): number | null {
  const Lbg = relativeLuminance(hex);
  if (Lbg === null) return null;
  const Lw = 1; // white
  const lighter = Math.max(Lw, Lbg);
  const darker = Math.min(Lw, Lbg);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Below this ratio, white text on the brand colour is considered weak (PDR recommended mode). */
export const WHITE_ON_BRAND_MIN_CONTRAST_RECOMMENDED = 4.5;

export function isWeakWhiteOnBrandContrast(hex: string): boolean {
  const ratio = contrastWhiteOnBackground(hex);
  if (ratio === null) return false;
  return ratio < WHITE_ON_BRAND_MIN_CONTRAST_RECOMMENDED;
}

/** Dark text fill used for readability checks (matches product `dark` token, 6-digit). */
export const DARK_TEXT_HEX = "#111111";

/**
 * Contrast ratio of dark text (`#111`-equivalent luminance) on the given background colour.
 */
export function contrastDarkOnBackground(hex: string): number | null {
  const Lbg = relativeLuminance(hex);
  if (Lbg === null) return null;
  const Ltext = relativeLuminance(DARK_TEXT_HEX);
  if (Ltext === null) return null;
  const lighter = Math.max(Ltext, Lbg);
  const darker = Math.min(Ltext, Lbg);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Below this ratio, dark (`#111`) text on the brand colour is considered weak (mirrors white threshold). */
export const DARK_ON_BRAND_MIN_CONTRAST_RECOMMENDED = WHITE_ON_BRAND_MIN_CONTRAST_RECOMMENDED;

export function isWeakDarkOnBrandContrast(hex: string): boolean {
  const ratio = contrastDarkOnBackground(hex);
  if (ratio === null) return false;
  return ratio < DARK_ON_BRAND_MIN_CONTRAST_RECOMMENDED;
}
