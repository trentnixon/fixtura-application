import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import {
  SELECT_ORG_GATEWAY_REASON,
  selectOrganisationUrlWithReason,
} from "@/lib/config/gateway-reasons";
import { accountEntryFromOnboardingState } from "@/lib/onboarding/resolve-account-entry";

import { OrgAccessBoundary } from "./org-access-boundary";

import type * as UseAccountOrganisationContextModule from "@/lib/api/hooks/account/useAccountOrganisationContext";
import type { OnboardingStateData } from "@/types/api/account";
import type { ReactElement } from "react";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

const useAccountOrganisationContextMock = vi.hoisted(() => vi.fn());
const useOnboardingOnboardingStateMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/hooks/account/useAccountOrganisationContext", async (importOriginal) => {
  const actual = (await importOriginal()) as typeof UseAccountOrganisationContextModule;
  return {
    ...actual,
    useAccountOrganisationContext: useAccountOrganisationContextMock,
  };
});

vi.mock("@/lib/api/hooks/account/useOnboardingOnboardingState", () => ({
  useOnboardingOnboardingState: useOnboardingOnboardingStateMock,
}));

function orgContextOk() {
  return {
    isSuccess: true,
    isPending: false,
    isError: false,
    data: {
      data: {
        id: 1,
        account_type: null,
        accountOrganisationDetails: null,
      },
    },
  };
}

function baseOnboarding(over: Partial<OnboardingStateData> = {}): OnboardingStateData {
  return {
    accountId: 1,
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

function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("OrgAccessBoundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAccountOrganisationContextMock.mockReturnValue(orgContextOk());
  });

  it("redirects to lifecycle entry when onboarding is not dashboard-ready (wizard)", async () => {
    const accountId = "42";
    const onboarding = baseOnboarding();
    useOnboardingOnboardingStateMock.mockReturnValue({
      isSuccess: true,
      isPending: false,
      isError: false,
      data: onboarding,
    });

    renderWithClient(
      <OrgAccessBoundary accountId={accountId}>
        <div>Scoped content</div>
      </OrgAccessBoundary>,
    );

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith(accountEntryFromOnboardingState(onboarding, accountId));
    });

    expect(screen.queryByText("Scoped content")).not.toBeInTheDocument();
  });

  it("renders children when wizard is complete (dashboard-eligible even if setup still running)", async () => {
    const accountId = "42";
    const onboarding = baseOnboarding({
      isSetup: false,
      hasCompletedOnboardingWizard: true,
      onboardingWizardStatus: "completed",
    });
    useOnboardingOnboardingStateMock.mockReturnValue({
      isSuccess: true,
      isPending: false,
      isError: false,
      data: onboarding,
    });

    renderWithClient(
      <OrgAccessBoundary accountId={accountId}>
        <div>Scoped content</div>
      </OrgAccessBoundary>,
    );

    await waitFor(() => {
      expect(screen.getByText("Scoped content")).toBeInTheDocument();
    });

    expect(replace).not.toHaveBeenCalled();
  });

  it("redirects to select-organisation when account id segment is invalid", async () => {
    renderWithClient(
      <OrgAccessBoundary accountId="not-a-valid-id">
        <div>Scoped content</div>
      </OrgAccessBoundary>,
    );

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith(
        selectOrganisationUrlWithReason(SELECT_ORG_GATEWAY_REASON.invalidOrg),
      );
    });
  });
});
