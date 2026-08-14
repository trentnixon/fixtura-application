import { describe, expect, it } from "vitest";

import { resolveAccountTemplateCategorySlug } from "./resolve-account-template-category-slug";

import type { AccountBrandingData } from "@/types/api/account";
import type { TemplateCategoryCatalogItem } from "@/types/api/all-template-options";

function branding(overrides: Partial<AccountBrandingData> = {}): AccountBrandingData {
  return {
    id: 1,
    template: null,
    theme: null,
    template_option: null,
    ...overrides,
  };
}

const catalog: TemplateCategoryCatalogItem[] = [
  {
    id: 42,
    name: "Mudgeeraba",
    slug: "Mudgeeraba",
    divideFixturesBy: null,
    isPrivate: false,
    bundleAudio: null,
  },
];

describe("resolveAccountTemplateCategorySlug", () => {
  it("prefers template_option.category.slug over template.category", () => {
    const slug = resolveAccountTemplateCategorySlug(
      branding({
        template: {
          id: 1,
          name: "Legacy",
          frontEndName: null,
          requiresMedia: false,
          variation: null,
          category: "TwoColumnClassic",
          templateVariation: null,
          divideFixturesBy: null,
          bundleAudio: null,
          poster: null,
          video: null,
          gallery: [],
        },
        template_option: {
          category: { slug: "BroadcastPro", name: "Broadcast Pro" },
        },
      }),
    );

    expect(slug).toBe("BroadcastPro");
  });

  it("resolves template_option.categoryId via category catalog", () => {
    const slug = resolveAccountTemplateCategorySlug(
      branding({
        template: {
          id: 1,
          name: "Legacy",
          frontEndName: null,
          requiresMedia: false,
          variation: null,
          category: "TwoColumnClassic",
          templateVariation: null,
          divideFixturesBy: null,
          bundleAudio: null,
          poster: null,
          video: null,
          gallery: [],
        },
        template_option: { categoryId: 42, modeId: 1 },
      }),
      catalog,
    );

    expect(slug).toBe("Mudgeeraba");
  });

  it("falls back to template.category when template_option has no category", () => {
    const slug = resolveAccountTemplateCategorySlug(
      branding({
        template: {
          id: 1,
          name: "T",
          frontEndName: null,
          requiresMedia: false,
          variation: null,
          category: "Mudgeeraba",
          templateVariation: null,
          divideFixturesBy: null,
          bundleAudio: null,
          poster: null,
          video: null,
          gallery: [],
        },
        template_option: { modeId: 1 },
      }),
    );

    expect(slug).toBe("Mudgeeraba");
  });
});
