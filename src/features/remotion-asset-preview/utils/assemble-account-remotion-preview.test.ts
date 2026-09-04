import { describe, expect, it } from "vitest";

import { assembleAccountRemotionPreview } from "./assemble-account-remotion-preview";
import { EMPTY_CLUB_SPONSORS } from "./sponsors-payload-v2";

import type { AccountBrandingData, AccountSponsorDto } from "@/types/api/account";
import type { TemplateCategoryCatalogItem } from "@/types/api/all-template-options";
import type { FixturaDataset } from "@/vendor/fixtura-remotion-assets/preview";

/** Saved-source adapter so legacy merge cases exercise the public assembly seam. */
function assembleSaved(
  base: FixturaDataset,
  input: {
    branding: AccountBrandingData | null;
    logoUrl: string | null;
    templateModeSlug: string | null;
    templateCategoryCatalog?: TemplateCategoryCatalogItem[] | null;
    accountSponsors?: AccountSponsorDto[] | null;
  },
) {
  return assembleAccountRemotionPreview({
    base,
    source: { kind: "saved", branding: input.branding },
    logoUrl: input.logoUrl,
    templateModeSlug: input.templateModeSlug,
    ...(input.templateCategoryCatalog !== undefined
      ? { templateCategoryCatalog: input.templateCategoryCatalog }
      : {}),
    ...(input.accountSponsors !== undefined ? { accountSponsors: input.accountSponsors } : {}),
  });
}

function minimalDataset(template = "TwoColumnClassic"): FixturaDataset {
  return {
    videoMeta: {
      club: {
        logo: { hasLogo: false, url: "" },
        sponsors: {
          primary: [{ id: 999, name: "Example", logo: { id: 1, url: "https://ex/e.png" } }],
          general: [],
          sponsorNum: 1,
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
        metadata: { compositionId: "CricketLadder", includeSponsors: true },
      },
    },
    data: [
      {
        gradeName: "Demo",
        assignSponsors: { competition: [], grade: [], team: [] },
        primaryForScreen: [],
      },
    ],
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

describe("assembleAccountRemotionPreview (saved)", () => {
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

    const { data } = assembleSaved(base, {
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

    const { data } = assembleSaved(base, {
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
    const { data, usedTemplateFallback } = assembleSaved(base, {
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
    const { data, usedTemplateFallback } = assembleSaved(base, {
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
    const { data, usedTemplateFallback } = assembleSaved(base, {
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
    const { data } = assembleSaved(base, {
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
    const { data } = assembleSaved(base, {
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
    const { data } = assembleSaved(base, {
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
    const { data } = assembleSaved(base, {
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
    const { data } = assembleSaved(base, {
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
    const { data } = assembleSaved(base, {
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
    const { data } = assembleSaved(base, {
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
    const { data } = assembleSaved(base, {
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
    const { data } = assembleSaved(base, {
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

    const { data } = assembleSaved(base, {
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
    const { data } = assembleSaved(base, {
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
    const { data } = assembleSaved(base, {
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

    const { data } = assembleSaved(base, {
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
    const { data, usedTemplateFallback } = assembleSaved(base, {
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
    const { data, usedTemplateFallback } = assembleSaved(base, {
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
    const { data, usedTemplateFallback } = assembleSaved(base, {
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
    const { data, usedTemplateFallback } = assembleSaved(base, {
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

  it("replaces example club.sponsors with v2 primary/general and stamps content rows", () => {
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

    const { data } = assembleSaved(base, {
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
    expect(sponsors["default"]).toBeUndefined();
    expect(sponsors["primary"]).toEqual([
      {
        id: 1390,
        name: "Goulburn Soldiers Club",
        logo: { id: 8796, url: "https://fixtura.example/logo.jpg" },
      },
    ]);
    expect(sponsors["general"]).toEqual([]);
    expect(sponsors["sponsorNum"]).toBe(1);

    const video = vm["video"] as Record<string, unknown>;
    const metadata = video["metadata"] as Record<string, unknown>;
    expect(metadata["includeSponsors"]).toBe(true);

    const rows = dataRec["data"] as Array<Record<string, unknown>>;
    expect(rows[0]?.["primaryForScreen"]).toEqual([
      {
        id: 1390,
        name: "Goulburn Soldiers Club",
        logo: { id: 8796, url: "https://fixtura.example/logo.jpg" },
      },
    ]);
    expect(rows[0]?.["assignSponsors"]).toEqual({
      competition: [],
      grade: [],
      team: [],
    });
  });

  it("clears example sponsors when accountSponsors is null", () => {
    const base = minimalDataset();
    const { data } = assembleSaved(base, {
      branding: brandingFixture(),
      logoUrl: null,
      templateModeSlug: null,
      accountSponsors: null,
    });
    const dataRec = data as unknown as Record<string, unknown>;
    const vm = dataRec["videoMeta"] as Record<string, unknown>;
    const club = vm["club"] as Record<string, unknown>;
    const sponsors = club["sponsors"] as Record<string, unknown>;
    expect(sponsors).toEqual(EMPTY_CLUB_SPONSORS);

    const video = vm["video"] as Record<string, unknown>;
    const metadata = video["metadata"] as Record<string, unknown>;
    expect(metadata["includeSponsors"]).toBe(false);

    const rows = dataRec["data"] as Array<Record<string, unknown>>;
    expect(rows[0]?.["primaryForScreen"]).toEqual([]);
  });

  it("sets includeSponsors when only general sponsors exist", () => {
    const base = minimalDataset();
    const { data } = assembleSaved(base, {
      branding: brandingFixture(),
      logoUrl: null,
      templateModeSlug: null,
      accountSponsors: [
        {
          id: 501,
          name: "Outro Only",
          url: null,
          startDate: null,
          endDate: null,
          isActive: true,
          isPrimary: false,
          tagline: null,
          order: 0,
          description: null,
          isVideo: false,
          isArticle: false,
          logo: {
            id: 88,
            url: "https://fixtura.example/outro.png",
            width: 1,
            height: 1,
            mime: null,
            alternativeText: null,
          },
          sponsorshipAllocations: [],
        },
      ],
    });

    const dataRec = data as unknown as Record<string, unknown>;
    const vm = dataRec["videoMeta"] as Record<string, unknown>;
    const club = vm["club"] as Record<string, unknown>;
    const sponsors = club["sponsors"] as Record<string, unknown>;
    expect(sponsors["primary"]).toEqual([]);
    expect(sponsors["general"]).toEqual([
      { id: 501, name: "Outro Only", logo: { id: 88, url: "https://fixtura.example/outro.png" } },
    ]);
    expect(sponsors["sponsorNum"]).toBe(1);

    const video = vm["video"] as Record<string, unknown>;
    const metadata = video["metadata"] as Record<string, unknown>;
    expect(metadata["includeSponsors"]).toBe(true);
  });

  it("does not invent sponsor fields on nested objects that lack assignSponsors/primaryForScreen", () => {
    const base = minimalDataset();
    const baseRec = base as unknown as Record<string, unknown>;
    const rows = baseRec["data"] as Array<Record<string, unknown>>;
    rows[0]!["nestedMeta"] = { label: "untouched", count: 2 };

    const { data } = assembleSaved(base, {
      branding: brandingFixture(),
      logoUrl: null,
      templateModeSlug: null,
      accountSponsors: [
        {
          id: 7,
          name: "Only Row",
          url: null,
          startDate: null,
          endDate: null,
          isActive: true,
          isPrimary: true,
          tagline: null,
          order: 0,
          description: null,
          isVideo: false,
          isArticle: false,
          logo: null,
          sponsorshipAllocations: [],
        },
      ],
    });

    const dataRec = data as unknown as Record<string, unknown>;
    const outRows = dataRec["data"] as Array<Record<string, unknown>>;
    expect(outRows[0]?.["nestedMeta"]).toEqual({ label: "untouched", count: 2 });
    expect(outRows[0]?.["nestedMeta"]).not.toHaveProperty("primaryForScreen");
    expect(outRows[0]?.["nestedMeta"]).not.toHaveProperty("assignSponsors");
  });
});

describe("assembleAccountRemotionPreview (draft)", () => {
  const draft = {
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
    useBackground: "Gradient" as const,
    animation: null,
  };

  const catalog = {
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
    textures: [],
    videos: [],
    animations: [],
    defaultAnimationPresetId: null,
    currentSelection: null,
  };

  it("overlays draft category and mode onto the Remotion dataset", () => {
    const base = minimalDataset();
    const saved = brandingFixture({
      template: { ...brandingFixture().template!, category: "Saved" },
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
    });

    const { data, usedTemplateFallback } = assembleAccountRemotionPreview({
      base,
      source: {
        kind: "draft",
        branding: saved,
        draft,
        templateOptionsCatalog: catalog,
      },
      logoUrl: null,
      templateModeSlug: null,
    });

    const dataRec = data as unknown as Record<string, unknown>;
    const vm = dataRec["videoMeta"] as Record<string, unknown>;
    const video = vm["video"] as Record<string, unknown>;
    const appearance = video["appearance"] as Record<string, unknown>;
    const tv = video["templateVariation"] as Record<string, unknown>;

    expect(appearance["template"]).toBe("BroadcastPro");
    expect(usedTemplateFallback).toBe(false);
    expect(tv["mode"]).toBe("dark");
    expect(tv["useBackground"]).toBe("Gradient");
    expect(tv["palette"]).toBe("analogous");
    expect(saved.template?.category).toBe("Saved");
  });

  it("does not expose inactive background assets from draft in the dataset", () => {
    const base = minimalDataset();
    const saved = brandingFixture({
      template_option: {
        useBackground: "Solid",
        video: {
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
      },
    });

    const { data } = assembleAccountRemotionPreview({
      base,
      source: {
        kind: "draft",
        branding: saved,
        draft: {
          ...draft,
          useBackground: "Gradient",
          templateGradientId: 4,
          templateVideoId: 10,
        },
        templateOptionsCatalog: {
          ...catalog,
          gradients: [{ id: 4, name: "Sunset", type: "primary", direction: "VERTICAL" }],
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
      },
      logoUrl: null,
      templateModeSlug: null,
    });

    const dataRec = data as unknown as Record<string, unknown>;
    const vm = dataRec["videoMeta"] as Record<string, unknown>;
    const video = vm["video"] as Record<string, unknown>;
    const tv = video["templateVariation"] as Record<string, unknown>;
    expect(tv["useBackground"]).toBe("Gradient");
    expect(tv["gradient"]).toBeTruthy();
    expect(tv["video"]).toBeUndefined();
  });

  it("maps Animated draft to templateVariation.animation", () => {
    const base = minimalDataset();
    const saved = brandingFixture({
      template_option: {
        useBackground: "Solid",
      },
    });

    const { data } = assembleAccountRemotionPreview({
      base,
      source: {
        kind: "draft",
        branding: saved,
        draft: {
          ...draft,
          useBackground: "Animated",
          animation: { type: "snow-field", particleCount: 300, speed: 1, direction: "random" },
        },
        templateOptionsCatalog: catalog,
      },
      logoUrl: null,
      templateModeSlug: null,
    });

    const dataRec = data as unknown as Record<string, unknown>;
    const vm = dataRec["videoMeta"] as Record<string, unknown>;
    const video = vm["video"] as Record<string, unknown>;
    const tv = video["templateVariation"] as Record<string, unknown>;

    expect(tv["useBackground"]).toBe("Animated");
    expect(tv["animation"]).toEqual({
      type: "snow-field",
      particleCount: 300,
      speed: 1,
      direction: "random",
    });
    expect(tv).not.toHaveProperty("particle");
    expect(tv).not.toHaveProperty("noise");
  });
});
