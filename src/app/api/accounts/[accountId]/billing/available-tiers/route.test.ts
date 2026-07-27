import { beforeAll, describe, expect, it, beforeEach, vi } from "vitest";

import {
  mockMissingStrapiUrl,
  mockNoAuthCookie,
  resetBillingRouteTestMocks,
  type BillingRouteHandler,
} from "../_test-utils/billing-route-mocks";

let GET: BillingRouteHandler;

beforeAll(async () => {
  ({ GET } = await import("./route"));
});

describe("GET /api/accounts/[accountId]/billing/available-tiers", () => {
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
      tiers: [
        {
          id: "tier_1",
          name: "Season Pass",
          category: "Club",
          price: 520,
          currency: "AUD",
          daysInPass: 365,
        },
      ],
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
      "https://cms.example/api/accounts/42/billing/available-tiers",
      expect.objectContaining({ method: "GET" }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(payload);
  });

  it("returns normalized Strapi error message for failed GET", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          error: { code: "FORBIDDEN", message: "Account not accessible" },
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ accountId: "42" }),
    });

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "Account not accessible" });
  });
});
