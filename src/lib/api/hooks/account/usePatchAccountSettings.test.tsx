import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { patchAccountSettingsMock } = vi.hoisted(() => ({
  patchAccountSettingsMock: vi.fn(),
}));

vi.mock("@/lib/api/services/account.api", () => ({
  accountApi: {
    patchAccountSettings: patchAccountSettingsMock,
  },
}));

import { queryKeys } from "@/lib/api/query/query-keys";

import { usePatchAccountSettings } from "./usePatchAccountSettings";

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

describe("usePatchAccountSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    patchAccountSettingsMock.mockResolvedValue({ data: {} });
  });

  it("invalidates media gallery category-related queries on success", async () => {
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => usePatchAccountSettings(ACCOUNT_ID), {
      wrapper: Wrapper,
    });

    result.current.mutate({ splitSeniorsAndMasters: true });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: queryKeys.account.settings(ACCOUNT_ID) }),
    );
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: queryKeys.account.mediaLibrary(ACCOUNT_ID) }),
    );
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: queryKeys.seasonHub.all }),
    );
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["account", "grade-ordering", ACCOUNT_ID] }),
    );
  });
});
