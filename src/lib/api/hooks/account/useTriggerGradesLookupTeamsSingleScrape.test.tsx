import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { triggerGradesLookupTeamsSingleScrapeMock } = vi.hoisted(() => ({
  triggerGradesLookupTeamsSingleScrapeMock: vi.fn(),
}));

vi.mock("@/lib/api/services/account.api", () => ({
  accountApi: {
    triggerGradesLookupTeamsSingleScrape: triggerGradesLookupTeamsSingleScrapeMock,
  },
}));

import { queryKeys } from "@/lib/api/query/query-keys";

import { useTriggerGradesLookupTeamsSingleScrape } from "./useTriggerGradesLookupTeamsSingleScrape";

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

describe("useTriggerGradesLookupTeamsSingleScrape", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    triggerGradesLookupTeamsSingleScrapeMock.mockResolvedValue({
      success: true,
      jobId: "fixture:13093:cms-grades-lookup-teams-single-1710500000000:single",
      runId: "cms-grades-lookup-teams-single-1710500000000",
      message: "Single competition grades lookup teams scrape job queued successfully",
      queueName: "scrape:grades-lookup-teams-single",
    });
  });

  it("triggers API and invalidates competition, grades list, grade, and fixtures on success", async () => {
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(
      () => useTriggerGradesLookupTeamsSingleScrape("123", "13093", "456"),
      { wrapper: Wrapper },
    );

    result.current.mutate({ competitionId: 13093 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(triggerGradesLookupTeamsSingleScrapeMock).toHaveBeenCalledWith({
      competitionId: 13093,
      accountId: 123,
    });
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
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        queryKey: queryKeys.seasonHub.grade("123", "456", "13093"),
      }),
    );
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({
        queryKey: queryKeys.seasonHub.gradeFixtures("123", "456", "13093"),
      }),
    );
  });
});
