"use client";

import { useMemo } from "react";

import { TypographyCaption, TypographyMuted } from "@/components/typography";
import {
  isAccountOrganisationContextGatewayRedirect,
  useAccountOrganisationContext,
} from "@/lib/api/hooks/account/useAccountOrganisationContext";

import { formatBillingDateRangeLine } from "../../_utils/overview/formatBillingDisplay";
import { resolveBillingTrialAccountName } from "../../_utils/trial/billingTrialStart";
import { formatBillingTrialUsedCardDescription } from "../../_utils/trial/billingTrialUsedCard";

import type { BillingUiMode } from "../../_core/billing-state";
import type { BillingTrialSummaryV1 } from "@/types/api/account";

export type BillingTrialUsedCardProps = {
  accountId: string;
  trial: BillingTrialSummaryV1 | null | undefined;
  uiMode: BillingUiMode;
};

export function BillingTrialUsedCard({ accountId, trial, uiMode }: BillingTrialUsedCardProps) {
  const orgQ = useAccountOrganisationContext(accountId);

  const accountName = useMemo(() => {
    if (!orgQ.isSuccess || !orgQ.data || isAccountOrganisationContextGatewayRedirect(orgQ.data)) {
      return "";
    }
    return resolveBillingTrialAccountName(orgQ.data.data);
  }, [orgQ.isSuccess, orgQ.data]);

  const trialDateLine =
    trial?.startDate || trial?.endDate
      ? formatBillingDateRangeLine(trial.startDate, trial.endDate)
      : null;

  return (
    <div className="grid gap-1" role="status" data-testid="billing-trial-used-card">
      <TypographyMuted className="text-sm leading-snug">
        {formatBillingTrialUsedCardDescription(accountName)}
      </TypographyMuted>
      {trialDateLine && (uiMode === "trial_expired" || uiMode === "payment_pending") ? (
        <TypographyCaption>{trialDateLine}</TypographyCaption>
      ) : null}
    </div>
  );
}
