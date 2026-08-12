import { describe, expect, it } from "vitest";

import {
  groupTemplateTexturesByCategory,
  mapCatalogTexturesToPickerItems,
  mapTemplateTextureUiItemToPickerItem,
  mapTemplateTexturesUiToPickerItems,
  resolveTemplateTextureCatalogItem,
} from "./template-builder-texture-catalog";

import type { TemplateTextureCatalogItem } from "@/types/api/all-template-options";
import type { TemplateTextureUiItem } from "@/types/api/template-textures";

const uiItems: TemplateTextureUiItem[] = [
  {
    id: 2,
    name: "Print Grain",
    category: "Print",
    opacity: "0.4",
    blendMode: "multiply",
    texture: {
      id: 20,
      url: "/uploads/print.png",
      width: 1024,
      height: 1024,
      mime: "image/png",
      alternativeText: null,
    },
  },
  {
    id: 1,
    name: "Paper Grain",
    category: "Paper",
    opacity: 0.5,
    blendMode: "multiply",
    texture: {
      id: 10,
      url: "https://cdn.example/paper.png",
      width: 2048,
      height: 2048,
      mime: "image/png",
      alternativeText: "Paper grain",
    },
  },
  {
    id: 3,
    name: "Legacy",
    category: null,
    opacity: null,
    blendMode: null,
    texture: null,
  },
];

describe("mapTemplateTextureUiItemToPickerItem", () => {
  it("coerces opacity and preserves category", () => {
    const mapped = mapTemplateTextureUiItemToPickerItem(uiItems[0]!);
    expect(mapped.opacity).toBe(0.4);
    expect(mapped.category).toBe("Print");
  });

  it("prefixes relative media urls when NEXT_PUBLIC_STRAPI_URL is set", () => {
    const original = process.env["NEXT_PUBLIC_STRAPI_URL"];
    process.env["NEXT_PUBLIC_STRAPI_URL"] = "https://cms.example.com";

    const mapped = mapTemplateTextureUiItemToPickerItem(uiItems[0]!);
    expect(mapped.texture?.url).toBe("https://cms.example.com/uploads/print.png");

    if (original === undefined) {
      delete process.env["NEXT_PUBLIC_STRAPI_URL"];
    } else {
      process.env["NEXT_PUBLIC_STRAPI_URL"] = original;
    }
  });
});

describe("mapCatalogTexturesToPickerItems", () => {
  it("maps fat-catalog textures without category", () => {
    const catalogItems: TemplateTextureCatalogItem[] = [
      { id: 5, name: "Legacy", opacity: 0.3, blendMode: "multiply", texture: null },
    ];

    expect(mapCatalogTexturesToPickerItems(catalogItems)).toEqual([
      { id: 5, name: "Legacy", category: null, opacity: 0.3, blendMode: "multiply", texture: null },
    ]);
  });
});

describe("groupTemplateTexturesByCategory", () => {
  it("orders known categories and puts uncategorized last", () => {
    const pickerItems = mapTemplateTexturesUiToPickerItems(uiItems);
    const groups = groupTemplateTexturesByCategory(pickerItems);

    expect(groups.map((group) => group.label)).toEqual(["Paper", "Print", "Other"]);
    expect(groups[0]?.items.map((item) => item.id)).toEqual([1]);
    expect(groups[1]?.items.map((item) => item.id)).toEqual([2]);
    expect(groups[2]?.items.map((item) => item.id)).toEqual([3]);
  });
});

describe("resolveTemplateTextureCatalogItem", () => {
  it("prefers ui catalog over fat catalog", () => {
    const pickerItems = mapTemplateTexturesUiToPickerItems(uiItems);
    const resolved = resolveTemplateTextureCatalogItem(
      2,
      pickerItems,
      [{ id: 2, name: "Stale", opacity: null, blendMode: null, texture: null }],
      null,
    );

    expect(resolved).toMatchObject({ id: 2, name: "Print Grain", category: "Print" });
  });

  it("falls back to current selection when ui catalog misses the id", () => {
    const resolved = resolveTemplateTextureCatalogItem(9, [], [], {
      id: 9,
      name: "Saved texture",
      opacity: 0.2,
      blendMode: "multiply",
      texture: null,
    });

    expect(resolved).toMatchObject({ id: 9, name: "Saved texture", category: null });
  });
});
