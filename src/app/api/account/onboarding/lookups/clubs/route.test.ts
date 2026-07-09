import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  mockMissingStrapiUrl,
  mockNoAuthCookie,
  resetStrapiRouteTestMocks,
} from "@/app/api/_test-utils/strapi-route-mocks";

import { GET } from "./route";

describe("GET /api/account/onboarding/lookups/clubs", () => {
  beforeEach(() => {
    resetStrapiRouteTestMocks();
  });

  it("returns 401 when no auth cookie", async () => {
    mockNoAuthCookie();
    const res = await GET(new Request("http://localhost?associationId=1"));
    expect(res.status).toBe(401);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 503 when Strapi URL is missing", async () => {
    mockMissingStrapiUrl();
    const res = await GET(new Request("http://localhost?associationId=1"));
    expect(res.status).toBe(503);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 400 when associationId query parameter is missing", async () => {
    const res = await GET(new Request("http://localhost"));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Missing associationId query parameter" });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 400 when associationId query parameter is blank", async () => {
    const res = await GET(new Request("http://localhost?associationId=%20"));
    expect(res.status).toBe(400);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("proxies GET to Strapi with associationId query param", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: [{ id: 1, label: "Club A" }] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await GET(new Request("http://localhost?associationId=5"));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://cms.example/api/account/onboarding/lookups/clubs?associationId=5",
      expect.objectContaining({
        cache: "no-store",
      }),
    );
    expect(res.status).toBe(200);
  });

  it("passes through Strapi error body", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: "Association not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await GET(new Request("http://localhost?associationId=999"));
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ message: "Association not found" });
  });
});
