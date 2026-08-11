import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const { getCompetitionsMock } = vi.hoisted(() => ({
  getCompetitionsMock: vi.fn(),
}));

vi.mock("@/lib/api/services/season-hub.api", () => ({
  seasonHubApi: {
    getCompetitions: getCompetitionsMock,
  },
}));

import { queryKeys } from "@/lib/api/query/query-keys";

import { useSeasonHubCompetitions } from "./useSeasonHubCompetitions";

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
  Wrapper.displayName = "SeasonHubTestWrapper";
  return { Wrapper, queryClient };
}

describe("useSeasonHubCompetitions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCompetitionsMock.mockResolvedValue({
      data: [],
      meta: { pagination: { page: 1, pageSize: 25, pageCount: 0, total: 0 } },
    });
  });

  it("uses query key that includes page and pageSize", async () => {
    const { Wrapper, queryClient } = createWrapper();

    const { result } = renderHook(
      () => useSeasonHubCompetitions("99", { page: 3, pageSize: 100 }),
      {
        wrapper: Wrapper,
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getCompetitionsMock).toHaveBeenCalledWith("99", { page: 3, pageSize: 100 });
    const key = queryKeys.seasonHub.competitions("99", { page: 3, pageSize: 100 });
    expect(queryClient.getQueryData(key)).toEqual(
      expect.objectContaining({ data: [], meta: expect.any(Object) }),
    );
  });
});
