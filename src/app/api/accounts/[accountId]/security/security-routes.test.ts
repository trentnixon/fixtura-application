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

import { PATCH as PATCHLoginEmail } from "./login-email/route";
import { POST as POSTPassword } from "./password/route";
import { PATCH as PATCHProfile } from "./profile/route";

function defaultCookie() {
  cookiesGet.mockImplementation((name: string) =>
    name === AUTH_COOKIE_NAME ? { value: "jwt-token" } : undefined,
  );
}

describe("account security BFF routes", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getStrapiUrlMock.mockReturnValue("https://cms.example");
    defaultCookie();
    globalThis.fetch = vi.fn();
  });

  describe("PATCH .../security/profile", () => {
    it("returns 401 when no auth cookie", async () => {
      cookiesGet.mockReturnValue(undefined);
      const res = await PATCHProfile(new Request("http://localhost"), {
        params: Promise.resolve({ accountId: "1" }),
      });
      expect(res.status).toBe(401);
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("returns 400 for invalid account id segment", async () => {
      const res = await PATCHProfile(
        new Request("http://localhost", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userName: "Ada" }),
        }),
        { params: Promise.resolve({ accountId: "not-a-number" }) },
      );
      expect(res.status).toBe(400);
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("forwards PATCH to Strapi profile path", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue(
        new Response(JSON.stringify({ data: { id: 1, FirstName: "Ada", LastName: "" } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

      const res = await PATCHProfile(
        new Request("http://localhost", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userName: "Ada" }),
        }),
        { params: Promise.resolve({ accountId: "42" }) },
      );

      expect(globalThis.fetch).toHaveBeenCalledWith(
        "https://cms.example/api/accounts/42/security/profile",
        expect.objectContaining({ method: "PATCH" }),
      );
      expect(res.status).toBe(200);
    });

    it("passes through structured Strapi error envelope", async () => {
      const errorPayload = { error: { code: "INVALID_BODY", message: "conflict" } };
      vi.mocked(globalThis.fetch).mockResolvedValue(
        new Response(JSON.stringify(errorPayload), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }),
      );

      const res = await PATCHProfile(
        new Request("http://localhost", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userName: "x" }),
        }),
        { params: Promise.resolve({ accountId: "42" }) },
      );

      expect(res.status).toBe(400);
      expect(await res.json()).toEqual(errorPayload);
    });
  });

  describe("PATCH .../security/login-email", () => {
    it("forwards PATCH to Strapi login-email path", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue(
        new Response(JSON.stringify({ data: { loginEmail: "a@b.com" } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

      const res = await PATCHLoginEmail(
        new Request("http://localhost", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ loginEmail: "A@B.com" }),
        }),
        { params: Promise.resolve({ accountId: "7" }) },
      );

      expect(globalThis.fetch).toHaveBeenCalledWith(
        "https://cms.example/api/accounts/7/security/login-email",
        expect.objectContaining({ method: "PATCH" }),
      );
      expect(res.status).toBe(200);
    });
  });

  describe("POST .../security/password", () => {
    it("returns 401 when no auth cookie", async () => {
      cookiesGet.mockReturnValue(undefined);
      const res = await POSTPassword(new Request("http://localhost"), {
        params: Promise.resolve({ accountId: "1" }),
      });
      expect(res.status).toBe(401);
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("forwards POST to Strapi password path", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue(
        new Response(JSON.stringify({ data: { changed: true } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

      const body = {
        currentPassword: "old",
        password: "newpass12",
        passwordConfirmation: "newpass12",
      };
      const res = await POSTPassword(
        new Request("http://localhost", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
        { params: Promise.resolve({ accountId: "42" }) },
      );

      expect(globalThis.fetch).toHaveBeenCalledWith(
        "https://cms.example/api/accounts/42/security/password",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(body),
        }),
      );
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ data: { changed: true } });
    });
  });
});
