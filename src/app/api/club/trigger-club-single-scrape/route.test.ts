import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { AUTH_COOKIE_NAME } from "@/lib/auth/auth-constants";

const cookiesGet = vi.fn();
const getStrapiUrlMock = vi.fn(() => "https://cms.example");

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

let POST: (request: Request) => Promise<Response>;

beforeAll(async () => {
  ({ POST } = await import("./route"));
});

describe("POST /api/club/trigger-club-single-scrape", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getStrapiUrlMock.mockReturnValue("https://cms.example");
    cookiesGet.mockImplementation((name: string) =>
      name === AUTH_COOKIE_NAME ? { value: "jwt-token" } : undefined,
    );
    globalThis.fetch = vi.fn();
  });

  it("returns 401 when accountId is scoped without auth cookie", async () => {
    cookiesGet.mockReturnValue(undefined);

    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: 700, clubId: 42 }),
      }),
    );

    expect(res.status).toBe(401);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("forwards accountId and clubId to CMS with bearer token", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: 700, clubId: 42 }),
      }),
    );

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://cms.example/api/club/trigger-club-single-scrape",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer jwt-token",
        }),
      }),
    );
    const fetchInit = vi.mocked(globalThis.fetch).mock.calls[0]?.[1];
    expect(JSON.parse(String(fetchInit?.body))).toEqual({ accountId: 700, clubId: 42 });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
  });
});
