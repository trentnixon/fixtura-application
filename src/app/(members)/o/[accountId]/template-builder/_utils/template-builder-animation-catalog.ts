import type { AnimationPresetCatalogItem } from "@/types/api/all-template-options";
import type { TemplateAnimationConfig } from "@/types/api/template-options";

export function formatAnimationPresetLabel(preset: AnimationPresetCatalogItem): string {
  const name = preset.name?.trim();
  if (name) return name;
  return preset.presetId;
}

export function findAnimationPresetById(
  animations: AnimationPresetCatalogItem[],
  presetId: string | null | undefined,
): AnimationPresetCatalogItem | null {
  if (presetId == null || presetId.trim() === "") return null;
  return animations.find((item) => item.presetId === presetId) ?? null;
}

export function isAnimationPresetAvailable(
  animations: AnimationPresetCatalogItem[],
  presetId: string | null | undefined,
): boolean {
  return findAnimationPresetById(animations, presetId) !== null;
}

export function resolveDefaultAnimationPreset(
  animations: AnimationPresetCatalogItem[],
  defaultAnimationPresetId: string | null,
): AnimationPresetCatalogItem | null {
  if (defaultAnimationPresetId) {
    const fromId = findAnimationPresetById(animations, defaultAnimationPresetId);
    if (fromId) return fromId;
  }
  return animations.find((item) => item.isDefault) ?? animations[0] ?? null;
}

export function findAnimationPresetByNumericId(
  animations: AnimationPresetCatalogItem[],
  id: number | null | undefined,
): AnimationPresetCatalogItem | null {
  if (id == null || !Number.isInteger(id) || id <= 0) return null;
  return animations.find((item) => item.id === id) ?? null;
}

export function resolveAnimatedEditorFields(
  animations: AnimationPresetCatalogItem[],
  options: {
    templateAnimationId: number | null;
    templateAnimationPresetId: string | null;
  },
): { templateAnimationId: number | null; animation: TemplateAnimationConfig | null } {
  const { templateAnimationPresetId } = options;
  let templateAnimationId = options.templateAnimationId;

  let preset = findAnimationPresetByNumericId(animations, templateAnimationId);
  if (preset === null && templateAnimationPresetId) {
    preset = findAnimationPresetById(animations, templateAnimationPresetId);
    if (preset) templateAnimationId = preset.id;
  }

  if (preset === null) {
    return { templateAnimationId, animation: null };
  }

  return {
    templateAnimationId: preset.id,
    animation: buildDefaultAnimationForPreset(preset),
  };
}

export function mergeAnimationWithPresetDefaults(
  preset: AnimationPresetCatalogItem,
  overrides: Record<string, unknown> | null | undefined,
): TemplateAnimationConfig {
  const type = preset.presetId;
  const merged = {
    ...preset.defaultConfiguration,
    ...(overrides ?? {}),
    type,
  };
  return merged as TemplateAnimationConfig;
}

export function buildDefaultAnimationForPreset(
  preset: AnimationPresetCatalogItem,
): TemplateAnimationConfig {
  return mergeAnimationWithPresetDefaults(preset, null);
}

export function getAnimationPresetType(
  animation: Record<string, unknown> | null | undefined,
): string | null {
  if (animation == null) return null;
  const type = animation["type"];
  return typeof type === "string" && type.trim() !== "" ? type.trim() : null;
}

export function animationsEqual(
  a: TemplateAnimationConfig | null,
  b: TemplateAnimationConfig | null,
): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  const keysA = Object.keys(a).sort();
  const keysB = Object.keys(b).sort();
  if (keysA.length !== keysB.length) return false;
  for (let i = 0; i < keysA.length; i++) {
    if (keysA[i] !== keysB[i]) return false;
    const key = keysA[i]!;
    if (a[key] !== b[key]) return false;
  }
  return true;
}

export function cloneAnimationConfig(
  animation: TemplateAnimationConfig | null,
): TemplateAnimationConfig | null {
  if (animation === null) return null;
  return { ...animation };
}
