import { applyBackgroundVisibilityToEditorState } from "./template-builder-field-visibility";

import type { TemplateBuilderEditorState } from "./template-builder-editor-state";
import type { AccountBrandingData, AccountBrandingTemplateOption } from "@/types/api/account";
import type {
  AllTemplateOptionsPayload,
  TemplateCategoryCatalogItem,
  TemplateModeItem,
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
  const noise = findById(catalog.noises, draft.templateNoiseId);
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
