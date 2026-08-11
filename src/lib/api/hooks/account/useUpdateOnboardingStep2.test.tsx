import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { uploadOnboardingStep2LogoMock, updateOnboardingStep2Mock } = vi.hoisted(() => ({
  uploadOnboardingStep2LogoMock: vi.fn(),
  updateOnboardingStep2Mock: vi.fn(),
}));

vi.mock("@/lib/api/services/account.api", () => ({
  accountApi: {
    uploadOnboardingStep2Logo: uploadOnboardingStep2LogoMock,
    updateOnboardingStep2: updateOnboardingStep2Mock,
  },
}));

import { queryKeys } from "@/lib/api/query/query-keys";

import { useUpdateOnboardingStep2 } from "./useUpdateOnboardingStep2";

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

describe("useUpdateOnboardingStep2", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    uploadOnboardingStep2LogoMock.mockResolvedValue({ data: { id: 77 } });
    updateOnboardingStep2Mock.mockResolvedValue({ data: {} });
  });

  it("uploads logo before PATCH when file is provided", async () => {
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useUpdateOnboardingStep2(ACCOUNT_ID), {
      wrapper: Wrapper,
    });
    const file = new File(["logo"], "logo.png", { type: "image/png" });

    result.current.mutate({ file, body: { themeId: 101 } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(uploadOnboardingStep2LogoMock).toHaveBeenCalledWith(ACCOUNT_ID, file);
    expect(updateOnboardingStep2Mock).toHaveBeenCalledWith(ACCOUNT_ID, {
      themeId: 101,
      logoMediaId: 77,
    });
    expect(invalidateSpy).toHaveBeenCalledTimes(6);
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
      expect.objectContaining({ queryKey: queryKeys.account.settings(ACCOUNT_ID) }),
    );
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({ queryKey: queryKeys.account.mediaLibrary(ACCOUNT_ID) }),
    );
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      5,
      expect.objectContaining({ queryKey: queryKeys.account.setupStatus(ACCOUNT_ID) }),
    );
    expect(invalidateSpy).toHaveBeenNthCalledWith(
      6,
      expect.objectContaining({ queryKey: queryKeys.account.onboardingState(ACCOUNT_ID) }),
    );
  });

  it("skips PATCH when upload fails", async () => {
    uploadOnboardingStep2LogoMock.mockRejectedValue(new Error("upload failed"));
    const { Wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useUpdateOnboardingStep2(ACCOUNT_ID), {
      wrapper: Wrapper,
    });

    result.current.mutate({
      file: new File(["logo"], "logo.png", { type: "image/png" }),
      body: {},
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(updateOnboardingStep2Mock).not.toHaveBeenCalled();
    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
