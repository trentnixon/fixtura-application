import { describe, expect, it } from "vitest";

import {
  normalizeTemplatePaletteNameToRemotionKey,
  readRemotionPaletteKeyFromBranding,
} from "./read-remotion-palette-key-from-branding";

import type { AccountBrandingData } from "@/types/api/account";

describe("normalizeTemplatePaletteNameToRemotionKey", () => {
  it("maps exact and case-insensitive Remotion keys", () => {
    expect(normalizeTemplatePaletteNameToRemotionKey("primary")).toBe("primary");
    expect(normalizeTemplatePaletteNameToRemotionKey("Analogous")).toBe("analogous");
    expect(normalizeTemplatePaletteNameToRemotionKey("PRIMARYONWHITE")).toBe("primaryOnWhite");
  });

  it("maps spaced display labels to camelCase keys", () => {
    expect(normalizeTemplatePaletteNameToRemotionKey("Primary On White")).toBe("primaryOnWhite");
    expect(normalizeTemplatePaletteNameToRemotionKey("High Contrast")).toBe("highContrast");
  });

  it("rejects hex values and unknown tokens", () => {
    expect(normalizeTemplatePaletteNameToRemotionKey("#ff0000")).toBeNull();
    expect(normalizeTemplatePaletteNameToRemotionKey("not-a-palette")).toBeNull();
    expect(normalizeTemplatePaletteNameToRemotionKey(null)).toBeNull();
  });
});

describe("readRemotionPaletteKeyFromBranding", () => {
  it("reads palette object from template_option (value then name)", () => {
    const branding = {
      id: 1,
      template: null,
      theme: null,
      template_option: {
        palette: { id: 2, name: "Analogous", value: "analogous" },
      },
    } as unknown as AccountBrandingData;
    expect(readRemotionPaletteKeyFromBranding(branding)).toBe("analogous");
  });

  it("reads palette name when value is null", () => {
    const branding = {
      id: 1,
      template: null,
      theme: null,
      template_option: {
        palette: { id: 1, name: "primary", value: null },
      },
    } as unknown as AccountBrandingData;
    expect(readRemotionPaletteKeyFromBranding(branding)).toBe("primary");
  });

  it("reads string palette on template_option", () => {
    const branding = {
      id: 1,
      template: null,
      theme: null,
      template_option: { palette: "complementary" },
    } as unknown as AccountBrandingData;
    expect(readRemotionPaletteKeyFromBranding(branding)).toBe("complementary");
  });

  it("skips hex palette value and falls back to name", () => {
    const branding = {
      id: 1,
      template: null,
      theme: null,
      template_option: {
        palette: { id: 1, name: "triadic", value: "#aabbcc" },
      },
    } as unknown as AccountBrandingData;
    expect(readRemotionPaletteKeyFromBranding(branding)).toBe("triadic");
  });

  it("falls back to theme.theme.palette string", () => {
    const branding = {
      id: 1,
      template: null,
      theme: {
        id: 1,
        name: "T",
        theme: { palette: "secondary" },
      },
      template_option: null,
    } as unknown as AccountBrandingData;
    expect(readRemotionPaletteKeyFromBranding(branding)).toBe("secondary");
  });

  it("returns null when palette is missing or invalid", () => {
    expect(readRemotionPaletteKeyFromBranding(null)).toBeNull();
    expect(
      readRemotionPaletteKeyFromBranding({
        id: 1,
        template: null,
        theme: null,
        template_option: { palette: { name: "Unknown Palette" } },
      } as unknown as AccountBrandingData),
    ).toBeNull();
  });
});
