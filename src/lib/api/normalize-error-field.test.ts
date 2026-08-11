import { describe, expect, it } from "vitest";

import { normalizeErrorFieldToString } from "./normalize-error-field";

describe("normalizeErrorFieldToString", () => {
  it("returns plain strings", () => {
    expect(normalizeErrorFieldToString("Not found")).toBe("Not found");
  });

  it("rejects empty and [object Object] garbage strings", () => {
    expect(normalizeErrorFieldToString("")).toBeUndefined();
    expect(normalizeErrorFieldToString("   ")).toBeUndefined();
    expect(normalizeErrorFieldToString("[object Object]")).toBeUndefined();
  });

  it("stringifies nested message on error objects", () => {
    expect(normalizeErrorFieldToString({ message: "Nested" })).toBe("Nested");
    expect(normalizeErrorFieldToString({ error: { message: "Deep" } })).toBe("Deep");
  });

  it("JSON-stringifies unknown object shapes instead of [object Object]", () => {
    expect(normalizeErrorFieldToString({ code: 404, status: "missing" })).toBe(
      JSON.stringify({ code: 404, status: "missing" }),
    );
  });
});
