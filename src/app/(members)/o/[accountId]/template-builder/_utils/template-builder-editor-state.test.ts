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
    templateAnimation: null,
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
      templateAnimationId: null,
      useBackground: null,
      animation: null,
    });
  });
});

describe("mapCurrentSelectionToTemplateBuilderEditorState", () => {
  it("maps null current selection to empty state", () => {
    expect(mapCurrentSelectionToTemplateBuilderEditorState(null)).toEqual(
      createEmptyTemplateBuilderEditorState(),
    );
  });

  it("maps Animated selection with templateAnimation relation", () => {
    expect(
      mapCurrentSelectionToTemplateBuilderEditorState(
        minimalSelection({
          useBackground: "Animated",
          templateAnimation: { id: 42, presetId: "snow-field", name: "Snow" },
        }),
      ),
    ).toMatchObject({
      useBackground: "Animated",
      templateAnimationId: 42,
      animation: null,
    });
  });

  it("maps legacy useBackground to null writable mode", () => {
    expect(
      mapCurrentSelectionToTemplateBuilderEditorState(
        minimalSelection({ useBackground: "Graphics" }),
      ).useBackground,
    ).toBeNull();
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
      templateAnimationId: null,
      useBackground: "Gradient",
      animation: null,
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

  it("detects animation object changes", () => {
    const draft = {
      ...saved,
      animation: { type: "snow-field", speed: 2 },
    };
    const comparison = compareTemplateBuilderEditorStates(saved, draft);

    expect(comparison.isDirty).toBe(true);
    expect(getTemplateBuilderChangedFields(saved, draft)[0]?.field).toBe("animation");
  });
});

describe("cloneTemplateBuilderEditorState", () => {
  it("does not mutate saved animation when clone is modified", () => {
    const saved = {
      ...mapCurrentSelectionToTemplateBuilderEditorState(
        minimalSelection({
          useBackground: "Animated",
          templateAnimation: { id: 42, presetId: "snow-field", name: "Snow" },
        }),
      ),
      animation: { type: "snow-field", speed: 1 },
    };
    const draft = cloneTemplateBuilderEditorState(saved);

    draft.animation = { type: "snow-field", speed: 99 };

    expect(saved.animation?.["speed"]).toBe(1);
    expect(draft.animation?.["speed"]).toBe(99);
  });
});
