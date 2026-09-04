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
    ["Image", "templateImageId"],
    ["Video", "templateVideoId"],
    ["Texture", "templateTextureId"],
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

  it("maps Animated to templateAnimationId", () => {
    expect(getActiveBackgroundRelationField("Animated")).toBe("templateAnimationId");
  });

  it("covers writable non-Solid enum in the map", () => {
    const mapped = new Set(Object.keys(BACKGROUND_CHILD_FIELD_BY_USE_BACKGROUND));
    expect(mapped).toEqual(new Set(["Gradient", "Image", "Video", "Texture", "Animated"]));
  });
});

describe("clearInactiveBackgroundRelations", () => {
  it("clears animation and templateAnimationId when switching away from Animated", () => {
    const state = {
      ...createEmptyTemplateBuilderEditorState(),
      useBackground: "Animated" as const,
      templateAnimationId: 42,
      animation: { type: "snow-field", speed: 1 },
    };

    const cleared = clearInactiveBackgroundRelations({ ...state, useBackground: "Solid" }, "Solid");
    expect(cleared.animation).toBeNull();
    expect(cleared.templateAnimationId).toBeNull();
  });

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

describe("isRelationFieldVisible", () => {
  it("always shows primary fields", () => {
    expect(isRelationFieldVisible("templateModeId", null)).toBe(true);
    expect(isRelationFieldVisible("templatePaletteId", "Solid")).toBe(true);
    expect(isBackgroundRelationFieldVisible("templateGradientId", "Solid")).toBe(false);
  });
});
