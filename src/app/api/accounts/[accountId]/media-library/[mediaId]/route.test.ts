import { describe, expect, it, vi, beforeEach } from "vitest";

import { jsonRequest, resetStrapiRouteTestMocks } from "@/app/api/_test-utils/strapi-route-mocks";

import { DELETE, PATCH } from "./route";

function itemRouteContext(accountId: string, mediaId: string) {
  return { params: Promise.resolve({ accountId, mediaId }) };
}

describe("media-library item route", () => {
  beforeEach(() => {
    resetStrapiRouteTestMocks();
  });

  it("PATCH forwards flat JSON to Strapi", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: { id: 5 } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const res = await PATCH(jsonRequest("PATCH", { isActive: false }), itemRouteContext("42", "5"));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://cms.example/api/accounts/42/media-library/5",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ isActive: false }),
      }),
    );
    expect(res.status).toBe(200);
  });

  it("DELETE returns bodyless 204 from Strapi", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(new Response(null, { status: 204 }));

    const res = await DELETE(new Request("http://localhost"), itemRouteContext("42", "5"));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://cms.example/api/accounts/42/media-library/5",
      expect.objectContaining({ method: "DELETE" }),
    );
    expect(res.status).toBe(204);
    expect(await res.text()).toBe("");
  });

  it("returns 400 for invalid media id", async () => {
    const res = await DELETE(new Request("http://localhost"), itemRouteContext("42", "abc"));
    expect(res.status).toBe(400);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
