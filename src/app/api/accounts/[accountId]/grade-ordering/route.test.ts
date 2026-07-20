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

import { GET, PUT } from "./route";

describe("/api/accounts/[accountId]/grade-ordering", () => {
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

    it("forwards GET with organisation query params to Strapi", async () => {
      const payload = { data: { revision: 0, groups: [] } };
      vi.mocked(globalThis.fetch).mockResolvedValue(
        new Response(JSON.stringify(payload), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

      const res = await GET(
        new Request(
          "http://localhost/api/accounts/42/grade-ordering?organisationType=club&organisationId=123",
        ),
        { params: Promise.resolve({ accountId: "42" }) },
      );

      expect(globalThis.fetch).toHaveBeenCalledWith(
        "https://cms.example/api/accounts/42/grade-ordering?organisationType=club&organisationId=123",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer jwt-token",
          }),
          cache: "no-store",
        }),
      );
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual(payload);
    });
  });

  describe("PUT", () => {
    it("returns 401 when no auth cookie", async () => {
      cookiesGet.mockReturnValue(undefined);
      const res = await PUT(new Request("http://localhost"), {
        params: Promise.resolve({ accountId: "1" }),
      });
      expect(res.status).toBe(401);
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("returns 400 when JSON body is not an object", async () => {
      const res = await PUT(
        new Request("http://localhost", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify([]),
        }),
        { params: Promise.resolve({ accountId: "42" }) },
      );
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: "Body must be a JSON object" });
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("forwards PUT body to Strapi and returns JSON success", async () => {
      const payload = { data: { revision: 1, groups: [] } };
      vi.mocked(globalThis.fetch).mockResolvedValue(
        new Response(JSON.stringify(payload), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

      const body = {
        expectedRevision: 0,
        organisation: { type: "club", id: 123 },
        groups: [{ groupType: "club-age-group", groupKey: "junior", gradeIds: [10] }],
      };
      const res = await PUT(
        new Request("http://localhost", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
        { params: Promise.resolve({ accountId: "42" }) },
      );

      expect(globalThis.fetch).toHaveBeenCalledWith(
        "https://cms.example/api/accounts/42/grade-ordering",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(body),
        }),
      );
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual(payload);
    });

    it("passes through structured 409 conflict unchanged", async () => {
      const errorPayload = {
        data: null,
        error: {
          status: 409,
          code: "ORDERING_REVISION_CONFLICT",
          message: "Grade ordering has changed since it was loaded.",
          details: { expectedRevision: 3, currentRevision: 4 },
        },
      };
      vi.mocked(globalThis.fetch).mockResolvedValue(
        new Response(JSON.stringify(errorPayload), {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }),
      );

      const res = await PUT(
        new Request("http://localhost", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            expectedRevision: 3,
            organisation: { type: "club", id: 123 },
            groups: [],
          }),
        }),
        { params: Promise.resolve({ accountId: "42" }) },
      );

      expect(res.status).toBe(409);
      expect(await res.json()).toEqual(errorPayload);
    });

    it("passes through structured 422 validation unchanged", async () => {
      const errorPayload = {
        data: null,
        error: {
          status: 422,
          code: "GRADE_NOT_IN_ORGANISATION",
          message: "Grade is outside scope.",
        },
      };
      vi.mocked(globalThis.fetch).mockResolvedValue(
        new Response(JSON.stringify(errorPayload), {
          status: 422,
          headers: { "Content-Type": "application/json" },
        }),
      );

      const res = await PUT(
        new Request("http://localhost", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            expectedRevision: 0,
            organisation: { type: "club", id: 123 },
            groups: [],
          }),
        }),
        { params: Promise.resolve({ accountId: "42" }) },
      );

      expect(res.status).toBe(422);
      expect(await res.json()).toEqual(errorPayload);
    });
  });
});
