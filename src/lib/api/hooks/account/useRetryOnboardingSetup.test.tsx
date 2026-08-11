import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

const { retryOnboardingSetupMock } = vi.hoisted(() => ({
  retryOnboardingSetupMock: vi.fn(),
}));

vi.mock("@/lib/api/services/account.api", () => ({
  accountApi: {
    retryOnboardingSetup: retryOnboardingSetupMock,
  },
}));

import { queryKeys } from "@/lib/api/query/query-keys";

import { useRetryOnboardingSetup } from "./useRetryOnboardingSetup";

import type { ReactNode } from "react";

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

describe("useRetryOnboardingSetup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    retryOnboardingSetupMock.mockResolvedValue({});
  });

  it("on success: calls API with default body and invalidates lifecycle caches", async () => {
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useRetryOnboardingSetup("123"), { wrapper: Wrapper });

    result.current.mutate({});

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(retryOnboardingSetupMock).toHaveBeenCalledWith("123", {});
    expect(invalidateSpy).toHaveBeenCalledTimes(7);
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ queryKey: queryKeys.account.me }),
    );
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ queryKey: queryKeys.account.onboardingState("123") }),
    );
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ queryKey: queryKeys.account.setupStatus("123") }),
    );
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({ queryKey: queryKeys.account.settings("123") }),
    );
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      5,
      expect.objectContaining({ queryKey: queryKeys.account.organisationContext("123") }),
    );
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      6,
      expect.objectContaining({ queryKey: queryKeys.account.branding("123") }),
    );
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      7,
      expect.objectContaining({ queryKey: queryKeys.auth.me }),
    );
    expect(replace).not.toHaveBeenCalled();
  });

  it("on failure: does not invalidate caches or navigate", async () => {
    retryOnboardingSetupMock.mockRejectedValueOnce(new Error("network"));
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useRetryOnboardingSetup("123"), { wrapper: Wrapper });

    result.current.mutate({});

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(invalidateSpy).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });
});
