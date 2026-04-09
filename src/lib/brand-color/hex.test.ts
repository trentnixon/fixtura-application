import { describe, expect, it } from "vitest";

import { isValidHex6, stripHexInput, tryNormalizeHex } from "./hex";

describe("tryNormalizeHex", () => {
  it("normalises 6-digit hex with or without hash", () => {
    expect(tryNormalizeHex("#f20100")).toBe("#F20100");
    expect(tryNormalizeHex("f20100")).toBe("#F20100");
    expect(tryNormalizeHex("  #aabbcc  ")).toBe("#AABBCC");
  });

  it("expands 3-digit shorthand to 6-digit", () => {
    expect(tryNormalizeHex("#f00")).toBe("#FF0000");
    expect(tryNormalizeHex("abc")).toBe("#AABBCC");
  });

  it("returns null for wrong length or invalid chars", () => {
    expect(tryNormalizeHex("f2010")).toBeNull();
    expect(tryNormalizeHex("f20100g")).toBeNull();
    expect(tryNormalizeHex("")).toBeNull();
  });
});

describe("stripHexInput", () => {
  it("trims and removes leading hash", () => {
    expect(stripHexInput("  #abc123  ")).toBe("abc123");
    expect(stripHexInput("def456")).toBe("def456");
  });
});

describe("isValidHex6", () => {
  it("matches tryNormalizeHex truthiness", () => {
    expect(isValidHex6("#000000")).toBe(true);
    expect(isValidHex6("gg0000")).toBe(false);
  });
});
