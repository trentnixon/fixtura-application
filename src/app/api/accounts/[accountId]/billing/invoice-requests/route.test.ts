import { describe, expect, it, beforeEach, vi } from "vitest";

import { POST } from "./route";
import {
  mockMissingStrapiUrl,
  mockNoAuthCookie,
  resetBillingRouteTestMocks,
} from "../_test-utils/billing-route-mocks";

describe("POST /api/accounts/[accountId]/billing/invoice-requests", () => {
  beforeEach(() => {
    resetBillingRouteTestMocks();
  });

  it("returns 401 when no auth cookie", async () => {
    mockNoAuthCookie();
    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionTierId: "tier_1" }),
      }),
      { params: Promise.resolve({ accountId: "1" }) },
    );
    expect(res.status).toBe(401);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid account id segment", async () => {
    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionTierId: "tier_1" }),
      }),
      { params: Promise.resolve({ accountId: "not-a-number" }) },
    );
    expect(res.status).toBe(400);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 400 when JSON body is invalid", async () => {
    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not-json",
      }),
      { params: Promise.resolve({ accountId: "42" }) },
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid JSON body" });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 400 when JSON body is not an object", async () => {
    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([]),
      }),
      { params: Promise.resolve({ accountId: "42" }) },
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Body must be a JSON object" });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 400 when billingAddress is partial", async () => {
    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionTierId: "tier_1",
          billingAddress: { line1: "1 Main St" },
        }),
      }),
      { params: Promise.resolve({ accountId: "42" }) },
    );
    expect(res.status).toBe(400);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 500 when Strapi URL is missing", async () => {
    mockMissingStrapiUrl();
    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionTierId: "tier_1", billingEmail: "a@b.com" }),
      }),
      { params: Promise.resolve({ accountId: "42" }) },
    );
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Service unavailable" });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("forwards normalized POST body to Strapi and returns JSON success", async () => {
    const payload = { invoiceRequestId: "99", status: "submitted" };
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const body = {
      subscriptionTierId: "tier_1",
      billingEmail: "a@b.com",
      billingAddress: null,
    };
    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
      { params: Promise.resolve({ accountId: "42" }) },
    );

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://cms.example/api/accounts/42/billing/invoice-requests",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          subscriptionTierId: "tier_1",
          billingEmail: "a@b.com",
        }),
      }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(payload);
  });

  it("passes through structured Strapi error envelope unchanged", async () => {
    const errorPayload = {
      error: { code: "DUPLICATE_REQUEST", message: "Invoice request already pending" },
    };
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify(errorPayload), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionTierId: "tier_1", billingEmail: "a@b.com" }),
      }),
      { params: Promise.resolve({ accountId: "42" }) },
    );

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual(errorPayload);
  });
});
