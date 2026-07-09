import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/client/api-error";
import { ONBOARDING_SETUP_STATUS_POLL_MS } from "@/lib/config/onboarding";

const { getOnboardingSetupStatusMock } = vi.hoisted(() => ({
  getOnboardingSetupStatusMock: vi.fn(),
}));

vi.mock("@/lib/api/services/account.api", () => ({
  accountApi: {
    getOnboardingSetupStatus: getOnboardingSetupStatusMock,
  },
}));

import { useOnboardingSetupStatus } from "./useOnboardingSetupStatus";

import type { ReactNode } from "react";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retryDelay: 10,
      },
      mutations: {
        retry: false,
      },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  Wrapper.displayName = "TestQueryWrapper";
  return { Wrapper, queryClient };
}

describe("useOnboardingSetupStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("recovers from a transient timeout and returns setup status data", async () => {
    getOnboardingSetupStatusMock
      .mockRejectedValueOnce(
        new ApiError({
          status: 408,
          message: "Request timed out",
        }),
      )
      .mockResolvedValueOnce({
        data: {
          status: "in_progress",
          isUpdating: true,
        },
      });

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useOnboardingSetupStatus("123"), { wrapper: Wrapper });

    await waitFor(() => {
      expect(getOnboardingSetupStatusMock).toHaveBeenCalledTimes(2);
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getOnboardingSetupStatusMock).toHaveBeenCalledTimes(2);
    expect(result.current.data).toMatchObject({
      status: "in_progress",
      isUpdating: true,
    });
  });

  it("does not fetch when enabled is false", async () => {
    const { Wrapper } = createWrapper();
    renderHook(() => useOnboardingSetupStatus("123", { enabled: false }), { wrapper: Wrapper });

    await vi.advanceTimersByTimeAsync(ONBOARDING_SETUP_STATUS_POLL_MS * 2);

    expect(getOnboardingSetupStatusMock).not.toHaveBeenCalled();
  });

  it("does not fetch when accountId is empty", async () => {
    const { Wrapper } = createWrapper();
    renderHook(() => useOnboardingSetupStatus(""), { wrapper: Wrapper });

    await vi.advanceTimersByTimeAsync(ONBOARDING_SETUP_STATUS_POLL_MS * 2);

    expect(getOnboardingSetupStatusMock).not.toHaveBeenCalled();
  });

  it("throws when setup status payload is missing a valid status field", async () => {
    getOnboardingSetupStatusMock.mockResolvedValue({ data: {} });

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useOnboardingSetupStatus("123"), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({
      message: "Setup status response is missing a valid status field.",
    });
  });

  it("stops polling when status is terminal and isUpdating is not true", async () => {
    getOnboardingSetupStatusMock.mockResolvedValue({
      data: { status: "ready", isUpdating: false },
    });

    const { Wrapper } = createWrapper();
    renderHook(() => useOnboardingSetupStatus("123"), { wrapper: Wrapper });

    await waitFor(() => expect(getOnboardingSetupStatusMock).toHaveBeenCalledTimes(1));

    await vi.advanceTimersByTimeAsync(ONBOARDING_SETUP_STATUS_POLL_MS * 3);

    expect(getOnboardingSetupStatusMock).toHaveBeenCalledTimes(1);
  });

  it("continues polling when status is terminal but isUpdating is true", async () => {
    getOnboardingSetupStatusMock
      .mockResolvedValueOnce({
        data: { status: "ready", isUpdating: true },
      })
      .mockResolvedValueOnce({
        data: { status: "ready", isUpdating: false },
      });

    const { Wrapper } = createWrapper();
    renderHook(() => useOnboardingSetupStatus("123"), { wrapper: Wrapper });

    await waitFor(() => expect(getOnboardingSetupStatusMock).toHaveBeenCalledTimes(1));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(ONBOARDING_SETUP_STATUS_POLL_MS);
    });

    await waitFor(() => expect(getOnboardingSetupStatusMock).toHaveBeenCalledTimes(2));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(ONBOARDING_SETUP_STATUS_POLL_MS * 3);
    });

    expect(getOnboardingSetupStatusMock).toHaveBeenCalledTimes(2);
  });

  it("continues polling on 408 error state", async () => {
    getOnboardingSetupStatusMock
      .mockRejectedValueOnce(new ApiError({ status: 408, message: "timeout" }))
      .mockResolvedValueOnce({ data: { status: "in_progress" } });

    const { Wrapper } = createWrapper();
    renderHook(() => useOnboardingSetupStatus("123"), { wrapper: Wrapper });

    await waitFor(() => expect(getOnboardingSetupStatusMock).toHaveBeenCalledTimes(2));
  });

  it("stops polling on non-408 error state", async () => {
    getOnboardingSetupStatusMock.mockRejectedValue(
      new ApiError({ status: 500, message: "Server error" }),
    );

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useOnboardingSetupStatus("123"), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const callsAfterError = getOnboardingSetupStatusMock.mock.calls.length;

    await vi.advanceTimersByTimeAsync(ONBOARDING_SETUP_STATUS_POLL_MS * 3);

    expect(getOnboardingSetupStatusMock.mock.calls.length).toBe(callsAfterError);
  });

  it("retries 404 at most once", async () => {
    getOnboardingSetupStatusMock.mockRejectedValue(new ApiError({ status: 404, message: "nf" }));

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useOnboardingSetupStatus("123"), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(getOnboardingSetupStatusMock).toHaveBeenCalledTimes(2);
  });

  it("retries 503 at most once", async () => {
    getOnboardingSetupStatusMock.mockRejectedValue(
      new ApiError({ status: 503, message: "unavail" }),
    );

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useOnboardingSetupStatus("123"), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(getOnboardingSetupStatusMock).toHaveBeenCalledTimes(2);
  });

  it("retries 408 up to three times before error", async () => {
    getOnboardingSetupStatusMock.mockRejectedValue(
      new ApiError({ status: 408, message: "timeout" }),
    );

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useOnboardingSetupStatus("123"), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(getOnboardingSetupStatusMock).toHaveBeenCalledTimes(4);
  });

  it("retries generic errors at most twice", async () => {
    getOnboardingSetupStatusMock.mockRejectedValue(new Error("network"));

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useOnboardingSetupStatus("123"), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(getOnboardingSetupStatusMock).toHaveBeenCalledTimes(3);
  });
});
