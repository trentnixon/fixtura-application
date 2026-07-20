import { describe, expect, it, vi, beforeEach } from "vitest";

import {
  accountRouteContext,
  mockMissingStrapiUrl,
  mockNoAuthCookie,
  multipartRequest,
  resetStrapiRouteTestMocks,
} from "@/app/api/_test-utils/strapi-route-mocks";

import { GET, POST } from "./route";

describe("media-library route", () => {
  beforeEach(() => {
    resetStrapiRouteTestMocks();
  });

  it("POST returns 401 when no auth cookie", async () => {
    mockNoAuthCookie();
    const res = await POST(multipartRequest(new Uint8Array([1])), accountRouteContext("1"));
    expect(res.status).toBe(401);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("POST returns 400 when content-type is not multipart", async () => {
    const res = await POST(
      new Request("http://localhost", { method: "POST", body: "{}" }),
      accountRouteContext("42"),
    );
    expect(res.status).toBe(400);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("POST forwards multipart body to Strapi", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: { id: 1 } }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const contentType = "multipart/form-data; boundary=----test";
    const body = new Uint8Array([1, 2, 3]);
    const res = await POST(multipartRequest(body, contentType), accountRouteContext("42"));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://cms.example/api/accounts/42/media-library",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer jwt-token",
          "Content-Type": contentType,
        }),
      }),
    );
    const call = vi.mocked(globalThis.fetch).mock.calls[0]?.[1];
    expect(call?.body).toBeInstanceOf(ArrayBuffer);
    expect(res.status).toBe(201);
  });

  it("GET returns 503 when Strapi URL is missing", async () => {
    mockMissingStrapiUrl();
    const res = await GET(new Request("http://localhost"), accountRouteContext("1"));
    expect(res.status).toBe(503);
  });
});
