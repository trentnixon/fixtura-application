import { templateModeSlugToRemotionMode } from "./template-mode-to-remotion-mode";

import type { AccountBrandingData } from "@/types/api/account";

function modeStringFromRecord(record: Record<string, unknown> | null): string | null {
  if (record == null) return null;
  const raw = record["mode"];
  if (typeof raw !== "string" || raw.trim() === "") return null;
  return raw;
}

/**
 * Reads saved appearance `mode` from `theme.theme` or, when absent (common Phase-3 shape),
 * from `template_option`, and maps it to Remotion `templateVariation.mode`.
 */
export function readRemotionModeFromBrandingThemeJson(
  branding: AccountBrandingData | null | undefined,
): string | null {
  const themeRow = branding?.theme?.theme;
  const themeRec =
    themeRow != null && typeof themeRow === "object" && !Array.isArray(themeRow)
      ? (themeRow as Record<string, unknown>)
      : null;
  const fromTheme = modeStringFromRecord(themeRec);
  if (fromTheme != null) return templateModeSlugToRemotionMode(fromTheme);

  const opt = branding?.template_option;
  if (opt == null || typeof opt !== "object" || Array.isArray(opt)) return null;
  const fromOption = modeStringFromRecord(opt as Record<string, unknown>);
  return fromOption != null ? templateModeSlugToRemotionMode(fromOption) : null;
}
