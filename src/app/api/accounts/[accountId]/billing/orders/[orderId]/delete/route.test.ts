import { beforeAll, describe, expect, it, beforeEach, vi } from "vitest";

import {
  mockMissingStrapiUrl,
  mockNoAuthCookie,
  resetBillingRouteTestMocks,
  type BillingRouteHandler,
} from "../../../_test-utils/billing-route-mocks";

let POST: BillingRouteHandler<{ accountId: string; orderId: string }>;

beforeAll(async () => {
  ({ POST } = await import("./route"));
});

describe("POST /api/accounts/[accountId]/billing/orders/[orderId]/delete", () => {
  beforeEach(() => {
    resetBillingRouteTestMocks();
  });

  it("returns 401 when no auth cookie", async () => {
    mockNoAuthCookie();
    const res = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ accountId: "1", orderId: "99" }),
    });
    expect(res.status).toBe(401);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid account id segment", async () => {
    const res = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ accountId: "not-a-number", orderId: "99" }),
    });
    expect(res.status).toBe(400);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 422 for invalid order id segment", async () => {
    const res = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ accountId: "42", orderId: "not-a-number" }),
    });
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({
      error: { code: "INVALID_ORDER_ID", message: "Invalid order id" },
    });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 500 when Strapi URL is missing", async () => {
    mockMissingStrapiUrl();
    const res = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ accountId: "42", orderId: "99" }),
    });
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Service unavailable" });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("forwards POST to Strapi and returns JSON success", async () => {
    const payload = { ok: true };
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ accountId: "42", orderId: "99" }),
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://cms.example/api/accounts/42/billing/orders/99/delete",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer jwt-token",
        }),
        body: JSON.stringify({}),
      }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(payload);
  });

  it("passes through structured Strapi error envelope unchanged", async () => {
    const errorPayload = {
      error: { code: "ORDER_NOT_DELETABLE", message: "Order is not pending" },
    };
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify(errorPayload), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ accountId: "42", orderId: "99" }),
    });

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual(errorPayload);
  });
});
