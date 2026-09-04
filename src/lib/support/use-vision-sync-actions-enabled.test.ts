import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useVisionSyncActionsEnabled } from "./use-vision-sync-actions-enabled";

describe("useVisionSyncActionsEnabled", () => {
  it("returns true after Phase C BFF account scoping ships", () => {
    const { result } = renderHook(() => useVisionSyncActionsEnabled());
    expect(result.current).toBe(true);
  });
});
