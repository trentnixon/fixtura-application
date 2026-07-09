import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { createFirstAccountMock } = vi.hoisted(() => ({
  createFirstAccountMock: vi.fn(),
}));

vi.mock("@/lib/api/services/account.api", () => ({
  accountApi: {
    createFirstAccount: createFirstAccountMock,
  },
}));

import { queryKeys } from "@/lib/api/query/query-keys";

import { useCreateFirstAccount } from "./useCreateFirstAccount";

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

describe("useCreateFirstAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createFirstAccountMock.mockResolvedValue({ data: { accountId: 1 } });
  });

  it("invalidates account.me on success", async () => {
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useCreateFirstAccount(), { wrapper: Wrapper });

    result.current.mutate({ sport: "cricket", hasCompletedStartSequence: true });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(createFirstAccountMock).toHaveBeenCalledWith({
      sport: "cricket",
      hasCompletedStartSequence: true,
    });
    expect(invalidateSpy).toHaveBeenCalledTimes(1);
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: queryKeys.account.me }),
    );
  });

  it("does not invalidate on failure", async () => {
    createFirstAccountMock.mockRejectedValue(new Error("fail"));
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useCreateFirstAccount(), { wrapper: Wrapper });

    result.current.mutate({ sport: "cricket", hasCompletedStartSequence: true });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
