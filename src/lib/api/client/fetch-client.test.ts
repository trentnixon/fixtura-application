import { describe, expect, it, vi } from "vitest";

import { apiRequest } from "./fetch-client";

describe("apiRequest 204", () => {
  it("returns undefined without parsing JSON", async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 204 })) as typeof fetch;

    const result = await apiRequest<void>("/api/accounts/1/media-library/2", {
      method: "DELETE",
    });

    expect(result).toBeUndefined();
  });
});
