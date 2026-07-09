import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  accountRouteContext,
  jsonRequest,
  mockMissingStrapiUrl,
  mockNoAuthCookie,
  resetStrapiRouteTestMocks,
} from "@/app/api/_test-utils/strapi-route-mocks";

import { POST } from "./route";

describe("POST /api/accounts/[accountId]/onboarding/confirm", () => {
  beforeEach(() => {
    resetStrapiRouteTestMocks();
  });

  it("returns 401 when no auth cookie", async () => {
    mockNoAuthCookie();
    const res = await POST(new Request("http://localhost"), accountRouteContext("1"));
    expect(res.status).toBe(401);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid account id segment", async () => {
    const res = await POST(jsonRequest("POST", {}), accountRouteContext("not-a-number"));
    expect(res.status).toBe(400);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 400 when JSON body is invalid", async () => {
    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{",
      }),
      accountRouteContext("42"),
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid JSON body" });
  });

  it("returns 503 when Strapi URL is missing", async () => {
    mockMissingStrapiUrl();
    const res = await POST(jsonRequest("POST", {}), accountRouteContext("42"));
    expect(res.status).toBe(503);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("forwards POST to Strapi and returns JSON success", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: { completed: true } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await POST(jsonRequest("POST", {}), accountRouteContext("42"));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://cms.example/api/accounts/42/onboarding/confirm",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({}),
      }),
    );
    expect(res.status).toBe(200);
  });

  it("passes through structured Strapi error envelope unchanged", async () => {
    const errorPayload = { error: { code: "INCOMPLETE", message: "Finish wizard" } };
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify(errorPayload), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await POST(jsonRequest("POST", {}), accountRouteContext("42"));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual(errorPayload);
  });
});
