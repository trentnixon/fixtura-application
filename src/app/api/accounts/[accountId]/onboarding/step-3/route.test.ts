import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  accountRouteContext,
  jsonRequest,
  mockMissingStrapiUrl,
  mockNoAuthCookie,
  resetStrapiRouteTestMocks,
} from "@/app/api/_test-utils/strapi-route-mocks";

import { PATCH } from "./route";

describe("PATCH /api/accounts/[accountId]/onboarding/step-3", () => {
  beforeEach(() => {
    resetStrapiRouteTestMocks();
  });

  it("returns 401 when no auth cookie", async () => {
    mockNoAuthCookie();
    const res = await PATCH(new Request("http://localhost"), accountRouteContext("1"));
    expect(res.status).toBe(401);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid account id segment", async () => {
    const res = await PATCH(
      jsonRequest("PATCH", { firstName: "Club" }),
      accountRouteContext("not-a-number"),
    );
    expect(res.status).toBe(400);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 400 when JSON body is invalid", async () => {
    const res = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: "{",
      }),
      accountRouteContext("42"),
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid JSON body" });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 503 when Strapi URL is missing", async () => {
    mockMissingStrapiUrl();
    const res = await PATCH(
      jsonRequest("PATCH", { deliveryAddress: "ops@example.com" }),
      accountRouteContext("42"),
    );
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "Service unavailable" });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("forwards PATCH body to Strapi and returns JSON success", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: { ok: true } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const body = { firstName: "Club", deliveryAddress: "ops@example.com" };
    const res = await PATCH(jsonRequest("PATCH", body), accountRouteContext("42"));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://cms.example/api/accounts/42/onboarding/step-3",
      expect.objectContaining({
        method: "PATCH",
        headers: expect.objectContaining({
          Authorization: "Bearer jwt-token",
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(body),
      }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: { ok: true } });
  });

  it("passes through structured Strapi error envelope unchanged", async () => {
    const errorPayload = {
      error: { code: "EMPTY_UPDATE", message: "nothing to persist" },
    };
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify(errorPayload), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await PATCH(
      jsonRequest("PATCH", { deliveryAddress: "bad" }),
      accountRouteContext("42"),
    );

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual(errorPayload);
  });
});
