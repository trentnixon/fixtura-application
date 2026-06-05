import { normalizeUseBackgroundFromApi } from "./template-builder-use-background-helpers";

import type { CurrentTemplateSelection } from "@/types/api/all-template-options";
import type { TemplateUseBackground } from "@/types/api/template-options";

export type TemplateBuilderOptionId = number | null;

export interface TemplateBuilderEditorState {
  templateCategoryId: TemplateBuilderOptionId;
  templateModeId: TemplateBuilderOptionId;
  templatePaletteId: TemplateBuilderOptionId;
  templateGradientId: TemplateBuilderOptionId;
  templateImageId: TemplateBuilderOptionId;
  templateNoiseId: TemplateBuilderOptionId;
  templateParticleId: TemplateBuilderOptionId;
  templatePatternId: TemplateBuilderOptionId;
  templateTextureId: TemplateBuilderOptionId;
  templateVideoId: TemplateBuilderOptionId;
  useBackground: TemplateUseBackground | null;
}

export type TemplateBuilderEditorField = keyof TemplateBuilderEditorState;

export interface TemplateBuilderFieldComparison {
  field: TemplateBuilderEditorField;
  savedValue: TemplateBuilderEditorState[TemplateBuilderEditorField];
  draftValue: TemplateBuilderEditorState[TemplateBuilderEditorField];
  isChanged: boolean;
  isUnset: boolean;
}

export interface TemplateBuilderStateComparison {
  fields: TemplateBuilderFieldComparison[];
  isDirty: boolean;
  changedCount: number;
}

export const TEMPLATE_BUILDER_EDITOR_FIELDS = [
  "templateCategoryId",
  "useBackground",
  "templateModeId",
  "templatePaletteId",
  "templateGradientId",
  "templateImageId",
  "templateNoiseId",
  "templateParticleId",
  "templatePatternId",
  "templateTextureId",
  "templateVideoId",
] as const satisfies readonly TemplateBuilderEditorField[];

export function createEmptyTemplateBuilderEditorState(): TemplateBuilderEditorState {
  return {
    templateCategoryId: null,
    templateModeId: null,
    templatePaletteId: null,
    templateGradientId: null,
    templateImageId: null,
    templateNoiseId: null,
    templateParticleId: null,
    templatePatternId: null,
    templateTextureId: null,
    templateVideoId: null,
    useBackground: null,
  };
}

export function mapCurrentSelectionToTemplateBuilderEditorState(
  currentSelection: CurrentTemplateSelection | null | undefined,
): TemplateBuilderEditorState {
  if (currentSelection == null) {
    return createEmptyTemplateBuilderEditorState();
  }

  return {
    templateCategoryId: currentSelection.templateCategory?.id ?? null,
    templateModeId: currentSelection.templateMode?.id ?? null,
    templatePaletteId: currentSelection.templatePalette?.id ?? null,
    templateGradientId: currentSelection.templateGradient?.id ?? null,
    templateImageId: currentSelection.templateImage?.id ?? null,
    templateNoiseId: currentSelection.templateNoise?.id ?? null,
    templateParticleId: currentSelection.templateParticle?.id ?? null,
    templatePatternId: currentSelection.templatePattern?.id ?? null,
    templateTextureId: currentSelection.templateTexture?.id ?? null,
    templateVideoId: currentSelection.templateVideo?.id ?? null,
    useBackground: normalizeUseBackgroundFromApi(currentSelection.useBackground),
  };
}

export function cloneTemplateBuilderEditorState(
  state: TemplateBuilderEditorState,
): TemplateBuilderEditorState {
  return { ...state };
}

export function compareTemplateBuilderEditorStates(
  savedState: TemplateBuilderEditorState,
  draftState: TemplateBuilderEditorState,
): TemplateBuilderStateComparison {
  const fields = TEMPLATE_BUILDER_EDITOR_FIELDS.map((field) => {
    const savedValue = savedState[field];
    const draftValue = draftState[field];
    const isChanged = savedValue !== draftValue;
    const isUnset = draftValue === null;

    return {
      field,
      savedValue,
      draftValue,
      isChanged,
      isUnset,
    };
  });

  const changedCount = fields.filter((f) => f.isChanged).length;

  return {
    fields,
    isDirty: changedCount > 0,
    changedCount,
  };
}

export function hasTemplateBuilderEditorChanges(
  savedState: TemplateBuilderEditorState,
  draftState: TemplateBuilderEditorState,
): boolean {
  return compareTemplateBuilderEditorStates(savedState, draftState).isDirty;
}

export function getTemplateBuilderChangedFields(
  savedState: TemplateBuilderEditorState,
  draftState: TemplateBuilderEditorState,
): TemplateBuilderFieldComparison[] {
  return compareTemplateBuilderEditorStates(savedState, draftState).fields.filter(
    (f) => f.isChanged,
  );
}

export function isTemplateBuilderEditorField(field: string): field is TemplateBuilderEditorField {
  return (TEMPLATE_BUILDER_EDITOR_FIELDS as readonly string[]).includes(field);
}
