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

import { GET, PATCH } from "./route";

describe("/api/accounts/[accountId]/notifications", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getStrapiUrlMock.mockReturnValue("https://cms.example");
    cookiesGet.mockImplementation((name: string) =>
      name === AUTH_COOKIE_NAME ? { value: "jwt-token" } : undefined,
    );
    globalThis.fetch = vi.fn();
  });

  describe("GET", () => {
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
          bundleAddressedTo: "Club",
          deliveryEmail: "a@b.com",
          assetDeliveryDay: "sunday",
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
        "https://cms.example/api/accounts/42/notifications",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: "Bearer jwt-token",
          }),
        }),
      );
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual(payload);
    });
  });

  describe("PATCH", () => {
    it("returns 401 when no auth cookie", async () => {
      cookiesGet.mockReturnValue(undefined);
      const res = await PATCH(new Request("http://localhost"), {
        params: Promise.resolve({ accountId: "1" }),
      });
      expect(res.status).toBe(401);
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("returns 400 for invalid account id segment", async () => {
      const res = await PATCH(
        new Request("http://localhost", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deliveryEmail: "x@y.com" }),
        }),
        { params: Promise.resolve({ accountId: "not-a-number" }) },
      );
      expect(res.status).toBe(400);
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("returns 400 when JSON body is not an object", async () => {
      const res = await PATCH(
        new Request("http://localhost", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify([]),
        }),
        { params: Promise.resolve({ accountId: "42" }) },
      );
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: "Body must be a JSON object" });
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("returns 500 when Strapi URL is missing", async () => {
      getStrapiUrlMock.mockReturnValueOnce("");
      const res = await PATCH(
        new Request("http://localhost", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bundleAddressedTo: "Org" }),
        }),
        { params: Promise.resolve({ accountId: "42" }) },
      );
      expect(res.status).toBe(500);
      expect(await res.json()).toEqual({ error: "Service unavailable" });
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("forwards PATCH body to Strapi and returns JSON success", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue(
        new Response(
          JSON.stringify({
            data: {
              bundleAddressedTo: "Org",
              deliveryEmail: null,
              assetDeliveryDay: "monday",
            },
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      );

      const body = { deliveryEmail: "ops@example.com" };
      const res = await PATCH(
        new Request("http://localhost", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
        { params: Promise.resolve({ accountId: "42" }) },
      );

      expect(globalThis.fetch).toHaveBeenCalledWith(
        "https://cms.example/api/accounts/42/notifications",
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
      const json = (await res.json()) as { data: { deliveryEmail: string | null } };
      expect(json.data.deliveryEmail).toBeNull();
    });

    it("passes through structured Strapi error envelope unchanged", async () => {
      const errorPayload = {
        error: { code: "INVALID_DELIVERY_EMAIL", message: "bad email" },
      };
      vi.mocked(globalThis.fetch).mockResolvedValue(
        new Response(JSON.stringify(errorPayload), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }),
      );

      const res = await PATCH(
        new Request("http://localhost", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deliveryEmail: "not-an-email" }),
        }),
        { params: Promise.resolve({ accountId: "42" }) },
      );

      expect(res.status).toBe(400);
      expect(await res.json()).toEqual(errorPayload);
    });
  });
});
