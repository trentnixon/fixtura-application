import { describe, expect, it } from "vitest";

import { buildCategoryItemsForEditor } from "./template-builder-editor";

import type { TemplateCategoryCatalogItem } from "@/types/api/all-template-options";

function category(id: number, name: string, isPrivate = false): TemplateCategoryCatalogItem {
  return {
    id,
    name,
    slug: name.toLowerCase(),
    divideFixturesBy: null,
    isPrivate,
    bundleAudio: null,
  };
}

describe("buildCategoryItemsForEditor", () => {
  it("uses broader category options when available", () => {
    const items = buildCategoryItemsForEditor({
      catalogCategories: [category(1, "Catalog")],
      categoryOptions: [category(2, "Selection list")],
    });

    expect(items.map((item) => item.id)).toEqual([2]);
  });

  it("filters private categories from broader category options", () => {
    const items = buildCategoryItemsForEditor({
      catalogCategories: [category(1, "Catalog")],
      categoryOptions: [category(2, "Public"), category(8, "Private", true)],
    });

    expect(items.map((item) => item.id)).toEqual([2]);
  });

  it("does not reintroduce private categories from the catalog fallback", () => {
    const items = buildCategoryItemsForEditor({
      catalogCategories: [category(1, "Public"), category(8, "Private", true)],
      categoryOptions: null,
    });

    expect(items.map((item) => item.id)).toEqual([1]);
  });
});
