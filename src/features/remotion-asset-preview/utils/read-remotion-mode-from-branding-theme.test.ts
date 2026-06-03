import { describe, expect, it } from "vitest";

import { readRemotionModeFromBrandingThemeJson } from "./read-remotion-mode-from-branding-theme";

import type { AccountBrandingData } from "@/types/api/account";

describe("readRemotionModeFromBrandingThemeJson", () => {
  it("reads mode from theme.theme when present", () => {
    const branding = {
      id: 1,
      theme: {
        id: 1,
        name: "T",
        theme: { mode: "dark" },
      },
      template: null,
      template_option: null,
    } as unknown as AccountBrandingData;
    expect(readRemotionModeFromBrandingThemeJson(branding)).toBe("dark");
  });

  it("falls back to template_option.mode when theme JSON has no mode", () => {
    const branding = {
      id: 1,
      theme: {
        id: 1,
        name: "T",
        theme: { primary: "#fff", secondary: "#000" },
      },
      template: null,
      template_option: { mode: "light", modeId: 1 },
    } as unknown as AccountBrandingData;
    expect(readRemotionModeFromBrandingThemeJson(branding)).toBe("light");
  });
});
