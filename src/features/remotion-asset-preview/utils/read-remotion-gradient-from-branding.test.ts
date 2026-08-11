import { describe, expect, it } from "vitest";

import {
  normalizeTemplateGradientDirectionToRemotionKey,
  normalizeTemplateGradientTypeToRemotionKey,
  readRemotionGradientFromBranding,
  resolveRemotionGradientFromCatalogGradient,
} from "./read-remotion-gradient-from-branding";

import type { AccountBrandingData } from "@/types/api/account";

describe("normalizeTemplateGradientTypeToRemotionKey", () => {
  it("maps exact and case-insensitive Remotion gradient type keys", () => {
    expect(normalizeTemplateGradientTypeToRemotionKey("primary")).toBe("primary");
    expect(normalizeTemplateGradientTypeToRemotionKey("Secondary")).toBe("secondary");
    expect(normalizeTemplateGradientTypeToRemotionKey("PRIMARYTOSECONDARY")).toBe(
      "primaryToSecondary",
    );
  });

  it("maps spaced display labels to camelCase keys", () => {
    expect(normalizeTemplateGradientTypeToRemotionKey("Primary To Secondary")).toBe(
      "primaryToSecondary",
    );
    expect(normalizeTemplateGradientTypeToRemotionKey("Secondary To Primary")).toBe(
      "secondaryToPrimary",
    );
  });

  it("rejects CSS gradient kinds and unknown tokens", () => {
    expect(normalizeTemplateGradientTypeToRemotionKey("linear")).toBeNull();
    expect(normalizeTemplateGradientTypeToRemotionKey("radial")).toBeNull();
    expect(normalizeTemplateGradientTypeToRemotionKey("not-a-gradient")).toBeNull();
    expect(normalizeTemplateGradientTypeToRemotionKey(null)).toBeNull();
  });

  it("maps CMS display labels with reversed word order", () => {
    expect(normalizeTemplateGradientTypeToRemotionKey("Radial Primary")).toBe("primaryRadial");
    expect(normalizeTemplateGradientTypeToRemotionKey("Radial Secondary")).toBe("secondaryRadial");
    expect(normalizeTemplateGradientTypeToRemotionKey("Conic Gradient")).toBe("conicGradient");
    expect(normalizeTemplateGradientTypeToRemotionKey("Mesh Gradient")).toBe("meshGradient");
  });
});

describe("normalizeTemplateGradientDirectionToRemotionKey", () => {
  it("maps enum keys case-insensitively", () => {
    expect(normalizeTemplateGradientDirectionToRemotionKey("HORIZONTAL")).toBe("HORIZONTAL");
    expect(normalizeTemplateGradientDirectionToRemotionKey("vertical")).toBe("VERTICAL");
  });

  it("maps CSS direction strings to enum keys", () => {
    expect(normalizeTemplateGradientDirectionToRemotionKey("to right")).toBe("HORIZONTAL");
    expect(normalizeTemplateGradientDirectionToRemotionKey("to bottom")).toBe("VERTICAL");
    expect(normalizeTemplateGradientDirectionToRemotionKey("to bottom right")).toBe("DIAGONAL");
  });

  it("maps spaced lowercase direction labels to enum keys", () => {
    expect(normalizeTemplateGradientDirectionToRemotionKey("diagonal")).toBe("DIAGONAL");
  });

  it("returns null for unknown direction", () => {
    expect(normalizeTemplateGradientDirectionToRemotionKey("northwest")).toBeNull();
    expect(normalizeTemplateGradientDirectionToRemotionKey(null)).toBeNull();
  });
});

describe("readRemotionGradientFromBranding", () => {
  it("reads gradient object from template_option", () => {
    const branding = {
      id: 1,
      template: null,
      theme: null,
      template_option: {
        gradient: { id: 4, name: "Sec vert", type: "secondary", direction: "VERTICAL" },
      },
    } as unknown as AccountBrandingData;
    expect(readRemotionGradientFromBranding(branding)).toEqual({
      type: "secondary",
      direction: "VERTICAL",
    });
  });

  it("reads type from name when type is null", () => {
    const branding = {
      id: 1,
      template: null,
      theme: null,
      template_option: {
        gradient: { id: 1, name: "Primary to secondary", type: null, direction: "HORIZONTAL" },
      },
    } as unknown as AccountBrandingData;
    expect(readRemotionGradientFromBranding(branding)).toEqual({
      type: "primaryToSecondary",
      direction: "HORIZONTAL",
    });
  });

  it("reads string gradient as type with default HORIZONTAL direction", () => {
    const branding = {
      id: 1,
      template: null,
      theme: null,
      template_option: { gradient: "primaryToSecondary" },
    } as unknown as AccountBrandingData;
    expect(readRemotionGradientFromBranding(branding)).toEqual({
      type: "primaryToSecondary",
      direction: "HORIZONTAL",
    });
  });

  it("normalizes CSS direction on template_option gradient", () => {
    const branding = {
      id: 1,
      template: null,
      theme: null,
      template_option: {
        gradient: { type: "primary", direction: "to right" },
      },
    } as unknown as AccountBrandingData;
    expect(readRemotionGradientFromBranding(branding)).toEqual({
      type: "primary",
      direction: "HORIZONTAL",
    });
  });

  it("falls back to theme.theme.gradient object", () => {
    const branding = {
      id: 1,
      template: null,
      theme: {
        id: 1,
        name: "T",
        theme: { gradient: { type: "secondary", direction: "VERTICAL" } },
      },
      template_option: null,
    } as unknown as AccountBrandingData;
    expect(readRemotionGradientFromBranding(branding)).toEqual({
      type: "secondary",
      direction: "VERTICAL",
    });
  });

  it("defaults direction to HORIZONTAL when type resolves but direction is missing", () => {
    expect(
      readRemotionGradientFromBranding({
        id: 1,
        template: null,
        theme: null,
        template_option: { gradient: { type: "primary" } },
      } as unknown as AccountBrandingData),
    ).toEqual({
      type: "primary",
      direction: "HORIZONTAL",
    });
  });

  it("resolves CMS catalog gradient names for radial, conic, and mesh", () => {
    expect(
      resolveRemotionGradientFromCatalogGradient({
        id: 1,
        name: "Radial Primary",
        type: null,
        direction: null,
      }),
    ).toEqual({ type: "primaryRadial", direction: "HORIZONTAL" });
    expect(
      resolveRemotionGradientFromCatalogGradient({
        id: 2,
        name: "Radial Secondary",
        type: null,
        direction: null,
      }),
    ).toEqual({ type: "secondaryRadial", direction: "HORIZONTAL" });
    expect(
      resolveRemotionGradientFromCatalogGradient({
        id: 3,
        name: "Conic Gradient",
        type: null,
        direction: null,
      }),
    ).toEqual({ type: "conicGradient", direction: "HORIZONTAL" });
    expect(
      resolveRemotionGradientFromCatalogGradient({
        id: 4,
        name: "Mesh Gradient",
        type: null,
        direction: null,
      }),
    ).toEqual({ type: "meshGradient", direction: "HORIZONTAL" });
  });

  it("returns null when gradient is missing, partial, or invalid", () => {
    expect(readRemotionGradientFromBranding(null)).toBeNull();
    expect(
      readRemotionGradientFromBranding({
        id: 1,
        template: null,
        theme: null,
        template_option: { gradient: { type: "linear", direction: "HORIZONTAL" } },
      } as unknown as AccountBrandingData),
    ).toBeNull();
    expect(
      readRemotionGradientFromBranding({
        id: 1,
        template: null,
        theme: null,
        template_option: { gradient: { name: "Unknown" } },
      } as unknown as AccountBrandingData),
    ).toBeNull();
  });
});
