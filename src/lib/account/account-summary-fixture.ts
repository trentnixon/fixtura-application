import type {
  AccountOrganisationSummary,
  AccountSummary,
  AccountThemeSummary,
} from "@/types/api/account";

const DEFAULT_CREATED_AT = "2026-01-01T00:00:00.000Z";

/** Minimal required fields for GET /account/me `accounts[]` test fixtures. */
export function accountSummaryFixture(
  over: Partial<AccountSummary> & { id: number },
): AccountSummary {
  return {
    FirstName: null,
    LastName: null,
    DeliveryAddress: null,
    isActive: true,
    isSetup: false,
    isRightsHolder: null,
    isPermissionGiven: null,
    group_assets_by: false,
    include_junior_surnames: false,
    isUpdating: false,
    Sport: null,
    onboardingOrganisationName: null,
    onboardingWizardCompletedAt: null,
    createdAt: DEFAULT_CREATED_AT,
    theme: null,
    account_type: null,
    accountOrganisationDetails: null,
    templateOptionId: null,
    ...over,
  };
}

export function accountOrganisationSummaryFixture(
  over: Partial<AccountOrganisationSummary> & { id: number },
): AccountOrganisationSummary {
  return {
    Name: null,
    href: null,
    ParentLogo: null,
    Sport: null,
    ...over,
  };
}

export function accountThemeSummaryFixture(
  over: Partial<AccountThemeSummary> & { id: number },
): AccountThemeSummary {
  return {
    name: null,
    isPublic: false,
    theme: null,
    ...over,
  };
}
