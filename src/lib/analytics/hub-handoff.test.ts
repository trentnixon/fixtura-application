import { describe, expect, it } from "vitest";

import { appendPostHogHubDistinctId, POSTHOG_HUB_DISTINCT_ID_PARAM } from "./hub-handoff";

describe("appendPostHogHubDistinctId", () => {
  it("appends phDistinctId query param", () => {
    const url = appendPostHogHubDistinctId(
      "https://hub.example.com/575/cricket/8769/group-a",
      "42",
    );
    expect(url).toContain(`${POSTHOG_HUB_DISTINCT_ID_PARAM}=42`);
  });

  it("preserves existing query params", () => {
    const url = appendPostHogHubDistinctId("https://hub.example.com/path?foo=bar", "99");
    const parsed = new URL(url);
    expect(parsed.searchParams.get("foo")).toBe("bar");
    expect(parsed.searchParams.get(POSTHOG_HUB_DISTINCT_ID_PARAM)).toBe("99");
  });

  it("returns original url when distinct id is empty", () => {
    const original = "https://hub.example.com/575";
    expect(appendPostHogHubDistinctId(original, "")).toBe(original);
    expect(appendPostHogHubDistinctId(original, "   ")).toBe(original);
  });
});
