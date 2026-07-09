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

import { GET } from "./route";

describe("GET /api/accounts/[accountId]/scheduler", () => {
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
    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ accountId: "1" }),
    });
    expect(res.status).toBe(401);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid account id segment", async () => {
    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ accountId: "not-a-number" }),
    });
    expect(res.status).toBe(400);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 500 when Strapi URL is missing", async () => {
    getStrapiUrlMock.mockReturnValueOnce("");
    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ accountId: "42" }),
    });
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Service unavailable" });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("forwards GET to Strapi and returns JSON success", async () => {
    const payload = {
      data: {
        scheduler: {
          days_of_the_week: { id: 3, Name: "Tuesday" },
        },
      },
    };
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ accountId: "42" }),
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://cms.example/api/accounts/42/scheduler",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer jwt-token",
        }),
      }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(payload);
  });
});
