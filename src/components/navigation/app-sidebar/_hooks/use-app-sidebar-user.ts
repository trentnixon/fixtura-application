"use client";

import { buildAppSidebarUser } from "@/components/navigation/app-sidebar/_utils/build-sidebar-user";
import {
  activeAccountSummaryFromMePayload,
  organisationDetailsFromAccountRow,
} from "@/lib/account/account-me-rows";
import { useAccountMe } from "@/lib/api/hooks/account/useAccountMe";
import {
  isAccountOrganisationContextGatewayRedirect,
  useAccountOrganisationContext,
} from "@/lib/api/hooks/account/useAccountOrganisationContext";

import type { NavUserProps } from "@/types/api/auth";

export function useAppSidebarUser(
  navMode: "gateway" | "scoped",
  accountId: string | undefined,
): NavUserProps {
  const { data: meData } = useAccountMe();
  const { data: orgQueryData } = useAccountOrganisationContext(
    navMode === "scoped" && accountId ? accountId : "",
  );
  const orgData =
    orgQueryData && !isAccountOrganisationContextGatewayRedirect(orgQueryData)
      ? orgQueryData
      : undefined;

  const bootstrapRow = activeAccountSummaryFromMePayload(meData?.data, accountId);
  const bootstrapOrg = bootstrapRow ? organisationDetailsFromAccountRow(bootstrapRow) : undefined;

  return buildAppSidebarUser({
    navMode,
    bootstrapRow,
    bootstrapOrg,
    sessionEmail: meData?.data?.user?.email,
    orgContextData: orgData?.data,
  });
}
