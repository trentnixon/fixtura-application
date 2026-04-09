import { describe, expect, it } from "vitest";

import {
  contrastDarkOnBackground,
  contrastWhiteOnBackground,
  isWeakDarkOnBrandContrast,
  isWeakWhiteOnBrandContrast,
  relativeLuminance,
  WHITE_ON_BRAND_MIN_CONTRAST_RECOMMENDED,
} from "./contrast";

describe("relativeLuminance", () => {
  it("returns expected order for black and white", () => {
    expect(relativeLuminance("#000000")).toBeCloseTo(0, 2);
    expect(relativeLuminance("#FFFFFF")).toBeCloseTo(1, 2);
  });

  it("returns null for invalid hex", () => {
    expect(relativeLuminance("not-a-color")).toBeNull();
  });
});

describe("contrastWhiteOnBackground", () => {
  it("is high for dark backgrounds (white text readable)", () => {
    const ratio = contrastWhiteOnBackground("#1D4ED8");
    expect(ratio).not.toBeNull();
    expect(ratio!).toBeGreaterThan(WHITE_ON_BRAND_MIN_CONTRAST_RECOMMENDED);
  });

  it("is low for light yellow (weak white text)", () => {
    const ratio = contrastWhiteOnBackground("#FFFF99");
    expect(ratio).not.toBeNull();
    expect(ratio!).toBeLessThan(WHITE_ON_BRAND_MIN_CONTRAST_RECOMMENDED);
  });
});

describe("isWeakWhiteOnBrandContrast", () => {
  it("flags light fills", () => {
    expect(isWeakWhiteOnBrandContrast("#FFFF99")).toBe(true);
  });

  it("does not flag strong blues", () => {
    expect(isWeakWhiteOnBrandContrast("#1D4ED8")).toBe(false);
  });
});

describe("contrastDarkOnBackground", () => {
  it("is high on light backgrounds (dark text readable)", () => {
    const ratio = contrastDarkOnBackground("#F5F5F5");
    expect(ratio).not.toBeNull();
    expect(ratio!).toBeGreaterThan(WHITE_ON_BRAND_MIN_CONTRAST_RECOMMENDED);
  });

  it("is low on very dark backgrounds (weak dark text)", () => {
    const ratio = contrastDarkOnBackground("#1A1A1A");
    expect(ratio).not.toBeNull();
    expect(ratio!).toBeLessThan(WHITE_ON_BRAND_MIN_CONTRAST_RECOMMENDED);
  });
});

describe("isWeakDarkOnBrandContrast", () => {
  it("flags near-black fills", () => {
    expect(isWeakDarkOnBrandContrast("#111111")).toBe(true);
  });

  it("does not flag light fills", () => {
    expect(isWeakDarkOnBrandContrast("#E8E8E8")).toBe(false);
  });
});
