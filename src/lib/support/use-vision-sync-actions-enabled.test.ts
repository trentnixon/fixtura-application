import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useVisionSyncActionsEnabled } from "./use-vision-sync-actions-enabled";

vi.mock("@/lib/support/support-view-context", () => ({
  useSupportView: vi.fn(),
}));

import { useSupportView } from "@/lib/support/support-view-context";

const useSupportViewMock = vi.mocked(useSupportView);

describe("useVisionSyncActionsEnabled", () => {
  it("returns false in support view", () => {
    useSupportViewMock.mockReturnValue({
      canAccessAllAccounts: true,
      isSupportView: true,
      customerAccountId: "700",
    });

    const { result } = renderHook(() => useVisionSyncActionsEnabled());
    expect(result.current).toBe(false);
  });

  it("returns true outside support view", () => {
    useSupportViewMock.mockReturnValue({
      canAccessAllAccounts: false,
      isSupportView: false,
      customerAccountId: null,
    });

    const { result } = renderHook(() => useVisionSyncActionsEnabled());
    expect(result.current).toBe(true);
  });
});
