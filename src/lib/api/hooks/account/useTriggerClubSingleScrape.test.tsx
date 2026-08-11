import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { triggerClubSingleScrapeMock } = vi.hoisted(() => ({
  triggerClubSingleScrapeMock: vi.fn(),
}));

vi.mock("@/lib/api/services/account.api", () => ({
  accountApi: {
    triggerClubSingleScrape: triggerClubSingleScrapeMock,
  },
}));

import { queryKeys } from "@/lib/api/query/query-keys";

import { useTriggerClubSingleScrape } from "./useTriggerClubSingleScrape";

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

describe("useTriggerClubSingleScrape", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    triggerClubSingleScrapeMock.mockResolvedValue({
      success: true,
      jobId: 102,
      runId: "club-single-102",
      message: "queued",
      queueName: "scrape:club-single",
    });
  });

  it("triggers API and invalidates season hub queries on success", async () => {
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useTriggerClubSingleScrape("123"), {
      wrapper: Wrapper,
    });

    result.current.mutate({ clubId: 33572 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(triggerClubSingleScrapeMock).toHaveBeenCalledWith({ clubId: 33572 });
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
