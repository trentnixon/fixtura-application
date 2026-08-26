import type { TemplateUseBackground } from "@/types/api/template-options";

/** Unsaved template-builder choices for Account Remotion Preview (not full editor state). */
export type RemotionPreviewDraft = {
  templateCategoryId: number | null;
  templateModeId: number | null;
  templatePaletteId: number | null;
  templateGradientId: number | null;
  templateImageId: number | null;
  templateNoiseId: number | null;
  templateParticleId: number | null;
  templatePatternId: number | null;
  templateTextureId: number | null;
  templateVideoId: number | null;
  useBackground: TemplateUseBackground | null;
};

type BackgroundRelationFieldKey =
  | "templateGradientId"
  | "templateImageId"
  | "templateNoiseId"
  | "templateParticleId"
  | "templateTextureId"
  | "templateVideoId";

const BACKGROUND_CHILD_FIELD_BY_USE_BACKGROUND: Partial<
  Record<TemplateUseBackground, BackgroundRelationFieldKey>
> = {
  Gradient: "templateGradientId",
  Graphics: "templateNoiseId",
  Image: "templateImageId",
  Video: "templateVideoId",
  Texture: "templateTextureId",
  Particle: "templateParticleId",
};

const BACKGROUND_RELATION_FIELDS = [
  "templateGradientId",
  "templateImageId",
  "templateNoiseId",
  "templateParticleId",
  "templateTextureId",
  "templateVideoId",
] as const satisfies readonly BackgroundRelationFieldKey[];

function getActiveBackgroundRelationField(
  useBackground: TemplateUseBackground | null,
): BackgroundRelationFieldKey | null {
  if (useBackground === null) return null;
  return BACKGROUND_CHILD_FIELD_BY_USE_BACKGROUND[useBackground] ?? null;
}

/** Null inactive background relation ids for preview assembly. */
export function applyBackgroundVisibilityToRemotionPreviewDraft(
  draft: RemotionPreviewDraft,
): RemotionPreviewDraft {
  const next = { ...draft };
  const active = getActiveBackgroundRelationField(draft.useBackground);
  for (const field of BACKGROUND_RELATION_FIELDS) {
    if (field !== active) {
      next[field] = null;
    }
  }
  return next;
}
