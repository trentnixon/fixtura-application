import tinycolor from "tinycolor2";
import { describe, expect, it } from "vitest";

import {
  buildRemotionPaletteLayoutColorPairs,
  remotionPaletteLayoutSplitBackground,
  resolveRemotionPaletteLayoutColors,
  resolveRemotionPaletteLayoutColorsFromKey,
} from "./resolve-remotion-palette-layout-colors";

const BRAND = {
  primary: "#1a73e8",
  secondary: "#34a853",
};

describe("buildRemotionPaletteLayoutColorPairs", () => {
  it("maps primary layout to brand primary and secondary", () => {
    const pairs = buildRemotionPaletteLayoutColorPairs(BRAND.primary, BRAND.secondary);
    expect(pairs.primary).toEqual([BRAND.primary, BRAND.secondary]);
    expect(pairs.secondary).toEqual([BRAND.secondary, BRAND.primary]);
    expect(pairs.highContrast).toEqual([BRAND.primary, BRAND.secondary]);
  });

  it("uses white and black literals for on-white and on-black layouts", () => {
    const pairs = buildRemotionPaletteLayoutColorPairs(BRAND.primary, BRAND.secondary);
    expect(pairs.primaryOnWhite).toEqual([BRAND.primary, "white"]);
    expect(pairs.secondaryOnBlack).toEqual([BRAND.secondary, "black"]);
  });

  it("returns identical sides for monochromatic", () => {
    const pairs = buildRemotionPaletteLayoutColorPairs(BRAND.primary, BRAND.secondary);
    expect(pairs.monochromatic).toEqual([BRAND.primary, BRAND.primary]);
  });
});

describe("resolveRemotionPaletteLayoutColorsFromKey", () => {
  it("returns deterministic complementary and analogous pairs", () => {
    const complementary = resolveRemotionPaletteLayoutColorsFromKey("complementary", BRAND);
    expect(complementary.left).toBe(BRAND.primary);
    expect(complementary.right).toBe(tinycolor(BRAND.primary).complement().toString());

    const analogous = resolveRemotionPaletteLayoutColorsFromKey("analogous", BRAND);
    expect(analogous.left).toBe(BRAND.primary);
    expect(analogous.right).toBe(tinycolor(BRAND.primary).spin(30).toString());
  });
});

describe("resolveRemotionPaletteLayoutColors", () => {
  it("resolves palette value token before name", () => {
    expect(
      resolveRemotionPaletteLayoutColors({ id: 2, name: "Wrong Label", value: "analogous" }, BRAND),
    ).toMatchObject({ key: "analogous", left: BRAND.primary });
  });

  it("falls back to palette name when value is not a layout key", () => {
    expect(
      resolveRemotionPaletteLayoutColors({ id: 1, name: "Primary", value: null }, BRAND),
    ).toMatchObject({ key: "primary", left: BRAND.primary, right: BRAND.secondary });
  });

  it("returns null for unknown palette tokens", () => {
    expect(
      resolveRemotionPaletteLayoutColors({ id: 99, name: "Custom", value: "not-a-palette" }, BRAND),
    ).toBeNull();
  });

  it("returns null when value is a hex swatch only", () => {
    expect(
      resolveRemotionPaletteLayoutColors({ id: 3, name: "Blue", value: "#112233" }, BRAND),
    ).toBeNull();
  });
});

describe("remotionPaletteLayoutSplitBackground", () => {
  it("builds a horizontal 50/50 gradient", () => {
    expect(remotionPaletteLayoutSplitBackground("#111", "#222")).toBe(
      "linear-gradient(to right, #111 50%, #222 50%)",
    );
  });
});
