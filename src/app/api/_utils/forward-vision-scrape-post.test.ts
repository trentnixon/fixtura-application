import { describe, expect, it, vi } from "vitest";

import {
  forwardVisionScrapePost,
  parseOptionalAccountId,
  parsePositiveIntField,
  visionScrapeUnauthorized,
} from "./forward-vision-scrape-post";

describe("forward-vision-scrape-post helpers", () => {
  it("parsePositiveIntField accepts positive integers only", () => {
    expect(parsePositiveIntField(700)).toBe(700);
    expect(parsePositiveIntField(0)).toBeNull();
    expect(parsePositiveIntField("700")).toBeNull();
  });

  it("parseOptionalAccountId treats missing accountId as null", () => {
    expect(parseOptionalAccountId(undefined)).toEqual({ ok: true, value: null });
    expect(parseOptionalAccountId(700)).toEqual({ ok: true, value: 700 });
    expect(parseOptionalAccountId("700")).toEqual({ ok: false });
  });
});

describe("forwardVisionScrapePost", () => {
  it("returns 401 when accountId is scoped without auth token", async () => {
    const res = await forwardVisionScrapePost({
      strapiUrl: "https://cms.example",
      upstreamPath: "/api/club/trigger-club-single-scrape",
      token: undefined,
      upstreamBody: { accountId: 700, clubId: 123 },
    });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  it("forwards accountId and entity fields with bearer token", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const res = await forwardVisionScrapePost({
      strapiUrl: "https://cms.example",
      upstreamPath: "/api/club/trigger-club-single-scrape",
      token: "jwt-token",
      upstreamBody: { accountId: 700, clubId: 123 },
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://cms.example/api/club/trigger-club-single-scrape",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer jwt-token",
        }),
        body: JSON.stringify({ accountId: 700, clubId: 123 }),
      }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });

    vi.unstubAllGlobals();
  });

  it("visionScrapeUnauthorized matches CMS contract shape", async () => {
    const res = visionScrapeUnauthorized();
    expect(res.status).toBe(401);
  });
});
