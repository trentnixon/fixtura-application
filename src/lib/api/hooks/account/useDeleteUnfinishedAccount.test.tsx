import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { ApiError } from "@/lib/api/client/api-error";
import { queryKeys } from "@/lib/api/query/query-keys";

import { useDeleteUnfinishedAccount } from "./useDeleteUnfinishedAccount";

import type { ReactNode } from "react";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

const { deleteUnfinishedAccountMock, getAccountMeMock } = vi.hoisted(() => ({
  deleteUnfinishedAccountMock: vi.fn(),
  getAccountMeMock: vi.fn(),
}));

vi.mock("@/lib/api/services/account.api", () => ({
  accountApi: {
    deleteUnfinishedAccount: deleteUnfinishedAccountMock,
    getAccountMe: getAccountMeMock,
  },
}));

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

const DELETED_ID = "123";
const OTHER_ID = "456";

describe("useDeleteUnfinishedAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    deleteUnfinishedAccountMock.mockResolvedValue({
      data: { accountId: 123, deleted: true },
    });
  });

  it("on success: calls API, clears deleted-id caches via exact-id helper, invalidates me, then redirects", async () => {
    const { Wrapper, queryClient } = createWrapper();
    const cancelSpy = vi.spyOn(queryClient, "cancelQueries");
    const removeSpy = vi.spyOn(queryClient, "removeQueries");
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    queryClient.setQueryData(queryKeys.account.billing(DELETED_ID), { id: DELETED_ID });
    queryClient.setQueryData(queryKeys.account.scheduler(DELETED_ID), { id: DELETED_ID });
    queryClient.setQueryData(queryKeys.seasonHub.recon(DELETED_ID), { id: DELETED_ID });
    queryClient.setQueryData(queryKeys.ui.assetPickerSelectedId(DELETED_ID), 9);
    queryClient.setQueryData(queryKeys.account.billing(OTHER_ID), { id: OTHER_ID });
    queryClient.setQueryData(queryKeys.account.me, { data: { accounts: [] } });

    const { result } = renderHook(() => useDeleteUnfinishedAccount(DELETED_ID), {
      wrapper: Wrapper,
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(deleteUnfinishedAccountMock).toHaveBeenCalledWith(DELETED_ID);
    expect(cancelSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();
    expect(queryClient.getQueryData(queryKeys.account.billing(DELETED_ID))).toBeUndefined();
    expect(queryClient.getQueryData(queryKeys.account.scheduler(DELETED_ID))).toBeUndefined();
    expect(queryClient.getQueryData(queryKeys.seasonHub.recon(DELETED_ID))).toBeUndefined();
    expect(
      queryClient.getQueryData(queryKeys.ui.assetPickerSelectedId(DELETED_ID)),
    ).toBeUndefined();
    expect(queryClient.getQueryData(queryKeys.account.billing(OTHER_ID))).toEqual({ id: OTHER_ID });
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: queryKeys.account.me }),
    );
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: queryKeys.auth.me }),
    );
    expect(replace).toHaveBeenCalledWith("/select-organisation");
  });

  it("two-account onboarding caches: deleting 11 leaves account 22 onboarding data intact", async () => {
    deleteUnfinishedAccountMock.mockResolvedValue({
      data: { accountId: 11, deleted: true },
    });
    const { Wrapper, queryClient } = createWrapper();
    const stateA = {
      accountId: 11,
      onboardingCurrentStep: 1,
      onboardingWizardCompletedAt: null,
    };
    const stateB = {
      accountId: 22,
      onboardingCurrentStep: 2,
      onboardingWizardCompletedAt: null,
    };
    queryClient.setQueryData(queryKeys.account.onboardingState("11"), stateA);
    queryClient.setQueryData(queryKeys.account.onboardingState("22"), stateB);
    queryClient.setQueryData(queryKeys.account.branding("11"), { data: { id: 11 } });
    queryClient.setQueryData(queryKeys.account.branding("22"), { data: { id: 22 } });

    const { result } = renderHook(() => useDeleteUnfinishedAccount("11"), {
      wrapper: Wrapper,
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryData(queryKeys.account.onboardingState("11"))).toBeUndefined();
    expect(queryClient.getQueryData(queryKeys.account.branding("11"))).toBeUndefined();
    expect(queryClient.getQueryData(queryKeys.account.onboardingState("22"))).toEqual(stateB);
    expect(queryClient.getQueryData(queryKeys.account.branding("22"))).toEqual({
      data: { id: 22 },
    });
  });

  it("on definite failure: does not redirect", async () => {
    deleteUnfinishedAccountMock.mockRejectedValueOnce(
      new ApiError({
        status: 403,
        message: "Forbidden",
        details: { code: "ACCOUNT_DELETE_NOT_ALLOWED" },
      }),
    );
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useDeleteUnfinishedAccount(DELETED_ID), {
      wrapper: Wrapper,
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(getAccountMeMock).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });

  it("on uncertain + absent from me: treats as success and redirects", async () => {
    deleteUnfinishedAccountMock.mockRejectedValueOnce(
      new ApiError({ status: 408, message: "Request timed out" }),
    );
    getAccountMeMock.mockResolvedValueOnce({
      data: {
        user: null,
        accounts: [{ id: 456 }],
      },
    });
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useDeleteUnfinishedAccount(DELETED_ID), {
      wrapper: Wrapper,
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getAccountMeMock).toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith("/select-organisation");
  });

  it("on uncertain + still present in me: retains account and does not redirect", async () => {
    deleteUnfinishedAccountMock.mockRejectedValueOnce(
      new ApiError({ status: 408, message: "Request timed out" }),
    );
    getAccountMeMock.mockResolvedValueOnce({
      data: {
        user: null,
        accounts: [{ id: 123 }, { id: 456 }],
      },
    });
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useDeleteUnfinishedAccount(DELETED_ID), {
      wrapper: Wrapper,
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(getAccountMeMock).toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });

  it("on uncertain + me refetch failure: does not claim success", async () => {
    deleteUnfinishedAccountMock.mockRejectedValueOnce(
      new ApiError({ status: 500, message: "Server error" }),
    );
    getAccountMeMock.mockRejectedValueOnce(new Error("me failed"));
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useDeleteUnfinishedAccount(DELETED_ID), {
      wrapper: Wrapper,
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toMatchObject({
      message: expect.stringMatching(/could not confirm/i),
    });
    expect(replace).not.toHaveBeenCalled();
  });
});
