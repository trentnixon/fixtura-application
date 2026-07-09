import { describe, expect, it } from "vitest";

import {
  REMOTION_TEXTURE_DEFAULT_BLEND_MODE,
  REMOTION_TEXTURE_DEFAULT_OVERLAY_OPACITY,
  resolveRemotionTexturePreviewLayers,
} from "./resolve-remotion-texture-preview-background";

describe("resolveRemotionTexturePreviewLayers", () => {
  it("returns texture and overlay layers for catalog media url", () => {
    const layers = resolveRemotionTexturePreviewLayers(
      {
        id: 1,
        name: "Halftone",
        opacity: 0.8,
        blendMode: "multiply",
        texture: {
          id: 10,
          url: "https://cdn.example/texture.png",
          width: 100,
          height: 100,
          mime: "image/png",
          alternativeText: null,
        },
      },
      "#1a2b3c",
    );

    expect(layers).toEqual({
      textureLayer: {
        backgroundImage: 'url("https://cdn.example/texture.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      },
      overlayLayer: {
        backgroundColor: "#1a2b3c",
        opacity: 0.8,
        mixBlendMode: "multiply",
      },
    });
  });

  it("uses Remotion defaults when opacity and blendMode are null", () => {
    const layers = resolveRemotionTexturePreviewLayers(
      {
        id: 2,
        name: "Grain",
        opacity: null,
        blendMode: null,
        texture: {
          id: 11,
          url: "https://cdn.example/grain.png",
          width: null,
          height: null,
          mime: null,
          alternativeText: null,
        },
      },
      "#ff0000",
    );

    expect(layers?.overlayLayer.opacity).toBe(REMOTION_TEXTURE_DEFAULT_OVERLAY_OPACITY);
    expect(layers?.overlayLayer.mixBlendMode).toBe(REMOTION_TEXTURE_DEFAULT_BLEND_MODE);
  });

  it("returns null when texture media url is missing", () => {
    expect(
      resolveRemotionTexturePreviewLayers(
        {
          id: 3,
          name: "Missing",
          opacity: null,
          blendMode: null,
          texture: null,
        },
        "#ff0000",
      ),
    ).toBeNull();
  });
});
