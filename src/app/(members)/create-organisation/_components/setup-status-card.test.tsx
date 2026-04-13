import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SetupStatusCard } from "./setup-status-card";

const useOnboardingSetupStatus = vi.hoisted(() => vi.fn());
const useRetryOnboardingSetup = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/hooks/account/useOnboardingSetupStatus", () => ({
  useOnboardingSetupStatus: useOnboardingSetupStatus,
}));

vi.mock("@/lib/api/hooks/account/useRetryOnboardingSetup", () => ({
  useRetryOnboardingSetup: useRetryOnboardingSetup,
}));

describe("SetupStatusCard", () => {
  it("shows Retry setup when status is failed, terminal, and showRetryOnFailure is true", () => {
    useOnboardingSetupStatus.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        status: "failed",
        phase: "setup",
        progress: undefined,
        initialSetupStatus: "failed",
        initialDataFetchStatus: "not_started",
        requiresUserAction: false,
        errorCode: "E_TEST",
      },
    });
    useRetryOnboardingSetup.mockReturnValue({
      isPending: false,
      mutate: vi.fn(),
    });

    render(<SetupStatusCard accountId="99" showRetryOnFailure />);

    expect(screen.getByRole("button", { name: /retry setup/i })).toBeInTheDocument();
  });

  it("does not show retry when showRetryOnFailure is false", () => {
    useOnboardingSetupStatus.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        status: "failed",
        phase: "setup",
        progress: undefined,
        initialSetupStatus: "failed",
        initialDataFetchStatus: "not_started",
        requiresUserAction: false,
        errorCode: null,
      },
    });
    useRetryOnboardingSetup.mockReturnValue({
      isPending: false,
      mutate: vi.fn(),
    });

    render(<SetupStatusCard accountId="99" showRetryOnFailure={false} />);

    expect(screen.queryByRole("button", { name: /retry setup/i })).not.toBeInTheDocument();
  });

  it("invokes retry mutation when Retry setup is clicked", () => {
    const mutate = vi.fn();
    useOnboardingSetupStatus.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        status: "failed",
        phase: "setup",
        progress: undefined,
        initialSetupStatus: "failed",
        initialDataFetchStatus: "not_started",
        requiresUserAction: false,
        errorCode: null,
      },
    });
    useRetryOnboardingSetup.mockReturnValue({
      isPending: false,
      mutate,
    });

    render(<SetupStatusCard accountId="42" showRetryOnFailure />);

    fireEvent.click(screen.getByRole("button", { name: /retry setup/i }));

    expect(mutate).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        onError: expect.any(Function),
      }),
    );
  });

  it("shows background-sync copy when phase is wizard, isUpdating is true, and status is non-standard", () => {
    useOnboardingSetupStatus.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        status: "pending",
        phase: "wizard",
        progress: { syncing: true },
        isUpdating: true,
        initialSetupStatus: "running",
        initialDataFetchStatus: "queued",
        requiresUserAction: false,
        errorCode: null,
      },
    });
    useRetryOnboardingSetup.mockReturnValue({
      isPending: false,
      mutate: vi.fn(),
    });

    render(<SetupStatusCard accountId="1" variant="compact" />);

    expect(
      screen.getByText(/We are preparing your organisation in the background/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Background setup/i)).toBeInTheDocument();
    expect(screen.getByText(/Progress: Syncing/i)).toBeInTheDocument();
  });
});
