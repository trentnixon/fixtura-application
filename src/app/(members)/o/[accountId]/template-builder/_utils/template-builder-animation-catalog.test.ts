import { describe, expect, it } from "vitest";

import {
  animationsEqual,
  buildDefaultAnimationForPreset,
  formatAnimationPresetLabel,
  isAnimationPresetAvailable,
  mergeAnimationWithPresetDefaults,
  resolveAnimatedEditorFields,
  resolveDefaultAnimationPreset,
} from "./template-builder-animation-catalog";

import type { AnimationPresetCatalogItem } from "@/types/api/all-template-options";

const snowPreset: AnimationPresetCatalogItem = {
  id: 42,
  presetId: "snow-field",
  name: "Snow",
  description: null,
  defaultConfiguration: { particleCount: 300, speed: 1, direction: "random" },
  configurationSchema: {
    speed: { type: "number", label: "Speed", affectsRendering: true },
    direction: {
      type: "enum",
      label: "Direction",
      enumValues: ["up", "down", "random"],
      affectsRendering: true,
    },
    _catalogue: { inventoryKey: "snow" },
  },
  isDefault: true,
  sortOrder: 1,
  catalogueVersion: null,
};

describe("formatAnimationPresetLabel", () => {
  it("uses name when present", () => {
    expect(formatAnimationPresetLabel(snowPreset)).toBe("Snow");
  });

  it("falls back to presetId", () => {
    expect(formatAnimationPresetLabel({ ...snowPreset, name: null })).toBe("snow-field");
  });
});

describe("resolveAnimatedEditorFields", () => {
  it("hydrates id and preview animation from templateAnimation relation", () => {
    expect(
      resolveAnimatedEditorFields([snowPreset], {
        templateAnimationId: 42,
        templateAnimationPresetId: "snow-field",
      }),
    ).toEqual({
      templateAnimationId: 42,
      animation: {
        type: "snow-field",
        particleCount: 300,
        speed: 1,
        direction: "random",
      },
    });
  });

  it("falls back to presetId when id is missing", () => {
    expect(
      resolveAnimatedEditorFields([snowPreset], {
        templateAnimationId: null,
        templateAnimationPresetId: "snow-field",
      }),
    ).toMatchObject({
      templateAnimationId: 42,
      animation: { type: "snow-field" },
    });
  });
});

describe("mergeAnimationWithPresetDefaults", () => {
  it("merges overrides and sets type to presetId", () => {
    expect(mergeAnimationWithPresetDefaults(snowPreset, { speed: 2 })).toEqual({
      particleCount: 300,
      speed: 2,
      direction: "random",
      type: "snow-field",
    });
  });
});

describe("resolveDefaultAnimationPreset", () => {
  it("prefers defaultAnimationPresetId", () => {
    expect(resolveDefaultAnimationPreset([snowPreset], "snow-field")).toBe(snowPreset);
  });

  it("falls back to isDefault preset", () => {
    expect(resolveDefaultAnimationPreset([snowPreset], null)).toBe(snowPreset);
  });
});

describe("animationsEqual", () => {
  it("compares animation objects deeply", () => {
    expect(
      animationsEqual({ type: "snow-field", speed: 1 }, { type: "snow-field", speed: 1 }),
    ).toBe(true);
    expect(
      animationsEqual({ type: "snow-field", speed: 1 }, { type: "snow-field", speed: 2 }),
    ).toBe(false);
  });
});

describe("isAnimationPresetAvailable", () => {
  it("returns false for retired presets", () => {
    expect(isAnimationPresetAvailable([snowPreset], "dot-field")).toBe(false);
  });
});

describe("buildDefaultAnimationForPreset", () => {
  it("includes preset defaults and type", () => {
    expect(buildDefaultAnimationForPreset(snowPreset)).toMatchObject({
      type: "snow-field",
      particleCount: 300,
    });
  });
});
