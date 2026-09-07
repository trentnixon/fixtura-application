import { templateModeSlugToRemotionMode } from "./template-mode-to-remotion-mode";

import type { AccountBrandingData } from "@/types/api/account";

function modeStringFromRecord(record: Record<string, unknown> | null): string | null {
  if (record == null) return null;
  const raw = record["mode"];
  if (typeof raw !== "string" || raw.trim() === "") return null;
  return raw;
}

/**
 * Prefer the saved template option over legacy theme JSON.
 */
export function readRemotionModeFromBrandingThemeJson(
  branding: AccountBrandingData | null | undefined,
): string | null {
  const optionMode = modeStringFromRecord(branding?.template_option ?? null);
  const resolvedOptionMode = templateModeSlugToRemotionMode(optionMode);
  if (resolvedOptionMode !== null) return resolvedOptionMode;
  const themeRow = branding?.theme?.theme;
  const themeRec =
    themeRow != null && typeof themeRow === "object" && !Array.isArray(themeRow)
      ? (themeRow as Record<string, unknown>)
      : null;
  const fromTheme = modeStringFromRecord(themeRec);
  if (fromTheme != null) return templateModeSlugToRemotionMode(fromTheme);

  return null;
}
