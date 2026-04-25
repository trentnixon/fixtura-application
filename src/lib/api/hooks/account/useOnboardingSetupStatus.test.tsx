import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { ApiError } from "@/lib/api/client/api-error";

const { getOnboardingSetupStatusMock } = vi.hoisted(() => ({
  getOnboardingSetupStatusMock: vi.fn(),
}));

vi.mock("@/lib/api/services/account.api", () => ({
  accountApi: {
    getOnboardingSetupStatus: getOnboardingSetupStatusMock,
  },
}));

import { useOnboardingSetupStatus } from "./useOnboardingSetupStatus";

import type { ReactNode } from "react";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retryDelay: 10,
      },
      mutations: {
        retry: false,
      },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  Wrapper.displayName = "TestQueryWrapper";
  return { Wrapper };
}

describe("useOnboardingSetupStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("recovers from a transient timeout and returns setup status data", async () => {
    getOnboardingSetupStatusMock
      .mockRejectedValueOnce(
        new ApiError({
          status: 408,
          message: "Request timed out",
        }),
      )
      .mockResolvedValueOnce({
        data: {
          status: "in_progress",
          isUpdating: true,
        },
      });

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useOnboardingSetupStatus("123"), { wrapper: Wrapper });

    await waitFor(() => {
      expect(getOnboardingSetupStatusMock).toHaveBeenCalledTimes(2);
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getOnboardingSetupStatusMock).toHaveBeenCalledTimes(2);
    expect(result.current.data).toMatchObject({
      status: "in_progress",
      isUpdating: true,
    });
  });
});
