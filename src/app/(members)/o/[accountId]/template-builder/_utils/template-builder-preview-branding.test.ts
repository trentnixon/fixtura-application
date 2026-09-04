import { describe, expect, it } from "vitest";

import { buildTemplateBuilderPreviewBranding } from "./template-builder-preview-branding";

import type { TemplateBuilderEditorState } from "./template-builder-editor-state";
import type { AccountBrandingData } from "@/types/api/account";
import type { AllTemplateOptionsPayload } from "@/types/api/all-template-options";

const draft: TemplateBuilderEditorState = {
  templateCategoryId: 8,
  templateModeId: 2,
  templatePaletteId: 3,
  templateGradientId: null,
  templateImageId: null,
  templateNoiseId: null,
  templateParticleId: null,
  templatePatternId: null,
  templateTextureId: null,
  templateVideoId: null,
  templateAnimationId: null,
  useBackground: "Gradient",
  animation: null,
};

const branding: AccountBrandingData = {
  id: 575,
  template: {
    id: 1,
    name: "Saved template",
    frontEndName: null,
    requiresMedia: false,
    variation: null,
    category: "Saved",
    templateVariation: null,
    divideFixturesBy: null,
    bundleAudio: null,
    poster: null,
    video: null,
    gallery: [],
  },
  theme: {
    id: 10,
    name: "Saved theme",
    theme: {
      primary: "#111111",
      mode: "saved-mode",
      useBackground: "Solid",
    },
  },
  template_option: {
    id: 269,
    modeId: 1,
    mode: "saved-mode",
    useBackground: "Solid",
  },
  templateOptionId: 269,
};

const catalog: AllTemplateOptionsPayload = {
  categories: [
    {
      id: 8,
      name: "Basic",
      slug: "basic",
      divideFixturesBy: "round",
      isPrivate: false,
      bundleAudio: null,
    },
  ],
  modes: [{ id: 2, name: "Dark", slug: "dark" }],
  palettes: [{ id: 3, name: "Ocean", value: "ocean" }],
  gradients: [],
  images: [],
  noises: [],
  particles: [],
  patterns: [],
  textures: [],
  videos: [],
  animations: [],
  defaultAnimationPresetId: null,
  currentSelection: null,
};

describe("buildTemplateBuilderPreviewBranding", () => {
  it("overlays draft selections onto branding for preview without mutating saved branding", () => {
    const preview = buildTemplateBuilderPreviewBranding({
      branding,
      catalog,
      draft,
    });

    expect(preview?.template?.category).toBe("basic");
    expect(preview?.theme?.theme).toMatchObject({
      primary: "#111111",
      mode: "dark",
      modeId: 2,
      useBackground: "Gradient",
    });
    expect(preview?.template_option).toMatchObject({
      id: 269,
      categoryId: 8,
      category: {
        id: 8,
        name: "Basic",
        slug: "basic",
      },
      modeId: 2,
      mode: "dark",
      paletteId: 3,
      palette: {
        id: 3,
        name: "Ocean",
      },
      useBackground: "Gradient",
    });
    expect(branding.template?.category).toBe("Saved");
    expect(branding.theme?.theme["mode"]).toBe("saved-mode");
    expect(branding.template_option?.["modeId"]).toBe(1);
  });

  it("does not expose inactive background assets in preview", () => {
    const preview = buildTemplateBuilderPreviewBranding({
      branding,
      catalog: {
        ...catalog,
        gradients: [{ id: 4, name: "Sunset", type: null, direction: null }],
        videos: [
          {
            id: 10,
            name: "Clip",
            position: null,
            size: null,
            loop: null,
            muted: null,
            offthread: null,
            volume: null,
            rate: null,
            overlay: null,
          },
        ],
      },
      draft: {
        ...draft,
        useBackground: "Gradient",
        templateGradientId: 4,
        templateVideoId: 10,
      },
    });

    expect(preview?.template_option?.["videoId"]).toBeNull();
    expect(preview?.template_option?.["video"]).toBeNull();
    expect(preview?.template_option?.["gradientId"]).toBe(4);
  });

  it("resolves selected texture from ui catalog for preview", () => {
    const preview = buildTemplateBuilderPreviewBranding({
      branding,
      catalog: {
        ...catalog,
        textures: [],
        currentSelection: null,
      },
      textureCatalog: [
        {
          id: 7,
          name: "Print Grain",
          category: "Print",
          opacity: 0.4,
          blendMode: "multiply",
          texture: {
            id: 70,
            url: "https://cdn.example/print.png",
            width: 1024,
            height: 1024,
            mime: "image/png",
            alternativeText: null,
          },
        },
      ],
      draft: {
        ...draft,
        useBackground: "Texture",
        templateTextureId: 7,
        templateNoiseId: null,
      },
    });

    expect(preview?.template_option?.["texture"]).toMatchObject({
      id: 7,
      name: "Print Grain",
      opacity: 0.4,
    });
    expect(preview?.template_option?.["textureId"]).toBe(7);
  });

  it("overlays Animated draft animation onto branding for preview", () => {
    const preview = buildTemplateBuilderPreviewBranding({
      branding,
      catalog: {
        ...catalog,
        animations: [
          {
            id: 42,
            presetId: "snow-field",
            name: "Snow",
            description: null,
            defaultConfiguration: { particleCount: 300, speed: 1, direction: "random" },
            configurationSchema: {},
            isDefault: true,
            sortOrder: 1,
            catalogueVersion: null,
          },
        ],
        defaultAnimationPresetId: "snow-field",
      },
      draft: {
        ...draft,
        useBackground: "Animated",
        animation: { type: "snow-field", speed: 2 },
      },
    });

    expect(preview?.template_option?.["useBackground"]).toBe("Animated");
    expect(preview?.template_option?.["animation"]).toEqual({ type: "snow-field", speed: 2 });
    expect(preview?.template_option?.["noise"]).toBeNull();
  });

  it("merges the selected upload into the image treatment for preview", () => {
    const previewImage = {
      id: 91,
      url: "https://cdn.example.com/account-background.jpg",
      width: 1920,
      height: 1080,
      mime: "image/jpeg",
    };
    const preview = buildTemplateBuilderPreviewBranding({
      branding,
      catalog: {
        ...catalog,
        images: [
          {
            id: 14,
            name: "Slow zoom",
            animationType: "zoom",
            animationDirection: "in",
            overlayStyle: "gradient",
            gradientType: "linear",
            overlayOpacity: 0.35,
          },
        ],
      },
      draft: {
        ...draft,
        useBackground: "Image",
        templateImageId: 14,
        templateNoiseId: null,
      },
      previewImage,
    });

    expect(preview?.template_option?.["imageId"]).toBe(14);
    expect(preview?.template_option?.["image"]).toMatchObject({
      id: 14,
      animationType: "zoom",
      animationDirection: "in",
      overlayStyle: "gradient",
      gradientType: "linear",
      overlayOpacity: 0.35,
      image: previewImage,
    });
  });

  it("provides the selected upload even when no image treatment is selected", () => {
    const previewImage = {
      id: 91,
      url: "https://cdn.example.com/account-background.jpg",
      width: 1920,
      height: 1080,
      mime: "image/jpeg",
    };
    const preview = buildTemplateBuilderPreviewBranding({
      branding,
      catalog,
      draft: {
        ...draft,
        useBackground: "Image",
        templateImageId: null,
        templateNoiseId: null,
      },
      previewImage,
    });

    expect(preview?.template_option?.["imageId"]).toBeNull();
    expect(preview?.template_option?.["image"]).toEqual({ image: previewImage });
  });

  it("does not patch the selected upload into non-image backgrounds", () => {
    const preview = buildTemplateBuilderPreviewBranding({
      branding,
      catalog,
      draft,
      previewImage: {
        id: 91,
        url: "https://cdn.example.com/account-background.jpg",
        width: 1920,
        height: 1080,
        mime: "image/jpeg",
      },
    });

    expect(preview?.template_option?.["image"]).toBeNull();
  });

  it("falls back to saved branding before catalog or draft exists", () => {
    expect(
      buildTemplateBuilderPreviewBranding({
        branding,
        catalog: null,
        draft,
      }),
    ).toBe(branding);
  });
});
