import { describe, expect, it } from "vitest";

import { bothColorsVeryDark, bothColorsVeryLight, colorsAreTooSimilar, rgbDistance } from "./pair";

describe("rgbDistance", () => {
  it("is zero for identical hex", () => {
    expect(rgbDistance("#79001F", "#79001F")).toBe(0);
  });

  it("is null for invalid input", () => {
    // "bad" parses as valid 3-digit hex (#BBAADD); use a string tryNormalizeHex rejects.
    expect(rgbDistance("f20100g", "#79001F")).toBeNull();
  });
});

describe("colorsAreTooSimilar", () => {
  it("is false for identical colours (duplicate handled elsewhere)", () => {
    expect(colorsAreTooSimilar("#79001F", "#79001F")).toBe(false);
  });

  it("is true for very close shades", () => {
    expect(colorsAreTooSimilar("#79001F", "#79011F")).toBe(true);
  });

  it("is false for clearly distinct colours", () => {
    expect(colorsAreTooSimilar("#79001F", "#FDBC2C")).toBe(false);
  });
});

describe("bothColorsVeryLight", () => {
  it("is true when both are very light", () => {
    expect(bothColorsVeryLight("#F5F5F5", "#FAFAFA")).toBe(true);
  });

  it("is false when one is dark", () => {
    expect(bothColorsVeryLight("#F5F5F5", "#1A1A1A")).toBe(false);
  });
});

describe("bothColorsVeryDark", () => {
  it("is true when both are very dark", () => {
    expect(bothColorsVeryDark("#0A0A0A", "#111111")).toBe(true);
  });

  it("is false when one is light", () => {
    expect(bothColorsVeryDark("#0A0A0A", "#FFFFFF")).toBe(false);
  });
});
