import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { createOnboardingStep2ThemeMock } = vi.hoisted(() => ({
  createOnboardingStep2ThemeMock: vi.fn(),
}));

vi.mock("@/lib/api/services/account.api", () => ({
  accountApi: {
    createOnboardingStep2Theme: createOnboardingStep2ThemeMock,
  },
}));

import { queryKeys } from "@/lib/api/query/query-keys";

import { useCreateOnboardingStep2Theme } from "./useCreateOnboardingStep2Theme";

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

describe("useCreateOnboardingStep2Theme", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createOnboardingStep2ThemeMock.mockResolvedValue({ data: { id: 555 } });
  });

  it("invalidates branding and theme lookup on success", async () => {
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useCreateOnboardingStep2Theme(ACCOUNT_ID), {
      wrapper: Wrapper,
    });

    result.current.mutate({
      name: "Jane — Metro",
      primary: "#111111",
      secondary: "#222222",
      dark: "#0F172A",
      white: "#FFFFFF",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledTimes(4);
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ queryKey: queryKeys.account.me }),
    );
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ queryKey: queryKeys.account.branding(ACCOUNT_ID) }),
    );
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ queryKey: queryKeys.onboarding.lookupsThemes }),
    );
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({ queryKey: queryKeys.account.settings(ACCOUNT_ID) }),
    );
  });

  it("does not invalidate on failure", async () => {
    createOnboardingStep2ThemeMock.mockRejectedValue(new Error("fail"));
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useCreateOnboardingStep2Theme(ACCOUNT_ID), {
      wrapper: Wrapper,
    });

    result.current.mutate({
      name: "Jane — Metro",
      primary: "#111111",
      secondary: "#222222",
      dark: "#0F172A",
      white: "#FFFFFF",
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
