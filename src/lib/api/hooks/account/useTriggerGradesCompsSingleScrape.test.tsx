import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { triggerGradesCompsSingleScrapeMock } = vi.hoisted(() => ({
  triggerGradesCompsSingleScrapeMock: vi.fn(),
}));

vi.mock("@/lib/api/services/account.api", () => ({
  accountApi: {
    triggerGradesCompsSingleScrape: triggerGradesCompsSingleScrapeMock,
  },
}));

import { queryKeys } from "@/lib/api/query/query-keys";

import { useTriggerGradesCompsSingleScrape } from "./useTriggerGradesCompsSingleScrape";

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

describe("useTriggerGradesCompsSingleScrape", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    triggerGradesCompsSingleScrapeMock.mockResolvedValue({
      success: true,
      jobId: "fixture:13093:cms-grades-single-1710500000000:F001",
      runId: "cms-grades-single-1710500000000",
      message: "Single competition grades scrape job queued successfully",
      queueName: "scrape:grades-comps-single",
    });
  });

  it("triggers API and invalidates competition + grades queries on success", async () => {
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useTriggerGradesCompsSingleScrape("123", "13093"), {
      wrapper: Wrapper,
    });

    result.current.mutate({ competitionId: 13093 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(triggerGradesCompsSingleScrapeMock).toHaveBeenCalledWith({ competitionId: 13093 });
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        queryKey: queryKeys.seasonHub.competition("123", "13093"),
      }),
    );
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        queryKey: queryKeys.seasonHub.competitionGrades("123", "13093"),
      }),
    );
  });
});
