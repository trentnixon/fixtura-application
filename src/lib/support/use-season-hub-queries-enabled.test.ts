import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useSeasonHubQueriesEnabled } from "./use-season-hub-queries-enabled";

describe("useSeasonHubQueriesEnabled", () => {
  it("returns false when accountId is missing", () => {
    const { result } = renderHook(() => useSeasonHubQueriesEnabled(undefined));
    expect(result.current).toBe(false);
  });

  it("returns true when accountId is present", () => {
    const { result } = renderHook(() => useSeasonHubQueriesEnabled("700"));
    expect(result.current).toBe(true);
  });
});
