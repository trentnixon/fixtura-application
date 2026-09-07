import { describe, expect, it } from "vitest";

import { assembleAccountRemotionPreview } from "./assemble-account-remotion-preview";
import {
  needsCatalogToResolveSavedBranding,
  resolveSavedBrandingForRemotionPreview,
} from "./resolve-saved-branding-for-remotion-preview";

import type { AccountBrandingData } from "@/types/api/account";
import type { AllTemplateOptionsPayload } from "@/types/api/all-template-options";
import type { FixturaDataset } from "@/vendor/fixtura-remotion-assets/preview";

function minimalDataset(): FixturaDataset {
  return {
    videoMeta: {
      club: {
        logo: { hasLogo: false, url: "" },
        sponsors: { primary: [], general: [], sponsorNum: 0, legacyTeam: [] },
      },
      video: {
        appearance: {
          template: "TwoColumnClassic",
          theme: { primary: "#000", secondary: "#111", dark: "#222", white: "#333" },
        },
        templateVariation: { mode: "light", category: { slug: "TwoColumnClassic" } },
        metadata: { compositionId: "CricketLadder", includeSponsors: false },
      },
    },
    data: [{ gradeName: "Demo" }],
    frames: [10],
  } as unknown as FixturaDataset;
}

function brandingFixture(overrides: Partial<AccountBrandingData> = {}): AccountBrandingData {
  return {
    id: 1,
    template: {
      id: 1,
      name: "T",
      frontEndName: null,
      requiresMedia: false,
      variation: null,
      category: "BroadcastPro",
      templateVariation: null,
      divideFixturesBy: null,
      bundleAudio: null,
      poster: null,
      video: null,
      gallery: [],
    },
    theme: {
      id: 2,
      name: "Theme",
      theme: { primary: "#111", secondary: "#222", mode: "dark", useBackground: "Solid" },
    },
    template_option: {},
    ...overrides,
  };
}

const catalogBase: AllTemplateOptionsPayload = {
  categories: [
    {
      id: 8,
      name: "Broadcast Pro",
      slug: "BroadcastPro",
      divideFixturesBy: "round",
      isPrivate: false,
      bundleAudio: null,
    },
  ],
  modes: [{ id: 2, name: "Dark", slug: "dark" }],
  palettes: [{ id: 3, name: "Analogous", value: "analogous" }],
  gradients: [],
  images: [],
  noises: [],
  particles: [],
  patterns: [],
  textures: [
    {
      id: 6,
      name: "Paper",
      opacity: 0.5,
      blendMode: "multiply",
      texture: {
        id: 16,
        url: "https://cdn.example/paper.png",
        width: 100,
        height: 100,
        mime: "image/png",
        alternativeText: null,
      },
    },
  ],
  videos: [],
  animations: [
    {
      id: 9,
      presetId: "snow-field",
      name: "Snow",
      description: null,
      defaultConfiguration: { particleCount: 300, speed: 2 },
      isDefault: true,
      sortOrder: 0,
      catalogueVersion: null,
    },
  ],
  defaultAnimationPresetId: "snow-field",
  currentSelection: null,
};

describe("needsCatalogToResolveSavedBranding", () => {
  it("returns false for CMS-complete animated branding", () => {
    expect(
      needsCatalogToResolveSavedBranding(
        brandingFixture({
          template_option: {
            categoryId: 8,
            mode: "dark",
            useBackground: "Animated",
            palette: { id: 3, name: "Analogous", value: "analogous" },
            animation: { type: "snow-field", particleCount: 300, speed: 2 },
          },
        }),
      ),
    ).toBe(false);
  });

  it("returns true for thin animated branding", () => {
    expect(
      needsCatalogToResolveSavedBranding(
        brandingFixture({
          template_option: {
            categoryId: 8,
            mode: "dark",
            useBackground: "Animated",
            palette: { id: 3, name: "Analogous", value: "analogous" },
            templateAnimationId: 9,
          },
        }),
      ),
    ).toBe(true);
  });
});

describe("resolveSavedBrandingForRemotionPreview", () => {
  it("expands thin animated branding from catalog currentSelection", () => {
    const branding = brandingFixture({
      template_option: {
        categoryId: 8,
        modeId: 2,
        mode: "dark",
        useBackground: "Animated",
        palette: { id: 3, name: "Analogous", value: "analogous" },
        templateAnimationId: 9,
      },
    });
    const catalog: AllTemplateOptionsPayload = {
      ...catalogBase,
      currentSelection: {
        id: 1,
        useBackground: "Animated",
        templateAnimation: { id: 9, presetId: "snow-field", name: "Snow" },
        templateCategory: {
          id: 8,
          name: "Broadcast Pro",
          slug: "BroadcastPro",
          divideFixturesBy: "round",
        },
        templatePalette: { id: 3, name: "Analogous", value: "analogous" },
        templateGradient: null,
        templateImage: null,
        templateNoise: null,
        templateParticle: null,
        templatePattern: null,
        templateTexture: null,
        templateVideo: null,
        templateMode: { id: 2, name: "Dark", slug: "dark" },
      },
    };

    const resolved = resolveSavedBrandingForRemotionPreview({ branding, catalog });
    expect(resolved?.template_option?.["animation"]).toEqual({
      particleCount: 300,
      speed: 2,
      type: "snow-field",
    });
    expect(resolved?.theme?.theme?.["useBackground"]).toBe("Animated");
  });
});

describe("assembleAccountRemotionPreview saved + catalog", () => {
  it("matches builder draft for thin texture branding when catalog is on saved source", () => {
    const branding = brandingFixture({
      template_option: {
        categoryId: 8,
        modeId: 2,
        mode: "dark",
        useBackground: "Texture",
        palette: { id: 3, name: "Analogous", value: "analogous" },
        textureId: 6,
        texture: { id: 6, name: "Paper", opacity: 0.5, blendMode: "multiply" },
      },
    });
    const catalog: AllTemplateOptionsPayload = {
      ...catalogBase,
      currentSelection: {
        id: 1,
        useBackground: "Texture",
        templateAnimation: null,
        templateCategory: {
          id: 8,
          name: "Broadcast Pro",
          slug: "BroadcastPro",
          divideFixturesBy: "round",
        },
        templatePalette: { id: 3, name: "Analogous", value: "analogous" },
        templateGradient: null,
        templateImage: null,
        templateNoise: null,
        templateParticle: null,
        templatePattern: null,
        templateTexture: catalogBase.textures[0]!,
        templateVideo: null,
        templateMode: { id: 2, name: "Dark", slug: "dark" },
      },
    };

    const common = {
      base: minimalDataset(),
      logoUrl: null,
      templateModeSlug: "dark",
      templateCategoryCatalog: catalog.categories,
    };

    const saved = assembleAccountRemotionPreview({
      ...common,
      source: {
        kind: "saved",
        branding,
        templateOptionsCatalog: catalog,
        templateCategoryCatalog: catalog.categories,
      },
    });

    const builder = assembleAccountRemotionPreview({
      ...common,
      source: {
        kind: "draft",
        branding,
        draft: {
          templateCategoryId: 8,
          templateModeId: 2,
          templatePaletteId: 3,
          templateGradientId: null,
          templateImageId: null,
          templateNoiseId: null,
          templateParticleId: null,
          templatePatternId: null,
          templateTextureId: 6,
          templateVideoId: null,
          useBackground: "Texture",
          animation: null,
        },
        templateOptionsCatalog: catalog,
        templateCategoryCatalog: catalog.categories,
      },
    });

    const savedTv = (saved.data as Record<string, unknown>)["videoMeta"] as Record<string, unknown>;
    const builderTv = (builder.data as Record<string, unknown>)["videoMeta"] as Record<
      string,
      unknown
    >;
    const savedVariation = (savedTv["video"] as Record<string, unknown>)["templateVariation"];
    const builderVariation = (builderTv["video"] as Record<string, unknown>)["templateVariation"];
    expect(savedVariation).toEqual(builderVariation);
  });
});
