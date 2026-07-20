import { describe, expect, it } from "vitest";

import {
  readRemotionBackgroundAssetsPatch,
  readRemotionImageFromBranding,
  readRemotionNoiseFromBranding,
  readRemotionParticleFromBranding,
  readRemotionTextureFromBranding,
  readRemotionVideoFromBranding,
} from "./read-remotion-background-assets-from-branding";

import type { AccountBrandingData } from "@/types/api/account";

function brandingFixture(
  template_option: Record<string, unknown>,
  themeUseBackground?: string,
): AccountBrandingData {
  return {
    id: 1,
    template: null,
    theme: themeUseBackground
      ? {
          id: 2,
          name: "Theme",
          theme: { useBackground: themeUseBackground },
        }
      : null,
    template_option,
  };
}

describe("readRemotionTextureFromBranding", () => {
  it("maps catalog texture row with media url and overlay", () => {
    const result = readRemotionTextureFromBranding(
      brandingFixture({
        useBackground: "Texture",
        texture: {
          id: 9,
          name: "Halftone",
          opacity: 0.8,
          blendMode: "multiply",
          texture: {
            id: 1,
            url: "https://cdn.example/texture.png",
            width: 100,
            height: 100,
            mime: "image/png",
            alternativeText: null,
          },
        },
      }),
    );

    expect(result).toEqual({
      name: "Halftone",
      url: "https://cdn.example/texture.png",
      repeat: "cover",
      scale: "100%",
      overlay: { opacity: 0.8, blendMode: "multiply" },
    });
  });

  it("returns null when no url or name", () => {
    expect(
      readRemotionTextureFromBranding(
        brandingFixture({
          texture: { id: 1, name: null, opacity: null, blendMode: null, texture: null },
        }),
      ),
    ).toBeNull();
  });
});

describe("readRemotionNoiseFromBranding", () => {
  it("maps noiseType to type", () => {
    expect(
      readRemotionNoiseFromBranding(
        brandingFixture({
          useBackground: "Graphics",
          noise: { id: 6, name: "Grain", noiseType: "grain" },
        }),
      ),
    ).toEqual({ type: "grain" });
  });

  it("normalizes CMS display labels to Remotion noise keys", () => {
    expect(
      readRemotionNoiseFromBranding(
        brandingFixture({
          useBackground: "Graphics",
          noise: { id: 7, name: "Floating Particles", noiseType: "Floating Particles" },
        }),
      ),
    ).toEqual({ type: "floatingParticles" });
  });

  it("falls back to name when noiseType is missing", () => {
    expect(
      readRemotionNoiseFromBranding(
        brandingFixture({
          useBackground: "Graphics",
          noise: { id: 8, name: "Floating Particles", noiseType: null },
        }),
      ),
    ).toEqual({ type: "floatingParticles" });
  });

  it("maps particle and graphics noise variants from display labels", () => {
    const cases = [
      ["Dynamic Particles", "dynamicParticles"],
      ["Triangle Swarm", "triangleSwarm"],
      ["Digital Rain", "digitalRain"],
      ["Spokes", "spokes"],
      ["Wave", "wave"],
    ] as const;

    for (const [label, type] of cases) {
      expect(
        readRemotionNoiseFromBranding(
          brandingFixture({
            useBackground: "Graphics",
            noise: { id: 1, name: label, noiseType: label },
          }),
        ),
      ).toEqual({ type });
    }
  });

  it("reads scheduler-style noise objects from theme", () => {
    expect(
      readRemotionNoiseFromBranding({
        id: 1,
        template: null,
        theme: {
          id: 2,
          name: "Theme",
          theme: {
            useBackground: "Graphics",
            noise: { type: "digitalRain" },
          },
        },
        template_option: null,
      }),
    ).toEqual({ type: "digitalRain" });
  });
});

describe("readRemotionParticleFromBranding", () => {
  it("maps CMS particle fields to templateVariation.particle", () => {
    expect(
      readRemotionParticleFromBranding(
        brandingFixture({
          useBackground: "Particle",
          particle: {
            id: 7,
            name: "Lines",
            particleType: "lines",
            particleCount: 300,
            speed: 0.8,
            direction: "up",
            animationType: "scale",
          },
        }),
      ),
    ).toEqual({
      type: "lines",
      particleCount: 300,
      speed: 0.8,
      direction: "up",
      animation: "scale",
    });
  });
});

describe("readRemotionImageFromBranding", () => {
  it("maps nested account media URL and dimensions while preserving treatment settings", () => {
    expect(
      readRemotionImageFromBranding(
        brandingFixture({
          useBackground: "Image",
          image: {
            id: 14,
            animationType: "zoom",
            animationDirection: "in",
            overlayOpacity: 0.35,
            image: {
              id: 91,
              url: "https://cdn.example.com/account-background.jpg",
              width: 1920,
              height: 1080,
              mime: "image/jpeg",
            },
          },
        }),
      ),
    ).toEqual({
      url: "https://cdn.example.com/account-background.jpg",
      type: "zoom",
      direction: "in",
      overlayOpacity: 0.35,
      width: 1920,
      height: 1080,
    });
  });
});

describe("readRemotionVideoFromBranding", () => {
  it("maps flat video settings", () => {
    expect(
      readRemotionVideoFromBranding(
        brandingFixture({
          useBackground: "Video",
          video: {
            id: 10,
            name: "Bg",
            position: "left",
            size: "cover",
            loop: true,
            muted: true,
            volume: 0.5,
            rate: 1,
            overlay: { opacity: 0.7 },
          },
        }),
      ),
    ).toMatchObject({
      position: "left",
      size: "cover",
      loop: true,
      muted: true,
      volume: 0.5,
      playbackRate: 1,
      overlay: { opacity: 0.7 },
    });
  });
});

describe("readRemotionBackgroundAssetsPatch", () => {
  it("returns only texture patch for Texture useBackground", () => {
    const patch = readRemotionBackgroundAssetsPatch(
      brandingFixture({
        useBackground: "Texture",
        texture: {
          id: 1,
          name: "T",
          opacity: null,
          blendMode: null,
          texture: {
            id: 2,
            url: "https://cdn.example/t.png",
            width: null,
            height: null,
            mime: null,
            alternativeText: null,
          },
        },
      }),
    );

    expect(Object.keys(patch)).toEqual(["texture"]);
    expect(patch.texture).toMatchObject({ url: "https://cdn.example/t.png" });
  });

  it("returns empty patch for Solid", () => {
    expect(
      readRemotionBackgroundAssetsPatch(brandingFixture({ useBackground: "Solid" }, "Solid")),
    ).toEqual({});
  });

  it("returns empty patch for null branding", () => {
    expect(readRemotionBackgroundAssetsPatch(null)).toEqual({});
  });
});
