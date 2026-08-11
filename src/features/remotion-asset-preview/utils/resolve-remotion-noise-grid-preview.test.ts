import { describe, expect, it } from "vitest";

import { isGridNoiseRemotionVariant } from "./resolve-remotion-noise-grid-preview";

describe("isGridNoiseRemotionVariant", () => {
  it("returns true for GridNoise-based variants", () => {
    expect(isGridNoiseRemotionVariant("grain")).toBe(true);
    expect(isGridNoiseRemotionVariant("gradientGrid")).toBe(true);
  });

  it("returns false for particle and SVG variants", () => {
    expect(isGridNoiseRemotionVariant("digitalRain")).toBe(false);
    expect(isGridNoiseRemotionVariant("spokes")).toBe(false);
  });
});
