import { beforeAll, describe, expect, it, beforeEach, vi } from "vitest";

import {
  mockMissingStrapiUrl,
  mockNoAuthCookie,
  resetBillingRouteTestMocks,
  type BillingRouteHandler,
} from "./_test-utils/billing-route-mocks";

let GET: BillingRouteHandler;

beforeAll(async () => {
  ({ GET } = await import("./route"));
});

describe("GET /api/accounts/[accountId]/billing", () => {
  beforeEach(() => {
    resetBillingRouteTestMocks();
  });

  it("returns 401 when no auth cookie", async () => {
    mockNoAuthCookie();
    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ accountId: "1" }),
    });
    expect(res.status).toBe(401);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid account id segment", async () => {
    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ accountId: "not-a-number" }),
    });
    expect(res.status).toBe(400);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 500 when Strapi URL is missing", async () => {
    mockMissingStrapiUrl();
    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ accountId: "42" }),
    });
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Service unavailable" });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("forwards GET to Strapi and returns JSON success", async () => {
    const payload = {
      data: {
        billingStatus: "trial_available",
        accessStatus: "pending",
      },
    };
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ accountId: "42" }),
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://cms.example/api/accounts/42/billing",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer jwt-token",
        }),
      }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(payload);
  });

  it("returns 500 when Strapi forward throws", async () => {
    vi.mocked(globalThis.fetch).mockRejectedValue(new Error("network down"));

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ accountId: "42" }),
    });

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Unexpected server error" });
  });
});
