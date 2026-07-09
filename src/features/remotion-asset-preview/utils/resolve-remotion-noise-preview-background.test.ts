import { describe, expect, it } from "vitest";

import { resolveRemotionNoisePreviewBackground } from "./resolve-remotion-noise-preview-background";

describe("resolveRemotionNoisePreviewBackground", () => {
  it("returns static asset background for particle variants when canvas is unavailable", () => {
    const style = resolveRemotionNoisePreviewBackground(
      { id: 1, name: "Digital Rain", noiseType: "digitalRain" },
      { base: "#000021", accent: "#4a90e2" },
    );

    expect(style).toEqual({
      backgroundColor: "#000021",
      backgroundImage: 'url("/template-builder/noise-previews/digitalRain.svg")',
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    });
  });

  it("resolves Digital Waves display label via static fallback", () => {
    const style = resolveRemotionNoisePreviewBackground(
      { id: 4, name: "Digital Waves", noiseType: "Digital Waves" },
      { base: "#000021", accent: "#4a90e2" },
    );

    expect(style?.backgroundImage).toContain("digitalRain.svg");
  });

  it("returns undefined when noise type cannot be resolved", () => {
    expect(
      resolveRemotionNoisePreviewBackground(
        { id: 2, name: null, noiseType: null },
        { base: "#000021", accent: "#4a90e2" },
      ),
    ).toBeUndefined();
  });

  it("returns undefined for unknown noise types without assets", () => {
    expect(
      resolveRemotionNoisePreviewBackground(
        { id: 3, name: "Unknown", noiseType: "not-a-real-noise" },
        { base: "#000021", accent: "#4a90e2" },
      ),
    ).toBeUndefined();
  });
});
