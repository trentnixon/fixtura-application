"use client";

import { buildAppSidebarUser } from "@/components/navigation/app-sidebar/_utils/build-sidebar-user";
import {
  activeAccountSummaryFromMePayload,
  organisationDetailsFromAccountRow,
} from "@/lib/account/account-me-rows";
import { useAccountMe } from "@/lib/api/hooks/account/useAccountMe";
import { useAccountOrganisationContext } from "@/lib/api/hooks/account/useAccountOrganisationContext";

import type { NavUserProps } from "@/types/api/auth";

export function useAppSidebarUser(
  navMode: "gateway" | "scoped",
  accountId: string | undefined,
): NavUserProps {
  const { data: meData } = useAccountMe();
  const scopedAccountId = navMode === "scoped" && accountId ? accountId : undefined;
  const { data: orgQueryData } = useAccountOrganisationContext(scopedAccountId ?? "");
  const orgContextData = orgQueryData && "data" in orgQueryData ? orgQueryData.data : undefined;

  const bootstrapRow =
    navMode === "scoped"
      ? activeAccountSummaryFromMePayload(meData?.data, scopedAccountId)
      : undefined;
  const bootstrapOrg = bootstrapRow ? organisationDetailsFromAccountRow(bootstrapRow) : undefined;

  return buildAppSidebarUser({
    navMode,
    bootstrapRow,
    bootstrapOrg,
    sessionEmail: meData?.data?.user?.email,
    orgContextData,
  });
}
