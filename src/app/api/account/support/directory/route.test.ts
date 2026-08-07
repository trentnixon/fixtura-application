import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  mockMissingStrapiUrl,
  mockNoAuthCookie,
  resetStrapiRouteTestMocks,
} from "@/app/api/_test-utils/strapi-route-mocks";

import { GET } from "./route";

describe("GET /api/account/support/directory", () => {
  beforeEach(() => {
    resetStrapiRouteTestMocks();
  });

  it("returns 401 when no auth cookie", async () => {
    mockNoAuthCookie();
    const res = await GET(new Request("http://localhost/api/account/support/directory"));
    expect(res.status).toBe(401);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 503 when Strapi URL is missing", async () => {
    mockMissingStrapiUrl();
    const res = await GET(new Request("http://localhost/api/account/support/directory"));
    expect(res.status).toBe(503);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("proxies GET to Strapi with query string and returns JSON success", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [{ id: 575, name: "Example Club" }],
          meta: { page: 1, pageSize: 25, total: 1, totalPages: 1 },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    const res = await GET(
      new Request("http://localhost/api/account/support/directory?page=2&search=cricket"),
    );

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://cms.example/api/account/support/directory?page=2&search=cricket",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer jwt-token",
        }),
        cache: "no-store",
      }),
    );
    expect(res.status).toBe(200);
  });

  it("forwards Retry-After on 429", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          data: null,
          error: { status: 429, code: "RATE_LIMIT_EXCEEDED", message: "Too many requests" },
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "30",
          },
        },
      ),
    );

    const res = await GET(new Request("http://localhost/api/account/support/directory"));
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("30");
  });
});
