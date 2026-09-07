import { readRemotionAnimationFromBranding } from "./read-remotion-background-assets-from-branding";
import { readUseBackgroundFromAccountBranding } from "./read-use-background-from-account-branding";
import { applyBackgroundVisibilityToRemotionPreviewDraft } from "../types/remotion-preview-draft";

import type { RemotionPreviewDraft } from "../types/remotion-preview-draft";
import type { AccountBrandingData } from "@/types/api/account";
import type {
  AllTemplateOptionsPayload,
  AnimationPresetCatalogItem,
} from "@/types/api/all-template-options";
import type {
  TemplateAnimationConfig,
  TemplateUseBackgroundWrite,
} from "@/types/api/template-options";

function isWriteBackground(value: string | null): value is TemplateUseBackgroundWrite {
  return (
    value === "Solid" ||
    value === "Gradient" ||
    value === "Video" ||
    value === "Image" ||
    value === "Texture" ||
    value === "Animated"
  );
}

function readOptionId(
  option: Record<string, unknown> | null | undefined,
  key: string,
): number | null {
  if (option == null) return null;
  const value = option[key];
  if (typeof value === "number" && Number.isInteger(value) && value > 0) return value;
  return null;
}

function readNestedId(value: unknown): number | null {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return null;
  const id = (value as Record<string, unknown>)["id"];
  if (typeof id === "number" && Number.isInteger(id) && id > 0) return id;
  return null;
}

function readRelationId(
  option: Record<string, unknown>,
  flatKey: string,
  nestedKey: string,
): number | null {
  return readOptionId(option, flatKey) ?? readNestedId(option[nestedKey]);
}

function findAnimationPresetByNumericId(
  animations: AnimationPresetCatalogItem[],
  id: number | null | undefined,
): AnimationPresetCatalogItem | null {
  if (id == null || !Number.isInteger(id) || id <= 0) return null;
  return animations.find((item) => item.id === id) ?? null;
}

function findAnimationPresetByPresetId(
  animations: AnimationPresetCatalogItem[],
  presetId: string | null | undefined,
): AnimationPresetCatalogItem | null {
  if (presetId == null || presetId.trim() === "") return null;
  return animations.find((item) => item.presetId === presetId) ?? null;
}

function buildDefaultAnimationForPreset(
  preset: AnimationPresetCatalogItem,
): TemplateAnimationConfig {
  return {
    ...preset.defaultConfiguration,
    type: preset.presetId,
  } as TemplateAnimationConfig;
}

function resolveAnimatedDraftFields(
  animations: AnimationPresetCatalogItem[],
  options: {
    templateAnimationId: number | null;
    templateAnimationPresetId: string | null;
  },
): TemplateAnimationConfig | null {
  let templateAnimationId = options.templateAnimationId;
  let preset = findAnimationPresetByNumericId(animations, templateAnimationId);
  if (preset === null && options.templateAnimationPresetId) {
    preset = findAnimationPresetByPresetId(animations, options.templateAnimationPresetId);
    if (preset) templateAnimationId = preset.id;
  }
  if (preset === null) return null;
  return buildDefaultAnimationForPreset(preset);
}

function readAnimationPresetIdFromBranding(branding: AccountBrandingData): string | null {
  const animation = readRemotionAnimationFromBranding(branding);
  if (animation?.type && animation.type.trim() !== "") return animation.type.trim();

  const row = branding.template_option?.["animation"];
  if (row != null && typeof row === "object" && !Array.isArray(row)) {
    const type = (row as Record<string, unknown>)["type"];
    if (typeof type === "string" && type.trim() !== "") return type.trim();
  }

  const fromSelection = branding.template_option?.["templateAnimation"];
  if (fromSelection != null && typeof fromSelection === "object" && !Array.isArray(fromSelection)) {
    const presetId = (fromSelection as Record<string, unknown>)["presetId"];
    if (typeof presetId === "string" && presetId.trim() !== "") return presetId.trim();
  }

  return null;
}

function draftFromCurrentSelection(
  catalog: AllTemplateOptionsPayload,
): RemotionPreviewDraft | null {
  const selection = catalog.currentSelection;
  if (selection == null) return null;

  const useBackgroundRaw = selection.useBackground;
  const useBackground = isWriteBackground(useBackgroundRaw) ? useBackgroundRaw : null;
  const animation =
    useBackground === "Animated"
      ? resolveAnimatedDraftFields(catalog.animations ?? [], {
          templateAnimationId: selection.templateAnimation?.id ?? null,
          templateAnimationPresetId: selection.templateAnimation?.presetId ?? null,
        })
      : null;

  return applyBackgroundVisibilityToRemotionPreviewDraft({
    templateCategoryId: selection.templateCategory?.id ?? null,
    templateModeId: selection.templateMode?.id ?? null,
    templatePaletteId: selection.templatePalette?.id ?? null,
    templateGradientId: selection.templateGradient?.id ?? null,
    templateImageId: selection.templateImage?.id ?? null,
    templateNoiseId: selection.templateNoise?.id ?? null,
    templateParticleId: selection.templateParticle?.id ?? null,
    templatePatternId: selection.templatePattern?.id ?? null,
    templateTextureId: selection.templateTexture?.id ?? null,
    templateVideoId: selection.templateVideo?.id ?? null,
    useBackground,
    animation,
  });
}

function draftFromSavedTemplateOption(
  branding: AccountBrandingData,
  catalog: AllTemplateOptionsPayload,
): RemotionPreviewDraft | null {
  const option = branding.template_option;
  if (option == null || typeof option !== "object" || Array.isArray(option)) return null;

  const useBackground = readUseBackgroundFromAccountBranding(branding);
  if (!isWriteBackground(useBackground)) return null;

  const opt = option as Record<string, unknown>;
  const animationExisting = readRemotionAnimationFromBranding(branding);
  const animation =
    useBackground === "Animated"
      ? ((animationExisting as TemplateAnimationConfig | null) ??
        resolveAnimatedDraftFields(catalog.animations ?? [], {
          templateAnimationId: readRelationId(opt, "templateAnimationId", "templateAnimation"),
          templateAnimationPresetId: readAnimationPresetIdFromBranding(branding),
        }))
      : null;

  return applyBackgroundVisibilityToRemotionPreviewDraft({
    templateCategoryId: readRelationId(opt, "categoryId", "templateCategory"),
    templateModeId: readRelationId(opt, "modeId", "templateMode"),
    templatePaletteId: readRelationId(opt, "paletteId", "palette"),
    templateGradientId: readRelationId(opt, "gradientId", "gradient"),
    templateImageId: readRelationId(opt, "imageId", "image"),
    templateNoiseId: readRelationId(opt, "noiseId", "noise"),
    templateParticleId: readRelationId(opt, "particleId", "particle"),
    templatePatternId: readRelationId(opt, "patternId", "pattern"),
    templateTextureId: readRelationId(opt, "textureId", "texture"),
    templateVideoId: readRelationId(opt, "videoId", "video"),
    useBackground,
    animation,
  });
}

/** Builder-equivalent draft from aggregate currentSelection (preferred). */
export function buildRemotionPreviewDraftFromCurrentSelection(
  catalog: AllTemplateOptionsPayload | null,
): RemotionPreviewDraft | null {
  if (catalog === null) return null;
  return draftFromCurrentSelection(catalog);
}

/** Fallback draft from saved template_option relation ids when currentSelection is absent. */
export function buildRemotionPreviewDraftFromSavedTemplateOption(
  branding: AccountBrandingData,
  catalog: AllTemplateOptionsPayload,
): RemotionPreviewDraft | null {
  return draftFromSavedTemplateOption(branding, catalog);
}

export function buildRemotionPreviewDraftForSavedBranding(
  branding: AccountBrandingData,
  catalog: AllTemplateOptionsPayload,
): RemotionPreviewDraft | null {
  return (
    buildRemotionPreviewDraftFromSavedTemplateOption(branding, catalog) ??
    buildRemotionPreviewDraftFromCurrentSelection(catalog)
  );
}
