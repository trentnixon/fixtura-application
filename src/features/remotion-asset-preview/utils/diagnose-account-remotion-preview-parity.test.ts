import { describe, expect, it } from "vitest";

import {
  auditSavedBrandingCompleteness,
  buildRemotionPreviewDraftFromCurrentSelection,
  diagnoseAccountRemotionPreviewParity,
} from "./diagnose-account-remotion-preview-parity";

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
  gradients: [{ id: 5, name: "Vertical", type: "secondary", direction: "VERTICAL" }],
  images: [
    {
      id: 4,
      name: "Pan",
      animationType: "pan",
      animationDirection: "left",
      overlayStyle: "gradient",
      gradientType: "primary",
      overlayOpacity: 0.4,
    },
  ],
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
  videos: [
    {
      id: 7,
      name: "Video",
      position: "center",
      size: "cover",
      loop: true,
      muted: true,
      offthread: false,
      volume: 0,
      rate: 1,
      overlay: "#000000",
    },
  ],
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

describe("auditSavedBrandingCompleteness", () => {
  it("flags missing animation.type for Animated backgrounds", () => {
    const gaps = auditSavedBrandingCompleteness(
      brandingFixture({
        template_option: {
          categoryId: 8,
          mode: "dark",
          useBackground: "Animated",
          palette: { id: 3, name: "Analogous", value: "analogous" },
          templateAnimationId: 9,
        },
      }),
    );

    expect(gaps.some((g) => g.field === "animation")).toBe(true);
  });

  it("passes when expanded Animated branding matches scheduler shape", () => {
    const gaps = auditSavedBrandingCompleteness(
      brandingFixture({
        template_option: {
          categoryId: 8,
          mode: "dark",
          useBackground: "Animated",
          palette: { id: 3, name: "Analogous", value: "analogous" },
          animation: { type: "snow-field", particleCount: 300, speed: 2 },
        },
      }),
    );

    expect(gaps.filter((g) => g.field.startsWith("animation"))).toEqual([]);
  });

  it("flags partial texture when url is missing", () => {
    const gaps = auditSavedBrandingCompleteness(
      brandingFixture({
        template_option: {
          categoryId: 8,
          mode: "dark",
          useBackground: "Texture",
          palette: { id: 3, name: "Analogous", value: "analogous" },
          texture: { id: 6, name: "Paper", opacity: 0.5, blendMode: "multiply" },
        },
      }),
    );

    expect(gaps.some((g) => g.field === "texture.url")).toBe(true);
  });
});

describe("buildRemotionPreviewDraftFromCurrentSelection", () => {
  it("expands Animated selection with catalog preset defaults", () => {
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

    const draft = buildRemotionPreviewDraftFromCurrentSelection(catalog);
    expect(draft?.useBackground).toBe("Animated");
    expect(draft?.animation).toEqual({ particleCount: 300, speed: 2, type: "snow-field" });
  });
});

describe("diagnoseAccountRemotionPreviewParity", () => {
  const previewImage = {
    id: 99,
    url: "https://cdn.example/club.jpg",
    width: 1920,
    height: 1080,
    mime: "image/jpeg",
  };

  it("reports already-aligned when saved branding is CMS-complete", () => {
    const animation = { type: "snow-field", particleCount: 300, speed: 2 };
    const branding = brandingFixture({
      template_option: {
        categoryId: 8,
        modeId: 2,
        mode: "dark",
        useBackground: "Animated",
        palette: { id: 3, name: "Analogous", value: "analogous" },
        animation,
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

    const result = diagnoseAccountRemotionPreviewParity({
      branding,
      catalog,
      baseDataset: minimalDataset(),
      templateModeSlug: "dark",
      logoUrl: "https://cdn.example/logo.png",
    });

    expect(result.assemblyParity).toBe("match");
    expect(result.brandingComplete).toBe(true);
    expect(result.recommendation).toBe("already-aligned");
  });

  it("reports match when thin Animated branding is resolved via catalog on saved path", () => {
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

    const result = diagnoseAccountRemotionPreviewParity({
      branding,
      catalog,
      baseDataset: minimalDataset(),
      templateModeSlug: "dark",
    });

    expect(result.brandingGaps.some((g) => g.field === "animation")).toBe(true);
    expect(result.assemblyParity).toBe("match");
    expect(result.templateVariationDiff).toHaveLength(0);
    expect(result.recommendation).toBe("cms-only");
    expect(result.notes.some((n) => n.includes("catalog expansion"))).toBe(true);
  });

  it("reports match when thin Texture branding is resolved via catalog on saved path", () => {
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

    const result = diagnoseAccountRemotionPreviewParity({
      branding,
      catalog,
      baseDataset: minimalDataset(),
      templateModeSlug: "dark",
    });

    expect(result.brandingGaps.some((g) => g.field.startsWith("texture"))).toBe(true);
    expect(result.assemblyParity).toBe("match");
    expect(result.recommendation).toBe("cms-only");
  });

  it("matches Image mode when branding is complete and previewImage is supplied", () => {
    const image = {
      id: 4,
      name: "Pan",
      animationType: "pan",
      animationDirection: "left",
      overlayStyle: "gradient",
      gradientType: "primary",
      overlayOpacity: 0.4,
      image: previewImage,
    };
    const branding = brandingFixture({
      template_option: {
        categoryId: 8,
        modeId: 2,
        mode: "dark",
        useBackground: "Image",
        palette: { id: 3, name: "Analogous", value: "analogous" },
        image,
      },
    });
    const catalog: AllTemplateOptionsPayload = {
      ...catalogBase,
      currentSelection: {
        id: 1,
        useBackground: "Image",
        templateAnimation: null,
        templateCategory: {
          id: 8,
          name: "Broadcast Pro",
          slug: "BroadcastPro",
          divideFixturesBy: "round",
        },
        templatePalette: { id: 3, name: "Analogous", value: "analogous" },
        templateGradient: null,
        templateImage: catalogBase.images[0]!,
        templateNoise: null,
        templateParticle: null,
        templatePattern: null,
        templateTexture: null,
        templateVideo: null,
        templateMode: { id: 2, name: "Dark", slug: "dark" },
      },
    };

    const result = diagnoseAccountRemotionPreviewParity({
      branding,
      catalog,
      baseDataset: minimalDataset(),
      templateModeSlug: "dark",
      previewImage,
    });

    expect(result.assemblyParity).toBe("match");
    expect(result.brandingComplete).toBe(true);
  });
});
