import { applyRemotionPreviewDraftToBranding } from "./apply-remotion-preview-draft-to-branding";
import { mergeAccountBrandingIntoDataset } from "./merge-account-branding-into-dataset";

import type { RemotionPreviewDraft } from "../types/remotion-preview-draft";
import type {
  AccountBrandingData,
  AccountMediaLibraryImage,
  AccountSponsorDto,
} from "@/types/api/account";
import type {
  AllTemplateOptionsPayload,
  TemplateCategoryCatalogItem,
  TemplateTextureCatalogItem,
} from "@/types/api/all-template-options";
import type { FixturaDataset } from "@/vendor/fixtura-remotion-assets/preview";

export type AssembleAccountRemotionPreviewSavedSource = {
  kind: "saved";
  branding: AccountBrandingData | null;
};

export type AssembleAccountRemotionPreviewDraftSource = {
  kind: "draft";
  branding: AccountBrandingData | null;
  draft: RemotionPreviewDraft;
  templateOptionsCatalog: AllTemplateOptionsPayload;
  templateCategoryCatalog?: TemplateCategoryCatalogItem[] | null;
  textureCatalog?: TemplateTextureCatalogItem[] | null;
  previewImage?: AccountMediaLibraryImage | null;
};

export type AssembleAccountRemotionPreviewSource =
  AssembleAccountRemotionPreviewSavedSource | AssembleAccountRemotionPreviewDraftSource;

export type AssembleAccountRemotionPreviewInput = {
  base: FixturaDataset;
  source: AssembleAccountRemotionPreviewSource;
  logoUrl: string | null;
  templateModeSlug: string | null;
  /** Hydrates category slug when branding only has `template_option.categoryId`. Always pass when available. */
  templateCategoryCatalog?: TemplateCategoryCatalogItem[] | null;
  accountSponsors?: AccountSponsorDto[] | null;
};

export type AssembleAccountRemotionPreviewResult = {
  data: FixturaDataset;
  usedTemplateFallback: boolean;
};

function resolveBrandingForSource(
  source: AssembleAccountRemotionPreviewSource,
  templateCategoryCatalog: TemplateCategoryCatalogItem[] | null | undefined,
): AccountBrandingData | null {
  if (source.kind === "saved") {
    return source.branding;
  }

  const categoryOptions = source.templateCategoryCatalog ?? templateCategoryCatalog ?? null;

  return applyRemotionPreviewDraftToBranding({
    branding: source.branding,
    catalog: source.templateOptionsCatalog,
    categoryOptions,
    draft: source.draft,
    previewImage: source.previewImage ?? null,
    textureCatalog: source.textureCatalog ?? null,
  });
}

/**
 * Account Remotion Preview assembly: saved or draft branding + sponsors → playable dataset.
 */
export function assembleAccountRemotionPreview(
  input: AssembleAccountRemotionPreviewInput,
): AssembleAccountRemotionPreviewResult {
  const branding = resolveBrandingForSource(input.source, input.templateCategoryCatalog);

  const catalogForHydration =
    input.templateCategoryCatalog ??
    (input.source.kind === "draft" ? input.source.templateCategoryCatalog : null) ??
    null;

  return mergeAccountBrandingIntoDataset(input.base, {
    branding,
    logoUrl: input.logoUrl,
    templateModeSlug: input.templateModeSlug,
    templateCategoryCatalog: catalogForHydration,
    accountSponsors: input.accountSponsors ?? null,
  });
}
