import { bothColorsVeryDark, bothColorsVeryLight, colorsAreTooSimilar } from "@/lib/brand-color";
import { themeColoursFromAccountBrandingTheme } from "@/lib/branding/theme-colours-from-account";

import type { AccountBrandingData, OnboardingThemeOption } from "@/types/api/account";

export function readTemplateModeId(option: AccountBrandingData["template_option"]): number | null {
  if (!option || typeof option !== "object") return null;
  const mid = option["modeId"];
  return typeof mid === "number" && Number.isFinite(mid) ? mid : null;
}

/** Saved template-category id on `template_option` (CMS / scheduler destruct shapes). */
export function readTemplateCategoryId(
  option: AccountBrandingData["template_option"],
): number | null {
  if (!option || typeof option !== "object") return null;
  const rec = option as Record<string, unknown>;

  const direct = rec["categoryId"] ?? rec["templateCategoryId"];
  if (typeof direct === "number" && Number.isFinite(direct)) return direct;

  for (const key of ["selectedCategory", "templateCategory", "category"]) {
    const nested = rec[key];
    if (nested != null && typeof nested === "object" && !Array.isArray(nested)) {
      const id = (nested as Record<string, unknown>)["id"];
      if (typeof id === "number" && Number.isFinite(id)) return id;
    }
  }

  return null;
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
