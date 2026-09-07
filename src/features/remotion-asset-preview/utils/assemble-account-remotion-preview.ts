import { applyRemotionPreviewDraftToBranding } from "./apply-remotion-preview-draft-to-branding";
import { mergeAccountBrandingIntoDataset } from "./merge-account-branding-into-dataset";
import { resolveSavedBrandingForRemotionPreview } from "./resolve-saved-branding-for-remotion-preview";

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
  previewImage?: AccountMediaLibraryImage | null;
  /** When saved branding is thin, pass aggregate catalog for client-side expansion. */
  templateOptionsCatalog?: AllTemplateOptionsPayload | null;
  templateCategoryCatalog?: TemplateCategoryCatalogItem[] | null;
  textureCatalog?: TemplateTextureCatalogItem[] | null;
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
    const categoryOptions = source.templateCategoryCatalog ?? templateCategoryCatalog ?? null;

    let branding = resolveSavedBrandingForRemotionPreview({
      branding: source.branding,
      catalog: source.templateOptionsCatalog ?? null,
      categoryOptions,
      previewImage: source.previewImage ?? null,
      textureCatalog: source.textureCatalog ?? null,
    });

    if (branding === null || source.previewImage == null) return branding;

    const imagePreset = branding.template_option?.["image"] ?? branding.theme?.theme?.["image"];
    return {
      ...branding,
      template_option: {
        ...branding.template_option,
        image: {
          ...(typeof imagePreset === "object" && imagePreset !== null && !Array.isArray(imagePreset)
            ? imagePreset
            : {}),
          image: source.previewImage,
        },
      },
    };
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
