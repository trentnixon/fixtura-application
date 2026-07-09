import { describe, expect, it } from "vitest";

import {
  isRemotionNoiseStaticPreviewType,
  resolveRemotionNoiseStaticPreviewUrl,
} from "./resolve-remotion-noise-static-preview-url";

describe("resolveRemotionNoiseStaticPreviewUrl", () => {
  it("maps static preview types to public asset paths", () => {
    expect(resolveRemotionNoiseStaticPreviewUrl("digitalRain")).toBe(
      "/template-builder/noise-previews/digitalRain.svg",
    );
    expect(resolveRemotionNoiseStaticPreviewUrl("spokes")).toBe(
      "/template-builder/noise-previews/spokes.svg",
    );
  });

  it("returns null for GridNoise variants", () => {
    expect(resolveRemotionNoiseStaticPreviewUrl("grain")).toBeNull();
    expect(resolveRemotionNoiseStaticPreviewUrl("gradientGrid")).toBeNull();
  });
});

describe("isRemotionNoiseStaticPreviewType", () => {
  it("identifies static-only variants", () => {
    expect(isRemotionNoiseStaticPreviewType("triangleSwarm")).toBe(true);
    expect(isRemotionNoiseStaticPreviewType("wave")).toBe(false);
  });
});
