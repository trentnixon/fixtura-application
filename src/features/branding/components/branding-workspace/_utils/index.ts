import { bothColorsVeryDark, bothColorsVeryLight, colorsAreTooSimilar } from "@/lib/brand-color";
import { themeColoursFromAccountBrandingTheme } from "@/lib/branding/theme-colours-from-account";

import type { AccountBrandingData, OnboardingThemeOption } from "@/types/api/account";

export function readTemplateModeId(option: AccountBrandingData["template_option"]): number | null {
  if (!option || typeof option !== "object") return null;
  const mid = option["modeId"];
  return typeof mid === "number" && Number.isFinite(mid) ? mid : null;
}

export function cmsThemeRowColours(
  row: OnboardingThemeOption,
): { primary: string; secondary: string } | null {
  if (row.theme != null && typeof row.theme === "object") {
    const c = themeColoursFromAccountBrandingTheme({
      id: row.id,
      name: row.label,
      theme: row.theme,
    });
    return { primary: c.primary, secondary: c.secondary };
  }
  return null;
}

export function computeFormWarnings(
  np: string | null,
  ns: string | null,
  duplicate: boolean,
): string[] {
  if (!np || !ns || duplicate) return [];
  const out: string[] = [];
  if (colorsAreTooSimilar(np, ns)) {
    out.push("These colors are very similar and may not create enough distinction in assets");
  }
  if (bothColorsVeryLight(np, ns)) {
    out.push("Both colors are extremely light; white text may be hard to read on the gradient");
  }
  if (bothColorsVeryDark(np, ns)) {
    out.push("Both colors are extremely dark; dark text may be hard to read on the gradient");
  }
  return out;
}
