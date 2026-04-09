import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

const { deleteUnfinishedAccountMock } = vi.hoisted(() => ({
  deleteUnfinishedAccountMock: vi.fn(),
}));

vi.mock("@/lib/api/services/account.api", () => ({
  accountApi: {
    deleteUnfinishedAccount: deleteUnfinishedAccountMock,
  },
}));

import { queryKeys } from "@/lib/api/query/query-keys";

import { useDeleteUnfinishedAccount } from "./useDeleteUnfinishedAccount";

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

describe("useDeleteUnfinishedAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    deleteUnfinishedAccountMock.mockResolvedValue({});
  });

  it("on success: calls API, cancels onboarding refetch, invalidates caches, then redirects", async () => {
    const { Wrapper, queryClient } = createWrapper();
    const cancelSpy = vi.spyOn(queryClient, "cancelQueries");
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useDeleteUnfinishedAccount("123"), { wrapper: Wrapper });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(deleteUnfinishedAccountMock).toHaveBeenCalledWith("123");
    expect(cancelSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.account.onboardingState("123"),
    });
    expect(invalidateSpy).toHaveBeenCalledTimes(7);
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ queryKey: queryKeys.account.me }),
    );
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        queryKey: queryKeys.account.onboardingState("123"),
        refetchType: "none",
      }),
    );
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        queryKey: queryKeys.account.setupStatus("123"),
        refetchType: "none",
      }),
    );
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({
        queryKey: queryKeys.account.settings("123"),
        refetchType: "none",
      }),
    );
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      5,
      expect.objectContaining({
        queryKey: queryKeys.account.organisationContext("123"),
        refetchType: "none",
      }),
    );
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      6,
      expect.objectContaining({
        queryKey: queryKeys.account.branding("123"),
        refetchType: "none",
      }),
    );
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      7,
      expect.objectContaining({ queryKey: queryKeys.auth.me }),
    );
    expect(replace).toHaveBeenCalledWith("/select-organisation");
  });

  it("on failure: does not redirect", async () => {
    deleteUnfinishedAccountMock.mockRejectedValueOnce(new Error("network"));
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useDeleteUnfinishedAccount("123"), { wrapper: Wrapper });

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(replace).not.toHaveBeenCalled();
  });
});
