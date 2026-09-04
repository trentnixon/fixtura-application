import { describe, expect, it } from "vitest";

import { buildSupportViewBannerMessage } from "./support-view-banner-copy";

describe("buildSupportViewBannerMessage", () => {
  it("includes org name when available", () => {
    expect(
      buildSupportViewBannerMessage({
        accountId: "700",
        orgName: "Darwin And Districts Cricket Competition",
      }),
    ).toBe("Support view — Account 700 (Darwin And Districts Cricket Competition)");
  });

  it("omits org name when unavailable", () => {
    expect(buildSupportViewBannerMessage({ accountId: "700" })).toBe("Support view — Account 700");
  });
});
