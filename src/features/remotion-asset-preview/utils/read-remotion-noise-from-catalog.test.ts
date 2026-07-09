import { describe, expect, it } from "vitest";

import {
  normalizeTemplateNoiseTypeToRemotionKey,
  resolveRemotionNoiseFromCatalogNoise,
  resolveRemotionNoiseTypeFromCatalogItem,
} from "./read-remotion-noise-from-catalog";

describe("normalizeTemplateNoiseTypeToRemotionKey", () => {
  it("maps exact and case-insensitive Remotion noise type keys", () => {
    expect(normalizeTemplateNoiseTypeToRemotionKey("grain")).toBe("grain");
    expect(normalizeTemplateNoiseTypeToRemotionKey("Grain")).toBe("grain");
    expect(normalizeTemplateNoiseTypeToRemotionKey("DIGITALRAIN")).toBe("digitalRain");
  });

  it("maps spaced display labels to camelCase keys", () => {
    expect(normalizeTemplateNoiseTypeToRemotionKey("Digital Rain")).toBe("digitalRain");
    expect(normalizeTemplateNoiseTypeToRemotionKey("Gradient Grid")).toBe("gradientGrid");
    expect(normalizeTemplateNoiseTypeToRemotionKey("Floating Particles")).toBe("floatingParticles");
  });

  it("maps alias labels", () => {
    expect(normalizeTemplateNoiseTypeToRemotionKey("Pulsing Circles")).toBe("pulsingCircles");
    expect(normalizeTemplateNoiseTypeToRemotionKey("Triangle Swarm")).toBe("triangleSwarm");
    expect(normalizeTemplateNoiseTypeToRemotionKey("Graphics")).toBe("geometric");
    expect(normalizeTemplateNoiseTypeToRemotionKey("Digital Wave")).toBe("digitalRain");
    expect(normalizeTemplateNoiseTypeToRemotionKey("Digital Waves")).toBe("digitalRain");
    expect(normalizeTemplateNoiseTypeToRemotionKey("triangle_swarm")).toBe("triangleSwarm");
    expect(normalizeTemplateNoiseTypeToRemotionKey("dynamic-particles")).toBe("dynamicParticles");
  });

  it("returns null for unknown or empty values", () => {
    expect(normalizeTemplateNoiseTypeToRemotionKey("not-a-noise")).toBeNull();
    expect(normalizeTemplateNoiseTypeToRemotionKey(null)).toBeNull();
    expect(normalizeTemplateNoiseTypeToRemotionKey("")).toBeNull();
  });
});

describe("resolveRemotionNoiseTypeFromCatalogItem", () => {
  it("prefers noiseType over name", () => {
    expect(
      resolveRemotionNoiseTypeFromCatalogItem({
        id: 1,
        name: "Wave",
        noiseType: "grain",
      }),
    ).toBe("grain");
  });

  it("falls back to name when noiseType is missing", () => {
    expect(
      resolveRemotionNoiseTypeFromCatalogItem({
        id: 2,
        name: "Digital Rain",
        noiseType: null,
      }),
    ).toBe("digitalRain");
  });

  it("returns null when both fields are missing or unknown", () => {
    expect(
      resolveRemotionNoiseTypeFromCatalogItem({
        id: 3,
        name: null,
        noiseType: null,
      }),
    ).toBeNull();
  });
});

describe("resolveRemotionNoiseFromCatalogNoise", () => {
  it("resolves canonical enum keys and ui.type", () => {
    expect(resolveRemotionNoiseFromCatalogNoise({ noiseType: "dynamicParticles" })).toEqual({
      type: "dynamicParticles",
    });
    expect(
      resolveRemotionNoiseFromCatalogNoise({
        id: 1,
        name: "Spokes",
        ui: { type: "spokes" },
      }),
    ).toEqual({ type: "spokes" });
  });

  it("resolves scheduler-style noise objects with only type", () => {
    expect(resolveRemotionNoiseFromCatalogNoise({ type: "triangleSwarm" })).toEqual({
      type: "triangleSwarm",
    });
  });

  it("resolves display labels from name when noiseType is missing", () => {
    expect(
      resolveRemotionNoiseFromCatalogNoise({
        id: 2,
        name: "Digital Rain",
        noiseType: null,
      }),
    ).toEqual({ type: "digitalRain" });
  });
});
