"use client";

import { useMemo } from "react";

import { TypographyH4, TypographyMuted } from "@/components/typography";
import { Surface } from "@/components/ui/container";
import {
  isAccountOrganisationContextGatewayRedirect,
  useAccountOrganisationContext,
} from "@/lib/api/hooks/account/useAccountOrganisationContext";
import { cn } from "@/lib/utils";

import {
  BILLING_TRIAL_USED_CARD_COPY,
  BILLING_TRIAL_USED_CARD_SURFACE_CLASS_NAME,
} from "../../_constants/trial/billingTrialUsedCard";
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
    <Surface
      className={cn(BILLING_TRIAL_USED_CARD_SURFACE_CLASS_NAME, "space-y-1 p-4 shadow-md")}
      role="status"
    >
      <TypographyH4 className="text-destructive text-sm font-semibold">
        {BILLING_TRIAL_USED_CARD_COPY.title}
      </TypographyH4>
      <TypographyMuted className="text-sm leading-snug">
        {formatBillingTrialUsedCardDescription(accountName)}
      </TypographyMuted>
      {trialDateLine && (uiMode === "trial_expired" || uiMode === "payment_pending") ? (
        <TypographyMuted className="text-sm">{trialDateLine}</TypographyMuted>
      ) : null}
    </Surface>
  );
}
