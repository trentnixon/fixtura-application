import { applyRemotionPreviewDraftToBranding } from "./apply-remotion-preview-draft-to-branding";
import { auditSavedBrandingNeedsCatalogResolver } from "./audit-saved-branding-completeness";
import { buildRemotionPreviewDraftForSavedBranding } from "./build-remotion-preview-draft-for-saved-branding";

import type { AccountBrandingData, AccountMediaLibraryImage } from "@/types/api/account";
import type {
  AllTemplateOptionsPayload,
  TemplateCategoryCatalogItem,
  TemplateTextureCatalogItem,
} from "@/types/api/all-template-options";

export type ResolveSavedBrandingForRemotionPreviewInput = {
  branding: AccountBrandingData | null;
  catalog: AllTemplateOptionsPayload | null;
  categoryOptions?: TemplateCategoryCatalogItem[] | null;
  previewImage?: AccountMediaLibraryImage | null;
  textureCatalog?: TemplateTextureCatalogItem[] | null;
};

/** True when saved branding lacks fields the assembly path needs for the active background. */
export function needsCatalogToResolveSavedBranding(
  branding: AccountBrandingData | null | undefined,
): boolean {
  if (branding == null) return false;
  return auditSavedBrandingNeedsCatalogResolver(branding).length > 0;
}

export function readTemplateOptionIdFromBranding(
  branding: AccountBrandingData | null | undefined,
): number | null {
  const fromTop = branding?.templateOptionId;
  if (typeof fromTop === "number" && Number.isInteger(fromTop) && fromTop > 0) {
    return fromTop;
  }
  const fromOption = branding?.template_option?.["id"];
  if (typeof fromOption === "number" && Number.isInteger(fromOption) && fromOption > 0) {
    return fromOption;
  }
  return null;
}

/**
 * Expand thin saved branding using aggregate catalog data (builder-equivalent draft overlay).
 * Returns branding unchanged when the audit passes or catalog/draft is unavailable.
 */
export function resolveSavedBrandingForRemotionPreview({
  branding,
  catalog,
  categoryOptions = null,
  previewImage = null,
  textureCatalog = null,
}: ResolveSavedBrandingForRemotionPreviewInput): AccountBrandingData | null {
  if (branding === null) return null;
  if (!needsCatalogToResolveSavedBranding(branding)) return branding;
  if (catalog === null) return branding;

  const draft = buildRemotionPreviewDraftForSavedBranding(branding, catalog);
  if (draft === null) return branding;

  return (
    applyRemotionPreviewDraftToBranding({
      branding,
      catalog,
      categoryOptions,
      draft,
      previewImage,
      textureCatalog,
    }) ?? branding
  );
}
