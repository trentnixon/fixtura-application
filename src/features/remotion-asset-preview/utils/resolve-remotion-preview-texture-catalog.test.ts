import { describe, expect, it } from "vitest";

import { resolveRemotionPreviewTextureCatalog } from "./resolve-remotion-preview-texture-catalog";

import type { TemplateTextureCatalogItem } from "@/types/api/all-template-options";

const catalogTexture: TemplateTextureCatalogItem = {
  id: 6,
  name: "Paper",
  opacity: 0.5,
  blendMode: "multiply",
  texture: {
    id: 16,
    url: "/uploads/paper.png",
    width: 100,
    height: 100,
    mime: "image/png",
    alternativeText: null,
  },
};

describe("resolveRemotionPreviewTextureCatalog", () => {
  it("prefers UI textures when available", () => {
    const items = resolveRemotionPreviewTextureCatalog({
      templateTexturesSuccess: true,
      templateTexturesPending: false,
      templateTexturesData: [
        {
          id: 6,
          name: "Paper",
          category: "Paper",
          opacity: 0.5,
          blendMode: "multiply",
          texture: {
            id: 16,
            url: "/uploads/ui-paper.png",
            width: 100,
            height: 100,
            mime: "image/png",
            alternativeText: null,
          },
        },
      ],
      templateTexturesError: null,
      catalogTextures: [catalogTexture],
    });

    expect(items[0]?.texture?.url).toContain("ui-paper.png");
  });

  it("falls back to aggregate catalog textures", () => {
    const items = resolveRemotionPreviewTextureCatalog({
      templateTexturesSuccess: false,
      templateTexturesPending: false,
      templateTexturesData: null,
      templateTexturesError: null,
      catalogTextures: [catalogTexture],
    });

    expect(items).toHaveLength(1);
    expect(items[0]?.id).toBe(6);
  });
});
