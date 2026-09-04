import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { triggerAssociationSingleScrapeMock } = vi.hoisted(() => ({
  triggerAssociationSingleScrapeMock: vi.fn(),
}));

vi.mock("@/lib/api/services/account.api", () => ({
  accountApi: {
    triggerAssociationSingleScrape: triggerAssociationSingleScrapeMock,
  },
}));

import { queryKeys } from "@/lib/api/query/query-keys";

import { useTriggerAssociationSingleScrape } from "./useTriggerAssociationSingleScrape";

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

describe("useTriggerAssociationSingleScrape", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    triggerAssociationSingleScrapeMock.mockResolvedValue({
      success: true,
      jobId: 101,
      runId: "assoc-single-101",
      message: "queued",
      queueName: "scrape:association-single",
    });
  });

  it("triggers API and invalidates season hub queries on success", async () => {
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useTriggerAssociationSingleScrape("123"), {
      wrapper: Wrapper,
    });

    result.current.mutate({ associationId: 2935 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(triggerAssociationSingleScrapeMock).toHaveBeenCalledWith({
      associationId: 2935,
      accountId: 123,
    });
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ queryKey: queryKeys.seasonHub.recon("123") }),
    );
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ queryKey: queryKeys.seasonHub.stats("123") }),
    );
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        queryKey: queryKeys.seasonHub.competitions("123", { page: 1, pageSize: 25 }),
      }),
    );
  });
});
