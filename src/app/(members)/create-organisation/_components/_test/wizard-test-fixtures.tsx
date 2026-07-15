import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { accountSummaryFixture } from "@/lib/account/account-summary-fixture";

import type {
  AccountBrandingResponse,
  AccountSettingsResponse,
  AccountSummary,
  OnboardingStateData,
} from "@/types/api/account";
import type { ReactNode } from "react";

export function createWizardQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

export function createWizardTestWrapper(queryClient?: QueryClient) {
  const client = queryClient ?? createWizardQueryClient();
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }
  Wrapper.displayName = "WizardTestWrapper";
  return { Wrapper, queryClient: client };
}

/** Matches `useQuery` `data` for GET /account/me (`AccountMeResponse`). */
export function accountMeQueryData(
  over: {
    accountId?: number | null;
    accounts?: AccountSummary[];
  } = {},
) {
  const accounts = over.accounts ?? [accountSummaryFixture({ id: 1 })];
  let accountId: number | null;
  if ("accountId" in over) {
    accountId = over.accountId ?? null;
  } else if (accounts.length === 0) {
    accountId = null;
  } else if (accounts.length === 1) {
    accountId = accounts[0]?.id ?? null;
  } else {
    throw new Error(
      "accountMeQueryData: pass explicit accountId when fixtures include multiple accounts",
    );
  }
  return {
    data: {
      accountId,
      user: {
        id: 1,
        username: "u",
        email: "user@test.com",
        confirmed: true,
        blocked: false,
        role: null,
      },
      accounts,
    },
  };
}

export function incompleteWizardState(
  over: Partial<OnboardingStateData> = {},
): OnboardingStateData {
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

export function baseSettingsPayload(
  over: Partial<AccountSettingsResponse["data"]> = {},
): AccountSettingsResponse {
  return {
    data: {
      id: 1,
      FirstName: "Jane",
      LastName: "Doe",
      DeliveryAddress: "assets@test.com",
      isActive: true,
      isSetup: false,
      isUpdating: false,
      isRightsHolder: false,
      isPermissionGiven: false,
      group_assets_by: false,
      include_junior_surnames: false,
      Sport: "cricket",
      hasCompletedStartSequence: true,
      hasCustomTemplate: false,
      account_type: 2,
      onboardingOrganisationName: "Metro Association",
      ...over,
    },
  };
}

export function baseBrandingPayload(
  over: Partial<AccountBrandingResponse["data"]> = {},
): AccountBrandingResponse {
  return {
    data: {
      id: 1,
      template: null,
      theme: {
        id: 101,
        name: "Classic",
        theme: {
          primary: "#79001F",
          secondary: "#FDBC2C",
          dark: "#0F172A",
          white: "#FFFFFF",
        },
      },
      template_option: null,
      onboardingLogo: null,
      ...over,
    },
  };
}

export const lookupSports = [
  { id: "cricket", label: "Cricket", sortOrder: 0 },
  { id: "afl", label: "AFL", sortOrder: 1 },
  { id: "hockey", label: "Hockey", sortOrder: 2 },
];

export const lookupOrgTypes = [
  { id: 1, label: "Club", sortOrder: 0 },
  { id: 2, label: "Association", sortOrder: 1 },
];

export const lookupAssociations = [{ id: 10, label: "Metro Association", sortOrder: 0 }];

export const lookupClubs = [{ id: 20, label: "North Club", sortOrder: 0 }];

export const lookupThemes = [
  {
    id: 101,
    label: "Classic",
    sport: null,
    theme: {
      primary: "#79001F",
      secondary: "#FDBC2C",
      dark: "#0F172A",
      white: "#FFFFFF",
    },
  },
  {
    id: 102,
    label: "Bold",
    sport: null,
    theme: {
      primary: "#0F172A",
      secondary: "#38BDF8",
      dark: "#0F172A",
      white: "#FFFFFF",
    },
  },
];
