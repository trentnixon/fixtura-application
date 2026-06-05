import { describe, expect, it } from "vitest";

import {
  cloneTemplateBuilderEditorState,
  compareTemplateBuilderEditorStates,
  createEmptyTemplateBuilderEditorState,
  getTemplateBuilderChangedFields,
  hasTemplateBuilderEditorChanges,
  mapCurrentSelectionToTemplateBuilderEditorState,
} from "./template-builder-editor-state";

import type { CurrentTemplateSelection } from "@/types/api/all-template-options";

function minimalSelection(
  overrides: Partial<CurrentTemplateSelection> = {},
): CurrentTemplateSelection {
  return {
    id: 99,
    useBackground: "Gradient",
    templateCategory: { id: 1, name: null, slug: null, divideFixturesBy: null },
    templateMode: { id: 2, name: null, slug: null },
    templatePalette: { id: 3, name: null, value: null },
    templateGradient: { id: 4, name: null, type: null, direction: null },
    templateImage: {
      id: 5,
      name: null,
      animationType: null,
      animationDirection: null,
      overlayStyle: null,
      gradientType: null,
      overlayOpacity: null,
    },
    templateNoise: { id: 6, name: null, noiseType: null },
    templateParticle: {
      id: 7,
      name: null,
      particleType: null,
      particleCount: null,
      speed: null,
      direction: null,
      animationType: null,
    },
    templatePattern: {
      id: 8,
      name: null,
      patternType: null,
      animation: null,
      scale: null,
      rotation: null,
      opacity: null,
      animationDuration: null,
      animationSpeed: null,
    },
    templateTexture: { id: 9, name: null, opacity: null, blendMode: null, texture: null },
    templateVideo: {
      id: 10,
      name: null,
      position: null,
      size: null,
      loop: null,
      muted: null,
      offthread: null,
      volume: null,
      rate: null,
      overlay: null,
    },
    ...overrides,
  };
}

describe("createEmptyTemplateBuilderEditorState", () => {
  it("returns all relation ids null and useBackground null", () => {
    expect(createEmptyTemplateBuilderEditorState()).toEqual({
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
    });
  });
});

describe("mapCurrentSelectionToTemplateBuilderEditorState", () => {
  it("maps null current selection to empty state", () => {
    expect(mapCurrentSelectionToTemplateBuilderEditorState(null)).toEqual(
      createEmptyTemplateBuilderEditorState(),
    );
  });

  it("maps undefined current selection to empty state", () => {
    expect(mapCurrentSelectionToTemplateBuilderEditorState(undefined)).toEqual(
      createEmptyTemplateBuilderEditorState(),
    );
  });

  it("maps full current selection to all relation ids", () => {
    expect(mapCurrentSelectionToTemplateBuilderEditorState(minimalSelection())).toEqual({
      templateCategoryId: 1,
      templateModeId: 2,
      templatePaletteId: 3,
      templateGradientId: 4,
      templateImageId: 5,
      templateNoiseId: 6,
      templateParticleId: 7,
      templatePatternId: 8,
      templateTextureId: 9,
      templateVideoId: 10,
      useBackground: "Gradient",
    });
  });

  it("maps partially empty current selection with null relations", () => {
    expect(
      mapCurrentSelectionToTemplateBuilderEditorState(
        minimalSelection({
          templateCategory: null,
          templateMode: null,
          templatePalette: null,
          useBackground: null,
        }),
      ),
    ).toEqual({
      templateCategoryId: null,
      templateModeId: null,
      templatePaletteId: null,
      templateGradientId: 4,
      templateImageId: 5,
      templateNoiseId: 6,
      templateParticleId: 7,
      templatePatternId: 8,
      templateTextureId: 9,
      templateVideoId: 10,
      useBackground: null,
    });
  });
});

describe("compareTemplateBuilderEditorStates", () => {
  const saved = mapCurrentSelectionToTemplateBuilderEditorState(minimalSelection());

  it("reports not dirty when saved and draft are identical", () => {
    const draft = cloneTemplateBuilderEditorState(saved);
    const comparison = compareTemplateBuilderEditorStates(saved, draft);

    expect(comparison.isDirty).toBe(false);
    expect(comparison.changedCount).toBe(0);
    expect(hasTemplateBuilderEditorChanges(saved, draft)).toBe(false);
    expect(getTemplateBuilderChangedFields(saved, draft)).toHaveLength(0);
  });

  it("marks dirty and increments changed count for one id change", () => {
    const draft = { ...saved, templatePaletteId: 99 };
    const comparison = compareTemplateBuilderEditorStates(saved, draft);

    expect(comparison.isDirty).toBe(true);
    expect(comparison.changedCount).toBe(1);
    const changed = getTemplateBuilderChangedFields(saved, draft);
    expect(changed).toHaveLength(1);
    expect(changed[0]?.field).toBe("templatePaletteId");
  });

  it("detects useBackground change", () => {
    const draft = { ...saved, useBackground: "Solid" as const };
    const comparison = compareTemplateBuilderEditorStates(saved, draft);

    expect(comparison.isDirty).toBe(true);
    expect(comparison.changedCount).toBe(1);
    expect(getTemplateBuilderChangedFields(saved, draft)[0]?.field).toBe("useBackground");
  });

  it("marks draft null values as unset", () => {
    const draft = { ...saved, templateCategoryId: null };
    const field = compareTemplateBuilderEditorStates(saved, draft).fields.find(
      (f) => f.field === "templateCategoryId",
    );

    expect(field?.isUnset).toBe(true);
    expect(field?.isChanged).toBe(true);
  });
});

describe("cloneTemplateBuilderEditorState", () => {
  it("does not mutate saved state when clone is modified", () => {
    const saved = mapCurrentSelectionToTemplateBuilderEditorState(minimalSelection());
    const draft = cloneTemplateBuilderEditorState(saved);

    draft.templateModeId = 999;

    expect(saved.templateModeId).toBe(2);
    expect(draft.templateModeId).toBe(999);
  });
});
