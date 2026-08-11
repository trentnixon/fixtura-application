import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  accountRouteContext,
  mockMissingStrapiUrl,
  mockNoAuthCookie,
  resetStrapiRouteTestMocks,
} from "@/app/api/_test-utils/strapi-route-mocks";

import { DELETE } from "./route";

describe("DELETE /api/accounts/[accountId]", () => {
  beforeEach(() => {
    resetStrapiRouteTestMocks();
  });

  it("returns 401 when no auth cookie", async () => {
    mockNoAuthCookie();
    const res = await DELETE(new Request("http://localhost"), accountRouteContext("1"));
    expect(res.status).toBe(401);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid account id segment", async () => {
    const res = await DELETE(new Request("http://localhost"), accountRouteContext("not-a-number"));
    expect(res.status).toBe(400);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 503 when Strapi URL is missing", async () => {
    mockMissingStrapiUrl();
    const res = await DELETE(new Request("http://localhost"), accountRouteContext("42"));
    expect(res.status).toBe(503);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("proxies DELETE to Strapi and passes through JSON success", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: { ok: true } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await DELETE(new Request("http://localhost"), accountRouteContext("42"));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://cms.example/api/accounts/42",
      expect.objectContaining({
        method: "DELETE",
        headers: expect.objectContaining({
          Authorization: "Bearer jwt-token",
        }),
      }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: { ok: true } });
  });

  it("passes through Strapi 403 error body", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({ code: "ACCOUNT_DELETE_NOT_ALLOWED", message: "No" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await DELETE(new Request("http://localhost"), accountRouteContext("42"));

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ code: "ACCOUNT_DELETE_NOT_ALLOWED", message: "No" });
  });

  it("passes through Strapi 404 error body", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({ code: "ACCOUNT_NOT_FOUND" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await DELETE(new Request("http://localhost"), accountRouteContext("99"));

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ code: "ACCOUNT_NOT_FOUND" });
  });
});
