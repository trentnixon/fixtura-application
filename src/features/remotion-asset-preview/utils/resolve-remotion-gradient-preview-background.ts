import tinycolor from "tinycolor2";

import {
  resolveRemotionGradientFromCatalogGradient,
  type RemotionGradientDirectionKey,
  type RemotionGradientTypeKey,
  type RemotionTemplateVariationGradient,
} from "./read-remotion-gradient-from-branding";

import type { RemotionPaletteKey } from "./read-remotion-palette-key-from-branding";
import type { TemplateGradientItem } from "@/types/api/all-template-options";

const GRADIENT_DIRECTION_CSS: Record<RemotionGradientDirectionKey, string> = {
  HORIZONTAL: "to right",
  HORIZONTAL_REVERSE: "to left",
  VERTICAL: "to bottom",
  VERTICAL_REVERSE: "to top",
  DIAGONAL: "to bottom right",
  DIAGONAL_REVERSE: "to top left",
  CONIC: "to bottom",
};

function directionToCss(direction: RemotionGradientDirectionKey): string {
  return GRADIENT_DIRECTION_CSS[direction];
}

function conicAngleForDirection(direction: RemotionGradientDirectionKey): number {
  switch (direction) {
    case "HORIZONTAL":
      return 90;
    case "HORIZONTAL_REVERSE":
      return 270;
    case "VERTICAL":
      return 180;
    case "VERTICAL_REVERSE":
      return 0;
    case "DIAGONAL":
      return 135;
    case "DIAGONAL_REVERSE":
      return 315;
    default:
      return 45;
  }
}

function colorWithAlpha(color: string, alpha: number): string {
  return tinycolor(color).setAlpha(alpha).toRgbString();
}

function generateMeshGradient(main: string, secondary: string): string {
  return [
    `linear-gradient(217deg, ${colorWithAlpha(main, 0.8)}, ${colorWithAlpha(main, 0)})`,
    `linear-gradient(127deg, ${colorWithAlpha(secondary, 0.8)}, ${colorWithAlpha(secondary, 0)})`,
  ].join(", ");
}

/** Mirrors vendor `determineGradientTypeForPalette`. */
export function determineGradientTypeForPaletteKey(
  paletteKey: RemotionPaletteKey | null,
  baseType: RemotionGradientTypeKey,
): RemotionGradientTypeKey {
  if (paletteKey === null) return baseType;
  const lower = paletteKey.toLowerCase();
  if (!lower.includes("onblack") && !lower.includes("onwhite")) return baseType;
  if (baseType === "primary") return "primaryToSecondary";
  if (baseType === "secondary") return "secondaryToPrimary";
  return baseType;
}

export function resolveRemotionGradientFromTemplateItem(
  gradient: TemplateGradientItem,
): RemotionTemplateVariationGradient | null {
  return resolveRemotionGradientFromCatalogGradient(gradient);
}

/**
 * CSS `background` for a template-builder gradient tile.
 * Uses palette pair colors (main + secondary) from the selected color layout.
 */
export function resolveRemotionGradientPreviewBackground(
  gradient: TemplateGradientItem,
  paletteMain: string,
  paletteSecondary: string,
  paletteKey: RemotionPaletteKey | null = null,
): string | null {
  const resolved = resolveRemotionGradientFromTemplateItem(gradient);
  if (resolved === null) return null;

  const type = determineGradientTypeForPaletteKey(paletteKey, resolved.type);
  const dir = directionToCss(resolved.direction);
  const main = paletteMain;
  const secondary = paletteSecondary;

  switch (type) {
    case "primary":
    case "primaryToSecondary":
      return `linear-gradient(${dir}, ${main}, ${secondary})`;
    case "secondary":
    case "secondaryToPrimary":
      return `linear-gradient(${dir}, ${secondary}, ${main})`;
    case "primaryAdvanced":
      return `linear-gradient(${dir}, ${main}, ${tinycolor(main).lighten(20).toString()})`;
    case "secondaryAdvanced":
      return `linear-gradient(${dir}, ${secondary}, ${tinycolor(secondary).lighten(20).toString()})`;
    case "primaryRadial":
      return `radial-gradient(circle at center, ${tinycolor(main).lighten(25).toString()}, ${main})`;
    case "secondaryRadial":
      return `radial-gradient(circle at center, ${tinycolor(secondary).lighten(25).toString()}, ${secondary})`;
    case "conicGradient":
      return `conic-gradient(from ${conicAngleForDirection(resolved.direction)}deg at center, ${main}, ${secondary}, ${main})`;
    case "hardStopGradient":
      return `linear-gradient(${dir}, ${main} 50%, ${secondary} 50%)`;
    case "meshGradient":
      return generateMeshGradient(main, secondary);
    default:
      return `linear-gradient(${dir}, ${main}, ${secondary})`;
  }
}
