import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  jsonRequest,
  mockMissingStrapiUrl,
  mockNoAuthCookie,
  resetStrapiRouteTestMocks,
} from "@/app/api/_test-utils/strapi-route-mocks";

import { POST } from "./route";

describe("POST /api/account/first", () => {
  beforeEach(() => {
    resetStrapiRouteTestMocks();
  });

  it("returns 401 when no auth cookie", async () => {
    mockNoAuthCookie();
    const res = await POST(new Request("http://localhost"));
    expect(res.status).toBe(401);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 503 when Strapi URL is missing", async () => {
    mockMissingStrapiUrl();
    const res = await POST(jsonRequest("POST", { sport: "cricket" }));
    expect(res.status).toBe(503);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 400 when JSON body is invalid", async () => {
    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{",
      }),
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid JSON body" });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("forwards POST body to Strapi and preserves 201 status", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: { accountId: 1 } }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const body = { sport: "cricket", hasCompletedStartSequence: true };
    const res = await POST(jsonRequest("POST", body));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://cms.example/api/account/first",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(body),
      }),
    );
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ data: { accountId: 1 } });
  });

  it("preserves 200 idempotent status from Strapi", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: { accountId: 1 } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await POST(jsonRequest("POST", { sport: "cricket" }));
    expect(res.status).toBe(200);
  });

  it("passes through structured Strapi error envelope unchanged", async () => {
    const errorPayload = { error: { code: "SPORT_REQUIRED", message: "Pick a sport" } };
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify(errorPayload), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await POST(jsonRequest("POST", {}));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual(errorPayload);
  });

  it("preserves 503 ACCOUNT_CREATE_BUSY body and Retry-After", async () => {
    const busyPayload = {
      error: {
        code: "ACCOUNT_CREATE_BUSY",
        message: "Account creation is busy. Please retry.",
      },
    };
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify(busyPayload), {
        status: 503,
        headers: { "Content-Type": "application/json", "Retry-After": "1" },
      }),
    );

    const res = await POST(jsonRequest("POST", { sport: "cricket" }));
    expect(res.status).toBe(503);
    expect(res.headers.get("Retry-After")).toBe("1");
    expect(await res.json()).toEqual(busyPayload);
  });
});
