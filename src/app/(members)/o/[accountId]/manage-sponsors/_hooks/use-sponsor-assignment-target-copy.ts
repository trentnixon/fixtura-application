import {
  isAccountSettingsGatewayRedirect,
  useAccountSettings,
} from "@/lib/api/hooks/account/useAccountSettings";

import {
  FALLBACK_SPONSOR_ASSIGNMENT_TARGET_COPY,
  getSponsorAssignmentTargetCopy,
} from "../_utils/sponsor-assignment-target-copy";

export function useSponsorAssignmentTargetCopy(accountId: string) {
  const settingsQuery = useAccountSettings(accountId);

  if (
    !settingsQuery.isSuccess ||
    !settingsQuery.data ||
    isAccountSettingsGatewayRedirect(settingsQuery.data)
  ) {
    return FALLBACK_SPONSOR_ASSIGNMENT_TARGET_COPY;
  }

  return getSponsorAssignmentTargetCopy(settingsQuery.data.data);
}
