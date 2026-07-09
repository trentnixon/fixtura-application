import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  accountRouteContext,
  jsonRequest,
  mockMissingStrapiUrl,
  mockNoAuthCookie,
  multipartRequest,
  resetStrapiRouteTestMocks,
} from "@/app/api/_test-utils/strapi-route-mocks";

import { POST } from "./route";

describe("POST /api/accounts/[accountId]/onboarding/step-2/upload", () => {
  beforeEach(() => {
    resetStrapiRouteTestMocks();
  });

  it("returns 401 when no auth cookie", async () => {
    mockNoAuthCookie();
    const res = await POST(multipartRequest(new Uint8Array([1, 2, 3])), accountRouteContext("1"));
    expect(res.status).toBe(401);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid account id segment", async () => {
    const res = await POST(
      multipartRequest(new Uint8Array([1, 2, 3])),
      accountRouteContext("not-a-number"),
    );
    expect(res.status).toBe(400);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 503 when Strapi URL is missing", async () => {
    mockMissingStrapiUrl();
    const res = await POST(multipartRequest(new Uint8Array([1, 2, 3])), accountRouteContext("42"));
    expect(res.status).toBe(503);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 400 when content-type is not multipart", async () => {
    const res = await POST(jsonRequest("POST", { file: "nope" }), accountRouteContext("42"));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Expected multipart/form-data" });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("forwards multipart body and Content-Type to Strapi", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: { logoMediaId: 5 } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const contentType = "multipart/form-data; boundary=----test";
    const body = new Uint8Array([1, 2, 3, 4]);
    const res = await POST(multipartRequest(body, contentType), accountRouteContext("42"));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://cms.example/api/accounts/42/onboarding/step-2/upload",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer jwt-token",
          "Content-Type": contentType,
        }),
        body: expect.any(ArrayBuffer),
      }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ data: { logoMediaId: 5 } });
  });

  it("passes through structured Strapi error envelope unchanged", async () => {
    const errorPayload = { error: { code: "FILE_TOO_LARGE", message: "Too big" } };
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify(errorPayload), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await POST(multipartRequest(new Uint8Array([1])), accountRouteContext("42"));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual(errorPayload);
  });
});
