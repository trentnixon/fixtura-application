import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { accountScopedRoutes } from "@/lib/config/account-routes";
import { ROUTES } from "@/lib/config/routes";

import { SelectOrganisationContent } from "./select-organisation-content";

import type { AccountMeResponse, OnboardingStateData } from "@/types/api/account";
import type { ReactElement } from "react";

const navMocks = vi.hoisted(() => ({
  pathname: "/select-organisation",
  push: vi.fn(),
  replace: vi.fn(),
  searchParams: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: navMocks.push, replace: navMocks.replace }),
  usePathname: () => navMocks.pathname,
  useSearchParams: () => navMocks.searchParams,
}));

const useAccountMeMock = vi.hoisted(() => vi.fn());
const getOnboardingOnboardingStateMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/hooks/account/useAccountMe", () => ({
  useAccountMe: useAccountMeMock,
}));

vi.mock("@/lib/api/services/account.api", () => ({
  accountApi: {
    getOnboardingOnboardingState: getOnboardingOnboardingStateMock,
  },
}));

function baseOnboardingState(over: Partial<OnboardingStateData> = {}): OnboardingStateData {
  return {
    accountId: 42,
    onboardingWizardStatus: "in_progress",
    onboardingCurrentStep: 1,
    onboardingLastCompletedStep: 0,
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
    ...over,
  };
}

function accountMeResponse(): AccountMeResponse {
  return {
    data: {
      accountId: 42,
      user: null,
      accounts: [
        {
          id: 42,
          isActive: true,
          isSetup: false,
          accountOrganisationDetails: {
            id: 7,
            Name: "North Districts",
            href: "",
            ParentLogo: "",
            Sport: "Cricket",
          },
        },
      ],
    },
  };
}

function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("SelectOrganisationContent lifecycle routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navMocks.pathname = "/select-organisation";
    navMocks.searchParams = new URLSearchParams();
    useAccountMeMock.mockReturnValue({
      data: accountMeResponse(),
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });
  });

  it("opens the create-organisation resume route when the selected account has an unfinished wizard", async () => {
    getOnboardingOnboardingStateMock.mockResolvedValue({
      data: baseOnboardingState({ onboardingWizardStatus: "in_progress" }),
    });

    renderWithClient(<SelectOrganisationContent />);

    fireEvent.click(await screen.findByRole("button", { name: /North Districts/i }));

    await waitFor(() => {
      expect(navMocks.push).toHaveBeenCalledWith(`${ROUTES.createOrganisation}?accountId=42`);
    });
  });

  it("opens the scoped dashboard when the selected account has completed the wizard", async () => {
    getOnboardingOnboardingStateMock.mockResolvedValue({
      data: baseOnboardingState({
        onboardingWizardStatus: "completed",
        hasCompletedOnboardingWizard: true,
        initialSetupStatus: "running",
      }),
    });

    renderWithClient(<SelectOrganisationContent />);

    fireEvent.click(await screen.findByRole("button", { name: /North Districts/i }));

    await waitFor(() => {
      expect(navMocks.push).toHaveBeenCalledWith(accountScopedRoutes.dashboard("42"));
    });
  });

  it("shows an inline error when the selected account onboarding state cannot be loaded", async () => {
    getOnboardingOnboardingStateMock.mockRejectedValue(new Error("Onboarding unavailable"));

    renderWithClient(<SelectOrganisationContent />);

    fireEvent.click(await screen.findByRole("button", { name: /North Districts/i }));

    expect(await screen.findByText("Onboarding unavailable")).toBeInTheDocument();
    expect(navMocks.push).not.toHaveBeenCalled();
  });
});
