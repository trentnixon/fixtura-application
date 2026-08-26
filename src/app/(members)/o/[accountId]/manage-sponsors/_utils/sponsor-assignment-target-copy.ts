import { CLUB_ACCOUNT_TYPE_ID } from "@/lib/config/onboarding";

import type { AccountSettingsData } from "@/types/api/account";

export type SponsorAssignmentTargetCopy = {
  singular: string;
  plural: string;
  buttonLabel: string;
  title: string;
  description: string;
};

export const FALLBACK_SPONSOR_ASSIGNMENT_TARGET_COPY: SponsorAssignmentTargetCopy = {
  singular: "target",
  plural: "targets",
  buttonLabel: "Assign sponsors",
  title: "Assign sponsors",
  description: "Pick sponsors for clubs, teams, or grades.",
};

export function getSponsorAssignmentTargetCopy(
  settings: Pick<AccountSettingsData, "account_type" | "group_assets_by"> | null | undefined,
): SponsorAssignmentTargetCopy {
  if (!settings) return FALLBACK_SPONSOR_ASSIGNMENT_TARGET_COPY;

  if (settings.account_type === CLUB_ACCOUNT_TYPE_ID) {
    return {
      singular: "team",
      plural: "teams",
      buttonLabel: "Assign to teams",
      title: "Assign sponsors to teams",
      description: "Pick which sponsor shows for each team.",
    };
  }

  if (settings.group_assets_by) {
    return {
      singular: "competition",
      plural: "competitions",
      buttonLabel: "Assign to competitions",
      title: "Assign sponsors to competitions",
      description: "Pick which sponsor shows for each competition.",
    };
  }

  return {
    singular: "grade",
    plural: "grades",
    buttonLabel: "Assign to grades",
    title: "Assign sponsors to grades",
    description: "Pick which sponsor shows for each grade.",
  };
}
