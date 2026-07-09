import { resolveRemotionNoiseFromCatalogNoise } from "@/features/remotion-asset-preview/utils/read-remotion-noise-from-catalog";

import { applyBackgroundVisibilityToEditorState } from "./template-builder-field-visibility";

import type { TemplateBuilderEditorState } from "./template-builder-editor-state";
import type { AccountBrandingData, AccountBrandingTemplateOption } from "@/types/api/account";
import type {
  AllTemplateOptionsPayload,
  TemplateCategoryCatalogItem,
  TemplateModeItem,
  TemplateNoiseItem,
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

function mergeTemplateOptionDraft(
  current: AccountBrandingTemplateOption | null,
  draft: TemplateBuilderEditorState,
  catalog: AllTemplateOptionsPayload,
  categoryOptions?: TemplateCategoryCatalogItem[] | null,
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
  const texture = findById(catalog.textures, draft.templateTextureId);
  const video = findById(catalog.videos, draft.templateVideoId);

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
    image,
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

export function buildTemplateBuilderPreviewBranding({
  branding,
  catalog,
  categoryOptions,
  draft,
}: {
  branding: AccountBrandingData | null;
  catalog: AllTemplateOptionsPayload | null;
  categoryOptions?: TemplateCategoryCatalogItem[] | null;
  draft: TemplateBuilderEditorState | null;
}): AccountBrandingData | null {
  if (branding === null || catalog === null || draft === null) {
    return branding;
  }

  const categorySource =
    categoryOptions && categoryOptions.length > 0 ? categoryOptions : catalog.categories;
  const category = findById(categorySource, draft.templateCategoryId);
  const mode = findById(catalog.modes, draft.templateModeId);
  const modeValue = modeSlug(mode);
  const visibleDraft = applyBackgroundVisibilityToEditorState(draft);
  const nextTemplateOption = mergeTemplateOptionDraft(
    branding.template_option,
    visibleDraft,
    catalog,
    categoryOptions,
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
