import type { TemplateBuilderEditorState } from "./template-builder-editor-state";
import type { TemplateUseBackground } from "@/types/api/template-options";

/** Relation fields gated by `useBackground` (not category/mode/palette/pattern/animation). */
export type BackgroundRelationFieldKey =
  | "templateGradientId"
  | "templateImageId"
  | "templateNoiseId"
  | "templateParticleId"
  | "templateTextureId"
  | "templateVideoId"
  | "templateAnimationId";

export type PrimaryRelationFieldKey = "templateModeId" | "templatePaletteId";

export type VisibilityRelationFieldKey = PrimaryRelationFieldKey | BackgroundRelationFieldKey;

export const BACKGROUND_CHILD_FIELD_BY_USE_BACKGROUND: Partial<
  Record<TemplateUseBackground, BackgroundRelationFieldKey>
> = {
  Gradient: "templateGradientId",
  Image: "templateImageId",
  Video: "templateVideoId",
  Texture: "templateTextureId",
  Animated: "templateAnimationId",
};

export const PRIMARY_RELATION_FIELDS = [
  "templateModeId",
  "templatePaletteId",
] as const satisfies readonly PrimaryRelationFieldKey[];

export const BACKGROUND_RELATION_FIELDS = [
  "templateGradientId",
  "templateImageId",
  "templateNoiseId",
  "templateParticleId",
  "templateTextureId",
  "templateVideoId",
  "templateAnimationId",
] as const satisfies readonly BackgroundRelationFieldKey[];

export function getActiveBackgroundRelationField(
  useBackground: TemplateUseBackground | null,
): BackgroundRelationFieldKey | null {
  if (useBackground === null) return null;
  return BACKGROUND_CHILD_FIELD_BY_USE_BACKGROUND[useBackground] ?? null;
}

export function isBackgroundRelationFieldVisible(
  field: BackgroundRelationFieldKey,
  useBackground: TemplateUseBackground | null,
): boolean {
  return getActiveBackgroundRelationField(useBackground) === field;
}

export function isRelationFieldVisible(
  field: VisibilityRelationFieldKey,
  useBackground: TemplateUseBackground | null,
): boolean {
  if ((PRIMARY_RELATION_FIELDS as readonly string[]).includes(field)) return true;
  return isBackgroundRelationFieldVisible(field as BackgroundRelationFieldKey, useBackground);
}

export function clearInactiveBackgroundRelations(
  state: TemplateBuilderEditorState,
  nextUseBackground: TemplateUseBackground | null,
): TemplateBuilderEditorState {
  const next = {
    ...state,
    animation: nextUseBackground === "Animated" ? state.animation : null,
    templateAnimationId: nextUseBackground === "Animated" ? state.templateAnimationId : null,
  };
  for (const field of BACKGROUND_RELATION_FIELDS) {
    if (!isBackgroundRelationFieldVisible(field, nextUseBackground)) {
      next[field] = null;
    }
  }
  return next;
}

/** Draft state with inactive background relation ids nulled for preview/save. */
export function applyBackgroundVisibilityToEditorState(
  state: TemplateBuilderEditorState,
): TemplateBuilderEditorState {
  return clearInactiveBackgroundRelations(state, state.useBackground);
}
