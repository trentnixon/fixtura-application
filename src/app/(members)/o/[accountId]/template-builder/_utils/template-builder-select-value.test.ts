import { describe, expect, it } from "vitest";

import {
  TEMPLATE_BUILDER_UNSET_VALUE,
  optionIdToSelectValue,
  resolveRelationSelectValue,
  selectValueToOptionId,
  selectValueToUseBackground,
  useBackgroundToSelectValue,
} from "./template-builder-select-value";

describe("optionIdToSelectValue / selectValueToOptionId", () => {
  it("round-trips null as unset sentinel", () => {
    expect(optionIdToSelectValue(null)).toBe(TEMPLATE_BUILDER_UNSET_VALUE);
    expect(selectValueToOptionId(TEMPLATE_BUILDER_UNSET_VALUE)).toBe(null);
  });

  it("round-trips numeric ids", () => {
    expect(optionIdToSelectValue(42)).toBe("42");
    expect(selectValueToOptionId("42")).toBe(42);
  });

  it("does not map invalid strings to zero", () => {
    expect(selectValueToOptionId("")).toBe(null);
    expect(selectValueToOptionId("abc")).toBe(null);
  });
});

describe("resolveRelationSelectValue", () => {
  it("uses unset sentinel when allowUnset and draft is null", () => {
    expect(resolveRelationSelectValue(null, 5, true)).toBe(TEMPLATE_BUILDER_UNSET_VALUE);
  });

  it("falls back to saved id when unset is not allowed", () => {
    expect(resolveRelationSelectValue(null, 5, false)).toBe("5");
    expect(resolveRelationSelectValue(8, 5, false)).toBe("8");
  });

  it("returns undefined when no draft or saved id and unset is not allowed", () => {
    expect(resolveRelationSelectValue(null, null, false)).toBeUndefined();
  });
});

describe("useBackgroundToSelectValue / selectValueToUseBackground", () => {
  it("round-trips null as unset sentinel", () => {
    expect(useBackgroundToSelectValue(null)).toBe(TEMPLATE_BUILDER_UNSET_VALUE);
    expect(selectValueToUseBackground(TEMPLATE_BUILDER_UNSET_VALUE)).toBe(null);
  });

  it("round-trips enum strings", () => {
    expect(useBackgroundToSelectValue("Gradient")).toBe("Gradient");
    expect(selectValueToUseBackground("Gradient")).toBe("Gradient");
    expect(selectValueToUseBackground("Video")).toBe("Video");
  });

  it("rejects unknown select values", () => {
    expect(selectValueToUseBackground("true")).toBe(null);
  });
});
