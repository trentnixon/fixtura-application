import { beforeEach, describe, expect, it, vi } from "vitest";

const cookiesGet = vi.fn();
const { getStrapiUrlMock } = vi.hoisted(() => ({
  getStrapiUrlMock: vi.fn(() => "https://cms.example"),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: cookiesGet,
  }),
}));

vi.mock("@/lib/config/env", () => ({
  getStrapiUrl: () => getStrapiUrlMock(),
}));

import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-constants";

import { guardStrapiRequest } from "./guard-strapi-request";

describe("guardStrapiRequest", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getStrapiUrlMock.mockReturnValue("https://cms.example");
    cookiesGet.mockImplementation((name: string) =>
      name === AUTH_COOKIE_NAME ? { value: "jwt-token" } : undefined,
    );
  });

  it("returns 401 when no auth cookie", async () => {
    cookiesGet.mockReturnValue(undefined);
    const result = await guardStrapiRequest();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(401);
      expect(await result.response.json()).toEqual({ error: "Unauthorized" });
    }
  });

  it("returns 503 when Strapi URL is missing", async () => {
    getStrapiUrlMock.mockReturnValueOnce("");
    const result = await guardStrapiRequest();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(503);
      expect(await result.response.json()).toEqual({ error: "Service unavailable" });
    }
  });

  it("returns strapiUrl and token when guard passes", async () => {
    const result = await guardStrapiRequest();
    expect(result).toEqual({
      ok: true,
      strapiUrl: "https://cms.example",
      token: "jwt-token",
    });
  });
});
