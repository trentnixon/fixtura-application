import { describe, expect, it } from "vitest";

import {
  THEME_JSON_DEFAULT_DARK,
  THEME_JSON_DEFAULT_WHITE,
  themeColoursForReviewStep,
  themeColoursFromAccountBrandingTheme,
} from "./theme-colours-from-account";

import type { AccountBrandingTheme, OnboardingThemeOption } from "@/types/api/account";

function themeFixture(theme: Record<string, unknown>): AccountBrandingTheme {
  return { id: 1, name: "T", theme };
}

describe("themeColoursFromAccountBrandingTheme", () => {
  it("returns full palette when theme JSON has primary, secondary, dark, white", () => {
    expect(
      themeColoursFromAccountBrandingTheme(
        themeFixture({
          primary: "#FF0000",
          secondary: "#00FF00",
          dark: "#222222",
          white: "#EEEEEE",
        }),
      ),
    ).toEqual({
      primary: "#FF0000",
      secondary: "#00FF00",
      dark: "#222222",
      white: "#EEEEEE",
    });
  });

  it("defaults dark and white when missing", () => {
    expect(
      themeColoursFromAccountBrandingTheme(
        themeFixture({
          primary: "#112233",
          secondary: "#445566",
        }),
      ),
    ).toEqual({
      primary: "#112233",
      secondary: "#445566",
      dark: THEME_JSON_DEFAULT_DARK,
      white: THEME_JSON_DEFAULT_WHITE,
    });
  });

  it("uses PrimaryColour and SecondaryColour as legacy fallbacks for primary/secondary", () => {
    expect(
      themeColoursFromAccountBrandingTheme(
        themeFixture({
          PrimaryColour: "#ABCDEF",
          SecondaryColour: "#123456",
        }),
      ),
    ).toMatchObject({
      primary: "#ABCDEF",
      secondary: "#123456",
      dark: THEME_JSON_DEFAULT_DARK,
      white: THEME_JSON_DEFAULT_WHITE,
    });
  });

  it("falls back primary/secondary when theme is null or empty object", () => {
    expect(themeColoursFromAccountBrandingTheme(null)).toEqual({
      primary: "#64748B",
      secondary: "#94A3B8",
      dark: THEME_JSON_DEFAULT_DARK,
      white: THEME_JSON_DEFAULT_WHITE,
    });
    expect(themeColoursFromAccountBrandingTheme(themeFixture({}))).toEqual({
      primary: "#64748B",
      secondary: "#94A3B8",
      dark: THEME_JSON_DEFAULT_DARK,
      white: THEME_JSON_DEFAULT_WHITE,
    });
  });

  it("defaults dark when invalid hex", () => {
    expect(
      themeColoursFromAccountBrandingTheme(
        themeFixture({
          primary: "#000000",
          secondary: "#FFFFFF",
          dark: "not-a-color",
        }),
      ),
    ).toMatchObject({
      dark: THEME_JSON_DEFAULT_DARK,
    });
  });

  it("parses primaryColour and secondaryColour alternate keys", () => {
    expect(
      themeColoursFromAccountBrandingTheme(
        themeFixture({
          primaryColour: "#AABBCC",
          secondaryColour: "#DDEEFF",
        }),
      ),
    ).toMatchObject({
      primary: "#AABBCC",
      secondary: "#DDEEFF",
    });
  });

  it("expands 3-digit shorthand hex in theme JSON", () => {
    expect(
      themeColoursFromAccountBrandingTheme(
        themeFixture({
          primary: "#F00",
          secondary: "#0F0",
        }),
      ),
    ).toMatchObject({
      primary: "#FF0000",
      secondary: "#00FF00",
    });
  });
});

describe("themeColoursForReviewStep", () => {
  const catalogueRow: OnboardingThemeOption = {
    id: 42,
    label: "Catalogue",
    sport: null,
    theme: {
      primary: "#111111",
      secondary: "#222222",
    },
  };

  it("uses catalogue colours when account theme JSON lacks explicit primaries but id matches", () => {
    expect(
      themeColoursForReviewStep({ id: 42, name: "Saved", theme: {} }, [catalogueRow]),
    ).toMatchObject({
      primary: "#111111",
      secondary: "#222222",
    });
  });

  it("prefers account JSON when both primary and secondary parse", () => {
    expect(
      themeColoursForReviewStep(
        {
          id: 42,
          name: "Saved",
          theme: { primary: "#333333", secondary: "#444444" },
        },
        [catalogueRow],
      ),
    ).toMatchObject({
      primary: "#333333",
      secondary: "#444444",
    });
  });
});
