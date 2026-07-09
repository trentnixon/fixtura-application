import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  mockMissingStrapiUrl,
  mockNoAuthCookie,
  resetStrapiRouteTestMocks,
} from "@/app/api/_test-utils/strapi-route-mocks";

import { GET } from "./route";

describe("GET /api/account/onboarding/lookups/sports", () => {
  beforeEach(() => {
    resetStrapiRouteTestMocks();
  });

  it("returns 401 when no auth cookie", async () => {
    mockNoAuthCookie();
    const res = await GET();
    expect(res.status).toBe(401);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 503 when Strapi URL is missing", async () => {
    mockMissingStrapiUrl();
    const res = await GET();
    expect(res.status).toBe(503);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("proxies GET to Strapi and returns JSON success", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: [{ id: "cricket", label: "Cricket" }] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await GET();

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://cms.example/api/account/onboarding/lookups/sports",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer jwt-token",
        }),
        cache: "no-store",
      }),
    );
    expect(res.status).toBe(200);
  });

  it("passes through Strapi error body", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await GET();
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ message: "Forbidden" });
  });
});
