import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useVisionResultSyncActionsEnabled } from "./use-vision-result-sync-actions-enabled";

vi.mock("@/lib/support/support-view-context", () => ({
  useSupportView: vi.fn(),
}));

import { useSupportView } from "@/lib/support/support-view-context";

const useSupportViewMock = vi.mocked(useSupportView);

describe("useVisionResultSyncActionsEnabled", () => {
  it("returns false in support view", () => {
    useSupportViewMock.mockReturnValue({
      canAccessAllAccounts: true,
      isSupportView: true,
      customerAccountId: "700",
    });

    const { result } = renderHook(() => useVisionResultSyncActionsEnabled());
    expect(result.current).toBe(false);
  });

  it("returns true for account owners", () => {
    useSupportViewMock.mockReturnValue({
      canAccessAllAccounts: false,
      isSupportView: false,
      customerAccountId: null,
    });

    const { result } = renderHook(() => useVisionResultSyncActionsEnabled());
    expect(result.current).toBe(true);
  });
});
