import { describe, expect, it } from "vitest";

import { mergeAccountBrandingIntoDataset } from "./merge-account-branding-into-dataset";

import type { AccountBrandingData, AccountSponsorDto } from "@/types/api/account";
import type { FixturaDataset } from "@/vendor/fixtura-remotion-assets/preview";

function minimalDataset(template = "TwoColumnClassic"): FixturaDataset {
  return {
    videoMeta: {
      club: {
        logo: { hasLogo: false, url: "" },
        sponsors: {
          default: {
            primary_sponsor: [{ id: 999, name: "Example", isPrimary: true, isActive: true }],
          },
          legacyTeam: [],
        },
      },
      video: {
        appearance: {
          template,
          theme: {
            primary: "#000",
            secondary: "#111",
            dark: "#222",
            white: "#333",
          },
        },
        templateVariation: {
          mode: "light",
          category: { slug: template },
        },
        metadata: { compositionId: "CricketLadder" },
      },
    },
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
      theme: {
        primary: "#ABCDEF",
        secondary: "#FEDCBA",
        dark: "#010101",
        white: "#FEFEFE",
      },
    },
    template_option: { modeId: 1 },
    ...overrides,
  };
}

describe("mergeAccountBrandingIntoDataset", () => {
  it("removes the bundled example hero image from preview data", () => {
    const base = minimalDataset();
    const baseRecord = base as unknown as Record<string, unknown>;
    const videoMeta = baseRecord["videoMeta"] as Record<string, unknown>;
    const video = videoMeta["video"] as Record<string, unknown>;
    video["media"] = {
      HeroImage: { url: "https://cdn.example.com/default.jpg" },
      heroImage: { url: "https://cdn.example.com/other-default.jpg" },
      audio: { url: "https://cdn.example.com/example.mp3" },
    };

    const { data } = mergeAccountBrandingIntoDataset(base, {
      branding: brandingFixture(),
      logoUrl: null,
      templateModeSlug: null,
    });

    const mergedRecord = data as unknown as Record<string, unknown>;
    const mergedVideoMeta = mergedRecord["videoMeta"] as Record<string, unknown>;
    const mergedVideo = mergedVideoMeta["video"] as Record<string, unknown>;
    const mergedMedia = mergedVideo["media"] as Record<string, unknown>;
    expect(mergedMedia["HeroImage"]).toBeUndefined();
    expect(mergedMedia["heroImage"]).toBeUndefined();
    expect(mergedMedia["audio"]).toEqual({ url: "https://cdn.example.com/example.mp3" });
  });

  it("uses the account image after removing the bundled hero image", () => {
    const base = minimalDataset();
    const baseRecord = base as unknown as Record<string, unknown>;
    const videoMeta = baseRecord["videoMeta"] as Record<string, unknown>;
    const video = videoMeta["video"] as Record<string, unknown>;
    video["media"] = {
      HeroImage: { url: "https://cdn.example.com/default.jpg" },
    };

    const { data } = mergeAccountBrandingIntoDataset(base, {
      branding: brandingFixture({
        template_option: {
          useBackground: "Image",
          image: {
            animationType: "pan",
            image: {
              url: "https://cdn.example.com/account-image.jpg",
              width: 1920,
              height: 1080,
            },
          },
        },
      }),
      logoUrl: null,
      templateModeSlug: null,
    });

    const mergedRecord = data as unknown as Record<string, unknown>;
    const mergedVideoMeta = mergedRecord["videoMeta"] as Record<string, unknown>;
    const mergedVideo = mergedVideoMeta["video"] as Record<string, unknown>;
    const mergedMedia = mergedVideo["media"] as Record<string, unknown>;
    const templateVariation = mergedVideo["templateVariation"] as Record<string, unknown>;
    expect(mergedMedia["HeroImage"]).toBeUndefined();
    expect(templateVariation["image"]).toMatchObject({
      url: "https://cdn.example.com/account-image.jpg",
      width: 1920,
      height: 1080,
      type: "pan",
    });
  });

  it("sets appearance.template from branding template category", () => {
    const base = minimalDataset();
    const { data, usedTemplateFallback } = mergeAccountBrandingIntoDataset(base, {
      branding: brandingFixture(),
      logoUrl: null,
      templateModeSlug: null,
    });

    const dataRec = data as unknown as Record<string, unknown>;
    const vm = dataRec["videoMeta"] as Record<string, unknown>;
    const video = vm["video"] as Record<string, unknown>;
    const appearance = video["appearance"] as Record<string, unknown>;
    expect(appearance["template"]).toBe("BroadcastPro");
    expect(usedTemplateFallback).toBe(false);
  });

  it("sets appearance.template to BroadcastProRounded from category slug", () => {
    const base = minimalDataset();
    const { data, usedTemplateFallback } = mergeAccountBrandingIntoDataset(base, {
      branding: brandingFixture({
        template: { ...brandingFixture().template!, category: "BroadcastProRounded" },
      }),
      logoUrl: null,
      templateModeSlug: null,
    });

    const dataRec = data as unknown as Record<string, unknown>;
    const vm = dataRec["videoMeta"] as Record<string, unknown>;
    const video = vm["video"] as Record<string, unknown>;
    const appearance = video["appearance"] as Record<string, unknown>;
    const tv = video["templateVariation"] as Record<string, unknown>;
    const category = tv["category"] as Record<string, unknown>;
    expect(appearance["template"]).toBe("BroadcastProRounded");
    expect(category["slug"]).toBe("BroadcastProRounded");
    expect(usedTemplateFallback).toBe(false);
  });

  it("resolves BroadcastProRounded case-insensitively", () => {
    const base = minimalDataset();
    const { data, usedTemplateFallback } = mergeAccountBrandingIntoDataset(base, {
      branding: brandingFixture({
        template: { ...brandingFixture().template!, category: "broadcastprorounded" },
      }),
      logoUrl: null,
      templateModeSlug: null,
    });

    const dataRec = data as unknown as Record<string, unknown>;
    const vm = dataRec["videoMeta"] as Record<string, unknown>;
    const video = vm["video"] as Record<string, unknown>;
    const appearance = video["appearance"] as Record<string, unknown>;
    expect(appearance["template"]).toBe("BroadcastProRounded");
    expect(usedTemplateFallback).toBe(false);
  });

  it("applies theme colours from branding.theme", () => {
    const base = minimalDataset();
    const { data } = mergeAccountBrandingIntoDataset(base, {
      branding: brandingFixture(),
      logoUrl: null,
      templateModeSlug: null,
    });

    const dataRec = data as unknown as Record<string, unknown>;
    const vm = dataRec["videoMeta"] as Record<string, unknown>;
    const video = vm["video"] as Record<string, unknown>;
    const appearance = video["appearance"] as Record<string, unknown>;
    const theme = appearance["theme"] as Record<string, unknown>;
    expect(theme["primary"]).toBe("#ABCDEF");
    expect(theme["secondary"]).toBe("#FEDCBA");
    expect(theme["dark"]).toBe("#010101");
    expect(theme["white"]).toBe("#FEFEFE");
  });

  it("sets club logo when logoUrl provided", () => {
    const base = minimalDataset();
    const { data } = mergeAccountBrandingIntoDataset(base, {
      branding: brandingFixture(),
      logoUrl: "https://example.com/logo.png",
      templateModeSlug: null,
    });

    const dataRec = data as unknown as Record<string, unknown>;
    const vm = dataRec["videoMeta"] as Record<string, unknown>;
    const club = vm["club"] as Record<string, unknown>;
    const logo = club["logo"] as Record<string, unknown>;
    expect(logo["url"]).toBe("https://example.com/logo.png");
    expect(logo["hasLogo"]).toBe(true);
  });

  it("prefers branding.theme.theme.mode for templateVariation.mode over CMS slug", () => {
    const base = minimalDataset();
    const b = brandingFixture({
      theme: {
        id: 2,
        name: "Theme",
        theme: {
          primary: "#ABCDEF",
          secondary: "#FEDCBA",
          dark: "#010101",
          white: "#FEFEFE",
          mode: "light",
          modeId: 1,
        },
      },
    });
    const { data } = mergeAccountBrandingIntoDataset(base, {
      branding: b,
      logoUrl: null,
      templateModeSlug: "dark",
    });

    const dataRec = data as unknown as Record<string, unknown>;
    const vm = dataRec["videoMeta"] as Record<string, unknown>;
    const video = vm["video"] as Record<string, unknown>;
    const tv = video["templateVariation"] as Record<string, unknown>;
    expect(tv["mode"]).toBe("light");
  });

  it("uses theme JSON mode when template mode slug is unavailable", () => {
    const base = minimalDataset();
    const b = brandingFixture({
      theme: {
        id: 2,
        name: "Theme",
        theme: {
          primary: "#ABCDEF",
          secondary: "#FEDCBA",
          dark: "#010101",
          white: "#FEFEFE",
          mode: "dark",
        },
      },
    });
    const { data } = mergeAccountBrandingIntoDataset(base, {
      branding: b,
      logoUrl: null,
      templateModeSlug: null,
    });

    const dataRec = data as unknown as Record<string, unknown>;
    const vm = dataRec["videoMeta"] as Record<string, unknown>;
    const video = vm["video"] as Record<string, unknown>;
    const tv = video["templateVariation"] as Record<string, unknown>;
    expect(tv["mode"]).toBe("dark");
  });

  it("maps light-alt template mode slug to lightAlt", () => {
    const base = minimalDataset();
    const { data } = mergeAccountBrandingIntoDataset(base, {
      branding: brandingFixture(),
      logoUrl: null,
      templateModeSlug: "light-alt",
    });

    const dataRec = data as unknown as Record<string, unknown>;
    const vm = dataRec["videoMeta"] as Record<string, unknown>;
    const video = vm["video"] as Record<string, unknown>;
    const tv = video["templateVariation"] as Record<string, unknown>;
    expect(tv["mode"]).toBe("lightAlt");
  });

  it("creates videoMeta structure when missing", () => {
    const base = { frames: [10] } as unknown as FixturaDataset;
    const { data } = mergeAccountBrandingIntoDataset(base, {
      branding: brandingFixture(),
      logoUrl: null,
      templateModeSlug: "dark",
    });

    const dataRec = data as unknown as Record<string, unknown>;
    const vm = dataRec["videoMeta"] as Record<string, unknown>;
    expect(vm).toBeDefined();
    const video = vm["video"] as Record<string, unknown>;
    const appearance = video["appearance"] as Record<string, unknown>;
    expect(appearance["template"]).toBe("BroadcastPro");
    const tv = video["templateVariation"] as Record<string, unknown>;
    expect(tv["mode"]).toBe("dark");
  });

  it("copies template_option palette into templateVariation over example default", () => {
    const base = minimalDataset();
    const dataRec = base as unknown as Record<string, unknown>;
    const vm = dataRec["videoMeta"] as Record<string, unknown>;
    const video = vm["video"] as Record<string, unknown>;
    const tv = video["templateVariation"] as Record<string, unknown>;
    tv["palette"] = "primary";

    const b = brandingFixture({
      template_option: {
        palette: { id: 2, name: "Analogous", value: "analogous" },
      },
    });
    const { data } = mergeAccountBrandingIntoDataset(base, {
      branding: b,
      logoUrl: null,
      templateModeSlug: null,
    });

    const mergedRec = data as unknown as Record<string, unknown>;
    const mergedVm = mergedRec["videoMeta"] as Record<string, unknown>;
    const mergedVideo = mergedVm["video"] as Record<string, unknown>;
    const mergedTv = mergedVideo["templateVariation"] as Record<string, unknown>;
    expect(mergedTv["palette"]).toBe("analogous");
  });

  it("copies template_option gradient into templateVariation over example default", () => {
    const base = minimalDataset();
    const dataRec = base as unknown as Record<string, unknown>;
    const vm = dataRec["videoMeta"] as Record<string, unknown>;
    const video = vm["video"] as Record<string, unknown>;
    const tv = video["templateVariation"] as Record<string, unknown>;
    tv["gradient"] = { type: "primary", direction: "HORIZONTAL" };

    const b = brandingFixture({
      template_option: {
        gradient: { id: 5, name: "Secondary vertical", type: "secondary", direction: "VERTICAL" },
      },
    });
    const { data } = mergeAccountBrandingIntoDataset(base, {
      branding: b,
      logoUrl: null,
      templateModeSlug: null,
    });

    const mergedRec = data as unknown as Record<string, unknown>;
    const mergedVm = mergedRec["videoMeta"] as Record<string, unknown>;
    const mergedVideo = mergedVm["video"] as Record<string, unknown>;
    const mergedTv = mergedVideo["templateVariation"] as Record<string, unknown>;
    expect(mergedTv["gradient"]).toEqual({ type: "secondary", direction: "VERTICAL" });
  });

  it("copies useBackground into templateVariation", () => {
    const base = minimalDataset();
    const b = brandingFixture({
      template_option: {
        modeId: 1,
        useBackground: "Graphics",
      },
    });
    const { data } = mergeAccountBrandingIntoDataset(base, {
      branding: b,
      logoUrl: null,
      templateModeSlug: null,
    });

    const dataRec = data as unknown as Record<string, unknown>;
    const vm = dataRec["videoMeta"] as Record<string, unknown>;
    const video = vm["video"] as Record<string, unknown>;
    const tv = video["templateVariation"] as Record<string, unknown>;
    expect(tv["useBackground"]).toBe("Graphics");
  });

  it("copies template_option texture into templateVariation over example default", () => {
    const base = minimalDataset();
    const dataRec = base as unknown as Record<string, unknown>;
    const vm = dataRec["videoMeta"] as Record<string, unknown>;
    const video = vm["video"] as Record<string, unknown>;
    const tv = video["templateVariation"] as Record<string, unknown>;
    tv["texture"] = {
      name: "Print Texture",
      url: "https://example.com/default-texture.png",
    };

    const b = brandingFixture({
      template_option: {
        useBackground: "Texture",
        texture: {
          id: 9,
          name: "Halftone",
          opacity: 0.5,
          blendMode: "screen",
          texture: {
            id: 1,
            url: "https://cdn.example/draft-texture.png",
            width: null,
            height: null,
            mime: null,
            alternativeText: null,
          },
        },
      },
    });

    const { data } = mergeAccountBrandingIntoDataset(base, {
      branding: b,
      logoUrl: null,
      templateModeSlug: null,
    });

    const mergedRec = data as unknown as Record<string, unknown>;
    const mergedVm = mergedRec["videoMeta"] as Record<string, unknown>;
    const mergedVideo = mergedVm["video"] as Record<string, unknown>;
    const mergedTv = mergedVideo["templateVariation"] as Record<string, unknown>;
    expect(mergedTv["texture"]).toMatchObject({
      name: "Halftone",
      url: "https://cdn.example/draft-texture.png",
    });
    expect(mergedTv["noise"]).toBeUndefined();
  });

  it("copies template_option noise into templateVariation for Graphics", () => {
    const base = minimalDataset();
    const b = brandingFixture({
      template_option: {
        useBackground: "Graphics",
        noise: { id: 6, name: "Grain", noiseType: "grain" },
      },
    });
    const { data } = mergeAccountBrandingIntoDataset(base, {
      branding: b,
      logoUrl: null,
      templateModeSlug: null,
    });

    const mergedRec = data as unknown as Record<string, unknown>;
    const mergedVm = mergedRec["videoMeta"] as Record<string, unknown>;
    const mergedVideo = mergedVm["video"] as Record<string, unknown>;
    const mergedTv = mergedVideo["templateVariation"] as Record<string, unknown>;
    expect(mergedTv["noise"]).toEqual({ type: "grain" });
    expect(mergedTv["texture"]).toBeUndefined();
  });

  it("normalizes Floating Particles noise label for Remotion preview", () => {
    const base = minimalDataset();
    const b = brandingFixture({
      template_option: {
        useBackground: "Graphics",
        noise: { id: 10, name: "Floating Particles", noiseType: "Floating Particles" },
      },
    });
    const { data } = mergeAccountBrandingIntoDataset(base, {
      branding: b,
      logoUrl: null,
      templateModeSlug: null,
    });

    const mergedRec = data as unknown as Record<string, unknown>;
    const mergedVm = mergedRec["videoMeta"] as Record<string, unknown>;
    const mergedVideo = mergedVm["video"] as Record<string, unknown>;
    const mergedTv = mergedVideo["templateVariation"] as Record<string, unknown>;
    expect(mergedTv["noise"]).toEqual({ type: "floatingParticles" });
  });

  it("removes example texture when useBackground is Gradient", () => {
    const base = minimalDataset();
    const dataRec = base as unknown as Record<string, unknown>;
    const vm = dataRec["videoMeta"] as Record<string, unknown>;
    const video = vm["video"] as Record<string, unknown>;
    const tv = video["templateVariation"] as Record<string, unknown>;
    tv["texture"] = { name: "Stale", url: "https://example.com/stale.png" };

    const b = brandingFixture({
      template_option: {
        useBackground: "Gradient",
        gradient: { id: 5, name: "Primary", type: "primary", direction: "HORIZONTAL" },
      },
    });

    const { data } = mergeAccountBrandingIntoDataset(base, {
      branding: b,
      logoUrl: null,
      templateModeSlug: null,
    });

    const mergedRec = data as unknown as Record<string, unknown>;
    const mergedVm = mergedRec["videoMeta"] as Record<string, unknown>;
    const mergedVideo = mergedVm["video"] as Record<string, unknown>;
    const mergedTv = mergedVideo["templateVariation"] as Record<string, unknown>;
    expect(mergedTv["texture"]).toBeUndefined();
    expect(mergedTv["gradient"]).toEqual({ type: "primary", direction: "HORIZONTAL" });
  });

  it("resolves template from template_option.category when template row is null", () => {
    const base = minimalDataset();
    const b = brandingFixture({
      template: null,
      template_option: {
        category: { slug: "Basic", name: "Basic" },
        mode: "light",
        modeId: 1,
      },
    });
    const { data, usedTemplateFallback } = mergeAccountBrandingIntoDataset(base, {
      branding: b,
      logoUrl: null,
      templateModeSlug: null,
    });

    const dataRec = data as unknown as Record<string, unknown>;
    const vm = dataRec["videoMeta"] as Record<string, unknown>;
    const video = vm["video"] as Record<string, unknown>;
    const appearance = video["appearance"] as Record<string, unknown>;
    expect(appearance["template"]).toBe("Basic");
    expect(usedTemplateFallback).toBe(false);
    const tv = video["templateVariation"] as Record<string, unknown>;
    expect(tv["mode"]).toBe("light");
  });

  it("prefers template_option.category over template.category on linked template row", () => {
    const base = minimalDataset();
    const b = brandingFixture({
      template: { ...brandingFixture().template!, category: "TwoColumnClassic" },
      template_option: {
        category: { slug: "Mudgeeraba", name: "Mudgeeraba" },
      },
    });
    const { data, usedTemplateFallback } = mergeAccountBrandingIntoDataset(base, {
      branding: b,
      logoUrl: null,
      templateModeSlug: null,
    });

    const dataRec = data as unknown as Record<string, unknown>;
    const vm = dataRec["videoMeta"] as Record<string, unknown>;
    const video = vm["video"] as Record<string, unknown>;
    const appearance = video["appearance"] as Record<string, unknown>;
    expect(appearance["template"]).toBe("Mudgeeraba");
    expect(usedTemplateFallback).toBe(false);
  });

  it("resolves category from template_option.categoryId when GET branding omits nested category", () => {
    const base = minimalDataset();
    const b = brandingFixture({
      template: { ...brandingFixture().template!, category: "TwoColumnClassic" },
      template_option: { categoryId: 42, modeId: 1 },
    });
    const catalog = [
      {
        id: 42,
        name: "Mudgeeraba",
        slug: "Mudgeeraba",
        divideFixturesBy: null,
        isPrivate: false,
        bundleAudio: null,
      },
    ];
    const { data, usedTemplateFallback } = mergeAccountBrandingIntoDataset(base, {
      branding: b,
      logoUrl: null,
      templateModeSlug: null,
      templateCategoryCatalog: catalog,
    });

    const dataRec = data as unknown as Record<string, unknown>;
    const vm = dataRec["videoMeta"] as Record<string, unknown>;
    const video = vm["video"] as Record<string, unknown>;
    const appearance = video["appearance"] as Record<string, unknown>;
    expect(appearance["template"]).toBe("Mudgeeraba");
    expect(usedTemplateFallback).toBe(false);
  });

  it("handles null branding with default template resolution", () => {
    const base = minimalDataset();
    const { data, usedTemplateFallback } = mergeAccountBrandingIntoDataset(base, {
      branding: null,
      logoUrl: null,
      templateModeSlug: null,
    });

    expect(usedTemplateFallback).toBe(true);
    const dataRec = data as unknown as Record<string, unknown>;
    const vm = dataRec["videoMeta"] as Record<string, unknown>;
    const video = vm["video"] as Record<string, unknown>;
    const appearance = video["appearance"] as Record<string, unknown>;
    expect(appearance["template"]).toBe("TwoColumnClassic");
  });

  it("replaces example club.sponsors with account sponsors and drops extra example keys", () => {
    const base = minimalDataset();
    const accountSponsor: AccountSponsorDto = {
      id: 1390,
      name: "Goulburn Soldiers Club",
      url: "https://goulburnsoldiers.com.au/",
      startDate: null,
      endDate: null,
      isActive: true,
      isPrimary: true,
      tagline: null,
      order: 0,
      description: null,
      isVideo: true,
      isArticle: true,
      logo: {
        id: 8796,
        url: "https://fixtura.example/logo.jpg",
        width: 100,
        height: 100,
        mime: null,
        alternativeText: null,
      },
      sponsorshipAllocations: [],
    };

    const { data } = mergeAccountBrandingIntoDataset(base, {
      branding: brandingFixture(),
      logoUrl: null,
      templateModeSlug: null,
      accountSponsors: [accountSponsor],
    });

    const dataRec = data as unknown as Record<string, unknown>;
    const vm = dataRec["videoMeta"] as Record<string, unknown>;
    const club = vm["club"] as Record<string, unknown>;
    const sponsors = club["sponsors"] as Record<string, unknown>;
    expect(sponsors["legacyTeam"]).toBeUndefined();
    expect(sponsors["default"]).toBeDefined();
    expect(sponsors["primary"]).toBeDefined();

    const def = sponsors["default"] as Record<string, unknown>;
    const primarySlot = def["primary_sponsor"] as Array<Record<string, unknown>>;
    expect(primarySlot[0]?.["id"]).toBe(1390);
    expect(primarySlot[0]?.["name"]).toBe("Goulburn Soldiers Club");
    expect(primarySlot[0]?.["id"]).not.toBe(999);
  });

  it("clears example sponsors when accountSponsors is null", () => {
    const base = minimalDataset();
    const { data } = mergeAccountBrandingIntoDataset(base, {
      branding: brandingFixture(),
      logoUrl: null,
      templateModeSlug: null,
      accountSponsors: null,
    });
    const dataRec = data as unknown as Record<string, unknown>;
    const vm = dataRec["videoMeta"] as Record<string, unknown>;
    const club = vm["club"] as Record<string, unknown>;
    const sponsors = club["sponsors"] as Record<string, unknown>;
    const def = sponsors["default"] as Record<string, unknown>;
    expect(Object.keys(def)).toEqual([]);
    expect(sponsors["primary"]).toEqual([]);
  });
});
