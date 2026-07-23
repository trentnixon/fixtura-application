import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/client/api-error";

import { SetupStatusCard } from "./setup-status-card";

import type { OnboardingSetupStatusData } from "@/types/api/account";

const useOnboardingSetupStatus = vi.hoisted(() => vi.fn());
const useRetryOnboardingSetup = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/hooks/account/useOnboardingSetupStatus", () => ({
  useOnboardingSetupStatus: useOnboardingSetupStatus,
}));

vi.mock("@/lib/api/hooks/account/useRetryOnboardingSetup", () => ({
  useRetryOnboardingSetup: useRetryOnboardingSetup,
}));

function baseSetupData(over: Partial<OnboardingSetupStatusData> = {}): OnboardingSetupStatusData {
  const data: OnboardingSetupStatusData = {
    status: over.status ?? "in_progress",
    phase: over.phase !== undefined ? over.phase : "setup",
    initialSetupStatus: over.initialSetupStatus !== undefined ? over.initialSetupStatus : "running",
    initialDataFetchStatus:
      over.initialDataFetchStatus !== undefined ? over.initialDataFetchStatus : "queued",
    requiresUserAction: over.requiresUserAction !== undefined ? over.requiresUserAction : false,
    errorCode: over.errorCode !== undefined ? over.errorCode : null,
  };

  if (over.progress !== undefined) data.progress = over.progress;
  if (over.messageKey !== undefined) data.messageKey = over.messageKey;
  if (over.isSetup !== undefined) data.isSetup = over.isSetup;
  if (over.isUpdating !== undefined) data.isUpdating = over.isUpdating;

  return data;
}

function mockQuerySuccess(data: OnboardingSetupStatusData) {
  useOnboardingSetupStatus.mockReturnValue({
    isPending: false,
    isError: false,
    data,
  });
}

function mockRetryMutation(mutate = vi.fn()) {
  useRetryOnboardingSetup.mockReturnValue({
    isPending: false,
    mutate,
  });
  return mutate;
}

describe("SetupStatusCard", () => {
  it("shows Retry setup when status is failed, terminal, and showRetryOnFailure is true", () => {
    mockQuerySuccess(baseSetupData({ status: "failed", errorCode: "E_TEST" }));
    mockRetryMutation();

    render(<SetupStatusCard accountId="99" showRetryOnFailure />);

    expect(screen.getByRole("button", { name: /retry setup/i })).toBeInTheDocument();
  });

  it("does not show retry when showRetryOnFailure is false", () => {
    mockQuerySuccess(baseSetupData({ status: "failed" }));
    mockRetryMutation();

    render(<SetupStatusCard accountId="99" showRetryOnFailure={false} />);

    expect(screen.queryByRole("button", { name: /retry setup/i })).not.toBeInTheDocument();
  });

  it("invokes retry mutation when Retry setup is clicked", () => {
    const mutate = mockRetryMutation();
    mockQuerySuccess(baseSetupData({ status: "failed" }));

    render(<SetupStatusCard accountId="42" showRetryOnFailure />);

    fireEvent.click(screen.getByRole("button", { name: /retry setup/i }));

    expect(mutate).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        onError: expect.any(Function),
      }),
    );
  });

  it("shows 409 conflict copy when retry mutation fails with conflict", () => {
    const mutate = vi.fn((_body, options: { onError?: (e: unknown) => void }) => {
      options.onError?.(
        new ApiError({
          status: 409,
          message: "Conflict",
        }),
      );
    });
    mockRetryMutation(mutate);
    mockQuerySuccess(baseSetupData({ status: "failed" }));

    render(<SetupStatusCard accountId="42" showRetryOnFailure />);

    fireEvent.click(screen.getByRole("button", { name: /retry setup/i }));

    expect(
      screen.getByText(
        /Retry is not available for this account right now. Refresh the page or contact support./i,
      ),
    ).toBeInTheDocument();
  });

  it("shows ready completion copy", () => {
    mockQuerySuccess(baseSetupData({ status: "ready" }));
    mockRetryMutation();

    render(<SetupStatusCard accountId="1" />);

    expect(screen.getByText(/Organisation setup is complete./i)).toBeInTheDocument();
  });

  it("shows failed copy without retry button when showRetryOnFailure is false", () => {
    mockQuerySuccess(baseSetupData({ status: "failed" }));
    mockRetryMutation();

    render(<SetupStatusCard accountId="1" showRetryOnFailure={false} />);

    expect(
      screen.getByText(
        /Setup could not finish. You can retry, or contact support if this continues./i,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /retry setup/i })).not.toBeInTheDocument();
  });

  it("shows blocked attention copy and destructive alert", () => {
    mockQuerySuccess(baseSetupData({ status: "blocked" }));
    mockRetryMutation();

    render(<SetupStatusCard accountId="1" />);

    expect(
      screen.getByText(/Setup needs attention before you can continue using all features./i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Setup cannot continue automatically. Contact support if you need help./i),
    ).toBeInTheDocument();
  });

  it("shows abandoned copy", () => {
    mockQuerySuccess(baseSetupData({ status: "abandoned" }));
    mockRetryMutation();

    render(<SetupStatusCard accountId="1" />);

    expect(screen.getByText(/Setup was stopped./i)).toBeInTheDocument();
  });

  it("shows background prep copy for in_progress", () => {
    mockQuerySuccess(baseSetupData({ status: "in_progress" }));
    mockRetryMutation();

    render(<SetupStatusCard accountId="1" />);

    expect(
      screen.getByText(/We are preparing your organisation in the background./i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Updating every few seconds/i)).toBeInTheDocument();
  });

  it("shows background prep copy for retryable", () => {
    mockQuerySuccess(baseSetupData({ status: "retryable" }));
    mockRetryMutation();

    render(<SetupStatusCard accountId="1" />);

    expect(
      screen.getByText(/We are preparing your organisation in the background./i),
    ).toBeInTheDocument();
  });

  it("shows fallback copy for unknown status", () => {
    mockQuerySuccess(baseSetupData({ status: "custom_unknown" }));
    mockRetryMutation();

    render(<SetupStatusCard accountId="1" />);

    expect(screen.getByText(/Status: custom_unknown./i)).toBeInTheDocument();
  });

  it("shows 404 not-available-yet copy on query error", () => {
    useOnboardingSetupStatus.mockReturnValue({
      isPending: false,
      isError: true,
      error: new ApiError({ status: 404, message: "Not found" }),
    });
    mockRetryMutation();

    render(<SetupStatusCard accountId="1" />);

    expect(
      screen.getByText(
        /Setup status is not available yet. It will appear after your organisation is connected./i,
      ),
    ).toBeInTheDocument();
  });

  it("shows generic load failure copy on non-404/408 query error", () => {
    useOnboardingSetupStatus.mockReturnValue({
      isPending: false,
      isError: true,
      error: new ApiError({ status: 500, message: "Server error" }),
    });
    mockRetryMutation();

    render(<SetupStatusCard accountId="1" />);

    expect(
      screen.getByText(/We could not load setup status. Try again later./i),
    ).toBeInTheDocument();
  });

  it("shows a retrying message for transient timeout errors", () => {
    useOnboardingSetupStatus.mockReturnValue({
      isPending: false,
      isError: true,
      error: new ApiError({
        status: 408,
        message: "Request timed out",
      }),
    });
    mockRetryMutation();

    render(<SetupStatusCard accountId="1" />);

    expect(
      screen.getByText(
        /Setup is taking longer than expected. We will keep retrying automatically./i,
      ),
    ).toBeInTheDocument();
  });

  it("shows requiresUserAction info alert", () => {
    mockQuerySuccess(baseSetupData({ status: "in_progress", requiresUserAction: true }));
    mockRetryMutation();

    render(<SetupStatusCard accountId="1" />);

    expect(
      screen.getByText(
        /Action is required to continue setup. Check your email or contact support if this persists./i,
      ),
    ).toBeInTheDocument();
  });

  it("shows errorCode reference", () => {
    mockQuerySuccess(baseSetupData({ status: "failed", errorCode: "E_PIPELINE" }));
    mockRetryMutation();

    render(<SetupStatusCard accountId="1" />);

    expect(screen.getByText(/Reference:/i)).toBeInTheDocument();
    expect(screen.getByText("E_PIPELINE")).toBeInTheDocument();
  });

  it("shows pipeline detail line", () => {
    mockQuerySuccess(
      baseSetupData({
        status: "in_progress",
        initialSetupStatus: "running",
        initialDataFetchStatus: "queued",
      }),
    );
    mockRetryMutation();

    render(<SetupStatusCard accountId="1" />);

    expect(screen.getByText(/Initial setup: running/i)).toBeInTheDocument();
    expect(screen.getByText(/Data fetch: queued/i)).toBeInTheDocument();
  });

  it("shows background-sync copy when phase is wizard, isUpdating is true, and status is non-standard", () => {
    mockQuerySuccess(
      baseSetupData({
        status: "pending",
        phase: "wizard",
        progress: { syncing: true },
        isUpdating: true,
        initialSetupStatus: "running",
        initialDataFetchStatus: "queued",
      }),
    );
    mockRetryMutation();

    render(<SetupStatusCard accountId="1" variant="compact" />);

    expect(
      screen.getByText(/We are preparing your organisation in the background/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Background setup/i)).toBeInTheDocument();
    expect(screen.getByText(/Progress: Syncing/i)).toBeInTheDocument();
  });
});
