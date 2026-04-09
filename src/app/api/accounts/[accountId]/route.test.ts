import { describe, expect, it, vi, beforeEach } from "vitest";

const cookiesGet = vi.fn();
const { getStrapiUrlMock } = vi.hoisted(() => ({
  getStrapiUrlMock: vi.fn(() => "https://cms.example"),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: cookiesGet,
  }),
}));

vi.mock("@/lib/config/env", () => ({
  getStrapiUrl: () => getStrapiUrlMock(),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-constants";

import { DELETE } from "./route";

describe("DELETE /api/accounts/[accountId]", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getStrapiUrlMock.mockReturnValue("https://cms.example");
    cookiesGet.mockImplementation((name: string) =>
      name === AUTH_COOKIE_NAME ? { value: "jwt-token" } : undefined,
    );
    globalThis.fetch = vi.fn();
  });

  it("returns 401 when no auth cookie", async () => {
    cookiesGet.mockReturnValue(undefined);
    const res = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ accountId: "1" }),
    });
    expect(res.status).toBe(401);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid account id segment", async () => {
    const res = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ accountId: "not-a-number" }),
    });
    expect(res.status).toBe(400);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 503 when Strapi URL is missing", async () => {
    getStrapiUrlMock.mockReturnValueOnce("");
    const res = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ accountId: "42" }),
    });
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

    const res = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ accountId: "42" }),
    });

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
    const body = await res.json();
    expect(body).toEqual({ data: { ok: true } });
  });

  it("passes through Strapi 403 error body", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({ code: "ACCOUNT_DELETE_NOT_ALLOWED", message: "No" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ accountId: "42" }),
    });

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

    const res = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ accountId: "99" }),
    });

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ code: "ACCOUNT_NOT_FOUND" });
  });
});
