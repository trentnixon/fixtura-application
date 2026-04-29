import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";

import { accountApi } from "@/lib/api/services/account.api";
import { CLUB_ACCOUNT_TYPE_ID } from "@/lib/config/onboarding";

import { useAccountMe } from "./useAccountMe";

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
  const me = useAccountMe();
  const mutation = useMutation({
    mutationFn: async (vars: { orgType: SupportedOrgType; orgId: number }) => {
      if (vars.orgType === "Association") {
        return accountApi.triggerAssociationSingleScrape({ associationId: vars.orgId });
      }
      return accountApi.triggerClubSingleScrape({ clubId: vars.orgId });
    },
  });

  const resolved = useMemo<ResolvedOrg>(() => {
    const numericAccountId = Number(accountId);
    if (!Number.isFinite(numericAccountId)) {
      return { orgId: null, orgType: null, orgName: null };
    }

    const account = me.data?.data.accounts?.find((row) => row.id === numericAccountId);
    const orgDetails =
      account?.accountOrganisationDetails ?? account?.contentHub?.accountOrganisationDetails;
    const rawOrgType = account?.account_type;
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
  }, [accountId, me.data?.data.accounts]);

  const errorReason = useMemo(() => {
    if (!resolved.orgId) return "Organisation ID is missing for this account.";
    if (!resolved.orgType) return "Organisation type is unsupported for sync.";
    return null;
  }, [resolved.orgId, resolved.orgType]);

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
