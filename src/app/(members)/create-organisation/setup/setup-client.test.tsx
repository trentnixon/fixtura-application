import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { accountScopedRoutes } from "@/lib/config/account-routes";

import { CreateOrganisationSetupClient } from "./setup-client";

import type { OnboardingStateData } from "@/types/api/account";

const replace = vi.fn();
const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push }),
  useSearchParams: () => ({
    get: (key: string) => (key === "accountId" ? "1" : null),
  }),
}));

const useOnboardingOnboardingState = vi.hoisted(() => vi.fn());
const useOnboardingSetupStatus = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/hooks/account/useOnboardingOnboardingState", () => ({
  useOnboardingOnboardingState: useOnboardingOnboardingState,
}));

vi.mock("@/lib/api/hooks/account/useOnboardingSetupStatus", () => ({
  useOnboardingSetupStatus: useOnboardingSetupStatus,
}));

vi.mock("../_components/setup-status-card", () => ({
  SetupStatusCard: () => <div data-testid="setup-status-mock" />,
}));

function preparationOnboardingState(): OnboardingStateData {
  return {
    accountId: 1,
    onboardingWizardStatus: "completed",
    onboardingCurrentStep: 4,
    onboardingLastCompletedStep: 4,
    onboardingStartedAt: null,
    onboardingLastActivityAt: null,
    hasCompletedOnboardingWizard: true,
    onboardingWizardCompletedAt: null,
    initialSetupStatus: "running",
    initialSetupStartedAt: null,
    initialSetupCompletedAt: null,
    initialSetupFailedAt: null,
    initialSetupFailureReason: null,
    initialDataFetchStatus: "queued",
    initialDataFetchStartedAt: null,
    initialDataFetchCompletedAt: null,
    initialDataFetchFailedAt: null,
    initialDataFetchFailureReason: null,
    isSetup: false,
    isUpdating: false,
    isActive: true,
  };
}

describe("CreateOrganisationSetupClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useOnboardingOnboardingState.mockReturnValue({
      isPending: false,
      isError: false,
      data: preparationOnboardingState(),
    });
    useOnboardingSetupStatus.mockReturnValue({
      isPending: false,
      data: { status: "in_progress" },
    });
  });

  it("redirects to dashboard when wizard is complete (even if setup still running)", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CreateOrganisationSetupClient />
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Opening your organisation/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith(accountScopedRoutes.dashboard("1"));
    });
    expect(
      screen.queryByRole("button", { name: /delete this unfinished account/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/delete this unfinished account/i)).not.toBeInTheDocument();
  });
});
