import { resolveRemotionTemplateFromSlug } from "@/components/remotion/_utils/resolve-remotion-template-from-slug";
import { resolveAccountTemplateCategorySlug } from "@/lib/branding/resolve-account-template-category-slug";
import { themeColoursFromAccountBrandingTheme } from "@/lib/branding/theme-colours-from-account";

import { buildClubSponsorsPayloadFromAccountSponsors } from "./build-club-sponsors-payload-from-account-sponsors";
import {
  readRemotionBackgroundAssetsPatch,
  REMOTION_BACKGROUND_TV_KEYS,
} from "./read-remotion-background-assets-from-branding";
import { readRemotionGradientFromBranding } from "./read-remotion-gradient-from-branding";
import { readRemotionModeFromBrandingThemeJson } from "./read-remotion-mode-from-branding-theme";
import { readRemotionPaletteKeyFromBranding } from "./read-remotion-palette-key-from-branding";
import { readUseBackgroundFromAccountBranding } from "./read-use-background-from-account-branding";
import { templateModeSlugToRemotionMode } from "./template-mode-to-remotion-mode";

export { readUseBackgroundFromAccountBranding } from "./read-use-background-from-account-branding";

import type { AccountBrandingData, AccountSponsorDto } from "@/types/api/account";
import type { TemplateCategoryCatalogItem } from "@/types/api/all-template-options";
import type { FixturaDataset } from "@/vendor/fixtura-remotion-assets/preview";

export type MergeAccountBrandingInput = {
  branding: AccountBrandingData | null;
  logoUrl: string | null;
  templateModeSlug: string | null;
  /** Hydrates category slug when branding only has `template_option.categoryId`. */
  templateCategoryCatalog?: TemplateCategoryCatalogItem[] | null;
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

/**
 * Clone example dataset and apply account branding (template, theme, logo, template mode).
 */
export function mergeAccountBrandingIntoDataset(
  base: FixturaDataset,
  input: MergeAccountBrandingInput,
): { data: FixturaDataset; usedTemplateFallback: boolean } {
  const next = structuredClone(base) as Record<string, unknown>;
  const { template, usedFallback } = resolveRemotionTemplateFromSlug(
    resolveAccountTemplateCategorySlug(input.branding, input.templateCategoryCatalog),
  );
  const themeColours = themeColoursFromAccountBrandingTheme(input.branding?.theme ?? null);

  const videoMeta = ensureRecord(next, "videoMeta");
  const video = ensureRecord(videoMeta, "video");
  const media = ensureRecord(video, "media");
  delete media["HeroImage"];
  delete media["heroImage"];
  const appearance = ensureRecord(video, "appearance");
  appearance["template"] = template;
  appearance["theme"] = {
    primary: themeColours.primary,
    secondary: themeColours.secondary,
    dark: themeColours.dark,
    white: themeColours.white,
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

  const paletteKey = readRemotionPaletteKeyFromBranding(input.branding);
  if (paletteKey !== null) {
    templateVariation["palette"] = paletteKey;
  }

  const gradient = readRemotionGradientFromBranding(input.branding);
  if (gradient !== null) {
    templateVariation["gradient"] = gradient;
  }

  const backgroundPatch = readRemotionBackgroundAssetsPatch(input.branding);
  for (const key of REMOTION_BACKGROUND_TV_KEYS) {
    if (!(key in backgroundPatch)) {
      delete templateVariation[key];
    }
  }
  for (const [key, value] of Object.entries(backgroundPatch)) {
    if (value != null) {
      templateVariation[key] = value;
    }
  }

  return { data: next as FixturaDataset, usedTemplateFallback: usedFallback };
}
