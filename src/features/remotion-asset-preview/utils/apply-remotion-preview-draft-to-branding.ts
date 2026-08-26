import { resolveRemotionNoiseFromCatalogNoise } from "./read-remotion-noise-from-catalog";
import { applyBackgroundVisibilityToRemotionPreviewDraft } from "../types/remotion-preview-draft";

import type { RemotionPreviewDraft } from "../types/remotion-preview-draft";
import type {
  AccountBrandingData,
  AccountBrandingTemplateOption,
  AccountMediaLibraryImage,
} from "@/types/api/account";
import type {
  AllTemplateOptionsPayload,
  TemplateCategoryCatalogItem,
  TemplateModeItem,
  TemplateNoiseItem,
  TemplateTextureCatalogItem,
} from "@/types/api/all-template-options";

function findById<T extends { id: number }>(items: T[], id: number | null): T | null {
  if (id === null) return null;
  return items.find((item) => item.id === id) ?? null;
}

function categoryToTemplateOptionValue(category: TemplateCategoryCatalogItem | null) {
  if (category === null) return null;
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    divideFixturesBy: category.divideFixturesBy,
    bundleAudio:
      category.bundleAudio == null
        ? null
        : {
            id: category.bundleAudio.id,
            name: category.bundleAudio.name,
            audio_options: category.bundleAudio.audioOptions,
          },
  };
}

function modeSlug(mode: TemplateModeItem | null): string | null {
  return mode?.slug?.trim() || mode?.name?.trim() || null;
}

function resolveNoiseCatalogItem(
  catalog: AllTemplateOptionsPayload,
  noiseId: number | null,
): TemplateNoiseItem | null {
  if (noiseId === null) return null;

  const fromCatalog = findById(catalog.noises, noiseId);
  const fromCurrent =
    catalog.currentSelection?.templateNoise?.id === noiseId
      ? catalog.currentSelection.templateNoise
      : null;

  if (fromCatalog === null) return fromCurrent;
  if (fromCurrent === null) return fromCatalog;

  return {
    id: fromCatalog.id,
    name: fromCatalog.name ?? fromCurrent.name,
    noiseType: fromCatalog.noiseType ?? fromCurrent.noiseType,
  };
}

function enrichNoiseForPreview(noise: TemplateNoiseItem | null): TemplateNoiseItem | null {
  if (noise === null) return null;

  const resolved = resolveRemotionNoiseFromCatalogNoise(noise);
  if (resolved === null) return noise;

  return {
    ...noise,
    noiseType: resolved.type,
  };
}

function resolveTextureCatalogItem(
  textureId: number | null,
  textureCatalog: TemplateTextureCatalogItem[] | null | undefined,
  fallbackCatalog: TemplateTextureCatalogItem[],
  currentSelectionTexture: TemplateTextureCatalogItem | null | undefined,
): TemplateTextureCatalogItem | null {
  if (textureId === null) return null;

  const fromUi = textureCatalog?.find((item) => item.id === textureId) ?? null;
  if (fromUi !== null) return fromUi;

  const fromFatCatalog = fallbackCatalog.find((item) => item.id === textureId) ?? null;
  if (fromFatCatalog !== null) return fromFatCatalog;

  if (currentSelectionTexture?.id === textureId) {
    return currentSelectionTexture;
  }

  return null;
}

function mergeTemplateOptionDraft(
  current: AccountBrandingTemplateOption | null,
  draft: RemotionPreviewDraft,
  catalog: AllTemplateOptionsPayload,
  categoryOptions?: TemplateCategoryCatalogItem[] | null,
  previewImage?: AccountMediaLibraryImage | null,
  textureCatalog?: TemplateTextureCatalogItem[] | null,
): AccountBrandingTemplateOption {
  const categorySource =
    categoryOptions && categoryOptions.length > 0 ? categoryOptions : catalog.categories;
  const category = findById(categorySource, draft.templateCategoryId);
  const mode = findById(catalog.modes, draft.templateModeId);
  const palette = findById(catalog.palettes, draft.templatePaletteId);
  const gradient = findById(catalog.gradients, draft.templateGradientId);
  const image = findById(catalog.images, draft.templateImageId);
  const noise = enrichNoiseForPreview(resolveNoiseCatalogItem(catalog, draft.templateNoiseId));
  const particle = findById(catalog.particles, draft.templateParticleId);
  const pattern = findById(catalog.patterns, draft.templatePatternId);
  const texture = resolveTextureCatalogItem(
    draft.templateTextureId,
    textureCatalog,
    catalog.textures,
    catalog.currentSelection?.templateTexture,
  );
  const video = findById(catalog.videos, draft.templateVideoId);
  const imageForPreview =
    draft.useBackground === "Image" && previewImage != null
      ? {
          ...(image ?? {}),
          image: previewImage,
        }
      : image;

  return {
    ...(current ?? {}),
    category: categoryToTemplateOptionValue(category),
    categoryId: draft.templateCategoryId,
    mode: modeSlug(mode),
    modeId: draft.templateModeId,
    palette,
    paletteId: draft.templatePaletteId,
    gradient,
    gradientId: draft.templateGradientId,
    image: imageForPreview,
    imageId: draft.templateImageId,
    noise,
    noiseId: draft.templateNoiseId,
    particle,
    particleId: draft.templateParticleId,
    pattern,
    patternId: draft.templatePatternId,
    texture,
    textureId: draft.templateTextureId,
    video,
    videoId: draft.templateVideoId,
    useBackground: draft.useBackground,
  };
}

export type ApplyRemotionPreviewDraftInput = {
  branding: AccountBrandingData | null;
  catalog: AllTemplateOptionsPayload | null;
  categoryOptions?: TemplateCategoryCatalogItem[] | null;
  draft: RemotionPreviewDraft | null;
  previewImage?: AccountMediaLibraryImage | null;
  textureCatalog?: TemplateTextureCatalogItem[] | null;
};

/**
 * Overlay Remotion Preview Draft onto saved branding for assembly.
 * Internal to Account Remotion Preview — prefer `assembleAccountRemotionPreview`.
 */
export function applyRemotionPreviewDraftToBranding({
  branding,
  catalog,
  categoryOptions,
  draft,
  previewImage = null,
  textureCatalog = null,
}: ApplyRemotionPreviewDraftInput): AccountBrandingData | null {
  if (branding === null || catalog === null || draft === null) {
    return branding;
  }

  const categorySource =
    categoryOptions && categoryOptions.length > 0 ? categoryOptions : catalog.categories;
  const category = findById(categorySource, draft.templateCategoryId);
  const mode = findById(catalog.modes, draft.templateModeId);
  const modeValue = modeSlug(mode);
  const visibleDraft = applyBackgroundVisibilityToRemotionPreviewDraft(draft);
  const nextTemplateOption = mergeTemplateOptionDraft(
    branding.template_option,
    visibleDraft,
    catalog,
    categoryOptions,
    previewImage,
    textureCatalog,
  );

  return {
    ...branding,
    template:
      branding.template == null
        ? null
        : {
            ...branding.template,
            category: category?.slug?.trim() || category?.name?.trim() || null,
            divideFixturesBy: category?.divideFixturesBy ?? null,
          },
    theme:
      branding.theme == null
        ? null
        : {
            ...branding.theme,
            theme: {
              ...branding.theme.theme,
              ...(modeValue !== null ? { mode: modeValue } : {}),
              modeId: visibleDraft.templateModeId,
              useBackground: visibleDraft.useBackground,
            },
          },
    template_option: nextTemplateOption,
  };
}
