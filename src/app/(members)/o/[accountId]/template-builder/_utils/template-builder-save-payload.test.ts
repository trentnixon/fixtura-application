import { describe, expect, it } from "vitest";

import { createEmptyTemplateBuilderEditorState } from "./template-builder-editor-state";
import {
  getTemplateBuilderSaveValidationErrors,
  mapTemplateBuilderEditorStateToPutBody,
} from "./template-builder-save-payload";

describe("getTemplateBuilderSaveValidationErrors", () => {
  it("requires category, mode, and useBackground", () => {
    const errors = getTemplateBuilderSaveValidationErrors(createEmptyTemplateBuilderEditorState());
    expect(errors).toHaveLength(3);
    expect(errors.join(" ")).toMatch(/Category/);
    expect(errors.join(" ")).toMatch(/Mode/);
    expect(errors.join(" ")).toMatch(/Use background/);
  });

  it("returns no errors when required fields are set", () => {
    const state = {
      ...createEmptyTemplateBuilderEditorState(),
      templateCategoryId: 1,
      templateModeId: 2,
      useBackground: "Gradient" as const,
    };
    expect(getTemplateBuilderSaveValidationErrors(state)).toEqual([]);
  });

  it("requires animation preset when useBackground is Animated", () => {
    const state = {
      ...createEmptyTemplateBuilderEditorState(),
      templateCategoryId: 1,
      templateModeId: 2,
      useBackground: "Animated" as const,
      animation: null,
    };
    expect(getTemplateBuilderSaveValidationErrors(state).join(" ")).toMatch(/animation preset/i);
  });
});

describe("mapTemplateBuilderEditorStateToPutBody", () => {
  it("maps full draft state to flat PUT body", () => {
    const state = {
      ...createEmptyTemplateBuilderEditorState(),
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
      useBackground: "Video" as const,
    };

    expect(mapTemplateBuilderEditorStateToPutBody(state)).toEqual({
      templateCategoryId: 1,
      templateModeId: 2,
      templatePaletteId: 3,
      templateGradientId: null,
      templateImageId: null,
      templateNoiseId: null,
      templateParticleId: null,
      templatePatternId: 8,
      templateTextureId: null,
      templateVideoId: 10,
      templateAnimationId: null,
      useBackground: "Video",
    });
  });

  it("includes templateAnimationId for Animated saves (no animation JSON)", () => {
    const body = mapTemplateBuilderEditorStateToPutBody({
      ...createEmptyTemplateBuilderEditorState(),
      templateCategoryId: 1,
      templateModeId: 2,
      useBackground: "Animated",
      templateAnimationId: 42,
      animation: { type: "snow-field", speed: 2 },
    });

    expect(body.useBackground).toBe("Animated");
    expect(body.templateAnimationId).toBe(42);
    expect(body.animation).toBeUndefined();
  });

  it("omits animation for non-Animated saves", () => {
    const body = mapTemplateBuilderEditorStateToPutBody({
      ...createEmptyTemplateBuilderEditorState(),
      templateCategoryId: 1,
      templateModeId: 2,
      useBackground: "Solid",
      animation: { type: "snow-field" },
    });

    expect(body.animation).toBeUndefined();
  });

  it("maps null relation ids for clears", () => {
    const state = {
      ...createEmptyTemplateBuilderEditorState(),
      templateCategoryId: 1,
      templateModeId: 2,
      templatePaletteId: null,
      useBackground: "Solid" as const,
    };

    expect(mapTemplateBuilderEditorStateToPutBody(state).templatePaletteId).toBeNull();
  });

  it("nulls inactive background relation ids for the active useBackground", () => {
    const state = {
      ...createEmptyTemplateBuilderEditorState(),
      templateCategoryId: 1,
      templateModeId: 2,
      templateGradientId: 4,
      templateVideoId: 10,
      useBackground: "Gradient" as const,
    };

    expect(mapTemplateBuilderEditorStateToPutBody(state).templateVideoId).toBeNull();
    expect(mapTemplateBuilderEditorStateToPutBody(state).templateGradientId).toBe(4);
  });

  it("does not include extra keys", () => {
    const body = mapTemplateBuilderEditorStateToPutBody({
      ...createEmptyTemplateBuilderEditorState(),
      templateCategoryId: 1,
      templateModeId: 2,
      useBackground: "Gradient",
    });
    expect(Object.keys(body).sort()).toEqual(
      [
        "templateCategoryId",
        "templateGradientId",
        "templateImageId",
        "templateModeId",
        "templateNoiseId",
        "templatePaletteId",
        "templateParticleId",
        "templatePatternId",
        "templateTextureId",
        "templateVideoId",
        "templateAnimationId",
        "useBackground",
      ].sort(),
    );
  });
});
