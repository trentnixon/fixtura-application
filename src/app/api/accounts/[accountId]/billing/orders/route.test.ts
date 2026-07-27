import { describe, expect, it, beforeEach, vi } from "vitest";

import { GET } from "./route";
import {
  mockMissingStrapiUrl,
  mockNoAuthCookie,
  resetBillingRouteTestMocks,
} from "../_test-utils/billing-route-mocks";

describe("GET /api/accounts/[accountId]/billing/orders", () => {
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

  it("forwards GET to Strapi orders-by-account and returns JSON success", async () => {
    const payload = { orders: [{ id: 1, status: "paid" }] };
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
      "https://cms.example/api/orders/account/42",
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
