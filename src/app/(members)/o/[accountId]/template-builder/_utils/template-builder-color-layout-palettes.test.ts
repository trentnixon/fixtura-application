import { describe, expect, it } from "vitest";

import {
  filterColorLayoutPalettes,
  isColorLayoutPaletteHidden,
} from "./template-builder-color-layout-palettes";

import type { TemplatePaletteItem } from "@/types/api/all-template-options";

function palette(id: number, name: string, value: string | null = null): TemplatePaletteItem {
  return { id, name, value };
}

describe("isColorLayoutPaletteHidden", () => {
  it("hides primary and secondary accent palettes by remotion key", () => {
    expect(isColorLayoutPaletteHidden(palette(1, "Primary Accent", "accentPrimary"))).toBe(true);
    expect(isColorLayoutPaletteHidden(palette(2, "Secondary Accent", "accentSecondary"))).toBe(
      true,
    );
  });

  it("hides primary and secondary accent palettes by label when key is absent", () => {
    expect(isColorLayoutPaletteHidden(palette(3, "Primary Accent"))).toBe(true);
    expect(isColorLayoutPaletteHidden(palette(4, "Secondary Accent"))).toBe(true);
  });

  it("keeps other palette layouts visible", () => {
    expect(isColorLayoutPaletteHidden(palette(5, "Primary", "primary"))).toBe(false);
    expect(isColorLayoutPaletteHidden(palette(6, "Complementary", "complementary"))).toBe(false);
  });
});

describe("filterColorLayoutPalettes", () => {
  const items = [
    palette(1, "Primary", "primary"),
    palette(2, "Primary Accent", "accentPrimary"),
    palette(3, "Secondary Accent", "accentSecondary"),
    palette(4, "Analogous", "analogous"),
  ];

  it("removes accent palettes from the picker list", () => {
    expect(filterColorLayoutPalettes(items).map((item) => item.id)).toEqual([1, 4]);
  });

  it("keeps a hidden palette when it is currently selected", () => {
    expect(filterColorLayoutPalettes(items, 2).map((item) => item.id)).toEqual([1, 2, 4]);
  });
});
