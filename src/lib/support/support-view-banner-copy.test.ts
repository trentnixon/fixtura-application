import { describe, expect, it } from "vitest";

import { buildSupportViewBannerMessage } from "./support-view-banner-copy";

describe("buildSupportViewBannerMessage", () => {
  it("includes org name and capability-specific guidance", () => {
    expect(
      buildSupportViewBannerMessage({
        accountId: "700",
        orgName: "Example Cricket Club",
      }),
    ).toBe(
      "Support view — Account 700 (Example Cricket Club) — Billing changes are read-only. Vision sync is available for troubleshooting. Per-fixture result scrape is not available in support view.",
    );
  });

  it("omits org name when unavailable", () => {
    expect(buildSupportViewBannerMessage({ accountId: "700" })).toBe(
      "Support view — Account 700 — Billing changes are read-only. Vision sync is available for troubleshooting. Per-fixture result scrape is not available in support view.",
    );
  });

  it("does not describe support view as globally read-only", () => {
    const message = buildSupportViewBannerMessage({ accountId: "700", orgName: "Club" });
    expect(message.toLowerCase()).not.toContain("read only");
    expect(message).toContain("Billing changes are read-only");
    expect(message).toContain("Vision sync is available");
  });
});
