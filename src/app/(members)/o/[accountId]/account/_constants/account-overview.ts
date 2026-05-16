import { ROUTES } from "@/lib/config/routes";

import type { AccountOverviewAccessItem } from "../_types/account-overview";

export const ACCOUNT_OVERVIEW_SECTION_TITLE = "Account overview & organisation access";
export const ACCOUNT_OVERVIEW_SECTION_DESCRIPTION =
  "Organisation context, membership details, and authority for this account.";

export const ACCOUNT_OVERVIEW_SETUP_BANNER = {
  message: "Setup is not complete yet.",
  primaryLink: {
    href: ROUTES.createOrganisationSetup,
    label: "Continue setup",
  },
  secondaryLink: {
    href: ROUTES.createOrganisation,
    label: "return to onboarding",
  },
} as const;

export const ACCOUNT_OVERVIEW_ACCESS_ITEMS: AccountOverviewAccessItem[] = [
  {
    label: "Rights holder",
    description:
      "You are authorised to manage assets in an official capacity for this organisation.",
    settingKey: "isRightsHolder",
  },
  {
    label: "Permission given",
    description: "You have permission to generate and deliver assets for this organisation.",
    settingKey: "isPermissionGiven",
  },
];
