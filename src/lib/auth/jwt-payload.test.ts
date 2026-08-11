import { Buffer } from "node:buffer";
import { describe, expect, it } from "vitest";

import { isJwtExpiredOrInvalid } from "./jwt-payload";

function makeToken(exp: number | undefined) {
  const header = Buffer.from(JSON.stringify({ alg: "none" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify(exp !== undefined ? { exp } : {})).toString(
    "base64url",
  );
  return `${header}.${payload}.sig`;
}

describe("isJwtExpiredOrInvalid", () => {
  it("returns true for malformed tokens", () => {
    expect(isJwtExpiredOrInvalid("not-a-jwt")).toBe(true);
    expect(isJwtExpiredOrInvalid("a.b")).toBe(true);
  });

  it("returns false when exp is absent", () => {
    expect(isJwtExpiredOrInvalid(makeToken(undefined))).toBe(false);
  });

  it("returns true when exp is in the past", () => {
    const past = Math.floor(Date.now() / 1000) - 60;
    expect(isJwtExpiredOrInvalid(makeToken(past))).toBe(true);
  });

  it("returns false when exp is in the future", () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    expect(isJwtExpiredOrInvalid(makeToken(future))).toBe(false);
  });
});
