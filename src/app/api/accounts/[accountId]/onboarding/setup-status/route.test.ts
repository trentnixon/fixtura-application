import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  accountRouteContext,
  mockMissingStrapiUrl,
  mockNoAuthCookie,
  resetStrapiRouteTestMocks,
} from "@/app/api/_test-utils/strapi-route-mocks";

import { GET } from "./route";

describe("GET /api/accounts/[accountId]/onboarding/setup-status", () => {
  beforeEach(() => {
    resetStrapiRouteTestMocks();
  });

  it("returns 401 when no auth cookie", async () => {
    mockNoAuthCookie();
    const res = await GET(new Request("http://localhost"), accountRouteContext("1"));
    expect(res.status).toBe(401);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid account id segment", async () => {
    const res = await GET(new Request("http://localhost"), accountRouteContext("not-a-number"));
    expect(res.status).toBe(400);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 503 when Strapi URL is missing", async () => {
    mockMissingStrapiUrl();
    const res = await GET(new Request("http://localhost"), accountRouteContext("42"));
    expect(res.status).toBe(503);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("proxies GET to Strapi and returns JSON success", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: { setupStatus: "complete" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await GET(new Request("http://localhost"), accountRouteContext("42"));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://cms.example/api/accounts/42/onboarding/setup-status",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer jwt-token",
        }),
        cache: "no-store",
      }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: { setupStatus: "complete" } });
  });

  it("passes through Strapi error body", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({ code: "SETUP_UNAVAILABLE" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await GET(new Request("http://localhost"), accountRouteContext("42"));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ code: "SETUP_UNAVAILABLE" });
  });
});
