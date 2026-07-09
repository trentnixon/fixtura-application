import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { updateOnboardingStep3Mock } = vi.hoisted(() => ({
  updateOnboardingStep3Mock: vi.fn(),
}));

vi.mock("@/lib/api/services/account.api", () => ({
  accountApi: {
    updateOnboardingStep3: updateOnboardingStep3Mock,
  },
}));

import { queryKeys } from "@/lib/api/query/query-keys";

import { useUpdateOnboardingStep3 } from "./useUpdateOnboardingStep3";

import type { ReactNode } from "react";

const ACCOUNT_ID = "42";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  Wrapper.displayName = "TestQueryWrapper";
  return { Wrapper, queryClient };
}

describe("useUpdateOnboardingStep3", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateOnboardingStep3Mock.mockResolvedValue({ data: {} });
  });

  it("invalidates settings, auth, and lifecycle queries on success", async () => {
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useUpdateOnboardingStep3(ACCOUNT_ID), {
      wrapper: Wrapper,
    });

    result.current.mutate({
      firstName: "Jane",
      deliveryAddress: "weekly@test.com",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledTimes(5);
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ queryKey: queryKeys.account.me }),
    );
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ queryKey: queryKeys.account.settings(ACCOUNT_ID) }),
    );
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ queryKey: queryKeys.auth.me }),
    );
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({ queryKey: queryKeys.account.setupStatus(ACCOUNT_ID) }),
    );
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      5,
      expect.objectContaining({ queryKey: queryKeys.account.onboardingState(ACCOUNT_ID) }),
    );
  });

  it("does not invalidate on failure", async () => {
    updateOnboardingStep3Mock.mockRejectedValue(new Error("fail"));
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useUpdateOnboardingStep3(ACCOUNT_ID), {
      wrapper: Wrapper,
    });

    result.current.mutate({ firstName: "Jane" });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
