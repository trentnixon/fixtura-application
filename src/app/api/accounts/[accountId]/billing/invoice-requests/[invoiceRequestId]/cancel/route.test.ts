import { beforeAll, describe, expect, it, beforeEach, vi } from "vitest";

import {
  mockMissingStrapiUrl,
  mockNoAuthCookie,
  resetBillingRouteTestMocks,
  type BillingRouteHandler,
} from "../../../_test-utils/billing-route-mocks";

let POST: BillingRouteHandler;

beforeAll(async () => {
  ({ POST } = await import("./route"));
});

describe("POST /api/accounts/[accountId]/billing/invoice-requests/[invoiceRequestId]/cancel", () => {
  beforeEach(() => {
    resetBillingRouteTestMocks();
  });

  it("returns 401 when no auth cookie", async () => {
    mockNoAuthCookie();
    const res = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ accountId: "1", invoiceRequestId: "88" }),
    });
    expect(res.status).toBe(401);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid account id segment", async () => {
    const res = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ accountId: "not-a-number", invoiceRequestId: "88" }),
    });
    expect(res.status).toBe(400);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 422 for invalid invoice request id segment", async () => {
    const res = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ accountId: "42", invoiceRequestId: "not-a-number" }),
    });
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({
      error: { code: "INVALID_INVOICE_REQUEST_ID", message: "Invalid invoice request id" },
    });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 500 when Strapi URL is missing", async () => {
    mockMissingStrapiUrl();
    const res = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ accountId: "42", invoiceRequestId: "88" }),
    });
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Service unavailable" });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("forwards POST to Strapi and returns JSON success", async () => {
    const payload = { status: "cancelled" };
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ accountId: "42", invoiceRequestId: "88" }),
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://cms.example/api/accounts/42/billing/invoice-requests/88/cancel",
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
      error: { code: "INVOICE_NOT_CANCELLABLE", message: "Invoice already paid" },
    };
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify(errorPayload), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ accountId: "42", invoiceRequestId: "88" }),
    });

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual(errorPayload);
  });
});
