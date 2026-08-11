import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/client/api-error";
import { queryKeys } from "@/lib/api/query/query-keys";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";

const { postAccountBillingStartTrialMock } = vi.hoisted(() => ({
  postAccountBillingStartTrialMock: vi.fn(),
}));

vi.mock("@/lib/api/services/account.api", () => ({
  accountApi: {
    postAccountBillingStartTrial: postAccountBillingStartTrialMock,
  },
}));

import { usePostAccountBillingStartTrial } from "./usePostAccountBillingStartTrial";

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

function orgConflictError(code: string) {
  return new ApiError({
    status: code === "TRIAL_ALLOCATION_DISABLED" ? 503 : 409,
    message: AUTH_ERROR_MESSAGES.serverError,
    details: { error: { code, message: "CMS message" } },
  });
}

describe("usePostAccountBillingStartTrial", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    postAccountBillingStartTrialMock.mockResolvedValue({
      trialId: "1",
      status: "started",
      message: "Your free trial has started.",
    });
  });

  it("invalidates billing-related queries on success", async () => {
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => usePostAccountBillingStartTrial(ACCOUNT_ID), {
      wrapper: Wrapper,
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(postAccountBillingStartTrialMock).toHaveBeenCalledTimes(1);
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: queryKeys.account.billing(ACCOUNT_ID) }),
    );
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: queryKeys.account.billingAvailableTiers(ACCOUNT_ID) }),
    );
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: queryKeys.account.billingInvoiceRequests(ACCOUNT_ID) }),
    );
  });

  it.each([
    "TRIAL_ALREADY_CONSUMED",
    "TRIAL_ORGANISATION_UNAVAILABLE",
    "TRIAL_ALLOCATION_DISABLED",
  ] as const)("invalidates billing-related queries on org conflict %s", async (code) => {
    postAccountBillingStartTrialMock.mockRejectedValue(orgConflictError(code));
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => usePostAccountBillingStartTrial(ACCOUNT_ID), {
      wrapper: Wrapper,
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: queryKeys.account.billing(ACCOUNT_ID) }),
    );
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: queryKeys.account.billingAvailableTiers(ACCOUNT_ID) }),
    );
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: queryKeys.account.billingInvoiceRequests(ACCOUNT_ID) }),
    );
  });

  it("does not invalidate billing queries on unrelated 400 errors", async () => {
    postAccountBillingStartTrialMock.mockRejectedValue(
      new ApiError({
        status: 400,
        message: "Trial plan missing",
        details: { message: "Trial plan missing" },
      }),
    );
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => usePostAccountBillingStartTrial(ACCOUNT_ID), {
      wrapper: Wrapper,
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
