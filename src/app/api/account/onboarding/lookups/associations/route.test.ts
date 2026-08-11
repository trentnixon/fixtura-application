import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  mockMissingStrapiUrl,
  mockNoAuthCookie,
  resetStrapiRouteTestMocks,
} from "@/app/api/_test-utils/strapi-route-mocks";

import { GET } from "./route";

describe("GET /api/account/onboarding/lookups/associations", () => {
  beforeEach(() => {
    resetStrapiRouteTestMocks();
  });

  it("returns 401 when no auth cookie", async () => {
    mockNoAuthCookie();
    const res = await GET(new Request("http://localhost?sport=cricket"));
    expect(res.status).toBe(401);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 503 when Strapi URL is missing", async () => {
    mockMissingStrapiUrl();
    const res = await GET(new Request("http://localhost?sport=cricket"));
    expect(res.status).toBe(503);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 400 when sport query parameter is missing", async () => {
    const res = await GET(new Request("http://localhost"));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Missing sport query parameter" });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 400 when sport query parameter is blank", async () => {
    const res = await GET(new Request("http://localhost?sport=%20%20"));
    expect(res.status).toBe(400);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("proxies GET to Strapi with sport query param", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: [{ id: 1, label: "Assoc" }] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await GET(new Request("http://localhost?sport=cricket"));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://cms.example/api/account/onboarding/lookups/associations?sport=cricket",
      expect.objectContaining({
        cache: "no-store",
      }),
    );
    expect(res.status).toBe(200);
  });

  it("passes through Strapi error body", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: "Invalid sport" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await GET(new Request("http://localhost?sport=unknown"));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ message: "Invalid sport" });
  });
});
