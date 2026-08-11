import { describe, expect, it } from "vitest";

import {
  formatCatalogItemLabel,
  formatPaletteLabel,
  formatOriginalSettingLabel,
  formatSavedOptionLabel,
  formatTextureLabel,
  formatUseBackgroundLabel,
  formatVideoLabel,
} from "./template-builder-option-labels";

describe("formatCatalogItemLabel", () => {
  it("prefers name, then slug, then value, then id", () => {
    expect(formatCatalogItemLabel({ id: 1, name: " Alpha " })).toBe("Alpha");
    expect(formatCatalogItemLabel({ id: 2, slug: "beta" })).toBe("beta");
    expect(formatCatalogItemLabel({ id: 3, value: "#fff" })).toBe("#fff");
    expect(formatCatalogItemLabel({ id: 4 })).toBe("4");
  });
});

describe("formatPaletteLabel", () => {
  it("appends value when distinct from base label", () => {
    expect(formatPaletteLabel({ id: 1, name: "Primary", value: "#112233" })).toBe(
      "Primary (#112233)",
    );
  });
});

describe("formatTextureLabel", () => {
  it("includes mime when present", () => {
    expect(
      formatTextureLabel({
        id: 1,
        name: "Grain",
        opacity: null,
        blendMode: null,
        texture: {
          id: 9,
          url: null,
          width: null,
          height: null,
          mime: "image/png",
          alternativeText: null,
        },
      }),
    ).toBe("Grain - image/png");
  });
});

describe("formatVideoLabel", () => {
  it("includes position and size when readable", () => {
    expect(
      formatVideoLabel({
        id: 1,
        name: "Intro",
        position: "top",
        size: "cover",
        loop: null,
        muted: null,
        offthread: null,
        volume: null,
        rate: null,
        overlay: null,
      }),
    ).toBe("Intro (top, cover)");
  });
});

describe("formatSavedOptionLabel / formatUseBackgroundLabel", () => {
  it("formats unset and fallback id labels", () => {
    expect(formatSavedOptionLabel(null, null)).toBe("Unset");
    expect(formatSavedOptionLabel(5, null)).toBe("ID 5");
    expect(formatSavedOptionLabel(5, "Saved")).toBe("Saved");
  });

  it("formats original setting baseline labels", () => {
    expect(formatOriginalSettingLabel(null, null)).toBe("Not set");
    expect(formatOriginalSettingLabel(5, "Club")).toBe("Club");
    expect(formatOriginalSettingLabel(5, null)).toBe("ID 5");
  });

  it("formats useBackground enum display", () => {
    expect(formatUseBackgroundLabel(null)).toBe("Unset");
    expect(formatUseBackgroundLabel("Gradient")).toBe("Gradient");
    expect(formatUseBackgroundLabel("Solid")).toBe("Solid");
  });
});
