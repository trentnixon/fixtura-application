import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { triggerFixtureDiscoveryGradeMock } = vi.hoisted(() => ({
  triggerFixtureDiscoveryGradeMock: vi.fn(),
}));

vi.mock("@/lib/api/services/account.api", () => ({
  accountApi: {
    triggerFixtureDiscoveryGrade: triggerFixtureDiscoveryGradeMock,
  },
}));

import { queryKeys } from "@/lib/api/query/query-keys";

import { useTriggerFixtureDiscoveryGrade } from "./useTriggerFixtureDiscoveryGrade";

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

describe("useTriggerFixtureDiscoveryGrade", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    triggerFixtureDiscoveryGradeMock.mockResolvedValue({
      success: true,
      jobId: "fixture-discovery:1234:cms-fixture-discovery-grade-1710500000000",
      runId: "cms-fixture-discovery-grade-1710500000000",
      message: "Fixture discovery grade job queued successfully",
      queueName: "fixture_discovery",
      gradeId: 1234,
    });
  });

  it("triggers API and invalidates grade + grade fixtures queries on success", async () => {
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useTriggerFixtureDiscoveryGrade("123", "99", "1234"), {
      wrapper: Wrapper,
    });

    result.current.mutate({ id: 1234 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(triggerFixtureDiscoveryGradeMock).toHaveBeenCalledWith({ id: 1234, accountId: 123 });
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        queryKey: queryKeys.seasonHub.grade("123", "1234", "99"),
      }),
    );
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        queryKey: queryKeys.seasonHub.gradeFixtures("123", "1234", "99"),
      }),
    );
  });
});
