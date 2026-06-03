import { resolveRemotionTemplateFromSlug } from "@/components/remotion/_utils/resolve-remotion-template-from-slug";
import { resolveAccountTemplateCategorySlug } from "@/lib/branding/resolve-account-template-category-slug";
import { themeColoursFromAccountBrandingTheme } from "@/lib/branding/theme-colours-from-account";

import { buildClubSponsorsPayloadFromAccountSponsors } from "./build-club-sponsors-payload-from-account-sponsors";
import { readRemotionModeFromBrandingThemeJson } from "./read-remotion-mode-from-branding-theme";
import { templateModeSlugToRemotionMode } from "./template-mode-to-remotion-mode";

import type { AccountBrandingData, AccountSponsorDto } from "@/types/api/account";
import type { FixturaDataset } from "@/vendor/fixtura-remotion-assets/preview";

export type MergeAccountBrandingInput = {
  branding: AccountBrandingData | null;
  logoUrl: string | null;
  templateModeSlug: string | null;
  /**
   * GET /sponsors items. When null/undefined, example sponsor JSON is still removed and replaced
   * with an empty cricket-shaped payload until the client passes loaded rows.
   */
  accountSponsors?: AccountSponsorDto[] | null;
};

function ensureRecord(parent: Record<string, unknown>, key: string): Record<string, unknown> {
  const v = parent[key];
  if (v != null && typeof v === "object" && !Array.isArray(v)) {
    return v as Record<string, unknown>;
  }
  const next: Record<string, unknown> = {};
  parent[key] = next;
  return next;
}

/** `useBackground` selects the background pipeline (e.g. Solid, Graphics); lives on `theme.theme` or `template_option`. */
function readUseBackgroundFromAccountBranding(
  branding: AccountBrandingData | null | undefined,
): string | null {
  const slices = [branding?.theme?.theme, branding?.template_option];
  for (const row of slices) {
    if (row == null || typeof row !== "object" || Array.isArray(row)) continue;
    const raw = (row as Record<string, unknown>)["useBackground"];
    if (typeof raw === "string" && raw.trim() !== "") return raw.trim();
  }
  return null;
}

/**
 * Clone example dataset and apply account branding (template, theme, logo, template mode).
 */
export function mergeAccountBrandingIntoDataset(
  base: FixturaDataset,
  input: MergeAccountBrandingInput,
): { data: FixturaDataset; usedTemplateFallback: boolean } {
  const next = structuredClone(base) as Record<string, unknown>;
  const { template, usedFallback } = resolveRemotionTemplateFromSlug(
    resolveAccountTemplateCategorySlug(input.branding),
  );
  const palette = themeColoursFromAccountBrandingTheme(input.branding?.theme ?? null);

  const videoMeta = ensureRecord(next, "videoMeta");
  const video = ensureRecord(videoMeta, "video");
  const appearance = ensureRecord(video, "appearance");
  appearance["template"] = template;
  appearance["theme"] = {
    primary: palette.primary,
    secondary: palette.secondary,
    dark: palette.dark,
    white: palette.white,
  };

  const club = ensureRecord(videoMeta, "club");
  club["sponsors"] = buildClubSponsorsPayloadFromAccountSponsors(input.accountSponsors ?? null);

  const logo = ensureRecord(club, "logo");
  if (input.logoUrl != null && input.logoUrl.trim() !== "") {
    logo["url"] = input.logoUrl.trim();
    logo["hasLogo"] = true;
  }

  const templateVariation = ensureRecord(video, "templateVariation");
  const remotionMode =
    readRemotionModeFromBrandingThemeJson(input.branding) ??
    templateModeSlugToRemotionMode(input.templateModeSlug);
  if (remotionMode !== null) {
    templateVariation["mode"] = remotionMode;
  }
  const category = ensureRecord(templateVariation, "category");
  category["slug"] = template;

  const useBackground = readUseBackgroundFromAccountBranding(input.branding);
  if (useBackground !== null) {
    templateVariation["useBackground"] = useBackground;
  }

  return { data: next as FixturaDataset, usedTemplateFallback: usedFallback };
}
