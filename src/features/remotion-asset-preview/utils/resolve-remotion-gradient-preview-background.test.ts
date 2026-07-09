import tinycolor from "tinycolor2";
import { describe, expect, it } from "vitest";

import {
  determineGradientTypeForPaletteKey,
  resolveRemotionGradientFromTemplateItem,
  resolveRemotionGradientPreviewBackground,
} from "./resolve-remotion-gradient-preview-background";

import type { TemplateGradientItem } from "@/types/api/all-template-options";

const PRIMARY = "#112233";
const SECONDARY = "#ffcc00";

function gradient(
  id: number,
  name: string,
  type: string | null,
  direction: string | null,
): TemplateGradientItem {
  return { id, name, type, direction };
}

describe("resolveRemotionGradientFromTemplateItem", () => {
  it("resolves type and direction from catalog item fields", () => {
    expect(
      resolveRemotionGradientFromTemplateItem(
        gradient(1, "Primary horizontal", "primary", "HORIZONTAL"),
      ),
    ).toEqual({ type: "primary", direction: "HORIZONTAL" });
  });

  it("resolves radial primary from CMS display name without direction", () => {
    expect(
      resolveRemotionGradientFromTemplateItem(gradient(5, "Radial Primary", null, null)),
    ).toEqual({ type: "primaryRadial", direction: "HORIZONTAL" });
  });
});

describe("determineGradientTypeForPaletteKey", () => {
  it("maps primary/secondary on onWhite palettes to pair gradients", () => {
    expect(determineGradientTypeForPaletteKey("primaryOnWhite", "primary")).toBe(
      "primaryToSecondary",
    );
    expect(determineGradientTypeForPaletteKey("secondaryOnBlack", "secondary")).toBe(
      "secondaryToPrimary",
    );
  });
});

describe("resolveRemotionGradientPreviewBackground", () => {
  it("builds a horizontal primary-to-secondary linear gradient", () => {
    const css = resolveRemotionGradientPreviewBackground(
      gradient(1, "Primary to secondary", "primaryToSecondary", "HORIZONTAL"),
      PRIMARY,
      SECONDARY,
      "primary",
    );
    expect(css).toBe(`linear-gradient(to right, ${PRIMARY}, ${SECONDARY})`);
  });

  it("builds a vertical secondary gradient", () => {
    const css = resolveRemotionGradientPreviewBackground(
      gradient(2, "Secondary vertical", "secondary", "VERTICAL"),
      PRIMARY,
      SECONDARY,
      "primary",
    );
    expect(css).toBe(`linear-gradient(to bottom, ${SECONDARY}, ${PRIMARY})`);
  });

  it("builds a radial primary gradient", () => {
    const css = resolveRemotionGradientPreviewBackground(
      gradient(3, "Primary radial", "primaryRadial", "HORIZONTAL"),
      PRIMARY,
      SECONDARY,
      "primary",
    );
    const center = tinycolor(PRIMARY).lighten(25).toString();
    expect(css).toBe(`radial-gradient(circle at center, ${center}, ${PRIMARY})`);
  });

  it("returns null when gradient type cannot be resolved", () => {
    expect(
      resolveRemotionGradientPreviewBackground(
        gradient(4, "Unknown", "linear", "HORIZONTAL"),
        PRIMARY,
        SECONDARY,
        "primary",
      ),
    ).toBeNull();
  });
});
