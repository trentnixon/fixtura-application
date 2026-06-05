import { isTemplateUseBackground } from "@/types/api/template-options";

import { applyBackgroundVisibilityToEditorState } from "./template-builder-field-visibility";

import type { TemplateBuilderEditorState } from "./template-builder-editor-state";
import type { PutTemplateOptionsBody } from "@/types/api/template-options";

const RELATION_ID_KEYS = [
  "templateCategoryId",
  "templateModeId",
  "templatePaletteId",
  "templateGradientId",
  "templateImageId",
  "templateNoiseId",
  "templateParticleId",
  "templatePatternId",
  "templateTextureId",
  "templateVideoId",
] as const satisfies readonly (keyof PutTemplateOptionsBody)[];

export function getTemplateBuilderSaveValidationErrors(
  state: TemplateBuilderEditorState,
): string[] {
  const errors: string[] = [];
  if (state.templateCategoryId === null) errors.push("Category is required to save.");
  if (state.templateModeId === null) errors.push("Mode is required to save.");
  if (state.useBackground === null) errors.push("Use background is required to save.");
  return errors;
}

export function mapTemplateBuilderEditorStateToPutBody(
  state: TemplateBuilderEditorState,
): PutTemplateOptionsBody {
  const normalized = applyBackgroundVisibilityToEditorState(state);

  if (normalized.templateCategoryId === null) {
    throw new Error("Category is required to save.");
  }
  if (normalized.templateModeId === null) {
    throw new Error("Mode is required to save.");
  }
  if (normalized.useBackground === null || !isTemplateUseBackground(normalized.useBackground)) {
    throw new Error("Use background is required to save.");
  }

  const body: PutTemplateOptionsBody = {
    templateCategoryId: normalized.templateCategoryId,
    templateModeId: normalized.templateModeId,
    templatePaletteId: normalized.templatePaletteId,
    templateGradientId: normalized.templateGradientId,
    templateImageId: normalized.templateImageId,
    templateNoiseId: normalized.templateNoiseId,
    templateParticleId: normalized.templateParticleId,
    templatePatternId: normalized.templatePatternId,
    templateTextureId: normalized.templateTextureId,
    templateVideoId: normalized.templateVideoId,
    useBackground: normalized.useBackground,
  };

  for (const key of RELATION_ID_KEYS) {
    const v = body[key];
    if (v === undefined) continue;
    if (v !== null && (!Number.isInteger(v) || v <= 0)) {
      throw new Error(`Invalid ${key} for save payload`);
    }
  }

  return body;
}
