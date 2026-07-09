import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  accountRouteContext,
  jsonRequest,
  mockMissingStrapiUrl,
  mockNoAuthCookie,
  resetStrapiRouteTestMocks,
} from "@/app/api/_test-utils/strapi-route-mocks";

import { POST } from "./route";

describe("POST /api/accounts/[accountId]/onboarding/step-2/theme", () => {
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
    const res = await POST(
      jsonRequest("POST", { label: "Custom" }),
      accountRouteContext("not-a-number"),
    );
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
    const res = await POST(jsonRequest("POST", { label: "Custom" }), accountRouteContext("42"));
    expect(res.status).toBe(503);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("forwards POST body to Strapi and returns JSON success", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: { themeId: 9 } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const body = { label: "Custom", primary: "#000000" };
    const res = await POST(jsonRequest("POST", body), accountRouteContext("42"));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://cms.example/api/accounts/42/onboarding/step-2/theme",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(body),
      }),
    );
    expect(res.status).toBe(200);
  });

  it("passes through structured Strapi error envelope unchanged", async () => {
    const errorPayload = { error: { code: "INVALID_THEME", message: "Bad colors" } };
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify(errorPayload), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await POST(jsonRequest("POST", { label: "Bad" }), accountRouteContext("42"));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual(errorPayload);
  });
});
