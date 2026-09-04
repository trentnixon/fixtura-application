import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";

import { accountApi } from "@/lib/api/services/account.api";
import { CLUB_ACCOUNT_TYPE_ID } from "@/lib/config/onboarding";

import { isOrganisationGatewayRedirect, useAccountOrganisation } from "./useAccountOrganisation";
import { withScopedAccountIdBody } from "./with-scoped-account-id-body";

type SupportedOrgType = "Association" | "Club";

type ResolvedOrg = {
  orgId: number | null;
  orgType: SupportedOrgType | null;
  orgName: string | null;
};

type TriggerOrgSingleScrapeResult = {
  resolved: ResolvedOrg;
  canTrigger: boolean;
  isPending: boolean;
  errorReason: string | null;
  triggerSync: () => Promise<void>;
};

export function useTriggerOrgSingleScrape(accountId: string): TriggerOrgSingleScrapeResult {
  const orgQuery = useAccountOrganisation(accountId);
  const mutation = useMutation({
    mutationFn: async (vars: { orgType: SupportedOrgType; orgId: number }) => {
      if (vars.orgType === "Association") {
        return accountApi.triggerAssociationSingleScrape(
          withScopedAccountIdBody(accountId, { associationId: vars.orgId }),
        );
      }
      return accountApi.triggerClubSingleScrape(
        withScopedAccountIdBody(accountId, { clubId: vars.orgId }),
      );
    },
  });

  const resolved = useMemo<ResolvedOrg>(() => {
    if (isOrganisationGatewayRedirect(orgQuery.data) || !orgQuery.data?.data) {
      return { orgId: null, orgType: null, orgName: null };
    }

    const data = orgQuery.data.data;
    const orgDetails = data.accountOrganisationDetails;
    const rawOrgType = data.account_type;
    const inferredOrgType =
      rawOrgType === CLUB_ACCOUNT_TYPE_ID
        ? "Club"
        : typeof rawOrgType === "number"
          ? "Association"
          : null;

    return {
      orgId: typeof orgDetails?.id === "number" ? orgDetails.id : null,
      orgType: inferredOrgType,
      orgName: typeof orgDetails?.Name === "string" ? orgDetails.Name : null,
    };
  }, [orgQuery.data]);

  const errorReason = useMemo(() => {
    if (orgQuery.isPending) return "Loading organisation details…";
    if (orgQuery.isError) return "Could not load organisation details for sync.";
    if (!resolved.orgId) return "Organisation ID is missing for this account.";
    if (!resolved.orgType) return "Organisation type is unsupported for sync.";
    return null;
  }, [orgQuery.isError, orgQuery.isPending, resolved.orgId, resolved.orgType]);

  const canTrigger = errorReason == null;

  const triggerSync = async () => {
    if (!canTrigger || !resolved.orgId || !resolved.orgType) {
      throw new Error(errorReason ?? "Cannot trigger sync for this account.");
    }
    await mutation.mutateAsync({ orgType: resolved.orgType, orgId: resolved.orgId });
  };

  return {
    resolved,
    canTrigger,
    isPending: mutation.isPending,
    errorReason,
    triggerSync,
  };
}
