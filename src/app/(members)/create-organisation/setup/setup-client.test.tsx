import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { queryKeys } from "@/lib/api/query/query-keys";
import { accountScopedRoutes } from "@/lib/config/account-routes";
import { ROUTES } from "@/lib/config/routes";

import { CreateOrganisationSetupClient } from "./setup-client";

import type { OnboardingStateData } from "@/types/api/account";

const replace = vi.fn();
const push = vi.fn();
const searchParamsGet = vi.hoisted(() => vi.fn<(key: string) => string | null>());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push }),
  useSearchParams: () => ({
    get: searchParamsGet,
  }),
}));

const useOnboardingOnboardingState = vi.hoisted(() => vi.fn());
const useOnboardingSetupStatus = vi.hoisted(() => vi.fn());
const setupStatusCardSpy = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/hooks/account/useOnboardingOnboardingState", () => ({
  useOnboardingOnboardingState: useOnboardingOnboardingState,
}));

vi.mock("@/lib/api/hooks/account/useOnboardingSetupStatus", () => ({
  useOnboardingSetupStatus: useOnboardingSetupStatus,
}));

vi.mock("../_components/setup-status-card", () => ({
  SetupStatusCard: (props: { accountId: string; showRetryOnFailure?: boolean }) => {
    setupStatusCardSpy(props);
    return <div data-testid="setup-status-mock" />;
  },
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

function wizardIncompleteState(): OnboardingStateData {
  return {
    accountId: 1,
    onboardingWizardStatus: "in_progress",
    onboardingCurrentStep: 2,
    onboardingLastCompletedStep: 1,
    onboardingStartedAt: null,
    onboardingLastActivityAt: null,
    hasCompletedOnboardingWizard: false,
    onboardingWizardCompletedAt: null,
    initialSetupStatus: "not_started",
    initialSetupStartedAt: null,
    initialSetupCompletedAt: null,
    initialSetupFailedAt: null,
    initialSetupFailureReason: null,
    initialDataFetchStatus: "not_started",
    initialDataFetchStartedAt: null,
    initialDataFetchCompletedAt: null,
    initialDataFetchFailedAt: null,
    initialDataFetchFailureReason: null,
    isSetup: false,
    isUpdating: false,
    isActive: true,
  };
}

function renderClient() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <CreateOrganisationSetupClient />
    </QueryClientProvider>,
  );
}

describe("CreateOrganisationSetupClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchParamsGet.mockImplementation((key: string) => (key === "accountId" ? "1" : null));
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

  it("redirects to dashboard when wizard is complete and setup is not failed", async () => {
    renderClient();

    expect(screen.getByText(/Opening your organisation/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith(accountScopedRoutes.dashboard("1"));
    });
    expect(
      screen.queryByRole("button", { name: /delete this unfinished account/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/delete this unfinished account/i)).not.toBeInTheDocument();
  });

  it("shows invalid account message and navigates back to organisation selection", () => {
    searchParamsGet.mockImplementation(() => null);

    renderClient();

    expect(
      screen.getByText(
        /Missing or invalid account. Return to organisation selection and try again./i,
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /back to organisation selection/i }));

    expect(push).toHaveBeenCalledWith(ROUTES.selectOrganisation);
  });

  it("shows onboarding error with retry and back actions", () => {
    const refetch = vi.fn();
    useOnboardingOnboardingState.mockReturnValue({
      isPending: false,
      isError: true,
      refetch,
    });

    renderClient();

    expect(screen.getByText(/We could not load onboarding state. Try again./i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^retry$/i }));
    expect(refetch).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /back to organisation selection/i }));
    expect(push).toHaveBeenCalledWith(ROUTES.selectOrganisation);
  });

  it("redirects to create-organisation wizard when onboarding is incomplete and setup is not failed", async () => {
    useOnboardingOnboardingState.mockReturnValue({
      isPending: false,
      isError: false,
      data: wizardIncompleteState(),
    });
    useOnboardingSetupStatus.mockReturnValue({
      isPending: false,
      data: { status: "in_progress" },
    });

    renderClient();

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith(`${ROUTES.createOrganisation}?accountId=1`);
    });
  });

  it("invalidates onboarding state when setup status becomes ready while wizard is incomplete", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    useOnboardingOnboardingState.mockReturnValue({
      isPending: false,
      isError: false,
      data: wizardIncompleteState(),
    });
    useOnboardingSetupStatus.mockReturnValue({
      isPending: false,
      data: { status: "ready" },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CreateOrganisationSetupClient />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.account.onboardingState("1"),
      });
    });
  });

  it("stays on recovery page with retry when wizard is incomplete and setup failed", () => {
    useOnboardingOnboardingState.mockReturnValue({
      isPending: false,
      isError: false,
      data: wizardIncompleteState(),
    });
    useOnboardingSetupStatus.mockReturnValue({
      isPending: false,
      data: { status: "failed" },
    });

    renderClient();

    expect(screen.getByTestId("setup-status-mock")).toBeInTheDocument();
    expect(setupStatusCardSpy).toHaveBeenCalledWith(
      expect.objectContaining({ accountId: "1", showRetryOnFailure: true }),
    );
    expect(replace).not.toHaveBeenCalled();
  });

  it("stays on recovery page with retry when wizard is complete and setup failed", () => {
    useOnboardingSetupStatus.mockReturnValue({
      isPending: false,
      data: { status: "failed" },
    });

    renderClient();

    expect(screen.getByTestId("setup-status-mock")).toBeInTheDocument();
    expect(screen.getByText(/Setup status/i)).toBeInTheDocument();
    expect(setupStatusCardSpy).toHaveBeenCalledWith(
      expect.objectContaining({ accountId: "1", showRetryOnFailure: true }),
    );
    expect(replace).not.toHaveBeenCalled();
    expect(screen.queryByText(/Opening your organisation/i)).not.toBeInTheDocument();
  });

  it("shows checking loader and does not redirect while setup status is pending", () => {
    useOnboardingSetupStatus.mockReturnValue({
      isPending: true,
      data: undefined,
    });

    renderClient();

    expect(screen.getByText(/Checking setup status/i)).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
    expect(screen.queryByTestId("setup-status-mock")).not.toBeInTheDocument();
  });
});
