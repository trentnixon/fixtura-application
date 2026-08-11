import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { confirmOnboardingMock } = vi.hoisted(() => ({
  confirmOnboardingMock: vi.fn(),
}));

vi.mock("@/lib/api/services/account.api", () => ({
  accountApi: {
    confirmOnboarding: confirmOnboardingMock,
  },
}));

import { queryKeys } from "@/lib/api/query/query-keys";

import { useConfirmOnboarding } from "./useConfirmOnboarding";

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

describe("useConfirmOnboarding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    confirmOnboardingMock.mockResolvedValue({ data: {} });
  });

  it("invalidates bootstrap, settings, org, branding, auth, and lifecycle queries on success", async () => {
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useConfirmOnboarding(ACCOUNT_ID), {
      wrapper: Wrapper,
    });

    result.current.mutate({});

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(confirmOnboardingMock).toHaveBeenCalledWith(ACCOUNT_ID, {});
    expect(invalidateSpy).toHaveBeenCalledTimes(7);
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
      expect.objectContaining({ queryKey: queryKeys.account.organisationContext(ACCOUNT_ID) }),
    );
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({ queryKey: queryKeys.account.branding(ACCOUNT_ID) }),
    );
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      5,
      expect.objectContaining({ queryKey: queryKeys.auth.me }),
    );
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      6,
      expect.objectContaining({ queryKey: queryKeys.account.setupStatus(ACCOUNT_ID) }),
    );
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      7,
      expect.objectContaining({ queryKey: queryKeys.account.onboardingState(ACCOUNT_ID) }),
    );
  });

  it("does not invalidate on failure", async () => {
    confirmOnboardingMock.mockRejectedValue(new Error("fail"));
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useConfirmOnboarding(ACCOUNT_ID), {
      wrapper: Wrapper,
    });

    result.current.mutate({});

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
