import { beforeAll, describe, expect, it, beforeEach, vi } from "vitest";

import {
  mockMissingStrapiUrl,
  mockNoAuthCookie,
  resetBillingRouteTestMocks,
  type BillingRouteHandler,
} from "../_test-utils/billing-route-mocks";

let POST: BillingRouteHandler;

beforeAll(async () => {
  ({ POST } = await import("./route"));
});

describe("POST /api/accounts/[accountId]/billing/start-trial", () => {
  beforeEach(() => {
    resetBillingRouteTestMocks();
  });

  it("returns 401 when no auth cookie", async () => {
    mockNoAuthCookie();
    const res = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ accountId: "1" }),
    });
    expect(res.status).toBe(401);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid account id segment", async () => {
    const res = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ accountId: "not-a-number" }),
    });
    expect(res.status).toBe(400);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 500 when Strapi URL is missing", async () => {
    mockMissingStrapiUrl();
    const res = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ accountId: "42" }),
    });
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Service unavailable" });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("forwards POST to Strapi and returns JSON success", async () => {
    const payload = { message: "Trial started" };
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ accountId: "42" }),
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://cms.example/api/accounts/42/billing/start-trial",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer jwt-token",
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({}),
      }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(payload);
  });

  it("passes through structured Strapi error envelope unchanged", async () => {
    const errorPayload = {
      error: { code: "TRIAL_NOT_AVAILABLE", message: "Trial already used" },
    };
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify(errorPayload), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ accountId: "42" }),
    });

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual(errorPayload);
  });

  it("passes through TRIAL_ALREADY_CONSUMED org error code unchanged", async () => {
    const errorPayload = {
      error: { code: "TRIAL_ALREADY_CONSUMED", message: "Organisation trial consumed" },
    };
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify(errorPayload), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ accountId: "42" }),
    });

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual(errorPayload);
  });

  it("preserves 503 TRIAL_ALLOCATION_DISABLED body and Retry-After", async () => {
    const errorPayload = {
      error: {
        code: "TRIAL_ALLOCATION_DISABLED",
        message: "Trial allocation temporarily disabled",
      },
    };
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify(errorPayload), {
        status: 503,
        headers: { "Content-Type": "application/json", "Retry-After": "30" },
      }),
    );

    const res = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ accountId: "42" }),
    });

    expect(res.status).toBe(503);
    expect(res.headers.get("Retry-After")).toBe("30");
    expect(await res.json()).toEqual(errorPayload);
  });

  it("returns 500 when Strapi forward throws", async () => {
    vi.mocked(globalThis.fetch).mockRejectedValue(new Error("network down"));

    const res = await POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ accountId: "42" }),
    });

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Unexpected server error" });
  });
});
