import { describe, expect, it } from "vitest";

import { createEmptyTemplateBuilderEditorState } from "./template-builder-editor-state";
import {
  applyBackgroundVisibilityToEditorState,
  BACKGROUND_CHILD_FIELD_BY_USE_BACKGROUND,
  clearInactiveBackgroundRelations,
  getActiveBackgroundRelationField,
  isBackgroundRelationFieldVisible,
  isRelationFieldVisible,
} from "./template-builder-field-visibility";

import type { TemplateUseBackground } from "@/types/api/template-options";

describe("getActiveBackgroundRelationField", () => {
  it.each([
    ["Gradient", "templateGradientId"],
    ["Graphics", "templateNoiseId"],
    ["Image", "templateImageId"],
    ["Video", "templateVideoId"],
    ["Texture", "templateTextureId"],
    ["Particle", "templateParticleId"],
  ] as const satisfies readonly [TemplateUseBackground, string][])(
    "maps %s to %s",
    (useBackground, field) => {
      expect(getActiveBackgroundRelationField(useBackground)).toBe(field);
    },
  );

  it("returns null for Solid and unset", () => {
    expect(getActiveBackgroundRelationField("Solid")).toBeNull();
    expect(getActiveBackgroundRelationField(null)).toBeNull();
  });

  it("covers every non-Solid enum in the map", () => {
    const mapped = new Set(Object.keys(BACKGROUND_CHILD_FIELD_BY_USE_BACKGROUND));
    expect(mapped).toEqual(
      new Set(["Gradient", "Graphics", "Image", "Video", "Texture", "Particle"]),
    );
  });
});

describe("isRelationFieldVisible", () => {
  it("always shows primary fields only", () => {
    expect(isRelationFieldVisible("templateModeId", null)).toBe(true);
    expect(isRelationFieldVisible("templatePaletteId", "Solid")).toBe(true);
    expect(isBackgroundRelationFieldVisible("templateGradientId", "Solid")).toBe(false);
  });

  it("shows only the matching background child for Video", () => {
    expect(isBackgroundRelationFieldVisible("templateVideoId", "Video")).toBe(true);
    expect(isBackgroundRelationFieldVisible("templateGradientId", "Video")).toBe(false);
  });
});

describe("clearInactiveBackgroundRelations", () => {
  it("nulls stale video id when switching to Gradient", () => {
    const state = {
      ...createEmptyTemplateBuilderEditorState(),
      templateVideoId: 10,
      templateGradientId: 4,
      useBackground: "Video" as const,
    };

    const cleared = clearInactiveBackgroundRelations(
      { ...state, useBackground: "Gradient" },
      "Gradient",
    );

    expect(cleared.templateVideoId).toBeNull();
    expect(cleared.templateGradientId).toBe(4);
    expect(cleared.useBackground).toBe("Gradient");
  });

  it("nulls all background relations for Solid", () => {
    const state = {
      ...createEmptyTemplateBuilderEditorState(),
      templateGradientId: 1,
      templateVideoId: 2,
      useBackground: "Gradient" as const,
    };

    const cleared = clearInactiveBackgroundRelations({ ...state, useBackground: "Solid" }, "Solid");

    expect(cleared.templateGradientId).toBeNull();
    expect(cleared.templateVideoId).toBeNull();
  });
});

describe("applyBackgroundVisibilityToEditorState", () => {
  it("strips inactive ids using current useBackground", () => {
    const state = {
      ...createEmptyTemplateBuilderEditorState(),
      templateCategoryId: 1,
      templateModeId: 2,
      templateVideoId: 10,
      useBackground: "Gradient" as const,
    };

    expect(applyBackgroundVisibilityToEditorState(state).templateVideoId).toBeNull();
  });
});
