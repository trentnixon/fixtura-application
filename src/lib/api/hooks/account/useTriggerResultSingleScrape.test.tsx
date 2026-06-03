import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { triggerResultSingleScrapeMock } = vi.hoisted(() => ({
  triggerResultSingleScrapeMock: vi.fn(),
}));

vi.mock("@/lib/api/services/account.api", () => ({
  accountApi: {
    triggerResultSingleScrape: triggerResultSingleScrapeMock,
  },
}));

import { queryKeys } from "@/lib/api/query/query-keys";

import { useTriggerResultSingleScrape } from "./useTriggerResultSingleScrape";

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

describe("useTriggerResultSingleScrape", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    triggerResultSingleScrapeMock.mockResolvedValue({
      success: true,
      jobId: "result-single:81406:1739000000000",
      bullJobId: 12345,
      runId: "run-abc",
      cmsFixtureId: 81406,
      queueName: "scrape:result-single",
      message: "Queued",
    });
  });

  it("triggers API and invalidates fixture + grade fixtures queries on success", async () => {
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useTriggerResultSingleScrape("acc-1", "10", "20", "30"), {
      wrapper: Wrapper,
    });

    result.current.mutate({ cmsFixtureId: 81406 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(triggerResultSingleScrapeMock).toHaveBeenCalledWith({ cmsFixtureId: 81406 });
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        queryKey: queryKeys.seasonHub.fixture("acc-1", "10", "20", "30"),
      }),
    );
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        queryKey: queryKeys.seasonHub.gradeFixtures("acc-1", "20", "10"),
      }),
    );
  });
});
